// =============================================================
// sistemas/blackbook.js — REENCARNAÇÃO E MELHORIAS PERMANENTES
//
// Ciclo:
//  1. O jogador avança até travar numa fase difícil demais.
//  2. Reencarna: TODO o progresso da vida recomeça do zero
//     (Cultivo, reino, estágio, fases do mapa e Pedras Espirituais).
//  3. Recebe Essência da Alma conforme quantas fases venceu nesta vida.
//  4. Gasta a Essência no Black Book em melhorias de atributos que
//     NUNCA são perdidas, e chega mais longe na próxima vida.
// =============================================================
import { CONFIG } from '../config.js';
import { criarEstadoInicial } from '../estado.js';

const BB = CONFIG.blackbook;

function buscar(id) {
  return BB.melhorias.find(m => m.id === id);
}

// ---- Melhorias ----
export function nivelMelhoria(estado, id) {
  return estado.blackbook[id] ?? 0;
}

export function custoMelhoria(estado, id) {
  return custoNoNivel(buscar(id), nivelMelhoria(estado, id));
}

// Custo do nível n → n+1. v0.17.2: com "custoAlto", a partir do nível X o custo cresce mais devagar.
export function custoNoNivel(melhoria, n) {
  const alto = melhoria.custoAlto;
  if (!alto || n <= alto.aPartirDoNivel) return Math.ceil(melhoria.custoBase * Math.pow(melhoria.crescimentoCusto, n));
  return Math.ceil(melhoria.custoBase * Math.pow(melhoria.crescimentoCusto, alto.aPartirDoNivel)
    * Math.pow(alto.crescimento, n - alto.aPartirDoNivel));
}

// true = a melhoria já está no nível máximo (só algumas têm limite)
export function noMaximo(estado, id) {
  const maximo = buscar(id).nivelMaximo;
  return maximo !== undefined && nivelMelhoria(estado, id) >= maximo;
}

export function comprarMelhoria(estado, id) {
  if (noMaximo(estado, id)) return false;
  const custo = custoMelhoria(estado, id);
  if (estado.essencia < custo) return false;
  estado.essencia -= custo;
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
  return melhoria.composto ? Math.pow(1 + melhoria.bonus, nivel) - 1 : nivel * melhoria.bonus;
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
    for (let n = 0; n < novo; n++) custoAgora += custoNoNivel(m, n);
    estado.blackbook[m.id] = novo;
    devolvida += Math.max(0, gastoAntes - custoAgora);
  }
  estado.essencia += devolvida;
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
  estado.essencia += reembolso;
  return reembolso;
}

// Para melhorias do tipo 'multiplicar': nível 3 de +10% → 1.3
export function multiplicadorMelhoria(estado, id) {
  return 1 + efeitoMelhoria(estado, id);
}

// ---- Reencarnação ----
export function fasesVencidasNestaVida(estado) {
  return estado.combate.fasesConcluidas + 1;
}

export function essenciaAoReencarnar(estado) {
  const fases = fasesVencidasNestaVida(estado);
  if (fases <= 0) return 0;
  const vip = estado.vip ? 1 + CONFIG.vip.bonusEssencia : 1;   // VIP: +100%
  return Math.floor(BB.recompensa.base * fases * Math.pow(BB.recompensa.crescimento, fases) * vip);
}

// Só pode reencarnar de novo chegando pelo menos onde reencarnou da última vez
// (ex.: reencarnou no Mapa 1 · Fase 11 → precisa vencer a Fase 11 do Mapa 1 ou ir além).
// Decisão do dono. -1 = ainda não precisa chegar em lugar nenhum.
export function faseMinimaParaReencarnar(estado) {
  return estado.reencarnacao.faseDaUltima ?? -1;
}

export function chegouOndeReencarnou(estado) {
  return estado.combate.fasesConcluidas >= faseMinimaParaReencarnar(estado);
}

// Vida que começou no Mundo 2 (ou além): precisa vencer pelo menos 1 fase nova antes de
// reencarnar — senão daria para reencarnar na hora, ganhando a Essência das fases do Mundo 1 de graça.
export function venceuFaseNestaVida(estado) {
  return estado.combate.fasesConcluidas > (estado.combate.inicioDaVida ?? -1);
}

export function podeReencarnar(estado) {
  return essenciaAoReencarnar(estado) > 0 && chegouOndeReencarnou(estado) && venceuFaseNestaVida(estado);
}

// Onde a vida nova começa (Mundo 1 ou começo do Mundo 2...). Quem decide é sistemas/mundo.js,
// que se registra aqui ao carregar (importar mundo.js daqui criaria um ciclo de imports).
let comecarVidaNova = null;
export function definirInicioDaVida(funcao) {
  comecarVidaNova = funcao;
}

// Devolve um estado NOVO (vida nova), guardando só o que é permanente
export function reencarnar(estado) {
  const ganho = essenciaAoReencarnar(estado);
  const novo = criarEstadoInicial();

  // O que fica para sempre:
  novo.personagem = estado.personagem;
  novo.essencia = estado.essencia + ganho;
  novo.blackbook = { ...estado.blackbook };
  // v0.8.3 (decisão do dono): os itens que caíram ficam — vestidos e na mochila,
  // COM o nível de melhoria (v0.8.6: o dono desfez a volta para +0 da v0.8.5).
  // (Pedras Espirituais também ficam desde a v0.9.11.)
  novo.boss = { ...estado.boss };                    // v0.11.0: o Evento de Boss continua
  novo.vip = estado.vip;                             // o VIP continua ligado
  novo.pedras = estado.pedras;                       // v0.9.11 (dono): Pedras Espirituais também ficam
  novo.nucleos = { ...estado.nucleos };              // Núcleos guardados e pontos usados também ficam
  novo.pontosNucleo = { ...estado.pontosNucleo };
  novo.equipados = { ...estado.equipados };
  novo.mochila = [...estado.mochila];
  novo.proximoIdItem = estado.proximoIdItem;
  novo.opcoes = { ...estado.opcoes };
  novo.estatisticas = { ...estado.estatisticas };
  novo.reencarnacao = {
    vezes: estado.reencarnacao.vezes + 1,
    melhorFaseDeTodas: Math.max(estado.reencarnacao.melhorFaseDeTodas, estado.combate.fasesConcluidas),
    faseDaUltima: estado.combate.fasesConcluidas,
    essenciaTotal: estado.reencarnacao.essenciaTotal + ganho,
  };
  if (comecarVidaNova) comecarVidaNova(novo, estado);

  return { estado: novo, ganho };
}
