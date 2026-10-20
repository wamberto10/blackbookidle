// =============================================================
// sistemas/blackbook.js — ESSÊNCIA DA ALMA E MELHORIAS PERMANENTES
//
// v0.32.0 (progressão contínua): a reencarnação que recomeçava cultivo e campanha saiu do jogo.
// A Essência da Alma agora vem DURANTE a jornada:
//  - 1ª conquista de cada fase (uma vez só, para sempre — trocar de dificuldade ou repetir não renova);
//  - farm: cada segundo de luta VENCIDA rende Essência do patamar daquela fase (fase mais fácil = menos).
// Ela é gasta no Black Book em melhorias de atributos que NUNCA são perdidas.
// As reencarnações de saves antigos ficam guardadas como legado (estado.reencarnacao.historico).
// =============================================================
import { CONFIG } from '../config.js';
import { lnEssenciaDeReferencia, dificuldadeDoMapa, mapaDaFase, FASES_DO_FACIL } from './escala.js';
import { somar, subtrair, multiplicar, potencia, deLn, arredondarParaCima } from '../numeros.js';
import { creditar, debitar } from '../saldos.js';   // v0.33.2: toda compra é cobrada, todo ganho conta
// v0.33.0: Essência, custos e os multiplicadores compostos (1,05^nível) são NÚMEROS GRANDES (js/numeros.js)

const BB = CONFIG.blackbook;

function buscar(id) {
  return BB.melhorias.find(m => m.id === id);
}

// ---- Melhorias ----
export function existe(id) {
  return Boolean(buscar(id));
}

export function nivelMelhoria(estado, id) {
  return estado.blackbook[id] ?? 0;
}

export function custoMelhoria(estado, id) {
  return custoNoNivel(buscar(id), nivelMelhoria(estado, id));
}

// Custo do nível n → n+1. v0.17.2: com "custoAlto", a partir do nível X o custo cresce mais devagar.
export function custoNoNivel(melhoria, n) {
  const alto = melhoria.custoAlto;
  if (!alto || n <= alto.aPartirDoNivel) return arredondarParaCima(multiplicar(melhoria.custoBase, potencia(melhoria.crescimentoCusto, n)));
  return arredondarParaCima(multiplicar(melhoria.custoBase * Math.pow(melhoria.crescimentoCusto, alto.aPartirDoNivel),
    potencia(alto.crescimento, n - alto.aPartirDoNivel)));
}

// true = a melhoria já está no nível máximo (só algumas têm limite)
export function noMaximo(estado, id) {
  const maximo = buscar(id).nivelMaximo;
  return maximo !== undefined && nivelMelhoria(estado, id) >= maximo;
}

export function comprarMelhoria(estado, id) {
  if (noMaximo(estado, id)) return false;
  const custo = custoMelhoria(estado, id);
  if (!debitar(estado, 'essencia', custo)) return false;
  estado.blackbook[id] = nivelMelhoria(estado, id) + 1;
  return true;
}

// Bônus total da melhoria. Ex.: nível 4 de "+1%" (somar) → 4
// v0.14.0 (dono): melhorias "composto" MULTIPLICAM a cada nível — nível 3 de +5% → 1,05³ − 1 = 0,158.
// Antes somavam (+10% do valor base por nível): no nível 80 cada nível novo valia só +1%.
export function efeitoMelhoria(estado, id) {
  const melhoria = buscar(id);
  if (!melhoria) return 0;
  const nivel = nivelMelhoria(estado, id);
  return melhoria.composto ? subtrair(potencia(1 + melhoria.bonus, nivel), 1) : nivel * melhoria.bonus;   // composto: número grande
}

// v0.14.0: converte os níveis de saves antigos (bônus somado, regra "antes" do config) para o
// nível composto que dá a MESMA força ou um pouco mais, e devolve a Essência que sobrar.
export function converterMelhoriasCompostas(estado) {
  let devolvida = 0;
  for (const m of BB.melhorias) {
    if (!m.composto || !m.antes) continue;
    const velho = nivelMelhoria(estado, m.id);
    if (velho <= 0) continue;
    const multiplicador = 1 + velho * m.antes.bonus;
    const novo = Math.ceil(Math.log(multiplicador) / Math.log(1 + m.bonus) - 1e-9);
    const gastoAntes = somaDeCustos(m.custoBase, m.antes.crescimentoCusto, 0, velho);
    let custoAgora = 0;
    for (let n = 0; n < novo; n++) custoAgora += custoNoNivel(m, n);   // (saves antigos: níveis baixos, números comuns)
    estado.blackbook[m.id] = novo;
    devolvida += Math.max(0, gastoAntes - custoAgora);
  }
  creditar(estado, 'essencia', devolvida);
  return devolvida;
}

