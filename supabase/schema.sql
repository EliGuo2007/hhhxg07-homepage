-- hhhxg07 community schema
-- Run this in Supabase SQL Editor after creating a project.

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_slug text not null,
  parent_id uuid references public.comments(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 4000),
  author_name text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists comments_post_slug_created_at_idx
  on public.comments (post_slug, created_at);

create index if not exists comments_parent_id_idx
  on public.comments (parent_id);

create table if not exists public.discussion_topics (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 160),
  body text not null check (char_length(body) between 1 and 6000),
  author_name text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists discussion_topics_created_at_idx
  on public.discussion_topics (created_at desc);

create table if not exists public.discussion_replies (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.discussion_topics(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 4000),
  author_name text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists discussion_replies_topic_id_created_at_idx
  on public.discussion_replies (topic_id, created_at);

alter table public.comments enable row level security;
alter table public.discussion_topics enable row level security;
alter table public.discussion_replies enable row level security;

drop policy if exists "Anyone can read comments" on public.comments;
create policy "Anyone can read comments"
  on public.comments for select
  using (true);

drop policy if exists "Signed-in users can add comments" on public.comments;
create policy "Signed-in users can add comments"
  on public.comments for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can edit their own comments" on public.comments;
create policy "Users can edit their own comments"
  on public.comments for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own comments" on public.comments;
create policy "Users can delete their own comments"
  on public.comments for delete
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Anyone can read discussion topics" on public.discussion_topics;
create policy "Anyone can read discussion topics"
  on public.discussion_topics for select
  using (true);

drop policy if exists "Signed-in users can add discussion topics" on public.discussion_topics;
create policy "Signed-in users can add discussion topics"
  on public.discussion_topics for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can edit their own discussion topics" on public.discussion_topics;
create policy "Users can edit their own discussion topics"
  on public.discussion_topics for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own discussion topics" on public.discussion_topics;
create policy "Users can delete their own discussion topics"
  on public.discussion_topics for delete
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Anyone can read discussion replies" on public.discussion_replies;
create policy "Anyone can read discussion replies"
  on public.discussion_replies for select
  using (true);

drop policy if exists "Signed-in users can add discussion replies" on public.discussion_replies;
create policy "Signed-in users can add discussion replies"
  on public.discussion_replies for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can edit their own discussion replies" on public.discussion_replies;
create policy "Users can edit their own discussion replies"
  on public.discussion_replies for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own discussion replies" on public.discussion_replies;
create policy "Users can delete their own discussion replies"
  on public.discussion_replies for delete
  to authenticated
  using (auth.uid() = user_id);
