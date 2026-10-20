// =============================================================
// sistemas/atributos.js — ATRIBUTOS E PODER TOTAL
// v0.32.0 (progressão contínua): atributo = base do cultivo × fator dos equipamentos × bônus permanentes
// (Black Book, classe, Núcleos, VIP, Batismos). Crítico, Dano Crítico e Esquiva somam pontos e têm teto próprio.
// =============================================================
import { CONFIG } from '../config.js';
import { REINOS } from '../dados/reinos.js';
import { MUNDOS } from '../dados/mundos.js';
import { indiceNivel, producaoPorSegundo, batismosMundiais, inicioDoReino, NIVEL_DO_FRUTO } from './progressao.js';
import { multiplicadorMelhoria as mult, efeitoMelhoria as soma } from './blackbook.js';
import { bonusEquipamentos } from './itens.js';
import { classeDe } from './personagem.js';
import { multiplicadorNucleo as nucleo } from './nucleos.js';
import { somar, subtrair, multiplicar, dividir, raiz, maximo, maiorOuIgual, potencia, razao, comparar, menorOuIgual } from '../numeros.js';
// v0.33.0: Ataque, Vitalidade, Defesa, Velocidade, Sentido Divino, Poder e a força dos inimigos são NÚMEROS GRANDES
// (js/numeros.js). Crítico, Dano Crítico e Esquiva continuam números comuns (têm teto).

const A = CONFIG.atributos;

// Atributos na ordem em que aparecem na tela.
// formato: 'numero' (1.5K), 'porcento' (12.5%) ou 'decimal' (1.25)
// icone: arquivo em img/icones/
// maximo: teto do atributo (aparece na tela como "13% / 60%")
export const ATRIBUTOS = [
  { id: 'ataque',        nome: 'Ataque',           icone: 'atr_ataque',         formato: 'numero' },
  { id: 'critico',       nome: 'Taxa de Crítico',  icone: 'atr_critico',        formato: 'porcento', maximo: A.criticoMaximo },
  { id: 'danoCritico',   nome: 'Dano Crítico',     icone: 'atr_dano_critico',   formato: 'porcento', maximo: A.danoCriticoMaximo },
  { id: 'velocidade',    nome: 'Velocidade',       icone: 'atr_velocidade',     formato: 'numero' },
  { id: 'vitalidade',    nome: 'Vitalidade (HP)',  icone: 'atr_vitalidade',     formato: 'numero' },
  { id: 'defesa',        nome: 'Defesa',           icone: 'atr_defesa',         formato: 'numero' },
  { id: 'esquiva',       nome: 'Esquiva',          icone: 'atr_esquiva',        formato: 'porcento', maximo: A.esquivaMaxima },
  { id: 'poderCultivo',  nome: 'Poder de Cultivo', icone: 'atr_poder_cultivo',  formato: 'numero' },
  { id: 'sentidoDivino', nome: 'Sentido Divino',   icone: 'atr_sentido_divino', formato: 'numero' },
];

// Reino a partir do qual o Sentido Divino aparece (Ascensão Imortal)
const REINO_SENTIDO_DIVINO = REINOS.findIndex(r => r.liberaSentidoDivino);

// ---- v0.26.0: Selo do Mundo Primordial (CONFIG.selo) ----
// Nos mapas com "selado: true" (dados/mundo8.js) você luta com a força do Elemento Verdadeiro, 9º estágio.
const REINO_DO_SELO = REINOS.findIndex(r => r.id === CONFIG.selo.reino);
export const SELO = { reino: REINO_DO_SELO, nivel: inicioDoReino(REINO_DO_SELO) + CONFIG.selo.estagio };
const MAPA_SELADO = MUNDOS.flatMap(m => m.mapas).map(m => Boolean(m.selado));   // mesma ordem de MAPAS (mundo.js)

