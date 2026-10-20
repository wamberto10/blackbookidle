// =============================================================
// ui/telaMochila.js — aba Mochila (equipamentos e itens)
//
// v0.27.1: layout novo, igual ao mockup (docs/layout/layout_mochila.png), com as peças de img/ui/:
// - Em volta do personagem: os 10 espaços com os itens vestidos (moldura da raridade, +nível, "Nv." = mapa).
// - Detalhe do item: ícone, nome na cor da raridade, tier, estrelas, atributos com a diferença para o vestido,
//   caixa "Comparado com atual", descrição, cadeado (travar) e os botões Equipar / Melhorar / Mesclar / Desmanchar.
// - Embaixo: ações, automáticos, filtros e a grade. Itens iguais (mesmo tipo, tier e grau ★) ficam EMPILHADOS.
// =============================================================
import { CONFIG } from '../config.js';
import { SLOTS, RARIDADES } from '../dados/equipamentos.js';
import { liberado } from '../sistemas/desbloqueios.js';
import { calcularAtributos, poderTotal } from '../sistemas/atributos.js';
import * as P from '../sistemas/progressao.js';
import { obterFase, mapaDesenhado } from '../sistemas/mundo.js';
import { mapaDaFase, nomeDaPosicao } from '../sistemas/escala.js';
import * as EQ from '../sistemas/equipamentos.js';
import { RARIDADE_POR_ID, SLOT_POR_ID, nomeDoItem, atributosDoItem, nivelMaximo, custoMelhoria, pedrasAoDesmanchar, grauDe, estrelas, proximoDaMescla } from '../sistemas/itens.js';
import { formatarNumero } from '../format.js';
import { subtrair, multiplicar, maior, maiorOuIgual, menorOuIgual, maximo, ehZero } from '../numeros.js';
import { personagemDe, classeDe } from '../sistemas/personagem.js';
import { desenharPersonagem, icone, iconeEquipamento } from './sprite.js';

const $ = (id) => document.getElementById(id);

// Atributos dos itens: nome curto e ícone (img/ui/)
const ATRIB = {
  ataque: { nome: 'ATQ', icone: 'icone_atq' },
  vitalidade: { nome: 'HP', icone: 'icone_hp' },
  defesa: { nome: 'DEF', icone: 'icone_def' },
  critico: { nome: 'Taxa Crítica', icone: 'icone_crit' },
  danoCritico: { nome: 'Dano Crítico', icone: 'icone_dano_crit' },
  velocidade: { nome: 'Velocidade', icone: 'icone_velocidade' },
  esquiva: { nome: 'Esquiva', icone: 'icone_esquiva' },
  cultivo: { nome: 'Cultivo', icone: 'icone_cultivo_peq' },
};

// Descrição curta de cada tipo de item (no mockup, embaixo dos atributos)
const DESCRICAO = {
  elmo: 'Forjado para proteger a mente do cultivador nas batalhas mais duras.',
  colar: 'O pingente guarda um fio de Qi antigo que afia cada golpe.',
  ombreiras: 'Placas pesadas que seguram golpes que quebrariam montanhas.',
  capa: 'Leve como névoa: desvia golpes e acompanha o vento.',
  peitoral: 'A armadura do tronco, onde o Qi do cultivador circula.',
  luvas: 'Punhos protegidos, golpes certeiros e críticos devastadores.',
  calcas: 'Firmam a base do cultivador — e uma base firme não cai.',
  botas: 'Passos rápidos como relâmpago e difíceis de acompanhar.',
  anel: 'Um anel de Qi concentrado que reforça o ataque.',
  berloque: 'Uma cabaça encantada que também ajuda o cultivo.',
};

let acoesGuardadas = null;
let ultimoEstado = null;
// O que está aberto nos detalhes:
//   { tipo: 'vestido', id }  ou  { tipo: 'pilha', slot, raridade, grau }  ou  null
// (undefined = ainda não abriu a Mochila: começa mostrando o primeiro item vestido, como no mockup)
let selecionado;
let filtroTipo = 'todos';   // 'todos' ou o id de um espaço (ex.: 'elmo')
let chaveDesenhada = '';
let reinoDesenhado = null;

