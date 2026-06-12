# Portfolio Website

A responsive, database-driven personal portfolio website. The project is built as a static front-end application with Supabase powering dynamic content, media storage, authentication, comments, messages, and the admin dashboard.

## Overview

This application includes:

- A polished public portfolio homepage with animated hero section, particle canvas, typing animation, portrait orbit badges, project previews, blog previews, research, experience, education, achievements, certifications, publications, and contact form.
- A Supabase-backed admin dashboard for managing front-facing portfolio content.
- Dedicated listing pages for all projects and all blog posts.
- Detail pages for projects and blog posts.
- Supabase Auth support for admin email/password login and Google login.
- Supabase Storage support for portfolio media uploads.
- Blog comments, threaded replies, admin replies, and blog like counts.

## Main Pages

- `index.html` — public portfolio homepage.
- `Projects.html` — full projects listing page.
- `Project Detail.html` — individual project detail page with image carousel and conditional CTA buttons.
- `Blog.html` — full blog listing page.
- `Blog Detail.html` — individual blog/publication detail page with comments, replies, and likes.
- `Admin Dashboard.html` — admin panel for managing portfolio content.

## Core Files

- `portfolio.css` — main public site styling, responsive layout, design tokens, hero, cards, and mobile rules.
- `portfolio.js` — public site interactions, Supabase reads, hero animation, dynamic rendering, contact form, and theme behavior.
- `admin-supabase.js` — Supabase admin data layer, authentication, CRUD operations, media upload, comments, likes, and dashboard loading.
- `listing.js` — shared loader for the all-projects and all-blog pages.
- `supabase-schema.sql` — database schema, RLS policies, storage bucket setup, comments, likes, messages, and admin-managed content tables.
- `favicon.svg` — custom `SD` SVG favicon.

## Dynamic Content Managed From Admin

The admin dashboard is designed to manage the main front-facing content:

- Projects
- Blog posts
- Publications
- Certifications
- Experience
- Education
- Achievements
- Site media, including hero/about imagery
- Contact messages
- Blog comments and admin replies
- Uploaded media in Supabase Storage

## Supabase Setup

1. Create a Supabase project.
2. Open the Supabase SQL Editor.
3. Run the full contents of `supabase-schema.sql`.
4. Copy your Supabase Project URL and publishable/anon key.
5. Open `Admin Dashboard.html`.
6. Add the Supabase URL, public key, and storage bucket name in the dashboard settings.

The schema creates these main tables:

- `projects`
- `blog_posts`
- `certifications`
- `publications`
- `experience`
- `education`
- `achievements`
- `site_media`
- `blog_comments`
- `blog_likes`
- `messages`

It also creates the public storage bucket:

- `portfolio-media`

## Authentication Setup

In Supabase:

1. Go to `Authentication` → `URL Configuration`.
2. Set the production Site URL:

```text
https://your-domain.com
```

3. Add redirect URLs for production and local development:

```text
https://your-domain.com/Admin%20Dashboard.html
https://your-domain.com/*
http://localhost:3000/*
http://localhost:3000/Admin%20Dashboard.html
```

4. Enable email/password authentication if you want manual admin login.
5. Enable Google provider if you want Google login.

For Google OAuth, configure the Google Cloud OAuth client with:

```text
Authorized JavaScript origins:
https://your-domain.com
http://localhost:3000

Authorized redirect URI:
https://YOUR_SUPABASE_PROJECT_REF.supabase.co/auth/v1/callback
```

## Local Development

This is a static site, so no build step is required.

Run a local server from the project root:

```bash
python3 -m http.server 3000
```

Open the public site:

```text
http://localhost:3000/index.html
```

Open the admin dashboard:

```text
http://localhost:3000/Admin%20Dashboard.html
```

## Deployment

The project can be deployed as a static site on Netlify.

Recommended production URLs:

- Public site: `https://your-domain.com/`
- Admin dashboard: `https://your-domain.com/Admin%20Dashboard.html`

If using Netlify DNS, point the domain nameservers to the Netlify-provided nameservers and wait for DNS propagation. Once DNS is verified, Netlify provisions the SSL/TLS certificate automatically.

## Notes

- The public site reads published content from Supabase and falls back to local/default content if Supabase is unavailable.
- Admin-only changes require an authenticated Supabase user.
- Public users can submit contact messages, add blog comments, reply to comments, and like blog posts based on the configured RLS policies.
- Browsers cache favicons aggressively; hard refresh or clear browser cache if `favicon.svg` does not update immediately.
