// =============================================================
// site.js — APP NO CELULAR E AVISO DE ATUALIZAÇÃO
// Só funciona no site publicado (GitHub Pages). No localhost não faz nada.
//
// 1. Registra o sw.js (o jogo abre como app e funciona sem internet).
// 2. A cada 5 minutos confere o arquivo versao-site.txt (o script
//    ferramentas/publicar.ps1 troca esse arquivo a cada publicação).
//    Se mudou, mostra "Nova versão disponível" com um botão para atualizar.
// =============================================================
const LOCAL = ['localhost', '127.0.0.1', ''].includes(location.hostname);
const INTERVALO = 5 * 60 * 1000;

async function versaoPublicada() {
  try {
    const resposta = await fetch(`versao-site.txt?t=${Date.now()}`, { cache: 'no-store' });
    return resposta.ok ? (await resposta.text()).trim() : null;
  } catch {
    return null;   // sem internet: tenta de novo depois
  }
}

function mostrarAviso(aoAtualizar) {
  if (document.getElementById('aviso-atualizacao')) return;
  const aviso = document.createElement('button');
  aviso.id = 'aviso-atualizacao';
  aviso.className = 'aviso-atualizacao';
  aviso.textContent = '✨ Nova versão disponível — toque para atualizar';
  aviso.addEventListener('click', aoAtualizar);
  (document.getElementById('jogo') ?? document.body).appendChild(aviso);
}

// aoAtualizar: salva o jogo antes de recarregar a página
export function iniciarSite(aoAtualizar) {
  if (LOCAL) return;
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});

  let versaoAtual = null;
  const conferir = async () => {
    const versao = await versaoPublicada();
    if (!versao) return;
    if (versaoAtual === null) versaoAtual = versao;
    else if (versao !== versaoAtual) mostrarAviso(() => { aoAtualizar(); location.reload(); });
  };
  conferir();
  setInterval(conferir, INTERVALO);
  // Ao voltar para o app (celular), confere na hora
  document.addEventListener('visibilitychange', () => { if (!document.hidden) conferir(); });
}
