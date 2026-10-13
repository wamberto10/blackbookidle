// =============================================================
// dados/mundos.js — LISTA DE MUNDOS
// Mundos com mapas são jogáveis (os mapas seguem uma numeração única:
// Mundo 1 = Mapas 1–12, Mundo 2 = Mapas 13–24, Mundo 3 = Mapas 25–36). Os outros aparecem
// bloqueados para mostrar que existe algo além do horizonte.
// =============================================================
import { MUNDO_INICIAL } from './mundo1.js';
import { MUNDO_TONG_XUAN } from './mundo2.js';
import { MUNDO_HENG_LUO } from './mundo3.js';

export const MUNDOS = [
  MUNDO_INICIAL,
  MUNDO_TONG_XUAN,
  MUNDO_HENG_LUO,
  { id: 'shadowed',   nome: 'Shadowed Star',                   mapas: [] },
  { id: 'superiores', nome: 'Mundos Superiores',               mapas: [] },
];
