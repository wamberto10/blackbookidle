// =============================================================
// ui/telaMapa.js — aba Mapa
// v0.31.0: layout do mockup (docs/layout/layout_mapa.png), com bordas finas e simples (pedido do dono):
//   abas dos 8 mundos → carrossel com os 12 mapas do mundo → painel do desafio da fase escolhida
//   (inimigo, Poder, previsão, recompensas e "Farmar aqui") → trilha das 12 fases sobre a paisagem
//   do mapa → dificuldades (só a Fácil existe; as outras ficam "Em breve").
// =============================================================
import { CONFIG } from '../config.js';
import { MUNDOS } from '../dados/mundos.js';
import { liberado as sistemaLiberado } from '../sistemas/desbloqueios.js';
import { MAPAS, FASES, MUNDOS_JOGAVEIS, mapaLiberado, faseLiberada, fasesVencidasNoMapa,
  mapasDoMundo, primeiraFaseDoMundo } from '../sistemas/mundo.js';
import { cultivoDaVitoria, fatorDoInimigo } from '../sistemas/combate.js';
import { formatarNumero } from '../format.js';
import { desenharInimigo } from './sprite.js';
import { calcularAtributos, poderTotal } from '../sistemas/atributos.js';
import { previsaoDaFase, textoDaPrevisao, textoDoPoder, TEXTO_CURTO_DO_SELO } from './poder.js';

const $ = (id) => document.getElementById(id);

// Posição de cada fase na trilha (% da largura, % da altura), como no mockup:
// 1 a 7 em cima, da esquerda para a direita; 8 a 12 voltando embaixo (o chefe à esquerda)
const TRILHA = [
  [13, 30], [27, 36], [41, 43], [54, 35], [68, 41], [80, 50],
  [90, 64], [79, 75], [64, 82], [48, 77], [33, 82], [15, 81],
];
// Dificuldades (a escolha vem em uma etapa futura; por enquanto só a Fácil existe)
const DIFICULDADES = [
  { nome: 'Fácil', icone: 'dif_facil', ativa: true }, { nome: 'Normal', icone: 'dif_normal' },
  { nome: 'Difícil', icone: 'dif_dificil' }, { nome: 'Muito Difícil', icone: 'dif_muito_dificil' }, { nome: 'Inferno' },
];

let acoesGuardadas = null;
let ultimoEstado = null;
let mapaSelecionado = null;    // mapa aberto na tela (não precisa ser salvo)
let faseSelecionada = null;    // fase marcada na trilha (mostrada no painel do desafio)
let chaveDesenhada = '';

export function montarTelaMapa(acoes) {
  acoesGuardadas = acoes;
  $('md-farmar').addEventListener('click', () => {
    if (faseSelecionada === null || !ultimoEstado || !faseLiberada(ultimoEstado, faseSelecionada)) return;
    acoesGuardadas.aoEscolherFase(faseSelecionada);
    acoesGuardadas.aoMudarAutoCombate(false);   // fica lutando nesta fase
  });
  // Setas do carrossel: andam um cartão
  const andar = (lado) => {
    const cartas = $('mp-cartas');
    const carta = cartas.querySelector('.mp-carta');
    cartas.scrollBy({ left: lado * (carta ? carta.offsetWidth + 10 : 200), behavior: 'smooth' });
  };
  $('mp-seta-esq').addEventListener('click', () => andar(-1));
  $('mp-seta-dir').addEventListener('click', () => andar(1));
  // Dificuldades: só a lista (a escolha vem depois)
  $('md-dificuldades').innerHTML = DIFICULDADES.map(d =>
    `<div class="mp-dif${d.ativa ? ' ativa' : ' trancada'}" title="${d.ativa ? 'Dificuldade atual' : 'Em breve'}">` +
    (d.icone && d.ativa ? `<img src="img/ui/${d.icone}.png" alt="">` : '<img src="img/icones/cadeado.png" alt="">') +
    `<span><b>${d.nome}</b>${d.ativa ? '' : '<small>Em breve</small>'}</span></div>`).join('');
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

  // Com o Mapa fechado não precisa calcular nada (redesenha em até 0,1 s ao abrir)
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
  desenharMundos(estado);
  desenharCartas(estado);
  desenharDesafio(estado);
  desenharTrilha(estado);
}

