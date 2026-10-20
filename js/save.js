// =============================================================
// save.js — salvar, carregar e calcular tempo offline
// O save fica no navegador (localStorage), no próprio computador.
// =============================================================
import { CONFIG } from './config.js';
import { criarEstadoInicial } from './estado.js';
import { REINOS } from './dados/reinos.js';
import { FASES, MAPAS, obterFase } from './sistemas/mundo.js';
import { sentidoDivinoNoNivel } from './sistemas/atributos.js';
import { inicioDoReino, indiceNivel, requisitoDoRompimento, proximoEhRompimento, proximoEhMaestria } from './sistemas/progressao.js';
import { corrigirMelhoriasAntigas, converterMelhoriasCompostas } from './sistemas/blackbook.js';
import { recalcularItem } from './sistemas/equipamentos.js';
import { SLOT_POR_ID, RARIDADE_POR_ID } from './sistemas/itens.js';
import { lutaParaSalvar } from './sistemas/combate.js';
import { automacaoPadrao } from './sistemas/automacao.js';
import { ler, maiorOuIgual, ehZero } from './numeros.js';
import { CONTAS } from './saldos.js';

const CHAVE_DO_SAVE = 'blackbook-idle-save-v1';
// v0.32.0: cópia do save ORIGINAL de antes da progressão contínua. Escrita uma vez só (nunca é sobrescrita).
export const CHAVE_DA_COPIA = 'blackbook-idle-save-v1-copia-antes-v0.32.0';
// v0.33.0: cópia do save de antes dos números grandes (mesma regra: uma vez só)
export const CHAVE_DA_COPIA_NUMEROS = 'blackbook-idle-save-v1-copia-antes-v0.33.0';
// Cada save inválido tem sua própria cópia, inclusive depois da migração numérica.
// A cópia histórica da migração nunca é substituída por um reparo posterior.
export const PREFIXO_DAS_COPIAS_REPARO = 'blackbook-idle-save-v1-copia-antes-reparo-numeros-';
export const VERSAO_DOS_NUMEROS = 1;
const copiasPendentes = new WeakMap();

export function salvar(estado, instante = Date.now()) {
  if (typeof instante !== 'number' || !Number.isFinite(instante) || instante < 0) throw new RangeError('Instante inválido para salvar o jogo.');
  const originalPendente = copiasPendentes.get(estado);
  if (originalPendente !== undefined) {
    const copia = guardarCopiaDeReparo(originalPendente);
    estado.avisoNumerosCopia = copia;
    if (!copia.sucesso) return { sucesso: false, motivo: 'copia-do-original-pendente', copia };
    copiasPendentes.delete(estado);
  }
  estado.ultimoSave = instante;
  estado.combate.luta = lutaParaSalvar() ?? estado.combate.luta;   // v0.33.0: a luta em andamento vai junto
  localStorage.setItem(CHAVE_DO_SAVE, JSON.stringify(estado));
  return { sucesso: true };
}

