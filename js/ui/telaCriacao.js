// =============================================================
// ui/telaCriacao.js — TELA DE CRIAÇÃO DE PERSONAGEM
//   v0.30.0 (layout novo, docs/layout/layout_criacao_1.png e _2.png): 2 telas que cabem sem rolar
//   Etapa 1: sexo (cartas com a ilustração) e nome (com o dado que sorteia um nome)
//   Etapa 2: classe (Refinador Corporal, Mestre da Espada, Cultivador Elemental) em linhas,
//            com a imagem do herói no sexo escolhido, a passiva e a técnica da escolhida
// =============================================================
import { CLASSES, SEXOS, TAMANHO_DO_NOME } from '../dados/classes.js';
import { validarNome } from '../sistemas/personagem.js';

const $ = (id) => document.getElementById(id);

// Ícone de cada classe na lista (img/ui/, os mesmos das orbes da tela Personagem)
const ICONE_CLASSE = { corpo: 'pers_tecnica_corpo', arma: 'pers_tecnica_arma', elemental: 'pers_passiva_elemental' };

// Nomes sorteados pelo dado (sobrenome + nome, no estilo dos romances de cultivo)
const SOBRENOMES = ['Lin', 'Xiao', 'Mu', 'Ye', 'Han', 'Bai', 'Qin', 'Su', 'Long', 'Chu', 'Yun', 'Gu', 'Shen', 'Lu', 'Feng', 'Jiang'];
const NOMES = {
  masculino: ['Feng', 'Chen', 'Yun', 'Hao', 'Tian', 'Xuan', 'Jian', 'Lei', 'Ming', 'Yu', 'Zhan', 'Wuji', 'Kong', 'Fan'],
  feminino: ['Xue', 'Lian', 'Yue', 'Ling', 'Mei', 'Qing', 'Yan', 'Xin', 'Lan', 'Hua', 'Rou', 'Yao', 'Ning', 'Shuang'],
};
const sortear = (lista) => lista[Math.floor(Math.random() * lista.length)];

// O que o jogador escolheu até agora
const escolha = { sexo: 'masculino', nome: '', classe: null };
let soClasse = false;      // v0.27.2: só trocar a classe (a antiga saiu do jogo); nome e sexo ficam
let aoConfirmarGuardado = null;

export function montarTelaCriacao(aoConfirmar) {
  aoConfirmarGuardado = aoConfirmar;

  // ---- Cartas de sexo ----
  const caixaSexo = $('escolha-sexo');
  for (const sexo of SEXOS) {
    const carta = document.createElement('button');
    carta.className = 'ui cri-carta';
    carta.dataset.sexo = sexo.id;
    carta.innerHTML = `<img class="cri-carta-arte" src="img/ui/criacao_${sexo.id}.jpg" alt="">
      <span class="cri-carta-moldura ui-carta-moldura"></span>
      <span class="cri-carta-rotulo ui-carta-rotulo">${sexo.nome}</span>`;
    carta.addEventListener('click', () => { escolha.sexo = sexo.id; atualizarEtapa1(); });
    caixaSexo.appendChild(carta);
  }

  // ---- Linhas de classe ----
  const caixaClasse = $('escolha-classe');
  for (const classe of CLASSES) {
    const linha = document.createElement('button');
    linha.className = 'ui cri-classe';
    linha.dataset.classe = classe.id;
    // v0.9.4 (dono): os bônus de atributo da classe ficam escondidos (só no código); aparece a habilidade passiva
    linha.innerHTML = `<span class="cri-classe-moldura ui-classe-linha"></span>
      <span class="cri-classe-arte cri-arte-${classe.id}"><img alt=""></span>
      <span class="cri-classe-texto"><b>${classe.nome}</b><small>Passiva — ${classe.nomeEspecial}: ${classe.textoEspecial}</small></span>
      <span class="cri-classe-icone"><img src="img/ui/${ICONE_CLASSE[classe.id] ?? 'bb_icone_lotus'}.png" alt=""></span>`;
    linha.title = classe.descricao;
    linha.addEventListener('click', () => { escolha.classe = classe.id; atualizarEtapa2(); });
    caixaClasse.appendChild(linha);
  }

  // ---- Nome e botões ----
  $('criacao-nome').setAttribute('maxlength', TAMANHO_DO_NOME.maximo);
  $('criacao-nome').addEventListener('input', (e) => {
    escolha.nome = e.target.value;
    $('criacao-erro').textContent = '';
  });
  $('criacao-nome').addEventListener('keydown', (e) => { if (e.key === 'Enter') irParaEtapa2(); });
  $('criacao-dado').addEventListener('click', () => {
    escolha.nome = `${sortear(SOBRENOMES)} ${sortear(NOMES[escolha.sexo] ?? NOMES.masculino)}`;
    $('criacao-nome').value = escolha.nome;
    $('criacao-erro').textContent = '';
  });
  $('criacao-continuar').addEventListener('click', irParaEtapa2);
  $('passo-1').addEventListener('click', () => { if (!soClasse) mostrarEtapa(1); });
  $('passo-2').addEventListener('click', irParaEtapa2);
  $('criacao-confirmar').addEventListener('click', () => {
    if (!escolha.classe || validarNome(escolha.nome)) return;
    fecharCriacao();
    aoConfirmarGuardado({ ...escolha, nome: escolha.nome.trim() });
  });
}

