// sw.js — simple cache-first for shared header & assets
const CACHE = 'site-cache-v1';
const PRECACHE = [
  '/header.html',
  '/styles.css',
  '/i18n.js',
  '/lang.js',
  '/header.js',
  '/logo.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(PRECACHE))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Cache-first: return cached immediately, update in background
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  if (PRECACHE.some(path => request.url.includes(path))) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const networkFetch = fetch(request).then((resp) => {
          if (resp && resp.ok) {
            caches.open(CACHE).then(c => c.put(request, resp.clone()));
          }
          return resp;
        });
        return cached || networkFetch;
      })
    );
  }
});