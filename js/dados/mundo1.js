// =============================================================
// dados/mundo1.js — MUNDO INICIAL (12 mapas × 12 fases = 144 fases)
//
// Cada mapa tem:
//   nome, icone, cor (cor de fundo da arena), descricao (lore)
//   reino        → reino de cultivo em que o mapa é jogado
//                  (índice em REINOS: 0 = Corpo Temperado, 1 = Elemento Inicial ... 6 = Transcendente)
//   inicioNoReino → (opcional) estágio do reino em que o mapa começa (4 = 5º estágio)
//   sistema      → sistema que este mapa vai introduzir (em etapas futuras)
//   cena         → paisagem de fundo desenhada em pixel art (ui/fundo.js):
//                  ceu [cor de cima, cor de baixo], astro (cor do sol/lua ou null),
//                  astroX (posição), estrelas, montanhas [fundo, meio, frente],
//                  estruturas ('pagodas', 'palacio', 'cidade', 'pinheiros',
//                  'arvores', 'ruinas', 'portal'), nevoa (cor ou nada)
//   fases        → 12 fases: local, inimigo e forma do inimigo
//                  formas: 'humano', 'fera', 'maligno', 'guardiao'
// O tipo de cada fase (comum, elite, chefe...) vem de dados/fases.js
// =============================================================

// Atalho para escrever as fases de forma curta
const f = (local, inimigo, forma = 'humano') => ({ local, inimigo, forma });

