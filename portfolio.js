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
  let W, H, pts = [], dpr = 1;
  const N = 65, DIST = 120, SPD = 0.3;
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = c.offsetWidth;
    H = c.offsetHeight;
    c.width = Math.floor(W * dpr);
    c.height = Math.floor(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
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

// ADMIN-MANAGED IMAGE SLOTS — public page only reads saved images
function initManagedImageSlot(id, storageKey) {
  const el = document.getElementById(id);
  if (!el) return;
  const key = storageKey || ('pf_img_' + id);
  const saved = localStorage.getItem(key) || localStorage.getItem('pf_img_'+id);
  if (saved) { applyImg(el, saved); }
}
function applyImg(el, src) {
  el.style.backgroundImage = `url(${src})`;
  el.style.backgroundSize = 'cover';
  el.style.backgroundPosition = 'center';
  const inner = el.querySelector('.slot-inner');
  if (inner) inner.style.display = 'none';
}
initManagedImageSlot('slot-portrait', 'pf-portrait');
initManagedImageSlot('slot-about', 'pf-about-photo');

function getResumeUrl() {
  return localStorage.getItem('pf-resume-url') || 'resume.pdf';
}
function applyResumeUrl(url) {
  if (!url) return;
  localStorage.setItem('pf-resume-url', url);
  document.querySelectorAll('a[href="resume.pdf"],a[data-resume-link]').forEach(function(link){
    link.href = url;
    link.dataset.resumeLink = 'true';
    link.target = '_blank';
    link.rel = 'noopener';
    link.removeAttribute('download');
  });
}
applyResumeUrl(getResumeUrl());

// SCROLL REVEAL
(function(){
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('v'); obs.unobserve(e.target); } });
  }, { threshold: .08 });
  document.querySelectorAll('.reveal,.rstagger').forEach(el => obs.observe(el));
})();

// PROJECT CARD LINKS — links navigate independently from clickable cards
(function(){
  document.querySelectorAll('.pc-links a').forEach(function(link){
    link.addEventListener('click', function(event){ event.stopPropagation(); });
  });
})();

