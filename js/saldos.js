// =============================================================
// saldos.js — SALDOS SEM PERDA DE PRECISÃO (v0.33.2)
//
// Um número grande (numeros.js) guarda ~16 algarismos. Sozinho, tirar 1e5980 de um saldo de 3e6000 não muda a
// mantissa — a compra sairia de graça — e um ganho muito menor que o saldo sumiria. Por isso cada saldo abaixo é
// uma CONTA: o valor continua no lugar de sempre (estado.essencia, estado.pedras...) e estado.residuos[conta]
// guarda, com sinal, a parte que o arredondamento do valor não consegue guardar (ganhos − gastos ainda pequenos
// demais para mudar a última casa). Cada movimento é uma soma compensada (como a de Kahan/Neumaier):
//   valor + quantia = s + erro (erro = o que o arredondamento de s perdeu); erro + resíduo volta a ser somado em s,
//   e o que de novo não couber fica como resíduo.
//   - toda compra é cobrada e todo ganho conta: saldo verdadeiro = valor + resíduo;
//   - o erro que sobra é da ordem de 1e-16 da quantia movimentada, não do saldo;
//   - "cabe" subtrai primeiro as parcelas de tamanho parecido, então a reserva e o saldo justo são respeitados.
// O resto do jogo continua lendo estado.essencia etc. para mostrar (o resíduo é menor que a última casa do valor);
// compras, ganhos e o "dá para pagar?" passam por aqui.
// =============================================================
import { somar, subtrair, multiplicar, comparar, ehZero, sinal } from './numeros.js';

export const CONTAS = ['cultivo', 'cultivoTotal', 'pedras', 'essencia', 'estatisticas.essenciaConquistas', 'estatisticas.essenciaFarm'];

function lugar(estado, conta) {
  const ponto = conta.indexOf('.');
  return ponto < 0 ? [estado, conta] : [estado[conta.slice(0, ponto)], conta.slice(ponto + 1)];
}
const modulo = (x) => (typeof x === 'number' ? Math.abs(x) : multiplicar(x, sinal(x)));

// O resíduo nunca passa de ~1 casa abaixo da última do valor (|r| ≲ 2e-16 × |valor|). Se passar de 1e-12 × |valor|,
// alguém escreveu o saldo direto (migração antiga, ferramenta de teste) e o resíduo era de outro valor: é descartado.
const LIMITE = 1e-12;
function vale(valor, r) {
  if (typeof r === 'number' && typeof valor === 'number') return Math.abs(r) <= Math.abs(valor) * LIMITE;
  return comparar(modulo(r), multiplicar(modulo(valor), LIMITE)) <= 0;
}

export function valorDe(estado, conta) {
  const [dono, campo] = lugar(estado, conta);
  return dono[campo] ?? 0;
}
export function residuoDe(estado, conta) {
  const r = estado.residuos?.[conta] ?? 0;
  return ehZero(r) || vale(valorDe(estado, conta), r) ? r : 0;
}
// Saldo verdadeiro (valor + resíduo). Para mostrar, estado[conta] já basta.
export function saldo(estado, conta) {
  return somar(valorDe(estado, conta), residuoDe(estado, conta));
}

// a + b = s + erro. O erro é calculado a partir da parcela maior (soma rápida de dois: exata para números comuns;
// nos grandes, fica a ~1e-16 da parcela menor).
function somaComErro(a, b) {
  const s = somar(a, b);
  if (typeof a === 'number' && typeof b === 'number' && typeof s === 'number') {
    return [s, somar(Math.abs(a) >= Math.abs(b) ? b - (s - a) : a - (s - b), 0)];   // (somar ..., 0: forma única)
  }
  const [grande, pequeno] = comparar(modulo(a), modulo(b)) >= 0 ? [a, b] : [b, a];
  return [s, subtrair(pequeno, subtrair(s, grande))];
}

// Soma "delta" (com sinal) na conta
function aplicar(estado, conta, delta) {
  const [dono, campo] = lugar(estado, conta);
  const [s, erro] = somaComErro(dono[campo] ?? 0, delta);
  const [novo, resto] = somaComErro(s, somar(residuoDe(estado, conta), erro));
  // (no limite de 1 casa do arredondamento de "cabe", nunca deixa um saldo negativo)
  if (sinal(novo) < 0 || (ehZero(novo) && sinal(resto) < 0)) {
    dono[campo] = 0;
    if (estado.residuos) delete estado.residuos[conta];
    return;
  }
  dono[campo] = novo;
  if (ehZero(resto) || !vale(novo, resto)) { if (estado.residuos) delete estado.residuos[conta]; }
  else (estado.residuos ??= {})[conta] = resto;
}

export function creditar(estado, conta, quantia) {
  if (!ehZero(quantia)) aplicar(estado, conta, quantia);
}

// O saldo verdadeiro menos a quantia fica ≥ reserva?  (valor − maior − menor) ≥ −resíduo, onde maior/menor são
// quantia e reserva: subtrair primeiro a parcela do tamanho do valor deixa a conta exata no caso apertado.
export function cabe(estado, conta, quantia, reserva = 0) {
  const [maior, menor] = comparar(modulo(quantia), modulo(reserva)) >= 0 ? [quantia, reserva] : [reserva, quantia];
  const sobra = subtrair(subtrair(valorDe(estado, conta), maior), menor);
  return comparar(sobra, multiplicar(residuoDe(estado, conta), -1)) >= 0;
}

// Tira a quantia se couber (sem reserva). Devolve true se pagou.
export function debitar(estado, conta, quantia) {
  if (!cabe(estado, conta, quantia)) return false;
  if (!ehZero(quantia)) aplicar(estado, conta, multiplicar(quantia, -1));
  return true;
}

// Para resumos ("+X Cultivo enquanto você estava fora"): quanto a conta mudou desde o instantâneo
export function instantaneo(estado, conta) {
  return { valor: valorDe(estado, conta), residuo: residuoDe(estado, conta) };
}
export function variacaoDesde(estado, conta, antes) {
  return somar(subtrair(valorDe(estado, conta), antes.valor), subtrair(residuoDe(estado, conta), antes.residuo));
}
