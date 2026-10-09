// =============================================================
// main.js — PONTO DE PARTIDA
// Carrega o save, monta a tela e inicia o loop do jogo.
// =============================================================
import { CONFIG } from './config.js';
import { criarEstadoInicial } from './estado.js';
import * as P from './sistemas/progressao.js';
import * as C from './sistemas/combate.js';
import * as BB from './sistemas/blackbook.js';
import * as EQ from './sistemas/equipamentos.js';
import * as NU from './sistemas/nucleos.js';
import * as BOSS from './sistemas/boss.js';
import { mostrarGolpeBoss, animarDerrotaDoBoss } from './ui/telaBoss.js';
import { acabouDeLiberar } from './sistemas/desbloqueios.js';
import { criarPersonagem, precisaCriarPersonagem } from './sistemas/personagem.js';
import { CLASSE_POR_ID } from './dados/classes.js';
import { montarTelaCriacao, abrirCriacao } from './ui/telaCriacao.js';
import { nomeDoItem, RARIDADE_POR_ID, indiceRaridade } from './sistemas/itens.js';
import { MUNDO, MAPAS, textoDoInicioDaVida } from './sistemas/mundo.js';
import { salvar, carregar, apagarSave, segundosOffline } from './save.js';
import { montarInterface, atualizarInterface, mostrarMensagem, mostrarModal, animarRompimento, trocarAba } from './ui/interface.js';
import { mostrarGolpe, mostrarCura, animarVitoria, animarDerrota, registrarBatalha } from './ui/telaCombate.js';
import { focarMapaDaFase } from './ui/telaMapa.js';
import { formatarNumero, formatarTempo } from './format.js';
import { iniciarSite } from './site.js';

// 1) Carrega o jogo salvo, ou começa um novo
let estado = carregar() ?? criarEstadoInicial();

// 2) Progresso offline: cultivo e combate continuam enquanto você está fora.
// Vale para o jogo fechado E para o jogo parado em segundo plano (celular com a tela
// apagada, outro app aberto...): nos dois casos o tempo passa pela mesma simulação,
// com o limite de CONFIG.maxHorasOffline, e o resumo aparece quando você volta.
let resumoFora = null;

const novoResumo = () => ({ tempo: 0, cultivo: 0, estagios: 0, vitorias: 0, pedras: 0, fasesNovas: 0, itens: 0, nucleos: 0, mundoConcluido: null });

// Aba escondida, mas o navegador continua rodando o jogo (computador: outra aba aberta).
// O tempo passa normalmente, só que sem animações nem avisos — tudo vai para o resumo
// que aparece quando você volta. (v0.9.8: antes o resumo só contava pausas de mais de
// 10 s, então 10 minutos em outra aba apareciam como "53 segundos".)
function passoEscondido(segundos) {
  const r = resumoFora ??= novoResumo();
  BOSS.abandonarLuta(estado, aoEventoBoss);   // a luta contra o boss só acontece com o jogo na tela
  const antes = estado.cultivoTotal;
  P.atualizar(estado, segundos, (evento) => { r.estagios += 1; aoAvancarNivel(evento); });
  C.atualizarCombate(estado, segundos, (evento) => {
    if (evento.tipo !== 'vitoria') return;
    r.vitorias += 1;
    r.pedras += evento.pedras;
    if (evento.primeira) r.fasesNovas += 1;
    if (evento.drop) r.itens += 1;
    if (evento.nucleo) r.nucleos += 1;
    if (evento.ultimaDoMundo) r.mundoConcluido = evento.ultimaDoMundo;
  });
  r.cultivo += estado.cultivoTotal - antes;
  r.tempo += segundos;
}

// Tempo fora (jogo fechado ou congelado em segundo plano): simula cultivo e lutas JUNTOS,
// em pedaços de até 5 s — igual ao jogo aberto. (v0.9.17: antes simulava todo o cultivo e
// depois todas as lutas; os estágios ganhos com o cultivo das lutas não aumentavam a
// produção durante o tempo fora, e o offline rendia 5–15% menos que jogando.)
function somarTempoFora(segundos) {
  const tempo = Math.min(segundos, CONFIG.maxHorasOffline * 3600);
  const pedacos = Math.min(20000, Math.max(1, Math.ceil(tempo / 5)));
  for (let i = 0; i < pedacos; i++) passoEscondido(tempo / pedacos);
}

