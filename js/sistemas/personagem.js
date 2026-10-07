// =============================================================
// sistemas/personagem.js — NOME, SEXO E CLASSE DO JOGADOR
// =============================================================
import { CLASSE_POR_ID, PERSONAGEM_PADRAO, TAMANHO_DO_NOME, SEXOS } from '../dados/classes.js';

// Saves antigos (ou antes da tela de criação) usam o personagem padrão
export function personagemDe(estado) {
  return estado.personagem ?? PERSONAGEM_PADRAO;
}

export function classeDe(estado) {
  return CLASSE_POR_ID[personagemDe(estado).classe];
}

export function precisaCriarPersonagem(estado) {
  return !estado.personagem;
}

// Devolve uma mensagem de erro, ou null se o nome estiver bom
export function validarNome(nome) {
  const limpo = (nome ?? '').trim();
  if (limpo.length < TAMANHO_DO_NOME.minimo) return `O nome precisa ter pelo menos ${TAMANHO_DO_NOME.minimo} letras.`;
  if (limpo.length > TAMANHO_DO_NOME.maximo) return `O nome pode ter no máximo ${TAMANHO_DO_NOME.maximo} letras.`;
  if (!/^[\p{L}\p{N} '-]+$/u.test(limpo)) return 'Use só letras, números, espaço, hífen ou apóstrofo.';
  return null;
}

export function criarPersonagem(estado, { nome, sexo, classe }) {
  if (validarNome(nome)) return false;
  if (!SEXOS.some(s => s.id === sexo) || !CLASSE_POR_ID[classe]) return false;
  estado.personagem = { nome: nome.trim().replace(/\s+/g, ' '), sexo, classe };
  return true;
}
