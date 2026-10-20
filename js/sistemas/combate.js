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
//    v0.32.0: também rende Essência da Alma (1ª conquista + farm pelo tempo da luta, blackbook.js).
//  - Derrota ou tempo esgotado: volta uma fase e desliga o avanço automático.
// =============================================================
import { CONFIG } from '../config.js';
import { obterFase, dadosDoMundo, faseLiberada, mundoJaZerado } from './mundo.js';
import { receberEssenciaDaVitoria } from './blackbook.js';
import { calcularAtributos, dano, golpesPorTurno, poderTotal, normalizarLuta, normalizarJogador, normalizarInimigo } from './atributos.js';
import { somar, subtrair, multiplicar, dividir, razao, maximo, minimo, maior, maiorOuIgual, menorOuIgual } from '../numeros.js';
import { ganharCultivo, producaoPorSegundo, producaoNoNivel, indiceNivel } from './progressao.js';
import { creditar } from '../saldos.js';
import { liberado } from './desbloqueios.js';
import { tentarDrop } from './equipamentos.js';
import { tentarNucleo } from './nucleos.js';
import { tentarPilula } from './cultivoAvancado.js';
import { classeDe } from './personagem.js';
import { tecnicaDoGolpe, penetracaoDoGolpe, efeitosDaTecnica, inimigoCongelado } from './tecnicas.js';

const CB = CONFIG.combate;

// Luta em andamento. v0.33.0: vai no save (lutaParaSalvar → estado.combate.luta) e continua ao recarregar.
// v0.33.0: a luta usa Number no caso comum e Grande nas razões extremas, sem alterar proporções.
// luta.jogador / luta.inimigo / vidas / dano = valores normalizados; valor real = valor × luta.escala (telas).
// Velocidade usa luta.escalaVel e Sentido Divino luta.escalaSentido (só se comparam entre si).
let luta = null;

// Campos da luta que vão no save (o resto — fase, classe, inimigo — é refeito a partir do estado)
const CAMPOS_DA_LUTA = ['vidaJogador', 'vidaInimigo', 'jogadorPrimeiro', 'relogio', 'tempo', 'turno', 'pausa', 'segundos',
  'golpesDoJogador', 'ataquesParaTecnica', 'inimigoCongelado'];
const ATRIBUTOS_DA_LUTA = ['ataque', 'vitalidade', 'defesa', 'velocidade', 'critico', 'danoCritico', 'esquiva', 'sentidoDivino'];

export function lutaParaSalvar() {
  if (!luta) return null;
  const dados = { fase: luta.fase.indice, jogador: {}, escala: luta.escala, escalaVel: luta.escalaVel, escalaSentido: luta.escalaSentido };
  for (const k of CAMPOS_DA_LUTA) if (luta[k] !== undefined) dados[k] = luta[k];
  for (const k of ATRIBUTOS_DA_LUTA) dados.jogador[k] = luta.jogador[k];
  return dados;
}

// Cultivo de uma vitória = X segundos da produção ATUAL do jogador (X = tipo da fase: comum 1,5 s ... chefe 15 s).
// v0.9.5: antes usava a produção do nível da FASE — depois de reencarnar, uma vitória num mapa
// avançado valia horas ou dias de cultivo e o combate subia os estágios sozinho.
export function cultivoDaVitoria(estado, fase) {
  return multiplicar(producaoPorSegundo(estado), fase.tipo.cultivo * CB.multiplicadorCultivo * fatorDoInimigo(estado, fase));
}

// v0.21.1: inimigo bem mais fraco que você dá menos Cultivo (antes farmar o Mapa 1 rendia tanto quanto
// o mapa atual — e mais rápido, porque os inimigos fogem na hora). Fases no seu nível ou acima: 100%.
// Abaixo: a raiz da diferença de produção entre o nível da fase e o seu (1 reino abaixo ≈ 25%, 2 ≈ 5%).
export function fatorDoInimigo(estado, fase) {
  const daFase = producaoNoNivel(fase.nivel, fase.reino);
  const doJogador = producaoNoNivel(indiceNivel(estado), estado.reino);
  return Math.min(1, Math.pow(razao(daFase, doJogador), CB.expoenteInimigoFraco));
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
  const novo = normalizarJogador(calcularAtributos(estado), luta);   // mesmas escalas da luta
  const fracaoDeVida = dividir(maximo(0, luta.vidaJogador), luta.jogador.vitalidade);
  luta.jogador = novo;
  luta.vidaJogador = multiplicar(novo.vitalidade, fracaoDeVida);
  luta.jogadorPrimeiro = maiorOuIgual(novo.velocidade, luta.inimigo.velocidade);
}

export function irParaFase(estado, indice) {
  if (!faseLiberada(estado, indice)) return false;
  estado.combate.faseAtual = indice;
  luta = null;
  return true;
}