function mostrarResumoFora() {
  const r = resumoFora;
  if (!r) return;
  resumoFora = null;
  if (r.tempo < 5) return;   // só trocou de aba rapidinho: não precisa de resumo
  let texto = `Você esteve fora por ${formatarTempo(r.tempo)}: +${formatarNumero(r.cultivo)} Cultivo`;
  if (r.estagios > 0) texto += `, ${r.estagios} estágio(s)`;
  if (r.vitorias > 0) texto += `, ${r.vitorias} vitória(s), +${formatarNumero(r.pedras)} 💎`;
  if (r.fasesNovas > 0) texto += `, ${r.fasesNovas} fase(s) nova(s)`;
  if (r.itens > 0) texto += `, ${r.itens} item(ns)`;
  if (r.nucleos > 0) texto += `, ${r.nucleos} núcleo(s)`;
  mostrarMensagem(texto + '.');
  if (r.mundoConcluido) mostrarModal(r.mundoConcluido.final.titulo, r.mundoConcluido.final.texto);
  salvar(estado);
}

const tempoFora = segundosOffline(estado);
if (tempoFora > 5) {
  somarTempoFora(tempoFora);
  mostrarResumoFora();
}

// ---- O que fazer quando o jogador avança no cultivo (manual ou automático) ----
function aoAvancarNivel(evento) {
  if (acabouDeLiberar(estado, 'combate')) {
    mostrarModal('⚔️ Combate, Mapa e Mochila liberados!',
      `${MUNDO.lema}\n\n${MUNDO.descricao}\n\nSua jornada começa no ${MAPAS[0].icone} ${MAPAS[0].nome}. ` +
      'Seu personagem luta sozinho, em turnos: quem tem mais Velocidade ataca primeiro. ' +
      'Vencendo fases você ganha Cultivo, Pedras Espirituais e equipamentos. ' +
      'Para romper cada reino, é preciso vencer o chefe de um mapa.');
  }
  if (evento.tipo === 'rompimento') {
    animarRompimento();
    mostrarMensagem(`⚡ ROMPIMENTO! ${evento.nome}. ${evento.reino.desbloqueio}`);
  } else if (evento.marco) {
    mostrarMensagem(`✨ ${evento.nome}. ${evento.marco}`);
  } else {
    mostrarMensagem(`⬆️ ${evento.nome}`);
  }
}

// ---- Evento de Boss (Mestre do Salão Ying Yue) ----
function aoEventoBoss(evento) {
  if (evento.tipo === 'golpe' || evento.tipo === 'cura' || evento.tipo === 'carregando') {
    mostrarGolpeBoss(evento);
  } else if (evento.tipo === 'fim') {
    const motivo = evento.motivo === 'tempo' ? 'o tempo acabou' : evento.motivo === 'derrotado' ? 'você caiu' : 'luta interrompida';
    mostrarMensagem(`🌙 Luta contra o boss encerrada (${motivo}): você causou ${(evento.dano * 100).toFixed(2)}% de dano.`);
    salvar(estado);
  } else if (evento.tipo === 'boss-derrotado') {
    const r = evento.recompensa;
    const nucleos = NU.TIPOS_DE_NUCLEO.filter(t => r.nucleos[t.id] > 0).map(t => `${r.nucleos[t.id]}× ${t.nome}`).join(', ');
    const item = r.item.item;
    const onde = r.item.destino === 'equipado' ? 'vestido automaticamente' : 'guardado na mochila';
    const rank = evento.rank.map((l, i) => `${i + 1}. ${l.nome} — ${(l.dano * 100).toFixed(2)}%`).join('\n');
    const texto = `Rank de dano:\n${rank}\n\nRecompensa:\n💠 ${nucleos}\n🌸 ${nomeDoItem(item)} (Ancestral) — ${onde}\n\n` +
      `Use os Núcleos na aba Personagem. O boss volta em ${CONFIG.boss.renasceMinutos} minutos.`;
    animarDerrotaDoBoss();
    // A janela da recompensa espera a queda do boss na tela (1,8 s)
    setTimeout(() => mostrarModal(`🏆 ${CONFIG.boss.nome} foi derrotado!`, texto), document.hidden ? 0 : 1800);
    salvar(estado);
  }
}

