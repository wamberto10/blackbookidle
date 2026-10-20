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
import * as CA from './sistemas/cultivoAvancado.js';
import * as MOTOR from './sistemas/motor.js';
import * as RE from './sistemas/reencarnacao.js';
import { somar, subtrair, maior } from './numeros.js';
import { instantaneo, variacaoDesde, saldo } from './saldos.js';
import { mostrarGolpeBoss, animarDerrotaDoBoss } from './ui/telaBoss.js';
import { acabouDeLiberar } from './sistemas/desbloqueios.js';
import { criarPersonagem, precisaCriarPersonagem, precisaTrocarClasse } from './sistemas/personagem.js';
import { CLASSE_POR_ID } from './dados/classes.js';
import { montarTelaCriacao, abrirCriacao } from './ui/telaCriacao.js';
import { nomeDoItem, RARIDADE_POR_ID, indiceRaridade } from './sistemas/itens.js';
import { MUNDO, MAPAS, faseLiberada, mapaDesenhado } from './sistemas/mundo.js';
import { DIFICULDADES, MAPAS_POR_DIFICULDADE, FASES_POR_MAPA, dificuldadeDoMapa, nomeDaPosicao } from './sistemas/escala.js';
import { salvar as gravarEstado, carregar, apagarSave, segundosOffline } from './save.js';
import { montarInterface, atualizarInterface, mostrarMensagem, mostrarModal, animarRompimento, trocarAba, motivoParaNaoAvancar, mostrarGanhoMeditacao } from './ui/interface.js';
import { mostrarGolpe, mostrarCura, animarVitoria, animarDerrota, registrarBatalha } from './ui/telaCombate.js';
import { focarMapaDaFase } from './ui/telaMapa.js';
import { porcentoDaMarca } from './ui/telaBlackBook.js';
import { formatarNumero, formatarTempo } from './format.js';
import { iniciarSite } from './site.js';

// 1) Carrega o jogo salvo, ou começa um novo
let estado = carregar() ?? criarEstadoInicial();

// 2) Progresso offline: cultivo e combate continuam enquanto você está fora.
// Vale para o jogo fechado E para o jogo parado em segundo plano (celular com a tela
// apagada, outro app aberto...): nos dois casos o tempo passa pela mesma simulação,
// com o limite de CONFIG.maxHorasOffline, e o resumo aparece quando você volta.
let resumoFora = null;
let processandoFora = false;
let falhaNoProgresso = false;
// Salvar usa o instante real já aceito pelo relógio, inclusive durante uma recuperação em lotes.
// Assim, fechar entre dois lotes não descarta o tempo real gasto processando a recuperação.
let ultimoTick = Date.now();
function salvar(estadoAtual) { return gravarEstado(estadoAtual, ultimoTick); }

const novoResumo = () => ({ tempo: 0, cultivo: 0, estagios: 0, vitorias: 0, pedras: 0, essencia: 0, fasesNovas: 0, itens: 0, nucleos: 0, pilulas: 0,
  desmanchados: 0, mesclas: 0, pedrasMochila: 0, mundoConcluido: null, dificuldade: null,   // v0.26.0: Mochila automática
  // v0.33.0: o que a automação fez enquanto você estava fora
  auto: { blackbook: 0, essenciaGasta: 0, arranjo: 0, pedrasArranjo: 0, itens: 0, pedrasItens: 0, nucleos: 0, pilulas: 0, retomadas: 0, fonteEstelar: false,
    reencarnacoes: 0, marca: 0 } });   // v0.34.0

// v0.33.0: soma um relatório da automação (sistemas/automacao.js) no resumo
function somarAutomacao(total, r) {
  total.blackbook += r.blackbook;
  total.essenciaGasta = somar(total.essenciaGasta, r.essenciaGasta);
  total.arranjo += r.arranjo;
  total.pedrasArranjo = somar(total.pedrasArranjo, r.pedrasArranjo);
  total.itens += r.itens;
  total.pedrasItens = somar(total.pedrasItens, r.pedrasItens);
  total.nucleos += r.nucleos;
  total.pilulas += r.pilulas.acumulo + r.pilulas.fluxo + r.pilulas.rompimento;
  if (r.retomou) total.retomadas += 1;
  if (r.fonteEstelar) total.fonteEstelar = true;
  if (r.reencarnou) { total.reencarnacoes = (total.reencarnacoes ?? 0) + 1; total.marca = r.reencarnou; }
}

