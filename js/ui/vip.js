// =============================================================
// ui/vip.js — BOTÃO 💎 E TELA DO VIP
// O botão fica no canto superior esquerdo da tela inicial e abre a
// janela com as vantagens e o botão Ativar/Desativar (de graça).
// =============================================================
import { CONFIG } from '../config.js';
import { RARIDADES } from '../dados/equipamentos.js';

const $ = (id) => document.getElementById(id);
const V = CONFIG.vip;
let ultimoVip = null;

export function montarVip(acoes) {
  $('botao-vip').addEventListener('click', () => $('tela-vip').classList.remove('escondido'));
  $('tela-vip-fechar').addEventListener('click', () => $('tela-vip').classList.add('escondido'));
  $('tela-vip').addEventListener('click', (e) => { if (e.target.id === 'tela-vip') $('tela-vip').classList.add('escondido'); });
  $('tela-vip-ativar').addEventListener('click', acoes.aoAlternarVip);

  const tiers = RARIDADES.filter(r => !r.exclusivo).map((r, i) =>
    `<span style="color:${r.cor}">${r.nome} +${V.pesosExtras[i]}%</span>`).join(' · ');
  $('tela-vip-lista').innerHTML = `
    <li>🧘 <b>Meditar automático</b>: ${V.cliquesPorSegundo} cliques por segundo com o jogo aberto — o botão Meditar passa a ligar/desligar</li>
    <li>⚡ <b>Rompimento automático</b>: rompe o reino sozinho assim que cumprir os requisitos</li>
    <li>🎁 <b>Mais itens raros</b>: ${tiers}</li>
    <li>✨ <b>+${Math.round(V.bonusEssencia * 100)}% de Essência da Alma</b> ao reencarnar</li>
    <li>⚔️ <b>+${Math.round(V.atributos.ataque * 100)}% de Ataque</b>, 🛡️ <b>+${Math.round(V.atributos.defesa * 100)}% de Defesa</b> e
        ❤️ <b>+${Math.round(V.atributos.vitalidade * 100)}% de Vitalidade</b> (no total, com itens e tudo)</li>`;
}

export function atualizarVip(estado) {
  if (estado.vip === ultimoVip) return;
  ultimoVip = estado.vip;
  $('botao-vip').classList.toggle('ativo', estado.vip);
  $('tela-vip-estado').textContent = estado.vip ? '✔ VIP ATIVO' : 'VIP desativado';
  $('tela-vip-estado').classList.toggle('destaque', estado.vip);
  $('tela-vip-ativar').textContent = estado.vip ? 'Desativar VIP' : '💎 Ativar VIP';
}