// Devolve o estado salvo, ou null se não existir / estiver corrompido
export function carregar() {
  let texto;
  try {
    texto = localStorage.getItem(CHAVE_DO_SAVE);
    if (texto === null) return null;

    const dados = JSON.parse(texto);
    if (!dados || typeof dados !== 'object' || Array.isArray(dados)) throw new TypeError('O save não contém um objeto de estado.');
    const padrao = criarEstadoInicial();

    // Mescla com o padrão: se no futuro adicionarmos campos novos,
    // saves antigos recebem o valor padrão em vez de quebrar.
    const estado = {
      ...padrao,
      ...dados,
      combate: { ...padrao.combate, ...dados.combate },
      equipados: { ...padrao.equipados, ...dados.equipados },
      mochila: Array.isArray(dados.mochila) ? dados.mochila : [],
      blackbook: { ...padrao.blackbook, ...dados.blackbook },
      nucleos: { ...padrao.nucleos, ...dados.nucleos },
      reclusao: { ...padrao.reclusao, ...dados.reclusao },
      efeitos: { ...padrao.efeitos, ...dados.efeitos },
      pilulas: { ...padrao.pilulas, ...dados.pilulas },
      pontosNucleo: { ...padrao.pontosNucleo, ...dados.pontosNucleo },
      reencarnacao: { ...padrao.reencarnacao, ...dados.reencarnacao },
      boss: { ...padrao.boss, ...dados.boss, rank: Array.isArray(dados.boss?.rank) ? dados.boss.rank : [] },
      opcoes: { ...padrao.opcoes, ...dados.opcoes },
      automacao: mesclarAutomacao(dados.automacao),   // v0.33.0: completa com o padrão (tudo desligado)
      relogio: { ...padrao.relogio, ...dados.relogio },
      estatisticas: { ...padrao.estatisticas, ...dados.estatisticas },
      residuos: lerResiduos(dados.residuos),   // v0.33.2
    };

    // v0.33.0: números grandes (js/numeros.js) — o save guarda os que passam de 1e290 como texto "m e e".
    // Saves sem versaoNumeros (até a v0.32.0): cópia de segurança antes, uma vez só. Valor inválido não vira 0
    // em silêncio: fica registrado em avisoNumeros (o jogo mostra) e a cópia guarda o original.
    if ((dados.versaoNumeros ?? 0) < VERSAO_DOS_NUMEROS) guardarCopia(CHAVE_DA_COPIA_NUMEROS, texto);
    let copiaDeReparo;
    const invalidos = lerNumerosGrandes(estado, () => {
      // O texto ainda contém todos os valores originais. Copia antes do primeiro reparo.
      copiaDeReparo ??= guardarCopiaDeReparo(texto);
    });
    if (invalidos.length) {
      estado.avisoNumeros = invalidos;
      estado.avisoNumerosCopia = copiaDeReparo;
      // Se o navegador recusou a cópia, o estado pode abrir em memória, mas o autosave
      // não pode apagar o original. Uma tentativa futura de salvar primeiro repete a cópia.
      if (!copiaDeReparo.sucesso) copiasPendentes.set(estado, texto);
    }
    estado.versaoNumeros = VERSAO_DOS_NUMEROS;

    // ---- Atualização de saves antigos ----
    // Antes da v0.4.0: Pedras do combate + "Treinamento" desbalanceado → zera os dois.
    if (versaoMenorQue(dados.versao, '0.4.0')) {
      estado.pedras = 0;
    }
    // Na v0.4.0 a recompensa da reencarnação se chamava "pedras". A partir da v0.5.0
    // ela é a Essência da Alma, e as Pedras voltaram a cair nas fases.
    if (versaoMenorQue(dados.versao, '0.5.0')) {
      estado.essencia = versaoMenorQue(dados.versao, '0.4.0') ? 0 : (dados.pedras || 0);
      estado.reencarnacao.essenciaTotal = dados.reencarnacao?.pedrasTotais || 0;
      delete estado.reencarnacao.pedrasTotais;
      estado.pedras = 0;
    }
    // v0.8.1: Esquiva saiu do Black Book e Crítico/Dano Crítico ganharam nível máximo
    corrigirMelhoriasAntigas(estado);
    // v0.9.2: atributos dos itens ficaram FIXOS por tipo — refaz os itens antigos
    // (mantém tipo, tier, estrelas, nível e o mapa onde caíram)
    if (versaoMenorQue(dados.versao, '0.9.2')) {
      for (const slot in estado.equipados) estado.equipados[slot] = recalcularItem(estado.equipados[slot]);
      estado.mochila = estado.mochila.map(recalcularItem);
    }
    // v0.12.0 "a alma se lembra": saves antigos não guardavam o Sentido Divino. Estima pelo mapa mais
    // longe já alcançado (o Sentido Divino de quem começa o reino daquele mapa) ou pelo desta vida.
    if (dados.reencarnacao?.sentidoDivinoMaximo === undefined) {
      const melhor = Math.max(estado.reencarnacao.melhorFaseDeTodas, estado.combate.fasesConcluidas);
      let estimado = sentidoDivinoNoNivel(inicioDoReino(estado.reino) + estado.estagio, estado.reino);
      if (melhor >= 0) {
        const mapa = MAPAS[obterFase(melhor).mapaVisual];
        estimado = Math.max(estimado, sentidoDivinoNoNivel(inicioDoReino(mapa.reino) + (mapa.inicioNoReino ?? 0), mapa.reino));
      }
      estado.reencarnacao.sentidoDivinoMaximo = estimado;
    }
    // v0.14.0: Black Book com bônus composto — converte os níveis antigos sem perder força
    // e devolve a Essência que sobrar (o aviso aparece em main.js)
    if (versaoMenorQue(dados.versao, '0.14.0')) estado.essenciaDevolvidaBB = converterMelhoriasCompostas(estado);
    delete estado.treino;

    // v0.32.0: progressão contínua (sem reencarnação). Versionada: roda uma vez só por save.
    if ((dados.versaoProgressao ?? 1) < CONFIG.progressao.versaoDoSave) {
      guardarCopiaDoOriginal(texto);
      estado.avisoProgressao = migrarParaProgressaoContinua(estado);
      estado.versaoProgressao = CONFIG.progressao.versaoDoSave;
    }
    // Itens: refeitos com a regra atual em TODO carregamento (mesmo resultado se nada mudou — idempotente).
    // Mantém id, tipo, tier, estrelas, nível, investimento, trava e a fase global onde caíram.
    const itemValido = (item) => item && SLOT_POR_ID[item.slot] && RARIDADE_POR_ID[item.raridade] && Number.isFinite(item.fase);
    for (const slot in estado.equipados) {
      estado.equipados[slot] = itemValido(estado.equipados[slot]) ? recalcularItem(estado.equipados[slot]) : null;
    }
    estado.mochila = estado.mochila.filter(itemValido).map(recalcularItem);
    estado.versao = CONFIG.versao;

    // Proteções: não deixa o save apontar para algo que não existe
    // Hora do último save inválida ou no futuro (relógio do celular mudou): conta como "agora",
    // para o progresso offline nunca dar tempo negativo nem gigante.
    if (!Number.isFinite(estado.ultimoSave) || estado.ultimoSave > Date.now()) estado.ultimoSave = Date.now();
    estado.reino = Math.min(Math.max(0, estado.reino), REINOS.length - 1);
    estado.estagio = Math.min(Math.max(0, estado.estagio), REINOS[estado.reino].estagios.length - 1);
    // v0.32.0: Maestria só existe no Fruto do Universo (último estágio do último reino)
    estado.maestria = proximoEhMaestria({ ...estado, maestria: 0 }) ? Math.max(0, Math.floor(estado.maestria) || 0) : 0;
    const c = estado.combate;
    // v0.32.0: sem fim de campanha (Normal, Difícil, Inferno e Infinito) — só não deixa ficar negativo ou inválido
    c.fasesConcluidas = Number.isFinite(c.fasesConcluidas) ? Math.max(-1, Math.floor(c.fasesConcluidas)) : -1;
    c.faseAtual = Number.isFinite(c.faseAtual) ? Math.min(Math.max(0, Math.floor(c.faseAtual)), c.fasesConcluidas + 1) : 0;

    return estado;
  } catch (erro) {
    console.error('Não foi possível carregar o save; preservando o original antes de abrir um estado inicial.', erro);
    if (typeof texto !== 'string') return null;
    const estado = criarEstadoInicial();
    const copia = guardarCopiaDeReparo(texto);
    estado.avisoNumeros = [{ campo: 'save', valor: String(erro.message ?? erro) }];
    estado.avisoNumerosCopia = copia;
    if (!copia.sucesso) copiasPendentes.set(estado, texto);
    return estado;
  }
}

