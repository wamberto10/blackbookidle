// =============================================================
// sistemas/progressao.js — CULTIVO, ESTÁGIOS E ROMPIMENTOS
// Só regras e cálculos. Nada de tela aqui.
// =============================================================
import { CONFIG } from '../config.js';
import { REINOS, REGIOES } from '../dados/reinos.js';
import { multiplicadorMelhoria } from './blackbook.js';
import { bonusEquipamentos } from './itens.js';
import { classeDe } from './personagem.js';
import { multiplicar, maximo, potencia, arredondarParaCima } from '../numeros.js';
import { creditar, debitar, cabe, instantaneo, variacaoDesde } from '../saldos.js';   // v0.33.2: sem perda de precisão
// v0.33.0: Cultivo, produção e custos são NÚMEROS GRANDES (js/numeros.js) — nada de + - * / direto neles.

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
// v0.32.0: nível do Fruto do Universo (último estágio dos reinos). Depois dele vem a Maestria da Criação:
// cada nível de Maestria soma 1 ao "nível" (indiceNivel), com ganhos e custos próprios (CONFIG.maestria).
export const NIVEL_DO_FRUTO = TOTAL_DE_NIVEIS - 1;
const ULTIMO_REINO = REINOS.length - 1;
const M = CONFIG.maestria;

export function inicioDoReino(indiceReino) {
  return INICIO_DO_REINO[indiceReino];
}

// ---- Consultas ----
// Nível global: reinos e estágios (0 a 107) + níveis de Maestria da Criação (108 em diante)
export function indiceNivel(estado) {
  return INICIO_DO_REINO[estado.reino] + estado.estagio + (estado.maestria ?? 0);
}

export function nivelDaMaestria(estado) {
  return estado.maestria ?? 0;
}

// Está no Fruto do Universo (último estágio do último reino)? Daí em diante só sobe a Maestria.
export function noUltimoEstagio(estado) {
  return estado.reino === ULTIMO_REINO && estado.estagio === REINOS[ULTIMO_REINO].estagios.length - 1;
}

export function proximoEhMaestria(estado) {
  return noUltimoEstagio(estado);
}

export function reinoAtual(estado) {
  return REINOS[estado.reino];
}

export function regiaoAtual(estado) {
  return REGIOES[reinoAtual(estado).regiao];
}

const nomeDaMaestria = (nivel) => `Maestria ${nivel}`;

export function nomeDoEstagio(estado) {
  const maestria = nivelDaMaestria(estado);
  return maestria > 0 ? nomeDaMaestria(maestria) : reinoAtual(estado).estagios[estado.estagio];
}

export function nomeDoNivel(estado) {
  return `${reinoAtual(estado).nome} — ${nomeDoEstagio(estado)}`;
}

// v0.32.0: depois do Fruto do Universo vem a Maestria da Criação (cada nível exige um chefe mais adiante,
// então quem segura o ritmo é a campanha). v0.33.0: sem limite (o teto de escala do Infinito saiu).
export function noNivelMaximo(estado) {
  return false;
}

// O próximo avanço é um rompimento de reino? (está no último estágio de um reino que não é o último)
export function proximoEhRompimento(estado) {
  const ultimoEstagio = reinoAtual(estado).estagios.length - 1;
  return estado.estagio === ultimoEstagio && estado.reino < ULTIMO_REINO;
}

// Nome de onde o jogador vai chegar ao avançar
export function nomeDoProximoNivel(estado) {
  if (noNivelMaximo(estado)) return '—';
  if (proximoEhMaestria(estado)) return `${reinoAtual(estado).nome} — ${nomeDaMaestria(nivelDaMaestria(estado) + 1)}`;
  if (proximoEhRompimento(estado)) {
    const proximo = REINOS[estado.reino + 1];
    return `${proximo.nome} — ${proximo.estagios[0]}`;
  }
  return `${reinoAtual(estado).nome} — ${reinoAtual(estado).estagios[estado.estagio + 1]}`;
}

