// =============================================================
// sw.js — "SERVICE WORKER" (deixa o jogo funcionar como app no celular)
//
// Regra: sempre tenta baixar a versão mais nova do site primeiro.
// Sem internet, usa a última cópia guardada — o jogo abre mesmo offline.
// Só é usado no site publicado (no localhost ele não é registrado).
// =============================================================
const CACHE = 'blackbook-idle';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (evento) => evento.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (evento) => {
  const pedido = evento.request;
  if (pedido.method !== 'GET' || new URL(pedido.url).origin !== self.location.origin) return;
  // O arquivo de versão nunca vem do cache (é ele que avisa que há atualização)
  if (pedido.url.includes('versao-site.txt')) return;

  evento.respondWith(
    fetch(pedido, { cache: 'no-cache' })
      .then((resposta) => {
        if (resposta.ok) {
          const copia = resposta.clone();
          caches.open(CACHE).then((cache) => cache.put(pedido, copia));
        }
        return resposta;
      })
      .catch(() => caches.match(pedido).then((guardada) => guardada || Response.error())),
  );
});