// A fase atual do combate fica num mapa selado? (v0.32.0: só no Fácil — MAPA_SELADO tem os 96 mapas dele;
// a Normal em diante reaproveita as artes dos Mapas 85–90 sem o Selo)
export function estaSelado(estado) {
  const fase = estado.combate?.faseAtual;
  return fase != null && MAPA_SELADO[Math.floor(fase / CONFIG.combate.fasesPorMapa)] === true;
}

// Sentido Divino do jogador num nível (0 antes da Ascensão Imortal). Usado também para estimar
// o Sentido Divino guardado de saves antigos.
export function sentidoDivinoNoNivel(nivel, indiceReino) {
  if (indiceReino < REINO_SENTIDO_DIVINO) return 0;
  return multiplicar(atributosBase(nivel, indiceReino).sentidoDivino, potencia(A.bonusPorReinoJogador / A.bonusPorReino, indiceReino));
}

export function sentidoDivinoLiberado(estado) {
  return estado.reino >= REINO_SENTIDO_DIVINO;
}

// Atributos de um cultivador "comum" em um nível, sem bônus.
// Também é a base para calcular a força dos inimigos.
// v0.32.0: acima do Fruto do Universo (nível 107) cada nível é de Maestria da Criação (CONFIG.maestria)
export function atributosBase(nivel, indiceReino) {
  const maestria = Math.max(0, nivel - NIVEL_DO_FRUTO);
  const M = CONFIG.maestria;
  // (no Infinito o fator passa de 1e308: potencia/multiplicar viram número grande quando precisa)
  const fator = multiplicar(multiplicar(potencia(A.crescimento, nivel - maestria), potencia(A.bonusPorReino, indiceReino)),
    potencia(M.ganhoAtributos, maestria));
  return {
    ataque: multiplicar(A.base.ataque, fator),
    vitalidade: multiplicar(A.base.vitalidade, fator),
    defesa: multiplicar(A.base.defesa, fator),
    velocidade: multiplicar(A.velocidadeBase, multiplicar(potencia(A.crescimentoVelocidade, nivel - maestria), potencia(M.ganhoVelocidade, maestria))),
    sentidoDivino: multiplicar(A.base.sentidoDivino, fator),
  };
}

