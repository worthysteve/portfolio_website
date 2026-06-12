/* Portfolio JS v2 — AI Engineer Portfolio */

// NAV SCROLL
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 40));

// THEME TOGGLE
(function(){
  const btn = document.getElementById('theme-btn');
  const html = document.documentElement;
  html.dataset.theme = localStorage.getItem('pf-theme') || 'dark';
  updateIcon();
  btn.addEventListener('click', () => {
    const next = html.dataset.theme === 'dark' ? 'light' : 'dark';
    html.dataset.theme = next;
    localStorage.setItem('pf-theme', next);
    updateIcon();
  });
  function updateIcon() {
    btn.innerHTML = html.dataset.theme === 'dark'
      ? `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`
      : `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
  }
})();

// CANVAS PARTICLES
(function(){
  const c = document.getElementById('pcanvas');
  if (!c) return;
  const ctx = c.getContext('2d');
  let W, H, pts = [];
  const N = 65, DIST = 120, SPD = 0.3;
  function resize() { W = c.width = c.offsetWidth; H = c.height = c.offsetHeight; }
  window.addEventListener('resize', resize); resize();
  function acc(v) { return getComputedStyle(document.documentElement).getPropertyValue(v).trim() || '#2563EB'; }
  class P {
    constructor() { this.reset(); }
    reset() { this.x=Math.random()*W; this.y=Math.random()*H; this.vx=(Math.random()-.5)*SPD; this.vy=(Math.random()-.5)*SPD; this.r=Math.random()*1.4+.5; }
    upd() { this.x+=this.vx; this.y+=this.vy; if(this.x<0||this.x>W)this.vx*=-1; if(this.y<0||this.y>H)this.vy*=-1; }
  }
  for (let i = 0; i < N; i++) pts.push(new P());
  function draw() {
    ctx.clearRect(0,0,W,H);
    const a1 = acc('--a'), a2 = acc('--a2');
    pts.forEach(p => p.upd());
    for (let i = 0; i < pts.length; i++) {
      for (let j = i+1; j < pts.length; j++) {
        const a=pts[i], b=pts[j], dx=a.x-b.x, dy=a.y-b.y, d=Math.sqrt(dx*dx+dy*dy);
        if (d < DIST) {
          ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y);
          ctx.strokeStyle = a1 + (Math.round((1-d/DIST)*25).toString(16).padStart(2,'0'));
          ctx.lineWidth = .5; ctx.stroke();
        }
      }
    }
    pts.forEach((p,i) => { ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fillStyle=(i%3===0?a2:a1)+'88'; ctx.fill(); });
    requestAnimationFrame(draw);
  }
  draw();
})();

// TYPING ANIMATION
(function(){
  const roles = ["AI Engineer","Data Scientist","ML Researcher","LLM Systems Builder","FinTech Innovator","Computer Vision Engineer"];
  const el = document.getElementById('typed');
  if (!el) return;
  let ri=0, ci=0, del=false, curRole=null;
  window.__updateRole = r => { curRole = r; };
  function tick() {
    const role = curRole || roles[ri];
    if (!del) {
      el.textContent = role.slice(0, ci+1); ci++;
      if (ci === role.length) { setTimeout(() => { del=true; tick(); }, 1900); return; }
    } else {
      el.textContent = role.slice(0, ci-1); ci--;
      if (ci === 0) { del=false; curRole=null; ri=(ri+1)%roles.length; }
    }
    setTimeout(tick, del ? 30 : 60);
  }
  setTimeout(tick, 900);
})();

// IMAGE SLOTS (drag-drop + click-to-upload)
function initSlot(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const saved = localStorage.getItem('pf_img_'+id);
  if (saved) { applyImg(el, saved); }
  el.addEventListener('dragover', e => { e.preventDefault(); el.classList.add('drag-over'); });
  el.addEventListener('dragleave', () => el.classList.remove('drag-over'));
  el.addEventListener('drop', e => {
    e.preventDefault(); el.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) readAndApply(el, id, file);
  });
  el.addEventListener('click', () => {
    const inp = document.createElement('input');
    inp.type='file'; inp.accept='image/*';
    inp.onchange = e => { const f=e.target.files[0]; if(f) readAndApply(el,id,f); };
    inp.click();
  });
}
function applyImg(el, src) {
  el.style.backgroundImage = `url(${src})`;
  el.style.backgroundSize = 'cover';
  el.style.backgroundPosition = 'center';
  const inner = el.querySelector('.slot-inner');
  if (inner) inner.style.display = 'none';
}
function readAndApply(el, id, file) {
  const reader = new FileReader();
  reader.onload = ev => {
    applyImg(el, ev.target.result);
    try { localStorage.setItem('pf_img_'+id, ev.target.result); } catch(e) {}
  };
  reader.readAsDataURL(file);
}
initSlot('slot-portrait');
initSlot('slot-about');

// SCROLL REVEAL
(function(){
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('v'); obs.unobserve(e.target); } });
  }, { threshold: .08 });
  document.querySelectorAll('.reveal,.rstagger').forEach(el => obs.observe(el));
})();

// ANIMATED COUNTERS
(function(){
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.querySelectorAll('[data-count]').forEach(el => {
          const target=+el.dataset.count, suf=el.dataset.suffix||'', dur=1700, start=Date.now();
          const tick = () => {
            const p=Math.min((Date.now()-start)/dur,1), ease=1-Math.pow(1-p,3);
            el.textContent = Math.floor(ease*target)+suf;
            if (p < 1) requestAnimationFrame(tick); else el.textContent = target+suf;
          };
          requestAnimationFrame(tick);
        });
        obs.unobserve(e.target);
      }
    });
  }, { threshold: .3 });
  const sg = document.querySelector('.stats-g');
  if (sg) obs.observe(sg);
})();

// COMMAND PALETTE
(function(){
  const overlay = document.getElementById('cmd-ov');
  const input   = document.getElementById('cmd-input');
  const results = document.getElementById('cmd-results');
  if (!overlay) return;

  const cmds = [
    {label:'About',          cat:'Navigate', icon:'◉', href:'#about'},
    {label:'Research',       cat:'Navigate', icon:'⊕', href:'#research'},
    {label:'Projects',       cat:'Navigate', icon:'▷', href:'#projects'},
    {label:'Experience',     cat:'Navigate', icon:'◈', href:'#experience'},
    {label:'Education',      cat:'Navigate', icon:'◆', href:'#education'},
    {label:'Certifications', cat:'Navigate', icon:'✦', href:'#certifications'},
    {label:'Publications',   cat:'Navigate', icon:'▣', href:'#publications'},
    {label:'Blog',           cat:'Navigate', icon:'◧', href:'#blog'},
    {label:'Achievements',   cat:'Navigate', icon:'★', href:'#achievements'},
    {label:'Contact',        cat:'Navigate', icon:'◎', href:'#contact'},
    {label:'Toggle Theme',   cat:'Action',   icon:'◑', href:null, fn:()=>{ document.getElementById('theme-btn').click(); close(); }},
    {label:'Download Resume',cat:'Action',   icon:'↓', href:null, fn:()=>close()},
  ];

  let sel = 0;
  const goto = href => { const el=document.querySelector(href); if(el) el.scrollIntoView({behavior:'smooth'}); close(); };
  const open  = () => { overlay.classList.add('open'); input.value=''; sel=0; render(''); setTimeout(()=>input.focus(),50); };
  const close = () => overlay.classList.remove('open');

  function render(q) {
    const list = q ? cmds.filter(c => c.label.toLowerCase().includes(q.toLowerCase())) : cmds;
    results.innerHTML = list.map((c,i) => `
      <div class="cmd-it${i===sel?' sel':''}" data-i="${cmds.indexOf(c)}">
        <div class="cmd-it-ic">${c.icon}</div>
        <span class="cmd-it-lbl">${c.label}</span>
        <span class="cmd-it-cat">${c.cat}</span>
      </div>`).join('');
    results.querySelectorAll('.cmd-it').forEach(el => {
      el.addEventListener('click', () => {
        const cmd = cmds[+el.dataset.i];
        if (cmd.href) goto(cmd.href); else if (cmd.fn) cmd.fn();
      });
    });
  }

  document.addEventListener('keydown', e => {
    if ((e.metaKey||e.ctrlKey) && e.key==='k') { e.preventDefault(); open(); return; }
    if (!overlay.classList.contains('open')) return;
    const items = results.querySelectorAll('.cmd-it');
    if (e.key==='Escape') close();
    if (e.key==='Enter') { items[sel]?.click(); }
    if (e.key==='ArrowDown') { sel=Math.min(sel+1,items.length-1); render(input.value); items[sel]?.scrollIntoView({block:'nearest'}); }
    if (e.key==='ArrowUp')   { sel=Math.max(sel-1,0);              render(input.value); items[sel]?.scrollIntoView({block:'nearest'}); }
  });
  document.getElementById('cmd-btn').addEventListener('click', open);
  overlay.addEventListener('click', e => { if (e.target===overlay) close(); });
  input.addEventListener('input', e => { sel=0; render(e.target.value); });
})();

// CERT FILTER
(function(){
  document.querySelectorAll('.cf-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.cf-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.cat;
      document.querySelectorAll('.cert').forEach(c => {
        c.classList.toggle('hidden', cat !== 'all' && c.dataset.cat !== cat);
      });
    });
  });
})();

// CONTACT FORM
function handleContact(e) {
  e.preventDefault();
  const btn = e.target.querySelector('.btn-send');
  btn.textContent = 'Message Sent ✓';
  btn.style.background = 'linear-gradient(135deg,#10B981,#06B6D4)';
  setTimeout(() => { btn.textContent='Send Message →'; btn.style.background=''; e.target.reset(); }, 3500);
}

// HAMBURGER MENU
(function(){
  const ham = document.getElementById('nav-ham');
  const mob = document.getElementById('mob-nav');
  if (!ham || !mob) return;
  ham.addEventListener('click', () => {
    mob.classList.toggle('open');
    ham.classList.toggle('open');
    document.body.style.overflow = mob.classList.contains('open') ? 'hidden' : '';
  });
  mob.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    mob.classList.remove('open');
    ham.classList.remove('open');
    document.body.style.overflow = '';
  }));
})();

// PROJECT CATEGORY TABS
(function(){
  document.querySelectorAll('.prj-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.prj-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.cat;
      document.querySelectorAll('.prj-g .pc').forEach(c => {
        const show = cat === 'all' || c.dataset.cat === cat;
        c.classList.toggle('hidden', !show);
        if (c.classList.contains('feat')) {
          c.style.gridColumn = (cat === 'all' && show) ? 'span 2' : (show ? 'span 1' : '');
        }
      });
    });
  });
})();

// CARD IMAGE DISPLAY — read-only on portfolio; images are set from Admin Dashboard
(function(){
  var SLOTS = ['pc-img-1','pc-img-2','pc-img-3','pc-img-4','pc-img-5','bc-img-1','bc-img-2','bc-img-3'];
  SLOTS.forEach(function(id) {
    var el = document.getElementById(id);
    if (!el) return;
    var saved = localStorage.getItem('pf_img_' + id);
    if (saved) {
      el.style.backgroundImage = 'url(' + saved + ')';
      el.style.backgroundSize = 'cover';
      el.style.backgroundPosition = 'center';
      el.classList.add('has-img');
    }
  });
})();

// DYNAMIC PROJECTS from admin (new projects added via Admin Dashboard)
(function(){
  var custom=[];try{custom=JSON.parse(localStorage.getItem('pf_projects_custom')||'[]');}catch(e){}
  if(!custom.length)return;
  var grid=document.querySelector('.prj-g');
  if(!grid)return;
  var catMap={'Machine Learning':'ml','AI / LLM':'ai','Computer Vision':'cv','Data Science':'ds','Financial Engineering':'fe','Programming':'prog','Full Stack':'prog'};
  custom.forEach(function(p){
    var cat=catMap[p.type]||'ml';
    var img1=localStorage.getItem('pf_proj_'+p.id+'_img_1')||'';
    var card=document.createElement('div');
    card.className='pc reveal';card.dataset.cat=cat;
    card.onclick=function(){location.href='Project Detail.html?id='+p.id;};
    card.innerHTML='<div class="pc-img" id="pc-img-'+p.id+'" style="'+(img1?'background-image:url('+img1+');background-size:cover;background-position:center':'')+'">'
      +(img1?'':'<span class="pc-img-lbl">'+p.title+'</span>')+'</div>'
      +'<div class="pc-body">'
      +'<div class="pc-tags">'+(p.tags||[]).slice(0,3).map(function(t){return'<span class="pc-tag">'+t+'</span>';}).join('')+'</div>'
      +'<h3 class="pc-title">'+p.title+'</h3>'
      +'<p class="pc-desc">'+(p.desc||'')+'</p>'
      +'<div class="pc-metrics">'+(p.metrics||[]).map(function(m){return'<span class="pc-metric">'+m+'</span>';}).join('')+'</div>'
      +'<div class="pc-links">'
      +(p.github_url?'<a href="'+p.github_url+'" class="plink" target="_blank" rel="noopener" onclick="event.stopPropagation()">GitHub ↗</a>':'')
      +(p.url&&p.url!=='#'?'<a href="'+p.url+'" class="plink" target="_blank" rel="noopener" onclick="event.stopPropagation()">Live ↗</a>':'')
      +(p.demo_url?'<a href="'+p.demo_url+'" class="plink" target="_blank" rel="noopener" onclick="event.stopPropagation()">Demo ↗</a>':'')
      +'</div></div>';
    grid.appendChild(card);
  });
})();
