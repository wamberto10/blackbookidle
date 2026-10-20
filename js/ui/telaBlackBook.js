// =============================================================
// ui/telaBlackBook.js — aba Black Book (Essência da Alma e melhorias)
//
// v0.27.1: layout novo, igual ao mockup (docs/layout/layout_blackbook.png): banner, cartões, as 7 melhorias
// em linhas e o registro das últimas vidas (estado.reencarnacao.historico).
// v0.32.0 (progressão contínua): a reencarnação saiu do jogo. Os cartões mostram a Essência guardada, de onde ela
// vem (conquistas inéditas, farm da fase atual e VIP) e até onde a jornada chegou; as vidas antigas ficam como legado.
// =============================================================
import { CONFIG } from '../config.js';
import * as BB from '../sistemas/blackbook.js';
import { liberado } from '../sistemas/desbloqueios.js';
import { obterFase, mapaDesenhado, mapaDaFronteira } from '../sistemas/mundo.js';
import { mapaDaFase, mapaVisual, nomeDaPosicao } from '../sistemas/escala.js';
import { REINOS } from '../dados/reinos.js';
import { formatarNumero } from '../format.js';
import { somar, multiplicar, arredondarParaBaixo } from '../numeros.js';
import { cabe } from '../saldos.js';

const $ = (id) => document.getElementById(id);

// Visual de cada melhoria (nome curto do mockup; o nome completo fica na dica)
const VISUAL = {
  ataque: { nome: 'Força', icone: 'bb_icone_forca', alvo: 'Ataque' },
  vitalidade: { nome: 'Vitalidade', icone: 'bb_icone_vitalidade', alvo: 'HP' },
  defesa: { nome: 'Defesa', icone: 'bb_icone_defesa', alvo: 'Defesa' },
  velocidade: { nome: 'Velocidade', icone: 'bb_icone_velocidade', alvo: 'Velocidade' },
  cultivo: { nome: 'Cultivo', icone: 'icone_cultivo', alvo: 'Cultivo' },
  critico: { nome: 'Taxa de Crítico', icone: 'bb_icone_critico', alvo: 'Taxa de Crítico' },
  danoCritico: { nome: 'Dano Crítico', icone: 'bb_icone_dano_critico', alvo: 'Dano Crítico' },
};
const ORDEM = ['ataque', 'vitalidade', 'defesa', 'velocidade', 'cultivo', 'critico', 'danoCritico'];

const elementosMelhorias = {};
let vidasDesenhadas = '';

// Troca o HTML só quando muda (a tela atualiza 10×/s; recriar o botão no meio do toque perde o clique)
function html(el, texto) {
  if (el.dataset.html !== texto) { el.dataset.html = texto; el.innerHTML = texto; }
}
function texto(el, valor) {
  if (el.textContent !== valor) el.textContent = valor;
}

export function montarTelaBlackBook(acoes) {
  $('bb-ess-vip').parentElement.title = `VIP: +${Math.round(CONFIG.vip.bonusEssencia * 100)}% de Essência no farm`;
  const lista = $('lista-melhorias');
  const melhorias = [...CONFIG.blackbook.melhorias].sort((a, b) => ORDEM.indexOf(a.id) - ORDEM.indexOf(b.id));
  for (const melhoria of melhorias) {
    const visual = VISUAL[melhoria.id] ?? { nome: melhoria.nome, icone: 'bb_icone_lotus', alvo: '' };
    const linha = document.createElement('div');
    linha.className = 'bb-melhoria';
    linha.title = `${melhoria.nome}: ${melhoria.descricao} por nível`;
    linha.innerHTML = `
      <span class="bb-mel-icone"><img src="img/ui/${visual.icone}.png" alt=""></span>
      <b class="bb-mel-nome">${visual.nome}</b>
      <span class="bb-mel-nivel"></span>
      <span class="bb-mel-efeito"></span>
      <span class="bb-mel-custo"><img src="img/ui/icone_essencia.png" alt=""><b></b></span>
      <button class="ui ui-botao-dourado bb-mel-botao">Melhorar</button>`;
    const botao = linha.querySelector('button');
    botao.addEventListener('click', () => acoes.aoComprarMelhoria(melhoria.id));
    elementosMelhorias[melhoria.id] = {
      visual,
      nivel: linha.querySelector('.bb-mel-nivel'),
      efeito: linha.querySelector('.bb-mel-efeito'),
      custo: linha.querySelector('.bb-mel-custo b'),
      botao,
    };
    lista.appendChild(linha);
  }
}

// Ex.: índice 13 → "Fácil — Mapa 2 · Fase 2" (v0.32.0: posição global)
function nomeDaFase(indice) {
  if (indice < 0) return 'Nenhuma';
  return `${nomeDaPosicao(mapaDaFase(indice))} · Fase ${obterFase(indice).numero}`;
}

// Ex.: "×1,63" para as compostas | "+4%" para somar 4
function textoDoEfeito(melhoria, efeito) {
  // v0.17.4: melhorias compostas mostram o multiplicador (×20,6) — "+1.96K%" era confuso
  if (melhoria.composto) {
    const mult = somar(1, efeito);   // número grande (1,05^nível)
    return '×' + (typeof mult === 'number' && mult < 100 ? mult.toFixed(mult < 10 ? 2 : 1).replace('.', ',') : formatarNumero(mult));
  }
  if (melhoria.tipo === 'multiplicar') {
    const porcentagem = multiplicar(efeito, 100);
    return `+${formatarNumero(typeof porcentagem === 'number' ? Math.round(porcentagem) : porcentagem)}%`;
  }
  return `+${typeof efeito === 'number' ? Number(efeito.toFixed(1)) : formatarNumero(efeito)}%`;
}