// opcoes.selado: true/false força o Selo do Mundo Primordial (padrão: selado se a fase atual for de um mapa selado)
export function calcularAtributos(estado, opcoes = {}) {
  // v0.26.0: selado, vale o reino/estágio do selo (Elemento Verdadeiro) em vez do seu
  const selado = opcoes.selado ?? estaSelado(estado);
  const reino = selado ? SELO.reino : estado.reino;
  const nivel = selado ? SELO.nivel : indiceNivel(estado);
  const base = { ...atributosBase(nivel, reino) };
  // Bônus EXTRA de reino só do jogador (os inimigos usam atributosBase puro).
  // Faz cada rompimento valer mais que o ganho dos inimigos (v0.9.16, pedido do dono).
  const extraReino = Math.pow(A.bonusPorReinoJogador / A.bonusPorReino, reino);
  for (const atributo of ['ataque', 'vitalidade', 'defesa', 'sentidoDivino']) base[atributo] = multiplicar(base[atributo], extraReino);

  // eq = soma dos equipamentos vestidos (v0.32.0: Ataque, Vitalidade, Defesa e Velocidade em %)
  // mult(...) = melhoria de "+X%" do Black Book | soma(...) = melhoria de "+X pontos"
  // classe(...) = bônus/penalidade da classe (dados/classes.js)
  // Valores fixos: base × (1 + % dos equipamentos) × Black Book × classe × Núcleos (+1% por ponto)
  // (v0.22.1–0.31.0 os itens SOMAVAM valores fixos à base, limitados a 3× a força do reino)
  const eq = bonusEquipamentos(estado);
  const itens = (atributo) => somar(1, dividir(eq[atributo], 100));
  const c = classeDe(estado);
  const classe = (atributo) => 1 + (c.multiplicar[atributo] ?? 0);
  const somaClasse = (atributo) => c.somar[atributo] ?? 0;
  const vip = (atributo) => estado.vip ? 1 + (CONFIG.vip.atributos[atributo] ?? 0) : 1;   // VIP: +25% (CONFIG.vip.atributos)
  // v0.21.0: Batismo Mundial — +3% Ataque, Vitalidade e Defesa por rompimento desde a Transformação do Qi
  const batismo = 1 + batismosMundiais(selado ? { reino } : estado) * CONFIG.batismo.bonusPorBatismo;
  // base × itens × Black Book × (classe × Núcleos × VIP × Batismo — números comuns)
  const total = (atributo, comum) => multiplicar(multiplicar(base[atributo], itens(atributo)), multiplicar(mult(estado, atributo), comum));
  return {
    ataque: total('ataque', classe('ataque') * nucleo(estado, 'ataque') * vip('ataque') * batismo),
    critico: Math.min(A.criticoMaximo, A.criticoBase + A.criticoPorNivel * nivel + soma(estado, 'critico') + eq.critico + somaClasse('critico')),
    danoCritico: Math.min(A.danoCriticoMaximo, A.danoCriticoBase + A.danoCriticoPorNivel * nivel + soma(estado, 'danoCritico') + eq.danoCritico + somaClasse('danoCritico')),
    velocidade: total('velocidade', classe('velocidade') * nucleo(estado, 'velocidade')),
    vitalidade: total('vitalidade', classe('vitalidade') * nucleo(estado, 'vitalidade') * vip('vitalidade') * batismo),
    defesa: total('defesa', classe('defesa') * nucleo(estado, 'defesa') * vip('defesa') * batismo),
    esquiva: Math.min(A.esquivaMaxima, A.esquivaBase + A.esquivaPorNivel * nivel + eq.esquiva),
    poderCultivo: producaoPorSegundo(estado),
    // v0.12.0 "a alma se lembra": vale o maior entre o desta vida e o maior já alcançado (selado, não vale)
    sentidoDivino: maximo(reino >= REINO_SENTIDO_DIVINO ? multiplicar(base.sentidoDivino, classe('sentidoDivino')) : 0,
      selado ? 0 : estado.reencarnacao?.sentidoDivinoMaximo ?? 0),
    // Habilidade da classe (usada pelo combate e pela previsão de luta; não entra no Poder)
    especial: c.especial,
    tecnica: c.tecnica,
    selado,                // v0.26.0: true = lutando sob o Selo do Mundo Primordial
  };
}

// =============================================================
// PODER — calculado do mesmo jeito que o combate funciona
//
// Calculado APENAS com os atributos (decisão do dono): Ataque, Taxa e Dano Crítico,
// Vitalidade, Defesa e Esquiva. Não depende de nível, de inimigo nem da habilidade da classe.
//
//   Ofensa      = Ataque × bônus médio do crítico            (dano médio por golpe)
//   Resistência = Vitalidade × proteção da Defesa ÷ (1 − Esquiva)   (vida efetiva)
//   Poder       = √(Ofensa × Resistência)
//
// Por que a raiz do produto: numa luta, quem vence é quem derruba o outro primeiro —
// dobrar o ataque ou dobrar a vida valem o mesmo.
// Proteção da Defesa: no combate, Dano = Ataque² / (Ataque + Defesa). A Defesa é medida
// contra um golpe de 60% do SEU Ataque (quanto mais forte você, mais fortes os inimigos),
// então cada ponto de qualquer atributo sempre aumenta o Poder.
// Velocidade só decide quem ataca primeiro (depende do inimigo); Cultivo e Sentido Divino
// não ajudam a lutar — nenhum deles entra no Poder.
// O inimigo usa a mesma conta, então "Poder do inimigo" é comparável ao seu.
// =============================================================
const GOLPE_DE_REFERENCIA = 0.6;   // a Defesa é medida contra um golpe de 60% do próprio Ataque

