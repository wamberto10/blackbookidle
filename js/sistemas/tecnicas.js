// =============================================================
// sistemas/tecnicas.js — TÉCNICA ESPECIAL DE CADA CLASSE (v0.15.0, ideia do dono)
//
// A cada "aCada" turnos, o primeiro golpe do herói no turno vira a técnica da
// classe (dados em dados/classes.js → tecnica): dano × multiplicador, mais um
// efeito próprio. Usado pelo combate das fases e pela luta do boss.
//   cura          → recupera essa fração da Vitalidade (Refinador Corporal)
//   penetracao    → ignora essa fração da Defesa (Mestre da Espada)
//   congela       → o inimigo perde esse número de ataques (Cultivador Elemental)
//   enfraquece    → o Ataque do inimigo cai essa fração, até o fim da luta (Cultivador de Alma)
//   recarregaPilula → a Pílula de Cura volta a ficar disponível (Alquimista)
// =============================================================

// A técnica "carrega" com os turnos de combate e NÃO zera entre uma luta e outra: contra inimigos
// que caem em 2–3 turnos ela também sai (antes, com o contador zerando a cada luta, quem matava
// rápido quase nunca via a técnica).
let carga = 0;

// A técnica sai neste golpe? (o 2º golpe do ataque duplo não conta como turno novo)
export function tecnicaDoGolpe(luta, extra = {}) {
  const tecnica = luta.classe.tecnica;
  if (!tecnica || extra.segundo) return null;
  carga += 1;
  if (carga < tecnica.aCada) return null;
  carga = 0;
  return tecnica;
}

// Defesa que a técnica ignora (a maior entre a da classe e a da técnica)
export function penetracaoDoGolpe(luta, tecnica) {
  return Math.max(luta.classe.especial.penetracao ?? 0, tecnica?.penetracao ?? 0);
}

// Efeitos depois do golpe da técnica. Devolve o que aconteceu (para a tela).
export function efeitosDaTecnica(luta, tecnica) {
  const efeitos = {};
  if (tecnica.cura) {
    const maxima = luta.jogador.vitalidade;
    const cura = Math.min(maxima * tecnica.cura, maxima - luta.vidaJogador);
    if (cura > 0) { luta.vidaJogador += cura; efeitos.cura = cura; }
  }
  if (tecnica.congela) { luta.inimigoCongelado = tecnica.congela; efeitos.congelou = true; }
  if (tecnica.enfraquece) {
    luta.fraquezaDoInimigo = Math.max(0.5, (luta.fraquezaDoInimigo ?? 1) * (1 - tecnica.enfraquece));
    efeitos.enfraqueceu = true;
  }
  if (tecnica.recarregaPilula && luta.pilulaUsada) { luta.pilulaUsada = false; efeitos.pilula = true; }
  return efeitos;
}

// O inimigo está congelado? Gasta 1 ataque congelado e devolve true (ele não ataca)
export function inimigoCongelado(luta) {
  if (!luta.inimigoCongelado) return false;
  luta.inimigoCongelado -= 1;
  return true;
}

// Multiplicador do ataque do inimigo (Lança da Alma Devoradora o enfraquece)
export function forcaDoInimigo(luta) {
  return luta.fraquezaDoInimigo ?? 1;
}
