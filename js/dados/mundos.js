// =============================================================
// dados/mundos.js — LISTA DE MUNDOS
// Mundos com mapas são jogáveis (os mapas seguem uma numeração única:
// Mundo 1 = Mapas 1–12, Mundo 2 = Mapas 13–24, Mundo 3 = Mapas 25–36, Mundo 4 = Mapas 37–48, Mundo 5 = Mapas 49–60, Mundo 6 = Mapas 61–72, Mundo 7 = Mapas 73–84). Os outros aparecem
// bloqueados para mostrar que existe algo além do horizonte.
// =============================================================
import { MUNDO_INICIAL } from './mundo1.js';
import { MUNDO_TONG_XUAN } from './mundo2.js';
import { MUNDO_HENG_LUO } from './mundo3.js';
import { MUNDO_LIMITE_ESTELAR } from './mundo4.js';
import { MUNDO_MUNDOS_SUPERIORES } from './mundo5.js';
import { MUNDO_UNIVERSO_EXTERIOR } from './mundo6.js';
import { MUNDO_FORNO_DO_UNIVERSO } from './mundo7.js';

export const MUNDOS = [
  MUNDO_INICIAL,
  MUNDO_TONG_XUAN,
  MUNDO_HENG_LUO,
  MUNDO_LIMITE_ESTELAR,
  MUNDO_MUNDOS_SUPERIORES,
  MUNDO_UNIVERSO_EXTERIOR,
  MUNDO_FORNO_DO_UNIVERSO,
  { id: 'mundo_primordial', nome: 'Mundo Primordial — Batalha Final', mapas: [] },
];
