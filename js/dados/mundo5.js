// =============================================================
// dados/mundo5.js — MUNDO 5: MUNDOS SUPERIORES — OS TRÊS MIL MUNDOS (12 mapas × 12 fases)
//
// Mesmo formato dos outros mundos. No jogo, estes são os Mapas 49 a 60
// (fundos img/fundos/mapa49.jpg … mapa60.jpg). Libera ao vencer o chefe do
// Mapa 48 (Portão dos Três Mil Mundos, fim do Limite Estelar).
// Lore: arco dos Três Mil Mundos de Martial Peak — as Terras Abençoadas e as Cavernas Celestiais dos
// cultivadores do Céu Aberto, refinar um Mundo do Universo, o Território Morto do Caos, o reino das
// raças-fera, a chegada do Clã da Tinta Negra, a Luz Purificadora, a aliança dos mundos e a passagem
// para o Campo de Batalha da Tinta.
//
//   reino 16 = Reino do Céu Aberto, faixa "Médio Rank" (4ª–6ª Ordem): inicioNoReino 3, fimNoReino 5.
//   A 7ª Ordem só abre com o chefe do Mapa 60 (reinos.js → mapaParaEstagio).
// =============================================================

const f = (local, inimigo, forma = 'humano') => ({ local, inimigo, forma });

// Mapas do Céu Aberto deste mundo: 4ª a 6ª Ordem
const MEDIO_RANK = { reino: 16, inicioNoReino: 3, fimNoReino: 5 };

