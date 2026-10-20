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
    // v0.15.3 (dono): técnica especial no 4º ATAQUE (o contador zera a cada luta), ×3 de dano
    // em todas as classes = +50% de dano em média ((1 + 1 + 1 + 3) ÷ 4). (v0.15.1: a cada 3, ×1,9 = +30%.)
    // ×5 só no Corporal (as outras seguem ×3). Comparações isoladas de ×3/×4/×5 e sementes reproduzíveis em
    // docs/PROGRESSAO_CONTINUA.md e docs/RESULTADOS_v0.33.1.md. Defesa, Vitalidade e Regeneração preservadas.
    tecnica: { nome: 'Punho do Sangue Dourado', aCada: 4, multiplicador: 5, cura: 0.08, efeito: 'tec_sangue_dourado',
      texto: 'A cada 4 ataques, um soco de 500% de dano que recupera 8% da Vitalidade.' },
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
    tecnica: { nome: 'Corte do Céu Partido', aCada: 4, multiplicador: 3, penetracao: 1, efeito: 'tec_ceu_partido',
      texto: 'A cada 4 ataques, um corte de 300% de dano que ignora toda a Defesa.' },
  },
  {
    id: 'elemental',
    nome: 'Cultivador Elemental',
    titulo: 'Guerreiro de Atributo Elemental',
    descricao:
      'Molda o Qi com as energias da natureza. Domina o Fogo Verdadeiro, que queima e atordoa os inimigos ' +
      '(outros elementos chegam em atualizações futuras).',
    multiplicar: { ataque: 0.25, velocidade: 0.10, vitalidade: -0.15, defesa: -0.10 },
    somar: {},
    especial: { explosaoACada: 3, bonusExplosao: 1.0 },
    nomeEspecial: 'Explosão Elemental',
    textoEspecial: 'A cada 3 golpes, uma Explosão de Fogo com +100% de dano.',
    // Elementos que a classe usa (cada golpe usa o próximo da lista).
    // Decisão do dono (2026-10-07): só um elemento por enquanto. 2026-10-15 (dono): o Gelo virou FOGO, como na
    // arte nova do herói (as regras não mudaram). Gelo e Trovão podem voltar numa atualização futura:
    //   { nome: 'Gelo',   efeito: 'gelo',   efeitoCritico: 'gelo_critico',   cor: '#8ad8ff' },
    //   { nome: 'Trovão', efeito: 'trovao', efeitoCritico: 'trovao_critico', cor: '#c8a0ff' },
    elementos: [
      { nome: 'Fogo', efeito: 'chama', efeitoCritico: 'chama_critica', cor: '#ff9a3a' },
    ],
    efeito: 'chama',
    efeitoCritico: 'chama_critica',
    // "congela" = o inimigo perde o próximo ataque (aqui, atordoado pelas chamas)
    tecnica: { nome: 'Corvo Dourado Forja o Sol', aCada: 4, multiplicador: 3, congela: 1, efeito: 'tec_corvo_dourado',
      texto: 'A cada 4 ataques, um sol de fogo de 300% de dano que atordoa o inimigo (ele perde o próximo ataque).' },
  },
  // v0.27.2 (dono): o Cultivador de Alma e o Alquimista (v0.13.0) foram APAGADOS do jogo — ficam só estas 3 classes.
  // Quem jogava com uma delas escolhe uma classe nova ao abrir o jogo (o resto do progresso continua).
];

// Efeitos que ainda não têm imagem usam estes até ela chegar.
// Técnicas especiais (v0.15.0): efeito exclusivo de cada uma; até a imagem chegar, o crítico da classe
export const EFEITO_PROVISORIO = {
  tec_sangue_dourado: 'impacto_critico', tec_ceu_partido: 'corte_critico', tec_corvo_dourado: 'chama_critica',
};

export const CLASSE_POR_ID = Object.fromEntries(CLASSES.map(c => [c.id, c]));

export const SEXOS = [
  { id: 'masculino', nome: 'Masculino' },
  { id: 'feminino', nome: 'Feminino' },
];

// Usado antes de o jogador criar o personagem (ou em saves antigos)
export const PERSONAGEM_PADRAO = { nome: 'Cultivador', sexo: 'masculino', classe: 'arma' };

export const TAMANHO_DO_NOME = { minimo: 2, maximo: 16 };
