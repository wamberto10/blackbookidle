// =============================================================
// sistemas/equipamentos.js — DROPS, VESTIR, MELHORAR E DESMANCHAR
//
// Como um item é criado quando cai numa fase:
//  1. Sorteia o TIER (mesmas chances em todo mapa; chefes melhoram um pouco).
//  2. Sorteia o ESPAÇO entre os 10 (todos caem em qualquer mapa).
//  3. Sorteia o GRAU (★1 a ★5): quase sempre ★1, às vezes ★2 a ★4.
//  4. Os atributos são FIXOS por tipo de item (dados/equipamentos.js):
//     fração do espaço × força do tier × estrelas × patamar do mapa GLOBAL onde caiu. Nada aleatório.
//     v0.32.0: Ataque, Vitalidade, Defesa e Velocidade viraram % que MULTIPLICA o cultivo (atributos.js).
// =============================================================
import { CONFIG } from '../config.js';
import { SLOTS, RARIDADES, ATRIBUTOS_EM_PORCENTO } from '../dados/equipamentos.js';
import { calcularAtributos, poderTotal } from './atributos.js';
import { obterFase } from './mundo.js';
import { mapaDaFase, fatorDoItem } from './escala.js';
import { somar, subtrair, multiplicar, comparar, maior, menorOuIgual, arredondarParaBaixo } from '../numeros.js';
import { creditar, debitar, cabe } from '../saldos.js';   // v0.33.2: Pedras sem perda de precisão
// v0.33.0: Pedras, investimento, custos e ganhos de Poder são NÚMEROS GRANDES (js/numeros.js)
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
// do tier, das estrelas e do MAPA onde caiu — dentro do mapa, tier maior sempre ganha.
// v0.32.0: Ataque, Vitalidade, Defesa e Velocidade = fração × 100 × força × crescimentoPorMapa^(mapa global) em %
// (antes: fração × atributos do chefe do mapa, um valor fixo somado à base). Os outros continuam em pontos de %.
function valorDoAtributo(atributo, fator, mapaGlobal, forca) {
  if (ATRIBUTOS_EM_PORCENTO.includes(atributo)) {
    return fator * (1 + EQ.crescimentoPorcentoPorMapa * mapaGlobal) * forca;
  }
  return multiplicar(fatorDoItem(mapaGlobal), 100 * fator * forca);
}

// Atributos (no nível 0) de um item com este tipo, tier, estrelas e fase GLOBAL
export function atributosFixos(slotId, raridadeId, grau, indiceFase) {
  const slot = SLOTS.find(s => s.id === slotId);
  const raridade = RARIDADES.find(r => r.id === raridadeId);
  const forca = raridade.forca * (1 + EQ.bonusPorGrau * (grau - 1));
  const mapaGlobal = mapaDaFase(Math.max(0, indiceFase));
  const atributos = {};
  for (const [atributo, fator] of Object.entries(slot.principal)) {
    atributos[atributo] = valorDoAtributo(atributo, fator, mapaGlobal, forca);
  }
  return atributos;
}

// Refaz os atributos de um item com a regra atual (mantém tipo, tier, estrelas, nível, fase, investimento e trava).
// v0.32.0: save.js chama em todo carregamento — assim um rebalanceamento vale também para os itens já guardados.
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
// v0.32.0: sem o limite do reino, a comparação usa os atributos de verdade (fora do Selo: o item fica para depois)
const SEM_SELO = { selado: false };

// Quanto o Poder Total muda se este item for vestido no lugar do atual
export function ganhoDePoder(estado, item) {
  const antes = poderTotal(calcularAtributos(estado, SEM_SELO));
  const comItem = { ...estado, equipados: { ...estado.equipados, [item.slot]: item } };
  return subtrair(poderTotal(calcularAtributos(comItem, SEM_SELO)), antes);   // pode ser negativo
}

// Poder do item: quanto ele soma ao seu Poder Total sozinho (vestido vs. espaço vazio)
export function poderDoItem(estado, item) {
  const vazio = { ...estado, equipados: { ...estado.equipados, [item.slot]: null } };
  const comItem = { ...estado, equipados: { ...estado.equipados, [item.slot]: item } };
  return subtrair(poderTotal(calcularAtributos(comItem, SEM_SELO)), poderTotal(calcularAtributos(vazio, SEM_SELO)));
}