const imgUi = (nome, classe = '') => `<img class="${classe}" src="img/ui/${nome}.png" alt="">`;
const iconeItem = (slotId, classe = 'item-ic') => imgUi(`item_${slotId}`, classe);
// "Nv." do item = mapa GLOBAL onde caiu (define a força dele). v0.32.0: Nv.97 = Normal, Mapa 1
const nivelDoItem = (item) => mapaDaFase(item.fase) + 1;
const estrelasImg = (grau) => Array.from({ length: CONFIG.equipamentos.graus },
  (_, i) => imgUi(i < grau ? 'icone_estrela' : 'icone_estrela_vazia', 'moch-estrela')).join('');

export function montarTelaMochila(acoes) {
  acoesGuardadas = acoes;
  $('opcao-auto-equipar').addEventListener('change', (e) => acoes.aoMudarAutoEquipar(e.target.checked));
  $('opcao-mescla-auto').addEventListener('change', (e) => acoes.aoMudarMochilaAuto('mesclaAuto', e.target.checked));
  $('opcao-desmanche-auto').addEventListener('change', (e) => acoes.aoMudarMochilaAuto('desmancheAuto', e.target.checked));
  $('mesclar-tudo').addEventListener('click', () => acoes.aoMesclarTudo());
  $('desmanchar-obsoletos').addEventListener('click', () => acoes.aoDesmancharObsoletos());
  $('desmanchar-comuns').addEventListener('click', () => acoes.aoDesmancharAteTier(0));
  $('desmanchar-incomuns').addEventListener('click', () => acoes.aoDesmancharAteTier(1));
}

function redesenharAgora() {
  chaveDesenhada = '';
  if (ultimoEstado) atualizarTelaMochila(ultimoEstado);
}

