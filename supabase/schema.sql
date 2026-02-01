-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Student Profiles (Gamification & Settings)
create table if not exists public.student_profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  grade_level text default 'high_school',
  learning_style text default 'visual',
  xp integer default 0,
  level integer default 1,
  current_streak integer default 0,
  last_active timestamp with time zone default timezone('utc'::text, now()),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Chemistry Topics (Content Management)
create table if not exists public.chemistry_topics (
  id text primary key, -- e.g., 'petroleum_formation'
  title text not null,
  description text,
  category text, -- 'hydrocarbons', 'oxygenated', etc.
  difficulty integer default 1,
  estimated_time integer default 30, -- minutes
  content_data jsonb, -- Stores the actual content (sections, examples)
  prerequisites jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. User Progress (Tracking)
create table if not exists public.user_progress (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  topic_id text references public.chemistry_topics(id) on delete cascade not null,
  
  completion_percentage float default 0.0,
  quiz_score float default 0.0,
  time_spent integer default 0, -- minutes
  is_completed boolean default false,
  last_accessed timestamp with time zone default timezone('utc'::text, now()),
  
  unique(user_id, topic_id)
);

-- 4. Chat Sessions (AI Tutor History)
create table if not exists public.chat_sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  message text not null,
  sender text not null, -- 'user' or 'ai'
  topic_context text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Row Level Security (RLS)
alter table public.student_profiles enable row level security;
alter table public.chemistry_topics enable row level security;
alter table public.user_progress enable row level security;
alter table public.chat_sessions enable row level security;

-- Policies
-- Profiles: Users can read/update their own profile
create policy "Users can view own profile" on public.student_profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on public.student_profiles
  for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.student_profiles
  for insert with check (auth.uid() = id);

-- Topics: Everyone can read
create policy "Topics are public" on public.chemistry_topics
  for select using (true);

-- Progress: Users manage their own progress
create policy "Users can view own progress" on public.user_progress
  for select using (auth.uid() = user_id);
create policy "Users can insert own progress" on public.user_progress
  for insert with check (auth.uid() = user_id);
create policy "Users can update own progress" on public.user_progress
  for update using (auth.uid() = user_id);

-- Chat: Users manage their own chats
create policy "Users can view own chats" on public.chat_sessions
  for select using (auth.uid() = user_id);
create policy "Users can insert own chats" on public.chat_sessions
  for insert with check (auth.uid() = user_id);
