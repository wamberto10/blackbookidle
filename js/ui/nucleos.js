// =============================================================
// ui/nucleos.js — BOTÃO "+" DOS ATRIBUTOS (usar Núcleos)
// Na aba Personagem: Ataque, Vitalidade, Defesa e Velocidade ganham um "+".
// Ele abre uma janelinha para escolher qual núcleo usar (Baixo, Médio ou Alto).
// =============================================================
import { TIPOS_DE_NUCLEO, ATRIBUTOS_DE_NUCLEO, quantidade, pontosEm, temAlgumNucleo } from '../sistemas/nucleos.js';
import { ATRIBUTOS } from '../sistemas/atributos.js';
import { icone } from './sprite.js';

const $ = (id) => document.getElementById(id);
const NOME = Object.fromEntries(ATRIBUTOS.map(a => [a.id, a.nome]));

const botoesMais = {};
const rotulosPontos = {};
let atributoEscolhido = null;
let ultimoEstado = null;

export function montarNucleos(acoes, linhas) {
  for (const atributo of ATRIBUTOS_DE_NUCLEO) {
    const linha = linhas[atributo];
    // "+12%" ao lado do nome = bônus que já veio dos núcleos
    const rotulo = document.createElement('small');
    rotulo.className = 'pontos-nucleo';
    linha.querySelector('span').appendChild(rotulo);
    rotulosPontos[atributo] = rotulo;

    const botao = document.createElement('button');
    botao.className = 'botao-nucleo';
    botao.textContent = '+';
    botao.title = 'Usar um Núcleo neste atributo';
    botao.addEventListener('click', () => abrir(atributo));
    linha.appendChild(botao);
    botoesMais[atributo] = botao;
  }

  // Janelinha de escolha (uma só, reaproveitada)
  const janela = document.createElement('div');
  janela.id = 'escolha-nucleo';
  janela.className = 'escolha-nucleo escondido';
  janela.innerHTML = `
    <div class="escolha-nucleo-caixa">
      <h3 id="escolha-nucleo-titulo"></h3>
      <div id="escolha-nucleo-lista" class="escolha-nucleo-lista"></div>
      <button id="escolha-nucleo-fechar">Fechar</button>
    </div>`;
  ($('jogo') ?? document.body).appendChild(janela);
  janela.addEventListener('click', (e) => { if (e.target === janela) fechar(); });
  $('escolha-nucleo-fechar').addEventListener('click', fechar);
  $('escolha-nucleo-lista').addEventListener('click', (e) => {
    const botao = e.target.closest('button[data-tipo]');
    if (botao && atributoEscolhido) acoes.aoUsarNucleo(botao.dataset.tipo, atributoEscolhido);
  });
}

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
  const chave = `${atributo}|${pontosEm(estado, atributo)}|${TIPOS_DE_NUCLEO.map(t => quantidade(estado, t.id)).join(',')}`;
  if (chave === chaveJanela) return;
  chaveJanela = chave;
  $('escolha-nucleo-titulo').textContent = `Usar Núcleo em ${NOME[atributo]} (agora +${pontosEm(estado, atributo)}%)`;
  $('escolha-nucleo-lista').innerHTML = TIPOS_DE_NUCLEO.map(tipo => {
    const qtd = quantidade(estado, tipo.id);
    return `<button data-tipo="${tipo.id}" ${qtd > 0 ? '' : 'disabled'}>
        ${icone(tipo.icone)} <span style="color:${tipo.cor}">${tipo.nome}</span>
        <b>+${tipo.pontos}%</b> <small>(você tem ${qtd})</small>
      </button>`;
  }).join('');
}

export function atualizarNucleos(estado) {
  ultimoEstado = estado;
  const algum = temAlgumNucleo(estado);
  for (const atributo of ATRIBUTOS_DE_NUCLEO) {
    const pontos = pontosEm(estado, atributo);
    rotulosPontos[atributo].textContent = pontos > 0 ? ` +${pontos}%` : '';
    botoesMais[atributo].disabled = !algum;
  }
  const chave = TIPOS_DE_NUCLEO.map(t => quantidade(estado, t.id)).join(',');
  if (chave !== chaveGuardados) {
    chaveGuardados = chave;
    $('nucleos-guardados').innerHTML = 'Núcleos guardados: ' + TIPOS_DE_NUCLEO
      .map(t => `${icone(t.icone)} ${t.nome.replace('Núcleo de ', '')}: <b>${quantidade(estado, t.id)}</b>`).join(' · ');
  }
  if (atributoEscolhido) desenharJanela(estado);
}
