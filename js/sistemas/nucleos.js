// =============================================================
// sistemas/nucleos.js — NÚCLEOS (pontos permanentes de atributo)
//
// Ao vencer inimigos do Mapa 3 em diante, pode cair um Núcleo:
//   Rank Baixo = 1 ponto · Rank Médio = 5 pontos · Rank Alto = 20 pontos
// Na aba Personagem, o "+" ao lado de Ataque, Vitalidade, Defesa e
// Velocidade usa um núcleo guardado: cada ponto = +1% naquele atributo.
// Núcleos guardados e pontos usados ficam para sempre (também ao reencarnar).
// =============================================================
import { CONFIG } from '../config.js';

const N = CONFIG.nucleos;
export const TIPOS_DE_NUCLEO = N.tipos;
export const NUCLEO_POR_ID = Object.fromEntries(N.tipos.map(t => [t.id, t]));
export const ATRIBUTOS_DE_NUCLEO = N.atributos;

export function podeUsarNucleoEm(atributo) {
  return N.atributos.includes(atributo);
}

// Quantos núcleos deste tipo estão guardados
export function quantidade(estado, tipo) {
  return estado.nucleos?.[tipo] ?? 0;
}

export function temAlgumNucleo(estado) {
  return N.tipos.some(t => quantidade(estado, t.id) > 0);
}

// Pontos já usados num atributo
export function pontosEm(estado, atributo) {
  return estado.pontosNucleo?.[atributo] ?? 0;
}

// Multiplicador do atributo: 12 pontos → 1.12
export function multiplicadorNucleo(estado, atributo) {
  return 1 + pontosEm(estado, atributo) * N.bonusPorPonto;
}

// Sorteia um núcleo ao vencer (no máximo 1 por vitória). Devolve o tipo ou null.
export function tentarNucleo(estado, fase) {
  if (fase.mapa + 1 < N.mapaMinimo) return null;
  let sorte = Math.random();
  // Do mais raro para o mais comum
  for (const tipo of [...N.tipos].reverse()) {
    if (sorte < tipo.chance) {
      estado.nucleos[tipo.id] = quantidade(estado, tipo.id) + 1;
      return tipo;
    }
    sorte -= tipo.chance;
  }
  return null;
}

// Usa núcleos guardados num atributo (padrão 1; Infinity = todos daquele tipo).
// Devolve quantos foram usados (0 = nenhum).
export function usarNucleo(estado, tipo, atributo, vezes = 1) {
  if (!podeUsarNucleoEm(atributo)) return 0;
  const usados = Math.min(quantidade(estado, tipo), vezes);
  if (usados <= 0) return 0;
  estado.nucleos[tipo] -= usados;
  estado.pontosNucleo[atributo] = pontosEm(estado, atributo) + usados * NUCLEO_POR_ID[tipo].pontos;
  return usados;
}
