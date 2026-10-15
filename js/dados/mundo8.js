// =============================================================
// dados/mundo8.js — MUNDO 8: MUNDO PRIMORDIAL — BATALHA FINAL (12 mapas × 12 fases)
//
// Mesmo formato dos outros mundos. No jogo, estes são os Mapas 85 a 96
// (fundos img/fundos/mapa85.jpg … mapa96.jpg). Libera ao vencer o chefe do
// Mapa 84 (Vontade do Forno do Universo, fim do Mundo 7).
// Lore: o fim de Martial Peak — dentro da Grande Restrição do Céu Inicial fica um mundo antigo onde um selo prende
// o cultivo de todos no Elemento Verdadeiro; lá, a Igreja da Luz e a Igreja da Tinta lutam há eras. Rompido o selo,
// Mo, a origem da Tinta, desperta para a batalha final (o livro termina num pacto de cem mil anos).
//
//   reino 17 = Reino da Criação, segunda metade (Copa, Flor e Fruto do Universo): inicioNoReino 3, fimNoReino 5.
//   selado: true (Mapas 85–90) = Selo do Mundo Primordial: você e os inimigos lutam com a força do Elemento
//   Verdadeiro (CONFIG.selo; sistemas/atributos.js e sistemas/mundo.js). Nos Mapas 91–96 o selo já se partiu.
//   O Fruto do Universo (último estágio) só amadurece depois de vencer Mo (reinos.js → mapaParaEstagio).
// =============================================================

const f = (local, inimigo, forma = 'humano') => ({ local, inimigo, forma });

// Mapas da Criação deste mundo: Copa, Flor e Fruto do Universo
const CRIACAO_2 = { reino: 17, inicioNoReino: 3, fimNoReino: 5 };
const SELADO = { ...CRIACAO_2, selado: true };

