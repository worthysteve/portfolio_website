(function(){
  const CONFIG_KEYS = {
    url: 'pf-supabase-url',
    anonKey: 'pf-supabase-anon-key',
    bucket: 'pf-supabase-bucket'
  };

  // Offline fallback data — only used when Supabase is not configured in this browser.
  const fallbackProjects = [
    { id: 1, title: 'Comparative Sentiment Analysis of Twitter Data', type: 'AI / LLM', status: 'published', tags: ['Python','NLP','BERTweet'], created_at: '2026-06-13' },
    { id: 2, title: 'Flood Prediction for Resilient Communities', type: 'Machine Learning', status: 'published', tags: ['Python','Machine Learning'], created_at: '2023-12-01' }
  ];
  const fallbackMessages = [];
  const fallbackPosts = [];
  const fallbackCerts = [
    { id: 1, name: 'Foundations of Financial Engineering', issuer: 'WorldQuant University', category: 'Financial Engineering', verified: true, month_earned: 4, year_earned: 2026 }
  ];
  const fallbackExperience = [
    { id: 1, role: 'AI/ML Fellow', organisation: 'Developers Foundry Fellowship — Tech4Dev', date_period: 'Nov 2024 — Dec 2025', category: 'fellowship', tags: ['Machine Learning'], display_order: 1 },
    { id: 2, role: 'Project Manager', organisation: 'ICT Consultancy and General Services (SL) Ltd', date_period: 'May 2019 — Sep 2023', category: 'work', tags: ['Project Management'], display_order: 2 }
  ];
  const fallbackEducation = [
    { id: 1, degree: 'M.Sc. Financial Engineering', institution: 'WorldQuant University', date_period: 'Oct 2025 — Present', tags: ['Quantitative Finance'], display_order: 1 },
    { id: 2, degree: 'B.Sc. (Hons.) Information Systems', institution: 'University of Sierra Leone', date_period: 'Feb 2015 — Feb 2019', tags: ['Best Graduating Student'], display_order: 2 }
  ];
  const fallbackAchievements = [
    { id: 1, title: 'Best Graduating Student', organisation: 'University of Sierra Leone', year: '2019', description: 'Best graduating student in the Information Systems department.', display_order: 1 }
  ];

  let client = null;
  let clientKey = '';
  const adminData = {
    projects: [],
    blog_posts: [],
    certifications: [],
    experience: [],
    education: [],
    achievements: [],
    messages: [],
    blog_comments: []
  };

  function getConfig() {
    return {
      url: localStorage.getItem(CONFIG_KEYS.url) || window.PORTFOLIO_SUPABASE_URL || '',
      anonKey: localStorage.getItem(CONFIG_KEYS.anonKey) || window.PORTFOLIO_SUPABASE_KEY || '',
      bucket: localStorage.getItem(CONFIG_KEYS.bucket) || window.PORTFOLIO_SUPABASE_BUCKET || 'portfolio-media'
    };
  }

  // SIGN-IN PERSISTENCE — by default the admin session lives only until the tab/browser is closed,
  // so every new visit asks for your credentials. "Keep me signed in on this device" opts in to a
  // persistent session (stored like Supabase's default).
  const KEEP_SIGNED_IN_KEY = 'pf-admin-keep-signed-in';
  function keepSignedIn() {
    try { return localStorage.getItem(KEEP_SIGNED_IN_KEY) === '1'; } catch (e) { return false; }
  }
  function sessionStore() {
    return keepSignedIn() ? window.localStorage : window.sessionStorage;
  }
  const adminAuthStorage = {
    getItem: function(key){ return sessionStore().getItem(key); },
    setItem: function(key, value){ sessionStore().setItem(key, value); },
    removeItem: function(key){ window.localStorage.removeItem(key); window.sessionStorage.removeItem(key); }
  };
  function setKeepSignedIn(keep) {
    try {
      if (keep) localStorage.setItem(KEEP_SIGNED_IN_KEY, '1');
      else localStorage.removeItem(KEEP_SIGNED_IN_KEY);
    } catch (e) {}
    if (!keep) forgetPersistentSessions();
  }
  // Removes sessions saved permanently on this device (including ones from before this change).
  function forgetPersistentSessions() {
    try {
      Object.keys(localStorage).forEach(function(key){
        if (/^sb-.+-auth-token$/.test(key)) localStorage.removeItem(key);
      });
    } catch (e) {}
  }
  if (!keepSignedIn()) forgetPersistentSessions();

  // One client per URL/key. Creating a new client on every call starts several auth
  // instances that compete for the same session lock and make saves hang.
  function init() {
    const cfg = getConfig();
    if (!cfg.url || !cfg.anonKey || !window.supabase) {
      client = null;
      clientKey = '';
      return null;
    }
    const key = cfg.url + '|' + cfg.anonKey;
    if (!client || clientKey !== key) {
      client = window.supabase.createClient(cfg.url, cfg.anonKey, { auth: { storage: adminAuthStorage, persistSession: true } });
      clientKey = key;
    }
    return client;
  }

  function isConfigured() {
    const cfg = getConfig();
    return Boolean(cfg.url && cfg.anonKey && window.supabase);
  }

  function show(msg, type) {
    if (window.showToast) window.showToast(msg, type);
  }

  // Locks the clicked button while an action runs (spinner + optional label) so it can't be
  // clicked twice. Returns a function that restores the button.
  function busy(btn, label) {
    if (!btn || !btn.tagName) return function(){};
    const original = btn.innerHTML;
    btn.disabled = true;
    btn.dataset.busy = '1';
    btn.innerHTML = '<span class="spin" aria-hidden="true"></span>' + (label || '');
    return function(){
      btn.disabled = false;
      delete btn.dataset.busy;
      btn.innerHTML = original;
    };
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function(char){
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[char];
    });
  }

  function formatDate(value) {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function relativeTime(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const diff = Date.now() - date.getTime();
    const mins = Math.max(1, Math.round(diff / 60000));
    if (mins < 60) return mins + 'm ago';
    const hours = Math.round(mins / 60);
    if (hours < 24) return hours + 'h ago';
    return Math.round(hours / 24) + 'd ago';
  }

  function statusClass(status) {
    const s = String(status || '').toLowerCase();
    if (s === 'draft') return 'draft';
    if (s === 'archived') return 'archived';
    if (s === 'under review') return 'review';
    return 'published';
  }
  function certificationSortValue(cert) {
    const year = Number(cert.year_earned) || 0;
    const month = Number(cert.month_earned) || 0;
    return year * 100 + month;
  }
  function formatEarnedDate(cert) {
    const year = Number(cert.year_earned) || 0;
    const month = Number(cert.month_earned) || 0;
    if (!year) return '-';
    if (!month) return String(year);
    const date = new Date(year, month - 1, 1);
    return date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
  }

  const ICON_EDIT = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>';
  const ICON_DELETE = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>';
  function rowActions(modalType, table, id, label) {
    return '<div class="td-actions">'
      + '<button class="ia" title="Edit" aria-label="Edit" onclick="openModal(\'' + modalType + '\',' + Number(id) + ')">' + ICON_EDIT + '</button>'
      + '<button class="ia del" title="Delete" aria-label="Delete" onclick="PortfolioAdminDB.deleteRecord(\'' + table + '\',' + Number(id) + ',\'' + escapeForCall(label) + '\',this)">' + ICON_DELETE + '</button>'
      + '</div>';
  }
  function setCount(viewId, count, noun) {
    const el = document.querySelector('#' + viewId + ' [data-table-count]');
    if (el) el.textContent = count + ' ' + noun + (count === 1 ? '' : 's');
  }
  function emptyRow(colspan, text) {
    return '<tr><td colspan="' + colspan + '"><div class="empty-state">' + text + '</div></td></tr>';
  }

  function renderProjects(projects) {
    adminData.projects = Array.isArray(projects) ? projects : [];
    const tbody = document.querySelector('#view-projects tbody');
    setCount('view-projects', adminData.projects.length, 'project');
    if (!tbody) return;
    if (!adminData.projects.length) {
      tbody.innerHTML = emptyRow(6, 'No projects yet. Add your first project.');
      return;
    }
    tbody.innerHTML = adminData.projects.map(function(project, index){
      const tags = project.tags || [];
      const status = project.status || 'published';
      return '<tr>'
        + '<td class="td-mono">' + String(index + 1).padStart(2, '0') + '</td>'
        + '<td class="td-title">' + escapeHtml(project.title) + '</td>'
        + '<td class="td-mono">' + escapeHtml(tags.slice(0, 3).join(', ')) + '</td>'
        + '<td><span class="badge ' + statusClass(status) + '">' + escapeHtml(status) + '</span></td>'
        + '<td class="td-mono">' + formatDate(project.created_at || project.date_period) + '</td>'
        + '<td>' + rowActions('project', 'projects', project.id, project.title) + '</td></tr>';
    }).join('');
  }

  function renderMessages(messages) {
    adminData.messages = Array.isArray(messages) ? messages : [];
    const list = document.querySelector('#view-messages .msg-list');
    if (!list) return;
    if (!adminData.messages.length) {
      list.innerHTML = '<div class="empty-state">No messages yet. Contact form submissions will appear here.</div>';
      return;
    }
    list.innerHTML = adminData.messages.map(function(message){
      const unread = (message.status || 'unread') === 'unread';
      const initials = String(message.name || 'Visitor').split(/\s+/).filter(Boolean).slice(0,2).map(function(part){ return part[0]; }).join('').toUpperCase() || 'V';
      const preview = message.message || '';
      return '<div class="msg-item' + (unread ? ' unread' : '') + '" role="button" tabindex="0" title="Open message" onclick="openMessage(' + Number(message.id) + ')" onkeydown="if(event.key===\'Enter\')openMessage(' + Number(message.id) + ')">'
        + '<div class="msg-avatar">' + escapeHtml(initials) + '</div>'
        + '<div class="msg-content">'
        + '<p class="msg-from">' + escapeHtml(message.name || 'Visitor') + '</p>'
        + '<p class="msg-subject">' + (message.email ? '<a href="mailto:' + escapeHtml(message.email) + '" onclick="event.stopPropagation()">' + escapeHtml(message.email) + '</a>' : 'No email address captured') + '</p>'
        + '<p class="msg-subject">' + escapeHtml(message.subject || 'No subject') + '</p>'
        + '<p class="msg-preview">' + escapeHtml(preview) + '</p>'
        + (message.reply_text ? '<p class="msg-replied">Replied' + (message.replied_at ? ' ' + escapeHtml(relativeTime(message.replied_at)) : '') + '</p>' : '')
        + '</div>'
        + '<div class="msg-meta"><span class="msg-time">' + escapeHtml(relativeTime(message.created_at)) + '</span>'
        + '<span class="badge ' + (unread ? 'unread' : 'read') + '">' + (unread ? 'New' : 'Read') + '</span>'
        + '<div class="msg-actions">'
        + '<button class="msg-reply-btn" onclick="event.stopPropagation();openMessage(' + Number(message.id) + ')" title="Reply" aria-label="Reply"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg></button>'
        + '<button class="msg-reply-btn del" onclick="event.stopPropagation();PortfolioAdminDB.deleteRecord(\'messages\',' + Number(message.id) + ',\'message from ' + escapeForCall(message.name || 'Visitor') + '\',this)" title="Delete" aria-label="Delete">' + ICON_DELETE.replace(/12/g, '11') + '</button>'
        + '</div></div>'
        + '</div>';
    }).join('');
  }

  function renderBlogComments(comments) {
    adminData.blog_comments = Array.isArray(comments) ? comments : [];
    const list = document.querySelector('#view-comments .msg-list');
    if (!list) return;
    if (!adminData.blog_comments.length) {
      list.innerHTML = '<div class="empty-state">No blog comments yet.</div>';
      return;
    }
    const titles = (adminData.blog_posts || []).reduce(function(acc, post){ acc[post.id] = post.title; return acc; }, {});
    list.innerHTML = adminData.blog_comments.map(function(comment){
      const preview = comment.comment || '';
      const postLabel = titles[comment.post_id] ? '“' + titles[comment.post_id] + '”' : 'Post #' + comment.post_id;
      return '<div class="msg-item">'
        + '<div class="msg-avatar">' + escapeHtml(String(comment.name || 'U').slice(0,2).toUpperCase()) + '</div>'
        + '<div class="msg-content">'
        + '<p class="msg-from">' + escapeHtml(comment.name || 'Visitor') + (comment.is_admin ? ' · Admin' : '') + '</p>'
        + '<p class="msg-subject"><a href="Blog Detail.html?id=' + Number(comment.post_id) + '" target="_blank" rel="noopener">' + escapeHtml(postLabel) + '</a>' + (comment.parent_id ? ' · Reply to #' + escapeHtml(comment.parent_id) : '') + '</p>'
        + '<p class="msg-preview" style="white-space:normal">' + escapeHtml(preview) + '</p>'
        + '</div>'
        + '<div class="msg-meta"><span class="msg-time">' + escapeHtml(relativeTime(comment.created_at)) + '</span>'
        + '<div class="msg-actions">'
        + '<button class="msg-reply-btn" onclick="event.stopPropagation();PortfolioAdminDB.replyToBlogComment(' + Number(comment.id) + ',' + Number(comment.post_id) + ',this)" title="Reply" aria-label="Reply"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg></button>'
        + '<button class="msg-reply-btn del" onclick="event.stopPropagation();PortfolioAdminDB.deleteRecord(\'blog_comments\',' + Number(comment.id) + ',\'comment by ' + escapeForCall(comment.name || 'Visitor') + '\',this)" title="Delete" aria-label="Delete">' + ICON_DELETE.replace(/12/g, '11') + '</button>'
        + '</div></div>'
        + '</div>';
    }).join('');
  }

  function renderBlogPosts(posts) {
    adminData.blog_posts = Array.isArray(posts) ? posts : [];
    const tbody = document.querySelector('#view-blog tbody');
    setCount('view-blog', adminData.blog_posts.length, 'post');
    if (!tbody) return;
    if (!adminData.blog_posts.length) {
      tbody.innerHTML = emptyRow(6, 'No blog posts yet. The Blog section stays hidden on your portfolio until you publish one.');
      return;
    }
    tbody.innerHTML = adminData.blog_posts.map(function(post){
      const status = post.status || 'draft';
      return '<tr>'
        + '<td class="td-title">' + escapeHtml(post.title) + '</td>'
        + '<td class="td-mono">' + escapeHtml(post.category || '-') + '</td>'
        + '<td class="td-mono">' + escapeHtml(post.read_time || '-') + '</td>'
        + '<td><span class="badge ' + statusClass(status) + '">' + escapeHtml(status) + '</span></td>'
        + '<td class="td-mono">' + formatDate(post.created_at) + '</td>'
        + '<td>' + rowActions('blog', 'blog_posts', post.id, post.title) + '</td></tr>';
    }).join('');
  }

  function renderCertifications(certs) {
    adminData.certifications = Array.isArray(certs) ? certs : [];
    const tbody = document.querySelector('#view-certs tbody');
    setCount('view-certs', adminData.certifications.length, 'certification');
    if (!tbody) return;
    if (!adminData.certifications.length) {
      tbody.innerHTML = emptyRow(6, 'No certifications yet.');
      return;
    }
    const sortedCerts = adminData.certifications.slice().sort(function(a,b){
      return certificationSortValue(b) - certificationSortValue(a) || new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });
    tbody.innerHTML = sortedCerts.map(function(cert){
      return '<tr>'
        + '<td class="td-title">' + escapeHtml(cert.name) + (cert.embed_code ? ' <span class="badge published">Embed</span>' : '') + '</td>'
        + '<td class="td-mono">' + escapeHtml(cert.issuer || '-') + '</td>'
        + '<td class="td-mono">' + escapeHtml(cert.category || '-') + '</td>'
        + '<td><span class="badge published">' + (cert.verified === false ? 'Unverified' : 'Verified') + '</span></td>'
        + '<td class="td-mono">' + escapeHtml(formatEarnedDate(cert)) + '</td>'
        + '<td>' + rowActions('cert', 'certifications', cert.id, cert.name) + '</td>'
        + '</tr>';
    }).join('');
  }

  function experienceCategoryLabel(item) {
    return /fellow/i.test(String(item.category || '')) ? 'Fellowship / Bootcamp' : 'Work';
  }

  function renderExperience(experience) {
    adminData.experience = Array.isArray(experience) ? experience : [];
    const tbody = document.querySelector('#view-experience tbody');
    setCount('view-experience', adminData.experience.length, 'entry');
    if (!tbody) return;
    if (!adminData.experience.length) {
      tbody.innerHTML = emptyRow(6, 'No experience entries yet. Use “Import into admin” on the Dashboard to bring in the entries shown on your portfolio.');
      return;
    }
    tbody.innerHTML = adminData.experience.map(function(item){
      return '<tr>'
        + '<td class="td-title">' + escapeHtml(item.role) + '</td>'
        + '<td class="td-mono">' + escapeHtml(item.organisation || '-') + '</td>'
        + '<td class="td-mono">' + escapeHtml(experienceCategoryLabel(item)) + '</td>'
        + '<td class="td-mono">' + escapeHtml(item.date_period || '-') + '</td>'
        + '<td class="td-mono">' + escapeHtml((item.tags || []).slice(0, 3).join(', ')) + '</td>'
        + '<td>' + rowActions('experience', 'experience', item.id, item.role) + '</td>'
        + '</tr>';
    }).join('');
  }

  function renderEducation(education) {
    adminData.education = Array.isArray(education) ? education : [];
    const tbody = document.querySelector('#view-education tbody');
    setCount('view-education', adminData.education.length, 'entry');
    if (!tbody) return;
    if (!adminData.education.length) {
      tbody.innerHTML = emptyRow(5, 'No education entries yet. Use “Import into admin” on the Dashboard to bring in the entries shown on your portfolio.');
      return;
    }
    tbody.innerHTML = adminData.education.map(function(item){
      return '<tr>'
        + '<td class="td-title">' + escapeHtml(item.degree) + '</td>'
        + '<td class="td-mono">' + escapeHtml(item.institution || '-') + '</td>'
        + '<td class="td-mono">' + escapeHtml(item.date_period || '-') + '</td>'
        + '<td class="td-mono">' + escapeHtml((item.tags || []).slice(0, 3).join(', ')) + '</td>'
        + '<td>' + rowActions('education', 'education', item.id, item.degree) + '</td>'
        + '</tr>';
    }).join('');
  }

  function renderAchievements(achievements) {
    adminData.achievements = Array.isArray(achievements) ? achievements : [];
    const tbody = document.querySelector('#view-achievements tbody');
    setCount('view-achievements', adminData.achievements.length, 'achievement');
    if (!tbody) return;
    if (!adminData.achievements.length) {
      tbody.innerHTML = emptyRow(5, 'No achievements yet. Use “Import into admin” on the Dashboard to bring in the ones shown on your portfolio.');
      return;
    }
    tbody.innerHTML = adminData.achievements.map(function(item){
      return '<tr>'
        + '<td class="td-title">' + escapeHtml(item.title) + '</td>'
        + '<td class="td-mono">' + escapeHtml(item.organisation || '-') + '</td>'
        + '<td class="td-mono">' + escapeHtml(item.year || '-') + '</td>'
        + '<td class="td-mono">' + escapeHtml((item.description || '').slice(0, 80)) + '</td>'
        + '<td>' + rowActions('achievement', 'achievements', item.id, item.title) + '</td>'
        + '</tr>';
    }).join('');
  }

  function escapeForCall(value) {
    return escapeHtml(String(value || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/[\r\n]+/g, ' '));
  }

  function renderStats(data) {
    const unread = data.messages.filter(function(m){ return (m.status || 'unread') === 'unread'; }).length;
    const published = function(rows){ return rows.filter(function(r){ return String(r.status || 'published').toLowerCase() === 'published'; }).length; };
    const vals = document.querySelectorAll('#view-dashboard .sc-val');
    const deltas = document.querySelectorAll('#view-dashboard .sc-delta');
    if (vals[0]) vals[0].textContent = data.projects.length;
    if (deltas[0]) deltas[0].textContent = published(data.projects) + ' published';
    if (vals[1]) vals[1].textContent = data.posts.length;
    if (deltas[1]) deltas[1].textContent = published(data.posts) + ' published';
    if (vals[2]) vals[2].textContent = unread;
    if (deltas[2]) deltas[2].textContent = data.messages.length + ' total';
    if (vals[3]) vals[3].textContent = data.certs.length;

    // Content overview bars — real counts per section
    const sections = [
      ['Projects', data.projects.length],
      ['Blog Posts', data.posts.length],
      ['Certifications', data.certs.length],
      ['Experience', data.experience.length],
      ['Education', data.education.length],
      ['Achievements', data.achievements.length],
      ['Messages', data.messages.length]
    ];
    const max = Math.max(1, ...sections.map(function(s){ return s[1]; }));
    const bars = document.getElementById('content-bars');
    if (bars) {
      bars.innerHTML = sections.map(function(s){
        return '<div class="bar-row"><span class="bar-label">' + s[0] + '</span><div class="bar-track"><div class="bar-fill" style="width:' + Math.round(s[1] / max * 100) + '%"></div></div><span class="bar-val">' + s[1] + '</span></div>';
      }).join('');
    }

    // Donut — share of published content by type
    const parts = [
      { value: published(data.projects), color: '#2563EB' },
      { value: published(data.posts), color: '#06B6D4' },
      { value: data.certs.length, color: '#8B5CF6' },
      { value: data.experience.length, color: '#10B981' }
    ];
    const total = parts.reduce(function(sum, p){ return sum + p.value; }, 0);
    const legend = document.querySelectorAll('.donut-legend .dl-item span');
    parts.forEach(function(p, i){ if (legend[i]) legend[i].textContent = p.value; });
    const donutVal = document.querySelector('.donut-val');
    if (donutVal) donutVal.textContent = total;
    const segments = document.getElementById('donut-segments');
    if (segments) {
      let offset = 0;
      segments.innerHTML = total ? parts.map(function(p){
        const length = p.value / total * 100;
        const circle = '<circle cx="21" cy="21" r="15.915" fill="transparent" stroke="' + p.color + '" stroke-width="4" stroke-dasharray="' + length + ' ' + (100 - length) + '" stroke-dashoffset="' + (-offset) + '"/>';
        offset += length;
        return length ? circle : '';
      }).join('') : '';
    }
  }

  function renderRecentActivity(data) {
    const list = document.getElementById('recent-activity');
    if (!list) return;
    const items = []
      .concat(data.projects.map(function(r){ return { at: r.created_at, dot: '', text: '<strong>Project</strong><br><span>' + escapeHtml(r.title) + '</span>', view: 'projects' }; }))
      .concat(data.posts.map(function(r){ return { at: r.created_at, dot: 'purple', text: '<strong>Blog post</strong><br><span>' + escapeHtml(r.title) + '</span>', view: 'blog' }; }))
      .concat(data.certs.map(function(r){ return { at: r.created_at, dot: 'yellow', text: '<strong>Certification</strong><br><span>' + escapeHtml(r.name) + '</span>', view: 'certs' }; }))
      .concat(data.experience.map(function(r){ return { at: r.created_at, dot: 'green', text: '<strong>Experience</strong><br><span>' + escapeHtml(r.role) + '</span>', view: 'experience' }; }))
      .concat(data.education.map(function(r){ return { at: r.created_at, dot: 'green', text: '<strong>Education</strong><br><span>' + escapeHtml(r.degree) + '</span>', view: 'education' }; }))
      .concat(data.comments.map(function(r){ return { at: r.created_at, dot: 'purple', text: '<strong>Comment from ' + escapeHtml(r.name || 'Visitor') + '</strong><br><span>' + escapeHtml(String(r.comment || '').slice(0, 60)) + '</span>', view: 'comments' }; }))
      .filter(function(item){ return item.at && !Number.isNaN(new Date(item.at).getTime()); })
      .sort(function(a, b){ return new Date(b.at) - new Date(a.at); })
      .slice(0, 5);
    if (!items.length) {
      list.innerHTML = '<div class="empty-state">No recent activity yet.</div>';
      return;
    }
    list.innerHTML = items.map(function(item){
      return '<div class="ac-item" style="cursor:pointer" onclick="switchView(\'' + item.view + '\')">'
        + '<div class="ac-dot' + (item.dot ? ' ' + item.dot : '') + '"></div>'
        + '<div class="ac-text">' + item.text + '</div>'
        + '<span class="ac-time">' + escapeHtml(relativeTime(item.at)) + '</span>'
        + '</div>';
    }).join('');
  }

  function renderDashboardInbox(messages) {
    const list = document.getElementById('dashboard-inbox-preview');
    if (!list) return;
    if (!messages.length) {
      list.innerHTML = '<div class="empty-state">No messages yet.</div>';
      return;
    }
    list.innerHTML = messages.slice(0, 4).map(function(message){
      const unread = (message.status || 'unread') === 'unread';
      return '<div class="ac-item" style="cursor:pointer" onclick="openMessage(' + Number(message.id) + ')">'
        + '<div class="ac-dot' + (unread ? '' : ' green') + '"></div>'
        + '<div class="ac-text"><strong>' + escapeHtml(message.name || 'Visitor') + '</strong><br><span>' + escapeHtml(message.subject || message.message || 'No subject') + '</span></div>'
        + '<span class="ac-time">' + escapeHtml(relativeTime(message.created_at)) + '</span>'
        + '</div>';
    }).join('');
  }

  function renderNotifications(messages) {
    const unread = (messages || []).filter(function(message){ return (message.status || 'unread') === 'unread'; });
    const badge = document.getElementById('notif-badge');
    const label = document.getElementById('notif-count-label');
    const list = document.getElementById('notif-list');
    if (badge) {
      badge.textContent = unread.length > 99 ? '99+' : String(unread.length);
      badge.style.display = unread.length ? 'flex' : 'none';
    }
    const sidebarBadge = document.getElementById('messages-sidebar-badge');
    if (sidebarBadge) {
      sidebarBadge.textContent = unread.length > 99 ? '99+' : String(unread.length);
      sidebarBadge.style.display = unread.length ? 'inline-flex' : 'none';
    }
    if (label) label.textContent = unread.length + ' unread';
    if (!list) return;
    if (!unread.length) {
      list.innerHTML = '<div class="notif-empty">No unread notifications.</div>';
      return;
    }
    list.innerHTML = unread.slice(0, 5).map(function(message){
      return '<div class="notif-item" onclick="closeNotifications();openMessage(' + Number(message.id) + ')">'
        + '<div class="notif-dot"></div>'
        + '<div><p class="notif-title">' + escapeHtml(message.name || 'Visitor') + '</p>'
        + '<p class="notif-text">' + escapeHtml(message.subject || message.message || 'New message') + '</p>'
        + '<p class="notif-time">' + escapeHtml(relativeTime(message.created_at)) + '</p></div>'
        + '</div>';
    }).join('');
  }

  function renderAll(data) {
    renderProjects(data.projects);
    renderBlogPosts(data.posts);
    renderMessages(data.messages);
    renderCertifications(data.certs);
    renderExperience(data.experience);
    renderEducation(data.education);
    renderAchievements(data.achievements);
    renderBlogComments(data.comments);
    renderStats(data);
    renderRecentActivity(data);
    renderDashboardInbox(data.messages);
    renderNotifications(data.messages);
    if (window.applyAdminSearch) window.applyAdminSearch();
  }

  async function loadDashboard() {
    if (!init()) {
      renderAll({
        projects: fallbackProjects.concat(readLocalRecords('pf_projects_custom')),
        posts: fallbackPosts,
        messages: fallbackMessages,
        certs: fallbackCerts,
        experience: fallbackExperience.concat(readLocalRecords('pf_experience_custom')),
        education: fallbackEducation.concat(readLocalRecords('pf_education_custom')),
        achievements: fallbackAchievements.concat(readLocalRecords('pf_achievements_custom')),
        comments: []
      });
      return { connected: false };
    }
    const results = await Promise.all([
      readTable('projects', client.from('projects').select('*').order('created_at', { ascending: false })),
      readTable('blog_posts', client.from('blog_posts').select('*').order('created_at', { ascending: false })),
      readTable('messages', client.from('messages').select('*').order('created_at', { ascending: false })),
      readTable('certifications', client.from('certifications').select('*').order('year_earned', { ascending: false }).order('month_earned', { ascending: false }).order('created_at', { ascending: false })),
      readTable('experience', client.from('experience').select('*').order('display_order', { ascending: true }).order('created_at', { ascending: false })),
      readTable('education', client.from('education').select('*').order('display_order', { ascending: true }).order('created_at', { ascending: false })),
      readTable('achievements', client.from('achievements').select('*').order('display_order', { ascending: true }).order('created_at', { ascending: false })),
      readTable('blog_comments', client.from('blog_comments').select('*').order('created_at', { ascending: false })),
      readTable('site_media', client.from('site_media').select('*'))
    ]);
    const byName = results.reduce(function(acc, result){ acc[result.name] = result; return acc; }, {});
    const failed = results.filter(function(result){ return result.error; });
    if (failed.length) {
      const first = failed[0];
      show('Supabase read failed: ' + first.name + ' — ' + (first.error.message || first.error.code || 'check schema/RLS'), 'error');
      console.warn('Supabase dashboard read failures', failed);
    }
    renderAll({
      projects: byName.projects.data || [],
      posts: byName.blog_posts.data || [],
      messages: byName.messages.data || [],
      certs: byName.certifications.data || [],
      experience: byName.experience.data || [],
      education: byName.education.data || [],
      achievements: byName.achievements.data || [],
      comments: byName.blog_comments.data || []
    });
    if (window.renderAdminSiteMedia) window.renderAdminSiteMedia(byName.site_media.data || []);
    renderPlaceholderNotice();
    checkDatabaseUpdate();
    return { connected: failed.length === 0, failures: failed };
  }

  async function readTable(name, query) {
    try {
      const result = await query;
      return { name: name, data: result.data || null, error: result.error || null };
    } catch (error) {
      return { name: name, data: null, error: error };
    }
  }

  // ── PORTFOLIO PLACEHOLDERS ─────────────────────────────────────────────────────────────
  // index.html ships with placeholder entries (from the CV). Importing copies them into Supabase
  // exactly as they appear, so they become editable here and new entries are added alongside them.
  const PLACEHOLDER_SECTIONS = {
    experience:   { key: function(row){ return normalizeKey(row.role); },   one: 'experience entry',  many: 'experience entries' },
    education:    { key: function(row){ return normalizeKey(row.degree); }, one: 'education entry',   many: 'education entries' },
    achievements: { key: function(row){ return normalizeKey(row.title); },  one: 'achievement',       many: 'achievements' },
    projects:     { key: function(row){ return normalizeKey(row.title); },  one: 'project',           many: 'projects' }
  };
  let placeholderCache = null;

  function normalizeKey(value) {
    return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
  }
  function textOf(el, selector) {
    const node = selector ? el.querySelector(selector) : el;
    return node ? node.textContent.replace(/\s+/g, ' ').trim() : '';
  }
  // Keeps <strong> as **bold** so it still renders bold on the portfolio.
  function richTextOf(el) {
    const copy = el.cloneNode(true);
    copy.querySelectorAll('strong,b').forEach(function(node){ node.replaceWith('**' + node.textContent + '**'); });
    return copy.textContent.replace(/\s+/g, ' ').trim();
  }
  function monthEnd(value) {
    const match = String(value || '').match(/^(\d{4})-(\d{2})$/);
    if (!match) return null;
    return new Date(Date.UTC(Number(match[1]), Number(match[2]), 0)).toISOString().slice(0, 10);
  }

  async function readPlaceholders() {
    if (placeholderCache) return placeholderCache;
    const response = await fetch('index.html', { cache: 'no-store' });
    if (!response.ok) throw new Error('Could not read your portfolio page (index.html)');
    const doc = new DOMParser().parseFromString(await response.text(), 'text/html');

    const experience = [];
    doc.querySelectorAll('#experience [data-exp-group]').forEach(function(group){
      group.querySelectorAll('.tl-it').forEach(function(item){
        const intro = item.querySelector('p.tl-desc');
        const bullets = Array.from(item.querySelectorAll('ul.tl-desc li')).map(function(li){ return '- ' + richTextOf(li); });
        experience.push({
          role: textOf(item, '.tl-role'),
          organisation: textOf(item, '.tl-org'),
          category: group.dataset.expGroup === 'fellowship' ? 'fellowship' : 'work',
          date_period: textOf(item, '.tl-date'),
          start_date: item.dataset.start ? item.dataset.start + '-01' : null,
          end_date: item.dataset.end && item.dataset.end !== 'present' ? monthEnd(item.dataset.end) : null,
          description: [intro ? richTextOf(intro) : ''].concat(bullets).filter(Boolean).join('\n'),
          tags: Array.from(item.querySelectorAll('.tmeta')).map(function(t){ return textOf(t); }),
          award: textOf(item, '.tl-award').replace(/^↑\s*/, '') || null,
          display_order: experience.length + 1
        });
      });
    });

    const education = Array.from(doc.querySelectorAll('#education .tl-it')).map(function(item, index){
      const desc = item.querySelector('p.tl-desc');
      return {
        degree: textOf(item, '.tl-role'),
        institution: textOf(item, '.tl-org'),
        date_period: textOf(item, '.tl-date'),
        description: desc ? richTextOf(desc) : '',
        thesis: textOf(item, '.tl-thesis') || null,
        tags: Array.from(item.querySelectorAll('.tmeta')).map(function(t){ return textOf(t); }),
        award: textOf(item, '.tl-award').replace(/^↑\s*/, '') || null,
        display_order: index
      };
    });

    const achievements = Array.from(doc.querySelectorAll('.ach-g .ach')).map(function(item, index){
      const svg = item.querySelector('.ach-icon svg');
      const markup = svg ? svg.innerHTML : '';
      return {
        title: textOf(item, '.ach-title'),
        organisation: textOf(item, '.ach-org'),
        year: textOf(item, '.ach-year'),
        description: textOf(item, '.ach-desc'),
        icon: markup.indexOf('M9.5 2A2.5') > -1 ? 'brain' : markup.indexOf('x1="2"') > -1 ? 'globe' : markup.indexOf('cx="12" cy="8" r="6"') > -1 ? 'medal' : 'award',
        display_order: index + 1
      };
    });

    const projects = Array.from(doc.querySelectorAll('.prj-g .pc')).map(function(card){
      const link = function(label){
        const anchor = Array.from(card.querySelectorAll('.pc-links a')).find(function(a){ return a.textContent.trim().indexOf(label) === 0; });
        return anchor ? anchor.getAttribute('href') : null;
      };
      return {
        title: textOf(card, '.pc-title'),
        type: card.dataset.type || 'Machine Learning',
        status: 'published',
        description: textOf(card, '.pc-desc'),
        tags: Array.from(card.querySelectorAll('.ptag')).map(function(t){ return textOf(t); }),
        metrics: [],
        features: [],
        github_url: link('GitHub'),
        live_url: link('Live')
      };
    });

    placeholderCache = { experience: experience, education: education, achievements: achievements, projects: projects };
    return placeholderCache;
  }

  // Placeholder rows that are not in Supabase yet (matched by title/role/degree).
  async function missingPlaceholders(sections) {
    const all = await readPlaceholders();
    const result = {};
    (sections || Object.keys(PLACEHOLDER_SECTIONS)).forEach(function(section){
      const keyOf = PLACEHOLDER_SECTIONS[section].key;
      const existing = new Set((adminData[section] || []).map(keyOf));
      const githubs = new Set((adminData[section] || []).map(function(row){ return row.github_url; }).filter(Boolean));
      result[section] = (all[section] || []).filter(function(row){
        return !existing.has(keyOf(row)) && !(row.github_url && githubs.has(row.github_url));
      });
    });
    return result;
  }

  function describeCounts(counts) {
    return Object.keys(counts).filter(function(section){ return counts[section] > 0; }).map(function(section){
      const info = PLACEHOLDER_SECTIONS[section];
      return counts[section] + ' ' + (counts[section] === 1 ? info.one : info.many);
    });
  }

  // Copies missing placeholders into Supabase. Returns { added: {section: n}, failed: {section: reason} }.
  async function importPlaceholders(btn, sections, options) {
    options = options || {};
    const summary = { added: {}, failed: {} };
    if (!init()) { summary.failed.all = 'Supabase is not configured'; if (!options.quiet) show('Supabase is not configured', 'error'); return summary; }
    const restore = busy(btn, 'Importing…');
    try {
      const missing = await missingPlaceholders(sections);
      for (const section of Object.keys(missing)) {
        let rows = missing[section];
        if (!rows.length) continue;
        if (section === 'projects') {
          // Keep the page order and place them after the projects you already have.
          const oldest = (adminData.projects || []).reduce(function(min, row){
            const time = new Date(row.created_at).getTime();
            return Number.isFinite(time) && time < min ? time : min;
          }, Date.now());
          rows = rows.map(function(row, index){ return Object.assign({}, row, { created_at: new Date(oldest - (index + 1) * 60000).toISOString() }); });
        }
        try {
          const { error } = await client.from(section).insert(rows);
          if (error) throw error;
          summary.added[section] = rows.length;
        } catch (error) {
          summary.failed[section] = /category/i.test(error.message || '')
            ? 'it needs the one-time database update first (see the yellow box on the Dashboard). Everything else was imported'
            : (error.message || 'unknown error');
        }
      }
    } catch (error) {
      summary.failed.all = error.message || 'could not read your portfolio placeholders';
    } finally {
      restore();
    }
    if (!options.quiet) {
      const added = describeCounts(summary.added);
      const failed = Object.keys(summary.failed).map(function(section){ return (section === 'all' ? 'Import' : section) + ': ' + summary.failed[section]; });
      if (failed.length) show('✕ Not everything was imported — ' + failed.join('; ') + (added.length ? ' (imported: ' + added.join(', ') + ')' : ''), 'error');
      else if (added.length) show('✓ Imported ' + added.join(', ') + ' — they now appear here and stay on your portfolio', 'success');
      else show('Everything from your portfolio is already in the admin', 'info');
      await loadDashboard();
    }
    return summary;
  }

  // Shows the "import" prompt on the dashboard and the status line in Settings.
  async function renderPlaceholderNotice() {
    const banner = document.getElementById('import-banner');
    const status = document.getElementById('import-status');
    if (!banner && !status) return;
    let missing;
    try { missing = await missingPlaceholders(); } catch (error) { return; }
    const counts = {};
    Object.keys(missing).forEach(function(section){ counts[section] = missing[section].length; });
    const parts = describeCounts(counts);
    const total = Object.values(counts).reduce(function(sum, n){ return sum + n; }, 0);
    const text = total
      ? parts.join(', ') + ' shown on your portfolio ' + (total === 1 ? 'is' : 'are') + ' not in the admin yet.'
      : 'Everything shown on your portfolio is already in the admin.';
    if (banner) {
      banner.hidden = !parts.length;
      const label = banner.querySelector('[data-import-text]');
      if (label) label.textContent = text;
    }
    if (status) status.textContent = text;
  }

  // True when supabase/migrations/…sql has not been run yet (the experience.category column is missing).
  async function checkDatabaseUpdate() {
    if (!init()) return false;
    let needed = false;
    try {
      const { error } = await client.from('experience').select('category').limit(1);
      needed = Boolean(error && (error.code === '42703' || /category/i.test(error.message || '')));
    } catch (error) {}
    if (window.renderDatabaseUpdateNotice) window.renderDatabaseUpdateNotice(needed);
    return needed;
  }

  function getRows(section) {
    return (adminData[section] || []).slice();
  }

  function getProjectById(id) {
    return getRecordById('project', id);
  }
  function getProjects() {
    return (adminData.projects || []).slice();
  }
  function getRecordById(type, id) {
    const recordId = Number(id);
    const tableByType = {
      project: 'projects',
      blog: 'blog_posts',
      cert: 'certifications',
      experience: 'experience',
      education: 'education',
      achievement: 'achievements',
      message: 'messages'
    };
    const table = tableByType[type] || type;
    const rows = adminData[table] || [];
    if (!Number.isFinite(recordId)) return null;
    return rows.find(function(row){ return Number(row.id) === recordId; }) || null;
  }
  function readLocalRecords(key) {
    try { return JSON.parse(localStorage.getItem(key) || '[]'); }
    catch(e) { return []; }
  }

  function dataUrlToBlob(dataUrl) {
    const parts = dataUrl.split(',');
    const meta = parts[0].match(/data:(.*?);base64/);
    const mime = meta ? meta[1] : 'image/png';
    const bytes = atob(parts[1] || '');
    const array = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) array[i] = bytes.charCodeAt(i);
    return new Blob([array], { type: mime });
  }

  function extensionFor(mime) {
    return ({ 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'image/svg+xml': 'svg', 'image/avif': 'avif' })[mime] || 'bin';
  }

  function safeFileName(name) {
    return String(name || 'file')
      .toLowerCase()
      .replace(/[^a-z0-9._-]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'file';
  }

  // Uploads a data: URL image and returns its public URL.
  async function uploadDataUrl(pathWithoutExtension, dataUrl) {
    const cfg = getConfig();
    const blob = dataUrlToBlob(dataUrl);
    const path = pathWithoutExtension + '.' + extensionFor(blob.type);
    const { error } = await client.storage.from(cfg.bucket).upload(path, blob, {
      contentType: blob.type || 'image/png',
      upsert: true
    });
    if (error) throw error;
    return client.storage.from(cfg.bucket).getPublicUrl(path).data.publicUrl;
  }

  async function uploadFile(file, folder) {
    if (!init()) return { connected: false };
    if (!file) throw new Error('Choose a file first');
    const cfg = getConfig();
    const cleanFolder = String(folder || 'files').replace(/^\/+|\/+$/g, '') || 'files';
    const path = cleanFolder + '/' + Date.now() + '-' + safeFileName(file.name);
    const { error } = await client.storage.from(cfg.bucket).upload(path, file, {
      contentType: file.type || 'application/octet-stream',
      upsert: true
    });
    if (error) throw error;
    return {
      connected: true,
      path: path,
      url: client.storage.from(cfg.bucket).getPublicUrl(path).data.publicUrl
    };
  }

  async function uploadProjectImages(projectId, images) {
    const urls = {};
    for (let index = 1; index <= 4; index++) {
      const src = images[index];
      if (!src || !src.startsWith('data:')) continue;
      urls['image_' + index + '_url'] = await uploadDataUrl('projects/' + projectId + '/image-' + index + '-' + Date.now(), src);
    }
    return urls;
  }

  // Upsert one row and return it. Saves no longer reload the whole dashboard themselves —
  // the caller refreshes once after closing the form, so the Save button responds quickly.
  async function upsertRow(table, payload) {
    const { data, error } = await client.from(table).upsert(payload).select().single();
    if (error) throw error;
    return data;
  }

  async function saveProject(projectData, images) {
    if (!init()) return { connected: false };
    const imageUrls = await uploadProjectImages(projectData.id || 'new', images || {});
    const payload = {
      id: projectData.id || undefined,
      title: projectData.title,
      type: projectData.type,
      status: String(projectData.status || 'Published').toLowerCase(),
      description: projectData.desc,
      overview: projectData.overview,
      challenge: projectData.challenge,
      solution: projectData.solution,
      features: projectData.features || [],
      tags: projectData.tags || [],
      metrics: projectData.metrics || [],
      live_url: projectData.url,
      github_url: projectData.github_url,
      demo_url: projectData.demo_url,
      docs_url: projectData.docs_url,
      paper_url: projectData.paper_url,
      date_period: projectData.date,
      organisation: projectData.org,
      ...imageUrls
    };
    return { connected: true, data: await upsertRow('projects', payload) };
  }

  async function saveBlogPost(data, imageSrc) {
    if (!init()) return { connected: false };
    let image_url = '';
    if (imageSrc && imageSrc.startsWith('data:')) {
      image_url = await uploadDataUrl('blog/' + Date.now(), imageSrc);
    } else if (imageSrc) {
      image_url = imageSrc;
    }
    const payload = {
      id: data.id || undefined,
      title: data.title,
      type: 'blog',
      category: data.category,
      tags: data.tags || [],
      excerpt: data.excerpt,
      content: data.content,
      status: String(data.status || 'Draft').toLowerCase(),
      read_time: data.read_time
    };
    if (image_url || data.image_url) payload.image_url = image_url || data.image_url;
    return { connected: true, data: await upsertRow('blog_posts', payload) };
  }

  async function saveCertification(data) {
    if (!init()) return { connected: false };
    try {
      return { connected: true, data: await upsertRow('certifications', data) };
    } catch (error) {
      if (!/month_earned|embed_code|certificate_image_url|provided_by|schema cache/i.test(error.message || '')) throw error;
      const compatibleData = Object.assign({}, data);
      delete compatibleData.month_earned;
      delete compatibleData.embed_code;
      delete compatibleData.certificate_image_url;
      delete compatibleData.provided_by;
      const saved = await upsertRow('certifications', compatibleData);
      return { connected: true, data: saved, warning: 'Certification saved. Run the schema update to store month/embed code.' };
    }
  }

  async function saveExperience(data) {
    if (!init()) return { connected: false };
    try {
      return { connected: true, data: await upsertRow('experience', data) };
    } catch (error) {
      // Database not migrated yet: save without the category column instead of failing.
      if (!/category/i.test(error.message || '')) throw error;
      const compatibleData = Object.assign({}, data);
      delete compatibleData.category;
      const saved = await upsertRow('experience', compatibleData);
      return { connected: true, data: saved, warning: 'Saved, but the Fellowship/Work category needs the database update in supabase/migrations to be stored.' };
    }
  }

  async function saveEducation(data) {
    if (!init()) return { connected: false };
    return { connected: true, data: await upsertRow('education', data) };
  }

  async function saveAchievement(data) {
    if (!init()) return { connected: false };
    return { connected: true, data: await upsertRow('achievements', data) };
  }

  async function saveSiteMedia(id, imageSrc, altText) {
    if (!init()) return { connected: false };
    let image_url = imageSrc || '';
    if (imageSrc && imageSrc.startsWith('data:')) {
      image_url = await uploadDataUrl('site-media/' + id + '-' + Date.now(), imageSrc);
    }
    const { error } = await client.from('site_media').upsert({ id: id, image_url: image_url, alt_text: altText || '', updated_at: new Date().toISOString() });
    if (error) throw error;
    return { connected: true, image_url: image_url };
  }

  const pendingDeletes = new Set();
  async function deleteRecord(table, id, label, btn) {
    if (!init()) {
      show('Supabase is not configured', 'error');
      return;
    }
    const key = table + ':' + id;
    if (pendingDeletes.has(key)) return;
    const name = label ? '“' + label + '”' : 'this item';
    if (!confirm('Delete ' + name + '? This cannot be undone.')) return;
    pendingDeletes.add(key);
    const restore = busy(btn);
    try {
      const { error } = await client.from(table).delete().eq('id', id);
      if (error) throw error;
      show('✓ Deleted ' + (label || 'item'), 'success');
      await loadDashboard();
    } catch (error) {
      show('✕ Not deleted — ' + (error.message || 'check your connection'), 'error');
    } finally {
      pendingDeletes.delete(key);
      restore();
    }
  }

  function deleteProject(id) {
    const project = getRecordById('project', id);
    return deleteRecord('projects', id, project && project.title);
  }

  async function markMessageRead(id) {
    if (!init() || !id) return;
    const message = getRecordById('message', id);
    if (!message || (message.status || 'unread') !== 'unread') return;
    const { error } = await client.from('messages').update({ status: 'read' }).eq('id', id);
    if (error) { console.warn('Could not mark message as read', error); return; }
    message.status = 'read';
    renderMessages(adminData.messages);
    renderDashboardInbox(adminData.messages);
    renderNotifications(adminData.messages);
    const unread = adminData.messages.filter(function(m){ return (m.status || 'unread') === 'unread'; }).length;
    const vals = document.querySelectorAll('#view-dashboard .sc-val');
    if (vals[2]) vals[2].textContent = unread;
  }

  async function markAllMessagesRead(btn) {
    if (!init()) { show('Supabase is not configured', 'error'); return; }
    const unread = adminData.messages.filter(function(m){ return (m.status || 'unread') === 'unread'; }).length;
    if (!unread) { show('No unread messages', 'info'); return; }
    const restore = busy(btn, 'Updating…');
    try {
      const { error } = await client.from('messages').update({ status: 'read' }).eq('status', 'unread');
      if (error) throw error;
      show('✓ ' + unread + ' message' + (unread === 1 ? '' : 's') + ' marked as read', 'success');
      await loadDashboard();
    } catch (error) {
      show('✕ Messages not updated — ' + (error.message || 'check your connection'), 'error');
    } finally {
      restore();
    }
  }

  async function clearAllMessages(btn) {
    if (!init()) { show('Supabase is not configured', 'error'); return; }
    const total = adminData.messages.length;
    if (!total) { show('There are no messages to delete', 'success'); return; }
    const answer = prompt('This permanently deletes all ' + total + ' contact message' + (total === 1 ? '' : 's') + '. Type DELETE to confirm.');
    if (answer !== 'DELETE') { if (answer !== null) show('Nothing deleted — you must type DELETE', 'error'); return; }
    const restore = busy(btn, 'Deleting…');
    try {
      const { error } = await client.from('messages').delete().gt('id', 0);
      if (error) throw error;
      show('✓ All messages deleted', 'success');
      await loadDashboard();
    } catch (error) {
      show('✕ Messages not deleted — ' + (error.message || 'check your connection'), 'error');
    } finally {
      restore();
    }
  }

  async function signInWithPassword(email, password) {
    if (!init()) return { connected: false };
    const { error } = await client.auth.signInWithPassword({ email: email, password: password });
    if (error) throw error;
    await loadDashboard();
    return { connected: true };
  }

  async function resetPassword(email) {
    if (!init()) return { connected: false };
    const redirectTo = window.location.origin + window.location.pathname;
    const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo: redirectTo });
    if (error) throw error;
    return { connected: true };
  }

  async function signInWithGoogle() {
    if (!init()) return { connected: false };
    const { error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.href,
        queryParams: { prompt: 'select_account' }
      }
    });
    if (error) throw error;
    return { connected: true };
  }

  async function signOut() {
    if (init()) await client.auth.signOut();
    adminAuthStorage.removeItem('sb-' + new URL(getConfig().url).hostname.split('.')[0] + '-auth-token');
  }

  async function getCurrentUser() {
    if (!init()) return null;
    const { data, error } = await client.auth.getUser();
    if (error) return null;
    return data.user || null;
  }

  async function updateDisplayName(name) {
    if (!init()) throw new Error('Supabase is not configured');
    const { data, error } = await client.auth.updateUser({ data: { full_name: name } });
    if (error) throw error;
    return data.user;
  }

  async function replyToMessage(messageId, replyText, recipient) {
    if (!init() || !messageId) return { connected: false };
    const { data, error } = await client.functions.invoke('send-reply-email', {
      body: {
        messageId: messageId,
        to: recipient?.email || '',
        name: recipient?.name || 'there',
        subject: recipient?.subject || 'Portfolio message',
        replyText: replyText,
        originalMessage: recipient?.originalMessage || ''
      }
    });
    if (error) {
      if (error.context && typeof error.context.json === 'function') {
        try {
          const body = await error.context.json();
          const detail = body?.details?.message || body?.details?.error || body?.details?.name || body?.error;
          if (detail) throw new Error(detail);
        } catch (parseError) {
          if (parseError instanceof Error && parseError.message !== 'Body is unusable') throw parseError;
        }
      }
      throw error;
    }
    if (data && data.error) throw new Error(data.error);
    await loadDashboard();
    return { connected: true, data: data };
  }

  async function replyToBlogComment(parentId, postId, btn) {
    if (!init()) { show('Supabase is not configured', 'error'); return { connected: false }; }
    const reply = prompt('Reply publicly as Steven Daniel:');
    if (!reply || !reply.trim()) return { connected: false };
    const restore = busy(btn);
    try {
      const { error } = await client.from('blog_comments').insert({
        post_id: postId,
        parent_id: parentId,
        name: 'Steven Daniel',
        comment: reply.trim(),
        is_admin: true,
        status: 'published'
      });
      if (error) throw error;
      show('✓ Reply posted', 'success');
      await loadDashboard();
    } catch (error) {
      show('✕ Reply not posted — ' + (error.message || 'check your connection'), 'error');
    } finally {
      restore();
    }
    return { connected: true };
  }

  async function testConnection(btn) {
    if (!init()) {
      show('Add Supabase URL and anon key first', 'error');
      return false;
    }
    const restore = busy(btn, 'Testing…');
    try {
      const { error } = await client.from('projects').select('id').limit(1);
      if (error) throw error;
      show('✓ Supabase connection OK', 'success');
      return true;
    } catch (error) {
      show('✕ Supabase connection failed — ' + (error.message || 'check the URL and key'), 'error');
      return false;
    } finally {
      restore();
    }
  }

  function saveConfigFromSettings() {
    const url = document.getElementById('supabase-url')?.value.trim() || '';
    const anonKey = document.getElementById('supabase-anon-key')?.value.trim() || '';
    const bucket = document.getElementById('supabase-bucket')?.value.trim() || 'portfolio-media';
    localStorage.setItem(CONFIG_KEYS.url, url);
    localStorage.setItem(CONFIG_KEYS.anonKey, anonKey);
    localStorage.setItem(CONFIG_KEYS.bucket, bucket);
    init();
    show('✓ Supabase settings saved', 'success');
  }

  function hydrateSettings() {
    const cfg = getConfig();
    const url = document.getElementById('supabase-url');
    const anonKey = document.getElementById('supabase-anon-key');
    const bucket = document.getElementById('supabase-bucket');
    if (url) url.value = cfg.url;
    if (anonKey) anonKey.value = cfg.anonKey;
    if (bucket) bucket.value = cfg.bucket;
  }

  window.PortfolioAdminDB = {
    init,
    busy,
    keepSignedIn,
    setKeepSignedIn,
    isConfigured,
    loadDashboard,
    getProjectById,
    getProjects,
    getRecordById,
    getRows,
    importPlaceholders,
    saveProject,
    uploadFile,
    saveBlogPost,
    saveCertification,
    saveExperience,
    saveEducation,
    saveAchievement,
    saveSiteMedia,
    deleteProject,
    deleteRecord,
    markMessageRead,
    markAllMessagesRead,
    clearAllMessages,
    signInWithPassword,
    resetPassword,
    signInWithGoogle,
    signOut,
    getCurrentUser,
    updateDisplayName,
    replyToMessage,
    replyToBlogComment,
    testConnection,
    saveConfigFromSettings,
    hydrateSettings
  };

  document.addEventListener('DOMContentLoaded', function(){
    hydrateSettings();
  });
})();
