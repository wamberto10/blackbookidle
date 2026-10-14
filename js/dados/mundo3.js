// =============================================================
// dados/mundo3.js — MUNDO 3: CAMPO ESTELAR HENG LUO (12 mapas × 12 fases)
//
// Mesmo formato do Mundo 1 e 2. No jogo, estes são os Mapas 25 a 36
// (fundos img/fundos/mapa25.jpg … mapa36.jpg). Libera ao vencer o chefe do
// Mapa 24 (Ke Luo, fim do Reino Tong Xuan).
// Lore: arco do Campo Estelar Heng Luo de Martial Peak — a travessia do vazio, as
// Estrelas de Cultivo, a traição da Estrela Púrpura, a Fonte Estelar, a rede de
// formações e a guerra contra o Campo Estelar da Grande Desolação de Wu Heng.
//
//   reino → índice em REINOS (13 = Pseudo-Grande Imperador, 14 = Grande Imperador)
// =============================================================

const f = (local, inimigo, forma = 'humano') => ({ local, inimigo, forma });

export const MUNDO_HENG_LUO = {
  id: 'heng_luo',
  nome: 'Campo Estelar Heng Luo',
  lema: '"Além do céu de um mundo, existem milhares de estrelas — e cada uma tem um mestre."',
  descricao:
    'O céu estrelado além de Tong Xuan. Estrelas de Cultivo, Fontes Estelares, piratas do vazio e ' +
    'Campos Estelares inteiros em guerra. Aqui, quem refina a Fonte de uma estrela se torna o seu mestre.',
  imagemFundo: null,

  mapas: [
    // ---------------------------------------------------------- MAPA 25
    {
      nome: 'Corredor do Vazio', icone: '🌌', cor: '#1a1a3a', reino: 13,
      cena: { ceu: ['#05050f', '#2a1a5a'], astro: null, estrelas: true, montanhas: ['#3a2a6a', '#22184a', '#100a24'], estruturas: 'portal', nevoa: 'rgba(160,120,255,0.18)' },
      descricao:
        'A travessia entre Tong Xuan e as estrelas. Fendas espaciais, correntes do vazio e feras que nunca viram a luz de um mundo.',
      sistema: null,
      fases: [
        f('Fenda Espacial', 'Fera do Vazio Errante', 'fera'),
        f('Correnteza do Vazio', 'Enguia do Vazio', 'fera'),
        f('Destroços Flutuantes', 'Saqueador do Vazio'),
        f('Ilha de Pedra no Vazio', 'Caçador de Rachaduras'),
        f('Tempestade Espacial', 'Morcego do Vazio', 'fera'),
        f('Ninho do Vazio', 'Aranha Espacial', 'fera'),
        f('Ruína de Nave Estelar', 'Espírito Perdido no Vazio', 'guardiao'),
        f('Olho da Tempestade', 'Fera do Vazio Ancestral', 'fera'),
        f('Portal Instável', 'Golem de Formação Espacial', 'guardiao'),
        f('Marcos Estelares', 'Cultivador Perdido no Vazio'),
        f('Fim do Corredor', 'Dragão do Vazio', 'fera'),
        f('Saída para as Estrelas', 'Grande Devorador do Vazio', 'fera'),
      ],
    },
    // ---------------------------------------------------------- MAPA 26
    {
      nome: 'Cinturão de Meteoros', icone: '☄️', cor: '#3a2a1a', reino: 13,
      cena: { ceu: ['#0a0a14', '#4a2a1a'], astro: '#ffb070', astroX: 220, estrelas: true, montanhas: ['#6a4a3a', '#3a2a22', '#1a120e'], estruturas: 'ruinas', nevoa: 'rgba(255,160,90,0.15)' },
      descricao:
        'Rochas errantes cruzam o céu do Campo Estelar Heng Luo. Entre elas se escondem os Piratas Estelares, que atacam qualquer um que ouse atravessar.',
      sistema: null,
      fases: [
        f('Asteroides Errantes', 'Pirata Estelar Novato'),
        f('Rocha de Ferro Estelar', 'Besouro de Meteoro', 'fera'),
        f('Esconderijo dos Piratas', 'Pirata Estelar'),
        f('Doca Clandestina', 'Contramestre Pirata'),
        f('Campo de Gelo Cósmico', 'Serpente de Gelo Estelar', 'fera'),
        f('Mina de Meteoritos', 'Golem de Meteorito', 'guardiao'),
        f('Mercado Pirata', 'Assassino Pirata'),
        f('Rocha da Caveira', 'Capitão Pirata Estelar'),
        f('Cemitério de Naves', 'Espírito do Naufrágio', 'guardiao'),
        f('Arsenal Pirata', 'Artilheiro Pirata'),
        f('Fortaleza Flutuante', 'Imediato dos Piratas Estelares', 'maligno'),
        f('Nau Capitânia', 'Rei dos Piratas Estelares'),
      ],
    },
    // ---------------------------------------------------------- MAPA 27
    {
      nome: 'Estrela das Montanhas Verdes', icone: '⛰️', cor: '#1a3a22', reino: 13,
      cena: { ceu: ['#2a5a8a', '#b0e0c0'], astro: '#fff3c4', astroX: 90, montanhas: ['#7ab0a0', '#3a7a4a', '#1a3a22'], estruturas: 'pagodas', nevoa: 'rgba(200,255,220,0.2)' },
      descricao:
        'Uma Estrela de Cultivo coberta de florestas e picos de jade. Suas seitas guardam com ciúmes a Energia Mundial pura que brota das montanhas.',
      sistema: null,
      fases: [
        f('Picos Verdejantes', 'Discípulo das Montanhas Verdes'),
        f('Bosque de Bambu Estelar', 'Macaco das Montanhas Verdes', 'fera'),
        f('Riacho Celeste', 'Sapo Esmeralda', 'fera'),
        f('Portão da Seita', 'Guardião da Seita Verde'),
        f('Floresta Ancestral', 'Árvore Estelar Desperta', 'guardiao'),
        f('Vale das Ervas', 'Planta Devoradora Estelar', 'fera'),
        f('Caverna de Jade', 'Tigre de Jade Estelar', 'fera'),
        f('Pico da Névoa', 'Urso de Musgo Ancestral', 'fera'),
        f('Salão das Escrituras', 'Ancião das Montanhas Verdes'),
        f('Pavilhão da Espada', 'Espadachim das Montanhas Verdes'),
        f('Lago do Céu', 'Píton de Jade Celeste', 'fera'),
        f('Cume da Estrela', 'Mestre da Estrela das Montanhas Verdes'),
      ],
    },
    // ---------------------------------------------------------- MAPA 28
    {
      nome: 'Estrela Morta', icone: '🌑', cor: '#2a2228', reino: 13,
      cena: { ceu: ['#0a0a0a', '#3a2a30'], astro: '#8a6a7a', astroX: 200, estrelas: true, montanhas: ['#4a4448', '#2a2428', '#141014'], estruturas: 'ruinas', nevoa: 'rgba(200,80,120,0.15)' },
      descricao:
        'Uma Estrela de Cultivo cuja Fonte Estelar se apagou. Sem Energia Mundial, só restaram cinzas, ruínas e um culto demoníaco que se alimenta dos que chegam.',
      sistema: null,
      fases: [
        f('Planície Cinzenta', 'Carniçal da Estrela Morta', 'maligno'),
        f('Crateras Silenciosas', 'Escorpião das Cinzas', 'fera'),
        f('Cidade Abandonada', 'Cultivador Demoníaco Errante', 'maligno'),
        f('Templo Afundado', 'Discípulo do Culto da Estrela Morta'),
        f('Rio Seco', 'Verme de Cinza', 'fera'),
        f('Torres Rachadas', 'Gárgula de Pedra Morta', 'guardiao'),
        f('Campo de Ossos', 'Lobo Fantasma', 'fera'),
        f('Altar do Culto', 'Sacerdote da Estrela Morta', 'maligno'),
        f('Abismo Central', 'Espírito da Estrela Extinta', 'guardiao'),
        f('Salão do Culto', 'Executor do Culto'),
        f('Coração Apagado', 'Golem do Núcleo Morto', 'guardiao'),
        f('Trono das Cinzas', 'Patriarca do Culto da Estrela Morta', 'maligno'),
      ],
    },
    // ---------------------------------------------------------- MAPA 29
    {
      nome: 'Nebulosa das Bestas Estelares', icone: '🌠', cor: '#1a2a4a', reino: 13,
      cena: { ceu: ['#0a1030', '#3a5aa0'], astro: '#c0d8ff', astroX: 150, estrelas: true, montanhas: ['#4a5a9a', '#2a3a6a', '#141c3a'], estruturas: 'portal', nevoa: 'rgba(120,180,255,0.2)' },
      descricao:
        'Uma nebulosa azul onde as Bestas Estelares nascem, caçam e morrem. Nenhuma seita ousa construir aqui.',
      sistema: null,
      fases: [
        f('Nebulosa Azul', 'Filhote de Besta Estelar', 'fera'),
        f('Campo de Poeira Estelar', 'Águia Cósmica', 'fera'),
        f('Ninhos de Cristal', 'Inseto Estelar', 'fera'),
        f('Trilha das Bestas', 'Besta Estelar Caçadora', 'fera'),
        f('Recife Cósmico', 'Javali de Meteoro', 'fera'),
        f('Bosque de Cristal', 'Tigre Estelar', 'fera'),
        f('Lago de Luz Estelar', 'Serpente da Via Láctea', 'fera'),
        f('Rochedo das Bestas', 'Besta Estelar Blindada', 'fera'),
        f('Cemitério de Bestas', 'Espírito de Besta Estelar', 'guardiao'),
        f('Covil do Rei', 'Lobo das Estrelas', 'fera'),
        f('Trono das Bestas', 'Dragão da Nebulosa', 'fera'),
        f('Coração da Nebulosa', 'Rei das Bestas Estelares', 'fera'),
      ],
    },
    // ---------------------------------------------------------- MAPA 30
    {
      nome: 'Estrela Púrpura', icone: '🔮', cor: '#2a1a3a', reino: 13,
      cena: { ceu: ['#2a1a4a', '#c08ad0'], astro: '#ffd0f0', astroX: 240, montanhas: ['#8a6aa0', '#5a3a7a', '#2a1a3a'], estruturas: 'palacio', nevoa: 'rgba(200,140,255,0.2)' },
      descricao:
        'Uma das grandes Estrelas de Cultivo de Heng Luo. Seus mestres traíram o Campo Estelar e abriram as portas para os invasores da Grande Desolação.',
      sistema: null,
      fases: [
        f('Porto da Estrela Púrpura', 'Guarda da Estrela Púrpura'),
        f('Jardins Violeta', 'Fera Violeta', 'fera'),
        f('Cidade Púrpura', 'Espião da Estrela Púrpura'),
        f('Muralha Violeta', 'Capitão da Guarda Púrpura'),
        f('Floresta Ametista', 'Aranha Ametista', 'fera'),
        f('Torre dos Arcanos', 'Mago da Estrela Púrpura', 'maligno'),
        f('Fosso Real', 'Serpente Púrpura', 'fera'),
        f('Pátio do Palácio', 'Golem de Ametista', 'guardiao'),
        f('Salão do Conselho', 'Ancião Traidor'),
        f('Câmara da Origem', 'Guardião da Fonte Púrpura', 'guardiao'),
        f('Portão do Trono', 'General da Estrela Púrpura', 'maligno'),
        f('Trono Púrpura', 'Mestre da Estrela Púrpura'),
      ],
    },
    // ---------------------------------------------------------- MAPA 31
    {
      nome: 'Fonte Estelar', icone: '⭐', cor: '#4a3a10', reino: 14,
      cena: { ceu: ['#3a2a0a', '#ffd070'], astro: '#fff8d0', astroX: 160, montanhas: ['#c0903a', '#8a5a1a', '#3a2a0a'], estruturas: 'portal', nevoa: 'rgba(255,220,120,0.25)' },
      descricao:
        'O coração de uma Estrela de Cultivo. Quem refinar a Fonte Estelar se torna o Mestre da estrela — mas a própria estrela resiste.',
      sistema: null,
      fases: [
        f('Superfície Rachada', 'Espírito de Luz Estelar', 'guardiao'),
        f('Túneis de Magma', 'Salamandra Estelar', 'fera'),
        f('Veios de Energia', 'Golem de Veio Estelar', 'guardiao'),
        f('Câmara Externa', 'Sentinela da Fonte'),
        f('Rio de Luz', 'Enguia de Luz', 'fera'),
        f('Cristais Vivos', 'Cristal Estelar Desperto', 'guardiao'),
        f('Ninho Térmico', 'Fera de Fogo Estelar', 'fera'),
        f('Câmara do Núcleo', 'Guardião da Fonte Estelar', 'guardiao'),
        f('Memórias da Estrela', 'Eco de Antigo Mestre Estelar', 'guardiao'),
        f('Anel de Força', 'Besta da Fonte', 'fera'),
        f('Coração Pulsante', 'Vontade da Estrela', 'guardiao'),
        f('Fonte Estelar', 'Espírito Ancestral da Fonte Estelar', 'guardiao'),
      ],
    },
    // ---------------------------------------------------------- MAPA 32
    {
      nome: 'Rede de Formações Estelares', icone: '🔷', cor: '#1a2a3a', reino: 14,
      cena: { ceu: ['#0a1a2a', '#3a8ab0'], astro: '#c0f0ff', astroX: 100, estrelas: true, montanhas: ['#4a7a9a', '#2a4a6a', '#122234'], estruturas: 'portal', nevoa: 'rgba(110,216,255,0.2)' },
      descricao:
        'Formações espaciais que ligam as Estrelas de Cultivo de Heng Luo. Quem controla a rede controla o Campo Estelar — e todos querem controlá-la.',
      sistema: null,
      fases: [
        f('Plataforma de Teleporte', 'Sentinela da Formação'),
        f('Corredor Espacial', 'Fera Desviada pela Formação', 'fera'),
        f('Estação de Passagem', 'Contrabandista Estelar'),
        f('Nó da Formação', 'Mestre de Formações Rival'),
        f('Ponte de Runas', 'Marionete de Formação Estelar', 'guardiao'),
        f('Ilhas de Ligação', 'Águia do Vazio Estelar', 'fera'),
        f('Torre de Controle', 'Sabotador da Formação'),
        f('Formação Mestra', 'Golem de Runas Estelares', 'guardiao'),
        f('Fenda na Rede', 'Espírito Preso na Formação', 'guardiao'),
        f('Câmara das Coordenadas', 'Guardião das Coordenadas'),
        f('Coração da Rede', 'Dragão de Formação', 'fera'),
        f('Núcleo da Rede', 'Ancião das Formações Estelares'),
      ],
    },
    // ---------------------------------------------------------- MAPA 33
    {
      nome: 'Fronteira da Grande Desolação', icone: '🏴', cor: '#3a2a1a', reino: 14,
      cena: { ceu: ['#2a1a0a', '#a05a2a'], astro: '#ffb070', astroX: 230, estrelas: true, montanhas: ['#8a6a4a', '#5a3a22', '#2a1a0e'], estruturas: 'ruinas', nevoa: 'rgba(255,140,80,0.18)' },
      descricao:
        'O limite entre Heng Luo e o Campo Estelar da Grande Desolação, mais antigo e mais forte. Os batedores de Wu Heng já cruzaram a fronteira.',
      sistema: null,
      fases: [
        f('Limite do Campo Estelar', 'Batedor da Grande Desolação'),
        f('Estrelas Saqueadas', 'Saqueador da Grande Desolação'),
        f('Campo de Ruínas', 'Fera de Guerra Desolada', 'fera'),
        f('Posto Avançado', 'Tenente da Grande Desolação'),
        f('Deserto Estelar', 'Escorpião do Deserto Estelar', 'fera'),
        f('Acampamento Inimigo', 'Xamã da Grande Desolação', 'maligno'),
        f('Céu de Batalha', 'Águia de Guerra Desolada', 'fera'),
        f('Fortim da Fronteira', 'Comandante da Fronteira'),
        f('Campo dos Caídos', 'Espírito de Guerreiro Caído', 'guardiao'),
        f('Estandarte de Guerra', 'Porta-Estandarte da Desolação'),
        f('Portão da Fronteira', 'Golem de Guerra Desolado', 'guardiao'),
        f('Torre de Comando', 'Marechal da Fronteira Desolada', 'maligno'),
      ],
    },
    // ---------------------------------------------------------- MAPA 34
    {
      nome: 'Frota da Grande Desolação', icone: '⚔️', cor: '#3a1a10', reino: 14,
      cena: { ceu: ['#1a0a05', '#c0401a'], astro: '#ff9a50', astroX: 70, estrelas: true, montanhas: ['#7a3a2a', '#4a2014', '#200c08'], estruturas: 'palacio', nevoa: 'rgba(255,100,40,0.2)' },
      descricao:
        'A invasão começou. Naves de guerra e exércitos de cultivadores da Grande Desolação avançam estrela por estrela sobre Heng Luo.',
      sistema: null,
      fases: [
        f('Vanguarda da Frota', 'Soldado da Grande Desolação'),
        f('Céu em Chamas', 'Arqueiro de Artefatos'),
        f('Naves de Guerra', 'Fera de Montaria Desolada', 'fera'),
        f('Linha de Batalha', 'Capitão da Frota'),
        f('Cerco às Estrelas', 'Golem de Cerco', 'guardiao'),
        f('Esquadrão das Sombras', 'Assassino da Grande Desolação'),
        f('Barreira Rompida', 'Dragão de Guerra', 'fera'),
        f('Nau de Comando', 'Almirante da Frota Desolada'),
        f('Formação de Guerra', 'Marionete de Cerco', 'guardiao'),
        f('Ponte de Abordagem', 'Guarda de Elite de Wu Heng'),
        f('Convés Principal', 'General da Grande Desolação', 'maligno'),
        f('Ponte de Comando', 'Senhor da Guerra da Grande Desolação'),
      ],
    },
    // ---------------------------------------------------------- MAPA 35
    {
      nome: 'Estrelas Conquistadas', icone: '🏯', cor: '#3a2a10', reino: 14,
      cena: { ceu: ['#2a1a0a', '#e0a050'], astro: '#fff0c0', astroX: 180, montanhas: ['#a07a4a', '#6a4a2a', '#2a1a0e'], estruturas: 'cidade', nevoa: 'rgba(255,200,120,0.2)' },
      descricao:
        'A guerra virou. Heng Luo contra-ataca e invade as estrelas da Grande Desolação, libertando escravos e tomando as Fontes Estelares roubadas.',
      sistema: null,
      fases: [
        f('Estrela Ocupada', 'Coletor de Tributos'),
        f('Minas Escravas', 'Capataz da Grande Desolação'),
        f('Bosque Corrompido', 'Fera Escravizada', 'fera'),
        f('Prisão Estelar', 'Diretor da Prisão Estelar'),
        f('Templo Profanado', 'Sacerdote da Grande Desolação', 'maligno'),
        f('Pântano Estelar', 'Sapo Venenoso Estelar', 'fera'),
        f('Cidade Sitiada', 'Mercenário da Desolação'),
        f('Fortaleza Conquistada', 'Guardião da Fortaleza Desolada', 'guardiao'),
        f('Fonte Roubada', 'Espírito da Fonte Saqueada', 'guardiao'),
        f('Arsenal Estelar', 'Mestre Artífice da Desolação'),
        f('Palácio do Governador', 'Governador das Estrelas Conquistadas'),
        f('Altar da Anexação', 'Dragão Guardião da Grande Desolação', 'fera'),
      ],
    },
    // ---------------------------------------------------------- MAPA 36
    {
      nome: 'Trono do Campo Estelar', icone: '👑', cor: '#2a1a1a', reino: 14,
      cena: { ceu: ['#0a0505', '#6a1a1a'], astro: '#ffd36b', astroX: 160, estrelas: true, montanhas: ['#5a2a2a', '#3a1414', '#1a0808'], estruturas: 'palacio', nevoa: 'rgba(255,200,80,0.18)' },
      descricao:
        'O palácio de Wu Heng, Mestre do Campo Estelar da Grande Desolação. Quem vencer aqui decide o destino de dois Campos Estelares.',
      sistema: null,
      fases: [
        f('Céu da Grande Desolação', 'Guarda Real de Wu Heng'),
        f('Escadaria Estelar', 'Fera Guardiã do Trono', 'fera'),
        f('Salões Exteriores', 'Discípulo de Wu Heng'),
        f('Portão do Palácio', 'Comandante da Guarda Real'),
        f('Jardim Celeste', 'Serpente Imperial Estelar', 'fera'),
        f('Galeria dos Tesouros', 'Golem do Tesouro Imperial', 'guardiao'),
        f('Salão dos Ministros', 'Ministro da Grande Desolação'),
        f('Corredor do Trono', 'Lorde Protetor de Wu Heng', 'maligno'),
        f('Domínio de Wu Heng', 'Eco do Domínio Estelar', 'guardiao'),
        f('Câmara da Fonte', 'Dragão da Fonte da Desolação', 'fera'),
        f('Antessala do Trono', 'Sombra de Wu Heng'),
        f('Trono do Campo Estelar', 'Wu Heng, Mestre do Campo Estelar'),
      ],
    },
  ],

  // Mostrado ao vencer a última fase do mundo
  final: {
    titulo: 'Heng Luo tem um novo Mestre do Campo Estelar.',
    texto:
      'Wu Heng cai, e as estrelas da Grande Desolação se curvam. Os dois Campos Estelares ' +
      'passam a responder a um único nome.\n\n' +
      '"Até um Campo Estelar inteiro é só um grão de areia diante dos Mundos Superiores."\n\n' +
      '✨ MUNDO 4 LIBERADO: Estrela Sombria — Limite Estelar!\nA Fonte Estelar de Heng Luo aponta para uma estrela esquecida, muito além dos Campos Estelares.',
  },
};
