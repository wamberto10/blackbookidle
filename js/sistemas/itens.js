// =============================================================
// sistemas/itens.js — CÁLCULOS DE UM ITEM (sem mexer no estado)
//
// Formato de um item salvo:
//   { id, slot: 'elmo', raridade: 'raro', grau: 3, fase: 13, nivel: 2, investido: 40,
//     atributos: { vitalidade: 9.2, defesa: 13.8, critico: 1.2 } }
// "fase" = fase GLOBAL onde caiu (v0.32.0: 1152 em diante = Normal, Difícil...) — define o patamar do item.
// "atributos" guarda os valores do nível 0; cada nível soma +5% (config). v0.32.0: TODOS são porcentagem:
// Ataque, Vitalidade, Defesa e Velocidade multiplicam o cultivo (+13,8% Defesa); os outros somam pontos de %.
// =============================================================
import { CONFIG } from '../config.js';
import { SLOTS, RARIDADES } from '../dados/equipamentos.js';
import { fatorDePedras } from './escala.js';
import { somar, multiplicar, arredondarParaCima } from '../numeros.js';
// v0.33.0: % de Ataque/Vitalidade/Defesa/Velocidade dos itens, custos, Pedras e investimento são NÚMEROS GRANDES
// (js/numeros.js) — no Infinito passam de 1e308. Crítico, Dano Crítico, Esquiva e Cultivo (%) são números comuns.
const ATRIBUTOS_GRANDES = new Set(['ataque', 'vitalidade', 'defesa', 'velocidade']);

const EQ = CONFIG.equipamentos;

export const SLOT_POR_ID = Object.fromEntries(SLOTS.map(s => [s.id, s]));
export const RARIDADE_POR_ID = Object.fromEntries(RARIDADES.map(r => [r.id, r]));

export function indiceRaridade(item) {
  return RARIDADES.findIndex(r => r.id === item.raridade);
}

// Grau do item (★1 a ★5). Itens de saves antigos (antes da v0.7.0) não têm grau: contam como ★1.
export function grauDe(item) {
  return item.grau ?? 1;
}

export function estrelas(grau) {
  return `★${grau}`;
}

export function nomeDoItem(item) {
  return `${SLOT_POR_ID[item.slot].nome} ${RARIDADE_POR_ID[item.raridade].material} ${estrelas(grauDe(item))}`;
}

// Para onde vai uma mescla: só o grau seguinte (★1 → ★5), no MESMO tier.
// v0.8.4 (dono): mesclar não sobe mais de tier; ★5 é o máximo. null = já é o máximo.
export function proximoDaMescla(raridadeId, grau) {
  if (grau < EQ.graus) return { raridade: RARIDADE_POR_ID[raridadeId], grau: grau + 1 };
  return null;
}

// Valor do item (custo de melhoria e Pedras ao desmanchar): tier × grau
function valorDoItem(item) {
  return RARIDADE_POR_ID[item.raridade].valor * (1 + 0.25 * (grauDe(item) - 1));
}

// Atributos já contando o nível de melhoria
export function atributosDoItem(item) {
  const multiplicador = 1 + EQ.bonusPorNivel * item.nivel;
  const resultado = {};
  for (const chave in item.atributos) {
    resultado[chave] = ATRIBUTOS_GRANDES.has(chave) ? multiplicar(item.atributos[chave], multiplicador) : item.atributos[chave] * multiplicador;
  }
  return resultado;
}

// Soma dos atributos de tudo que está vestido
export function bonusEquipamentos(estado) {
  const total = { ataque: 0, vitalidade: 0, defesa: 0, velocidade: 0, critico: 0, danoCritico: 0, esquiva: 0, cultivo: 0 };
  for (const slot in estado.equipados) {
    const item = estado.equipados[slot];
    if (!item) continue;
    const atributos = atributosDoItem(item);
    for (const chave in atributos) total[chave] = ATRIBUTOS_GRANDES.has(chave) ? somar(total[chave], atributos[chave]) : total[chave] + atributos[chave];
  }
  return total;
}

// ---- Melhoria e desmanche ----
export function nivelMaximo(item) {
  return RARIDADE_POR_ID[item.raridade].nivelMaximo;
}

// v0.32.0: a escala de Pedras do patamar do item (escala.js: 1,05 por fase no Fácil, mais suave depois)
export function custoMelhoria(item) {
  const valor = valorDoItem(item);
  return arredondarParaCima(multiplicar(fatorDePedras(item.fase),
    EQ.custoMelhoriaBase * valor * Math.pow(EQ.crescimentoCustoMelhoria, item.nivel)));
}

export function pedrasAoDesmanchar(item) {
  const valor = valorDoItem(item);
  const base = multiplicar(fatorDePedras(item.fase), EQ.pedrasAoDesmancharBase * valor);
  return arredondarParaCima(somar(base, multiplicar(item.investido, EQ.devolucaoAoDesmanchar)));
}
