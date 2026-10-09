// =============================================================
// ui/telaMapa.js — aba Mapa (mundos, mapas e fases)
// =============================================================
import { MUNDOS } from '../dados/mundos.js';
import { liberado as sistemaLiberado } from '../sistemas/desbloqueios.js';
import { MAPAS, FASES, MUNDOS_JOGAVEIS, mapaLiberado, faseLiberada, fasesVencidasNoMapa, mundoConcluido,
  mapasDoMundo, primeiraFaseDoMundo, ultimaFaseDoMundo } from '../sistemas/mundo.js';
import { cultivoDaVitoria } from '../sistemas/combate.js';
import { formatarNumero } from '../format.js';
import { icone, iconeDoMapa } from './sprite.js';
import { calcularAtributos, poderTotal } from '../sistemas/atributos.js';
import { previsaoDaFase, textoDaPrevisao, textoDoPoder } from './poder.js';

const $ = (id) => document.getElementById(id);

let acoesGuardadas = null;
let ultimoEstado = null;
let mapaSelecionado = null;  // mapa aberto na tela (não precisa ser salvo)
let chaveDesenhada = '';

export function montarTelaMapa(acoes) {
  acoesGuardadas = acoes;
}

// Mundo liberado = a 1ª fase dele já pode ser jogada (venceu o chefe final do mundo anterior)
function mundoLiberado(estado, indiceMundo) {
  return faseLiberada(estado, primeiraFaseDoMundo(indiceMundo));
}

function escolherMundo(indiceMundo) {
  mapaSelecionado = mapasDoMundo(indiceMundo)[0];
  chaveDesenhada = '';
  atualizarTelaMapa(ultimoEstado);
}

export function atualizarTelaMapa(estado) {
  ultimoEstado = estado;
  const liberado = sistemaLiberado(estado, 'mapa');
  $('mapa-bloqueado').classList.toggle('escondido', liberado);
  $('mapa-conteudo').classList.toggle('escondido', !liberado);
  if (!liberado) return;

  if (mapaSelecionado === null) mapaSelecionado = FASES[estado.combate.faseAtual].mapa;

  // Só redesenha quando algo mudou (economiza processamento)
  // Também redesenha quando o seu Poder muda (as cores da previsão dependem dele)
  const chave = `${estado.combate.fasesConcluidas}|${estado.combate.faseAtual}|${mapaSelecionado}|${Math.round(poderTotal(calcularAtributos(estado)))}`;
  if (chave === chaveDesenhada) return;
  chaveDesenhada = chave;
  redesenhar(estado);
}