// ---- O que fazer a cada acontecimento do combate ----
function aoEventoCombate(evento) {
  if (evento.tipo === 'golpe') {
    mostrarGolpe(evento);
  } else if (evento.tipo === 'cura') {
    mostrarCura(evento);
  } else if (evento.tipo === 'vitoria') {
    animarVitoria(evento);
    const fase = evento.fase;
    registrarBatalha(
      `✔ ${fase.inimigo.nome} derrotado: +${formatarNumero(evento.cultivo)} Cultivo, +${formatarNumero(evento.pedras)} 💎` +
      (evento.primeira ? ' (primeira vitória!)' : ''), 'vitoria');
    if (evento.drop) avisarDrop(evento.drop);
    if (evento.nucleo) {
      registrarBatalha(`💠 ${evento.nucleo.nome} encontrado! Use-o na aba Personagem (+${evento.nucleo.pontos}%).`, 'vitoria');
      mostrarMensagem(`💠 ${evento.nucleo.nome}! (+${evento.nucleo.pontos}% num atributo — aba Personagem)`);
      salvar(estado);
    }

    // Chefe de mapa vencido pela primeira vez
    if (evento.primeira && fase.numero === 12) {
      let texto = `🏆 Mapa concluído: ${MAPAS[fase.mapa].nome}!`;
      const requisito = P.requisitoDoRompimento(estado);
      if (requisito && requisito.mapa === fase.mapa + 1) texto += ' Agora você pode romper o seu reino!';
      mostrarMensagem(texto);
      salvar(estado);
    }
    if (evento.ultimaDoMundo) mostrarModal(evento.ultimaDoMundo.final.titulo, evento.ultimaDoMundo.final.texto);
  } else if (evento.tipo === 'derrota') {
    animarDerrota();
    const motivo = evento.motivo === 'tempo' ? 'o tempo acabou' : 'você foi derrotado';
    registrarBatalha(`✖ Contra ${evento.fase.inimigo.nome}: ${motivo}.`, 'derrota');
    mostrarMensagem('Derrota! Você recuou uma fase e o avanço automático foi desligado. ' +
      'Fortaleça-se, ou reencarne no 📕 Black Book para ganhar Essência da Alma.');
  }
}

// ---- Um equipamento caiu ----
function avisarDrop(drop) {
  const raridade = RARIDADE_POR_ID[drop.item.raridade];
  const nome = `${nomeDoItem(drop.item)} [Tier ${raridade.tier}]`;
  const destino = {
    equipado: 'vestido automaticamente!',
    mochila: 'guardado na Mochila.',
    desmanchado: `Mochila cheia: desmanchado em +${formatarNumero(drop.pedras)} 💎.`,
  }[drop.destino];
  registrarBatalha(`🎁 ${nome} — ${destino}`, 'drop raridade-' + raridade.id);
  // Itens Raros ou melhores ganham destaque na tela
  if (indiceRaridade(drop.item) >= 2) mostrarMensagem(`🎁 Item ${raridade.nome}! ${nome}`);
  salvar(estado);
}

// Depois de mexer nos itens: atualiza a tela e salva
function depoisDeMexerNosItens() {
  C.atualizarAtributosDaLuta(estado);   // a luta atual já usa os novos atributos
  salvar(estado);
  atualizarInterface(estado);
}

