// =============================================================
// ui/interface.js — tela principal, barra de abas e painéis
// montarInterface   → roda uma vez: cria elementos e liga botões
// atualizarInterface → roda 10×/segundo: só atualiza textos
// As abas Combate e Mapa ficam em telaCombate.js e telaMapa.js
// =============================================================
import { montarTelaBoss, atualizarTelaBoss, fecharTelaBoss } from './telaBoss.js';
import { CONFIG } from '../config.js';
import { REINOS, REGIOES } from '../dados/reinos.js';
import * as P from '../sistemas/progressao.js';
import { calcularAtributos, analisarPoder, ATRIBUTOS } from '../sistemas/atributos.js';
import { liberado } from '../sistemas/desbloqueios.js';
import { MUNDO, obterFase, mapaDesenhado, chefeDoMapa, mundoDoMapa, mapaDaFronteira } from '../sistemas/mundo.js';
import { mapaDaFase, mapaVisual, nomeDaPosicao, numeroNaDificuldade, DIFICULDADES } from '../sistemas/escala.js';
import { subtrair, multiplicar, maior, menorOuIgual, maximo, razao, arredondarParaBaixo } from '../numeros.js';
import { cabe } from '../saldos.js';
import { formatarNumero, formatarTempo, formatarAtributo } from '../format.js';
import { desenharPersonagem, desenharMeditacaoViva, animarVivo } from './sprite.js';
import { TEXTO_DO_SELO, TEXTO_CURTO_DO_SELO } from './poder.js';
import { lutaAtual } from '../sistemas/combate.js';
import { SLOTS } from '../dados/equipamentos.js';
import { grauDe } from '../sistemas/itens.js';
import { personagemDe, classeDe } from '../sistemas/personagem.js';
import { desenharFundo } from './fundo.js';
import { montarTelaCombate, atualizarTelaCombate } from './telaCombate.js';
import { montarTelaMapa, atualizarTelaMapa } from './telaMapa.js';
import { montarTelaBlackBook, atualizarTelaBlackBook } from './telaBlackBook.js';
import { montarTelaMochila, atualizarTelaMochila } from './telaMochila.js';
import { montarNucleos, atualizarNucleos } from './nucleos.js';
import { montarVip, atualizarVip } from './vip.js';
import { temAlgumNucleo } from '../sistemas/nucleos.js';
import * as EQ from '../sistemas/equipamentos.js';
import * as BB from '../sistemas/blackbook.js';
import { podeLutar } from '../sistemas/boss.js';
import * as CA from '../sistemas/cultivoAvancado.js';
import { montarCultivoAvancado, atualizarCultivoAvancado } from './telaCultivoAvancado.js';
import { montarTelaAutomacao, atualizarTelaAutomacao } from './telaAutomacao.js';

// Atalho para pegar elementos pelo id
const $ = (id) => document.getElementById(id);

const elementosAtributos = {};
const tetosAtributos = {};
// v0.29.0 (tela Personagem do mockup): ícone de cada atributo (img/ui/) e a linha extra "Recuperação de Vida"
// (Regeneração do Refinador Corporal: % da Vitalidade por turno; as outras classes não regeneram)
const ICONE_ATRIBUTO = {
  ataque: 'icone_atq', critico: 'icone_crit', danoCritico: 'icone_dano_crit', velocidade: 'icone_velocidade',
  vitalidade: 'icone_hp', defesa: 'icone_def', esquiva: 'icone_esquiva', poderCultivo: 'icone_cultivo_peq',
  sentidoDivino: 'icone_sentido', regeneracao: 'icone_regeneracao',
};
const REGENERACAO = { id: 'regeneracao', nome: 'Recuperação de Vida', formato: 'numero' };
const AJUDA = {
  vida: 'Vida do herói na luta de agora. O máximo é a Vitalidade; cada luta nova começa com a vida cheia.',
  // v0.32.0: a reencarnação saiu do jogo — este item mostra até onde a jornada contínua chegou
  jornada: 'Até onde você chegou na jornada: Fácil → Normal → Difícil → Inferno → Infinito. Nada recomeça — ' +
    'cultivo, equipamentos, Pedras e Black Book seguem com você. Os mapas anteriores continuam abertos para farmar.',
};
let ultimoNivelDesenhado = '';
let fundoDesenhado = null;
let painelAberto = null;

