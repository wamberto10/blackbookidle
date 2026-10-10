// =============================================================
// ui/telaBoss.js — BOTÃO "BOSS" E TELA DO EVENTO DE BOSS
// O botão fica no canto superior direito da tela inicial e abre a tela
// inteira do Mestre do Salão Ying Yue (regras em sistemas/boss.js):
//  - antes da luta: o boss grande no ambiente dele, a vida atual e o botão Lutar
//  - lutando (classe .lutando): a arena com o herói e o boss
// =============================================================
import { CONFIG } from '../config.js';
import * as BOSS from '../sistemas/boss.js';
import { REINOS } from '../dados/reinos.js';
import { MAPAS } from '../sistemas/mundo.js';
import { formatarNumero, formatarTempo } from '../format.js';
import { desenharPersonagem, desenharSpriteDeInimigo, mostrarQuadro, caminhoDoEfeito } from './sprite.js';
import { SPRITES } from '../dados/sprites.js';
import { EFEITO_PROVISORIO } from '../dados/classes.js';

const $ = (id) => document.getElementById(id);
const B = CONFIG.boss;
let aberta = false;
let acoesGuardadas = null;

const porcento = (fracao) => `${(fracao * 100).toFixed(fracao < 0.001 ? 3 : 2)}%`;

export function montarTelaBoss(acoes) {
  acoesGuardadas = acoes;
  $('botao-boss').addEventListener('click', abrirTelaBoss);
  $('tela-boss-fechar').addEventListener('click', fecharTelaBoss);
  $('boss-lutar').addEventListener('click', () => acoesGuardadas.aoLutarBoss());
  $('boss-auto').addEventListener('change', (e) => acoesGuardadas.aoMudarBossAuto(e.target.checked));
  $('boss-nome').textContent = B.nome;
  $('boss-recompensa').innerHTML =
    `🎁 Ao derrotá-lo, todos que causaram dano recebem <b>${B.nucleos} Núcleos</b> de rank aleatório ` +
    `e <b style="color:#ff6ad5">1 item Ancestral</b> (espaço aleatório, melhor que um Lendário do mapa seguinte ao seu). ` +
    `Ele volta ${B.renasceMinutos} minutos depois de derrotado.`;
  desenharSpriteDeInimigo($('boss-sprite'), B.aparencia);
  // Fundo próprio do evento (img/fundos/boss.jpg); se não existir, fica o fundo escuro do CSS
  const fundo = new Image();
  fundo.onload = () => { $('boss-arena').style.backgroundImage = 'url("img/fundos/boss.jpg")'; };
  fundo.src = 'img/fundos/boss.jpg';
}

export function abrirTelaBoss() {
  aberta = true;
  $('tela-boss').classList.remove('escondido');
}

// Sair no meio da luta interrompe a luta (o dano já causado fica)
function fecharTelaBoss() {
  if (BOSS.lutaDoBoss()) acoesGuardadas.aoSairDaLutaBoss?.();
  aberta = false;
  $('tela-boss').classList.add('escondido');
}

let personagemDesenhado = '';

export function atualizarTelaBoss(estado) {
  const agora = Date.now();
  const presente = BOSS.bossPresente(estado, agora);
  const luta = BOSS.lutaDoBoss();
  const liberado = BOSS.bossLiberado(estado);

  // ---- Botão da tela inicial ----
  const botao = $('botao-boss');
  botao.classList.toggle('escondido', !liberado);
  botao.classList.toggle('ativo', presente);
  $('botao-boss-texto').textContent = presente ? 'BOSS' : formatarRelogio(BOSS.segundosParaVoltar(estado, agora));
  if (!aberta) return;

  // ---- Tela: antes da luta (o boss sozinho) ou lutando (a arena) ----
  $('tela-boss').classList.toggle('lutando', !!luta);
  const boss = BOSS.atributosDoBoss(estado);
  const b = estado.boss;
  $('boss-edicao').textContent = `Aparição nº ${b.edicao} · força do chefe do Mapa ${boss.mapa + 1} (${MAPAS[boss.mapa].nome})`;
  $('boss-vida').style.width = `${b.vida * 100}%`;
  $('boss-vida-texto').textContent = presente ? `Vida: ${porcento(b.vida)}` : 'Derrotado!';
  $('boss-arena').classList.toggle('boss-ausente', !presente);
  if (!presente && !derrotaMostrada) poseDeDerrota();
  if (presente && derrotaMostrada) { derrotaMostrada = false; mostrarQuadro($('boss-sprite'), 0, 1); }

  const chave = `${estado.reino}|${estado.personagem?.sexo}|${estado.personagem?.classe}`;
  if (chave !== personagemDesenhado && estado.personagem) {
    personagemDesenhado = chave;
    desenharPersonagem($('boss-jogador'), REINOS[estado.reino].id, 'combate', estado.personagem);
  }

  if (luta) {
    $('boss-minha-vida').style.width = `${Math.max(0, luta.vidaJogador / luta.jogador.vitalidade) * 100}%`;
    $('boss-tempo').textContent = `⏳ ${Math.max(0, Math.ceil(B.duracaoLuta - luta.tempo))}s · seu dano: ${porcento(luta.danoNestaLuta)}`;
  } else {
    $('boss-tempo').textContent = presente ? '' : `O boss volta em ${formatarTempo(BOSS.segundosParaVoltar(estado, agora))}`;
  }

  // ---- Botão Lutar e "Atacar sozinho" ----
  if ($('boss-auto').checked !== !!estado.opcoes.bossAuto) $('boss-auto').checked = !!estado.opcoes.bossAuto;
  const lutar = $('boss-lutar');
  const descanso = BOSS.segundosDeDescanso(estado, agora);
  lutar.disabled = !BOSS.podeLutar(estado, agora);
  lutar.textContent = !presente ? '⏳ Aguardando o boss voltar'
    : descanso > 0 ? `😮‍💨 Descansando... ${Math.ceil(descanso)}s`
    : `⚔️ Lutar (${B.duracaoLuta} s)`;

  // ---- Rank de dano ----
  const rank = BOSS.rankDeDano(estado);
  const htmlRank = rank.length
    ? rank.map((r, i) => `<li><span>${i + 1}. ${r.nome}</span><b>${porcento(r.dano)}</b></li>`).join('')
    : '<li class="pequeno">Ninguém causou dano ainda nesta aparição.</li>';
  if ($('boss-rank').innerHTML !== htmlRank) $('boss-rank').innerHTML = htmlRank;
}

