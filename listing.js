function escapeHtml(value){
  return String(value||'').replace(/[&<>"']/g,function(char){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[char];
  });
}
var sharedClient=null;
function client(){
  if(sharedClient)return sharedClient;
  var url=localStorage.getItem('pf-supabase-url')||window.PORTFOLIO_SUPABASE_URL||'';
  var key=localStorage.getItem('pf-supabase-anon-key')||window.PORTFOLIO_SUPABASE_KEY||'';
  if(!url||!key||!window.supabase)return null;
  sharedClient=window.supabase.createClient(url,key);
  return sharedClient;
}
// Blog menu links only show once at least one post is published
function setBlogLinksVisible(visible){
  document.querySelectorAll('[data-blog-link]').forEach(function(el){el.hidden=!visible;});
}
function showListingPage(){
  document.querySelectorAll('.reveal,.rstagger').forEach(function(el){el.classList.add('v');});
}
function asArray(value){
  return Array.isArray(value)?value:[];
}
var PROJECT_LINK_ICONS={
  github:'<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>',
  live:'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6"/><path d="M10 14 21 3"/></svg>',
  demo:'<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15a1 1 0 0 0 1.5.86l12-7.5a1 1 0 0 0 0-1.72l-12-7.5A1 1 0 0 0 7 4.5z"/></svg>',
  details:'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>'
};
function hasUrl(url){return Boolean(url&&String(url).trim()&&String(url).trim()!=='#');}
function projectLinkHtml(kind,url,label){
  var external=kind!=='details';
  return '<a href="'+escapeHtml(url)+'" class="plink'+(external?'':' plink-primary')+'"'+(external?' target="_blank" rel="noopener"':'')+' onclick="event.stopPropagation()">'+PROJECT_LINK_ICONS[kind]+escapeHtml(label)+'</a>';
}
function projectCard(project,index){
  var image=project.image_1_url||'';
  return '<div class="pc reveal" onclick="location.href=\'Project Detail.html?id='+Number(project.id)+'\'">'
    +'<div class="pc-img" style="'+(image?'background-image:url('+image+');background-size:cover;background-position:center':'')+'">'+(image?'':'<span class="pc-img-lbl">'+escapeHtml(project.title)+'</span>')+'</div>'
    +'<div class="pc-body"><p class="pnum">'+String((index||0)+1).padStart(2,'0')+'</p>'
    +'<div class="pc-tags">'+asArray(project.tags).slice(0,5).map(function(tag){return'<span class="ptag">'+escapeHtml(tag)+'</span>';}).join('')+'</div>'
    +'<h3 class="pc-title">'+escapeHtml(project.title)+'</h3>'
    +'<p class="pc-desc">'+escapeHtml(project.description||project.desc||'')+'</p>'
    +'<div class="pc-links">'
    +projectLinkHtml('details','Project Detail.html?id='+Number(project.id),'View Details')
    +(hasUrl(project.github_url)?projectLinkHtml('github',project.github_url,'GitHub'):'')
    +(hasUrl(project.live_url)?projectLinkHtml('live',project.live_url,'Live Site'):'')
    +(hasUrl(project.demo_url)?projectLinkHtml('demo',project.demo_url,'Demo'):'')
    +'</div></div></div>';
}
function blogCard(post){
  var image=post.image_url||'';
  return '<div class="bc reveal" onclick="location.href=\'Blog Detail.html?id='+Number(post.id)+'\'">'
    +'<div class="bc-img" style="'+(image?'background-image:url('+image+');background-size:cover;background-position:center':'')+'">'+(image?'':'<span class="bc-cat">'+escapeHtml(post.category||'Article')+'</span>')+'</div>'
    +'<div class="bc-body"><div class="bc-tags">'+asArray(post.tags).slice(0,3).map(function(tag){return'<span class="btag">'+escapeHtml(tag)+'</span>';}).join('')+'</div>'
    +'<h3 class="bc-title">'+escapeHtml(post.title)+'</h3>'
    +'<p class="bc-exc">'+escapeHtml(post.excerpt||'')+'</p>'
    +'<div class="bc-meta"><span>'+new Date(post.created_at||Date.now()).toLocaleDateString(undefined,{month:'short',year:'numeric'})+'</span><span>'+escapeHtml(post.read_time||'')+'</span></div></div></div>';
}
// Blog.html?q=… / ?tag=… / ?category=… (used by the search box, tags and categories on blog posts)
function applyBlogFilter(rows){
  var params=new URLSearchParams(location.search);
  var q=(params.get('q')||'').trim().toLowerCase();
  var tag=(params.get('tag')||'').trim().toLowerCase();
  var category=(params.get('category')||'').trim().toLowerCase();
  if(!q&&!tag&&!category)return rows;
  var filtered=rows.filter(function(post){
    var tags=asArray(post.tags).map(function(t){return String(t).toLowerCase();});
    if(tag&&tags.indexOf(tag)<0)return false;
    if(category&&String(post.category||'').toLowerCase()!==category)return false;
    if(q&&[post.title,post.excerpt,post.category,tags.join(' ')].join(' ').toLowerCase().indexOf(q)<0)return false;
    return true;
  });
  var label=q?'matching “'+params.get('q').trim()+'”':tag?'tagged “'+params.get('tag').trim()+'”':'in “'+params.get('category').trim()+'”';
  var sub=document.querySelector('.ssub');
  if(sub)sub.innerHTML=escapeHtml(filtered.length+' post'+(filtered.length===1?'':'s')+' '+label)+' · <a href="Blog.html" style="color:var(--a)">Show all posts</a>';
  return filtered;
}
async function loadListing(kind){
  showListingPage();
  var grid=document.getElementById('listing-grid');
  var db=client();
  if(!grid)return;
  grid.classList.add('v');
  if(!db){grid.innerHTML='<p class="ssub">Supabase is not configured in this browser yet.</p>';return;}
  try{
    var result=kind==='projects'
      ? await db.from('projects').select('*').eq('status','published').order('created_at',{ascending:false})
      : await db.from('blog_posts').select('*').eq('status','published').order('created_at',{ascending:false});
    if(result.error){grid.innerHTML='<p class="ssub">Unable to load content. Check Supabase schema and RLS policies.</p>';return;}
    var allRows=result.data||[];
    var rows=kind==='blog'?applyBlogFilter(allRows):allRows;
    var empty=kind==='projects'?'No published projects yet.':(allRows.length?'No posts match — try another search.':'No blog posts yet — check back soon.');
    grid.innerHTML=rows.map(kind==='projects'?projectCard:blogCard).join('')||'<p class="ssub">'+empty+'</p>';
    showListingPage();
    if(kind==='blog')setBlogLinksVisible(allRows.length>0);
    else db.from('blog_posts').select('id',{count:'exact',head:true}).eq('status','published').then(function(r){setBlogLinksVisible(!r.error&&r.count>0);});
  }catch(error){
    console.error('Listing load failed',error);
    grid.innerHTML='<p class="ssub">Unable to load content right now.</p>';
  }
}
document.addEventListener('DOMContentLoaded',showListingPage);
