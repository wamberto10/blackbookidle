// =============================================================
// dados/mundo6.js — MUNDO 6: UNIVERSO EXTERIOR — CAMPO DE BATALHA DA TINTA (12 mapas × 12 fases)
//
// Mesmo formato dos outros mundos. No jogo, estes são os Mapas 61 a 72
// (fundos img/fundos/mapa61.jpg … mapa72.jpg). Libera ao vencer o chefe do
// Mapa 60 (Passagem para o Campo de Batalha, fim dos Três Mil Mundos).
// Lore: a guerra contra o Clã da Tinta Negra em Martial Peak — o Campo de Batalha da Tinta, as
// fortalezas-passo da humanidade, os Ninhos da Tinta, os Senhores de Território e os Senhores Reais,
// os mundos devorados, os clãs sagrados corrompidos, os Antigos Ancestrais caídos, a Grande Restrição
// do Céu Inicial que prende a origem da Tinta e a própria Tinta Primordial.
//
//   reino 16 = Reino do Céu Aberto, faixa "Alto Rank" (7ª–9ª Ordem): inicioNoReino 6, fimNoReino 8.
//   A 9ª Ordem é o último estágio do jogo (por enquanto).
// =============================================================

const f = (local, inimigo, forma = 'humano') => ({ local, inimigo, forma });

// Mapas do Céu Aberto deste mundo: 7ª a 9ª Ordem
const ALTO_RANK = { reino: 16, inicioNoReino: 6, fimNoReino: 8 };

