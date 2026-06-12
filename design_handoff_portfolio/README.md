# Handoff: Steven Daniel — AI Engineer Portfolio Website
**Full System: Portfolio + Admin Dashboard + Detail Pages**

---

## Overview
A complete personal portfolio website for **Steven Daniel**, an AI Engineer / Data Scientist /ML/DL Researcher/Computer Vision Researcher/ Researcher based from Sierra Leone in Turkey. The system comprises:

1. **Portfolio** (`Portfolio v2.html`) — Public-facing single-page site with 13 sections, dark/light theme, command palette, animated hero, and all content sections
2. **Admin Dashboard** (`Admin Dashboard.html`) — Protected management interface for projects, blog posts, certifications, publications, and messages (with reply)
3. **Project Detail Page** (`Project Detail.html`) — Individual project pages with image carousel, accordion sections, and conditional CTA buttons
4. **Blog / Publication Detail Page** (`Blog Detail.html`) — Full article/publication view with comments, likes, and share buttons

---

## About the Design Files
The files in this bundle are **high-fidelity design prototypes built in HTML/CSS/JS**. They are design references showing the exact intended look and behaviour — not production code to copy directly.

The task is to **recreate these designs in a real production codebase** (Next.js 14+ App Router is recommended — see component breakdown below), preserving pixel-accurate fidelity to colours, typography, spacing, animations, and interactions as shown in the prototype files.

**Fidelity: High** — All colours, typography, spacing, animations, and interactions are final. Implement exactly as shown.

---

## Design Tokens

### Colour Palette

#### Dark Theme (default)
```
--bg:    #0B1220   Page background
--bg2:   #0F1A2E   Section / card background  
--card:  rgba(15,26,46,.85)   Card surface (with backdrop-filter: blur(14px))
--b:     rgba(148,163,184,.07)  Border default
--b2:    rgba(148,163,184,.14)  Border strong
--a:     #2563EB   Accent / primary blue
--a2:    #06B6D4   Accent secondary / cyan
--glow:  rgba(37,99,235,.18)   Glow / hover fill background
--t1:    #F8FAFC   Text primary
--t2:    #94A3B8   Text secondary
--t3:    #475569   Text tertiary / muted
```

#### Light Theme Overrides
```
--bg:    #FAFAFA
--bg2:   #F1F5F9
--card:  rgba(255,255,255,.9)
--b:     rgba(15,23,42,.06)
--b2:    rgba(15,23,42,.12)
--glow:  rgba(37,99,235,.06)
--t1:    #0F172A
--t2:    #475569
--t3:    #94A3B8
```

#### Colour Palette Variants (user-switchable via Tweaks)
| Name | --a | --a2 |
|---|---|---|
| blue-cyan (default) | #2563EB | #06B6D4 |
| violet-cyan | #7C3AED | #22D3EE |
| sky-emerald | #0EA5E9 | #10B981 |

### Typography
```
--fh: 'IBM Plex Sans'   Headings, nav logo, section titles (weights: 300/400/500/600/700)
--fb: 'Inter'           Body text, buttons, UI labels (weights: 300/400/500/600)
--fm: 'IBM Plex Mono'   Dates, tags, badges, code, labels (weights: 400/500)
```
All loaded from Google Fonts CDN.

### Spacing & Shape
```
--r:  12px   Standard border-radius
--rl: 20px   Large border-radius (cards, modals)
Section padding:    96px 0
Container max-width: 1200px  padding: 0 28px
Nav height:          ~64px
scroll-margin-top:   72px (all sections)
```

### Responsive Breakpoints
```
1100px  — Two-column grids collapse to single column
768px   — Nav links hidden, hamburger shown; mobile nav overlay activates
480px   — Single-column grids, stacked CTAs
```

---

## File Inventory

| File | Purpose | Lines |
|---|---|---|
| `Portfolio v2.html` | Main portfolio — all 13 sections, full HTML structure | ~600 |
| `portfolio.css` | All styles — tokens, layout, components, responsive, tabs, hamburger | ~420 |
| `portfolio.js` | All interactivity — nav, theme, canvas, typing, reveal, counters, command palette, cert filter, image display, hamburger, tabs, dynamic projects | ~290 |
| `portfolio-tweaks.jsx` | Tweaks panel — name, role, palette, motion controls | ~41 |
| `tweaks-panel.jsx` | Tweaks panel framework (shared component) | — |
| `Admin Dashboard.html` | Admin interface — self-contained, all JS inline | ~950 |
| `Project Detail.html` | Project detail page — self-contained | ~370 |
| `Blog Detail.html` | Blog / publication detail page — self-contained | ~560 |

