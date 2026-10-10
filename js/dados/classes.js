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
    // v0.15.0: técnica especial (sistemas/tecnicas.js). Dono: 'quero que a habilidade ajude a matar' →
    // todas a cada 5 turnos, ×3,5 a ×4 (≈ +50–60% de dano em média; antes ×2,5–3 a cada 5–6 turnos ≈ +25%)
    tecnica: { nome: 'Punho do Sangue Dourado', aCada: 5, multiplicador: 4, cura: 0.15, efeito: 'impacto_critico',
      texto: 'A cada 5 turnos, um soco de 400% de dano que recupera 15% da Vitalidade.' },
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
    tecnica: { nome: 'Corte do Céu Partido', aCada: 5, multiplicador: 4, penetracao: 1, efeito: 'corte_critico',
      texto: 'A cada 5 turnos, um corte de 400% de dano que ignora toda a Defesa.' },
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
    tecnica: { nome: 'Tempestade de Gelo Místico', aCada: 5, multiplicador: 3.5, congela: 1, efeito: 'gelo_critico',
      texto: 'A cada 5 turnos, uma tempestade de 350% de dano que congela o inimigo (ele perde o próximo ataque).' },
  },
  // v0.13.0 (dono): duas classes novas da lore de Martial Peak.
  // A arte própria ainda não existe: usam a do Elemental / da Espada (ferramentas/sprites/importar_ia.py).
  {
    id: 'alma',
    nome: 'Cultivador de Alma',
    titulo: 'Guerreiro do Mar do Conhecimento',
    descricao:
      'Fortalece o Mar do Conhecimento acima de tudo. Seus golpes atingem direto a alma do inimigo, ' +
      'atravessando armaduras e corpos, e a pressão da sua alma esmaga a mente dos mais fracos.',
    multiplicar: { ataque: -0.25, vitalidade: -0.10, sentidoDivino: 1.0 },
    somar: {},
    // penetracao 1 = ignora toda a Defesa | supressao = inimigo foge com Sentido Divino 3× (os outros: 5×)
    especial: { penetracao: 1.0, supressao: 3, sentidoDesdeOInicio: true },
    nomeEspecial: 'Ataque de Alma',
    textoEspecial: 'Os golpes ignoram toda a Defesa do inimigo. Nasce com o Sentido Divino aberto (×2) ' +
      'e os inimigos fogem dele com só 3× o Sentido Divino deles (Supressão de Alma).',
    efeito: 'alma',
    efeitoCritico: 'alma_critico',
    tecnica: { nome: 'Lança da Alma Devoradora', aCada: 5, multiplicador: 3.5, enfraquece: 0.15, efeito: 'alma_critico',
      texto: 'A cada 5 turnos, uma lança de 350% de dano que devora a alma do inimigo: o Ataque dele cai 15% até o fim da luta (até −50%).' },
  },
  {
    id: 'alquimista',
    nome: 'Alquimista',
    titulo: 'Mestre de Pílulas',
    descricao:
      'Refina pílulas com o fogo do Dao, como os mestres da Associação dos Mestres de Pílulas. ' +
      'Luta pior que os guerreiros, mas suas pílulas aceleram o cultivo e o salvam no meio da batalha.',
    multiplicar: { cultivo: 0.50 },   // balanceado pelo robô (v0.13.0): com ataque -10% e cultivo +40% levava 39 h (as outras ~31–35 h)
    somar: {},
    // pilula: uma vez por luta, com menos de "limiar" da vida, cura "cura" da Vitalidade
    especial: { pilula: { limiar: 0.35, cura: 0.5 } },
    nomeEspecial: 'Pílulas Espirituais',
    textoEspecial: '+50% de Cultivo por segundo. Uma vez por luta, com menos de 35% de vida, ' +
      'toma uma Pílula de Cura que recupera 50% da Vitalidade.',
    efeito: 'chama_alquimica',
    efeitoCritico: 'chama_alquimica_critica',
    tecnica: { nome: 'Fogo do Caldeirão Celestial', aCada: 5, multiplicador: 3.5, recarregaPilula: true, efeito: 'chama_alquimica_critica',
      texto: 'A cada 5 turnos, uma explosão de fogo alquímico de 350% de dano que recarrega a Pílula de Cura.' },
  },
];

// Efeitos das classes novas que ainda não têm imagem: usam estes até ela chegar (docs/PROMPTS_CLASSES_NOVAS.md)
export const EFEITO_PROVISORIO = {
  alma: 'magia_roxa', alma_critico: 'magia_roxa',
  chama_alquimica: 'magia_azul', chama_alquimica_critica: 'magia_azul',
};

export const CLASSE_POR_ID = Object.fromEntries(CLASSES.map(c => [c.id, c]));

export const SEXOS = [
  { id: 'masculino', nome: 'Masculino' },
  { id: 'feminino', nome: 'Feminino' },
];

// Usado antes de o jogador criar o personagem (ou em saves antigos)
export const PERSONAGEM_PADRAO = { nome: 'Cultivador', sexo: 'masculino', classe: 'arma' };

export const TAMANHO_DO_NOME = { minimo: 2, maximo: 16 };
