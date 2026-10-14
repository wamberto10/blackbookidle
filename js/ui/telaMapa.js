// =============================================================
// ui/telaMapa.js — aba Mapa (v0.19.0: layout em 3 colunas, como a referência do dono)
//   esquerda → mundos e a lista dos mapas (zonas) com miniatura, descrição e progresso
//   centro   → o fundo do mapa com a trilha das 12 fases (clicáveis), o chefe no topo
//   direita  → seleção do desafio: dificuldade (em breve), card da fase e "Farmar aqui"
// No celular as três partes ficam uma embaixo da outra, na mesma ordem.
// =============================================================
import { MUNDOS } from '../dados/mundos.js';
import { liberado as sistemaLiberado } from '../sistemas/desbloqueios.js';
import { MAPAS, FASES, MUNDOS_JOGAVEIS, mapaLiberado, faseLiberada, fasesVencidasNoMapa,
  mapasDoMundo, primeiraFaseDoMundo } from '../sistemas/mundo.js';
import { cultivoDaVitoria, fatorDoInimigo } from '../sistemas/combate.js';
import { formatarNumero } from '../format.js';
import { icone, desenharInimigo } from './sprite.js';
import { calcularAtributos, poderTotal } from '../sistemas/atributos.js';
import { previsaoDaFase, textoDaPrevisao, textoDoPoder } from './poder.js';

const $ = (id) => document.getElementById(id);

// Posição de cada fase na trilha (% da largura, % da altura), de baixo (fase 1) para cima (chefe)
const TRILHA = [
  [30, 92], [58, 85], [78, 76], [55, 68], [28, 61], [42, 52],
  [70, 46], [80, 37], [55, 30], [28, 24], [46, 16], [62, 7],
];
// Dificuldades (a escolha vem em uma etapa futura; por enquanto só a Fácil existe)
const DIFICULDADES = [
  { nome: 'Inferno', estrelas: 5 }, { nome: 'Muito Difícil', estrelas: 4 }, { nome: 'Difícil', estrelas: 3 },
  { nome: 'Normal', estrelas: 2 }, { nome: 'Fácil', estrelas: 1, ativa: true },
];

let acoesGuardadas = null;
let ultimoEstado = null;
let mapaSelecionado = null;    // mapa aberto na tela (não precisa ser salvo)
let faseSelecionada = null;    // fase marcada na trilha (mostrada no painel da direita)
let chaveDesenhada = '';

export function montarTelaMapa(acoes) {
  acoesGuardadas = acoes;
  $('md-farmar').addEventListener('click', () => {
    if (faseSelecionada === null || !ultimoEstado || !faseLiberada(ultimoEstado, faseSelecionada)) return;
    acoesGuardadas.aoEscolherFase(faseSelecionada);
    acoesGuardadas.aoMudarAutoCombate(false);   // fica lutando nesta fase
  });
  // Dificuldades: só a lista (a escolha vem depois)
  $('md-dificuldades').innerHTML = DIFICULDADES.map(d =>
    `<div class="dificuldade${d.ativa ? ' ativa' : ''}">${d.ativa ? '' : icone('cadeado')}<b>${d.nome}</b>` +
    `<span class="estrelas">${'★'.repeat(d.estrelas)}</span>${d.ativa ? '' : '<small>em breve</small>'}</div>`).join('');
}

const fundoDoMapa = (indice) => `url('img/fundos/mapa${String(indice + 1).padStart(2, '0')}.jpg')`;

function mundoLiberado(estado, indiceMundo) {
  return faseLiberada(estado, primeiraFaseDoMundo(indiceMundo));
}

function selecionarMapa(indice) {
  mapaSelecionado = indice;
  faseSelecionada = null;
  chaveDesenhada = '';
  atualizarTelaMapa(ultimoEstado);
}

// Fase que aparece marcada ao abrir um mapa: a atual (se for deste mapa) ou a mais longe liberada
function faseInicialDoMapa(estado, indiceMapa) {
  const atual = estado.combate.faseAtual;
  if (FASES[atual].mapa === indiceMapa) return atual;
  const fases = FASES.filter(f => f.mapa === indiceMapa && faseLiberada(estado, f.indice));
  return fases.length ? fases[fases.length - 1].indice : indiceMapa * 12;
}