export const MUNDO_INICIAL = {
  id: 'mundo_inicial',
  nome: 'Mundo Inicial — Starting World',
  lema: '"Do servo insignificante ao ápice do Mundo Inicial."',
  descricao:
    'Um mundo de baixa Energia Mundial, dominado por seitas, famílias aristocráticas e territórios perigosos. ' +
    'Você começa como um ninguém, cercado por incontáveis especialistas. Recursos são escassos, e uma única ' +
    'oportunidade pode mudar o destino de um cultivador.',

  // Quer usar uma imagem sua de fundo? Coloque o arquivo na pasta "img"
  // e escreva o caminho aqui, por exemplo: imagemFundo: 'img/mundo-inicial.png'
  // Com null, o jogo desenha a paisagem do mapa atual em pixel art.
  imagemFundo: null,

  mapas: [
    // ---------------------------------------------------------- MAPA 1
    {
      nome: 'High Heaven Pavilion', icone: '🏯', cor: '#2f4a33', reino: 0, inicioNoReino: 4,
      cena: { ceu: ['#3a5f9f', '#f2c27a'], astro: '#fff3c4', astroX: 240, montanhas: ['#7a8fb0', '#41604f', '#22362a'], estruturas: 'pagodas', nevoa: 'rgba(255,255,255,0.18)' },
      descricao:
        'O início absoluto. Você é um servo insignificante de uma grande seita, sem talento aparente. ' +
        'Contam que um jovem chamado Yang Kai varreu estes mesmos pátios antes de se tornar uma lenda.',
      sistema: null,
      fases: [
        f('Pátio dos Servos', 'Servo Arrogante'),
        f('Campo de Treino Externo', 'Discípulo em Teste'),
        f('Floresta de Bambu', 'Macaco Ladrão', 'fera'),
        f('Alojamento Externo', 'Valentão dos Alojamentos'),
        f('Caminho da Montanha', 'Discípulo Externo'),
        f('Pavilhão das Tarefas', 'Encarregado Corrupto'),
        f('Câmara de Cultivo', 'Rival do Mesmo Ano'),
        f('Arena dos Discípulos', 'Campeão dos Externos'),
        f('Biblioteca de Técnicas', 'Guardião da Biblioteca'),
        f('Pátio Interno', 'Discípulo Interno'),
        f('Torre da Disciplina', 'Ancião Executor'),
        f('Pico do Pavilhão', 'Discípulo Interno de Elite'),
      ],
    },
    // ---------------------------------------------------------- MAPA 2
    {
      nome: 'Montanhas do High Heaven Pavilion', icone: '⛰️', cor: '#27402f', reino: 1,
      cena: { ceu: ['#6f9fbf', '#d8e6dc'], astro: '#ffffff', astroX: 70, montanhas: ['#8aa5a5', '#3f6a4a', '#1f3a26'], estruturas: 'pinheiros', nevoa: 'rgba(255,255,255,0.3)' },
      descricao:
        'As montanhas ao redor da seita escondem cavernas, ervas e feras espirituais. ' +
        'Aqui você percebe que o mundo exterior é muito mais perigoso que a seita.',
      sistema: 'Materiais, ervas, minérios e drops aleatórios',
      fases: [
        f('Trilha Enevoada', 'Lobo Cinzento', 'fera'),
        f('Bosque das Ervas', 'Serpente Verde', 'fera'),
        f('Riacho Gelado', 'Javali de Presas de Ferro', 'fera'),
        f('Covil dos Lobos', 'Lobo Alfa', 'fera'),
        f('Mina Abandonada', 'Minerador Renegado'),
        f('Caverna Úmida', 'Morcego Sanguinário', 'fera'),
        f('Penhasco dos Ventos', 'Águia de Garras de Ferro', 'fera'),
        f('Toca do Urso', 'Urso de Pele de Pedra', 'fera'),
        f('Clareira Espiritual', 'Caçador de Ervas Rival'),
        f('Vale Escondido', 'Tigre de Listras Negras', 'fera'),
        f('Cume Trovejante', 'Píton Espiritual Ancestral', 'fera'),
        f('Ninho da Fera', 'Fera Espiritual da Montanha', 'fera'),
      ],
    },
    // ---------------------------------------------------------- MAPA 3
    {
      nome: 'Cidades da Grande Dinastia Han', icone: '🏘️', cor: '#4a3d25', reino: 2,
      cena: { ceu: ['#5f8fcf', '#f4d49a'], astro: '#fff0b0', astroX: 60, montanhas: ['#a59a80', '#6f6a50', '#3a3424'], estruturas: 'cidade' },
      descricao:
        'Vilas, mercados, casas de leilão e arenas. Você descobre que as grandes famílias ' +
        'controlam quantidades enormes de recursos.',
      sistema: 'Comércio e recursos',
      fases: [
        f('Vila na Estrada', 'Bandido de Estrada'),
        f('Portões da Cidade', 'Guarda Ganancioso'),
        f('Mercado Popular', 'Batedor de Carteiras'),
        f('Casa de Leilões', 'Segurança do Leilão'),
        f('Rua dos Comerciantes', 'Cultivador Independente'),
        f('Taverna do Dragão Bêbado', 'Mercenário Bêbado'),
        f('Arena da Cidade', 'Lutador do Bando da Batalha Sangrenta'),
        f('Mansão da Família Local', 'Chefe da Guarda Familiar'),
        f('Pátio dos Mestres', 'Especialista Local'),
        f('Salão de Banquetes', 'Servo Leal da Família'),
        f('Portão da Mansão', 'Ancião da Família'),
        f('Jardim Privado', 'Jovem Mestre da Família'),
      ],
    },
    // ---------------------------------------------------------- MAPA 4
    {
      nome: 'Caminho para a Capital Central', icone: '🛤️', cor: '#3a3448', reino: 2,
      cena: { ceu: ['#6a4a7a', '#f0a060'], astro: '#ffd08a', astroX: 160, montanhas: ['#8a6a70', '#5a4a50', '#2a2228'], estruturas: 'cidade', nevoa: 'rgba(255,200,150,0.15)' },
      descricao:
        'Estradas imperiais, caravanas e grandes cidades. Os conflitos entre famílias aumentam, ' +
        'e você ouve falar das Oito Grandes Famílias da Capital Central.',
      sistema: null,
      fases: [
        f('Estrada Imperial', 'Saqueador de Caravanas'),
        f('Posto de Pedágio', 'Cobrador Imperial'),
        f('Caravana Mercante', 'Escolta Mercenária'),
        f('Desfiladeiro do Lobo', 'Líder dos Saqueadores'),
        f('Cidade Fronteiriça', 'Discípulo de Família Menor'),
        f('Ponte dos Mil Passos', 'Grupo de Cultivadores'),
        f('Acampamento Militar', 'Soldado da Dinastia'),
        f('Fortaleza da Estrada', 'Capitão da Fortaleza'),
        f('Cidade Muralha', 'Emissário de Grande Família'),
        f('Bosque das Lanternas', 'Assassino Contratado'),
        f('Portão Externo da Capital', 'Guardião do Portão'),
        f('Estalagem Imperial', 'Especialista das Grandes Famílias'),
      ],
    },
    // ---------------------------------------------------------- MAPA 5
    {
      nome: 'Capital Central', icone: '🏛️', cor: '#4a2424', reino: 3,
      cena: { ceu: ['#1a1430', '#c0504a'], astro: '#ffe0a0', astroX: 250, estrelas: true, montanhas: ['#5a3a4a', '#3a2430', '#1a1018'], estruturas: 'palacio' },
      descricao:
        'O grande centro político e marcial da Dinastia Han. Palácios, mansões das Oito Grandes ' +
        'Famílias, leilões e áreas proibidas. Aqui seu nome começa a ser conhecido.',
      sistema: 'Reputação',
      fases: [
        f('Ruas Movimentadas', 'Arruaceiro da Capital'),
        f('Distrito dos Mercados', 'Comerciante Trapaceiro'),
        f('Associação de Cultivadores', 'Examinador da Associação'),
        f('Arena Imperial', 'Campeão da Arena'),
        f('Casa de Leilão Celestial', 'Licitante Rival'),
        f('Mansões das Famílias', 'Guarda de Família Nobre'),
        f('Jardim do Palácio', 'Guarda do Palácio'),
        f('Salão Ancestral', 'Protetor Ancestral'),
        f('Área Proibida', 'Sentinela Oculta'),
        f('Torre dos Arquivos', 'Jovem Prodígio da Capital'),
        f('Pátio das Oito Famílias', 'Ancião de uma Grande Família'),
        f('Palco do Duelo', 'Jovem Especialista das Oito Famílias'),
      ],
    },
    // ---------------------------------------------------------- MAPA 6
    {
      nome: 'Vale do Rei da Medicina', icone: '🌿', cor: '#1f4a3f', reino: 3,
      cena: { ceu: ['#5fbfa0', '#e8f4d0'], astro: '#ffffff', astroX: 200, montanhas: ['#8fbfa0', '#4a8a6a', '#244a38'], estruturas: 'pinheiros', nevoa: 'rgba(220,255,230,0.3)' },
      descricao:
        'Jardins espirituais, campos medicinais e laboratórios. O caminho marcial não depende só ' +
        'de força: conhecimento e alquimia também decidem o destino de um cultivador.',
      sistema: 'Alquimia (pílulas, elixires e medicamentos)',
      fases: [
        f('Entrada do Vale', 'Discípulo Porteiro'),
        f('Jardins Espirituais', 'Fera Guardiã das Ervas', 'fera'),
        f('Campos Medicinais', 'Ladrão de Ervas'),
        f('Estufa de Jade', 'Planta Devoradora', 'fera'),
        f('Caverna das Raízes', 'Verme de Raiz Espiritual', 'fera'),
        f('Laboratório Alquímico', 'Alquimista Aprendiz'),
        f('Forno dos Mil Fogos', 'Golem de Fornalha', 'guardiao'),
        f('Lago das Pílulas', 'Serpente do Lago Medicinal', 'fera'),
        f('Pavilhão dos Mestres', 'Mestre Alquimista'),
        f('Área Secreta', 'Experimento Fugitivo', 'fera'),
        f('Salão do Rei da Medicina', 'Ancião do Vale'),
        f('Coração do Vale', 'Guardião do Vale', 'guardiao'),
      ],
    },
    // ---------------------------------------------------------- MAPA 7
    {
      nome: 'Terras Selvagens', icone: '🌲', cor: '#2f3a18', reino: 4,
      cena: { ceu: ['#4a8ac0', '#c8e8a8'], astro: '#fff6c0', astroX: 90, montanhas: ['#6a9a6a', '#3a6a2a', '#1a3a10'], estruturas: 'arvores' },
      descricao:
        'Longe da civilização: florestas gigantes, rios, ruínas e tesouros escondidos, ' +
        'guardados por monstros espirituais.',
      sistema: 'Exploração automática',
      fases: [
        f('Floresta Gigante', 'Aranha Gigante', 'fera'),
        f('Rio Turbulento', 'Crocodilo de Escamas de Ferro', 'fera'),
        f('Colinas Selvagens', 'Bando de Hienas Espirituais', 'fera'),
        f('Ruínas Cobertas', 'Saqueador de Tumbas'),
        f('Pântano Venenoso', 'Sapo Venenoso Gigante', 'fera'),
        f('Montanhas Uivantes', 'Lobo Lunar', 'fera'),
        f('Caverna de Cristal', 'Escorpião de Cristal', 'fera'),
        f('Cachoeira Celestial', 'Jovem Dragão de Inundação', 'fera'),
        f('Templo Esquecido', 'Eremita Enlouquecido'),
        f('Floresta Ancestral', 'Árvore Ancestral Desperta', 'guardiao'),
        f('Vale dos Ossos', 'Rei Macaco de Ferro', 'fera'),
        f('Covil Primordial', 'Grande Monstro Espiritual', 'fera'),
      ],
    },
    // ---------------------------------------------------------- MAPA 8
    {
      nome: 'Terras do Vale do Rei Fantasma', icone: '🌫️', cor: '#2a2030', reino: 4,
      cena: { ceu: ['#1a1420', '#5a4a5a'], astro: '#c03030', astroX: 230, montanhas: ['#4a3a50', '#2a2030', '#140e18'], estruturas: 'ruinas', nevoa: 'rgba(120,100,130,0.3)' },
      descricao:
        'Céu escuro, montanhas corrompidas e energia demoníaca. As terras das seitas malignas, lideradas ' +
        'pelo temido Vale do Rei Fantasma e governadas pelos Reis Malignos.',
      sistema: null,
      fases: [
        f('Fronteira do Vale', 'Bandido das Névoas', 'maligno'),
        f('Cidade Destruída', 'Cultivador Maligno', 'maligno'),
        f('Montanhas Corrompidas', 'Fera Corrompida', 'fera'),
        f('Desfiladeiro Sombrio', 'Assassino das Sombras', 'maligno'),
        f('Caverna Sombria', 'Morcego Demoníaco', 'fera'),
        f('Pântano de Sangue', 'Discípulo do Vale do Rei Fantasma', 'maligno'),
        f('Templo Profanado', 'Sacerdote Maligno', 'maligno'),
        f('Fortaleza Negra', 'Rei Maligno do Norte', 'maligno'),
        f('Altar dos Demônios', 'Especialista Maligno', 'maligno'),
        f('Torre do Rei Fantasma', 'Rei Maligno do Sul', 'maligno'),
        f('Salão dos Reis', 'Rei Maligno Supremo', 'maligno'),
        f('Trono do Rei Fantasma', 'Mestre do Vale do Rei Fantasma', 'maligno'),
      ],
    },
    // ---------------------------------------------------------- MAPA 9
    {
      nome: 'Guerra contra a Dinastia Tian Lang', icone: '🔥', cor: '#4a2414', reino: 5,
      cena: { ceu: ['#2a0a0a', '#e0602a'], astro: '#ff9a3a', astroX: 120, montanhas: ['#6a2a1a', '#3a1a10', '#1a0a06'], estruturas: 'ruinas', nevoa: 'rgba(60,30,20,0.35)' },
      descricao:
        'A Dinastia Tian Lang, aliada às seitas malignas, invade a Dinastia Han: invasões, ' +
        'emboscadas e cercos a cidades e seitas em uma guerra aberta.',
      sistema: 'Batalhas em larga escala e Cerco (ondas de inimigos)',
      fases: [
        f('Vila Invadida', 'Batedor de Tian Lang', 'maligno'),
        f('Muralha da Cidade', 'Soldado de Tian Lang', 'maligno'),
        f('Portões em Chamas', 'Onda de Invasores', 'maligno'),
        f('Acampamento Inimigo', 'Comandante de Vanguarda', 'maligno'),
        f('Campo de Batalha', 'Cultivador de Guerra', 'maligno'),
        f('Emboscada no Desfiladeiro', 'Emboscador Maligno', 'maligno'),
        f('Defesa da Seita', 'Esquadrão de Assalto', 'maligno'),
        f('Torre de Vigia', 'Capitão de Tian Lang', 'maligno'),
        f('Planície Sangrenta', 'Especialista de Guerra', 'maligno'),
        f('Linha de Frente', 'Feiticeiro de Batalha', 'maligno'),
        f('Cerco Final', 'Senhor da Guerra de Tian Lang', 'maligno'),
        f('Coração do Exército', 'General da Dinastia Tian Lang', 'maligno'),
      ],
    },
    // ---------------------------------------------------------- MAPA 10
    {
      nome: 'Misteriosos Pequenos Mundos', icone: '🌀', cor: '#162d4a', reino: 5,
      cena: { ceu: ['#050a20', '#3050a0'], astro: '#a0c0ff', astroX: 200, estrelas: true, montanhas: ['#3a4a7a', '#24305a', '#121a38'], estruturas: 'ruinas', nevoa: 'rgba(120,160,255,0.15)' },
      descricao:
        'Uma passagem leva a um pequeno mundo de ruínas, formações e túmulos antigos. ' +
        'O Mundo Inicial guarda segredos muito maiores do que você imaginava.',
      sistema: 'Heranças (técnicas, linhagens e bônus permanentes)',
      fases: [
        f('Fenda Espacial', 'Fragmento Espacial Vivo', 'guardiao'),
        f('Ruínas Flutuantes', 'Espírito Errante', 'guardiao'),
        f('Jardim Petrificado', 'Besta de Pedra Antiga', 'fera'),
        f('Formação dos Mil Espelhos', 'Reflexo Sombrio', 'maligno'),
        f('Túmulo dos Antigos', 'Cadáver Guardião', 'guardiao'),
        f('Biblioteca Selada', 'Marionete de Formação', 'guardiao'),
        f('Lago das Estrelas', 'Peixe Celestial', 'fera'),
        f('Câmara das Linhagens', 'Fera de Linhagem Antiga', 'fera'),
        f('Corredor das Heranças', 'Remanescente de Alma', 'guardiao'),
        f('Altar Esquecido', 'Discípulo Ancestral'),
        f('Portal Interno', 'Guardião da Formação', 'guardiao'),
        f('Santuário da Herança', 'Guardião da Antiga Herança', 'guardiao'),
      ],
    },
    // ---------------------------------------------------------- MAPA 11
    {
      nome: 'O Segredo do Mundo', icone: '🔮', cor: '#22223f', reino: 6,
      cena: { ceu: ['#03030f', '#2a1a5a'], astro: null, estrelas: true, montanhas: ['#2a2a5a', '#1a1a40', '#0c0c20'], estruturas: 'ruinas', nevoa: 'rgba(150,120,255,0.12)' },
      descricao:
        'Formações gigantes e corredores espaciais revelam a verdade: o Mundo Inicial é apenas um ' +
        'fragmento de uma realidade muito maior, ligado ao Reino Tong Xuan.',
      sistema: null,
      fases: [
        f('Ruínas Antigas', 'Sentinela de Pedra', 'guardiao'),
        f('Formação Gigante', 'Núcleo de Formação Desperto', 'guardiao'),
        f('Corredor Espacial', 'Fera do Vazio', 'fera'),
        f('Passagem Dimensional', 'Caçador Dimensional', 'maligno'),
        f('Cidade Abandonada', 'Eco de um Antigo Especialista', 'guardiao'),
        f('Salão das Estrelas', 'Observador Celestial', 'guardiao'),
        f('Abismo Silencioso', 'Devorador de Espaço', 'fera'),
        f('Câmara dos Vestígios', 'Avatar de Especialista Antigo'),
        f('Ponte das Estrelas', 'Explorador de Outro Mundo'),
        f('Mural da Verdade', 'Guardião dos Segredos', 'guardiao'),
        f('Borda do Vazio', 'Sombra do Corredor', 'maligno'),
        f('Corredor do Vazio', 'Guardião do Corredor do Vazio', 'guardiao'),
      ],
    },
    // ---------------------------------------------------------- MAPA 12
    {
      nome: 'Portal para o Reino Tong Xuan', icone: '🌌', cor: '#3f3418', reino: 6,
      cena: { ceu: ['#0a0618', '#7a5a20'], astro: null, estrelas: true, montanhas: ['#4a3a2a', '#2a2018', '#14100a'], estruturas: 'portal' },
      descricao:
        'Diante de um antigo corredor espacial, cercado por ruínas e energia espacial. ' +
        'Este mundo era apenas o começo.',
      sistema: null,
      fases: [
        // Fases 1–8: confrontos finais contra especialistas do Mundo Inicial
        f('Planície das Ruínas', 'Especialista Errante'),
        f('Escadaria Antiga', 'Mestre de Seita Rival'),
        f('Colunas Quebradas', 'Patriarca de Família'),
        f('Formação Antiga', 'Ancião Supremo do Pavilhão'),
        f('Ventos Espaciais', 'Rei Maligno Remanescente', 'maligno'),
        f('Pátio dos Antigos', 'Grande Ancião do Vale'),
        f('Campo de Energia Espacial', 'Monarca das Feras', 'fera'),
        f('Altar do Juramento', 'Protetor da Dinastia Han'),
        // Fases 9–10: exploração das ruínas e descoberta da passagem
        f('Ruínas do Portal', 'Formação Guardiã Desperta', 'guardiao'),
        f('Passagem Espacial', 'Distorção Espacial', 'guardiao'),
        // Fase 11: grande batalha contra o guardião do corredor
        f('Diante do Corredor', 'Guardião do Corredor Espacial', 'guardiao'),
        // Fase 12: o último grande obstáculo
        f('Portal para o Reino Tong Xuan', 'Senhor Demônio', 'maligno'),
      ],
    },
  ],

  // Mostrado ao vencer a última fase do mundo
  final: {
    titulo: 'O Mundo Inicial terminou.',
    texto:
      'Com a queda do Senhor Demônio, o corredor espacial se ativa, e diante de você surge uma realidade completamente diferente.\n\n' +
      '"Eu pensei que este era o mundo inteiro. Agora descobri que ele era apenas um pequeno fragmento."\n\n' +
      'Mas o verdadeiro caminho marcial apenas começou.\n\n' +
      '🌌 REINO TONG XUAN — DESBLOQUEADO\n(o Mundo 2 começa no Mapa 13: Fronteira de Tong Xuan)',
  },
};