// Ex.: 1.058.400 s → "12d 6h 0m"
function duracao(segundos) {
  if (segundos === null || segundos === undefined) return '—';
  const d = Math.floor(segundos / 86400);
  const h = Math.floor((segundos % 86400) / 3600);
  const m = Math.floor((segundos % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${Math.max(1, m)}m`;
}

const multiplicador = (x) => '×' + x.toFixed(2).replace('.', ',');

export function atualizarTelaBlackBook(estado) {
  const aberto = liberado(estado, 'blackbook');
  $('blackbook-bloqueado').classList.toggle('escondido', aberto);
  $('blackbook-conteudo').classList.toggle('escondido', !aberto);
  if (!aberto) return;

  // ---- Essência da Alma (v0.32.0) ----
  const e = estado.estatisticas;
  const fase = estado.combate.faseAtual;
  texto($('bb-ganho'), formatarNumero(arredondarParaBaixo(estado.essencia)));
  texto($('bb-ess-conquistas'), '+' + formatarNumero(e.essenciaConquistas ?? 0));
  texto($('bb-ess-farm'), `+${formatarNumero(multiplicar(BB.essenciaPorSegundo(estado, fase), 3600))}/h`);
  texto($('bb-ess-vip'), estado.vip ? multiplicador(1 + CONFIG.vip.bonusEssencia) : '—');
  // Jornada: mapa mais longe já aberto
  const fronteira = mapaDaFronteira(estado);
  texto($('bb-inicio-mundo'), nomeDaPosicao(fronteira));
  texto($('bb-inicio'), mapaDesenhado(fronteira).nome);

  // ---- Melhorias ----
  for (const melhoria of CONFIG.blackbook.melhorias) {
    const el = elementosMelhorias[melhoria.id];
    const custo = BB.custoMelhoria(estado, melhoria.id);
    const maximo = BB.noMaximo(estado, melhoria.id);
    el.nivel.textContent = `Nv. ${BB.nivelMelhoria(estado, melhoria.id)}${melhoria.nivelMaximo !== undefined ? `/${melhoria.nivelMaximo}` : ''}`;
    el.efeito.textContent = `${textoDoEfeito(melhoria, BB.efeitoMelhoria(estado, melhoria.id))} de ${el.visual.alvo}`;
    el.custo.textContent = maximo ? '—' : formatarNumero(custo);
    el.botao.textContent = maximo ? 'Máximo' : 'Melhorar';
    el.botao.disabled = maximo || !cabe(estado, 'essencia', custo);
  }

  // ---- Resumo e vidas antigas (legado) ----
  const r = estado.reencarnacao;
  texto($('bb-recorde'), nomeDaFase(estado.combate.fasesConcluidas));
  texto($('bb-total'), formatarNumero(somar(somar(e.essenciaConquistas ?? 0, e.essenciaFarm ?? 0), r.essenciaTotal ?? 0)));
  $('bb-legado').classList.toggle('escondido', !(r.vezes > 0));
  texto($('bb-vezes'), String(r.vezes));
  desenharVidas(r);
}

// As 3 últimas vidas antigas, da mais nova para a mais antiga (o save guardava até 20)
function desenharVidas(r) {
  const vidas = [...(r.historico ?? [])].reverse();
  const chave = `${r.vezes}|${vidas.length}`;
  if (chave === vidasDesenhadas) return;
  vidasDesenhadas = chave;
  if (vidas.length === 0) {
    html($('bb-vidas'), r.vezes > 0 ? '<p class="bb-vidas-vazio">As vidas anteriores não foram registradas.</p>' : '');
    return;
  }
  html($('bb-vidas'), vidas.slice(0, 3).map((vida) => {   // v0.30.2 (dono): só as 3 últimas vidas
    const reino = REINOS[vida.reino];
    const indiceMapa = vida.fase >= 0 ? mapaDaFase(vida.fase) : 0;
    const ultimoReino = vida.reino === REINOS.length - 1;
    return `<div class="bb-vida">
        <span class="bb-vida-num"><b>${vida.numero}</b></span>
        <img class="bb-vida-mapa" src="img/fundos/mapa${String(mapaVisual(indiceMapa) + 1).padStart(2, '0')}.jpg" alt="" onerror="this.style.visibility='hidden'">
        <div class="bb-vida-info"><b>${reino?.nome ?? '—'}</b>
          <small>${ultimoReino ? 'Alcançou o reino máximo' : `${nomeDaFase(vida.fase)} · ${mapaDesenhado(indiceMapa).nome}`}</small></div>
        <span class="bb-vida-tempo"><img src="img/ui/bb_icone_relogio.png" alt="">${duracao(vida.segundos)}</span>
        <span class="bb-vida-ess"><img src="img/ui/icone_essencia.png" alt="">${formatarNumero(vida.essencia)}</span>
      </div>`;
  }).join(''));
}
