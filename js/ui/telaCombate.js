// =============================================================
// ui/telaCombate.js — aba Combate (com animações)
//
// O combate acontece no sistema (sistemas/combate.js) e avisa cada
// golpe com um "evento". Aqui esses eventos viram animações:
//   - quem ataca avança; o personagem mostra a pose de ataque
//   - efeito em pixel art sobre o alvo (corte, garras, magia)
//   - o alvo pisca e recua; crítico faz a arena tremer
//   - inimigo derrotado se desfaz em partículas; o próximo entra deslizando
//
// Os dois golpes de um turno acontecem no mesmo instante no sistema,
// então a tela usa uma FILA: mostra um golpe, espera um pouco, mostra o outro.
// =============================================================
import { CONFIG } from '../config.js';
import * as P from '../sistemas/progressao.js';
import { combateLiberado, lutaAtual, cultivoDaVitoria } from '../sistemas/combate.js';
import { FASES, MAPAS, faseLiberada } from '../sistemas/mundo.js';
import { RARIDADE_POR_ID } from '../sistemas/itens.js';
import { formatarNumero } from '../format.js';
import { personagemDe } from '../sistemas/personagem.js';
import { desenharPersonagem, desenharInimigo, spriteDoInimigo, mostrarQuadro, caminhoDoEfeito, icone, iconeDoMapa, iconeEquipamento } from './sprite.js';
import { EFEITO_POR_APARENCIA } from '../dados/aparencias.js';
import { desenharFundo } from './fundo.js';
import { previsaoDaFase, textoDoPoder } from './poder.js';
import { EFEITO_PROVISORIO } from '../dados/classes.js';
import { SPRITES } from '../dados/sprites.js';
import { golpesPorTurno } from '../sistemas/atributos.js';
import { lutaDoBoss } from '../sistemas/boss.js';
import { abrirTelaBoss } from './telaBoss.js';

const $ = (id) => document.getElementById(id);

// Tempos das animações (milissegundos)
const INTERVALO_ENTRE_GOLPES = 380;
const INTERVALO_GOLPE_DUPLO = 220;   // entre o 1º e o 2º golpe do ataque duplo
const ATRASO_DO_IMPACTO = 120;       // o golpe "acerta" um pouco depois do avanço
const DURACAO_DA_MORTE = 800;

let chaveDesenhada = '';

// ---- Estado das animações (só da tela, não é salvo) ----
let proximoHorario = 0;              // quando o próximo item da fila pode começar
let pendentes = 0;                   // quantas animações ainda vão acontecer
let lutaMostrada = null;             // a luta que as barras estão mostrando
let lutaAvisada = null;              // última luta em que o aviso de chefe apareceu
let inimigoBloqueadoAte = 0;         // durante a morte, não troca o sprite do inimigo
// Vitórias cuja animação de morte ainda não terminou. Enquanto houver alguma, a tela NÃO troca
// para o próximo inimigo (senão ele aparecia por um instante antes da morte do anterior).
let vitoriasPendentes = 0;
let pendenteDesde = 0;
let ultimoEstado = null;
const vidaMostrada = {
  jogador: { vida: 1, maxima: 1 },
  inimigo: { vida: 1, maxima: 1 },
};

export function montarTelaCombate(acoes) {
  $('cb-anterior').addEventListener('click', () => acoes.aoMudarFase(-1));
  $('cb-proxima').addEventListener('click', () => acoes.aoMudarFase(+1));
  $('cb-auto').addEventListener('change', (e) => acoes.aoMudarAutoCombate(e.target.checked));
  $('aviso-boss-ver').addEventListener('click', abrirTelaBoss);
}

function telaVisivel() {
  return !document.hidden && $('aba-combate').classList.contains('aberto');
}

// Reinicia uma animação CSS (tira e recoloca a classe)
function animarClasse(elemento, classe, duracao) {
  elemento.classList.remove(classe);
  void elemento.offsetWidth;
  elemento.classList.add(classe);
  if (duracao) setTimeout(() => elemento.classList.remove(classe), duracao);
}

