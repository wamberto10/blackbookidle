// =============================================================
// ui/sprite.js — SPRITES EM PIXEL ART (arquivos PNG da pasta img/)
//
// Os PNGs são gerados por ferramentas/sprites/gerar.py.
// Personagens e inimigos têm 2 quadros lado a lado (32×32 cada);
// este arquivo alterna os quadros para dar a animação de "respirar".
// =============================================================
import { APARENCIAS, APARENCIA_PADRAO } from '../dados/aparencias.js';
import { PERSONAGEM_PADRAO } from '../dados/classes.js';
import { SPRITES } from '../dados/sprites.js';

const TAMANHO = 32;          // cada quadro tem 32×32 pixels
const TEMPO_DO_QUADRO = 550; // milissegundos entre um quadro e outro

const imagens = {};          // imagens já carregadas (para não baixar de novo)
const animados = new Map();  // canvas → imagem que ele está mostrando
const quadrosForcados = new Map(); // canvas → { quadro, ate } (ex.: pose de ataque por um instante)
let quadroAtual = 0;

function carregar(caminho) {
  if (!imagens[caminho]) {
    const img = new Image();
    img.src = caminho;
    imagens[caminho] = img;
  }
  return imagens[caminho];
}

function desenharQuadro(canvas, img) {
  // O tamanho do quadro é a altura da imagem (32×32 nos desenhos feitos por código,
  // 48×48 na arte feita em IA). O canvas usa o mesmo tamanho para não borrar.
  const tamanho = img.naturalHeight || TAMANHO;
  if (canvas.width !== tamanho) {
    canvas.width = tamanho;
    canvas.height = tamanho;
    // Arte grande de IA (96 px) é reduzida no celular: redução suave fica mais bonita
    canvas.style.imageRendering = tamanho > 68 ? 'auto' : '';
  }
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const forcado = quadrosForcados.get(canvas);
  const quadro = forcado && Date.now() < forcado.ate ? forcado.quadro : quadroAtual;
  ctx.drawImage(img, quadro * tamanho, 0, tamanho, tamanho, 0, 0, tamanho, tamanho);
}

// Mostra um quadro específico da folha por alguns milissegundos.
// Ex.: mostrarQuadro(canvas, 2, 300) → pose de ataque do personagem
export function mostrarQuadro(canvas, quadro, milissegundos) {
  quadrosForcados.set(canvas, { quadro, ate: Date.now() + milissegundos });
  const img = animados.get(canvas);
  if (img?.complete) desenharQuadro(canvas, img);
  setTimeout(() => { if (img?.complete) desenharQuadro(canvas, img); }, milissegundos + 10);
}

// Liga um canvas a uma imagem animada
function mostrar(canvas, caminho) {
  const img = carregar(caminho);
  animados.set(canvas, img);
  if (img.complete && img.naturalWidth) desenharQuadro(canvas, img);
  else img.addEventListener('load', () => desenharQuadro(canvas, img), { once: true });
}

// Alterna os quadros de todos os sprites animados
setInterval(() => {
  quadroAtual = 1 - quadroAtual;
  for (const [canvas, img] of animados) {
    if (img.complete && img.naturalWidth) desenharQuadro(canvas, img);
  }
}, TEMPO_DO_QUADRO);

// ---- Usados pelo jogo ----

// pose: 'meditando' (tela inicial) ou 'combate'
// personagem: { sexo, classe } — define qual desenho usar
export function desenharPersonagem(canvas, idReino, pose = 'meditando', personagem = PERSONAGEM_PADRAO) {
  const { sexo, classe } = personagem;
  // Meditando: usa a arte da classe (mesma roupa do combate) quando existe; senão, a meditação por sexo
  const temMeditacaoDaClasse = SPRITES.personagem.arteIA?.includes(`${sexo}_${classe}_meditando`);
  const arquivo = pose !== 'meditando' ? `${sexo}_${classe}_combate_${idReino}`
    : temMeditacaoDaClasse ? `${sexo}_${classe}_meditando_${idReino}`
    : `${sexo}_meditando_${idReino}`;
  mostrar(canvas, `img/personagem/${arquivo}.png`);
}

export function spriteDoInimigo(inimigo) {
  return APARENCIAS[inimigo.nome] ?? APARENCIA_PADRAO[inimigo.forma] ?? APARENCIA_PADRAO.humano;
}

export function desenharInimigo(canvas, fase) {
  mostrar(canvas, `img/inimigos/${spriteDoInimigo(fase.inimigo)}.png`);
  // Chefes e mini-chefes aparecem maiores e com brilho vermelho (ver CSS)
  const forte = fase.chaveTipo === 'chefe' || fase.chaveTipo === 'miniChefe';
  canvas.classList.toggle('sprite-chefe', forte);
}

// Ícone 16×16 como HTML. Ex.: icone('pedra') → <img src="img/icones/pedra.png">
export function icone(nome, classe = '') {
  return `<img class="icone-px ${classe}" src="img/icones/${nome}.png" alt="">`;
}

// Ícone de cada mapa: mapa01.png ... mapa12.png
export function iconeDoMapa(indiceMapa, classe = '') {
  return icone(`mapa${String(indiceMapa + 1).padStart(2, '0')}`, classe);
}

// Caminho da folha de um efeito de combate (3 quadros de 32×32)
export function caminhoDoEfeito(nome) {
  return `img/efeitos/${nome}.png`;
}

export function iconeEquipamento(tipo, raridade, classe = '') {
  return `<img class="icone-px ${classe}" src="img/equipamentos/${tipo}_${raridade}.png" alt="">`;
}
