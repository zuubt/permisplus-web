-- PermisPlus — Supabase Schema
-- Run this in the Supabase SQL Editor

-- Users
create table if not exists users (
  id text primary key,
  phone text unique,
  name text not null,
  city text default 'Lomé',
  coins_balance integer default 0,
  streak_count integer default 0,
  last_active_date date,
  referral_code text unique,
  referred_by text references users(id),
  daily_coin_earned integer default 0,
  daily_coin_date date,
  is_guest boolean default false,
  created_at timestamptz default now()
);

-- Modules
create table if not exists modules (
  id text primary key,
  title_fr text not null,
  description_fr text,
  icon_emoji text,
  order_index integer,
  is_active boolean default true
);

-- Lessons
create table if not exists lessons (
  id text primary key,
  module_id text references modules(id),
  title_fr text not null,
  content_json jsonb,
  order_index integer,
  coins_reward integer default 5
);

-- Questions
create table if not exists questions (
  id text primary key,
  module_id text references modules(id),
  question_text text not null,
  option_a text not null,
  option_b text not null,
  option_c text not null,
  option_d text not null,
  correct_option text not null check (correct_option in ('a','b','c','d')),
  explanation text,
  difficulty text check (difficulty in ('easy','medium','hard'))
);

-- Quiz sessions
create table if not exists quiz_sessions (
  id text primary key,
  user_id text references users(id),
  session_type text check (session_type in ('practice','mock_exam')),
  module_id text references modules(id),
  score integer,
  total_questions integer,
  duration_seconds integer,
  completed_at timestamptz default now()
);

-- User lesson progress
create table if not exists user_lesson_progress (
  id text primary key default gen_random_uuid()::text,
  user_id text references users(id),
  lesson_id text references lessons(id),
  completed_at timestamptz default now(),
  unique(user_id, lesson_id)
);

-- Coin transactions
create table if not exists coin_transactions (
  id text primary key,
  user_id text references users(id),
  amount integer not null,
  type text check (type in ('earned','redeemed','bonus','referral')),
  description text,
  created_at timestamptz default now()
);

-- Redemptions
create table if not exists redemptions (
  id text primary key,
  user_id text references users(id),
  coins_spent integer not null,
  airtime_amount_fcfa integer not null,
  operator text check (operator in ('togocel','moov')),
  status text check (status in ('pending','success','failed')) default 'pending',
  created_at timestamptz default now()
);

-- Enable RLS
alter table users enable row level security;
alter table coin_transactions enable row level security;
alter table user_lesson_progress enable row level security;
alter table quiz_sessions enable row level security;
alter table redemptions enable row level security;

-- Public read for modules, lessons, questions
alter table modules enable row level security;
alter table lessons enable row level security;
alter table questions enable row level security;

create policy "Modules public read" on modules for select using (true);
create policy "Lessons public read" on lessons for select using (true);
create policy "Questions public read" on questions for select using (true);