function redesenhar(estado) {
  // ---- Mundo do mapa aberto (nome, lema, descrição) e botões para trocar de mundo ----
  const indiceMundo = MAPAS[mapaSelecionado].mundo;
  const mundo = MUNDOS_JOGAVEIS[indiceMundo];
  $('mapa-mundo-nome').textContent = `Mundo ${indiceMundo + 1} — ${mundo.nome}`;
  $('mapa-mundo-lema').textContent = mundo.lema;
  $('mapa-mundo-desc').textContent = mundo.descricao;

  const abas = $('abas-mundo');
  abas.innerHTML = '';
  const liberados = MUNDOS_JOGAVEIS.filter((_, i) => mundoLiberado(estado, i)).length;
  abas.classList.toggle('escondido', liberados < 2);   // só aparece com 2 mundos ou mais
  MUNDOS_JOGAVEIS.forEach((outro, i) => {
    if (!mundoLiberado(estado, i)) return;
    const botao = document.createElement('button');
    botao.className = 'aba-mundo' + (i === indiceMundo ? ' selecionado' : '');
    botao.textContent = `Mundo ${i + 1}`;
    botao.title = outro.nome;
    botao.addEventListener('click', () => escolherMundo(i));
    abas.appendChild(botao);
  });

  // ---- Cartões dos 12 mapas do mundo ----
  const lista = $('lista-mapas');
  lista.innerHTML = '';
  mapasDoMundo(indiceMundo).forEach((indice) => {
    const mapa = MAPAS[indice];
    const liberado = mapaLiberado(estado, indice);
    const vencidas = fasesVencidasNoMapa(estado, indice);
    const cartao = document.createElement('button');
    cartao.className = 'cartao-mapa';
    if (indice === mapaSelecionado) cartao.classList.add('selecionado');
    if (vencidas === 12) cartao.classList.add('completo');
    cartao.disabled = !liberado;
    cartao.style.setProperty('--cor-mapa', mapa.cor);
    cartao.innerHTML = liberado
      ? `${iconeDoMapa(indice, 'icone-mapa')}<span class="nome-mapa">${indice + 1}. ${mapa.nome}</span><small>${vencidas}/12</small>`
      : `<span class="icone-mapa-trancado">🔒</span><span class="nome-mapa">${indice + 1}. ???</span><small>&nbsp;</small>`;
    cartao.addEventListener('click', () => {
      mapaSelecionado = indice;
      chaveDesenhada = '';
      atualizarTelaMapa(ultimoEstado);
    });
    lista.appendChild(cartao);
  });

  // ---- Detalhe do mapa selecionado ----
  const mapa = MAPAS[mapaSelecionado];
  $('md-nome').innerHTML = `${iconeDoMapa(mapaSelecionado)} ${mapa.nome}`;
  $('md-desc').textContent = mapa.descricao;
  $('md-sistema').textContent = mapa.sistema ? `🔒 Sistema deste mapa (etapa futura): ${mapa.sistema}` : '';
  $('mapa-detalhe').style.setProperty('--cor-mapa', mapa.cor);

  const grade = $('lista-fases');
  grade.innerHTML = '';
  FASES.filter(fase => fase.mapa === mapaSelecionado).forEach((fase) => {
    const botao = document.createElement('button');
    const liberada = faseLiberada(estado, fase.indice);
    const vencida = fase.indice <= estado.combate.fasesConcluidas;
    botao.className = 'botao-fase tipo-' + fase.chaveTipo;
    if (vencida) botao.classList.add('vencida');
    if (fase.indice === estado.combate.faseAtual) botao.classList.add('atual');
    botao.disabled = !liberada;
    // Poder do inimigo, colorido pela previsão da luta (verde = fácil ... vermelho = derrota)
    const previsao = liberada ? previsaoDaFase(estado, fase) : null;
    botao.innerHTML = liberada
      ? `<b>${fase.numero}</b>${icone(fase.tipo.sprite, 'icone-fase')}<small>${fase.local}</small><small class="inimigo-fase">${fase.inimigo.nome}</small>
         <small class="poder-fase ${previsao.classe}">Poder ${textoDoPoder(previsao.poderInimigo)}</small>`
      : `<b>${fase.numero}</b><span>🔒</span><small>???</small>`;
    botao.title = liberada
      ? `${fase.tipo.nome} — ${textoDaPrevisao(previsao)}. Recompensa: ${formatarNumero(cultivoDaVitoria(estado, fase))} Cultivo, ${formatarNumero(fase.recompensa.pedras)} 💎`
      : 'Vença a fase anterior para liberar';
    botao.addEventListener('click', () => acoesGuardadas.aoEscolherFase(fase.indice));
    grade.appendChild(botao);
  });

  // ---- Lista de mundos ----
  const listaMundos = $('lista-mundos');
  listaMundos.innerHTML = '';
  let proximoMostrado = false;
  MUNDOS.forEach((outro, indice) => {
    const item = document.createElement('li');
    const jogavel = indice < MUNDOS_JOGAVEIS.length;
    if (jogavel && mundoLiberado(estado, indice)) {
      const primeira = primeiraFaseDoMundo(indice);
      const total = ultimaFaseDoMundo(indice) - primeira + 1;
      const vencidas = Math.max(0, Math.min(total, estado.combate.fasesConcluidas + 1 - primeira));
      const concluido = mundoConcluido(estado, indice);
      item.className = concluido ? 'concluido' : 'atual';
      item.innerHTML = `<span>${concluido ? '✔' : '➤'} Mundo ${indice + 1} — ${outro.nome}</span><small>${vencidas}/${total} fases</small>`;
      item.style.cursor = 'pointer';
      item.addEventListener('click', () => escolherMundo(indice));
    } else if (!proximoMostrado) {
      proximoMostrado = true;
      item.className = 'proximo';
      item.innerHTML = jogavel
        ? `<span>🔒 Mundo ${indice + 1} — ${outro.nome}</span><small>Vença o chefe final do Mundo ${indice}</small>`
        : `<span>Mundo ${indice + 1} — ${outro.nome}</span><small>Em desenvolvimento</small>`;
    } else {
      item.className = 'oculto';
      item.innerHTML = `<span>Mundo ${indice + 1} — ???</span><small></small>`;
    }
    listaMundos.appendChild(item);
  });
}

// Usado quando o jogador escolhe uma fase: mostra o mapa dela da próxima vez
export function focarMapaDaFase(indiceFase) {
  mapaSelecionado = FASES[indiceFase].mapa;
  chaveDesenhada = '';
}
