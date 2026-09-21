/* Portfolio JS v2 — AI Engineer Portfolio */

// NAV SCROLL
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 40));

// THEME TOGGLE
(function(){
  const btn = document.getElementById('theme-btn');
  const html = document.documentElement;
  html.dataset.theme = localStorage.getItem('pf-theme') || 'dark';
  if (!btn) return;
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
  const roles = ["AI Engineer","Data Scientist","Machine Learning Engineer","LLM Systems Builder","FinTech Innovator","Computer Vision Engineer"];
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
  return localStorage.getItem('pf-resume-url') || '';
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
document.querySelectorAll('a[data-resume-link]').forEach(function(link){
  if(!link.href || /resume\.pdf$/.test(link.getAttribute('href')||'')){
    link.addEventListener('click', function(event){
      if(!getResumeUrl()){
        event.preventDefault();
        alert('Resume is not available yet.');
      }
    });
  }
});

// SCROLL REVEAL — also used for content rendered later from Supabase
const revealObserver = ('IntersectionObserver' in window) ? new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('v'); revealObserver.unobserve(e.target); } });
}, { threshold: .08 }) : null;
function observeReveals(root) {
  const scope = root || document;
  const targets = Array.from(scope.querySelectorAll('.reveal:not(.v),.rstagger:not(.v)'));
  if (scope.matches && scope.matches('.reveal:not(.v),.rstagger:not(.v)')) targets.push(scope);
  targets.forEach(el => { if (revealObserver) revealObserver.observe(el); else el.classList.add('v'); });
}
observeReveals(document);

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
  document.querySelectorAll('.stats-g,.about-kpis').forEach(el => obs.observe(el));
})();

// COMMAND PALETTE
(function(){
  const overlay = document.getElementById('cmd-ov');
  const input   = document.getElementById('cmd-input');
  const results = document.getElementById('cmd-results');
  if (!overlay) return;

  const blogVisible = () => { const b = document.getElementById('blog'); return Boolean(b && !b.hidden); };
  const cmds = [
    {label:'Home',                 cat:'Navigate', icon:'⌂', href:'#hero'},
    {label:'About',                cat:'Navigate', icon:'◉', href:'#about'},
    {label:'Education',            cat:'Navigate', icon:'◆', href:'#education'},
    {label:'Experience & Fellowships', cat:'Navigate', icon:'◈', href:'#experience'},
    {label:'Certifications',       cat:'Navigate', icon:'✦', href:'#certifications'},
    {label:'Projects',             cat:'Navigate', icon:'▷', href:'#projects'},
    {label:'Achievements',         cat:'Navigate', icon:'★', href:'#achievements'},
    {label:'Research Interests',   cat:'Navigate', icon:'⊕', href:'#research'},
    {label:'Blog',                 cat:'Navigate', icon:'◧', href:'#blog', when: blogVisible},
    {label:'Contact',              cat:'Navigate', icon:'◎', href:'#contact'},
    {label:'Toggle Theme',   cat:'Action',   icon:'◑', href:null, fn:()=>{ document.getElementById('theme-btn').click(); close(); }},
    {label:'View / Download Resume',cat:'Action',   icon:'↓', href:null, fn:()=>{
      close();
      const url = getResumeUrl();
      if (url) window.open(url, '_blank', 'noopener'); else alert('Resume is not available yet.');
    }},
  ];

  let sel = 0;
  const goto = href => { const el=document.querySelector(href); if(el) el.scrollIntoView({behavior:'smooth'}); close(); };
  const open  = () => { overlay.classList.add('open'); input.value=''; sel=0; render(''); setTimeout(()=>input.focus(),50); };
  const close = () => overlay.classList.remove('open');

  function render(q) {
    const available = cmds.filter(c => !c.when || c.when());
    const list = q ? available.filter(c => c.label.toLowerCase().includes(q.toLowerCase())) : available;
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

// SECTION PREVIEWS — on the homepage a container with data-limit shows only its first N matching
// items; the "See all" button under it opens the full page. Full-list pages have no limit.
function applyLimit(container, itemSelector, matches, seeAllKey, noun) {
  if (!container) return;
  const limit = Number(container.dataset.limit) || Infinity;
  const items = Array.from(container.querySelectorAll(itemSelector));
  let shown = 0;
  items.forEach(item => {
    const visible = matches(item) && shown < limit;
    if (visible) shown++;
    item.classList.toggle('hidden', !visible);
  });
  const link = seeAllKey && document.querySelector('[data-see-all="' + seeAllKey + '"]');
  if (link && noun) link.textContent = 'See all ' + (items.length > 1 ? items.length + ' ' : '') + noun + ' →';
}

// CERT FILTER
function applyCertFilter() {
  const active = document.querySelector('.cf-btn.active');
  const cat = active ? active.dataset.cat : 'all';
  applyLimit(document.querySelector('.certs-g'), '.cert', c => cat === 'all' || c.dataset.cat === cat, 'certifications', 'Certifications');
}
document.querySelectorAll('.cf-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.cf-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    applyCertFilter();
  });
});
applyCertFilter();