function novaLuta(estado) {
  const fase = obterFase(estado.combate.faseAtual);
  // v0.33.0: luta guardada no save (mesma fase) → continua de onde parou, com os atributos que ela tinha
  const salva = estado.combate.luta;
  estado.combate.luta = null;
  if (salva && salva.fase === fase.indice && salva.jogador && salva.escala !== undefined) {
    const escalas = { escala: salva.escala, escalaVel: salva.escalaVel, escalaSentido: salva.escalaSentido };
    const atual = calcularAtributos(estado);
    luta = { fase, classe: classeDe(estado), ...escalas, inimigo: normalizarInimigo(fase.inimigo, escalas),
      jogador: { ...atual, ...salva.jogador } };
    for (const k of CAMPOS_DA_LUTA) if (salva[k] !== undefined) luta[k] = salva[k];
    return;
  }
  // atributos "congelados" durante a luta, já normalizados (números comuns)
  const { escalas, jogador, inimigo } = normalizarLuta(calcularAtributos(estado), fase.inimigo);
  luta = {
    fase,
    jogador,
    ...escalas,
    classe: classeDe(estado),   // habilidade especial da classe
    golpesDoJogador: 0,         // contador para a Explosão Elemental
    inimigo,
    vidaJogador: jogador.vitalidade,
    vidaInimigo: inimigo.vida,
    jogadorPrimeiro: maiorOuIgual(jogador.velocidade, inimigo.velocidade),
    relogio: 0,     // tempo até o próximo turno
    tempo: 0,       // tempo total da luta
    turno: 0,
    pausa: CB.pausaEntreLutas,
    segundos: 0,    // v0.32.0: tempo real desta luta (pausa + turnos) — é o que o farm de Essência paga
  };
}

// Mesma conta de atributos.dano (com o dano mínimo garantido)
const calcularDano = dano;

// Avança o combate em "segundos". Divide em passos pequenos para ficar preciso
// mesmo quando o navegador atrasa ou durante a simulação offline.
export function atualizarCombate(estado, segundos, aoEvento) {
  if (!combateLiberado(estado)) return;
  // v0.21.0: em Reclusão o personagem não luta (a luta em andamento é abandonada, sem derrota)
  if (estado.reclusao?.ativa) { luta = null; return; }
  let restante = segundos;
  while (restante > 0) {
    const dt = Math.min(restante, CB.passoDeSimulacao);
    restante -= dt;
    passo(estado, dt, aoEvento);
  }
}

function passo(estado, dt, aoEvento) {
  if (!luta || luta.fase.indice !== estado.combate.faseAtual) novaLuta(estado);
  luta.segundos += dt;

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

        if (menorOuIgual(luta.vidaInimigo, 0)) { vencer(estado, aoEvento); return; }
        if (menorOuIgual(luta.vidaJogador, 0)) { perder(estado, aoEvento, 'derrotado'); return; }
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
  return maior(inimigo.sentidoDivino, 0) && maiorOuIgual(jogador.sentidoDivino, multiplicar(SD.supressao, inimigo.sentidoDivino));
}

function golpeDoJogador(aoEvento, extra = {}) {   // extra: { duplo, segundo } no ataque duplo
  const jogador = luta.jogador;
  const especial = luta.classe.especial;
  luta.golpesDoJogador += 1;
  const tecnica = tecnicaDoGolpe(luta);   // técnica especial da classe (a cada N ataques)

  // Mestre da Espada: Intenção da Arma ignora parte da Defesa
  const defesa = multiplicar(luta.inimigo.defesa, 1 - penetracaoDoGolpe(luta, tecnica));
  const critico = Math.random() * 100 < jogador.critico;
  let dano = calcularDano(jogador.ataque, defesa);
  if (critico) dano = multiplicar(dano, jogador.danoCritico / 100);
  if (tecnica) dano = multiplicar(dano, tecnica.multiplicador);

  // Cultivador Elemental: a cada N golpes, uma Explosão Elemental
  const elemental = !!especial.explosaoACada && luta.golpesDoJogador % especial.explosaoACada === 0;
  if (elemental) dano = multiplicar(dano, 1 + especial.bonusExplosao);

  luta.vidaInimigo = subtrair(luta.vidaInimigo, dano);
  const efeitos = tecnica ? efeitosDaTecnica(luta, tecnica) : null;
  // "vida" e "vidaMaxima" deixam a tela atualizar a barra no momento da animação do golpe
  // "numero" = quantos golpes o jogador já deu (a tela usa para alternar os elementos)
  if (aoEvento) aoEvento({ tipo: 'golpe', alvo: 'inimigo', escala: luta.escala, dano, critico, elemental, tecnica, efeitos, numero: luta.golpesDoJogador, vida: luta.vidaInimigo, vidaMaxima: luta.inimigo.vida, vidaJogador: luta.vidaJogador, vidaMaximaJogador: luta.jogador.vitalidade, ...extra });
}

