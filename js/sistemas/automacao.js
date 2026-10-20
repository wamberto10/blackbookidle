// =============================================================
// sistemas/automacao.js — GERENCIAMENTO AUTOMÁTICO (v0.33.0)
//
// O jogador liga o que quiser (tudo começa DESLIGADO) e o motor faz as mesmas ações que um jogador faria nas
// visitas, com as regras normais do jogo (custos, desbloqueios, travas). Roda a cada
// CONFIG.automacao.intervaloSegundos de TEMPO DE JOGO (sistemas/motor.js) — com o jogo aberto, em segundo plano
// ou offline, nos mesmos instantes: o offline não recebe o saldo final para depois comprar tudo de uma vez.
//
// Ordem de cada execução (sempre a mesma):
//   1. Pílulas      → Acúmulo (sobra acima do estoque mínimo), Fluxo (se não houver uma fazendo efeito) e
//                     Quebra-Gargalo (só quando o próximo avanço é um rompimento de reino)
//   2. Fonte Estelar → refina quando der (cultivo; os estágios/reinos/Maestria avançam no motor, a cada segundo)
//   3. Black Book   → "mais barata primeiro" (equilibra) ou "na ordem da lista" (prioridade)
//   4. Arranjo      → usa até X% das Pedras desta execução
//   5. Equipamentos → melhora o item vestido mais barato de melhorar
//   6. Núcleos      → usa os guardados no atributo com menos pontos
//   7. Retomada     → religa o avanço do combate depois de uma derrota (intervalo mínimo + força maior)
//   8. Reencarnação → v0.34.0: reencarna assim que a Marca da Alma subiria (sistemas/reencarnacao.js)
// Reservas: a compra só acontece se o saldo DEPOIS do gasto ficar ≥ reserva.
// =============================================================
import { CONFIG } from '../config.js';
import * as P from './progressao.js';
import * as BB from './blackbook.js';
import * as CA from './cultivoAvancado.js';
import * as NU from './nucleos.js';
import { podeMelhorar, melhorar } from './equipamentos.js';
import { custoMelhoria } from './itens.js';
import { calcularAtributos, poderTotal } from './atributos.js';
import { atualizarAtributosDaLuta, reiniciarLuta } from './combate.js';
import { podeReencarnar, reencarnar } from './reencarnacao.js';
import { liberado } from './desbloqueios.js';
import { somar, multiplicar, comparar, maiorOuIgual, maior } from '../numeros.js';
import { cabe as sobraReserva } from '../saldos.js';
// v0.33.0: Essência, Pedras, custos, reservas e Poder são NÚMEROS GRANDES (js/numeros.js)

const AU = CONFIG.automacao;
export const MINUTOS_MINIMOS_RETOMADA = 1;
export const MELHORIA_MINIMA_RETOMADA = 0.01;

// Os limites também valem para saves antigos ou configurações alteradas fora da interface.
export function parametrosDaRetomada(cfg) {
  return {
    minutos: Math.max(MINUTOS_MINIMOS_RETOMADA, Number.isFinite(cfg.minutos) ? cfg.minutos : MINUTOS_MINIMOS_RETOMADA),
    melhoria: Math.max(MELHORIA_MINIMA_RETOMADA, Number.isFinite(cfg.melhoria) ? cfg.melhoria : MELHORIA_MINIMA_RETOMADA),
  };
}

// Configuração padrão (estado.js usa; save.js completa os saves antigos com ela)
export function automacaoPadrao() {
  const melhorias = CONFIG.blackbook.melhorias.map(m => m.id);
  return {
    segundos: 0,   // tempo de jogo desde a última execução (agendamento; vai no save)
    blackbook: { ativo: false, modo: 'barata', seIndisponivel: 'esperar', reserva: 0,
      ordem: [...melhorias], permitidas: Object.fromEntries(melhorias.map(id => [id, true])) },
    cultivo: { reinos: false, maestria: false, fonteEstelar: false },   // os estágios usam opcoes.autoAvancar
    pilulas: { ativo: false, acumulo: true, fluxo: true, rompimento: true, minimo: { acumulo: 0, fluxo: 0, rompimento: 0 } },
    arranjo: { ativo: false, fracao: 0.5, reserva: 0 },
    equipamentos: { ativo: false, reserva: 0 },
    nucleos: { ativo: false },
    retomada: { ativo: false, minutos: 10, melhoria: 0.02 },
    reencarnacao: { ativo: false },   // v0.34.0
    ultima: null,   // resumo da última execução que fez alguma coisa (tela de Opções)
  };
}