export function montarInterface(acoes) {
  $('versao').textContent = CONFIG.versao;
  // v0.21.0: ícone que ainda não chegou (arte de IA pendente) mostra o ícone do Cultivo em vez de "imagem quebrada"
  document.addEventListener('error', (e) => {
    const img = e.target;
    if (img.tagName !== 'IMG' || img.dataset.reserva || !img.getAttribute('src')?.startsWith('img/icones/')) return;
    img.dataset.reserva = '1';
    img.src = 'img/icones/cultivo.png';
  }, true);

  // ---- Abas: clicar abre o painel; clicar de novo fecha ----
  document.querySelectorAll('[data-aba]').forEach((botao) => {
    botao.addEventListener('click', () => {
      if (painelAberto === botao.dataset.aba) fecharPainel();
      else abrirPainel(botao.dataset.aba);
    });
  });
  document.querySelectorAll('[data-fechar]').forEach((botao) => botao.addEventListener('click', fecharPainel));
  // v0.27.0: o "+" de cada recurso no topo abre a aba dele
  document.querySelectorAll('[data-ir]').forEach((botao) => botao.addEventListener('click', () => abrirPainel(botao.dataset.ir)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') fecharPainel(); });

  // ---- Botões de cultivo (existem na tela inicial e no painel Cultivo) ----
  $('botao-meditar').addEventListener('click', (e) => acoes.aoMeditar(e.currentTarget));
  $('inicio-meditar').addEventListener('click', (e) => acoes.aoMeditar(e.currentTarget));
  $('botao-avancar').addEventListener('click', acoes.aoAvancar);
  $('inicio-avancar').addEventListener('click', acoes.aoAvancar);
  $('opcao-auto').addEventListener('change', (e) => acoes.aoMudarAuto(e.target.checked));

  $('botao-salvar').addEventListener('click', acoes.aoSalvar);
  $('botao-resetar').addEventListener('click', acoes.aoResetar);
  $('modal-botao').addEventListener('click', () => $('modal').classList.add('escondido'));

  // ---- Atributos (v0.29.0, layout do mockup): 2 colunas — Ataque, Taxa de Crítico, Dano Crítico, Velocidade e
  //      Vitalidade | Defesa, Esquiva, Poder de Cultivo, Sentido Divino e Recuperação de Vida; o teto entre parênteses ----
  for (const atributo of [...ATRIBUTOS, REGENERACAO]) {
    const linha = document.createElement('div');
    linha.className = 'pers-atributo';
    linha.innerHTML = `<img src="img/ui/${ICONE_ATRIBUTO[atributo.id]}.png" alt=""><span>${atributo.nome.replace(' (HP)', '')}</span><b>0</b><small></small>`;
    elementosAtributos[atributo.id] = linha.querySelector('b');
    tetosAtributos[atributo.id] = linha.querySelector('small');
    $('lista-atributos').appendChild(linha);
  }
  montarNucleos(acoes);
  animarVivo($('sprite-pers'));   // (a tela inicial usa os quadros desenhados — sprite.desenharMeditacaoViva)
  $('pers-avancar').addEventListener('click', () => abrirPainel('cultivo'));
  $('pers-pontos-ajuda').addEventListener('click', () => mostrarMensagem('Núcleos caem dos inimigos a partir do Mapa 3. ' +
    'Use no + de cada cartão do Núcleo de Cultivo: cada ponto dá +1% para sempre.'));
  document.querySelectorAll('.pers-ajuda').forEach((botao) => botao.addEventListener('click', () => mostrarMensagem(AJUDA[botao.dataset.ajuda])));
  // v0.19.0: tela do herói — orbes de habilidade (tocar mostra o que fazem)
  for (const id of ['orbe-passiva', 'orbe-tecnica']) {
    $(id).addEventListener('click', () => {
      const dica = $('dica-habilidade');
      const mesma = dica.dataset.orbe === id && !dica.classList.contains('escondido');
      dica.classList.toggle('escondido', mesma);
      dica.dataset.orbe = id;
      dica.innerHTML = $(id).dataset.dica ?? '';
    });
  }   // botão "+" de Ataque, Vitalidade, Defesa e Velocidade
  montarVip(acoes);               // botão 💎 e tela do VIP
  montarTelaBoss(acoes);          // botão BOSS e tela do Evento de Boss

  // Personagem sentado no chão do cenário (recalcula quando a janela ou o painel mudam de tamanho)
  window.addEventListener('resize', posicionarNoChao);
  if (window.ResizeObserver) {
    const observador = new ResizeObserver(posicionarNoChao);
    observador.observe(document.querySelector('.inicio'));
    observador.observe(document.querySelector('.inicio-cultivo'));
  }
  posicionarNoChao();

  montarTelaCombate(acoes);
  montarTelaMapa(acoes);
  montarTelaMochila(acoes);
  montarTelaBlackBook(acoes);
  montarTelaAutomacao(acoes);   // v0.33.0: gerenciamento automático (Opções)
  montarCultivoAvancado(acoes, abrirPainel);   // v0.21.0: Reclusão, Pílulas, Arranjo, Bênçãos, Iluminação
}

// ---- Painéis em tela cheia ----
export function abrirPainel(nome) {
  fecharTelaBoss();   // v0.34.0: a tela do boss fica entre a barra de cima e as abas — tocar numa aba sai dela
  painelAberto = nome;
  document.querySelectorAll('.painel').forEach((p) => p.classList.toggle('aberto', p.id === 'aba-' + nome));
  document.querySelectorAll('#abas button').forEach((b) => b.classList.toggle('ativa', b.dataset.aba === nome));
}

export function fecharPainel() {
  painelAberto = null;
  document.querySelectorAll('.painel').forEach((p) => p.classList.remove('aberto'));
  document.querySelectorAll('#abas button').forEach((b) => b.classList.remove('ativa'));
}

// Mantido com este nome porque o main.js usa
export const trocarAba = abrirPainel;

export function atualizarInterface(estado) {
  atualizarVip(estado);
  const producao = P.producaoPorSegundo(estado);

  // ---- Topo ----
  $('topo-cultivo').textContent = formatarNumero(arredondarParaBaixo(estado.cultivo));
  $('topo-ps').textContent = formatarNumero(producao);
  $('topo-pedras').textContent = formatarNumero(arredondarParaBaixo(estado.pedras));
  $('topo-essencia').textContent = formatarNumero(arredondarParaBaixo(estado.essencia));
  // A Essência só aparece no topo depois que o jogador já teve alguma
  $('topo-essencia-caixa').classList.toggle('escondido', menorOuIgual(estado.essencia, 0) && !liberado(estado, 'blackbook'));

  // Abas trancadas aparecem apagadas
  for (const sistema of ['combate', 'mapa', 'mochila', 'blackbook']) {
    document.querySelector(`#abas [data-aba="${sistema}"]`).classList.toggle('trancada', !liberado(estado, sistema));
  }

  atualizarFundo(estado);
  atualizarAvisos(estado);
  atualizarCultivo(estado, producao);
  atualizarCultivoAvancado(estado, painelAberto);
  atualizarTelaAutomacao(estado, painelAberto === 'opcoes');   // v0.33.0
  atualizarPersonagem(estado);
  atualizarTelaMochila(estado);

  // ---- Partes que só mudam quando o nível ou o personagem mudam ----
  const chaveNivel = `${P.indiceNivel(estado)}|${JSON.stringify(estado.personagem)}`;
  if (chaveNivel !== ultimoNivelDesenhado) {
    ultimoNivelDesenhado = chaveNivel;
    atualizarNivel(estado);
  }

  atualizarTelaCombate(estado);
  atualizarTelaMapa(estado);
  atualizarTelaBlackBook(estado);
  atualizarTelaBoss(estado);
}

// ---- Equipamento em volta do herói (tocar abre a Mochila) ----
// v0.29.0: igual à Mochila — borda na cor da raridade, ícone colorido, "+nível" e "Nv." (mapa onde o item caiu)
let chaveEquipamento = '';
function desenharEquipamentoDoHeroi(estado) {
  const chave = SLOTS.map(s => { const i = estado.equipados[s.id]; return i ? `${i.id}.${i.nivel}.${i.raridade}.${grauDe(i)}` : '-'; }).join('|');
  if (chave === chaveEquipamento) return;
  chaveEquipamento = chave;
  for (const lado of ['esquerda', 'direita']) {
    const coluna = $(`heroi-slots-${lado}`);
    coluna.innerHTML = '';
    for (const slot of SLOTS.filter(s => s.lado === lado)) {
      const item = estado.equipados[slot.id];
      const botao = document.createElement('button');
      botao.className = 'ui pers-slot' + (item ? '' : ' vazio');
      botao.title = item ? `${slot.nome}${item.nivel > 0 ? ` +${item.nivel}` : ''}` : `${slot.nome} (vazio)`;
      botao.innerHTML = item
        ? `<span class="moch-moldura moldura-${item.raridade}"><img class="item-ic" src="img/ui/item_${slot.id}.png" alt="">` +
          `${item.nivel > 0 ? `<span class="moch-mais">+${item.nivel}</span>` : ''}<span class="moch-nv">Nv.${mapaDaFase(item.fase) + 1}</span></span>`
        : `<span class="moch-moldura moldura-comum"><img class="item-ic fantasma" src="img/ui/item_${slot.id}.png" alt=""></span>`;
      botao.addEventListener('click', () => abrirPainel('mochila'));
      coluna.appendChild(botao);
    }
  }
}

// ---- v0.19.0: avisos vermelhos (●) nas abas quando há algo para fazer ----
// Calculado 1× por segundo (comparar os itens da mochila custa um pouco).
let ultimoAviso = 0;
function atualizarAvisos(estado) {
  const agora = Date.now();
  if (agora - ultimoAviso < 1000) return;
  ultimoAviso = agora;
  const marcar = (seletor, ligado, motivo) => {
    const el = document.querySelector(seletor);
    if (!el) return;
    el.classList.toggle('tem-aviso', Boolean(ligado));
    el.dataset.aviso = ligado ? motivo : '';
  };
  // Personagem: núcleos guardados para usar
  marcar('[data-aba="personagem"]', temAlgumNucleo(estado), 'Núcleos para usar');
  // Cultivo: já dá para avançar (com o avanço automático ligado, só no rompimento manual)
  const avancaSozinho = P.proximoEhRompimento(estado) ? estado.vip : estado.opcoes.autoAvancar;
  const avancoManual = P.podeAvancar(estado) && !avancaSozinho;
  // v0.21.0: também quando dá para refinar a Fonte Estelar ou há pílula de Acúmulo/Fluxo guardada
  const pilula = (estado.pilulas.acumulo ?? 0) > 0 || ((estado.pilulas.fluxo ?? 0) > 0 && !(estado.efeitos.fluxo > 0));
  marcar('[data-aba="cultivo"]', avancoManual || CA.podeRefinarFonteEstelar(estado) || pilula,
    avancoManual ? 'Pronto para avançar' : pilula ? 'Pílulas para usar' : 'Fonte Estelar pronta');
  // Mochila: item melhor que o vestido (sem o Auto-vestir) ou pilha para mesclar
  const mochilaLiberada = liberado(estado, 'mochila');
  let melhor = false;
  if (mochilaLiberada && !estado.opcoes.autoEquipar && estado.mochila.length) {
    // igual ao Auto-vestir: compara fora do Selo (v0.32.0: sem o limite do reino, que saiu)
    const poderAtual = analisarPoder(calcularAtributos(estado, { selado: false })).poder;
    melhor = estado.mochila.slice(0, 60).some(item =>
      maior(analisarPoder(calcularAtributos({ ...estado, equipados: { ...estado.equipados, [item.slot]: item } }, { selado: false })).poder, poderAtual));
  }
  marcar('[data-aba="mochila"]', melhor || (mochilaLiberada && EQ.temAlgoParaMesclar(estado)),
    melhor ? 'Item melhor na mochila' : 'Itens para mesclar');
  // Black Book: dá para comprar alguma melhoria
  const livro = liberado(estado, 'blackbook') && CONFIG.blackbook.melhorias
    .some(m => !BB.noMaximo(estado, m.id) && cabe(estado, 'essencia', BB.custoMelhoria(estado, m.id)));
  marcar('[data-aba="blackbook"]', livro, 'Melhoria disponível');
  // Boss do evento disponível
  marcar('#botao-boss', podeLutar(estado), 'O boss está esperando');
}

// ---- Fundo: paisagem do mapa atual (ou imagem própria do mundo) ----
// v0.21.0: em Reclusão a tela inicial mostra a caverna (img/fundos/reclusao.jpg, quando a arte existir)
const FUNDO_DA_RECLUSAO = new Image();
FUNDO_DA_RECLUSAO.src = 'img/fundos/reclusao.jpg';
FUNDO_DA_RECLUSAO.addEventListener('load', () => { fundoDesenhado = null; });
// v0.34.0 (dono): a tela inicial tem um fundo FIXO (docs/layout/layout_inicio.png), em qualquer mapa. A Reclusão e a
// arena do combate continuam com o fundo delas. PLATAFORMA = altura da plataforma redonda na imagem (o herói senta nela).
const FUNDO_DA_INICIAL = new Image();
FUNDO_DA_INICIAL.src = 'img/fundos/inicio.jpg';
FUNDO_DA_INICIAL.addEventListener('load', () => { fundoDesenhado = null; });
const PLATAFORMA = 0.755;

function atualizarFundo(estado) {
  // v0.32.0: mapa GLOBAL (Normal, Difícil...); a arte e o nome são os do mapa desenhado (mapa visual)
  const indiceMapa = liberado(estado, 'combate') ? mapaDaFase(estado.combate.faseAtual) : 0;
  const mapa = mapaDesenhado(indiceMapa);
  const reclusao = estado.reclusao.ativa;
  const chave = `${indiceMapa}|${reclusao}`;

  if (fundoDesenhado === chave) return;
  fundoDesenhado = chave;
  // v0.17.4: antes "Mundo Inicial — Starting World · O Segredo do Mundo" quebrava em 3 linhas
  // v0.27.0 (layout novo): nome do mapa, mundo e "mapa-fase" em 3 linhas (a fase é atualizada a cada passo)
  $('inicio-local').innerHTML = reclusao
    ? `<b>Em Reclusão</b><small>${mapa.nome}</small><small>${nomeDaPosicao(indiceMapa)}</small>`
    : `<b>${mapa.nome}</b><small>${nomeCurtoDoMundo(mundoDoMapa(indiceMapa))}</small><small id="inicio-local-fase"></small>`;
  ajustarFonte($('inicio-local').querySelector('b'), $('inicio-local').querySelector('b').textContent, 30, 20);

  $('fundo-imagem').classList.remove('fundo-inicial');
  $('fundo-imagem').style.backgroundSize = $('fundo-imagem').style.backgroundPosition = '';
  if (reclusao && FUNDO_DA_RECLUSAO.complete && FUNDO_DA_RECLUSAO.naturalWidth) {
    $('fundo-imagem').style.backgroundImage = `url("${FUNDO_DA_RECLUSAO.src}")`;
    $('fundo-imagem').classList.remove('escondido');
    $('fundo-mundo').classList.add('escondido');
  } else if (!reclusao && FUNDO_DA_INICIAL.complete && FUNDO_DA_INICIAL.naturalWidth) {
    $('fundo-imagem').style.backgroundImage = `url("${FUNDO_DA_INICIAL.src}")`;
    $('fundo-imagem').classList.remove('escondido');
    $('fundo-imagem').classList.add('fundo-inicial');
    $('fundo-mundo').classList.add('escondido');
    setTimeout(posicionarNoChao, 0);   // (setTimeout: o requestAnimationFrame para quando a aba está escondida)
  } else if (MUNDO.imagemFundo) {
    $('fundo-imagem').style.backgroundImage = `url("${MUNDO.imagemFundo}")`;
    $('fundo-imagem').classList.remove('escondido');
    $('fundo-mundo').classList.add('escondido');
  } else {
    $('fundo-imagem').classList.add('escondido');      // saiu da Reclusão: volta a paisagem do mapa
    $('fundo-mundo').classList.remove('escondido');
    desenharFundo($('fundo-mundo'), mapa.cena, mapaVisual(indiceMapa) + 1);
  }
}

// ---- v0.16.3: personagem sentado no "chão" do cenário ----
// Os fundos (540×960) têm o chão / círculo do mapa a ~73% da altura. O fundo cobre a janela
// inteira (cover, centralizado), então a altura do chão na tela muda com o formato da janela:
// calcula onde ele ficou e senta o personagem ali, sem nunca entrar no painel de cultivo.
const CHAO_DO_FUNDO = 0.735;

function posicionarNoChao() {
  const inicio = document.querySelector('.inicio');
  const moldura = $('moldura-sprite');
  const painel = document.querySelector('.inicio-cultivo');
  if (!inicio || !moldura || !painel) return;
  if ($('fundo-imagem').classList.contains('fundo-inicial')) return posicionarNaPlataforma(inicio, moldura, painel);
  const fundo = document.querySelector('.fundo-mundo:not(.escondido)') ?? $('fundo-mundo');
  const tela = fundo.getBoundingClientRect();
  const escala = Math.max(tela.width / 540, tela.height / 960);
  const alturaImagem = 960 * escala;
  const chao = tela.top + (tela.height - alturaImagem) / 2 + CHAO_DO_FUNDO * alturaImagem;
  const caixa = inicio.getBoundingClientRect();
  const limite = painel.getBoundingClientRect().top - 2;        // não entra no painel
  const minimo = $('inicio-local').getBoundingClientRect().bottom + moldura.offsetHeight + 8;
  const y = Math.max(minimo, Math.min(chao, limite)) - caixa.top + inicio.scrollTop;
  moldura.style.setProperty('--chao-y', `${Math.round(y)}px`);
}

// v0.34.0: fundo fixo da tela inicial — a plataforma redonda fica logo acima do painel de cultivo (como no mockup) e o
// herói senta nela. A imagem cobre a tela toda: escala = a maior entre "cobrir a largura" e "chegar ao topo".
function posicionarNaPlataforma(inicio, moldura, painel) {
  const fundo = $('fundo-imagem');
  const tela = fundo.getBoundingClientRect();
  const largura = FUNDO_DA_INICIAL.naturalWidth, altura = FUNDO_DA_INICIAL.naturalHeight;
  if (!largura || !tela.width) return;
  const u = tela.width / 941;
  const alvo = painel.getBoundingClientRect().top - tela.top - 34 * u;          // onde a plataforma fica na tela
  const escala = Math.max(tela.width / largura, alvo / (PLATAFORMA * altura), tela.height / altura);
  const topo = alvo - PLATAFORMA * altura * escala;
  fundo.style.backgroundSize = `${largura * escala}px ${altura * escala}px`;
  fundo.style.backgroundPosition = `center ${Math.round(Math.min(0, topo))}px`;
  const plataforma = tela.top + Math.min(0, topo) + PLATAFORMA * altura * escala;
  const caixa = inicio.getBoundingClientRect();
  moldura.style.setProperty('--chao-y', `${Math.round(plataforma - caixa.top + inicio.scrollTop + 10 * u)}px`);
}

// "Limite Estelar — Domínio dos Grandes Imperadores" → "Limite Estelar" (o nome completo fica só na aba Mapa)
// v0.32.0: da Normal em diante vem o nome da dificuldade na frente ("Normal · Limite Estelar")
export function nomeCurtoDoMundo(mundo) {
  const curto = mundo.nome.split(' — ')[0];
  return mundo.dificuldade ? `${mundo.dificuldade} · ${curto}` : curto;
}

// v0.27.0: nomes longos ("Meio-Passo do Céu Aberto") encolhem a letra para caber na moldura do layout novo.
// tamanho = em u (px do mockup) para até `cabe` letras; acima disso diminui na mesma proporção (mínimo 60%)
function ajustarFonte(el, texto, tamanho, cabe) {
  const u = Math.max(tamanho * 0.6, Math.min(tamanho, tamanho * cabe / Math.max(1, texto.length)));
  el.style.fontSize = `calc(var(--ut) * ${u.toFixed(1)})`;   // v0.30.1: mesma unidade de texto do CSS
}

// v0.20.2: só troca o texto quando ele muda de verdade (trocar 10×/s, no meio de um toque,
// atrapalhava o clique dos botões Meditar e Avançar/Romper em alguns celulares)
function trocarTexto(el, texto) {
  if (el.textContent !== texto) el.textContent = texto;
}

// ---- Cultivo: tela inicial e painel Cultivo ----
function atualizarCultivo(estado, producao) {
  // VIP: o botão liga/desliga o Meditar automático; sem VIP, é por clique
  const auto = estado.vip && estado.opcoes.meditarAuto;
  const textoMeditar = estado.vip
    ? `🧘 Meditar automático: ${auto ? 'LIGADO' : 'DESLIGADO'}`
    : `🧘 Meditar (+${formatarNumero(P.ganhoDaMeditacao(estado))})`;
  for (const id of ['botao-meditar', 'inicio-meditar']) {
    if (id === 'botao-meditar') trocarTexto($(id), textoMeditar.replace('🧘 ', ''));   // o da tela inicial tem texto próprio (abaixo)
    $(id).classList.toggle('meditar-auto', auto);
    // Só o "auto DESLIGADO" do VIP fica apagado (sem VIP o botão medita por toque: fica colorido)
    $(id).classList.toggle('auto-desligado', estado.vip && !auto);
  }
  // v0.27.0: botão redondo da tela inicial — nome em cima, ganho (ou o estado do automático) embaixo
  // (o ganho e o estado do automático ficam na dica ao segurar o dedo; o automático do VIP aparece pelo brilho)
  trocarTexto($('inicio-meditar'), 'Meditar');
  $('inicio-meditar').title = textoMeditar;
  $('opcao-auto').checked = estado.opcoes.autoAvancar;

  // Requisito de combate para romper o reino
  // v0.21.0: "Gargalo" — o cultivo já está pronto, só falta o chefe (com botão "Ir ao chefe")
  const requisito = P.requisitoDoRompimento(estado);
  let textoRequisito = '';
  let temChefe = false;
  if (requisito && !requisito.cumprido) {
    // v0.32.0: o mapa do requisito é GLOBAL (a Maestria pede chefes da Normal em diante) — sempre existe
    const chefe = chefeDoMapa(requisito.mapa - 1);
    temChefe = true;
    const pronto = cabe(estado, 'cultivo', P.custoParaAvancar(estado));
    // v0.22.0: o requisito pode ser de estágio (Céu Aberto: a 4ª Ordem só depois do Mapa 48)
    const alvo = requisito.rompimento ? 'o reino só se rompe' : `a ${P.nomeDoProximoNivel(estado).split(' — ')[1]} só abre`;
    const acao = requisito.rompimento ? 'romper o reino' : `chegar à ${P.nomeDoProximoNivel(estado).split(' — ')[1]}`;
    textoRequisito = pronto ? `⛰️ Gargalo! Seu cultivo está pronto, mas ${alvo} depois de derrotar ${chefe.inimigo.nome} (${nomeDaPosicao(requisito.mapa - 1)}).`
      : `🔒 Para ${acao}, derrote o chefe do ${nomeDaPosicao(requisito.mapa - 1)}: ${chefe.inimigo.nome}.`;
  }
  trocarTexto($('cult-requisito'), textoRequisito);
  // v0.27.0: na tela inicial o motivo vai na linha de dica e o botão "Ir ao chefe" só aparece quando há chefe
  trocarTexto($('inicio-requisito'), temChefe ? 'Ir ao chefe' : '');
  $('inicio-requisito').title = textoRequisito;
  $('inicio-requisito').classList.toggle('clicavel', temChefe);
  trocarTexto($('inicio-dica'), textoRequisito.replace(/^\S+\s/, '') ||
    `Seu cultivo cresce sozinho: +${formatarNumero(P.producaoPorSegundo(estado))}/s, também offline.`);
  const localFase = $('inicio-local-fase');
  if (localFase && estado.combate) {
    // v0.32.0: "12-5" no Fácil; "Normal 12-5" da Normal em diante
    const faseAgora = obterFase(estado.combate.faseAtual);
    const dificuldade = faseAgora.dificuldade > 0 ? `${DIFICULDADES[faseAgora.dificuldade].nome} ` : '';
    trocarTexto(localFase, `${dificuldade}${numeroNaDificuldade(faseAgora.mapa)}-${faseAgora.numero}`);
  }
  $('cult-ir-chefe').classList.toggle('escondido', !temChefe);

  let proximo, largura, progressoTexto, tempo, textoBotao, rompimento = false;
  if (P.noNivelMaximo(estado)) {
    proximo = 'Ápice alcançado (por enquanto)';
    largura = '100%';
    progressoTexto = '';
    tempo = '';
    textoBotao = '✨ Ápice';
  } else {
    const custo = P.custoParaAvancar(estado);
    const falta = subtrair(custo, estado.cultivo);
    rompimento = P.proximoEhRompimento(estado);
    proximo = P.nomeDoProximoNivel(estado);
    largura = Math.min(1, razao(estado.cultivo, custo)) * 100 + '%';
    progressoTexto = `${formatarNumero(arredondarParaBaixo(estado.cultivo))} / ${formatarNumero(custo)}`;
    tempo = maior(falta, 0) ? `≈ ${formatarTempo(razao(falta, producao))}` : 'Pronto!';
    const avancoNome = P.proximoEhMaestria(estado) ? 'Subir Maestria' : 'Avançar Estágio';   // v0.32.0
    if (requisito && !requisito.cumprido) textoBotao = rompimento ? '🔒 Romper Reino' : `🔒 ${avancoNome}`;
    else textoBotao = rompimento ? '⚡ Romper Reino' : `⬆️ ${avancoNome}`;
  }

  trocarTexto($('cult-proximo'), proximo);
  // v0.27.0: tela inicial — "Estágio 2/3 · Próximo: 3º Estágio" (ou "Romper: <reino>"), progresso com % e nível no topo
  const reinoAgora = P.reinoAtual(estado);
  const [proximoReino, proximoEstagio] = proximo.split(' — ');
  trocarTexto($('inicio-proximo'), P.noNivelMaximo(estado) ? proximo
    : P.proximoEhMaestria(estado) ? `${CONFIG.maestria.nome} · Próximo: ${proximoEstagio ?? proximo}`
    : `Estágio ${estado.estagio + 1}/${reinoAgora.estagios.length} · ${rompimento ? `Romper: ${proximoReino}` : `Próximo: ${proximoEstagio ?? proximo}`}`);
  trocarTexto($('inicio-progresso'), progressoTexto ? `${progressoTexto} (${Math.floor(parseFloat(largura))}%)` : '');
  $('topo-nivel-barra').style.width = largura;
  $('cult-barra').style.width = largura;
  $('inicio-barra').style.width = largura;
  trocarTexto($('cult-progresso'), progressoTexto);
  trocarTexto($('cult-tempo'), tempo);
  trocarTexto($('cult-producao'), `+${formatarNumero(producao)}/s`);
  trocarTexto($('inicio-tempo'), tempo);

  for (const id of ['botao-avancar', 'inicio-avancar']) {
    const botao = $(id);
    // Os botões têm imagem (avançar / romper), então o texto vai sem o emoji.
    // v0.16.4: bloqueado NÃO é mais "disabled" — o toque mostra o motivo (dono achou que o botão
    // não funcionava, porque o toque num botão desativado não fazia nada)
    trocarTexto(botao, textoBotao.replace(/^\S+\s/, ''));
    botao.classList.toggle('rompimento', rompimento);
    botao.classList.toggle('indisponivel', !P.podeAvancar(estado));
    botao.classList.toggle('trancado', Boolean(requisito && !requisito.cumprido));
  }
}

// ---- Personagem: atributos ----
function atualizarPersonagem(estado) {
  const atributos = calcularAtributos(estado);
  const valores = { ...atributos, regeneracao: multiplicar(atributos.vitalidade, atributos.especial?.regeneracao ?? 0) };
  for (const atributo of [...ATRIBUTOS, REGENERACAO]) {
    const valor = valores[atributo.id];
    const bloqueado = atributo.id === 'sentidoDivino' && valor === 0;
    const elemento = elementosAtributos[atributo.id];
    trocarTexto(elemento, bloqueado ? 'Bloqueado' : atributo.id === 'regeneracao' && !valor ? '—'
      : formatarAtributo(valor, atributo.formato));
    // Atributos com teto mostram o máximo entre parênteses (ex.: "48.0% (60%)"); no teto, fica dourado
    trocarTexto(tetosAtributos[atributo.id], atributo.maximo !== undefined ? `(${atributo.maximo}${atributo.formato === 'porcento' ? '%' : ''})` : '');
    elemento.classList.toggle('no-maximo', atributo.maximo !== undefined && valor >= atributo.maximo);
    elemento.classList.toggle('atributo-trancado', bloqueado);
    elemento.title = bloqueado ? 'Libera no reino Ascensão Imortal'
      : atributo.id === 'regeneracao' ? (valor ? 'Por turno (Regeneração da classe)' : 'Só o Refinador Corporal regenera a cada turno') : '';
  }
  // Vida na luta de agora (fora da luta, cheia)
  // (v0.33.0: a luta usa valores normalizados — × luta.escala volta ao valor real)
  const luta = lutaAtual();
  const maxima = luta ? multiplicar(luta.jogador.vitalidade, luta.escala) : atributos.vitalidade;
  const atual = luta ? multiplicar(maximo(0, luta.vidaJogador), luta.escala) : maxima;
  trocarTexto($('pers-vida'), `${formatarNumero(maximo(0, atual))} / ${formatarNumero(maxima)}`);
  // v0.32.0: "Jornada" — o mapa mais longe já aberto (a reencarnação saiu do jogo)
  trocarTexto($('pers-vidas'), nomeDaPosicao(mapaDaFronteira(estado)));
  atualizarNucleos(estado);
  desenharEquipamentoDoHeroi(estado);
  const analise = analisarPoder(atributos);
  trocarTexto($('pers-poder'), formatarNumero(analise.poder));
  trocarTexto($('pers-ofensa'), formatarNumero(analise.ofensa));
  trocarTexto($('pers-resistencia'), formatarNumero(analise.resistencia));
  // v0.26.0: Selo do Mundo Primordial (v0.32.0: o limite do equipamento pelo reino saiu do jogo)
  const textoAviso = atributos.selado ? TEXTO_CURTO_DO_SELO + '.' : '';
  $('pers-limite').classList.toggle('escondido', !textoAviso);
  trocarTexto($('pers-limite-texto'), textoAviso);
  $('pers-limite').title = atributos.selado ? TEXTO_DO_SELO : '';
  $('pers-avancar').classList.toggle('escondido', Boolean(atributos.selado));
}

function atualizarNivel(estado) {
  const reino = P.reinoAtual(estado);
  const regiao = P.regiaoAtual(estado);

  // Personagem (tela inicial e painel)
  const personagem = personagemDe(estado);
  const classe = classeDe(estado);
  desenharMeditacaoViva($('sprite'), reino, personagem);   // v0.34.0: 4 quadros desenhados + faixa na cor do reino
  desenharPersonagem($('sprite-pers'), reino.id, 'combate', personagem);
  $('topo-retrato-img').src = `img/ui/retrato_${personagem.sexo}_${classe.id}.png`;   // v0.27.0: retrato no topo
  $('inicio-nome').textContent = personagem.nome;
  $('pers-nome').textContent = personagem.nome;
  $('pers-classe').innerHTML = `${classe.nome} <span class="pers-sexo">${personagem.sexo === 'feminino' ? '♀' : '♂'}</span>`;
  $('cb-nome-jogador').textContent = personagem.nome;
  // v0.29.0: herói da vitrine (img/ui/vitrine_<sexo>_<classe>.png); sem a imagem, fica o sprite de batalha
  const vitrine = $('pers-vitrine');
  const caminhoVitrine = `img/ui/vitrine_${personagem.sexo}_${classe.id}.png`;
  if (vitrine.getAttribute('src') !== caminhoVitrine) {
    vitrine.onload = () => { vitrine.classList.remove('escondido'); $('sprite-pers').classList.add('escondido'); };
    vitrine.onerror = () => { vitrine.classList.add('escondido'); $('sprite-pers').classList.remove('escondido'); };
    vitrine.src = caminhoVitrine;
  }
  $('orbe-passiva-img').src = `img/ui/pers_passiva_${classe.id}.png`;
  $('orbe-passiva').dataset.dica = `<b>${classe.nomeEspecial}</b> <small>· passiva</small><p>${classe.textoEspecial}</p>`;
  $('orbe-tecnica-img').src = `img/ui/pers_tecnica_${classe.id}.png`;
  $('orbe-tecnica').classList.toggle('escondido', !classe.tecnica);
  if (classe.tecnica) $('orbe-tecnica').dataset.dica = `<b>✦ ${classe.tecnica.nome}</b> <small>· técnica especial</small><p>${classe.tecnica.texto}</p>`;
  const dica = $('dica-habilidade');
  if (!dica.classList.contains('escondido')) dica.innerHTML = $(dica.dataset.orbe)?.dataset.dica ?? '';
  $('moldura-sprite').style.setProperty('--aura', regiao.corAura);
  $('inicio-reino').textContent = reino.nome;
  ajustarFonte($('inicio-reino'), reino.nome, 22, 14);   // v0.30.1: nome longo do reino cabe no topo (celular)
  $('inicio-faixa-reino').textContent = reino.nome;   // v0.27.0: faixa da tela inicial
  ajustarFonte($('inicio-faixa-reino'), reino.nome, 33, 14);
  $('topo-nivel').textContent = `Nv. ${P.indiceNivel(estado) + 1}`;
  $('inicio-estagio').textContent = P.nomeDoEstagio(estado);

  // Descrição do reino no painel Cultivo
  $('cult-reino-nome').textContent = reino.nome;
  $('cult-reino-desc').textContent = reino.descricao;
  $('cult-estagios').innerHTML = reino.estagios.map((_, i) =>
    `<span class="${i < estado.estagio ? 'feito' : i === estado.estagio ? 'atual' : ''}" title="${reino.estagios[i]}"></span>`).join('') +
    `<b>${P.nomeDoEstagio(estado)}</b>`;

  // Caminho do Cultivo: concluídos, atual, próximo e ocultos (???)
  const lista = $('lista-caminho');
  lista.innerHTML = '';
  let regiaoAnterior = null;
  REINOS.forEach((r, indice) => {
    // v0.16.4: título da região quando ela muda (antes repetia em todas as linhas)
    if (indice <= estado.reino + 1 && r.regiao !== regiaoAnterior) {
      regiaoAnterior = r.regiao;
      const titulo = document.createElement('li');
      titulo.className = 'caminho-regiao';
      titulo.textContent = REGIOES[r.regiao].nome;
      lista.appendChild(titulo);
    }
    const item = document.createElement('li');
    let classe;
    let texto;

    if (indice < estado.reino) {
      classe = 'concluido';
      texto = r.nome;
    } else if (indice === estado.reino) {
      classe = 'atual';
      texto = `${r.nome} <small>${estado.estagio + 1}/${r.estagios.length}</small>`;
    } else if (indice === estado.reino + 1) {
      classe = 'proximo';
      texto = `${r.nome}`;
    } else {
      // v0.16.4: os reinos ocultos viram UMA linha só ("??? · mais N reinos ocultos")
      if (indice > estado.reino + 2) return;
      const ocultos = REINOS.length - indice;
      classe = 'oculto';
      texto = ocultos > 1 ? `??? <small>mais ${ocultos} reinos ocultos</small>` : '???';
    }

    item.className = classe;
    item.innerHTML = `<i class="marcador"></i><span>${texto}</span>`;
    lista.appendChild(item);
  });
}

// v0.16.4: por que o botão de avançar está bloqueado (mostrado ao tocar nele)
export function motivoParaNaoAvancar(estado) {
  if (P.noNivelMaximo(estado)) return '✨ Você chegou ao ápice (por enquanto).';
  const requisito = P.requisitoDoRompimento(estado);
  if (requisito && !requisito.cumprido) {
    const chefe = chefeDoMapa(requisito.mapa - 1);
    const acao = requisito.rompimento ? 'romper o reino' : `chegar à ${P.nomeDoProximoNivel(estado).split(' — ')[1]}`;
    return `🔒 Para ${acao}, derrote o chefe do ${nomeDaPosicao(requisito.mapa - 1)}: ${chefe.inimigo.nome}.`;
  }
  const falta = subtrair(P.custoParaAvancar(estado), estado.cultivo);
  const producao = P.producaoPorSegundo(estado);
  return `⏳ Falta ${formatarNumero(falta)} de Cultivo (≈ ${formatarTempo(razao(falta, producao))}).`;
}

// ---- Efeitos ----
// v0.16.5: "+55.05M" subindo do botão Meditar a cada toque (antes o toque não dava retorno nenhum
// e parecia que o botão não funcionava — o ganho é pequeno perto do cultivo total)
export function mostrarGanhoMeditacao(botao, ganho) {
  if (!botao) return;
  const caixa = botao.getBoundingClientRect();
  const texto = document.createElement('span');
  texto.className = 'ganho-meditacao';
  texto.textContent = `+${formatarNumero(ganho)}`;
  texto.style.left = `${caixa.left + caixa.width / 2 + (Math.random() * 24 - 12)}px`;
  texto.style.top = `${caixa.top}px`;
  document.body.appendChild(texto);
  setTimeout(() => texto.remove(), 900);
  botao.classList.remove('meditou');
  void botao.offsetWidth;            // reinicia a animação do "pulo" do botão
  botao.classList.add('meditou');
}

let temporizadorMensagem = null;

export function mostrarMensagem(texto) {
  const caixa = $('mensagem');
  caixa.textContent = texto;
  caixa.classList.add('visivel');
  clearTimeout(temporizadorMensagem);
  temporizadorMensagem = setTimeout(() => caixa.classList.remove('visivel'), 4500);
}

// Janela no meio da tela para momentos importantes
export function mostrarModal(titulo, texto) {
  $('modal-titulo').textContent = titulo;
  $('modal-texto').textContent = texto;
  $('modal').classList.remove('escondido');
}

export function animarRompimento() {
  const flash = $('flash');
  const moldura = $('moldura-sprite');
  // Remove e recoloca a classe para a animação reiniciar
  flash.classList.remove('ativo');
  moldura.classList.remove('rompendo');
  void flash.offsetWidth;
  flash.classList.add('ativo');
  moldura.classList.add('rompendo');
}
