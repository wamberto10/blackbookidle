// =============================================================
// sistemas/progressao.js — CULTIVO, ESTÁGIOS E ROMPIMENTOS
// Só regras e cálculos. Nada de tela aqui.
// =============================================================
import { CONFIG } from '../config.js';
import { REINOS, REGIOES } from '../dados/reinos.js';
import { multiplicadorMelhoria } from './blackbook.js';
import { bonusEquipamentos } from './itens.js';

const C = CONFIG.cultivo;

// ---- Mapa de níveis ----
// Cada reino começa em um "nível" global. Ex.: Corpo Temperado = 0..8,
// Elemento Inicial = 9..17, e assim por diante.
const INICIO_DO_REINO = [];
let contador = 0;
for (const reino of REINOS) {
  INICIO_DO_REINO.push(contador);
  contador += reino.estagios.length;
}
export const TOTAL_DE_NIVEIS = contador;

export function inicioDoReino(indiceReino) {
  return INICIO_DO_REINO[indiceReino];
}

// ---- Consultas ----
export function indiceNivel(estado) {
  return INICIO_DO_REINO[estado.reino] + estado.estagio;
}

export function reinoAtual(estado) {
  return REINOS[estado.reino];
}

export function regiaoAtual(estado) {
  return REGIOES[reinoAtual(estado).regiao];
}

export function nomeDoEstagio(estado) {
  return reinoAtual(estado).estagios[estado.estagio];
}

export function nomeDoNivel(estado) {
  return `${reinoAtual(estado).nome} — ${nomeDoEstagio(estado)}`;
}

export function noNivelMaximo(estado) {
  return indiceNivel(estado) === TOTAL_DE_NIVEIS - 1;
}

// O próximo avanço é um rompimento de reino? (está no último estágio do reino)
export function proximoEhRompimento(estado) {
  const ultimoEstagio = reinoAtual(estado).estagios.length - 1;
  return estado.estagio === ultimoEstagio && !noNivelMaximo(estado);
}

// Nome de onde o jogador vai chegar ao avançar
export function nomeDoProximoNivel(estado) {
  if (noNivelMaximo(estado)) return '—';
  if (proximoEhRompimento(estado)) {
    const proximo = REINOS[estado.reino + 1];
    return `${proximo.nome} — ${proximo.estagios[0]}`;
  }
  return `${reinoAtual(estado).nome} — ${reinoAtual(estado).estagios[estado.estagio + 1]}`;
}

// Requisito de combate para romper o reino atual.
// Devolve null se não houver requisito, ou { mapa, cumprido }.
export function requisitoDoRompimento(estado) {
  if (!proximoEhRompimento(estado)) return null;
  const mapa = reinoAtual(estado).mapaParaRomper;
  if (!mapa) return null;
  const ultimaFaseDoMapa = mapa * CONFIG.combate.fasesPorMapa - 1;
  return { mapa, cumprido: estado.combate.fasesConcluidas >= ultimaFaseDoMapa };
}

// ---- Fórmulas ----
// Produção "pura" em um nível (sem bônus). Também usada para calcular recompensas de combate.
export function producaoNoNivel(nivel, indiceReino) {
  return C.producaoBase * Math.pow(C.crescimentoProducao, nivel) * Math.pow(C.bonusPorReino, indiceReino);
}

export function producaoPorSegundo(estado) {
  const bonusDosItens = 1 + bonusEquipamentos(estado).cultivo / 100;   // ex.: Berloque +5% Cultivo
  return producaoNoNivel(indiceNivel(estado), estado.reino) * multiplicadorMelhoria(estado, 'cultivo') * bonusDosItens;
}

export function custoParaAvancar(estado) {
  let custo = C.custoBase * Math.pow(C.crescimentoCusto, indiceNivel(estado));
  if (proximoEhRompimento(estado)) custo *= C.multiplicadorRompimento;
  return Math.ceil(custo);
}

export function ganhoDaMeditacao(estado) {
  return Math.max(C.meditacaoMinima, producaoPorSegundo(estado) * C.segundosPorMeditacao);
}

// ---- Ações ----
export function ganharCultivo(estado, quantidade) {
  estado.cultivo += quantidade;
  estado.cultivoTotal += quantidade;
}

export function meditar(estado) {
  const ganho = ganhoDaMeditacao(estado);
  ganharCultivo(estado, ganho);
  estado.estatisticas.meditacoes += 1;
  return ganho;
}

export function podeAvancar(estado) {
  if (noNivelMaximo(estado)) return false;
  const requisito = requisitoDoRompimento(estado);
  if (requisito && !requisito.cumprido) return false;
  return estado.cultivo >= custoParaAvancar(estado);
}

// Avança um estágio (ou rompe o reino). Devolve um "evento" descrevendo
// o que aconteceu, ou null se não foi possível avançar.
export function avancar(estado) {
  if (!podeAvancar(estado)) return null;

  const rompimento = proximoEhRompimento(estado);
  estado.cultivo -= custoParaAvancar(estado);

  if (rompimento) {
    estado.reino += 1;
    estado.estagio = 0;
    estado.estatisticas.rompimentos += 1;
  } else {
    estado.estagio += 1;
  }

  const reino = reinoAtual(estado);
  return {
    tipo: rompimento ? 'rompimento' : 'estagio',
    nome: nomeDoNivel(estado),
    reino,
    marco: reino.marcos?.[estado.estagio] ?? null,
  };
}

// ---- Passagem do tempo ----
// Chamado várias vezes por segundo. "segundos" = tempo desde a última chamada.
// aoEvento é uma função opcional chamada a cada avanço automático.
export function atualizar(estado, segundos, aoEvento) {
  ganharCultivo(estado, producaoPorSegundo(estado) * segundos);
  estado.estatisticas.tempoJogado += segundos;

  // Avanço automático: só estágios. Rompimentos são sempre manuais.
  if (estado.opcoes.autoAvancar) {
    while (podeAvancar(estado) && !proximoEhRompimento(estado)) {
      const evento = avancar(estado);
      if (aoEvento) aoEvento(evento);
    }
  }
}

// Simula o tempo offline em pequenos pedaços, para que estágios
// avançados automaticamente aumentem a produção durante a simulação.
export function simularOffline(estado, segundos) {
  const cultivoAntes = estado.cultivoTotal;
  const eventos = [];
  const passos = Math.min(2000, Math.max(1, Math.ceil(segundos)));
  const tamanhoDoPasso = segundos / passos;

  for (let i = 0; i < passos; i++) {
    atualizar(estado, tamanhoDoPasso, (evento) => eventos.push(evento));
  }

  return { ganho: estado.cultivoTotal - cultivoAntes, eventos };
}
