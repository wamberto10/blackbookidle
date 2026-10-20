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
import { mapaVisual } from '../sistemas/escala.js';

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
  const temForcado = forcado && Date.now() < forcado.ate;
  // v0.20.0: sprites "vivos" (personagem e inimigos grandes) usam sempre o quadro parado e são
  // deformados aos poucos — cabelo e barra da roupa balançam, o peito respira, os pés ficam no chão
  if (vivos.has(canvas) && tamanho > 68) {
    desenharVivo(ctx, img, temForcado ? forcado.quadro : 0, tamanho, performance.now() / 1000 + (fases.get(canvas) ?? 0));
    return;
  }
  const quadro = temForcado ? forcado.quadro : quadroAtual;
  ctx.drawImage(img, quadro * tamanho, 0, tamanho, tamanho, 0, 0, tamanho, tamanho);
}

// ---- v0.20.0: animação por deformação (sem precisar de mais quadros desenhados) ----
const vivos = new Set();      // canvas animados continuamente
const fases = new Map();      // canvas → atraso do balanço (cada um num ritmo)
const FAIXA = 2;              // altura de cada faixa redesenhada (px da arte)

function desenharVivo(ctx, img, quadro, T, t) {
  const respiro = (Math.sin(t * 2.3) + 1) / 2;              // 0 → 1 → 0
  const x0 = quadro * T;
  for (let y = 0; y < T; y += FAIXA) {
    const v = y / T;                                         // 0 = topo, 1 = pés
    // balanço: forte no cabelo (topo) e na barra da roupa, zero nos pés
    const peso = 0.55 * Math.pow(1 - v, 2) + Math.max(0, Math.min(1, (v - 0.5) / 0.35)) * Math.max(0, Math.min(1, (0.97 - v) / 0.1));
    const dx = Math.sin(t * 1.7 + v * 6) * 1.8 * peso + Math.sin(t * 3.1 + v * 11) * 0.5 * peso;
    // respiração: a parte de cima sobe um pouco
    const dy = -respiro * 2.2 * Math.max(0, (0.62 - v) / 0.62);
    ctx.drawImage(img, x0, y, T, FAIXA, dx, y + dy, T, FAIXA + 1);
  }
}

let ultimoVivo = 0;
function laçoVivo(agora) {
  if (agora - ultimoVivo > 33 && !document.hidden) {        // ~30 quadros por segundo
    ultimoVivo = agora;
    const painelAberto = document.querySelector('.painel.aberto');
    const visivel = (canvas) => canvas.offsetParent && !(painelAberto && !painelAberto.contains(canvas));
    for (const canvas of vivos) {
      if (!canvas.isConnected) { vivos.delete(canvas); continue; }
      if (!visivel(canvas)) continue;                        // escondido (outra aba) ou atrás de um painel
      const img = animados.get(canvas);
      if (img?.complete && img.naturalWidth) desenharQuadro(canvas, img);
    }
    for (const canvas of meditacoes.keys()) {                // v0.34.0: meditação viva da tela inicial
      if (!canvas.isConnected) { meditacoes.delete(canvas); continue; }
      if (visivel(canvas)) desenharMeditacao(canvas, agora);
    }
  }
  requestAnimationFrame(laçoVivo);
}

// ---- v0.34.0: MEDITAÇÃO DA TELA INICIAL COM QUADROS DESENHADOS (pedido do dono) ----
// img/personagem/vivo/<sexo>_<classe>_meditando.webp = tira com os 4 quadros desenhados no ChatGPT
// (docs/PROMPTS_TELA_INICIAL.md; recortados e alinhados por ferramentas/sprites/quadros_desenhados.py).
// Toca 1 → 2 → 3 → 4 → 3 → 2 em ciclo, um quadro a cada `passo` ms; no fim de cada quadro o próximo aparece por
// cima em `transicao` do tempo (0 = troca seca, como desenho animado). A faixa vermelha do herói ganha a cor do reino
// aqui — a mesma regra de importar_ia.recolorir_faixa_forte.
const MEDITACAO = { passo: 450, transicao: 0.35 };
const SEM_COR_DO_REINO = new Set(['elemental']);   // o Elemental de fogo tem vermelho na roupa inteira
const meditacoes = new Map();      // canvas → { folha (já pintada), lado, ordem (sequência de quadros) }
const folhasPintadas = new Map();  // "arquivo|cor" → Promise<canvas>

