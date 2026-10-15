// =============================================================
// dados/reinos.js — TODO O SISTEMA DE PODER DO JOGO
// Aqui ficam regiões, reinos e estágios. Para mudar nomes,
// descrições ou cores, mexa só neste arquivo.
// =============================================================

// ---- Ajudantes para gerar nomes de estágios ----
// estagios(9)  → ['1º Estágio', '2º Estágio', ... '9º Estágio']
const estagios = (qtd) => Array.from({ length: qtd }, (_, i) => `${i + 1}º Estágio`);
const INICIAL_INTER_PICO = ['Inicial', 'Intermediário', 'Pico'];

// ---- Regiões (cada uma tem uma cor de aura) ----
// v0.25.0 (dono): nomes de degraus do cultivo. Antes eram lugares (Campo Estelar, Limite Estelar...),
// que não batiam com o mundo onde o jogador cultiva cada reino.
export const REGIOES = [
  { nome: 'Caminho Marcial',         corAura: '#6fcf8a' },
  { nome: 'Caminho dos Santos',      corAura: '#6f9fff' },
  { nome: 'Caminho dos Imperadores', corAura: '#b77bff' },
  { nome: 'Céu Aberto',              corAura: '#ffd36b' },
  { nome: 'Criação',                 corAura: '#fff6e0' },   // v0.25.0: Reino da Criação
];