function formatarRelogio(segundos) {
  const s = Math.ceil(segundos);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

// ---- Animações da luta (só com a tela aberta) ----
// Folha do boss: 0–1 parado/respirando, 2 ataque, 3 técnica especial, 4 recebendo golpe, 5 derrotado
const POSE = { ataque: 2, especial: 3, dano: 4, derrota: 5 };
const EFEITOS_IA = new Set(SPRITES.efeitosIA ?? []);
const EFEITOS_EXISTENTES = new Set(SPRITES.efeitos ?? []);
const INTERVALO = 330;     // ms entre uma animação e a próxima (cabem 3 golpes num turno de 1 s)
let proximaAnimacao = 0;

// Fila: os golpes de um turno chegam todos juntos; aqui eles aparecem um depois do outro
function agendar(funcao, intervalo = INTERVALO) {
  const agora = Date.now();
  if (proximaAnimacao < agora || proximaAnimacao > agora + 1500) proximaAnimacao = agora;   // não acumula atraso
  setTimeout(funcao, proximaAnimacao - agora);
  proximaAnimacao += intervalo;
}

export function mostrarGolpeBoss(evento) {
  if (!aberta || document.hidden) return;
  const classe = BOSS.lutaDoBoss()?.classe;

  if (evento.tipo === 'golpe' && evento.alvo === 'inimigo') {
    // O herói ataca: avança, golpe da classe (corte, soco, gelo) no boss
    agendar(() => {
      mostrarQuadro($('boss-jogador'), 2, 280);
      animar($('boss-corpo-jogador'), 'boss-avanca-direita');
      setTimeout(() => {
        const forte = evento.critico || evento.elemental || evento.tecnica;
        tocarEfeito('boss', evento.tecnica ? evento.tecnica.efeito : forte ? classe?.efeitoCritico ?? 'corte_critico' : classe?.efeito ?? 'corte');
        if (evento.tecnica) {
          aviso(`✦ ${evento.tecnica.nome} ✦`, 'tecnica');
          const e = evento.efeitos ?? {};
          if (e.cura) numero('boss-numeros-jogador', '+' + formatarNumero(e.cura), 'cura');
          if (e.congelou) numero('boss-numeros-boss', '❄️ Congelado!', 'esquiva');
          if (e.enfraqueceu) numero('boss-numeros-boss', '👁️ Alma enfraquecida!', 'esquiva');
          if (e.pilula) numero('boss-numeros-jogador', '💊 Pílula recarregada!', 'cura');
        }
        if (forte) {
          mostrarQuadro($('boss-sprite'), POSE.dano, 380);          // crítico: o boss recua
          animar($('boss-arena'), 'boss-tremendo');
        } else {
          animar($('boss-sprite'), 'boss-atingido');
        }
        const prefixo = evento.tecnica ? '' : evento.elemental ? 'EXPLOSÃO!\n' : evento.critico ? 'CRÍTICO!\n' : '';
        numero('boss-numeros-boss', prefixo + formatarNumero(evento.dano), forte ? 'critico' : '');
      }, 120);
    }, evento.duplo && !evento.segundo ? 200 : INTERVALO);
  } else if (evento.tipo === 'carregando') {
    // Turno em que o boss concentra a técnica: pose especial + aura lunar
    agendar(() => {
      mostrarQuadro($('boss-sprite'), POSE.especial, 1100);
      animar($('boss-aura'), 'ativa');
      aviso('🌙 O Mestre concentra a luz da lua...', 'carregando');
    });
  } else if (evento.tipo === 'golpe' && evento.alvo === 'jogador' && evento.congelado) {
    agendar(() => numero('boss-numeros-boss', '❄️ CONGELADO!', 'esquiva'));
  } else if (evento.tipo === 'golpe' && evento.alvo === 'jogador' && evento.especial) {
    // Lâmina da Lua Crescente: tela escurece, nome da técnica, a lua explode no herói
    agendar(() => {
      mostrarQuadro($('boss-sprite'), POSE.especial, 700);
      animar($('boss-aura'), 'ativa');
      aviso(B.especial.nome.toUpperCase() + '!', 'tecnica');
      animar($('boss-arena'), 'boss-escurece');
      setTimeout(() => {
        tocarEfeito('jogador', 'lua_crescente', true);
        animar($('boss-arena'), 'boss-tremendo-forte');
        animar($('boss-clarao'), 'ativo');
        if (evento.esquiva) {
          animar($('boss-corpo-jogador'), 'boss-esquiva');
          numero('boss-numeros-jogador', 'Esquivou!', 'esquiva');
        } else {
          animar($('boss-jogador'), 'boss-atingido');
          numero('boss-numeros-jogador', '-' + formatarNumero(evento.dano), 'contra forte');
        }
      }, 300);
    }, 700);
  } else if (evento.tipo === 'golpe' && evento.alvo === 'jogador') {
    // Golpe normal do boss: pose de ataque + corte lunar no herói
    agendar(() => {
      mostrarQuadro($('boss-sprite'), POSE.ataque, 330);
      animar($('boss-corpo-boss'), 'boss-avanca-esquerda');
      setTimeout(() => {
        if (evento.esquiva) {
          animar($('boss-corpo-jogador'), 'boss-esquiva');
          numero('boss-numeros-jogador', 'Esquivou!', 'esquiva');
          return;
        }
        tocarEfeito('jogador', 'corte_lunar');
        animar($('boss-jogador'), 'boss-atingido');
        numero('boss-numeros-jogador', '-' + formatarNumero(evento.dano), 'contra');
      }, 130);
    });
  } else if (evento.tipo === 'cura') {
    numero('boss-numeros-jogador', (evento.pilula ? 'PÍLULA DE CURA!\n' : '') + '+' + formatarNumero(evento.valor), 'cura');
  }
}

// O boss caiu: clarão, tremor, aviso e a pose de derrota (ajoelhado) até ele voltar
export function animarDerrotaDoBoss() {
  if (!aberta || document.hidden) return;
  agendar(() => {
    animar($('boss-clarao'), 'ativo');
    animar($('boss-arena'), 'boss-tremendo-forte');
    aviso('🏆 O MESTRE DO SALÃO YING YUE CAIU!', 'vitoria');
    poseDeDerrota();
  });
}

let derrotaMostrada = false;
function poseDeDerrota() {
  derrotaMostrada = true;
  mostrarQuadro($('boss-sprite'), POSE.derrota, 24 * 60 * 60 * 1000);
}

function tocarEfeito(lado, nome, grande = false) {
  if (!EFEITOS_EXISTENTES.has(nome)) nome = EFEITO_PROVISORIO[nome] ?? nome;   // classe nova sem imagem ainda
  const efeito = $(`boss-efeito-${lado}`);
  efeito.style.backgroundImage = `url("${caminhoDoEfeito(nome)}")`;
  efeito.classList.toggle('quadros-4', EFEITOS_IA.has(nome));
  efeito.classList.toggle('grande', grande);
  animar(efeito, 'tocando');
}

function aviso(texto, classe) {
  const caixa = $('boss-aviso');
  caixa.textContent = texto;
  caixa.className = `boss-aviso ${classe}`;
  animar(caixa, 'visivel');
}

function animar(elemento, classe) {
  elemento.classList.remove(classe);
  void elemento.offsetWidth;
  elemento.classList.add(classe);
}

function numero(id, texto, classe) {
  const caixa = $(id);
  const n = document.createElement('div');
  n.className = `boss-numero ${classe}`;
  n.textContent = texto;
  n.style.left = `${Math.round(Math.random() * 30 - 15)}px`;
  n.style.top = `${Math.round(Math.random() * -24)}px`;   // números do mesmo turno não ficam um em cima do outro
  caixa.appendChild(n);
  setTimeout(() => n.remove(), 1000);
}
