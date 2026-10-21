// =============================================================
// ui/encaixe.js — TEXTO QUE NÃO CABE ENCOLHE (v0.35.1)
// Os números do fim do jogo ("3.37e10789 / 3.37e10789") e alguns nomes longos passavam da caixa. Em vez de
// cortar, a letra de um texto de UMA linha que não cabe diminui só o necessário — até 60% do tamanho normal e
// nunca abaixo de 8 px; se ainda assim não couber, vale o "…" do CSS. Quando o texto volta a caber, a letra volta.
// Confere a tela à vista quando um painel abre, quando a janela muda de tamanho e, se algo mudou, a cada 0,5 s
// (cada conferência leva ~2–4 ms no PC).
// Textos longos (frases) não encolhem: eles quebram a linha ou usam o "…".
// =============================================================
const MINIMO = 0.6;           // fração do tamanho normal
const MINIMO_PX = 8;          // nunca menor que isto
const TEXTO_MAXIMO = 40;      // mais letras que isso é frase, não número/nome
const encolhidos = new Map();   // elemento → { texto, largura } da última medida
let raiz = null;
let sujo = true;

const naoCabe = (el) => el.clientWidth > 0 && el.scrollWidth > el.clientWidth + 1;

function encolher(el) {
  el.style.fontSize = '';
  if (!naoCabe(el)) { encolhidos.delete(el); return; }
  encolhidos.set(el, { texto: el.textContent, largura: el.clientWidth });
  const normal = parseFloat(getComputedStyle(el).fontSize);
  const minimo = Math.max(MINIMO_PX, normal * MINIMO);
  if (normal <= minimo) return;
  let tamanho = Math.max(minimo, normal * (el.clientWidth / el.scrollWidth) * 0.98);
  el.style.fontSize = `${tamanho.toFixed(2)}px`;
  for (let i = 0; i < 6 && naoCabe(el) && tamanho > minimo; i++) {
    tamanho = Math.max(minimo, tamanho * 0.95);
    el.style.fontSize = `${tamanho.toFixed(2)}px`;
  }
}

function candidato(el) {
  if (el.dataset.semEncaixe !== undefined || !naoCabe(el)) return false;
  const texto = el.textContent.trim();
  if (!texto || texto.length > TEXTO_MAXIMO) return false;
  const estilo = getComputedStyle(el);
  if (estilo.whiteSpace !== 'nowrap' && estilo.whiteSpace !== 'pre') return false;
  return estilo.overflowX !== 'auto' && estilo.overflowX !== 'scroll';
}

// Confere tudo o que está à vista dentro de "onde" (padrão: a moldura do jogo inteira)
export function encaixar(onde = raiz) {
  if (!onde) return;
  sujo = false;
  for (const [el, medida] of [...encolhidos]) {
    if (!el.isConnected) { encolhidos.delete(el); continue; }
    // só mede de novo se o texto ou a largura da caixa mudou (volta ao normal se já couber)
    if (onde.contains(el) && (el.textContent !== medida.texto || el.clientWidth !== medida.largura)) encolher(el);
  }
  for (const el of onde.querySelectorAll('*')) {
    if (!encolhidos.has(el) && candidato(el)) encolher(el);
  }
}

export function iniciarEncaixe(elementoRaiz) {
  raiz = elementoRaiz ?? document.body;
  new MutationObserver(() => { sujo = true; }).observe(raiz, { childList: true, characterData: true, subtree: true });
  window.addEventListener('resize', () => { sujo = true; });
  setInterval(() => { if (sujo && !document.hidden) encaixar(); }, 500);
  encaixar();
}

// Pede uma conferência logo (ex.: um painel acabou de abrir)
export function marcarParaEncaixe() { sujo = true; }
