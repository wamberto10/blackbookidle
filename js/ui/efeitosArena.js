// =============================================================
// ui/efeitosArena.js — PARTÍCULAS DA ARENA (v0.18.0)
// Uma camada <canvas> por cima da arena de combate desenha faíscas, rastros,
// ondas de choque e a energia da técnica especial. Não precisa de imagem:
// tudo é desenhado por código, com a cor de cada classe.
// O laço de desenho só roda enquanto houver partículas vivas.
// =============================================================

// Cores de cada classe: [principal, brilho]
export const CORES_DA_CLASSE = {
  corpo:      ['#ffc94a', '#fff2c0'],   // sangue dourado
  arma:       ['#cfe6ff', '#ffffff'],   // intenção da espada
  elemental:  ['#6fd8ff', '#e8fbff'],   // gelo místico
  alma:       ['#b070ff', '#f0d8ff'],   // fogo da alma
  alquimista: ['#7aef5a', '#ffd36b'],   // chama alquímica
};
const COR_DO_INIMIGO = ['#ff6a4a', '#ffd0b0'];

let canvas = null;
let ctx = null;
let arena = null;
const particulas = [];
let rodando = false;

function preparar() {
  if (canvas) return true;
  arena = document.getElementById('arena');
  if (!arena) return false;
  canvas = document.createElement('canvas');
  canvas.className = 'arena-fx';
  arena.appendChild(canvas);
  ctx = canvas.getContext('2d');
  return true;
}

