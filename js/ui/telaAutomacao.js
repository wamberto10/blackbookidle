// =============================================================
// ui/telaAutomacao.js — "Gerenciamento automático" na tela de Opções (v0.33.0)
// Liga/desliga cada automação (sistemas/automacao.js) e mostra a ordem em que elas agem, as reservas e a última
// coisa que a automação fez. Toda mudança passa por acoes.aoConfigurarAutomacao(função que muda o estado).
// =============================================================
import { CONFIG } from '../config.js';
import { formatarNumero, lerNumero, formatarTempo } from '../format.js';
import { TIPOS_DE_PILULA } from '../sistemas/cultivoAvancado.js';
import { parametrosDaRetomada, MINUTOS_MINIMOS_RETOMADA, MELHORIA_MINIMA_RETOMADA } from '../sistemas/automacao.js';

const $ = (id) => document.getElementById(id);
let chaveDesenhada = '';

const NOMES_BB = Object.fromEntries(CONFIG.blackbook.melhorias.map(m => [m.id, m.nome]));

export function montarTelaAutomacao(acoes) {
  const caixa = $('automacao');
  // Um único ouvinte para a caixa toda: cada controle diz o que muda em data-campo
  const confirmarCampo = (ev) => {
    const el = ev.target;
    const campo = el.dataset.campo;
    if (!campo) return;
    let valor = el.type === 'checkbox' ? el.checked : el.value;
    if (el.dataset.tipo === 'numero') {
      valor = lerNumero(el.value);
      if (typeof valor === 'number' && Number.isNaN(valor)) { el.classList.add('auto-erro'); el.title = 'Use um número: 1500, 2.5M, 3e40...'; return; }
      el.classList.remove('auto-erro'); el.title = '';
    }
    if (el.dataset.tipo === 'porcento') valor = Math.min(100, Math.max(0, Number(el.value) || 0)) / 100;
    if (el.dataset.tipo === 'inteiro') valor = Math.max(0, Math.floor(Number(el.value) || 0));
    if (campo === 'retomada.minutos') valor = Math.max(MINUTOS_MINIMOS_RETOMADA, valor);
    if (campo === 'retomada.melhoria') valor = Math.max(MELHORIA_MINIMA_RETOMADA, valor);
    // Também confirma por perda de foco: teclado virtual e preenchimentos do navegador podem
    // não emitir change. Mostra o valor normalizado mesmo quando a configuração já era igual.
    if (el.type === 'text') el.value = el.dataset.tipo === 'porcento' ? Math.round(valor * 100)
      : el.dataset.tipo === 'inteiro' ? valor : formatarNumero(valor);
    acoes.aoConfigurarAutomacao((estado) => definir(estado, campo, valor));
  };
  caixa.addEventListener('change', confirmarCampo);
  caixa.addEventListener('focusout', (ev) => { if (ev.target.type === 'text') confirmarCampo(ev); });
  caixa.addEventListener('click', (ev) => {
    const botao = ev.target.closest('[data-mover]');
    if (!botao) return;
    const [id, lado] = botao.dataset.mover.split('|');
    acoes.aoConfigurarAutomacao((estado) => {
      const ordem = estado.automacao.blackbook.ordem;
      const i = ordem.indexOf(id), j = i + Number(lado);
      if (i < 0 || j < 0 || j >= ordem.length) return;
      [ordem[i], ordem[j]] = [ordem[j], ordem[i]];
    });
  });
}

// "blackbook.reserva" → estado.automacao.blackbook.reserva | "opcoes.autoAvancar" → estado.opcoes.autoAvancar
function definir(estado, campo, valor) {
  const partes = campo.split('.');
  let alvo = partes[0] === 'opcoes' ? estado.opcoes : estado.automacao;
  const resto = partes[0] === 'opcoes' ? partes.slice(1) : partes;
  for (const p of resto.slice(0, -1)) alvo = alvo[p];
  alvo[resto.at(-1)] = valor;
}

const marcado = (v) => (v ? ' checked' : '');
const caixaDeMarcar = (campo, ligado, texto) =>
  `<label class="auto-linha"><input type="checkbox" data-campo="${campo}"${marcado(ligado)}><span>${texto}</span></label>`;
const numero = (campo, valor, texto, tipo = 'numero') =>
  `<label class="auto-linha auto-num"><span>${texto}</span><input type="text" inputmode="decimal" data-campo="${campo}" data-tipo="${tipo}" ` +
  `value="${tipo === 'porcento' ? Math.round(valor * 100) : tipo === 'inteiro' ? valor : formatarNumero(valor)}"></label>`;