// Coloca uma animação na fila.
// "intervalo" = quanto tempo ela ocupa antes da próxima poder começar. A cura usa 0:
// acontece junto com o golpe seguinte (senão o Corporal teria 3 animações de 0,38 s
// num turno de 1 s, e a fila ia atrasando cada vez mais).
function agendar(funcao, intervalo = INTERVALO_ENTRE_GOLPES) {
  const agora = performance.now();
  // Se a fila atrasou demais (aba em segundo plano), descarta o atraso
  if (proximoHorario - agora > 1500) proximoHorario = agora;
  const quando = Math.max(agora, proximoHorario);
  proximoHorario = quando + intervalo;
  pendentes += 1;
  setTimeout(() => { pendentes -= 1; funcao(); }, quando - agora);
}

// ---- Barras de vida (mostram a vida "da animação", não a do sistema) ----
function desenharBarras() {
  for (const lado of ['jogador', 'inimigo']) {
    const { vida, maxima } = vidaMostrada[lado];
    $(`cb-vida-${lado}`).style.width = Math.max(0, vida / maxima) * 100 + '%';
    $(`cb-vida-${lado}-texto`).textContent = `${formatarNumero(Math.max(0, vida))} / ${formatarNumero(maxima)}`;
  }
}

export function atualizarTelaCombate(estado) {
  const liberado = combateLiberado(estado);
  $('combate-bloqueado').classList.toggle('escondido', liberado);
  $('combate-conteudo').classList.toggle('escondido', !liberado);
  if (!liberado) return;

  ultimoEstado = estado;
  const fase = FASES[estado.combate.faseAtual];
  const luta = lutaAtual();

  // v0.15.2: enquanto o herói luta contra o boss do evento, a luta da fase fica PAUSADA — avisa,
  // senão parece que o jogo travou (dono achou que travou com o "Atacar sozinho" ligado)
  const lutaBoss = lutaDoBoss();
  $('aviso-boss-ativo').classList.toggle('escondido', !lutaBoss);
  if (lutaBoss) {
    $('aviso-boss-ativo-texto').textContent = estado.opcoes.bossAuto
      ? '"Atacar sozinho" está ligado. A fase continua quando a luta do boss acabar (desligue na tela do boss se quiser só as fases).'
      : 'A fase continua quando a luta do boss acabar.';
  }
  // Segurança: se a aba ficou em segundo plano e uma animação nunca terminou, libera depois de 5 s
  if (vitoriasPendentes > 0 && Date.now() - pendenteDesde > 5000) vitoriasPendentes = 0;
  const inimigoLivre = vitoriasPendentes === 0 && Date.now() >= inimigoBloqueadoAte;

  // Redesenha cabeçalho, cenário e sprites quando muda a fase ou o reino
  const chave = `${fase.indice}|${estado.reino}|${JSON.stringify(personagemDe(estado))}`;
  if (chave !== chaveDesenhada && inimigoLivre) {
    chaveDesenhada = chave;
    const mapa = MAPAS[fase.mapa];
    $('cb-mapa').innerHTML = `${iconeDoMapa(fase.mapa)} Mapa ${fase.mapa + 1}: ${mapa.nome}`;
    $('cb-numero').textContent = `Fase ${fase.numero}/12`;
    $('cb-local').textContent = fase.local;
    $('cb-tipo').innerHTML = `${icone(fase.tipo.sprite)} ${fase.tipo.nome}`;
    $('cb-tipo').className = 'etiqueta tipo-' + fase.chaveTipo;
    $('cb-nome-inimigo').textContent = fase.inimigo.nome;
    desenharFundo($('arena-fundo'), mapa.cena, fase.mapa + 1);
    desenharPersonagem($('cb-sprite-jogador'), P.reinoAtual(estado).id, 'combate', personagemDe(estado));
    desenharInimigo($('cb-sprite-inimigo'), fase);
    const primeira = fase.indice > estado.combate.fasesConcluidas;
    $('cb-recompensa').innerHTML =
      `+${formatarNumero(cultivoDaVitoria(estado, fase))} ${icone('cultivo')} +${formatarNumero(fase.recompensa.pedras)} ${icone('pedra')}` +
      (primeira ? ` (×${CONFIG.combate.bonusPrimeiraVitoria} na primeira vitória!)` : '');
  }

  // Velocidade dos dois (atualiza sempre: muda na hora ao melhorar Velocidade no Black Book).
  // Com o dobro da Velocidade do inimigo, ataca 2 vezes por turno: mostra "⚡×2".
  if (luta && luta === lutaMostrada) {
    const duplo = golpesPorTurno(luta.jogador, luta.inimigo) > 1;
    $('cb-vel-jogador').textContent = formatarNumero(luta.jogador.velocidade) + (duplo ? ' ⚡×2' : '');
    $('cb-vel-jogador').parentElement.title = duplo
      ? 'Ataque duplo: você ataca 2 vezes por turno'
      : `Velocidade · com ${formatarNumero(2 * luta.inimigo.velocidade)} ou mais, você ataca 2 vezes por turno`;
    $('cb-vel-inimigo').textContent = formatarNumero(luta.inimigo.velocidade);
  }

  // Começou uma luta nova: barras cheias (depois que as animações da anterior terminarem)
  if (luta && luta !== lutaMostrada && pendentes === 0 && inimigoLivre) {
    lutaMostrada = luta;
    vidaMostrada.jogador = { vida: luta.vidaJogador, maxima: luta.jogador.vitalidade };
    vidaMostrada.inimigo = { vida: luta.vidaInimigo, maxima: luta.inimigo.vida };
    $('cb-vel-jogador').textContent = formatarNumero(luta.jogador.velocidade) +
      (golpesPorTurno(luta.jogador, luta.inimigo) > 1 ? ' ⚡×2' : '');
    $('cb-vel-inimigo').textContent = formatarNumero(luta.inimigo.velocidade);
    // Poder dos dois lados (mesma conta). A previsão da luta e o aviso de quem é mais
    // rápido foram tirados da tela a pedido do dono.
    const previsao = previsaoDaFase(estado, luta.fase);
    $('cb-poder-jogador').textContent = textoDoPoder(previsao.poderJogador);
    $('cb-poder-inimigo').textContent = textoDoPoder(previsao.poderInimigo);
  }
  // Aviso de chefe: uma vez por luta, assim que a tela de combate estiver aberta
  if (lutaMostrada && lutaMostrada !== lutaAvisada && telaVisivel()) {
    lutaAvisada = lutaMostrada;
    const tipo = lutaMostrada.fase.chaveTipo;
    if (tipo === 'chefe' || tipo === 'miniChefe') avisarChefe(lutaMostrada.fase);
  }
  desenharBarras();

  if (luta) {
    $('cb-tempo').textContent = luta.pausa > 0
      ? 'Preparando...'
      : `⏳ ${Math.ceil(CONFIG.combate.duracaoMaxima - luta.tempo)}s`;
  }

  $('cb-anterior').disabled = estado.combate.faseAtual === 0;
  $('cb-proxima').disabled = !faseLiberada(estado, estado.combate.faseAtual + 1);
  $('cb-auto').checked = estado.combate.autoAvancar;
}

