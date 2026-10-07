// =============================================================
// dados/equipamentos.js — ESPAÇOS, TIERS E ATRIBUTOS DOS ITENS
// =============================================================

// ---- Os 10 espaços de equipamento ----
// v0.7.1: atributos rebalanceados — cada tipo Comum ★1 soma ~5% de Poder (antes ia de 0% a 13%)
//   lado        → coluna em que aparece na Mochila
//   mapaMinimo  → a partir de qual mapa este tipo de item começa a cair (1 = Mapa 1)
//   principal   → atributos garantidos do item:
//                 atributos "fixos" (ataque, vitalidade, defesa, velocidade) usam uma
//                 FRAÇÃO do valor de referência da fase (0.12 = 12%);
//                 atributos em % (critico, danoCritico, esquiva, cultivo) usam PONTOS.
//   material    → nome do item em cada tier
export const SLOTS = [
  // ---- Lado esquerdo ----
  { id: 'elmo',      nome: 'Elmo',      lado: 'esquerda', mapaMinimo: 1, principal: { vitalidade: 0.06, defesa: 0.14 } },
  { id: 'colar',     nome: 'Colar',     lado: 'esquerda', mapaMinimo: 5, principal: { critico: 3, ataque: 0.12 } },
  { id: 'ombreiras', nome: 'Ombreiras', lado: 'esquerda', mapaMinimo: 3, principal: { defesa: 0.20, vitalidade: 0.03 } },
  { id: 'capa',      nome: 'Capa',      lado: 'esquerda', mapaMinimo: 6, principal: { esquiva: 1.5, vitalidade: 0.09 } },
  { id: 'peitoral',  nome: 'Peitoral',  lado: 'esquerda', mapaMinimo: 1, principal: { vitalidade: 0.08, defesa: 0.14 } },
  // ---- Lado direito ----
  { id: 'luvas',     nome: 'Luvas',     lado: 'direita',  mapaMinimo: 3, principal: { ataque: 0.16, danoCritico: 5 } },
  { id: 'calcas',    nome: 'Calças',    lado: 'direita',  mapaMinimo: 2, principal: { vitalidade: 0.09, defesa: 0.05 } },
  { id: 'botas',     nome: 'Botas',     lado: 'direita',  mapaMinimo: 2, principal: { velocidade: 0.06, vitalidade: 0.09, esquiva: 0.8 } },
  { id: 'anel',      nome: 'Anel',      lado: 'direita',  mapaMinimo: 4, principal: { ataque: 0.18 } },
  { id: 'berloque',  nome: 'Berloque',  lado: 'direita',  mapaMinimo: 7, principal: { danoCritico: 10, cultivo: 5, ataque: 0.12 } },
];

// ---- Tiers (do mais comum ao mais raro) ----
//   peso        → chance base de cair (comparada com os outros tiers).
//                 v0.7.0: tiers altos caem menos (o Lendário saía rápido demais)
//   bonusMapa   → quanto o peso aumenta a cada mapa (0.25 = +25% por mapa; v0.7.2: valores reduzidos)
//   forca       → multiplicador dos atributos
//   extras      → quantos atributos aleatórios extras o item ganha
//   nivelMaximo → até que nível pode ser melhorado com Pedras Espirituais
//   valor       → multiplicador do custo de melhoria e das Pedras ao desmanchar
export const RARIDADES = [
  { id: 'comum',    tier: 'D/F', nome: 'Comum',    material: 'de Ferro',             cor: '#a8acb4', peso: 70, bonusMapa: 0,    forca: 1.0,  extras: 0, nivelMaximo: 5,  valor: 1 },
  { id: 'incomum',  tier: 'C',   nome: 'Incomum',  material: 'de Jade',              cor: '#4ad04a', peso: 22, bonusMapa: 0.08, forca: 1.2,  extras: 1, nivelMaximo: 8,  valor: 1.5 },
  { id: 'raro',     tier: 'B',   nome: 'Raro',     material: 'de Safira',            cor: '#4a7aff', peso: 6,  bonusMapa: 0.12, forca: 1.45, extras: 2, nivelMaximo: 12, valor: 2.5 },
  { id: 'epico',    tier: 'A',   nome: 'Épico',    material: 'do Abismo Violeta',    cor: '#b050ff', peso: 1.6, bonusMapa: 0.18, forca: 1.75, extras: 3, nivelMaximo: 16, valor: 4 },
  { id: 'lendario', tier: 'S',   nome: 'Lendário', material: 'do Imperador Celeste', cor: '#ffd84a', peso: 0.25, bonusMapa: 0.25, forca: 2.1,  extras: 4, nivelMaximo: 20, valor: 6 },
];

// ---- Atributos extras sorteados (mesma regra de "fração" ou "pontos" acima) ----
export const ATRIBUTOS_EXTRAS = {
  ataque: 0.06,
  vitalidade: 0.08,
  defesa: 0.06,
  velocidade: 0.03,
  critico: 1,
  danoCritico: 4,
  esquiva: 0.7,
  cultivo: 3,
};

// Atributos medidos em pontos de porcentagem (os outros são valores fixos)
export const ATRIBUTOS_EM_PORCENTO = ['critico', 'danoCritico', 'esquiva', 'cultivo'];

export const NOMES_DOS_ATRIBUTOS = {
  ataque: 'Ataque',
  vitalidade: 'Vitalidade',
  defesa: 'Defesa',
  velocidade: 'Velocidade',
  critico: 'Taxa de Crítico',
  danoCritico: 'Dano Crítico',
  esquiva: 'Esquiva',
  cultivo: 'Cultivo por segundo',
};