function somaDeCustos(base, crescimento, de, ate) {
  let total = 0;
  for (let n = de; n < ate; n++) total += Math.ceil(base * Math.pow(crescimento, n));
  return total;
}

// Saves antigos: devolve a Essência gasta em melhorias removidas e nos níveis
// acima do novo máximo (v0.8.1). Devolve quanto foi reembolsado.
export function corrigirMelhoriasAntigas(estado) {
  const gastoEntre = (regra, de, ate) => {
    let total = 0;
    for (let n = de; n < ate; n++) total += Math.ceil(regra.custoBase * Math.pow(regra.crescimentoCusto, n));
    return total;
  };
  let reembolso = 0;
  for (const id in BB.removidas) {
    const nivel = estado.blackbook[id] ?? 0;
    if (nivel > 0) reembolso += gastoEntre(BB.removidas[id], 0, nivel);
    delete estado.blackbook[id];
  }
  for (const melhoria of BB.melhorias) {
    const nivel = nivelMelhoria(estado, melhoria.id);
    if (melhoria.nivelMaximo !== undefined && nivel > melhoria.nivelMaximo) {
      reembolso += gastoEntre(melhoria, melhoria.nivelMaximo, nivel);
      estado.blackbook[melhoria.id] = melhoria.nivelMaximo;
    }
  }
  creditar(estado, 'essencia', reembolso);
  return reembolso;
}

// Para melhorias do tipo 'multiplicar': nível 3 de +10% → 1.3. Composta: (1 + bônus)^nível — número grande.
export function multiplicadorMelhoria(estado, id) {
  const melhoria = buscar(id);
  if (melhoria?.composto) return potencia(1 + melhoria.bonus, nivelMelhoria(estado, id));
  return 1 + efeitoMelhoria(estado, id);
}

// ---- Essência da Alma (v0.32.0) ----
const ES = BB.essencia;

// Essência de referência da fase (E). Ver escala.lnEssenciaDeReferencia e CONFIG.blackbook.essencia.
export function essenciaDeReferencia(indiceFase) {
  return deLn(lnEssenciaDeReferencia(indiceFase));
}

// 1ª conquista: fracaoPrimeiraConquista × (E da fase − E da fase anterior). Igual para todos (sem VIP).
export function essenciaDaPrimeiraConquista(indiceFase) {
  const atual = lnEssenciaDeReferencia(indiceFase);
  const anterior = lnEssenciaDeReferencia(indiceFase - 1);
  return multiplicar(deLn(atual), ES.fracaoPrimeiraConquista * (1 - Math.exp(anterior - atual)));
}

// Horas de farm que "valem" a Essência de referência da fase (CONFIG.blackbook.essencia).
// Fácil: horasDeReferencia. Da Normal em diante, a ponte min(horasDepoisDoFacil, horasDeReferencia × E/E0):
// a conta é feita em ln (E passa de 1e308 no Infinito) — a razão só vira número enquanto a ponte não saturou.
const LN_E0 = lnEssenciaDeReferencia(FASES_DO_FACIL - 1);
const LN_FIM_DA_PONTE = Math.log(ES.horasDepoisDoFacil / ES.horasDeReferencia);
export function horasDeReferencia(indiceFase) {
  if (dificuldadeDoMapa(mapaDaFase(indiceFase)) === 0) return ES.horasDeReferencia;
  const lnRazao = lnEssenciaDeReferencia(indiceFase) - LN_E0;
  return lnRazao >= LN_FIM_DA_PONTE ? ES.horasDepoisDoFacil : ES.horasDeReferencia * Math.exp(lnRazao);
}

// Farm: Essência por segundo de luta vencida nesta fase (VIP: + CONFIG.vip.bonusEssencia)
export function essenciaPorSegundo(estado, indiceFase) {
  const vip = estado.vip ? 1 + CONFIG.vip.bonusEssencia : 1;
  return deLn(lnEssenciaDeReferencia(indiceFase) - Math.log(horasDeReferencia(indiceFase) * 3600 / vip));
}

// Chamado pelo combate a cada vitória. segundos = tempo real da luta (pausa + turnos); fuga pela Supressão de
// Alma = só a pausa. Devolve { primeira, farm, total } e já soma no estado.
export function receberEssenciaDaVitoria(estado, fase, primeiraVitoria, segundos) {
  const primeira = primeiraVitoria ? essenciaDaPrimeiraConquista(fase.indice) : 0;
  const farm = multiplicar(essenciaPorSegundo(estado, fase.indice), Math.max(0, segundos));
  const total = somar(primeira, farm);
  creditar(estado, 'essencia', total);
  creditar(estado, 'estatisticas.essenciaConquistas', primeira);
  creditar(estado, 'estatisticas.essenciaFarm', farm);
  return { primeira, farm, total };
}
