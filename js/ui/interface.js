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
import { desenharPersonagem, icone, iconeDoMapa } from './sprite.js';
import { personagemDe, classeDe } from '../sistemas/personagem.js';
import { desenharFundo } from './fundo.js';
import { montarTelaCombate, atualizarTelaCombate } from './telaCombate.js';
import { montarTelaMapa, atualizarTelaMapa } from './telaMapa.js';
import { montarTelaBlackBook, atualizarTelaBlackBook } from './telaBlackBook.js';
import { montarTelaMochila, atualizarTelaMochila } from './telaMochila.js';
import { montarNucleos, atualizarNucleos } from './nucleos.js';
import { montarVip, atualizarVip } from './vip.js';

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
  $('botao-meditar').addEventListener('click', acoes.aoMeditar);
  $('inicio-meditar').addEventListener('click', acoes.aoMeditar);
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
  montarNucleos(acoes, linhas);   // botão "+" de Ataque, Vitalidade, Defesa e Velocidade
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
  atualizarCultivo(estado, producao);
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

// ---- Fundo: paisagem do mapa atual (ou imagem própria do mundo) ----
function atualizarFundo(estado) {
  const indiceMapa = liberado(estado, 'combate') ? FASES[estado.combate.faseAtual].mapa : 0;
  const mapa = MAPAS[indiceMapa];

  if (fundoDesenhado === indiceMapa) return;
  fundoDesenhado = indiceMapa;
  $('inicio-local').innerHTML = `${mundoDoMapa(indiceMapa).nome} · ${iconeDoMapa(indiceMapa)} ${mapa.nome}`;

  if (MUNDO.imagemFundo) {
    $('fundo-imagem').style.backgroundImage = `url("${MUNDO.imagemFundo}")`;
    $('fundo-imagem').classList.remove('escondido');
    $('fundo-mundo').classList.add('escondido');
  } else {
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

// ---- Cultivo: tela inicial e painel Cultivo ----
function atualizarCultivo(estado, producao) {
  // VIP: o botão liga/desliga o Meditar automático; sem VIP, é por clique
  const auto = estado.vip && estado.opcoes.meditarAuto;
  const textoMeditar = estado.vip
    ? `🧘 Meditar automático: ${auto ? 'LIGADO' : 'DESLIGADO'}`
    : `🧘 Meditar (+${formatarNumero(P.ganhoDaMeditacao(estado))})`;
  for (const id of ['botao-meditar', 'inicio-meditar']) {
    $(id).textContent = textoMeditar.replace('🧘 ', '');
    $(id).classList.toggle('meditar-auto', auto);
  }
  // v0.16.3: na tela inicial o painel ficou mais baixo — texto curto para caber numa linha
  $('inicio-meditar').textContent = estado.vip ? `Auto: ${auto ? 'LIGADO' : 'DESLIGADO'}` : textoMeditar.replace('🧘 ', '');
  $('inicio-meditar').title = textoMeditar;
  $('opcao-auto').checked = estado.opcoes.autoAvancar;

  // Requisito de combate para romper o reino
  const requisito = P.requisitoDoRompimento(estado);
  let textoRequisito = '';
  if (requisito && !requisito.cumprido) {
    const chefe = chefeDoMapa(requisito.mapa - 1);
    textoRequisito = chefe
      ? `🔒 Para romper o reino, derrote o chefe do Mapa ${requisito.mapa}: ${chefe.inimigo.nome}.`
      : '🔒 O próximo reino será liberado no próximo mundo (em breve).';
  }
  $('cult-requisito').textContent = textoRequisito;
  $('inicio-requisito').textContent = textoRequisito;

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
    if (requisito && !requisito.cumprido) textoBotao = '🔒 Romper Reino';
    else textoBotao = rompimento ? '⚡ Romper Reino' : '⬆️ Avançar Estágio';
  }

  $('cult-proximo').textContent = proximo;
  $('inicio-proximo').textContent = proximo;
  $('cult-barra').style.width = largura;
  $('inicio-barra').style.width = largura;
  $('cult-progresso').textContent = progressoTexto;
  $('cult-tempo').textContent = tempo;
  $('cult-producao').textContent = `+${formatarNumero(producao)}/s`;
  $('inicio-tempo').textContent = tempo;

  for (const id of ['botao-avancar', 'inicio-avancar']) {
    const botao = $(id);
    // Os botões têm imagem (avançar / romper), então o texto vai sem o emoji.
    // v0.16.4: bloqueado NÃO é mais "disabled" — o toque mostra o motivo (dono achou que o botão
    // não funcionava, porque o toque num botão desativado não fazia nada)
    botao.textContent = textoBotao.replace(/^\S+\s/, '');
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
  const analise = analisarPoder(atributos);
  $('pers-poder').textContent = formatarNumero(analise.poder);
  // A explicação aparece ao passar o mouse (ou segurar o dedo) em cada caixinha
  $('pers-poder-detalhe').innerHTML =
    `<span class="parte-poder" title="Dano médio por golpe (Ataque + Crítico)">${icone('ofensa')} Ofensa <b>${formatarNumero(analise.ofensa)}</b></span>` +
    `<span class="parte-poder" title="Vida efetiva (Vitalidade + Defesa + Esquiva)">${icone('resistencia')} Resistência <b>${formatarNumero(analise.resistencia)}</b></span>`;
}

function atualizarNivel(estado) {
  const reino = P.reinoAtual(estado);
  const regiao = P.regiaoAtual(estado);

  // Personagem (tela inicial e painel)
  const personagem = personagemDe(estado);
  const classe = classeDe(estado);
  desenharPersonagem($('sprite'), reino.id, 'meditando', personagem);
  desenharPersonagem($('sprite-pers'), reino.id, 'meditando', personagem);
  $('inicio-nome').textContent = personagem.nome;
  $('pers-nome').textContent = personagem.nome;
  $('pers-classe').innerHTML = `${classe.nome} <span class="pers-classe-sexo">· ${personagem.sexo === 'feminino' ? '♀' : '♂'}</span>`;
  $('pers-classe-icone').src = `img/icones/classe_${classe.id}.png`;
  $('cb-nome-jogador').textContent = personagem.nome;
  $('pers-classe-cartao').innerHTML = `
    <div class="classe-topo">${icone('classe_' + classe.id, 'classe-icone')}<div><h3>${classe.nome}</h3><p>${classe.titulo}</p></div></div>
    <p class="especial-classe"><b>${classe.nomeEspecial}:</b> ${classe.textoEspecial}</p>
    ${classe.tecnica ? `<p class="especial-classe tecnica-classe">${icone('tecnica')} <span><b>${classe.tecnica.nome}:</b> ${classe.tecnica.texto}</span></p>` : ''}`;
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
    return chefe
      ? `🔒 Para romper o reino, derrote o chefe do Mapa ${requisito.mapa}: ${chefe.inimigo.nome}.`
      : '🔒 O próximo reino será liberado no próximo mundo (em breve).';
  }
  const falta = P.custoParaAvancar(estado) - estado.cultivo;
  const producao = P.producaoPorSegundo(estado);
  return `⏳ Falta ${formatarNumero(Math.ceil(falta))} de Cultivo (≈ ${formatarTempo(falta / producao)}).`;
}

// ---- Efeitos ----
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
