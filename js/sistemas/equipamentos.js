// =============================================================
// sistemas/equipamentos.js — DROPS, VESTIR, MELHORAR E DESMANCHAR
//
// Como um item é criado quando cai numa fase:
//  1. Sorteia o TIER (mesmas chances em todo mapa; chefes melhoram um pouco).
//  2. Sorteia o ESPAÇO entre os 10 (todos caem em qualquer mapa).
//  3. Sorteia o GRAU (★1 a ★5): quase sempre ★1, às vezes ★2 a ★4.
//  4. Os atributos são FIXOS por tipo de item (dados/equipamentos.js):
//     base do mapa onde caiu × força do tier × estrelas. Nada aleatório.
// =============================================================
import { CONFIG } from '../config.js';
import { SLOTS, RARIDADES, ATRIBUTOS_EM_PORCENTO } from '../dados/equipamentos.js';
import { calcularAtributos, poderTotal } from './atributos.js';
import { FASES, chefeDoMapa } from './mundo.js';
import { indiceRaridade, nivelMaximo, custoMelhoria, pedrasAoDesmanchar, grauDe, proximoDaMescla } from './itens.js';

const EQ = CONFIG.equipamentos;

// ---- Sorteios ----
function sortearPorPeso(lista, pesos) {
  const total = pesos.reduce((a, b) => a + b, 0);
  let sorteio = Math.random() * total;
  for (let i = 0; i < lista.length; i++) {
    sorteio -= pesos[i];
    if (sorteio <= 0) return lista[i];
  }
  return lista[lista.length - 1];
}

// Pesos de cada tier num mapa (índice 0 = Mapa 1). Também usado pela tela para mostrar as chances.
// VIP: soma CONFIG.vip.pesosExtras nos pesos (50/25/10/5/1 → 60/35/15/8/2)
export function pesosDosTiers(indiceMapa, chaveTipo, vip = false) {
  const bonusChefe = EQ.bonusRaridadeChefe[chaveTipo] ?? 1;
  return RARIDADES.map((r, i) => (r.peso + (vip && !r.exclusivo ? CONFIG.vip.pesosExtras[i] ?? 0 : 0)) *
    (1 + r.bonusMapa * indiceMapa) * (i >= 2 ? bonusChefe : 1));
}

export function espacosLiberados(indiceMapa) {
  return SLOTS.filter(s => s.mapaMinimo <= indiceMapa + 1);
}

// v0.9.2 (dono): atributos FIXOS. Nada é sorteado: o valor depende só do tipo do item,
// do tier, das estrelas e do MAPA onde caiu. Todos os itens de um mapa usam a mesma
// base (a do chefe do mapa) — assim, dentro do mapa, tier maior sempre ganha.
function valorDoAtributo(atributo, fator, fase, forca) {
  if (ATRIBUTOS_EM_PORCENTO.includes(atributo)) {
    return fator * (1 + EQ.crescimentoPorcentoPorMapa * fase.mapa) * forca;
  }
  return chefeDoMapa(fase.mapa).referencia[atributo] * fator * forca;
}

// Atributos (no nível 0) de um item com este tipo, tier, estrelas e fase
export function atributosFixos(slotId, raridadeId, grau, indiceFase) {
  const slot = SLOTS.find(s => s.id === slotId);
  const raridade = RARIDADES.find(r => r.id === raridadeId);
  const forca = raridade.forca * (1 + EQ.bonusPorGrau * (grau - 1));
  const fase = FASES[Math.min(Math.max(0, indiceFase), FASES.length - 1)];
  const atributos = {};
  for (const [atributo, fator] of Object.entries(slot.principal)) {
    atributos[atributo] = valorDoAtributo(atributo, fator, fase, forca);
  }
  return atributos;
}

// Saves antigos: refaz os atributos de um item com a regra fixa (mantém tipo, tier, estrelas, nível e fase)
export function recalcularItem(item) {
  if (!item) return item;
  return { ...item, atributos: atributosFixos(item.slot, item.raridade, grauDe(item), item.fase) };
}

