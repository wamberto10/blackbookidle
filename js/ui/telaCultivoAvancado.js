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

// v0.35.0: nomes curtos nos cartões das pílulas (o nome completo fica na dica)
const NOME_CURTO_DA_PILULA = { acumulo: 'Acúmulo de Qi', fluxo: 'Fluxo Celestial', rompimento: 'Quebra-Gargalo' };
function efeitoCurtoDaPilula(estado, tipo) {
  if (tipo.id === 'acumulo') return `+${Math.round(tipo.segundosDeCultivo / 60)} min de Cultivo`;
  if (tipo.id === 'fluxo') return `×${tipo.multiplicador} por ${Math.round(tipo.segundos / 60)} min`;
  return `−${porcento(CA.descontoDaQuebraGargalo(estado))} no rompimento`;
}

let acoesGuardadas = null;

export function montarCultivoAvancado(acoes, abrirPainel) {
  acoesGuardadas = acoes;
  $('botao-reclusao').addEventListener('click', acoes.aoAlternarReclusao);
  $('combate-sair-reclusao').addEventListener('click', acoes.aoAlternarReclusao);
  $('botao-arranjo').addEventListener('click', acoes.aoMelhorarArranjo);
  $('cult-ir-chefe').addEventListener('click', acoes.aoIrAoChefe);
  $('inicio-requisito').addEventListener('click', acoes.aoIrAoChefe);
  $('inicio-efeitos').addEventListener('click', () => abrirPainel('cultivo'));

  // Pílulas: v0.35.0 — um cartão por tipo (ícone do kit, quantidade no canto, nome curto) e o efeito embaixo;
  // tocar no cartão usa a pílula
  const grade = $('pilulas-grade');
  for (const tipo of CA.TIPOS_DE_PILULA) {
    const celula = document.createElement('div');
    celula.className = `cn-pilula cn-pilula-${tipo.id}`;
    celula.innerHTML = `<button class="ui cn-pilula-botao" title="${tipo.nome}"><img src="img/ui/cult_pilula_${tipo.id}.png" alt="">` +
      `<span class="cn-pilula-qtd"></span><b>${NOME_CURTO_DA_PILULA[tipo.id] ?? tipo.nome}</b></button><small class="cn-pilula-efeito"></small>`;
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
  // v0.35.0: texto curto, 2 linhas com ícone (bônus e tempo) e o botão largo embaixo; a explicação inteira na dica
  const R = CONFIG.reclusao;
  const botao = $('botao-reclusao');
  const caixa = $('cult-reclusao');
  const explicacao = `O combate das fases para e o Cultivo rende +${porcento(R.bonusInicial)}, chegando a +${porcento(R.bonusMaximo)} ` +
    `depois de ${R.horasParaOMaximo} h (conta com o jogo fechado). Sair zera a profundidade.`;
  caixa.title = explicacao;
  if (!CA.reclusaoLiberada(estado)) {
    texto($('reclusao-texto'), 'Feche-se numa caverna e cultive sem interrupções.');
    texto($('reclusao-bonus'), `+${porcento(R.bonusInicial)} a +${porcento(R.bonusMaximo)} de produção`);
    texto($('reclusao-estado'), `Libera no ${REINOS[P.REINO_DA_RECLUSAO].nome}`);
    botao.classList.add('escondido');
    caixa.classList.add('trancado');
    return;
  }
  caixa.classList.remove('trancado');
  botao.classList.remove('escondido');
  const ativa = estado.reclusao.ativa;
  texto(botao, ativa ? 'Sair da reclusão ›' : 'Entrar em reclusão ›');
  botao.classList.toggle('ativo', ativa);
  caixa.classList.toggle('ativa', ativa);
  texto($('reclusao-texto'), ativa ? 'Em reclusão: o combate está pausado e o Cultivo rende mais.'
    : 'O combate para e o Cultivo rende mais, também com o jogo fechado.');
  texto($('reclusao-bonus'), ativa ? `+${porcento(P.bonusDaReclusao(estado))} de produção agora`
    : `+${porcento(R.bonusInicial)} de produção (até +${porcento(R.bonusMaximo)})`);
  texto($('reclusao-estado'), ativa ? `Há ${duracao(estado.reclusao.segundos)}` : `Máximo em ${R.horasParaOMaximo} h`);
}

// ---- Pílulas ----
function atualizarPilulas(estado) {
  texto($('pilulas-info'), `Caem dos inimigos a partir do Mapa ${CONFIG.pilulas.mapaMinimo}`);
  for (const celula of $('pilulas-grade').children) {
    const tipo = CA.PILULA_POR_ID[celula.dataset.id];
    const qtd = estado.pilulas[tipo.id] ?? 0;
    const botao = celula.querySelector('button');
    texto(celula.querySelector('.cn-pilula-qtd'), String(qtd));
    texto(celula.querySelector('.cn-pilula-efeito'), efeitoCurtoDaPilula(estado, tipo));
    botao.title = `${tipo.nome}: ${CA.textoDaPilula(estado, tipo)} Toque para usar.`;
    celula.classList.toggle('vazia', qtd <= 0);
    botao.classList.toggle('indisponivel', Boolean(CA.motivoParaNaoUsarPilula(estado, tipo.id)));
  }
}

// ---- Arranjo de Reunião de Energia ----
function atualizarArranjo(estado) {
  // v0.35.0: "Nv. 5 → Nv. 6", "Bônus de produção +10% → +12%" e o botão com o custo em Pedras + "Aprimorar"
  const botao = $('botao-arranjo');
  const caixa = $('cult-arranjo');
  const nivel = estado.arranjo ?? 0;
  caixa.title = 'Pedras Espirituais nos pontos do arranjo reúnem a Energia Mundial ao seu redor. ' +
    `Cada nível: +${porcento(CONFIG.arranjo.bonusPorNivel)} de Cultivo. Fica para sempre.`;
  if (!liberado(estado, 'combate')) {
    html($('arranjo-nivel'), 'Nv. 0');
    html($('arranjo-texto'), '<small>Libera junto com o Combate</small>');
    botao.classList.add('escondido');
    caixa.classList.add('trancado');
    return;
  }
  caixa.classList.remove('trancado');
  botao.classList.remove('escondido');
  const custo = CA.custoDoArranjo(estado);
  const bonus = P.bonusDoArranjo(estado);
  html($('arranjo-nivel'), `Nv. ${nivel} <i>→</i> <em>Nv. ${nivel + 1}</em>`);
  html($('arranjo-texto'), `+${porcento(bonus)} <i>→</i> <em>+${porcento(bonus + CONFIG.arranjo.bonusPorNivel)}</em>`);
  texto($('arranjo-custo'), formatarNumero(custo));
  botao.classList.toggle('indisponivel', !cabe(estado, 'pedras', custo));
}

// ---- Bênçãos: Batismo Mundial, Sentido Divino e Mestre Estelar ----
function atualizarBencaos(estado) {
  // v0.35.0: 3 quadrados (verde, azul, roxo) com o ícone do kit, o nome e o estado; a explicação inteira na dica.
  // O Mestre Estelar vira botão (#botao-fonte-estelar) quando já dá para refinar a Fonte Estelar.
  const B = CONFIG.batismo;
  const batismos = P.batismosMundiais(estado);
  const linhas = [];
  linhas.push(bencao('batismo', 'Batismo Mundial', batismos > 0,
    batismos > 0 ? `${batismos}× · +${porcento(batismos * B.bonusPorBatismo)}` : REINOS.find(r => r.id === B.primeiroReino).nome,
    batismos > 0
      ? `${batismos} rompimentos: +${porcento(batismos * B.bonusPorBatismo)} de Ataque, Vitalidade e Defesa`
      : `A partir da ${REINOS.find(r => r.id === B.primeiroReino).nome}: cada rompimento de reino dá +${porcento(B.bonusPorBatismo)} de Ataque, Vitalidade e Defesa`));
  const sentido = P.temSentidoDivino(estado);
  linhas.push(bencao('sentido', 'Sentido Divino', sentido,
    sentido ? `Meditar +${porcento(CONFIG.meditacaoComSentido)}` : 'Ascensão Imortal',
    sentido ? `Com o Sentido Divino, Meditar rende +${porcento(CONFIG.meditacaoComSentido)}`
      : `Libera com o Sentido Divino (Ascensão Imortal): Meditar +${porcento(CONFIG.meditacaoComSentido)}`));
  const M = CONFIG.mestreEstelar;
  if (estado.mestreEstelar) {
    linhas.push(bencao('estelar', 'Mestre Estelar', true, `Cultivo +${porcento(M.bonusCultivo)}`,
      `Você refinou a Fonte Estelar: Cultivo +${porcento(M.bonusCultivo)} para sempre`));
  } else if (CA.fonteEstelarLiberada(estado)) {
    const pode = CA.podeRefinarFonteEstelar(estado);
    linhas.push(bencao('estelar', 'Mestre Estelar', false, `Refinar: ${formatarNumero(CA.custoDaFonteEstelar(estado))}`,
      `Toque para refinar a Fonte Estelar de uma estrela (custa ${formatarNumero(CA.custoDaFonteEstelar(estado))} de Cultivo): ` +
      `Cultivo +${porcento(M.bonusCultivo)} para sempre.`, pode ? 'refinar' : 'refinar indisponivel'));
  } else {
    linhas.push(bencao('estelar', 'Mestre Estelar', false, REINOS[P.REINO_DO_MESTRE_ESTELAR].nome,
      `Libera no ${REINOS[P.REINO_DO_MESTRE_ESTELAR].nome}: refinar a Fonte Estelar dá Cultivo +${porcento(M.bonusCultivo)} para sempre`));
  }
  html($('bencaos'), linhas.join(''));
}

function bencao(tipo, titulo, ativa, estadoCurto, descricao, botao = '') {
  const miolo = `<span class="cn-bencao-icone"><img src="img/ui/cult_bencao_${tipo}.png" alt=""></span><b>${titulo}</b><small>${estadoCurto}</small>`;
  const classes = `cn-bencao cn-bencao-${tipo}${ativa ? ' ativa' : ''}`;
  return botao
    ? `<button id="botao-fonte-estelar" class="ui ${classes} ${botao}" title="${descricao}">${miolo}</button>`
    : `<div class="${classes}" title="${descricao}">${miolo}</div>`;
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