---

## Screen 1: Portfolio — Navigation Bar

**Position:** Fixed top, full width, `z-index: 100`
**Height:** ~64px
**Scroll behaviour:** Transparent → adds `.scrolled` class at `scrollY > 40`:
- Dark: `background: rgba(11,18,32,.92); backdrop-filter: blur(20px); border-bottom: 1px solid var(--b)`
- Light: `background: rgba(250,250,250,.92)`

**Layout:** `display: flex; align-items: center; max-width: 1200px; margin: 0 auto; padding: 16px 28px; gap: 16px`

**Contents (left → right):**
1. **Logo** — `<code>/SD</code>` in IBM Plex Mono 14px. Angle brackets in `--a` colour
2. **Nav links** (desktop only, hidden ≤768px) — `font-size: 13px; color: var(--t2)` — sections: About, Research, Projects, Experience, Education, Blog, Contact
3. **Action buttons:**
   - Theme toggle — 34×34px, `border-radius: 8px; border: 1px solid var(--b2)` — sun/moon SVG
   - ⌘K command palette — same sizing, shows keyboard shortcut label
   - "Get in Touch" CTA — `border: 1px solid var(--b2); padding: 8px 16px; border-radius: 8px; font-size: 13px`
4. **Hamburger** (mobile only, ≤768px) — 34×34px, three 16px horizontal bars, animates to × on open

**Mobile Navigation Overlay:**
- `position: fixed; inset: 0; background: var(--bg); z-index: 98; display: flex; flex-direction: column; align-items: center; justify-content: center`
- Each nav item: `font-size: 24px; font-weight: 600; padding: 16px 40px; border-bottom: 1px solid var(--b)`
- Close: clicking any link closes overlay and re-enables body scroll

---

## Screen 2: Portfolio — Hero Section

**Height:** `min-height: 100vh`
**Background:** Dark canvas `#0B1220` + animated particle canvas overlay
**Particle system:** 65 particles, max connection distance 120px, speed 0.3, RAF loop, resize-aware

**Grid layout (desktop):** `grid-template-columns: 1fr 380px; gap: 64px; align-items: center`
**Grid (≤1100px):** single column, portrait below text

**Left column (staggered fadeUp entrance animations, 0.2s–1.6s delays):**
1. Pre-label: `// ai_engineer.init()` — IBM Plex Mono 13px, `--a2`, `letter-spacing: .1em`
2. H1: `clamp(30px, 4.2vw, 52px)`, weight 700, gradient text (`--t1 20% → --a 65% → --a2 100%` via `background-clip: text`)
3. Role typewriter: IBM Plex Mono 14px, `--a2` — cycles 6 roles at 60ms type / 30ms delete / 1900ms pause with blinking `_` cursor
4. Body copy: 15px Inter, `--t2`, `line-height: 1.75`, `max-width: 580px`, `text-wrap: pretty`
5. CTA row: Primary blue button + 2 ghost buttons, `gap: 10px`
6. Social icons: 6 links — LinkedIn, GitHub, Email, Instagram, Facebook, Twitter — 36×36px each, `border: 1px solid var(--b2); border-radius: 8px`, hover → blue tint + border

**Real social URLs:**
```
LinkedIn:  https://linkedin.com/in/worthysteven
GitHub:    https://github.com/worthysteven
Email:     mailto:danielsteven.ds@gmail.com
Instagram: https://www.instagram.com/realstevend
Facebook:  https://www.facebook.com/daniel.steven.906/
```

**Right column — Portrait slot:**
- 280×280px circle, `border-radius: 50%`
- Gradient ring border (2px, blue→cyan)
- 3 animated orbital rings (CSS `@keyframes rotate`, different speeds/directions)
- 3 floating tech badge pills (absolute positioned around portrait)
- Drag-drop / click-to-upload image slot, persisted to `localStorage('pf-portrait')`

