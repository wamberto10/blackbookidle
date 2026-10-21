// =============================================================
// format.js — deixa números grandes legíveis: 1234567 → "1.23M"
// v0.33.0: aceita os números grandes de numeros.js (1.23e5678); acima de Dc (1e33) usa "1.23e40"
// =============================================================
import { formatar, multiplicar, potencia } from './numeros.js';

const SUFIXOS = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];

export function formatarNumero(numero) {
  return formatar(numero);
}

// v0.35.1: versão curta para caixas bem estreitas (topo do celular): com mais de 7 letras fica com 1 casa decimal
// ("7.54e9999" → "7.5e9999", "999.99Dc" → "999.9Dc"); o valor completo continua na dica e nas outras telas
export function formatarCurto(numero) {
  const texto = formatar(numero);
  return texto.length > 7 ? texto.replace(/^(-?\d+)\.(\d)\d+/, '$1.$2') : texto;
}

// v0.33.0: lê um número digitado pelo jogador: "1500", "2.5M", "2,5M", "3e40", "1.2Qa", "4e5000".
// Devolve um número grande (numeros.js) ou NaN se não der.
export function lerNumero(texto) {
  const t = String(texto).trim().replace(/\s/g, '').replace(',', '.');
  const m = t.match(/^([0-9]*\.?[0-9]+)(?:e([+-]?[0-9]+))?([a-zA-Z]*)$/i);
  if (!m) return NaN;
  const sufixo = SUFIXOS.findIndex(s => s.toLowerCase() === m[3].toLowerCase());
  if (sufixo < 0) return NaN;
  return multiplicar(Number(m[1]), potencia(10, Number(m[2] ?? 0) + 3 * sufixo));
}

// Formata um atributo conforme seu tipo: 'numero', 'porcento' ou 'decimal'
export function formatarAtributo(valor, formato) {
  if (formato === 'porcento') return valor.toFixed(1) + '%';
  if (formato === 'decimal') return valor.toFixed(2);
  return formatarNumero(valor);
}

// 3725 segundos → "1h 2min"
export function formatarTempo(segundos) {
  const d = Math.floor(segundos / 86400);
  const h = Math.floor((segundos % 86400) / 3600);
  const m = Math.floor((segundos % 3600) / 60);
  const s = Math.floor(segundos % 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}min`;
  if (m > 0) return `${m}min ${s}s`;
  return `${s}s`;
}
