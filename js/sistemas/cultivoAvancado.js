// =============================================================
// sistemas/cultivoAvancado.js — MELHORIAS DO CULTIVO VINDAS DA LORE (v0.21.0)
//
//   Reclusão          → o combate das fases para e o Cultivo rende mais (quanto mais tempo, mais fundo)
//   Iluminação        → um brilho aparece de vez em quando; tocar = Cultivo ×2 por 60 s
//   Arranjo           → Arranjo de Reunião de Energia: +2% de Cultivo por nível, comprado com Pedras
//   Fonte Estelar     → no Rei da Origem, refiná-la torna você Mestre Estelar (+15% Cultivo nesta vida)
//   Pílulas           → caem dos inimigos: Acúmulo de Qi, Fluxo Celestial e Quebra-Gargalo
//   (Batismo Mundial e Sentido Divino no Meditar são bônus automáticos: ver progressao.js e atributos.js)
//
// Só regras. Os bônus entram na produção em progressao.js (bonusDoCaminho).
// =============================================================
import { CONFIG } from '../config.js';
import * as P from './progressao.js';

// ---- Reclusão ----
export function reclusaoLiberada(estado) {
  return estado.reino >= P.REINO_DA_RECLUSAO;
}

// Entra (começa do zero: CONFIG.reclusao.bonusInicial) ou sai da Reclusão. Devolve true se agora está em Reclusão.
export function alternarReclusao(estado) {
  if (estado.reclusao.ativa) {
    estado.reclusao.ativa = false;
    estado.reclusao.segundos = 0;
    return false;
  }
  if (!reclusaoLiberada(estado)) return false;
  estado.reclusao.ativa = true;
  estado.reclusao.segundos = 0;
  return true;
}

// ---- Iluminação ----
export function receberIluminacao(estado) {
  const I = CONFIG.iluminacao;
  estado.efeitos.iluminacao = Math.min(I.acumuloMaximo, (estado.efeitos.iluminacao ?? 0) + I.segundos);
}

// ---- Arranjo de Reunião de Energia ----
export function custoDoArranjo(estado) {
  const A = CONFIG.arranjo;
  return Math.ceil(A.custoBase * Math.pow(A.crescimentoCusto, estado.arranjo ?? 0));
}

export function melhorarArranjo(estado) {
  const custo = custoDoArranjo(estado);
  if (estado.pedras < custo) return false;
  estado.pedras -= custo;
  estado.arranjo = (estado.arranjo ?? 0) + 1;
  return true;
}

// ---- Fonte Estelar (Mestre Estelar) ----
export function fonteEstelarLiberada(estado) {
  return estado.reino >= P.REINO_DO_MESTRE_ESTELAR;
}

// Custa o mesmo que 1 estágio normal do nível atual (sem o extra do rompimento)
export function custoDaFonteEstelar(estado) {
  return Math.ceil(CONFIG.cultivo.custoBase * Math.pow(CONFIG.cultivo.crescimentoCusto, P.indiceNivel(estado)));
}

export function podeRefinarFonteEstelar(estado) {
  return fonteEstelarLiberada(estado) && !estado.mestreEstelar && estado.cultivo >= custoDaFonteEstelar(estado);
}

export function refinarFonteEstelar(estado) {
  if (!podeRefinarFonteEstelar(estado)) return false;
  estado.cultivo -= custoDaFonteEstelar(estado);
  estado.mestreEstelar = true;
  return true;
}

// ---- Pílulas de cultivo ----
const PI = CONFIG.pilulas;
export const TIPOS_DE_PILULA = PI.tipos;
export const PILULA_POR_ID = Object.fromEntries(PI.tipos.map(t => [t.id, t]));

// Desconto da Quebra-Gargalo (nunca passa de 50%)
export function descontoDaQuebraGargalo(estado) {
  const t = PILULA_POR_ID.rompimento;
  return Math.min(t.descontoMaximo, t.desconto);
}

// Texto do efeito da pílula (ex.: "Ganha na hora 5 min de Cultivo.")
export function textoDaPilula(estado, tipo) {
  const minutos = (s) => { const m = Math.floor(s / 60), r = Math.round(s % 60); return r ? `${m} min ${r} s` : `${m} min`; };
  if (tipo.id === 'acumulo') return `Ganha na hora ${minutos(tipo.segundosDeCultivo)} de Cultivo.`;
  if (tipo.id === 'fluxo') return `Cultivo ×${tipo.multiplicador} por ${minutos(tipo.segundos)}.`;
  return `O próximo rompimento de reino custa ${Math.round(descontoDaQuebraGargalo(estado) * 100)}% menos.`;
}

function sortearTipo() {
  const total = PI.tipos.reduce((s, t) => s + t.peso, 0);
  let sorte = Math.random() * total;
  for (const tipo of PI.tipos) {
    if (sorte < tipo.peso) return tipo;
    sorte -= tipo.peso;
  }
  return PI.tipos[0];
}

// Sorteia uma pílula ao vencer (no máximo 1). A 1ª vitória contra um chefe de mapa sempre dá uma.
export function tentarPilula(estado, fase, primeira) {
  if (fase.mapa + 1 < PI.mapaMinimo) return null;
  const garantida = primeira && fase.chaveTipo === 'chefe';
  if (!garantida && Math.random() >= PI.chanceBase * fase.tipo.pedras) return null;
  const tipo = sortearTipo();
  estado.pilulas[tipo.id] = (estado.pilulas[tipo.id] ?? 0) + 1;
  return tipo;
}

// Por que não dá para usar agora (ou null se dá)
export function motivoParaNaoUsarPilula(estado, id) {
  if ((estado.pilulas[id] ?? 0) <= 0) return 'Você não tem esta pílula.';
  if (id === 'rompimento' && estado.efeitos.rompimento > 0) return 'Uma Pílula Quebra-Gargalo já está fazendo efeito no próximo rompimento.';
  if (id === 'rompimento' && P.noNivelMaximo(estado)) return 'Não há mais rompimentos por enquanto.';
  return null;
}

// Usa 1 pílula. Devolve { tipo, ganho? } ou null.
export function usarPilula(estado, id) {
  if (motivoParaNaoUsarPilula(estado, id)) return null;
  const tipo = PILULA_POR_ID[id];
  estado.pilulas[id] -= 1;
  if (id === 'acumulo') {
    const ganho = P.producaoPorSegundo(estado) * tipo.segundosDeCultivo;
    P.ganharCultivo(estado, ganho);
    return { tipo, ganho };
  }
  if (id === 'fluxo') {
    estado.efeitos.fluxo = (estado.efeitos.fluxo ?? 0) + tipo.segundos;   // tomar outra soma o tempo
    return { tipo };
  }
  estado.efeitos.rompimento = descontoDaQuebraGargalo(estado);
  return { tipo };
}

export function temAlgumaPilula(estado) {
  return PI.tipos.some(t => (estado.pilulas[t.id] ?? 0) > 0);
}