const novoRelatorio = () => ({ blackbook: 0, essenciaGasta: 0, arranjo: 0, pedrasArranjo: 0, itens: 0, pedrasItens: 0,
  nucleos: 0, pilulas: { acumulo: 0, fluxo: 0, rompimento: 0 }, cultivoDasPilulas: 0, fonteEstelar: false, retomou: false,
  reencarnou: 0 });   // reencarnou = nível da Marca da Alma recebido (0 = não reencarnou)

export function relatorioVazio(r) {
  return !r.blackbook && !r.arranjo && !r.itens && !r.nucleos && !r.retomou && !r.fonteEstelar && !r.reencarnou &&
    !r.pilulas.acumulo && !r.pilulas.fluxo && !r.pilulas.rompimento;
}

// ---- 1. Pílulas ----
function usarPilulas(estado, cfg, r) {
  if (!cfg.ativo) return;
  const sobra = (id) => (estado.pilulas[id] ?? 0) > (cfg.minimo[id] ?? 0);
  if (cfg.acumulo) {
    // Estoques grandes continuam na próxima rodada; Fluxo e Quebra-Gargalo não ficam esperando a pilha acabar.
    for (let n = 0; n < AU.comprasPorExecucao && sobra('acumulo'); n++) {
      const usada = CA.usarPilula(estado, 'acumulo');
      if (!usada) break;
      r.pilulas.acumulo += 1;
      r.cultivoDasPilulas = somar(r.cultivoDasPilulas, usada.ganho ?? 0);
    }
  }
  if (cfg.fluxo && !(estado.efeitos.fluxo > 0) && sobra('fluxo') && CA.usarPilula(estado, 'fluxo')) r.pilulas.fluxo += 1;
  if (cfg.rompimento && P.proximoEhRompimento(estado) && !(estado.efeitos.rompimento > 0) && sobra('rompimento') &&
    CA.usarPilula(estado, 'rompimento')) r.pilulas.rompimento += 1;
}

// ---- 3. Black Book ----
// "barata": compra sempre a permitida mais barata (os níveis andam juntos).
// "prioridade": percorre a ordem da lista; a que está no máximo é pulada. Se a primeira que falta não couber
// (Essência − custo < reserva): seIndisponivel 'esperar' = para e junta para ela; 'pular' = tenta a próxima.
function comprarBlackBook(estado, cfg, r) {
  if (!cfg.ativo || !liberado(estado, 'blackbook')) return;
  const ids = cfg.ordem.filter(id => cfg.permitidas[id] && BB.existe(id));
  const cabe = (id) => sobraReserva(estado, 'essencia', BB.custoMelhoria(estado, id), cfg.reserva);
  const comprar = (id) => {
    const custo = BB.custoMelhoria(estado, id);
    if (!BB.comprarMelhoria(estado, id)) return false;
    r.blackbook += 1;
    r.essenciaGasta = somar(r.essenciaGasta, custo);
    return true;
  };
  for (let n = 0; n < AU.comprasPorExecucao; n++) {
    const abertas = ids.filter(id => !BB.noMaximo(estado, id));
    if (!abertas.length) return;
    if (cfg.modo === 'prioridade') {
      let comprou = false;
      for (const id of abertas) {
        if (cabe(id)) { comprou = comprar(id); break; }
        if (cfg.seIndisponivel !== 'pular') return;
      }
      if (!comprou) return;
    } else {
      const barata = abertas.reduce((a, b) => (comparar(BB.custoMelhoria(estado, b), BB.custoMelhoria(estado, a)) < 0 ? b : a));
      if (!cabe(barata) || !comprar(barata)) return;
    }
  }
}

// ---- 4. Arranjo ----
function melhorarArranjo(estado, cfg, r) {
  if (!cfg.ativo || !liberado(estado, 'combate')) return;   // o Arranjo libera junto com o Combate
  const orcamento = multiplicar(estado.pedras, cfg.fracao);
  let gasto = 0;   // (soma dos custos desta rodada: não some mesmo quando cada custo é minúsculo perto do orçamento)
  for (let n = 0; n < AU.comprasPorExecucao; n++) {
    const custo = CA.custoDoArranjo(estado);
    if (maior(somar(gasto, custo), orcamento) || !sobraReserva(estado, 'pedras', custo, cfg.reserva) || !CA.melhorarArranjo(estado)) return;
    gasto = somar(gasto, custo);
    r.arranjo += 1;
    r.pedrasArranjo = somar(r.pedrasArranjo, custo);
  }
}