export const MUNDO_UNIVERSO_EXTERIOR = {
  id: 'universo_exterior',
  nome: 'Universo Exterior — Campo de Batalha da Tinta',
  lema: '"Na 9ª Ordem, você não protege um mundo. Você protege todos eles."',
  descricao:
    'O Campo de Batalha da Tinta Negra: o vazio onde a humanidade dos Três Mil Mundos luta, há eras, contra o ' +
    'Clã da Tinta. Fortalezas, Ninhos, Senhores Reais — e, no fundo de tudo, a origem da própria Tinta.',
  imagemFundo: null,

  mapas: [
    // ---------------------------------------------------------- MAPA 61
    {
      nome: 'Campo de Batalha da Tinta Negra', icone: '⚔️', cor: '#140a14', ...ALTO_RANK,
      cena: { ceu: ['#040204', '#2a1a2a'], astro: '#8a6a8a', astroX: 200, estrelas: true, montanhas: ['#3a2a3a', '#221822', '#0e0a0e'], estruturas: 'ruinas', nevoa: 'rgba(120,80,120,0.2)' },
      descricao:
        'Um vazio sem fim marcado por mundos mortos e destroços de guerra. Aqui a humanidade luta contra o Clã da Tinta Negra há eras.',
      sistema: null,
      fases: [
        f('Destroços de Guerra', 'Soldado Raso da Tinta'),
        f('Mundo Morto', 'Fera Errante da Tinta', 'fera'),
        f('Trincheira Estelar', 'Batedor de Território da Tinta'),
        f('Nave Abandonada', 'Cultivador Escravizado pela Tinta'),
        f('Nuvem de Tinta', 'Espírito da Nuvem de Tinta', 'guardiao'),
        f('Campo Minado de Formações', 'Golem de Formação de Guerra', 'guardiao'),
        f('Posto Avançado da Tinta', 'Guerreiro Veterano da Tinta'),
        f('Cemitério de Naves', 'Eco de um Soldado Humano', 'guardiao'),
        f('Fenda de Guerra', 'Fera de Guerra da Tinta', 'fera'),
        f('Torre de Sinal', 'Feiticeiro de Guerra da Tinta'),
        f('Linha de Frente', 'Comandante de Linha da Tinta'),
        f('Coração do Campo', 'Senhor de Território da Linha de Frente'),
      ],
    },
    // ---------------------------------------------------------- MAPA 62
    {
      nome: 'Passo da Humanidade', icone: '🏰', cor: '#2a1a14', ...ALTO_RANK,
      cena: { ceu: ['#0a0604', '#4a2a1a'], astro: '#ffb060', astroX: 90, estrelas: true, montanhas: ['#5a3a2a', '#3a2418', '#1a100a'], estruturas: 'palacio', nevoa: 'rgba(255,160,90,0.16)' },
      descricao:
        'Uma fortaleza-passo dos Três Mil Mundos, uma das muralhas que seguram a Tinta. Hoje ela está sob cerco.',
      sistema: null,
      fases: [
        f('Portões do Passo', 'Invasor da Tinta'),
        f('Muralha Leste', 'Escalador da Tinta'),
        f('Torre dos Canhões Espirituais', 'Fera de Cerco da Tinta', 'fera'),
        f('Pátio das Legiões', 'Traidor do Passo'),
        f('Arsenal do Passo', 'Golem de Cerco da Tinta', 'guardiao'),
        f('Hospital de Campanha', 'Infiltrado da Tinta'),
        f('Portão Interno', 'Capitão de Cerco da Tinta'),
        f('Salão de Comando', 'Conselheiro Possuído pela Tinta'),
        f('Torre das Formações', 'Formação de Guerra Corrompida', 'guardiao'),
        f('Muralha Oeste', 'General de Cerco da Tinta'),
        f('Ponte Levadiça', 'Arauto do Cerco'),
        f('Trono do Passo', 'Senhor de Território do Cerco'),
      ],
    },
    // ---------------------------------------------------------- MAPA 63
    {
      nome: 'Ninho da Tinta', icone: '🕸️', cor: '#1a0a1a', ...ALTO_RANK,
      cena: { ceu: ['#060206', '#3a0a3a'], astro: null, estrelas: false, montanhas: ['#4a1a4a', '#2c0e2c', '#140614'], estruturas: 'ruinas', nevoa: 'rgba(160,40,160,0.2)' },
      descricao:
        'Os Ninhos da Tinta são de onde o Clã nasce. Destruir um é cortar um exército pela raiz — e ele se defende como um ser vivo.',
      sistema: null,
      fases: [
        f('Borda do Ninho', 'Cria da Tinta', 'fera'),
        f('Túneis Pulsantes', 'Verme do Ninho da Tinta', 'fera'),
        f('Câmara das Crias', 'Guardiã das Crias', 'fera'),
        f('Raízes de Tinta', 'Raiz Viva de Tinta', 'guardiao'),
        f('Ovos de Tinta', 'Larva Gigante de Tinta', 'fera'),
        f('Veias do Ninho', 'Espírito do Ninho', 'guardiao'),
        f('Câmara de Guerra', 'Guerreiro Recém-Nascido da Tinta'),
        f('Coração Pulsante', 'Núcleo Vivo do Ninho', 'guardiao'),
        f('Galeria dos Guardiões', 'Guardião do Ninho da Tinta', 'guardiao'),
        f('Câmara Real do Ninho', 'Fera Mãe do Ninho', 'fera'),
        f('Trono do Ninho', 'Senhor do Ninho'),
        f('Ninho da Tinta', 'Ninho da Tinta Desperto', 'guardiao'),
      ],
    },
    // ---------------------------------------------------------- MAPA 64
    {
      nome: 'Território Negro', icone: '🏴', cor: '#0a0a14', ...ALTO_RANK,
      cena: { ceu: ['#020208', '#1a1a3a'], astro: '#6a6aaa', astroX: 230, estrelas: true, montanhas: ['#2a2a4a', '#18182c', '#0a0a14'], estruturas: 'cidade', nevoa: 'rgba(90,90,160,0.2)' },
      descricao:
        'O domínio de um Senhor de Território. Mundos inteiros transformados em fortalezas negras, onde a Tinta é o ar.',
      sistema: null,
      fases: [
        f('Fronteira Negra', 'Patrulha do Território Negro'),
        f('Mundo Escravizado', 'Escravo da Tinta'),
        f('Minas de Tinta', 'Capataz das Minas de Tinta'),
        f('Floresta de Tinta', 'Fera Caçadora da Tinta', 'fera'),
        f('Rio de Tinta Sólida', 'Serpente de Tinta Sólida', 'fera'),
        f('Fortaleza Negra', 'Guarda da Fortaleza Negra'),
        f('Altar dos Sacrifícios', 'Sacerdote dos Sacrifícios'),
        f('Arena Negra', 'Gladiador da Tinta'),
        f('Torre de Observação', 'Olho da Tinta', 'guardiao'),
        f('Palácio do Território', 'Conselheiro do Senhor de Território'),
        f('Câmara de Guerra Negra', 'Lugar-Tenente do Senhor'),
        f('Trono do Território', 'Senhor de Território Veterano'),
      ],
    },
    // ---------------------------------------------------------- MAPA 65
    {
      nome: 'Mundos Devorados', icone: '🌑', cor: '#1a1a1a', ...ALTO_RANK,
      cena: { ceu: ['#060606', '#2a2a2a'], astro: '#9a9a9a', astroX: 120, estrelas: false, montanhas: ['#3a3a3a', '#242424', '#101010'], estruturas: 'arvores', nevoa: 'rgba(140,140,140,0.22)' },
      descricao:
        'Mundos que a Tinta já engoliu. Tudo o que vivia ali agora luta por ela — até as feras sagradas.',
      sistema: null,
      fases: [
        f('Superfície Cinzenta', 'Cultivador Devorado'),
        f('Floresta Morta', 'Árvore Devorada pela Tinta', 'guardiao'),
        f('Céu Negro', 'Águia Devorada pela Tinta', 'fera'),
        f('Lago de Tinta', 'Tartaruga Devorada pela Tinta', 'fera'),
        f('Vila Silenciosa', 'Cultivadora Devorada'),
        f('Montanha Partida', 'Dragão Devorado pela Tinta', 'fera'),
        f('Templo Engolido', 'Ancião Devorado pela Tinta'),
        f('Ninho Abandonado', 'Fênix Devorada pela Tinta', 'fera'),
        f('Ruínas de Seita', 'Grou Devorado pela Tinta', 'fera'),
        f('Planície de Ossos', 'Qilin Devorado pela Tinta', 'fera'),
        f('Palácio Engolido', 'Imperador Devorado pela Tinta'),
        f('Coração do Mundo Morto', 'Devorador de Mundos da Tinta', 'fera'),
      ],
    },
    // ---------------------------------------------------------- MAPA 66
    {
      nome: 'Frente dos Clãs Sagrados', icone: '🐉', cor: '#2a0a0a', ...ALTO_RANK,
      cena: { ceu: ['#0a0202', '#5a1a0a'], astro: '#ff8a3a', astroX: 170, estrelas: false, montanhas: ['#6a2a1a', '#401810', '#1c0a06'], estruturas: 'pagodas', nevoa: 'rgba(255,120,60,0.18)' },
      descricao:
        'Os Clãs do Dragão e da Fênix entraram na guerra. Mas a Tinta corrompe até sangue sagrado.',
      sistema: null,
      fases: [
        f('Acampamento Sagrado', 'Batedor da Tinta Infiltrado'),
        f('Penhasco do Dragão', 'Dragão Corrompido Jovem', 'fera'),
        f('Ninho em Chamas', 'Fênix Corrompida', 'fera'),
        f('Campo de Escamas', 'Lagarto Dracônico de Tinta', 'fera'),
        f('Céu de Fogo Negro', 'Pássaro de Fogo Negro', 'fera'),
        f('Templo dos Clãs', 'Ancião Dragão Corrompido'),
        f('Rio de Sangue Sagrado', 'Serpente Dracônica de Tinta', 'fera'),
        f('Ponte das Escamas', 'Guerreiro Dragão Caído'),
        f('Altar Sagrado', 'Sacerdotisa Caída da Fênix'),
        f('Pico do Trovão Negro', 'Dragão do Trovão Negro', 'fera'),
        f('Ninho Real', 'Fênix Negra Ancestral', 'fera'),
        f('Trono dos Clãs', 'Dragão Ancestral Corrompido', 'fera'),
      ],
    },
    // ---------------------------------------------------------- MAPA 67
    {
      nome: 'Domínio do Senhor Real', icone: '👑', cor: '#1a0a2a', ...ALTO_RANK,
      cena: { ceu: ['#06020a', '#3a1a5a'], astro: '#c070ff', astroX: 160, estrelas: true, montanhas: ['#4a2a6a', '#2c1840', '#140a1e'], estruturas: 'palacio', nevoa: 'rgba(190,110,255,0.18)' },
      descricao:
        'Acima dos Senhores de Território estão os Senhores Reais da Tinta. Um só deles comanda exércitos de mundos.',
      sistema: null,
      fases: [
        f('Portões Reais', 'Guarda Real do Domínio'),
        f('Estrada Negra Real', 'Cavaleiro Real da Tinta'),
        f('Jardins de Tinta', 'Fera Real da Tinta', 'fera'),
        f('Salão dos Senhores', 'Senhor de Território Vassalo'),
        f('Câmara das Formações Reais', 'Formação Real da Tinta', 'guardiao'),
        f('Galeria dos Troféus', 'Eco de um Ancestral Caído', 'guardiao'),
        f('Prisão Real', 'Ancestral Humano Corrompido'),
        f('Torre do Comando Real', 'Estrategista Real da Tinta'),
        f('Câmara do Ninho Real', 'Ninho Real da Tinta', 'guardiao'),
        f('Salão do Trono Real', 'Campeão do Senhor Real'),
        f('Antessala Real', 'Herdeiro do Senhor Real'),
        f('Trono Real', 'Senhor Real da Tinta'),
      ],
    },
    // ---------------------------------------------------------- MAPA 68
    {
      nome: 'Ruínas dos Antigos Ancestrais', icone: '🗡️', cor: '#2a2a1a', ...ALTO_RANK,
      cena: { ceu: ['#0a0a06', '#4a4a2a'], astro: '#e0d8a0', astroX: 100, estrelas: true, montanhas: ['#5a5a3a', '#3a3a24', '#1a1a10'], estruturas: 'ruinas', nevoa: 'rgba(230,220,160,0.16)' },
      descricao:
        'Aqui caíram os Antigos Ancestrais da humanidade, cultivadores da 9ª Ordem. Seus ecos ainda lutam — e a Tinta ainda os quer.',
      sistema: null,
      fases: [
        f('Campo dos Heróis', 'Eco de um Herói Caído', 'guardiao'),
        f('Armas Partidas', 'Espírito de Arma Ancestral', 'guardiao'),
        f('Muralha Ancestral', 'Golem Ancestral da Humanidade', 'guardiao'),
        f('Túmulo dos Generais', 'General Ancestral Corrompido'),
        f('Lago das Lágrimas', 'Serpente das Lágrimas', 'fera'),
        f('Salão da Memória', 'Memória de um Antigo Ancestral', 'guardiao'),
        f('Jardim Destruído', 'Árvore Ancestral Partida', 'guardiao'),
        f('Câmara Selada', 'Ancestral Possuído pela Tinta'),
        f('Torre Quebrada', 'Guardiã Ancestral'),
        f('Câmara do Último Selo', 'Selo Ancestral Vivo', 'guardiao'),
        f('Altar dos Ancestrais', 'Sombra de um Antigo Ancestral'),
        f('Trono Vazio', 'Antigo Ancestral Caído'),
      ],
    },
    // ---------------------------------------------------------- MAPA 69
    {
      nome: 'Grande Ninho da Tinta', icone: '🕳️', cor: '#2a0a2a', ...ALTO_RANK,
      cena: { ceu: ['#0a020a', '#5a0a4a'], astro: null, estrelas: false, montanhas: ['#6a1a5a', '#400e36', '#1c0618'], estruturas: 'ruinas', nevoa: 'rgba(220,60,190,0.2)' },
      descricao:
        'O maior Ninho da Tinta já visto, do tamanho de um mundo. Dele nascem Senhores Reais.',
      sistema: null,
      fases: [
        f('Membrana Externa', 'Sentinela do Grande Ninho'),
        f('Corredores Vivos', 'Verme Gigante do Grande Ninho', 'fera'),
        f('Câmara das Crias Reais', 'Cria Real da Tinta', 'fera'),
        f('Raízes do Mundo', 'Raiz do Grande Ninho', 'guardiao'),
        f('Lago Matriz', 'Larva Matriz da Tinta', 'fera'),
        f('Veias Mestras', 'Espírito Mestre do Ninho', 'guardiao'),
        f('Câmara dos Guerreiros', 'Guerreiro Real Recém-Nascido'),
        f('Galeria das Feras', 'Fera Colossal do Ninho', 'fera'),
        f('Núcleo Secundário', 'Núcleo Secundário do Ninho', 'guardiao'),
        f('Câmara Real do Grande Ninho', 'Senhor Real Recém-Nascido'),
        f('Guarda do Coração', 'Guardião do Coração do Ninho', 'guardiao'),
        f('Coração do Grande Ninho', 'Grande Ninho da Tinta', 'guardiao'),
      ],
    },
    // ---------------------------------------------------------- MAPA 70
    {
      nome: 'Abismo da Tinta Primordial', icone: '🌊', cor: '#05050a', ...ALTO_RANK,
      cena: { ceu: ['#010102', '#10101e'], astro: '#3a3a6a', astroX: 140, estrelas: false, montanhas: ['#1a1a2c', '#10101a', '#06060a'], estruturas: 'portal', nevoa: 'rgba(50,50,100,0.3)' },
      descricao:
        'Um abismo onde a Tinta é tão densa que apaga a luz. Diz-se que no fundo dorme a origem de tudo.',
      sistema: null,
      fases: [
        f('Borda do Abismo', 'Fera da Borda do Abismo', 'fera'),
        f('Queda Negra', 'Espírito Afogado na Tinta', 'guardiao'),
        f('Paredes Vivas', 'Golem do Abismo', 'guardiao'),
        f('Mar de Tinta Primordial', 'Serpente Primordial da Tinta', 'fera'),
        f('Ilhas de Ossos', 'Restos de um Senhor Real', 'guardiao'),
        f('Correntes Negras', 'Elemental da Tinta Primordial', 'guardiao'),
        f('Câmara dos Ecos', 'Eco da Tinta Primordial', 'guardiao'),
        f('Ninhos Antigos', 'Ninho Ancestral da Tinta', 'guardiao'),
        f('Fenda Profunda', 'Fera Primordial da Tinta', 'fera'),
        f('Templo Afundado', 'Sumo Sacerdote da Tinta Primordial'),
        f('Guarda do Fundo', 'Senhor Real do Abismo'),
        f('Fundo do Abismo', 'Fragmento da Tinta Primordial', 'guardiao'),
      ],
    },
    // ---------------------------------------------------------- MAPA 71
    {
      nome: 'Grande Restrição do Céu Inicial', icone: '🔒', cor: '#1a1a2a', ...ALTO_RANK,
      cena: { ceu: ['#04040a', '#2a2a5a'], astro: '#ffffff', astroX: 160, estrelas: true, montanhas: ['#3a3a6a', '#222244', '#0e0e20'], estruturas: 'portal', nevoa: 'rgba(200,200,255,0.18)' },
      descricao:
        'Uma prisão antiga, feita pelos primeiros cultivadores, que segura a origem da Tinta. Ela está rachando.',
      sistema: null,
      fases: [
        f('Portão da Restrição', 'Guardião da Grande Restrição', 'guardiao'),
        f('Primeira Camada', 'Selo Vivo da Primeira Camada', 'guardiao'),
        f('Rachaduras', 'Tinta Vazando da Restrição', 'guardiao'),
        f('Segunda Camada', 'Eco do Criador da Restrição', 'guardiao'),
        f('Pilares do Selo', 'Pilar Corrompido do Selo', 'guardiao'),
        f('Terceira Camada', 'Senhor Real Aprisionado'),
        f('Câmara dos Ancestrais Guardiões', 'Antigo Ancestral Guardião'),
        f('Quarta Camada', 'Fera Selada da Tinta', 'fera'),
        f('Correntes do Selo', 'Correntes Vivas da Tinta', 'fera'),
        f('Quinta Camada', 'Vontade da Grande Restrição', 'guardiao'),
        f('Núcleo da Restrição', 'Grande Senhor Real da Tinta'),
        f('Coração da Restrição', 'Sombra da Tinta Primordial', 'guardiao'),
      ],
    },
    // ---------------------------------------------------------- MAPA 72
    {
      nome: 'Origem da Tinta', icone: '⚫', cor: '#000000', ...ALTO_RANK,
      cena: { ceu: ['#000000', '#140a1e'], astro: '#ffffff', astroX: 160, estrelas: true, montanhas: ['#1a1024', '#100a16', '#05030a'], estruturas: 'portal', nevoa: 'rgba(120,60,180,0.25)' },
      descricao:
        'O centro de tudo: a própria Tinta, viva e consciente desde antes dos mundos. Vencê-la é o ápice do caminho — por enquanto.',
      sistema: null,
      fases: [
        f('Mar Sem Luz', 'Onda Viva da Tinta', 'guardiao'),
        f('Ecos do Início', 'Eco do Primeiro Mundo', 'guardiao'),
        f('Fantasma do Primeiro Ninho', 'Primeiro Ninho da Tinta', 'guardiao'),
        f('Exército Eterno', 'Soldado Eterno da Tinta'),
        f('Feras do Começo', 'Fera do Começo do Mundo', 'fera'),
        f('Senhores Antigos', 'Senhor Real Ancestral'),
        f('Ilusão do Coração', 'Ilusão de um Ente Querido'),
        f('Rio do Esquecimento', 'Serpente do Esquecimento', 'fera'),
        f('Trono dos Senhores', 'Rei dos Senhores Reais'),
        f('Coração Pulsante da Tinta', 'Coração da Tinta', 'guardiao'),
        f('Véu da Origem', 'Vontade da Tinta Primordial', 'guardiao'),
        f('Origem da Tinta', 'A Tinta Primordial', 'guardiao'),
      ],
    },
  ],

  // Mostrado ao vencer a última fase do mundo
  final: {
    titulo: 'A Tinta Primordial recua.',
    texto:
      'Pela primeira vez desde antes dos mundos, a origem da Tinta recua. Os Três Mil Mundos respiram — e o seu ' +
      'nome é dito em todas as fortalezas-passo.\n\n' +
      '"Na 9ª Ordem, o caminho parece acabar. É só porque ninguém ainda viu o que vem depois."\n\n' +
      '✨ MUNDO 7 LIBERADO: O Forno do Universo!\nRompa a 9ª Ordem e alcance o Reino da Criação.',
  },
};