// v0.33.0: automação salva + padrão. Configurações que não existem mais somem; as novas entram desligadas.
function mesclarAutomacao(salva) {
  const p = automacaoPadrao();
  if (!salva || typeof salva !== 'object') return p;
  const a = { ...p, segundos: salva.segundos === undefined ? 0 : salva.segundos, ultima: salva.ultima ?? null };
  for (const grupo of ['blackbook', 'cultivo', 'pilulas', 'arranjo', 'equipamentos', 'nucleos', 'retomada', 'reencarnacao']) {
    a[grupo] = { ...p[grupo], ...(salva[grupo] ?? {}) };
  }
  a.pilulas.minimo = { ...p.pilulas.minimo, ...(salva.pilulas?.minimo ?? {}) };
  a.blackbook.permitidas = { ...p.blackbook.permitidas, ...(salva.blackbook?.permitidas ?? {}) };
  // a ordem guarda só melhorias que existem, sem repetir, e acrescenta as novas no fim
  const ids = p.blackbook.ordem;
  const ordem = (Array.isArray(salva.blackbook?.ordem) ? salva.blackbook.ordem : []).filter((id, i, l) => ids.includes(id) && l.indexOf(id) === i);
  a.blackbook.ordem = [...ordem, ...ids.filter(id => !ordem.includes(id))];
  return a;
}

