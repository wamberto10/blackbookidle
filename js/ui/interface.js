// =============================================================
// ui/interface.js — tela principal, barra de abas e painéis
// montarInterface   → roda uma vez: cria elementos e liga botões
// atualizarInterface → roda 10×/segundo: só atualiza textos
// As abas Combate e Mapa ficam em telaCombate.js e telaMapa.js
// =============================================================
import { montarTelaBoss, atualizarTelaBoss } from './telaBoss.js';
import { CONFIG } from '../config.js';
import { REINOS, REGIOES } from '../dados/reinos.js';
import * as P from '../sistemas/progressao.js';
import { calcularAtributos, analisarPoder, ATRIBUTOS } from '../sistemas/atributos.js';
import { liberado } from '../sistemas/desbloqueios.js';
import { MUNDO, MAPAS, FASES, chefeDoMapa, mundoDoMapa } from '../sistemas/mundo.js';
import { formatarNumero, formatarTempo, formatarAtributo } from '../format.js';
import { desenharPersonagem, icone, iconeDoMapa, iconeEquipamento, animarVivo } from './sprite.js';
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

// Atalho para pegar elementos pelo id
const $ = (id) => document.getElementById(id);

const elementosAtributos = {};
const barrasTeto = {};
const ATRIBUTOS_PRINCIPAIS = ['ataque', 'vitalidade', 'defesa', 'velocidade'];
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

  // ---- Atributos (v0.16.0): os 4 dos núcleos em grade 2×2, os com teto com barrinha,
  //      Poder de Cultivo e Sentido Divino lado a lado ----
  const linhas = {};
  for (const atributo of ATRIBUTOS) {
    const linha = document.createElement('div');
    const comTeto = atributo.maximo !== undefined;
    const principal = ATRIBUTOS_PRINCIPAIS.includes(atributo.id);
    linha.className = 'atributo ' + (principal ? 'atributo-principal' : comTeto ? 'atributo-teto' : 'atributo-extra');
    linha.innerHTML = principal
      ? `<span class="atributo-nome">${icone(atributo.icone)} ${atributo.nome.replace(' (HP)', '')}</span><strong>0</strong>`
      : `<span class="atributo-nome">${icone(atributo.icone)} ${atributo.nome}</span><strong>0</strong>` +
        (comTeto ? '<div class="barra-teto"><div></div></div>' : '');
    elementosAtributos[atributo.id] = linha.querySelector('strong');
    if (comTeto) barrasTeto[atributo.id] = linha.querySelector('.barra-teto > div');
    linhas[atributo.id] = linha;
    $(principal ? 'lista-atributos' : comTeto ? 'lista-atributos-teto' : 'lista-atributos-extra').appendChild(linha);
  }
  montarNucleos(acoes, linhas);
  animarVivo($('sprite'));
  animarVivo($('sprite-pers'));
  // v0.19.0: tela do herói — orbes de habilidade e pergaminho de atributos
  $('abrir-atributos').addEventListener('click', () => $('janela-atributos').classList.remove('escondido'));
  $('fechar-atributos').addEventListener('click', () => $('janela-atributos').classList.add('escondido'));
  $('janela-atributos').addEventListener('click', (e) => { if (e.target.id === 'janela-atributos') e.target.classList.add('escondido'); });
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
  montarCultivoAvancado(acoes, abrirPainel);   // v0.21.0: Reclusão, Pílulas, Arranjo, Bênçãos, Iluminação
}