// Mesma fórmula do combate: Dano = Ataque² / (Ataque + Defesa)
// v0.8.1: todo golpe tira pelo menos 10% do Ataque (Defesa nunca deixa ninguém imune)
// v0.32.0: escrito como Ataque × (Ataque / (Ataque + Defesa)) — o Ataque² passava do limite dos números no Infinito
// v0.33.0: aceita números grandes (o combate usa os valores já normalizados — ver normalizarLuta)
export function dano(ataque, defesa) {
  if (comparar(ataque, 0) === 0) return 0;
  if (typeof ataque === 'number' && typeof defesa === 'number') {
    const soma = ataque + defesa;
    if (Number.isFinite(soma)) return Math.max(ataque * CONFIG.combate.danoMinimo, ataque * (ataque / soma));
  }
  return maximo(multiplicar(ataque, CONFIG.combate.danoMinimo), multiplicar(ataque, dividir(ataque, somar(ataque, defesa))));
}

export function analisarPoder(a) {
  const critico = 1 + (Math.min(a.critico, 100) / 100) * (a.danoCritico / 100 - 1);
  const ofensa = multiplicar(a.ataque, critico);
  const golpe = maximo(1e-9, multiplicar(a.ataque, GOLPE_DE_REFERENCIA));
  const protecao = somar(1, dividir(a.defesa, golpe));                // quanto a Defesa reduz cada golpe
  const resistencia = dividir(multiplicar(a.vitalidade, protecao), 1 - Math.min(a.esquiva, 95) / 100);
  return { ofensa, resistencia, poder: multiplicar(raiz(ofensa), raiz(resistencia)) };
}

// =============================================================
// v0.33.0: NORMALIZAÇÃO DE UMA LUTA — os dois lados divididos pela MESMA escala (o maior valor ÷ 1e100), para que
// o caminho comum use Number. Razões extremas permanecem Grande, sem piso nem perda de proporção.
// Dano = A × A/(A + D) e as vidas
// mudam na mesma proporção, então o resultado é o mesmo da conta "de verdade". Velocidade e Sentido Divino têm
// escalas próprias (só se comparam entre si: quem ataca primeiro, ataque duplo, Supressão de Alma).
// Não arredonda valores positivos para um mínimo: isso igualaria HP, Ataque e Defesa pequenos distintos.
// =============================================================
const TOPO_DA_LUTA = 1e100;
function escalaDe(valores) {
  let maior = 0;
  for (const v of valores) if (comparar(v, maior) > 0) maior = v;
  return comparar(maior, 0) > 0 ? dividir(maior, TOPO_DA_LUTA) : 1;
}
const normal = (v, escala) => (comparar(v, 0) <= 0 ? 0 : dividir(v, escala));
// jogador: atributos do herói (calcularAtributos) | inimigo: { vida, ataque, defesa, velocidade, sentidoDivino, ... }
// Devolve { escalas: { escala, escalaVel, escalaSentido }, jogador, inimigo } em Number/Grande.
export function normalizarLuta(jogador, inimigo) {
  const escalas = {
    escala: escalaDe([jogador.ataque, jogador.vitalidade, jogador.defesa, inimigo.vida, inimigo.ataque, inimigo.defesa]),
    escalaVel: escalaDe([jogador.velocidade, inimigo.velocidade]),
    escalaSentido: escalaDe([jogador.sentidoDivino ?? 0, inimigo.sentidoDivino ?? 0]),
  };
  return { escalas, jogador: normalizarJogador(jogador, escalas), inimigo: normalizarInimigo(inimigo, escalas) };
}
// Com escalas já escolhidas (luta em andamento, luta carregada do save)
export function normalizarJogador(jogador, { escala, escalaVel, escalaSentido }) {
  return { ...jogador, ataque: normal(jogador.ataque, escala), vitalidade: normal(jogador.vitalidade, escala),
    defesa: normal(jogador.defesa, escala), velocidade: normal(jogador.velocidade, escalaVel),
    sentidoDivino: normal(jogador.sentidoDivino ?? 0, escalaSentido) };
}
export function normalizarInimigo(inimigo, { escala, escalaVel, escalaSentido }) {
  return { ...inimigo, vida: normal(inimigo.vida, escala), ataque: normal(inimigo.ataque, escala),
    defesa: normal(inimigo.defesa, escala), velocidade: normal(inimigo.velocidade, escalaVel),
    sentidoDivino: normal(inimigo.sentidoDivino ?? 0, escalaSentido) };
}

