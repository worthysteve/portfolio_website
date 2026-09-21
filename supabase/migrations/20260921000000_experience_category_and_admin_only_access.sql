-- Run once in the Supabase SQL Editor (or `supabase db push`).
-- Safe to re-run.

-- 1. Experience entries can be shown under "Fellowships & Bootcamps" or "Work Experience".
alter table public.experience add column if not exists category text not null default 'work';

-- 2. Only the portfolio owner may change content, upload media, or read contact messages.
--    Before this, ANY signed-in Supabase user had full access. If sign-ups are enabled in
--    Authentication → Providers → Email, anyone could create an account and edit the site.
--    Edit the email list below if you sign in with a different address.
create or replace function public.is_portfolio_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from auth.users u
    where u.id = auth.uid()
      and u.email_confirmed_at is not null
      and lower(u.email) in (
        'danielsteven.ds@gmail.com',
        'steven@stevendaniel.dev'
      )
  );
$$;

revoke all on function public.is_portfolio_admin() from public;
grant execute on function public.is_portfolio_admin() to anon, authenticated;

drop policy if exists "Authenticated users manage projects" on public.projects;
drop policy if exists "Portfolio admin manages projects" on public.projects;
create policy "Portfolio admin manages projects" on public.projects
  for all to authenticated
  using ((select public.is_portfolio_admin())) with check ((select public.is_portfolio_admin()));

drop policy if exists "Authenticated users manage blog posts" on public.blog_posts;
drop policy if exists "Portfolio admin manages blog posts" on public.blog_posts;
create policy "Portfolio admin manages blog posts" on public.blog_posts
  for all to authenticated
  using ((select public.is_portfolio_admin())) with check ((select public.is_portfolio_admin()));

drop policy if exists "Authenticated users manage certifications" on public.certifications;
drop policy if exists "Portfolio admin manages certifications" on public.certifications;
create policy "Portfolio admin manages certifications" on public.certifications
  for all to authenticated
  using ((select public.is_portfolio_admin())) with check ((select public.is_portfolio_admin()));

drop policy if exists "Authenticated users manage publications" on public.publications;
drop policy if exists "Portfolio admin manages publications" on public.publications;
create policy "Portfolio admin manages publications" on public.publications
  for all to authenticated
  using ((select public.is_portfolio_admin())) with check ((select public.is_portfolio_admin()));

drop policy if exists "Authenticated users manage experience" on public.experience;
drop policy if exists "Portfolio admin manages experience" on public.experience;
create policy "Portfolio admin manages experience" on public.experience
  for all to authenticated
  using ((select public.is_portfolio_admin())) with check ((select public.is_portfolio_admin()));

drop policy if exists "Authenticated users manage education" on public.education;
drop policy if exists "Portfolio admin manages education" on public.education;
create policy "Portfolio admin manages education" on public.education
  for all to authenticated
  using ((select public.is_portfolio_admin())) with check ((select public.is_portfolio_admin()));

drop policy if exists "Authenticated users manage achievements" on public.achievements;
drop policy if exists "Portfolio admin manages achievements" on public.achievements;
create policy "Portfolio admin manages achievements" on public.achievements
  for all to authenticated
  using ((select public.is_portfolio_admin())) with check ((select public.is_portfolio_admin()));

drop policy if exists "Authenticated users manage site media" on public.site_media;
drop policy if exists "Portfolio admin manages site media" on public.site_media;
create policy "Portfolio admin manages site media" on public.site_media
  for all to authenticated
  using ((select public.is_portfolio_admin())) with check ((select public.is_portfolio_admin()));

drop policy if exists "Authenticated users manage blog comments" on public.blog_comments;
drop policy if exists "Portfolio admin manages blog comments" on public.blog_comments;
create policy "Portfolio admin manages blog comments" on public.blog_comments
  for all to authenticated
  using ((select public.is_portfolio_admin())) with check ((select public.is_portfolio_admin()));

drop policy if exists "Authenticated users manage blog likes" on public.blog_likes;
drop policy if exists "Portfolio admin manages blog likes" on public.blog_likes;
create policy "Portfolio admin manages blog likes" on public.blog_likes
  for all to authenticated
  using ((select public.is_portfolio_admin())) with check ((select public.is_portfolio_admin()));

drop policy if exists "Authenticated users manage messages" on public.messages;
drop policy if exists "Portfolio admin manages messages" on public.messages;
create policy "Portfolio admin manages messages" on public.messages
  for all to authenticated
  using ((select public.is_portfolio_admin())) with check ((select public.is_portfolio_admin()));

drop policy if exists "Authenticated users manage portfolio media" on storage.objects;
drop policy if exists "Portfolio admin manages portfolio media" on storage.objects;
create policy "Portfolio admin manages portfolio media" on storage.objects
  for all to authenticated
  using (bucket_id = 'portfolio-media' and (select public.is_portfolio_admin()))
  with check (bucket_id = 'portfolio-media' and (select public.is_portfolio_admin()));
