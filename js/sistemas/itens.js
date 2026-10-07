// =============================================================
// sistemas/itens.js — CÁLCULOS DE UM ITEM (sem mexer no estado)
//
// Formato de um item salvo:
//   { id, slot: 'elmo', raridade: 'raro', grau: 3, fase: 13, nivel: 2, investido: 40,
//     atributos: { vitalidade: 120, defesa: 80, critico: 1.2 } }
// "atributos" guarda os valores do nível 0; cada nível soma +5% (config).
// =============================================================
import { CONFIG } from '../config.js';
import { SLOTS, RARIDADES } from '../dados/equipamentos.js';

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

// Para onde vai uma mescla: grau seguinte, ou ★1 do tier seguinte. null = já é o máximo.
export function proximoDaMescla(raridadeId, grau) {
  const indice = RARIDADES.findIndex(r => r.id === raridadeId);
  if (grau < EQ.graus) return { raridade: RARIDADES[indice], grau: grau + 1 };
  if (indice < RARIDADES.length - 1) return { raridade: RARIDADES[indice + 1], grau: 1 };
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
  for (const chave in item.atributos) resultado[chave] = item.atributos[chave] * multiplicador;
  return resultado;
}

// Soma dos atributos de tudo que está vestido
export function bonusEquipamentos(estado) {
  const total = { ataque: 0, vitalidade: 0, defesa: 0, velocidade: 0, critico: 0, danoCritico: 0, esquiva: 0, cultivo: 0 };
  for (const slot in estado.equipados) {
    const item = estado.equipados[slot];
    if (!item) continue;
    const atributos = atributosDoItem(item);
    for (const chave in atributos) total[chave] += atributos[chave];
  }
  return total;
}

// ---- Melhoria e desmanche ----
export function nivelMaximo(item) {
  return RARIDADE_POR_ID[item.raridade].nivelMaximo;
}

export function custoMelhoria(item) {
  const valor = valorDoItem(item);
  return Math.ceil(EQ.custoMelhoriaBase * valor * Math.pow(CONFIG.combate.crescimentoPedras, item.fase) *
    Math.pow(EQ.crescimentoCustoMelhoria, item.nivel));
}

export function pedrasAoDesmanchar(item) {
  const valor = valorDoItem(item);
  const base = EQ.pedrasAoDesmancharBase * valor * Math.pow(CONFIG.combate.crescimentoPedras, item.fase);
  return Math.ceil(base + item.investido * EQ.devolucaoAoDesmanchar);
}
