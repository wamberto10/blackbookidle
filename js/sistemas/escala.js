// =============================================================
// sistemas/escala.js — POSIÇÃO GLOBAL E CURVAS DA PROGRESSÃO CONTÍNUA (v0.32.0)
//
// A campanha é uma linha só: Fácil (mapas globais 1–96) → Normal (97–192) → Difícil (193–288) →
// Inferno (289–384) → Infinito (385 em diante, para sempre). Cada dificuldade reaproveita os 96 mapas do Fácil.
//   mapa global g  → 0 = Fácil, Mapa 1 · 96 = Normal, Mapa 1 · 384 = Infinito, Mapa 1
//   mapa visual    → g % 96 (qual dos 96 mapas desenhados: nome, arte, inimigos)
//   fase global    → g × 12 + fase local (0 a 11)
// Só depende do CONFIG (sem ciclos de import): mundo.js, itens.js, blackbook.js e as telas usam daqui.
// v0.33.0: sem teto de escala — as curvas continuam crescendo no Infinito; os valores grandes usam js/numeros.js.
// =============================================================
import { CONFIG } from '../config.js';
import { deLn, potencia } from '../numeros.js';

const PG = CONFIG.progressao;
export const FASES_POR_MAPA = CONFIG.combate.fasesPorMapa;
export const MAPAS_POR_DIFICULDADE = PG.mapasPorDificuldade;
export const DIFICULDADES = PG.dificuldades;
export const ULTIMA_DIFICULDADE = DIFICULDADES.length - 1;   // Infinito
export const FASES_DO_FACIL = MAPAS_POR_DIFICULDADE * FASES_POR_MAPA;   // 1152 (fases globais 0–1151)

// ---- Posição ----
export const mapaDaFase = (indiceFase) => Math.floor(indiceFase / FASES_POR_MAPA);
export const faseLocal = (indiceFase) => indiceFase % FASES_POR_MAPA;            // 0 a 11
export const mapaVisual = (mapaGlobal) => mapaGlobal % MAPAS_POR_DIFICULDADE;   // 0 a 95
export const cicloDoMapa = (mapaGlobal) => Math.floor(mapaGlobal / MAPAS_POR_DIFICULDADE);
export const dificuldadeDoMapa = (mapaGlobal) => Math.min(cicloDoMapa(mapaGlobal), ULTIMA_DIFICULDADE);
export const primeiroMapaDaDificuldade = (indiceDificuldade) => indiceDificuldade * MAPAS_POR_DIFICULDADE;

// Número do mapa DENTRO da dificuldade (1 a 96; no Infinito continua contando: 97, 98...)
export function numeroNaDificuldade(mapaGlobal) {
  return mapaGlobal - primeiroMapaDaDificuldade(dificuldadeDoMapa(mapaGlobal)) + 1;
}

// "Normal — Mapa 12" · "Fácil — Mapa 96" · "Infinito — Mapa 140"
export function nomeDaPosicao(mapaGlobal) {
  return `${DIFICULDADES[dificuldadeDoMapa(mapaGlobal)].nome} — Mapa ${numeroNaDificuldade(mapaGlobal)}`;
}

// ---- Curvas depois do Fácil ----
// Soma dos ln(crescimento por mapa) de "chave" ao longo de x mapas depois do fim do Fácil (x pode ser fracionário:
// a Essência e as Pedras crescem fase a fase). Cada trecho de 96 mapas usa o valor da sua dificuldade; o Infinito
// repete o último, para sempre (v0.33.0: o teto de escala saiu; o resultado é um ln, sempre um número comum).
export function somaLog(chave, mapasDepoisDoFacil) {
  const x = Math.max(0, mapasDepoisDoFacil);
  let total = 0;
  for (let d = 1; d <= ULTIMA_DIFICULDADE; d++) {
    const inicio = (d - 1) * MAPAS_POR_DIFICULDADE;
    if (x <= inicio) break;
    const fim = d === ULTIMA_DIFICULDADE ? Infinity : inicio + MAPAS_POR_DIFICULDADE;
    total += (Math.min(x, fim) - inicio) * Math.log(DIFICULDADES[d][chave]);
  }
  return total;
}

// ---- Essência de referência de uma fase (E) ----
// Fácil: a curva antiga do Black Book (blackbook.recompensa) com F = fase global + 1.
// Normal em diante: continua do fim do Fácil, × progressao.dificuldades[].essencia por mapa (fase a fase).
// Devolve o ln (os números passam de 1e100 no Infinito).
export function lnEssenciaDeReferencia(indiceFase) {
  const R = CONFIG.blackbook.recompensa;
  const lnFacil = (F) => Math.log(R.base * F) + Math.min(F, R.faseDaVirada) * Math.log(R.crescimento) +
    Math.max(0, F - R.faseDaVirada) * Math.log(R.crescimentoDepois);
  if (indiceFase < 0) return -Infinity;
  if (indiceFase < FASES_DO_FACIL) return lnFacil(indiceFase + 1);
  return lnFacil(FASES_DO_FACIL) + somaLog('essencia', (indiceFase - (FASES_DO_FACIL - 1)) / FASES_POR_MAPA);
}

// ---- Pedras Espirituais de um patamar ----
// Fácil: 1,05 por fase (como antes). Normal em diante: × progressao.dificuldades[].pedras por mapa.
// Usado nas Pedras por vitória, no custo de melhoria e nas Pedras ao desmanchar (mesmo patamar = mesma escala).
// Devolve número grande (js/numeros.js).
export function fatorDePedras(indiceFase) {
  const lnCrescimento = Math.log(CONFIG.combate.crescimentoPedras);
  if (indiceFase < FASES_DO_FACIL) return deLn(Math.max(0, indiceFase) * lnCrescimento);
  return deLn((FASES_DO_FACIL - 1) * lnCrescimento + somaLog('pedras', (indiceFase - (FASES_DO_FACIL - 1)) / FASES_POR_MAPA));
}

// ---- Força dos itens de um patamar (v0.32.0: o item vira % sobre o cultivo) — número grande ----
export function fatorDoItem(mapaGlobal) {
  return potencia(CONFIG.equipamentos.crescimentoPorMapa, Math.max(0, mapaGlobal));
}
