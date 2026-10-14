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
// v0.21.2 (balanço dos inimigos): a força (vida × ataque) subia aos saltos dentro do mapa — Elite ×2 sobre o
// Comum e mais forte que os Intermediários depois dela; Elite Avançada ×2,3 (a maior parede: 122 derrotas por
// partida no robô) e mais forte que os Especialistas; Mini-Chefe ×1,8; e o Chefe só ×1,3 (31 derrotas).
// Agora cada tipo é um degrau acima do anterior e o maior degrau é o Chefe (é ele que libera o reino).
// Comum e Chefe não mudaram. Antes: elite 6.5/0.5/0.25 · eliteAvancada 10/0.7/0.35 · especialista 9/0.7/0.3 ·
// miniChefe 14/0.8/0.4 (vida/ataque/defesa).
export const TIPOS_DE_FASE = {
  comum:         { nome: 'Comum',          icone: '🗡️', sprite: 'fase_comum',          vida: 4,   ataque: 0.4,  defesa: 0.2,  velocidade: 0.8,  cultivo: 1.5, pedras: 1 },
  elite:         { nome: 'Elite',          icone: '⭐', sprite: 'fase_elite',          vida: 5.2, ataque: 0.45, defesa: 0.22, velocidade: 0.95, cultivo: 3,   pedras: 3 },
  intermediario: { nome: 'Intermediário',  icone: '⚔️', sprite: 'fase_intermediario',  vida: 6,   ataque: 0.5,  defesa: 0.25, velocidade: 0.9,  cultivo: 2,   pedras: 2 },
  eliteAvancada: { nome: 'Elite Avançada', icone: '🌟', sprite: 'fase_elite_avancada', vida: 7.5, ataque: 0.58, defesa: 0.28, velocidade: 1.05, cultivo: 4,   pedras: 5 },
  especialista:  { nome: 'Especialista',   icone: '🥋', sprite: 'fase_especialista',   vida: 8.5, ataque: 0.63, defesa: 0.3,  velocidade: 1.1,  cultivo: 3.5, pedras: 4 },
  miniChefe:     { nome: 'Mini-Chefe',     icone: '👹', sprite: 'fase_mini_chefe',     vida: 11,  ataque: 0.72, defesa: 0.32, velocidade: 1.05, cultivo: 8,   pedras: 8 },
  chefe:         { nome: 'Chefe',          icone: '💀', sprite: 'fase_chefe',          vida: 18,  ataque: 0.8,  defesa: 0.35, velocidade: 1.1,  cultivo: 15,  pedras: 15 },
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