// ---------------------------------------------------------------- abas dos mundos
function desenharMundos(estado) {
  const indiceMundo = MAPAS[mapaSelecionado].mundo;
  const caixa = $('mp-mundos');
  caixa.innerHTML = '';
  MUNDOS.forEach((mundo, i) => {
    const jogavel = i < MUNDOS_JOGAVEIS.length;
    if (!jogavel && i > MUNDOS_JOGAVEIS.length) return;   // dos mundos futuros, só o próximo aparece
    const aberto = jogavel && mundoLiberado(estado, i);
    const botao = document.createElement('button');
    botao.className = 'ui mp-mundo' + (i === indiceMundo ? ' ativo' : '') + (aberto ? '' : ' trancado');
    botao.disabled = !aberto;
    botao.innerHTML = `<img src="${aberto ? `img/ui/mundo_icone_${i + 1}.png` : 'img/icones/cadeado.png'}" alt=""><span>Mundo ${i + 1}</span>`;
    botao.title = aberto ? mundo.nome : (jogavel ? `Vença o chefe final do Mundo ${i}` : 'Em desenvolvimento');
    if (aberto) botao.addEventListener('click', () => selecionarMapa(mapasDoMundo(i)[0]));
    caixa.appendChild(botao);
  });
}

// ---------------------------------------------------------------- carrossel dos mapas
function desenharCartas(estado) {
  const indiceMundo = MAPAS[mapaSelecionado].mundo;
  const lista = $('mp-cartas');
  lista.innerHTML = '';
  mapasDoMundo(indiceMundo).forEach((indice) => {
    const mapa = MAPAS[indice];
    const liberado = mapaLiberado(estado, indice);
    const vencidas = fasesVencidasNoMapa(estado, indice);
    const carta = document.createElement('button');
    carta.className = 'ui mp-carta' + (indice === mapaSelecionado ? ' ativa' : '') + (liberado ? '' : ' trancada') + (vencidas === 12 ? ' completa' : '');
    carta.disabled = !liberado;
    carta.title = liberado ? `Mapa ${indice + 1}: ${mapa.descricao}` : 'Vença o chefe do mapa anterior.';
    carta.innerHTML = `<span class="mp-carta-foto" style="background-image:${fundoDoMapa(indice)}"></span>
      <span class="mp-carta-texto">${liberado
        ? `<b>${mapa.nome}</b><small><img src="img/ui/icone_estrela.png" alt="">${vencidas}/12</small>`
        : `<b><img src="img/icones/cadeado.png" alt=""> Mapa ${indice + 1}</b><small>Trancado</small>`}</span>`;
    if (liberado) carta.addEventListener('click', () => selecionarMapa(indice));
    lista.appendChild(carta);
  });
  // Deixa o mapa aberto à vista (no meio do carrossel) — na hora, sem esperar o próximo quadro
  const sel = lista.querySelector('.ativa');
  if (sel) lista.scrollLeft = sel.offsetLeft - (lista.clientWidth - sel.offsetWidth) / 2;
}

