// sw.js — cache-first strategy for shared assets
const CACHE = 'site-cache-v1';
const PRECACHE = [
  'header.html',
  'styles.css',
  'i18n.js',
  'lang.js',
  'header.js',
  'logo.png'
];

// On install: pre-cache important files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(PRECACHE))
  );
});

// On activate: take control immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// On fetch: cache-first strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const isCacheable = PRECACHE.some(path => url.pathname.endsWith('/' + path));

  if (isCacheable) {
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