// =============================================================
// dados/mundo2.js — MUNDO 2: REINO TONG XUAN (12 mapas × 12 fases)
//
// Mesmo formato do Mundo 1 (dados/mundo1.js). No jogo, estes são os
// Mapas 13 a 24 (fundos img/fundos/mapa13.jpg … mapa24.jpg).
// Libera ao vencer o chefe do Mapa 12 (fim do Mundo Inicial).
// Lore: arco do Continente Tong Xuan de Martial Peak.
//
//   reino → índice em REINOS (7 = Santo, 8 = Rei Santo, 9 = Retorno à Origem,
//           10 = Rei da Origem, 11 = Origem do Dao, 12 = Imperador)
// =============================================================

const f = (local, inimigo, forma = 'humano') => ({ local, inimigo, forma });

export const MUNDO_TONG_XUAN = {
  id: 'tong_xuan',
  nome: 'Reino Tong Xuan',
  lema: '"O mundo que eu conhecia era apenas um pequeno fragmento."',
  descricao:
    'Um continente imenso, com Energia Mundial muito mais densa que a do Mundo Inicial. ' +
    'Terras Santas, grandes clãs, Demônios Antigos, a Raça Monstro e ameaças vindas do espaço. ' +
    'Aqui, um Santo é apenas o começo do caminho.',
  imagemFundo: null,

  mapas: [
    // ---------------------------------------------------------- MAPA 13
    {
      nome: 'Fronteira de Tong Xuan', icone: '🌀', cor: '#3a4a2a', reino: 7,
      cena: { ceu: ['#4a7ac0', '#f0c890'], astro: '#fff3c4', astroX: 230, montanhas: ['#8a9ab8', '#4a6a4a', '#24362a'], estruturas: 'portal', nevoa: 'rgba(255,255,255,0.2)' },
      descricao:
        'A chegada pelo portal. Estradas perigosas, cultivadores independentes e feras de um mundo ' +
        'onde a Energia Mundial é muito mais densa do que você jamais sentiu.',
      sistema: null,
      fases: [
        f('Saída do Portal', 'Cultivador Independente'),
        f('Estrada Poeirenta', 'Saqueador de Tong Xuan'),
        f('Floresta Antiga', 'Lobo Sombrio', 'fera'),
        f('Vila Fronteiriça', 'Mercenário Ganancioso'),
        f('Riacho de Jade', 'Serpente de Jade', 'fera'),
        f('Colinas Ventosas', 'Águia Tempestuosa', 'fera'),
        f('Mercado Negro', 'Assassino de Aluguel'),
        f('Desfiladeiro de Ferro', 'Urso de Ferro Negro', 'fera'),
        f('Ruínas da Estrada', 'Espírito Errante', 'guardiao'),
        f('Posto da Patrulha', 'Capitão da Patrulha'),
        f('Torre de Vigia', 'Mestre Independente'),
        f('Ponte do Abismo', 'Homem do Caixão'),
      ],
    },
    // ---------------------------------------------------------- MAPA 14
    {
      nome: 'Mundo Selado do Caixão', icone: '⚰️', cor: '#3a1a1a', reino: 7,
      cena: { ceu: ['#1a0a0a', '#6a1a1a'], astro: null, montanhas: ['#4a3a3a', '#2a1a1a', '#140a0a'], estruturas: 'ruinas', nevoa: 'rgba(120,20,20,0.2)' },
      descricao:
        'O pequeno mundo dentro do caixão, onde Demônios Antigos estão presos há eras, ' +
        'divididos em três facções que lutam entre si pelo domínio da prisão.',
      sistema: null,
      fases: [
        f('Porta do Caixão', 'Servo Demoníaco'),
        f('Planície Cinzenta', 'Fera Demoníaca Presa', 'fera'),
        f('Rio de Ácido', 'Serpente Corrosiva', 'fera'),
        f('Acampamento da 1ª Facção', 'Guerreiro Demônio Antigo'),
        f('Torres de Osso', 'Morcego do Caixão', 'fera'),
        f('Mercado das Facções', 'Mercador Demônio'),
        f('Acampamento da 2ª Facção', 'Caçador Demônio Antigo'),
        f('Altar de Sangue', 'Sacerdote da Linhagem', 'maligno'),
        f('Fortaleza Rebelde', 'Rebelde de Li Rong'),
        f('Muralha do Selo', 'Guardião do Selo', 'guardiao'),
        f('Trono das Facções', 'General Demônio Antigo'),
        f('Coração do Caixão', 'Líder dos Rebeldes Demoníacos', 'maligno'),
      ],
    },
    // ---------------------------------------------------------- MAPA 15
    {
      nome: 'Associação dos Mestres de Pílulas', icone: '⚗️', cor: '#4a3a1a', reino: 8,
      cena: { ceu: ['#6a9ad0', '#f8e0b0'], astro: '#fff3c4', astroX: 80, montanhas: ['#a0a8c0', '#6a6a5a', '#3a3a2a'], estruturas: 'cidade', nevoa: 'rgba(255,220,160,0.2)' },
      descricao:
        'A grande cidade dos alquimistas. Rivais invejosos, fornalhas vivas e jardins de ervas raras — ' +
        'cada pílula aqui vale mais que uma seita inteira do Mundo Inicial.',
      sistema: null,
      fases: [
        f('Portões da Cidade', 'Guarda da Associação'),
        f('Rua das Fornalhas', 'Aprendiz Arrogante'),
        f('Jardim de Ervas', 'Planta Devoradora de Qi', 'fera'),
        f('Leilão de Pílulas', 'Comprador Violento'),
        f('Salão de Testes', 'Fornalha Viva', 'guardiao'),
        f('Estufa Espiritual', 'Fera das Ervas Raras', 'fera'),
        f('Biblioteca de Receitas', 'Alquimista Rival'),
        f('Câmara de Fogo', 'Espírito da Chama', 'guardiao'),
        f('Torre dos Mestres', 'Mestre de Pílulas Invejoso'),
        f('Salão dos Anciões', 'Guarda de Elite da Associação'),
        f('Fornalha Celestial', 'Golem de Fornalha Celestial', 'guardiao'),
        f('Pico da Associação', 'Grão-Mestre Alquimista Rival'),
      ],
    },
    // ---------------------------------------------------------- MAPA 16
    {
      nome: 'Seita do Céu Firmamento', icone: '🦋', cor: '#2a3a5a', reino: 8,
      cena: { ceu: ['#2a3a6a', '#8a9ad0'], astro: '#ffffff', astroX: 250, montanhas: ['#6a7aa0', '#3a4a6a', '#1a2440'], estruturas: 'pagodas', nevoa: 'rgba(200,180,255,0.2)' },
      descricao:
        'A seita fundada por quem um dia criou o High Heaven Pavilion. ' +
        'Em suas cavernas profundas vivem os temidos Insetos Devoradores de Alma.',
      sistema: null,
      fases: [
        f('Portão da Seita', 'Discípulo do Firmamento'),
        f('Ponte das Nuvens', 'Discípulo Interno do Firmamento'),
        f('Entrada da Caverna', 'Inseto Devorador de Alma', 'fera'),
        f('Túneis Úmidos', 'Enxame de Insetos', 'fera'),
        f('Lago Subterrâneo', 'Sapo das Cavernas', 'fera'),
        f('Ninho Pulsante', 'Inseto Soldado', 'fera'),
        f('Câmara de Ecos', 'Morcego das Profundezas', 'fera'),
        f('Galeria dos Ossos', 'Aranha da Caverna', 'fera'),
        f('Pátio da Seita Rival', 'Ancião da Seita Rival'),
        f('Salão do Conselho', 'Executor do Firmamento'),
        f('Ninho da Rainha', 'Rainha dos Insetos', 'fera'),
        f('Trono da Seita Rival', 'Líder da Seita Rival'),
      ],
    },
    // ---------------------------------------------------------- MAPA 17
    {
      nome: 'Vazio Estelar', icone: '🌠', cor: '#1a1440', reino: 9,
      cena: { ceu: ['#05030f', '#3a1a6a'], astro: null, estrelas: true, montanhas: ['#3a2a5a', '#241a3a', '#120c20'], estruturas: 'ruinas' },
      descricao:
        'O espaço exterior além do céu de Tong Xuan: meteoros, tempestades do vazio ' +
        'e, numa rocha flutuante distante, a Flor Demoníaca de Mil Anos.',
      sistema: null,
      fases: [
        f('Borda do Céu', 'Fragmento de Meteoro', 'guardiao'),
        f('Cinturão de Asteroides', 'Golem de Meteoro', 'guardiao'),
        f('Corrente do Vazio', 'Fera Estelar', 'fera'),
        f('Nebulosa Roxa', 'Espírito Estelar', 'guardiao'),
        f('Destroços Antigos', 'Marionete Abandonada', 'guardiao'),
        f('Tempestade do Vazio', 'Fera Estelar Furiosa', 'fera'),
        f('Lua Morta', 'Escorpião de Cristal Lunar', 'fera'),
        f('Rio de Estrelas', 'Dragão Estelar Jovem', 'fera'),
        f('Jardim Flutuante', 'Planta do Vazio', 'fera'),
        f('Fenda Espacial', 'Devorador do Vazio', 'fera'),
        f('Órbita da Flor', 'Guardião da Flor', 'guardiao'),
        f('Flor Demoníaca de Mil Anos', 'Fera Ancestral do Vazio', 'fera'),
      ],
    },
    // ---------------------------------------------------------- MAPA 18
    {
      nome: 'Seita do Gelo', icone: '❄️', cor: '#2a4a5a', reino: 9,
      cena: { ceu: ['#8ab0d0', '#e8f0f8'], astro: '#ffffff', astroX: 60, montanhas: ['#c0d0e0', '#8aa0b8', '#4a6070'], estruturas: 'palacio', nevoa: 'rgba(255,255,255,0.35)' },
      descricao:
        'Montanhas eternamente nevadas e palácios de gelo. Foi aqui que Su Yan cultivou — ' +
        'e é aqui que a Raça dos Ossos dorme selada no fundo da geleira.',
      sistema: null,
      fases: [
        f('Trilha Congelada', 'Lobo da Neve', 'fera'),
        f('Portão de Gelo', 'Discípula da Seita do Gelo'),
        f('Lago Congelado', 'Serpente de Gelo', 'fera'),
        f('Pátio Nevado', 'Guardiã de Gelo'),
        f('Caverna de Cristais', 'Golem de Gelo', 'guardiao'),
        f('Penhasco Branco', 'Águia da Nevasca', 'fera'),
        f('Salão das Nevascas', 'Anciã do Gelo'),
        f('Geleira Antiga', 'Urso Polar Ancestral', 'fera'),
        f('Fenda Selada', 'Soldado de Osso Despertado'),
        f('Prisão de Gelo', 'Espírito Congelado', 'guardiao'),
        f('Selo Rachado', 'Batedor da Raça dos Ossos'),
        f('Coração da Geleira', 'Cadáver Ancestral da Raça dos Ossos'),
      ],
    },
    // ---------------------------------------------------------- MAPA 19
    {
      nome: 'Ruínas dos Hegemons', icone: '🪷', cor: '#2a3a24', reino: 10,
      cena: { ceu: ['#4a6a4a', '#d0c890'], astro: '#fff3c4', astroX: 200, montanhas: ['#7a8a6a', '#4a5a3a', '#24301e'], estruturas: 'ruinas', nevoa: 'rgba(220,220,160,0.2)' },
      descricao:
        'Ruínas antigas dominadas por senhores locais, cheias de armadilhas e marionetes — ' +
        'e escondendo a lendária Lótus da Alma de Seis Cores.',
      sistema: null,
      fases: [
        f('Entrada das Ruínas', 'Sentinela dos Hegemons'),
        f('Corredor de Pilares', 'Marionete de Pedra', 'guardiao'),
        f('Jardim Arruinado', 'Árvore Corrompida', 'guardiao'),
        f('Salão das Armadilhas', 'Assassino das Ruínas'),
        f('Câmara Inundada', 'Crocodilo das Ruínas', 'fera'),
        f('Biblioteca Caída', 'Espírito Antigo', 'guardiao'),
        f('Ponte Quebrada', 'Guerreiro Hegemônico'),
        f('Arsenal Selado', 'Guardião de Bronze', 'guardiao'),
        f('Câmara das Formações', 'Cristal de Formação', 'guardiao'),
        f('Lago da Lótus', 'Fera Guardiã da Lótus', 'fera'),
        f('Altar das Seis Cores', 'Senhor Hegemônico'),
        f('Lótus da Alma de Seis Cores', 'Guardião Ancestral das Ruínas', 'guardiao'),
      ],
    },
    // ---------------------------------------------------------- MAPA 20
    {
      nome: 'Clã Sun e a Árvore Divina', icone: '🌳', cor: '#5a3a10', reino: 10,
      cena: { ceu: ['#c05a1a', '#ffd080'], astro: '#fff0a0', astroX: 160, montanhas: ['#c08a4a', '#8a4a1a', '#4a200a'], estruturas: 'palacio', nevoa: 'rgba(255,180,80,0.2)' },
      descricao:
        'O rico Clã Sun cultiva uma Árvore Divina de natureza Yang alimentada com sacrifícios. ' +
        'Terras ardentes, telhados dourados e um calor que queima até o Qi.',
      sistema: null,
      fases: [
        f('Campos Dourados', 'Guarda do Clã Sun'),
        f('Vila do Clã', 'Jovem Mestre Sun'),
        f('Bosque Ardente', 'Fera Solar', 'fera'),
        f('Muralha do Sol', 'Capitão do Clã Sun'),
        f('Templo da Chama', 'Sacerdote Solar', 'maligno'),
        f('Lago de Magma', 'Serpente de Fogo', 'fera'),
        f('Raízes da Árvore', 'Raiz Viva', 'fera'),
        f('Prisão dos Sacrifícios', 'Carcereiro Sun'),
        f('Galhos Dourados', 'Espírito da Árvore', 'guardiao'),
        f('Salão dos Anciões Sun', 'Ancião Sun'),
        f('Copa da Árvore', 'Árvore Divina Enfurecida', 'guardiao'),
        f('Trono Solar', 'Patriarca do Clã Sun'),
      ],
    },
    // ---------------------------------------------------------- MAPA 21
    {
      nome: 'Território Demoníaco', icone: '🏰', cor: '#4a0a0a', reino: 11,
      cena: { ceu: ['#2a0505', '#a02a1a'], astro: '#3a1a2a', astroX: 230, montanhas: ['#5a2a2a', '#3a1414', '#1a0808'], estruturas: 'palacio', nevoa: 'rgba(160,30,30,0.2)' },
      descricao:
        'As terras da Raça Demoníaca sob um céu vermelho: cidades negras, mercados de escravos ' +
        'e a grande arena onde até um humano pode lutar como gladiador.',
      sistema: null,
      fases: [
        f('Fronteira Vermelha', 'Batedor Demônio'),
        f('Pântano Negro', 'Fera Demoníaca', 'fera'),
        f('Estrada dos Escravos', 'Mercador de Escravos', 'maligno'),
        f('Portões da Capital', 'Guarda Demoníaco', 'maligno'),
        f('Arena dos Gladiadores', 'Gladiador Demônio'),
        f('Fosso das Feras', 'Fera da Arena', 'fera'),
        f('Mercado Demoníaco', 'Assassino Demônio'),
        f('Quartel dos Comandantes', 'Tenente Demoníaco', 'maligno'),
        f('Templo de Sangue', 'Sacerdote Demoníaco', 'maligno'),
        f('Muralhas da Capital', 'General Demônio', 'maligno'),
        f('Palácio Ocidental', 'Pai de Gou Che', 'maligno'),
        f('Trono de Sangue', 'Comandante Demoníaco Xue Li', 'maligno'),
      ],
    },
    // ---------------------------------------------------------- MAPA 22
    {
      nome: 'Terra Santa dos Nove Céus', icone: '🏛️', cor: '#4a4020', reino: 11,
      cena: { ceu: ['#6a8ad0', '#fff0c0'], astro: '#ffffff', astroX: 160, montanhas: ['#c0c8e0', '#8a90a8', '#4a5068'], estruturas: 'palacio', nevoa: 'rgba(255,255,220,0.25)' },
      descricao:
        'A Terra Santa mais poderosa de Tong Xuan. Sob ela fica a Tumba dos Santos, ' +
        'onde vagam santas mortas e os espíritos dos antigos Mestres Sagrados.',
      sistema: null,
      fases: [
        f('Portão da Terra Santa', 'Discípulo dos Nove Céus'),
        f('Escadaria Celeste', 'Guarda Sagrado'),
        f('Jardim das Santas', 'Fera Celestial', 'fera'),
        f('Salão da Sucessão', 'Candidato a Mestre Sagrado'),
        f('Entrada da Tumba', 'Cadáver de Santa', 'maligno'),
        f('Corredor dos Santos', 'Espírito Remanescente', 'guardiao'),
        f('Câmara Funerária', 'Guardião da Tumba', 'guardiao'),
        f('Altar das Almas', 'Santa Cadáver Furiosa', 'maligno'),
        f('Galeria das Gerações', 'Espírito de Mestre Sagrado', 'guardiao'),
        f('Sala do Dao Marcial', 'Marionete de Formação Sagrada', 'guardiao'),
        f('Câmara do Deus Demônio', 'Remanescente do Grande Deus Demônio', 'maligno'),
        f('Coração da Tumba', 'Santa Cadáver Ancestral', 'maligno'),
      ],
    },
    // ---------------------------------------------------------- MAPA 23
    {
      nome: 'Terras da Raça Monstro', icone: '🐯', cor: '#3a2a10', reino: 12,
      cena: { ceu: ['#4a6a3a', '#e0b070'], astro: '#fff3c4', astroX: 90, montanhas: ['#6a7a5a', '#3a4a2a', '#1a2410'], estruturas: 'arvores', nevoa: 'rgba(120,200,255,0.15)' },
      descricao:
        'O território selvagem da Raça Monstro — e as Minas de Cristal da Terra Santa, ' +
        'que os clãs monstros tomaram à força.',
      sistema: null,
      fases: [
        f('Planícies Selvagens', 'Batedor Monstro'),
        f('Floresta dos Clãs', 'Guerreiro Monstro'),
        f('Rio das Garras', 'Crocodilo Monstro', 'fera'),
        f('Aldeia Monstro', 'Chefe de Aldeia Monstro'),
        f('Entrada das Minas', 'Golem de Cristal', 'guardiao'),
        f('Túneis de Cristal', 'Escorpião de Cristal Azul', 'fera'),
        f('Câmara dos Cristais', 'Minerador Monstro'),
        f('Veio Sagrado', 'Fera de Cristal', 'fera'),
        f('Acampamento de Guerra', 'Xamã Monstro'),
        f('Muralha dos Clãs', 'General Monstro'),
        f('Trono das Minas', 'Senhor das Minas'),
        f('Salão dos Clãs', 'Rei da Raça Monstro'),
      ],
    },
    // ---------------------------------------------------------- MAPA 24
    {
      nome: 'Invasão da Raça dos Ossos', icone: '💀', cor: '#2a2a24', reino: 12,
      cena: { ceu: ['#1a1a1a', '#8a9a8a'], astro: '#d8e0c8', astroX: 200, estrelas: true, montanhas: ['#6a6a60', '#3a3a34', '#1a1a16'], estruturas: 'ruinas', nevoa: 'rgba(200,220,200,0.2)' },
      descricao:
        'A batalha final. A Raça dos Ossos, vinda do espaço, consome Tong Xuan. ' +
        'Humanos, demônios e monstros se unem contra Ke Luo, o Senhor dos Ossos.',
      sistema: null,
      fases: [
        f('Cidades Abandonadas', 'Soldado de Osso'),
        f('Campos Devastados', 'Fera Esqueleto', 'fera'),
        f('Seita Vazia do Gelo', 'Cultivador Possuído', 'maligno'),
        f('Vale dos Ossos', 'Capitão de Osso'),
        f('Céu Escurecido', 'Dragão de Ossos', 'fera'),
        f('Fortaleza Perdida', 'Guerreiro Consumido'),
        f('Ninho da Invasão', 'Aranha de Osso', 'fera'),
        f('Portal dos Ossos', 'General de Osso'),
        f('Olho Exterminador de Demônios', 'Eco do Grande Deus Demônio', 'guardiao'),
        f('Linha de Frente', 'Campeão da Raça dos Ossos'),
        f('Coração da Invasão', 'Devorador de Almas de Osso'),
        f('Trono de Ossos', 'Ke Luo, Senhor da Raça dos Ossos'),
      ],
    },
  ],

  // Mostrado ao vencer a última fase do mundo
  final: {
    titulo: 'O Reino Tong Xuan foi salvo.',
    texto:
      'Com a queda de Ke Luo, a Raça dos Ossos recua para o vazio, e as três raças de Tong Xuan ' +
      'baixam as armas lado a lado.\n\n' +
      '"Este continente também era pequeno. Além do céu, as estrelas esperam."\n\n' +
      '✨ CÉU ESTRELADO — EM BREVE\n(o Mundo 3 está em desenvolvimento)',
  },
};