// ---------------------------------------------------------------- painel do desafio
function desenharDesafio(estado) {
  const fase = FASES[faseSelecionada];
  const previsao = previsaoDaFase(estado, fase);
  $('mp-fase').textContent = `Fase ${fase.mapa + 1}-${fase.numero}`;
  $('mp-local').textContent = fase.local;
  $('mp-tipo-icone').src = `img/icones/${fase.tipo.sprite}.png`;
  $('mp-inimigo-nome').textContent = fase.inimigo.nome;
  $('mp-tipo').textContent = fase.tipo.nome;
  $('mp-tipo').className = `mp-tipo tipo-${fase.chaveTipo}`;
  $('mp-retrato').style.backgroundImage = `linear-gradient(rgba(10, 8, 16, 0.2), rgba(10, 8, 16, 0.75)), ${fundoDoMapa(fase.mapa)}`;
  desenharInimigo($('mp-sprite'), fase);
  $('mp-poder').innerHTML = `Poder: <b>${textoDoPoder(previsao.poderInimigo)}</b>`;
  $('mp-previsao').innerHTML = `Previsão: <b class="${previsao.classe}">${previsao.texto}</b>`;
  $('mp-previsao').title = textoDaPrevisao(previsao);
  // Recompensas reais: Cultivo, Pedras e a chance de cair um item
  const chanceItem = CONFIG.equipamentos.chanceDeDrop[fase.chaveTipo] ?? 0;
  const caixa = (icone, valor, titulo) => `<span class="mp-rec" title="${titulo}"><img src="img/ui/${icone}.png" alt=""><b>${valor}</b></span>`;
  $('mp-recompensas').innerHTML =
    caixa('icone_cultivo', '+' + formatarNumero(cultivoDaVitoria(estado, fase)), 'Cultivo por vitória') +
    caixa('icone_pedras', '+' + formatarNumero(fase.recompensa.pedras), 'Pedras Espirituais por vitória') +
    caixa('icone_bau', `${Math.round(chanceItem * 1000) / 10}%`, 'Chance de cair um equipamento a cada vitória');
  // v0.21.1: inimigo bem mais fraco que você rende menos Cultivo | v0.26.0: Selo do Mundo Primordial
  const fator = fatorDoInimigo(estado, fase);
  $('mp-aviso').textContent = fase.selado ? TEXTO_CURTO_DO_SELO
    : fator < 0.9 ? `Inimigo fraco para você: rende ${Math.max(1, Math.round(fator * 100))}% do Cultivo.` : '';
  const aqui = fase.indice === estado.combate.faseAtual && !estado.combate.autoAvancar;
  $('md-farmar').querySelector('span').textContent = aqui ? 'Farmando aqui' : 'Farmar aqui';
  $('md-farmar').classList.toggle('ativo', aqui);
}

// ---------------------------------------------------------------- trilha das fases
function desenharTrilha(estado) {
  const mapa = MAPAS[mapaSelecionado];
  $('md-trilha').style.backgroundImage = `linear-gradient(rgba(10, 8, 16, 0.05), rgba(10, 8, 16, 0.25)), ${fundoDoMapa(mapaSelecionado)}`;
  $('md-titulo').innerHTML = `<b>${mapa.nome}</b><small>Mapa ${mapaSelecionado + 1}</small>`;

  const fases = FASES.filter(f => f.mapa === mapaSelecionado);
  // Caminho pontilhado ligando as fases (SVG por baixo dos nós)
  const pontos = TRILHA.map(([x, y]) => `${x},${y}`).join(' ');
  $('md-caminho').innerHTML = `<polyline points="${pontos}" class="mp-caminho-linha"/>`;

  const nos = $('md-nos');
  nos.innerHTML = '';
  fases.forEach((fase, i) => {
    const liberada = faseLiberada(estado, fase.indice);
    const vencida = fase.indice <= estado.combate.fasesConcluidas;
    const chefe = fase.chaveTipo === 'chefe';
    const atual = fase.indice === estado.combate.faseAtual;
    // vencida (✔) · atual / próxima (espadas) · chefe (caveira) · trancada (cadeado)
    const imagem = chefe && !vencida ? 'no_chefe' : vencida && !atual ? 'no_vencido' : liberada ? 'no_atual' : 'no_trancado';
    const no = document.createElement('button');
    no.className = 'ui mp-no' + (chefe ? ' chefe' : '') + (atual ? ' atual' : '') + (liberada ? '' : ' trancada') +
      (fase.indice === faseSelecionada ? ' selecionado' : '');
    no.style.left = TRILHA[i][0] + '%';
    no.style.top = TRILHA[i][1] + '%';
    no.disabled = !liberada;
    no.innerHTML = `<img src="img/ui/${imagem}.png" alt=""><span>${fase.numero}</span>`;
    no.title = liberada ? `${fase.local} — ${fase.inimigo.nome} (${fase.tipo.nome})` : 'Vença a fase anterior para liberar';
    if (liberada) no.addEventListener('click', () => {
      faseSelecionada = fase.indice;
      chaveDesenhada = '';
      atualizarTelaMapa(ultimoEstado);
    });
    nos.appendChild(no);
  });
}

// Usado quando o jogador escolhe uma fase: mostra o mapa dela da próxima vez
export function focarMapaDaFase(indiceFase) {
  mapaSelecionado = FASES[indiceFase].mapa;
  faseSelecionada = indiceFase;
  chaveDesenhada = '';
}
