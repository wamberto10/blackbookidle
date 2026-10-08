// =============================================================
// estado.js — o "estado" é tudo que precisa ser salvo do jogador
// =============================================================
import { CONFIG } from './config.js';
import { SLOTS } from './dados/equipamentos.js';

export function criarEstadoInicial() {
  // Começa com nível 0 em cada melhoria do Black Book
  const blackbook = {};
  for (const melhoria of CONFIG.blackbook.melhorias) blackbook[melhoria.id] = 0;

  // Todos os espaços de equipamento começam vazios
  const equipados = {};
  for (const slot of SLOTS) equipados[slot.id] = null;

  return {
    versao: CONFIG.versao,

    // ---- Desta vida (recomeça ao reencarnar) ----
    cultivo: 0,          // Cultivo disponível agora
    cultivoTotal: 0,     // tudo que já foi ganho nesta vida
    reino: 0,            // índice do reino em REINOS (0 = Corpo Temperado)
    estagio: 0,          // índice do estágio dentro do reino (0 = 1º estágio)
    pedras: 0,           // Pedras Espirituais (caem nas fases; sobem o nível dos equipamentos)
    equipados,           // item vestido em cada espaço (ou null)
    mochila: [],         // itens guardados
    proximoIdItem: 1,    // número para identificar cada item novo
    combate: {
      faseAtual: 0,         // fase sendo jogada (0 = Mapa 1, Fase 1)
      fasesConcluidas: -1,  // maior fase já vencida (-1 = nenhuma)
      autoAvancar: true,    // ir para a próxima fase ao vencer
      vitorias: 0,
      derrotas: 0,
    },

    // ---- Permanente (nunca é perdido) ----
    personagem: null,    // { nome, sexo, classe } — null até passar pela tela de criação
    essencia: 0,         // Essência da Alma (ganha ao reencarnar, gasta no Black Book)
    blackbook,           // níveis das melhorias do Black Book
    nucleos: { baixo: 0, medio: 0, alto: 0 },                          // núcleos guardados
    pontosNucleo: { ataque: 0, vitalidade: 0, defesa: 0, velocidade: 0 }, // pontos já usados (+1% cada)
    reencarnacao: {
      vezes: 0,
      melhorFaseDeTodas: -1,   // fase mais distante já vencida em qualquer vida
      faseDaUltima: -1,        // fase em que reencarnou da última vez (-1 = nunca)
      essenciaTotal: 0,
    },
    opcoes: {
      autoAvancar: false,   // avançar estágios de cultivo automaticamente
      autoEquipar: true,    // vestir sozinho itens que aumentam o Poder Total
    },
    estatisticas: {
      meditacoes: 0,
      rompimentos: 0,
      tempoJogado: 0,    // em segundos
    },
    ultimoSave: Date.now(),
  };
}