// ---- Painéis em tela cheia ----
export function abrirPainel(nome) {
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
  $('topo-cultivo').textContent = formatarNumero(Math.floor(estado.cultivo));
  $('topo-ps').textContent = formatarNumero(producao);
  $('topo-pedras').textContent = formatarNumero(Math.floor(estado.pedras));
  $('topo-essencia').textContent = formatarNumero(Math.floor(estado.essencia));
  // A Essência só aparece no topo depois que o jogador já teve alguma
  $('topo-essencia-caixa').classList.toggle('escondido', estado.essencia <= 0 && estado.reencarnacao.vezes === 0);

  // Abas trancadas aparecem apagadas
  for (const sistema of ['combate', 'mapa', 'mochila', 'blackbook']) {
    document.querySelector(`#abas [data-aba="${sistema}"]`).classList.toggle('trancada', !liberado(estado, sistema));
  }

  atualizarFundo(estado);
  atualizarAvisos(estado);
  atualizarCultivo(estado, producao);
  atualizarCultivoAvancado(estado, painelAberto);
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

// ---- v0.19.0: equipamento em volta do herói (tocar abre a Mochila) ----
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
      botao.className = 'slot-item heroi-slot' + (item ? ' raridade-' + item.raridade : ' vazio');
      botao.title = item ? slot.nome : `${slot.nome} (vazio)`;
      botao.innerHTML = item
        ? `${iconeEquipamento(item.slot, item.raridade)}${item.nivel > 0 ? `<span class="item-nivel">+${item.nivel}</span>` : ''}`
        : iconeEquipamento(slot.id, 'comum', 'fantasma');
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
    // v0.22.1: compara a força cheia dos itens (sem o limite do reino), igual ao Auto-vestir
    const poderAtual = analisarPoder(calcularAtributos(estado, { semLimite: true })).poder;
    melhor = estado.mochila.slice(0, 60).some(item =>
      analisarPoder(calcularAtributos({ ...estado, equipados: { ...estado.equipados, [item.slot]: item } }, { semLimite: true })).poder > poderAtual);
  }
  marcar('[data-aba="mochila"]', melhor || (mochilaLiberada && EQ.temAlgoParaMesclar(estado)),
    melhor ? 'Item melhor na mochila' : 'Itens para mesclar');
  // Black Book: dá para comprar alguma melhoria
  const livro = liberado(estado, 'blackbook') && CONFIG.blackbook.melhorias
    .some(m => !BB.noMaximo(estado, m.id) && estado.essencia >= BB.custoMelhoria(estado, m.id));
  marcar('[data-aba="blackbook"]', livro, 'Melhoria disponível');
  // Boss do evento disponível
  marcar('#botao-boss', podeLutar(estado), 'O boss está esperando');
}

// ---- Fundo: paisagem do mapa atual (ou imagem própria do mundo) ----
// v0.21.0: em Reclusão a tela inicial mostra a caverna (img/fundos/reclusao.jpg, quando a arte existir)
const FUNDO_DA_RECLUSAO = new Image();
FUNDO_DA_RECLUSAO.src = 'img/fundos/reclusao.jpg';
FUNDO_DA_RECLUSAO.addEventListener('load', () => { fundoDesenhado = null; });

