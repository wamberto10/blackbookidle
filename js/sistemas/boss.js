// =============================================================
// sistemas/boss.js — EVENTO DE BOSS: MESTRE DO SALÃO YING YUE
//
// Um boss de vida enorme que vai sendo desgastado em várias lutas:
//  - Cada luta dura até 60 s (ou até você cair). O dano que você causa
//    sai da vida do boss, contado como % da vida total.
//  - Entre uma luta e outra, 60 s de descanso.
//  - Quando a vida chega a 0, todos que causaram dano recebem a mesma
//    recompensa (10 Núcleos aleatórios + 1 item Ancestral), e o boss
//    volta 10 minutos depois.
//  - A força dele acompanha VOCÊ: tem os atributos do último chefe de mapa
//    que você já venceu. Assim o dano em % é justo para qualquer jogador.
//
// Por enquanto o boss é LOCAL (cada jogador tem o seu, salvo em estado.boss).
// Tudo que seria "global" (vida, edição, rank, hora de voltar) fica junto em
// estado.boss para poder ir para um servidor no futuro.
// =============================================================
import { CONFIG } from '../config.js';
import { FASES, chefeDoMapa } from './mundo.js';
import { calcularAtributos, dano as calcularDano, golpesPorTurno } from './atributos.js';
import { classeDe } from './personagem.js';
import { gerarItem, receberItem } from './equipamentos.js';
import { TIPOS_DE_NUCLEO } from './nucleos.js';
import { RARIDADE_POR_ID } from './itens.js';
import { liberado } from './desbloqueios.js';
import { tomarPilula } from './combate.js';
import { tecnicaDoGolpe, penetracaoDoGolpe, efeitosDaTecnica, inimigoCongelado, forcaDoInimigo } from './tecnicas.js';

const B = CONFIG.boss;
const TURNO = CONFIG.combate.duracaoDoTurno;
const PASSO = CONFIG.combate.passoDeSimulacao;

// Luta em andamento (não é salva: o dano já causado vai sendo descontado na hora)
let luta = null;

export function bossLiberado(estado) {
  return liberado(estado, 'combate');
}

// O boss está na tela (não foi derrotado ou já reapareceu)?
export function bossPresente(estado, agora = Date.now()) {
  return agora >= (estado.boss.voltaEm ?? 0);
}

// Quando o tempo de voltar passa, nasce uma nova edição com a vida cheia
export function atualizarBoss(estado, agora = Date.now()) {
  const b = estado.boss;
  if (b.voltaEm && agora >= b.voltaEm) {
    b.voltaEm = 0;
    b.vida = 1;
    b.rank = [];
    b.edicao += 1;
  }
}

export function segundosParaVoltar(estado, agora = Date.now()) {
  return Math.max(0, (estado.boss.voltaEm - agora) / 1000);
}

export function segundosDeDescanso(estado, agora = Date.now()) {
  return Math.max(0, ((estado.boss.descansoAte ?? 0) - agora) / 1000);
}

export function podeLutar(estado, agora = Date.now()) {
  return bossLiberado(estado) && bossPresente(estado, agora) && !luta && segundosDeDescanso(estado, agora) <= 0;
}

// Atributos do boss: os do ÚLTIMO CHEFE DE MAPA que você já venceu
// (ninguém venceu ainda o chefe do Mapa 1 → usa o do Mapa 1)
export function atributosDoBoss(estado) {
  const chefesVencidos = Math.floor((estado.combate.fasesConcluidas + 1) / CONFIG.combate.fasesPorMapa);
  const mapa = Math.min(Math.max(0, chefesVencidos - 1), FASES[FASES.length - 1].mapa);
  const chefe = chefeDoMapa(mapa);
  return {
    nome: B.nome,
    forma: 'humano',
    mapa,
    faseDoChefe: chefe.indice,
    vidaTotal: chefe.inimigo.vida * B.vidaEmChefes,
    ataque: chefe.inimigo.ataque * B.ataque,
    defesa: chefe.inimigo.defesa * B.defesa,
    velocidade: chefe.inimigo.velocidade * B.velocidade,
  };
}

// Seu dano nesta edição (fração da vida total)
export function meuDano(estado) {
  return estado.boss.rank.find(r => r.nome === nomeDoJogador(estado))?.dano ?? 0;
}

function nomeDoJogador(estado) {
  return estado.personagem?.nome ?? 'Você';
}

