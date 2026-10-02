// Service worker: la app abre sin cobertura (tejados, naves, zonas rurales)
const VERSION = 'gesolar-v4';
const BASE = ['./', './index.html', './config.js', './manifest.json', './logo.png', './icons/icon-192.png', './icons/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(BASE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;                        // las llamadas al servidor (POST) no se cachean
  const url = new URL(req.url);
  const propio = url.origin === self.location.origin;
  const fuentes = /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (!propio && !fuentes) return;
  e.respondWith(
    caches.open(VERSION).then(async cache => {
      const guardado = await cache.match(req, { ignoreSearch: propio });
      const red = fetch(req).then(r => { if (r && (r.ok || r.type === 'opaque')) cache.put(req, r.clone()); return r; }).catch(() => guardado);
      return guardado || red;
    })
  );
});