// Texto curto do que a automação fez (resumo offline e registro do combate)
function textoDaAutomacao(t) {
  const partes = [];
  if (t.blackbook) partes.push(`+${t.blackbook} nível(is) no Black Book (−${formatarNumero(t.essenciaGasta)} ✨)`);
  if (t.arranjo) partes.push(`Arranjo +${t.arranjo} (−${formatarNumero(t.pedrasArranjo)} 💎)`);
  if (t.itens) partes.push(`${t.itens} melhoria(s) de item (−${formatarNumero(t.pedrasItens)} 💎)`);
  if (t.nucleos) partes.push(`${t.nucleos} núcleo(s) usados`);
  const pilulas = typeof t.pilulas === 'number' ? t.pilulas : t.pilulas.acumulo + t.pilulas.fluxo + t.pilulas.rompimento;
  if (pilulas) partes.push(`${pilulas} pílula(s) usada(s)`);
  if (t.fonteEstelar) partes.push('Fonte Estelar refinada');
  const retomadas = t.retomadas ?? (t.retomou ? 1 : 0);
  if (retomadas) partes.push(`avanço do combate religado ${retomadas}×`);
  const vidas = t.reencarnacoes ?? (t.reencarnou ? 1 : 0);   // v0.34.0
  if (vidas) partes.push(`reencarnou ${vidas}× (Marca da Alma nível ${t.marca ?? t.reencarnou})`);
  return partes.join(', ');
}

// Aba escondida, mas o navegador continua rodando o jogo (computador: outra aba aberta).
// O tempo passa normalmente, só que sem animações nem avisos — tudo vai para o resumo
// que aparece quando você volta. (v0.9.8: antes o resumo só contava pausas de mais de
// 10 s, então 10 minutos em outra aba apareciam como "53 segundos".)
// v0.33.0: o tempo passa pelo motor (sistemas/motor.js) — os mesmos passos de 1 s do jogo aberto, com a automação
// nos mesmos instantes
async function passoEscondido(segundos, aoLote) {
  const r = resumoFora ??= novoResumo();
  BOSS.abandonarLuta(estado, aoEventoBoss);   // a luta contra o boss só acontece com o jogo na tela
  const antes = instantaneo(estado, 'cultivoTotal');
  const passos = await MOTOR.avancarEmLotes(estado, segundos, {
    aoAvancarNivel: () => { r.estagios += 1; },
    aoAutomacao: (relatorio) => somarAutomacao(r.auto, relatorio),
    aoEventoCombate: (evento) => {
      if (evento.tipo !== 'vitoria') return;
      r.vitorias += 1;
      r.pedras = somar(r.pedras, evento.pedras);
      r.essencia = somar(r.essencia, evento.essencia.total);   // v0.32.0: Essência do farm e das 1ªs conquistas
      if (evento.primeira) r.fasesNovas += 1;
      if (evento.drop) r.itens += 1;
      if (evento.drop?.auto) {
        r.desmanchados += evento.drop.auto.desmanchados;
        r.mesclas += evento.drop.auto.mesclas;
        r.pedrasMochila = somar(r.pedrasMochila, evento.drop.auto.pedras);
      }
      if (evento.nucleo) r.nucleos += 1;
      if (evento.pilula) r.pilulas += 1;
      if (evento.ultimaDoMundo) r.mundoConcluido = evento.ultimaDoMundo;
      const liberou = dificuldadeLiberadaPor(evento);
      if (liberou) r.dificuldade = liberou;
    },
  }, { aoLote });
  r.cultivo = somar(r.cultivo, variacaoDesde(estado, 'cultivoTotal', antes));
  r.tempo += passos * MOTOR.PASSO;
}