export function atualizarTelaMapa(estado) {
  ultimoEstado = estado;
  const liberado = sistemaLiberado(estado, 'mapa');
  $('mapa-bloqueado').classList.toggle('escondido', liberado);
  $('mapa-conteudo').classList.toggle('escondido', !liberado);
  if (!liberado) return;

  // 8) Com o Mapa fechado não precisa calcular nada (redesenha em até 0,1 s ao abrir)
  if (!$('aba-mapa').classList.contains('aberto')) return;
  // Seleção que ficou inválida (reencarnou ou apagou o progresso): volta para o mapa atual
  if (mapaSelecionado === null || !mapaLiberado(estado, mapaSelecionado)) {
    mapaSelecionado = FASES[estado.combate.faseAtual].mapa;
    faseSelecionada = null;
  }
  if (faseSelecionada !== null && !faseLiberada(estado, faseSelecionada)) faseSelecionada = null;
  if (faseSelecionada === null) faseSelecionada = faseInicialDoMapa(estado, mapaSelecionado);

  // Só redesenha quando algo mudou (o Poder muda as cores da previsão)
  const chave = `${estado.combate.fasesConcluidas}|${estado.combate.faseAtual}|${estado.combate.autoAvancar}|${mapaSelecionado}|${faseSelecionada}|` +
    `${Math.round(poderTotal(calcularAtributos(estado)))}`;
  if (chave === chaveDesenhada) return;
  chaveDesenhada = chave;
  desenharZonas(estado);
  desenharTrilha(estado);
  desenharDesafio(estado);
}

// ---------------------------------------------------------------- esquerda
function desenharZonas(estado) {
  const indiceMundo = MAPAS[mapaSelecionado].mundo;

  // Mundos (liberados + o próximo trancado)
  const mundos = $('md-mundos');
  mundos.innerHTML = '';
  MUNDOS.forEach((mundo, i) => {
    const jogavel = i < MUNDOS_JOGAVEIS.length;
    if (!jogavel && i > MUNDOS_JOGAVEIS.length) return;   // dos mundos futuros, só o próximo aparece
    const aberto = jogavel && mundoLiberado(estado, i);
    const botao = document.createElement('button');
    botao.className = 'md-mundo' + (i === indiceMundo ? ' selecionado' : '');
    botao.disabled = !aberto;
    botao.innerHTML = aberto ? `Mundo ${i + 1}` : `${icone('cadeado')} Mundo ${i + 1}`;
    botao.title = aberto ? mundo.nome : (jogavel ? `Vença o chefe final do Mundo ${i}` : 'Em desenvolvimento');
    if (aberto) botao.addEventListener('click', () => selecionarMapa(mapasDoMundo(i)[0]));
    mundos.appendChild(botao);
  });
  $('md-mundo-nome').textContent = MUNDOS_JOGAVEIS[indiceMundo].nome.split(' — ')[0];

  // Zonas (os 12 mapas do mundo), com miniatura do fundo
  const lista = $('md-zonas');
  lista.innerHTML = '';
  mapasDoMundo(indiceMundo).forEach((indice) => {
    const mapa = MAPAS[indice];
    const liberado = mapaLiberado(estado, indice);
    const vencidas = fasesVencidasNoMapa(estado, indice);
    const zona = document.createElement('button');
    zona.className = 'md-zona' + (indice === mapaSelecionado ? ' selecionado' : '') + (vencidas === 12 ? ' completo' : '');
    zona.disabled = !liberado;
    zona.style.backgroundImage = `linear-gradient(90deg, rgba(10, 8, 16, 0.95) 35%, rgba(10, 8, 16, 0.35)), ${fundoDoMapa(indice)}`;
    zona.style.setProperty('--cor-mapa', mapa.cor);
    zona.innerHTML = liberado
      ? `<b>${indice + 1}. ${mapa.nome}</b><span class="md-zona-estrela">${vencidas === 12 ? '★' : '☆'} ${vencidas}/12</span>` +
        `<small>${mapa.descricao}</small>`
      : `<b>${icone('cadeado')} ${indice + 1}. ???</b><small>Vença o chefe do mapa anterior.</small>`;
    if (liberado) zona.addEventListener('click', () => selecionarMapa(indice));
    lista.appendChild(zona);
  });
  // No celular a lista rola de lado: deixa o mapa aberto à vista
  requestAnimationFrame(() => {
    const sel = lista.querySelector('.selecionado');
    if (sel && lista.scrollWidth > lista.clientWidth) lista.scrollLeft = sel.offsetLeft - (lista.clientWidth - sel.offsetWidth) / 2;
    else if (sel) lista.scrollTop = sel.offsetTop - lista.offsetTop - 8;
  });
}

