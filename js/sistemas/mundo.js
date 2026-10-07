// =============================================================
// sistemas/mundo.js — MAPAS E FASES
// Transforma os dados de dados/mundo1.js em uma lista de 144 fases,
// calculando a força de cada inimigo e suas recompensas.
// =============================================================
import { CONFIG } from '../config.js';
import { MUNDOS } from '../dados/mundos.js';
import { REINOS } from '../dados/reinos.js';
import { TIPOS_DE_FASE, ESTRUTURA_DO_MAPA } from '../dados/fases.js';
import { inicioDoReino, producaoNoNivel } from './progressao.js';
import { atributosBase } from './atributos.js';

const FASES_POR_MAPA = CONFIG.combate.fasesPorMapa;

export const MUNDO = MUNDOS[0];
export const MAPAS = MUNDO.mapas;
export const FASES = []; // lista com todas as fases do mundo, em ordem

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
      numero: indiceNoMapa + 1,
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
      },
      recompensa: {
        cultivo: producaoNoNivel(nivelReferencia, mapa.reino) * tipo.cultivo,
        pedras: Math.ceil(tipo.pedras * Math.pow(CONFIG.combate.crescimentoPedras, indice)),
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

export function mundoConcluido(estado) {
  return estado.combate.fasesConcluidas >= FASES.length - 1;
}