// Mapa global (1 = Fácil, Mapa 1 · 97 = Normal, Mapa 1) cujo chefe libera o nível n da Maestria da Criação
export function mapaParaMaestria(nivel) {
  return CONFIG.progressao.mapasPorDificuldade + M.mapasPorNivel * (nivel - 1);
}

// Requisito de combate para o PRÓXIMO avanço: romper o reino (mapaParaRomper) ou, v0.22.0, subir para um
// estágio travado (mapaParaEstagio — o Céu Aberto atravessa vários mundos: 4ª Ordem só depois do Mapa 48).
// v0.32.0: o próximo nível de Maestria exige o chefe de mapaParaMaestria (mapa GLOBAL).
// Devolve null se não houver requisito, ou { mapa, cumprido, rompimento, maestria } (mapa = número global, 1 em diante).
export function requisitoDoRompimento(estado) {
  if (noNivelMaximo(estado)) return null;
  const maestria = proximoEhMaestria(estado);
  const rompimento = proximoEhRompimento(estado);
  const reino = reinoAtual(estado);
  const mapa = maestria ? mapaParaMaestria(nivelDaMaestria(estado) + 1)
    : rompimento ? reino.mapaParaRomper : reino.mapaParaEstagio?.[estado.estagio + 1];
  if (!mapa) return null;
  const ultimaFaseDoMapa = mapa * CONFIG.combate.fasesPorMapa - 1;
  return { mapa, cumprido: estado.combate.fasesConcluidas >= ultimaFaseDoMapa, rompimento, maestria };
}

// ---- Fórmulas ----
// Produção "pura" em um nível (sem bônus). Também usada para calcular recompensas de combate.
// v0.32.0: acima do Fruto do Universo (Maestria, e as fases da Normal em diante) cresce por CONFIG.maestria.
export function producaoNoNivel(nivel, indiceReino) {
  const maestria = Math.max(0, nivel - NIVEL_DO_FRUTO);
  return multiplicar(multiplicar(multiplicar(C.producaoBase, potencia(C.crescimentoProducao, nivel - maestria)),
    potencia(C.bonusPorReino, indiceReino)), potencia(M.ganhoProducao, maestria));
}

