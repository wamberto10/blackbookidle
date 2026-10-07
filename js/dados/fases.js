// =============================================================
// dados/fases.js — TIPOS DE FASE E ESTRUTURA DE CADA MAPA
//
// Os valores dos inimigos são MULTIPLICADORES do Ataque que um
// cultivador "normal" teria no nível daquela fase. Assim a dificuldade
// acompanha sozinha a força do jogador, do 1º ao último mapa.
//   vida       → Vida do inimigo = Ataque de referência × vida
//   ataque     → Ataque do inimigo = Ataque de referência × ataque
//   defesa     → Defesa do inimigo = Ataque de referência × defesa
//   velocidade → Velocidade do inimigo = Velocidade de referência × velocidade
//                (só decide quem ataca primeiro em cada turno)
//   cultivo    → recompensa = X segundos de produção de Cultivo
//                (uma luta dura ~6 s; 1,5 s por vitória comum ≈ +25% sobre o cultivo parado)
//   pedras     → Pedras Espirituais base (crescem a cada fase, ver config.js)
// =============================================================

// icone = emoji usado nas mensagens | sprite = ícone em pixel art (img/icones/)
export const TIPOS_DE_FASE = {
  comum:         { nome: 'Comum',          icone: '🗡️', sprite: 'fase_comum',          vida: 4,  ataque: 0.4, defesa: 0.2,  velocidade: 0.8,  cultivo: 1.5, pedras: 1 },
  elite:         { nome: 'Elite',          icone: '⭐', sprite: 'fase_elite',          vida: 8,  ataque: 0.6, defesa: 0.3,  velocidade: 1.0,  cultivo: 3,   pedras: 3 },
  intermediario: { nome: 'Intermediário',  icone: '⚔️', sprite: 'fase_intermediario',  vida: 6,  ataque: 0.5, defesa: 0.25, velocidade: 0.9,  cultivo: 2,   pedras: 2 },
  eliteAvancada: { nome: 'Elite Avançada', icone: '🌟', sprite: 'fase_elite_avancada', vida: 10, ataque: 0.7, defesa: 0.35, velocidade: 1.05, cultivo: 4,   pedras: 5 },
  especialista:  { nome: 'Especialista',   icone: '🥋', sprite: 'fase_especialista',   vida: 9,  ataque: 0.7, defesa: 0.3,  velocidade: 1.1,  cultivo: 3.5, pedras: 4 },
  miniChefe:     { nome: 'Mini-Chefe',     icone: '👹', sprite: 'fase_mini_chefe',     vida: 14, ataque: 0.8, defesa: 0.4,  velocidade: 1.05, cultivo: 8,   pedras: 8 },
  chefe:         { nome: 'Chefe',          icone: '💀', sprite: 'fase_chefe',          vida: 18, ataque: 0.8, defesa: 0.35, velocidade: 1.1,  cultivo: 15,  pedras: 15 },
};

// Ordem dos tipos nas 12 fases de TODO mapa
export const ESTRUTURA_DO_MAPA = [
  'comum', 'comum', 'comum',                       // fases 1–3
  'elite',                                         // fase 4
  'intermediario', 'intermediario', 'intermediario', // fases 5–7
  'eliteAvancada',                                 // fase 8
  'especialista', 'especialista',                  // fases 9–10
  'miniChefe',                                     // fase 11
  'chefe',                                         // fase 12
];
