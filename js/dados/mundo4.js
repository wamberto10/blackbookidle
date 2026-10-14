// =============================================================
// dados/mundo4.js — MUNDO 4: ESTRELA SOMBRIA — LIMITE ESTELAR (12 mapas × 12 fases)
//
// Mesmo formato dos outros mundos. No jogo, estes são os Mapas 37 a 48
// (fundos img/fundos/mapa37.jpg … mapa48.jpg). Libera ao vencer o chefe do
// Mapa 36 (Wu Heng, fim do Campo Estelar Heng Luo).
// Lore: arco do Limite Estelar de Martial Peak — a Estrela Sombria e a fundação do Palácio Ling Xiao,
// as grandes forças dos Grandes Imperadores, o Clã do Dragão e o Clã da Fênix, o Jardim do Imperador,
// o Reino Demoníaco, os Espíritos Sagrados, a Terra do Vazio e as primeiras sombras da Tinta Negra.
//
//   reino → índice em REINOS (15 = Meio-Passo do Céu Aberto, 16 = Reino do Céu Aberto)
//   Os Mapas 43–48 são a faixa "Baixo Rank" do Céu Aberto (1ª–3ª Ordem): fimNoReino: 2.
//   A 4ª Ordem só abre com o chefe do Mapa 48 (reinos.js → mapaParaEstagio).
// =============================================================

const f = (local, inimigo, forma = 'humano') => ({ local, inimigo, forma });

// Mapas do Céu Aberto deste mundo: 1ª a 3ª Ordem
const BAIXO_RANK = { reino: 16, inicioNoReino: 0, fimNoReino: 2 };