**Scroll hint:** Centred bottom, "Scroll" + animated vertical line, enters at 1.6s delay

---

## Screen 3: Portfolio — Stats Bar

**Padding:** `44px 0`
**Grid:** `repeat(4, 1fr); gap: 18px`
**Cards:** `background: var(--card); border: 1px solid var(--b); border-radius: 20px; backdrop-filter: blur(14px); padding: 24px; text-align: center`
**Number:** `clamp(34px, 3.5vw, 44px)`, gradient text (blue→cyan), weight 700
**Label:** 13px IBM Plex Mono, `--t2`
**Hover:** `transform: translateY(-4px)`
**Counter animation:** Cubic-ease count-up 1700ms, triggers at 30% visibility via IntersectionObserver
**Values:** 20+ Projects · 5 Research · 40+ Certifications · 3 Years Experience

---

## Screen 4: Portfolio — Projects Section

**Project Category Tabs:**
- Row of pill buttons: All / Machine Learning / AI·LLM / Computer Vision / Data Science / Financial Engineering / Programming
- Active state: `border-color: var(--a); color: var(--a); background: var(--glow)`
- Inactive cards get `display: none` when tab is clicked
- Each card has `data-cat` attribute: `ml | ai | cv | ds | fe | prog`

**Grid layout:**
- Desktop: `grid-template-columns: repeat(3, 1fr)` with featured card at `grid-column: span 2`
- ≤900px: 2 columns
- ≤600px: 1 column

**Project Card anatomy:**
```
.pc {
  border-radius: 20px;
  border: 1px solid var(--b);
  background: var(--card);
  backdrop-filter: blur(14px);
  cursor: pointer;   ← entire card navigates to Project Detail
  transition: transform .25s, box-shadow .25s;
}
.pc:hover { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(0,0,0,.25); }

.pc-img {
  height: 160px; (200px for featured)
  background: gradient placeholder OR uploaded image (background-size: cover)
  border-radius: 20px 20px 0 0;
  overflow: hidden;
}

.pc-body { padding: 18px; }
  .pc-tags   — row of small rounded tech tags
  .pc-title  — 16px, weight 600
  .pc-desc   — 13px, --t2, line-height 1.6
  .pc-metrics — row of metric pills
  .pc-links  — row of links: GitHub ↗ / Demo ↗ / Case Study ↗
               onclick: event.stopPropagation() — these navigate independently
```

**Clickable cards:** `onclick="location.href='Project Detail.html?id=X'"`
**Action links:** `onclick="event.stopPropagation()"` to prevent card navigation

**5 hardcoded projects (id 1–5):**
| ID | Title | Category |
|---|---|---|
| 1 | Flood Prediction for Resilient Communities | Machine Learning |
| 2 | Enterprise RAG Chatbot | AI / LLM |
| 3 | Food-101 Image Classifier | Computer Vision |
| 4 | Titanic Survival Prediction API | Machine Learning |
| 5 | Personal Finance Management System | Data Science |

**Dynamic projects:** Read from `localStorage('pf_projects_custom')` — rendered as additional cards at the bottom of the grid.

---

## Screen 5: Portfolio — Blog Section

**Grid:** `repeat(3, 1fr); gap: 18px`
**Blog Card anatomy:**
```
.bc {
  border-radius: 20px;
  cursor: pointer;  ← navigates to Blog Detail
}
.bc-img { height: 140px; gradient background OR uploaded image }
  .bc-cat — category pill, top-left absolute
.bc-body { padding: 16px; }
  .bc-tags — tag pills
  .bc-title — 15px weight 600
  .bc-excerpt — 13px --t2
  .bc-meta — date · read time, border-top
```
**Clickable:** `onclick="location.href='Blog Detail.html?id=X'"`

**3 hardcoded blogs (id 1–3) + 2 publications (type=pub, id 1–2):**
- Publications link to `Blog Detail.html?type=pub&id=X`

---

## Screen 6: Portfolio — Contact Section

**Grid:** `340px 1fr; gap: 56px` → single column ≤1100px