function rgbParaHls(r, g, b) {     // = colorsys.rgb_to_hls (valores de 0 a 1)
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
  if (max === min) return [0, l, 0];
  const d = max - min;
  const s = l <= 0.5 ? d / (max + min) : d / (2 - max - min);
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h / 6, l, s];
}
function hlsParaRgb(h, l, s) {     // = colorsys.hls_to_rgb
  if (s === 0) return [l, l, l];
  const m2 = l <= 0.5 ? l * (1 + s) : l + s - l * s, m1 = 2 * l - m2;
  const v = (t) => {
    t = ((t % 1) + 1) % 1;
    if (t < 1 / 6) return m1 + (m2 - m1) * t * 6;
    if (t < 0.5) return m2;
    if (t < 2 / 3) return m1 + (m2 - m1) * (2 / 3 - t) * 6;
    return m1;
  };
  return [v(h + 1 / 3), v(h), v(h - 1 / 3)];
}

// Copia a folha num canvas e troca o vermelho forte da faixa pela cor do reino (mantém a luz e a sombra)
function pintarFaixa(img, corHex) {
  const folha = document.createElement('canvas');
  folha.width = img.naturalWidth;
  folha.height = img.naturalHeight;
  const ctx = folha.getContext('2d');
  ctx.drawImage(img, 0, 0);
  if (!corHex) return folha;
  const n = parseInt(corHex.slice(1), 16);
  const [hNovo, , sNovo] = rgbParaHls((n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255);
  const sat = Math.min(1, sNovo * 1.1);
  const dados = ctx.getImageData(0, 0, folha.width, folha.height);
  const p = dados.data;
  for (let i = 0; i < p.length; i += 4) {
    const r = p[i], g = p[i + 1], b = p[i + 2];
    if (p[i + 3] > 0 && r > 50 && g < r * 0.45 && b < r * 0.5) {
      const [, l] = rgbParaHls(r / 255, g / 255, b / 255);
      const [nr, ng, nb] = hlsParaRgb(hNovo, l, sat);
      p[i] = Math.round(nr * 255); p[i + 1] = Math.round(ng * 255); p[i + 2] = Math.round(nb * 255);
    }
  }
  ctx.putImageData(dados, 0, 0);
  return folha;
}

function carregarPintada(arquivo, cor) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(pintarFaixa(img, cor));
    img.onerror = reject;
    img.src = arquivo;
  });
}

// 4 quadros → 0 1 2 3 2 1 (vai e volta, sem repetir as pontas)
const ordemDosQuadros = (n) => (n < 3 ? [...Array(n).keys()] : [...Array(n).keys(), ...Array.from({ length: n - 2 }, (_, i) => n - 2 - i)]);

function desenharMeditacao(canvas, agora) {
  const { folha, lado, ordem } = meditacoes.get(canvas);
  const pos = (agora / MEDITACAO.passo) % ordem.length;
  const i = Math.floor(pos);
  const f = pos - i;
  const mistura = MEDITACAO.transicao > 0 ? Math.max(0, (f - (1 - MEDITACAO.transicao)) / MEDITACAO.transicao) : 0;
  if (canvas.width !== lado) { canvas.width = lado; canvas.height = lado; }
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.clearRect(0, 0, lado, lado);
  ctx.globalAlpha = 1;
  ctx.drawImage(folha, ordem[i] * lado, 0, lado, lado, 0, 0, lado, lado);
  if (mistura > 0) {                                         // o próximo quadro aparece por cima, no fim deste
    ctx.globalAlpha = mistura;
    ctx.drawImage(folha, ordem[(i + 1) % ordem.length] * lado, 0, lado, lado, 0, 0, lado, lado);
    ctx.globalAlpha = 1;
  }
}

