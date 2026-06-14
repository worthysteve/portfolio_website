function escapeHtml(value){
  return String(value||'').replace(/[&<>"']/g,function(char){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[char];
  });
}
function client(){
  var url=localStorage.getItem('pf-supabase-url')||window.PORTFOLIO_SUPABASE_URL||'';
  var key=localStorage.getItem('pf-supabase-anon-key')||window.PORTFOLIO_SUPABASE_KEY||'';
  if(!url||!key||!window.supabase)return null;
  return window.supabase.createClient(url,key);
}
function showListingPage(){
  document.querySelectorAll('.reveal,.rstagger').forEach(function(el){el.classList.add('v');});
}
function asArray(value){
  return Array.isArray(value)?value:[];
}
function projectCard(project){
  var image=project.image_1_url||localStorage.getItem('pf_proj_'+project.id+'_img_1')||'';
  return '<div class="pc reveal" onclick="location.href=\'Project Detail.html?id='+Number(project.id)+'\'">'
    +'<div class="pc-img" style="'+(image?'background-image:url('+image+');background-size:cover;background-position:center':'')+'">'+(image?'':'<span class="pc-img-lbl">'+escapeHtml(project.title)+'</span>')+'</div>'
    +'<div class="pc-body"><p class="pnum">'+String(project.id).padStart(2,'0')+'</p>'
    +'<div class="pc-tags">'+asArray(project.tags).slice(0,5).map(function(tag){return'<span class="ptag">'+escapeHtml(tag)+'</span>';}).join('')+'</div>'
    +'<h3 class="pc-title">'+escapeHtml(project.title)+'</h3>'
    +'<p class="pc-desc">'+escapeHtml(project.description||project.desc||'')+'</p></div></div>';
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
    var rows=result.data||[];
    grid.innerHTML=rows.map(kind==='projects'?projectCard:blogCard).join('')||'<p class="ssub">No published content yet.</p>';
    showListingPage();
  }catch(error){
    console.error('Listing load failed',error);
    grid.innerHTML='<p class="ssub">Unable to load content right now.</p>';
  }
}
document.addEventListener('DOMContentLoaded',showListingPage);
