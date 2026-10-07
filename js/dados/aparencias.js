// =============================================================
// dados/aparencias.js — QUAL SPRITE CADA INIMIGO USA
// O nome à esquerda é o nome do inimigo (igual ao de mundo1.js).
// O nome à direita é o arquivo em img/inimigos/ (sem o ".png").
// Para trocar a aparência de um inimigo, é só mudar aqui.
// =============================================================

export const APARENCIAS = {
  // ---- Mapa 1: High Heaven Pavilion ----
  'Servo Arrogante': 'servo',
  'Discípulo em Teste': 'discipulo_externo',
  'Macaco Ladrão': 'macaco',
  'Valentão dos Alojamentos': 'valentao',          // revisão: é da seita → desenho de discípulo
  'Discípulo Externo': 'discipulo_externo',
  'Encarregado Corrupto': 'encarregado',           // revisão: é da seita → desenho de discípulo
  'Rival do Mesmo Ano': 'jovem_mestre',
  'Campeão dos Externos': 'campeao',
  'Guardião da Biblioteca': 'anciao',
  'Discípulo Interno': 'discipulo_interno',
  'Ancião Executor': 'anciao',
  'Discípulo Interno de Elite': 'discipulo_elite',

  // ---- Mapa 2: Montanhas ----
  'Lobo Cinzento': 'lobo',
  'Serpente Verde': 'serpente',
  'Javali de Presas de Ferro': 'javali',
  'Lobo Alfa': 'lobo_alfa',
  'Minerador Renegado': 'bandido',
  'Morcego Sanguinário': 'morcego',
  'Águia de Garras de Ferro': 'aguia',
  'Urso de Pele de Pedra': 'urso',
  'Caçador de Ervas Rival': 'cultivador',
  'Tigre de Listras Negras': 'tigre',
  'Píton Espiritual Ancestral': 'piton',
  'Fera Espiritual da Montanha': 'fera_montanha',

  // ---- Mapa 3: Cidades da Grande Dinastia Han ----
  'Bandido de Estrada': 'bandido',
  'Guarda Ganancioso': 'guarda',
  'Batedor de Carteiras': 'assassino',
  'Segurança do Leilão': 'soldado',
  'Cultivador Independente': 'cultivador',
  'Mercenário Bêbado': 'mercenario',
  'Lutador da Arena': 'campeao',
  'Chefe da Guarda Familiar': 'capitao',
  'Especialista Local': 'patriarca',
  'Servo Leal da Família': 'servo',
  'Ancião da Família': 'anciao',
  'Jovem Mestre da Família': 'jovem_mestre',

  // ---- Mapa 4: Caminho para a Capital Central ----
  'Saqueador de Caravanas': 'bandido',
  'Cobrador Imperial': 'soldado',
  'Escolta Mercenária': 'mercenario',
  'Líder dos Saqueadores': 'bandido',
  'Discípulo de Família Menor': 'discipulo_externo',
  'Grupo de Cultivadores': 'cultivador',
  'Soldado da Dinastia': 'soldado',
  'Capitão da Fortaleza': 'capitao',
  'Emissário de Grande Família': 'jovem_nobre',
  'Assassino Contratado': 'assassino',
  'Guardião do Portão': 'guarda',
  'Especialista das Grandes Famílias': 'patriarca',

  // ---- Mapa 5: Capital Central ----
  'Arruaceiro da Capital': 'bandido',
  'Comerciante Trapaceiro': 'mercenario',
  'Examinador da Associação': 'anciao',
  'Campeão da Arena': 'campeao',
  'Licitante Rival': 'jovem_nobre',
  'Guarda de Família Nobre': 'guarda',
  'Guarda do Palácio': 'soldado',
  'Protetor Ancestral': 'espirito_dourado',
  'Sentinela Oculta': 'assassino_sombra',
  'Jovem Prodígio da Capital': 'jovem_prodigio',
  'Ancião de uma Grande Família': 'patriarca',
  'Jovem Especialista das Oito Famílias': 'jovem_nobre',

  // ---- Mapa 6: Vale do Rei da Medicina ----
  'Discípulo Porteiro': 'discipulo_externo',
  'Fera Guardiã das Ervas': 'fera_ervas',
  'Ladrão de Ervas': 'assassino',
  'Planta Devoradora': 'planta',
  'Verme de Raiz Espiritual': 'verme',
  'Alquimista Aprendiz': 'alquimista',
  'Golem de Fornalha': 'golem_fornalha',
  'Serpente do Lago Medicinal': 'serpente_lago',
  'Mestre Alquimista': 'alquimista',
  'Experimento Fugitivo': 'experimento',
  'Ancião do Vale': 'anciao_vale',
  'Guardião do Vale': 'arvore',

  // ---- Mapa 7: Terras Selvagens ----
  'Aranha Gigante': 'aranha',
  'Crocodilo de Escamas de Ferro': 'crocodilo',
  'Bando de Hienas Espirituais': 'hiena',
  'Saqueador de Tumbas': 'bandido',
  'Sapo Venenoso Gigante': 'sapo',
  'Lobo Lunar': 'lobo_lunar',
  'Escorpião de Cristal': 'escorpiao',
  'Jovem Dragão de Inundação': 'dragao',
  'Eremita Enlouquecido': 'anciao',
  'Árvore Ancestral Desperta': 'arvore',
  'Rei Macaco de Ferro': 'rei_macaco',
  'Grande Monstro Espiritual': 'grande_monstro',

  // ---- Mapa 8: Terra Maligna das Nuvens Cinzentas ----
  'Bandido das Névoas': 'assassino_sombra',
  'Cultivador Maligno': 'maligno',
  'Fera Corrompida': 'fera_corrompida',
  'Assassino das Sombras': 'assassino_sombra',
  'Morcego Demoníaco': 'morcego_demonio',
  'Discípulo do Culto de Sangue': 'maligno_sangue',
  'Sacerdote Maligno': 'sacerdote',
  'Rei Maligno do Norte': 'rei_norte',             // revisão: cada rei com sua cor (azul-gelo)
  'Especialista Maligno': 'maligno',
  'Rei Maligno do Sul': 'rei_sul',                 // (vermelho-fogo)
  'Rei Maligno Supremo': 'rei_supremo',            // (preto e dourado)
  'Grande Líder da Terra Maligna': 'lider_maligno',

  // ---- Mapa 9: Guerra entre Forças ----
  'Batedor Maligno': 'assassino_sombra',
  'Soldado Maligno': 'soldado_maligno',
  'Onda de Invasores': 'soldado_maligno',
  'Comandante de Vanguarda': 'maligno',
  'Cultivador de Guerra': 'maligno',
  'Emboscador Maligno': 'assassino_sombra',
  'Esquadrão de Assalto': 'soldado_maligno',
  'Capitão das Hordas': 'general_maligno',
  'Especialista de Guerra': 'maligno_sangue',
  'Feiticeiro de Batalha': 'sacerdote',
  'Senhor da Guerra Maligno': 'general_maligno',   // revisão: mini-chefe com o desenho do guarda…
  'General das Forças Malignas': 'general_demonio', // …e o chefe com o desenho maior (rei demônio)

  // ---- Mapa 10: Misteriosos Pequenos Mundos ----
  'Fragmento Espacial Vivo': 'cristal',
  'Espírito Errante': 'espirito',
  'Besta de Pedra Antiga': 'besta_pedra',
  'Reflexo Sombrio': 'sombra',
  'Cadáver Guardião': 'cadaver',
  'Marionete de Formação': 'marionete',
  'Peixe Celestial': 'peixe_celestial',
  'Fera de Linhagem Antiga': 'fera_linhagem',
  'Remanescente de Alma': 'espirito_roxo',
  'Discípulo Ancestral': 'discipulo_interno',
  'Guardião da Formação': 'golem_pedra',
  'Guardião da Antiga Herança': 'guardiao_dourado',

  // ---- Mapa 11: O Segredo do Mundo ----
  'Sentinela de Pedra': 'golem_pedra',
  'Núcleo de Formação Desperto': 'cristal_dourado',
  'Fera do Vazio': 'fera_vazio',
  'Caçador Dimensional': 'assassino_sombra',
  'Eco de um Antigo Especialista': 'espirito_dourado',
  'Observador Celestial': 'cristal',
  'Devorador de Espaço': 'devorador',
  'Avatar de Especialista Antigo': 'anciao_supremo',
  'Explorador de Outro Mundo': 'jovem_mestre',
  'Guardião dos Segredos': 'espirito_roxo',
  'Sombra do Corredor': 'sombra',
  'Guardião do Corredor do Vazio': 'cristal_roxo',

  // ---- Mapa 12: Portal para o Reino Tong Xuan ----
  'Especialista Errante': 'cultivador',
  'Mestre de Seita Rival': 'patriarca',
  'Patriarca de Família': 'anciao',
  'Ancião Supremo do Pavilhão': 'anciao_supremo',
  'Rei Maligno Remanescente': 'rei_maligno',
  'Grande Ancião do Vale': 'anciao_vale',
  'Monarca das Feras': 'monarca_feras',
  'Protetor da Dinastia Han': 'capitao',
  'Formação Guardiã Desperta': 'golem_pedra',
  'Distorção Espacial': 'cristal_roxo',
  'Guardião do Corredor Espacial': 'guardiao_espacial', // revisão: cor própria (era igual ao chefe do Mapa 10)
  'Senhor do Portal Ancestral': 'cristal_portal',  // revisão: chefe final com cor própria (era igual a um comum)
};

// Se um inimigo novo não estiver na lista acima, usa um sprite conforme a forma
// Efeito do golpe de alguns inimigos (pela aparência). Os outros usam o padrão do tipo
// (humano = corte, fera = garras, maligno = magia roxa, guardião = magia azul).
// Revisão dos mapas: quem tem boca grande morde; o Cadáver golpeia em vez de soltar magia.
export const EFEITO_POR_APARENCIA = {
  serpente: 'mordida', piton: 'mordida', verme: 'mordida', serpente_lago: 'mordida',
  peixe_celestial: 'mordida', fera_vazio: 'mordida', sapo: 'mordida', planta: 'mordida',
  experimento: 'mordida', crocodilo: 'mordida', dragao: 'mordida', grande_monstro: 'mordida',
  devorador: 'mordida', aranha: 'mordida',
  cadaver: 'corte_inimigo',
};

export const APARENCIA_PADRAO = {
  humano: 'discipulo_externo',
  fera: 'lobo',
  maligno: 'maligno',
  guardiao: 'golem_pedra',
};