// =============================================================
// Animações dos eventos
// =============================================================

// Qual efeito aparece quando o INIMIGO ataca, conforme a forma dele
const EFEITO_DO_INIMIGO = { humano: 'corte_inimigo', fera: 'garras', maligno: 'magia_roxa', guardiao: 'magia_azul' };
const EFEITOS_EXISTENTES = new Set(SPRITES.efeitos ?? []);

// Alguns inimigos têm efeito próprio (ex.: serpentes mordem). Se a imagem desse efeito
// ainda não existe, usa o padrão do tipo (ex.: a mordida vira garras até ser gerada).
function efeitoDoInimigo(inimigo, forma) {
  const proprio = inimigo ? EFEITO_POR_APARENCIA[spriteDoInimigo(inimigo)] : null;
  return proprio && EFEITOS_EXISTENTES.has(proprio) ? proprio : EFEITO_DO_INIMIGO[forma];
}

// Efeitos feitos em IA têm 4 quadros (os desenhados por código têm 3)
const EFEITOS_IA = new Set(SPRITES.efeitosIA ?? []);

function tocarEfeito(lado, nome) {
  if (!EFEITOS_EXISTENTES.has(nome)) nome = EFEITO_PROVISORIO[nome] ?? nome;   // classe nova sem imagem ainda
  const efeito = $(`cb-efeito-${lado}`);
  const ia = EFEITOS_IA.has(nome);
  efeito.style.backgroundImage = `url("${caminhoDoEfeito(nome)}")`;
  efeito.classList.toggle('quadros-4', ia);
  animarClasse(efeito, 'tocando', ia ? 420 : 320);
}