// Cria um item caído numa fase. Tier, grau e espaço são sorteados,
// a não ser que sejam passados (o Mesclar usa isso).
export function gerarItem(estado, fase, slotFixo = null, raridadeFixa = null, grauFixo = null) {
  const raridade = raridadeFixa ?? sortearPorPeso(RARIDADES, pesosDosTiers(fase.mapa, fase.chaveTipo, estado.vip));
  const grau = grauFixo ?? sortearPorPeso([1, 2, 3, 4, 5], EQ.pesosGrauAoCair);
  const espacos = espacosLiberados(fase.mapa);
  const slot = slotFixo ?? espacos[Math.floor(Math.random() * espacos.length)];
  const atributos = atributosFixos(slot.id, raridade.id, grau, fase.indice);

  return {
    id: estado.proximoIdItem++,
    slot: slot.id,
    raridade: raridade.id,
    grau,
    fase: fase.indice,
    nivel: 0,
    investido: 0,
    atributos,
  };
}

// ---- Comparação ----
// Quanto o Poder Total muda se este item for vestido no lugar do atual
export function ganhoDePoder(estado, item) {
  const antes = poderTotal(calcularAtributos(estado));
  const comItem = { ...estado, equipados: { ...estado.equipados, [item.slot]: item } };
  return poderTotal(calcularAtributos(comItem)) - antes;
}

// Poder do item: quanto ele soma ao seu Poder Total sozinho (vestido vs. espaço vazio)
export function poderDoItem(estado, item) {
  const vazio = { ...estado, equipados: { ...estado.equipados, [item.slot]: null } };
  const comItem = { ...estado, equipados: { ...estado.equipados, [item.slot]: item } };
  return poderTotal(calcularAtributos(comItem)) - poderTotal(calcularAtributos(vazio));
}

// ---- Receber um item (drop) ----
// Devolve { item, destino: 'equipado' | 'mochila' | 'desmanchado', pedras }
export function receberItem(estado, item) {
  if (estado.opcoes.autoEquipar && ganhoDePoder(estado, item) > 0) {
    const antigo = estado.equipados[item.slot];
    estado.equipados[item.slot] = item;
    if (antigo) guardarOuDesmanchar(estado, antigo);
    return { item, destino: 'equipado', pedras: 0 };
  }
  return guardarOuDesmanchar(estado, item);
}

function guardarOuDesmanchar(estado, item) {
  if (estado.mochila.length < EQ.capacidadeMochila) {
    estado.mochila.push(item);
    return { item, destino: 'mochila', pedras: 0 };
  }
  // Mochila cheia: o item vira Pedras Espirituais
  const pedras = pedrasAoDesmanchar(item);
  estado.pedras += pedras;
  return { item, destino: 'desmanchado', pedras };
}

// Chamado pelo combate a cada vitória. Devolve o resultado ou null se nada caiu.
export function tentarDrop(estado, fase, primeiraVitoria) {
  let chance = EQ.chanceDeDrop[fase.chaveTipo] ?? 0;
  if (primeiraVitoria) chance = Math.min(1, chance * EQ.multiplicadorPrimeiraVitoria);
  if (Math.random() >= chance) return null;
  return receberItem(estado, gerarItem(estado, fase));
}

// ---- Ações do jogador ----
export function buscarItem(estado, id) {
  const naMochila = estado.mochila.find(i => i.id === id);
  if (naMochila) return naMochila;
  return Object.values(estado.equipados).find(i => i && i.id === id) ?? null;
}

export function estaEquipado(estado, item) {
  return estado.equipados[item.slot]?.id === item.id;
}

export function equipar(estado, id) {
  const indice = estado.mochila.findIndex(i => i.id === id);
  if (indice < 0) return false;
  const [item] = estado.mochila.splice(indice, 1);
  const antigo = estado.equipados[item.slot];
  estado.equipados[item.slot] = item;
  if (antigo) estado.mochila.push(antigo);   // sempre cabe: acabamos de tirar um item
  return true;
}

export function remover(estado, slotId) {
  const item = estado.equipados[slotId];
  if (!item || estado.mochila.length >= EQ.capacidadeMochila) return false;
  estado.equipados[slotId] = null;
  estado.mochila.push(item);
  return true;
}

export function podeMelhorar(estado, item) {
  return item.nivel < nivelMaximo(item) && estado.pedras >= custoMelhoria(item);
}

