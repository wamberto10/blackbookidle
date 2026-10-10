// =============================================================
// ui/telaBlackBook.js — aba Black Book (Reencarnação e melhorias)
// =============================================================
import { CONFIG } from '../config.js';
import * as BB from '../sistemas/blackbook.js';
import { liberado } from '../sistemas/desbloqueios.js';
import { FASES, textoDoInicioDaVida } from '../sistemas/mundo.js';
import { formatarNumero } from '../format.js';
import { icone } from './sprite.js';

const $ = (id) => document.getElementById(id);

const elementosMelhorias = {};

export function montarTelaBlackBook(acoes) {
  $('bb-reencarnar').addEventListener('click', acoes.aoReencarnar);

  const lista = $('lista-melhorias');
  for (const melhoria of CONFIG.blackbook.melhorias) {
    const linha = document.createElement('div');
    linha.className = 'melhoria';
    linha.innerHTML = `
      <div class="melhoria-info">
        <div>${icone(melhoria.icone)} <b>${melhoria.nome}</b> <span class="melhoria-nivel"></span></div>
        <div class="pequeno">${melhoria.descricao} por nível · <span class="melhoria-total"></span></div>
      </div>
      <button></button>`;
    const botao = linha.querySelector('button');
    botao.addEventListener('click', () => acoes.aoComprarMelhoria(melhoria.id));
    elementosMelhorias[melhoria.id] = {
      nivel: linha.querySelector('.melhoria-nivel'),
      total: linha.querySelector('.melhoria-total'),
      botao,
    };
    lista.appendChild(linha);
  }
}

// Ex.: índice 13 → "Mapa 2 · Fase 2"
function nomeDaFase(indice) {
  if (indice < 0) return 'Nenhuma';
  const fase = FASES[indice];
  return `Mapa ${fase.mapa + 1} · Fase ${fase.numero} (${indice + 1}/${FASES.length})`;
}

// Ex.: "+30%" para multiplicar 0.3 | "+4%" para somar 4
function textoDoEfeito(melhoria, efeito) {
  if (melhoria.tipo === 'multiplicar') return `+${formatarNumero(Math.round(efeito * 100))}%`;
  return `+${Number(efeito.toFixed(1))}%`;
}

export function atualizarTelaBlackBook(estado) {
  const aberto = liberado(estado, 'blackbook');
  $('blackbook-bloqueado').classList.toggle('escondido', aberto);
  $('blackbook-conteudo').classList.toggle('escondido', !aberto);
  if (!aberto) return;

  // ---- Reencarnação ----
  const ganho = BB.essenciaAoReencarnar(estado);
  $('bb-fase').textContent = nomeDaFase(estado.combate.fasesConcluidas);
  $('bb-ganho').textContent = `${formatarNumero(ganho)} ✨`;
  $('bb-inicio').textContent = textoDoInicioDaVida(estado);
  $('bb-reencarnar').disabled = !BB.podeReencarnar(estado);
  $('bb-reencarnar').textContent = !BB.chegouOndeReencarnou(estado)
    ? `📕 Para reencarnar de novo, vença ${nomeDaFase(BB.faseMinimaParaReencarnar(estado))} (onde você reencarnou da última vez)`
    : !BB.venceuFaseNestaVida(estado)
      ? '📕 Vença pelo menos 1 fase nova nesta vida para poder reencarnar'
    : ganho > 0
      ? `📕 Reencarnar e receber ${formatarNumero(ganho)} ✨ Essência da Alma`
      : '📕 Vença pelo menos 1 fase para poder reencarnar';

  // ---- Melhorias ----
  $('bb-essencia').textContent = formatarNumero(Math.floor(estado.essencia));
  for (const melhoria of CONFIG.blackbook.melhorias) {
    const el = elementosMelhorias[melhoria.id];
    const custo = BB.custoMelhoria(estado, melhoria.id);
    const maximo = BB.noMaximo(estado, melhoria.id);
    el.nivel.textContent = `Nv. ${BB.nivelMelhoria(estado, melhoria.id)}${melhoria.nivelMaximo !== undefined ? `/${melhoria.nivelMaximo}` : ''}`;
    el.total.textContent = `Total: ${textoDoEfeito(melhoria, BB.efeitoMelhoria(estado, melhoria.id))}`;
    el.botao.textContent = maximo ? 'Nível máximo' : `Melhorar: ${formatarNumero(custo)} ✨`;
    el.botao.disabled = maximo || estado.essencia < custo;
  }

  // ---- Registro das vidas ----
  const r = estado.reencarnacao;
  $('bb-vezes').textContent = r.vezes;
  $('bb-recorde').textContent = nomeDaFase(Math.max(r.melhorFaseDeTodas, estado.combate.fasesConcluidas));
  $('bb-total').textContent = formatarNumero(r.essenciaTotal);
}