// atual = personagem que já existe, quando só a classe precisa ser trocada (v0.27.2)
export function abrirCriacao(atual = null) {
  soClasse = Boolean(atual);
  escolha.sexo = atual?.sexo ?? 'masculino';
  escolha.nome = atual?.nome ?? '';
  escolha.classe = null;
  $('criacao-nome').value = escolha.nome;
  $('criacao-erro').textContent = '';
  $('criacao-aviso-classe').classList.toggle('escondido', !soClasse);
  $('criacao-sub-classe').classList.toggle('escondido', soClasse);
  $('criacao-titulo-classe').innerHTML = soClasse ? 'Escolha um novo<br>caminho marcial' : 'Escolha seu<br>caminho marcial';
  $('criacao').classList.remove('escondido');
  mostrarEtapa(soClasse ? 2 : 1);
}

function fecharCriacao() {
  $('criacao').classList.add('escondido');
}

function mostrarEtapa(numero) {
  $('criacao-etapa1').classList.toggle('escondido', numero !== 1);
  $('criacao-etapa2').classList.toggle('escondido', numero !== 2);
  $('passo-1').classList.toggle('ativo', numero === 1);
  $('passo-2').classList.toggle('ativo', numero === 2);
  $('passo-1').disabled = soClasse;
  if (numero === 1) atualizarEtapa1();
  else atualizarEtapa2();
}

function irParaEtapa2() {
  const erro = validarNome(escolha.nome);
  if (erro) {
    $('criacao-erro').textContent = erro;
    if ($('criacao-etapa1').classList.contains('escondido')) mostrarEtapa(1);
    $('criacao-nome').focus();
    return;
  }
  mostrarEtapa(2);
}

// A carta escolhida ganha a moldura verde
function atualizarEtapa1() {
  document.querySelectorAll('#escolha-sexo .cri-carta').forEach((carta) => {
    const ativa = carta.dataset.sexo === escolha.sexo;
    carta.classList.toggle('selecionada', ativa);
    const moldura = carta.querySelector('.cri-carta-moldura');
    moldura.classList.toggle('ui-carta-moldura-ativa', ativa);
    moldura.classList.toggle('ui-carta-moldura', !ativa);
  });
}

// Cada classe com o herói da vitrine no sexo escolhido; a escolhida ganha a moldura dourada
function atualizarEtapa2() {
  document.querySelectorAll('#escolha-classe .cri-classe').forEach((linha) => {
    const ativa = linha.dataset.classe === escolha.classe;
    linha.classList.toggle('selecionada', ativa);
    const moldura = linha.querySelector('.cri-classe-moldura');
    moldura.classList.toggle('ui-classe-linha-ativa', ativa);
    moldura.classList.toggle('ui-classe-linha', !ativa);
    const arte = linha.querySelector('.cri-classe-arte img');
    const caminho = `img/ui/vitrine_${escolha.sexo}_${linha.dataset.classe}.png`;
    if (arte.getAttribute('src') !== caminho) arte.src = caminho;
  });
  const classe = CLASSES.find(c => c.id === escolha.classe);
  $('criacao-tecnica').innerHTML = classe?.tecnica
    ? `<b>✦ ${classe.tecnica.nome}</b> — ${classe.tecnica.texto}`
    : 'Toque num caminho para ver a técnica especial dele.';
  $('criacao-confirmar').disabled = !escolha.classe;
  $('criacao-confirmar').textContent = soClasse ? 'Seguir jornada' : 'Começar jornada';
}
