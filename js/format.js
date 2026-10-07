// =============================================================
// format.js — deixa números grandes legíveis: 1234567 → "1.23M"
// =============================================================

const SUFIXOS = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];

export function formatarNumero(numero) {
  if (numero < 1000) {
    // Números pequenos: até 1 casa decimal (ex.: 12.5), sem ".0" sobrando
    return Number(numero.toFixed(1)).toString();
  }

  // Cada sufixo vale 1000× o anterior
  const indice = Math.floor(Math.log10(numero) / 3);

  if (indice >= SUFIXOS.length) {
    return numero.toExponential(2); // ex.: 1.23e+36
  }

  const valor = numero / Math.pow(1000, indice);
  return valor.toFixed(2) + SUFIXOS[indice];
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