// Rank de dano da edição atual, do maior para o menor
export function rankDeDano(estado) {
  return [...estado.boss.rank].sort((a, b) => b.dano - a.dano);
}

function somarDano(estado, fracao) {
  const nome = nomeDoJogador(estado);
  let linha = estado.boss.rank.find(r => r.nome === nome);
  if (!linha) estado.boss.rank.push(linha = { nome, dano: 0 });
  linha.dano += fracao;
}

// ---- Luta ----
export function lutaDoBoss() {
  return luta;
}

export function comecarLuta(estado) {
  if (!podeLutar(estado)) return false;
  const jogador = calcularAtributos(estado);
  const boss = atributosDoBoss(estado);
  luta = {
    jogador,
    boss,
    classe: classeDe(estado),
    golpesDoJogador: 0,
    vidaJogador: jogador.vitalidade,
    jogadorPrimeiro: jogador.velocidade >= boss.velocidade,
    relogio: 0,
    tempo: 0,
    turno: 0,
    turnosDoBoss: 0,    // para a técnica especial (a cada B.especial.aCada turnos)
    danoNestaLuta: 0,   // fração da vida total
  };
  return true;
}

// Para a luta no meio (ex.: fechou o jogo): o dano já causado fica
export function abandonarLuta(estado, aoEvento) {
  if (luta) terminar(estado, aoEvento, 'abandonou');
}

// Avança a luta em "segundos" (o jogo chama 10× por segundo)
export function atualizarLutaDoBoss(estado, segundos, aoEvento) {
  if (!luta) return;
  let restante = segundos;
  while (restante > 0 && luta) {
    const dt = Math.min(restante, PASSO);
    restante -= dt;
    passo(estado, dt, aoEvento);
  }
}

function passo(estado, dt, aoEvento) {
  luta.tempo += dt;
  luta.relogio += dt;
  while (luta && luta.relogio >= TURNO - 1e-9) {
    luta.relogio -= TURNO;
    luta.turno += 1;
    const ordem = luta.jogadorPrimeiro ? ['jogador', 'boss'] : ['boss', 'jogador'];
    for (const atacante of ordem) {
      const golpes = atacante === 'jogador' ? golpesPorTurno(luta.jogador, luta.boss) : 1;
      for (let g = 0; g < golpes; g++) {
        if (atacante === 'jogador') golpeDoJogador(estado, aoEvento, golpes > 1 ? { duplo: true, segundo: g === 1 } : {});
        else golpeDoBoss(aoEvento);
        if (estado.boss.vida <= 0) { derrotarBoss(estado, aoEvento); return; }
        if (luta.vidaJogador <= 0) { terminar(estado, aoEvento, 'derrotado'); return; }
      }
    }
    regenerar(aoEvento);
  }
  if (luta && luta.tempo >= B.duracaoLuta - 1e-9) terminar(estado, aoEvento, 'tempo');
}

// Mesmas regras do combate normal (crítico, Intenção da Arma, Explosão Elemental)
function golpeDoJogador(estado, aoEvento, extra) {
  const { jogador, boss } = luta;
  const especial = luta.classe.especial;
  luta.golpesDoJogador += 1;
  const tecnica = tecnicaDoGolpe(luta);
  const defesa = boss.defesa * (1 - penetracaoDoGolpe(luta, tecnica));
  const critico = Math.random() * 100 < jogador.critico;
  let dano = calcularDano(jogador.ataque, defesa);
  if (critico) dano *= jogador.danoCritico / 100;
  if (tecnica) dano *= tecnica.multiplicador;
  const elemental = !!especial.explosaoACada && luta.golpesDoJogador % especial.explosaoACada === 0;
  if (elemental) dano *= 1 + especial.bonusExplosao;

  const fracao = Math.min(estado.boss.vida, dano / boss.vidaTotal);
  estado.boss.vida -= fracao;
  if (estado.boss.vida < 1e-12) estado.boss.vida = 0;
  luta.danoNestaLuta += fracao;
  somarDano(estado, fracao);
  const efeitos = tecnica ? efeitosDaTecnica(luta, tecnica) : null;
  if (aoEvento) aoEvento({ tipo: 'golpe', alvo: 'inimigo', dano, critico, elemental, tecnica, efeitos, numero: luta.golpesDoJogador, ...extra });
}

