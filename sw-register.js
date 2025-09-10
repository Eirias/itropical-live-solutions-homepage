// sw-register.js
if ('serviceWorker' in navigator) {
  // Register as early as possible
  navigator.serviceWorker.register('/sw.js').catch(console.error);

  // Optional: ensure first visit becomes SW-controlled (once)
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!sessionStorage.getItem('sw-controlled')) {
      sessionStorage.setItem('sw-controlled', '1');
      location.reload();
    }
  });
}