// =============================================================
// v0.32.0 — MIGRAÇÃO PARA A PROGRESSÃO CONTÍNUA (critérios em docs/PROGRESSAO_CONTINUA.md)
// =============================================================
// Cópia de segurança do texto ORIGINAL do save, antes de converter. Só escreve se ainda não existir
// (carregar de novo um save já migrado nunca troca a cópia).
function guardarCopiaDoOriginal(texto) {
  guardarCopia(CHAVE_DA_COPIA, texto);
}
function guardarCopia(chave, texto) {
  try {
    const anterior = localStorage.getItem(chave);
    if (anterior === null) localStorage.setItem(chave, texto);
    const guardado = localStorage.getItem(chave);
    return { sucesso: guardado === texto, chave: guardado === texto ? chave : null, nova: anterior === null && guardado === texto,
      ...(guardado !== texto ? { erro: 'A chave já contém outra cópia; ela foi preservada.' } : {}) };
  } catch (erro) {
    console.warn('Não foi possível guardar a cópia do save antigo.', erro);
    return { sucesso: false, chave: null, nova: false, erro: String(erro.message ?? erro) };
  }
}

function guardarCopiaDeReparo(texto) {
  // Hash só para localizar a chave. A igualdade do TEXTO é sempre verificada, portanto
  // uma colisão não substitui outra cópia e um novo carregamento reaproveita a mesma.
  let hash = 2166136261;
  for (let i = 0; i < texto.length; i++) hash = Math.imul(hash ^ texto.charCodeAt(i), 16777619);
  const base = PREFIXO_DAS_COPIAS_REPARO + (hash >>> 0).toString(16) + '-' + texto.length;
  try {
    for (let i = 0; ; i++) {
      const chave = base + (i ? '-' + i : '');
      const anterior = localStorage.getItem(chave);
      if (anterior === null || anterior === texto) return guardarCopia(chave, texto);
    }
  } catch (erro) {
    return { sucesso: false, chave: null, nova: false, erro: String(erro.message ?? erro) };
  }
}

