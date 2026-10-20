// =============================================================
// estado.js — o "estado" é tudo que precisa ser salvo do jogador
// =============================================================
import { CONFIG } from './config.js';
import { SLOTS } from './dados/equipamentos.js';
import { automacaoPadrao } from './sistemas/automacao.js';

export function criarEstadoInicial() {
  // Começa com nível 0 em cada melhoria do Black Book
  const blackbook = {};
  for (const melhoria of CONFIG.blackbook.melhorias) blackbook[melhoria.id] = 0;

  // Todos os espaços de equipamento começam vazios
  const equipados = {};
  for (const slot of SLOTS) equipados[slot.id] = null;

  return {
    versao: CONFIG.versao,
    // v0.32.0: versão da PROGRESSÃO (2 = contínua, sem reencarnação). save.js converte os saves antigos.
    versaoProgressao: CONFIG.progressao.versaoDoSave,
    versaoNumeros: 1,    // save novo já usa numeros.js; não precisa de cópia de migração

    // ---- Progresso (v0.32.0: nada disto recomeça mais — a reencarnação saiu do jogo) ----
    cultivo: 0,          // Cultivo disponível agora
    cultivoTotal: 0,     // tudo que já foi ganho
    reino: 0,            // índice do reino em REINOS (0 = Corpo Temperado)
    estagio: 0,          // índice do estágio dentro do reino (0 = 1º estágio)
    maestria: 0,         // v0.32.0: nível da Maestria da Criação (depois do Fruto do Universo)
    pedras: 0,           // Pedras Espirituais (caem nas fases; sobem o nível dos equipamentos)
    equipados,           // item vestido em cada espaço (ou null)
    mochila: [],         // itens guardados
    proximoIdItem: 1,    // número para identificar cada item novo
    combate: {
      faseAtual: 0,         // fase GLOBAL sendo jogada (0 = Fácil, Mapa 1, Fase 1; 1152 = Normal, Mapa 1, Fase 1)
      fasesConcluidas: -1,  // maior fase global já vencida (-1 = nenhuma). Só cresce: a 1ª conquista é paga uma vez
      autoAvancar: true,    // ir para a próxima fase ao vencer
      derrota: null,        // v0.33.0: { em: tempo de jogo, poder } da última derrota (retomada automática)
      luta: null,           // v0.33.0: luta em andamento guardada no save (recarregar continua a mesma luta)
      vitorias: 0,
      derrotas: 0,
    },
    // v0.21.0 (sistemas/cultivoAvancado.js):
    reclusao: { ativa: false, segundos: 0 },     // Reclusão: combate parado, Cultivo maior (segundos = há quanto tempo)
    efeitos: { iluminacao: 0, fluxo: 0, rompimento: 0 },   // segundos restantes da Iluminação e da Pílula do Fluxo;
                                                 // rompimento = desconto do próximo rompimento (Pílula Quebra-Gargalo)
    mestreEstelar: false,                        // refinou a Fonte Estelar

    // ---- Permanente (nunca é perdido) ----
    personagem: null,    // { nome, sexo, classe } — null até passar pela tela de criação
    essencia: 0,         // Essência da Alma (v0.32.0: das 1ªs conquistas e do farm; gasta no Black Book)
    blackbook,           // níveis das melhorias do Black Book
    vip: false,          // VIP ligado? (tela do VIP, botão 💎 da tela inicial)
    arranjo: 0,          // v0.21.0: nível do Arranjo de Reunião de Energia
    pilulas: { acumulo: 0, fluxo: 0, rompimento: 0 },                  // v0.21.0: pílulas de cultivo guardadas
    nucleos: { baixo: 0, medio: 0, alto: 0 },                          // núcleos guardados
    pontosNucleo: { ataque: 0, vitalidade: 0, defesa: 0, velocidade: 0 }, // pontos já usados (+1% cada)
    // Evento de Boss (sistemas/boss.js)
    boss: {
      edicao: 1,        // quantas vezes o boss já apareceu
      vida: 1,          // fração da vida que resta (1 = 100%)
      voltaEm: 0,       // hora (ms) em que o boss reaparece depois de derrotado (0 = já está aqui)
      descansoAte: 0,   // hora (ms) em que você pode lutar de novo
      rank: [],         // [{ nome, dano }] dano em fração da vida total, nesta edição
      derrotas: 0,      // quantas vezes o boss já foi derrotado
    },
    // Legado (v0.32.0): reencarnações dos saves antigos. Não acontecem mais; o histórico aparece no Black Book.
    reencarnacao: {
      vezes: 0,
      melhorFaseDeTodas: -1,   // fase mais distante já vencida em qualquer vida
      faseDaUltima: -1,        // fase em que reencarnou da última vez (-1 = nunca)
      sentidoDivinoMaximo: 0,  // "a alma se lembra": maior Sentido Divino já alcançado (fica ao reencarnar)
      essenciaTotal: 0,
    },
    opcoes: {
      autoAvancar: false,   // avançar estágios de cultivo automaticamente
      autoEquipar: true,    // vestir sozinho itens que aumentam o Poder Total
      // v0.26.0: a cada item que cai, a Mochila se organiza sozinha (ligados também em saves antigos)
      desmancheAuto: true,  // desmancha os itens obsoletos (EQ.ehObsoleto)
      mesclaAuto: true,     // mescla as pilhas com 3 itens iguais
      meditarAuto: true,    // VIP: Meditar automático ligado (o botão Meditar liga/desliga)
      bossAuto: false,      // Evento de Boss: começa as lutas sozinho (quando o boss volta e após cada descanso)
    },
    estatisticas: {
      meditacoes: 0,
      rompimentos: 0,
      tempoJogado: 0,    // em segundos
      essenciaConquistas: 0,   // v0.32.0: Essência ganha nas 1ªs conquistas
      essenciaFarm: 0,         // v0.32.0: Essência ganha no farm
    },
    // v0.33.0: gerenciamento automático (sistemas/automacao.js) — tudo começa desligado
    automacao: automacaoPadrao(),
    relogio: { resto: 0 },   // tempo aceito ainda não processado; inclui fração e lotes offline pendentes
    residuos: {},   // v0.33.2: ganhos/gastos pequenos demais para mudar a última casa de cada saldo (saldos.js)
    ultimoSave: Date.now(),
  };
}
