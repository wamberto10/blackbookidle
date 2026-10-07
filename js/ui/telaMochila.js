// =============================================================
// ui/telaMochila.js — aba Mochila (equipamentos e itens)
//
// - Em volta do personagem: os 10 espaços com os itens vestidos.
// - Embaixo: os itens guardados. Itens iguais (mesmo tipo, tier e grau ★)
//   aparecem EMPILHADOS, com a quantidade no canto.
// - Clicar numa pilha: Equipar, Desmanchar ou Mesclar.
// - Clicar num item vestido: Tirar ou Melhorar (com Pedras).
// =============================================================
import { CONFIG } from '../config.js';
import { SLOTS, RARIDADES, ATRIBUTOS_EM_PORCENTO, NOMES_DOS_ATRIBUTOS } from '../dados/equipamentos.js';
import { liberado } from '../sistemas/desbloqueios.js';
import { calcularAtributos, poderTotal } from '../sistemas/atributos.js';
import * as P from '../sistemas/progressao.js';
import { FASES, MAPAS } from '../sistemas/mundo.js';
import * as EQ from '../sistemas/equipamentos.js';
import { RARIDADE_POR_ID, SLOT_POR_ID, nomeDoItem, atributosDoItem, nivelMaximo, custoMelhoria, pedrasAoDesmanchar, grauDe, estrelas, proximoDaMescla } from '../sistemas/itens.js';
import { formatarNumero } from '../format.js';
import { personagemDe } from '../sistemas/personagem.js';
import { desenharPersonagem, icone, iconeEquipamento } from './sprite.js';

const $ = (id) => document.getElementById(id);

let acoesGuardadas = null;
let ultimoEstado = null;
// O que está aberto nos detalhes:
//   { tipo: 'vestido', id }  ou  { tipo: 'pilha', slot, raridade, grau }  ou  null
let selecionado = null;
let filtroTipo = 'todos';   // 'todos' ou o id de um espaço (ex.: 'elmo')
let chaveDesenhada = '';
let reinoDesenhado = null;

export function montarTelaMochila(acoes) {
  acoesGuardadas = acoes;
  $('opcao-auto-equipar').addEventListener('change', (e) => acoes.aoMudarAutoEquipar(e.target.checked));
  $('mesclar-tudo').addEventListener('click', () => acoes.aoMesclarTudo());
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
}

// Valor de um atributo como texto: "+123" ou "+1.5%"
function textoDoAtributo(atributo, valor) {
  return ATRIBUTOS_EM_PORCENTO.includes(atributo) ? `+${valor.toFixed(1)}%` : `+${formatarNumero(valor)}`;
}

function ondeCaiu(item) {
  const fase = FASES[item.fase];
  return `Mapa ${fase.mapa + 1}, Fase ${fase.numero}`;
}