**Left column:**
- H3 + body copy
- 4 contact link cards:
  1. Email — `danielsteven.ds@gmail.com`
  2. LinkedIn — `linkedin.com/in/worthysteven`
  3. GitHub — `github.com/worthysteven`
  4. WhatsApp — `wa.me/[phone]` (replace with real number)
- Each card: `display: flex; gap: 12px; border: 1px solid var(--b); border-radius: 12px; padding: 14px 16px`
- Icon box: 34×34px, `background: var(--glow); border-radius: 8px`

**Right column — Contact form:**
```
Card: border-radius: 20px; padding: 28px; background: var(--card)
Fields:
  - Name row (2-col grid): First Name + Last Name
  - Subject (full width)
  - Message (textarea, min-height: 120px)
  - Send button: full-width, gradient bg (blue→cyan), weight 600
Validation: required fields, fake success toast after 3500ms
```

---

## Screen 7: Portfolio — Certifications Section

**Filter buttons:** Category pills — All / AI / Machine Learning / Deep Learning·CV / Data Science / Programming / UX Design / Financial Engineering
- Active: `border-color: var(--a); background: var(--glow); color: var(--a)`
- Filtering: toggles `display: none` on `.cert-item` elements

**Grid:** `auto-fill; minmax(270px, 1fr); gap: 12px`

**Cert card:** `display: flex; align-items: center; gap: 14px; border: 1px solid var(--b); border-radius: 12px; padding: 12px 14px`
- 38×38px coloured badge (bg gradient per category) + Name + Issuer

**Badge colours by category:**
```
AI: blue (#2563EB)     ML: cyan (#06B6D4)    DL/CV: violet (#8B5CF6)
DS: green (#10B981)    PR: amber (#F59E0B)   UX: pink (#EC4899)   FE: red (#EF4444)
```

---

## Screen 8: Portfolio — Timeline (Experience & Education)

**Left border line:** `1px solid; background: linear-gradient(to bottom, var(--a), transparent)`
**Each item:** `padding-left: 44px; padding-bottom: 44px; position: relative`
**Dot:** `11×11px; border-radius: 50%; background: var(--a); box-shadow: 0 0 12px var(--a); position: absolute; left: -5.5px`
**Date:** IBM Plex Mono 11px, `--t3`, `letter-spacing: .06em`
**Role:** 18px, weight 600
**Organisation:** 14px, `--a2`, weight 500

---

## Screen 9: Project Detail Page

**URL pattern:** `Project Detail.html?id=1` (id 1–5 hardcoded, 6+ from localStorage)

**Layout:** `grid-template-columns: 1fr 1fr; gap: 56px` → single column ≤900px

**Left column — Image carousel:**
- Main image: `aspect-ratio: 4/3; border-radius: 20px; overflow: hidden`
- Images sourced from `localStorage('pf_proj_{id}_img_1–4')` — falls back to gradient placeholders
- Prev/Next arrow buttons (absolute positioned left/right of main image)
- 4 thumbnail strip below main image — `grid-template-columns: repeat(4, 1fr)`
- Tech tags below thumbnails

**Right column:**
- Type badge + Date + Organisation metadata row
- Title (`clamp(22px, 2.8vw, 36px)`, weight 700)
- Live URL link (hidden if URL is `#`)
- Short description, metrics pills

**Accordions (3):**
1. Project Overview — open by default
2. The Challenge — closed
3. The Solution — closed
- Toggle via chevron click, `max-height` animation

**Key Features:** 2-column grid of checkmark items

**Conditional CTA buttons** — only rendered if URL was provided in admin:
```
View Live Project  → always shown if live URL ≠ '#'
GitHub             → only if github_url is set
Demo               → only if demo_url is set
Docs               → only if docs_url is set
Paper              → only if paper_url is set
Next Project →     → always shown
```

**Data sources (priority order):**
1. `localStorage('pf_proj_data_{id}')` — data saved from admin (overrides hardcoded)
2. Hardcoded `PROJECTS` array in the page for IDs 1–5
3. `localStorage('pf_projects_custom')` — new custom projects from admin

**Prev / Next navigation:** Reads from `ALL_PROJECTS` (hardcoded + custom merged)

---

## Screen 10: Blog / Publication Detail Page

