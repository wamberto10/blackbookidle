// =============================================================
// ui/telaMapa.js — aba Mapa (mundos, mapas e fases)
// =============================================================
import { MUNDOS } from '../dados/mundos.js';
import { liberado as sistemaLiberado } from '../sistemas/desbloqueios.js';
import { MUNDO, MAPAS, FASES, mapaLiberado, faseLiberada, fasesVencidasNoMapa, mundoConcluido } from '../sistemas/mundo.js';
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
  $('mapa-mundo-nome').textContent = MUNDO.nome;
  $('mapa-mundo-lema').textContent = MUNDO.lema;
  $('mapa-mundo-desc').textContent = MUNDO.descricao;
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
  // ---- Cartões dos 12 mapas ----
  const lista = $('lista-mapas');
  lista.innerHTML = '';
  MAPAS.forEach((mapa, indice) => {
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
      ? `${fase.tipo.nome} — ${textoDaPrevisao(previsao)}. Recompensa: ${formatarNumero(fase.recompensa.cultivo)} Cultivo, ${formatarNumero(fase.recompensa.pedras)} 💎`
      : 'Vença a fase anterior para liberar';
    botao.addEventListener('click', () => acoesGuardadas.aoEscolherFase(fase.indice));
    grade.appendChild(botao);
  });

  // ---- Lista de mundos ----
  const listaMundos = $('lista-mundos');
  listaMundos.innerHTML = '';
  MUNDOS.forEach((mundo, indice) => {
    const item = document.createElement('li');
    if (indice === 0) {
      item.className = mundoConcluido(estado) ? 'concluido' : 'atual';
      item.innerHTML = `<span>${mundoConcluido(estado) ? '✔' : '➤'} Mundo 1 — ${mundo.nome}</span><small>${estado.combate.fasesConcluidas + 1}/144 fases</small>`;
    } else if (indice === 1 && mundoConcluido(estado)) {
      item.className = 'proximo';
      item.innerHTML = `<span>Mundo 2 — ${mundo.nome}</span><small>Em desenvolvimento</small>`;
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