// Tempo fora (jogo fechado ou congelado em segundo plano): cultivo, lutas e automação juntos, passo a passo
// (v0.33.0: pelo motor, em passos de 1 s — igual ao jogo aberto). No máximo CONFIG.maxHorasOffline.
async function somarTempoFora(segundos, exibirResumo = true) {
  if (processandoFora) return;
  processandoFora = true;
  const trabalhoLongo = segundos + estado.relogio.resto >= 250;
  const jogo = document.getElementById('jogo');
  const bloqueadoAntes = jogo?.inert ?? false;
  const aviso = document.createElement('div');
  aviso.id = 'progresso-offline';
  aviso.className = 'offline-processando';
  aviso.setAttribute('role', 'status');
  aviso.innerHTML = '<div><strong>Recuperando sua jornada…</strong><progress max="100" value="0" aria-label="Progresso recuperado"></progress><span>0%</span></div>';
  if (jogo && trabalhoLongo) jogo.inert = true;
  if (trabalhoLongo) document.body.appendChild(aviso);
  try {
    await passoEscondido(Math.min(Math.max(0, segundos), CONFIG.maxHorasOffline * 3600), ({ passos, total }) => {
      const porcentagem = total ? Math.round(passos / total * 100) : 100;
      aviso.querySelector('progress').value = porcentagem;
      aviso.querySelector('span').textContent = `${porcentagem}%`;
    });
    if (exibirResumo && !document.hidden) mostrarResumoFora();
    if (exibirResumo) salvar(estado);
    atualizarInterface(estado);
  } catch (erro) {
    // O restante aceito continua em relogio.resto e será retomado no próximo carregamento.
    salvar(estado);
    falhaNoProgresso = true;
    console.error('Não foi possível concluir o progresso offline.', erro);
    mostrarModal('Progresso interrompido', 'O progresso já concluído foi salvo. Reabra o jogo para continuar o tempo restante.');
  } finally {
    aviso.remove();
    if (jogo) jogo.inert = bloqueadoAntes;
    processandoFora = false;
  }
}

function mostrarResumoFora() {
  const r = resumoFora;
  if (!r) return;
  resumoFora = null;
  if (r.tempo < 5) return;   // só trocou de aba rapidinho: não precisa de resumo
  let texto = `Você esteve fora por ${formatarTempo(r.tempo)}: +${formatarNumero(r.cultivo)} Cultivo`;
  if (r.estagios > 0) texto += `, ${r.estagios} estágio(s)`;
  if (r.vitorias > 0) texto += `, ${r.vitorias} vitória(s), +${formatarNumero(r.pedras)} 💎`;
  if (maior(r.essencia, 0)) texto += `, +${formatarNumero(r.essencia)} ✨ Essência`;
  if (r.fasesNovas > 0) texto += `, ${r.fasesNovas} fase(s) nova(s)`;
  if (r.itens > 0) texto += `, ${r.itens} item(ns)`;
  // v0.26.0: o que a Mochila automática fez
  if (r.desmanchados > 0) texto += ` (${r.desmanchados} obsoleto(s) desmanchado(s)`;
  if (r.mesclas > 0) texto += `${r.desmanchados > 0 ? ',' : ' ('} ${r.mesclas} mescla(s)`;
  if (r.desmanchados > 0 || r.mesclas > 0) texto += `${maior(r.pedrasMochila, 0) ? `: +${formatarNumero(r.pedrasMochila)} 💎` : ''})`;
  if (r.nucleos > 0) texto += `, ${r.nucleos} núcleo(s)`;
  if (r.pilulas > 0) texto += `, ${r.pilulas} pílula(s)`;
  const auto = textoDaAutomacao(r.auto);   // v0.33.0
  if (auto) texto += `. 🤖 Automação: ${auto}`;
  mostrarMensagem(texto + '.');
  if (r.dificuldade) avisarDificuldade(r.dificuldade);
  else if (r.mundoConcluido) mostrarModal(r.mundoConcluido.final.titulo, r.mundoConcluido.final.texto);
  salvar(estado);
}

// v0.32.0: venceu pela 1ª vez o chefe final de uma dificuldade → a próxima (Normal, Difícil...) foi liberada
function dificuldadeLiberadaPor(evento) {
  const fase = evento.fase;
  if (!evento.primeira || fase.numero !== FASES_POR_MAPA || (fase.mapa + 1) % MAPAS_POR_DIFICULDADE !== 0) return null;
  const proxima = dificuldadeDoMapa(fase.mapa + 1);
  return proxima > fase.dificuldade ? DIFICULDADES[proxima] : null;
}

function avisarDificuldade(dificuldade) {
  mostrarModal(`🔓 Dificuldade ${dificuldade.nome} liberada!`,
    `Você venceu o último chefe da dificuldade anterior. A jornada continua na ${dificuldade.nome}: ` +
    'os mesmos 96 mapas, agora com inimigos, recompensas e itens de um patamar acima.\n\n' +
    'Seu cultivo, seus equipamentos, as Pedras, a Essência e o Black Book continuam com você — nada recomeça. ' +
    'Os mapas anteriores continuam abertos para farmar (escolha a dificuldade na aba Mapa).');
}

