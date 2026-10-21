// =============================================================
// ui/nucleos.js — NÚCLEO DE CULTIVO (usar Núcleos)
// Na aba Personagem (v0.29.0, layout do mockup): 4 cartões — Ataque, Vitalidade, Defesa e Velocidade —
// com o nível (pontos já usados, +1% cada) e um "+". O "+" abre uma janelinha para escolher qual núcleo
// usar (Baixo, Médio ou Alto). "Pontos disponíveis" = pontos dos núcleos guardados.
// =============================================================
import { TIPOS_DE_NUCLEO, ATRIBUTOS_DE_NUCLEO, quantidade, pontosEm, temAlgumNucleo } from '../sistemas/nucleos.js';
import { ATRIBUTOS } from '../sistemas/atributos.js';
import { icone } from './sprite.js';
import { formatarNumero } from '../format.js';

const $ = (id) => document.getElementById(id);
const NOME = Object.fromEntries(ATRIBUTOS.map(a => [a.id, a.nome]));

const botoesMais = {};
const rotulosPontos = {};
let atributoEscolhido = null;
let ultimoEstado = null;

// Cartão de cada atributo (cor da moldura e ícone do kit de interface, img/ui/)
const CARTAO = {
  ataque: { cor: 'vermelho', icone: 'bb_icone_forca' },
  vitalidade: { cor: 'verde', icone: 'bb_icone_vitalidade' },
  defesa: { cor: 'azul', icone: 'bb_icone_defesa' },
  velocidade: { cor: 'roxo', icone: 'bb_icone_velocidade' },
};

export function montarNucleos(acoes) {
  const caixa = $('pers-nucleos');
  for (const atributo of ATRIBUTOS_DE_NUCLEO) {
    const visual = CARTAO[atributo];
    const cartao = document.createElement('div');
    cartao.className = `pers-nucleo pers-nucleo-${visual.cor}`;
    cartao.innerHTML = `<img class="pers-nucleo-icone" src="img/ui/${visual.icone}.png" alt="">
      <span class="pers-nucleo-texto"><small><span class="pers-nucleo-de">Núcleo de </span>${NOME[atributo].replace(' (HP)', '')}</small><b>Nv. 0</b></span>
      <button class="botao-icone pers-mais" title="Usar um Núcleo neste atributo"><img src="img/ui/topo_botao_mais.png" alt="+"></button>`;
    rotulosPontos[atributo] = cartao.querySelector('b');
    botoesMais[atributo] = cartao.querySelector('button');
    botoesMais[atributo].addEventListener('click', () => abrir(atributo));
    caixa.appendChild(cartao);
  }

  // Janelinha de escolha (uma só, reaproveitada)
  const janela = document.createElement('div');
  janela.id = 'escolha-nucleo';
  janela.className = 'escolha-nucleo escondido';
  // Seletor de quantidade (um só para os 3 núcleos, para caber no celular):
  // escolhe 1×, 5×, 10× ou Todos e depois toca no núcleo.
  janela.innerHTML = `
    <div class="escolha-nucleo-caixa">
      <h3 id="escolha-nucleo-titulo"></h3>
      <div class="escolha-nucleo-qtd" id="escolha-nucleo-qtd">
        ${QUANTIDADES.map(q => `<button data-qtd="${q.valor}">${q.texto}</button>`).join('')}
      </div>
      <div id="escolha-nucleo-lista" class="escolha-nucleo-lista"></div>
      <button id="escolha-nucleo-fechar">Fechar</button>
    </div>`;
  ($('jogo') ?? document.body).appendChild(janela);
  janela.addEventListener('click', (e) => { if (e.target === janela) fechar(); });
  $('escolha-nucleo-fechar').addEventListener('click', fechar);
  $('escolha-nucleo-qtd').addEventListener('click', (e) => {
    const botao = e.target.closest('button[data-qtd]');
    if (!botao) return;
    quantidadeEscolhida = Number(botao.dataset.qtd);
    chaveJanela = '';
    if (ultimoEstado) desenharJanela(ultimoEstado);
  });
  $('escolha-nucleo-lista').addEventListener('click', (e) => {
    const botao = e.target.closest('button[data-tipo]');
    if (botao && atributoEscolhido) acoes.aoUsarNucleo(botao.dataset.tipo, atributoEscolhido, quantidadeEscolhida);
  });
}

