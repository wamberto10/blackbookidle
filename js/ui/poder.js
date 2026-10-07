// =============================================================
// ui/poder.js — TEXTOS DO PODER E DA PREVISÃO DE LUTA
// (as contas ficam em sistemas/atributos.js)
// =============================================================
import { CONFIG } from '../config.js';
import { calcularAtributos, poderTotal, poderDoInimigo, preverLuta } from '../sistemas/atributos.js';
import { formatarNumero } from '../format.js';

const TEXTOS = {
  facil:     { texto: 'Vitória fácil',    classe: 'previsao-facil' },
  segura:    { texto: 'Vitória segura',   classe: 'previsao-segura' },
  arriscada: { texto: 'Vitória arriscada', classe: 'previsao-arriscada' },
  derrota:   { texto: 'Derrota provável', classe: 'previsao-derrota' },
  tempo:     { texto: 'Tempo insuficiente', classe: 'previsao-derrota' },
};

// Previsão da luta contra a fase, já com texto e cor
export function previsaoDaFase(estado, fase) {
  const jogador = calcularAtributos(estado);
  const p = preverLuta(jogador, fase, CONFIG.combate.duracaoMaxima / CONFIG.combate.duracaoDoTurno);
  return { ...p, ...TEXTOS[p.resultado], poderInimigo: poderDoInimigo(fase), poderJogador: poderTotal(jogador) };
}

export function textoDaPrevisao(prev) {
  if (prev.resultado === 'derrota' || prev.resultado === 'tempo') return prev.texto;
  return `${prev.texto} · ~${prev.turnosParaVencer} turno(s) · sobra ${Math.round(prev.sobra * 100)}% da vida`;
}

export function textoDoPoder(valor) {
  return formatarNumero(valor);
}