function numeroFlutuante(lado, texto, classes) {
  const numero = document.createElement('span');
  numero.className = 'numero-dano ' + classes;
  numero.textContent = texto;
  numero.style.left = 30 + Math.random() * 40 + '%';
  $(`cb-lado-${lado}`).appendChild(numero);
  setTimeout(() => numero.remove(), 1000);
  return numero;
}

// Um golpe (do jogador ou do inimigo)
export function mostrarGolpe(evento) {
  const alvo = evento.alvo;                          // quem leva o golpe
  const atacante = alvo === 'inimigo' ? 'jogador' : 'inimigo';

  // Fora da tela de combate: só atualiza a vida, sem animação
  if (!telaVisivel()) {
    vidaMostrada[alvo] = { vida: evento.vida, maxima: evento.vidaMaxima };
    return;
  }

  // Tempestade de Gelo Místico: o inimigo congelado perde o ataque
  if (evento.congelado) {
    agendar(() => {
      numeroFlutuante('inimigo', '❄️ CONGELADO!', 'critico');
      animarClasse($('cb-sprite-inimigo'), 'atingido', 300);
    });
    return;
  }

  // Ataque duplo: o 1º golpe deixa só um intervalo curto até o 2º, para os dois (mais o do
  // inimigo) caberem no turno de 1 s. Antes a fila atrasava, juntava os golpes e parecia um só.
  const intervalo = evento.duplo && !evento.segundo ? INTERVALO_GOLPE_DUPLO : INTERVALO_ENTRE_GOLPES;
  agendar(() => {
    // 1) Quem ataca avança
    animarClasse($(`cb-corpo-${atacante}`), atacante === 'jogador' ? 'avancando-direita' : 'avancando-esquerda', 300);
    if (atacante === 'jogador') mostrarQuadro($('cb-sprite-jogador'), 2, 280);

    // 2) O golpe acerta
    setTimeout(() => {
      vidaMostrada[alvo] = { vida: evento.vida, maxima: evento.vidaMaxima };
      desenharBarras();

      if (evento.esquiva) {
        animarClasse($(`cb-corpo-${alvo}`), alvo === 'jogador' ? 'esquivando-esquerda' : 'esquivando-direita', 400);
        numeroFlutuante(alvo, 'Esquivou!', 'esquiva');
        return;
      }

      const forma = lutaMostrada?.fase.inimigo.forma ?? 'humano';
      const classe = lutaMostrada?.classe;
      const forte = evento.critico || evento.elemental;
      // Efeito do jogador depende da classe (soco, corte ou elemento).
      // O Cultivador Elemental alterna os elementos da lista dele a cada golpe (hoje só o Gelo).
      // Golpes normais e Explosões alternam cada um na sua própria sequência
      // (senão a Explosão, que vem a cada 3 golpes, seria sempre o mesmo elemento)
      let elemento = null;
      if (classe?.elementos) {
        const total = classe.elementos.length;
        const aCada = classe.especial.explosaoACada;
        const explosoes = Math.floor(evento.numero / aCada);   // quantas explosões já aconteceram
        const posicao = evento.elemental
          ? (explosoes - 1) % total
          : (evento.numero - explosoes - 1) % total;            // conta só os golpes normais
        elemento = classe.elementos[posicao];
      }
      const visual = elemento ?? classe;
      const tecnica = atacante === 'jogador' ? evento.tecnica : null;   // técnica especial da classe
      const efeito = tecnica ? tecnica.efeito
        : atacante === 'jogador'
          ? (forte ? visual?.efeitoCritico ?? 'corte_critico' : visual?.efeito ?? 'corte')
          : efeitoDoInimigo(lutaMostrada?.fase.inimigo, forma);
      if (tecnica) mostrarTecnica(evento);
      tocarEfeito(alvo, efeito);
      animarClasse($(`cb-sprite-${alvo}`), 'atingido', 300);
      // Cada aviso numa linha, com o dano embaixo (antes ficava tudo numa linha e saía da arena)
      // Na técnica especial o nome já aparece no letreiro do alto da arena: o número mostra só o dano
      const prefixo = tecnica ? '' : (evento.segundo ? 'GOLPE DUPLO!\n' : '') +
        (evento.elemental ? `EXPLOSÃO DE ${elemento?.nome.toUpperCase() ?? 'QI'}!\n` : evento.critico ? 'CRÍTICO!\n' : '');
      const numero = numeroFlutuante(alvo, prefixo + formatarNumero(evento.dano),
        (forte ? 'critico' : '') + (evento.elemental ? ' elemental' : '') + (alvo === 'jogador' ? ' recebido' : ''));
      if (elemento && atacante === 'jogador') numero.style.color = elemento.cor;

      if (forte || tecnica) {
        animarClasse($('arena'), 'tremendo', 300);
        animarClasse($('arena-clarao'), 'clarao-critico', 250);
      }
    }, ATRASO_DO_IMPACTO);
  }, intervalo);
}