// ---- Reinos, em ordem de progressão ----
//   regiao       → índice na lista REGIOES acima (0 = Região 1)
//   estagios     → nomes dos estágios do reino
//   descricao    → texto mostrado na aba Cultivo
//   desbloqueio  → mensagem ao romper para este reino
//   marcos       → mensagens especiais ao chegar em um estágio
//                  (a chave é o índice: 0 = 1º estágio, 3 = 4º estágio)
//   corManto     → cor da roupa do personagem neste reino
//   mapaParaRomper → para SAIR deste reino, é preciso vencer o chefe
//                  deste mapa (Mundo 1 = Mapas 1–12, Mundo 2 = Mapas 13–24;
//                  um mapa que ainda não existe trava o reino até o próximo mundo)
export const REINOS = [
  // ===================== REGIÃO 1 =====================
  {
    id: 'corpo_temperado', nome: 'Corpo Temperado', regiao: 0,
    estagios: estagios(9), corManto: '#6b5b4b',
    descricao: 'Fortalecimento físico. O corpo é temperado como aço para suportar o cultivo.',
    desbloqueio: 'Sua jornada começa.',
    marcos: {
      3: 'Você passou a perceber a Energia Mundial ao seu redor!',
      4: '⚔️ Combate, Mapa e Mochila liberados!',
    },
    mapaParaRomper: 1,
  },
  {
    id: 'elemento_inicial', nome: 'Elemento Inicial', regiao: 0,
    estagios: estagios(9), corManto: '#4b6b5b',
    descricao: 'Absorção e armazenamento de Yuan Qi no Dantian.',
    desbloqueio: 'Seu Dantian desperta e passa a armazenar Yuan Qi. 📕 Black Book liberado!',
    mapaParaRomper: 2,
  },
  {
    id: 'transformacao_qi', nome: 'Transformação do Qi', regiao: 0,
    estagios: estagios(9), corManto: '#3f6f7f',
    descricao: 'Liberação externa de Yuan Qi. O primeiro Batismo Mundial acontece.',
    desbloqueio: 'Você recebeu seu primeiro Batismo Mundial!',
    mapaParaRomper: 4,
  },
  {
    id: 'separacao_reuniao', nome: 'Separação e Reunião', regiao: 0,
    estagios: estagios(9), corManto: '#5b4b7b',
    descricao: 'Equilíbrio mental. Existe risco de desvio de cultivo.',
    desbloqueio: 'Sua mente precisa de equilíbrio: cuidado com o desvio de cultivo.',
    mapaParaRomper: 6,
  },
  {
    id: 'elemento_verdadeiro', nome: 'Elemento Verdadeiro', regiao: 0,
    estagios: estagios(9), corManto: '#2f5f9f',
    descricao: 'Purificação do Yuan Qi em Qi Verdadeiro. Técnicas complexas e voo.',
    desbloqueio: 'Seu Qi foi purificado em Qi Verdadeiro. Agora você pode voar!',
    mapaParaRomper: 8,
  },
  {
    id: 'ascensao_imortal', nome: 'Ascensão Imortal', regiao: 0,
    estagios: estagios(9), corManto: '#7f2f4f', liberaSentidoDivino: true,
    descricao: 'Abertura do Mar do Conhecimento, Sentido Divino e ataques de alma.',
    desbloqueio: 'Seu Mar do Conhecimento se abriu. Sentido Divino desbloqueado!',
    mapaParaRomper: 10,
  },
  {
    id: 'transcendente', nome: 'Transcendente', regiao: 0,
    estagios: INICIAL_INTER_PICO, corManto: '#9f7f2f',
    descricao: 'O limite mortal é superado e a longevidade é ampliada.',
    desbloqueio: 'Você superou o limite mortal.',
    mapaParaRomper: 12,
  },
  {
    id: 'santo', nome: 'Santo', regiao: 0,
    estagios: INICIAL_INTER_PICO, corManto: '#d0d0d0',
    descricao: 'Qi Santo e um corpo capaz de sobreviver no vazio entre os mundos.',
    desbloqueio: 'Seu Qi se tornou Qi Santo. Um mundo muito maior aguarda do outro lado do portal.',
    mapaParaRomper: 14,
  },

  // ===================== REGIÃO 2 =====================
  {
    id: 'rei_santo', nome: 'Rei Santo', regiao: 1,
    estagios: estagios(3), corManto: '#3f5fbf',
    descricao: 'Compreensão das leis naturais.',
    desbloqueio: 'Seu Qi Santo se aprofunda: você começa a compreender as leis naturais.',
    mapaParaRomper: 16,
  },
  {
    id: 'retorno_origem', nome: 'Retorno à Origem', regiao: 1,
    estagios: estagios(3), corManto: '#2f7fbf',
    descricao: 'Formação do Shi, um domínio capaz de suprimir adversários.',
    desbloqueio: 'Seu Shi começa a se formar.',
    mapaParaRomper: 18,
  },
  {
    id: 'rei_origem', nome: 'Rei da Origem', regiao: 1,
    estagios: estagios(3), corManto: '#1f4f8f',
    descricao: 'Domínio dos princípios espaciais. Possibilidade de se tornar Mestre Estelar ao refinar a Fonte de uma Estrela de Cultivo.',
    desbloqueio: 'Os princípios espaciais se curvam a você.',
    mapaParaRomper: 20,
  },

  // ===================== REGIÃO 3 =====================
  {
    id: 'origem_dao', nome: 'Origem do Dao', regiao: 2,
    estagios: estagios(3), corManto: '#6f3f9f',
    descricao: 'Conversão do Qi Santo em Qi da Origem e uso dos Princípios do Mundo.',
    desbloqueio: 'Seu Qi Santo se converteu em Qi da Origem.',
    mapaParaRomper: 22,
  },
  {
    id: 'imperador', nome: 'Imperador', regiao: 2,
    estagios: ['1ª Ordem', '2ª Ordem', '3ª Ordem', 'Pico'], corManto: '#8f2f2f',
    descricao: 'O Qi da Origem se condensa em Qi Imperial. Na maioria dos mundos, um Imperador já está no topo.',
    desbloqueio: 'Você se tornou um Imperador. Seu Qi agora é Qi Imperial.',
    mapaParaRomper: 24,
  },
  // v0.17.0 (dono, conferido com a lore): Imperador → Pseudo-Grande Imperador → Grande Imperador →
  // Meio-Passo do Céu Aberto → Céu Aberto. (Antes o Grande Imperador vinha antes do Pseudo, e o
  // "Pseudo-Grande Imperador / Meio-Aberto" misturava duas coisas.) O Pseudo-Grande Imperador tem
  // 1 estágio, como o Grande Imperador tinha nesta posição: o balanceamento até o Mundo 2 não muda.
  {
    id: 'pseudo_grande_imperador', nome: 'Pseudo-Grande Imperador', regiao: 2,
    // v0.18.0: 6 estágios (o Mundo 3 tem 6 mapas neste reino; com 1 estágio o cultivo não tinha onde ser gasto)
    estagios: ['1ª Fissura do Gargalo', '2ª Fissura do Gargalo', '3ª Fissura do Gargalo', '4ª Fissura do Gargalo', '5ª Fissura do Gargalo', 'Gargalo Rompido'], corManto: '#7f6f3f',
    descricao: 'Além da 3ª Ordem de Imperador. O Caminho Celestial do seu mundo ainda não reconhece você: é o gargalo antes de se tornar Grande Imperador.',
    desbloqueio: 'Você se tornou um Pseudo-Grande Imperador. O Caminho Celestial ainda não o reconhece.',
    mapaParaRomper: 30,
  },
  {
    id: 'grande_imperador', nome: 'Grande Imperador', regiao: 2,
    // v0.18.0: 6 estágios (6 mapas do Mundo 3 neste reino)
    estagios: ['Reconhecimento do Mundo', 'Selo do Dao — 1ª Camada', 'Selo do Dao — 2ª Camada', 'Selo do Dao — 3ª Camada', 'Selo do Dao — 4ª Camada', 'Selo do Dao Completo'], corManto: '#bf9f2f',
    descricao: 'Reconhecido pela Vontade do Mundo, você condensa o Selo do Dao.',
    desbloqueio: 'O mundo reconhece sua existência. Você condensou o Selo do Dao.',
    mapaParaRomper: 36,
  },
  {
    id: 'meio_ceu_aberto', nome: 'Meio-Passo do Céu Aberto', regiao: 2,
    estagios: ['1 Elemento', '2 Elementos', '3 Elementos', '4 Elementos', '5 Elementos'], corManto: '#5f5f5f',
    descricao: 'Ainda um Grande Imperador: você condensa no Selo do Dao, um a um, os Cinco Elementos (Ouro, Madeira, Água, Fogo e Terra). Quando o Yin e o Yang se unirem a eles, o céu se abre.',
    desbloqueio: 'Você começa a condensar os Cinco Elementos no Selo do Dao.',
    mapaParaRomper: 42,
  },

  // ===================== REGIÃO 4 =====================
  {
    id: 'ceu_aberto', nome: 'Reino do Céu Aberto', regiao: 3,
    estagios: [
      '1ª Ordem (Baixo Rank)', '2ª Ordem (Baixo Rank)', '3ª Ordem (Baixo Rank)',
      '4ª Ordem (Médio Rank)', '5ª Ordem (Médio Rank)', '6ª Ordem (Médio Rank)',
      '7ª Ordem (Alto Rank)',  '8ª Ordem (Alto Rank)',  '9ª Ordem (Alto Rank)',
    ],
    corManto: '#f0e0a0',
    descricao: 'Os sete elementos condensados no Selo do Dao criam um Pequeno Universo interno que gera Força do Mundo.',
    desbloqueio: 'O Yin e o Yang se uniram aos Cinco Elementos: seu Pequeno Universo nasceu!',
    // v0.22.0: o Céu Aberto atravessa três mundos (Baixo, Médio e Alto Rank). Cada faixa só abre depois do
    // chefe do último mapa da anterior: 4ª Ordem → Mapa 48 (fim do Mundo 4); 7ª Ordem → Mapa 60 (Mundo 5).
    mapaParaEstagio: { 3: 48, 6: 60 },
    // v0.25.0: o rompimento para o Reino da Criação exige vencer A Tinta Primordial (Mapa 72, fim do Mundo 6)
    mapaParaRomper: 72,
    marcos: {
      3: 'Seu Pequeno Universo ganhou estabilidade física.',
      6: 'Seu Pequeno Universo se materializou e pode abrigar seres vivos.',
    },
  },

  // ===================== REGIÃO 5 =====================
  // v0.25.0 (dono, conferido com a lore): o 造化境 de Martial Peak, o último reino do livro — só a origem da
  // Tinta (Mo) e, no final, o Yang Kai chegam a ele. O livro não o divide; os 6 estágios crescem como a
  // Árvore do Mundo (decisão do dono): Semente, Raiz e Tronco no Mundo 7; Copa, Flor e Fruto no Mundo 8.
  {
    id: 'criacao', nome: 'Reino da Criação', regiao: 4,
    estagios: ['Semente do Universo', 'Raiz do Universo', 'Tronco do Universo', 'Copa do Universo', 'Flor do Universo', 'Fruto do Universo'],
    corManto: '#fff6e0',
    descricao: 'Além da 9ª Ordem: o poder de criar — e de restaurar — mundos inteiros. Antes de você, só a origem da Tinta chegou aqui.',
    desbloqueio: 'Você rompeu a 9ª Ordem: o Reino da Criação começa com uma semente dentro do seu Pequeno Universo.',
    // Copa do Universo (4º estágio) só abre com o chefe do Mapa 84 (fim do Mundo 7)
    mapaParaEstagio: { 3: 84 },
    marcos: {
      2: 'Seu Pequeno Universo ganhou um tronco: ele já sustenta outros mundos.',
      5: 'O Fruto do Universo amadureceu. Você alcançou o ápice da Criação.',
    },
  },
];
