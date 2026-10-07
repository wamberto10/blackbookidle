// =============================================================
// ui/fundo.js — PAISAGEM DE FUNDO EM PIXEL ART
// Usa a imagem img/fundos/mapaNN.jpg de cada mapa (feita em IA e reduzida
// por ferramentas/converter-fundos.ps1). Se faltar a imagem:
// desenha céu, sol/lua, estrelas, nuvens, 3 camadas de montanhas
// e construções em uma tela pequena (320×180). O CSS amplia a tela
// mantendo os pixels nítidos, como um jogo retrô.
// As cores e o tipo de construção vêm de "cena" em dados/mundo1.js.
// =============================================================

const LARGURA = 320;
const ALTURA = 180;

// ---- Ajudantes de cor ----
function hexParaRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function misturar(cor1, cor2, t) {
  const a = hexParaRgb(cor1);
  const b = hexParaRgb(cor2);
  return `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(',')})`;
}

// Números "aleatórios" que saem sempre iguais para a mesma semente,
// assim a paisagem de cada mapa é sempre a mesma.
function criarAleatorio(semente) {
  let s = semente * 7919 + 1;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function circulo(ctx, cx, cy, raio) {
  for (let dy = -raio; dy <= raio; dy++) {
    const largura = Math.floor(Math.sqrt(raio * raio - dy * dy));
    ctx.fillRect(cx - largura, cy + dy, largura * 2 + 1, 1);
  }
}

// =============================================================
// Fundo do mapa: usa a imagem img/fundos/mapaNN.jpg (arte de IA) quando ela
// existe; se faltar, desenha a paisagem por código, como antes.
// "semente" é o número do mapa (1 a 12).
const imagensDeFundo = {};   // número do mapa → Image (carregada uma vez só)

export function desenharFundo(canvas, cena, semente = 1) {
  const pedido = String(semente);
  canvas.dataset.fundo = pedido;        // se trocar de mapa no meio do carregamento, ignora o antigo

  let img = imagensDeFundo[semente];
  if (!img) {
    img = new Image();
    img.src = `img/fundos/mapa${String(semente).padStart(2, '0')}.jpg`;
    imagensDeFundo[semente] = img;
  }

  const usarImagem = () => {
    if (canvas.dataset.fundo !== pedido) return;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    canvas.getContext('2d').drawImage(img, 0, 0);
  };
  const usarDesenho = () => {
    if (canvas.dataset.fundo === pedido) desenharPaisagem(canvas, cena, semente);
  };

  if (img.complete) {
    if (img.naturalWidth) usarImagem(); else usarDesenho();
  } else {
    usarDesenho();   // mostra o desenho enquanto a imagem carrega
    img.addEventListener('load', usarImagem, { once: true });
  }
}

// Paisagem feita por código (usada quando o mapa não tem imagem)
function desenharPaisagem(canvas, cena, semente) {
  canvas.width = LARGURA;
  canvas.height = ALTURA;
  const ctx = canvas.getContext('2d');
  const aleatorio = criarAleatorio(semente);

  // 1) Céu em faixas (o degradê "em degraus" dá o visual pixel art)
  const faixas = 12;
  const alturaDoCeu = ALTURA * 0.75;
  for (let i = 0; i < faixas; i++) {
    ctx.fillStyle = misturar(cena.ceu[0], cena.ceu[1], i / (faixas - 1));
    ctx.fillRect(0, Math.floor((i * alturaDoCeu) / faixas), LARGURA, Math.ceil(alturaDoCeu / faixas) + 1);
  }
  ctx.fillStyle = cena.ceu[1];
  ctx.fillRect(0, alturaDoCeu, LARGURA, ALTURA - alturaDoCeu);

  // 2) Estrelas
  if (cena.estrelas) {
    for (let i = 0; i < 80; i++) {
      ctx.fillStyle = aleatorio() > 0.8 ? '#ffffff' : 'rgba(255,255,255,0.45)';
      ctx.fillRect(Math.floor(aleatorio() * LARGURA), Math.floor(aleatorio() * ALTURA * 0.5), 1, 1);
    }
  }

  // 3) Sol ou lua, com um brilho em volta
  if (cena.astro) {
    const x = cena.astroX ?? 240;
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    circulo(ctx, x, 34, 17);
    ctx.fillStyle = cena.astro;
    circulo(ctx, x, 34, 11);
  }

  // 4) Nuvens
  ctx.fillStyle = 'rgba(255,255,255,0.28)';
  for (let i = 0; i < 6; i++) {
    const x = Math.floor(aleatorio() * LARGURA);
    const y = Math.floor(14 + aleatorio() * 50);
    const largura = Math.floor(24 + aleatorio() * 40);
    ctx.fillRect(x, y, largura, 3);
    ctx.fillRect(x + 5, y - 2, largura - 12, 2);
    ctx.fillRect(x + 9, y + 3, largura - 16, 2);
  }

  // 5) Três camadas de montanhas: fundo, meio e frente
  cena.montanhas.forEach((cor, camada) => {
    const base = ALTURA * (0.55 + camada * 0.12);
    const altura = 52 - camada * 13;
    const freq1 = 0.01 + aleatorio() * 0.02;
    const freq2 = 0.03 + aleatorio() * 0.04;
    const fase1 = aleatorio() * 10;
    const fase2 = aleatorio() * 10;

    // Perfil: a altura do chão em cada coluna de pixels
    const perfil = [];
    for (let x = 0; x < LARGURA; x++) {
      const onda = 0.5 + 0.35 * Math.sin(x * freq1 + fase1) + 0.15 * Math.sin(x * freq2 + fase2);
      perfil.push(Math.floor(base - altura * onda));
    }

    ctx.fillStyle = cor;
    for (let x = 0; x < LARGURA; x++) ctx.fillRect(x, perfil[x], 1, ALTURA - perfil[x]);

    // Construções ficam na camada do meio (a da frente cobre a base delas)
    if (camada === 1) desenharEstruturas(ctx, cena, perfil, misturar(cor, '#000000', 0.35), aleatorio);

    // Névoa entre as camadas
    if (cena.nevoa && camada < 2) {
      ctx.fillStyle = cena.nevoa;
      ctx.fillRect(0, Math.floor(base - 6), LARGURA, 12);
    }
  });
}

// =============================================================
// Construções
// =============================================================
function desenharEstruturas(ctx, cena, perfil, cor, aleatorio) {
  const chao = (x) => perfil[Math.max(0, Math.min(LARGURA - 1, Math.floor(x)))];

  switch (cena.estruturas) {
    case 'pagodas':
      [70, 175, 265].forEach((x) => pagoda(ctx, x, chao(x), cor, 3, 1));
      break;

    case 'palacio':
      pagoda(ctx, 160, chao(160), cor, 5, 1.6, true);
      pagoda(ctx, 90, chao(90), cor, 3, 1, true);
      pagoda(ctx, 235, chao(235), cor, 3, 1, true);
      break;

    case 'cidade':
      for (let x = 10; x < LARGURA - 10;) {
        const largura = 7 + Math.floor(aleatorio() * 8);
        const altura = 5 + Math.floor(aleatorio() * 8);
        const y = chao(x + largura / 2);
        ctx.fillStyle = cor;
        ctx.fillRect(x, y - altura, largura, altura + 2);
        ctx.fillRect(x - 1, y - altura - 1, largura + 2, 1);       // telhado
        ctx.fillRect(x + 1, y - altura - 2, largura - 2, 1);
        ctx.fillStyle = '#ffd27a';                                 // janela acesa
        if (aleatorio() > 0.4) ctx.fillRect(x + 2, y - altura + 2, 1, 1);
        x += largura + 2 + Math.floor(aleatorio() * 10);
      }
      break;

    case 'pinheiros':
      for (let i = 0; i < 30; i++) {
        const x = Math.floor(aleatorio() * LARGURA);
        pinheiro(ctx, x, chao(x), cor, 6 + Math.floor(aleatorio() * 7));
      }
      break;

    case 'arvores':
      for (let i = 0; i < 22; i++) {
        const x = Math.floor(aleatorio() * LARGURA);
        const raio = 3 + Math.floor(aleatorio() * 4);
        const y = chao(x);
        ctx.fillStyle = cor;
        ctx.fillRect(x, y - raio, 1, raio + 2);                   // tronco
        circulo(ctx, x, y - raio - 2, raio);                      // copa
      }
      break;

    case 'ruinas':
      for (let i = 0; i < 9; i++) {
        const x = 15 + Math.floor(aleatorio() * (LARGURA - 30));
        const altura = 5 + Math.floor(aleatorio() * 14);
        const y = chao(x);
        ctx.fillStyle = cor;
        ctx.fillRect(x, y - altura, 3, altura + 2);               // coluna quebrada
        ctx.fillRect(x - 1, y - altura, 5, 1);
        if (aleatorio() > 0.5) ctx.fillRect(x + 4, y - 2, 6, 2);  // pedaço caído
      }
      break;

    case 'portal': {
      const x = 160;
      const y = chao(x) - 32;
      ctx.fillStyle = 'rgba(159,216,255,0.15)';
      circulo(ctx, x, y, 30);
      // Anel do portal (elipse desenhada ponto a ponto)
      for (let a = 0; a < Math.PI * 2; a += 0.03) {
        ctx.fillStyle = '#9fd8ff';
        ctx.fillRect(Math.round(x + Math.cos(a) * 18), Math.round(y + Math.sin(a) * 26), 2, 2);
      }
      ctx.fillStyle = 'rgba(200,240,255,0.35)';
      circulo(ctx, x, y, 10);
      // Colunas antigas dos lados
      ctx.fillStyle = cor;
      ctx.fillRect(x - 32, chao(x - 32) - 28, 5, 30);
      ctx.fillRect(x + 28, chao(x + 28) - 28, 5, 30);
      break;
    }
  }
}

// Pagoda: torre de vários andares com telhados curvados
function pagoda(ctx, x, chao, cor, andares, escala = 1, luzes = false) {
  ctx.fillStyle = cor;
  const alturaAndar = Math.round(7 * escala);
  for (let t = 0; t < andares; t++) {
    const largura = Math.round((16 - t * 3) * escala);
    const topo = chao - (t + 1) * alturaAndar;
    ctx.fillRect(x - Math.floor((largura - 6) / 2), topo + 2, largura - 6, alturaAndar - 1); // parede
    ctx.fillRect(x - Math.floor(largura / 2), topo + 1, largura, 2);                          // telhado
    ctx.fillRect(x - Math.floor(largura / 2) - 1, topo, 1, 1);                                // pontas curvadas
    ctx.fillRect(x + Math.ceil(largura / 2), topo, 1, 1);
    if (luzes) {
      ctx.fillStyle = '#ffd27a';
      ctx.fillRect(x - 1, topo + 4, 2, 1);
      ctx.fillStyle = cor;
    }
  }
  ctx.fillRect(x, chao - andares * alturaAndar - 3, 1, 3); // ponta
}

function pinheiro(ctx, x, chao, cor, altura) {
  ctx.fillStyle = cor;
  for (let k = 0; k < altura; k++) {
    const largura = Math.floor(k / 1.5) + 1;
    ctx.fillRect(x - Math.floor(largura / 2), chao - altura + k, largura, 1);
  }
  ctx.fillRect(x, chao, 1, 2);
}
