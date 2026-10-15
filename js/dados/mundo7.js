// =============================================================
// dados/mundo7.js — MUNDO 7: O FORNO DO UNIVERSO (12 mapas × 12 fases)
//
// Mesmo formato dos outros mundos. No jogo, estes são os Mapas 73 a 84
// (fundos img/fundos/mapa73.jpg … mapa84.jpg). Libera ao vencer o chefe do
// Mapa 72 (A Tinta Primordial, fim do Campo de Batalha da Tinta).
// Lore: o arco final de Martial Peak antes da batalha contra Mo — o Forno do Universo (乾坤炉), que se abre
// de tempos em tempos e guarda as oportunidades de Criação e as Pílulas de Abrir o Céu supremas; o Reino
// Tai Xu (太墟境) e sua névoa, a Árvore do Mundo (世界树) e os Frutos do Mundo; e o Rio do Tempo (时间长河).
// Humanos e o Clã da Tinta disputam tudo isso.
//
//   reino 17 = Reino da Criação, primeira metade (Semente, Raiz e Tronco do Universo): inicioNoReino 0, fimNoReino 2.
//   A Copa do Universo (4º estágio) só abre com o chefe do Mapa 84 (reinos.js → mapaParaEstagio).
// =============================================================

const f = (local, inimigo, forma = 'humano') => ({ local, inimigo, forma });

// Mapas da Criação deste mundo: Semente, Raiz e Tronco do Universo
const CRIACAO_1 = { reino: 17, inicioNoReino: 0, fimNoReino: 2 };

