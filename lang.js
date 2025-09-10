
(function(){
  function applyI18N(lang){
    document.documentElement.lang = (lang==='de')?'de':'en';
    var dict = (window.I18N||{})[lang]||{};
    document.querySelectorAll('[data-i18n]').forEach(function(el){
      var key = el.getAttribute('data-i18n');
      if (dict[key]) el.innerHTML = dict[key];
    });
    var en = document.getElementById('lang-en');
    var de = document.getElementById('lang-de');
    if(en&&de){ en.classList.toggle('active', lang==='en'); de.classList.toggle('active', lang==='de'); }
  }
  window.setLang = function(lang){
    localStorage.setItem('lang', lang);
    applyI18N(lang);
  };
  window.initLang = function(){
    var params = new URLSearchParams(location.search);
    var urlLang = params.get('lang');
    var stored = localStorage.getItem('lang');
    var initial = (urlLang==='de' || urlLang==='en') ? urlLang : (stored || 'en');
    applyI18N(initial);
    var en = document.getElementById('lang-en');
    var de = document.getElementById('lang-de');
    if(en) en.onclick = function(){ setLang('en'); };
    if(de) de.onclick = function(){ setLang('de'); };
  };
})();