const tempoFora = segundosOffline(estado, ultimoTick);

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
    // v0.21.0: cada rompimento desde a Transformação do Qi traz um Batismo Mundial
    const batismo = evento.batismo
      ? ` 🌊 Batismo Mundial: +${Math.round(CONFIG.batismo.bonusPorBatismo * 100)}% Ataque, Vitalidade e Defesa ` +
        `(total +${Math.round(P.batismosMundiais(estado) * CONFIG.batismo.bonusPorBatismo * 100)}%).`
      : '';
    mostrarMensagem(`⚡ ROMPIMENTO! ${evento.nome}. ${evento.reino.desbloqueio}${batismo}`);
  } else if (evento.marco) {
    mostrarMensagem(`✨ ${evento.nome}. ${evento.marco}`);
  } else if (evento.maestria) {
    mostrarMensagem(`🌳 ${evento.nome}! Ataque, Vitalidade e Defesa ×${CONFIG.maestria.ganhoAtributos}.`);
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
    // Com "Atacar sozinho" as lutas se repetem a cada ~2 min: sem aviso a cada uma
    if (!estado.opcoes.bossAuto) mostrarMensagem(`🌙 Luta contra o boss encerrada (${motivo}): você causou ${(evento.dano * 100).toFixed(2)}% de dano.`);
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
      `${evento.suprimido ? `💨 ${fase.inimigo.nome} fugiu (Supressão de Alma)` : `✔ ${fase.inimigo.nome} derrotado`}: ` +
      `+${formatarNumero(evento.cultivo)} Cultivo, +${formatarNumero(evento.pedras)} 💎, +${formatarNumero(evento.essencia.total)} ✨` +
      (evento.primeira ? ' (primeira vitória!)' : ''), 'vitoria');
    if (evento.drop) avisarDrop(evento.drop);
    if (evento.nucleo) {
      registrarBatalha(`💠 ${evento.nucleo.nome} encontrado! Use-o na aba Personagem (+${evento.nucleo.pontos}%).`, 'vitoria');
      mostrarMensagem(`💠 ${evento.nucleo.nome}! (+${evento.nucleo.pontos}% num atributo — aba Personagem)`);
      salvar(estado);
    }
    // v0.21.0: pílula de cultivo
    if (evento.pilula) {
      registrarBatalha(`💊 ${evento.pilula.nome}! Use na aba Cultivo.`, 'vitoria');
      mostrarMensagem(`💊 ${evento.pilula.nome}! (${CA.textoDaPilula(estado, evento.pilula)} — aba Cultivo)`);
      salvar(estado);
    }

    // Chefe de mapa vencido pela primeira vez
    if (evento.primeira && fase.numero === 12) {
      let texto = `🏆 Mapa concluído: ${mapaDesenhado(fase.mapa).nome} (${nomeDaPosicao(fase.mapa)})!`;
      const requisito = P.requisitoDoRompimento(estado);
      // v0.21.0 (dono): dizia "Agora você pode romper" mesmo quando ainda faltava Cultivo
      if (requisito && requisito.mapa === fase.mapa + 1) {
        const falta = subtrair(P.custoParaAvancar(estado), saldo(estado, 'cultivo'));
        const acao = requisito.rompimento ? 'romper o reino' : requisito.maestria ? 'subir a Maestria' : 'avançar de estágio';   // v0.22.0: trava de estágio
        texto += maior(falta, 0)
          ? ` Gargalo superado! Faltam ${formatarNumero(falta)} de Cultivo para ${acao}.`
          : ` Agora você pode ${acao}!`;
      }
      mostrarMensagem(texto);
      salvar(estado);
    }
    const dificuldade = dificuldadeLiberadaPor(evento);
    if (dificuldade) avisarDificuldade(dificuldade);
    else if (evento.ultimaDoMundo) mostrarModal(evento.ultimaDoMundo.final.titulo, evento.ultimaDoMundo.final.texto);
  } else if (evento.tipo === 'derrota') {
    animarDerrota();
    const motivo = evento.motivo === 'tempo' ? 'o tempo acabou' : 'você foi derrotado';
    registrarBatalha(`✖ Contra ${evento.fase.inimigo.nome}: ${motivo}.`, 'derrota');
    // v0.32.0: sem reencarnação — a força vem do cultivo, dos itens e do Black Book (Essência do farm)
    mostrarMensagem('Derrota! Você recuou uma fase e o avanço automático foi desligado. ' +
      'Farme as fases anteriores para juntar Essência, Pedras e itens; fortaleça o cultivo, os equipamentos e o 📕 Black Book.');
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
    obsoleto: `obsoleto: desmanchado em +${formatarNumero(drop.pedras)} 💎.`,   // v0.26.0: Desmanche automático
    mesclado: 'mesclado automaticamente!',                                     // v0.26.0: Mescla automática
  }[drop.destino];
  const mesclas = drop.auto?.mesclas ? ` (${drop.auto.mesclas} mescla(s) automática(s))` : '';
  registrarBatalha(`🎁 ${nome} — ${destino}${mesclas}`, 'drop raridade-' + raridade.id);
  // Itens Raros ou melhores ganham destaque na tela (menos os que já chegaram obsoletos)
  if (indiceRaridade(drop.item) >= 2 && drop.destino !== 'obsoleto') mostrarMensagem(`🎁 Item ${raridade.nome}! ${nome}`);
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
  aoMeditar: (botao) => {
    // VIP: o botão vira liga/desliga do Meditar automático (deixa de ser por clique)
    if (estado.vip) {
      estado.opcoes.meditarAuto = !estado.opcoes.meditarAuto;
      mostrarMensagem(estado.opcoes.meditarAuto
        ? '🧘 Meditar automático LIGADO (medita sozinho com o jogo aberto).'
        : '🧘 Meditar automático DESLIGADO.');
    } else {
      mostrarGanhoMeditacao(botao, P.meditar(estado));   // v0.16.5: mostra quanto ganhou
    }
    atualizarInterface(estado);
  },
  aoAvancar: () => {
    const evento = P.avancar(estado);
    if (evento) {
      aoAvancarNivel(evento);
      salvar(estado); // avanço é importante: salva na hora
    } else {
      mostrarMensagem(motivoParaNaoAvancar(estado));   // v0.16.4: explica por que não avançou
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
    if (maior(pedras, 0)) {
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
  // v0.27.1: cadeado da Mochila — item travado não é desmanchado nem mesclado
  aoTravarItens: (ids, travado) => { EQ.travar(estado, ids, travado); depoisDeMexerNosItens(); },
  // v0.26.0: Mochila automática — ao ligar, já organiza o que está guardado
  aoMudarMochilaAuto: (opcao, ligado) => {
    estado.opcoes[opcao] = ligado;
    if (!ligado) return salvar(estado);
    const r = EQ.organizarMochila(estado);
    const partes = [];
    if (r.desmanchados > 0) partes.push(`${r.desmanchados} obsoleto(s) desmanchado(s)`);
    if (r.mesclas > 0) partes.push(`${r.mesclas} mescla(s)`);
    if (partes.length) mostrarMensagem(`🎒 Mochila organizada: ${partes.join(', ')}${maior(r.pedras, 0) ? ` (+${formatarNumero(r.pedras)} 💎)` : ''}.`);
    depoisDeMexerNosItens();
  },

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
    const pedras = maior(resultado.pedras, 0) ? ` (+${formatarNumero(resultado.pedras)} 💎 devolvidas)` : '';
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
  // v0.34.0: reencarnação opcional (sistemas/reencarnacao.js)
  aoReencarnar: () => {
    if (!RE.podeReencarnar(estado)) return;
    if (BOSS.lutaDoBoss()) return mostrarMensagem('Termine a luta contra o boss antes de reencarnar.');
    const marca = RE.marcaPossivel(estado);
    const certeza = confirm(
      `Reencarnar e receber a Marca da Alma nível ${marca}?\n\n` +
      'Recomeça: o Cultivo guardado, o reino, o estágio, a Maestria e a Fonte Estelar. A jornada volta ao ' +
      `${nomeDaPosicao(Math.floor(RE.faseDaVolta(estado) / FASES_POR_MAPA))} e avança sozinha pelas fases que você já conquistou.\n\n` +
      'Fica: Black Book, Essência, itens, Pedras, Arranjo, Núcleos, pílulas, fases conquistadas e dificuldades liberadas.');
    if (!certeza) return;
    const r = RE.reencarnar(estado);
    C.reiniciarLuta();
    salvar(estado);
    atualizarInterface(estado);
    mostrarModal(`🔄 Vida ${r.vida.numero} concluída`,
      `Sua alma renasce com a Marca da Alma nível ${r.marca}: ${porcentoDaMarca(r.marca)} de Ataque, Vitalidade e Defesa para sempre.\n\n` +
      'O cultivo recomeça do Corpo Temperado e a jornada volta até no máximo 96 mapas antes do seu recorde. Nos mundos que ' +
      'você já zerou os inimigos comuns fogem, e o caminho até onde você parou é rápido. A próxima Marca vem a cada 12 mapas ' +
      'além do seu recorde.');
  },
  aoComprarMelhoria: (id) => {
    if (BB.comprarMelhoria(estado, id)) {
      C.atualizarAtributosDaLuta(estado);   // o bônus vale na hora, inclusive na luta atual
      salvar(estado);
      atualizarInterface(estado);
    }
  },
  aoLutarBoss: () => {
    if (BOSS.comecarLuta(estado)) atualizarInterface(estado);
  },
  // Sair da tela do boss interrompe a luta — a não ser com "Atacar sozinho" ligado (aí ela continua por trás)
  aoSairDaLutaBoss: () => { if (!estado.opcoes.bossAuto) BOSS.abandonarLuta(estado, aoEventoBoss); },
  aoMudarBossAuto: (ligado) => {
    estado.opcoes.bossAuto = ligado;
    salvar(estado);
  },
  // ---- v0.21.0: melhorias do cultivo (sistemas/cultivoAvancado.js) ----
  aoAlternarReclusao: () => {
    if (!CA.reclusaoLiberada(estado) && !estado.reclusao.ativa) return;
    const entrou = CA.alternarReclusao(estado);
    mostrarMensagem(entrou
      ? `🏔️ Você entrou em Reclusão: o combate parou e o Cultivo rende +${Math.round(CONFIG.reclusao.bonusInicial * 100)}% ` +
        `(até +${Math.round(CONFIG.reclusao.bonusMaximo * 100)}% depois de ${CONFIG.reclusao.horasParaOMaximo} h).`
      : '🏔️ Você saiu da Reclusão. O combate voltou.');
    salvar(estado);
    atualizarInterface(estado);
  },
  aoIluminacao: () => {
    CA.receberIluminacao(estado);
    mostrarMensagem(`✨ Iluminação! Você compreendeu um pouco do Dao: Cultivo ×${CONFIG.iluminacao.multiplicador} por ${Math.ceil(estado.efeitos.iluminacao)} s.`);
    atualizarInterface(estado);
  },
  aoMelhorarArranjo: () => {
    if (CA.melhorarArranjo(estado)) {
      mostrarMensagem(`🔯 Arranjo de Reunião de Energia nível ${estado.arranjo}: Cultivo +${Math.round(P.bonusDoArranjo(estado) * 100)}%.`);
      salvar(estado);
    } else {
      mostrarMensagem(`Faltam ${formatarNumero(subtrair(CA.custoDoArranjo(estado), saldo(estado, 'pedras')))} Pedras Espirituais para melhorar o Arranjo.`);
    }
    atualizarInterface(estado);
  },
  aoRefinarFonteEstelar: () => {
    if (CA.refinarFonteEstelar(estado)) {
      animarRompimento();
      mostrarMensagem(`🌟 Você refinou a Fonte Estelar e se tornou um Mestre Estelar! Cultivo +${Math.round(CONFIG.mestreEstelar.bonusCultivo * 100)}% para sempre.`);
      salvar(estado);
    } else if (!estado.mestreEstelar) {
      mostrarMensagem(`Faltam ${formatarNumero(subtrair(CA.custoDaFonteEstelar(estado), saldo(estado, 'cultivo')))} de Cultivo para refinar a Fonte Estelar.`);
    }
    atualizarInterface(estado);
  },
  aoUsarPilula: (id) => {
    const motivo = CA.motivoParaNaoUsarPilula(estado, id);
    if (motivo) { mostrarMensagem(motivo); return; }
    const r = CA.usarPilula(estado, id);
    if (!r) return;
    mostrarMensagem(r.ganho !== undefined
      ? `💊 ${r.tipo.nome}: +${formatarNumero(r.ganho)} Cultivo!`
      : `💊 ${r.tipo.nome}: ${CA.textoDaPilula(estado, r.tipo)}`);
    salvar(estado);
    atualizarInterface(estado);
  },
  // "Gargalo": abre o Mapa no chefe que falta (ou na próxima fase a vencer, se ele ainda está trancado)
  aoIrAoChefe: () => {
    const requisito = P.requisitoDoRompimento(estado);
    if (!requisito || requisito.cumprido) return;
    const chefe = requisito.mapa * CONFIG.combate.fasesPorMapa - 1;
    const alvo = faseLiberada(estado, chefe) ? chefe : estado.combate.fasesConcluidas + 1;
    focarMapaDaFase(alvo);
    trocarAba('mapa');
    atualizarInterface(estado);
  },
  aoEscolherFase: (indice) => {
    // v0.21.0: escolher uma fase para lutar tira o personagem da Reclusão
    if (estado.reclusao.ativa && faseLiberada(estado, indice)) {
      CA.alternarReclusao(estado);
      mostrarMensagem('🏔️ Você saiu da Reclusão para lutar.');
    }
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
  // v0.33.0: tela de Opções → gerenciamento automático (muda e salva na hora)
  aoConfigurarAutomacao: (mudar) => {
    mudar(estado);
    salvar(estado);
    atualizarInterface(estado);
  },
  aoMudarAutoCombate: (ligado) => {
    estado.combate.autoAvancar = ligado;
    estado.combate.derrota = null;   // v0.33.0: escolha do jogador — a retomada automática não desfaz
  },
  aoSalvar: () => {
    const resultado = salvar(estado);
    mostrarMensagem(resultado?.sucesso === false ? 'Não foi possível salvar. Sua cópia original foi preservada; verifique o espaço disponível no navegador.' : 'Jogo salvo!');
  },
  aoResetar: () => {
    if (!confirm('Tem certeza? Todo o progresso será apagado.')) return;
    BOSS.abandonarLuta(estado, aoEventoBoss);
    apagarSave();
    estado = criarEstadoInicial();
    C.reiniciarLuta();
    atualizarInterface(estado);
    abrirCriacao();   // novo jogo: cria o personagem de novo
  },
});

// 3.5) Criação de personagem: aparece em jogos novos e em saves antigos sem personagem
montarTelaCriacao((escolha) => {
  const trocandoClasse = precisaTrocarClasse(estado);
  if (!criarPersonagem(estado, escolha)) return;
  C.reiniciarLuta();       // a próxima luta já usa a classe escolhida
  salvar(estado);
  atualizarInterface(estado);
  const classe = CLASSE_POR_ID[estado.personagem.classe];
  mostrarModal(trocandoClasse ? `Um novo caminho, ${estado.personagem.nome}!` : `Bem-vindo, ${estado.personagem.nome}!`,
    `Você trilha o caminho do ${classe.nome}.\n\n${classe.descricao}\n\n` +
    `${classe.nomeEspecial}: ${classe.textoEspecial}\n\n` +
    (trocandoClasse ? 'Seu progresso continua de onde parou.'
      : 'Sua jornada começa como um servo insignificante. Cultive, fique mais forte e descubra o que existe além do horizonte.'));
});
if (precisaCriarPersonagem(estado)) abrirCriacao();
else if (precisaTrocarClasse(estado)) abrirCriacao(estado.personagem);   // v0.27.2: a classe dele saiu do jogo

// 4) Loop do jogo: roda 10 vezes por segundo, usando o tempo REAL que passou

// v0.33.0: com o jogo na tela, o que a automação faz vai para o registro do combate (sem encher de avisos)
function aoAutomacaoNaTela(relatorio) {
  const texto = textoDaAutomacao(relatorio);
  if (texto) registrarBatalha(`🤖 ${texto}`, 'automacao');
  salvar(estado);
}
const OUVINTES_NA_TELA = {
  aoAvancarNivel, aoEventoCombate, aoAutomacao: aoAutomacaoNaTela,
  combatePausado: () => Boolean(BOSS.lutaDoBoss()),
};

// Mais que isso entre um passo e outro = o jogo ficou parado (segundo plano no celular,
// aba escondida...). Esse tempo vai para a simulação offline em vez do passo normal
// (antes ele era jogado de uma vez: sem resumo, sem limite e com uma enxurrada de avisos).
const PAUSA_LONGA = 10;
let cliquesVip = 0;   // fração de clique acumulada do Meditar automático do VIP

setInterval(async () => {
  if (processandoFora || falhaNoProgresso) return;
  const agora = Date.now();
  const segundos = (agora - ultimoTick) / 1000;
  ultimoTick = agora;

  if (segundos > PAUSA_LONGA) {
    await somarTempoFora(segundos);
    return;
  }
  if (document.hidden) {
    await somarTempoFora(segundos, false);
    return;
  }

  // VIP: Meditar automático (CONFIG.vip.cliquesPorSegundo), só com o jogo aberto na tela
  if (estado.vip && estado.opcoes.meditarAuto && !document.hidden) {
    cliquesVip += segundos * CONFIG.vip.cliquesPorSegundo;
    while (cliquesVip >= 1) { P.meditar(estado); cliquesVip -= 1; }
  }

  // Evento de Boss: enquanto você luta contra o boss, o combate das fases fica em pausa
  BOSS.atualizarBoss(estado);
  // "Atacar sozinho" (tela do boss): começa a luta assim que puder — com o jogo aberto na tela
  if (estado.opcoes.bossAuto && BOSS.podeLutar(estado)) BOSS.comecarLuta(estado);
  if (BOSS.lutaDoBoss()) BOSS.atualizarLutaDoBoss(estado, segundos, aoEventoBoss);
  // v0.33.0: cultivo, combate das fases e automação andam pelo motor, em passos de 1 s de jogo
  MOTOR.avancar(estado, segundos, OUVINTES_NA_TELA);
  atualizarInterface(estado);
}, 100);

// 5) Salvamento automático + ao esconder/fechar a aba
setInterval(() => salvar(estado), CONFIG.intervaloAutoSave);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) salvar(estado);
  else if (!processandoFora) mostrarResumoFora();
});
window.addEventListener('beforeunload', () => salvar(estado));

