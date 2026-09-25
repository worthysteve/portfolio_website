# Portfolio Website

A responsive, database-driven personal portfolio website. The project is built as a static front-end application with Supabase powering dynamic content, media storage, authentication, comments, messages, and the admin dashboard.

## Overview

This application includes:

- A polished public portfolio homepage with animated hero section, particle canvas, typing animation, portrait orbit badges, education, certifications, experience & fellowships, achievements, projects, research interests, blog (shown only once a post is published), contact form, and a scroll-to-top/bottom button.
- A Supabase-backed admin dashboard for managing front-facing portfolio content.
- Dedicated listing pages for all projects and all blog posts.
- Detail pages for projects and blog posts.
- Supabase Auth support for admin email/password login and Google login.
- Supabase Storage support for portfolio media uploads.
- Blog comments, threaded replies, admin replies, and blog like counts.

## Main Pages

- `index.html` — public portfolio homepage.
- `Projects.html` — full projects listing page (the homepage previews the first 5).
- `Certifications.html` — all certifications with category filters (the homepage previews the first 8).
- `Experience.html` — all fellowships, bootcamps, and work experience (the homepage previews the first 5).
- `Project Detail.html` — individual project detail page with image carousel and conditional CTA buttons.
- `Blog.html` — full blog listing page.
- `Blog Detail.html` — individual blog/publication detail page with comments, replies, and likes.
- `Admin Dashboard.html` — admin panel for managing portfolio content.

## Core Files

- `portfolio.css` — main public site styling, responsive layout, design tokens, hero, cards, and mobile rules.
- `portfolio.js` — public site interactions, Supabase reads, hero animation, dynamic rendering, contact form, and theme behavior.
- `admin-supabase.js` — Supabase admin data layer, authentication, CRUD operations, media upload, comments, likes, and dashboard loading.
- `listing.js` — shared loader for the all-projects and all-blog pages (the blog page also supports `?q=`, `?tag=` and `?category=` filters).
- `site-common.js` — shared public-page behaviour: mobile menu, footer year, and the scroll-to-top/bottom button.
- `supabase-schema.sql` — database schema, RLS policies, storage bucket setup, comments, likes, messages, and admin-managed content tables (fresh installs).
- `supabase/migrations/` — updates for an existing database (run in order).
- `favicon.svg` — custom `SD` SVG favicon.

## Dynamic Content Managed From Admin

The admin dashboard is designed to manage the main front-facing content:

- Projects
- Blog posts
- Certifications
- Experience (grouped as “Fellowships & Bootcamps” or “Work Experience”)
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

## Updating an Existing Database

If the database was created from an older `supabase-schema.sql`, run these once in the Supabase SQL Editor:

1. `supabase/migrations/20260921000000_experience_category_and_admin_only_access.sql` — adds the Fellowship/Work category and restricts all content changes, uploads, and message access to the admin email addresses listed in the file.

Then redeploy the reply-email function so only the admin can send replies:

```bash
supabase functions deploy send-reply-email
```

## Contact Form Email Notifications

Every contact-form submission is saved to the `messages` table (Admin → Messages) and a copy is emailed to you through Resend. The email's Reply-To is the visitor's address, so replying from Gmail goes straight to them.

1. Run `supabase/migrations/20260925000000_message_email_notifications.sql` in the SQL Editor (prevents duplicate emails).
2. Deploy the function:

```bash
supabase functions deploy notify-new-message --use-api --no-verify-jwt
```

3. In Supabase, open **Database → Webhooks → Create a new hook**: table `messages`, event **Insert**, type **Supabase Edge Functions**, function `notify-new-message`, method `POST`.

The function uses the existing `RESEND_API_KEY` and `RESEND_FROM_EMAIL` secrets and sends to `NOTIFY_EMAIL` (falls back to `REPLY_TO_EMAIL`). It only ever emails that address, never one taken from the request.

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

4. Enable email/password authentication if you want manual admin login, and turn off "Allow new users to sign up" once your admin account exists. Only the emails listed in `public.is_portfolio_admin()` can change content either way.
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
- Admin-only changes require a signed-in Supabase user whose confirmed email is listed in `public.is_portfolio_admin()`.
- `index.html` contains placeholder entries for Experience, Education, Achievements, and Projects. Use **Import into admin** (Dashboard banner or Settings → Portfolio Content) to copy them into Supabase exactly as they appear; after that, everything is edited in the admin and new entries are added alongside them. Adding the first entry to an empty section imports that section's placeholders automatically, so nothing disappears from the site.
- Public users can submit contact messages, add blog comments, reply to comments, and like blog posts based on the configured RLS policies.
- Browsers cache favicons aggressively; hard refresh or clear browser cache if `favicon.svg` does not update immediately.