function ajustarTamanho() {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const w = arena.clientWidth, h = arena.clientHeight;
  if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

// Centro do corpo de um lutador ('jogador' | 'inimigo'), em pixels da arena
export function posicaoDe(lado, alturaRelativa = 0.55) {
  if (!preparar()) return { x: 0, y: 0 };
  const corpo = document.getElementById(`cb-sprite-${lado}`);
  const a = arena.getBoundingClientRect();
  const c = corpo.getBoundingClientRect();
  return { x: c.left - a.left + c.width / 2, y: c.top - a.top + c.height * (1 - alturaRelativa) };
}

function iniciar() {
  if (rodando) return;
  rodando = true;
  let anterior = performance.now();
  const passo = (agora) => {
    const dt = Math.min(0.05, (agora - anterior) / 1000);
    anterior = agora;
    ajustarTamanho();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'lighter';     // brilho que soma (fica mais forte onde junta)
    for (let i = particulas.length - 1; i >= 0; i--) {
      const p = particulas[i];
      p.vida -= dt;
      if (p.vida <= 0) { particulas.splice(i, 1); continue; }
      if (p.voo) {                                    // projétil: vai de A até B em arco
        p.voo.t = Math.min(1, p.voo.t + dt / p.voo.dur);
        const k = p.voo.t;
        p.x = p.voo.ax + (p.voo.bx - p.voo.ax) * k;
        p.y = p.voo.ay + (p.voo.by - p.voo.ay) * k - Math.sin(k * Math.PI) * p.voo.arco;
        if (k >= 1 && !p.voo.chegou) { p.voo.chegou = true; p.vida = 0.05; p.voo.aoChegar?.(); }
      }
      if (p.alvo) {                                   // energia sendo sugada para um ponto
        p.vx += (p.alvo.x - p.x) * 18 * dt;
        p.vy += (p.alvo.y - p.y) * 18 * dt;
      }
      const x0 = p.x, y0 = p.y;
      if (!p.voo) {                                   // projétil: posição já calculada acima
        p.vx *= Math.pow(p.atrito, dt * 60);
        p.vy = p.vy * Math.pow(p.atrito, dt * 60) + p.grav * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
      }
      const t = p.vida / p.max;                       // 1 → 0
      ctx.globalAlpha = Math.min(1, t * 1.6);
      if (p.tipo === 'arco') {
        const prog = 1 - t;                                   // o corte "varre" o arco
        ctx.strokeStyle = p.cor;
        ctx.lineWidth = p.tam * t + 1;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.raio, p.inicio, p.inicio + (p.fim - p.inicio) * Math.min(1, prog * 2.2), p.anti);
        ctx.stroke();
      } else if (p.tipo === 'anel') {
        const r = p.raio + (1 - t) * p.cresce;
        ctx.strokeStyle = p.cor;
        ctx.lineWidth = Math.max(1, p.tam * t);
        ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.stroke();
      } else if (p.tipo === 'faisca') {
        ctx.strokeStyle = p.cor;
        ctx.lineWidth = p.tam * t + 0.5;
        ctx.beginPath(); ctx.moveTo(x0 - p.vx * 0.03, y0 - p.vy * 0.03); ctx.lineTo(p.x, p.y); ctx.stroke();
      } else if (p.tipo === 'rastro') {
        ctx.strokeStyle = p.cor;
        ctx.lineWidth = p.tam * t;
        ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(p.x1, p.y1); ctx.lineTo(p.x2, p.y2); ctx.stroke();
      } else {
        const tam = p.tam * (0.4 + 0.6 * t);
        ctx.fillStyle = p.cor;
        ctx.fillRect(p.x - tam / 2, p.y - tam / 2, tam, tam);   // quadradinho: combina com o pixel art
      }
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    if (particulas.length) requestAnimationFrame(passo);
    else { rodando = false; ctx.clearRect(0, 0, canvas.width, canvas.height); }
  };
  requestAnimationFrame(passo);
}

function adicionar(p) {
  particulas.push({ vx: 0, vy: 0, grav: 0, atrito: 0.92, tam: 3, tipo: 'ponto', ...p, max: p.vida });
  if (particulas.length > 600) particulas.splice(0, particulas.length - 600);
}

// ---------------------------------------------------------------
// Efeitos prontos
// ---------------------------------------------------------------

// Faíscas saindo do ponto do impacto. direcao: 1 = para a direita, -1 = esquerda
export function impacto(lado, cores, { forte = false, direcao = 1 } = {}) {
  if (!preparar()) return;
  const { x, y } = posicaoDe(lado);
  const qtd = forte ? 34 : 16;
  for (let i = 0; i < qtd; i++) {
    const ang = (Math.random() - 0.5) * Math.PI * 1.3 + (direcao > 0 ? 0 : Math.PI);
    const vel = (forte ? 260 : 170) * (0.4 + Math.random());
    adicionar({
      x, y, vx: Math.cos(ang) * vel, vy: Math.sin(ang) * vel - 40, grav: 260,
      vida: 0.35 + Math.random() * 0.35, cor: cores[i % 2], tam: forte ? 3.5 : 2.5,
      tipo: i % 3 === 0 ? 'ponto' : 'faisca',
    });
  }
  if (forte) onda(lado, cores[1], 0.35, 70);
  iniciar();
}

// Onda de choque (anel que cresce)
export function onda(lado, cor, vida = 0.4, cresce = 80) {
  if (!preparar()) return;
  const { x, y } = posicaoDe(lado);
  adicionar({ x, y, tipo: 'anel', raio: 6, cresce, vida, cor, tam: 5, atrito: 1 });
  iniciar();
}

// Energia se juntando no lutador (carga da técnica)
export function carga(lado, cores, duracao = 0.35) {
  if (!preparar()) return;
  const alvo = posicaoDe(lado);
  for (let i = 0; i < 26; i++) {
    const ang = Math.random() * Math.PI * 2;
    const dist = 55 + Math.random() * 45;
    adicionar({
      x: alvo.x + Math.cos(ang) * dist, y: alvo.y + Math.sin(ang) * dist,
      alvo, atrito: 0.8, vida: duracao * (0.6 + Math.random() * 0.4), cor: cores[i % 2], tam: 3,
    });
  }
  iniciar();
}

// Rastro de luz entre os dois lutadores (golpe da técnica)
export function rastro(de, para, cores) {
  if (!preparar()) return;
  const a = posicaoDe(de), b = posicaoDe(para);
  adicionar({ tipo: 'rastro', x: 0, y: 0, x1: a.x, y1: a.y, x2: b.x, y2: b.y, vida: 0.22, cor: cores[0], tam: 10, atrito: 1 });
  adicionar({ tipo: 'rastro', x: 0, y: 0, x1: a.x, y1: a.y, x2: b.x, y2: b.y, vida: 0.18, cor: cores[1], tam: 4, atrito: 1 });
  // faíscas espalhadas ao longo do caminho
  for (let i = 0; i < 18; i++) {
    const t = Math.random();
    adicionar({
      x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t + (Math.random() - 0.5) * 10,
      vx: (Math.random() - 0.5) * 60, vy: -30 - Math.random() * 60, grav: 120,
      vida: 0.3 + Math.random() * 0.3, cor: cores[i % 2], tam: 2.5,
    });
  }
  iniciar();
}

// Explosão grande da técnica: faíscas + 2 ondas
export function explosaoDaTecnica(lado, cores) {
  impacto(lado, cores, { forte: true });
  onda(lado, cores[0], 0.5, 120);
  setTimeout(() => onda(lado, cores[1], 0.45, 90), 70);
}

// Inimigo se desfazendo em pó subindo (morte)
export function desfazer(lado, cores) {
  if (!preparar()) return;
  const corpo = document.getElementById(`cb-sprite-${lado}`);
  const a = arena.getBoundingClientRect();
  const c = corpo.getBoundingClientRect();
  for (let i = 0; i < 70; i++) {
    adicionar({
      x: c.left - a.left + c.width * (0.25 + Math.random() * 0.5),
      y: c.top - a.top + c.height * (0.2 + Math.random() * 0.75),
      vx: (Math.random() - 0.5) * 50, vy: -40 - Math.random() * 90, grav: -30, atrito: 0.97,
      vida: 0.6 + Math.random() * 0.6, cor: cores[i % cores.length], tam: 2 + Math.random() * 2.5,
    });
  }
  iniciar();
}

export function coresDoAtacante(atacante, classe) {
  return atacante === 'jogador' ? (CORES_DA_CLASSE[classe?.id] ?? CORES_DA_CLASSE.arma) : COR_DO_INIMIGO;
}

// ---------------------------------------------------------------
// v0.20.0: projéteis, cortes em arco e a técnica de cada classe
// ---------------------------------------------------------------
export function projetil(de, para, cor, { arco = 30, dur = 0.28, tam = 6, aoChegar } = {}) {
  if (!preparar()) return;
  const a = posicaoDe(de), b = posicaoDe(para);
  adicionar({ x: a.x, y: a.y, vida: dur + 0.2, cor, tam, atrito: 1,
    voo: { ax: a.x, ay: a.y, bx: b.x + (Math.random() - 0.5) * 16, by: b.y + (Math.random() - 0.5) * 20, t: 0, dur, arco, aoChegar } });
  iniciar();
}

export function corteEmArco(lado, cores, { raio = 46, grosso = 9 } = {}) {
  if (!preparar()) return;
  const { x, y } = posicaoDe(lado);
  adicionar({ tipo: 'arco', x, y, raio, inicio: -2.3, fim: 1.2, anti: false, vida: 0.32, cor: cores[0], tam: grosso, atrito: 1 });
  adicionar({ tipo: 'arco', x, y, raio: raio - 3, inicio: -2.3, fim: 1.2, anti: false, vida: 0.26, cor: cores[1], tam: grosso / 2.5, atrito: 1 });
  iniciar();
}

// Rachaduras no chão (Corpo): linhas que saem do pé do inimigo
function rachaduras(lado, cor) {
  const { x } = posicaoDe(lado);
  const y = posicaoDe(lado, 0.04).y;
  for (let i = 0; i < 7; i++) {
    const ang = Math.PI + (i / 6) * Math.PI;              // meia-lua para cima
    const len = 28 + Math.random() * 30;
    adicionar({ tipo: 'rastro', x: 0, y: 0, x1: x, y1: y, x2: x + Math.cos(ang) * len * 1.6, y2: y + Math.sin(ang) * len * 0.35,
      vida: 0.55, cor, tam: 3, atrito: 1 });
  }
}

// Chamas subindo em volta do alvo (Alma e Alquimista)
function chamas(lado, cores, qtd = 26) {
  const { x, y } = posicaoDe(lado, 0.2);
  for (let i = 0; i < qtd; i++) {
    adicionar({ x: x + (Math.random() - 0.5) * 70, y: y - Math.random() * 20, vx: (Math.random() - 0.5) * 20, vy: -60 - Math.random() * 110,
      grav: -40, atrito: 0.97, vida: 0.5 + Math.random() * 0.5, cor: cores[i % 2], tam: 3 + Math.random() * 3 });
  }
}

// Técnica especial: cada classe com a sua coreografia (as imagens tec_*.png tocam junto, por cima)
export function tecnicaDaClasse(id, cores) {
  if (!preparar()) return;
  if (id === 'corpo') {                                     // Punho do Sangue Dourado
    explosaoDaTecnica('inimigo', cores);
    rachaduras('inimigo', cores[0]);
    setTimeout(() => onda('inimigo', cores[0], 0.55, 160), 90);
  } else if (id === 'arma') {                               // Corte do Céu Partido
    rastro('jogador', 'inimigo', cores);
    corteEmArco('inimigo', cores, { raio: 58, grosso: 12 });
    setTimeout(() => corteEmArco('inimigo', ['#ffffff', '#ffe8a0'], { raio: 40, grosso: 7 }), 80);
    impacto('inimigo', cores, { forte: true });
  } else if (id === 'elemental') {                          // Tempestade de Gelo Místico
    for (let i = 0; i < 9; i++) {
      setTimeout(() => projetil('jogador', 'inimigo', cores[i % 2], {
        arco: 10 + Math.random() * 50, dur: 0.22 + Math.random() * 0.1, tam: 5,
        aoChegar: i === 8 ? () => explosaoDaTecnica('inimigo', cores) : () => impacto('inimigo', cores) }), i * 25);
    }
  } else if (id === 'alma') {                               // Lança da Alma Devoradora
    rastro('jogador', 'inimigo', cores);
    explosaoDaTecnica('inimigo', cores);
    chamas('inimigo', cores, 30);
  } else if (id === 'alquimista') {                         // Fogo do Caldeirão Celestial
    projetil('jogador', 'inimigo', cores[0], { arco: 70, dur: 0.3, tam: 12, aoChegar: () => {
      explosaoDaTecnica('inimigo', cores);
      chamas('inimigo', ['#7aef5a', '#ffd36b'], 34);
    } });
  } else {
    rastro('jogador', 'inimigo', cores);
    explosaoDaTecnica('inimigo', cores);
  }
}
