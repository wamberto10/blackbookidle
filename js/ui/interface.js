// =============================================================
// ui/interface.js — tela principal, barra de abas e painéis
// montarInterface   → roda uma vez: cria elementos e liga botões
// atualizarInterface → roda 10×/segundo: só atualiza textos
// As abas Combate e Mapa ficam em telaCombate.js e telaMapa.js
// =============================================================
import { CONFIG } from '../config.js';
import { REINOS, REGIOES } from '../dados/reinos.js';
import * as P from '../sistemas/progressao.js';
import { calcularAtributos, analisarPoder, ATRIBUTOS } from '../sistemas/atributos.js';
import { liberado } from '../sistemas/desbloqueios.js';
import { MUNDO, MAPAS, FASES, chefeDoMapa } from '../sistemas/mundo.js';
import { formatarNumero, formatarTempo, formatarAtributo } from '../format.js';
import { desenharPersonagem, icone, iconeDoMapa } from './sprite.js';
import { personagemDe, classeDe } from '../sistemas/personagem.js';
import { desenharFundo } from './fundo.js';
import { montarTelaCombate, atualizarTelaCombate } from './telaCombate.js';
import { montarTelaMapa, atualizarTelaMapa } from './telaMapa.js';
import { montarTelaBlackBook, atualizarTelaBlackBook } from './telaBlackBook.js';
import { montarTelaMochila, atualizarTelaMochila } from './telaMochila.js';
import { montarNucleos, atualizarNucleos } from './nucleos.js';

// Atalho para pegar elementos pelo id
const $ = (id) => document.getElementById(id);

const elementosAtributos = {};
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

  // ---- Lista de atributos (cria uma linha para cada) ----
  const lista = $('lista-atributos');
  const linhas = {};
  for (const atributo of ATRIBUTOS) {
    const linha = document.createElement('div');
    linha.className = 'atributo';
    linha.innerHTML = `<span>${icone(atributo.icone)} ${atributo.nome}</span><strong>0</strong>`;
    elementosAtributos[atributo.id] = linha.querySelector('strong');
    linhas[atributo.id] = linha;
    lista.appendChild(linha);
  }
  montarNucleos(acoes, linhas);   // botão "+" de Ataque, Vitalidade, Defesa e Velocidade

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
}

// ---- Fundo: paisagem do mapa atual (ou imagem própria do mundo) ----
function atualizarFundo(estado) {
  const indiceMapa = liberado(estado, 'combate') ? FASES[estado.combate.faseAtual].mapa : 0;
  const mapa = MAPAS[indiceMapa];

  if (fundoDesenhado === indiceMapa) return;
  fundoDesenhado = indiceMapa;
  $('inicio-local').innerHTML = `${MUNDO.nome} · ${iconeDoMapa(indiceMapa)} ${mapa.nome}`;

  if (MUNDO.imagemFundo) {
    $('fundo-imagem').style.backgroundImage = `url("${MUNDO.imagemFundo}")`;
    $('fundo-imagem').classList.remove('escondido');
    $('fundo-mundo').classList.add('escondido');
  } else {
    desenharFundo($('fundo-mundo'), mapa.cena, indiceMapa + 1);
  }
}

// ---- Cultivo: tela inicial e painel Cultivo ----
function atualizarCultivo(estado, producao) {
  const textoMeditar = `🧘 Meditar (+${formatarNumero(P.ganhoDaMeditacao(estado))})`;
  $('botao-meditar').textContent = textoMeditar;
  $('inicio-meditar').textContent = textoMeditar;
  $('opcao-auto').checked = estado.opcoes.autoAvancar;

  // Requisito de combate para romper o reino
  const requisito = P.requisitoDoRompimento(estado);
  let textoRequisito = '';
  if (requisito && !requisito.cumprido) {
    const chefe = chefeDoMapa(requisito.mapa - 1);
    textoRequisito = `🔒 Para romper o reino, derrote o chefe do Mapa ${requisito.mapa}: ${chefe.inimigo.nome}.`;
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
  $('inicio-tempo').textContent = tempo;

  for (const id of ['botao-avancar', 'inicio-avancar']) {
    const botao = $(id);
    botao.textContent = textoBotao;
    botao.classList.toggle('rompimento', rompimento);
    botao.disabled = !P.podeAvancar(estado);
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
  }
  atualizarNucleos(estado);
  const analise = analisarPoder(atributos);
  $('pers-poder').textContent = formatarNumero(analise.poder);
  // A explicação aparece ao passar o mouse (ou segurar o dedo) em cada caixinha
  $('pers-poder-detalhe').innerHTML =
    `<span class="parte-poder" title="Dano médio por golpe (Ataque + Crítico)">${icone('atr_ataque')} Ofensa <b>${formatarNumero(analise.ofensa)}</b></span>` +
    `<span class="parte-poder" title="Vida efetiva (Vitalidade + Defesa + Esquiva)">${icone('atr_vitalidade')} Resistência <b>${formatarNumero(analise.resistencia)}</b></span>`;
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
  $('pers-classe').textContent = `${classe.nome} · ${personagem.sexo === 'feminino' ? 'Feminino' : 'Masculino'}`;
  $('cb-nome-jogador').textContent = personagem.nome;
  $('pers-classe-cartao').innerHTML = `
    <h3>${classe.nome}</h3>
    <p>${classe.titulo}</p>
    <p class="especial-classe"><b>${classe.nomeEspecial}:</b> ${classe.textoEspecial}</p>`;
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

  // Caminho do Cultivo: concluídos, atual, próximo e ocultos (???)
  const lista = $('lista-caminho');
  lista.innerHTML = '';
  REINOS.forEach((r, indice) => {
    const item = document.createElement('li');
    let classe;
    let texto;

    if (indice < estado.reino) {
      classe = 'concluido';
      texto = `✔ ${r.nome}`;
    } else if (indice === estado.reino) {
      classe = 'atual';
      texto = `➤ ${r.nome} (${estado.estagio + 1}/${r.estagios.length})`;
    } else if (indice === estado.reino + 1) {
      classe = 'proximo';
      texto = `${r.nome}`;
    } else {
      classe = 'oculto';
      texto = '???';
    }

    item.className = classe;
    item.innerHTML = `<span>${texto}</span><small>${indice <= estado.reino + 1 ? REGIOES[r.regiao].nome : ''}</small>`;
    lista.appendChild(item);
  });
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
