// =============================================================
// save.js — salvar, carregar e calcular tempo offline
// O save fica no navegador (localStorage), no próprio computador.
// =============================================================
import { CONFIG } from './config.js';
import { criarEstadoInicial } from './estado.js';
import { REINOS } from './dados/reinos.js';
import { FASES } from './sistemas/mundo.js';
import { corrigirMelhoriasAntigas } from './sistemas/blackbook.js';
import { recalcularItem } from './sistemas/equipamentos.js';

const CHAVE_DO_SAVE = 'blackbook-idle-save-v1';

export function salvar(estado) {
  estado.ultimoSave = Date.now();
  localStorage.setItem(CHAVE_DO_SAVE, JSON.stringify(estado));
}

// Devolve o estado salvo, ou null se não existir / estiver corrompido
export function carregar() {
  try {
    const texto = localStorage.getItem(CHAVE_DO_SAVE);
    if (!texto) return null;

    const dados = JSON.parse(texto);
    const padrao = criarEstadoInicial();

    // Mescla com o padrão: se no futuro adicionarmos campos novos,
    // saves antigos recebem o valor padrão em vez de quebrar.
    const estado = {
      ...padrao,
      ...dados,
      combate: { ...padrao.combate, ...dados.combate },
      equipados: { ...padrao.equipados, ...dados.equipados },
      mochila: Array.isArray(dados.mochila) ? dados.mochila : [],
      blackbook: { ...padrao.blackbook, ...dados.blackbook },
      nucleos: { ...padrao.nucleos, ...dados.nucleos },
      pontosNucleo: { ...padrao.pontosNucleo, ...dados.pontosNucleo },
      reencarnacao: { ...padrao.reencarnacao, ...dados.reencarnacao },
      opcoes: { ...padrao.opcoes, ...dados.opcoes },
      estatisticas: { ...padrao.estatisticas, ...dados.estatisticas },
    };

    // ---- Atualização de saves antigos ----
    // Antes da v0.4.0: Pedras do combate + "Treinamento" desbalanceado → zera os dois.
    if (versaoMenorQue(dados.versao, '0.4.0')) {
      estado.pedras = 0;
    }
    // Na v0.4.0 a recompensa da reencarnação se chamava "pedras". A partir da v0.5.0
    // ela é a Essência da Alma, e as Pedras voltaram a cair nas fases.
    if (versaoMenorQue(dados.versao, '0.5.0')) {
      estado.essencia = versaoMenorQue(dados.versao, '0.4.0') ? 0 : (dados.pedras || 0);
      estado.reencarnacao.essenciaTotal = dados.reencarnacao?.pedrasTotais || 0;
      delete estado.reencarnacao.pedrasTotais;
      estado.pedras = 0;
    }
    // v0.8.1: Esquiva saiu do Black Book e Crítico/Dano Crítico ganharam nível máximo
    corrigirMelhoriasAntigas(estado);
    // v0.9.2: atributos dos itens ficaram FIXOS por tipo — refaz os itens antigos
    // (mantém tipo, tier, estrelas, nível e o mapa onde caíram)
    if (versaoMenorQue(dados.versao, '0.9.2')) {
      for (const slot in estado.equipados) estado.equipados[slot] = recalcularItem(estado.equipados[slot]);
      estado.mochila = estado.mochila.map(recalcularItem);
    }
    delete estado.treino;
    estado.versao = CONFIG.versao;

    // Proteções: não deixa o save apontar para algo que não existe
    // Hora do último save inválida ou no futuro (relógio do celular mudou): conta como "agora",
    // para o progresso offline nunca dar tempo negativo nem gigante.
    if (!Number.isFinite(estado.ultimoSave) || estado.ultimoSave > Date.now()) estado.ultimoSave = Date.now();
    estado.reino = Math.min(Math.max(0, estado.reino), REINOS.length - 1);
    estado.estagio = Math.min(Math.max(0, estado.estagio), REINOS[estado.reino].estagios.length - 1);
    const c = estado.combate;
    c.fasesConcluidas = Math.min(Math.max(-1, c.fasesConcluidas), FASES.length - 1);
    c.faseAtual = Math.min(Math.max(0, c.faseAtual), c.fasesConcluidas + 1, FASES.length - 1);

    return estado;
  } catch (erro) {
    console.error('Save corrompido, começando do zero.', erro);
    return null;
  }
}

// Compara versões no formato "0.3.0". Ex.: versaoMenorQue('0.3.0', '0.4.0') → true
function versaoMenorQue(versao, outra) {
  const a = String(versao || '0').split('.').map(Number);
  const b = outra.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if ((a[i] || 0) !== (b[i] || 0)) return (a[i] || 0) < (b[i] || 0);
  }
  return false;
}

export function apagarSave() {
  localStorage.removeItem(CHAVE_DO_SAVE);
}

// Quantos segundos o jogador ficou fora (limitado pelo máximo do config)
export function segundosOffline(estado) {
  const segundos = (Date.now() - estado.ultimoSave) / 1000;
  const maximo = CONFIG.maxHorasOffline * 3600;
  return Math.max(0, Math.min(segundos, maximo));
}