// 6) No site publicado: app no celular + aviso de nova versão (salva antes de atualizar)
iniciarSite(() => salvar(estado));

atualizarInterface(estado);

// v0.32.0: aviso único da progressão contínua (save convertido em save.js)
if (estado.avisoProgressao) {
  const m = estado.avisoProgressao;
  delete estado.avisoProgressao;
  salvar(estado);
  const recorde = m.recorde >= 0 ? `Sua maior conquista foi preservada: ${nomeDaPosicao(Math.floor(m.recorde / FASES_POR_MAPA))}, ` +
    `fase ${m.recorde % FASES_POR_MAPA + 1}. ` : '';
  mostrarModal('🌌 A jornada agora é contínua!',
    'A reencarnação obrigatória saiu do jogo. Agora você nunca precisa voltar ao começo (reencarnar ficou opcional, no Black Book):\n\n' +
    '• Depois do Fácil vêm Normal, Difícil, Inferno e Infinito, com os mesmos mapas num patamar acima.\n' +
    '• Depois do Fruto do Universo, o cultivo continua na Maestria da Criação.\n' +
    '• A Essência da Alma vem das conquistas inéditas e do farm (tempo de luta vencida).\n' +
    '• Os equipamentos multiplicam o seu cultivo (Ataque, Vitalidade, Defesa e Velocidade em %), sem o limite do reino.\n\n' +
    recorde + (m.nivelDepois > m.nivelAntes ? 'Seu cultivo subiu para o nível comprovado nas vidas anteriores. ' : '') +
    'Itens, Pedras, Essência, Black Book, Núcleos, Arranjo e pílulas foram mantidos' +
    (m.reencarnacoes > 0 ? `; o registro das suas ${m.reencarnacoes} reencarnações fica no Black Book.` : '.'));
}

