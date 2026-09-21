/* Shared public-site behaviour: mobile menu, footer year, scroll-to-top/bottom button. */
(function(){
  // FOOTER YEAR — always the current year
  document.querySelectorAll('[data-year]').forEach(function(el){
    el.textContent = String(new Date().getFullYear());
  });

  // HAMBURGER MENU
  var ham = document.getElementById('nav-ham');
  var mob = document.getElementById('mob-nav');
  if (ham && mob) {
    var setOpen = function(open){
      mob.classList.toggle('open', open);
      ham.classList.toggle('open', open);
      ham.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    };
    ham.addEventListener('click', function(){ setOpen(!mob.classList.contains('open')); });
    mob.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', function(){ setOpen(false); }); });
    document.addEventListener('keydown', function(e){ if (e.key === 'Escape' && mob.classList.contains('open')) setOpen(false); });
  }

  // SCROLL TOGGLE — points down near the top (jumps to bottom), up otherwise (jumps to top)
  var style = document.createElement('style');
  style.textContent = ''
    + '.scroll-toggle{position:fixed;right:24px;bottom:24px;z-index:90;width:46px;height:46px;border-radius:50%;'
    + 'border:1px solid var(--b2,rgba(148,163,184,.14));background:var(--card,rgba(15,26,46,.85));color:var(--t1,#F8FAFC);'
    + 'display:flex;align-items:center;justify-content:center;cursor:pointer;backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);'
    + 'box-shadow:0 10px 30px rgba(0,0,0,.28);transition:border-color .2s,background .2s,transform .2s,opacity .25s;opacity:0;pointer-events:none}'
    + '.scroll-toggle.show{opacity:1;pointer-events:auto}'
    + '.scroll-toggle:hover{border-color:var(--a,#2563EB);background:var(--glow,rgba(37,99,235,.18));transform:translateY(-2px)}'
    + '.scroll-toggle:focus-visible{outline:2px solid var(--a,#2563EB);outline-offset:3px}'
    + '.scroll-toggle svg{transition:transform .3s ease}'
    + '.scroll-toggle.up svg{transform:rotate(180deg)}'
    + '@media(max-width:768px){.scroll-toggle{right:16px;bottom:16px;width:42px;height:42px}}'
    + '@media print{.scroll-toggle{display:none}}';
  document.head.appendChild(style);

  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'scroll-toggle';
  btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>';
  document.body.appendChild(btn);

  var goingUp = false;
  function maxScroll(){ return Math.max(0, document.documentElement.scrollHeight - window.innerHeight); }
  function update(){
    var max = maxScroll();
    btn.classList.toggle('show', max > 240);
    goingUp = window.scrollY > max / 2;
    btn.classList.toggle('up', goingUp);
    var label = goingUp ? 'Scroll to top' : 'Scroll to bottom';
    btn.setAttribute('aria-label', label);
    btn.title = label;
  }
  btn.addEventListener('click', function(){
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: goingUp ? 0 : maxScroll(), behavior: reduce ? 'auto' : 'smooth' });
  });
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  window.addEventListener('load', update);
  // Content loaded from Supabase changes the page height after first paint.
  if (window.ResizeObserver) new ResizeObserver(update).observe(document.body);
  update();
})();
