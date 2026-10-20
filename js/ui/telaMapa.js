// =============================================================
// ui/telaMapa.js — aba Mapa
// v0.31.0: layout do mockup (docs/layout/layout_mapa.png), com bordas finas e simples (pedido do dono):
//   abas dos 8 mundos → carrossel com os 12 mapas do mundo → painel do desafio da fase escolhida
//   (inimigo, Poder, previsão, recompensas e "Farmar aqui") → trilha das 12 fases sobre a paisagem
//   do mapa → dificuldades.
// v0.32.0 (progressão contínua): as dificuldades funcionam — Fácil → Normal → Difícil → Inferno → Infinito, os
// mesmos 96 mapas desenhados num patamar acima. "mapaSelecionado" é o mapa GLOBAL; a arte vem do mapa visual.
// No Infinito, as setas da linha dos mundos trocam de ciclo (cada ciclo = 8 mundos / 96 mapas).
// =============================================================
import { CONFIG } from '../config.js';
import { liberado as sistemaLiberado } from '../sistemas/desbloqueios.js';
import { obterFase, mapaDesenhado, dadosDoMundo, mapaLiberado, faseLiberada, fasesVencidasNoMapa,
  mapasDoMundo, primeiraFaseDoMundo, dificuldadeLiberada, mapaDaFronteira, MUNDOS_POR_DIFICULDADE } from '../sistemas/mundo.js';
import { DIFICULDADES, MAPAS_POR_DIFICULDADE, FASES_POR_MAPA, ULTIMA_DIFICULDADE, mapaDaFase, mapaVisual, cicloDoMapa,
  dificuldadeDoMapa, numeroNaDificuldade, nomeDaPosicao, primeiroMapaDaDificuldade } from '../sistemas/escala.js';
import { cultivoDaVitoria, fatorDoInimigo } from '../sistemas/combate.js';
import { essenciaPorSegundo, essenciaDaPrimeiraConquista } from '../sistemas/blackbook.js';
import { formatarNumero } from '../format.js';
import { multiplicar } from '../numeros.js';
import { desenharInimigo } from './sprite.js';
import { calcularAtributos, poderTotal } from '../sistemas/atributos.js';
import { previsaoDaFase, textoDaPrevisao, textoDoPoder, TEXTO_CURTO_DO_SELO } from './poder.js';

const $ = (id) => document.getElementById(id);
const MAPAS_POR_MUNDO = MAPAS_POR_DIFICULDADE / MUNDOS_POR_DIFICULDADE;   // 12

// Posição de cada fase na trilha (% da largura, % da altura), como no mockup:
// 1 a 7 em cima, da esquerda para a direita; 8 a 12 voltando embaixo (o chefe à esquerda)
const TRILHA = [
  [13, 30], [27, 36], [41, 43], [54, 35], [68, 41], [80, 50],
  [90, 64], [79, 75], [64, 82], [48, 77], [33, 82], [15, 81],
];

let acoesGuardadas = null;
let ultimoEstado = null;
let mapaSelecionado = null;    // mapa GLOBAL aberto na tela (não precisa ser salvo)
let faseSelecionada = null;    // fase global marcada na trilha (mostrada no painel do desafio)
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
}

const fundoDoMapa = (mapaGlobal) => `url('img/fundos/mapa${String(mapaVisual(mapaGlobal) + 1).padStart(2, '0')}.jpg')`;

function mundoLiberado(estado, indiceMundo) {
  return faseLiberada(estado, primeiraFaseDoMundo(indiceMundo));
}

function selecionarMapa(indice) {
  mapaSelecionado = indice;
  faseSelecionada = null;
  chaveDesenhada = '';
  atualizarTelaMapa(ultimoEstado);
}

// Mapa que abre ao escolher uma dificuldade (ou um ciclo do Infinito): o atual, se for dela; senão o mais longe
// já aberto nela (para trás, o último mapa dela)
function mapaDeEntrada(estado, primeiro, ultimo) {
  const atual = mapaDaFase(estado.combate.faseAtual);
  if (atual >= primeiro && atual <= ultimo) return atual;
  return Math.max(primeiro, Math.min(ultimo, mapaDaFronteira(estado)));
}