// v0.33.0: converte os campos de número grande do save (número ou texto "m e e") com numeros.ler.
// Saldos (Cultivo, Pedras, Essência...) não podem ser negativos nem inválidos: esses ficam em 0 e entram na lista
// devolvida (campo e valor original), para o jogo avisar. Os outros valores ficam como estavam.
function lerNumerosGrandes(estado, antesDeReparar = () => {}) {
  const invalidos = [];
  const converter = (dono, chave, nome, saldo = true) => {
    if (!dono || dono[chave] === undefined) return;
    try {
      const valor = ler(dono[chave]);
      if (saldo && !maiorOuIgual(valor, 0)) throw new RangeError('negativo');
      dono[chave] = valor;
    } catch {
      antesDeReparar();
      invalidos.push({ campo: nome, valor: JSON.stringify(dono[chave]) });
      dono[chave] = 0;
    }
  };
  for (const k of ['cultivo', 'cultivoTotal', 'pedras', 'essencia']) converter(estado, k, k);
  converter(estado.estatisticas, 'essenciaConquistas', 'estatisticas.essenciaConquistas');
  converter(estado.estatisticas, 'essenciaFarm', 'estatisticas.essenciaFarm');
  converter(estado.reencarnacao, 'essenciaTotal', 'reencarnacao.essenciaTotal');
  converter(estado.reencarnacao, 'essenciaNoInicio', 'reencarnacao.essenciaNoInicio');   // v0.34.0
  converter(estado.reencarnacao, 'sentidoDivinoMaximo', 'reencarnacao.sentidoDivinoMaximo');
  (estado.reencarnacao.historico ?? []).forEach((v, i) => converter(v, 'essencia', `reencarnacao.historico[${i}].essencia`));
  const itens = [...Object.values(estado.equipados), ...estado.mochila].filter(Boolean);
  for (const item of itens) converter(item, 'investido', `item ${item.id}.investido`);
  for (const k of ['poder', 'velocidade']) converter(estado.combate.derrota, k, `combate.derrota.${k}`);
  for (const k of ['escala', 'escalaVel', 'escalaSentido', 'vidaJogador', 'vidaInimigo']) converter(estado.combate.luta, k, `combate.luta.${k}`);
  for (const k of ['ataque', 'vitalidade', 'defesa', 'velocidade', 'sentidoDivino']) converter(estado.combate.luta?.jogador, k, `combate.luta.jogador.${k}`);
  for (const grupo of ['blackbook', 'arranjo', 'equipamentos']) converter(estado.automacao[grupo], 'reserva', `automacao.${grupo}.reserva`);
  for (const k of ['essenciaGasta', 'pedrasArranjo', 'pedrasItens', 'cultivoDasPilulas']) {
    converter(estado.automacao.ultima, k, `automacao.ultima.${k}`);
  }
  // Relógios não são magnitudes de recursos. Preserva TODO tempo já aceito pelo motor,
  // inclusive segundos inteiros pendentes; rejeita apenas tipo inválido, NaN ou negativo.
  for (const [dono, chave, nome] of [[estado.relogio, 'resto', 'relogio.resto'], [estado.automacao, 'segundos', 'automacao.segundos']]) {
    const valor = dono?.[chave];
    if (typeof valor === 'number' && Number.isFinite(valor) && valor >= 0) continue;
    antesDeReparar();
    invalidos.push({ campo: nome, valor: JSON.stringify(valor) });
    dono[chave] = 0;
  }
  return invalidos;
}

// v0.33.2: o que ainda não mudou a última casa de cada saldo (saldos.js). Só as contas conhecidas, na ordem salva
// (salvar de novo dá o mesmo texto). Um resíduo ilegível é descartado sem aviso: vale menos que a última casa do saldo.
function lerResiduos(salvos) {
  const residuos = {};
  if (!salvos || typeof salvos !== 'object' || Array.isArray(salvos)) return residuos;
  for (const conta of Object.keys(salvos)) {
    if (!CONTAS.includes(conta)) continue;
    try {
      const valor = ler(salvos[conta]);
      if (!ehZero(valor)) residuos[conta] = valor;
    } catch { /* descartado */ }
  }
  return residuos;
}

// Maior nível que a campanha permite com estas fases vencidas (rompimentos e estágios travados pelos chefes).
// A migração não dá Maestria (ela só existe depois do Mapa 96, que nenhum save antigo passou).
export function nivelMaximoPelaCampanha(fasesConcluidas) {
  const teste = { reino: 0, estagio: 0, maestria: 0, combate: { fasesConcluidas } };
  for (;;) {
    if (proximoEhMaestria(teste)) break;
    const requisito = requisitoDoRompimento(teste);
    if (requisito && !requisito.cumprido) break;
    if (proximoEhRompimento(teste)) { teste.reino += 1; teste.estagio = 0; } else teste.estagio += 1;
  }
  return indiceNivel(teste);
}