// reino = REINOS[...] (usa id e corManto). Enquanto a folha carrega — ou se ela não existir — fica a meditação antiga.
export function desenharMeditacaoViva(canvas, reino, personagem = PERSONAGEM_PADRAO) {
  const { sexo, classe } = personagem;
  const arquivo = `img/personagem/vivo/${sexo}_${classe}_meditando.webp`;
  const cor = SEM_COR_DO_REINO.has(classe) ? null : reino.corManto;
  const chave = `${arquivo}|${cor}`;
  if (canvas.dataset.meditacao === chave) return;
  canvas.dataset.meditacao = chave;
  if (!meditacoes.has(canvas)) { desenharPersonagem(canvas, reino.id, 'meditando', personagem); animarVivo(canvas); }
  if (!folhasPintadas.has(chave)) folhasPintadas.set(chave, carregarPintada(arquivo, cor));
  folhasPintadas.get(chave).then((folha) => {
    if (canvas.dataset.meditacao !== chave) return;          // mudou de reino/classe enquanto carregava
    animados.delete(canvas);
    vivos.delete(canvas);
    const lado = folha.height;
    canvas.width = lado;
    canvas.height = lado;
    canvas.style.imageRendering = 'auto';
    meditacoes.set(canvas, { folha, lado, ordem: ordemDosQuadros(Math.round(folha.width / lado)) });
    desenharMeditacao(canvas, performance.now());
  }).catch(() => {
    folhasPintadas.delete(chave);
    if (canvas.dataset.meditacao !== chave) return;
    meditacoes.delete(canvas);
    desenharPersonagem(canvas, reino.id, 'meditando', personagem);
    animarVivo(canvas);
  });
}
requestAnimationFrame(laçoVivo);

// Liga/desliga a animação viva de um canvas
export function animarVivo(canvas, ligado = true) {
  if (ligado) { vivos.add(canvas); if (!fases.has(canvas)) fases.set(canvas, Math.random() * 10); }
  else vivos.delete(canvas);
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
  else img.addEventListener('load', () => { if (animados.get(canvas) === img) desenharQuadro(canvas, img); }, { once: true });
}

// Alterna os quadros de todos os sprites animados
setInterval(() => {
  quadroAtual = 1 - quadroAtual;
  for (const [canvas, img] of animados) {
    if (vivos.has(canvas)) continue;
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

// Inimigo pelo nome do sprite (ex.: 'mestre_ying_yue'), usado pelo Evento de Boss
export function desenharSpriteDeInimigo(canvas, aparencia) {
  mostrar(canvas, `img/inimigos/${aparencia}.png`);
}

// Ícone 16×16 como HTML. Ex.: icone('pedra') → <img src="img/icones/pedra.png">
export function icone(nome, classe = '') {
  return `<img class="icone-px ${classe}" src="img/icones/${nome}.png" alt="">`;
}

// Ícone de cada mapa: mapa01.png ... mapa96.png. v0.32.0: recebe o mapa GLOBAL — a Normal em diante usa o
// ícone do mapa desenhado (global % 96), nunca um arquivo mapa97.png que não existe
export function iconeDoMapa(indiceMapa, classe = '') {
  // v0.18.0: mapa novo ainda sem ícone de IA → mostra o ícone da aba Mapa (em vez de imagem quebrada)
  return `<img class="icone-px ${classe}" src="img/icones/mapa${String(mapaVisual(indiceMapa) + 1).padStart(2, '0')}.png" alt=""` +
    ` onerror="this.onerror=null;this.src='img/icones/aba_mapa.png'">`;
}

// Caminho da folha de um efeito de combate (3 quadros de 32×32)
export function caminhoDoEfeito(nome) {
  return `img/efeitos/${nome}.png`;
}

export function iconeEquipamento(tipo, raridade, classe = '') {
  return `<img class="icone-px ${classe}" src="img/equipamentos/${tipo}_${raridade}.png" alt="">`;
}
