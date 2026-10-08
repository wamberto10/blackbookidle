// =============================================================
// sistemas/desbloqueios.js — QUANDO CADA SISTEMA É LIBERADO
// O reino e o estágio de cada desbloqueio ficam em CONFIG.desbloqueios
// =============================================================
import { CONFIG } from '../config.js';
import { indiceNivel, inicioDoReino } from './progressao.js';

// Nível global em que um sistema é liberado (ex.: 5º estágio do Corpo Temperado = 4)
export function nivelDeDesbloqueio(sistema) {
  const { reino, estagio } = CONFIG.desbloqueios[sistema];
  return inicioDoReino(reino) + estagio;
}

// Ex.: liberado(estado, 'mochila') → true se o jogador já chegou lá
export function liberado(estado, sistema) {
  // Depois da primeira reencarnação, tudo fica aberto desde o começo da vida nova
  // (Combate, Mapa, Mochila e Black Book — decisão do dono)
  if (estado.reencarnacao.vezes > 0) return true;
  return indiceNivel(estado) >= nivelDeDesbloqueio(sistema);
}

// O jogador acabou de chegar exatamente no nível que libera este sistema?
// (depois de reencarnar já está tudo liberado, então não avisa de novo)
export function acabouDeLiberar(estado, sistema) {
  return estado.reencarnacao.vezes === 0 && indiceNivel(estado) === nivelDeDesbloqueio(sistema);
}