export function melhorar(estado, id) {
  const item = buscarItem(estado, id);
  if (!item || !podeMelhorar(estado, item)) return false;
  const custo = custoMelhoria(item);
  estado.pedras -= custo;
  item.investido += custo;
  item.nivel += 1;
  return true;
}

export function desmanchar(estado, id) {
  const indice = estado.mochila.findIndex(i => i.id === id);
  if (indice < 0) return 0;
  const [item] = estado.mochila.splice(indice, 1);
  const pedras = pedrasAoDesmanchar(item);
  estado.pedras += pedras;
  return pedras;
}

// =============================================================
// PILHAS E MESCLAR
// Na Mochila, itens do mesmo tipo, tier e grau aparecem empilhados.
// Mesclar: 3 itens de uma pilha → 1 item do grau seguinte
// (do ★5 vai para o ★1 do tier seguinte).
// =============================================================
const ITENS_PARA_MESCLAR = EQ.itensParaMesclar;

function itensDaPilha(estado, slotId, raridadeId, grau) {
  return estado.mochila.filter(i => i.slot === slotId && i.raridade === raridadeId && grauDe(i) === grau);
}

// Todas as pilhas da mochila: [{ slot, raridade, grau, itens: [...] }]
export function pilhas(estado) {
  const resultado = [];
  for (const raridade of RARIDADES) {
    for (let grau = 1; grau <= EQ.graus; grau++) {
      for (const slot of SLOTS) {
        const itens = itensDaPilha(estado, slot.id, raridade.id, grau);
        if (itens.length > 0) resultado.push({ slot: slot.id, raridade: raridade.id, grau, itens });
      }
    }
  }
  return resultado;
}

export function buscarPilha(estado, slotId, raridadeId, grau) {
  const itens = itensDaPilha(estado, slotId, raridadeId, grau);
  return itens.length > 0 ? { slot: slotId, raridade: raridadeId, grau, itens } : null;
}

// O item da pilha que mais aumentaria o Poder Total (é o que "Equipar" veste)
export function melhorDaPilha(estado, pilha) {
  return pilha.itens.reduce((melhor, item) => (ganhoDePoder(estado, item) > ganhoDePoder(estado, melhor) ? item : melhor));
}

// O item mais fraco da pilha (é o que "Desmanchar" usa)
export function maisFracoDaPilha(estado, pilha) {
  return pilha.itens.reduce((fraco, item) => (ganhoDePoder(estado, item) < ganhoDePoder(estado, fraco) ? item : fraco));
}

export function podeMesclar(estado, slotId, raridadeId, grau) {
  return proximoDaMescla(raridadeId, grau) !== null &&
    itensDaPilha(estado, slotId, raridadeId, grau).length >= ITENS_PARA_MESCLAR;
}

// Mescla 3 itens de uma pilha. Devolve { item, destino, pedras } ou null se não for possível.
export function mesclar(estado, slotId, raridadeId, grau) {
  if (!podeMesclar(estado, slotId, raridadeId, grau)) return null;

  // Usa o item de fase mais avançada (define a força do novo) + os mais fracos
  const candidatos = itensDaPilha(estado, slotId, raridadeId, grau).sort((a, b) => a.fase - b.fase);
  const melhor = candidatos[candidatos.length - 1];
  const escolhidos = [melhor, ...candidatos.slice(0, ITENS_PARA_MESCLAR - 1)];
  const ids = new Set(escolhidos.map(i => i.id));
  estado.mochila = estado.mochila.filter(i => !ids.has(i.id));

  // Metade das Pedras gastas melhorando os itens volta
  const pedras = Math.floor(escolhidos.reduce((soma, i) => soma + i.investido, 0) * EQ.devolucaoAoDesmanchar);
  estado.pedras += pedras;

  const proximo = proximoDaMescla(raridadeId, grau);
  const novo = gerarItem(estado, FASES[melhor.fase], SLOTS.find(s => s.id === slotId), proximo.raridade, proximo.grau);
  const resultado = receberItem(estado, novo);
  return { ...resultado, pedras: resultado.pedras + pedras };
}

