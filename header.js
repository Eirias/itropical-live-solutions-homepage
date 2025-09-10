// header.js
// Dynamically load the shared header into #site-header
(function () {
  const mount = document.getElementById('site-header');
  if (!mount) return;

  // Resolve header.html relative to this script (works in /<repo>/ and root)
  const base = new URL('.', (document.currentScript || document.scripts[document.scripts.length - 1]).src);
  const headerUrl = new URL('header.html', base).toString();

  fetch(headerUrl)
    .then(r => r.text())
    .then(html => {
      mount.innerHTML = html;
      // Re-run language init if available
      if (window.initLang) window.initLang();
    })
    .catch(err => console.error('Header load failed:', err));
})();