**URL patterns:**
- Blog: `Blog Detail.html?id=1`
- Publication: `Blog Detail.html?type=pub&id=1`

**Layout:** `grid-template-columns: 1fr 340px; gap: 40px` → single column ≤900px

**Main article:**
- Featured image: `aspect-ratio: 16/9; border-radius: 20px` — gradient or uploaded image
- Author block: 42px avatar circle + name + date
- Meta bar: likes · comments · date · read time
- Publication type badge (journal/conference/thesis/note — colour coded)
- Article title, tags, body content (HTML rendered from stored content)

**Interaction row:**
- Like button — toggles `liked` state, changes fill/colour
- Comment button — scrolls to comment form
- Share row: Facebook / X (Twitter) / LinkedIn / WhatsApp / Email — each opens correct share URL

**Comments system:**
- Form: Name (required) + Email (optional) + Comment (required)
- Submitted comments render in list above form
- Count updates in heading and button
- No persistence (prototype) — wire to Supabase in production

**Sidebar (sticky, desktop):**
- Search bar
- Latest Posts (3 most recent blog posts)
- Categories (with post count)
- Tags (all unique tags across all posts)

---

## Screen 11: Admin Dashboard

**Auth flow:**
- Login screen shown on first load (`#login-overlay`)
- Google Sign-In button (demo — hides overlay, shows dashboard)
- Email/password fallback (demo credentials pre-filled)
- On sign-in: overlay fades out (`opacity: 0 → display: none`), app becomes visible

**Layout:**
```
Fixed sidebar (220px wide) + main content area
Sidebar: fixed left-0, full height, z-index 50
Main: margin-left: 220px, flex-column
Topbar: fixed top-0, left-220px, right-0, height 56px, z-index 40
```

**Mobile (≤768px):**
- Sidebar slides in from left (`transform: translateX(-220px) → 0`)
- Overlay dims the background
- Hamburger in topbar toggles sidebar

**Topbar contents:**
- Hamburger button (mobile) + Logo "SD / Steven Daniel"
- Search bar (hidden on mobile)
- Theme toggle button (☀/🌙) — `localStorage('admin-theme')`
- Notifications bell
- User avatar + name

**Sidebar navigation items:**
Dashboard · Projects · Blog Posts · Research · Certifications · Publications · Messages · Analytics · Settings

**Views (each is a `.view` div, shown/hidden via JS):**

### Dashboard View
- Stats cards row: Total Projects / Blog Posts / Messages / Certifications
- Recent activity table
- Quick action buttons

### Projects View
- Table: Title / Type / Status / Actions (edit, delete)
- "+ Add Project" button → opens project modal
- Each row edit → opens project modal (same form, pre-populated in production)

### Messages View
- List of message items, each with:
  - Sender avatar (initials) + Name + Subject + Preview + Time
  - Status badge (New/Read)
  - **Reply button** (↩) — opens reply modal

**Reply Modal:**
```
Overlay: fixed inset-0, rgba(0,0,0,.72), backdrop-filter: blur(5px)
Box: max-width 540px, centred
Fields:
  - Subject (readonly — pre-filled from message)
  - Quote block (sender name + preview text)
  - Reply textarea (required)
Buttons: Cancel · Send Reply
On Send: closes modal, shows success toast
```

**Add / Edit Project Modal — Full fields:**
1. Slot selector dropdown (New Project or Edit Slot 1–5 + any custom slots)
2. 4 image upload zones (2×2 grid) — Image 1 = card header + gallery, Images 2–4 = gallery only
3. Project Title *
4. Type / Category (select) + Status (select)
5. Short Description (card preview)
6. Project Overview (detail page accordion 1)
7. The Challenge (detail page accordion 2)
8. The Solution (detail page accordion 3)
9. Key Features (one per line → rendered as checklist)
10. Technologies (comma-separated → rendered as tags)
11. Key Metrics (comma-separated)
12. Live Project URL
13. GitHub URL → shows GitHub button on detail page
14. Demo URL → shows Demo button on detail page
15. Docs / Case Study URL → shows Docs button on detail page
16. Paper / Publication URL → shows Paper button on detail page
17. Date / Period
18. Organisation / Context

