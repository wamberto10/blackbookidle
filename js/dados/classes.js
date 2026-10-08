// =============================================================
// dados/classes.js — AS CLASSES DE CULTIVADOR
//
//   multiplicar → +X% no atributo (0.40 = +40%, -0.10 = -10%)
//   somar       → +X pontos (crítico e dano crítico em %)
//   especial    → habilidade única da classe (usada em sistemas/combate.js)
//   efeito      → efeito visual do golpe (img/efeitos/), e a versão crítica
// =============================================================

export const CLASSES = [
  {
    id: 'corpo',
    nome: 'Refinador Corporal',
    titulo: 'Guerreiro de Corpo Físico',
    descricao:
      'Treina o corpo físico ao extremo. Prefere o combate brutal corpo a corpo em vez de lançar energia ' +
      'à distância, com força física devastadora e uma regeneração absurda.',
    // Balanceado por simulação: vence os chefes no mesmo nível que as outras classes,
    // mas mata devagar e termina as lutas com mais vida (o "tanque").
    multiplicar: { ataque: 0.20, vitalidade: 0.20, defesa: 0.10, velocidade: -0.10 },  // v0.9.4: ataque era 0.10 (farmava 27% mais devagar; agora termina o mundo no mesmo tempo)
    somar: {},
    especial: { regeneracao: 0.01 },
    nomeEspecial: 'Regeneração',
    textoEspecial: 'Recupera 1% da Vitalidade máxima a cada turno.',
    efeito: 'impacto',
    efeitoCritico: 'impacto_critico',
  },
  {
    id: 'arma',
    nome: 'Mestre da Espada',
    titulo: 'Guerreiro da Espada',
    descricao:
      'Dedicado inteiramente a dominar a intenção da espada. Com a maestria, manifesta o Qi da Espada, ' +
      'cortando defesas e o próprio espaço com facilidade.',
    multiplicar: { ataque: 0.15 },
    somar: { critico: 8, danoCritico: 30 },
    especial: { penetracao: 0.30 },
    nomeEspecial: 'Intenção da Arma',
    textoEspecial: 'Ignora 30% da Defesa do inimigo.',
    efeito: 'corte',
    efeitoCritico: 'corte_critico',
  },
  {
    id: 'elemental',
    nome: 'Cultivador Elemental',
    titulo: 'Guerreiro de Atributo Elemental',
    descricao:
      'Molda o Qi com as energias da natureza. Domina o Gelo Místico, que congela e estilhaça os inimigos ' +
      '(outros elementos chegam em atualizações futuras).',
    multiplicar: { ataque: 0.25, velocidade: 0.10, vitalidade: -0.15, defesa: -0.10 },
    somar: {},
    especial: { explosaoACada: 3, bonusExplosao: 1.0 },
    nomeEspecial: 'Explosão Elemental',
    textoEspecial: 'A cada 3 golpes, uma Explosão de Gelo com +100% de dano.',
    // Elementos que a classe usa (cada golpe usa o próximo da lista).
    // Decisão do dono (2026-10-07): por enquanto só o Gelo. Fogo e Trovão voltam numa atualização futura:
    //   { nome: 'Fogo',   efeito: 'chama',  efeitoCritico: 'chama_critica',  cor: '#ff9a3a' },
    //   { nome: 'Trovão', efeito: 'trovao', efeitoCritico: 'trovao_critico', cor: '#c8a0ff' },
    elementos: [
      { nome: 'Gelo', efeito: 'gelo', efeitoCritico: 'gelo_critico', cor: '#8ad8ff' },
    ],
    efeito: 'gelo',
    efeitoCritico: 'gelo_critico',
  },
];

export const CLASSE_POR_ID = Object.fromEntries(CLASSES.map(c => [c.id, c]));

export const SEXOS = [
  { id: 'masculino', nome: 'Masculino' },
  { id: 'feminino', nome: 'Feminino' },
];

// Usado antes de o jogador criar o personagem (ou em saves antigos)
export const PERSONAGEM_PADRAO = { nome: 'Cultivador', sexo: 'masculino', classe: 'arma' };

export const TAMANHO_DO_NOME = { minimo: 2, maximo: 16 };
