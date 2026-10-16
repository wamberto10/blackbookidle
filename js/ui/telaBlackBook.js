// =============================================================
// ui/telaBlackBook.js — aba Black Book (Reencarnação e melhorias)
//
// v0.27.1: layout novo, igual ao mockup (docs/layout/layout_blackbook.png): banner, Essência obtida,
// "O que reinicia / O que permanece" (regras reais), próxima vida, botão Reencarnar, as 7 melhorias
// em linhas e o registro das últimas vidas (estado.reencarnacao.historico).
// =============================================================
import { CONFIG } from '../config.js';
import * as BB from '../sistemas/blackbook.js';
import { liberado } from '../sistemas/desbloqueios.js';
import { FASES, MAPAS, inicioDaVida } from '../sistemas/mundo.js';
import { REINOS } from '../dados/reinos.js';
import { formatarNumero } from '../format.js';

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

export function montarTelaBlackBook(acoes) {
  $('bb-reencarnar').addEventListener('click', acoes.aoReencarnar);

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

// Ex.: índice 13 → "Mapa 2 · Fase 2"
function nomeDaFase(indice) {
  if (indice < 0) return 'Nenhuma';
  const fase = FASES[indice];
  return `Mapa ${fase.mapa + 1} · Fase ${fase.numero}`;
}

// Ex.: "×1,63" para as compostas | "+4%" para somar 4
function textoDoEfeito(melhoria, efeito) {
  // v0.17.4: melhorias compostas mostram o multiplicador (×20,6) — "+1.96K%" era confuso
  if (melhoria.composto) {
    const mult = 1 + efeito;
    return '×' + (mult < 100 ? mult.toFixed(mult < 10 ? 2 : 1).replace('.', ',') : formatarNumero(mult));
  }
  if (melhoria.tipo === 'multiplicar') return `+${formatarNumero(Math.round(efeito * 100))}%`;
  return `+${Number(efeito.toFixed(1))}%`;
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

export function atualizarTelaBlackBook(estado) {
  const aberto = liberado(estado, 'blackbook');
  $('blackbook-bloqueado').classList.toggle('escondido', aberto);
  $('blackbook-conteudo').classList.toggle('escondido', !aberto);
  if (!aberto) return;

  // ---- Reencarnação ----
  const ganho = BB.essenciaAoReencarnar(estado);
  $('bb-ganho').textContent = formatarNumero(ganho);
  const inicio = inicioDaVida(estado);
  $('bb-inicio-mundo').textContent = inicio.mundo;
  $('bb-inicio').textContent = `${inicio.reino} – ${inicio.estagio}`;
  $('bb-inicio').title = `Mapa ${inicio.indiceMapa + 1} (${inicio.mapa})`;
  $('bb-reencarnar').disabled = !BB.podeReencarnar(estado);
  $('bb-aviso').textContent = !BB.chegouOndeReencarnou(estado)
    ? `Para reencarnar de novo, vença ${nomeDaFase(BB.faseMinimaParaReencarnar(estado))} (onde você reencarnou da última vez).`
    : !BB.venceuFaseNestaVida(estado)
      ? 'Vença pelo menos 1 fase nova nesta vida para poder reencarnar.'
      : ganho > 0 ? '' : 'Vença pelo menos 1 fase para poder reencarnar.';

  // ---- Melhorias ----
  for (const melhoria of CONFIG.blackbook.melhorias) {
    const el = elementosMelhorias[melhoria.id];
    const custo = BB.custoMelhoria(estado, melhoria.id);
    const maximo = BB.noMaximo(estado, melhoria.id);
    el.nivel.textContent = `Nv. ${BB.nivelMelhoria(estado, melhoria.id)}${melhoria.nivelMaximo !== undefined ? `/${melhoria.nivelMaximo}` : ''}`;
    el.efeito.textContent = `${textoDoEfeito(melhoria, BB.efeitoMelhoria(estado, melhoria.id))} de ${el.visual.alvo}`;
    el.custo.textContent = maximo ? '—' : formatarNumero(custo);
    el.botao.textContent = maximo ? 'Máximo' : 'Melhorar';
    el.botao.disabled = maximo || estado.essencia < custo;
  }

  // ---- Registro das vidas ----
  const r = estado.reencarnacao;
  $('bb-vezes').textContent = r.vezes;
  $('bb-fase').textContent = nomeDaFase(estado.combate.fasesConcluidas);
  $('bb-recorde').textContent = nomeDaFase(Math.max(r.melhorFaseDeTodas, estado.combate.fasesConcluidas));
  $('bb-total').textContent = formatarNumero(r.essenciaTotal);
  desenharVidas(r);
}

// Últimas vidas, da mais nova para a mais antiga (como no mockup)
function desenharVidas(r) {
  const vidas = [...(r.historico ?? [])].reverse();
  const chave = `${r.vezes}|${vidas.length}`;
  if (chave === vidasDesenhadas) return;
  vidasDesenhadas = chave;
  if (vidas.length === 0) {
    html($('bb-vidas'), `<p class="bb-vidas-vazio">${r.vezes > 0
      ? 'As vidas anteriores não foram registradas. A partir da próxima reencarnação, cada vida aparece aqui.'
      : 'Nenhuma vida registrada ainda. Ao reencarnar, a vida que terminou aparece aqui.'}</p>`);
    return;
  }
  html($('bb-vidas'), vidas.slice(0, 10).map((vida) => {
    const reino = REINOS[vida.reino];
    const indiceMapa = vida.fase >= 0 ? FASES[vida.fase].mapa : 0;
    const mapa = MAPAS[indiceMapa];
    const ultimoReino = vida.reino === REINOS.length - 1;
    return `<div class="bb-vida">
        <span class="bb-vida-num"><b>${vida.numero}</b></span>
        <img class="bb-vida-mapa" src="img/fundos/mapa${String(indiceMapa + 1).padStart(2, '0')}.jpg" alt="" onerror="this.style.visibility='hidden'">
        <div class="bb-vida-info"><b>${reino?.nome ?? '—'}</b>
          <small>${ultimoReino ? 'Alcançou o reino máximo' : `${nomeDaFase(vida.fase)} · ${mapa.nome}`}</small></div>
        <span class="bb-vida-tempo"><img src="img/ui/bb_icone_relogio.png" alt="">${duracao(vida.segundos)}</span>
        <span class="bb-vida-ess"><img src="img/ui/icone_essencia.png" alt="">${formatarNumero(vida.essencia)}</span>
      </div>`;
  }).join(''));
}
