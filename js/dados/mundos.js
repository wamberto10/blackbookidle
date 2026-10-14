// =============================================================
// dados/mundos.js — LISTA DE MUNDOS
// Mundos com mapas são jogáveis (os mapas seguem uma numeração única:
// Mundo 1 = Mapas 1–12, Mundo 2 = Mapas 13–24, Mundo 3 = Mapas 25–36, Mundo 4 = Mapas 37–48, Mundo 5 = Mapas 49–60). Os outros aparecem
// bloqueados para mostrar que existe algo além do horizonte.
// =============================================================
import { MUNDO_INICIAL } from './mundo1.js';
import { MUNDO_TONG_XUAN } from './mundo2.js';
import { MUNDO_HENG_LUO } from './mundo3.js';
import { MUNDO_LIMITE_ESTELAR } from './mundo4.js';
import { MUNDO_MUNDOS_SUPERIORES } from './mundo5.js';

export const MUNDOS = [
  MUNDO_INICIAL,
  MUNDO_TONG_XUAN,
  MUNDO_HENG_LUO,
  MUNDO_LIMITE_ESTELAR,
  MUNDO_MUNDOS_SUPERIORES,
  { id: 'universo_exterior', nome: 'Universo Exterior',     mapas: [] },
];
