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
export const REGIOES = [
  { nome: 'Mundo Inicial — Reino Tong Xuan', corAura: '#6fcf8a' },
  { nome: 'Campo Estelar',                   corAura: '#6f9fff' },
  { nome: 'Limite Estelar',                  corAura: '#b77bff' },
  { nome: 'Universo Exterior',               corAura: '#ffd36b' },
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
    descricao: 'Purificação do Yuan Qi em True Qi. Técnicas complexas e voo.',
    desbloqueio: 'Seu Qi foi purificado em True Qi. Agora você pode voar!',
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
    descricao: 'Saint Qi e resistência para sobreviver no Campo Estelar.',
    desbloqueio: 'Seu Qi se tornou Saint Qi. O Campo Estelar aguarda.',
    mapaParaRomper: 14,
  },

  // ===================== REGIÃO 2 =====================
  {
    id: 'rei_santo', nome: 'Rei Santo', regiao: 1,
    estagios: estagios(3), corManto: '#3f5fbf',
    descricao: 'Compreensão das leis naturais.',
    desbloqueio: 'Você chegou ao Campo Estelar e começa a compreender as leis naturais.',
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
    descricao: 'Domínio dos princípios espaciais. Possibilidade de se tornar Mestre Estelar ao refinar um planeta.',
    desbloqueio: 'Os princípios espaciais se curvam a você.',
    mapaParaRomper: 20,
  },

  // ===================== REGIÃO 3 =====================
  {
    id: 'origem_dao', nome: 'Origem do Dao', regiao: 2,
    estagios: estagios(3), corManto: '#6f3f9f',
    descricao: 'Conversão de Saint Qi em Source Qi e uso dos Princípios do Mundo.',
    desbloqueio: 'Seu Saint Qi se converteu em Source Qi.',
    mapaParaRomper: 22,
  },
  {
    id: 'imperador', nome: 'Imperador', regiao: 2,
    estagios: ['1ª Ordem', '2ª Ordem', '3ª Ordem', 'Pico'], corManto: '#8f2f2f',
    descricao: 'Emperor Qi.',
    desbloqueio: 'Você se tornou um Imperador. Seu Qi agora é Emperor Qi.',
    mapaParaRomper: 24,
  },
  // v0.17.0 (dono, conferido com a lore): Imperador → Pseudo-Grande Imperador → Grande Imperador →
  // Meio-Passo do Céu Aberto → Céu Aberto. (Antes o Grande Imperador vinha antes do Pseudo, e o
  // "Pseudo-Grande Imperador / Meio-Aberto" misturava duas coisas.) O Pseudo-Grande Imperador tem
  // 1 estágio, como o Grande Imperador tinha nesta posição: o balanceamento até o Mundo 2 não muda.
  {
    id: 'pseudo_grande_imperador', nome: 'Pseudo-Grande Imperador', regiao: 2,
    estagios: ['Gargalo do Caminho Celestial'], corManto: '#7f6f3f',
    descricao: 'Além da 3ª Ordem de Imperador. O Caminho Celestial do seu mundo ainda não reconhece você: é o gargalo antes de se tornar Grande Imperador.',
    desbloqueio: 'Você se tornou um Pseudo-Grande Imperador. O Caminho Celestial ainda não o reconhece.',
    mapaParaRomper: 30,
  },
  {
    id: 'grande_imperador', nome: 'Grande Imperador', regiao: 2,
    estagios: ['Reconhecimento do Mundo'], corManto: '#bf9f2f',
    descricao: 'Reconhecido pela Vontade do Mundo, você condensa o Selo do Dao.',
    desbloqueio: 'O mundo reconhece sua existência. Você condensou o Selo do Dao.',
    mapaParaRomper: 36,
  },
  {
    id: 'meio_ceu_aberto', nome: 'Meio-Passo do Céu Aberto', regiao: 2,
    estagios: ['1 Elemento', '2 Elementos', '3 Elementos', '4 Elementos', '5 Elementos'], corManto: '#5f5f5f',
    descricao: 'Ainda dentro do reino Imperador: condensação de 1 a 5 dos elementos fundamentais (Yin, Yang, Ouro, Madeira, Água, Fogo, Terra) no Selo do Dao.',
    desbloqueio: 'Você começa a condensar os elementos fundamentais no Selo do Dao.',
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
    desbloqueio: 'Seu Pequeno Universo nasceu!',
    marcos: {
      3: 'Seu Pequeno Universo ganhou estabilidade física.',
      6: 'Seu Pequeno Universo se materializou e pode abrigar seres vivos.',
    },
  },
];