function atualizarFundo(estado) {
  const indiceMapa = liberado(estado, 'combate') ? FASES[estado.combate.faseAtual].mapa : 0;
  const mapa = MAPAS[indiceMapa];
  const reclusao = estado.reclusao.ativa;
  const chave = `${indiceMapa}|${reclusao}`;

  if (fundoDesenhado === chave) return;
  fundoDesenhado = chave;
  // v0.17.4: antes "Mundo Inicial — Starting World · O Segredo do Mundo" quebrava em 3 linhas
  $('inicio-local').innerHTML = reclusao
    ? `<b>${icone('reclusao')} Em Reclusão</b><small>${mapa.nome} · Mapa ${indiceMapa + 1}</small>`
    : `<b>${iconeDoMapa(indiceMapa)} ${mapa.nome}</b><small>${nomeCurtoDoMundo(mundoDoMapa(indiceMapa))} · Mapa ${indiceMapa + 1}</small>`;

  if (reclusao && FUNDO_DA_RECLUSAO.complete && FUNDO_DA_RECLUSAO.naturalWidth) {
    $('fundo-imagem').style.backgroundImage = `url("${FUNDO_DA_RECLUSAO.src}")`;
    $('fundo-imagem').classList.remove('escondido');
    $('fundo-mundo').classList.add('escondido');
  } else if (MUNDO.imagemFundo) {
    $('fundo-imagem').style.backgroundImage = `url("${MUNDO.imagemFundo}")`;
    $('fundo-imagem').classList.remove('escondido');
    $('fundo-mundo').classList.add('escondido');
  } else {
    $('fundo-imagem').classList.add('escondido');      // saiu da Reclusão: volta a paisagem do mapa
    $('fundo-mundo').classList.remove('escondido');
    desenharFundo($('fundo-mundo'), mapa.cena, indiceMapa + 1);
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

// "Limite Estelar — Domínio dos Grandes Imperadores" → "Limite Estelar" (o nome completo fica só na aba Mapa)
export function nomeCurtoDoMundo(mundo) {
  return mundo.nome.split(' — ')[0];
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
    trocarTexto($(id), textoMeditar.replace('🧘 ', ''));
    $(id).classList.toggle('meditar-auto', auto);
    // Só o "auto DESLIGADO" do VIP fica apagado (sem VIP o botão medita por toque: fica colorido)
    $(id).classList.toggle('auto-desligado', estado.vip && !auto);
  }
  // v0.16.3: na tela inicial o painel ficou mais baixo — texto curto para caber numa linha
  trocarTexto($('inicio-meditar'), estado.vip ? `Auto: ${auto ? 'LIGADO' : 'DESLIGADO'}` : textoMeditar.replace('🧘 ', ''));
  $('inicio-meditar').title = textoMeditar;
  $('opcao-auto').checked = estado.opcoes.autoAvancar;

  // Requisito de combate para romper o reino
  // v0.21.0: "Gargalo" — o cultivo já está pronto, só falta o chefe (com botão "Ir ao chefe")
  const requisito = P.requisitoDoRompimento(estado);
  let textoRequisito = '';
  let temChefe = false;
  if (requisito && !requisito.cumprido) {
    const chefe = chefeDoMapa(requisito.mapa - 1);
    temChefe = Boolean(chefe);
    const pronto = estado.cultivo >= P.custoParaAvancar(estado);
    // v0.22.0: o requisito pode ser de estágio (Céu Aberto: a 4ª Ordem só depois do Mapa 48)
    const alvo = requisito.rompimento ? 'o reino só se rompe' : `a ${P.nomeDoProximoNivel(estado).split(' — ')[1]} só abre`;
    const acao = requisito.rompimento ? 'romper o reino' : `chegar à ${P.nomeDoProximoNivel(estado).split(' — ')[1]}`;
    textoRequisito = !chefe ? `🔒 ${requisito.rompimento ? 'O próximo reino' : 'O próximo estágio'} será liberado no próximo mundo (em breve).`
      : pronto ? `⛰️ Gargalo! Seu cultivo está pronto, mas ${alvo} depois de derrotar ${chefe.inimigo.nome} (Mapa ${requisito.mapa}).`
      : `🔒 Para ${acao}, derrote o chefe do Mapa ${requisito.mapa}: ${chefe.inimigo.nome}.`;
  }
  trocarTexto($('cult-requisito'), textoRequisito);
  trocarTexto($('inicio-requisito'), textoRequisito + (temChefe ? ' ›' : ''));
  $('inicio-requisito').classList.toggle('clicavel', temChefe);
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
    const falta = custo - estado.cultivo;
    rompimento = P.proximoEhRompimento(estado);
    proximo = P.nomeDoProximoNivel(estado);
    largura = Math.min(1, estado.cultivo / custo) * 100 + '%';
    progressoTexto = `${formatarNumero(Math.floor(estado.cultivo))} / ${formatarNumero(custo)}`;
    tempo = falta > 0 ? `≈ ${formatarTempo(falta / producao)}` : 'Pronto!';
    if (requisito && !requisito.cumprido) textoBotao = rompimento ? '🔒 Romper Reino' : '🔒 Avançar Estágio';
    else textoBotao = rompimento ? '⚡ Romper Reino' : '⬆️ Avançar Estágio';
  }

  trocarTexto($('cult-proximo'), proximo);
  trocarTexto($('inicio-proximo'), proximo);
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
  for (const atributo of ATRIBUTOS) {
    const valor = atributos[atributo.id];
    const bloqueado = atributo.id === 'sentidoDivino' && valor === 0;
    const elemento = elementosAtributos[atributo.id];
    // Atributos com teto mostram o máximo junto (ex.: "13% / 60%"); no teto, fica dourado
    const maximo = atributo.maximo !== undefined ? ` / ${formatarAtributo(atributo.maximo, atributo.formato)}` : '';
    elemento.textContent = bloqueado ? '🔒 Bloqueado' : formatarAtributo(valor, atributo.formato) + maximo;
    elemento.classList.toggle('no-maximo', atributo.maximo !== undefined && valor >= atributo.maximo);
    elemento.title = atributo.maximo !== undefined ? `Máximo: ${formatarAtributo(atributo.maximo, atributo.formato)}` : elemento.title;
    elemento.title = bloqueado ? 'Libera no reino Ascensão Imortal' : '';
    elemento.classList.toggle('atributo-trancado', bloqueado);
    if (barrasTeto[atributo.id]) barrasTeto[atributo.id].style.width = `${Math.min(100, (valor / atributo.maximo) * 100)}%`;
  }
  const vidas = estado.reencarnacao.vezes;
  $('pers-vidas').textContent = `Vida nº ${vidas + 1} · ${vidas} ${vidas === 1 ? 'reencarnação' : 'reencarnações'}`;
  atualizarNucleos(estado);
  $('heroi-vida').textContent = formatarNumero(atributos.vitalidade);
  $('heroi-ataque').textContent = formatarNumero(atributos.ataque);
  $('heroi-defesa').textContent = formatarNumero(atributos.defesa);
  $('heroi-velocidade').textContent = formatarNumero(atributos.velocidade);
  desenharEquipamentoDoHeroi(estado);
  const analise = analisarPoder(atributos);
  $('pers-poder').textContent = formatarNumero(analise.poder);
  // A explicação aparece ao passar o mouse (ou segurar o dedo) em cada caixinha
  $('pers-poder-detalhe').innerHTML =
    `<span class="parte-poder" title="Dano médio por golpe (Ataque + Crítico)">${icone('ofensa')} Ofensa <b>${formatarNumero(analise.ofensa)}</b></span>` +
    `<span class="parte-poder" title="Vida efetiva (Vitalidade + Defesa + Esquiva)">${icone('resistencia')} Resistência <b>${formatarNumero(analise.resistencia)}</b></span>`;
  // v0.22.1: limite do equipamento pelo reino
  const aviso = $('pers-limite');
  aviso.classList.toggle('escondido', !atributos.equipamentoLimitado);
  if (atributos.equipamentoLimitado && !aviso.innerHTML) {
    aviso.innerHTML = `${icone('cadeado')} <span>Seus equipamentos são fortes demais para o seu reino: rendem no máximo ` +
      `${CONFIG.equipamentos.limiteDoReino}× a força do reino. Suba de estágio para liberar mais.</span>`;
  }
}