// Refinador Corporal: Regeneração no fim do turno
export function mostrarCura(evento) {
  if (!telaVisivel()) {
    vidaMostrada.jogador = { vida: evento.vida, maxima: evento.vidaMaxima };
    return;
  }
  agendar(() => {
    vidaMostrada.jogador = { vida: evento.vida, maxima: evento.vidaMaxima };
    desenharBarras();
    numeroFlutuante('jogador', `${evento.pilula ? 'PÍLULA DE CURA!\n' : ''}+${formatarNumero(evento.valor)}`, 'cura');
    animarClasse($('cb-sprite-jogador'), 'curando', 800);   // aura verde contornando o personagem
    // Efeito visual da Regeneração: desligado (o dono não gostou da 1ª versão, verde com folhas).
    // Para ligar de novo depois de gerar um novo cura.png: troque false por true.
    const MOSTRAR_EFEITO_CURA = false;
    if (MOSTRAR_EFEITO_CURA && EFEITOS_IA.has('cura')) tocarEfeito('jogador', 'cura');
  }, 0);   // não ocupa espaço na fila (roda junto com o próximo golpe)
}

// Partículas saindo de um ponto (morte do inimigo)
function explodirParticulas(lado, quantidade, cores) {
  const caixa = $(`cb-corpo-${lado}`);
  for (let i = 0; i < quantidade; i++) {
    const p = document.createElement('span');
    p.className = 'particula';
    const angulo = Math.random() * Math.PI * 2;
    const distancia = 30 + Math.random() * 40;
    p.style.setProperty('--dx', `${Math.cos(angulo) * distancia}px`);
    p.style.setProperty('--dy', `${Math.sin(angulo) * distancia - 20}px`);
    p.style.background = cores[i % cores.length];
    caixa.appendChild(p);
    setTimeout(() => p.remove(), 800);
  }
}

function recompensaFlutuante(html, classe, atraso) {
  setTimeout(() => {
    const r = document.createElement('div');
    r.className = 'recompensa-flutuante ' + classe;
    r.innerHTML = html;
    $('cb-lado-inimigo').appendChild(r);
    setTimeout(() => r.remove(), 1400);
  }, atraso);
}

