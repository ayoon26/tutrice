-- Tutrice schema. Run once against a fresh Supabase project
-- (SQL editor, or `supabase db push` if you use the CLI).
-- Tables are per-tutor and locked down with row-level security so a tutor
-- can only ever see their own students, memory, lessons, and suggestions.

create extension if not exists "pgcrypto";

create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now()
);

create table if not exists calendar_connections (
  id uuid primary key default gen_random_uuid(),
  tutor_id uuid not null references profiles (id) on delete cascade,
  provider text not null default 'google',
  access_token text,
  refresh_token text,
  expires_at timestamptz,
  connected_at timestamptz not null default now(),
  unique (tutor_id, provider)
);

create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  tutor_id uuid not null references profiles (id) on delete cascade,
  name text not null,
  subject text,
  schedule_summary text,
  confidence text check (confidence in ('high', 'low')),
  status text not null default 'confirmed' check (status in ('detected', 'confirmed')),
  calendar_notes text,
  created_at timestamptz not null default now()
);

-- Always-confirmed facts about a student. Anything awaiting review lives in
-- suggested_updates until the tutor accepts it, which promotes it here.
create table if not exists memory_items (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students (id) on delete cascade,
  category text not null check (category in
    ('learning_preference', 'goal', 'schedule', 'progress', 'challenge', 'technique', 'homework', 'request', 'note')),
  label text not null,
  value text,
  source text not null check (source in ('calendar', 'lesson', 'manual', 'onboarding')),
  created_at timestamptz not null default now()
);

create table if not exists lessons (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students (id) on delete cascade,
  scheduled_at timestamptz,
  status text not null default 'scheduled' check (status in ('scheduled', 'recording', 'processing', 'reviewed')),
  today_focus text,
  audio_url text,
  transcript text,
  summary text,
  created_at timestamptz not null default now()
);

create table if not exists suggested_updates (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students (id) on delete cascade,
  lesson_id uuid references lessons (id) on delete cascade,
  source text not null check (source in ('onboarding', 'lesson', 'manual')),
  category text not null,
  label text not null,
  value text,
  badge text,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamptz not null default now()
);

create index if not exists idx_students_tutor on students (tutor_id);
create index if not exists idx_memory_items_student on memory_items (student_id);
create index if not exists idx_lessons_student on lessons (student_id);
create index if not exists idx_suggested_updates_student on suggested_updates (student_id);

alter table profiles enable row level security;
alter table calendar_connections enable row level security;
alter table students enable row level security;
alter table memory_items enable row level security;
alter table lessons enable row level security;
alter table suggested_updates enable row level security;

create policy "profiles: self" on profiles
  for all using (id = auth.uid()) with check (id = auth.uid());

create policy "calendar_connections: own" on calendar_connections
  for all using (tutor_id = auth.uid()) with check (tutor_id = auth.uid());

create policy "students: own" on students
  for all using (tutor_id = auth.uid()) with check (tutor_id = auth.uid());

create policy "memory_items: via own student" on memory_items
  for all using (exists (select 1 from students s where s.id = memory_items.student_id and s.tutor_id = auth.uid()))
  with check (exists (select 1 from students s where s.id = memory_items.student_id and s.tutor_id = auth.uid()));

create policy "lessons: via own student" on lessons
  for all using (exists (select 1 from students s where s.id = lessons.student_id and s.tutor_id = auth.uid()))
  with check (exists (select 1 from students s where s.id = lessons.student_id and s.tutor_id = auth.uid()));

create policy "suggested_updates: via own student" on suggested_updates
  for all using (exists (select 1 from students s where s.id = suggested_updates.student_id and s.tutor_id = auth.uid()))
  with check (exists (select 1 from students s where s.id = suggested_updates.student_id and s.tutor_id = auth.uid()));

-- Creates a profile row automatically the first time someone signs in.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