function atualizarNivel(estado) {
  const reino = P.reinoAtual(estado);
  const regiao = P.regiaoAtual(estado);

  // Personagem (tela inicial e painel)
  const personagem = personagemDe(estado);
  const classe = classeDe(estado);
  desenharPersonagem($('sprite'), reino.id, 'meditando', personagem);
  desenharPersonagem($('sprite-pers'), reino.id, 'combate', personagem);
  $('inicio-nome').textContent = personagem.nome;
  $('pers-nome').textContent = personagem.nome;
  $('pers-classe').innerHTML = `${classe.nome} <span class="pers-classe-sexo">· ${personagem.sexo === 'feminino' ? '♀' : '♂'}</span>`;
  $('pers-classe-icone').src = `img/icones/classe_${classe.id}.png`;
  $('cb-nome-jogador').textContent = personagem.nome;
  $('pers-classe-cartao').innerHTML = `
    <div class="classe-topo">${icone('classe_' + classe.id, 'classe-icone')}<div><h3>${classe.nome}</h3><p>${classe.titulo}</p></div></div>
    <p class="especial-classe"><b>${classe.nomeEspecial}:</b> ${classe.textoEspecial}</p>
    ${classe.tecnica ? `<p class="especial-classe tecnica-classe">${icone('tecnica')} <span><b>${classe.tecnica.nome}:</b> ${classe.tecnica.texto}</span></p>` : ''}`;
  $('orbe-passiva').innerHTML = icone('classe_' + classe.id);
  $('orbe-passiva').dataset.dica = `<b>${classe.nomeEspecial}</b> <small>· passiva</small><p>${classe.textoEspecial}</p>`;
  $('orbe-tecnica').innerHTML = icone('tecnica');
  $('orbe-tecnica').classList.toggle('escondido', !classe.tecnica);
  if (classe.tecnica) $('orbe-tecnica').dataset.dica = `<b>✦ ${classe.tecnica.nome}</b> <small>· técnica especial</small><p>${classe.tecnica.texto}</p>`;
  const dica = $('dica-habilidade');
  if (!dica.classList.contains('escondido')) dica.innerHTML = $(dica.dataset.orbe)?.dataset.dica ?? '';
  $('moldura-sprite').style.setProperty('--aura', regiao.corAura);
  $('moldura-sprite-pers').style.setProperty('--aura', regiao.corAura);
  $('inicio-reino').textContent = reino.nome;
  $('inicio-estagio').textContent = P.nomeDoEstagio(estado);
  $('pers-regiao').textContent = regiao.nome;
  $('pers-reino').textContent = reino.nome;
  $('pers-estagio').textContent = P.nomeDoEstagio(estado);

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
    return chefe
      ? `🔒 Para ${acao}, derrote o chefe do Mapa ${requisito.mapa}: ${chefe.inimigo.nome}.`
      : `🔒 ${requisito.rompimento ? 'O próximo reino' : 'O próximo estágio'} será liberado no próximo mundo (em breve).`;
  }
  const falta = P.custoParaAvancar(estado) - estado.cultivo;
  const producao = P.producaoPorSegundo(estado);
  return `⏳ Falta ${formatarNumero(Math.ceil(falta))} de Cultivo (≈ ${formatarTempo(falta / producao)}).`;
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