function mesmoSelecionado(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function selecionar(alvo) {
  selecionado = mesmoSelecionado(selecionado, alvo) ? null : alvo;
  redesenharAgora();
  // O detalhe fica acima da grade: rola SÓ o painel até ele, para não precisar procurar.
  // (scrollIntoView rolava também a moldura do jogo e a tela ficava vazia.)
  if (selecionado) {
    const detalhe = $('item-detalhe');
    let rolavel = detalhe.parentElement;
    while (rolavel && !(rolavel.scrollHeight > rolavel.clientHeight && /auto|scroll/.test(getComputedStyle(rolavel).overflowY))) {
      rolavel = rolavel.parentElement;
    }
    if (!rolavel) return;
    const distancia = detalhe.getBoundingClientRect().top - rolavel.getBoundingClientRect().top;
    if (distancia < 0) rolavel.scrollTo({ top: rolavel.scrollTop + distancia - 8, behavior: 'smooth' });
  }
}

// Valor de um atributo como texto: "12.0%" ou "1.85K%".
// v0.32.0: todos os atributos dos itens são %: Ataque, HP, Defesa e Velocidade multiplicam o cultivo
// (+30% ATQ = Ataque do cultivo × 1,3, somando os itens); Crítico, Dano Crítico, Esquiva e Cultivo somam pontos.
function textoDoValor(atributo, valor) {
  return typeof valor === 'number' && valor < 1000 ? `${valor.toFixed(1)}%` : `${formatarNumero(valor)}%`;
}

const absoluto = (valor) => maior(valor, 0) ? valor : multiplicar(valor, -1);
const diferencaPequena = (diferenca, novo, atual) =>
  menorOuIgual(absoluto(diferenca), multiplicar(maximo(absoluto(novo), absoluto(atual)), 0.005));

function ondeCaiu(item) {
  return `${nomeDaPosicao(mapaDaFase(item.fase))}, Fase ${obterFase(item.fase).numero}`;
}

export function atualizarTelaMochila(estado) {
  ultimoEstado = estado;
  const aberta = liberado(estado, 'mochila');
  $('mochila-bloqueado').classList.toggle('escondido', aberta);
  $('mochila-conteudo').classList.toggle('escondido', !aberta);
  if (!aberta) return;

  $('mochila-poder').textContent = formatarNumero(poderTotal(calcularAtributos(estado)));
  for (const [id, ligado] of [['opcao-auto-equipar', estado.opcoes.autoEquipar], ['opcao-mescla-auto', estado.opcoes.mesclaAuto],
    ['opcao-desmanche-auto', estado.opcoes.desmancheAuto]]) {
    $(id).checked = ligado;
    const chip = $(id).parentElement;
    chip.classList.toggle('ui-chip-auto-ativo', ligado);
    chip.classList.toggle('ui-chip-auto', !ligado);
  }

  const aparencia = `${estado.reino}|${JSON.stringify(personagemDe(estado))}`;
  if (reinoDesenhado !== aparencia) {
    reinoDesenhado = aparencia;
    desenharPersonagem($('mochila-sprite'), P.reinoAtual(estado).id, 'combate', personagemDe(estado));
    // Miniatura chibi do herói (img/ui/mochila_heroi_<sexo>_<classe>.png); sem ela, fica o sprite de batalha
    const imagem = $('mochila-heroi-img');
    imagem.onload = () => { imagem.classList.remove('escondido'); $('mochila-sprite').classList.add('escondido'); };
    imagem.onerror = () => { imagem.classList.add('escondido'); $('mochila-sprite').classList.remove('escondido'); };
    imagem.src = `img/ui/mochila_heroi_${personagemDe(estado).sexo}_${classeDe(estado).id}.png`;
  }

  if (selecionado === undefined) {
    const primeiro = SLOTS.map(s => estado.equipados[s.id]).find(Boolean);
    selecionado = primeiro ? { tipo: 'vestido', id: primeiro.id } : null;
  }

  // Se o que estava aberto sumiu (desmanchado, mesclado, reencarnou...), fecha os detalhes
  if (selecionado?.tipo === 'vestido' && !EQ.buscarItem(estado, selecionado.id)) selecionado = null;
  if (selecionado?.tipo === 'pilha' && !EQ.buscarPilha(estado, selecionado.slot, selecionado.raridade, selecionado.grau)) selecionado = null;

  // Só redesenha quando algo mudou nos itens (economiza processamento)
  const vestidoAberto = selecionado?.tipo === 'vestido' ? EQ.buscarItem(estado, selecionado.id) : null;
  const chave = [
    Object.values(estado.equipados).map(i => i ? `${i.id}.${i.nivel}.${i.travado ? 1 : 0}` : '-').join(','),
    estado.mochila.map(i => `${i.id}${i.travado ? 't' : ''}`).join(','),
    JSON.stringify(selecionado),
    vestidoAberto ? EQ.podeMelhorar(estado, vestidoAberto) : '',
    mapaDaFase(estado.combate.faseAtual),
    filtroTipo,
    `${estado.opcoes.mesclaAuto}${estado.opcoes.desmancheAuto}`,   // v0.26.1: mostra/esconde os botões manuais
  ].join('|');
  if (chave === chaveDesenhada) return;
  chaveDesenhada = chave;

  $('mochila-contagem').textContent = `(${estado.mochila.length})`;
  $('mesclar-tudo').disabled = !EQ.temAlgoParaMesclar(estado);
  // v0.26.1: com o automático ligado o botão manual sobra (a mochila já se organiza a cada item que cai)
  $('mesclar-tudo').classList.toggle('escondido', estado.opcoes.mesclaAuto);
  $('desmanchar-obsoletos').classList.toggle('escondido', estado.opcoes.desmancheAuto);
  const quantosObsoletos = EQ.obsoletos(estado).itens.length;
  const textoObs = `${imgUi('icone_desmanchar')} Obsoletos (${quantosObsoletos})`;
  if ($('desmanchar-obsoletos').dataset.html !== textoObs) { $('desmanchar-obsoletos').dataset.html = textoObs; $('desmanchar-obsoletos').innerHTML = textoObs; }
  $('desmanchar-obsoletos').disabled = quantosObsoletos === 0;

  // Espaços com algo melhor guardado na mochila (bolinha vermelha no espaço, como no mockup)
  const melhoraveis = new Set(EQ.pilhas(estado).filter(p => maior(EQ.ganhoDePoder(estado, EQ.melhorDaPilha(estado, p)), 0)).map(p => p.slot));
  desenharEspacos(estado, melhoraveis);
  desenharDetalhe(estado);
  desenharFiltros(estado);
  desenharGrade(estado);
  desenharChances(estado);
}

// ---- Os 10 espaços ao redor do personagem ----
function desenharEspacos(estado, melhoraveis) {
  const mapaAtual = mapaDaFase(estado.combate.faseAtual);
  for (const lado of ['esquerda', 'direita']) {
    const coluna = $(`slots-${lado}`);
    coluna.innerHTML = '';
    for (const slot of SLOTS.filter(s => s.lado === lado)) {
      const item = estado.equipados[slot.id];
      const botao = document.createElement('button');
      botao.className = 'ui moch-slot';
      if (item) {
        if (mesmoSelecionado(selecionado, { tipo: 'vestido', id: item.id })) botao.classList.add('selecionado');
        botao.innerHTML = `<span class="moch-moldura moldura-${item.raridade}">${iconeItem(slot.id)}
            ${item.nivel > 0 ? `<span class="moch-mais">+${item.nivel}</span>` : ''}
            <span class="moch-nv">Nv.${nivelDoItem(item)}</span>
            ${melhoraveis.has(slot.id) ? '<span class="moch-ponto"></span>' : ''}
            ${item.travado ? imgUi('botao_cadeado', 'moch-travado') : ''}</span>
          <span class="moch-slot-nome">${slot.nome}</span>`;
        botao.title = `${nomeDoItem(item)}${item.nivel > 0 ? ` +${item.nivel}` : ''}`;
        botao.addEventListener('click', () => selecionar({ tipo: 'vestido', id: item.id }));
      } else {
        botao.classList.add('vazio');
        const aviso = slot.mapaMinimo > mapaAtual + 1 ? `Mapa ${slot.mapaMinimo}` : 'Vazio';
        botao.innerHTML = `<span class="moch-moldura moldura-comum">${iconeItem(slot.id, 'item-ic fantasma')}
            ${melhoraveis.has(slot.id) ? '<span class="moch-ponto"></span>' : ''}</span>
          <span class="moch-slot-nome">${slot.nome}<small>${aviso}</small></span>`;
        botao.disabled = true;
      }
      coluna.appendChild(botao);
    }
  }
}

// ---- Abas por tipo de item (Todos, Elmo, Colar...) ----
function desenharFiltros(estado) {
  const caixa = $('filtros-itens');
  caixa.innerHTML = '';
  const opcoes = [{ id: 'todos', nome: 'Todos' }, ...SLOTS];
  for (const opcao of opcoes) {
    const quantidade = opcao.id === 'todos'
      ? estado.mochila.length
      : estado.mochila.filter(i => i.slot === opcao.id).length;
    const ativo = filtroTipo === opcao.id;
    const botao = document.createElement('button');
    botao.className = `ui moch-filtro ${ativo ? 'ui-botao-escuro-ativo ativo' : 'ui-botao-escuro'}`;
    botao.title = `${opcao.nome} (${quantidade})`;
    if (quantidade === 0 && opcao.id !== 'todos') botao.classList.add('vazio');
    botao.innerHTML = `${opcao.id === 'todos' ? imgUi('icone_todos', 'moch-filtro-ic') : iconeItem(opcao.id, 'moch-filtro-ic')}
      <span>${opcao.nome}<small>(${quantidade})</small></span>`;
    botao.addEventListener('click', () => { filtroTipo = opcao.id; redesenharAgora(); });
    caixa.appendChild(botao);
  }
}

// ---- Itens guardados, em pilhas ----
function desenharGrade(estado) {
  const grade = $('grade-itens');
  grade.innerHTML = '';
  // Do tier mais alto para o mais baixo; dentro do tier, do grau mais alto para o mais baixo
  const nivelDaPilha = (p) => RARIDADES.findIndex(r => r.id === p.raridade) * 10 + p.grau;
  const lista = EQ.pilhas(estado)
    .filter(p => filtroTipo === 'todos' || p.slot === filtroTipo)
    .sort((a, b) => nivelDaPilha(b) - nivelDaPilha(a));

  for (const pilha of lista) {
    const alvo = { tipo: 'pilha', slot: pilha.slot, raridade: pilha.raridade, grau: pilha.grau };
    const botao = document.createElement('button');
    botao.className = `ui moch-celula moldura-${pilha.raridade}`;
    if (mesmoSelecionado(selecionado, alvo)) botao.classList.add('selecionado');
    // Seta verde: o melhor item da pilha já aumentaria o Poder Total; amarela: aumentaria se melhorado ao máximo
    const melhorItem = EQ.melhorDaPilha(estado, pilha);
    const melhor = maior(EQ.ganhoDePoder(estado, melhorItem), 0);
    const potencial = !melhor && maior(EQ.ganhoNoNivelMaximo(estado, melhorItem), 0);
    const podeMesclar = EQ.podeMesclar(estado, pilha.slot, pilha.raridade, pilha.grau);
    botao.innerHTML = `${iconeItem(pilha.slot)}
      ${pilha.itens.length > 1 ? `<span class="moch-qtd${podeMesclar ? ' pode-mesclar' : ''}">×${pilha.itens.length}</span>` : ''}
      ${melhor ? imgUi('icone_seta_verde', 'moch-seta') : ''}
      ${potencial ? imgUi('icone_seta_verde', 'moch-seta potencial') : ''}
      ${pilha.itens.some(i => i.travado) ? imgUi('botao_cadeado', 'moch-travado') : ''}
      <span class="moch-nv">Nv.${nivelDoItem(melhorItem)}</span>
      <span class="moch-estrelas">${estrelasImg(pilha.grau)}</span>`;
    botao.title = `${SLOT_POR_ID[pilha.slot].nome} ${RARIDADE_POR_ID[pilha.raridade].nome} ${estrelas(pilha.grau)} × ${pilha.itens.length}`;
    botao.addEventListener('click', () => selecionar(alvo));
    grade.appendChild(botao);
  }

  if (lista.length === 0) {
    grade.innerHTML = `<p class="pequeno">${filtroTipo === 'todos' ? 'Nenhum item guardado.' : 'Nenhum item deste tipo guardado.'}</p>`;
  }
}

// ---- Detalhes ----
// Atributos do item com a diferença para o vestido (verde = ganha, vermelho = perde)
function listaDeAtributos(item, vestido) {
  const novo = atributosDoItem(item);
  const atual = vestido ? atributosDoItem(vestido) : null;
  const chaves = [...new Set([...Object.keys(novo), ...Object.keys(atual ?? {})])];
  return chaves.map((a) => {
    const v = novo[a] ?? 0;
    let dif = '';
    if (atual) {
      const d = subtrair(v, atual[a] ?? 0);
      const quase = diferencaPequena(d, v, atual[a] ?? 0);
      const melhora = maior(d, 0);
      if (!quase) dif = `<em class="${melhora ? 'melhor' : 'pior'}">${imgUi('icone_seta_verde', `moch-seta-p${melhora ? '' : ' baixo'}`)}(${melhora ? '+' : '−'}${textoDoValor(a, absoluto(d))})</em>`;
    }
    const info = ATRIB[a] ?? { nome: a, icone: 'icone_atq' };
    return `<li>${imgUi(info.icone, 'moch-stat-ic')}<span>${info.nome}</span><b>${!ehZero(v) ? textoDoValor(a, v) : '—'}</b>${dif}</li>`;
  }).join('');
}

// Caixa "Comparado com atual": diferença atributo a atributo e no Poder Total
function caixaDeComparacao(estado, item, vestido, ganho) {
  if (!vestido) {
    return `<div class="moch-comparacao ui-caixa-comparacao"><div class="moch-comp-titulo">Espaço vazio:</div>
      <div class="melhor">Poder Total +${formatarNumero(absoluto(ganho))}</div></div>`;
  }
  const novo = atributosDoItem(item);
  const atual = atributosDoItem(vestido);
  const linhas = [...new Set([...Object.keys(novo), ...Object.keys(atual)])].map((a) => {
    const d = subtrair(novo[a] ?? 0, atual[a] ?? 0);
    if (diferencaPequena(d, novo[a] ?? 0, atual[a] ?? 0)) return '';
    const melhora = maior(d, 0);
    const info = ATRIB[a] ?? { nome: a };
    return `<li class="${melhora ? 'melhor' : 'pior'}">${imgUi('icone_seta_verde', `moch-seta-p${melhora ? '' : ' baixo'}`)}<span>${info.nome}</span><b>${melhora ? '+' : '−'}${textoDoValor(a, absoluto(d))}</b></li>`;
  }).join('');
  return `<div class="moch-comparacao ui-caixa-comparacao">
      <div class="moch-comp-titulo">Comparado com atual:</div>
      <ul>${linhas || '<li class="igual"><span>Atributos iguais</span></li>'}</ul>
      <div class="moch-comp-poder ${maior(ganho, 0) ? 'melhor' : 'pior'}">Poder ${maiorOuIgual(ganho, 0) ? '+' : '−'}${formatarNumero(absoluto(ganho))}</div>
    </div>`;
}

function desenharDetalhe(estado) {
  const caixa = $('item-detalhe');
  caixa.classList.toggle('escondido', !selecionado);
  if (!selecionado) return;
  if (selecionado.tipo === 'vestido') desenharDetalheVestido(estado, caixa);
  else desenharDetalhePilha(estado, caixa);
  caixa.insertAdjacentHTML('afterbegin', '<div class="moch-det-moldura ui-painel-moldura"></div>');   // moldura atrás do conteúdo
}

// Parte de cima do detalhe (igual para vestido e pilha)
function topoDoDetalhe(item, raridade, etiqueta, quantidade, travado) {
  return `<div class="moch-det-topo">
      <div class="moch-det-icone moldura-${raridade.id}">${iconeItem(item.slot)}${quantidade > 1 ? `<span class="moch-qtd">×${quantidade}</span>` : ''}</div>
      <div class="moch-det-info">
        <div class="moch-det-nome" style="color:${raridade.cor}">${SLOT_POR_ID[item.slot].nome} ${raridade.material}${item.nivel > 0 ? ` +${item.nivel}` : ''}</div>
        <div class="moch-det-linha"><span class="moch-tier" style="color:${raridade.cor};border-color:${raridade.cor}">${raridade.tier}</span>
          <span class="moch-estrelas grande">${estrelasImg(grauDe(item))}</span><span class="moch-det-nv">Nv. ${nivelDoItem(item)}</span></div>
      </div>
      <div class="moch-det-cantos">
        <span class="moch-etiqueta ui-etiqueta-moldura">${etiqueta}</span>
        <button class="botao-icone moch-cadeado${travado ? ' ativo' : ''}" id="detalhe-travar" title="${travado ? 'Travado: não é desmanchado nem mesclado. Toque para destravar.' : 'Travar: protege o item dos desmanches e das mesclas.'}">${imgUi('botao_cadeado')}</button>
      </div>
    </div>`;
}

const botao = (id, cor, iconeNome, texto, ativo = true, titulo = '', ponto = false) =>
  `<button id="${id}" class="ui ui-botao-${cor} moch-botao${ponto ? ' com-ponto' : ''}" ${ativo ? '' : 'disabled'} title="${titulo}">${imgUi(iconeNome)}<span>${texto}</span></button>`;

// Item vestido: Tirar ou Melhorar
function desenharDetalheVestido(estado, caixa) {
  const item = EQ.buscarItem(estado, selecionado.id);
  const raridade = RARIDADE_POR_ID[item.raridade];
  const noMaximo = item.nivel >= nivelMaximo(item);
  const podeMelhorar = !noMaximo && EQ.podeMelhorar(estado, item);
  caixa.innerHTML = `${topoDoDetalhe(item, raridade, 'Equipado', 1, item.travado)}
    <div class="moch-det-meio">
      <ul class="moch-stats">${listaDeAtributos(item, null)}</ul>
      <div class="moch-comparacao ui-caixa-comparacao">
        <div class="moch-comp-titulo">Poder do item:</div>
        <div class="moch-comp-poder melhor">+${formatarNumero(EQ.poderDoItem(estado, item))}</div>
        <div class="moch-comp-titulo">Nível ${item.nivel}/${nivelMaximo(item)}</div>
        ${noMaximo ? '' : `<div class="pequeno">Melhorar: ${formatarNumero(custoMelhoria(item))} ${icone('pedra')}</div>`}
      </div>
    </div>
    <p class="moch-desc">${DESCRICAO[item.slot] ?? ''} <span>Caiu em: ${ondeCaiu(item)}.</span></p>
    <div class="moch-det-botoes">
      ${botao('detalhe-remover', 'dourado', 'icone_equipar', 'Tirar')}
      ${botao('detalhe-melhorar', 'verde', 'icone_melhorar', noMaximo ? 'Máximo' : 'Melhorar', podeMelhorar,
        noMaximo ? 'Nível máximo' : `Custa ${formatarNumero(custoMelhoria(item))} Pedras`, podeMelhorar)}
      ${botao('detalhe-mesclar', 'roxo', 'icone_mesclar', 'Mesclar', false, 'Só itens guardados na mochila se mesclam')}
      ${botao('detalhe-desmanchar', 'vermelho', 'icone_desmanchar', 'Desmanchar', false, 'Tire o item antes de desmanchar')}
    </div>`;
  $('detalhe-remover').addEventListener('click', () => acoesGuardadas.aoRemoverItem(item.slot));
  $('detalhe-melhorar').addEventListener('click', () => acoesGuardadas.aoMelhorarItem(item.id));
  $('detalhe-travar').addEventListener('click', () => acoesGuardadas.aoTravarItens([item.id], !item.travado));
}

// Pilha guardada: Equipar, Desmanchar ou Mesclar
function desenharDetalhePilha(estado, caixa) {
  const pilha = EQ.buscarPilha(estado, selecionado.slot, selecionado.raridade, selecionado.grau);
  const raridade = RARIDADE_POR_ID[pilha.raridade];
  const proxima = proximoDaMescla(pilha.raridade, pilha.grau);   // { raridade, grau } ou null
  const melhor = EQ.melhorDaPilha(estado, pilha);
  const fraco = EQ.maisFracoDaPilha(estado, pilha);              // null = todos travados
  const quantidade = pilha.itens.length;
  const necessarios = CONFIG.equipamentos.itensParaMesclar;
  const livres = pilha.itens.filter(EQ.livre).length;
  const travada = pilha.itens.every(i => i.travado);
  const ganho = EQ.ganhoDePoder(estado, melhor);
  const atual = estado.equipados[pilha.slot];
  const podeMesclar = EQ.podeMesclar(estado, pilha.slot, pilha.raridade, pilha.grau);
  const tituloMesclar = !proxima ? `${estrelas(5)}: grau máximo`
    : `${Math.min(livres, necessarios)}/${necessarios} → ${proxima.raridade.nome} ${estrelas(proxima.grau)}`;

  caixa.innerHTML = `${topoDoDetalhe(melhor, raridade, quantidade > 1 ? `Na mochila (${quantidade})` : 'Na mochila', quantidade, travada)}
    <div class="moch-det-meio">
      <ul class="moch-stats">${listaDeAtributos(melhor, atual)}</ul>
      ${caixaDeComparacao(estado, melhor, atual, ganho)}
    </div>
    <p class="moch-desc">${DESCRICAO[pilha.slot] ?? ''} <span>${quantidade > 1 ? 'Mostrando o melhor da pilha. ' : ''}Caiu em: ${ondeCaiu(melhor)}.</span></p>
    <div class="moch-det-botoes">
      ${botao('detalhe-vestir', 'dourado', 'icone_equipar', 'Equipar')}
      ${botao('detalhe-melhorar', 'verde', 'icone_melhorar', 'Melhorar', false, 'Vista o item para melhorar com Pedras')}
      ${botao('detalhe-mesclar', 'roxo', 'icone_mesclar', 'Mesclar', podeMesclar, tituloMesclar)}
      ${botao('detalhe-desmanchar', 'vermelho', 'icone_desmanchar', 'Desmanchar', Boolean(fraco),
        fraco ? `Desmanchar 1: +${formatarNumero(pedrasAoDesmanchar(fraco))} Pedras` : 'Item travado')}
    </div>
    <div class="moch-det-extra">
      ${proxima ? `<span>Mesclar: ${tituloMesclar}</span>` : `<span>${estrelas(5)} — grau máximo</span>`}
      ${livres > 1 ? '<button class="botao-icone moch-link" id="detalhe-desmanchar-todos">Desmanchar a pilha toda</button>' : ''}
    </div>`;

  $('detalhe-vestir').addEventListener('click', () => acoesGuardadas.aoEquiparItem(melhor.id));
  if (fraco) $('detalhe-desmanchar').addEventListener('click', () => acoesGuardadas.aoDesmancharItem(fraco.id));
  $('detalhe-mesclar').addEventListener('click', () => acoesGuardadas.aoMesclar(pilha.slot, pilha.raridade, pilha.grau));
  $('detalhe-desmanchar-todos')?.addEventListener('click', () => acoesGuardadas.aoDesmancharPilha(pilha.slot, pilha.raridade, pilha.grau));
  $('detalhe-travar').addEventListener('click', () => acoesGuardadas.aoTravarItens(pilha.itens.map(i => i.id), !travada));
}

// ---- Chances de drop no mapa atual ----
function desenharChances(estado) {
  const indiceMapa = mapaDaFase(estado.combate.faseAtual);
  const pesos = EQ.pesosDosTiers(indiceMapa, 'comum', estado.vip);
  const total = pesos.reduce((a, b) => a + b, 0);
  const tiers = RARIDADES.map((r, i) => r.exclusivo ? '' :
    `<span class="chance" style="color:${r.cor}">${r.tier} ${r.nome}: <b>${(pesos[i] / total * 100).toFixed(1)}%</b></span>`).join('');
  const espacos = EQ.espacosLiberados(indiceMapa).map(s => iconeEquipamento(s.id, 'comum', 'icone-chance')).join('');
  const proximo = SLOTS.filter(s => s.mapaMinimo > indiceMapa + 1).sort((a, b) => a.mapaMinimo - b.mapaMinimo)[0];
  $('chances-drop').innerHTML = `
    <p class="pequeno">${mapaDesenhado(indiceMapa).nome} (${nomeDaPosicao(indiceMapa)}) — quando um item cai, o tier é sorteado assim
      (chefes aumentam as chances de Raro ou melhor):</p>
    <div class="lista-chances">${tiers}</div>
    <p class="pequeno">Grau ao cair: ${CONFIG.equipamentos.pesosGrauAoCair
      .map((p, i) => p > 0 ? `${estrelas(i + 1)} ${p}%` : '').filter(Boolean).join(' · ')}.
      Mesclar: ${CONFIG.equipamentos.itensParaMesclar} iguais → grau seguinte, até ${estrelas(5)} (o tier não muda).</p>
    <p class="pequeno">Itens que caem aqui: ${espacos}</p>
    ${proximo ? `<p class="pequeno">Próximo tipo de item: <b>${proximo.nome}</b>, a partir do Mapa ${proximo.mapaMinimo}.</p>` : ''}`;
}
