// =============================================================
// sistemas/mundo.js — MAPAS E FASES
// Transforma os dados dos mundos (dados/mundo1.js, mundo2.js...) em uma lista única de fases
// (Mundo 1 = fases 0–143, Mundo 2 = 144–287), calculando a força de cada inimigo e suas recompensas.
// =============================================================
import { CONFIG } from '../config.js';
import { MUNDOS } from '../dados/mundos.js';
import { REINOS } from '../dados/reinos.js';
import { TIPOS_DE_FASE, ESTRUTURA_DO_MAPA } from '../dados/fases.js';
import { inicioDoReino, producaoNoNivel } from './progressao.js';
import { atributosBase, calcularAtributos } from './atributos.js';
import { definirInicioDaVida } from './blackbook.js';

const FASES_POR_MAPA = CONFIG.combate.fasesPorMapa;

// Mundos jogáveis (com mapas). Os mapas de todos eles ficam numa lista só:
// Mundo 1 = Mapas 1–12 (índices 0–11), Mundo 2 = Mapas 13–24 (índices 12–23)...
export const MUNDOS_JOGAVEIS = MUNDOS.filter(m => m.mapas.length > 0);
export const MUNDO = MUNDOS[0];   // Mundo Inicial (mensagem de boas-vindas)
export const MAPAS = [];
MUNDOS_JOGAVEIS.forEach((mundo, indiceMundo) => {
  for (const mapa of mundo.mapas) { mapa.mundo = indiceMundo; MAPAS.push(mapa); }
});
export const FASES = []; // lista com todas as fases de todos os mundos, em ordem

MAPAS.forEach((mapa, indiceMapa) => {
  // Mapas do mesmo reino dividem os estágios entre si.
  // Ex.: Mapas 1 e 2 são do Elemento Inicial: o Mapa 1 cobre o começo, o Mapa 2 o final.
  const mapasDoMesmoReino = MAPAS.filter(outro => outro.reino === mapa.reino);
  const posicaoDoMapa = mapasDoMesmoReino.indexOf(mapa);
  const totalDeFasesNoReino = mapasDoMesmoReino.length * FASES_POR_MAPA;
  const estagiosDoReino = REINOS[mapa.reino].estagios.length;
  // Alguns mapas começam no meio do reino (ex.: Mapa 1 começa no 5º estágio do Corpo Temperado)
  const inicio = mapa.inicioNoReino ?? 0;

  mapa.fases.forEach((dados, indiceNoMapa) => {
    const chaveTipo = ESTRUTURA_DO_MAPA[indiceNoMapa];
    const tipo = TIPOS_DE_FASE[chaveTipo];
    const indice = indiceMapa * FASES_POR_MAPA + indiceNoMapa;

    // Em que "nível" de cultivo esta fase foi pensada para ser jogada
    const progresso = (posicaoDoMapa * FASES_POR_MAPA + indiceNoMapa) / (totalDeFasesNoReino - 1);
    const nivelReferencia = inicioDoReino(mapa.reino) + inicio +
      progresso * CONFIG.combate.fracaoDoReino * (estagiosDoReino - 1 - inicio);
    const referencia = atributosBase(nivelReferencia, mapa.reino);
    // Cada mapa é um pouco mais difícil que o anterior (ver config: dificuldadePorMapa)
    const dificuldade = Math.pow(CONFIG.combate.dificuldadePorMapa, indiceMapa);

    FASES.push({
      indice,
      mapa: indiceMapa,
      mundo: mapa.mundo,
      numero: indiceNoMapa + 1,
      // última fase de um mundo (o chefe que abre o próximo mundo)
      ultimaDoMundo: indiceNoMapa === FASES_POR_MAPA - 1 && MAPAS[indiceMapa + 1]?.mundo !== mapa.mundo,
      local: dados.local,
      chaveTipo,
      tipo,
      referencia,   // atributos de um cultivador comum neste ponto (base dos itens que caem aqui)
      inimigo: {
        nome: dados.inimigo,
        forma: dados.forma,
        vida: referencia.ataque * tipo.vida * dificuldade,
        ataque: referencia.ataque * tipo.ataque * dificuldade,
        defesa: referencia.ataque * tipo.defesa * dificuldade,
        velocidade: referencia.velocidade * tipo.velocidade,
        sentidoDivino: referencia.sentidoDivino * dificuldade,   // para a Supressão de Alma
      },
      recompensa: {
        cultivo: producaoNoNivel(nivelReferencia, mapa.reino) * tipo.cultivo,
        pedras: Math.ceil(tipo.pedras * Math.pow(CONFIG.combate.crescimentoPedras, indice) * CONFIG.combate.multiplicadorPedras),
      },
    });
  });
});