// v0.33.0: valores inválidos encontrados no save (não somem em silêncio: aviso + cópia de segurança)
if (estado.avisoNumeros) {
  const lista = estado.avisoNumeros.map(i => `• ${i.campo}: ${i.valor}`).join('\n');
  const copia = estado.avisoNumerosCopia;
  delete estado.avisoNumeros;
  delete estado.avisoNumerosCopia;
  salvar(estado);
  mostrarModal('⚠️ Valores inválidos no save',
    'Alguns números do seu save estavam inválidos e foram trocados por 0:\n\n' + lista +
    (copia?.sucesso
      ? `\n\nO save imediatamente anterior ao reparo foi preservado no navegador (${copia.chave}).`
      : '\n\nNão foi possível criar a cópia de segurança. O save original permanece intacto e não será substituído enquanto a cópia não puder ser criada. Verifique o espaço disponível no navegador.'));
}

// v0.14.0: aviso único da reformulação do Black Book (save convertido em save.js)
if (estado.essenciaDevolvidaBB !== undefined) {
  const devolvida = estado.essenciaDevolvidaBB;
  delete estado.essenciaDevolvidaBB;
  salvar(estado);
  mostrarModal('📕 O Black Book foi reformulado!',
    'Força, Vitalidade, Defesa, Velocidade e Cultivo agora MULTIPLICAM a cada nível ' +
    '(cada nível vale sempre o mesmo, em vez de valer cada vez menos).\n\n' +
    'Seus níveis foram convertidos sem perder força' +
    (devolvida > 0 ? ` e o Black Book devolveu ${formatarNumero(devolvida)} ✨ Essência da Alma — use nas melhorias!` : '.'));
}

// Só começa depois de montar controles/avisos. Um lote interrompido já está no relógio salvo;
// o novo tempo fora é acrescentado uma vez, limitado separadamente ao teto offline.
if (tempoFora > 5 || estado.relogio.resto >= MOTOR.PASSO) {
  await somarTempoFora(tempoFora);
}
