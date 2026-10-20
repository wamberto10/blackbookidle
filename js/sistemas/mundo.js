// =============================================================
// sistemas/mundo.js — MAPAS E FASES
// Transforma os dados dos mundos (dados/mundo1.js, mundo2.js...) nos 96 mapas DESENHADOS e nas 1152 fases do
// Fácil (Mundo 1 = fases 0–143, Mundo 2 = 144–287...), calculando a força de cada inimigo e suas recompensas.
// v0.32.0 (progressão contínua): depois do Fácil vêm Normal, Difícil, Inferno e Infinito reaproveitando os mesmos
// 96 mapas (escala.js: mapa global, mapa visual e fase local). Essas fases são geradas SOB DEMANDA (obterFase),
// com inimigos e recompensas do patamar global — nunca existe uma lista infinita pronta.
// =============================================================
import { CONFIG } from '../config.js';
import { MUNDOS } from '../dados/mundos.js';
import { REINOS } from '../dados/reinos.js';
import { TIPOS_DE_FASE, ESTRUTURA_DO_MAPA } from '../dados/fases.js';
import { inicioDoReino, producaoNoNivel, batismosMundiais, NIVEL_DO_FRUTO } from './progressao.js';
import { atributosBase, SELO } from './atributos.js';
import { FASES_POR_MAPA, MAPAS_POR_DIFICULDADE, FASES_DO_FACIL, DIFICULDADES, mapaDaFase, faseLocal, mapaVisual,
  dificuldadeDoMapa, primeiroMapaDaDificuldade, somaLog, fatorDePedras } from './escala.js';
import { multiplicar, razao, deLn, arredondarParaCima } from '../numeros.js';
// v0.33.0: a força dos inimigos e as recompensas são NÚMEROS GRANDES (js/numeros.js) — no Infinito passam de 1e308

// Mundos jogáveis (com mapas). Os mapas de todos eles ficam numa lista só:
// Mundo 1 = Mapas 1–12 (índices 0–11), Mundo 2 = Mapas 13–24 (índices 12–23)...
// v0.32.0: MAPAS = os 96 mapas desenhados (índice = mapa VISUAL). Para um mapa global, use mapaDesenhado(g).
export const MUNDOS_JOGAVEIS = MUNDOS.filter(m => m.mapas.length > 0);
export const MUNDO = MUNDOS[0];   // Mundo Inicial (mensagem de boas-vindas)
export const MAPAS = [];
MUNDOS_JOGAVEIS.forEach((mundo, indiceMundo) => {
  for (const mapa of mundo.mapas) { mapa.mundo = indiceMundo; MAPAS.push(mapa); }
});
export const MUNDOS_POR_DIFICULDADE = MUNDOS_JOGAVEIS.length;   // 8
const MAPAS_POR_MUNDO = MAPAS_POR_DIFICULDADE / MUNDOS_POR_DIFICULDADE;   // 12
const FASES_POR_MUNDO = MAPAS_POR_MUNDO * FASES_POR_MAPA;               // 144
export const FASES = []; // as 1152 fases do Fácil (fases globais 0–1151), em ordem. As outras: obterFase(indice)

// Dificuldade acumulada de cada mapa: cada mapa multiplica pela dificuldade do SEU mundo
// (v0.21.2: CONFIG.combate.dificuldadePorMundo; antes era 1,31 por mapa em todos os mundos)
const dificuldadeDoMapaFacil = [];
MAPAS.forEach((mapa, indiceMapa) => {
  const porMapa = CONFIG.combate.dificuldadePorMundo?.[mapa.mundo] ?? CONFIG.combate.dificuldadePorMapa;
  dificuldadeDoMapaFacil.push(indiceMapa === 0 ? 1 : dificuldadeDoMapaFacil[indiceMapa - 1] * porMapa);
});

// v0.26.0: força de um jogador "comum" num nível (base × bônus de reino só do jogador × Batismos).
// Mede quanto o Selo do Mundo Primordial tira de quem luta num mapa selado.
function forcaDoJogador(nivel, reino) {
  const A = CONFIG.atributos;
  const base = atributosBase(nivel, reino);
  const batismo = 1 + batismosMundiais({ reino }) * CONFIG.batismo.bonusPorBatismo;
  return { ataque: multiplicar(base.ataque, Math.pow(A.bonusPorReinoJogador / A.bonusPorReino, reino) * batismo), velocidade: base.velocidade };
}
const FORCA_SELADA = forcaDoJogador(SELO.nivel, SELO.reino);