export function poderTotal(a) {
  return analisarPoder(a).poder;
}

// Atributos de um inimigo no mesmo formato do jogador (para usar as mesmas contas)
export function atributosDoInimigo(fase) {
  const i = fase.inimigo;
  return {
    ataque: i.ataque, vitalidade: i.vida, defesa: i.defesa, velocidade: i.velocidade,
    critico: 0, danoCritico: 100, esquiva: 0, especial: {},
  };
}

export function poderDoInimigo(fase) {
  return poderTotal(atributosDoInimigo(fase));
}

// Previsão de uma luta (média, sem sorte): quantos turnos para vencer e quanta vida sobra.
// resultado: 'facil' | 'segura' | 'arriscada' | 'derrota' | 'tempo'
// v0.9.12 (dono): Velocidade do dobro (ou mais) da do inimigo = 2 ataques por turno
export function golpesPorTurno(jogador, inimigo) {
  return maiorOuIgual(jogador.velocidade, multiplicar(inimigo.velocidade, 2)) ? 2 : 1;
}

export function preverLuta(jogadorReal, fase, turnosMaximos) {
  // v0.33.0: mesma normalização da luta (números grandes → números comuns, mesma proporção)
  const { jogador, inimigo: i } = normalizarLuta(jogadorReal, fase.inimigo);
  const esp = jogador.especial ?? {};
  const critico = 1 + (Math.min(jogador.critico, 100) / 100) * (jogador.danoCritico / 100 - 1);
  const explosao = esp.explosaoACada ? 1 + esp.bonusExplosao / esp.explosaoACada : 1;
  const tec = jogador.tecnica;   // técnica da classe: em média +(multiplicador − 1)/aCada por ataque
  const media = tec ? 1 + (tec.multiplicador - 1) / tec.aCada : 1;
  const meuDano = multiplicar(multiplicar(multiplicar(multiplicar(
    dano(jogador.ataque, multiplicar(i.defesa, 1 - (esp.penetracao ?? 0))), critico), explosao), media), golpesPorTurno(jogador, i));
  // Turnos são apenas uma previsão limitada para a interface. A decisão > limite é segura mesmo
  // quando a razão verdadeira passa de Number; a luta real mantém HP e dano em Number/Grande.
  const turnosParaVencer = menorOuIgual(meuDano, 0) ? 1e300 : Math.max(1, Math.ceil(razao(i.vida, meuDano)));
  if (turnosParaVencer > turnosMaximos) return { resultado: 'tempo', turnosParaVencer, sobra: 0 };

  const recebido = multiplicar(dano(i.ataque, jogador.defesa), 1 - jogador.esquiva / 100);
  const cura = multiplicar(jogador.vitalidade, esp.regeneracao ?? 0);
  // Se eu ataco primeiro, no último turno ele nem chega a atacar
  const golpesQueLevo = maiorOuIgual(jogador.velocidade, i.velocidade) ? turnosParaVencer - 1 : turnosParaVencer;
  const vidaQueSobra = somar(subtrair(jogador.vitalidade, multiplicar(golpesQueLevo, recebido)),
    multiplicar(Math.max(0, golpesQueLevo - 1), cura));
  const sobra = Math.min(1, razao(vidaQueSobra, jogador.vitalidade));

  let resultado;
  if (turnosParaVencer > turnosMaximos) resultado = 'tempo';
  else if (sobra <= 0) resultado = 'derrota';
  else if (sobra < 0.3) resultado = 'arriscada';
  else if (sobra < 0.7) resultado = 'segura';
  else resultado = 'facil';
  return { resultado, turnosParaVencer, sobra: Math.max(0, sobra) };
}