// EXPERIENCE PREVIEW — first N entries in each group (Work Experience, Fellowships & Bootcamps)
function applyExperienceLimit() {
  const section = document.getElementById('experience');
  if (!section) return;
  section.querySelectorAll('[data-exp-group]').forEach(group => {
    if (section.dataset.limit) group.dataset.limit = section.dataset.limit;
    applyLimit(group, '.tl-it', () => true);
  });
}
applyExperienceLimit();

// CONTACT FORM
async function handleContact(e) {
  e.preventDefault();
  const btn = e.target.querySelector('.btn-send');
  const form=e.target;
  if (btn.disabled) return;
  const firstName=form.querySelector('[name="first_name"]')?.value||'';
  const lastName=form.querySelector('[name="last_name"]')?.value||'';
  const name=(firstName+' '+lastName).trim();
  const email=form.querySelector('[name="email"]')?.value.trim()||'';
  const subject=form.querySelector('[name="subject"]')?.value||'Portfolio message';
  const message=form.querySelector('[name="message"]')?.value||'';
  btn.disabled = true;
  btn.textContent = 'Sending...';
  const client=supabaseClient();
  if(client){
    let failed=false;
    try{
      const result=await client.from('messages').insert({name:name,email:email,subject:subject,message:message,status:'unread'});
      failed=Boolean(result.error);
    }catch(error){ failed=true; }
    if(failed){
      btn.textContent='Send failed — please try again';
      setTimeout(() => { btn.textContent='Send Message →'; btn.disabled=false; }, 2500);
      return;
    }
  }
  btn.textContent = 'Message Sent ✓';
  btn.style.background = 'linear-gradient(135deg,#10B981,#06B6D4)';
  form.reset();
  setTimeout(() => { btn.textContent='Send Message →'; btn.style.background=''; btn.disabled=false; }, 3500);
}