// Fase que aparece marcada ao abrir um mapa: a atual (se for deste mapa) ou a mais longe liberada
function faseInicialDoMapa(estado, indiceMapa) {
  const atual = estado.combate.faseAtual;
  if (mapaDaFase(atual) === indiceMapa) return atual;
  let fase = indiceMapa * FASES_POR_MAPA;
  while (fase + 1 < (indiceMapa + 1) * FASES_POR_MAPA && faseLiberada(estado, fase + 1)) fase += 1;
  return fase;
}

export function atualizarTelaMapa(estado) {
  ultimoEstado = estado;
  const liberado = sistemaLiberado(estado, 'mapa');
  $('mapa-bloqueado').classList.toggle('escondido', liberado);
  $('mapa-conteudo').classList.toggle('escondido', !liberado);
  if (!liberado) return;

  // Com o Mapa fechado não precisa calcular nada (redesenha em até 0,1 s ao abrir)
  if (!$('aba-mapa').classList.contains('aberto')) return;
  // Seleção que ficou inválida (apagou o progresso): volta para o mapa atual
  if (mapaSelecionado === null || !mapaLiberado(estado, mapaSelecionado)) {
    mapaSelecionado = mapaDaFase(estado.combate.faseAtual);
    faseSelecionada = null;
  }
  if (faseSelecionada !== null && !faseLiberada(estado, faseSelecionada)) faseSelecionada = null;
  if (faseSelecionada === null) faseSelecionada = faseInicialDoMapa(estado, mapaSelecionado);

  // Só redesenha quando algo mudou (o Poder muda as cores da previsão)
  const chave = `${estado.combate.fasesConcluidas}|${estado.combate.faseAtual}|${estado.combate.autoAvancar}|${mapaSelecionado}|${faseSelecionada}|` +
    `${formatarNumero(poderTotal(calcularAtributos(estado)))}|${estado.vip}`;
  if (chave === chaveDesenhada) return;
  chaveDesenhada = chave;
  desenharMundos(estado);
  desenharCartas(estado);
  desenharDesafio(estado);
  desenharTrilha(estado);
  desenharDificuldades(estado);
}

// ---------------------------------------------------------------- abas dos mundos
function desenharMundos(estado) {
  const mundoAtual = Math.floor(mapaSelecionado / MAPAS_POR_MUNDO);
  const ciclo = cicloDoMapa(mapaSelecionado);
  const primeiroMundo = ciclo * MUNDOS_POR_DIFICULDADE;
  const noInfinito = dificuldadeDoMapa(mapaSelecionado) === ULTIMA_DIFICULDADE;
  const caixa = $('mp-mundos');
  caixa.innerHTML = '';
  // No Infinito: setas para o ciclo anterior / seguinte (o seguinte só depois de vencer o último chefe deste)
  const anterior = noInfinito && ciclo > ULTIMA_DIFICULDADE;
  const seguinte = noInfinito && dificuldadeLiberada(estado, ciclo + 1);
  caixa.classList.toggle('com-ciclos', anterior || seguinte);
  const seta = (lado, ativa, novoCiclo) => {
    const botao = document.createElement('button');
    botao.className = `ui mp-mundo mp-ciclo${ativa ? '' : ' trancado'}`;
    botao.disabled = !ativa;
    botao.textContent = lado;
    botao.title = ativa ? `Infinito — ciclo ${novoCiclo - ULTIMA_DIFICULDADE + 1}` : '';
    if (ativa) botao.addEventListener('click', () => {
      const primeiro = novoCiclo * MAPAS_POR_DIFICULDADE;
      selecionarMapa(mapaDeEntrada(estado, primeiro, primeiro + MAPAS_POR_DIFICULDADE - 1));
    });
    caixa.appendChild(botao);
  };
  if (anterior || seguinte) seta('◀', anterior, ciclo - 1);
  for (let i = 0; i < MUNDOS_POR_DIFICULDADE; i++) {
    const w = primeiroMundo + i;
    const aberto = mundoLiberado(estado, w);
    // Número do mundo dentro da dificuldade (no Infinito continua contando: Mundo 9, 10...)
    const numero = noInfinito ? w - ULTIMA_DIFICULDADE * MUNDOS_POR_DIFICULDADE + 1 : i + 1;
    const botao = document.createElement('button');
    botao.className = 'ui mp-mundo' + (w === mundoAtual ? ' ativo' : '') + (aberto ? '' : ' trancado');
    botao.disabled = !aberto;
    botao.innerHTML = `<img src="${aberto ? `img/ui/mundo_icone_${i + 1}.png` : 'img/icones/cadeado.png'}" alt=""><span>Mundo ${numero}</span>`;
    botao.title = aberto ? `${DIFICULDADES[dificuldadeDoMapa(w * MAPAS_POR_MUNDO)].nome} — ${dadosDoMundo(w).nome}`
      : 'Vença o chefe final do mundo anterior';
    if (aberto) botao.addEventListener('click', () => selecionarMapa(mapasDoMundo(w)[0]));
    caixa.appendChild(botao);
  }
  if (anterior || seguinte) seta('▶', seguinte, ciclo + 1);
}