// ---- Consultas ----
export function faseLiberada(estado, indice) {
  return indice >= 0 && indice < FASES.length && indice <= estado.combate.fasesConcluidas + 1;
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
  return FASES[indiceMapa * FASES_POR_MAPA + FASES_POR_MAPA - 1];
}

// ---- Mundos ----
// Índice da primeira e da última fase de um mundo (0 = Mundo 1)
export function primeiraFaseDoMundo(indiceMundo) {
  return FASES.findIndex(fase => fase.mundo === indiceMundo);
}
export function ultimaFaseDoMundo(indiceMundo) {
  return FASES.findLastIndex(fase => fase.mundo === indiceMundo);
}
export function mundoDoMapa(indiceMapa) {
  return MUNDOS_JOGAVEIS[MAPAS[indiceMapa].mundo];
}
export function mapasDoMundo(indiceMundo) {
  return MAPAS.map((mapa, indice) => indice).filter(indice => MAPAS[indice].mundo === indiceMundo);
}

// O jogador já venceu o chefe final do mundo NESTA vida? (0 = Mundo 1)
export function mundoConcluido(estado, indiceMundo = 0) {
  return estado.combate.fasesConcluidas >= ultimaFaseDoMundo(indiceMundo);
}

// Já venceu o chefe final do mundo em QUALQUER vida? (decide onde começa a vida nova)
export function mundoJaZerado(estado, indiceMundo = 0) {
  const melhor = Math.max(estado.combate.fasesConcluidas, estado.reencarnacao.melhorFaseDeTodas);
  return melhor >= ultimaFaseDoMundo(indiceMundo);
}

// ---- Onde começa cada vida nova (reencarnação) ----
// Mundo onde a próxima vida começa.
// v0.11.2 (dono): TODA vida recomeça no Mundo 1 (Mapa 1, Corpo Temperado); o Mundo 2 só é
// alcançado zerando o Mundo 1 de novo. (Na v0.10.0 quem já tinha zerado o Mundo 1 recomeçava
// no Santo, Mapa 13 — o dono achou que o cultivo "pulava" para o Santo.)
// Para voltar à regra antiga: devolver o mundo mais avançado já zerado + 1 (ver mundoJaZerado).
export function mundoDeInicio(estado) {
  return 0;
}

// Texto de onde a próxima vida começa. Ex.: "Santo — 1º Estágio, no Mapa 13 (Fronteira de Tong Xuan)"
export function textoDoInicioDaVida(estado) {
  const indiceMapa = FASES[primeiraFaseDoMundo(mundoDeInicio(estado))].mapa;
  const mapa = MAPAS[indiceMapa];
  const reino = REINOS[indiceMapa === 0 ? 0 : mapa.reino];
  const estagio = indiceMapa === 0 ? 0 : (mapa.inicioNoReino ?? 0);
  return `${reino.nome} — ${reino.estagios[estagio]}, no Mapa ${indiceMapa + 1} (${mapa.nome})`;
}

// Coloca a vida nova no começo do mundo certo: reino e estágio do 1º mapa dele
// (Mundo 2 = Santo, 1º estágio) e as fases dos mundos anteriores já vencidas.
// (O Mundo 1 continua começando do Corpo Temperado, 1º estágio, como sempre.)
function comecarVidaNova(novo, anterior) {
  // "A alma se lembra" (v0.12.0): o Sentido Divino é força da alma, não do corpo — guarda o maior já alcançado
  novo.reencarnacao.sentidoDivinoMaximo = Math.max(anterior.reencarnacao.sentidoDivinoMaximo ?? 0,
    calcularAtributos(anterior).sentidoDivino);
  const indiceMundo = mundoDeInicio(anterior);
  if (indiceMundo === 0) return;
  const primeira = primeiraFaseDoMundo(indiceMundo);
  const mapa = MAPAS[FASES[primeira].mapa];
  novo.reino = mapa.reino;
  novo.estagio = mapa.inicioNoReino ?? 0;
  novo.combate.fasesConcluidas = primeira - 1;
  novo.combate.faseAtual = primeira;
  novo.combate.inicioDaVida = primeira - 1;
}
definirInicioDaVida(comecarVidaNova);