// PROJECT CATEGORY TABS
function applyProjectFilter() {
  const active = document.querySelector('.prj-tab.active');
  const cat = active ? active.dataset.cat : 'all';
  applyLimit(document.querySelector('.prj-g'), '.pc', c => cat === 'all' || c.dataset.cat === cat, 'projects', 'Projects');
  document.querySelectorAll('.prj-g .pc.feat').forEach(c => {
    c.style.gridColumn = c.classList.contains('hidden') ? '' : (cat === 'all' ? 'span 2' : 'span 1');
  });
}
document.querySelectorAll('.prj-tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.prj-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    applyProjectFilter();
  });
});
applyProjectFilter();

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"']/g, function(char){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[char];
  });
}
function hasUrl(url) { return Boolean(url && String(url).trim() && String(url).trim() !== '#'); }
var sharedSupabaseClient = null;
function supabaseClient() {
  if (sharedSupabaseClient) return sharedSupabaseClient;
  var url = localStorage.getItem('pf-supabase-url') || window.PORTFOLIO_SUPABASE_URL || '';
  var key = localStorage.getItem('pf-supabase-anon-key') || window.PORTFOLIO_SUPABASE_KEY || '';
  if (!url || !key || !window.supabase) return null;
  sharedSupabaseClient = window.supabase.createClient(url, key);
  return sharedSupabaseClient;
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
function isDataScienceProject(project) {
  var text=projectSearchText(project);
  return /\b(data science|data analysis|analytics|analysis|eda|exploratory|visuali[sz]ations?|pandas|statistics|statistical|clustering|segmentation|forecast|forecasting|time series|regression|power bi|tableau|business intelligence|feature engineering|data cleaning)\b/.test(text);
}
function isNlpLlmProject(project) {
  var text=projectSearchText(project);
  return /\b(nlp|natural language|llms?|large language models?|language models?|rag|retrieval[- ]augmented|chatbots?|sentiment|bert|bertweet|gpt|transformers?|langchain|embeddings?|text classification|vader|textblob|tokeni[sz]ation)\b/.test(text);
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
  var certifications=Array.isArray(data.certifications)?data.certifications:[];
  var experience=Array.isArray(data.experience)?data.experience:[];
  var values={
    'total-projects':projects.length,
    'ai-projects':projects.filter(isAiProject).length,
    'web-projects':projects.filter(isWebProject).length,
    'data-science-projects':projects.filter(isDataScienceProject).length,
    'nlp-llm-projects':projects.filter(isNlpLlmProject).length,
    'certifications':certifications.length,
    'fellowships':experience.filter(function(item){return /fellow/i.test(String(item.category||''));}).length,
    'achievements':(Array.isArray(data.achievements)?data.achievements:[]).length,
    'experience-years':countExperienceYears(experience)
  };
  Object.keys(values).forEach(function(key){
    document.querySelectorAll('[data-stat="'+key+'"]').forEach(function(el){
      el.dataset.count=String(values[key]);
      if (window.animateStatNumber && el.closest('.stats-g,.about-kpis')) window.animateStatNumber(el);
      else el.textContent=String(values[key])+(el.dataset.suffix||'');
    });
  });
}
// Stats read from the placeholder content while Supabase has no rows for a section
function placeholderProjects() {
  return Array.from(document.querySelectorAll('.prj-g .pc')).map(function(card){
    var text=function(sel){var el=card.querySelector(sel);return el?el.textContent.trim():'';};
    return {
      title:text('.pc-title'),
      type:card.dataset.type||'',
      description:text('.pc-desc'),
      tags:Array.from(card.querySelectorAll('.ptag')).map(function(t){return t.textContent.trim();})
    };
  });
}
function placeholderAchievements() {
  return Array.from(document.querySelectorAll('.ach-g .ach'));
}
function placeholderCertifications() {
  return Array.from(document.querySelectorAll('.certs-g .cert'));
}
function placeholderExperience() {
  return Array.from(document.querySelectorAll('#experience .tl-it[data-start]')).map(function(el){
    var end=el.dataset.end;
    var group=el.closest('[data-exp-group]');
    return {
      category:group?group.dataset.expGroup:'work',
      start_date:el.dataset.start+'-01',
      end_date:(!end||end==='present')?null:end+'-28',
      date_period:end==='present'?'Present':''
    };
  });
}

// Project card buttons — look clickable (icon + border), and don't trigger the card's own click
var PROJECT_LINK_ICONS={
  github:'<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>',
  live:'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6"/><path d="M10 14 21 3"/></svg>',
  demo:'<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15a1 1 0 0 0 1.5.86l12-7.5a1 1 0 0 0 0-1.72l-12-7.5A1 1 0 0 0 7 4.5z"/></svg>',
  details:'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>'
};
function projectLinkHtml(kind,url,label){
  var external=kind!=='details';
  return '<a href="'+escapeHtml(url)+'" class="plink'+(external?'':' plink-primary')+'"'+(external?' target="_blank" rel="noopener"':'')+' onclick="event.stopPropagation()">'+PROJECT_LINK_ICONS[kind]+escapeHtml(label)+'</a>';
}

function renderProjectCard(project, options) {
  var grid=document.querySelector('.prj-g');
  if(!grid || !project || !project.id) return;
  var catMap={'Machine Learning':'ml','AI / LLM':'ai','Computer Vision':'cv','Data Science':'ds','Financial Engineering':'fe','Programming':'prog','Full Stack':'prog','Web Application':'prog','Website':'prog'};
  var type=project.type||'Machine Learning';
  var cat=catMap[type]||'ml';
  var image=project.image_1_url||localStorage.getItem('pf_proj_'+project.id+'_img_1')||'';
  var url=project.url||project.live_url||'#';
  var desc=project.desc||project.description||'';
  var tags=project.tags||[];
  var metrics=project.metrics||[];
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
    +projectLinkHtml('details','Project Detail.html?id='+project.id,'View Details')
    +(hasUrl(project.github_url)?projectLinkHtml('github',project.github_url,'GitHub'):'')
    +(hasUrl(url)?projectLinkHtml('live',url,'Live Site'):'')
    +(hasUrl(project.demo_url)?projectLinkHtml('demo',project.demo_url,'Demo'):'')
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
  var catMap={
    'AI':'ai',
    'Machine Learning':'ml',
    'Deep Learning':'dl',
    'Deep Learning':'dl',
    'Computer Vision':'cv',
    'Data Science':'ds',
    'Natural Language Processing':'nlp',
    'Large Language Models':'llm',
    'Programming':'pr',
    'UX':'ux',
    'UX Design':'ux',
    'Project Management':'pm',
    'Financial Engineering':'fe'
  };
  function certSortValue(cert){
    return (Number(cert.year_earned)||0)*100+(Number(cert.month_earned)||0);
  }
  function certEarnedLabel(cert){
    var year=Number(cert.year_earned)||0;
    var month=Number(cert.month_earned)||0;
    if(!year)return '';
    if(!month)return String(year);
    return new Date(year,month-1,1).toLocaleDateString(undefined,{month:'short',year:'numeric'});
  }
  function renderCertificateEmbed(embedCode){
    var raw=String(embedCode||'').trim();
    if(!raw)return '';
    var iframe=raw.match(/<iframe\b[^>]*src=["']([^"']+)["'][^>]*><\/iframe>/i);
    if(iframe && /^https?:\/\//i.test(iframe[1])){
      var width=(raw.match(/\bwidth=["']?(\d+)/i)||[])[1]||'100%';
      var height=(raw.match(/\bheight=["']?(\d+)/i)||[])[1]||'180';
      return '<div class="cert-embed"><iframe src="'+escapeHtml(iframe[1])+'" width="'+escapeHtml(width)+'" height="'+escapeHtml(height)+'" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe></div>';
    }
    var badgeId=(raw.match(/data-share-badge-id=["']([^"']+)["']/i)||[])[1];
    var badgeHost=(raw.match(/data-share-badge-host=["']([^"']+)["']/i)||[])[1]||'https://www.credly.com';
    var badgeWidth=(raw.match(/data-iframe-width=["']?(\d+)/i)||[])[1]||'150';
    var badgeHeight=(raw.match(/data-iframe-height=["']?(\d+)/i)||[])[1]||'270';
    if(badgeId && /^https:\/\/www\.credly\.com$/i.test(badgeHost)){
      return '<div class="cert-embed cert-embed-credly">'
        +'<div data-iframe-width="'+escapeHtml(badgeWidth)+'" data-iframe-height="'+escapeHtml(badgeHeight)+'" data-share-badge-id="'+escapeHtml(badgeId)+'" data-share-badge-host="'+escapeHtml(badgeHost)+'"></div>'
        +'</div>';
    }
    return '';
  }
  function renderCertificateImage(cert){
    var imageUrl=cert.certificate_image_url;
    var verificationUrl=cert.verification_url;
    var name=cert.name;
    var src=String(imageUrl||'').trim();
    if(!/^https?:\/\//i.test(src))return '';
    var open=hasUrl(verificationUrl)?' onclick="window.open(\''+String(verificationUrl).replace(/'/g,'&#39;')+'\',\'_blank\')"':'';
    var provider=cert.provided_by||cert.issuer||'Issuer';
    var shortProvider=String(provider).split(/\s+/).filter(Boolean).slice(0,1).join(' ');
    if(String(provider).length>10||String(provider).split(/\s+/).filter(Boolean).length>1)shortProvider+=' ...';
    var shortName=String(name||'Certificate').split(/\s+/).filter(Boolean).slice(0,2).join(' ');
    if(String(name||'').split(/\s+/).filter(Boolean).length>2)shortName+=' ...';
    var shortIssuer=String(cert.issuer||'').split(/\s+/).filter(Boolean).slice(0,2).join(' ');
    if(String(cert.issuer||'').split(/\s+/).filter(Boolean).length>2)shortIssuer+=' ...';
    return '<div class="cert-embed cert-image-embed"'+open+'>'
      +'<div class="cert-image-card">'
      +'<div class="cert-image-art"><img src="'+escapeHtml(src)+'" alt="'+escapeHtml(name||'Certificate image')+'" loading="lazy"></div>'
      +'<div class="cert-image-copy"><p class="cert-image-title">'+escapeHtml(shortName)+'</p><p class="cert-image-issuer">Issuer: '+escapeHtml(shortIssuer)+'</p></div>'
      +'<div class="cert-image-footer">PROVIDED BY <strong>'+escapeHtml(shortProvider)+'</strong></div>'
      +'</div>'
      +'</div>';
  }
  function hydrateCertificateEmbeds(){
    if(!document.querySelector('.cert-embed-credly'))return;
    var old=document.getElementById('credly-embed-script');
    if(old)old.remove();
    var script=document.createElement('script');
    script.id='credly-embed-script';
    script.async=true;
    script.src='https://cdn.credly.com/assets/utilities/embed.js';
    document.body.appendChild(script);
  }
  var sortedCerts=certs.slice().sort(function(a,b){
    return certSortValue(b)-certSortValue(a)||new Date(b.created_at||0)-new Date(a.created_at||0);
  });
  grid.innerHTML=sortedCerts.map(function(cert){
    var cat=catMap[cert.category]||String(cert.category||'ai').toLowerCase().slice(0,2);
    var issuer=cert.issuer||'';
    var earned=certEarnedLabel(cert);
    var embed=renderCertificateEmbed(cert.embed_code);
    if(!embed)embed=renderCertificateImage(cert);
    var badge=(issuer.split(/\s+/).filter(Boolean)[0]||cert.category||'Cert').slice(0,3).toUpperCase();
    var link=hasUrl(cert.verification_url)&&!embed?' onclick="window.open(\''+String(cert.verification_url).replace(/'/g,'&#39;')+'\',\'_blank\')"':'';
    return '<div class="cert'+(embed?' has-embed':'')+'" data-cat="'+escapeHtml(cat)+'"'+link+'>'
      +'<div class="cert-top"><div class="cbadge cb-'+escapeHtml(cat)+'">'+escapeHtml(badge)+'</div>'
      +'<div><p class="cname">'+escapeHtml(cert.name)+'</p><p class="cissuer">'+escapeHtml(issuer)+(earned?' · '+escapeHtml(earned):'')+'</p></div></div>'
      +embed
      +'</div>';
  }).join('');
  hydrateCertificateEmbeds();
}

// Descriptions: one point per line; lines starting with "-", "*" or "•" become a bullet list
function renderTimelineDescription(text) {
  var lines=String(text||'').replace(/\r\n/g,'\n').split('\n').map(function(l){return l.trim();}).filter(Boolean);
  if(!lines.length)return '';
  var inline=function(value){return escapeHtml(value).replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>');};
  var bullets=lines.filter(function(l){return /^[-*•]\s+/.test(l);});
  if(!bullets.length)return '<p class="tl-desc">'+inline(lines.join(' '))+'</p>';
  var intro=lines.filter(function(l){return !/^[-*•]\s+/.test(l);});
  return (intro.length?'<p class="tl-desc">'+inline(intro.join(' '))+'</p>':'')
    +'<ul class="tl-desc">'+bullets.map(function(l){return '<li>'+inline(l.replace(/^[-*•]\s+/,''))+'</li>';}).join('')+'</ul>';
}
function experienceGroup(item) {
  return /fellow/i.test(String(item.category||''))?'fellowship':'work';
}
function timelineItemHtml(item, mode) {
  var title=mode==='education'?item.degree:item.role;
  var org=mode==='education'?item.institution:item.organisation;
  var thesis=mode==='education'&&item.thesis?'<p class="tl-thesis">'+escapeHtml(item.thesis)+'</p>':'';
  var award=item.award?'<span class="tl-award">↑ '+escapeHtml(item.award)+'</span>':'';
  return '<div class="tl-it reveal">'
    +'<div class="tl-dot"></div>'
    +'<p class="tl-date">'+escapeHtml(item.date_period||'')+'</p>'
    +'<h3 class="tl-role">'+escapeHtml(title||'Untitled')+'</h3>'
    +(org?'<p class="tl-org">'+escapeHtml(org)+'</p>':'')
    +renderTimelineDescription(item.description)
    +thesis
    +'<div class="tl-metas">'+(item.tags||[]).map(function(tag){return'<span class="tmeta">'+escapeHtml(tag)+'</span>';}).join('')+'</div>'
    +award
    +'</div>';
}
function renderTimeline(sectionId, items, mode) {
  var section=document.getElementById(sectionId);
  if(!section || !items || !items.length) return;
  if(mode==='experience'){
    ['fellowship','work'].forEach(function(group){
      var wrap=section.querySelector('[data-exp-group="'+group+'"]');
      if(!wrap)return;
      var rows=items.filter(function(item){return experienceGroup(item)===group;});
      wrap.querySelector('.tl').innerHTML=rows.map(function(item){return timelineItemHtml(item,mode);}).join('');
      wrap.hidden=!rows.length;
    });
  }else{
    var timeline=section.querySelector('.tl');
    if(timeline)timeline.innerHTML=items.map(function(item){return timelineItemHtml(item,mode);}).join('');
  }
  observeReveals(section);
}

function renderAchievementGrid(items) {
  var grid=document.querySelector('.ach-g');
  if(!grid || !items || !items.length) return;
  var icons={
    award:'<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>',
    medal:'<circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>',
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

// Status line on the full-list pages (Certifications.html, Experience.html)
function setPageStatus(text) {
  var el=document.getElementById('page-status');
  if(!el)return;
  el.textContent=text||'';
  el.hidden=!text;
}

// BLOG VISIBILITY — the section and its menu links only appear once a post is published
function setBlogVisible(visible) {
  var section=document.getElementById('blog');
  if(section)section.hidden=!visible;
  document.querySelectorAll('[data-blog-link]').forEach(function(el){el.hidden=!visible;});
  if(visible&&section)observeReveals(section);
}

// ADMIN-MANAGED PUBLIC CONTENT
// Each section keeps its placeholder content until Supabase returns at least one row for it.
(function(){
  var statsData={projects:placeholderProjects(),certifications:placeholderCertifications(),experience:placeholderExperience(),achievements:placeholderAchievements()};
  function setStats(key,value){
    statsData[key]=Array.isArray(value)?value:[];
    updatePortfolioStats(statsData);
  }
  updatePortfolioStats(statsData);

  var client=supabaseClient();
  if(!client)return;
  function load(query, onRows){
    query.then(function(result){
      if(result.error){console.warn('Supabase read failed',result.error);setPageStatus('This list could not be loaded right now. Please try again later.');return;}
      onRows(result.data||[]);
    }, function(error){console.warn('Supabase read failed',error);setPageStatus('This list could not be loaded right now. Please try again later.');});
  }
  load(client.from('projects').select('*').eq('status','published').order('created_at',{ascending:false}), function(rows){
    var grid=document.querySelector('.prj-g');
    if(!rows.length||!grid){if(rows.length)setStats('projects',rows);return;}
    grid.innerHTML='';
    rows.forEach(function(row,index){
      renderProjectCard({
        id:row.id,title:row.title,type:row.type,desc:row.description,tags:row.tags||[],metrics:row.metrics||[],
        url:row.live_url,github_url:row.github_url,demo_url:row.demo_url,image_1_url:row.image_1_url
      },{label:String(index+1).padStart(2,'0')});
    });
    // Same layout as the placeholders: the newest project is featured across two columns
    if(rows.length>=3){
      var first=grid.querySelector('.pc');
      var num=first&&first.querySelector('.pnum');
      if(first)first.classList.add('feat');
      if(num)num.textContent='01 — Featured';
    }
    applyProjectFilter();
    observeReveals(grid);
    setStats('projects',rows);
  });
  load(client.from('blog_posts').select('*').eq('status','published').eq('type','blog').order('created_at',{ascending:false}).limit(3), function(rows){
    var grid=document.querySelector('.blog-g');
    if(!rows.length||!grid){setBlogVisible(rows.length>0);return;}
    grid.innerHTML='';
    rows.forEach(renderBlogCard);
    setBlogVisible(true);
  });
  load(client.from('certifications').select('*').order('year_earned',{ascending:false}).order('month_earned',{ascending:false}).order('created_at',{ascending:false}), function(rows){
    setPageStatus(rows.length?'':'No certifications have been added yet.');
    if(!rows.length)return;
    renderCertificationGrid(rows);
    applyCertFilter();
    setStats('certifications',rows);
  });
  load(client.from('experience').select('*').order('display_order',{ascending:true}).order('created_at',{ascending:false}), function(rows){
    setPageStatus(rows.length?'':'No experience has been added yet.');
    if(!rows.length)return;
    renderTimeline('experience',rows,'experience');
    applyExperienceLimit();
    setStats('experience',rows);
  });
  load(client.from('education').select('*').order('display_order',{ascending:true}).order('created_at',{ascending:false}), function(rows){
    if(!rows.length)return;
    renderTimeline('education',rows,'education');
  });
  load(client.from('achievements').select('*').order('display_order',{ascending:true}).order('created_at',{ascending:false}), function(rows){
    if(!rows.length)return;
    renderAchievementGrid(rows);
    setStats('achievements',rows);
  });
  load(client.from('site_media').select('*'), applySiteMedia);
})();
