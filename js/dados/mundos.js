// =============================================================
// dados/mundos.js — LISTA DE MUNDOS
// Só o Mundo 1 tem mapas por enquanto. Os outros aparecem
// bloqueados para mostrar que existe algo além do horizonte.
// =============================================================
import { MUNDO_INICIAL } from './mundo1.js';

export const MUNDOS = [
  MUNDO_INICIAL,
  { id: 'tong_xuan',  nome: 'Reino Tong Xuan',                 mapas: [] },
  { id: 'heng_luo',   nome: 'Céu Estrelado — Heng Luo Star Field', mapas: [] },
  { id: 'shadowed',   nome: 'Shadowed Star',                   mapas: [] },
  { id: 'superiores', nome: 'Mundos Superiores',               mapas: [] },
];