// ---------------------------------------------------------------- carrossel dos mapas
function desenharCartas(estado) {
  const indiceMundo = Math.floor(mapaSelecionado / MAPAS_POR_MUNDO);
  const lista = $('mp-cartas');
  lista.innerHTML = '';
  mapasDoMundo(indiceMundo).forEach((indice) => {
    const mapa = mapaDesenhado(indice);
    const liberado = mapaLiberado(estado, indice);
    const vencidas = fasesVencidasNoMapa(estado, indice);
    const carta = document.createElement('button');
    carta.className = 'ui mp-carta' + (indice === mapaSelecionado ? ' ativa' : '') + (liberado ? '' : ' trancada') + (vencidas === 12 ? ' completa' : '');
    carta.disabled = !liberado;
    carta.title = liberado ? `${nomeDaPosicao(indice)}: ${mapa.descricao}` : 'Vença o chefe do mapa anterior.';
    carta.innerHTML = `<span class="mp-carta-foto" style="background-image:${fundoDoMapa(indice)}"></span>
      <span class="mp-carta-texto">${liberado
        ? `<b>${mapa.nome}</b><small><img src="img/ui/icone_estrela.png" alt="">${vencidas}/12</small>`
        : `<b><img src="img/icones/cadeado.png" alt=""> Mapa ${numeroNaDificuldade(indice)}</b><small>Trancado</small>`}</span>`;
    if (liberado) carta.addEventListener('click', () => selecionarMapa(indice));
    lista.appendChild(carta);
  });
  // Deixa o mapa aberto à vista (no meio do carrossel) — na hora, sem esperar o próximo quadro
  const sel = lista.querySelector('.ativa');
  if (sel) lista.scrollLeft = sel.offsetLeft - (lista.clientWidth - sel.offsetWidth) / 2;
}