// 3) Monta a tela e diz o que cada botão faz
montarInterface({
  aoMeditar: () => {
    // VIP: o botão vira liga/desliga do Meditar automático (deixa de ser por clique)
    if (estado.vip) estado.opcoes.meditarAuto = !estado.opcoes.meditarAuto;
    else P.meditar(estado);
    atualizarInterface(estado);
  },
  aoAvancar: () => {
    const evento = P.avancar(estado);
    if (evento) {
      aoAvancarNivel(evento);
      salvar(estado); // avanço é importante: salva na hora
    }
    atualizarInterface(estado);
  },
  aoMudarAuto: (ligado) => {
    estado.opcoes.autoAvancar = ligado;
  },
  // ---- Mochila ----
  aoEquiparItem: (id) => { if (EQ.equipar(estado, id)) depoisDeMexerNosItens(); },
  aoRemoverItem: (slot) => {
    if (EQ.remover(estado, slot)) depoisDeMexerNosItens();
    else mostrarMensagem('A Mochila está cheia. Desmanche algum item antes.');
  },
  aoMelhorarItem: (id) => { if (EQ.melhorar(estado, id)) depoisDeMexerNosItens(); },
  aoDesmancharItem: (id) => {
    const pedras = EQ.desmanchar(estado, id);
    if (pedras > 0) {
      mostrarMensagem(`Item desmanchado: +${formatarNumero(pedras)} 💎`);
      depoisDeMexerNosItens();
    }
  },
  aoDesmancharAteTier: (indice) => {
    const resultado = EQ.desmancharAteTier(estado, indice);
    if (resultado.quantidade > 0) {
      mostrarMensagem(`${resultado.quantidade} item(ns) desmanchado(s): +${formatarNumero(resultado.pedras)} 💎`);
      depoisDeMexerNosItens();
    }
  },
  aoDesmancharObsoletos: () => {
    const { itens, pedras } = EQ.obsoletos(estado);
    if (itens.length === 0) return;
    const certeza = confirm(
      `Desmanchar ${itens.length} item(ns) obsoleto(s) por +${formatarNumero(pedras)} 💎?\n\n` +
      'Obsoleto = nem mesclado até ★5 e melhorado ao máximo ele ficaria melhor que o item que você está vestindo.\n' +
      'Itens que ainda podem ficar bons continuam guardados.');
    if (!certeza) return;
    const resultado = EQ.desmancharObsoletos(estado);
    mostrarMensagem(`${resultado.quantidade} item(ns) obsoleto(s) desmanchado(s): +${formatarNumero(resultado.pedras)} 💎`);
    depoisDeMexerNosItens();
  },
  aoMudarAutoEquipar: (ligado) => { estado.opcoes.autoEquipar = ligado; },

  // ---- Pilhas: Mesclar e Desmanchar a pilha toda ----
  aoMesclar: (slot, raridade, grau) => {
    const resultado = EQ.mesclar(estado, slot, raridade, grau);
    if (!resultado) return;
    const r = RARIDADE_POR_ID[resultado.item.raridade];
    const onde = resultado.destino === 'equipado' ? ' e foi vestido automaticamente' : '';
    mostrarMensagem(`✨ Mesclado: ${nomeDoItem(resultado.item)} [Tier ${r.tier}]${onde}!`);
    depoisDeMexerNosItens();
  },
  aoMesclarTudo: () => {
    const resultado = EQ.mesclarTudo(estado);
    if (resultado.mesclas === 0) return;
    // Mostra os melhores itens que saíram (maior tier/grau primeiro)
    const melhores = resultado.melhores
      .sort((a, b) => (indiceRaridade(b) * 10 + (b.grau ?? 1)) - (indiceRaridade(a) * 10 + (a.grau ?? 1)))
      .slice(0, 3).map(nomeDoItem).join(', ');
    const pedras = resultado.pedras > 0 ? ` (+${formatarNumero(resultado.pedras)} 💎 devolvidas)` : '';
    mostrarMensagem(`✨ ${resultado.mesclas} mescla(s) feitas! Melhores: ${melhores}${pedras}`);
    depoisDeMexerNosItens();
  },
  aoDesmancharPilha: (slot, raridade, grau) => {
    const resultado = EQ.desmancharPilha(estado, slot, raridade, grau);
    if (resultado.quantidade > 0) {
      mostrarMensagem(`${resultado.quantidade} item(ns) desmanchado(s): +${formatarNumero(resultado.pedras)} 💎`);
      depoisDeMexerNosItens();
    }
  },

  aoAlternarVip: () => {
    estado.vip = !estado.vip;
    C.atualizarAtributosDaLuta(estado);   // os bônus do VIP valem na hora
    salvar(estado);
    atualizarInterface(estado);
    mostrarMensagem(estado.vip ? '💎 VIP ativado!' : 'VIP desativado.');
  },
  aoUsarNucleo: (tipo, atributo, vezes = 1) => {
    if (NU.usarNucleo(estado, tipo, atributo, vezes) > 0) {
      C.atualizarAtributosDaLuta(estado);   // vale na hora, inclusive na luta atual
      salvar(estado);
      atualizarInterface(estado);
    }
  },
  aoComprarMelhoria: (id) => {
    if (BB.comprarMelhoria(estado, id)) {
      C.atualizarAtributosDaLuta(estado);   // o bônus vale na hora, inclusive na luta atual
      salvar(estado);
      atualizarInterface(estado);
    }
  },
  aoReencarnar: () => {
    const ganho = BB.essenciaAoReencarnar(estado);
    if (!BB.podeReencarnar(estado)) return;
    const certeza = confirm(
      'Reencarnar agora?\n\n' +
      `Você vai recomeçar em ${textoDoInicioDaVida(estado)}, perdendo o Cultivo, o reino ` +
      'e as fases desta vida.\n\n' +
      `Você recebe: ${formatarNumero(ganho)} Essência da Alma ✨\n` +
      'A Essência, as melhorias do Black Book, seus equipamentos, a mochila e as Pedras Espirituais ficam para sempre.');
    if (!certeza) return;

    const resultado = BB.reencarnar(estado);
    estado = resultado.estado;
    C.reiniciarLuta();
    salvar(estado);
    animarRompimento();
    atualizarInterface(estado);
    mostrarModal('📕 Reencarnação',
      'Sua vida anterior chegou ao fim, mas sua alma se lembra de tudo.\n\n' +
      `O Black Book recebeu ${formatarNumero(resultado.ganho)} de Essência da Alma ✨.\n\n` +
      'Use-a nas melhorias permanentes do Black Book e vá mais longe nesta nova vida.');
  },
  aoLutarBoss: () => {
    if (BOSS.comecarLuta(estado)) atualizarInterface(estado);
  },
  aoEscolherFase: (indice) => {
    if (C.irParaFase(estado, indice)) {
      focarMapaDaFase(indice);
      trocarAba('combate');
      atualizarInterface(estado);
    }
  },
  aoMudarFase: (direcao) => {
    C.irParaFase(estado, estado.combate.faseAtual + direcao);
    atualizarInterface(estado);
  },
  aoMudarAutoCombate: (ligado) => {
    estado.combate.autoAvancar = ligado;
  },
  aoSalvar: () => {
    salvar(estado);
    mostrarMensagem('Jogo salvo!');
  },
  aoResetar: () => {
    if (!confirm('Tem certeza? Todo o progresso será apagado.')) return;
    apagarSave();
    estado = criarEstadoInicial();
    C.reiniciarLuta();
    atualizarInterface(estado);
    abrirCriacao();   // novo jogo: cria o personagem de novo
  },
});

