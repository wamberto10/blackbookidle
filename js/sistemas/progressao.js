// =============================================================
// sistemas/progressao.js — CULTIVO, ESTÁGIOS E ROMPIMENTOS
// Só regras e cálculos. Nada de tela aqui.
// =============================================================
import { CONFIG } from '../config.js';
import { REINOS, REGIOES } from '../dados/reinos.js';
import { multiplicadorMelhoria } from './blackbook.js';
import { bonusEquipamentos } from './itens.js';
import { classeDe } from './personagem.js';

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

// Requisito de combate para o PRÓXIMO avanço: romper o reino (mapaParaRomper) ou, v0.22.0, subir para um
// estágio travado (mapaParaEstagio — o Céu Aberto atravessa vários mundos: 4ª Ordem só depois do Mapa 48).
// Devolve null se não houver requisito, ou { mapa, cumprido, rompimento }.
export function requisitoDoRompimento(estado) {
  if (noNivelMaximo(estado)) return null;
  const rompimento = proximoEhRompimento(estado);
  const reino = reinoAtual(estado);
  const mapa = rompimento ? reino.mapaParaRomper : reino.mapaParaEstagio?.[estado.estagio + 1];
  if (!mapa) return null;
  const ultimaFaseDoMapa = mapa * CONFIG.combate.fasesPorMapa - 1;
  return { mapa, cumprido: estado.combate.fasesConcluidas >= ultimaFaseDoMapa, rompimento };
}

// ---- Fórmulas ----
// Produção "pura" em um nível (sem bônus). Também usada para calcular recompensas de combate.
export function producaoNoNivel(nivel, indiceReino) {
  return C.producaoBase * Math.pow(C.crescimentoProducao, nivel) * Math.pow(C.bonusPorReino, indiceReino);
}

export function producaoPorSegundo(estado) {
  const bonusDosItens = 1 + bonusEquipamentos(estado).cultivo / 100;   // ex.: Berloque +5% Cultivo
  const bonusDaClasse = 1 + (classeDe(estado).multiplicar.cultivo ?? 0);   // Alquimista: +50%
  return producaoNoNivel(indiceNivel(estado), estado.reino) * multiplicadorMelhoria(estado, 'cultivo') * bonusDosItens * bonusDaClasse *
    bonusDoCaminho(estado);
}

// ---- v0.21.0: bônus do cultivo vindos da lore (as ações ficam em sistemas/cultivoAvancado.js) ----
const indiceDoReino = (id) => REINOS.findIndex(r => r.id === id);
export const REINO_DA_RECLUSAO = indiceDoReino(CONFIG.reclusao.reinoMinimo);
export const REINO_DO_MESTRE_ESTELAR = indiceDoReino(CONFIG.mestreEstelar.reino);
const REINO_DO_1O_BATISMO = indiceDoReino(CONFIG.batismo.primeiroReino);
const REINO_DO_SENTIDO_DIVINO = REINOS.findIndex(r => r.liberaSentidoDivino);
const PILULA_DO_FLUXO = CONFIG.pilulas.tipos.find(t => t.id === 'fluxo');

// Reclusão: +25% ao entrar, crescendo até +75% depois de 4 h (CONFIG.reclusao)
export function bonusDaReclusao(estado) {
  const r = estado.reclusao;
  if (!r?.ativa) return 0;
  const R = CONFIG.reclusao;
  const fundo = Math.min(1, r.segundos / (R.horasParaOMaximo * 3600));
  return R.bonusInicial + (R.bonusMaximo - R.bonusInicial) * fundo;
}

export function bonusDoArranjo(estado) {
  return (estado.arranjo ?? 0) * CONFIG.arranjo.bonusPorNivel;
}

