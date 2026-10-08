// =============================================================
// sistemas/blackbook.js — REENCARNAÇÃO E MELHORIAS PERMANENTES
//
// Ciclo:
//  1. O jogador avança até travar numa fase difícil demais.
//  2. Reencarna: TODO o progresso da vida recomeça do zero
//     (Cultivo, reino, estágio, fases do mapa e Pedras Espirituais).
//  3. Recebe Essência da Alma conforme quantas fases venceu nesta vida.
//  4. Gasta a Essência no Black Book em melhorias de atributos que
//     NUNCA são perdidas, e chega mais longe na próxima vida.
// =============================================================
import { CONFIG } from '../config.js';
import { criarEstadoInicial } from '../estado.js';

const BB = CONFIG.blackbook;

function buscar(id) {
  return BB.melhorias.find(m => m.id === id);
}

// ---- Melhorias ----
export function nivelMelhoria(estado, id) {
  return estado.blackbook[id] ?? 0;
}

export function custoMelhoria(estado, id) {
  const melhoria = buscar(id);
  return Math.ceil(melhoria.custoBase * Math.pow(melhoria.crescimentoCusto, nivelMelhoria(estado, id)));
}

// true = a melhoria já está no nível máximo (só algumas têm limite)
export function noMaximo(estado, id) {
  const maximo = buscar(id).nivelMaximo;
  return maximo !== undefined && nivelMelhoria(estado, id) >= maximo;
}

export function comprarMelhoria(estado, id) {
  if (noMaximo(estado, id)) return false;
  const custo = custoMelhoria(estado, id);
  if (estado.essencia < custo) return false;
  estado.essencia -= custo;
  estado.blackbook[id] = nivelMelhoria(estado, id) + 1;
  return true;
}

// Bônus total da melhoria. Ex.: nível 3 de "+10%" → 0.3 | nível 4 de "+1%" → 4
export function efeitoMelhoria(estado, id) {
  const melhoria = buscar(id);
  return melhoria ? nivelMelhoria(estado, id) * melhoria.bonus : 0;
}

// Saves antigos: devolve a Essência gasta em melhorias removidas e nos níveis
// acima do novo máximo (v0.8.1). Devolve quanto foi reembolsado.
export function corrigirMelhoriasAntigas(estado) {
  const gastoEntre = (regra, de, ate) => {
    let total = 0;
    for (let n = de; n < ate; n++) total += Math.ceil(regra.custoBase * Math.pow(regra.crescimentoCusto, n));
    return total;
  };
  let reembolso = 0;
  for (const id in BB.removidas) {
    const nivel = estado.blackbook[id] ?? 0;
    if (nivel > 0) reembolso += gastoEntre(BB.removidas[id], 0, nivel);
    delete estado.blackbook[id];
  }
  for (const melhoria of BB.melhorias) {
    const nivel = nivelMelhoria(estado, melhoria.id);
    if (melhoria.nivelMaximo !== undefined && nivel > melhoria.nivelMaximo) {
      reembolso += gastoEntre(melhoria, melhoria.nivelMaximo, nivel);
      estado.blackbook[melhoria.id] = melhoria.nivelMaximo;
    }
  }
  estado.essencia += reembolso;
  return reembolso;
}

// Para melhorias do tipo 'multiplicar': nível 3 de +10% → 1.3
export function multiplicadorMelhoria(estado, id) {
  return 1 + efeitoMelhoria(estado, id);
}

// ---- Reencarnação ----
export function fasesVencidasNestaVida(estado) {
  return estado.combate.fasesConcluidas + 1;
}

export function essenciaAoReencarnar(estado) {
  const fases = fasesVencidasNestaVida(estado);
  if (fases <= 0) return 0;
  return Math.floor(BB.recompensa.base * fases * Math.pow(BB.recompensa.crescimento, fases));
}

// Só pode reencarnar de novo chegando pelo menos onde reencarnou da última vez
// (ex.: reencarnou no Mapa 1 · Fase 11 → precisa vencer a Fase 11 do Mapa 1 ou ir além).
// Decisão do dono. -1 = ainda não precisa chegar em lugar nenhum.
export function faseMinimaParaReencarnar(estado) {
  return estado.reencarnacao.faseDaUltima ?? -1;
}

export function chegouOndeReencarnou(estado) {
  return estado.combate.fasesConcluidas >= faseMinimaParaReencarnar(estado);
}

export function podeReencarnar(estado) {
  return essenciaAoReencarnar(estado) > 0 && chegouOndeReencarnou(estado);
}

// Devolve um estado NOVO (vida nova), guardando só o que é permanente
export function reencarnar(estado) {
  const ganho = essenciaAoReencarnar(estado);
  const novo = criarEstadoInicial();

  // O que fica para sempre:
  novo.personagem = estado.personagem;
  novo.essencia = estado.essencia + ganho;
  novo.blackbook = { ...estado.blackbook };
  // v0.8.3 (decisão do dono): os itens que caíram ficam — vestidos e na mochila.
  // v0.8.5 (dono): mas o nível de melhoria volta para +0 (as Pedras também zeram).
  const semMelhoria = (item) => item && { ...item, nivel: 0, investido: 0 };
  novo.equipados = Object.fromEntries(Object.entries(estado.equipados).map(([slot, item]) => [slot, semMelhoria(item)]));
  novo.mochila = estado.mochila.map(semMelhoria);
  novo.proximoIdItem = estado.proximoIdItem;
  novo.opcoes = { ...estado.opcoes };
  novo.estatisticas = { ...estado.estatisticas };
  novo.reencarnacao = {
    vezes: estado.reencarnacao.vezes + 1,
    melhorFaseDeTodas: Math.max(estado.reencarnacao.melhorFaseDeTodas, estado.combate.fasesConcluidas),
    faseDaUltima: estado.combate.fasesConcluidas,
    essenciaTotal: estado.reencarnacao.essenciaTotal + ganho,
  };

  return { estado: novo, ganho };
}
