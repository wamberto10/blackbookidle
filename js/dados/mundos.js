// =============================================================
// dados/mundos.js — LISTA DE MUNDOS
// Mundos com mapas são jogáveis (os mapas seguem uma numeração única:
// Mundo 1 = Mapas 1–12, Mundo 2 = Mapas 13–24). Os outros aparecem
// bloqueados para mostrar que existe algo além do horizonte.
// =============================================================
import { MUNDO_INICIAL } from './mundo1.js';
import { MUNDO_TONG_XUAN } from './mundo2.js';

export const MUNDOS = [
  MUNDO_INICIAL,
  MUNDO_TONG_XUAN,
  { id: 'heng_luo',   nome: 'Céu Estrelado — Heng Luo Star Field', mapas: [] },
  { id: 'shadowed',   nome: 'Shadowed Star',                   mapas: [] },
  { id: 'superiores', nome: 'Mundos Superiores',               mapas: [] },
];