// Vitória: inimigo se desfaz, recompensas sobem, o próximo entra
export function animarVitoria(evento) {
  if (!telaVisivel()) return;
  // Trava a troca de inimigo JÁ AGORA (a animação de morte só toca quando chegar a vez dela na fila)
  vitoriasPendentes += 1;
  pendenteDesde = Date.now();
  agendar(() => {
    inimigoBloqueadoAte = Date.now() + DURACAO_DA_MORTE;
    const corpo = $('cb-corpo-inimigo');
    // Supressão de Alma: o inimigo foge apavorado (some para a direita) em vez de cair
    if (evento.suprimido) numeroFlutuante('inimigo', 'SUPRESSÃO DE ALMA!\n💨 Fugiu!', 'critico');
    animarClasse(corpo, evento.suprimido ? 'fugindo' : 'morrendo');
    explodirParticulas('inimigo', 14, ['#ffffff', '#d4a84a', '#b8c8e8']);

    recompensaFlutuante(`+${formatarNumero(evento.cultivo)} ${icone('cultivo')}`, '', 150);
    recompensaFlutuante(`+${formatarNumero(evento.pedras)} ${icone('pedra')}`, 'segunda', 350);
    if (evento.drop) {
      const item = evento.drop.item;
      recompensaFlutuante(iconeEquipamento(item.slot, item.raridade), `drop-flutuante raridade-${item.raridade}`, 450);
      if (RARIDADE_POR_ID[item.raridade].tier !== 'D/F') animarClasse($('arena-clarao'), 'clarao-item', 600);
    }

    // Depois da morte: desenha o próximo inimigo ainda invisível e só então ele entra deslizando
    setTimeout(() => {
      vitoriasPendentes = Math.max(0, vitoriasPendentes - 1);
      chaveDesenhada = '';   // força redesenhar (pode ser outra fase)
      if (ultimoEstado) atualizarTelaCombate(ultimoEstado);
      corpo.classList.remove('morrendo', 'fugindo');
      animarClasse(corpo, 'entrando', 450);
    }, DURACAO_DA_MORTE);
  });
}

// Derrota: o personagem cai e a arena pisca em vermelho
export function animarDerrota() {
  if (!telaVisivel()) return;
  agendar(() => {
    animarClasse($('cb-corpo-jogador'), 'caindo', 900);
    animarClasse($('arena-clarao'), 'clarao-derrota', 600);
  });
}

// Técnica especial da classe: nome grande na arena + o efeito extra dela
function mostrarTecnica(evento) {
  const aviso = $('aviso-tecnica');
  aviso.textContent = `✦ ${evento.tecnica.nome} ✦`;
  animarClasse(aviso, 'aparecendo', 1300);
  animarClasse($('arena-clarao'), 'clarao-critico', 300);
  const efeitos = evento.efeitos ?? {};
  if (efeitos.cura) {
    vidaMostrada.jogador = { vida: evento.vidaJogador, maxima: evento.vidaMaximaJogador };
    desenharBarras();
    numeroFlutuante('jogador', `+${formatarNumero(efeitos.cura)}`, 'cura');
    animarClasse($('cb-sprite-jogador'), 'curando', 800);
  }
  if (efeitos.congelou) setTimeout(() => numeroFlutuante('inimigo', '❄️ Congelado!', 'elemental'), 250);
  if (efeitos.enfraqueceu) setTimeout(() => numeroFlutuante('inimigo', '👁️ Alma enfraquecida!', 'elemental'), 250);
  if (efeitos.pilula) setTimeout(() => numeroFlutuante('jogador', '💊 Pílula recarregada!', 'cura'), 250);
}

// Aviso de chefe no começo da luta
function avisarChefe(fase) {
  const aviso = $('aviso-chefe');
  aviso.innerHTML = `${icone(fase.tipo.sprite)} ${fase.tipo.nome.toUpperCase()}: ${fase.inimigo.nome}`;
  animarClasse(aviso, 'aparecendo', 1600);
}

// =============================================================
// Registro de batalha
// =============================================================

// Adiciona uma linha no registro de batalha (guarda as 8 mais recentes)
export function registrarBatalha(texto, classe = '') {
  const lista = $('cb-registro');
  const item = document.createElement('li');
  item.textContent = texto;
  item.className = classe;
  lista.prepend(item);
  while (lista.children.length > 8) lista.lastChild.remove();
}