MAPAS.forEach((mapa, indiceMapa) => {
  // Mapas do mesmo reino dividem os estágios entre si.
  // Ex.: Mapas 1 e 2 são do Elemento Inicial: o Mapa 1 cobre o começo, o Mapa 2 o final.
  // v0.22.0: um reino que atravessa mundos é dividido em faixas (inicioNoReino/fimNoReino no mapa):
  // os Mapas 43–48 cobrem só a 1ª–3ª Ordem do Céu Aberto, e os mapas futuros as outras.
  const mesmaFaixa = (outro) => outro.reino === mapa.reino && (outro.fimNoReino ?? null) === (mapa.fimNoReino ?? null);
  const mapasDoMesmoReino = MAPAS.filter(mesmaFaixa);
  const posicaoDoMapa = mapasDoMesmoReino.indexOf(mapa);
  const totalDeFasesNoReino = mapasDoMesmoReino.length * FASES_POR_MAPA;
  const estagiosDoReino = REINOS[mapa.reino].estagios.length;
  // Alguns mapas começam no meio do reino (ex.: Mapa 1 começa no 5º estágio do Corpo Temperado)
  const inicio = mapa.inicioNoReino ?? 0;
  const fim = mapa.fimNoReino ?? estagiosDoReino - 1;

  mapa.fases.forEach((dados, indiceNoMapa) => {
    const chaveTipo = ESTRUTURA_DO_MAPA[indiceNoMapa];
    const tipo = TIPOS_DE_FASE[chaveTipo];
    const indice = indiceMapa * FASES_POR_MAPA + indiceNoMapa;

    // Em que "nível" de cultivo esta fase foi pensada para ser jogada
    const progresso = (posicaoDoMapa * FASES_POR_MAPA + indiceNoMapa) / (totalDeFasesNoReino - 1);
    const nivelReferencia = inicioDoReino(mapa.reino) + inicio +
      progresso * CONFIG.combate.fracaoDoReino * (fim - inicio);
    const referencia = atributosBase(nivelReferencia, mapa.reino);
    // Cada mapa é um pouco mais difícil que o anterior (ver config: dificuldadePorMapa / dificuldadePorMundo)
    const dificuldade = dificuldadeDoMapaFacil[indiceMapa];
    const inimigo = {
      nome: dados.inimigo,
      forma: dados.forma,
      vida: multiplicar(referencia.ataque, tipo.vida * dificuldade),
      ataque: multiplicar(referencia.ataque, tipo.ataque * dificuldade),
      defesa: multiplicar(referencia.ataque, tipo.defesa * dificuldade),
      // v0.21.2: a Velocidade também cresce um pouco por mapa (antes não crescia: no Mundo 3 o jogador
      // ficava ~10× mais rápido que os chefes e o ataque duplo valia sempre)
      velocidade: multiplicar(referencia.velocidade, tipo.velocidade * Math.pow(CONFIG.combate.velocidadePorMapa ?? 1, indiceMapa)),
      sentidoDivino: multiplicar(referencia.sentidoDivino, dificuldade),   // para a Supressão de Alma
    };
    // v0.26.0: mapa selado — o inimigo perde a mesma fração de força que o Selo tira de um jogador deste nível
    // (× CONFIG.selo.forcaDosInimigos). O inimigo "sem selo" fica guardado para o boss do evento.
    let selado = inimigo;
    if (mapa.selado) {
      const livre = forcaDoJogador(nivelReferencia, mapa.reino);
      const fator = razao(FORCA_SELADA.ataque, livre.ataque) * CONFIG.selo.forcaDosInimigos;
      selado = {
        ...inimigo,
        vida: multiplicar(inimigo.vida, fator),
        ataque: multiplicar(inimigo.ataque, fator),
        defesa: multiplicar(inimigo.defesa, fator),
        velocidade: multiplicar(inimigo.velocidade, razao(FORCA_SELADA.velocidade, livre.velocidade)),
        sentidoDivino: multiplicar(inimigo.sentidoDivino, fator),
      };
    }

    FASES.push({
      indice,
      mapa: indiceMapa,          // mapa GLOBAL (no Fácil é igual ao visual)
      mapaVisual: indiceMapa,    // v0.32.0: qual dos 96 mapas desenhados (nome, arte e inimigos)
      dificuldade: 0,            // v0.32.0: índice em CONFIG.progressao.dificuldades (0 = Fácil)
      mundo: mapa.mundo,         // mundo GLOBAL (Fácil 0–7, Normal 8–15...)
      mundoVisual: mapa.mundo,
      numero: indiceNoMapa + 1,
      // última fase de um mundo (o chefe que abre o próximo mundo)
      ultimaDoMundo: indiceNoMapa === FASES_POR_MAPA - 1 && (indiceMapa + 1) % MAPAS_POR_MUNDO === 0,
      local: dados.local,
      chaveTipo,
      tipo,
      nivel: nivelReferencia,   // v0.21.1: nível de cultivo da fase (inimigo fraco demais dá menos Cultivo)
      reino: mapa.reino,
      referencia,   // atributos de um cultivador comum neste ponto
      selado: Boolean(mapa.selado),   // v0.26.0: Selo do Mundo Primordial
      inimigo: selado,
      inimigoSemSelo: inimigo,
      recompensa: {
        cultivo: multiplicar(producaoNoNivel(nivelReferencia, mapa.reino), tipo.cultivo),
        pedras: arredondarParaCima(multiplicar(fatorDePedras(indice), tipo.pedras * CONFIG.combate.multiplicadorPedras)),
      },
    });
  });
});