export const MUNDO_MUNDOS_SUPERIORES = {
  id: 'superiores',
  nome: 'Mundos Superiores — Três Mil Mundos',
  lema: '"Um Pequeno Universo dentro de você — e três mil mundos lá fora."',
  descricao:
    'Além do Portão ficam os Três Mil Mundos, onde vivem os cultivadores do Céu Aberto. Terras Abençoadas e ' +
    'Cavernas Celestiais disputam mundos inteiros — enquanto, nas bordas, a Tinta Negra avança.',
  imagemFundo: null,

  mapas: [
    // ---------------------------------------------------------- MAPA 49
    {
      nome: 'Mar dos Três Mil Mundos', icone: '🪐', cor: '#141a2a', ...MEDIO_RANK,
      cena: { ceu: ['#04060e', '#2a3a6a'], astro: '#c0d0ff', astroX: 90, estrelas: true, montanhas: ['#3a4a7a', '#222c4a', '#0e1424'], estruturas: 'portal', nevoa: 'rgba(170,190,255,0.16)' },
      descricao:
        'Do outro lado do Portão, um oceano de pequenos mundos flutua no vazio. Cada um é uma terra, uma seita — ou uma armadilha.',
      sistema: null,
      fases: [
        f('Margem dos Mundos', 'Fera Errante dos Mundos', 'fera'),
        f('Mundo Pequeno Abandonado', 'Saqueador de Mundos'),
        f('Rota entre Mundos', 'Escolta de uma Terra Abençoada'),
        f('Ilha de Cristal Mundano', 'Golem de Cristal dos Mundos', 'guardiao'),
        f('Corrente entre Mundos', 'Serpente das Correntes Mundiais', 'fera'),
        f('Mundo das Névoas', 'Espírito da Névoa Mundial', 'guardiao'),
        f('Ninho de Feras Mundanas', 'Fera Devoradora de Mundos', 'fera'),
        f('Mundo em Ruínas', 'Cultivador do Céu Aberto Renegado'),
        f('Posto de Vigia', 'Vigia de uma Terra Abençoada'),
        f('Mundo de Fogo', 'Salamandra dos Mundos', 'fera'),
        f('Encruzilhada dos Mundos', 'Mestre de Formações dos Mil Mundos'),
        f('Portal do Primeiro Mundo', 'Guardião do Primeiro Mundo', 'guardiao'),
      ],
    },
    // ---------------------------------------------------------- MAPA 50
    {
      nome: 'Terra Abençoada', icone: '🌸', cor: '#2a1a2a', ...MEDIO_RANK,
      cena: { ceu: ['#0e0610', '#6a3a5a'], astro: '#ffe0f0', astroX: 220, estrelas: false, montanhas: ['#7a4a6a', '#4a2a40', '#20121c'], estruturas: 'pagodas', nevoa: 'rgba(255,200,230,0.15)' },
      descricao:
        'As Terras Abençoadas são forças que dominam mundos inteiros. Para um recém-chegado, cada uma é uma prova — ou uma ameaça.',
      sistema: null,
      fases: [
        f('Campos Abençoados', 'Discípulo da Terra Abençoada'),
        f('Jardim de Ervas Celestes', 'Erva Celeste Guardiã', 'fera'),
        f('Lago Espiritual', 'Grou da Terra Abençoada', 'fera'),
        f('Pavilhão dos Desafios', 'Prodígio da Terra Abençoada'),
        f('Bosque Antigo', 'Cervo Celeste', 'fera'),
        f('Salão das Formações', 'Marionete de Formação Abençoada', 'guardiao'),
        f('Ponte Dourada', 'Guarda Dourado da Terra Abençoada'),
        f('Torre do Ancião', 'Ancião da Terra Abençoada'),
        f('Câmara do Tesouro', 'Fera Guardiã do Tesouro Abençoado', 'fera'),
        f('Salão dos Mestres', 'Mestre de 5ª Ordem'),
        f('Câmara do Patriarca', 'Protetor do Patriarca Abençoado'),
        f('Trono da Terra Abençoada', 'Patriarca da Terra Abençoada'),
      ],
    },
    // ---------------------------------------------------------- MAPA 51
    {
      nome: 'Caverna Celestial', icone: '⛩️', cor: '#1a2a2a', ...MEDIO_RANK,
      cena: { ceu: ['#061010', '#2a5a6a'], astro: '#e0fff8', astroX: 150, estrelas: false, montanhas: ['#3a6a7a', '#22404a', '#0e1c22'], estruturas: 'palacio', nevoa: 'rgba(200,255,250,0.16)' },
      descricao:
        'Acima das Terras Abençoadas estão as Cavernas Celestiais, as forças mais antigas dos Três Mil Mundos. Seus anciões abriram o céu há eras.',
      sistema: null,
      fases: [
        f('Portão da Caverna Celestial', 'Sentinela da Caverna Celestial'),
        f('Escadaria das Nuvens', 'Discípulo da Caverna Celestial'),
        f('Montanha Flutuante Celestial', 'Dragão de Nuvem Celestial', 'fera'),
        f('Salão das Escrituras Celestiais', 'Guardião das Escrituras Celestiais', 'guardiao'),
        f('Lago dos Mil Lótus', 'Lótus Celestial Devorador', 'fera'),
        f('Arena da Caverna', 'Campeão da Caverna Celestial'),
        f('Forja Celestial', 'Golem da Forja Celestial', 'guardiao'),
        f('Pico da Meditação', 'Ancião Recluso da Caverna'),
        f('Biblioteca das Leis Antigas', 'Espírito das Leis Antigas', 'guardiao'),
        f('Salão dos Anciões', 'Ancião de 6ª Ordem'),
        f('Domínio do Mestre', 'Discípulo Direto do Mestre da Caverna'),
        f('Trono da Caverna Celestial', 'Mestre da Caverna Celestial'),
      ],
    },
    // ---------------------------------------------------------- MAPA 52
    {
      nome: 'Mundo do Universo', icone: '🌍', cor: '#1a2a14', ...MEDIO_RANK,
      cena: { ceu: ['#08100a', '#3a6a3a'], astro: '#fff0b0', astroX: 200, estrelas: false, montanhas: ['#4a7a3a', '#2c4a22', '#14220e'], estruturas: 'arvores', nevoa: 'rgba(210,255,190,0.14)' },
      descricao:
        'Um Mundo do Universo sem dono, cheio de Força do Mundo. Quem o refinar fortalece o próprio Pequeno Universo — e os guardiões do mundo sabem disso.',
      sistema: null,
      fases: [
        f('Superfície do Mundo', 'Fera Nativa do Mundo', 'fera'),
        f('Florestas Virgens', 'Árvore Desperta do Mundo', 'guardiao'),
        f('Rios da Origem', 'Serpente da Origem do Mundo', 'fera'),
        f('Montanhas Vivas', 'Golem da Montanha Viva', 'guardiao'),
        f('Céu do Mundo', 'Águia do Céu do Mundo', 'fera'),
        f('Cavernas Profundas', 'Aranha das Profundezas do Mundo', 'fera'),
        f('Tribo Nativa', 'Xamã Nativo do Mundo', 'maligno'),
        f('Veio da Força do Mundo', 'Espírito da Força do Mundo', 'guardiao'),
        f('Coração da Terra', 'Elemental da Terra do Mundo', 'guardiao'),
        f('Templo da Origem', 'Guardião do Templo da Origem', 'guardiao'),
        f('Núcleo do Mundo', 'Fera do Núcleo do Mundo', 'fera'),
        f('Fonte do Mundo', 'Vontade do Mundo do Universo', 'guardiao'),
      ],
    },
    // ---------------------------------------------------------- MAPA 53
    {
      nome: 'Território Morto do Caos', icone: '🌪️', cor: '#1a1424', ...MEDIO_RANK,
      cena: { ceu: ['#06040a', '#3a2a4a'], astro: null, estrelas: true, montanhas: ['#4a3a5a', '#2a2234', '#120e18'], estruturas: 'ruinas', nevoa: 'rgba(190,150,230,0.18)' },
      descricao:
        'Uma região onde as leis do mundo se desfazem. Tempestades do caos, fendas no espaço e criaturas que nasceram do nada.',
      sistema: null,
      fases: [
        f('Borda do Caos', 'Fera do Caos Errante', 'fera'),
        f('Tempestade de Leis', 'Elemental de Leis Partidas', 'guardiao'),
        f('Ruínas Engolidas', 'Cultivador Perdido no Caos', 'maligno'),
        f('Fenda Viva', 'Verme do Caos', 'fera'),
        f('Ilha dos Ossos', 'Esqueleto de Gigante Antigo', 'guardiao'),
        f('Névoa Primordial', 'Espírito Primordial', 'guardiao'),
        f('Ninho do Caos Profundo', 'Aranha do Caos Profundo', 'fera'),
        f('Mar de Relâmpagos', 'Fera do Trovão Caótico', 'fera'),
        f('Cemitério de Mundos', 'Eco de um Mundo Morto', 'guardiao'),
        f('Olho da Tempestade', 'Golem do Caos', 'guardiao'),
        f('Abismo do Caos', 'Devorador de Leis', 'fera'),
        f('Coração do Território Morto', 'Fera Ancestral do Caos', 'fera'),
      ],
    },
    // ---------------------------------------------------------- MAPA 54
    {
      nome: 'Reino das Mil Bestas', icone: '🐾', cor: '#2a1a0a', ...MEDIO_RANK,
      cena: { ceu: ['#100804', '#6a3a1a'], astro: '#ffb060', astroX: 110, estrelas: false, montanhas: ['#7a4a2a', '#4a2c18', '#20140a'], estruturas: 'pinheiros', nevoa: 'rgba(255,190,120,0.14)' },
      descricao:
        'O mundo das raças-fera dos Três Mil Mundos. Aqui, os fortes comem os fracos — e um humano é só mais uma presa.',
      sistema: null,
      fases: [
        f('Planícies Selvagens', 'Lobo das Mil Bestas', 'fera'),
        f('Floresta das Garras', 'Tigre de Garras de Ferro', 'fera'),
        f('Vila Bestial', 'Guerreiro Bestial', 'fera'),
        f('Rio Sangrento', 'Crocodilo Ancestral', 'fera'),
        f('Montanha dos Ursos', 'Urso Rei da Montanha', 'fera'),
        f('Ninho das Águias', 'Águia Real Bestial', 'fera'),
        f('Arena das Bestas', 'Campeão Bestial', 'fera'),
        f('Templo Bestial', 'Xamã das Mil Bestas', 'fera'),
        f('Pântano Venenoso', 'Sapo Rei Venenoso', 'fera'),
        f('Fortaleza Bestial', 'General Bestial', 'fera'),
        f('Palácio das Feras', 'Príncipe das Mil Bestas', 'fera'),
        f('Trono das Mil Bestas', 'Rei das Mil Bestas', 'fera'),
      ],
    },
    // ---------------------------------------------------------- MAPA 55
    {
      nome: 'Cidade Celestial dos Mil Mundos', icone: '🏙️', cor: '#2a2a3a', ...MEDIO_RANK,
      cena: { ceu: ['#0a0a12', '#4a4a7a'], astro: '#ffe9a0', astroX: 240, estrelas: true, montanhas: ['#5a5a8a', '#36365a', '#18182a'], estruturas: 'cidade', nevoa: 'rgba(230,230,255,0.13)' },
      descricao:
        'A maior cidade dos Três Mil Mundos, onde todas as forças negociam, duelam e conspiram — e onde a Tinta Negra já tem espiões.',
      sistema: null,
      fases: [
        f('Portões da Cidade', 'Guarda da Cidade Celestial'),
        f('Mercado Celeste', 'Mercador Trapaceiro'),
        f('Casa de Leilões', 'Leiloeiro Ganancioso'),
        f('Arena dos Mil Mundos', 'Duelista dos Mil Mundos'),
        f('Becos Escuros', 'Assassino Celestial'),
        f('Torre dos Alquimistas', 'Alquimista do Céu Aberto'),
        f('Bairro das Seitas', 'Herdeiro Arrogante de uma Caverna'),
        f('Cofre Celeste', 'Guardião do Cofre Celeste', 'guardiao'),
        f('Salão dos Mercenários', 'Capitão Mercenário Celeste'),
        f('Palácio do Governador', 'Governador da Cidade Celestial'),
        f('Câmara Secreta', 'Espião da Tinta Disfarçado'),
        f('Torre Central', 'Senhor da Cidade Celestial'),
      ],
    },
    // ---------------------------------------------------------- MAPA 56
    {
      nome: 'Caverna Celestial Caída', icone: '🕳️', cor: '#141414', ...MEDIO_RANK,
      cena: { ceu: ['#040404', '#22222c'], astro: '#6a6a7a', astroX: 170, estrelas: true, montanhas: ['#2c2c36', '#1a1a22', '#0a0a0e'], estruturas: 'palacio', nevoa: 'rgba(60,60,80,0.3)' },
      descricao:
        'Uma Caverna Celestial inteira foi engolida pela Tinta Negra. Seus anciões agora servem a quem os destruiu.',
      sistema: null,
      fases: [
        f('Portão Manchado', 'Sentinela Corrompida da Caverna'),
        f('Pátio Silencioso', 'Discípulo Caído da Caverna'),
        f('Jardim Apodrecido', 'Árvore de Tinta Ancestral', 'guardiao'),
        f('Salão de Treino', 'Guerreiro da Tinta'),
        f('Lago Negro', 'Serpente de Tinta Ancestral', 'fera'),
        f('Biblioteca Queimada', 'Espírito Corrompido pela Tinta', 'guardiao'),
        f('Forja Negra', 'Golem de Tinta', 'guardiao'),
        f('Salão dos Anciões Caídos', 'Ancião Caído pela Tinta'),
        f('Câmara das Formações', 'Formação Corrompida', 'guardiao'),
        f('Pico Negro', 'Fera de Tinta Ancestral', 'fera'),
        f('Domínio Corrompido', 'Capitão do Clã da Tinta'),
        f('Trono Caído', 'Mestre Caído da Caverna Celestial'),
      ],
    },
    // ---------------------------------------------------------- MAPA 57
    {
      nome: 'Fronteira do Clã da Tinta', icone: '⚫', cor: '#0a0a0a', ...MEDIO_RANK,
      cena: { ceu: ['#020202', '#2a1a2a'], astro: '#8a2a4a', astroX: 80, estrelas: false, montanhas: ['#2a1a26', '#180e16', '#08060a'], estruturas: 'ruinas', nevoa: 'rgba(80,30,60,0.28)' },
      descricao:
        'Aqui o Clã da Tinta Negra aparece de verdade: não cultivadores corrompidos, mas a própria raça da Tinta, nascida dela.',
      sistema: null,
      fases: [
        f('Campo Escurecido', 'Soldado do Clã da Tinta'),
        f('Trincheira Negra', 'Batedor do Clã da Tinta'),
        f('Ninho de Tinta', 'Fera Nascida da Tinta', 'fera'),
        f('Acampamento da Tinta', 'Guerreiro de Elite do Clã da Tinta'),
        f('Rio de Tinta Vivo', 'Enguia de Tinta', 'fera'),
        f('Torre de Vigia Negra', 'Vigia do Clã da Tinta'),
        f('Muralha de Ossos e Tinta', 'Golem de Ossos e Tinta', 'guardiao'),
        f('Altar da Tinta', 'Sacerdote do Clã da Tinta'),
        f('Forja de Tinta', 'Ferreiro do Clã da Tinta'),
        f('Portão do Domínio', 'General do Clã da Tinta'),
        f('Câmara do Senhor', 'Guarda-Costas do Senhor de Território'),
        f('Domínio Negro', 'Senhor de Território do Clã da Tinta'),
      ],
    },
    // ---------------------------------------------------------- MAPA 58
    {
      nome: 'Templo da Luz Purificadora', icone: '✨', cor: '#2a2a1a', ...MEDIO_RANK,
      cena: { ceu: ['#0a0a06', '#6a6a3a'], astro: '#ffffff', astroX: 160, estrelas: false, montanhas: ['#8a8a5a', '#5a5a3a', '#2a2a1a'], estruturas: 'palacio', nevoa: 'rgba(255,255,220,0.2)' },
      descricao:
        'Diz-se que só a Luz Purificadora apaga a Tinta Negra. O caminho até ela é guardado por provas antigas.',
      sistema: null,
      fases: [
        f('Escadaria da Luz', 'Guardião da Escadaria de Luz', 'guardiao'),
        f('Jardim Luminoso', 'Espírito de Luz', 'guardiao'),
        f('Ponte de Cristal', 'Golem de Cristal Luminoso', 'guardiao'),
        f('Salão dos Ecos', 'Eco de um Herói Antigo', 'guardiao'),
        f('Lago Prateado', 'Serpente de Prata', 'fera'),
        f('Prova do Coração', 'Reflexo Sombrio do Coração'),
        f('Prova da Vontade', 'Fera de Luz Guardiã', 'fera'),
        f('Biblioteca da Luz', 'Guardião das Escrituras de Luz'),
        f('Câmara Selada', 'Tinta Aprisionada', 'fera'),
        f('Altar Dourado', 'Guerreiro da Luz Antigo'),
        f('Santuário Interno', 'Fênix da Luz', 'fera'),
        f('Coração da Luz', 'Guardião da Luz Purificadora'),
      ],
    },
    // ---------------------------------------------------------- MAPA 59
    {
      nome: 'Aliança dos Mil Mundos', icone: '🛡️', cor: '#1a1a2a', ...MEDIO_RANK,
      cena: { ceu: ['#06060e', '#3a3a6a'], astro: '#ffd36b', astroX: 200, estrelas: true, montanhas: ['#4a4a7a', '#2c2c4a', '#141424'], estruturas: 'palacio', nevoa: 'rgba(255,220,150,0.13)' },
      descricao:
        'As Cavernas Celestiais e as Terras Abençoadas, rivais por eras, se unem contra a Tinta. Mas uma aliança também tem traidores.',
      sistema: null,
      fases: [
        f('Campo de Treinamento', 'Recruta da Aliança'),
        f('Quartel Celeste', 'Instrutor da Aliança'),
        f('Arsenal da Aliança', 'Golem do Arsenal da Aliança', 'guardiao'),
        f('Estábulo de Bestas', 'Fera de Guerra da Aliança', 'fera'),
        f('Salão de Estratégia', 'Estrategista Traidor'),
        f('Muralha da Aliança', 'Veterano do Céu Aberto'),
        f('Prisão da Aliança', 'Espião da Tinta Capturado'),
        f('Portão das Legiões', 'Comandante de Legião'),
        f('Torre dos Generais', 'General Traidor da Aliança'),
        f('Salão do Conselho', 'Conselheiro Corrompido'),
        f('Câmara do Marechal', 'Guarda do Marechal'),
        f('Trono da Aliança', 'Marechal Traidor dos Mil Mundos'),
      ],
    },
    // ---------------------------------------------------------- MAPA 60
    {
      nome: 'Passagem para o Campo de Batalha', icone: '⚔️', cor: '#2a0a14', ...MEDIO_RANK,
      cena: { ceu: ['#0a0204', '#4a0a2a'], astro: '#ff5a8a', astroX: 130, estrelas: true, montanhas: ['#4a1a2a', '#2c0e18', '#14060a'], estruturas: 'portal', nevoa: 'rgba(255,90,140,0.15)' },
      descricao:
        'O último passo antes da guerra: a passagem que leva ao Campo de Batalha da Tinta Negra. Só quem passar por aqui chega à 7ª Ordem.',
      sistema: null,
      fases: [
        f('Entrada da Passagem', 'Sentinela da Passagem'),
        f('Túnel de Luz', 'Guardião do Túnel de Luz', 'guardiao'),
        f('Fortaleza Avançada', 'Soldado da Fortaleza Avançada'),
        f('Campo de Ossos', 'Restos de um Exército Antigo', 'guardiao'),
        f('Fenda de Tinta Viva', 'Fera da Fenda de Tinta', 'fera'),
        f('Ponte Quebrada', 'Guerreiro de Tinta da Ponte'),
        f('Acampamento Inimigo', 'Capitão de Território da Tinta'),
        f('Torre de Tinta', 'Feiticeiro da Tinta'),
        f('Portão Negro', 'Golem do Portão Negro', 'guardiao'),
        f('Último Bastião', 'Campeão do Clã da Tinta'),
        f('Antessala da Guerra', 'Arauto do Senhor Real da Tinta'),
        f('Passagem para o Campo de Batalha', 'Grande Senhor de Território da Tinta'),
      ],
    },
  ],

  // Mostrado ao vencer a última fase do mundo
  final: {
    titulo: 'A passagem para a guerra está aberta.',
    texto:
      'O Grande Senhor de Território cai, e o caminho para o Campo de Batalha da Tinta Negra se abre. ' +
      'Do outro lado, os exércitos dos Três Mil Mundos já lutam contra os Senhores Reais da Tinta.\n\n' +
      '"A 7ª Ordem não é um degrau. É uma linha de frente."\n\n' +
      '✨ MUNDO 6 — EM BREVE\n(o Universo Exterior está em desenvolvimento)',
  },
};
