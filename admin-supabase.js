(function(){
  const CONFIG_KEYS = {
    url: 'pf-supabase-url',
    anonKey: 'pf-supabase-anon-key',
    bucket: 'pf-supabase-bucket'
  };

  const fallbackProjects = [
    { id: 1, title: 'Flood Prediction for Resilient Communities', type: 'Machine Learning', status: 'published', tags: ['Python','LSTM','GIS'], created_at: '2025-06-05' },
    { id: 2, title: 'Enterprise RAG Chatbot', type: 'AI / LLM', status: 'published', tags: ['LangChain','ChromaDB'], created_at: '2025-06-03' },
    { id: 3, title: 'Food-101 Image Classifier', type: 'Computer Vision', status: 'published', tags: ['PyTorch','ResNet50'], created_at: '2025-05-28' },
    { id: 4, title: 'Titanic Survival Prediction API', type: 'Machine Learning', status: 'published', tags: ['Scikit-learn','FastAPI'], created_at: '2025-05-12' },
    { id: 5, title: 'Personal Finance Management System', type: 'Data Science', status: 'draft', tags: ['React','FastAPI','Supabase'], created_at: '2025-04-30' }
  ];

  const fallbackMessages = [
    { id: 1, name: 'Dr. James Osei', subject: 'Research collaboration on climate AI', message: 'Hi, I came across your flood prediction project and would love to discuss a potential collaboration on climate resilience...', status: 'unread', created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString() },
    { id: 2, name: 'Fatima Al-Hassan', subject: 'ML Engineer opportunity at our AI startup', message: "We're building an AI-powered fintech platform and your background in both ML and financial engineering is exactly what...", status: 'unread', created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() },
    { id: 3, name: 'Ahmed Koroma', subject: 'Speaking invitation - AI Summit Sierra Leone', message: "We're organising the inaugural AI Summit in Freetown and would be honoured to have you as a keynote speaker...", status: 'unread', created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString() },
    { id: 4, name: 'Marcus Webb', subject: 'Your ICML workshop talk proposal accepted', message: 'Congratulations! Your proposal for the LLMs for Social Good workshop has been accepted...', status: 'unread', created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
    { id: 5, name: 'Priya Sharma', subject: 'Python mentorship enquiry', message: "I'm interested in your Python and data science mentorship programme. Could you share more details...", status: 'read', created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 6, name: 'Liu Tao', subject: 'Collaboration on LLM evaluation framework', message: "I'm a researcher at NTU working on LLM evaluation. Your RAG chatbot project caught my attention...", status: 'read', created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() }
  ];
  const fallbackPosts = [
    { id: 1, title: 'Building RAG Systems from Scratch: A Production Guide', category: 'AI', read_time: '8 min', status: 'published', created_at: '2025-06-01' },
    { id: 2, title: 'Time Series Forecasting with LSTMs for Financial Data', category: 'Finance', read_time: '6 min', status: 'published', created_at: '2025-05-01' },
    { id: 3, title: 'Computer Vision for Social Good: Detecting Floods', category: 'Data Science', read_time: '7 min', status: 'published', created_at: '2025-04-01' }
  ];
  const fallbackCerts = [
    { id: 1, name: 'AI Engineering Professional Certificate', issuer: 'IBM / Coursera', category: 'AI', verified: true, year_earned: 2024 },
    { id: 2, name: 'Deep Learning Specialization', issuer: 'DeepLearning.AI', category: 'Deep Learning', verified: true, year_earned: 2024 }
  ];
  const fallbackPublications = [
    { id: 1, title: 'AI-Driven Flood Risk Assessment for Sub-Saharan Communities', pub_type: 'Journal', venue: 'JAAES', status: 'Under Review', year: 2025 },
    { id: 2, title: 'RAG Architectures for Domain-Specific Knowledge Management', pub_type: 'Conference', venue: 'ICML 2025', status: 'Accepted', year: 2025 }
  ];
  const fallbackExperience = [
    { id: 1, role: 'Digital Innovation Volunteer', organisation: 'UNDP-IICPSD', date_period: '2023 — Present', tags: ['AI for Good','SDGs'], display_order: 1 },
    { id: 2, role: 'Python Instructor', organisation: 'Online / Code Academy', date_period: '2022 — Present', tags: ['Python','Data Science'], display_order: 2 }
  ];
  const fallbackEducation = [
    { id: 1, degree: 'MSc Financial Engineering', institution: 'WorldQuant University', date_period: '2025 — Present', tags: ['Quantitative Finance'], display_order: 1 },
    { id: 2, degree: 'MSc Information Systems', institution: 'Gazi University', date_period: '2023 — Present', tags: ['Enterprise AI'], display_order: 2 }
  ];
  const fallbackAchievements = [
    { id: 1, title: 'Best Graduating Student', organisation: 'University of Sierra Leone', year: '2022', description: 'Highest academic excellence.', display_order: 1 }
  ];

  let client = null;

  function getConfig() {
    return {
      url: localStorage.getItem(CONFIG_KEYS.url) || '',
      anonKey: localStorage.getItem(CONFIG_KEYS.anonKey) || '',
      bucket: localStorage.getItem(CONFIG_KEYS.bucket) || 'portfolio-media'
    };
  }

  function init() {
    const cfg = getConfig();
    if (!cfg.url || !cfg.anonKey || !window.supabase) {
      client = null;
      return null;
    }
    client = window.supabase.createClient(cfg.url, cfg.anonKey);
    return client;
  }

  function isConfigured() {
    const cfg = getConfig();
    return Boolean(cfg.url && cfg.anonKey && window.supabase);
  }

  function show(msg) {
    if (window.showToast) window.showToast(msg);
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function(char){
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

  function renderProjects(projects) {
    const tbody = document.querySelector('#view-projects tbody');
    if (!tbody) return;
    if (!projects.length) {
      tbody.innerHTML = '<tr><td colspan="6"><div class="empty-state">No projects yet. Add your first project.</div></td></tr>';
      return;
    }
    tbody.innerHTML = projects.map(function(project, index){
      const tags = project.tags || [];
      const status = project.status || 'published';
      return '<tr>'
        + '<td class="td-mono">' + String(project.id || index + 1).padStart(2, '0') + '</td>'
        + '<td class="td-title">' + escapeHtml(project.title) + '</td>'
        + '<td class="td-mono">' + escapeHtml(tags.slice(0, 3).join(', ')) + '</td>'
        + '<td><span class="badge ' + statusClass(status) + '">' + escapeHtml(status) + '</span></td>'
        + '<td class="td-mono">' + formatDate(project.created_at || project.date_period) + '</td>'
        + '<td><div class="td-actions">'
        + '<button class="ia" title="Edit" onclick="openModal(\'project\',' + Number(project.id) + ')"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>'
        + '<button class="ia del" title="Delete" onclick="PortfolioAdminDB.deleteProject(' + Number(project.id) + ')"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg></button>'
        + '</div></td></tr>';
    }).join('');
  }

  function renderMessages(messages) {
    const list = document.querySelector('#view-messages .msg-list');
    if (!list) return;
    if (!messages.length) {
      list.innerHTML = '<div class="empty-state">No messages yet. Contact form submissions will appear here.</div>';
      return;
    }
    list.innerHTML = messages.map(function(message){
      const unread = (message.status || 'unread') === 'unread';
      const initials = String(message.name || 'Visitor').split(/\s+/).filter(Boolean).slice(0,2).map(function(part){ return part[0]; }).join('').toUpperCase() || 'V';
      const preview = message.message || '';
      return '<div class="msg-item' + (unread ? ' unread' : '') + '">'
        + '<div class="msg-avatar">' + escapeHtml(initials) + '</div>'
        + '<div class="msg-content">'
        + '<p class="msg-from">' + escapeHtml(message.name || 'Visitor') + '</p>'
        + '<p class="msg-subject">' + escapeHtml(message.subject || 'No subject') + '</p>'
        + '<p class="msg-preview">' + escapeHtml(preview) + '</p>'
        + '</div>'
        + '<div class="msg-meta"><span class="msg-time">' + escapeHtml(relativeTime(message.created_at)) + '</span>'
        + '<span class="badge ' + (unread ? 'unread' : 'read') + '">' + (unread ? 'New' : 'Read') + '</span>'
        + '<button class="msg-reply-btn" onclick="event.stopPropagation();openReply(' + Number(message.id) + ',\'' + escapeForCall(message.name || 'Visitor') + '\',\'' + escapeForCall(message.subject || 'No subject') + '\',\'' + escapeForCall(preview) + '\')" title="Reply"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg></button></div>'
        + '</div>';
    }).join('');
  }

  function renderBlogComments(comments) {
    const list = document.querySelector('#view-comments .msg-list');
    if (!list) return;
    if (!comments.length) {
      list.innerHTML = '<div class="empty-state">No blog comments yet.</div>';
      return;
    }
    list.innerHTML = comments.map(function(comment){
      const preview = comment.comment || '';
      return '<div class="msg-item">'
        + '<div class="msg-avatar">' + escapeHtml(String(comment.name || 'U').slice(0,2).toUpperCase()) + '</div>'
        + '<div class="msg-content">'
        + '<p class="msg-from">' + escapeHtml(comment.name || 'Visitor') + (comment.is_admin ? ' · Admin' : '') + '</p>'
        + '<p class="msg-subject">Post #' + escapeHtml(comment.post_id) + (comment.parent_id ? ' · Reply to #' + escapeHtml(comment.parent_id) : '') + '</p>'
        + '<p class="msg-preview">' + escapeHtml(preview) + '</p>'
        + '</div>'
        + '<div class="msg-meta"><span class="msg-time">' + escapeHtml(relativeTime(comment.created_at)) + '</span>'
        + '<button class="msg-reply-btn" onclick="event.stopPropagation();PortfolioAdminDB.replyToBlogComment(' + Number(comment.id) + ',' + Number(comment.post_id) + ')" title="Reply"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg></button></div>'
        + '</div>';
    }).join('');
  }

  function renderBlogPosts(posts) {
    const tbody = document.querySelector('#view-blog tbody');
    if (!tbody) return;
    if (!posts.length) {
      tbody.innerHTML = '<tr><td colspan="6"><div class="empty-state">No blog posts yet. Create your first post.</div></td></tr>';
      return;
    }
    tbody.innerHTML = posts.map(function(post){
      const status = post.status || 'draft';
      return '<tr>'
        + '<td class="td-title">' + escapeHtml(post.title) + '</td>'
        + '<td class="td-mono">' + escapeHtml(post.category || '-') + '</td>'
        + '<td class="td-mono">' + escapeHtml(post.read_time || '-') + '</td>'
        + '<td><span class="badge ' + statusClass(status) + '">' + escapeHtml(status) + '</span></td>'
        + '<td class="td-mono">' + formatDate(post.created_at) + '</td>'
        + '<td><div class="td-actions">'
        + '<button class="ia" onclick="openModal(\'blog\')"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>'
        + '<button class="ia del" onclick="PortfolioAdminDB.deleteRecord(\'blog_posts\',' + Number(post.id) + ')"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg></button>'
        + '</div></td></tr>';
    }).join('');
  }

  function renderCertifications(certs) {
    const tbody = document.querySelector('#view-certs tbody');
    if (!tbody) return;
    if (!certs.length) {
      tbody.innerHTML = '<tr><td colspan="6"><div class="empty-state">No certifications yet.</div></td></tr>';
      return;
    }
    tbody.innerHTML = certs.map(function(cert){
      return '<tr>'
        + '<td class="td-title">' + escapeHtml(cert.name) + '</td>'
        + '<td class="td-mono">' + escapeHtml(cert.issuer || '-') + '</td>'
        + '<td class="td-mono">' + escapeHtml(cert.category || '-') + '</td>'
        + '<td><span class="badge published">' + (cert.verified === false ? 'Unverified' : 'Verified') + '</span></td>'
        + '<td class="td-mono">' + escapeHtml(cert.year_earned || '-') + '</td>'
        + '<td><div class="td-actions"><button class="ia del" onclick="PortfolioAdminDB.deleteRecord(\'certifications\',' + Number(cert.id) + ')"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg></button></div></td>'
        + '</tr>';
    }).join('');
  }

  function renderPublications(publications) {
    const tbody = document.querySelector('#view-publications tbody');
    if (!tbody) return;
    if (!publications.length) {
      tbody.innerHTML = '<tr><td colspan="6"><div class="empty-state">No publications yet.</div></td></tr>';
      return;
    }
    tbody.innerHTML = publications.map(function(pub){
      const status = pub.status || 'Under Review';
      return '<tr>'
        + '<td class="td-title">' + escapeHtml(pub.title) + '</td>'
        + '<td class="td-mono">' + escapeHtml(pub.pub_type || '-') + '</td>'
        + '<td class="td-mono">' + escapeHtml(pub.venue || '-') + '</td>'
        + '<td><span class="badge ' + statusClass(status) + '">' + escapeHtml(status) + '</span></td>'
        + '<td class="td-mono">' + escapeHtml(pub.year || '-') + '</td>'
        + '<td><div class="td-actions">'
        + '<button class="ia" onclick="openModal(\'pub\')"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>'
        + '<button class="ia del" onclick="PortfolioAdminDB.deleteRecord(\'publications\',' + Number(pub.id) + ')"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg></button>'
        + '</div></td></tr>';
    }).join('');
  }

  function renderExperience(experience) {
    const tbody = document.querySelector('#view-experience tbody');
    if (!tbody) return;
    if (!experience.length) {
      tbody.innerHTML = '<tr><td colspan="5"><div class="empty-state">No experience entries yet.</div></td></tr>';
      return;
    }
    tbody.innerHTML = experience.map(function(item){
      return '<tr>'
        + '<td class="td-title">' + escapeHtml(item.role) + '</td>'
        + '<td class="td-mono">' + escapeHtml(item.organisation || '-') + '</td>'
        + '<td class="td-mono">' + escapeHtml(item.date_period || '-') + '</td>'
        + '<td class="td-mono">' + escapeHtml((item.tags || []).slice(0, 3).join(', ')) + '</td>'
        + '<td><div class="td-actions"><button class="ia del" onclick="PortfolioAdminDB.deleteRecord(\'experience\',' + Number(item.id) + ')"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg></button></div></td>'
        + '</tr>';
    }).join('');
  }

  function renderEducation(education) {
    const tbody = document.querySelector('#view-education tbody');
    if (!tbody) return;
    if (!education.length) {
      tbody.innerHTML = '<tr><td colspan="5"><div class="empty-state">No education entries yet.</div></td></tr>';
      return;
    }
    tbody.innerHTML = education.map(function(item){
      return '<tr>'
        + '<td class="td-title">' + escapeHtml(item.degree) + '</td>'
        + '<td class="td-mono">' + escapeHtml(item.institution || '-') + '</td>'
        + '<td class="td-mono">' + escapeHtml(item.date_period || '-') + '</td>'
        + '<td class="td-mono">' + escapeHtml((item.tags || []).slice(0, 3).join(', ')) + '</td>'
        + '<td><div class="td-actions"><button class="ia del" onclick="PortfolioAdminDB.deleteRecord(\'education\',' + Number(item.id) + ')"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg></button></div></td>'
        + '</tr>';
    }).join('');
  }

  function renderAchievements(achievements) {
    const tbody = document.querySelector('#view-achievements tbody');
    if (!tbody) return;
    if (!achievements.length) {
      tbody.innerHTML = '<tr><td colspan="5"><div class="empty-state">No achievements yet.</div></td></tr>';
      return;
    }
    tbody.innerHTML = achievements.map(function(item){
      return '<tr>'
        + '<td class="td-title">' + escapeHtml(item.title) + '</td>'
        + '<td class="td-mono">' + escapeHtml(item.organisation || '-') + '</td>'
        + '<td class="td-mono">' + escapeHtml(item.year || '-') + '</td>'
        + '<td class="td-mono">' + escapeHtml((item.description || '').slice(0, 80)) + '</td>'
        + '<td><div class="td-actions"><button class="ia del" onclick="PortfolioAdminDB.deleteRecord(\'achievements\',' + Number(item.id) + ')"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg></button></div></td>'
        + '</tr>';
    }).join('');
  }

  function escapeForCall(value) {
    return String(value || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, ' ');
  }

  function renderStats(projects, posts, messages, certs) {
    const vals = document.querySelectorAll('#view-dashboard .sc-val');
    if (vals[0]) vals[0].textContent = projects.length;
    if (vals[1]) vals[1].textContent = posts.length;
    if (vals[2]) vals[2].textContent = messages.filter(function(m){ return (m.status || 'unread') === 'unread'; }).length;
    const certLegend = document.querySelector('.donut-legend .dl-item:nth-child(3) span');
    if (certLegend) certLegend.textContent = certs.length || '40';
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
      return '<div class="ac-item" style="cursor:pointer" onclick="switchView(\'messages\',document.querySelector(\'[onclick*=messages]\'))">'
        + '<div class="ac-dot' + (unread ? '' : ' green') + '"></div>'
        + '<div class="ac-text"><strong>' + escapeHtml(message.name || 'Visitor') + '</strong><br><span>' + escapeHtml(message.subject || message.message || 'No subject') + '</span></div>'
        + '<span class="ac-time">' + escapeHtml(relativeTime(message.created_at)) + '</span>'
        + '</div>';
    }).join('');
  }

  async function loadDashboard() {
    if (!init()) {
      const localProjects = fallbackProjects.concat(readLocalCustomProjects());
      renderProjects(localProjects);
      renderMessages(fallbackMessages);
      renderBlogPosts(fallbackPosts);
      renderCertifications(fallbackCerts);
      renderPublications(fallbackPublications);
      renderExperience(fallbackExperience.concat(readLocalRecords('pf_experience_custom')));
      renderEducation(fallbackEducation.concat(readLocalRecords('pf_education_custom')));
      renderAchievements(fallbackAchievements.concat(readLocalRecords('pf_achievements_custom')));
      renderStats(localProjects, fallbackPosts, fallbackMessages, fallbackCerts);
      renderDashboardInbox(fallbackMessages);
      return { connected: false };
    }
    const results = await Promise.all([
      readTable('projects', client.from('projects').select('*').order('created_at', { ascending: false })),
      readTable('blog_posts', client.from('blog_posts').select('*').order('created_at', { ascending: false })),
      readTable('messages', client.from('messages').select('*').order('created_at', { ascending: false })),
      readTable('certifications', client.from('certifications').select('*').order('created_at', { ascending: false })),
      readTable('publications', client.from('publications').select('*').order('created_at', { ascending: false })),
      readTable('experience', client.from('experience').select('*').order('display_order', { ascending: true }).order('created_at', { ascending: false })),
      readTable('education', client.from('education').select('*').order('display_order', { ascending: true }).order('created_at', { ascending: false })),
      readTable('achievements', client.from('achievements').select('*').order('display_order', { ascending: true }).order('created_at', { ascending: false })),
      readTable('blog_comments', client.from('blog_comments').select('*').order('created_at', { ascending: false }))
    ]);
    const byName = results.reduce(function(acc, result){ acc[result.name] = result; return acc; }, {});
    const failed = results.filter(function(result){ return result.error; });
    if (failed.length) {
      const first = failed[0];
      show('Supabase read failed: ' + first.name + ' — ' + (first.error.message || first.error.code || 'check schema/RLS'));
      console.warn('Supabase dashboard read failures', failed);
    }
    const projects = byName.projects.data || [];
    const posts = byName.blog_posts.data || [];
    const messages = byName.messages.data || [];
    const certs = byName.certifications.data || [];
    renderProjects(projects);
    renderMessages(messages);
    renderBlogPosts(posts);
    renderCertifications(certs);
    renderPublications(byName.publications.data || []);
    renderExperience(byName.experience.data || []);
    renderEducation(byName.education.data || []);
    renderAchievements(byName.achievements.data || []);
    renderBlogComments(byName.blog_comments.data || []);
    renderStats(projects, posts, messages, certs);
    renderDashboardInbox(messages);
    return { connected: failed.length === 0, failures: failed };
  }

  async function readTable(name, query) {
    const result = await query;
    return { name: name, data: result.data || null, error: result.error || null };
  }

  function readLocalCustomProjects() {
    try { return JSON.parse(localStorage.getItem('pf_projects_custom') || '[]'); }
    catch(e) { return []; }
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

  function safeFileName(name) {
    return String(name || 'file')
      .toLowerCase()
      .replace(/[^a-z0-9._-]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'file';
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
    if (!client) return {};
    const cfg = getConfig();
    const urls = {};
    for (let index = 1; index <= 4; index++) {
      const src = images[index];
      if (!src || !src.startsWith('data:')) continue;
      const path = 'projects/' + projectId + '/image-' + index + '-' + Date.now() + '.png';
      const { error } = await client.storage.from(cfg.bucket).upload(path, dataUrlToBlob(src), {
        contentType: 'image/png',
        upsert: true
      });
      if (error) throw error;
      const { data } = client.storage.from(cfg.bucket).getPublicUrl(path);
      urls['image_' + index + '_url'] = data.publicUrl;
    }
    return urls;
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
    const { data, error } = await client.from('projects').upsert(payload).select().single();
    if (error) throw error;
    await loadDashboard();
    return { connected: true, data: data };
  }

  async function saveBlogPost(data, imageSrc) {
    if (!init()) return { connected: false };
    let image_url = '';
    if (imageSrc && imageSrc.startsWith('data:')) {
      const cfg = getConfig();
      const path = 'blog/' + Date.now() + '.png';
      const { error } = await client.storage.from(cfg.bucket).upload(path, dataUrlToBlob(imageSrc), {
        contentType: 'image/png',
        upsert: true
      });
      if (error) throw error;
      image_url = client.storage.from(cfg.bucket).getPublicUrl(path).data.publicUrl;
    }
    const payload = {
      title: data.title,
      type: 'blog',
      category: data.category,
      tags: data.tags || [],
      excerpt: data.excerpt,
      content: data.content,
      status: String(data.status || 'Draft').toLowerCase(),
      read_time: data.read_time,
      image_url: image_url || null
    };
    const { error } = await client.from('blog_posts').insert(payload);
    if (error) throw error;
    await loadDashboard();
    return { connected: true };
  }

  async function saveCertification(data) {
    if (!init()) return { connected: false };
    const { error } = await client.from('certifications').insert(data);
    if (error) throw error;
    await loadDashboard();
    return { connected: true };
  }

  async function savePublication(data) {
    if (!init()) return { connected: false };
    const { error } = await client.from('publications').insert(data);
    if (error) throw error;
    await loadDashboard();
    return { connected: true };
  }

  async function saveExperience(data) {
    if (!init()) return { connected: false };
    const { error } = await client.from('experience').insert(data);
    if (error) throw error;
    await loadDashboard();
    return { connected: true };
  }

  async function saveEducation(data) {
    if (!init()) return { connected: false };
    const { error } = await client.from('education').insert(data);
    if (error) throw error;
    await loadDashboard();
    return { connected: true };
  }

  async function saveAchievement(data) {
    if (!init()) return { connected: false };
    const { error } = await client.from('achievements').insert(data);
    if (error) throw error;
    await loadDashboard();
    return { connected: true };
  }

  async function saveSiteMedia(id, imageSrc, altText) {
    if (!init()) return { connected: false };
    let image_url = imageSrc || '';
    if (imageSrc && imageSrc.startsWith('data:')) {
      const cfg = getConfig();
      const path = 'site-media/' + id + '-' + Date.now() + '.png';
      const { error } = await client.storage.from(cfg.bucket).upload(path, dataUrlToBlob(imageSrc), {
        contentType: 'image/png',
        upsert: true
      });
      if (error) throw error;
      image_url = client.storage.from(cfg.bucket).getPublicUrl(path).data.publicUrl;
    }
    const { error } = await client.from('site_media').upsert({ id: id, image_url: image_url, alt_text: altText || '', updated_at: new Date().toISOString() });
    if (error) throw error;
    return { connected: true, image_url: image_url };
  }

  async function deleteProject(id) {
    if (!init()) {
      show('Supabase is not configured');
      return;
    }
    const { error } = await client.from('projects').delete().eq('id', id);
    if (error) {
      show('Project delete failed');
      return;
    }
    show('Project deleted');
    await loadDashboard();
  }

  async function deleteRecord(table, id) {
    if (!init()) {
      show('Supabase is not configured');
      return;
    }
    const { error } = await client.from(table).delete().eq('id', id);
    if (error) {
      show('Delete failed');
      return;
    }
    show('Deleted');
    await loadDashboard();
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

  async function signUpWithPassword(email, password) {
    if (!init()) return { connected: false };
    const { error } = await client.auth.signUp({ email: email, password: password });
    if (error) throw error;
    return { connected: true };
  }

  async function signInWithGoogle() {
    if (!init()) return { connected: false };
    const { error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.href }
    });
    if (error) throw error;
    return { connected: true };
  }

  async function signOut() {
    if (init()) await client.auth.signOut();
  }

  async function getCurrentUser() {
    if (!init()) return null;
    const { data, error } = await client.auth.getUser();
    if (error) return null;
    return data.user || null;
  }

  async function replyToMessage(messageId, replyText) {
    if (!init() || !messageId) return { connected: false };
    const { error } = await client
      .from('messages')
      .update({ status: 'read', reply_text: replyText, replied_at: new Date().toISOString() })
      .eq('id', messageId);
    if (error) throw error;
    await loadDashboard();
    return { connected: true };
  }

  async function replyToBlogComment(parentId, postId) {
    if (!init()) return { connected: false };
    const reply = prompt('Admin reply');
    if (!reply) return { connected: false };
    const { error } = await client.from('blog_comments').insert({
      post_id: postId,
      parent_id: parentId,
      name: 'Steven Daniel',
      comment: reply,
      is_admin: true,
      status: 'published'
    });
    if (error) throw error;
    await loadDashboard();
    show('Reply posted');
    return { connected: true };
  }

  async function testConnection() {
    if (!init()) {
      show('Add Supabase URL and anon key first');
      return false;
    }
    const { error } = await client.from('projects').select('id').limit(1);
    if (error) {
      show('Supabase connection failed');
      return false;
    }
    show('Supabase connection OK');
    return true;
  }

  function saveConfigFromSettings() {
    const url = document.getElementById('supabase-url')?.value.trim() || '';
    const anonKey = document.getElementById('supabase-anon-key')?.value.trim() || '';
    const bucket = document.getElementById('supabase-bucket')?.value.trim() || 'portfolio-media';
    localStorage.setItem(CONFIG_KEYS.url, url);
    localStorage.setItem(CONFIG_KEYS.anonKey, anonKey);
    localStorage.setItem(CONFIG_KEYS.bucket, bucket);
    init();
    show('Supabase settings saved');
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
    isConfigured,
    loadDashboard,
    saveProject,
    uploadFile,
    saveBlogPost,
    saveCertification,
    savePublication,
    saveExperience,
    saveEducation,
    saveAchievement,
    saveSiteMedia,
    deleteProject,
    deleteRecord,
    signInWithPassword,
    resetPassword,
    signUpWithPassword,
    signInWithGoogle,
    signOut,
    getCurrentUser,
    replyToMessage,
    replyToBlogComment,
    testConnection,
    saveConfigFromSettings,
    hydrateSettings
  };

  document.addEventListener('DOMContentLoaded', function(){
    hydrateSettings();
    loadDashboard();
  });
})();