export function atualizarTelaMochila(estado) {
  ultimoEstado = estado;
  const aberta = liberado(estado, 'mochila');
  $('mochila-bloqueado').classList.toggle('escondido', aberta);
  $('mochila-conteudo').classList.toggle('escondido', !aberta);
  if (!aberta) return;

  $('mochila-pedras').textContent = formatarNumero(Math.floor(estado.pedras));
  $('mochila-poder').textContent = formatarNumero(poderTotal(calcularAtributos(estado)));
  $('opcao-auto-equipar').checked = estado.opcoes.autoEquipar;

  const aparencia = `${estado.reino}|${JSON.stringify(personagemDe(estado))}`;
  if (reinoDesenhado !== aparencia) {
    reinoDesenhado = aparencia;
    desenharPersonagem($('mochila-sprite'), P.reinoAtual(estado).id, 'combate', personagemDe(estado));
  }

  // Se o que estava aberto sumiu (desmanchado, mesclado, reencarnou...), fecha os detalhes
  if (selecionado?.tipo === 'vestido' && !EQ.buscarItem(estado, selecionado.id)) selecionado = null;
  if (selecionado?.tipo === 'pilha' && !EQ.buscarPilha(estado, selecionado.slot, selecionado.raridade, selecionado.grau)) selecionado = null;

  // Só redesenha quando algo mudou nos itens (economiza processamento)
  const vestidoAberto = selecionado?.tipo === 'vestido' ? EQ.buscarItem(estado, selecionado.id) : null;
  const chave = [
    Object.values(estado.equipados).map(i => i ? `${i.id}.${i.nivel}` : '-').join(','),
    estado.mochila.map(i => i.id).join(','),
    JSON.stringify(selecionado),
    vestidoAberto ? EQ.podeMelhorar(estado, vestidoAberto) : '',
    FASES[estado.combate.faseAtual].mapa,
    filtroTipo,
  ].join('|');
  if (chave === chaveDesenhada) return;
  chaveDesenhada = chave;

  $('mochila-contagem').textContent = `(${estado.mochila.length}/${CONFIG.equipamentos.capacidadeMochila})`;
  $('mesclar-tudo').disabled = !EQ.temAlgoParaMesclar(estado);
  desenharEspacos(estado);
  desenharDetalhe(estado);
  desenharFiltros(estado);
  desenharGrade(estado);
  desenharChances(estado);
}