function colocarNoNivel(estado, nivel) {
  let reino = REINOS.length - 1;
  while (reino > 0 && inicioDoReino(reino) > nivel) reino -= 1;
  estado.reino = reino;
  estado.estagio = Math.min(nivel - inicioDoReino(reino), REINOS[reino].estagios.length - 1);
}

// Converte um save da progressão antiga (vidas que recomeçavam). Devolve um resumo para o aviso em main.js.
//  1. Fronteira = a maior conquista comprovada: fases desta vida, o recorde de todas as vidas e o histórico.
//     Tudo até ela conta como JÁ RECOMPENSADO (a Essência da 1ª conquista só é paga em fase nova).
//  2. Cultivo: sobe para o maior nível comprovado — o desta vida ou o das vidas do histórico. Quem estava
//     reconstruindo depois de renascer (vida atual atrás do recorde) sobe pelo menos até o nível de referência da
//     fase mais difícil já vencida (estimativa conservadora, para os saves sem histórico). Nunca passa do que os
//     chefes já vencidos liberam e nunca desce.
//  3. Quem estava reconstruindo volta para a última fase vencida da fronteira; o resto fica onde estava.
// Itens são refeitos depois (carregar), mantendo tudo que foi investido. Essência, Black Book, Pedras, Núcleos,
// Arranjo, pílulas, VIP, histórico e opções ficam como estavam.
export function migrarParaProgressaoContinua(estado) {
  const c = estado.combate;
  const r = estado.reencarnacao;
  const historico = Array.isArray(r.historico) ? r.historico : [];
  const valida = (fase) => (Number.isFinite(fase) ? Math.min(Math.max(-1, Math.floor(fase)), FASES.length - 1) : -1);
  const fasesDaVida = valida(c.fasesConcluidas);
  const recorde = Math.max(fasesDaVida, valida(r.melhorFaseDeTodas), ...historico.map(v => valida(v.fase)));
  const nivelAntes = indiceNivel(estado);

  const nivelDoHistorico = Math.max(-1, ...historico
    .filter(v => Number.isInteger(v.reino) && REINOS[v.reino] && Number.isInteger(v.estagio))
    .map(v => inicioDoReino(v.reino) + Math.min(v.estagio, REINOS[v.reino].estagios.length - 1)));
  const reconstruindo = fasesDaVida < recorde;
  const nivelEstimado = reconstruindo ? Math.floor(FASES[recorde].nivel) : 0;
  const nivel = Math.min(Math.max(nivelAntes, nivelDoHistorico, nivelEstimado), nivelMaximoPelaCampanha(recorde));
  if (nivel > nivelAntes) colocarNoNivel(estado, nivel);

  c.fasesConcluidas = recorde;
  r.melhorFaseDeTodas = recorde;
  if (reconstruindo) c.faseAtual = Math.max(0, recorde);
  delete c.inicioDaVida;
  estado.maestria = 0;
  return { recorde, fasesDaVida, nivelAntes, nivelDepois: indiceNivel(estado), reencarnacoes: r.vezes ?? 0, reconstruindo };
}

// Compara versões no formato "0.3.0". Ex.: versaoMenorQue('0.3.0', '0.4.0') → true
function versaoMenorQue(versao, outra) {
  const a = String(versao || '0').split('.').map(Number);
  const b = outra.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if ((a[i] || 0) !== (b[i] || 0)) return (a[i] || 0) < (b[i] || 0);
  }
  return false;
}

export function apagarSave() {
  localStorage.removeItem(CHAVE_DO_SAVE);
}

// Quantos segundos o jogador ficou fora (limitado pelo máximo do config)
export function segundosOffline(estado, instante = Date.now()) {
  if (typeof instante !== 'number' || !Number.isFinite(instante) || instante < 0) throw new RangeError('Instante inválido para calcular tempo offline.');
  const segundos = (instante - estado.ultimoSave) / 1000;
  const maximo = CONFIG.maxHorasOffline * 3600;
  return Math.max(0, Math.min(segundos, maximo));
}
