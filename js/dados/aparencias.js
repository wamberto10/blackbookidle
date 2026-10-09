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
  'Lutador do Bando da Batalha Sangrenta': 'campeao',   // Bando da Batalha Sangrenta (família Hu, Martial Peak)
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

  // ---- Mapa 8: Terras do Vale do Rei Fantasma ----
  'Bandido das Névoas': 'assassino_sombra',
  'Cultivador Maligno': 'maligno',
  'Fera Corrompida': 'fera_corrompida',
  'Assassino das Sombras': 'assassino_sombra',
  'Morcego Demoníaco': 'morcego_demonio',
  'Discípulo do Vale do Rei Fantasma': 'maligno_sangue',
  'Sacerdote Maligno': 'sacerdote',
  'Rei Maligno do Norte': 'rei_norte',             // revisão: cada rei com sua cor (azul-gelo)
  'Especialista Maligno': 'maligno',
  'Rei Maligno do Sul': 'rei_sul',                 // (vermelho-fogo)
  'Rei Maligno Supremo': 'rei_supremo',            // (preto e dourado)
  'Mestre do Vale do Rei Fantasma': 'lider_maligno',

  // ---- Mapa 9: Guerra contra a Dinastia Tian Lang ----
  'Batedor de Tian Lang': 'assassino_sombra',
  'Soldado de Tian Lang': 'soldado_maligno',
  'Onda de Invasores': 'soldado_maligno',
  'Comandante de Vanguarda': 'maligno',
  'Cultivador de Guerra': 'maligno',
  'Emboscador Maligno': 'assassino_sombra',
  'Esquadrão de Assalto': 'soldado_maligno',
  'Capitão de Tian Lang': 'capitao',
  'Especialista de Guerra': 'maligno_sangue',
  'Feiticeiro de Batalha': 'sacerdote',
  'Senhor da Guerra de Tian Lang': 'capitao',      // mini-chefe: capitão da dinastia inimiga…
  'General da Dinastia Tian Lang': 'general_maligno', // …e o chefe com o desenho do general (v0.9.18: lore de Martial Peak)

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
  'Senhor Demônio': 'general_demonio',             // v0.9.18: o chefe final é o Senhor Demônio (fim do Mundo Inicial na novel)

  // =============================================================
  // MUNDO 2 — Reino Tong Xuan
  // =============================================================
  // ---- Mapa 13: Fronteira de Tong Xuan ----
  // ('Cultivador Independente' e 'Espírito Errante' já existem no Mundo 1 e usam o mesmo desenho)
  'Saqueador de Tong Xuan': 'saqueador_tx',
  'Lobo Sombrio': 'lobo_sombrio',
  'Mercenário Ganancioso': 'mercenario_tx',
  'Serpente de Jade': 'serpente_jade',
  'Águia Tempestuosa': 'aguia_tempestuosa',
  'Assassino de Aluguel': 'assassino_aluguel',
  'Urso de Ferro Negro': 'urso_ferro_negro',
  'Capitão da Patrulha': 'capitao_patrulha',
  'Mestre Independente': 'mestre_independente',
  'Homem do Caixão': 'homem_caixao',

  // ---- Mapa 14: Mundo Selado do Caixão ----
  'Servo Demoníaco': 'servo_demoniaco',
  'Fera Demoníaca Presa': 'fera_demoniaca_presa',
  'Serpente Corrosiva': 'serpente_corrosiva',
  'Guerreiro Demônio Antigo': 'guerreiro_demonio_antigo',
  'Morcego do Caixão': 'morcego_caixao',
  'Mercador Demônio': 'mercador_demonio',
  'Caçador Demônio Antigo': 'cacador_demonio_antigo',
  'Sacerdote da Linhagem': 'sacerdote_linhagem',
  'Rebelde de Li Rong': 'rebelde_li_rong',
  'Guardião do Selo': 'guardiao_selo',
  'General Demônio Antigo': 'general_demonio_antigo',
  'Líder dos Rebeldes Demoníacos': 'lider_rebeldes',

  // ---- Mapa 15: Associação dos Mestres de Pílulas ----
  'Guarda da Associação': 'guarda_associacao',
  'Aprendiz Arrogante': 'aprendiz_arrogante',
  'Planta Devoradora de Qi': 'planta_qi',
  'Comprador Violento': 'comprador_violento',
  'Fornalha Viva': 'fornalha_viva',
  'Fera das Ervas Raras': 'fera_ervas_tx',
  'Alquimista Rival': 'alquimista_rival',
  'Espírito da Chama': 'espirito_chama',
  'Mestre de Pílulas Invejoso': 'mestre_pilulas',
  'Guarda de Elite da Associação': 'guarda_elite_associacao',
  'Golem de Fornalha Celestial': 'golem_fornalha_celestial',
  'Grão-Mestre Alquimista Rival': 'grao_mestre_alquimista',

  // ---- Mapa 16: Seita do Céu Firmamento ----
  'Discípulo do Firmamento': 'discipulo_firmamento',
  'Discípulo Interno do Firmamento': 'discipulo_interno_firmamento',
  'Inseto Devorador de Alma': 'inseto_alma',
  'Enxame de Insetos': 'enxame_insetos',
  'Sapo das Cavernas': 'sapo_caverna',
  'Inseto Soldado': 'inseto_soldado',
  'Morcego das Profundezas': 'morcego_profundezas',
  'Aranha da Caverna': 'aranha_caverna',
  'Ancião da Seita Rival': 'anciao_rival',
  'Executor do Firmamento': 'executor_firmamento',
  'Rainha dos Insetos': 'rainha_insetos',
  'Líder da Seita Rival': 'lider_seita_rival',

  // ---- Mapa 17: Vazio Estelar ----
  'Fragmento de Meteoro': 'fragmento_meteoro',
  'Golem de Meteoro': 'golem_meteoro',
  'Fera Estelar': 'besta_estelar',
  'Espírito Estelar': 'espirito_estelar',
  'Marionete Abandonada': 'marionete_abandonada',
  'Fera Estelar Furiosa': 'besta_estelar_furiosa',
  'Escorpião de Cristal Lunar': 'escorpiao_lunar',
  'Dragão Estelar Jovem': 'dragao_estelar',
  'Planta do Vazio': 'planta_vazio',
  'Devorador do Vazio': 'devorador_vazio_tx',
  'Guardião da Flor': 'guardiao_flor',
  'Fera Ancestral do Vazio': 'fera_ancestral_vazio',

  // ---- Mapa 18: Seita do Gelo ----
  'Lobo da Neve': 'lobo_neve',
  'Discípula da Seita do Gelo': 'discipula_gelo',
  'Serpente de Gelo': 'serpente_gelo',
  'Guardiã de Gelo': 'guardia_gelo',
  'Golem de Gelo': 'golem_gelo',
  'Águia da Nevasca': 'aguia_nevasca',
  'Anciã do Gelo': 'ancia_gelo',
  'Urso Polar Ancestral': 'urso_polar',
  'Soldado de Osso Despertado': 'soldado_osso',
  'Espírito Congelado': 'espirito_congelado',
  'Batedor da Raça dos Ossos': 'batedor_osso',
  'Cadáver Ancestral da Raça dos Ossos': 'cadaver_ancestral_osso',

  // ---- Mapa 19: Ruínas dos Hegemons ----
  'Sentinela dos Hegemons': 'sentinela_hegemons',
  'Marionete de Pedra': 'marionete_pedra',
  'Árvore Corrompida': 'arvore_corrompida',
  'Assassino das Ruínas': 'assassino_ruinas',
  'Crocodilo das Ruínas': 'crocodilo_ruinas',
  'Espírito Antigo': 'espirito_antigo',
  'Guerreiro Hegemônico': 'guerreiro_hegemonico',
  'Guardião de Bronze': 'guardiao_bronze',
  'Cristal de Formação': 'cristal_formacao',
  'Fera Guardiã da Lótus': 'fera_lotus',
  'Senhor Hegemônico': 'senhor_hegemonico',
  'Guardião Ancestral das Ruínas': 'guardiao_ancestral_ruinas',

  // ---- Mapa 20: Clã Sun e a Árvore Divina ----
  'Guarda do Clã Sun': 'guarda_sun',
  'Jovem Mestre Sun': 'jovem_mestre_sun',
  'Fera Solar': 'fera_solar',
  'Capitão do Clã Sun': 'capitao_sun',
  'Sacerdote Solar': 'sacerdote_solar',
  'Serpente de Fogo': 'serpente_fogo',
  'Raiz Viva': 'raiz_viva',
  'Carcereiro Sun': 'carcereiro_sun',
  'Espírito da Árvore': 'espirito_arvore',
  'Ancião Sun': 'anciao_sun',
  'Árvore Divina Enfurecida': 'arvore_divina',
  'Patriarca do Clã Sun': 'patriarca_sun',

  // ---- Mapa 21: Território Demoníaco ----
  'Batedor Demônio': 'batedor_demonio',
  'Fera Demoníaca': 'fera_demoniaca',
  'Mercador de Escravos': 'mercador_escravos',
  'Guarda Demoníaco': 'guarda_demoniaco',
  'Gladiador Demônio': 'gladiador_demonio',
  'Fera da Arena': 'fera_arena',
  'Assassino Demônio': 'assassino_demonio',
  'Tenente Demoníaco': 'tenente_demoniaco',
  'Sacerdote Demoníaco': 'sacerdote_demoniaco',
  'General Demônio': 'general_demonio_tx',
  'Pai de Gou Che': 'pai_gou_che',
  'Comandante Demoníaco Xue Li': 'xue_li',

  // ---- Mapa 22: Terra Santa dos Nove Céus ----
  'Discípulo dos Nove Céus': 'discipulo_nove_ceus',
  'Guarda Sagrado': 'guarda_sagrado',
  'Fera Celestial': 'fera_celestial',
  'Candidato a Mestre Sagrado': 'candidato_mestre',
  'Cadáver de Santa': 'cadaver_santa',
  'Espírito Remanescente': 'espirito_remanescente',
  'Guardião da Tumba': 'guardiao_tumba',
  'Santa Cadáver Furiosa': 'santa_furiosa',
  'Espírito de Mestre Sagrado': 'espirito_mestre_sagrado',
  'Marionete de Formação Sagrada': 'marionete_sagrada',
  'Remanescente do Grande Deus Demônio': 'deus_demonio_remanescente',
  'Santa Cadáver Ancestral': 'santa_ancestral',

  // ---- Mapa 23: Terras da Raça Monstro ----
  'Batedor Monstro': 'batedor_monstro',
  'Guerreiro Monstro': 'guerreiro_monstro',
  'Crocodilo Monstro': 'crocodilo_monstro',
  'Chefe de Aldeia Monstro': 'chefe_aldeia_monstro',
  'Golem de Cristal': 'golem_cristal_azul',
  'Escorpião de Cristal Azul': 'escorpiao_cristal_azul',
  'Minerador Monstro': 'minerador_monstro',
  'Fera de Cristal': 'fera_cristal',
  'Xamã Monstro': 'xama_monstro',
  'General Monstro': 'general_monstro',
  'Senhor das Minas': 'senhor_minas',
  'Rei da Raça Monstro': 'rei_monstro',

  // ---- Mapa 24: Invasão da Raça dos Ossos ----
  'Soldado de Osso': 'soldado_osso',
  'Fera Esqueleto': 'fera_esqueleto',
  'Cultivador Possuído': 'cultivador_possuido',
  'Capitão de Osso': 'capitao_osso',
  'Dragão de Ossos': 'dragao_ossos',
  'Guerreiro Consumido': 'guerreiro_consumido',
  'Aranha de Osso': 'aranha_osso',
  'General de Osso': 'general_osso',
  'Eco do Grande Deus Demônio': 'eco_deus_demonio',
  'Campeão da Raça dos Ossos': 'campeao_osso',
  'Devorador de Almas de Osso': 'devorador_almas_osso',
  'Ke Luo, Senhor da Raça dos Ossos': 'ke_luo',
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
  // Mundo 2
  serpente_jade: 'mordida', serpente_corrosiva: 'mordida', planta_qi: 'mordida', sapo_caverna: 'mordida',
  inseto_alma: 'mordida', enxame_insetos: 'mordida', inseto_soldado: 'mordida', rainha_insetos: 'mordida',
  aranha_caverna: 'mordida', besta_estelar: 'mordida', besta_estelar_furiosa: 'mordida', devorador_vazio_tx: 'mordida',
  fera_ancestral_vazio: 'mordida', dragao_estelar: 'mordida', planta_vazio: 'mordida', serpente_gelo: 'mordida',
  crocodilo_ruinas: 'mordida', serpente_fogo: 'mordida', raiz_viva: 'mordida', crocodilo_monstro: 'mordida',
  dragao_ossos: 'mordida', aranha_osso: 'mordida',
};

export const APARENCIA_PADRAO = {
  humano: 'discipulo_externo',
  fera: 'lobo',
  maligno: 'maligno',
  guardiao: 'golem_pedra',
};
