// =============================================================
// sistemas/motor.js — O TEMPO DO JOGO (v0.33.0)
//
// O jogo anda em PASSOS de 1 segundo de tempo de jogo. Cada passo: cultivo (e avanços automáticos), combate das
// fases e, a cada CONFIG.automacao.intervaloSegundos, o gerenciamento automático (sistemas/automacao.js).
// O mesmo passo é usado com o jogo aberto, em segundo plano, offline e pelo robô de testes. Quem chama só diz
// quanto tempo passou: a fração de segundo que sobra fica em estado.relogio.resto (vai no save) e entra no
// próximo passo. Assim dividir o tempo em pedaços diferentes (10 min, 1 h, 8 h, offline...) dá o mesmo jogo.
// =============================================================
import { CONFIG } from '../config.js';
import * as P from './progressao.js';
import * as C from './combate.js';
import { executarAutomacao } from './automacao.js';

export const PASSO = 1;
const emLotes = new WeakSet();
const segundosValidos = (segundos) => {
  if (!Number.isFinite(segundos)) throw new RangeError('Tempo de jogo inválido');
  return Math.max(0, segundos);
};
function aceitarTempo(estado, segundos) {
  const resto = estado.relogio.resto;
  const novo = resto + segundosValidos(segundos);
  if (!Number.isFinite(resto) || resto < 0 || !Number.isFinite(novo) || novo > Number.MAX_SAFE_INTEGER) {
    throw new RangeError('Tempo pendente inválido ou acima da precisão do relógio');
  }
  estado.relogio.resto = novo;
}

function consumirPassos(estado, ouvintes, limite = Infinity) {
  const r = estado.relogio;
  let passos = 0;
  while (r.resto >= PASSO - 1e-9 && passos < limite) {
    r.resto = Math.max(0, r.resto - PASSO);
    avancarUmPasso(estado, ouvintes);
    passos += 1;
  }
  return passos;
}

// ouvintes (todos opcionais): aoAvancarNivel(evento), aoEventoCombate(evento), aoAutomacao(relatorio),
// combatePausado() → true enquanto o combate das fases não deve andar (luta do Evento de Boss, só com o jogo aberto)
export function avancarUmPasso(estado, ouvintes = {}) {
  P.atualizar(estado, PASSO, ouvintes.aoAvancarNivel);
  if (!ouvintes.combatePausado?.()) C.atualizarCombate(estado, PASSO, ouvintes.aoEventoCombate);
  const a = estado.automacao;
  a.segundos += PASSO;
  if (a.segundos >= CONFIG.automacao.intervaloSegundos) {
    a.segundos -= CONFIG.automacao.intervaloSegundos;
    executarAutomacao(estado, ouvintes.aoAutomacao);
  }
}

// Passa "segundos" de jogo (pode ser fração). Devolve quantos passos inteiros rodou.
export function avancar(estado, segundos, ouvintes = {}) {
  if (emLotes.has(estado)) throw new Error('O progresso deste personagem já está sendo processado');
  aceitarTempo(estado, segundos);
  return consumirPassos(estado, ouvintes);
}

// Navegador: cede a interface entre lotes limitados. O tempo aceito entra no relógio ANTES do primeiro lote;
// salvar/fechar entre lotes preserva o restante, sem repagar o tempo já consumido ao recarregar.
// A API síncrona acima continua disponível para o robô/CLI e passos curtos do jogo aberto.
export async function avancarEmLotes(estado, segundos, ouvintes = {}, opcoes = {}) {
  if (emLotes.has(estado)) throw new Error('O progresso deste personagem já está sendo processado');
  const limite = opcoes.passosPorLote ?? 250;
  if (!Number.isSafeInteger(limite) || limite < 1) throw new RangeError('Tamanho de lote inválido');
  const ceder = opcoes.ceder ?? (() => new Promise(resolve => setTimeout(resolve, 0)));
  aceitarTempo(estado, segundos);
  const total = Math.max(0, Math.floor((estado.relogio.resto + 1e-9) / PASSO));
  let passos = 0;
  emLotes.add(estado);
  try {
    while (estado.relogio.resto >= PASSO - 1e-9) {
      passos += consumirPassos(estado, ouvintes, limite);
      const pendentes = Math.max(0, total - passos);
      opcoes.aoLote?.({ passos, pendentes, total });
      if (pendentes > 0) await ceder();
    }
    return passos;
  } finally {
    emLotes.delete(estado);
  }
}
