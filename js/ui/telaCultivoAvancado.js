// =============================================================
// ui/telaCultivoAvancado.js — TELA DAS MELHORIAS DO CULTIVO (v0.21.0)
// Cartões da aba Cultivo (Reclusão, Pílulas, Arranjo, Bênçãos do Caminho),
// efeitos ativos na tela inicial, o brilho da Iluminação e o aviso da Reclusão no Combate.
// As regras ficam em sistemas/cultivoAvancado.js.
// =============================================================
import { CONFIG } from '../config.js';
import * as P from '../sistemas/progressao.js';
import * as CA from '../sistemas/cultivoAvancado.js';
import { liberado } from '../sistemas/desbloqueios.js';
import { REINOS } from '../dados/reinos.js';
import { formatarNumero } from '../format.js';
import { cabe } from '../saldos.js';
import { icone } from './sprite.js';

const $ = (id) => document.getElementById(id);

// Só troca o conteúdo quando ele muda (não atrapalha toques nos botões)
function html(el, texto) {
  if (el.dataset.html !== texto) { el.dataset.html = texto; el.innerHTML = texto; }
}
function texto(el, valor) {
  if (el.textContent !== valor) el.textContent = valor;
}

// 125 s → "2:05"
function relogio(segundos) {
  const s = Math.ceil(segundos);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
// 5400 s → "1 h 30 min"
function duracao(segundos) {
  const h = Math.floor(segundos / 3600), m = Math.floor((segundos % 3600) / 60);
  return h > 0 ? `${h} h ${m} min` : `${m} min`;
}
const porcento = (x) => `${Math.round(x * 100)}%`;

let acoesGuardadas = null;

export function montarCultivoAvancado(acoes, abrirPainel) {
  acoesGuardadas = acoes;
  $('botao-reclusao').addEventListener('click', acoes.aoAlternarReclusao);
  $('combate-sair-reclusao').addEventListener('click', acoes.aoAlternarReclusao);
  $('botao-arranjo').addEventListener('click', acoes.aoMelhorarArranjo);
  $('cult-ir-chefe').addEventListener('click', acoes.aoIrAoChefe);
  $('inicio-requisito').addEventListener('click', acoes.aoIrAoChefe);
  $('inicio-efeitos').addEventListener('click', () => abrirPainel('cultivo'));

  // Pílulas: um quadradinho por tipo (ícone, nome, quantidade e "Usar")
  const grade = $('pilulas-grade');
  for (const tipo of CA.TIPOS_DE_PILULA) {
    const celula = document.createElement('div');
    celula.className = 'pilula';
    celula.innerHTML = `${icone(tipo.icone, 'pilula-icone')}<b>${tipo.nome}</b><small class="pilula-texto"></small>` +
      `<span class="pilula-qtd"></span><button class="botao-cult">Usar</button>`;
    celula.querySelector('button').addEventListener('click', () => acoes.aoUsarPilula(tipo.id));
    celula.dataset.id = tipo.id;
    grade.appendChild(celula);
  }

  // Bênçãos (o botão da Fonte Estelar é criado junto com o texto)
  $('bencaos').addEventListener('click', (e) => { if (e.target.closest('#botao-fonte-estelar')) acoes.aoRefinarFonteEstelar(); });

  // Iluminação: tocar no brilho
  $('iluminacao').addEventListener('click', () => {
    const brilho = $('iluminacao');
    if (brilho.classList.contains('escondido') || brilho.classList.contains('colhido')) return;
    brilho.classList.add('colhido');
    setTimeout(() => brilho.classList.add('escondido'), 450);
    proximaIluminacao = sortearEspera();
    acoesGuardadas.aoIluminacao();
  });
}

export function atualizarCultivoAvancado(estado, painelAberto) {
  atualizarIluminacao(estado, painelAberto);
  atualizarEfeitosDoInicio(estado);
  $('combate-reclusao').classList.toggle('escondido', !(estado.reclusao.ativa && liberado(estado, 'combate')));
  if (painelAberto !== 'cultivo') return;   // os cartões só são atualizados com a aba aberta
  atualizarReclusao(estado);
  atualizarPilulas(estado);
  atualizarArranjo(estado);
  atualizarBencaos(estado);
}

// ---- Tela inicial: efeitos ativos ----
function atualizarEfeitosDoInicio(estado) {
  const e = estado.efeitos;
  const chips = [];
  if (estado.reclusao.ativa) chips.push(`<span class="chip-efeito chip-reclusao">${icone('reclusao')} Reclusão +${porcento(P.bonusDaReclusao(estado))}</span>`);
  if (e.iluminacao > 0) chips.push(`<span class="chip-efeito chip-iluminacao">${icone('iluminacao')} Iluminação ×${CONFIG.iluminacao.multiplicador} ${relogio(e.iluminacao)}</span>`);
  if (e.fluxo > 0) chips.push(`<span class="chip-efeito">${icone('pilula_fluxo')} Fluxo ×${CA.PILULA_POR_ID.fluxo.multiplicador} ${relogio(e.fluxo)}</span>`);
  if (e.rompimento > 0) chips.push(`<span class="chip-efeito">${icone('pilula_rompimento')} Rompimento −${porcento(e.rompimento)}</span>`);
  html($('inicio-efeitos'), chips.join(''));
}

// ---- Reclusão ----
function atualizarReclusao(estado) {
  const R = CONFIG.reclusao;
  const botao = $('botao-reclusao');
  if (!CA.reclusaoLiberada(estado)) {
    texto($('reclusao-estado'), `Libera no ${REINOS[P.REINO_DA_RECLUSAO].nome}`);
    texto($('reclusao-texto'), 'Feche-se numa caverna e cultive sem interrupções.');
    botao.classList.add('escondido');
    return;
  }
  botao.classList.remove('escondido');
  const ativa = estado.reclusao.ativa;
  texto(botao, ativa ? 'Sair' : 'Entrar');
  botao.classList.toggle('ativo', ativa);
  texto($('reclusao-estado'), ativa
    ? `Há ${duracao(estado.reclusao.segundos)} · Cultivo +${porcento(P.bonusDaReclusao(estado))}`
    : 'Desligada');
  texto($('reclusao-texto'), ativa
    ? `O combate está pausado. Quanto mais tempo, mais fundo: até +${porcento(R.bonusMaximo)} depois de ${R.horasParaOMaximo} h (conta com o jogo fechado). Sair zera a profundidade.`
    : `O combate para e o Cultivo rende +${porcento(R.bonusInicial)}, chegando a +${porcento(R.bonusMaximo)} depois de ${R.horasParaOMaximo} h. Boa para a noite ou quando um chefe está forte demais.`);
}

// ---- Pílulas ----
function atualizarPilulas(estado) {
  texto($('pilulas-info'), `Caem dos inimigos a partir do Mapa ${CONFIG.pilulas.mapaMinimo}`);
  for (const celula of $('pilulas-grade').children) {
    const tipo = CA.PILULA_POR_ID[celula.dataset.id];
    const qtd = estado.pilulas[tipo.id] ?? 0;
    texto(celula.querySelector('.pilula-qtd'), `×${qtd}`);
    texto(celula.querySelector('.pilula-texto'), CA.textoDaPilula(estado, tipo));
    celula.classList.toggle('vazia', qtd <= 0);
    celula.querySelector('button').classList.toggle('indisponivel', Boolean(CA.motivoParaNaoUsarPilula(estado, tipo.id)));
  }
}

// ---- Arranjo de Reunião de Energia ----
function atualizarArranjo(estado) {
  const botao = $('botao-arranjo');
  const nivel = estado.arranjo ?? 0;
  if (!liberado(estado, 'combate')) {
    texto($('arranjo-nivel'), 'Libera junto com o Combate');
    texto($('arranjo-texto'), 'Pedras Espirituais nos pontos do arranjo reúnem a Energia Mundial ao seu redor.');
    botao.classList.add('escondido');
    return;
  }
  botao.classList.remove('escondido');
  const custo = CA.custoDoArranjo(estado);
  texto($('arranjo-nivel'), `Nível ${nivel} · Cultivo +${porcento(P.bonusDoArranjo(estado))}`);
  html(botao, `${icone('pedra')} ${formatarNumero(custo)}`);
  botao.classList.toggle('indisponivel', !cabe(estado, 'pedras', custo));
  texto($('arranjo-texto'), `Cada nível: +${porcento(CONFIG.arranjo.bonusPorNivel)} de Cultivo. Fica para sempre.`);
}

// ---- Bênçãos: Batismo Mundial, Sentido Divino e Mestre Estelar ----
function atualizarBencaos(estado) {
  const B = CONFIG.batismo;
  const batismos = P.batismosMundiais(estado);
  const linhas = [];
  linhas.push(bencao('batismo', 'Batismo Mundial', batismos > 0,
    batismos > 0
      ? `${batismos}× · +${porcento(batismos * B.bonusPorBatismo)} Ataque, Vitalidade e Defesa`
      : `A partir da ${REINOS.find(r => r.id === B.primeiroReino).nome}: cada rompimento de reino dá +${porcento(B.bonusPorBatismo)} Ataque, Vitalidade e Defesa`));
  const sentido = P.temSentidoDivino(estado);
  linhas.push(bencao('atr_sentido_divino', 'Meditação do Sentido Divino', sentido,
    sentido ? `Meditar rende +${porcento(CONFIG.meditacaoComSentido)}` : `Libera com o Sentido Divino (Ascensão Imortal): Meditar +${porcento(CONFIG.meditacaoComSentido)}`));
  const M = CONFIG.mestreEstelar;
  let estelar;
  if (estado.mestreEstelar) {
    estelar = `Você refinou a Fonte Estelar: Cultivo +${porcento(M.bonusCultivo)} para sempre`;
  } else if (CA.fonteEstelarLiberada(estado)) {
    const pode = CA.podeRefinarFonteEstelar(estado);
    estelar = `Refine a Fonte Estelar de uma estrela: Cultivo +${porcento(M.bonusCultivo)} para sempre.` +
      `<button id="botao-fonte-estelar" class="botao-cult${pode ? '' : ' indisponivel'}">${icone('cultivo')} ${formatarNumero(CA.custoDaFonteEstelar(estado))}</button>`;
  } else {
    estelar = `Libera no ${REINOS[P.REINO_DO_MESTRE_ESTELAR].nome}: refinar a Fonte Estelar dá Cultivo +${porcento(M.bonusCultivo)} para sempre`;
  }
  linhas.push(bencao('mestre_estelar', 'Mestre Estelar', estado.mestreEstelar, estelar));
  html($('bencaos'), linhas.join(''));
}

function bencao(nomeDoIcone, titulo, ativa, descricao) {
  return `<div class="bencao${ativa ? ' ativa' : ''}">${icone(nomeDoIcone)}<div><b>${titulo}</b><small>${descricao}</small></div></div>`;
}

// ---- Iluminação: um brilho aparece de vez em quando na tela inicial ----
let proximaIluminacao = sortearEspera();   // segundos com a tela inicial à vista até aparecer
let restanteNaTela = 0;
let ultimoQuadro = performance.now();

function sortearEspera() {
  const [min, max] = CONFIG.iluminacao.aparecerEntre;
  return min + Math.random() * (max - min);
}

function atualizarIluminacao(estado, painelAberto) {
  const agora = performance.now();
  const dt = Math.min(1, (agora - ultimoQuadro) / 1000);
  ultimoQuadro = agora;
  const brilho = $('iluminacao');
  // Só conta com a tela inicial à vista (sem painel aberto, com o personagem criado)
  const aVista = !document.hidden && !painelAberto && Boolean(estado.personagem);
  if (!aVista) return;

  if (!brilho.classList.contains('escondido')) {
    if (brilho.classList.contains('colhido')) return;
    restanteNaTela -= dt;
    if (restanteNaTela <= 0) {             // não foi tocado: some devagar
      brilho.classList.add('sumindo');
      setTimeout(() => brilho.classList.add('escondido'), 900);
      restanteNaTela = Infinity;
      proximaIluminacao = sortearEspera();
    }
    return;
  }
  proximaIluminacao -= dt;
  if (proximaIluminacao > 0) return;
  // Aparece em volta do personagem, sem cobrir os botões
  brilho.style.left = `${12 + Math.random() * 66}%`;
  brilho.style.top = `${24 + Math.random() * 34}%`;
  brilho.classList.remove('escondido', 'colhido', 'sumindo');
  restanteNaTela = CONFIG.iluminacao.segundosNaTela;
}