// 3.5) Criação de personagem: aparece em jogos novos e em saves antigos sem personagem
montarTelaCriacao((escolha) => {
  if (!criarPersonagem(estado, escolha)) return;
  C.reiniciarLuta();       // a próxima luta já usa a classe escolhida
  salvar(estado);
  atualizarInterface(estado);
  const classe = CLASSE_POR_ID[estado.personagem.classe];
  mostrarModal(`Bem-vindo, ${estado.personagem.nome}!`,
    `Você trilha o caminho do ${classe.nome}.\n\n${classe.descricao}\n\n` +
    `${classe.nomeEspecial}: ${classe.textoEspecial}\n\n` +
    'Sua jornada começa como um servo insignificante. Cultive, fique mais forte e descubra o que existe além do horizonte.');
});
if (precisaCriarPersonagem(estado)) abrirCriacao();

// 4) Loop do jogo: roda 10 vezes por segundo, usando o tempo REAL que passou
let ultimoTick = Date.now();

// Mais que isso entre um passo e outro = o jogo ficou parado (segundo plano no celular,
// aba escondida...). Esse tempo vai para a simulação offline em vez do passo normal
// (antes ele era jogado de uma vez: sem resumo, sem limite e com uma enxurrada de avisos).
const PAUSA_LONGA = 10;
let cliquesVip = 0;   // fração de clique acumulada do Meditar automático do VIP

setInterval(() => {
  const agora = Date.now();
  const segundos = (agora - ultimoTick) / 1000;
  ultimoTick = agora;

  if (segundos > PAUSA_LONGA) {
    somarTempoFora(segundos);
    if (!document.hidden) mostrarResumoFora();
    atualizarInterface(estado);
    return;
  }
  if (document.hidden) {
    passoEscondido(segundos);
    return;
  }

  // VIP: Meditar automático (3 cliques por segundo), só com o jogo aberto na tela
  if (estado.vip && estado.opcoes.meditarAuto && !document.hidden) {
    cliquesVip += segundos * CONFIG.vip.cliquesPorSegundo;
    while (cliquesVip >= 1) { P.meditar(estado); cliquesVip -= 1; }
  }

  P.atualizar(estado, segundos, aoAvancarNivel);
  // Evento de Boss: enquanto você luta contra o boss, o combate das fases fica em pausa
  BOSS.atualizarBoss(estado);
  if (BOSS.lutaDoBoss()) BOSS.atualizarLutaDoBoss(estado, segundos, aoEventoBoss);
  else C.atualizarCombate(estado, segundos, aoEventoCombate);
  atualizarInterface(estado);
}, 100);

// 5) Salvamento automático + ao esconder/fechar a aba
setInterval(() => salvar(estado), CONFIG.intervaloAutoSave);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) salvar(estado);
  else mostrarResumoFora();   // voltou para o jogo: mostra o que aconteceu enquanto estava em segundo plano
});
window.addEventListener('beforeunload', () => salvar(estado));

// 6) No site publicado: app no celular + aviso de nova versão (salva antes de atualizar)
iniciarSite(() => salvar(estado));

atualizarInterface(estado);