// ---- 5. Equipamentos vestidos ----
function melhorarEquipamentos(estado, cfg, r) {
  if (!cfg.ativo) return;
  for (let n = 0; n < AU.comprasPorExecucao; n++) {
    const itens = Object.values(estado.equipados).filter(i => i && podeMelhorar(estado, i));
    if (!itens.length) return;
    const barato = itens.reduce((a, b) => (comparar(custoMelhoria(b), custoMelhoria(a)) < 0 ? b : a));
    const custo = custoMelhoria(barato);
    if (!sobraReserva(estado, 'pedras', custo, cfg.reserva) || !melhorar(estado, barato.id)) return;
    r.itens += 1;
    r.pedrasItens = somar(r.pedrasItens, custo);
  }
}

// ---- 6. Núcleos ----
function usarNucleos(estado, cfg, r) {
  if (!cfg.ativo) return;
  for (const tipo of NU.TIPOS_DE_NUCLEO) {
    while (r.nucleos < AU.comprasPorExecucao && NU.quantidade(estado, tipo.id) > 0) {
      const alvo = NU.ATRIBUTOS_DE_NUCLEO.reduce((a, b) => (NU.pontosEm(estado, b) < NU.pontosEm(estado, a) ? b : a));
      if (NU.usarNucleo(estado, tipo.id, alvo) <= 0) break;
      r.nucleos += 1;
    }
  }
}

// ---- 7. Retomada do combate depois de uma derrota ----
// O combate registra em estado.combate.derrota { em: tempo de jogo, poder, velocidade }. A automação só religa depois
// do intervalo E de um ganho mínimo de Poder OU Velocidade. Perdeu de novo → novo registro, espera outra melhoria.
// Saves antigos sem velocidade usam apenas o Poder até uma derrota registrar a nova referência.
// "Farmar aqui" (escolha do jogador) não deixa registro: a automação não tira o herói de onde ele mandou ficar.
export function podeRetomar(estado, cfg = estado.automacao.retomada) {
  const d = estado.combate.derrota;
  if (!cfg.ativo || estado.combate.autoAvancar || !d) return false;
  const limites = parametrosDaRetomada(cfg);
  if (!Number.isFinite(d.em) || estado.estatisticas.tempoJogado - d.em < limites.minutos * 60) return false;
  const atributos = calcularAtributos(estado, { selado: false });
  const fator = 1 + limites.melhoria;
  const poderMaior = maiorOuIgual(poderTotal(atributos), multiplicar(d.poder, fator));
  const velocidadeMaior = d.velocidade !== undefined && maior(d.velocidade, 0) &&
    maiorOuIgual(atributos.velocidade, multiplicar(d.velocidade, fator));
  return poderMaior || velocidadeMaior;
}

// Uma execução completa (o motor chama a cada CONFIG.automacao.intervaloSegundos de jogo).
// aoRelatorio(r) é chamado quando alguma coisa foi feita (resumo offline / registro da tela).
export function executarAutomacao(estado, aoRelatorio) {
  const a = estado.automacao;
  const r = novoRelatorio();
  usarPilulas(estado, a.pilulas, r);
  if (a.cultivo.fonteEstelar && CA.refinarFonteEstelar(estado)) r.fonteEstelar = true;
  comprarBlackBook(estado, a.blackbook, r);
  melhorarArranjo(estado, a.arranjo, r);
  melhorarEquipamentos(estado, a.equipamentos, r);
  usarNucleos(estado, a.nucleos, r);
  if (podeRetomar(estado)) {
    estado.combate.autoAvancar = true;
    estado.combate.derrota = null;
    r.retomou = true;
  }
  if (a.reencarnacao?.ativo && podeReencarnar(estado)) {
    r.reencarnou = reencarnar(estado).marca;
    reiniciarLuta();
  }
  if (relatorioVazio(r)) return null;
  if (!r.reencarnou && (r.blackbook || r.itens || r.nucleos || r.fonteEstelar)) atualizarAtributosDaLuta(estado);   // vale na luta atual
  r.em = estado.estatisticas.tempoJogado;
  a.ultima = r;
  if (aoRelatorio) aoRelatorio(r);
  return r;
}
