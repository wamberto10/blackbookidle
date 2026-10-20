// =============================================================
// numeros.js — NÚMEROS GRANDES (v0.33.0)
//
// Cultivo, Pedras, Essência, atributos, vida dos inimigos, custos e recompensas passam de 1e308 (o maior número
// comum do JavaScript) lá no Infinito. Todo valor desses é guardado assim:
//   - número comum, enquanto |x| estiver entre 1e-290 e 1e290 (ou for 0) — rápido, igual a antes;
//   - Grande { m, e } = m × 10^e (1 ≤ |m| < 10, e inteiro), fora dessa faixa — sem limite prático.
// A forma é única (um valor que cabe vira número comum de novo), então salvar → carregar dá o mesmo save.
// Precisão: a de um número comum (~15–16 algarismos) na mantissa; somar algo 1e17 vezes menor não muda o total.
// Regras: NUNCA use + - * / < > Math.* direto num valor desses — use as funções daqui. Um Grande usado como
// número dispara erro (valueOf), em vez de virar Infinity/NaN em silêncio. Probabilidades, níveis, índices,
// porcentagens e tempos continuam números comuns.
// No save: número comum como número; Grande como texto "m e e" (ex.: "1.2345e5678"). ler() desfaz.
// =============================================================

const FAIXA = 1e290;          // acima disso (ou abaixo de 1/FAIXA) o valor vira Grande
const ALGARISMOS = 17;        // diferença de expoente a partir da qual o menor some na soma

export class Grande {
  constructor(m, e) { this.m = m; this.e = e; }
  valueOf() { throw new TypeError('Número grande usado como número comum — use as funções de numeros.js'); }
  toJSON() { return `${this.m}e${this.e}`; }
  toString() { return `${this.m.toFixed(3)}e${this.e}`; }
}

// ---- forma única ----
function grandeDe(m, e) {
  if (m === 0) return 0;
  if (!Number.isFinite(m) || !Number.isFinite(e)) throw new RangeError(`Número inválido: ${m}e${e}`);
  const [mm, k] = partes(m);
  return comoValor(mm, e + k);
}
// (m, e) já normalizados → número comum se couber, senão Grande
function comoValor(m, e) {
  if (m === 0) return 0;
  if (e > -290 && e < 290) return m * Math.pow(10, e);
  return new Grande(m, e);
}
// valor → [m, e]
function partes(x) {
  if (x instanceof Grande) return [x.m, x.e];
  if (typeof x !== 'number' || !Number.isFinite(x)) throw new RangeError(`Número inválido: ${x}`);
  if (x === 0) return [0, 0];
  // Number.MIN_VALUE tem expoente decimal -324, mas 10^-324 já é zero.
  // Desloca só os extremos antes de decompor, inclusive perto de Number.MAX_VALUE.
  let deslocamento = 0;
  if (Math.abs(x) < 1e-290) { x *= 1e300; deslocamento = -300; }
  else if (Math.abs(x) >= 1e290) { x *= 1e-300; deslocamento = 300; }
  const e = Math.floor(Math.log10(Math.abs(x))) + deslocamento;
  let m = x / Math.pow(10, e - deslocamento);
  if (Math.abs(m) >= 10) return [m / 10, e + 1];
  if (Math.abs(m) < 1) return [m * 10, e - 1];
  return [m, e];
}
const cabe = (r) => Number.isFinite(r) && (r === 0 || (Math.abs(r) < FAIXA && Math.abs(r) > 1 / FAIXA));

export const ehGrande = (x) => x instanceof Grande;
// Número comum finito ou Grande válido
export const ehValido = (x) => (x instanceof Grande ? Number.isFinite(x.m) && Number.isFinite(x.e) : typeof x === 'number' && Number.isFinite(x));

// ---- aritmética ----
export function somar(a, b) {
  if (typeof a === 'number' && typeof b === 'number') {
    const r = a + b;
    if (cabe(r)) return r;
  }
  let [m1, e1] = partes(a);
  let [m2, e2] = partes(b);
  if (m1 === 0) return comoValor(m2, e2);
  if (m2 === 0) return comoValor(m1, e1);
  if (e1 < e2) { [m1, e1, m2, e2] = [m2, e2, m1, e1]; }
  const d = e1 - e2;
  if (d > ALGARISMOS) return comoValor(m1, e1);
  return grandeDe(m1 + m2 * Math.pow(10, -d), e1);
}
export function subtrair(a, b) {
  if (typeof a === 'number' && typeof b === 'number') {
    const r = a - b;
    if (cabe(r)) return r;
  }
  return somar(a, multiplicar(b, -1));
}
export function multiplicar(a, b) {
  if (typeof a === 'number' && typeof b === 'number') {
    const r = a * b;
    if (cabe(r) && (r !== 0 || a === 0 || b === 0)) return r;
  }
  const [m1, e1] = partes(a);
  const [m2, e2] = partes(b);
  if (m1 === 0 || m2 === 0) return 0;
  return grandeDe(m1 * m2, e1 + e2);
}
export function dividir(a, b) {
  if (typeof a === 'number' && typeof b === 'number') {
    const r = a / b;
    if (cabe(r) && (r !== 0 || a === 0)) return r;
  }
  const [m1, e1] = partes(a);
  const [m2, e2] = partes(b);
  if (m2 === 0) throw new RangeError('Divisão por zero');
  if (m1 === 0) return 0;
  return grandeDe(m1 / m2, e1 - e2);
}
// a^k (a ≥ 0, k número comum)
export function elevar(a, k) {
  if (typeof a === 'number') {
    const r = Math.pow(a, k);
    if (cabe(r) && (r !== 0 || a === 0)) return r;
  }
  if (ehZero(a)) return k === 0 ? 1 : 0;
  return deLog10(log10(a) * k);
}
// base^k com base e k números comuns (ex.: 1,05^nível) — nunca estoura
export function potencia(base, k) {
  const r = Math.pow(base, k);
  if (cabe(r) && (r !== 0 || base === 0)) return r;
  return deLog10(Math.log10(base) * k);
}
export function raiz(a) {
  if (typeof a === 'number') return Math.sqrt(a);
  return deLog10(log10(a) / 2);
}