// Ciclo de B.especial.aCada turnos: golpes normais, 1 turno concentrando e a técnica especial
function golpeDoBoss(aoEvento) {
  luta.turnosDoBoss += 1;
  const posicao = luta.turnosDoBoss % B.especial.aCada;
  if (posicao === B.especial.aCada - 1) {          // concentra a luz da lua (não ataca)
    if (aoEvento) aoEvento({ tipo: 'carregando' });
    return;
  }
  const especial = posicao === 0;                   // solta a Lâmina da Lua Crescente
  if (inimigoCongelado(luta)) {                     // Tempestade de Gelo Místico
    if (aoEvento) aoEvento({ tipo: 'golpe', alvo: 'jogador', congelado: true });
    return;
  }
  if (Math.random() * 100 < luta.jogador.esquiva) {
    if (aoEvento) aoEvento({ tipo: 'golpe', alvo: 'jogador', esquiva: true, especial });
    return;
  }
  const dano = calcularDano(luta.boss.ataque * forcaDoInimigo(luta), luta.jogador.defesa) * (especial ? B.especial.multiplicador : 1);
  luta.vidaJogador -= dano;
  if (aoEvento) aoEvento({ tipo: 'golpe', alvo: 'jogador', dano, especial });
  tomarPilula(luta, aoEvento);   // Alquimista
}

function regenerar(aoEvento) {
  const porcentagem = luta.classe.especial.regeneracao;
  if (!porcentagem || luta.vidaJogador >= luta.jogador.vitalidade) return;
  const cura = Math.min(luta.jogador.vitalidade * porcentagem, luta.jogador.vitalidade - luta.vidaJogador);
  luta.vidaJogador += cura;
  if (aoEvento) aoEvento({ tipo: 'cura', alvo: 'jogador', valor: cura });
}

function terminar(estado, aoEvento, motivo) {
  const dano = luta.danoNestaLuta;
  luta = null;
  // Luta interrompida (saiu do jogo / trocou de aba) não cobra descanso
  if (motivo !== 'abandonou') estado.boss.descansoAte = Date.now() + B.descanso * 1000;
  if (aoEvento) aoEvento({ tipo: 'fim', motivo, dano });
}

// ---- Boss derrotado: recompensa para todos que causaram dano ----
function derrotarBoss(estado, aoEvento) {
  const dano = luta.danoNestaLuta;
  luta = null;
  const b = estado.boss;
  b.vida = 0;
  b.derrotas = (b.derrotas ?? 0) + 1;
  b.voltaEm = Date.now() + B.renasceMinutos * 60 * 1000;
  b.descansoAte = 0;
  const recompensa = darRecompensa(estado);
  if (aoEvento) aoEvento({ tipo: 'boss-derrotado', dano, recompensa, rank: rankDeDano(estado) });
}

// Sorteia 10 Núcleos (chances proporcionais às do drop normal) e 1 item Ancestral
// Fase base do item Ancestral: o chefe do mapa SEGUINTE ao mapa em que você está.
// v0.14.2 (dono): antes era o mapa do último chefe vencido; agora o item é melhor que um
// Lendário de 1 mapa à frente (sem passar do último mapa do jogo).
export function faseDoItemAncestral(estado) {
  const faseAtual = Math.min(estado.combate.fasesConcluidas + 1, FASES.length - 1);
  const mapa = Math.min(FASES[faseAtual].mapa + 1, FASES[FASES.length - 1].mapa);
  return chefeDoMapa(mapa).indice;
}

export function darRecompensa(estado) {
  const nucleos = { baixo: 0, medio: 0, alto: 0 };
  const totalChance = TIPOS_DE_NUCLEO.reduce((s, t) => s + t.chance, 0);
  for (let i = 0; i < B.nucleos; i++) {
    let sorte = Math.random() * totalChance;
    const tipo = TIPOS_DE_NUCLEO.find(t => (sorte -= t.chance) < 0) ?? TIPOS_DE_NUCLEO[0];
    nucleos[tipo.id] += 1;
    estado.nucleos[tipo.id] = (estado.nucleos[tipo.id] ?? 0) + 1;
  }
  // Item Ancestral do mapa seguinte ao seu (base = chefe daquele mapa), espaço aleatório, ★1
  const item = gerarItem(estado, FASES[faseDoItemAncestral(estado)], null, RARIDADE_POR_ID.ancestral, 1);
  const destino = receberItem(estado, item);
  return { nucleos, item: destino };
}
