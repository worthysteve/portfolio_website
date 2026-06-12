create table if not exists projects (
  id serial primary key,
  title text not null,
  type text,
  status text default 'published',
  description text,
  overview text,
  challenge text,
  solution text,
  features text[],
  tags text[],
  metrics text[],
  live_url text,
  github_url text,
  demo_url text,
  docs_url text,
  paper_url text,
  date_period text,
  organisation text,
  image_1_url text,
  image_2_url text,
  image_3_url text,
  image_4_url text,
  created_at timestamptz default now()
);

create table if not exists blog_posts (
  id serial primary key,
  title text not null,
  type text default 'blog',
  pub_type text,
  category text,
  tags text[],
  excerpt text,
  content text,
  status text default 'draft',
  read_time text,
  image_url text,
  created_at timestamptz default now()
);

create table if not exists certifications (
  id serial primary key,
  name text not null,
  issuer text,
  category text,
  verified boolean default true,
  year_earned integer,
  verification_url text,
  credential_id text,
  created_at timestamptz default now()
);

create table if not exists publications (
  id serial primary key,
  title text not null,
  pub_type text,
  status text default 'under review',
  authors text[],
  venue text,
  year integer,
  pdf_url text,
  created_at timestamptz default now()
);

create table if not exists experience (
  id serial primary key,
  role text not null,
  organisation text,
  date_period text,
  start_date date,
  end_date date,
  description text,
  tags text[],
  award text,
  display_order integer default 0,
  created_at timestamptz default now()
);

create table if not exists education (
  id serial primary key,
  degree text not null,
  institution text,
  date_period text,
  description text,
  thesis text,
  tags text[],
  award text,
  display_order integer default 0,
  created_at timestamptz default now()
);

create table if not exists achievements (
  id serial primary key,
  title text not null,
  organisation text,
  year text,
  description text,
  icon text default 'award',
  display_order integer default 0,
  created_at timestamptz default now()
);

create table if not exists site_media (
  id text primary key,
  image_url text,
  alt_text text,
  updated_at timestamptz default now()
);

create table if not exists blog_comments (
  id serial primary key,
  post_id integer not null,
  parent_id integer references blog_comments(id) on delete cascade,
  name text not null,
  email text,
  comment text not null,
  is_admin boolean default false,
  status text default 'published',
  created_at timestamptz default now()
);

create table if not exists blog_likes (
  id serial primary key,
  post_id integer not null,
  visitor_id text not null,
  created_at timestamptz default now(),
  unique(post_id, visitor_id)
);

create table if not exists messages (
  id serial primary key,
  name text,
  email text,
  subject text,
  message text,
  status text default 'unread',
  replied_at timestamptz,
  reply_text text,
  created_at timestamptz default now()
);

alter table experience add column if not exists start_date date;
alter table experience add column if not exists end_date date;

alter table projects enable row level security;
alter table blog_posts enable row level security;
alter table certifications enable row level security;
alter table publications enable row level security;
alter table experience enable row level security;
alter table education enable row level security;
alter table achievements enable row level security;
alter table site_media enable row level security;
alter table blog_comments enable row level security;
alter table blog_likes enable row level security;
alter table messages enable row level security;

drop policy if exists "Public can read published projects" on projects;
create policy "Public can read published projects"
  on projects for select
  using (status = 'published');

drop policy if exists "Public can read published blog posts" on blog_posts;
create policy "Public can read published blog posts"
  on blog_posts for select
  using (status = 'published');

drop policy if exists "Public can read certifications" on certifications;
create policy "Public can read certifications"
  on certifications for select
  using (true);

drop policy if exists "Public can read publications" on publications;
create policy "Public can read publications"
  on publications for select
  using (true);

drop policy if exists "Public can read experience" on experience;
create policy "Public can read experience"
  on experience for select
  using (true);

drop policy if exists "Public can read education" on education;
create policy "Public can read education"
  on education for select
  using (true);

drop policy if exists "Public can read achievements" on achievements;
create policy "Public can read achievements"
  on achievements for select
  using (true);

drop policy if exists "Public can read site media" on site_media;
create policy "Public can read site media"
  on site_media for select
  using (true);

drop policy if exists "Public can read blog comments" on blog_comments;
create policy "Public can read blog comments"
  on blog_comments for select
  using (status = 'published');

drop policy if exists "Public can create blog comments" on blog_comments;
create policy "Public can create blog comments"
  on blog_comments for insert
  with check (is_admin = false and status = 'published');

drop policy if exists "Public can read blog likes" on blog_likes;
create policy "Public can read blog likes"
  on blog_likes for select
  using (true);

drop policy if exists "Public can create blog likes" on blog_likes;
create policy "Public can create blog likes"
  on blog_likes for insert
  with check (true);

drop policy if exists "Public can remove own blog likes" on blog_likes;
create policy "Public can remove own blog likes"
  on blog_likes for delete
  using (true);

drop policy if exists "Public can create messages" on messages;
create policy "Public can create messages"
  on messages for insert
  with check (true);

drop policy if exists "Authenticated users manage projects" on projects;
create policy "Authenticated users manage projects"
  on projects for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated users manage blog posts" on blog_posts;
create policy "Authenticated users manage blog posts"
  on blog_posts for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated users manage certifications" on certifications;
create policy "Authenticated users manage certifications"
  on certifications for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated users manage publications" on publications;
create policy "Authenticated users manage publications"
  on publications for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated users manage experience" on experience;
create policy "Authenticated users manage experience"
  on experience for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated users manage education" on education;
create policy "Authenticated users manage education"
  on education for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated users manage achievements" on achievements;
create policy "Authenticated users manage achievements"
  on achievements for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated users manage site media" on site_media;
create policy "Authenticated users manage site media"
  on site_media for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated users manage blog comments" on blog_comments;
create policy "Authenticated users manage blog comments"
  on blog_comments for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated users manage blog likes" on blog_likes;
create policy "Authenticated users manage blog likes"
  on blog_likes for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated users manage messages" on messages;
create policy "Authenticated users manage messages"
  on messages for all
  to authenticated
  using (true)
  with check (true);

insert into storage.buckets (id, name, public)
values ('portfolio-media', 'portfolio-media', true)
on conflict (id) do nothing;

drop policy if exists "Public can read portfolio media" on storage.objects;
create policy "Public can read portfolio media"
  on storage.objects for select
  using (bucket_id = 'portfolio-media');

drop policy if exists "Authenticated users manage portfolio media" on storage.objects;
create policy "Authenticated users manage portfolio media"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'portfolio-media')
  with check (bucket_id = 'portfolio-media');