const opcao = (campo, valor, atual, texto) =>
  `<label class="auto-linha"><input type="radio" name="${campo}" data-campo="${campo}" value="${valor}"${marcado(atual === valor)}><span>${texto}</span></label>`;

export function atualizarTelaAutomacao(estado, aberto) {
  if (!aberto) return;
  const a = estado.automacao;
  const { ultima } = a;
  const config = { ...a, segundos: 0, ultima: null };   // o relógio da automação muda a cada segundo: não redesenha
  const chave = JSON.stringify(config) + estado.opcoes.autoAvancar + estado.vip + JSON.stringify(ultima);
  if (chave === chaveDesenhada) return;
  chaveDesenhada = chave;
  const bb = a.blackbook;
  const retomada = parametrosDaRetomada(a.retomada);
  const lista = bb.ordem.map((id, i) => `<li class="auto-bb">
      <label><input type="checkbox" data-campo="blackbook.permitidas.${id}"${marcado(bb.permitidas[id])}><span>${i + 1}. ${NOMES_BB[id]}</span></label>
      <span class="auto-setas"><button class="botao-icone" data-mover="${id}|-1" ${i === 0 ? 'disabled' : ''} aria-label="Subir">▲</button>` +
      `<button class="botao-icone" data-mover="${id}|1" ${i === bb.ordem.length - 1 ? 'disabled' : ''} aria-label="Descer">▼</button></span></li>`).join('');
  const pilulas = TIPOS_DE_PILULA.map(t => `<div class="auto-pilula">${caixaDeMarcar(`pilulas.${t.id}`, a.pilulas[t.id], t.nome.replace(/^Pílula (d[oa] )?/, ''))}` +
    numero(`pilulas.minimo.${t.id}`, a.pilulas.minimo[t.id] ?? 0, 'manter no estoque', 'inteiro') + '</div>').join('');
  const ultimaVez = ultima ? `Última ação: ${formatarTempo(Math.max(0, estado.estatisticas.tempoJogado - ultima.em))} atrás de jogo — ${resumo(ultima)}.`
    : 'A automação ainda não fez nada.';

  $('automacao').innerHTML = `
    <h3>🤖 Gerenciamento automático</h3>
    <p class="pequeno">Tudo começa desligado. Ligado, roda a cada ${CONFIG.automacao.intervaloSegundos} s de jogo — com o jogo aberto,
      em segundo plano e offline (no máximo ${CONFIG.maxHorasOffline} h), nos mesmos momentos. Ordem de cada rodada:
      <b>1</b> pílulas · <b>2</b> Fonte Estelar · <b>3</b> Black Book · <b>4</b> Arranjo · <b>5</b> equipamentos · <b>6</b> Núcleos ·
      <b>7</b> religar o combate. Reserva = o saldo que sobra <b>depois</b> de cada compra nunca fica abaixo dela.</p>
    <p class="pequeno auto-ultima">${ultimaVez}</p>

    <fieldset><legend>Cultivo (a cada segundo)</legend>
      ${caixaDeMarcar('opcoes.autoAvancar', estado.opcoes.autoAvancar, 'Avançar estágios')}
      ${caixaDeMarcar('cultivo.reinos', a.cultivo.reinos, 'Romper reinos' + (estado.vip ? ' <small>(o VIP já rompe sozinho)</small>' : ''))}
      ${caixaDeMarcar('cultivo.maestria', a.cultivo.maestria, 'Subir a Maestria da Criação')}
      ${caixaDeMarcar('cultivo.fonteEstelar', a.cultivo.fonteEstelar, 'Refinar a Fonte Estelar (gasta Cultivo)')}
      <p class="pequeno">Só avança quando o Cultivo e o chefe exigido permitem — as mesmas regras do botão.</p>
    </fieldset>

    <fieldset><legend>${caixaDeMarcar('pilulas.ativo', a.pilulas.ativo, '1. Usar pílulas')}</legend>
      ${pilulas}
      <p class="pequeno">Acúmulo: usa até ${CONFIG.automacao.comprasPorExecucao} por rodada acima do estoque; o restante fica para a próxima.
        Fluxo: 1 por vez, quando nenhuma estiver fazendo efeito.
        Quebra-Gargalo: só quando o próximo avanço é um rompimento de reino.</p>
    </fieldset>

    <fieldset><legend>${caixaDeMarcar('blackbook.ativo', bb.ativo, '3. Comprar melhorias do Black Book')}</legend>
      ${opcao('blackbook.modo', 'barata', bb.modo, 'Mais barata primeiro (os níveis andam juntos)')}
      ${opcao('blackbook.modo', 'prioridade', bb.modo, 'Na ordem da lista abaixo')}
      <div class="auto-sub${bb.modo === 'prioridade' ? '' : ' auto-apagado'}">Se a da vez não couber:
        ${opcao('blackbook.seIndisponivel', 'esperar', bb.seIndisponivel, 'esperar juntando Essência para ela')}
        ${opcao('blackbook.seIndisponivel', 'pular', bb.seIndisponivel, 'comprar a próxima da lista')}
        <small>(melhoria no nível máximo é sempre pulada)</small></div>
      <ol class="auto-lista">${lista}</ol>
      ${numero('blackbook.reserva', bb.reserva, 'Reserva de Essência ✨')}
    </fieldset>

    <fieldset><legend>${caixaDeMarcar('arranjo.ativo', a.arranjo.ativo, '4. Melhorar o Arranjo de Reunião de Energia')}</legend>
      ${numero('arranjo.fracao', a.arranjo.fracao, 'Usar até (% das Pedras de cada rodada)', 'porcento')}
      ${numero('arranjo.reserva', a.arranjo.reserva, 'Reserva de Pedras 💎')}
    </fieldset>

    <fieldset><legend>${caixaDeMarcar('equipamentos.ativo', a.equipamentos.ativo, '5. Melhorar os equipamentos vestidos')}</legend>
      <p class="pequeno">Sempre o item vestido mais barato de melhorar, até o nível máximo dele. Vem depois do Arranjo.</p>
      ${numero('equipamentos.reserva', a.equipamentos.reserva, 'Reserva de Pedras 💎')}
    </fieldset>

    <fieldset><legend>${caixaDeMarcar('nucleos.ativo', a.nucleos.ativo, '6. Usar os Núcleos guardados')}</legend>
      <p class="pequeno">No atributo com menos pontos (Ataque, Vitalidade, Defesa e Velocidade ficam iguais).
        Até ${CONFIG.automacao.comprasPorExecucao} por rodada; os demais continuam guardados.</p>
    </fieldset>

    <fieldset><legend>${caixaDeMarcar('retomada.ativo', a.retomada.ativo, '7. Religar o avanço do combate depois de uma derrota')}</legend>
      ${numero('retomada.minutos', retomada.minutos, 'Esperar pelo menos (minutos de jogo)', 'inteiro')}
      ${numero('retomada.melhoria', retomada.melhoria, 'e o Poder ou a Velocidade subir pelo menos (%) desde a derrota', 'porcento')}
      <p class="pequeno">Mínimo: ${MINUTOS_MINIMOS_RETOMADA} minuto e ${MELHORIA_MINIMA_RETOMADA * 100}% de ganho.
        Perdeu de novo? Espera outra melhoria. "Farmar aqui" não é desfeito: o herói fica onde você mandou.</p>
    </fieldset>

    <fieldset><legend>${caixaDeMarcar('reencarnacao.ativo', a.reencarnacao?.ativo ?? false, '8. Reencarnar quando a Marca da Alma subir')}</legend>
      <p class="pequeno">A cada 12 mapas novos do seu recorde. O cultivo recomeça e a jornada volta ao Fácil 1-1 (longe no
        jogo, até 96 mapas antes do recorde); Black Book, Essência, itens, Pedras e fases conquistadas ficam. Também funciona
        com o jogo fechado.</p>
    </fieldset>`;
}

function resumo(r) {
  const p = [];
  if (r.blackbook) p.push(`+${r.blackbook} nível(is) no Black Book (−${formatarNumero(r.essenciaGasta)} ✨)`);
  if (r.arranjo) p.push(`Arranjo +${r.arranjo} (−${formatarNumero(r.pedrasArranjo)} 💎)`);
  if (r.itens) p.push(`${r.itens} melhoria(s) de item (−${formatarNumero(r.pedrasItens)} 💎)`);
  if (r.nucleos) p.push(`${r.nucleos} núcleo(s)`);
  const pilulas = r.pilulas.acumulo + r.pilulas.fluxo + r.pilulas.rompimento;
  if (pilulas) p.push(`${pilulas} pílula(s)`);
  if (r.fonteEstelar) p.push('Fonte Estelar refinada');
  if (r.retomou) p.push('avanço do combate religado');
  if (r.reencarnou) p.push(`reencarnou (Marca da Alma nível ${r.reencarnou})`);
  return p.join(', ');
}