**On Save:**
- Images saved to `localStorage('pf_proj_{id}_img_1–4')`
- Image 1 also saved to `localStorage('pf_img_pc-img-{id}')` (updates portfolio card)
- Full project JSON saved to `localStorage('pf_proj_data_{id}')`
- New projects appended to `localStorage('pf_projects_custom')` array
- New project ID auto-increments from `localStorage('pf_proj_next_id')` (starts at 6)

---

## Data Flow & localStorage Keys

| Key | Purpose |
|---|---|
| `pf-theme` | Portfolio dark/light theme (`'dark'` or `'light'`) |
| `admin-theme` | Admin dashboard theme |
| `pf-portrait` | Portrait image (base64) for hero section |
| `pf-about-photo` | About section photo (base64) |
| `pf_img_pc-img-{1-5}` | Card header images for hardcoded projects |
| `pf_img_bc-img-{1-3}` | Card header images for blog posts |
| `pf_proj_{id}_img_{1-4}` | Detail page carousel images |
| `pf_proj_data_{id}` | Full project JSON (all form fields) |
| `pf_projects_custom` | Array of custom projects added via admin |
| `pf_proj_next_id` | Auto-increment counter for new project IDs (starts 6) |
| `pf-tweaks` | Tweaks panel values (name, role, palette, motion) |

**In production:** Replace all localStorage calls with Supabase reads/writes. See Supabase section below.

---

## Animations & Interactions

| Interaction | Implementation |
|---|---|
| Nav scroll state | `scrollY > 40` → `.scrolled` class on `#nav` |
| Theme toggle | `data-theme` on `<html>` + localStorage |
| Typing animation | Cycles 6 roles: 60ms type / 30ms delete / 1900ms pause |
| Particle canvas | 65 particles, max conn dist 120px, speed 0.3, RAF loop |
| Scroll reveal | `IntersectionObserver` at 8% threshold → adds `.v` to `.reveal` / `.rstagger` |
| Counter animation | Cubic-ease count-up 1700ms, triggers at 30% visibility |
| Cert filter | Toggles `display: none` on cert card elements |
| Project tabs | Toggles `display: none` on `.pc` cards by `data-cat` |
| Image card display | Reads localStorage base64 → `background-image` on card |
| Contact form | Fake success state, reverts after 3500ms |
| Command palette | ⌘K / Ctrl+K, arrow nav, Esc close, click-outside close |
| Mobile hamburger | `overflow: hidden` on body, overlay fades in |
| Admin sidebar | `transform: translateX` slide, overlay backdrop |
| Reply modal | `display: flex` on `#reply-overlay`, focus trap on textarea |
| Accordion | `max-height` transition (0 → 600px) |
| Image carousel | `background` swap + thumbnail grid re-render |
| Like button | Toggle `.liked` class, fill SVG heart |
| Share buttons | `window.open()` to platform-specific share URLs |

---

## Recommended Tech Stack for Production

### Frontend
```
Next.js 14+ (App Router)
TypeScript
Tailwind CSS (map CSS tokens to Tailwind config)
Framer Motion (scroll reveal, hero animations, page transitions)
```

### Backend / Database
```
Supabase
  - Auth: Google OAuth + email/password (replace demo login)
  - Database: projects, blog_posts, certifications, publications, messages tables
  - Storage: project images, blog images, portrait/about photos
  - Realtime: message notifications in admin
```

### Suggested Supabase Schema
```sql
-- projects
CREATE TABLE projects (
  id          SERIAL PRIMARY KEY,
  title       TEXT NOT NULL,
  type        TEXT,
  status      TEXT DEFAULT 'published',
  description TEXT,
  overview    TEXT,
  challenge   TEXT,
  solution    TEXT,
  features    TEXT[],
  tags        TEXT[],
  metrics     TEXT[],
  live_url    TEXT,
  github_url  TEXT,
  demo_url    TEXT,
  docs_url    TEXT,
  paper_url   TEXT,
  date_period TEXT,
  organisation TEXT,
  image_1_url TEXT,  -- from Supabase Storage
  image_2_url TEXT,
  image_3_url TEXT,
  image_4_url TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- blog_posts
CREATE TABLE blog_posts (
  id          SERIAL PRIMARY KEY,
  title       TEXT NOT NULL,
  type        TEXT DEFAULT 'blog',  -- 'blog' or 'pub'
  pub_type    TEXT,                 -- 'journal','conference','thesis','note'
  category    TEXT,
  tags        TEXT[],
  excerpt     TEXT,
  content     TEXT,
  status      TEXT DEFAULT 'draft',
  read_time   TEXT,
  image_url   TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- messages
CREATE TABLE messages (
  id          SERIAL PRIMARY KEY,
  name        TEXT,
  email       TEXT,
  subject     TEXT,
  message     TEXT,
  status      TEXT DEFAULT 'unread',
  replied_at  TIMESTAMPTZ,
  reply_text  TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);
```

