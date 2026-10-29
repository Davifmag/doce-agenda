const VERSION = 'v17.5';
const CACHE = 'doces-' + VERSION;
const ARQUIVOS = ['./', './index.html', './style.css', './app.js', './manifest.json',
  './icons/icon-192.png', './icons/icon-512.png','./logo.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  const mesmaOrigem = url.origin === location.origin;
  const fonte = url.hostname.endsWith('googleapis.com') || url.hostname.endsWith('gstatic.com') || url.hostname === 'cdn.jsdelivr.net';
  if (!mesmaOrigem && !fonte) return;

  e.respondWith(
    caches.match(e.request).then(guardado => {
      const rede = fetch(e.request).then(resp => {
        if (resp && (resp.ok || resp.type === 'opaque')) {
          const copia = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, copia));
        }
        return resp;
      }).catch(() => guardado || caches.match('./index.html'));
      return guardado || rede; // abre rápido do cache e atualiza em segundo plano
    })
  );
});
