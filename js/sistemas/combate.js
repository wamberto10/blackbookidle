// =============================================================
// sistemas/combate.js — COMBATE AUTOMÁTICO POR TURNOS
//
// Como funciona uma luta:
//  - A cada turno (1 segundo), jogador e inimigo atacam UMA vez cada.
//  - Quem tem mais Velocidade ataca primeiro no turno (empate: o jogador).
//    Se o primeiro derrubar o outro, o segundo nem chega a atacar.
//  - Dano = Ataque × Ataque / (Ataque + Defesa do alvo)
//    (se Ataque = Defesa, o dano cai pela metade)
//  - O jogador pode dar crítico (Taxa de Crítico / Dano Crítico)
//    e esquivar de golpes inimigos (Esquiva).
//  - Vitória: recompensas e (se ligado) avança para a próxima fase.
//  - Derrota ou tempo esgotado: volta uma fase e desliga o avanço automático.
// =============================================================
import { CONFIG } from '../config.js';
import { FASES, MUNDOS_JOGAVEIS, faseLiberada, mundoJaZerado } from './mundo.js';
import { calcularAtributos, dano, golpesPorTurno } from './atributos.js';
import { ganharCultivo, producaoPorSegundo } from './progressao.js';
import { liberado } from './desbloqueios.js';
import { tentarDrop } from './equipamentos.js';
import { tentarNucleo } from './nucleos.js';
import { classeDe } from './personagem.js';

const CB = CONFIG.combate;

// Luta em andamento. Não é salva: ao recarregar, a luta recomeça.
let luta = null;

// Cultivo de uma vitória = X segundos da produção ATUAL do jogador (X = tipo da fase: comum 1,5 s ... chefe 15 s).
// v0.9.5: antes usava a produção do nível da FASE — depois de reencarnar, uma vitória num mapa
// avançado valia horas ou dias de cultivo e o combate subia os estágios sozinho.
export function cultivoDaVitoria(estado, fase) {
  return producaoPorSegundo(estado) * fase.tipo.cultivo;
}

export function combateLiberado(estado) {
  return liberado(estado, 'combate');
}

export function lutaAtual() {
  return luta;
}

export function reiniciarLuta() {
  luta = null;
}

// Atributos mudaram no meio da luta (melhoria do Black Book, item vestido...):
// a luta atual passa a usar os novos na hora, mantendo a mesma % de vida.
export function atualizarAtributosDaLuta(estado) {
  if (!luta) return;
  const novo = calcularAtributos(estado);
  const fracaoDeVida = Math.max(0, luta.vidaJogador) / luta.jogador.vitalidade;
  luta.jogador = novo;
  luta.vidaJogador = novo.vitalidade * fracaoDeVida;
  luta.jogadorPrimeiro = novo.velocidade >= luta.inimigo.velocidade;
}

export function irParaFase(estado, indice) {
  if (!faseLiberada(estado, indice)) return false;
  estado.combate.faseAtual = indice;
  luta = null;
  return true;
}

function novaLuta(estado) {
  const fase = FASES[estado.combate.faseAtual];
  const jogador = calcularAtributos(estado); // atributos "congelados" durante a luta
  luta = {
    fase,
    jogador,
    classe: classeDe(estado),   // habilidade especial da classe
    golpesDoJogador: 0,         // contador para a Explosão Elemental
    inimigo: fase.inimigo,
    vidaJogador: jogador.vitalidade,
    vidaInimigo: fase.inimigo.vida,
    jogadorPrimeiro: jogador.velocidade >= fase.inimigo.velocidade,
    relogio: 0,     // tempo até o próximo turno
    tempo: 0,       // tempo total da luta
    turno: 0,
    pausa: CB.pausaEntreLutas,
  };
}

// Mesma conta de atributos.dano (com o dano mínimo garantido)
const calcularDano = dano;

// Avança o combate em "segundos". Divide em passos pequenos para ficar preciso
// mesmo quando o navegador atrasa ou durante a simulação offline.
export function atualizarCombate(estado, segundos, aoEvento) {
  if (!combateLiberado(estado)) return;
  let restante = segundos;
  while (restante > 0) {
    const dt = Math.min(restante, CB.passoDeSimulacao);
    restante -= dt;
    passo(estado, dt, aoEvento);
  }
}