export const MUNDO_LIMITE_ESTELAR = {
  id: 'estrela_sombria',
  nome: 'Estrela Sombria — Limite Estelar',
  lema: '"No Limite Estelar, até um Grande Imperador olha para cima."',
  descricao:
    'Além dos Campos Estelares fica o Limite Estelar: a terra dos Grandes Imperadores, do Clã do Dragão, ' +
    'do Clã da Fênix e dos Espíritos Sagrados. Numa estrela esquecida, a Estrela Sombria, nasce o Palácio Ling Xiao.',
  imagemFundo: null,

  mapas: [
    // ---------------------------------------------------------- MAPA 37
    {
      nome: 'Estrela Sombria', icone: '🌑', cor: '#1a1424', reino: 15,
      cena: { ceu: ['#05030a', '#2a1a3a'], astro: '#8a7aaa', astroX: 80, estrelas: true, montanhas: ['#3a2a4a', '#22182e', '#100a18'], estruturas: 'ruinas', nevoa: 'rgba(140,110,200,0.16)' },
      descricao:
        'Uma estrela escura e esquecida no Limite Estelar, sem dono e quase sem luz. Feras das sombras e fugitivos ' +
        'de todas as estrelas vivem aqui — é nela que Yang Kai decide fincar raízes.',
      sistema: null,
      fases: [
        f('Planície Sem Luz', 'Lobo da Noite Eterna', 'fera'),
        f('Cânion Escuro', 'Morcego da Estrela Sombria', 'fera'),
        f('Acampamento de Fugitivos', 'Fugitivo do Limite Estelar'),
        f('Ruínas de uma Seita', 'Fantasma da Seita Caída', 'guardiao'),
        f('Floresta de Cristal Negro', 'Golem de Cristal Negro', 'guardiao'),
        f('Pântano Sombrio', 'Serpente da Noite Eterna', 'fera'),
        f('Covil dos Saqueadores', 'Chefe dos Fugitivos'),
        f('Fenda Sombria', 'Pantera das Sombras Ancestral', 'fera'),
        f('Vale dos Ecos', 'Eco de um Imperador Esquecido', 'guardiao'),
        f('Mina de Pedra Sombria', 'Capataz da Mina Sombria'),
        f('Pico Escuro', 'Urso Colossal das Sombras', 'fera'),
        f('Coração da Estrela', 'Senhor da Estrela Sombria', 'maligno'),
      ],
    },
    // ---------------------------------------------------------- MAPA 38
    {
      nome: 'Palácio Ling Xiao', icone: '🏯', cor: '#2a1a14', reino: 15,
      cena: { ceu: ['#0a0612', '#4a2a3a'], astro: '#ffd36b', astroX: 230, estrelas: true, montanhas: ['#5a3a3a', '#3a2228', '#1a1014'], estruturas: 'palacio', nevoa: 'rgba(255,210,120,0.14)' },
      descricao:
        'Na Estrela Sombria, Yang Kai ergue o Palácio Ling Xiao, herdeiro do antigo High Heaven Pavilion. ' +
        'Um palácio novo atrai olhares — e inimigos de outras estrelas vêm testar suas muralhas.',
      sistema: null,
      fases: [
        f('Canteiro de Obras', 'Espião de Seita Rival'),
        f('Muralha em Construção', 'Javali de Ferro Estelar', 'fera'),
        f('Portão Principal', 'Mercenário de Aluguel'),
        f('Pátio dos Discípulos', 'Desafiante Arrogante'),
        f('Jardim de Ervas Espirituais', 'Ladrão de Ervas Espirituais'),
        f('Salão das Formações', 'Golem de Formação Sabotado', 'guardiao'),
        f('Torre de Vigia', 'Batedor de Seita Rival'),
        f('Salão das Escrituras', 'Ancião Traidor de Ling Xiao'),
        f('Biblioteca Proibida', 'Espírito do Pergaminho Antigo', 'guardiao'),
        f('Ponte Celestial', 'Comandante Invasor'),
        f('Salão Principal', 'Guarda-Costas do Patriarca Rival'),
        f('Trono do Palácio', 'Patriarca da Seita Rival'),
      ],
    },
    // ---------------------------------------------------------- MAPA 39
    {
      nome: 'Céus do Limite Estelar', icone: '🏙️', cor: '#1a2a3a', reino: 15,
      cena: { ceu: ['#08101a', '#2a4a6a'], astro: '#c0e0ff', astroX: 200, estrelas: true, montanhas: ['#3a5a7a', '#22384a', '#101c26'], estruturas: 'cidade', nevoa: 'rgba(160,200,255,0.15)' },
      descricao:
        'Cidades flutuantes, rotas de comércio entre estrelas e as terras das grandes forças. ' +
        'Aqui, um Meio-Passo do Céu Aberto é só mais um no meio da multidão.',
      sistema: null,
      fases: [
        f('Rota Comercial Estelar', 'Escolta Arrogante'),
        f('Cidade Flutuante', 'Duelista da Cidade Flutuante'),
        f('Leilão Estelar', 'Comprador Ganancioso'),
        f('Arena Imperial', 'Campeão da Arena Imperial'),
        f('Mar de Nuvens', 'Águia de Nuvem Estelar', 'fera'),
        f('Estrada dos Imperadores', 'Guarda da Estrada Imperial'),
        f('Seita das Mil Formações', 'Mestre das Mil Formações'),
        f('Torre do Desafio', 'Prodígio de uma Grande Força'),
        f('Templo Estelar', 'Guardião do Templo Estelar', 'guardiao'),
        f('Domínio Imperial', 'General de um Grande Imperador'),
        f('Palácio Suspenso', 'Herdeiro de um Grande Imperador'),
        f('Trono Celeste', 'Discípulo Direto de um Grande Imperador'),
      ],
    },
    // ---------------------------------------------------------- MAPA 40
    {
      nome: 'Ilha do Dragão', icone: '🐉', cor: '#1a2a1a', reino: 15,
      cena: { ceu: ['#06100a', '#2a5a3a'], astro: '#ffe08a', astroX: 120, estrelas: false, montanhas: ['#3a6a4a', '#22402c', '#0e1c12'], estruturas: 'pagodas', nevoa: 'rgba(180,255,180,0.13)' },
      descricao:
        'O lar do Clã do Dragão no Limite Estelar. O sangue de dragão nas veias de Yang Kai chama — ' +
        'e os dragões respondem com provas que poucos humanos já enfrentaram.',
      sistema: null,
      fases: [
        f('Costa Escamosa', 'Lagarto Dracônico', 'fera'),
        f('Recifes de Coral', 'Serpente Marinha Dracônica', 'fera'),
        f('Floresta das Escamas', 'Dragão-Lagarto Menor', 'fera'),
        f('Ninho dos Filhotes', 'Filhote de Dragão Guardião', 'fera'),
        f('Cavernas de Lava', 'Salamandra Dracônica', 'fera'),
        f('Penhasco do Vento', 'Dragão do Vento', 'fera'),
        f('Templo do Sangue', 'Guardião do Sangue Dracônico', 'guardiao'),
        f('Lago Dourado', 'Dragão Dourado Jovem', 'fera'),
        f('Cemitério dos Dragões', 'Alma de Dragão Antigo', 'guardiao'),
        f('Montanha do Trovão', 'Dragão do Trovão', 'fera'),
        f('Caverna do Ancião', 'Ancião do Clã do Dragão'),
        f('Altar do Dragão', 'Dragão Ancestral do Limite Estelar', 'fera'),
      ],
    },
    // ---------------------------------------------------------- MAPA 41
    {
      nome: 'Ninho da Fênix', icone: '🔥', cor: '#3a1a0a', reino: 15,
      cena: { ceu: ['#140604', '#8a2a0a'], astro: '#ffb03a', astroX: 180, estrelas: false, montanhas: ['#8a3a1a', '#4a1e0e', '#200c06'], estruturas: 'pagodas', nevoa: 'rgba(255,140,60,0.18)' },
      descricao:
        'Montanhas de fogo eterno onde vive o Clã da Fênix. Só quem suporta o Fogo Verdadeiro da Fênix ' +
        'chega ao topo — e o Ninho Sagrado não perdoa os fracos.',
      sistema: null,
      fases: [
        f('Encosta Ardente', 'Pássaro de Fogo', 'fera'),
        f('Rio de Lava', 'Serpente de Magma', 'fera'),
        f('Floresta de Cinzas', 'Espírito das Cinzas', 'guardiao'),
        f('Ninho Menor', 'Filhote de Fênix', 'fera'),
        f('Campos de Brasa', 'Leão de Fogo', 'fera'),
        f('Templo Carmesim', 'Sacerdotisa da Fênix'),
        f('Pico das Chamas', 'Golem de Magma', 'guardiao'),
        f('Árvore Wutong', 'Fênix Guardiã', 'fera'),
        f('Lago de Fogo Verdadeiro', 'Espírito do Fogo Verdadeiro', 'guardiao'),
        f('Muralha de Chamas', 'Guarda do Clã da Fênix'),
        f('Palácio da Fênix', 'Ancião do Clã da Fênix'),
        f('Ninho Sagrado', 'Fênix Imortal', 'fera'),
      ],
    },
    // ---------------------------------------------------------- MAPA 42
    {
      nome: 'Jardim do Imperador', icone: '🏛️', cor: '#2a2a1a', reino: 15,
      cena: { ceu: ['#0a0a06', '#5a5a2a'], astro: '#ffe9a0', astroX: 160, estrelas: true, montanhas: ['#6a6a3a', '#3e3e22', '#1c1c0e'], estruturas: 'palacio', nevoa: 'rgba(255,240,170,0.16)' },
      descricao:
        'Um pequeno mundo deixado pelos Grandes Imperadores antigos, aberto só de tempos em tempos. ' +
        'Lá dentro estão as provas deles — e, no fim, o caminho para abrir o próprio céu.',
      sistema: null,
      fases: [
        f('Portão do Jardim', 'Guardião do Portão do Jardim', 'guardiao'),
        f('Bosque Imperial', 'Tigre do Bosque Imperial', 'fera'),
        f('Lago dos Lótus', 'Lótus Devorador', 'fera'),
        f('Ponte das Provas', 'Concorrente do Jardim'),
        f('Labirinto de Pedra', 'Golem do Labirinto Imperial', 'guardiao'),
        f('Pomar de Frutos Divinos', 'Macaco Guardião dos Frutos', 'fera'),
        f('Ruínas de um Palácio', 'Fantasma de um Imperador Antigo', 'guardiao'),
        f('Campo de Batalha Antigo', 'Marionete de Guerra Imperial', 'guardiao'),
        f('Biblioteca dos Imperadores', 'Guardião das Escrituras Imperiais'),
        f('Câmara dos Cinco Elementos', 'Espírito dos Cinco Elementos', 'guardiao'),
        f('Altar do Selo do Dao', 'Vontade de um Imperador Antigo', 'guardiao'),
        f('Portão do Céu Aberto', 'Guardião do Céu Aberto'),
      ],
    },
    // ---------------------------------------------------------- MAPA 43
    {
      nome: 'Reino Demoníaco', icone: '😈', cor: '#3a0a0a', ...BAIXO_RANK,
      cena: { ceu: ['#100204', '#6a0a1a'], astro: '#ff3a3a', astroX: 90, estrelas: false, montanhas: ['#5a1a1a', '#320e10', '#180608'], estruturas: 'ruinas', nevoa: 'rgba(255,60,60,0.16)' },
      descricao:
        'Do outro lado de uma fenda no Limite Estelar fica o Reino Demoníaco, onde mandam os Santos Demoníacos. ' +
        'O céu é vermelho, e a força é a única lei.',
      sistema: null,
      fases: [
        f('Fenda Demoníaca', 'Diabrete da Fenda', 'maligno'),
        f('Planícies de Sangue', 'Lobo Demoníaco', 'fera'),
        f('Vila dos Demônios', 'Soldado do Reino Demoníaco'),
        f('Rio Escarlate', 'Serpente de Sangue', 'fera'),
        f('Fortaleza de Ossos', 'Cavaleiro Demoníaco'),
        f('Floresta Retorcida', 'Árvore Demoníaca', 'guardiao'),
        f('Arena de Sangue', 'Gladiador do Reino Demoníaco'),
        f('Templo Demoníaco', 'Sumo Sacerdote Demoníaco', 'maligno'),
        f('Muralha Negra', 'Golem da Muralha Negra', 'guardiao'),
        f('Cidade Demoníaca', 'General do Reino Demoníaco'),
        f('Palácio Escarlate', 'Príncipe Demoníaco'),
        f('Trono Demoníaco', 'Santo Demoníaco'),
      ],
    },
    // ---------------------------------------------------------- MAPA 44
    {
      nome: 'Terra dos Espíritos Sagrados', icone: '🦄', cor: '#1a2a2a', ...BAIXO_RANK,
      cena: { ceu: ['#061010', '#2a6a5a'], astro: '#e0fff0', astroX: 150, estrelas: false, montanhas: ['#3a7a6a', '#224a40', '#0e201c'], estruturas: 'arvores', nevoa: 'rgba(200,255,230,0.15)' },
      descricao:
        'As terras dos Espíritos Sagrados, seres antigos nascidos junto com o mundo. ' +
        'Orgulhosos e poderosíssimos, eles não se curvam a ninguém — muito menos a um humano.',
      sistema: null,
      fases: [
        f('Campos Sagrados', 'Cervo Espiritual', 'fera'),
        f('Floresta Primordial', 'Tigre Branco Jovem', 'fera'),
        f('Rio Celestial', 'Tartaruga Espiritual', 'fera'),
        f('Penhasco das Nuvens', 'Grou Celestial', 'fera'),
        f('Vale Sagrado', 'Qilin Jovem', 'fera'),
        f('Montanha dos Ossos Sagrados', 'Guardião dos Ossos Sagrados', 'guardiao'),
        f('Lago do Espelho', 'Serpente Sagrada', 'fera'),
        f('Árvore do Mundo', 'Espírito da Árvore do Mundo', 'guardiao'),
        f('Ninho Vermelhão', 'Pássaro Vermelhão', 'fera'),
        f('Caverna da Tartaruga', 'Tartaruga Negra Ancestral', 'fera'),
        f('Planalto do Tigre', 'Tigre Branco Sagrado', 'fera'),
        f('Trono dos Espíritos', 'Qilin Sagrado', 'fera'),
      ],
    },
    // ---------------------------------------------------------- MAPA 45
    {
      nome: 'Terra do Vazio', icone: '🌀', cor: '#141428', ...BAIXO_RANK,
      cena: { ceu: ['#04040c', '#2a2a5a'], astro: null, estrelas: true, montanhas: ['#3a3a6a', '#22224a', '#0e0e24'], estruturas: 'portal', nevoa: 'rgba(150,150,255,0.17)' },
      descricao:
        'Um território esquecido entre o Limite Estelar e o desconhecido. Yang Kai o reivindica — ' +
        'mas o caos que vive ali não quer dono.',
      sistema: null,
      fases: [
        f('Borda do Vazio', 'Fera da Borda do Vazio', 'fera'),
        f('Ilhas Flutuantes', 'Saqueador das Ilhas Flutuantes'),
        f('Tempestade do Caos', 'Elemental do Caos', 'guardiao'),
        f('Ruínas Sem Nome', 'Espírito Sem Nome', 'guardiao'),
        f('Mar de Névoa', 'Serpente do Caos', 'fera'),
        f('Fortaleza Abandonada', 'Desertor Imperial'),
        f('Ninho do Caos', 'Aranha do Caos', 'fera'),
        f('Rio Invertido', 'Fera Primordial', 'fera'),
        f('Montanha Flutuante', 'Golem Primordial', 'guardiao'),
        f('Olho do Caos', 'Devorador do Caos', 'fera'),
        f('Portal Esquecido', 'Senhor dos Saqueadores do Vazio'),
        f('Coração do Vazio', 'Fera do Caos Primordial', 'fera'),
      ],
    },
    // ---------------------------------------------------------- MAPA 46
    {
      nome: 'Ruínas do Imperador Antigo', icone: '🗿', cor: '#2a241a', ...BAIXO_RANK,
      cena: { ceu: ['#0a0806', '#4a3e2a'], astro: '#d8c890', astroX: 210, estrelas: true, montanhas: ['#5a4e3a', '#383022', '#1a160e'], estruturas: 'ruinas', nevoa: 'rgba(230,210,150,0.14)' },
      descricao:
        'Os restos do palácio de um Grande Imperador da era antiga. As formações ainda funcionam — ' +
        'e os guardiões ainda obedecem a um senhor que morreu há eras.',
      sistema: null,
      fases: [
        f('Escadaria Partida', 'Marionete de Pedra Antiga', 'guardiao'),
        f('Salão Caído', 'Soldado Espectral Antigo', 'guardiao'),
        f('Jardim Seco', 'Planta Devoradora Antiga', 'fera'),
        f('Galeria de Estátuas', 'Estátua Viva', 'guardiao'),
        f('Arsenal Antigo', 'Espírito de Arma Imperial', 'guardiao'),
        f('Prisão Antiga', 'Prisioneiro Milenar', 'maligno'),
        f('Câmara de Formações', 'Núcleo de Formação Antigo', 'guardiao'),
        f('Tesouro Selado', 'Fera Guardiã do Tesouro Selado', 'fera'),
        f('Salão dos Ministros', 'Ministro Espectral'),
        f('Sala do Trono Partido', 'General Espectral'),
        f('Câmara Secreta', 'Vontade Remanescente do Imperador', 'guardiao'),
        f('Túmulo do Imperador', 'Cadáver do Imperador Antigo', 'fera'),
      ],
    },
    // ---------------------------------------------------------- MAPA 47
    {
      nome: 'Sombra da Tinta Negra', icone: '🖤', cor: '#0a0a0a', ...BAIXO_RANK,
      cena: { ceu: ['#020202', '#1a1a22'], astro: '#4a4a5a', astroX: 140, estrelas: true, montanhas: ['#24242c', '#16161c', '#08080a'], estruturas: 'ruinas', nevoa: 'rgba(40,40,60,0.3)' },
      descricao:
        'Pela primeira vez, algo estranho aparece no Limite Estelar: a Tinta Negra, que corrompe tudo o que toca ' +
        'e transforma cultivadores em Discípulos da Tinta. Ninguém sabe de onde ela vem.',
      sistema: null,
      fases: [
        f('Estrela Contaminada', 'Fera Manchada de Tinta', 'fera'),
        f('Vila Silenciosa', 'Aldeão Corrompido pela Tinta'),
        f('Seita Caída', 'Discípulo da Tinta'),
        f('Floresta Negra', 'Árvore de Tinta', 'guardiao'),
        f('Rio de Tinta', 'Serpente de Tinta', 'fera'),
        f('Templo Corrompido', 'Sacerdote da Tinta'),
        f('Cidade Engolida', 'Soldado da Tinta Negra'),
        f('Fenda de Tinta', 'Fera Negra da Tinta', 'fera'),
        f('Ninho da Tinta', 'Larva de Tinta', 'fera'),
        f('Altar Negro', 'Ancião Corrompido pela Tinta'),
        f('Coração da Corrupção', 'Capitão da Tinta Negra'),
        f('Fonte da Tinta', 'Senhor de Território da Tinta'),
      ],
    },
    // ---------------------------------------------------------- MAPA 48
    {
      nome: 'Portão dos Três Mil Mundos', icone: '🌠', cor: '#1a1a2a', ...BAIXO_RANK,
      cena: { ceu: ['#06060e', '#3a3a7a'], astro: '#ffffff', astroX: 160, estrelas: true, montanhas: ['#4a4a8a', '#2a2a5a', '#12122a'], estruturas: 'portal', nevoa: 'rgba(220,220,255,0.18)' },
      descricao:
        'O fim do Limite Estelar. Além do Portão ficam os Mundos Superiores — os Três Mil Mundos — ' +
        'e uma guerra que vai decidir o destino de todos eles.',
      sistema: null,
      fases: [
        f('Fronteira Final', 'Sentinela da Fronteira Final'),
        f('Ponte de Luz', 'Guardião da Ponte de Luz', 'guardiao'),
        f('Mar Estelar', 'Baleia do Mar Estelar', 'fera'),
        f('Acampamento de Guerra', 'Soldado Veterano da Fronteira'),
        f('Ruínas de Batalha', 'Eco de um Guerreiro Caído', 'guardiao'),
        f('Posto Avançado', 'Batedor da Tinta Negra'),
        f('Muralha do Limite', 'Comandante da Muralha do Limite'),
        f('Fenda dos Mundos', 'Fera Entre Mundos', 'fera'),
        f('Torre do Portão', 'Discípulo da Tinta de Elite'),
        f('Câmara do Portão', 'Guardião dos Mil Mundos', 'guardiao'),
        f('Antessala dos Mundos', 'Comandante da Tinta Negra'),
        f('Portão dos Três Mil Mundos', 'Guardião do Portão dos Três Mil Mundos'),
      ],
    },
  ],

  // Mostrado ao vencer a última fase do mundo
  final: {
    titulo: 'O Portão dos Três Mil Mundos se abre.',
    texto:
      'O guardião cai, e pela fenda do Portão aparece um céu que nenhum mapa do Limite Estelar mostra: ' +
      'os Três Mil Mundos, onde vivem os cultivadores do Céu Aberto.\n\n' +
      '"Abrir o céu é só o começo. Do outro lado, a Tinta Negra já está em guerra com todos."\n\n' +
      '✨ MUNDO 5 — EM BREVE\n(os Mundos Superiores estão em desenvolvimento)',
  },
};