function regenerar(aoEvento) {
  const porcentagem = luta.classe.especial.regeneracao;
  if (!porcentagem || maiorOuIgual(luta.vidaJogador, luta.jogador.vitalidade)) return;
  const cura = minimo(multiplicar(luta.jogador.vitalidade, porcentagem), subtrair(luta.jogador.vitalidade, luta.vidaJogador));
  luta.vidaJogador = somar(luta.vidaJogador, cura);
  if (aoEvento) aoEvento({ tipo: 'cura', alvo: 'jogador', escala: luta.escala, valor: cura, vida: luta.vidaJogador, vidaMaxima: luta.jogador.vitalidade });
}

function golpeDoInimigo(aoEvento) {
  const vidaMaxima = luta.jogador.vitalidade;
  // Corvo Dourado Forja o Sol (Elemental): atordoado, o inimigo perde o ataque
  if (inimigoCongelado(luta)) {
    if (aoEvento) aoEvento({ tipo: 'golpe', alvo: 'jogador', congelado: true, vida: luta.vidaJogador, vidaMaxima });
    return;
  }
  if (Math.random() * 100 < luta.jogador.esquiva) {
    if (aoEvento) aoEvento({ tipo: 'golpe', alvo: 'jogador', esquiva: true, vida: luta.vidaJogador, vidaMaxima });
    return;
  }
  const dano = calcularDano(luta.inimigo.ataque, luta.jogador.defesa);
  luta.vidaJogador = subtrair(luta.vidaJogador, dano);
  if (aoEvento) aoEvento({ tipo: 'golpe', alvo: 'jogador', escala: luta.escala, dano, vida: luta.vidaJogador, vidaMaxima });
}

function vencer(estado, aoEvento, suprimido = false) {
  const fase = luta.fase;
  const primeira = fase.indice > estado.combate.fasesConcluidas;
  const multiplicador = primeira ? CB.bonusPrimeiraVitoria : 1;
  const cultivo = multiplicar(cultivoDaVitoria(estado, fase), multiplicador);
  const pedras = multiplicar(fase.recompensa.pedras, multiplicador);

  ganharCultivo(estado, cultivo);
  creditar(estado, 'pedras', pedras);
  estado.combate.vitorias += 1;
  // v0.32.0: Essência da Alma — 1ª conquista (uma vez só) + farm pelo tempo real desta luta
  const essencia = receberEssenciaDaVitoria(estado, fase, primeira, luta.segundos);
  if (primeira) {
    estado.combate.fasesConcluidas = fase.indice;
    estado.reencarnacao.melhorFaseDeTodas = Math.max(estado.reencarnacao.melhorFaseDeTodas ?? -1, fase.indice);
  }

  // Chance de cair um equipamento
  const drop = tentarDrop(estado, fase, primeira);
  // Chance de cair um Núcleo (Mapa 3 em diante)
  const nucleo = tentarNucleo(estado, fase);
  // v0.21.0: chance de cair uma pílula de cultivo (Mapa 2 em diante; sempre na 1ª vitória contra um chefe)
  const pilula = tentarPilula(estado, fase, primeira);

  // Venceu o chefe final de um mundo pela primeira vez → o mundo (com o texto final) | null
  const ultimaDoMundo = primeira && fase.ultimaDoMundo ? dadosDoMundo(fase.mundo) : null;
  if (aoEvento) aoEvento({ tipo: 'vitoria', fase, cultivo, pedras, essencia, primeira, ultimaDoMundo, drop, nucleo, pilula, suprimido });

  // v0.32.0: a campanha não acaba (Normal, Difícil, Inferno e Infinito vêm depois do Fácil)
  if (estado.combate.autoAvancar) estado.combate.faseAtual = fase.indice + 1;
  luta = null;
}

function perder(estado, aoEvento, motivo) {
  const fase = luta.fase;
  estado.combate.derrotas += 1;
  estado.combate.autoAvancar = false;
  // v0.33.0: registro para a retomada automática (sistemas/automacao.js) — tempo de jogo e Poder da derrota
  const atributosReais = calcularAtributos(estado, { selado: false });
  estado.combate.derrota = { em: estado.estatisticas.tempoJogado, poder: poderTotal(atributosReais), velocidade: atributosReais.velocidade };
  if (estado.combate.faseAtual > 0) estado.combate.faseAtual -= 1;
  if (aoEvento) aoEvento({ tipo: 'derrota', fase, motivo });
  luta = null;
}

// Simula as lutas enquanto o jogador estava fora e resume o resultado
export function simularCombateOffline(estado, segundos) {
  const resumo = { vitorias: 0, derrotas: 0, cultivo: 0, pedras: 0, essencia: 0, fasesNovas: 0, itens: 0, nucleos: 0, mundoConcluido: null };
  if (!combateLiberado(estado)) return resumo;

  atualizarCombate(estado, segundos, (evento) => {
    if (evento.tipo === 'vitoria') {
      resumo.vitorias += 1;
      resumo.cultivo = somar(resumo.cultivo, evento.cultivo);
      resumo.pedras = somar(resumo.pedras, evento.pedras);
      resumo.essencia = somar(resumo.essencia, evento.essencia.total);
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