### Suggested Component Breakdown
```
app/
  layout.tsx         ← Nav + Footer + theme provider
  page.tsx           ← Portfolio (all sections)
  projects/
    [id]/page.tsx    ← Project Detail
  blog/
    [id]/page.tsx    ← Blog/Publication Detail
  admin/
    layout.tsx       ← Admin sidebar + topbar (auth protected)
    page.tsx         ← Dashboard overview
    projects/page.tsx
    blog/page.tsx
    messages/page.tsx
    certifications/page.tsx

components/
  layout/
    Nav.tsx           ← Scrolled state, theme, hamburger, command palette
    MobileNav.tsx     ← Full-screen mobile overlay
    Footer.tsx
  sections/
    Hero.tsx          ← Canvas + typing animation + portrait slot
    Stats.tsx         ← Animated counters
    About.tsx         ← Photo + bio + credentials + tags
    Research.tsx      ← 4-card grid
    Projects.tsx      ← Tabs + grid + clickable cards
    Experience.tsx    ← Timeline
    Education.tsx     ← Timeline
    Certifications.tsx ← Filter + grid
    Publications.tsx  ← List
    Blog.tsx          ← 3-card grid
    Achievements.tsx  ← 3-card grid
    Contact.tsx       ← Info + form
  ui/
    ProjectCard.tsx
    BlogCard.tsx
    CommandPalette.tsx
    TweaksPanel.tsx
    ImageSlot.tsx     ← Drag-drop upload (admin-only)
    Timeline.tsx
    Accordion.tsx
    FilterTabs.tsx
  admin/
    Sidebar.tsx
    Topbar.tsx
    ReplyModal.tsx
    ProjectModal.tsx  ← Full form with 4 image zones
    BlogModal.tsx
hooks/
  useTheme.ts
  useScrollReveal.ts
  useCountUp.ts
  useTypingAnimation.ts
  useCommandPalette.ts
  useParticles.ts
```

---

## Placeholder Content to Replace

| Placeholder | Real value needed |
|---|---|
| `+XXX XXXX XXXX` in contact | Steven's WhatsApp number |
| `wa.me/XXXX` | WhatsApp link with real number |
| `Your Name` (tweaks default) | Steven Daniel |
| Resume download `href="#"` | `/resume.pdf` or Supabase Storage URL |
| Project `href="#"` live links | Real project URLs |
| Portfolio `hello@example.com` | Already updated to `danielsteven.ds@gmail.com` |

---

## Assets

- **Fonts:** Google Fonts CDN — IBM Plex Sans, Inter, IBM Plex Mono
- **Icons:** All inline SVG — no icon library dependency
- **Images:** No bundled images — all are user-uploaded via drag-drop slots or stored in localStorage/Supabase Storage
- **Canvas:** Native `<canvas>` particle system — no library, pure RAF loop

---

## How to Use This Package with Claude Code

1. **Open your terminal** in the project root
2. **Run Claude Code:** `claude` (or your configured alias)
3. **Say:** _"I have a design handoff package in `design_handoff_portfolio/`. Please read the README.md and implement the full portfolio system in Next.js with Supabase as described."_
4. Claude Code will read the README, reference the prototype HTML files for visual fidelity, and build the production implementation.

**Tips for best results:**
- Point Claude Code at specific sections: _"Start with the Nav and Hero section as described in the README"_
- For the admin: _"Implement the Admin Dashboard with Supabase auth and the projects table schema from the README"_
- For images: _"Set up Supabase Storage and wire the image upload zones in the admin project modal"_
- Iterate section by section — the README is structured to support this
