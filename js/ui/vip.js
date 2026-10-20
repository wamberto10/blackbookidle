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
  $('tela-vip-x').addEventListener('click', () => $('tela-vip').classList.add('escondido'));   // v0.34.0
  $('tela-vip').addEventListener('click', (e) => { if (e.target.id === 'tela-vip') $('tela-vip').classList.add('escondido'); });
  $('tela-vip-ativar').addEventListener('click', acoes.aoAlternarVip);

  const tiers = RARIDADES.filter(r => !r.exclusivo).map((r, i) =>
    `<span style="color:${r.cor}">${r.nome} +${V.pesosExtras[i]}%</span>`).join(' · ');
  // v0.34.0 (layout novo): ícone numa caixinha de borda fina, título e explicação — com as regras reais
  const linha = (imagem, titulo, texto) => `<li><span class="vip-icone"><img src="img/ui/${imagem}.png" alt=""></span>` +
    `<span><b>${titulo}</b><small>${texto}</small></span></li>`;
  const cliques = `${V.cliquesPorSegundo} ${V.cliquesPorSegundo === 1 ? 'clique' : 'cliques'} por segundo`;
  $('tela-vip-lista').innerHTML = [
    linha('vip_icone_meditacao', 'Meditação automática', `${cliques} com o jogo aberto; o botão Meditar passa a ligar e desligar.`),
    linha('vip_icone_rompimento', 'Rompimento automático', 'Rompe o reino sozinho assim que cumprir os requisitos.'),
    linha('icone_bau', 'Mais itens raros', tiers),
    linha('icone_essencia', `+${Math.round(V.bonusEssencia * 100)}% de Essência da Alma`, 'No farm (cada segundo de luta vencida).'),
    linha('icone_equipar', `+${Math.round(V.atributos.ataque * 100)}% de Ataque`, 'No total, com itens e tudo.'),
    linha('icone_def', `+${Math.round(V.atributos.vitalidade * 100)}% de Vitalidade e Defesa`, 'Mais resistência em combate.'),
  ].join('');
}

export function atualizarVip(estado) {
  if (estado.vip === ultimoVip) return;
  ultimoVip = estado.vip;
  $('botao-vip').classList.toggle('ativo', estado.vip);
  $('botao-vip-estado').textContent = estado.vip ? 'ON' : 'OFF';   // v0.27.0: plaquinha do emblema
  $('tela-vip-estado').textContent = estado.vip ? 'VIP Ativo' : 'VIP Inativo';
  $('tela-vip-estado').classList.toggle('ativo', estado.vip);
  $('tela-vip-ativar').textContent = estado.vip ? 'Desativar VIP' : 'Ativar VIP';
}