export function producaoPorSegundo(estado) {
  const bonusDosItens = 1 + bonusEquipamentos(estado).cultivo / 100;   // ex.: Berloque +5% Cultivo
  const bonusDaClasse = 1 + (classeDe(estado).multiplicar.cultivo ?? 0);   // (nenhuma classe usa hoje)
  return multiplicar(multiplicar(producaoNoNivel(indiceNivel(estado), estado.reino), multiplicadorMelhoria(estado, 'cultivo')),
    bonusDosItens * bonusDaClasse * bonusDoCaminho(estado));
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

// Tem Sentido Divino? (Ascensão Imortal, ou "a alma se lembra")
export function temSentidoDivino(estado) {
  return estado.reino >= REINO_DO_SENTIDO_DIVINO || (estado.reencarnacao?.sentidoDivinoMaximo ?? 0) > 0;
}

export function custoParaAvancar(estado) {
  // v0.32.0: Maestria da Criação — custo próprio, a partir do custo de avançar no Fruto do Universo
  if (proximoEhMaestria(estado)) {
    return arredondarParaCima(multiplicar(multiplicar(C.custoBase * Math.pow(C.crescimentoCusto, NIVEL_DO_FRUTO), M.custoInicial),
      potencia(M.crescimentoCusto, nivelDaMaestria(estado))));
  }
  let custo = multiplicar(C.custoBase, potencia(C.crescimentoCusto, indiceNivel(estado)));
  // v0.21.0: a Pílula Quebra-Gargalo deixa o próximo rompimento mais barato
  if (proximoEhRompimento(estado)) custo = multiplicar(custo, C.multiplicadorRompimento * (1 - (estado.efeitos?.rompimento ?? 0)));
  return arredondarParaCima(custo);
}

export function ganhoDaMeditacao(estado) {
  // v0.21.0: o Sentido Divino guia a meditação (+50%)
  const sentido = temSentidoDivino(estado) ? 1 + CONFIG.meditacaoComSentido : 1;
  return maximo(C.meditacaoMinima, multiplicar(producaoPorSegundo(estado), C.segundosPorMeditacao * sentido));
}

// ---- Ações ----
export function ganharCultivo(estado, quantidade) {
  creditar(estado, 'cultivo', quantidade);
  creditar(estado, 'cultivoTotal', quantidade);
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
  return cabe(estado, 'cultivo', custoParaAvancar(estado));
}

// Avança um estágio (ou rompe o reino). Devolve um "evento" descrevendo
// o que aconteceu, ou null se não foi possível avançar.
export function avancar(estado) {
  if (!podeAvancar(estado)) return null;

  const rompimento = proximoEhRompimento(estado);
  const maestria = proximoEhMaestria(estado);
  debitar(estado, 'cultivo', custoParaAvancar(estado));

  if (maestria) {
    estado.maestria = nivelDaMaestria(estado) + 1;   // v0.32.0: Maestria da Criação
  } else if (rompimento) {
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
    maestria,
    marco: maestria ? (estado.maestria === 1 ? `Você começou a ${M.nome}: o cultivo continua além do Fruto do Universo.` : null)
      : reino.marcos?.[estado.estagio] ?? null,
    batismo: rompimento && batismosMundiais(estado) > 0,   // v0.21.0: este rompimento trouxe um Batismo Mundial
  };
}

// O próximo avanço pode ser feito sozinho? (opções do jogador; ver atualizar)
export function avancoAutomaticoPermitido(estado) {
  const auto = estado.automacao?.cultivo ?? {};
  if (proximoEhRompimento(estado)) return Boolean(estado.vip || auto.reinos);
  if (proximoEhMaestria(estado)) return Boolean(auto.maestria);
  return Boolean(estado.opcoes.autoAvancar);
}

// ---- Passagem do tempo ----
// Chamado várias vezes por segundo. "segundos" = tempo desde a última chamada.
// aoEvento é uma função opcional chamada a cada avanço automático.
export function atualizar(estado, segundos, aoEvento) {
  ganharCultivo(estado, multiplicar(producaoPorSegundo(estado), segundos));
  estado.estatisticas.tempoJogado += segundos;
  // v0.21.0: tempo da Reclusão e dos efeitos (Iluminação, Pílula do Fluxo) — conta também com o jogo fechado
  if (estado.reclusao?.ativa) estado.reclusao.segundos += segundos;
  const e = estado.efeitos;
  if (e) {
    if (e.iluminacao > 0) e.iluminacao = Math.max(0, e.iluminacao - segundos);
    if (e.fluxo > 0) e.fluxo = Math.max(0, e.fluxo - segundos);
  }

  // Avanço automático: estágios com a opção "auto" (opcoes.autoAvancar). Rompimentos de reino: com o VIP
  // (v0.9.13, dono) ou com a automação "romper reinos" (v0.33.0). Maestria: automação "subir Maestria" (v0.33.0).
  while (podeAvancar(estado) && avancoAutomaticoPermitido(estado)) {
    const evento = avancar(estado);
    if (aoEvento) aoEvento(evento);
  }
}

// Simula o tempo offline em pequenos pedaços, para que estágios
// avançados automaticamente aumentem a produção durante a simulação.
export function simularOffline(estado, segundos) {
  const cultivoAntes = instantaneo(estado, 'cultivoTotal');
  const eventos = [];
  const passos = Math.min(2000, Math.max(1, Math.ceil(segundos)));
  const tamanhoDoPasso = segundos / passos;

  for (let i = 0; i < passos; i++) {
    atualizar(estado, tamanhoDoPasso, (evento) => eventos.push(evento));
  }

  return { ganho: variacaoDesde(estado, 'cultivoTotal', cultivoAntes), eventos };
}