export const MUNDO_FORNO_DO_UNIVERSO = {
  id: 'forno_universo',
  nome: 'O Forno do Universo — Criação',
  lema: '"O Forno não escolhe raça. Ele escolhe quem sai vivo dele."',
  descricao:
    'O Forno do Universo se abriu: dentro dele estão as oportunidades de Criação e as Pílulas de Abrir o Céu supremas. ' +
    'Humanos e o Clã da Tinta correm para dentro — e, além dele, esperam o Reino Tai Xu, a Árvore do Mundo e o Rio do Tempo.',
  imagemFundo: null,

  mapas: [
    // ---------------------------------------------------------- MAPA 73
    {
      nome: 'Entrada do Forno do Universo', icone: '🔥', cor: '#2a1a0a', ...CRIACAO_1,
      cena: { ceu: ['#0a0602', '#5a3a0a'], astro: '#ffd36b', astroX: 160, estrelas: true, montanhas: ['#6a4a1a', '#40280e', '#1c1006'], estruturas: 'portal', nevoa: 'rgba(255,200,90,0.18)' },
      descricao:
        'Uma rachadura de fogo dourado no vazio: a entrada do Forno do Universo. Exércitos humanos e da Tinta disputam cada passo até ela.',
      sistema: null,
      fases: [
        f('Fenda de Fogo Dourado', 'Batedor da Tinta no Forno'),
        f('Campo de Cinzas Douradas', 'Fera de Cinzas Douradas', 'fera'),
        f('Acampamento dos Ancestrais', 'Cultivador Ambicioso de 9ª Ordem'),
        f('Muralha de Chamas', 'Guardião da Entrada do Forno', 'guardiao'),
        f('Ponte de Brasas', 'Lagarto das Brasas Eternas', 'fera'),
        f('Portão Selado', 'Selo de Fogo Vivo', 'guardiao'),
        f('Corrida pela Entrada', 'Guerreiro de Elite do Clã no Forno'),
        f('Redemoinho de Chamas', 'Elemental das Chamas do Forno', 'guardiao'),
        f('Ruínas de Expedições', 'Eco de uma Expedição Perdida', 'guardiao'),
        f('Limiar do Forno', 'Senhor Real da Vanguarda'),
        f('Garganta do Forno', 'Dragão das Chamas do Forno', 'fera'),
        f('Entrada do Forno do Universo', 'Espírito Guardião do Forno', 'guardiao'),
      ],
    },
    // ---------------------------------------------------------- MAPA 74
    {
      nome: 'Mundo Dentro do Forno', icone: '⚱️', cor: '#3a2a0a', ...CRIACAO_1,
      cena: { ceu: ['#100a02', '#7a5a1a'], astro: '#ffe9a0', astroX: 220, estrelas: false, montanhas: ['#8a6a2a', '#5a4418', '#2a200a'], estruturas: 'ruinas', nevoa: 'rgba(255,220,130,0.18)' },
      descricao:
        'Dentro do Forno existe um mundo inteiro, forjado no fogo da Criação. Tudo aqui é antigo — e tudo aqui está vivo.',
      sistema: null,
      fases: [
        f('Planície Forjada', 'Fera Forjada no Forno', 'fera'),
        f('Rios de Metal Líquido', 'Serpente de Metal Líquido', 'fera'),
        f('Floresta de Bronze', 'Árvore de Bronze Viva', 'guardiao'),
        f('Bigorna Celeste', 'Golem da Bigorna Celeste', 'guardiao'),
        f('Vale dos Ecos de Fogo', 'Espírito das Chamas Antigas', 'guardiao'),
        f('Templo do Forno', 'Sacerdote do Forno'),
        f('Ninho de Fênix de Bronze', 'Fênix de Bronze', 'fera'),
        f('Mina de Essência da Criação', 'Cultivador Rival do Forno'),
        f('Torre das Formações do Forno', 'Formação Viva do Forno', 'guardiao'),
        f('Câmara do Martelo', 'Dragão Forjado', 'fera'),
        f('Coração Forjado', 'Guardião Forjado do Forno', 'guardiao'),
        f('Trono do Mundo Interior', 'Senhor do Mundo Interior do Forno'),
      ],
    },
    // ---------------------------------------------------------- MAPA 75
    {
      nome: 'Corredor das Chamas da Criação', icone: '🌋', cor: '#3a0a0a', ...CRIACAO_1,
      cena: { ceu: ['#100202', '#7a1a0a'], astro: '#ff8a3a', astroX: 100, estrelas: false, montanhas: ['#8a2a1a', '#5a1810', '#280a06'], estruturas: 'ruinas', nevoa: 'rgba(255,110,60,0.2)' },
      descricao:
        'O fogo que forjou os mundos ainda queima neste corredor. Quem atravessa sem uma base sólida vira cinza.',
      sistema: null,
      fases: [
        f('Boca do Corredor', 'Salamandra da Criação', 'fera'),
        f('Paredes Ardentes', 'Golem de Magma da Criação', 'guardiao'),
        f('Lago de Fogo', 'Serpente de Fogo da Criação', 'fera'),
        f('Pilares em Brasa', 'Espírito das Brasas', 'guardiao'),
        f('Ponte Derretida', 'Guerreiro da Tinta Queimado'),
        f('Câmara das Faíscas', 'Fênix das Faíscas Eternas', 'fera'),
        f('Corrente de Lava', 'Fera da Lava Primordial', 'fera'),
        f('Altar das Chamas', 'Guardiã das Chamas da Criação'),
        f('Tempestade de Fogo', 'Elemental da Tempestade de Fogo', 'guardiao'),
        f('Muralha de Calor', 'Ancião Queimado pela Criação'),
        f('Coração das Chamas', 'Fênix Ancestral da Criação', 'fera'),
        f('Fim do Corredor', 'Chama Viva da Criação', 'guardiao'),
      ],
    },
    // ---------------------------------------------------------- MAPA 76
    {
      nome: 'Mar de Nuvens de Pílula', icone: '☁️', cor: '#2a2a3a', ...CRIACAO_1,
      cena: { ceu: ['#0a0a12', '#6a6a8a'], astro: '#fff0c0', astroX: 180, estrelas: false, montanhas: ['#7a7a9a', '#4e4e6a', '#242436'], estruturas: 'palacio', nevoa: 'rgba(240,240,255,0.22)' },
      descricao:
        'Nuvens perfumadas onde as pílulas se condensam sozinhas. Feras antigas guardam cada uma — e os competidores não pedem licença.',
      sistema: null,
      fases: [
        f('Borda das Nuvens', 'Grou das Nuvens de Pílula', 'fera'),
        f('Nuvem Dourada', 'Fera Guardiã de Pílulas', 'fera'),
        f('Ilhas Perfumadas', 'Alquimista Rival das Nuvens'),
        f('Chuva de Pílulas', 'Elemental de Essência', 'guardiao'),
        f('Nuvem Carmesim', 'Qilin das Nuvens', 'fera'),
        f('Palácio Flutuante', 'Guardião do Palácio de Nuvens', 'guardiao'),
        f('Nuvem Roxa', 'Ladrão de Pílulas da Tinta'),
        f('Jardim de Ervas Celestes', 'Erva Ancestral Desperta', 'fera'),
        f('Torre dos Alquimistas Antigos', 'Eco de um Grande Alquimista', 'guardiao'),
        f('Nuvem Negra', 'Feiticeiro da Tinta das Nuvens'),
        f('Coração das Nuvens', 'Tartaruga das Nuvens Ancestral', 'fera'),
        f('Trono das Nuvens', 'Senhor das Nuvens de Pílula'),
      ],
    },
    // ---------------------------------------------------------- MAPA 77
    {
      nome: 'Altar das Pílulas de Abrir o Céu', icone: '💊', cor: '#3a3a1a', ...CRIACAO_1,
      cena: { ceu: ['#0a0a04', '#7a7a2a'], astro: '#ffffff', astroX: 160, estrelas: true, montanhas: ['#8a8a3a', '#5a5a24', '#28280e'], estruturas: 'palacio', nevoa: 'rgba(255,255,180,0.2)' },
      descricao:
        'O lugar onde nascem as Pílulas de Abrir o Céu de qualidade suprema. Uma só delas muda o destino de um cultivador — e todos sabem disso.',
      sistema: null,
      fases: [
        f('Escadaria do Altar', 'Sentinela do Altar das Pílulas'),
        f('Pátio das Provas', 'Prodígio dos Três Mil Mundos'),
        f('Fonte das Pílulas', 'Serpente Guardiã da Fonte', 'fera'),
        f('Salão dos Competidores', 'Herdeira de uma Caverna Celestial'),
        f('Câmara das Provas de Fogo', 'Golem das Provas', 'guardiao'),
        f('Galeria das Pílulas Lendárias', 'Espírito de uma Pílula Lendária', 'guardiao'),
        f('Ponte dos Ancestrais', 'Ancestral Ganancioso'),
        f('Câmara das Feras', 'Fera Guardiã do Altar', 'fera'),
        f('Corredor da Traição', 'Traidor da Aliança no Altar'),
        f('Altar Menor', 'Senhor Real Invasor do Altar'),
        f('Altar Maior', 'Guardião das Pílulas Supremas', 'guardiao'),
        f('Pílula Suprema', 'Espírito da Pílula de Abrir o Céu Suprema', 'guardiao'),
      ],
    },
    // ---------------------------------------------------------- MAPA 78
    {
      nome: 'Névoa de Tai Xu', icone: '🌫️', cor: '#2a2a2a', ...CRIACAO_1,
      cena: { ceu: ['#0a0a0a', '#5a5a5a'], astro: '#d0d0d0', astroX: 140, estrelas: false, montanhas: ['#6a6a6a', '#444444', '#202020'], estruturas: 'pinheiros', nevoa: 'rgba(220,220,220,0.32)' },
      descricao:
        'A névoa que cerca o Reino Tai Xu apaga o cultivo de quem entra sem permissão. Muitos ancestrais se perderam nela para sempre.',
      sistema: null,
      fases: [
        f('Borda da Névoa', 'Fera da Névoa de Tai Xu', 'fera'),
        f('Trilha Perdida', 'Cultivador Perdido na Névoa'),
        f('Floresta Branca', 'Árvore da Névoa', 'guardiao'),
        f('Lago Cinzento', 'Serpente Cinzenta da Névoa', 'fera'),
        f('Ossada na Névoa', 'Restos de um Ancestral Perdido', 'guardiao'),
        f('Eco Sem Rosto', 'Espírito Sem Rosto da Névoa', 'guardiao'),
        f('Ninho das Aranhas Brancas', 'Aranha Branca de Tai Xu', 'fera'),
        f('Pedras Falantes', 'Golem das Pedras Falantes', 'guardiao'),
        f('Clareira Enganosa', 'Ilusão da Névoa'),
        f('Muralha de Névoa', 'Guerreiro da Tinta Cego pela Névoa'),
        f('Olho da Névoa', 'Grande Fera da Névoa', 'fera'),
        f('Portão de Tai Xu', 'Guardião do Portão de Tai Xu', 'guardiao'),
      ],
    },
    // ---------------------------------------------------------- MAPA 79
    {
      nome: 'Reino Tai Xu', icone: '🏞️', cor: '#1a2a2a', ...CRIACAO_1,
      cena: { ceu: ['#061010', '#3a6a6a'], astro: '#e0fff8', astroX: 200, estrelas: false, montanhas: ['#4a7a7a', '#2c4a4a', '#122222'], estruturas: 'arvores', nevoa: 'rgba(200,255,245,0.18)' },
      descricao:
        'O antigo Reino Tai Xu, intocado desde o começo dos tempos. Seus guardiões só obedecem à Árvore do Mundo.',
      sistema: null,
      fases: [
        f('Campos de Tai Xu', 'Cervo Ancestral de Tai Xu', 'fera'),
        f('Rio de Jade', 'Serpente de Jade de Tai Xu', 'fera'),
        f('Bosque Antigo', 'Guardião do Bosque de Tai Xu', 'guardiao'),
        f('Penhascos de Cristal', 'Grou de Cristal', 'fera'),
        f('Ruínas Primordiais', 'Eco Primordial de Tai Xu', 'guardiao'),
        f('Planalto dos Gigantes', 'Gigante de Pedra de Tai Xu', 'guardiao'),
        f('Lago do Espelho', 'Reflexo de Tai Xu'),
        f('Vale das Feras Sagradas', 'Qilin de Tai Xu', 'fera'),
        f('Torre do Vigia', 'Vigia Eterno de Tai Xu', 'guardiao'),
        f('Floresta das Raízes', 'Raiz Guardiã da Árvore do Mundo', 'guardiao'),
        f('Altar de Tai Xu', 'Senhor Real Perdido em Tai Xu'),
        f('Centro de Tai Xu', 'Espírito do Reino Tai Xu', 'guardiao'),
      ],
    },
    // ---------------------------------------------------------- MAPA 80
    {
      nome: 'Raízes da Árvore do Mundo', icone: '🌳', cor: '#1a2a0a', ...CRIACAO_1,
      cena: { ceu: ['#060a02', '#3a5a1a'], astro: '#f0ffb0', astroX: 120, estrelas: false, montanhas: ['#4a6a2a', '#2c421a', '#14200a'], estruturas: 'arvores', nevoa: 'rgba(220,255,170,0.18)' },
      descricao:
        'As raízes da Árvore do Mundo atravessam todos os mundos. Lá embaixo, entre elas, a Tinta tenta envenenar a própria origem da vida.',
      sistema: null,
      fases: [
        f('Raízes Superficiais', 'Verme das Raízes', 'fera'),
        f('Túneis de Seiva', 'Elemental de Seiva', 'guardiao'),
        f('Câmara das Sementes', 'Guardiã das Sementes do Mundo'),
        f('Raiz Envenenada', 'Raiz Corrompida pela Tinta', 'guardiao'),
        f('Lago de Seiva Dourada', 'Tartaruga das Raízes', 'fera'),
        f('Ninho de Insetos', 'Inseto Devorador de Raízes', 'fera'),
        f('Raiz Principal', 'Golem de Raízes', 'guardiao'),
        f('Câmara Infiltrada', 'Sabotador da Tinta'),
        f('Coração da Raiz', 'Fera das Profundezas da Raiz', 'fera'),
        f('Fonte da Vida', 'Espírito da Fonte da Vida', 'guardiao'),
        f('Raiz Mestra', 'Senhor Real Envenenador'),
        f('Base da Árvore do Mundo', 'Guardião das Raízes do Mundo', 'guardiao'),
      ],
    },
    // ---------------------------------------------------------- MAPA 81
    {
      nome: 'Copa da Árvore do Mundo', icone: '🍎', cor: '#2a3a0a', ...CRIACAO_1,
      cena: { ceu: ['#0a1004', '#6a8a2a'], astro: '#fff6c0', astroX: 220, estrelas: false, montanhas: ['#7a9a3a', '#4e6624', '#22300e'], estruturas: 'arvores', nevoa: 'rgba(240,255,190,0.2)' },
      descricao:
        'No alto da Árvore do Mundo amadurecem os Frutos do Mundo. Cada um carrega a força de um mundo inteiro.',
      sistema: null,
      fases: [
        f('Galhos Inferiores', 'Macaco da Árvore do Mundo', 'fera'),
        f('Ninhos dos Galhos', 'Águia da Copa', 'fera'),
        f('Folhas Douradas', 'Espírito das Folhas Douradas', 'guardiao'),
        f('Galho Partido', 'Cultivador Caído da Copa'),
        f('Flores do Mundo', 'Fênix das Flores do Mundo', 'fera'),
        f('Pomar dos Frutos', 'Fera Guardiã dos Frutos do Mundo', 'fera'),
        f('Galho dos Ancestrais', 'Ancestral Guardião da Copa'),
        f('Fruto Verde', 'Fruto Desperto', 'guardiao'),
        f('Galho Corrompido', 'Guerreiro da Tinta na Copa'),
        f('Topo da Copa', 'Dragão da Copa do Mundo', 'fera'),
        f('Fruto Maduro', 'Guardiã do Fruto do Mundo'),
        f('Coroa da Árvore', 'Vontade da Árvore do Mundo', 'guardiao'),
      ],
    },
    // ---------------------------------------------------------- MAPA 82
    {
      nome: 'Margem do Rio do Tempo', icone: '⏳', cor: '#1a1a2a', ...CRIACAO_1,
      cena: { ceu: ['#04040a', '#2a2a5a'], astro: '#c0d0ff', astroX: 160, estrelas: true, montanhas: ['#3a3a6a', '#222244', '#0e0e20'], estruturas: 'portal', nevoa: 'rgba(170,190,255,0.2)' },
      descricao:
        'O Rio do Tempo corre por todas as eras. Em sua margem, ecos do passado e do futuro andam como se fossem reais.',
      sistema: null,
      fases: [
        f('Areia das Eras', 'Eco de uma Era Esquecida', 'guardiao'),
        f('Barco Abandonado', 'Barqueiro do Tempo'),
        f('Águas Lentas', 'Serpente das Águas do Tempo', 'fera'),
        f('Ruínas do Futuro', 'Guerreiro do Futuro'),
        f('Ponte das Eras', 'Guardião da Ponte das Eras', 'guardiao'),
        f('Remanso do Passado', 'Fera Extinta Ressurgida', 'fera'),
        f('Espelho das Eras', 'Seu Eco do Passado'),
        f('Cachoeira do Tempo', 'Elemental do Tempo', 'guardiao'),
        f('Templo das Eras', 'Guardiã das Eras'),
        f('Redemoinho do Tempo', 'Devorador de Eras', 'fera'),
        f('Margem Distante', 'Antigo Ancestral do Passado'),
        f('Nascente do Rio', 'Guardião do Rio do Tempo', 'guardiao'),
      ],
    },
    // ---------------------------------------------------------- MAPA 83
    {
      nome: 'Correnteza do Rio do Tempo', icone: '🌀', cor: '#0a1a2a', ...CRIACAO_1,
      cena: { ceu: ['#02060a', '#1a3a5a'], astro: '#e0f0ff', astroX: 90, estrelas: true, montanhas: ['#2a4a6a', '#182c40', '#0a141e'], estruturas: 'portal', nevoa: 'rgba(160,210,255,0.22)' },
      descricao:
        'No meio da correnteza o tempo se parte: passado, presente e futuro lutam ao mesmo tempo. Um passo errado e você nunca existiu.',
      sistema: null,
      fases: [
        f('Corredeira das Eras', 'Fera das Corredeiras do Tempo', 'fera'),
        f('Ilha do Presente', 'Sentinela do Presente', 'guardiao'),
        f('Fenda do Futuro', 'Senhor Real do Futuro'),
        f('Redemoinho do Passado', 'Imperador do Passado'),
        f('Cascata Partida', 'Dragão do Tempo', 'fera'),
        f('Ilha dos Paradoxos', 'Paradoxo Vivo', 'guardiao'),
        f('Correnteza Negra', 'Tinta no Rio do Tempo', 'guardiao'),
        f('Encontro das Eras', 'Seu Eco do Futuro'),
        f('Olho do Tempo', 'Guardião do Olho do Tempo', 'guardiao'),
        f('Queda do Tempo', 'Fênix do Tempo', 'fera'),
        f('Fim da Correnteza', 'Senhor Real Viajante do Tempo'),
        f('Coração do Rio do Tempo', 'Vontade do Rio do Tempo', 'guardiao'),
      ],
    },
    // ---------------------------------------------------------- MAPA 84
    {
      nome: 'Coração do Forno do Universo', icone: '☀️', cor: '#3a2a0a', ...CRIACAO_1,
      cena: { ceu: ['#0a0602', '#8a5a0a'], astro: '#ffffff', astroX: 160, estrelas: true, montanhas: ['#9a6a1a', '#62440e', '#2a1c06'], estruturas: 'portal', nevoa: 'rgba(255,230,140,0.24)' },
      descricao:
        'No centro do Forno queima a fonte da Criação. Quem a dominar alcança a Copa do Universo — e o caminho para a origem da Tinta.',
      sistema: null,
      fases: [
        f('Anel Exterior do Coração', 'Guardião do Anel Exterior', 'guardiao'),
        f('Chamas Brancas', 'Elemental das Chamas Brancas', 'guardiao'),
        f('Câmara dos Competidores', 'Último Rival dos Três Mil Mundos'),
        f('Câmara do Clã da Tinta', 'Senhor Real da Tinta no Coração'),
        f('Anel Interior do Coração', 'Golem do Anel Interior', 'guardiao'),
        f('Fonte da Criação', 'Fera da Fonte da Criação', 'fera'),
        f('Câmara dos Ecos da Criação', 'Eco do Criador do Forno', 'guardiao'),
        f('Altar da Criação', 'Fênix da Criação Eterna', 'fera'),
        f('Prova da Semente', 'Guardiã da Semente do Universo'),
        f('Prova da Raiz', 'Dragão Primordial do Forno', 'fera'),
        f('Prova do Tronco', 'Espírito do Coração do Forno', 'guardiao'),
        f('Coração do Forno do Universo', 'Vontade do Forno do Universo', 'guardiao'),
      ],
    },
  ],

  // Mostrado ao vencer a última fase do mundo
  final: {
    titulo: 'O Forno do Universo reconhece você.',
    texto:
      'A Vontade do Forno se curva. Com a fonte da Criação dentro do seu Pequeno Universo, a Copa do Universo está ao ' +
      'seu alcance — e se abre o caminho para dentro da Grande Restrição do Céu Inicial: o Mundo Primordial, onde a ' +
      'origem da Tinta se escondeu depois de recuar.\n\n' +
      '"Para vencer o que existe desde antes dos mundos, primeiro você vai precisar esquecer quem é."\n\n' +
      '✨ MUNDO 8 LIBERADO: Mundo Primordial — Batalha Final!\nDentro da Grande Restrição, um selo prende o cultivo de todos no Elemento Verdadeiro.',
  },
};