// Todos os bônus do caminho juntos: Reclusão, Arranjo, Mestre Estelar, Iluminação e Pílula do Fluxo
export function bonusDoCaminho(estado) {
  const e = estado.efeitos ?? {};
  return (1 + bonusDaReclusao(estado)) * (1 + bonusDoArranjo(estado)) *
    (estado.mestreEstelar ? 1 + CONFIG.mestreEstelar.bonusCultivo : 1) *
    (e.iluminacao > 0 ? CONFIG.iluminacao.multiplicador : 1) *
    (e.fluxo > 0 ? PILULA_DO_FLUXO.multiplicador : 1);
}

// Batismo Mundial: 1 a cada rompimento a partir da Transformação do Qi (vale nos atributos, ver atributos.js)
export function batismosMundiais(estado) {
  return Math.max(0, estado.reino - REINO_DO_1O_BATISMO + 1);
}

// Tem Sentido Divino? (Ascensão Imortal, Cultivador de Alma desde o início, ou "a alma se lembra")
export function temSentidoDivino(estado) {
  return estado.reino >= REINO_DO_SENTIDO_DIVINO || Boolean(classeDe(estado).especial?.sentidoDesdeOInicio) ||
    (estado.reencarnacao?.sentidoDivinoMaximo ?? 0) > 0;
}

export function custoParaAvancar(estado) {
  let custo = C.custoBase * Math.pow(C.crescimentoCusto, indiceNivel(estado));
  // v0.21.0: a Pílula Quebra-Gargalo deixa o próximo rompimento mais barato
  if (proximoEhRompimento(estado)) custo *= C.multiplicadorRompimento * (1 - (estado.efeitos?.rompimento ?? 0));
  return Math.ceil(custo);
}

export function ganhoDaMeditacao(estado) {
  // v0.21.0: o Sentido Divino guia a meditação (+50%)
  const sentido = temSentidoDivino(estado) ? 1 + CONFIG.meditacaoComSentido : 1;
  return Math.max(C.meditacaoMinima, producaoPorSegundo(estado) * C.segundosPorMeditacao * sentido);
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
    if (estado.efeitos) estado.efeitos.rompimento = 0;   // a Pílula Quebra-Gargalo foi usada neste rompimento
  } else {
    estado.estagio += 1;
  }

  const reino = reinoAtual(estado);
  return {
    tipo: rompimento ? 'rompimento' : 'estagio',
    nome: nomeDoNivel(estado),
    reino,
    marco: reino.marcos?.[estado.estagio] ?? null,
    batismo: rompimento && batismosMundiais(estado) > 0,   // v0.21.0: este rompimento trouxe um Batismo Mundial
  };
}

// ---- Passagem do tempo ----
// Chamado várias vezes por segundo. "segundos" = tempo desde a última chamada.
// aoEvento é uma função opcional chamada a cada avanço automático.
export function atualizar(estado, segundos, aoEvento) {
  ganharCultivo(estado, producaoPorSegundo(estado) * segundos);
  estado.estatisticas.tempoJogado += segundos;
  // v0.21.0: tempo da Reclusão e dos efeitos (Iluminação, Pílula do Fluxo) — conta também com o jogo fechado
  if (estado.reclusao?.ativa) estado.reclusao.segundos += segundos;
  const e = estado.efeitos;
  if (e) {
    if (e.iluminacao > 0) e.iluminacao = Math.max(0, e.iluminacao - segundos);
    if (e.fluxo > 0) e.fluxo = Math.max(0, e.fluxo - segundos);
  }

  // Avanço automático (opção "auto"): só estágios. Rompimentos são manuais...
  // ...a não ser com o VIP (v0.9.13, dono): aí o rompimento é automático assim que
  // os requisitos (cultivo + chefe do mapa) forem cumpridos.
  while (podeAvancar(estado)) {
    const rompimento = proximoEhRompimento(estado);
    if (rompimento ? !estado.vip : !estado.opcoes.autoAvancar) break;
    const evento = avancar(estado);
    if (aoEvento) aoEvento(evento);
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