function passo(estado, dt, aoEvento) {
  if (!luta || luta.fase.indice !== estado.combate.faseAtual) novaLuta(estado);

  // Pequena pausa antes de cada luta
  if (luta.pausa > 0) {
    luta.pausa -= dt;
    return;
  }

  // Supressão de Alma: Sentido Divino 5× o do inimigo → ele foge antes de lutar (chefes nunca fogem)
  if (luta.tempo === 0 && suprime(luta, estado)) { vencer(estado, aoEvento, true); return; }

  luta.tempo += dt;
  luta.relogio += dt;

  // Um turno a cada "duracaoDoTurno" segundos.
  // (folga de 1e-9: somar 0,1 dez vezes dá 0,9999999… e o turno atrasava um passo)
  while (luta.relogio >= CB.duracaoDoTurno - 1e-9) {
    luta.relogio -= CB.duracaoDoTurno;
    luta.turno += 1;

    const ordem = luta.jogadorPrimeiro ? ['jogador', 'inimigo'] : ['inimigo', 'jogador'];
    for (const atacante of ordem) {
      // v0.9.12 (dono): com o dobro (ou mais) da Velocidade do inimigo, o jogador ataca 2 vezes no turno
      const golpes = atacante === 'jogador' ? golpesPorTurno(luta.jogador, luta.inimigo) : 1;
      for (let g = 0; g < golpes; g++) {
        if (atacante === 'jogador') golpeDoJogador(aoEvento, golpes > 1 ? { duplo: true, segundo: g === 1 } : {});
        else golpeDoInimigo(aoEvento);

        if (luta.vidaInimigo <= 0) { vencer(estado, aoEvento); return; }
        if (luta.vidaJogador <= 0) { perder(estado, aoEvento, 'derrotado'); return; }
      }
    }

    // Refinador Corporal: Regeneração no fim do turno
    regenerar(aoEvento);
  }

  if (luta.tempo >= CB.duracaoMaxima - 1e-9) perder(estado, aoEvento, 'tempo');
}

const SD = CONFIG.sentidoDivino;
export function suprime(lutaOuDados, estado) {
  const { jogador, inimigo, fase } = lutaOuDados;
  if (SD.imunes.includes(fase.chaveTipo)) return false;
  // v0.12.0 (dono): num mundo que você JÁ ZEROU (em qualquer vida), todos os inimigos comuns fogem —
  // sua alma já dominou aquele mundo. Nos outros mundos vale a regra de 5× o Sentido Divino.
  if (estado && mundoJaZerado(estado, fase.mundo)) return true;
  const exigencia = jogador.especial?.supressao ?? SD.supressao;   // Cultivador de Alma: 3×
  return inimigo.sentidoDivino > 0 && jogador.sentidoDivino >= exigencia * inimigo.sentidoDivino;
}

function golpeDoJogador(aoEvento, extra = {}) {   // extra: { duplo, segundo } no ataque duplo
  const jogador = luta.jogador;
  const especial = luta.classe.especial;
  luta.golpesDoJogador += 1;

  // Mestre da Espada: Intenção da Arma ignora parte da Defesa
  const defesa = luta.inimigo.defesa * (1 - (especial.penetracao ?? 0));
  const critico = Math.random() * 100 < jogador.critico;
  let dano = calcularDano(jogador.ataque, defesa);
  if (critico) dano *= jogador.danoCritico / 100;

  // Cultivador Elemental: a cada N golpes, uma Explosão Elemental
  const elemental = !!especial.explosaoACada && luta.golpesDoJogador % especial.explosaoACada === 0;
  if (elemental) dano *= 1 + especial.bonusExplosao;

  luta.vidaInimigo -= dano;
  // "vida" e "vidaMaxima" deixam a tela atualizar a barra no momento da animação do golpe
  // "numero" = quantos golpes o jogador já deu (a tela usa para alternar os elementos)
  if (aoEvento) aoEvento({ tipo: 'golpe', alvo: 'inimigo', dano, critico, elemental, numero: luta.golpesDoJogador, vida: luta.vidaInimigo, vidaMaxima: luta.inimigo.vida, ...extra });
}

function regenerar(aoEvento) {
  const porcentagem = luta.classe.especial.regeneracao;
  if (!porcentagem || luta.vidaJogador >= luta.jogador.vitalidade) return;
  const cura = Math.min(luta.jogador.vitalidade * porcentagem, luta.jogador.vitalidade - luta.vidaJogador);
  luta.vidaJogador += cura;
  if (aoEvento) aoEvento({ tipo: 'cura', alvo: 'jogador', valor: cura, vida: luta.vidaJogador, vidaMaxima: luta.jogador.vitalidade });
}