// ---- Os 10 espaços ao redor do personagem ----
function desenharEspacos(estado) {
  const mapaAtual = FASES[estado.combate.faseAtual].mapa;
  for (const lado of ['esquerda', 'direita']) {
    const coluna = $(`slots-${lado}`);
    coluna.innerHTML = '';
    for (const slot of SLOTS.filter(s => s.lado === lado)) {
      const item = estado.equipados[slot.id];
      const botao = document.createElement('button');
      botao.className = 'slot-item';
      if (item) {
        botao.classList.add('raridade-' + item.raridade);
        if (mesmoSelecionado(selecionado, { tipo: 'vestido', id: item.id })) botao.classList.add('selecionado');
        botao.innerHTML = `${iconeEquipamento(item.slot, item.raridade)}
          <span class="slot-nome">${slot.nome}</span>
          <span class="item-grau">${estrelas(grauDe(item))}</span>
          ${item.nivel > 0 ? `<span class="item-nivel">+${item.nivel}</span>` : ''}`;
        botao.addEventListener('click', () => selecionar({ tipo: 'vestido', id: item.id }));
      } else {
        botao.classList.add('vazio');
        const aviso = slot.mapaMinimo > mapaAtual + 1 ? `Mapa ${slot.mapaMinimo}` : 'Vazio';
        botao.innerHTML = `${iconeEquipamento(slot.id, 'comum', 'fantasma')}
          <span class="slot-nome">${slot.nome}</span><span class="slot-aviso">${aviso}</span>`;
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
    const botao = document.createElement('button');
    botao.className = 'filtro' + (filtroTipo === opcao.id ? ' ativo' : '');
    if (quantidade === 0 && opcao.id !== 'todos') botao.classList.add('vazio');
    botao.innerHTML = `${opcao.id === 'todos' ? icone('aba_mochila') : iconeEquipamento(opcao.id, 'comum')}
      <span>${opcao.nome}</span><small>${quantidade}</small>`;
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
    botao.className = `celula-item raridade-${pilha.raridade}`;
    if (mesmoSelecionado(selecionado, alvo)) botao.classList.add('selecionado');
    // Seta verde se o melhor item da pilha aumentaria o Poder Total
    const melhor = EQ.ganhoDePoder(estado, EQ.melhorDaPilha(estado, pilha)) > 0;
    const podeMesclar = EQ.podeMesclar(estado, pilha.slot, pilha.raridade, pilha.grau);
    botao.innerHTML = `${iconeEquipamento(pilha.slot, pilha.raridade)}
      ${pilha.itens.length > 1 ? `<span class="item-quantidade${podeMesclar ? ' pode-mesclar' : ''}">${pilha.itens.length}</span>` : ''}
      ${melhor ? '<span class="item-melhor">▲</span>' : ''}
      <span class="item-grau">${estrelas(pilha.grau)}</span>`;
    botao.title = `${SLOT_POR_ID[pilha.slot].nome} ${RARIDADE_POR_ID[pilha.raridade].nome} ${estrelas(pilha.grau)} × ${pilha.itens.length}`;
    botao.addEventListener('click', () => selecionar(alvo));
    grade.appendChild(botao);
  }

  if (lista.length === 0) {
    grade.innerHTML = `<p class="pequeno">${filtroTipo === 'todos' ? 'Nenhum item guardado.' : 'Nenhum item deste tipo guardado.'}</p>`;
  }
}

// ---- Detalhes ----
function listaDeAtributos(item) {
  return Object.entries(atributosDoItem(item))
    .map(([a, v]) => `<li><span>${NOMES_DOS_ATRIBUTOS[a]}</span><b>${textoDoAtributo(a, v)}</b></li>`).join('');
}

// Comparação lado a lado: este item × o item vestido no mesmo espaço, atributo por atributo.
// Mostra todos os atributos que aparecem em qualquer um dos dois (o que um tem e o outro não, conta como 0).
function tabelaDeComparacao(item, vestido) {
  const novo = atributosDoItem(item);
  const atual = vestido ? atributosDoItem(vestido) : {};
  const chaves = [...new Set([...Object.keys(novo), ...Object.keys(atual)])];
  const linhas = chaves.map((a) => {
    const v1 = novo[a] ?? 0;
    const v2 = atual[a] ?? 0;
    const diferenca = v1 - v2;
    // "Igual" só se a diferença for menor que 0,5% do maior valor (os números podem ser pequenos ou enormes)
    const quase = Math.abs(diferenca) <= Math.max(Math.abs(v1), Math.abs(v2)) * 0.005;
    const classe = quase ? 'igual' : diferenca > 0 ? 'melhor' : 'pior';
    const textoDif = quase ? '=' : `${diferenca > 0 ? '▲' : '▼'} ${textoDoAtributo(a, Math.abs(diferenca)).slice(1)}`;
    return `<tr>
      <td>${NOMES_DOS_ATRIBUTOS[a]}</td>
      <td>${v1 ? textoDoAtributo(a, v1) : '—'}</td>
      <td>${v2 ? textoDoAtributo(a, v2) : '—'}</td>
      <td class="dif ${classe}">${textoDif}</td>
    </tr>`;
  }).join('');
  return `<table class="tabela-comparacao">
    <thead><tr>
      <th>Atributo</th>
      <th>${iconeEquipamento(item.slot, item.raridade)} Este</th>
      <th>${vestido ? iconeEquipamento(vestido.slot, vestido.raridade) : ''} Vestido</th>
      <th>Diferença</th>
    </tr></thead>
    <tbody>${linhas}</tbody>
  </table>`;
}

function desenharDetalhe(estado) {
  const caixa = $('item-detalhe');
  caixa.classList.toggle('escondido', !selecionado);
  if (!selecionado) return;
  if (selecionado.tipo === 'vestido') desenharDetalheVestido(estado, caixa);
  else desenharDetalhePilha(estado, caixa);
  $('detalhe-fechar').addEventListener('click', () => { selecionado = null; redesenharAgora(); });
}

// Item vestido: Tirar ou Melhorar
function desenharDetalheVestido(estado, caixa) {
  const item = EQ.buscarItem(estado, selecionado.id);
  const raridade = RARIDADE_POR_ID[item.raridade];
  const noMaximo = item.nivel >= nivelMaximo(item);
  caixa.style.setProperty('--cor-raridade', raridade.cor);
  caixa.innerHTML = `
    <div class="detalhe-topo">
      ${iconeEquipamento(item.slot, item.raridade, 'icone-grande')}
      <div>
        <div class="item-nome">${nomeDoItem(item)}${item.nivel > 0 ? ` +${item.nivel}` : ''}</div>
        <div class="pequeno">Tier ${raridade.tier} · ${raridade.nome} ${estrelas(grauDe(item))} · Nível ${item.nivel}/${nivelMaximo(item)} · <b>Vestido</b></div>
        <div class="pequeno">Caiu em: ${ondeCaiu(item)}</div>
      </div>
      <button class="botao-icone" id="detalhe-fechar">✕</button>
    </div>
    <ul class="item-atributos">${listaDeAtributos(item)}</ul>
    <div class="poder-item">Poder do item: <b>+${formatarNumero(EQ.poderDoItem(estado, item))}</b></div>
    <div class="botoes">
      <button id="detalhe-remover">Tirar</button>
      <button id="detalhe-melhorar" class="principal" ${noMaximo || !EQ.podeMelhorar(estado, item) ? 'disabled' : ''}>
        ${noMaximo ? 'Nível máximo' : `Melhorar: ${formatarNumero(custoMelhoria(item))} ${icone('pedra')}`}
      </button>
    </div>`;
  $('detalhe-remover').addEventListener('click', () => acoesGuardadas.aoRemoverItem(item.slot));
  $('detalhe-melhorar').addEventListener('click', () => acoesGuardadas.aoMelhorarItem(item.id));
}

// Pilha guardada: Equipar, Desmanchar ou Mesclar
function desenharDetalhePilha(estado, caixa) {
  const pilha = EQ.buscarPilha(estado, selecionado.slot, selecionado.raridade, selecionado.grau);
  const raridade = RARIDADE_POR_ID[pilha.raridade];
  const proxima = proximoDaMescla(pilha.raridade, pilha.grau);   // { raridade, grau } ou null
  const nomeProxima = proxima ? `${proxima.raridade.nome} ${estrelas(proxima.grau)}` : '';
  const melhor = EQ.melhorDaPilha(estado, pilha);
  const fraco = EQ.maisFracoDaPilha(estado, pilha);
  const quantidade = pilha.itens.length;
  const necessarios = CONFIG.equipamentos.itensParaMesclar;

  // Comparação do melhor item da pilha com o vestido
  const ganho = EQ.ganhoDePoder(estado, melhor);
  const atual = estado.equipados[pilha.slot];
  const comparacao = `<div class="comparacao ${ganho > 0 ? 'melhor' : 'pior'}">
      ${ganho > 0 ? '▲' : '▼'} Poder Total ${ganho >= 0 ? '+' : '-'}${formatarNumero(Math.abs(ganho))}
      <span class="pequeno">${atual ? `(comparado com ${nomeDoItem(atual)})` : '(espaço vazio)'}</span>
    </div>`;

  // Botão Mesclar
  let botaoMesclar;
  if (!proxima) {
    botaoMesclar = `<button disabled>Grau máximo</button>`;
  } else {
    botaoMesclar = `<button id="detalhe-mesclar" class="botao-mesclar" ${quantidade >= necessarios ? '' : 'disabled'}>
      Mesclar ${Math.min(quantidade, necessarios)}/${necessarios} →
      ${iconeEquipamento(pilha.slot, proxima.raridade.id)} <span style="color:${proxima.raridade.cor}">${proxima.raridade.tier} ${nomeProxima}</span>
    </button>`;
  }

  caixa.style.setProperty('--cor-raridade', raridade.cor);
  caixa.innerHTML = `
    <div class="detalhe-topo">
      <div class="icone-pilha">
        ${iconeEquipamento(pilha.slot, pilha.raridade, 'icone-grande')}
        ${quantidade > 1 ? `<span class="item-quantidade">${quantidade}</span>` : ''}
      </div>
      <div>
        <div class="item-nome">${nomeDoItem(melhor)}${melhor.nivel > 0 ? ` +${melhor.nivel}` : ''}</div>
        <div class="pequeno">Tier ${raridade.tier} · ${raridade.nome} ${estrelas(pilha.grau)} · ${quantidade} na mochila</div>
        <div class="pequeno">${quantidade > 1 ? 'Mostrando o melhor da pilha · ' : ''}Caiu em: ${ondeCaiu(melhor)}</div>
      </div>
      <button class="botao-icone" id="detalhe-fechar">✕</button>
    </div>
    ${atual
      ? `<div class="pequeno comparando-com">Comparando com o vestido: <b>${nomeDoItem(atual)}${atual.nivel > 0 ? ` +${atual.nivel}` : ''}</b></div>
         ${tabelaDeComparacao(melhor, atual)}`
      : `<ul class="item-atributos">${listaDeAtributos(melhor)}</ul>`}
    <div class="poder-item">Poder do item: <b>+${formatarNumero(EQ.poderDoItem(estado, melhor))}</b>${atual
      ? ` · vestido: <b>+${formatarNumero(EQ.poderDoItem(estado, atual))}</b>` : ''}</div>
    ${comparacao}
    <div class="botoes botoes-pilha">
      <button id="detalhe-vestir" class="principal">Equipar</button>
      <button id="detalhe-desmanchar" class="perigo">Desmanchar 1: +${formatarNumero(pedrasAoDesmanchar(fraco))} ${icone('pedra')}</button>
      ${botaoMesclar}
    </div>
    ${quantidade > 1 ? `<button id="detalhe-desmanchar-todos" class="perigo largo">Desmanchar a pilha toda (${quantidade})</button>` : ''}
    ${proxima && quantidade < necessarios ? `<p class="pequeno dica">Junte ${necessarios} para mesclar em 1 item ${nomeProxima}. Faltam ${necessarios - quantidade}.</p>` : ''}`;

  $('detalhe-vestir').addEventListener('click', () => acoesGuardadas.aoEquiparItem(melhor.id));
  $('detalhe-desmanchar').addEventListener('click', () => acoesGuardadas.aoDesmancharItem(fraco.id));
  $('detalhe-mesclar')?.addEventListener('click', () => acoesGuardadas.aoMesclar(pilha.slot, pilha.raridade, pilha.grau));
  $('detalhe-desmanchar-todos')?.addEventListener('click', () => acoesGuardadas.aoDesmancharPilha(pilha.slot, pilha.raridade, pilha.grau));
}

// ---- Chances de drop no mapa atual ----
function desenharChances(estado) {
  const indiceMapa = FASES[estado.combate.faseAtual].mapa;
  const pesos = EQ.pesosDosTiers(indiceMapa, 'comum');
  const total = pesos.reduce((a, b) => a + b, 0);
  const tiers = RARIDADES.map((r, i) =>
    `<span class="chance" style="color:${r.cor}">${r.tier} ${r.nome}: <b>${(pesos[i] / total * 100).toFixed(1)}%</b></span>`).join('');
  const espacos = EQ.espacosLiberados(indiceMapa).map(s => iconeEquipamento(s.id, 'comum', 'icone-chance')).join('');
  const proximo = SLOTS.filter(s => s.mapaMinimo > indiceMapa + 1).sort((a, b) => a.mapaMinimo - b.mapaMinimo)[0];
  $('chances-drop').innerHTML = `
    <p class="pequeno">${MAPAS[indiceMapa].nome} — quando um item cai, o tier é sorteado assim
      (chefes aumentam as chances de Raro ou melhor):</p>
    <div class="lista-chances">${tiers}</div>
    <p class="pequeno">Grau ao cair: ${CONFIG.equipamentos.pesosGrauAoCair
      .map((p, i) => p > 0 ? `${estrelas(i + 1)} ${p}%` : '').filter(Boolean).join(' · ')}.
      Mesclar: ${CONFIG.equipamentos.itensParaMesclar} iguais → grau seguinte (${estrelas(5)} → ${estrelas(1)} do tier seguinte).</p>
    <p class="pequeno">Itens que caem aqui: ${espacos}</p>
    ${proximo ? `<p class="pequeno">Próximo tipo de item: <b>${proximo.nome}</b>, a partir do Mapa ${proximo.mapaMinimo}.</p>` : ''}`;
}