// Infinity = "Todos" (usa todos os núcleos daquele tipo)
const QUANTIDADES = [
  { valor: 1, texto: '1×' }, { valor: 5, texto: '5×' }, { valor: 10, texto: '10×' }, { valor: Infinity, texto: 'Todos' },
];
let quantidadeEscolhida = 1;

function abrir(atributo) {
  atributoEscolhido = atributo;
  chaveJanela = '';
  $('escolha-nucleo').classList.remove('escondido');
  if (ultimoEstado) desenharJanela(ultimoEstado);
}

function fechar() {
  atributoEscolhido = null;
  $('escolha-nucleo').classList.add('escondido');
}

// Só redesenha quando algo muda (senão o botão é trocado no meio do clique)
let chaveJanela = '';
let chaveGuardados = '';

function desenharJanela(estado) {
  const atributo = atributoEscolhido;
  const chave = `${atributo}|${quantidadeEscolhida}|${pontosEm(estado, atributo)}|${TIPOS_DE_NUCLEO.map(t => quantidade(estado, t.id)).join(',')}`;
  if (chave === chaveJanela) return;
  chaveJanela = chave;
  $('escolha-nucleo-titulo').textContent = `Usar Núcleo em ${NOME[atributo]} (agora +${pontosEm(estado, atributo)}%)`;
  for (const botao of $('escolha-nucleo-qtd').children) {
    botao.classList.toggle('ativo', Number(botao.dataset.qtd) === quantidadeEscolhida);
  }
  $('escolha-nucleo-lista').innerHTML = TIPOS_DE_NUCLEO.map(tipo => {
    const qtd = quantidade(estado, tipo.id);
    const usa = Math.min(qtd, quantidadeEscolhida);   // quantos serão usados com o toque
    return `<button data-tipo="${tipo.id}" ${qtd > 0 ? '' : 'disabled'}>
        ${icone(tipo.icone)}
        <span class="escolha-nucleo-nome"><span style="color:${tipo.cor}">${tipo.nome.replace('Núcleo de ', '')}</span>
          <small>você tem ${qtd}</small></span>
        <b>${usa > 0 ? `usar ${usa} → +${usa * tipo.pontos}%` : `+${tipo.pontos}% cada`}</b>
      </button>`;
  }).join('');
}

// v0.35.1: até 9999 o número inteiro; depois a forma curta com no máximo 1 casa ("12.3K", "10M")
const nivelCurto = (n) => (n < 1e4 ? String(n) : formatarNumero(n).replace(/\.(\d)\d(?=\D)/, '.$1').replace(/\.0(?=\D)/, ''));

export function atualizarNucleos(estado) {
  ultimoEstado = estado;
  const algum = temAlgumNucleo(estado);
  for (const atributo of ATRIBUTOS_DE_NUCLEO) {
    const texto = `Nv. ${nivelCurto(pontosEm(estado, atributo))}`;   // v0.35.1: 9999999 → "10M" (cabe ao lado do +)
    if (rotulosPontos[atributo].textContent !== texto) rotulosPontos[atributo].textContent = texto;
    botoesMais[atributo].disabled = !algum;
  }
  const chave = TIPOS_DE_NUCLEO.map(t => quantidade(estado, t.id)).join(',');
  if (chave !== chaveGuardados) {
    chaveGuardados = chave;
    $('pers-pontos').textContent = TIPOS_DE_NUCLEO.reduce((soma, t) => soma + quantidade(estado, t.id) * t.pontos, 0);
  }
  if (atributoEscolhido) desenharJanela(estado);
}
