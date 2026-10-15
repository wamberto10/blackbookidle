// =============================================================
// sistemas/tecnicas.js — TÉCNICA ESPECIAL DE CADA CLASSE (v0.15.0, ideia do dono)
//
// A cada "aCada" ataques do herói (contador zera a cada luta), o golpe vira a técnica da
// classe (dados em dados/classes.js → tecnica): dano × multiplicador, mais um
// efeito próprio. Usado pelo combate das fases e pela luta do boss.
//   cura          → recupera essa fração da Vitalidade (Refinador Corporal)
//   penetracao    → ignora essa fração da Defesa (Mestre da Espada)
//   congela       → o inimigo perde esse número de ataques (Cultivador Elemental: atordoado pelo fogo)
// =============================================================

// v0.15.1 (dono): a técnica sai a cada "aCada" ATAQUES do herói (todo golpe conta, inclusive o 2º
// do ataque duplo) e o contador ZERA a cada luta — não acumula de uma luta para a outra.
export function tecnicaDoGolpe(luta) {
  const tecnica = luta.classe.tecnica;
  if (!tecnica) return null;
  luta.ataquesParaTecnica = (luta.ataquesParaTecnica ?? 0) + 1;
  if (luta.ataquesParaTecnica < tecnica.aCada) return null;
  luta.ataquesParaTecnica = 0;
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
  return efeitos;
}

// O inimigo está congelado? Gasta 1 ataque congelado e devolve true (ele não ataca)
export function inimigoCongelado(luta) {
  if (!luta.inimigoCongelado) return false;
  luta.inimigoCongelado -= 1;
  return true;
}