// ---- logaritmos ----
export function log10(a) {
  if (typeof a === 'number') return Math.log10(a);
  return a.e + Math.log10(a.m);   // (só positivos)
}
export const ln = (a) => log10(a) * Math.LN10;
export function deLog10(L) {
  if (!Number.isFinite(L)) throw new RangeError(`Logaritmo inválido: ${L}`);
  if (L > -289 && L < 289) return Math.pow(10, L);
  const e = Math.floor(L);
  return grandeDe(Math.pow(10, L - e), e);
}
export const deLn = (l) => deLog10(l / Math.LN10);

// ---- comparações ----
export function comparar(a, b) {
  if (typeof a === 'number' && typeof b === 'number') return a < b ? -1 : a > b ? 1 : 0;
  const [m1, e1] = partes(a);
  const [m2, e2] = partes(b);
  const s1 = Math.sign(m1), s2 = Math.sign(m2);
  if (s1 !== s2) return s1 < s2 ? -1 : 1;
  if (s1 === 0) return 0;
  if (e1 !== e2) return (e1 < e2 ? -1 : 1) * s1;
  return m1 < m2 ? -1 : m1 > m2 ? 1 : 0;
}
export const maiorOuIgual = (a, b) => comparar(a, b) >= 0;
export const maior = (a, b) => comparar(a, b) > 0;
export const menor = (a, b) => comparar(a, b) < 0;
export const menorOuIgual = (a, b) => comparar(a, b) <= 0;
export const maximo = (a, b) => (comparar(a, b) >= 0 ? a : b);
export const minimo = (a, b) => (comparar(a, b) <= 0 ? a : b);
export const ehZero = (a) => (typeof a === 'number' ? a === 0 : a.m === 0);
export const sinal = (a) => (typeof a === 'number' ? Math.sign(a) : Math.sign(a.m));

// ---- conversões ----
// Número comum (Infinity / -Infinity / 0 quando passa da faixa do JavaScript) — use só para razões e telas
export function paraNumero(a) {
  if (typeof a === 'number') return a;
  if (a.e > 308) return a.m > 0 ? Infinity : -Infinity;
  if (a.e < -324) return 0;
  return a.e < -300 ? a.m * Math.pow(10, a.e + 300) * 1e-300 : a.m * Math.pow(10, a.e);
}
// Razão a ÷ b como número comum (ex.: força relativa, % de vida) — limitada a ±1e300
export function razao(a, b) {
  const r = paraNumero(dividir(a, b));
  return Math.max(-1e300, Math.min(1e300, r));
}
// Arredonda para cima (custos). Acima de ~1e15 já não há casas decimais para arredondar.
export function arredondarParaCima(a) {
  return typeof a === 'number' ? Math.ceil(a) : a;
}
export function arredondarParaBaixo(a) {
  return typeof a === 'number' ? Math.floor(a) : a;
}

// Lê um valor do save (número, texto "m e e" ou Grande). Lança erro se for inválido.
export function ler(valor) {
  if (valor instanceof Grande) return valor;
  if (typeof valor === 'number') {
    if (!Number.isFinite(valor)) throw new RangeError(`Número inválido no save: ${valor}`);
    return cabe(valor) ? valor : grandeDe(...partes(valor));
  }
  if (typeof valor === 'string') {
    const m = valor.trim().match(/^(-?\d+(?:\.\d+)?(?:e[+-]?\d+)?)e([+-]?\d+)$/i) ?? valor.trim().match(/^(-?[\d.]+)()$/);
    if (m) {
      const mant = Number(m[1]), exp = m[2] === '' ? 0 : Number(m[2]);
      if (Number.isFinite(mant) && Number.isFinite(exp)) return grandeDe(...partes(mant).map((v, i) => (i === 1 ? v + exp : v)));
    }
  }
  throw new RangeError(`Número inválido no save: ${JSON.stringify(valor)}`);
}

// ---- texto ----
const SUFIXOS = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];
// 1234567 → "1.23M" · 1e40 → "1.00e40" · Grande 1.2e5678 → "1.20e5678"
export function formatar(a) {
  if (typeof a === 'number') {
    if (!Number.isFinite(a)) return String(a);
    const sinal = a < 0 ? '-' : '';
    const x = Math.abs(a);
    if (x < 1000) return sinal + Number(x.toFixed(1)).toString();
    const indice = Math.floor(Math.log10(x) / 3);
    if (indice < SUFIXOS.length) return sinal + (x / Math.pow(1000, indice)).toFixed(2) + SUFIXOS[indice];
  }
  const [m, e] = partes(a);
  const arred = Number(Math.abs(m).toFixed(2));
  const [mm, ee] = arred >= 10 ? [arred / 10, e + 1] : [arred, e];
  return `${m < 0 ? '-' : ''}${mm.toFixed(2)}e${ee}`;
}