// =============================================================
// v0.32.0: FASES DEPOIS DO FÁCIL (geradas sob demanda)
// Mesmo mapa desenhado, mesmos inimigos e tipos de fase; força e recompensas do patamar GLOBAL:
//  - nível de referência: Fruto do Universo + 1 nível de Maestria a cada CONFIG.maestria.mapasPorNivel mapas
//  - dificuldade: continua do último mapa do Fácil, × progressao.dificuldades[].inimigos por mapa
//  - Pedras: escala.fatorDePedras (mais suave que no Fácil); Essência: escala.lnEssenciaDeReferencia
// O Selo do Mundo Primordial NÃO se repete (é uma exceção só do Fácil).
// =============================================================
const ULTIMO_MAPA_DO_FACIL = MAPAS_POR_DIFICULDADE - 1;
// (em ln: a dificuldade e a velocidade dos inimigos passam de 1e308 no Infinito)
const LN_DIFICULDADE_NO_FIM_DO_FACIL = Math.log(dificuldadeDoMapaFacil[ULTIMO_MAPA_DO_FACIL]);
const LN_VELOCIDADE_NO_FIM_DO_FACIL = ULTIMO_MAPA_DO_FACIL * Math.log(CONFIG.combate.velocidadePorMapa ?? 1);
const REINO_FINAL = REINOS.length - 1;
const geradas = new Map();
const LIMITE_DO_CACHE = 6000;   // fases guardadas na memória (se passar, começa de novo — elas são recalculáveis)

function gerarFase(indice) {
  const g = mapaDaFase(indice);
  const indiceNoMapa = faseLocal(indice);
  const visual = mapaVisual(g);
  const mapa = MAPAS[visual];
  const dados = mapa.fases[indiceNoMapa];
  const chaveTipo = ESTRUTURA_DO_MAPA[indiceNoMapa];
  const tipo = TIPOS_DE_FASE[chaveTipo];
  const depoisDoFacil = g - ULTIMO_MAPA_DO_FACIL;   // 1 = Normal, Mapa 1
  // v0.33.0: sem teto — a referência (Fruto + Maestria) e a dificuldade continuam crescendo no Infinito
  const nivel = NIVEL_DO_FRUTO + (g + indiceNoMapa / FASES_POR_MAPA - MAPAS_POR_DIFICULDADE) / CONFIG.maestria.mapasPorNivel;
  const referencia = atributosBase(nivel, REINO_FINAL);
  const dificuldade = deLn(LN_DIFICULDADE_NO_FIM_DO_FACIL + somaLog('inimigos', depoisDoFacil));
  const velocidade = deLn(LN_VELOCIDADE_NO_FIM_DO_FACIL + somaLog('velocidade', depoisDoFacil));
  const forca = multiplicar(referencia.ataque, dificuldade);
  const inimigo = {
    nome: dados.inimigo,
    forma: dados.forma,
    vida: multiplicar(forca, tipo.vida),
    ataque: multiplicar(forca, tipo.ataque),
    defesa: multiplicar(forca, tipo.defesa),
    velocidade: multiplicar(multiplicar(referencia.velocidade, velocidade), tipo.velocidade),
    sentidoDivino: multiplicar(referencia.sentidoDivino, dificuldade),
  };
  return {
    indice,
    mapa: g,
    mapaVisual: visual,
    dificuldade: dificuldadeDoMapa(g),
    mundo: Math.floor(g / MAPAS_POR_MUNDO),
    mundoVisual: mapa.mundo,
    numero: indiceNoMapa + 1,
    ultimaDoMundo: indiceNoMapa === FASES_POR_MAPA - 1 && (g + 1) % MAPAS_POR_MUNDO === 0,
    local: dados.local,
    chaveTipo,
    tipo,
    nivel,
    reino: REINO_FINAL,
    referencia,
    selado: false,
    inimigo,
    inimigoSemSelo: inimigo,
    recompensa: {
      cultivo: multiplicar(producaoNoNivel(nivel, REINO_FINAL), tipo.cultivo),
      pedras: arredondarParaCima(multiplicar(fatorDePedras(indice), tipo.pedras * CONFIG.combate.multiplicadorPedras)),
    },
  };
}

