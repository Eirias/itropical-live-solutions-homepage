// sw-register.js
// Registers the service worker in a relative-safe way
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('sw.js')
    .catch(console.error);
}