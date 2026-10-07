// =============================================================
// ui/telaCriacao.js — TELA DE CRIAÇÃO DE PERSONAGEM
//   Etapa 1: sexo e nome
//   Etapa 2: classe (Refinador Corporal, Mestre da Espada, Elemental)
// =============================================================
import { CLASSES, SEXOS, TAMANHO_DO_NOME } from '../dados/classes.js';
import { validarNome } from '../sistemas/personagem.js';
import { desenharPersonagem, mostrarQuadro } from './sprite.js';

const $ = (id) => document.getElementById(id);

// O que o jogador escolheu até agora
const escolha = { sexo: 'masculino', nome: '', classe: null };
let aoConfirmarGuardado = null;
let demonstracao = null;   // timer que mostra a pose de ataque nas cartas de classe

const NOMES_DOS_ATRIBUTOS = {
  ataque: 'Ataque', vitalidade: 'Vitalidade', defesa: 'Defesa', velocidade: 'Velocidade',
  critico: 'Taxa de Crítico', danoCritico: 'Dano Crítico',
};

export function montarTelaCriacao(aoConfirmar) {
  aoConfirmarGuardado = aoConfirmar;

  // ---- Cartas de sexo ----
  const caixaSexo = $('escolha-sexo');
  for (const sexo of SEXOS) {
    const carta = document.createElement('button');
    carta.className = 'carta-escolha';
    carta.dataset.sexo = sexo.id;
    carta.innerHTML = `<canvas width="32" height="32"></canvas><b>${sexo.nome}</b>`;
    carta.addEventListener('click', () => { escolha.sexo = sexo.id; atualizarEtapa1(); });
    caixaSexo.appendChild(carta);
  }

  // ---- Cartas de classe ----
  const caixaClasse = $('escolha-classe');
  for (const classe of CLASSES) {
    const carta = document.createElement('button');
    carta.className = 'carta-escolha carta-classe';
    carta.dataset.classe = classe.id;
    const bonus = [
      ...Object.entries(classe.multiplicar).map(([a, v]) =>
        `<li class="${v >= 0 ? 'bom' : 'ruim'}">${v >= 0 ? '+' : ''}${Math.round(v * 100)}% ${NOMES_DOS_ATRIBUTOS[a]}</li>`),
      ...Object.entries(classe.somar).map(([a, v]) =>
        `<li class="bom">+${v}% ${NOMES_DOS_ATRIBUTOS[a]}</li>`),
    ].join('');
    carta.innerHTML = `
      <canvas width="32" height="32"></canvas>
      <b class="nome-classe">${classe.nome}</b>
      <small class="titulo-classe">${classe.titulo}</small>
      <p>${classe.descricao}</p>
      <ul class="bonus-classe">${bonus}</ul>
      <div class="especial-classe"><b>${classe.nomeEspecial}:</b> ${classe.textoEspecial}</div>`;
    carta.addEventListener('click', () => { escolha.classe = classe.id; atualizarEtapa2(); });
    caixaClasse.appendChild(carta);
  }

  // ---- Botões ----
  $('criacao-nome').addEventListener('input', (e) => {
    escolha.nome = e.target.value;
    $('criacao-erro').textContent = '';
  });
  $('criacao-nome').addEventListener('keydown', (e) => { if (e.key === 'Enter') irParaEtapa2(); });
  $('criacao-continuar').addEventListener('click', irParaEtapa2);
  $('criacao-voltar').addEventListener('click', () => mostrarEtapa(1));
  $('criacao-confirmar').addEventListener('click', () => {
    if (!escolha.classe || validarNome(escolha.nome)) return;
    fecharCriacao();
    aoConfirmarGuardado({ ...escolha, nome: escolha.nome.trim() });
  });
}

export function abrirCriacao() {
  escolha.sexo = 'masculino';
  escolha.nome = '';
  escolha.classe = null;
  $('criacao-nome').value = '';
  $('criacao-erro').textContent = '';
  $('criacao').classList.remove('escondido');
  mostrarEtapa(1);
  setTimeout(() => $('criacao-nome').focus(), 50);
}

function fecharCriacao() {
  $('criacao').classList.add('escondido');
  clearInterval(demonstracao);
}

function mostrarEtapa(numero) {
  $('criacao-etapa1').classList.toggle('escondido', numero !== 1);
  $('criacao-etapa2').classList.toggle('escondido', numero !== 2);
  $('passo-1').classList.toggle('ativo', numero === 1);
  $('passo-2').classList.toggle('ativo', numero === 2);
  if (numero === 1) atualizarEtapa1();
  else atualizarEtapa2();
}

function irParaEtapa2() {
  const erro = validarNome(escolha.nome);
  if (erro) {
    $('criacao-erro').textContent = erro;
    $('criacao-nome').focus();
    return;
  }
  mostrarEtapa(2);
}

// Personagem meditando, no visual do 1º reino
function atualizarEtapa1() {
  document.querySelectorAll('#escolha-sexo .carta-escolha').forEach((carta) => {
    carta.classList.toggle('selecionada', carta.dataset.sexo === escolha.sexo);
    desenharPersonagem(carta.querySelector('canvas'), 'corpo_temperado', 'meditando',
      { sexo: carta.dataset.sexo, classe: 'elemental' });   // classe ainda não escolhida: túnica de cultivador
  });
  $('criacao-nome').setAttribute('maxlength', TAMANHO_DO_NOME.maximo);
}

// Cada classe em pose de combate (com o sexo escolhido), mostrando o golpe de vez em quando
function atualizarEtapa2() {
  const cartas = document.querySelectorAll('#escolha-classe .carta-escolha');
  cartas.forEach((carta) => {
    carta.classList.toggle('selecionada', carta.dataset.classe === escolha.classe);
    desenharPersonagem(carta.querySelector('canvas'), 'corpo_temperado', 'combate',
      { sexo: escolha.sexo, classe: carta.dataset.classe });
  });
  $('criacao-confirmar').disabled = !escolha.classe;
  $('criacao-confirmar').textContent = escolha.classe
    ? `Iniciar jornada como ${CLASSES.find(c => c.id === escolha.classe).nome}`
    : 'Escolha uma classe';

  clearInterval(demonstracao);
  demonstracao = setInterval(() => {
    cartas.forEach((carta, i) => setTimeout(() => mostrarQuadro(carta.querySelector('canvas'), 2, 350), i * 250));
  }, 2200);
}
