// =============================================================
// sistemas/reencarnacao.js — REENCARNAÇÃO OPCIONAL E MARCA DA ALMA (v0.34.0)
//
// A reencarnação voltou, OPCIONAL (quem nunca reencarna joga exatamente a campanha calibrada):
//   - libera ao vencer o chefe do Mapa CONFIG.reencarnacao.mapaParaLiberar (global);
//   - recomeça o CULTIVO (Cultivo guardado, reino, estágio, Maestria, Fonte Estelar) e a jornada volta, com o avanço
//     automático ligado, para o Fácil 1-1 — ou, longe no jogo, para no máximo CONFIG.reencarnacao.voltaMaximaEmMapas
//     mapas antes do recorde (sem esse limite a volta crescia sem fim). As fases já conquistadas continuam
//     conquistadas (a 1ª conquista não paga de novo; nos mundos já zerados os inimigos comuns fogem);
//   - FICA todo o resto: Black Book, Essência, itens, Pedras, Arranjo, Núcleos, pílulas, Boss, VIP, opções,
//     dificuldades liberadas e "a alma se lembra" (maior Sentido Divino já alcançado).
// Marca da Alma = o que a vida rendeu. O nível vem do RECORDE de mapas vencidos (1 nível a cada mapasPorMarca),
// não do número de vidas: só dá para reencarnar quando a Marca subiria — reencarnar sem ir mais longe não rende.
// Cada nível soma bonusPorMarca em Ataque, Vitalidade e Defesa (atributos.js). Como a força dos inimigos MULTIPLICA
// a cada mapa e a Marca SOMA, ela vale sempre alguns mapas de vantagem — não desequilibra o fim do jogo.
// =============================================================
import { CONFIG } from '../config.js';
import { calcularAtributos } from './atributos.js';
import { somar, subtrair, maximo } from '../numeros.js';

const RC = CONFIG.reencarnacao;
const FASES_POR_MAPA = CONFIG.combate.fasesPorMapa;

// Mapas globais já vencidos (o chefe do mapa vencido conta o mapa inteiro)
export function mapasVencidos(estado) {
  return Math.floor((estado.combate.fasesConcluidas + 1) / FASES_POR_MAPA);
}

// Nível da Marca que um recorde de "mapas" vencidos dá (0 antes de liberar)
export function marcaDoRecorde(mapas) {
  if (mapas < RC.mapaParaLiberar) return 0;
  return 1 + Math.floor((mapas - RC.mapaParaLiberar) / RC.mapasPorMarca);
}
export const marcaAtual = (estado) => estado.reencarnacao?.marca ?? 0;
export const marcaPossivel = (estado) => Math.max(marcaAtual(estado), marcaDoRecorde(mapasVencidos(estado)));

// Mapa global (contando de 1) que é preciso vencer para a Marca subir mais um nível
export function mapaDaProximaMarca(estado) {
  const proxima = marcaPossivel(estado) + 1;
  return RC.mapaParaLiberar + (proxima - 1) * RC.mapasPorMarca;
}

// Multiplicador de Ataque, Vitalidade e Defesa de um nível da Marca (soma: nível 10 com 0,1 = ×2)
export const bonusDaMarca = (marca) => 1 + RC.bonusPorMarca * marca;

// Fase em que a jornada recomeça depois de reencarnar: Fácil 1-1 no começo do jogo; depois, no máximo
// voltaMaximaEmMapas mapas antes do recorde
export const faseDaVolta = (estado) => Math.max(0, mapasVencidos(estado) - RC.voltaMaximaEmMapas) * FASES_POR_MAPA;

export function podeReencarnar(estado) {
  return Boolean(estado.personagem) && marcaPossivel(estado) > marcaAtual(estado);
}

const essenciaGanhaAteAgora = (estado) => somar(estado.estatisticas.essenciaConquistas ?? 0, estado.estatisticas.essenciaFarm ?? 0);

// Reencarna NO PRÓPRIO estado (o motor, a automação e a tela continuam com o mesmo objeto).
// Quem chama reinicia a luta em andamento (combate.reiniciarLuta). Devolve { marca, vida } ou null.
export function reencarnar(estado) {
  if (!podeReencarnar(estado)) return null;
  const r = estado.reencarnacao;
  const marca = marcaPossivel(estado);
  // "A alma se lembra" (v0.12.0): o Sentido Divino é da alma — guarda o maior já alcançado
  const sentido = calcularAtributos(estado, { selado: false }).sentidoDivino;
  const vida = {
    numero: r.vezes + 1,
    reino: estado.reino,
    estagio: estado.estagio,
    maestria: estado.maestria ?? 0,
    fase: estado.combate.fasesConcluidas,
    // duração em segundos de jogo (inclui o offline); null = vida de antes do registro existir
    segundos: r.tempoNoInicio === undefined && r.vezes > 0 ? null : estado.estatisticas.tempoJogado - (r.tempoNoInicio ?? 0),
    essencia: maximo(0, subtrair(essenciaGanhaAteAgora(estado), r.essenciaNoInicio ?? 0)),   // ganha nesta vida
    marca,
    quando: Date.now(),
  };
  r.historico = [...(r.historico ?? []), vida].slice(-RC.vidasNoRegistro);
  r.vezes += 1;
  r.marca = marca;
  r.melhorFaseDeTodas = Math.max(r.melhorFaseDeTodas ?? -1, estado.combate.fasesConcluidas);
  r.faseDaUltima = estado.combate.fasesConcluidas;
  r.sentidoDivinoMaximo = maximo(r.sentidoDivinoMaximo ?? 0, sentido);
  r.tempoNoInicio = estado.estatisticas.tempoJogado;
  r.essenciaNoInicio = essenciaGanhaAteAgora(estado);

  // O que recomeça: o cultivo e o lugar da jornada
  estado.cultivo = 0;
  if (estado.residuos) delete estado.residuos.cultivo;
  estado.reino = 0;
  estado.estagio = 0;
  estado.maestria = 0;
  estado.mestreEstelar = false;
  estado.reclusao = { ativa: false, segundos: 0 };
  const c = estado.combate;
  c.faseAtual = faseDaVolta(estado);
  c.autoAvancar = true;
  c.derrota = null;
  c.luta = null;
  return { marca, vida };
}