export const MUNDO_PRIMORDIAL = {
  id: 'mundo_primordial',
  nome: 'Mundo Primordial — Batalha Final',
  lema: '"Sem o seu poder, só resta o que você construiu."',
  descricao:
    'Dentro da Grande Restrição do Céu Inicial existe o Mundo Primordial, onde um selo antigo prende o cultivo de todos ' +
    'no Elemento Verdadeiro. Lá, a Igreja da Luz e a Igreja da Tinta lutam há eras — e, no fundo de tudo, Mo espera.',
  imagemFundo: null,

  mapas: [
    // ---------------------------------------------------------- MAPA 85
    {
      nome: 'Portão da Grande Restrição', icone: '⛓️', cor: '#1a1630', ...SELADO,
      cena: { ceu: ['#08060f', '#3a2a6a'], astro: '#c9b8ff', astroX: 270, estrelas: true, montanhas: ['#4a3a7a', '#2a2050', '#120e24'], estruturas: 'portal', nevoa: 'rgba(190,170,255,0.18)' },
      descricao:
        'Você atravessa a Grande Restrição do Céu Inicial — e uma força antiga sela o seu cultivo. Aqui dentro, até um ' +
        'mestre da Criação luta como um Elemento Verdadeiro.',
      sistema: 'Selo do Mundo Primordial',
      fases: [
        f('Fenda da Restrição', 'Sentinela Selada da Restrição', 'guardiao'),
        f('Correntes de Luz Antiga', 'Corrente Viva do Selo', 'guardiao'),
        f('Primeiro Passo Selado', 'Cultivador Selado Desesperado'),
        f('Muralha do Selo', 'Guardião da Muralha do Selo', 'guardiao'),
        f('Névoa que Prende o Qi', 'Fera da Névoa Seladora', 'fera'),
        f('Ossos dos que Vieram Antes', 'Esqueleto de um Ancestral Selado', 'fera'),
        f('Portão de Runas', 'Runa Guardiã Desperta', 'guardiao'),
        f('Câmara da Supressão', 'Espírito da Supressão', 'guardiao'),
        f('Corredor dos Exilados', 'Exilado do Mundo Primordial'),
        f('Altar da Primeira Luz', 'Sacerdote Guardião do Portão'),
        f('Arco do Selo', 'Colosso do Selo', 'guardiao'),
        f('Portão da Grande Restrição', 'Guardião do Selo Primordial', 'guardiao'),
      ],
    },
    // ---------------------------------------------------------- MAPA 86
    {
      nome: 'Terras do Mundo Primordial', icone: '🦣', cor: '#26301a', ...SELADO,
      cena: { ceu: ['#1a2a3a', '#a0b080'], astro: '#fff0c0', astroX: 120, estrelas: false, montanhas: ['#5a6a3a', '#3a4a2a', '#1a2410'], estruturas: 'arvores', nevoa: 'rgba(200,220,160,0.16)' },
      descricao:
        'Um mundo antigo onde ninguém passa do Elemento Verdadeiro. Feras primitivas, tribos e ruínas mais velhas que os ' +
        'Três Mil Mundos — e nenhum atalho para quem chega de fora.',
      sistema: 'Selo do Mundo Primordial',
      fases: [
        f('Planície Primitiva', 'Lobo Primordial', 'fera'),
        f('Aldeia de Caçadores', 'Caçador Tribal Selado'),
        f('Selva de Samambaias Gigantes', 'Serpente Primordial das Samambaias', 'fera'),
        f('Território do Javali', 'Javali de Presas Primordiais', 'fera'),
        f('Rio Turvo', 'Crocodilo do Rio Primordial', 'fera'),
        f('Ninho no Penhasco', 'Águia de Asas de Pedra', 'fera'),
        f('Tribo das Montanhas', 'Xamã Tribal do Mundo Primordial'),
        f('Caverna dos Ursos', 'Urso das Cavernas Primordial', 'fera'),
        f('Ruínas Mais Velhas que os Mundos', 'Guardião de Pedra Primordial', 'guardiao'),
        f('Pântano Selado', 'Sapo Gigante do Pântano Primordial', 'fera'),
        f('Vale dos Titãs', 'Fera Titânica Primordial', 'fera'),
        f('Trono das Feras', 'Rei das Feras Primordiais', 'fera'),
      ],
    },
    // ---------------------------------------------------------- MAPA 87
    {
      nome: 'Vila da Igreja da Luz', icone: '🕯️', cor: '#3a3220', ...SELADO,
      cena: { ceu: ['#2a2a4a', '#f0e0b0'], astro: '#ffffff', astroX: 200, estrelas: false, montanhas: ['#a09070', '#6a5a40', '#2a2418'], estruturas: 'pagodas', nevoa: 'rgba(255,240,200,0.18)' },
      descricao:
        'A Igreja da Luz guarda a memória da Luz que um dia prendeu a Tinta. Para ganhar a confiança dela, um forasteiro ' +
        'precisa vencer as provas dos seus campeões.',
      sistema: 'Selo do Mundo Primordial',
      fases: [
        f('Portões da Vila', 'Sentinela da Igreja da Luz'),
        f('Campo de Treino', 'Noviço da Luz Arrogante'),
        f('Muralha Leste', 'Fera Invasora da Floresta', 'fera'),
        f('Arena das Provas', 'Campeão das Provas da Luz'),
        f('Biblioteca de Pergaminhos de Luz', 'Guardiã dos Pergaminhos da Luz'),
        f('Jardim da Luz', 'Espírito de Luz do Jardim', 'guardiao'),
        f('Mercado da Vila', 'Espião da Tinta na Vila'),
        f('Torre do Sino', 'Paladino Veterano da Luz'),
        f('Santuário Interno', 'Golem Sagrado da Luz', 'guardiao'),
        f('Salão dos Anciões', 'Ancião Desconfiado da Luz'),
        f('Altar da Chama Branca', 'Inquisidor da Luz'),
        f('Catedral da Luz', 'Grande Paladino da Igreja da Luz'),
      ],
    },
    // ---------------------------------------------------------- MAPA 88
    {
      nome: 'Templos da Igreja da Tinta', icone: '🕍', cor: '#24122e', ...SELADO,
      cena: { ceu: ['#0a040e', '#4a1a5a'], astro: '#c040ff', astroX: 300, estrelas: true, montanhas: ['#3a1a4a', '#24102e', '#10060f'], estruturas: 'palacio', nevoa: 'rgba(160,60,200,0.2)' },
      descricao:
        'Do outro lado das montanhas, a Igreja da Tinta adora Mo como um deus. Seus fiéis trocam a alma por um pouco de força ' +
        '— e chamam isso de bênção.',
      sistema: 'Selo do Mundo Primordial',
      fases: [
        f('Trilha das Montanhas Negras', 'Fiel da Igreja da Tinta'),
        f('Aldeia Convertida', 'Aldeão Convertido pela Tinta'),
        f('Canil Sombrio', 'Cão de Guerra da Tinta', 'fera'),
        f('Escadaria Negra', 'Guarda do Templo da Tinta'),
        f('Sala dos Sacrifícios', 'Sacerdotisa da Tinta'),
        f('Fonte de Tinta Consagrada', 'Elemental de Tinta Consagrada', 'guardiao'),
        f('Claustro dos Penitentes', 'Penitente Mascarado da Tinta'),
        f('Forja dos Fiéis', 'Campeão Fanático da Tinta'),
        f('Cripta dos Mártires', 'Mártir Erguido pela Tinta', 'fera'),
        f('Coro das Sombras', 'Diácono das Sombras'),
        f('Relicário de Mo', 'Guardião do Relicário de Mo', 'guardiao'),
        f('Templo Maior da Tinta', 'Bispo da Igreja da Tinta'),
      ],
    },
    // ---------------------------------------------------------- MAPA 89
    {
      nome: 'Guerra das Duas Igrejas', icone: '⚔️', cor: '#2e2420', ...SELADO,
      cena: { ceu: ['#1a0e0a', '#8a5a4a'], astro: '#ffd36b', astroX: 90, estrelas: false, montanhas: ['#5a4a3a', '#3a2e24', '#1a1410'], estruturas: 'ruinas', nevoa: 'rgba(220,180,140,0.18)' },
      descricao:
        'Luz e Tinta se enfrentam em campo aberto, com exércitos inteiros presos no mesmo limite. Sob o selo, vence quem ' +
        'tem a base mais firme.',
      sistema: 'Selo do Mundo Primordial',
      fases: [
        f('Linha de Frente', 'Soldado da Igreja da Tinta'),
        f('Trincheiras Seladas', 'Desertor da Igreja da Luz'),
        f('Cavalaria Sombria', 'Montaria de Guerra da Tinta', 'fera'),
        f('Colina Disputada', 'Capitão da Igreja da Tinta'),
        f('Torres de Arqueiros', 'Arqueiro Fanático da Tinta'),
        f('Campo das Bandeiras', 'Porta-Estandarte de Mo'),
        f('Hospital de Campanha', 'Curandeira Traidora'),
        f('Ponte Quebrada', 'Gigante de Guerra Selado', 'guardiao'),
        f('Acampamento de Comando', 'Estrategista da Igreja da Tinta'),
        f('Vale dos Caídos', 'Eco de um Paladino Caído', 'guardiao'),
        f('Muralha de Escudos', 'Comandante Fanático da Tinta'),
        f('Coração da Batalha', 'Cardeal da Igreja da Tinta'),
      ],
    },
    // ---------------------------------------------------------- MAPA 90
    {
      nome: 'Coração do Selo', icone: '🔮', cor: '#201a3a', ...SELADO,
      cena: { ceu: ['#06040f', '#5a4aa0'], astro: '#e0d6ff', astroX: 220, estrelas: true, montanhas: ['#6a5aa0', '#3a3070', '#16122e'], estruturas: 'portal', nevoa: 'rgba(200,190,255,0.22)' },
      descricao:
        'No centro do Mundo Primordial pulsa o selo que prende o seu cultivo — o mesmo que prende Mo. A Igreja da Tinta quer ' +
        'rompê-lo para libertar o seu deus. Rompê-lo devolve o seu poder... e acorda o que dorme lá dentro.',
      sistema: 'Selo do Mundo Primordial',
      fases: [
        f('Anel Externo do Selo', 'Fragmento Vivo do Selo', 'guardiao'),
        f('Escadaria de Runas', 'Guardião das Runas Primordiais', 'guardiao'),
        f('Câmara dos Ecos', 'Eco da Luz Primordial', 'guardiao'),
        f('Ponte do Selo', 'Assassino Enviado pelo Pontífice'),
        f('Pilares do Selo', 'Pilar Vivo do Selo Primordial', 'guardiao'),
        f('Fenda de Tinta', 'Tinta Infiltrada no Selo', 'guardiao'),
        f('Sala das Correntes', 'Prisioneiro Antigo do Selo'),
        f('Guarda Sagrada', 'Guardião Eterno da Luz'),
        f('Altar Profanado', 'Arcebispo da Igreja da Tinta'),
        f('Núcleo Rachado', 'Núcleo Desperto do Selo', 'guardiao'),
        f('Guardião do Coração', 'Avatar do Selo Primordial', 'guardiao'),
        f('Coração do Selo', 'Pontífice da Igreja da Tinta'),
      ],
    },
    // ---------------------------------------------------------- MAPA 91
    {
      nome: 'O Despertar de Mo', icone: '🌑', cor: '#2a0a1a', ...CRIACAO_2,
      cena: { ceu: ['#0a0206', '#5a0a2a'], astro: '#ff3a6a', astroX: 180, estrelas: false, montanhas: ['#4a1a2a', '#2a0a18', '#12040a'], estruturas: 'ruinas', nevoa: 'rgba(200,40,90,0.2)' },
      descricao:
        'O selo se partiu: o seu poder voltou de uma vez. No mesmo instante, o Mundo Primordial treme — Mo despertou, e a ' +
        'Tinta jorra pelas rachaduras do céu.',
      sistema: null,
      fases: [
        f('Rachaduras no Céu', 'Tinta Jorrando do Céu', 'guardiao'),
        f('Vila em Chamas', 'Fiel Desperto de Mo'),
        f('Terra Rachada', 'Fera Nascida do Despertar', 'fera'),
        f('Selo Partido', 'Guardião do Selo Corrompido', 'guardiao'),
        f('Rio de Tinta', 'Serpente do Despertar', 'fera'),
        f('Céu Sem Luz', 'Fênix Apagada', 'fera'),
        f('Fortaleza da Luz Sitiada', 'Paladino Corrompido pela Tinta'),
        f('Ninho Desperto', 'Ninho do Despertar', 'guardiao'),
        f('Ecos de Mo', 'Sussurro de Mo', 'guardiao'),
        f('Vanguarda das Trevas', 'Senhor Real Despertado'),
        f('Dragão do Céu Rachado', 'Dragão da Tinta Desperto', 'fera'),
        f('Altar do Despertar', 'Arauto do Despertar de Mo'),
      ],
    },
    // ---------------------------------------------------------- MAPA 92
    {
      nome: 'Exército Eterno da Tinta', icone: '🏴', cor: '#1a0a14', ...CRIACAO_2,
      cena: { ceu: ['#06020a', '#3a0a2a'], astro: '#ff6a8a', astroX: 260, estrelas: true, montanhas: ['#3a1a2a', '#200a18', '#0e0408'], estruturas: 'palacio', nevoa: 'rgba(160,30,80,0.2)' },
      descricao:
        'Senhores Reais que dormiram por eras se levantam ao lado de Mo. É o maior exército da Tinta que já existiu — e ele ' +
        'marcha para fora da Grande Restrição.',
      sistema: null,
      fases: [
        f('Planície das Legiões', 'Legionário Eterno da Tinta'),
        f('Fileiras de Ossos', 'Soldado Esquelético da Tinta', 'fera'),
        f('Estábulos Negros', 'Montaria Eterna da Tinta', 'fera'),
        f('Muralha de Escudos Negros', 'Escudeiro Eterno da Tinta'),
        f('Forjas da Guerra', 'Golem Eterno da Tinta', 'guardiao'),
        f('Coro das Trevas', 'Feiticeiro Eterno da Tinta'),
        f('Ninhos da Retaguarda', 'Cria Eterna da Tinta', 'fera'),
        f('Tendas dos Generais', 'General Eterno da Tinta'),
        f('Catapultas de Tinta', 'Máquina de Guerra Viva', 'guardiao'),
        f('Ala dos Ancestrais Caídos', 'Ancestral Escravizado por Mo'),
        f('Estandarte Eterno', 'Dragão Negro Eterno', 'fera'),
        f('Trono da Legião', 'Grande Senhor Real Eterno'),
      ],
    },
    // ---------------------------------------------------------- MAPA 93
    {
      nome: 'Mar da Escuridão Primordial', icone: '🌊', cor: '#0a0e22', ...CRIACAO_2,
      cena: { ceu: ['#020208', '#14183a'], astro: '#8a8aff', astroX: 140, estrelas: true, montanhas: ['#1a2040', '#0e1228', '#060812'], estruturas: 'ruinas', nevoa: 'rgba(90,100,200,0.2)' },
      descricao:
        'Antes da luz, havia a escuridão — e a Tinta nasceu dela. Este mar sem fundo é tudo o que restou daquele tempo, ' +
        'e as criaturas dele nunca viram o sol.',
      sistema: null,
      fases: [
        f('Praia Sem Sol', 'Enguia da Escuridão', 'fera'),
        f('Ondas Negras', 'Espírito Afogado na Escuridão', 'guardiao'),
        f('Recifes de Obsidiana', 'Tartaruga de Obsidiana', 'fera'),
        f('Barco Fantasma', 'Pirata da Escuridão Primordial'),
        f('Correnteza Fria', 'Cardume de Sombras', 'fera'),
        f('Ilha Sem Nome', 'Habitante da Ilha Sem Nome'),
        f('Abismo Marinho', 'Devorador Abissal', 'fera'),
        f('Farol Apagado', 'Guardião do Farol Apagado', 'guardiao'),
        f('Redemoinho da Origem', 'Elemental da Escuridão Primordial', 'guardiao'),
        f('Ruínas Submersas', 'Eco do Primeiro Escuro', 'guardiao'),
        f('Fossa Mais Funda', 'Dragão Abissal da Escuridão', 'fera'),
        f('Olho do Mar', 'Leviatã da Escuridão Primordial', 'fera'),
      ],
    },
    // ---------------------------------------------------------- MAPA 94
    {
      nome: 'Ecos da Luz', icone: '☀️', cor: '#3a3418', ...CRIACAO_2,
      cena: { ceu: ['#3a3a6a', '#fff6d0'], astro: '#ffffff', astroX: 230, estrelas: false, montanhas: ['#d0c090', '#a08a5a', '#5a4a2a'], estruturas: 'palacio', nevoa: 'rgba(255,250,220,0.25)' },
      descricao:
        'Os restos da Luz que um dia prendeu Mo ainda brilham aqui. Eles testam se você é digno de terminar o que ela começou.',
      sistema: null,
      fases: [
        f('Campo de Luz Fria', 'Fagulha da Luz Primordial', 'guardiao'),
        f('Estátuas dos Primeiros', 'Estátua de um Primeiro Guardião', 'guardiao'),
        f('Bosque de Cristal Branco', 'Cervo de Luz Primordial', 'fera'),
        f('Prova da Coragem', 'Eco de um Herói da Luz'),
        f('Prova da Sabedoria', 'Guardiã da Sabedoria da Luz'),
        f('Ninho da Fênix Branca', 'Fênix Branca da Luz', 'fera'),
        f('Prova da Vontade', 'Reflexo da Sua Própria Dúvida'),
        f('Ponte de Raios', 'Qilin da Luz Primordial', 'fera'),
        f('Biblioteca da Luz', 'Memória da Luz', 'guardiao'),
        f('Salão do Juramento', 'Primeiro Paladino da Luz'),
        f('Sol Adormecido', 'Dragão do Sol Adormecido', 'fera'),
        f('Coração da Luz', 'Vontade da Luz Primordial', 'guardiao'),
      ],
    },
    // ---------------------------------------------------------- MAPA 95
    {
      nome: 'Trono de Mo', icone: '👁️', cor: '#1a0612', ...CRIACAO_2,
      cena: { ceu: ['#040104', '#2a0618'], astro: '#ff3a6a', astroX: 200, estrelas: false, montanhas: ['#2a0a1a', '#18040e', '#080206'], estruturas: 'palacio', nevoa: 'rgba(120,10,50,0.25)' },
      descricao:
        'O trono de onde Mo comanda a Tinta desde antes dos mundos. Cada passo até ele é guardado por quem um dia já foi um herói.',
      sistema: null,
      fases: [
        f('Escadaria Infinita', 'Sentinela do Trono de Mo', 'guardiao'),
        f('Galeria dos Heróis Caídos', 'Herói Caído Servo de Mo'),
        f('Jardim de Tinta', 'Flor Devoradora de Tinta', 'fera'),
        f('Salão dos Espelhos Negros', 'Seu Reflexo na Tinta'),
        f('Guarda de Honra', 'Guarda de Honra de Mo'),
        f('Fonte da Tinta Eterna', 'Elemental da Tinta Eterna', 'guardiao'),
        f('Ala dos Reis', 'Rei Caído Servo de Mo'),
        f('Prisão das Almas', 'Alma Aprisionada por Mo', 'guardiao'),
        f('Covil da Fera do Trono', 'Qilin Negro de Mo', 'fera'),
        f('Conselho das Sombras', 'Conselheiro Eterno de Mo'),
        f('Antessala do Trono', 'Guardião da Antessala de Mo', 'guardiao'),
        f('Trono de Mo', 'Sombra de Mo', 'guardiao'),
      ],
    },
    // ---------------------------------------------------------- MAPA 96
    {
      nome: 'Mo, a Origem da Tinta', icone: '⚫', cor: '#0a0410', ...CRIACAO_2,
      cena: { ceu: ['#000000', '#1a0a2a'], astro: '#ffffff', astroX: 270, estrelas: true, montanhas: ['#1a0e2a', '#0e0618', '#04020a'], estruturas: 'portal', nevoa: 'rgba(80,40,120,0.25)' },
      descricao:
        'O fim do caminho. Mo, a origem de toda a Tinta, existe desde antes dos mundos — e só alguém no ápice da Criação ' +
        'pode ficar de pé diante dele.',
      sistema: null,
      fases: [
        f('Limiar do Nada', 'Onda do Nada', 'guardiao'),
        f('Memórias dos Mundos', 'Eco de Todos os Mundos', 'guardiao'),
        f('Céu Partido em Dois', 'Fera do Fim dos Tempos', 'fera'),
        f('Campo dos Primeiros Mortos', 'Primeiro Guerreiro Caído'),
        f('Mar de Pensamentos de Mo', 'Pensamento Vivo de Mo', 'guardiao'),
        f('Ilusão do Começo', 'Ilusão do Pavilhão Ling Xiao'),
        f('Ponte Sobre o Vazio', 'Dragão Primordial da Tinta', 'fera'),
        f('Coração Negro dos Mundos', 'Coração de Mo', 'guardiao'),
        f('Braços da Escuridão', 'Braço de Mo', 'guardiao'),
        f('Olhar da Origem', 'Olho de Mo', 'guardiao'),
        f('Diante da Origem', 'Avatar de Mo', 'guardiao'),
        f('A Origem da Tinta', 'Mo, a Origem da Tinta', 'guardiao'),
      ],
    },
  ],

  // Mensagem ao vencer Mo (fim da história)
  final: {
    titulo: 'A Tinta encontra o seu fim.',
    texto:
      'Mo cai diante de você. A escuridão que existia antes dos mundos aceita um pacto: cem mil anos de paz para ' +
      'todos os mundos — e o Fruto do Universo pode, enfim, amadurecer dentro de você.\n\n' +
      '"Eu comecei varrendo pátios. Agora, nenhum mundo precisa mais temer a Tinta."\n\n' +
      '✨ FIM DA HISTÓRIA\n🌀 MODO SEM FIM — EM BREVE',
  },
};