function golpeDoInimigo(aoEvento) {
  const vidaMaxima = luta.jogador.vitalidade;
  if (Math.random() * 100 < luta.jogador.esquiva) {
    if (aoEvento) aoEvento({ tipo: 'golpe', alvo: 'jogador', esquiva: true, vida: luta.vidaJogador, vidaMaxima });
    return;
  }
  const dano = calcularDano(luta.inimigo.ataque, luta.jogador.defesa);
  luta.vidaJogador -= dano;
  if (aoEvento) aoEvento({ tipo: 'golpe', alvo: 'jogador', dano, vida: luta.vidaJogador, vidaMaxima });
  tomarPilula(luta, aoEvento);
}

// Alquimista: uma vez por luta, com pouca vida (e ainda de pé), toma uma Pílula de Cura
export function tomarPilula(lutaAtual, aoEvento) {
  const pilula = lutaAtual.classe.especial.pilula;
  const vidaMaxima = lutaAtual.jogador.vitalidade;
  if (!pilula || lutaAtual.pilulaUsada || lutaAtual.vidaJogador <= 0 || lutaAtual.vidaJogador > vidaMaxima * pilula.limiar) return;
  lutaAtual.pilulaUsada = true;
  const cura = Math.min(vidaMaxima * pilula.cura, vidaMaxima - lutaAtual.vidaJogador);
  lutaAtual.vidaJogador += cura;
  if (aoEvento) aoEvento({ tipo: 'cura', alvo: 'jogador', valor: cura, pilula: true, vida: lutaAtual.vidaJogador, vidaMaxima });
}

function vencer(estado, aoEvento, suprimido = false) {
  const fase = luta.fase;
  const primeira = fase.indice > estado.combate.fasesConcluidas;
  const multiplicador = primeira ? CB.bonusPrimeiraVitoria : 1;
  const cultivo = cultivoDaVitoria(estado, fase) * multiplicador;
  const pedras = fase.recompensa.pedras * multiplicador;

  ganharCultivo(estado, cultivo);
  estado.pedras += pedras;
  estado.combate.vitorias += 1;
  if (primeira) estado.combate.fasesConcluidas = fase.indice;

  // Chance de cair um equipamento
  const drop = tentarDrop(estado, fase, primeira);
  // Chance de cair um Núcleo (Mapa 3 em diante)
  const nucleo = tentarNucleo(estado, fase);

  // Venceu o chefe final de um mundo pela primeira vez → o mundo (com o texto final) | null
  const ultimaDoMundo = primeira && fase.ultimaDoMundo ? MUNDOS_JOGAVEIS[fase.mundo] : null;
  if (aoEvento) aoEvento({ tipo: 'vitoria', fase, cultivo, pedras, primeira, ultimaDoMundo, drop, nucleo, suprimido });

  if (estado.combate.autoAvancar && fase.indice + 1 < FASES.length) {
    estado.combate.faseAtual = fase.indice + 1;
  }
  luta = null;
}

function perder(estado, aoEvento, motivo) {
  const fase = luta.fase;
  estado.combate.derrotas += 1;
  estado.combate.autoAvancar = false;
  if (estado.combate.faseAtual > 0) estado.combate.faseAtual -= 1;
  if (aoEvento) aoEvento({ tipo: 'derrota', fase, motivo });
  luta = null;
}

// Simula as lutas enquanto o jogador estava fora e resume o resultado
export function simularCombateOffline(estado, segundos) {
  const resumo = { vitorias: 0, derrotas: 0, cultivo: 0, pedras: 0, fasesNovas: 0, itens: 0, nucleos: 0, mundoConcluido: null };
  if (!combateLiberado(estado)) return resumo;

  atualizarCombate(estado, segundos, (evento) => {
    if (evento.tipo === 'vitoria') {
      resumo.vitorias += 1;
      resumo.cultivo += evento.cultivo;
      resumo.pedras += evento.pedras;
      if (evento.drop) resumo.itens += 1;
      if (evento.nucleo) resumo.nucleos += 1;
      if (evento.primeira) resumo.fasesNovas += 1;
      if (evento.ultimaDoMundo) resumo.mundoConcluido = evento.ultimaDoMundo;
    } else if (evento.tipo === 'derrota') {
      resumo.derrotas += 1;
    }
  });

  luta = null;
  return resumo;
}