// ANIMATED COUNTERS
(function(){
  window.animateStatNumber = function(el) {
    if (!el) return;
    const target=+el.dataset.count||0, suf=el.dataset.suffix||'', dur=900, start=Date.now();
    const tick = () => {
      const p=Math.min((Date.now()-start)/dur,1), ease=1-Math.pow(1-p,3);
      el.textContent = Math.floor(ease*target)+suf;
      if (p < 1) requestAnimationFrame(tick); else el.textContent = target+suf;
    };
    requestAnimationFrame(tick);
  };
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.querySelectorAll('[data-count]').forEach(el => {
          window.animateStatNumber(el);
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
    {label:'View / Download Resume',cat:'Action',   icon:'↓', href:null, fn:()=>{ window.open(getResumeUrl(), '_blank', 'noopener'); close(); }},
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
async function handleContact(e) {
  e.preventDefault();
  const btn = e.target.querySelector('.btn-send');
  const inputs=e.target.querySelectorAll('input,textarea');
  const name=((inputs[0]?.value||'')+' '+(inputs[1]?.value||'')).trim();
  const subject=inputs[2]?.value||'Portfolio message';
  const message=inputs[3]?.value||'';
  btn.textContent = 'Sending...';
  const client=supabaseClient();
  if(client){
    const result=await client.from('messages').insert({name:name,subject:subject,message:message,status:'unread'});
    if(result.error){
      btn.textContent='Send Failed';
      setTimeout(() => { btn.textContent='Send Message →'; }, 2500);
      return;
    }
  }
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

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"']/g, function(char){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[char];
  });
}
function hasUrl(url) { return Boolean(url && String(url).trim() && String(url).trim() !== '#'); }
function supabaseClient() {
  var url = localStorage.getItem('pf-supabase-url') || '';
  var key = localStorage.getItem('pf-supabase-anon-key') || '';
  if (!url || !key || !window.supabase) return null;
  return window.supabase.createClient(url, key);
}
function projectSearchText(project) {
  return [
    project && project.type,
    project && project.title,
    project && project.description,
    project && project.overview,
    Array.isArray(project && project.tags) ? project.tags.join(' ') : '',
    Array.isArray(project && project.features) ? project.features.join(' ') : ''
  ].join(' ').toLowerCase();
}
function isAiProject(project) {
  var text=projectSearchText(project);
  return /\b(ai|ml|machine learning|deep learning|dl|computer vision|cv|nlp|llm|rag|neural|pytorch|tensorflow|scikit|sklearn|model|classification|prediction|forecast|data science)\b/.test(text);
}
function isWebProject(project) {
  var text=projectSearchText(project);
  return /\b(web|website|web app|application|full stack|frontend|front-end|backend|back-end|html|css|javascript|react|next|vue|angular|django|flask|fastapi|dash|streamlit|node|express|dashboard|portfolio|supabase)\b/.test(text);
}
function isResearchProject(project) {
  var text=projectSearchText(project);
  return /\b(research|paper|publication|journal|conference|thesis|study|review|experiment|workshop)\b/.test(text);
}
function isDataFinanceProject(project) {
  var text=projectSearchText(project);
  return /\b(data science|analytics|analysis|eda|business intelligence|bi|finance|financial|financial engineering|quant|quantitative|portfolio|risk|pricing|derivative|monte carlo|trading|backtest|backtesting|econometric|time series)\b/.test(text);
}
function parseExperienceDate(value, fallbackMonth, fallbackDay) {
  if (!value) return null;
  var text=String(value).trim();
  var iso=text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return new Date(Number(iso[1]), Number(iso[2])-1, Number(iso[3]));
  var year=text.match(/\b(19|20)\d{2}\b/);
  if (year) return new Date(Number(year[0]), fallbackMonth, fallbackDay);
  return null;
}
function getExperienceRange(item) {
  var now=new Date();
  var start=parseExperienceDate(item.start_date,0,1);
  var end=parseExperienceDate(item.end_date,11,31);
  if (!start || !end) {
    var period=String(item.date_period||'');
    var years=period.match(/\b(19|20)\d{2}\b/g)||[];
    if (!start && years[0]) start=new Date(Number(years[0]),0,1);
    if (!end && /present|current|now|ongoing/i.test(period)) end=now;
    if (!end && years[1]) end=new Date(Number(years[1]),11,31);
  }
  if (!start) return null;
  if (!end) end=now;
  if (end < start) return null;
  return {start:start,end:end};
}
function countExperienceYears(experience) {
  if (!Array.isArray(experience) || !experience.length) return 0;
  var ranges=experience.map(getExperienceRange).filter(Boolean).sort(function(a,b){return a.start-b.start;});
  if (!ranges.length) return experience.length;
  var merged=[];
  ranges.forEach(function(range){
    var last=merged[merged.length-1];
    if (!last || range.start>last.end) merged.push({start:new Date(range.start),end:new Date(range.end)});
    else if (range.end>last.end) last.end=new Date(range.end);
  });
  var totalMonths=merged.reduce(function(sum,range){
    var months=(range.end.getFullYear()-range.start.getFullYear())*12+(range.end.getMonth()-range.start.getMonth());
    if (range.end.getDate()>=range.start.getDate()) months+=1;
    return sum+Math.max(1,months);
  },0);
  return Math.max(1,Math.floor(totalMonths/12));
}
function updatePortfolioStats(data) {
  data=data||{};
  var projects=Array.isArray(data.projects)?data.projects:[];
  var publications=Array.isArray(data.publications)?data.publications:[];
  var certifications=Array.isArray(data.certifications)?data.certifications:[];
  var experience=Array.isArray(data.experience)?data.experience:[];
  var values={
    'total-projects':projects.length,
    'ai-projects':projects.filter(isAiProject).length,
    'web-projects':projects.filter(isWebProject).length,
    'data-finance-projects':projects.filter(isDataFinanceProject).length,
    'research-projects':projects.filter(isResearchProject).length+publications.length,
    'certifications':certifications.length,
    'experience-years':countExperienceYears(experience)
  };
  Object.keys(values).forEach(function(key){
    var el=document.querySelector('[data-stat="'+key+'"]');
    if(!el)return;
    el.dataset.count=String(values[key]);
    if (window.animateStatNumber && el.closest('.stats-g')) window.animateStatNumber(el);
    else el.textContent=String(values[key])+(el.dataset.suffix||'');
  });
}
function updateStatDirect(key,value) {
  var el=document.querySelector('[data-stat="'+key+'"]');
  if(!el)return;
  el.dataset.count=String(value);
  el.textContent=String(value)+(el.dataset.suffix||'');
}
function clearDynamicSection(selector) {
  var el=document.querySelector(selector);
  if(el)el.innerHTML='';
}

function renderProjectCard(project, options) {
  var grid=document.querySelector('.prj-g');
  if(!grid || !project || !project.id) return;
  var catMap={'Machine Learning':'ml','AI / LLM':'ai','Computer Vision':'cv','Data Science':'ds','Financial Engineering':'fe','Programming':'prog','Full Stack':'prog','Web Application':'prog','Website':'prog'};
  var type=project.type||'Machine Learning';
  var cat=catMap[type]||'ml';
  var image=localStorage.getItem('pf_proj_'+project.id+'_img_1')||localStorage.getItem('pf_img_pc-img-'+project.id)||project.image_1_url||'';
  var url=project.url||project.live_url||'#';
  var desc=project.desc||project.description||'';
  var tags=project.tags||[];
  var metrics=project.metrics||[];
  var existingImg=document.getElementById('pc-img-'+project.id);
  var existingCard=document.getElementById('project-card-'+project.id)||(existingImg&&existingImg.closest('.pc'));
  if(existingCard){
    existingCard.id='project-card-'+project.id;
    existingCard.dataset.cat=cat;
    existingCard.onclick=function(){location.href='Project Detail.html?id='+project.id;};
    existingCard.innerHTML='<div class="pc-img" id="pc-img-'+project.id+'" style="'+(image?'background-image:url('+image+');background-size:cover;background-position:center':'')+'">'
      +(image?'':'<span class="pc-img-lbl">'+escapeHtml(project.title)+'</span>')+'</div>'
      +'<div class="pc-body">'
      +'<p class="pnum">'+escapeHtml(options&&options.label?options.label:String(project.id).padStart(2,'0'))+'</p>'
      +'<div class="pc-tags">'+tags.slice(0,5).map(function(t){return'<span class="ptag">'+escapeHtml(t)+'</span>';}).join('')+'</div>'
      +'<h3 class="pc-title">'+escapeHtml(project.title)+'</h3>'
      +'<p class="pc-desc">'+escapeHtml(desc)+'</p>'
      +'<div class="pc-metrics">'+metrics.map(function(m){return'<span class="pmet">'+escapeHtml(m)+'</span>';}).join('')+'</div>'
      +'<div class="pc-links">'
      +(hasUrl(project.github_url)?'<a href="'+project.github_url+'" class="plink" target="_blank" rel="noopener" onclick="event.stopPropagation()">GitHub ↗</a>':'')
      +(hasUrl(url)?'<a href="'+url+'" class="plink" target="_blank" rel="noopener" onclick="event.stopPropagation()">Live ↗</a>':'')
      +(hasUrl(project.demo_url)?'<a href="'+project.demo_url+'" class="plink" target="_blank" rel="noopener" onclick="event.stopPropagation()">Demo ↗</a>':'')
      +'</div></div>';
    return;
  }
  var card=document.createElement('div');
  card.className='pc reveal';
  card.id='project-card-'+project.id;
  card.dataset.cat=cat;
  card.onclick=function(){location.href='Project Detail.html?id='+project.id;};
  card.innerHTML='<div class="pc-img" id="pc-img-'+project.id+'" style="'+(image?'background-image:url('+image+');background-size:cover;background-position:center':'')+'">'
    +(image?'':'<span class="pc-img-lbl">'+escapeHtml(project.title)+'</span>')+'</div>'
    +'<div class="pc-body">'
    +'<p class="pnum">'+escapeHtml(options&&options.label?options.label:String(project.id).padStart(2,'0'))+'</p>'
    +'<div class="pc-tags">'+tags.slice(0,5).map(function(t){return'<span class="ptag">'+escapeHtml(t)+'</span>';}).join('')+'</div>'
    +'<h3 class="pc-title">'+escapeHtml(project.title)+'</h3>'
    +'<p class="pc-desc">'+escapeHtml(desc)+'</p>'
    +'<div class="pc-metrics">'+metrics.map(function(m){return'<span class="pmet">'+escapeHtml(m)+'</span>';}).join('')+'</div>'
    +'<div class="pc-links">'
    +(hasUrl(project.github_url)?'<a href="'+project.github_url+'" class="plink" target="_blank" rel="noopener" onclick="event.stopPropagation()">GitHub ↗</a>':'')
    +(hasUrl(url)?'<a href="'+url+'" class="plink" target="_blank" rel="noopener" onclick="event.stopPropagation()">Live ↗</a>':'')
    +(hasUrl(project.demo_url)?'<a href="'+project.demo_url+'" class="plink" target="_blank" rel="noopener" onclick="event.stopPropagation()">Demo ↗</a>':'')
    +'</div></div>';
  grid.appendChild(card);
}

function renderBlogCard(post) {
  var grid=document.querySelector('.blog-g');
  if(!grid || !post || !post.id) return;
  var image=post.image_url||localStorage.getItem('pf_img_bc-img-'+post.id)||'';
  var existingImg=document.getElementById('bc-img-'+post.id);
  var existingCard=document.getElementById('blog-card-'+post.id)||(existingImg&&existingImg.closest('.bc'));
  if(existingCard){
    existingCard.id='blog-card-'+post.id;
    existingCard.onclick=function(){location.href='Blog Detail.html?id='+post.id;};
    existingCard.innerHTML='<div class="bc-img" id="bc-img-'+post.id+'" style="'+(image?'background-image:url('+image+');background-size:cover;background-position:center':'')+'">'
      +(image?'':'<span class="bc-cat">'+escapeHtml(post.category||'Article')+'</span>')+'</div>'
      +'<div class="bc-body">'
      +'<div class="bc-tags">'+(post.tags||[]).slice(0,3).map(function(t){return'<span class="btag">'+escapeHtml(t)+'</span>';}).join('')+'</div>'
      +'<h3 class="bc-title">'+escapeHtml(post.title)+'</h3>'
      +'<p class="bc-exc">'+escapeHtml(post.excerpt||'')+'</p>'
      +'<div class="bc-meta"><span>'+new Date(post.created_at||Date.now()).toLocaleDateString(undefined,{month:'short',year:'numeric'})+'</span><span>'+escapeHtml(post.read_time||'')+'</span></div>'
      +'</div>';
    return;
  }
  var card=document.createElement('div');
  card.className='bc reveal';
  card.id='blog-card-'+post.id;
  card.onclick=function(){location.href='Blog Detail.html?id='+post.id;};
  card.innerHTML='<div class="bc-img" id="bc-img-'+post.id+'" style="'+(image?'background-image:url('+image+');background-size:cover;background-position:center':'')+'">'
    +(image?'':'<span class="bc-cat">'+escapeHtml(post.category||'Article')+'</span>')+'</div>'
    +'<div class="bc-body">'
    +'<div class="bc-tags">'+(post.tags||[]).slice(0,3).map(function(t){return'<span class="btag">'+escapeHtml(t)+'</span>';}).join('')+'</div>'
    +'<h3 class="bc-title">'+escapeHtml(post.title)+'</h3>'
    +'<p class="bc-exc">'+escapeHtml(post.excerpt||'')+'</p>'
    +'<div class="bc-meta"><span>'+new Date(post.created_at||Date.now()).toLocaleDateString(undefined,{month:'short',year:'numeric'})+'</span><span>'+escapeHtml(post.read_time||'')+'</span></div>'
    +'</div>';
  grid.appendChild(card);
}

function renderCertificationGrid(certs) {
  var grid=document.querySelector('.certs-g');
  if(!grid || !certs || !certs.length) return;
  var catMap={'AI':'ai','Machine Learning':'ml','Deep Learning':'dl','Data Science':'ds','Programming':'pr','UX':'ux','Financial Engineering':'fe'};
  grid.innerHTML=certs.map(function(cert){
    var cat=catMap[cert.category]||String(cert.category||'ai').toLowerCase().slice(0,2);
    var issuer=cert.issuer||'';
    var badge=(issuer.split(/\s+/).filter(Boolean)[0]||cert.category||'Cert').slice(0,3).toUpperCase();
    var link=hasUrl(cert.verification_url)?' onclick="window.open(\''+String(cert.verification_url).replace(/'/g,'&#39;')+'\',\'_blank\')"':'';
    return '<div class="cert" data-cat="'+escapeHtml(cat)+'"'+link+'>'
      +'<div class="cbadge cb-'+escapeHtml(cat)+'">'+escapeHtml(badge)+'</div>'
      +'<div><p class="cname">'+escapeHtml(cert.name)+'</p><p class="cissuer">'+escapeHtml(issuer)+(cert.year_earned?' · '+escapeHtml(cert.year_earned):'')+'</p></div>'
      +'</div>';
  }).join('');
}

function renderPublicationList(publications) {
  var list=document.querySelector('.pub-list');
  if(!list || !publications || !publications.length) return;
  function typeClass(type){
    var value=String(type||'note').toLowerCase();
    if(value.indexOf('journal')>-1) return 'j';
    if(value.indexOf('conference')>-1) return 'c';
    if(value.indexOf('thesis')>-1) return 't';
    return 'n';
  }
  function statusClass(status){
    var value=String(status||'').toLowerCase();
    if(value.indexOf('review')>-1) return 'review';
    if(value.indexOf('publish')>-1) return 'pub';
    return 'upcoming';
  }
  list.innerHTML=publications.map(function(pub){
    var authors=Array.isArray(pub.authors)?pub.authors.join(', '):'Steven Daniel';
    var venue=[pub.venue,pub.year].filter(Boolean).join(', ');
    return '<div class="pub" onclick="location.href=\'Blog Detail.html?type=pub&id='+Number(pub.id)+'\'">'
      +'<div class="pub-type pt-'+typeClass(pub.pub_type)+'">'+escapeHtml(pub.pub_type||'Note')+'</div>'
      +'<div class="pub-content">'
      +'<p class="pub-title">'+escapeHtml(pub.title)+'</p>'
      +'<p class="pub-authors">'+escapeHtml(authors)+'</p>'
      +'<p class="pub-venue">'+escapeHtml(venue||'Research publication')+'</p>'
      +'<div class="pub-status ps-'+statusClass(pub.status)+'">'+escapeHtml(pub.status||'Under Review')+'</div>'
      +'</div></div>';
  }).join('');
}

function renderTimeline(sectionId, items, mode) {
  var section=document.getElementById(sectionId);
  var timeline=section&&section.querySelector('.tl');
  if(!timeline || !items || !items.length) return;
  timeline.innerHTML=items.map(function(item){
    var title=mode==='education'?item.degree:item.role;
    var org=mode==='education'?item.institution:item.organisation;
    var thesis=mode==='education'&&item.thesis?'<p class="tl-thesis">'+escapeHtml(item.thesis)+'</p>':'';
    var award=item.award?'<span class="tl-award">↑ '+escapeHtml(item.award)+'</span>':'';
    return '<div class="tl-it reveal">'
      +'<div class="tl-dot"></div>'
      +'<p class="tl-date">'+escapeHtml(item.date_period||'')+'</p>'
      +'<h3 class="tl-role">'+escapeHtml(title||'Untitled')+'</h3>'
      +'<p class="tl-org">'+escapeHtml(org||'')+'</p>'
      +'<p class="tl-desc">'+escapeHtml(item.description||'')+'</p>'
      +thesis
      +'<div class="tl-metas">'+(item.tags||[]).map(function(tag){return'<span class="tmeta">'+escapeHtml(tag)+'</span>';}).join('')+'</div>'
      +award
      +'</div>';
  }).join('');
}

function renderAchievementGrid(items) {
  var grid=document.querySelector('.ach-g');
  if(!grid || !items || !items.length) return;
  var icons={
    award:'<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>',
    globe:'<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
    brain:'<path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>'
  };
  grid.innerHTML=items.map(function(item){
    return '<div class="ach">'
      +'<div class="ach-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--a)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">'+(icons[item.icon]||icons.award)+'</svg></div>'
      +'<h3 class="ach-title">'+escapeHtml(item.title)+'</h3>'
      +'<p class="ach-org">'+escapeHtml(item.organisation||'')+'</p>'
      +'<span class="ach-year">'+escapeHtml(item.year||'')+'</span>'
      +'<p class="ach-desc">'+escapeHtml(item.description||'')+'</p>'
      +'</div>';
  }).join('');
}

function applySiteMedia(media) {
  (media||[]).forEach(function(item){
    var key=item.id==='hero_portrait'?'pf-portrait':item.id==='about_image'?'pf-about-photo':'';
    var slot=item.id==='hero_portrait'?'slot-portrait':item.id==='about_image'?'slot-about':'';
    if(item.id==='resume_pdf'&&item.image_url)applyResumeUrl(item.image_url);
    if(key&&item.image_url)localStorage.setItem(key,item.image_url);
    if(slot&&item.image_url){
      var el=document.getElementById(slot);
      if(el)applyImg(el,item.image_url);
    }
  });
}

// ADMIN-MANAGED PUBLIC CONTENT
(function(){
  var statsData={projects:[],publications:[],certifications:[],experience:[]};
  function setStats(key,value){
    statsData[key]=Array.isArray(value)?value:[];
    updatePortfolioStats(statsData);
  }
  var localProjects=[];
  for(var slot=1;slot<=5;slot++){
    try{
      var saved=JSON.parse(localStorage.getItem('pf_proj_data_'+slot)||'null');
      if(saved){localProjects.push(saved);renderProjectCard(saved,{label:String(slot).padStart(2,'0')});}
    }catch(e){}
  }
  var custom=[];try{custom=JSON.parse(localStorage.getItem('pf_projects_custom')||'[]');}catch(e){}
  custom.forEach(function(project,index){ localProjects.push(project);renderProjectCard(project,{label:String(index+6).padStart(2,'0')}); });
  if(localProjects.length)setStats('projects',localProjects);
  else {
    updateStatDirect('total-projects',document.querySelectorAll('.prj-g .pc').length);
    updateStatDirect('research-projects',document.querySelectorAll('.research-g .rc,.pub-list .pub').length);
    updateStatDirect('certifications',document.querySelectorAll('.certs-g .cert').length);
  }

  var client=supabaseClient();
  if(!client)return;
  client.from('projects').select('*').eq('status','published').order('created_at',{ascending:false}).then(function(result){
    if(result.error||!result.data)return;
    if(result.data.length)clearDynamicSection('.prj-g');
    result.data.forEach(function(row){
      renderProjectCard({
        id:row.id,title:row.title,type:row.type,desc:row.description,tags:row.tags||[],metrics:row.metrics||[],
        url:row.live_url,github_url:row.github_url,demo_url:row.demo_url,image_1_url:row.image_1_url
      });
    });
    setStats('projects',result.data);
  });
  client.from('blog_posts').select('*').eq('status','published').eq('type','blog').order('created_at',{ascending:false}).then(function(result){
    if(result.error||!result.data)return;
    if(result.data.length)clearDynamicSection('.blog-g');
    result.data.forEach(renderBlogCard);
  });
  client.from('certifications').select('*').order('created_at',{ascending:false}).then(function(result){
    if(result.error||!result.data)return;
    if(result.data.length)clearDynamicSection('.certs-g');
    renderCertificationGrid(result.data);
    setStats('certifications',result.data);
  });
  client.from('publications').select('*').order('created_at',{ascending:false}).then(function(result){
    if(result.error||!result.data)return;
    if(result.data.length)clearDynamicSection('.pub-list');
    renderPublicationList(result.data);
    setStats('publications',result.data);
  });
  client.from('experience').select('*').order('display_order',{ascending:true}).order('created_at',{ascending:false}).then(function(result){
    if(result.error||!result.data)return;
    if(result.data.length)clearDynamicSection('#experience .timeline');
    renderTimeline('experience',result.data,'experience');
    setStats('experience',result.data);
  });
  client.from('education').select('*').order('display_order',{ascending:true}).order('created_at',{ascending:false}).then(function(result){
    if(result.error||!result.data)return;
    if(result.data.length)clearDynamicSection('#education .timeline');
    renderTimeline('education',result.data,'education');
  });
  client.from('achievements').select('*').order('display_order',{ascending:true}).order('created_at',{ascending:false}).then(function(result){
    if(result.error||!result.data)return;
    if(result.data.length)clearDynamicSection('.ach-g');
    renderAchievementGrid(result.data);
  });
  client.from('site_media').select('*').then(function(result){
    if(result.error||!result.data)return;
    applySiteMedia(result.data);
  });
})();