// Fase global → dados da fase (Fácil: a lista pronta; depois: gerada uma vez e guardada)
export function obterFase(indice) {
  if (indice < FASES_DO_FACIL) return FASES[Math.max(0, indice)];
  let fase = geradas.get(indice);
  if (!fase) {
    if (geradas.size >= LIMITE_DO_CACHE) geradas.clear();
    fase = gerarFase(indice);
    geradas.set(indice, fase);
  }
  return fase;
}

// Mapa desenhado (nome, ícone, cena, descrição) de um mapa global
export function mapaDesenhado(mapaGlobal) {
  return MAPAS[mapaVisual(mapaGlobal)];
}

// ---- Consultas ----
// v0.32.0: sem fim — a próxima fase depois da maior vencida sempre existe (o Infinito não acaba)
export function faseLiberada(estado, indice) {
  return indice >= 0 && indice <= estado.combate.fasesConcluidas + 1;
}

export function mapaLiberado(estado, indiceMapa) {
  return faseLiberada(estado, indiceMapa * FASES_POR_MAPA);
}

// Quantas fases do mapa já foram vencidas (0 a 12)
export function fasesVencidasNoMapa(estado, indiceMapa) {
  const vencidas = estado.combate.fasesConcluidas + 1 - indiceMapa * FASES_POR_MAPA;
  return Math.max(0, Math.min(FASES_POR_MAPA, vencidas));
}

export function chefeDoMapa(indiceMapa) {
  return obterFase(indiceMapa * FASES_POR_MAPA + FASES_POR_MAPA - 1);
}

// Mapa global mais longe já aberto (o da próxima fase a vencer)
export function mapaDaFronteira(estado) {
  return mapaDaFase(estado.combate.fasesConcluidas + 1);
}

// ---- Dificuldades (v0.32.0) ----
// Liberada = venceu o chefe final da dificuldade anterior (Normal: o Mapa 96 do Fácil)
export function dificuldadeLiberada(estado, indiceDificuldade) {
  return indiceDificuldade === 0 ||
    estado.combate.fasesConcluidas >= primeiroMapaDaDificuldade(indiceDificuldade) * FASES_POR_MAPA - 1;
}

// ---- Mundos ----
// Mundo GLOBAL: 0–7 = Fácil, 8–15 = Normal... (o desenho é o do mundo índice % 8)
export function primeiraFaseDoMundo(indiceMundo) {
  return indiceMundo * FASES_POR_MUNDO;
}
export function ultimaFaseDoMundo(indiceMundo) {
  return indiceMundo * FASES_POR_MUNDO + FASES_POR_MUNDO - 1;
}

// Dados do mundo global: o mundo desenhado + "dificuldade" (nome dela; o Fácil fica igual, sem o campo) e o texto final
// com o nome da dificuldade na frente. Ex.: dadosDoMundo(8) = Mundo Inicial, dificuldade 'Normal'.
const mundosGlobais = new Map();
export function dadosDoMundo(indiceMundo) {
  const desenhado = MUNDOS_JOGAVEIS[indiceMundo % MUNDOS_POR_DIFICULDADE];
  const d = dificuldadeDoMapa(indiceMundo * MAPAS_POR_MUNDO);
  if (d === 0) return desenhado;
  let mundo = mundosGlobais.get(indiceMundo);
  if (!mundo) {
    const prefixo = DIFICULDADES[d].nome;
    mundo = {
      ...desenhado,
      dificuldade: prefixo,
      final: {
        titulo: `${prefixo} — ${desenhado.final?.titulo ?? desenhado.nome}`,
        texto: `Você venceu de novo o ${desenhado.nome}, agora na dificuldade ${prefixo}. ` +
          'Seu cultivo, seus itens e o Black Book seguem com você para o próximo mundo.',
      },
    };
    mundosGlobais.set(indiceMundo, mundo);
  }
  return mundo;
}
export function mundoDoMapa(indiceMapa) {
  return dadosDoMundo(Math.floor(indiceMapa / MAPAS_POR_MUNDO));
}
export function mapasDoMundo(indiceMundo) {
  return Array.from({ length: MAPAS_POR_MUNDO }, (_, i) => indiceMundo * MAPAS_POR_MUNDO + i);
}

// O jogador já venceu o chefe final do mundo? (0 = Mundo 1 do Fácil)
export function mundoConcluido(estado, indiceMundo = 0) {
  return estado.combate.fasesConcluidas >= ultimaFaseDoMundo(indiceMundo);
}

// Já venceu o chefe final do mundo? Saves antigos: conta também o recorde das vidas antigas (a migração da
// v0.32.0 já leva esse recorde para fasesConcluidas). Num mundo zerado, todos os inimigos comuns fogem.
export function mundoJaZerado(estado, indiceMundo = 0) {
  const melhor = Math.max(estado.combate.fasesConcluidas, estado.reencarnacao?.melhorFaseDeTodas ?? -1);
  return melhor >= ultimaFaseDoMundo(indiceMundo);
}