// ---------------------------------------------------------------- centro
function desenharTrilha(estado) {
  const mapa = MAPAS[mapaSelecionado];
  $('md-trilha').style.backgroundImage = `linear-gradient(rgba(10, 8, 16, 0.1), rgba(10, 8, 16, 0.3)), ${fundoDoMapa(mapaSelecionado)}`;
  $('md-titulo').innerHTML = `<b>Mapa ${mapaSelecionado + 1}</b> · ${mapa.nome}`;

  const fases = FASES.filter(f => f.mapa === mapaSelecionado);
  // Caminho ligando as fases (SVG por baixo dos botões)
  const pontos = TRILHA.map(([x, y]) => `${x},${y}`).join(' ');
  const vencidas = fases.filter(f => f.indice <= estado.combate.fasesConcluidas).length;
  const pontosVencidos = TRILHA.slice(0, Math.max(1, vencidas + 1)).map(([x, y]) => `${x},${y}`).join(' ');
  $('md-caminho').innerHTML =
    `<polyline points="${pontos}" class="md-caminho-base"/><polyline points="${pontosVencidos}" class="md-caminho-feito"/>`;

  const nos = $('md-nos');
  nos.innerHTML = '';
  fases.forEach((fase, i) => {
    const liberada = faseLiberada(estado, fase.indice);
    const vencida = fase.indice <= estado.combate.fasesConcluidas;
    const no = document.createElement('button');
    no.className = `md-no tipo-${fase.chaveTipo}` + (vencida ? ' vencida' : '') + (liberada ? '' : ' trancada') +
      (fase.indice === estado.combate.faseAtual ? ' atual' : '') + (fase.indice === faseSelecionada ? ' selecionado' : '');
    no.style.left = TRILHA[i][0] + '%';
    no.style.top = TRILHA[i][1] + '%';
    no.disabled = !liberada;
    const forte = fase.chaveTipo === 'chefe' || fase.chaveTipo === 'miniChefe';
    no.innerHTML = (!liberada ? icone('cadeado') : vencida ? '✔' : forte ? icone(fase.tipo.sprite) : '') +
      `<span class="md-no-rotulo">[${mapaSelecionado + 1}-${fase.numero}]</span>`;
    no.title = liberada ? `${fase.local} — ${fase.inimigo.nome}` : 'Vença a fase anterior para liberar';
    if (liberada) no.addEventListener('click', () => {
      faseSelecionada = fase.indice;
      chaveDesenhada = '';
      atualizarTelaMapa(ultimoEstado);
    });
    nos.appendChild(no);
  });
}

// ---------------------------------------------------------------- direita
function desenharDesafio(estado) {
  const fase = FASES[faseSelecionada];
  const previsao = previsaoDaFase(estado, fase);
  $('md-fase-numero').textContent = `[${fase.mapa + 1}-${fase.numero}]`;
  $('md-fase-local').textContent = fase.local;
  $('md-fase-inimigo').innerHTML = `${fase.inimigo.nome} <span class="etiqueta tipo-${fase.chaveTipo}">${icone(fase.tipo.sprite)} ${fase.tipo.nome}</span>`;
  $('md-fase-miniatura').style.backgroundImage = fundoDoMapa(fase.mapa);
  desenharInimigo($('md-fase-sprite'), fase);
  $('md-fase-previsao').className = 'md-previsao ' + previsao.classe;
  $('md-fase-previsao').textContent = `Poder ${textoDoPoder(previsao.poderInimigo)} · ${textoDaPrevisao(previsao)}`;
  // v0.21.1: inimigo bem mais fraco que você rende menos Cultivo — avisa quanto
  const fator = fatorDoInimigo(estado, fase);
  $('md-fase-recompensa').innerHTML =
    `${icone('cultivo')} ${formatarNumero(cultivoDaVitoria(estado, fase))} · ${icone('pedra')} ${formatarNumero(fase.recompensa.pedras)}` +
    (fator < 0.995 ? `<small class="md-fraco">Inimigo fraco para você: ${Math.max(1, Math.round(fator * 100))}% do Cultivo</small>` : '');
  const aqui = fase.indice === estado.combate.faseAtual && !estado.combate.autoAvancar;
  $('md-farmar').textContent = aqui ? '✔ Farmando aqui' : '⚔️ Farmar aqui';
  $('md-farmar').classList.toggle('ativo', aqui);
}

// Usado quando o jogador escolhe uma fase: mostra o mapa dela da próxima vez
export function focarMapaDaFase(indiceFase) {
  mapaSelecionado = FASES[indiceFase].mapa;
  faseSelecionada = indiceFase;
  chaveDesenhada = '';
}
