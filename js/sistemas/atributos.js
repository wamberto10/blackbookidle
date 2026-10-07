// =============================================================
// sistemas/atributos.js — ATRIBUTOS E PODER TOTAL
// Hoje os atributos vêm do reino/estágio + melhorias do Black Book.
// Equipamentos e técnicas vão somar aqui nas próximas etapas.
// =============================================================
import { CONFIG } from '../config.js';
import { REINOS } from '../dados/reinos.js';
import { indiceNivel, producaoPorSegundo } from './progressao.js';
import { multiplicadorMelhoria as mult, efeitoMelhoria as soma } from './blackbook.js';
import { bonusEquipamentos } from './itens.js';
import { classeDe } from './personagem.js';

const A = CONFIG.atributos;

// Atributos na ordem em que aparecem na tela.
// formato: 'numero' (1.5K), 'porcento' (12.5%) ou 'decimal' (1.25)
// icone: arquivo em img/icones/
export const ATRIBUTOS = [
  { id: 'ataque',        nome: 'Ataque',           icone: 'atr_ataque',         formato: 'numero' },
  { id: 'critico',       nome: 'Taxa de Crítico',  icone: 'atr_critico',        formato: 'porcento' },
  { id: 'danoCritico',   nome: 'Dano Crítico',     icone: 'atr_dano_critico',   formato: 'porcento' },
  { id: 'velocidade',    nome: 'Velocidade',       icone: 'atr_velocidade',     formato: 'numero' },
  { id: 'vitalidade',    nome: 'Vitalidade (HP)',  icone: 'atr_vitalidade',     formato: 'numero' },
  { id: 'defesa',        nome: 'Defesa',           icone: 'atr_defesa',         formato: 'numero' },
  { id: 'esquiva',       nome: 'Esquiva',          icone: 'atr_esquiva',        formato: 'porcento' },
  { id: 'poderCultivo',  nome: 'Poder de Cultivo', icone: 'atr_poder_cultivo',  formato: 'numero' },
  { id: 'sentidoDivino', nome: 'Sentido Divino',   icone: 'atr_sentido_divino', formato: 'numero' },
];

// Reino a partir do qual o Sentido Divino aparece (Ascensão Imortal)
const REINO_SENTIDO_DIVINO = REINOS.findIndex(r => r.liberaSentidoDivino);

export function sentidoDivinoLiberado(estado) {
  return estado.reino >= REINO_SENTIDO_DIVINO;
}

// Atributos de um cultivador "comum" em um nível, sem bônus.
// Também é a base para calcular a força dos inimigos.
export function atributosBase(nivel, indiceReino) {
  const fator = Math.pow(A.crescimento, nivel) * Math.pow(A.bonusPorReino, indiceReino);
  return {
    ataque: A.base.ataque * fator,
    vitalidade: A.base.vitalidade * fator,
    defesa: A.base.defesa * fator,
    velocidade: A.velocidadeBase * Math.pow(A.crescimentoVelocidade, nivel),
    sentidoDivino: A.base.sentidoDivino * fator,
  };
}

export function calcularAtributos(estado) {
  const nivel = indiceNivel(estado);
  const base = atributosBase(nivel, estado.reino);

  // eq = soma dos equipamentos vestidos
  // mult(...) = melhoria de "+X%" do Black Book | soma(...) = melhoria de "+X pontos"
  // classe(...) = bônus/penalidade da classe (dados/classes.js)
  // Valores fixos: (base + equipamentos) × Black Book × classe
  const eq = bonusEquipamentos(estado);
  const c = classeDe(estado);
  const classe = (atributo) => 1 + (c.multiplicar[atributo] ?? 0);
  const somaClasse = (atributo) => c.somar[atributo] ?? 0;
  return {
    ataque: (base.ataque + eq.ataque) * mult(estado, 'ataque') * classe('ataque'),
    critico: Math.min(A.criticoMaximo, A.criticoBase + A.criticoPorNivel * nivel + soma(estado, 'critico') + eq.critico + somaClasse('critico')),
    danoCritico: Math.min(A.danoCriticoMaximo, A.danoCriticoBase + A.danoCriticoPorNivel * nivel + soma(estado, 'danoCritico') + eq.danoCritico + somaClasse('danoCritico')),
    velocidade: (base.velocidade + eq.velocidade) * mult(estado, 'velocidade') * classe('velocidade'),
    vitalidade: (base.vitalidade + eq.vitalidade) * mult(estado, 'vitalidade') * classe('vitalidade'),
    defesa: (base.defesa + eq.defesa) * mult(estado, 'defesa') * classe('defesa'),
    esquiva: Math.min(A.esquivaMaxima, A.esquivaBase + A.esquivaPorNivel * nivel + eq.esquiva),
    poderCultivo: producaoPorSegundo(estado),
    sentidoDivino: sentidoDivinoLiberado(estado) ? base.sentidoDivino : 0,
    // Habilidade da classe (usada pelo combate e pela previsão de luta; não entra no Poder)
    especial: c.especial,
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
export function dano(ataque, defesa) {
  return Math.max(ataque * CONFIG.combate.danoMinimo, (ataque * ataque) / (ataque + defesa));
}

export function analisarPoder(a) {
  const critico = 1 + (Math.min(a.critico, 100) / 100) * (a.danoCritico / 100 - 1);
  const ofensa = a.ataque * critico;
  const golpe = Math.max(1e-9, a.ataque * GOLPE_DE_REFERENCIA);
  const protecao = 1 + a.defesa / golpe;                // quanto a Defesa reduz cada golpe
  const resistencia = (a.vitalidade * protecao) / (1 - Math.min(a.esquiva, 95) / 100);
  return { ofensa, resistencia, poder: Math.sqrt(ofensa * resistencia) };
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
export function preverLuta(jogador, fase, turnosMaximos) {
  const i = fase.inimigo;
  const esp = jogador.especial ?? {};
  const critico = 1 + (Math.min(jogador.critico, 100) / 100) * (jogador.danoCritico / 100 - 1);
  const explosao = esp.explosaoACada ? 1 + esp.bonusExplosao / esp.explosaoACada : 1;
  const meuDano = dano(jogador.ataque, i.defesa * (1 - (esp.penetracao ?? 0))) * critico * explosao;
  const turnosParaVencer = Math.ceil(i.vida / meuDano);

  const recebido = dano(i.ataque, jogador.defesa) * (1 - jogador.esquiva / 100);
  const cura = jogador.vitalidade * (esp.regeneracao ?? 0);
  // Se eu ataco primeiro, no último turno ele nem chega a atacar
  const golpesQueLevo = jogador.velocidade >= i.velocidade ? turnosParaVencer - 1 : turnosParaVencer;
  const vidaQueSobra = jogador.vitalidade - golpesQueLevo * recebido + Math.max(0, golpesQueLevo - 1) * cura;
  const sobra = Math.min(1, vidaQueSobra / jogador.vitalidade);

  let resultado;
  if (turnosParaVencer > turnosMaximos) resultado = 'tempo';
  else if (sobra <= 0) resultado = 'derrota';
  else if (sobra < 0.3) resultado = 'arriscada';
  else if (sobra < 0.7) resultado = 'segura';
  else resultado = 'facil';
  return { resultado, turnosParaVencer, sobra: Math.max(0, sobra) };
}
