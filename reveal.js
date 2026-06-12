/* reveal.js — scroll-reveal via IntersectionObserver. No deps. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var els = document.querySelectorAll('main [data-reveal]');
  if (!els.length) return;

  if (reduce.matches || !('IntersectionObserver' in window)) {
    els.forEach(function (el) { el.classList.add('is-revealed'); });
    return;
  }

  document.documentElement.classList.add('reveal-ready');

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      // Stagger siblings that share the same parent (e.g. cards in a grid)
      var group = el.parentElement.querySelectorAll(':scope > [data-reveal]');
      var i = Array.prototype.indexOf.call(group, el);
      el.style.transitionDelay = Math.min(i, 5) * 70 + 'ms';
      el.classList.add('is-revealed');
      io.unobserve(el);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });

  els.forEach(function (el) { io.observe(el); });
})();