// ---- Receber um item (drop) ----
// Devolve { item, destino: 'equipado' | 'mochila' | 'desmanchado', pedras }
export function receberItem(estado, item) {
  if (estado.opcoes.autoEquipar && maior(ganhoDePoder(estado, item), 0)) {
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
  creditar(estado, 'pedras', pedras);
  return { item, destino: 'desmanchado', pedras };
}

// Chamado pelo combate a cada vitória. Devolve o resultado ou null se nada caiu.
// v0.26.0: depois do drop a Mochila se organiza sozinha (opções desmancheAuto/mesclaAuto). Destinos possíveis:
// 'equipado', 'mochila', 'obsoleto' (desmanchado na hora) ou 'mesclado'; resultado.auto = o que foi feito na Mochila.
export function tentarDrop(estado, fase, primeiraVitoria) {
  let chance = EQ.chanceDeDrop[fase.chaveTipo] ?? 0;
  if (primeiraVitoria) chance = Math.min(1, chance * EQ.multiplicadorPrimeiraVitoria);
  if (Math.random() >= chance) return null;
  const resultado = receberItem(estado, gerarItem(estado, fase));
  const item = resultado.item;
  const pedrasDoItem = pedrasAoDesmanchar(item);
  const auto = organizarMochila(estado);   // também limpa o item que o Auto-vestir acabou de tirar
  if (resultado.destino !== 'mochila' || estado.mochila.some(i => i.id === item.id)) return { ...resultado, auto };
  if (estaEquipado(estado, item)) return { ...resultado, destino: 'equipado', auto };
  if (auto.ids.has(item.id)) return { ...resultado, destino: 'obsoleto', pedras: pedrasDoItem, auto };
  return { ...resultado, destino: 'mesclado', auto };
}

// v0.26.0: Desmanche e Mescla automáticos. Desmancha os obsoletos primeiro (mesclar obsoletos só daria outro
// obsoleto); depois mescla; e desmancha de novo, porque uma mescla pode trocar o item vestido (Auto-vestir).
// Devolve { desmanchados, mesclas, pedras, ids: Set dos itens desmanchados }.
export function organizarMochila(estado) {
  const auto = { desmanchados: 0, mesclas: 0, pedras: 0, ids: new Set() };
  const desmancharAgora = () => {
    if (!estado.opcoes.desmancheAuto) return;
    const { itens, pedras } = obsoletos(estado);
    if (!itens.length) return;
    for (const i of itens) auto.ids.add(i.id);
    estado.mochila = estado.mochila.filter(i => !auto.ids.has(i.id));
    creditar(estado, 'pedras', pedras);
    auto.desmanchados += itens.length;
    auto.pedras = somar(auto.pedras, pedras);
  };
  desmancharAgora();
  if (estado.opcoes.mesclaAuto && temAlgoParaMesclar(estado)) {
    const r = mesclarTudo(estado);
    auto.mesclas += r.mesclas;
    auto.pedras = somar(auto.pedras, r.pedras);
    desmancharAgora();
  }
  return auto;
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
  return item.nivel < nivelMaximo(item) && cabe(estado, 'pedras', custoMelhoria(item));
}

export function melhorar(estado, id) {
  const item = buscarItem(estado, id);
  if (!item || !podeMelhorar(estado, item)) return false;
  const custo = custoMelhoria(item);
  if (!debitar(estado, 'pedras', custo)) return false;
  item.investido = somar(item.investido, custo);
  item.nivel += 1;
  return true;
}

export function desmanchar(estado, id) {
  const indice = estado.mochila.findIndex(i => i.id === id);
  if (indice < 0 || estado.mochila[indice].travado) return 0;   // v0.27.1: travado não desmancha
  const [item] = estado.mochila.splice(indice, 1);
  const pedras = pedrasAoDesmanchar(item);
  creditar(estado, 'pedras', pedras);
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
  return pilha.itens.reduce((melhor, item) => (comparar(ganhoDePoder(estado, item), ganhoDePoder(estado, melhor)) > 0 ? item : melhor));
}

// O item mais fraco da pilha (é o que "Desmanchar" usa). v0.27.1: itens travados ficam de fora (null = todos travados)
export function maisFracoDaPilha(estado, pilha) {
  const livres = pilha.itens.filter(livre);
  if (!livres.length) return null;
  return livres.reduce((fraco, item) => (comparar(ganhoDePoder(estado, item), ganhoDePoder(estado, fraco)) < 0 ? item : fraco));
}

// v0.27.1: item TRAVADO (cadeado da Mochila) não é desmanchado nem gasto em mesclas — por botão, em massa ou no automático
export const livre = (item) => !item.travado;

export function podeMesclar(estado, slotId, raridadeId, grau) {
  return proximoDaMescla(raridadeId, grau) !== null &&
    itensDaPilha(estado, slotId, raridadeId, grau).filter(livre).length >= ITENS_PARA_MESCLAR;
}

// Mescla 3 itens de uma pilha. Devolve { item, destino, pedras } ou null se não for possível.
export function mesclar(estado, slotId, raridadeId, grau) {
  if (!podeMesclar(estado, slotId, raridadeId, grau)) return null;

  // Usa o item de fase mais avançada (define a força do novo) + os mais fracos
  const candidatos = itensDaPilha(estado, slotId, raridadeId, grau).filter(livre).sort((a, b) => a.fase - b.fase);
  const melhor = candidatos[candidatos.length - 1];
  const escolhidos = [melhor, ...candidatos.slice(0, ITENS_PARA_MESCLAR - 1)];
  const ids = new Set(escolhidos.map(i => i.id));
  estado.mochila = estado.mochila.filter(i => !ids.has(i.id));

  // Parte das Pedras gastas melhorando os itens volta (EQ.devolucaoAoDesmanchar: 75%)
  const pedras = arredondarParaBaixo(multiplicar(escolhidos.reduce((soma, i) => somar(soma, i.investido), 0), EQ.devolucaoAoDesmanchar));
  creditar(estado, 'pedras', pedras);

  const proximo = proximoDaMescla(raridadeId, grau);
  const novo = gerarItem(estado, obterFase(melhor.fase), SLOTS.find(s => s.id === slotId), proximo.raridade, proximo.grau);
  const resultado = receberItem(estado, novo);
  return { ...resultado, pedras: somar(resultado.pedras, pedras) };
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
        pedras = somar(pedras, resultado.pedras);
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
  const itens = itensDaPilha(estado, slotId, raridadeId, grau).filter(livre);
  const pedras = itens.reduce((soma, i) => somar(soma, pedrasAoDesmanchar(i)), 0);
  const ids = new Set(itens.map(i => i.id));
  estado.mochila = estado.mochila.filter(i => !ids.has(i.id));
  creditar(estado, 'pedras', pedras);
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
  return menorOuIgual(ganhoDePoder(estado, versaoMaxima(item)), 0);
}

// v0.27.1: trava/destrava itens (o cadeado da Mochila)
export function travar(estado, ids, travado) {
  const alvo = new Set(ids);
  for (const item of [...estado.mochila, ...Object.values(estado.equipados)]) {
    if (item && alvo.has(item.id)) item.travado = travado || undefined;
  }
}

export function obsoletos(estado) {
  const itens = estado.mochila.filter(item => livre(item) && ehObsoleto(estado, item));
  return { itens, pedras: itens.reduce((soma, i) => somar(soma, pedrasAoDesmanchar(i)), 0) };
}

export function desmancharObsoletos(estado) {
  const { itens, pedras } = obsoletos(estado);
  const ids = new Set(itens.map(i => i.id));
  estado.mochila = estado.mochila.filter(i => !ids.has(i.id));
  creditar(estado, 'pedras', pedras);
  return { pedras, quantidade: itens.length };
}

// Desmancha todos os itens da mochila até um tier (0 = só Comuns, 1 = Comuns e Incomuns...)
export function desmancharAteTier(estado, indiceMaximo) {
  let pedras = 0;
  let quantidade = 0;
  estado.mochila = estado.mochila.filter((item) => {
    if (indiceRaridade(item) > indiceMaximo || !livre(item)) return true;
    pedras = somar(pedras, pedrasAoDesmanchar(item));
    quantidade += 1;
    return false;
  });
  creditar(estado, 'pedras', pedras);
  return { pedras, quantidade };
}
