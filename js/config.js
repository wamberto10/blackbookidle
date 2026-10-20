// =============================================================
// config.js — NÚMEROS DE BALANCEAMENTO
// Todos os valores aqui são PROVISÓRIOS e serão ajustados
// conforme novos sistemas (equipamentos, Black Book...) entrarem.
// =============================================================

// Black Book: custo mais suave nos níveis altos (v0.17.2)
const CUSTO_ALTO = { aPartirDoNivel: 50, crescimento: 1.07 };

export const CONFIG = {
  versao: '0.33.2',

  // ---- v0.32.0: PROGRESSÃO CONTÍNUA (docs/PROGRESSAO_CONTINUA.md) ----
  // A campanha não recomeça mais: Fácil → Normal → Difícil → Inferno → Infinito são capítulos seguidos.
  // Cada dificuldade reaproveita os 96 mapas (e as artes) do Fácil: Normal — Mapa 1 = mapa global 97.
  // Posição global: mapa global g (0 = Fácil, Mapa 1) · fase global = g × 12 + fase local.
  progressao: {
    versaoDoSave: 2,              // save.js converte os saves da progressão antiga (versão 1) uma vez só
    mapasPorDificuldade: 96,
    // v0.33.0: o teto de escala (mapaMaximoDeEscala 1600) saiu — com os números grandes (js/numeros.js) inimigos,
    // itens, custos, recompensas e a Maestria continuam crescendo no Infinito.
    // O Fácil usa as curvas antigas (combate.dificuldadePorMundo, Pedras ×1,05 por fase, Essência de referência
    // do blackbook.recompensa). As dificuldades seguintes usam o crescimento POR MAPA desta tabela:
    //   inimigos   → Vida, Ataque e Defesa dos inimigos (além da Maestria de referência, ver maestria)
    //   velocidade → Velocidade dos inimigos
    //   essencia   → Essência de referência (farm e 1ª conquista; ver blackbook.essencia)
    //   pedras     → Pedras por vitória e custo de melhoria dos itens daquele patamar
    // O Infinito repete o último valor para sempre (gerado sob demanda, sem lista pronta).
    // Por que 1,21–1,215: é o ponto de equilíbrio com a economia — o Black Book dá ×1,05 por nível e cada nível
    // custa ×1,07, então a Essência ×1,268 por mapa compra ~3,5 níveis por mapa (×1,186) e os itens ×1,02 →
    // ×1,21 por mapa. Acima disso o tempo por mapa cresce (robô: 1,24 = ×1,25 por mundo; 1,27 = ×1,45 por mundo),
    // abaixo vira cascata. A Normal tem um pouco mais (raridades, estrelas e Núcleos ainda estão subindo).
    // Ver docs/PROGRESSAO_CONTINUA.md (tabelas do robô e análise de sensibilidade).
    dificuldades: [
      { id: 'facil',    nome: 'Fácil',    icone: 'dif_facil' },
      { id: 'normal',   nome: 'Normal',   icone: 'dif_normal',        inimigos: 1.215, velocidade: 1.075, essencia: 1.268, pedras: 1.25 },
      { id: 'dificil',  nome: 'Difícil',  icone: 'dif_dificil',       inimigos: 1.218, velocidade: 1.075, essencia: 1.268, pedras: 1.25 },
      { id: 'inferno',  nome: 'Inferno',  icone: 'dif_muito_dificil', inimigos: 1.216, velocidade: 1.075, essencia: 1.268, pedras: 1.25 },
      { id: 'infinito', nome: 'Infinito', icone: 'dif_muito_dificil', inimigos: 1.212, velocidade: 1.075, essencia: 1.268, pedras: 1.25 },
    ],
  },

  // ---- v0.32.0: Maestria da Criação — o cultivo continua depois do Fruto do Universo ----
  // Cada nível é como um estágio novo (nível n exige o chefe do mapa global 96 + mapasPorNivel × (n − 1)).
  // Os inimigos da Normal em diante usam a mesma Maestria como referência (1 nível a cada mapasPorNivel mapas).
  maestria: {
    nome: 'Maestria da Criação',
    mapasPorNivel: 4,
    ganhoAtributos: 1.25,     // × Ataque, Vitalidade, Defesa e Sentido Divino por nível
    ganhoVelocidade: 1.05,    // × Velocidade por nível
    ganhoProducao: 1.3,       // × Cultivo por segundo por nível
    custoInicial: 2.5,        // custo do nível 1 = custo de avançar no Fruto do Universo × isto
    crescimentoCusto: 1.577,  // × a cada nível
  },

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

  // ---- v0.21.0: melhorias do cultivo vindas da lore (sistemas/cultivoAvancado.js) ----
  // Reclusão: o combate das fases para e o Cultivo rende mais. Quanto mais tempo, mais fundo:
  // começa em +50% e chega a +150% depois de 4 h (conta também com o jogo fechado). O gargalo do chefe segura o reino,
  // então é uma escolha: no robô, Reclusão à noite (fora do gargalo) ficou perto de empatar com continuar lutando.
  reclusao: { reinoMinimo: 'elemento_inicial', bonusInicial: 0.5, bonusMaximo: 1.5, horasParaOMaximo: 4 },
  // Iluminação: de vez em quando um brilho aparece na tela inicial; tocar = Cultivo ×2 por 60 s
  iluminacao: { aparecerEntre: [240, 480], segundosNaTela: 20, segundos: 60, multiplicador: 2, acumuloMaximo: 180 },
  // Arranjo de Reunião de Energia: +2% de Cultivo por nível, comprado com Pedras Espirituais (custo ×2 por nível),
  // fica para sempre (também ao reencarnar)
  // (robô v0.21.0: com +4%/nível e custo ×1,45 chegava ao nível 60 = +240% e o Mundo 3 caía de 107 h para 61 h)
  arranjo: { bonusPorNivel: 0.02, custoBase: 40, crescimentoCusto: 2 },
  // Batismo Mundial: cada rompimento a partir da Transformação do Qi = +3% Ataque, Vitalidade e Defesa
  batismo: { primeiroReino: 'transformacao_qi', bonusPorBatismo: 0.03 },
  // Com Sentido Divino (Ascensão Imortal ou "a alma se lembra"), o Meditar rende +50%
  meditacaoComSentido: 0.5,
  // Mestre Estelar: no Rei da Origem, refinar a Fonte Estelar (custa 1 estágio de Cultivo) = +15% Cultivo nesta vida
  mestreEstelar: { reino: 'rei_origem', bonusCultivo: 0.15 },
  // v0.26.0: Selo do Mundo Primordial (Mundo 8, mapas com selado: true). Lá dentro você e os inimigos lutam com a
  // força do Elemento Verdadeiro (9º estágio): reino, estágio e Batismos ficam selados; Black Book, Núcleos, classe,
  // VIP e itens (até o limite do reino SELADO) continuam valendo. O cultivo (meditar, subir estágio) segue normal.
  // forcaDosInimigos: 1 = os inimigos selados ficam tão difíceis quanto ficariam sem o selo (sistemas/mundo.js).
  // Robô (Refinador, 4 rodadas): com 1 os mapas selados caíam em minutos (lá dentro os itens rendem o máximo do reino
  // selado) e o Mapa 91 virava uma muralha de 17 h; com 4 (e Mundo 8 = 1,2) cada mapa leva 2–5 h e o mundo ~43 h.
  // v0.32.0: forcaDosInimigos 1 — com os itens em % do cultivo, o Selo já tira do jogador a mesma fração que tira
  // dos inimigos; com 4 os mapas selados viravam muralhas de 14 h no robô. Só existe no Fácil (Mapas 85–90).
  selo: { reino: 'elemento_verdadeiro', estagio: 8, forcaDosInimigos: 1 },
  // Pílulas de cultivo: caem dos inimigos a partir do Mapa 2 (chance = base × "pedras" do tipo da fase:
  // comum 0,07%, chefe 1%) e sempre na 1ª vitória contra um chefe de mapa. Ficam ao reencarnar.
  // Robô (Refinador, 6 rodadas): com tudo isto o Mundo 1 vai de 35 h para 28 h e o Mundo 3 de 107 h para 90 h.
  pilulas: {
    mapaMinimo: 2,
    chanceBase: 0.0007,
    tipos: [
      { id: 'acumulo',    nome: 'Pílula de Acúmulo de Qi',      icone: 'pilula_acumulo',    peso: 55, segundosDeCultivo: 300,
        texto: 'Ganha na hora 5 min de Cultivo.' },
      { id: 'fluxo',      nome: 'Pílula do Fluxo Celestial',    icone: 'pilula_fluxo',      peso: 35, segundos: 600, multiplicador: 2,
        texto: 'Cultivo ×2 por 10 min.' },
      { id: 'rompimento', nome: 'Pílula Quebra-Gargalo',        icone: 'pilula_rompimento', peso: 10, desconto: 0.3, descontoMaximo: 0.5,
        texto: 'O próximo rompimento de reino custa 30% menos.' },
    ],
  },

  // ---- Atributos ----
  // Ataque, Vitalidade e Defesa = base × crescimento^nível × bonusPorReino^reino × bônus do Black Book
  atributos: {
    base: { ataque: 5, vitalidade: 60, defesa: 2, sentidoDivino: 20 },
    crescimento: 1.25,
    bonusPorReino: 1.6,
    bonusPorReinoJogador: 2.0,  // v0.9.16 (dono): o jogador ganha ×2 por reino (os inimigos ×1,6) — rompimento = ×2,5
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

  // ---- v0.33.0: gerenciamento automático (sistemas/automacao.js; ligado pelo jogador em Opções) ----
  // intervaloSegundos: de quanto em quanto tempo DE JOGO a automação roda (mesmos instantes online e offline)
  // comprasPorExecucao: limite de compras de cada tipo por execução (o resto fica para a próxima — nada se perde)
  automacao: { intervaloSegundos: 60, comprasPorExecucao: 500 },

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
    // v0.13.1 (dono achou o farm de Pedras baixo): ×2 em toda vitória. Antes, levar 1 Lendário
    // até +20 levava ~8 h de farm (o conjunto de 10, ~83 h); agora ~4 h (~41 h).
    multiplicadorPedras: 2,
    // v0.8.0: cada mapa tem inimigos mais fortes que o anterior (Vida, Ataque e Defesa ×1,31^mapa).
    // Cria "muralhas" que só caem depois de reencarnar e comprar melhorias no Black Book.
    // v0.8.1: era 1.32 — compensa a Esquiva que saiu do Black Book (robô: 81–90 h, 3 reencarnações)
    dificuldadePorMapa: 1.31,
    // v0.21.2: crescimento por mapa em cada mundo (Mundo 1, 2, 3...). O robô testou 1,36–1,45 no Mundo 3 e o tempo
    // total não mudou (a reencarnação seguinte atravessa os mapas do mesmo jeito).
    // v0.22.0: Mundo 4 = 1,5. Com 1,31 ele passava em ~10 h (o que fica ao reencarnar — itens e Black Book —
    // leva a vida nova direto à fronteira); com 1,5 ~24 h (robô, Refinador); 1,7 = 66 h e 13 reencarnações.
    // v0.23.0: Mundo 5 = 1,25. No Mundo 5 não há rompimento de reino (só a 4ª–6ª Ordem do Céu Aberto), então o cultivo
    // fortalece menos: com 1,5 o robô levava ~133 h e ~30 reencarnações; 1,31 = 41 h; 1,25 = ~25 h (mapas até ~4 h).
    // v0.24.0: Mundo 6 = 1,25 também (de novo só Ordens, sem rompimento de reino)
    // v0.25.0: Mundo 7 = 1,25 (robô: ~31 h, igual ao Mundo 6; 1,35 = 73 h; 1,45 = 146 h)
    // v0.26.0: Mundo 8 = 1,2 (robô: ~43 h, mapas de 2–5 h; com 1,25 ~58 h). Ver também CONFIG.selo.
    // v0.32.0 (progressão contínua, sem reencarnação): recalibrado mundo a mundo pelo robô para ~13 h por mundo
    // (ferramentas/calibrar-mundos.mjs). Antes: [1.31, 1.31, 1.31, 1.5, 1.25, 1.25, 1.25, 1.2]. O Mundo 3 subiu
    // (o Black Book juntado no Mundo 2, que é lento pelo cultivo, atravessava o Mundo 3 em ~3 h) e o Mundo 4 desceu.
    dificuldadePorMundo: [1.31, 1.31, 1.656, 1.263, 1.225, 1.244, 1.263, 1.184],
    // v0.21.2: Velocidade dos inimigos × isto a cada mapa (decide quem ataca primeiro e o ataque duplo). Antes não
    // crescia: no Mundo 2 o jogador já tinha 1,4–3,8× a velocidade dos chefes e no Mundo 3 ~10× (ataque duplo sempre).
    // Com 1,03: Mundo 2 ≈ 1,5–1,9× (o ataque duplo precisa ser conquistado), Mundo 3 ≈ 2–4×. Ritmo igual no robô.
    velocidadePorMapa: 1.03,
    // v0.8.1: todo golpe tira pelo menos 10% do Ataque de quem bate, por maior que seja a Defesa
    danoMinimo: 0.1,
    // v0.21.1: inimigo mais fraco que você dá menos Cultivo = (produção no nível da fase ÷ a sua)^expoente
    // (0.5 → 1 reino abaixo ≈ 25%, 2 reinos ≈ 5%; fases no seu nível ou acima dão 100%)
    expoenteInimigoFraco: 0.5,
    // v0.21.1: Cultivo de cada vitória = segundos de produção do tipo da fase (comum 1,5 s ... chefe 15 s) × isto
    // (era 1: as lutas davam 25% do Cultivo; com 2, ~45% — o ritmo total fica igual porque farmar mapa antigo
    //  deixou de render, e a Essência cresce menos depois do Mundo 1)
    multiplicadorCultivo: 2,
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
    // v0.32.0 (progressão contínua): Ataque, Vitalidade, Defesa e Velocidade dos itens viraram PORCENTAGEM que
    // multiplica o cultivo: atributo = base do cultivo × (1 + soma dos % dos itens) × bônus permanentes.
    // % do item = fração do espaço × força do tier × estrelas × crescimentoPorMapa^(mapa global onde caiu) × 100
    // (antes era um valor fixo somado à base, limitado a 3× a força do reino — o "limiteDoReino" saiu).
    crescimentoPorMapa: 1.02,
    bonusPorNivel: 0.05,               // cada nível de melhoria dá +5% em todos os atributos
    custoMelhoriaBase: 4,              // Pedras = base × valor do tier × 1,05^fase × 1,25^nível
    crescimentoCustoMelhoria: 1.25,
    pedrasAoDesmancharBase: 3,         // Pedras = base × valor do tier × 1,05^fase (+75% do investido)
    devolucaoAoDesmanchar: 0.75,       // v0.15.4 (dono): era 0.5 — vale também na mescla
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
    // v0.21.1: era 3 — com o Meditar +50% do Sentido Divino, a tela aberta rendia ~13× a produção e o VIP
    // terminava o Mundo 3 ~45% antes. Com 1: VIP 18% (tela fechada) a ~40% (tela aberta 1/4 do tempo) mais rápido.
    cliquesPorSegundo: 1,                 // Meditar automático (só com o jogo aberto na tela)
    pesosExtras: [10, 10, 5, 3, 1],       // somados nos pesos dos tiers (50/25/10/5/1 → 60/35/15/8/2)
    // v0.32.0: +25% na Essência do FARM (a das 1ªs conquistas é igual para todos). Era +100% ao reencarnar; com +100%
    // no farm o VIP ficava 36% mais rápido (robô, tela fechada); com +25%, 18% — a mesma vantagem medida na v0.21.1.
    bonusEssencia: 0.25,
    atributos: { ataque: 0.25, defesa: 0.25, vitalidade: 0.25 },   // +25% no total (v0.9.15, dono: era +50%)
  },

  // ---- Sentido Divino (v0.12.0, ideia do dono) ----
  // Supressão de Alma: se o seu Sentido Divino for 5× (ou mais) o do inimigo, ele foge apavorado
  // antes da luta = vitória na hora, com recompensa normal. Chefes e mini-chefes nunca fogem.
  // "A alma se lembra": o maior Sentido Divino já alcançado continua ao reencarnar.
  // Num mundo que você já zerou (em qualquer vida), TODOS os inimigos comuns dele fogem.
  sentidoDivino: {
    supressao: 5,
    imunes: ['miniChefe', 'chefe'],
  },

  // ---- Evento de Boss (v0.11.0, ideia do dono) ----
  // Mestre do Salão Ying Yue: boss de vida enorme que vai sendo desgastado em várias lutas.
  // Por enquanto LOCAL (cada jogador tem o seu); feito para virar global (com servidor) depois.
  // O boss tem a força do ÚLTIMO CHEFE DE MAPA que o jogador já venceu, e o dano conta como
  // % da vida total — assim jogadores em pontos diferentes do jogo disputam o rank por igual.
  boss: {
    nome: 'Mestre do Salão Ying Yue',
    aparencia: 'mestre_ying_yue',      // sprite em img/inimigos/
    vidaEmChefes: 40,                  // vida total = 40× a vida desse chefe (~18 lutas ≈ 35 min jogando)
    ataque: 1.0,                       // × o ataque do chefe do seu mapa
    defesa: 1.0,                       // × a defesa do chefe do seu mapa
    velocidade: 1.05,                  // × a velocidade do chefe do seu mapa
    duracaoLuta: 60,                   // segundos de cada luta (ou até você cair)
    descanso: 60,                      // segundos de descanso entre uma luta e outra
    renasceMinutos: 10,                // volta 10 min depois de ser derrotado
    // Recompensa (igual para todos que causaram dano): 10 Núcleos de rank aleatório
    // (chances proporcionais às do drop: ~59% Baixo, ~37% Médio, ~4% Alto) + 1 item Ancestral
    // de espaço aleatório, do mapa SEGUINTE ao seu (v0.14.2: melhor que um Lendário ★5 de 1 mapa à frente)
    nucleos: 10,
    // Técnica especial (v0.11.0): a cada 5 turnos do boss, 1 turno concentrando a luz da lua
    // (não ataca) e no seguinte a Lâmina da Lua Crescente (×2,5 o dano normal). Em média o boss
    // bate só 10% mais que um golpe normal por turno, mas a luta fica com "momentos" de perigo.
    especial: { nome: 'Lâmina da Lua Crescente', aCada: 5, multiplicador: 2.5 },
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
    // v0.21.1: depois da fase 144 (fim do Mundo 1) cada fase multiplica por crescimentoDepois. Com 1,03 em tudo
    // a Essência explodia (fase 211 → 431 mil; fase 417 → 376 milhões) e na vida seguinte o Black Book sozinho
    // passava 30+ mapas no Corpo Temperado: cultivo e reinos deixavam de importar.
    recompensa: { base: 4, crescimento: 1.03, faseDaVirada: 144, crescimentoDepois: 1.02 },
    // v0.32.0 (progressão contínua): não existe mais a Essência da reencarnação. A curva acima virou a
    // "Essência de referência" de cada fase (E) — na Normal em diante ela cresce por progressao.dificuldades[].essencia.
    //   1ª conquista (uma vez só, para sempre): fracaoPrimeiraConquista × (E da fase − E da fase anterior)
    //   farm (renovável): E da fase ÷ (horas de referência × 3600) por segundo de luta VENCIDA (pausa + turnos).
    //   Derrota não paga; fase mais fácil paga menos (E menor); o offline paga o tempo simulado, uma vez só.
    //   Horas de referência: horasDeReferencia no Fácil; da Normal em diante, a PONTE (v0.33.0):
    //     min(horasDepoisDoFacil, horasDeReferencia × E(fase) ÷ E0)   (E0 = E do chefe final do Fácil)
    //   Assim o farm por segundo nunca cai ao entrar na Normal (na v0.32.0 caía ~49%: o denominador pulava de
    //   12 h para 24 h). Ele fica no nível do chefe do Fácil até E(fase) = 2 × E0 (~fim da Normal 3) e depois
    //   segue a curva de 24 h.
    //   (robô: com 10% de 1ª conquista ela virava ~70% da Essência no Inferno e puxava uma cascata; com 3%, ~10–20%)
    essencia: { horasDeReferencia: 12, horasDepoisDoFacil: 24, fracaoPrimeiraConquista: 0.03 },

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
    // v0.14.0 (dono: "o up do livro está muito caro"): Ataque, Vitalidade, Defesa, Velocidade e Cultivo
    // passaram a MULTIPLICAR a cada nível (composto: ×1,05 por nível; Velocidade ×1,02 para não dar
    // ataque duplo para todo mundo). Antes SOMAVAM +10% do base: no nível 80 cada nível novo valia +1%
    // e custava 359 mil. Custo +17% por nível (era 15%). Robô (5 classes): Mundo 1 em 28–38 h,
    // Mundos 1+2 em 82–97 h, 2–3 reencarnações. "antes" = regra antiga, usada para converter saves.
    // v0.17.2 (dono: "o custo está ficando muito alto"): a partir do nível 50 o custo cresce +7%
    // por nível em vez de +17% (antes, no nível 80, 1 nível custava ~1,4 milhão = uma vida inteira
    // no Mapa 21). O começo do jogo não muda.
    melhorias: [
      { id: 'ataque',      nome: 'Força Ancestral',      icone: 'atr_ataque',        descricao: '×1,05 Ataque',         tipo: 'multiplicar', composto: true, bonus: 0.05, custoBase: 5,  crescimentoCusto: 1.17, custoAlto: CUSTO_ALTO, antes: { bonus: 0.10, crescimentoCusto: 1.15 } },
      { id: 'vitalidade',  nome: 'Corpo Imortal',        icone: 'atr_vitalidade',    descricao: '×1,05 Vitalidade',     tipo: 'multiplicar', composto: true, bonus: 0.05, custoBase: 5,  crescimentoCusto: 1.17, custoAlto: CUSTO_ALTO, antes: { bonus: 0.10, crescimentoCusto: 1.15 } },
      { id: 'defesa',      nome: 'Pele de Ferro',        icone: 'atr_defesa',        descricao: '×1,05 Defesa',         tipo: 'multiplicar', composto: true, bonus: 0.05, custoBase: 5,  crescimentoCusto: 1.17, custoAlto: CUSTO_ALTO, antes: { bonus: 0.10, crescimentoCusto: 1.15 } },
      { id: 'velocidade',  nome: 'Passos do Vento',      icone: 'atr_velocidade',    descricao: '×1,02 Velocidade',     tipo: 'multiplicar', composto: true, bonus: 0.02, custoBase: 8,  crescimentoCusto: 1.17, custoAlto: CUSTO_ALTO, antes: { bonus: 0.05, crescimentoCusto: 1.15 } },
      { id: 'critico',     nome: 'Olho Celestial',       icone: 'atr_critico',       descricao: '+1% Taxa de Crítico',  tipo: 'somar',       bonus: 1,    custoBase: 10, crescimentoCusto: 1.15, nivelMaximo: 10 },
      { id: 'danoCritico', nome: 'Golpe Devastador',     icone: 'atr_dano_critico',  descricao: '+10% Dano Crítico',    tipo: 'somar',       bonus: 10,   custoBase: 10, crescimentoCusto: 1.15, nivelMaximo: 20 },
      { id: 'cultivo',     nome: 'Respiração Celestial', icone: 'atr_poder_cultivo', descricao: '×1,05 Cultivo por segundo', tipo: 'multiplicar', composto: true, bonus: 0.05, custoBase: 8, crescimentoCusto: 1.17, custoAlto: CUSTO_ALTO, antes: { bonus: 0.10, crescimentoCusto: 1.15 } },
    ],
  },
};