// Existe alguma pilha na mochila que já dá para mesclar?
export function temAlgoParaMesclar(estado) {
  return pilhas(estado).some(p => podeMesclar(estado, p.slot, p.raridade, p.grau));
}

// Mesclar tudo: faz todas as mesclas possíveis, em cascata, do grau mais baixo para o mais alto
// (ex.: 9 Elmos ★1 → 3 ★2 → 1 ★3). Itens vestidos não entram.
// Devolve { mesclas, melhores: [itens novos de tier/grau mais alto], pedras }
export function mesclarTudo(estado) {
  let mesclas = 0;
  let pedras = 0;
  const novos = [];
  let mudou = true;
  while (mudou) {
    mudou = false;
    for (const pilha of pilhas(estado)) {      // pilhas() já vem do tier/grau mais baixo para o mais alto
      while (podeMesclar(estado, pilha.slot, pilha.raridade, pilha.grau)) {
        const resultado = mesclar(estado, pilha.slot, pilha.raridade, pilha.grau);
        mesclas += 1;
        pedras += resultado.pedras;
        novos.push(resultado.item);
        mudou = true;
      }
    }
  }
  // Para a mensagem: só os itens que sobraram (os intermediários foram usados em outras mesclas)
  const ids = new Set([...estado.mochila.map(i => i.id), ...Object.values(estado.equipados).filter(Boolean).map(i => i.id)]);
  const melhores = novos.filter(i => ids.has(i.id));
  return { mesclas, melhores, pedras };
}

// Desmancha a pilha inteira
export function desmancharPilha(estado, slotId, raridadeId, grau) {
  const itens = itensDaPilha(estado, slotId, raridadeId, grau);
  const pedras = itens.reduce((soma, i) => soma + pedrasAoDesmanchar(i), 0);
  const ids = new Set(itens.map(i => i.id));
  estado.mochila = estado.mochila.filter(i => !ids.has(i.id));
  estado.pedras += pedras;
  return { pedras, quantidade: itens.length };
}
// Quanto o Poder Total mudaria se ESTE item fosse melhorado até o nível máximo dele e vestido.
// (Ex.: um Raro +0 pode perder de um Incomum +8 agora, mas ganhar dele quando chegar a +12.)
export function ganhoNoNivelMaximo(estado, item) {
  return ganhoDePoder(estado, { ...item, nivel: nivelMaximo(item) });
}

// ---- Itens obsoletos (v0.9.8, pedido do dono) ----
// A melhor versão possível de um item: mesclado até ★5 (mesmo tier) e melhorado até o nível máximo.
function versaoMaxima(item) {
  return { ...item, grau: EQ.graus, nivel: nivelMaximo(item), atributos: atributosFixos(item.slot, item.raridade, EQ.graus, item.fase) };
}

// Obsoleto = nem na melhor versão possível ele ganha do item vestido agora naquele espaço.
// (Item que ainda pode ficar melhor mesclando ou melhorando NÃO é obsoleto.)
export function ehObsoleto(estado, item) {
  if (!estado.equipados[item.slot]) return false;   // espaço vazio: qualquer item serve
  return ganhoDePoder(estado, versaoMaxima(item)) <= 0;
}

export function obsoletos(estado) {
  const itens = estado.mochila.filter(item => ehObsoleto(estado, item));
  return { itens, pedras: itens.reduce((soma, i) => soma + pedrasAoDesmanchar(i), 0) };
}

export function desmancharObsoletos(estado) {
  const { itens, pedras } = obsoletos(estado);
  const ids = new Set(itens.map(i => i.id));
  estado.mochila = estado.mochila.filter(i => !ids.has(i.id));
  estado.pedras += pedras;
  return { pedras, quantidade: itens.length };
}

// Desmancha todos os itens da mochila até um tier (0 = só Comuns, 1 = Comuns e Incomuns...)
export function desmancharAteTier(estado, indiceMaximo) {
  let pedras = 0;
  let quantidade = 0;
  estado.mochila = estado.mochila.filter((item) => {
    if (indiceRaridade(item) > indiceMaximo) return true;
    pedras += pedrasAoDesmanchar(item);
    quantidade += 1;
    return false;
  });
  estado.pedras += pedras;
  return { pedras, quantidade };
}
