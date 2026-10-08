// =============================================================
// config.js — NÚMEROS DE BALANCEAMENTO
// Todos os valores aqui são PROVISÓRIOS e serão ajustados
// conforme novos sistemas (equipamentos, Black Book...) entrarem.
// =============================================================

export const CONFIG = {
  versao: '0.9.7',

  // Salvar automaticamente a cada X milissegundos (10000 = 10 segundos)
  intervaloAutoSave: 10000,

  // Máximo de horas de progresso offline
  maxHorasOffline: 24,   // v0.9.3 (dono): era 12 — 24 h enquanto o jogo está em desenvolvimento

  // ---- Cultivo ----
  // Produção por segundo = producaoBase × crescimentoProducao^nível × bonusPorReino^reino × bônus do Black Book
  // Custo para avançar   = custoBase × crescimentoCusto^nível  (× multiplicadorRompimento se for romper reino)
  // "nível" = posição total do jogador (0 = 1º estágio do Corpo Temperado)
  cultivo: {
    // v0.8.0 (consolidação): era 1. Com 1, o Mundo Inicial acabava em ~8 h numa vida só;
    // o dono pediu 3 a 5 dias com 2 a 4 reencarnações (testado em ferramentas/simular.html).
    producaoBase: 0.5,         // v0.8.5: era 0.2 (dono achou os estágios difíceis demais de passar)
    crescimentoProducao: 1.3,
    bonusPorReino: 1.8,
    custoBase: 20,
    crescimentoCusto: 1.577,   // v0.8.5: era 1.55 — o começo fica 2,5× mais rápido e o fim do mundo quase igual
    multiplicadorRompimento: 2.5,  // v0.8.5: era 4 (o 9º estágio demorava 5× o anterior)
    segundosPorMeditacao: 3,   // cada clique em Meditar = 3 segundos de produção (v0.9.5: era 1)
    meditacaoMinima: 1,
  },

  // ---- Atributos ----
  // Ataque, Vitalidade e Defesa = base × crescimento^nível × bonusPorReino^reino × bônus do Black Book
  atributos: {
    base: { ataque: 5, vitalidade: 60, defesa: 2, sentidoDivino: 20 },
    crescimento: 1.25,
    bonusPorReino: 1.6,
    velocidadeBase: 10,         // decide quem ataca primeiro em cada turno
    crescimentoVelocidade: 1.05,
    criticoBase: 5,             // % de chance
    criticoPorNivel: 0.3,
    criticoMaximo: 60,
    danoCriticoBase: 150,       // % do dano normal
    danoCriticoPorNivel: 1,
    danoCriticoMaximo: 500,     // v0.8.1: teto (o crítico nunca passa de 5× o dano normal)
    esquivaBase: 2,             // % de chance
    esquivaPorNivel: 0.1,
    esquivaMaxima: 30,          // v0.8.1: era 40 (o inimigo sempre acerta pelo menos 70% dos golpes)
  },

  // ---- Desbloqueios: reino e estágio em que cada sistema é liberado ----
  // reino 0 = Corpo Temperado, 1 = Elemento Inicial... | estagio 0 = 1º estágio, 4 = 5º estágio
  desbloqueios: {
    combate:   { reino: 0, estagio: 4 },   // 5º estágio do Corpo Temperado
    mapa:      { reino: 0, estagio: 4 },
    mochila:   { reino: 0, estagio: 4 },
    blackbook: { reino: 1, estagio: 0 },   // ao completar o Corpo Temperado (depois da 1ª reencarnação, sempre)
  },

  // ---- Combate (por turnos) ----
  combate: {
    fasesPorMapa: 12,
    duracaoDoTurno: 1,          // segundos entre um turno e outro
    duracaoMaxima: 60,          // segundos para vencer cada luta (= 60 turnos)
    pausaEntreLutas: 1,         // segundos entre uma luta e outra
    passoDeSimulacao: 0.1,      // precisão da simulação (segundos)
    fracaoDoReino: 0.8,         // os inimigos de um reino vão do 1º estágio até ~80% do reino
    bonusPrimeiraVitoria: 3,    // primeira vitória numa fase dá recompensa ×3
    // Pedras Espirituais por vitória = "pedras" do tipo da fase × crescimentoPedras^fase
    // Ex.: comum do Mapa 1 = 1 | chefe do Mapa 1 = 26 | chefe do Mapa 12 = ~17 mil
    // (serão usadas para subir o nível dos equipamentos, na Etapa 3)
    crescimentoPedras: 1.05,
    // v0.8.0: cada mapa tem inimigos mais fortes que o anterior (Vida, Ataque e Defesa ×1,31^mapa).
    // Cria "muralhas" que só caem depois de reencarnar e comprar melhorias no Black Book.
    // v0.8.1: era 1.32 — compensa a Esquiva que saiu do Black Book (robô: 81–90 h, 3 reencarnações)
    dificuldadePorMapa: 1.31,
    // v0.8.1: todo golpe tira pelo menos 10% do Ataque de quem bate, por maior que seja a Defesa
    danoMinimo: 0.1,
  },

  // ---- Equipamentos (os espaços e tiers ficam em dados/equipamentos.js) ----
  equipamentos: {
    // Chance de um item cair ao vencer, por tipo de fase (0.015 = 1,5%)
    // v0.7.2 (aprovado pelo dono): caíam 54–135 itens por hora e o 1º Lendário saía em 20 min–7 h.
    // Agora ~14–23 itens por hora; 1º Lendário em ~3 h a 1 dia de farm.
    chanceDeDrop: {
      comum: 0.015, intermediario: 0.02, elite: 0.04, eliteAvancada: 0.05,
      especialista: 0.03, miniChefe: 0.07, chefe: 0.1,
    },
    multiplicadorPrimeiraVitoria: 2,   // na primeira vitória numa fase, a chance dobra
    // Chefes aumentam a chance de tiers Raro ou melhores (v0.7.2: era 1.5 / 2)
    bonusRaridadeChefe: { miniChefe: 1.25, chefe: 1.5 },
    // Atributos % (crítico, esquiva...) crescem um pouco a cada mapa
    crescimentoPorcentoPorMapa: 0.03,  // v0.7.1: era 0.1 (equipamento crescia demais no fim do mundo)
    variacao: 0,                       // v0.9.2: sem variação (atributos fixos; era ±20%)
    bonusPorNivel: 0.05,               // cada nível de melhoria dá +5% em todos os atributos
    custoMelhoriaBase: 4,              // Pedras = base × valor do tier × 1,05^fase × 1,25^nível
    crescimentoCustoMelhoria: 1.25,
    pedrasAoDesmancharBase: 3,         // Pedras = base × valor do tier × 1,05^fase (+50% do investido)
    devolucaoAoDesmanchar: 0.5,
    capacidadeMochila: Infinity,       // v0.9.1 (dono): sem limite (era 100; cheia, o item virava Pedras)
    // Graus: cada tier tem 5 graus (★1 a ★5), cada um um pouco mais forte.
    // Mesclar: 3 itens iguais (mesmo tipo, tier e grau) → 1 do grau seguinte;
    // ★5 é o máximo: mesclar NÃO sobe de tier (v0.8.4, decisão do dono; antes 3 ★5 → ★1 do tier seguinte)
    itensParaMesclar: 3,
    graus: 5,
    bonusPorGrau: 0.04,                // +4% por grau (★5 = +16%, ainda abaixo do ★1 do tier seguinte)
    pesosGrauAoCair: [70, 20, 8, 2, 0], // chance de cada grau quando um item cai (★1 ... ★5)
  },

  // ---- VIP (v0.9.7, ideia do dono) ----
  // Liga/desliga de graça na tela do VIP (botão 💎 no canto da tela inicial).
  // Fica ligado também ao reencarnar.
  vip: {
    cliquesPorSegundo: 3,                 // Meditar automático (só com o jogo aberto na tela)
    pesosExtras: [10, 10, 5, 3, 1],       // somados nos pesos dos tiers (50/25/10/5/1 → 60/35/15/8/2)
    bonusEssencia: 1.0,                   // +100% de Essência da Alma ao reencarnar
    atributos: { ataque: 0.5, defesa: 0.5, vitalidade: 0.5 },   // +50% no total (com itens etc.)
  },

  // ---- Núcleos (v0.9.0, ideia do dono) ----
  // Caem ao vencer inimigos do Mapa 3 em diante (mapas da Transformação do Qi).
  // Cada ponto dá +1% em Ataque, Vitalidade, Defesa ou Velocidade (o jogador escolhe).
  // Chances por vitória: o dono pediu 8% / 5% / 0,5% e aprovou dividir por 20
  // (com ~350 vitórias por hora caíam ~150 pontos/hora — forte demais).
  // Tudo fica ao reencarnar: núcleos guardados e pontos já usados.
  nucleos: {
    mapaMinimo: 3,
    bonusPorPonto: 0.01,
    atributos: ['ataque', 'vitalidade', 'defesa', 'velocidade'],
    tipos: [
      { id: 'baixo', nome: 'Núcleo de Rank Baixo', pontos: 1,  chance: 0.004,   cor: '#4ad04a', icone: 'nucleo_baixo' },
      { id: 'medio', nome: 'Núcleo de Rank Médio', pontos: 5,  chance: 0.0025,  cor: '#4a9aff', icone: 'nucleo_medio' },
      { id: 'alto',  nome: 'Núcleo de Rank Alto',  pontos: 20, chance: 0.00025, cor: '#ffd84a', icone: 'nucleo_alto' },
    ],
  },

  // ---- Black Book: Reencarnação e melhorias permanentes ----
  blackbook: {
    // Essência da Alma ao reencarnar = base × F × crescimento^F
    // (F = número de fases vencidas nesta vida, de 0 a 144)
    // Ex.: 12 fases → 68 | 24 → 195 | 48 → 793 | 72 → 2.4 mil | 144 → ~40 mil
    // v0.8.0: base era 2 (reencarnar passou a ser necessário, então rende mais)
    recompensa: { base: 4, crescimento: 1.03 },

    // Melhorias compradas com Essência da Alma. Nunca são perdidas.
    //   id         → atributo que melhora ('cultivo' = Cultivo por segundo)
    //   tipo       → 'multiplicar' (+X% do valor) ou 'somar' (+X pontos)
    //   bonus      → quanto cada nível dá (0.10 = +10%)
    //   custo do próximo nível = custoBase × crescimentoCusto^nível
    //   (v0.8.0: crescimento 1,15 em todas — com 1,25/1,3 o poder parava de crescer e o jogador travava para sempre)
    //   icone      → arquivo em img/icones/
    //   nivelMaximo → (opcional) nível máximo. v0.8.1: Crítico 10 e Dano Crítico 20 —
    //                 o Crítico já chega no teto de 60% só com o cultivo; sem limite o
    //                 Dano Crítico crescia para sempre.
    // v0.8.1 (pedido do dono): "Sombra Fugidia" (+0,5% Esquiva) foi REMOVIDA — Esquiva comprada
    // sem fim deixava o inimigo quase nunca acertar. Quem tinha níveis recebe a Essência de volta.
    removidas: { esquiva: { custoBase: 10, crescimentoCusto: 1.15 } },
    melhorias: [
      { id: 'ataque',      nome: 'Força Ancestral',      icone: 'atr_ataque',        descricao: '+10% Ataque',          tipo: 'multiplicar', bonus: 0.10, custoBase: 5,  crescimentoCusto: 1.15 },
      { id: 'vitalidade',  nome: 'Corpo Imortal',        icone: 'atr_vitalidade',    descricao: '+10% Vitalidade',      tipo: 'multiplicar', bonus: 0.10, custoBase: 5,  crescimentoCusto: 1.15 },
      { id: 'defesa',      nome: 'Pele de Ferro',        icone: 'atr_defesa',        descricao: '+10% Defesa',          tipo: 'multiplicar', bonus: 0.10, custoBase: 5,  crescimentoCusto: 1.15 },
      { id: 'velocidade',  nome: 'Passos do Vento',      icone: 'atr_velocidade',    descricao: '+5% Velocidade',       tipo: 'multiplicar', bonus: 0.05, custoBase: 8,  crescimentoCusto: 1.15 },
      { id: 'critico',     nome: 'Olho Celestial',       icone: 'atr_critico',       descricao: '+1% Taxa de Crítico',  tipo: 'somar',       bonus: 1,    custoBase: 10, crescimentoCusto: 1.15, nivelMaximo: 10 },
      { id: 'danoCritico', nome: 'Golpe Devastador',     icone: 'atr_dano_critico',  descricao: '+10% Dano Crítico',    tipo: 'somar',       bonus: 10,   custoBase: 10, crescimentoCusto: 1.15, nivelMaximo: 20 },
      { id: 'cultivo',     nome: 'Respiração Celestial', icone: 'atr_poder_cultivo', descricao: '+10% Cultivo por segundo', tipo: 'multiplicar', bonus: 0.10, custoBase: 8, crescimentoCusto: 1.15 },
    ],
  },
};
