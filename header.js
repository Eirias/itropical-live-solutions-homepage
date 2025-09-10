(function () {
  const mount = document.getElementById('site-header');
  if (!mount) return;

  fetch('/header.html')
    .then(r => r.text())
    .then(html => {
      mount.innerHTML = html;
      if (window.initLang) window.initLang();
    })
    .catch(err => console.error('Header load failed:', err));
})();