// ---------------------------------------------------------------- painel do desafio
function desenharDesafio(estado) {
  const fase = obterFase(faseSelecionada);
  const previsao = previsaoDaFase(estado, fase);
  const dificuldade = fase.dificuldade > 0 ? `${DIFICULDADES[fase.dificuldade].nome} · ` : '';
  $('mp-fase').textContent = `${dificuldade}Fase ${numeroNaDificuldade(fase.mapa)}-${fase.numero}`;
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
  // Recompensas reais: Cultivo, Pedras, Essência (v0.32.0: farm por hora de luta vencida) e a chance de item
  const chanceItem = CONFIG.equipamentos.chanceDeDrop[fase.chaveTipo] ?? 0;
  const inedita = fase.indice > estado.combate.fasesConcluidas;
  const caixa = (icone, valor, titulo) => `<span class="mp-rec" title="${titulo}"><img src="img/ui/${icone}.png" alt=""><b>${valor}</b></span>`;
  $('mp-recompensas').innerHTML =
    caixa('icone_cultivo', '+' + formatarNumero(cultivoDaVitoria(estado, fase)), 'Cultivo por vitória') +
    caixa('icone_pedras', '+' + formatarNumero(fase.recompensa.pedras), 'Pedras Espirituais por vitória') +
    caixa('icone_essencia', '+' + formatarNumero(multiplicar(essenciaPorSegundo(estado, fase.indice), 3600)) + '/h',
      'Essência da Alma por hora de luta vencida aqui (farm)' + (inedita
        ? ` · 1ª vitória: +${formatarNumero(essenciaDaPrimeiraConquista(fase.indice))} (uma vez só)` : '')) +
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
  const mapa = mapaDesenhado(mapaSelecionado);
  $('md-trilha').style.backgroundImage = `linear-gradient(rgba(10, 8, 16, 0.05), rgba(10, 8, 16, 0.25)), ${fundoDoMapa(mapaSelecionado)}`;
  $('md-titulo').innerHTML = `<b>${mapa.nome}</b><small>${nomeDaPosicao(mapaSelecionado)}</small>`;

  const fases = Array.from({ length: FASES_POR_MAPA }, (_, i) => obterFase(mapaSelecionado * FASES_POR_MAPA + i));
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

// ---------------------------------------------------------------- dificuldades (v0.32.0)
// Fácil → Normal → Difícil → Inferno → Infinito. Cada uma abre ao vencer o último chefe da anterior;
// escolher uma abre o mapa atual (se for dela) ou o mais longe já aberto nela.
function desenharDificuldades(estado) {
  const ativa = dificuldadeDoMapa(mapaSelecionado);
  const caixa = $('md-dificuldades');
  caixa.innerHTML = '';
  DIFICULDADES.forEach((d, i) => {
    const aberta = dificuldadeLiberada(estado, i);
    const botao = document.createElement('button');
    botao.className = 'ui mp-dif' + (i === ativa ? ' ativa' : '') + (aberta ? '' : ' trancada');
    botao.disabled = !aberta;
    const anterior = DIFICULDADES[i - 1];
    botao.title = aberta ? `${d.nome}: mapas globais ${primeiroMapaDaDificuldade(i) + 1}` +
      (i === ULTIMA_DIFICULDADE ? ' em diante' : `–${primeiroMapaDaDificuldade(i) + MAPAS_POR_DIFICULDADE}`)
      : `Vença o chefe do Mapa 96 da dificuldade ${anterior.nome}`;
    const ciclo = i === ULTIMA_DIFICULDADE && i === ativa ? `<small>Ciclo ${cicloDoMapa(mapaSelecionado) - ULTIMA_DIFICULDADE + 1}</small>` : '';
    botao.innerHTML = (aberta && d.icone ? `<img src="img/ui/${d.icone}.png" alt="">` : '<img src="img/icones/cadeado.png" alt="">') +
      `<span><b>${d.nome}</b>${aberta ? ciclo : '<small>Trancada</small>'}</span>`;
    if (aberta) botao.addEventListener('click', () => {
      const primeiro = primeiroMapaDaDificuldade(i);
      const ultimo = i === ULTIMA_DIFICULDADE ? Infinity : primeiro + MAPAS_POR_DIFICULDADE - 1;
      selecionarMapa(mapaDeEntrada(estado, primeiro, ultimo));
    });
    caixa.appendChild(botao);
  });
}

// Usado quando o jogador escolhe uma fase: mostra o mapa dela da próxima vez
export function focarMapaDaFase(indiceFase) {
  mapaSelecionado = mapaDaFase(indiceFase);
  faseSelecionada = indiceFase;
  chaveDesenhada = '';
}
