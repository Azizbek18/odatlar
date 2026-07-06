-- =============================================================
-- odatlar (Streak.uz) — Supabase schema
-- Habit tracker + AI learning tools: dashboard, ai, aigenerator,
-- aitahlil, flashcards, hisobotlar.
-- Run this once against a fresh Supabase project's SQL editor.
-- =============================================================

create extension if not exists pgcrypto;

-- -------------------------------------------------------------
-- profiles — 1:1 extension of auth.users
-- -------------------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text,
  avatar_url  text,
  streak      integer not null default 0 check (streak >= 0),
  xp          integer not null default 0 check (xp >= 0),
  gems        integer not null default 0 check (gems >= 0),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- auto-create a profile row whenever someone signs up via Supabase Auth
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- generic updated_at maintenance
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- -------------------------------------------------------------
-- habits — one row per habit a user tracks (no more JSON-in-text)
-- -------------------------------------------------------------
create table public.habits (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles (id) on delete cascade,
  title         text not null check (char_length(title) between 1 and 40),
  description   text,
  icon          text not null default '⭐',
  color         text not null default 'purple' check (color in ('purple', 'blue', 'green', 'orange')),
  time_label    text,
  location_name text,
  latitude      double precision,
  longitude     double precision,
  is_active     boolean not null default true,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index habits_user_id_idx on public.habits (user_id);

create trigger habits_set_updated_at
  before update on public.habits
  for each row execute function public.handle_updated_at();

-- -------------------------------------------------------------
-- habit_logs — one row per day a habit was completed
-- (replaces the old single `is_done` flag baked into habits.description,
-- which could never reset day to day and had no history)
-- -------------------------------------------------------------
create table public.habit_logs (
  id         uuid primary key default gen_random_uuid(),
  habit_id   uuid not null references public.habits (id) on delete cascade,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  log_date   date not null default current_date,
  is_done    boolean not null default true,
  created_at timestamptz not null default now(),
  unique (habit_id, log_date)
);

create index habit_logs_user_date_idx on public.habit_logs (user_id, log_date);
create index habit_logs_habit_id_idx on public.habit_logs (habit_id);

-- recompute the consecutive-day streak from real completion history
create or replace function public.recompute_streak(p_user_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_streak integer := 0;
  v_day    date := current_date;
begin
  loop
    exit when not exists (
      select 1 from public.habit_logs
      where user_id = p_user_id and log_date = v_day and is_done
    );
    v_streak := v_streak + 1;
    v_day := v_day - 1;
  end loop;

  update public.profiles
    set streak = v_streak, updated_at = now()
    where id = p_user_id;
end;
$$;

create or replace function public.trg_habit_logs_after_change()
returns trigger
language plpgsql
as $$
begin
  perform public.recompute_streak(coalesce(new.user_id, old.user_id));
  return coalesce(new, old);
end;
$$;

create trigger habit_logs_after_insert
  after insert or delete on public.habit_logs
  for each row execute function public.trg_habit_logs_after_change();

-- -------------------------------------------------------------
-- xp_transactions — append-only ledger backing profiles.xp/gems
-- (replaces the old client-computed "overwrite profiles.xp" pattern,
-- which is a lost-update race condition across tabs/sessions, and
-- gives hisobotlar.js real daily/weekly/monthly totals to chart)
-- -------------------------------------------------------------
create table public.xp_transactions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles (id) on delete cascade,
  amount_xp    integer not null default 0,
  amount_gems  integer not null default 0,
  reason       text not null,
  created_at   timestamptz not null default now(),
  check (amount_xp <> 0 or amount_gems <> 0)
);

create index xp_transactions_user_created_idx on public.xp_transactions (user_id, created_at);

create or replace function public.apply_xp_transaction()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  update public.profiles
    set xp = xp + new.amount_xp,
        gems = gems + new.amount_gems,
        updated_at = now()
    where id = new.user_id;
  return new;
end;
$$;

create trigger xp_transactions_after_insert
  after insert on public.xp_transactions
  for each row execute function public.apply_xp_transaction();

-- -------------------------------------------------------------
-- flashcards — decks + cards (flashcards.html)
-- -------------------------------------------------------------
create table public.flashcard_decks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.profiles (id) on delete cascade,
  title       text not null,
  description text,
  icon        text,
  color       text,
  is_system   boolean not null default false,
  created_at  timestamptz not null default now()
);

create index flashcard_decks_user_id_idx on public.flashcard_decks (user_id);

create table public.flashcards (
  id         uuid primary key default gen_random_uuid(),
  deck_id    uuid not null references public.flashcard_decks (id) on delete cascade,
  front      text not null,
  back       text not null,
  position   integer not null default 0,
  created_at timestamptz not null default now()
);

create index flashcards_deck_id_idx on public.flashcards (deck_id);

create table public.flashcard_reviews (
  id             uuid primary key default gen_random_uuid(),
  deck_id        uuid not null references public.flashcard_decks (id) on delete cascade,
  user_id        uuid not null references public.profiles (id) on delete cascade,
  cards_reviewed integer not null default 0 check (cards_reviewed >= 0),
  cards_known    integer not null default 0 check (cards_known >= 0 and cards_known <= cards_reviewed),
  reviewed_at    timestamptz not null default now()
);

create index flashcard_reviews_user_deck_idx on public.flashcard_reviews (user_id, deck_id);

-- -------------------------------------------------------------
-- ai_daily_tasks — AI-suggested daily tasks (ai.html)
-- -------------------------------------------------------------
create table public.ai_daily_tasks (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles (id) on delete cascade,
  task_date       date not null default current_date,
  title           text not null,
  category        text,
  ai_tip          text,
  duration_seconds integer,
  is_done         boolean not null default false,
  created_at      timestamptz not null default now()
);

create index ai_daily_tasks_user_date_idx on public.ai_daily_tasks (user_id, task_date);

-- -------------------------------------------------------------
-- ai_subject_scores — progress snapshots (aitahlil.html)
-- -------------------------------------------------------------
create table public.ai_subject_scores (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles (id) on delete cascade,
  subject       text not null,
  score         smallint not null check (score between 0 and 100),
  trend_tag     text,
  snapshot_date date not null default current_date,
  created_at    timestamptz not null default now()
);

create index ai_subject_scores_user_date_idx on public.ai_subject_scores (user_id, snapshot_date);

-- =============================================================
-- Row Level Security — every table is owner-scoped via auth.uid()
-- =============================================================

alter table public.profiles enable row level security;
alter table public.habits enable row level security;
alter table public.habit_logs enable row level security;
alter table public.xp_transactions enable row level security;
alter table public.flashcard_decks enable row level security;
alter table public.flashcards enable row level security;
alter table public.flashcard_reviews enable row level security;
alter table public.ai_daily_tasks enable row level security;
alter table public.ai_subject_scores enable row level security;

-- profiles: row is only visible/editable by its owner
-- (insert happens only through the handle_new_user trigger, which runs
-- as security definer and therefore bypasses RLS — no insert policy needed)
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- habits: full CRUD, owner only
create policy "habits_select_own" on public.habits
  for select using (auth.uid() = user_id);
create policy "habits_insert_own" on public.habits
  for insert with check (auth.uid() = user_id);
create policy "habits_update_own" on public.habits
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "habits_delete_own" on public.habits
  for delete using (auth.uid() = user_id);

-- habit_logs: owner can log/undo completions; entries are otherwise immutable
create policy "habit_logs_select_own" on public.habit_logs
  for select using (auth.uid() = user_id);
create policy "habit_logs_insert_own" on public.habit_logs
  for insert with check (auth.uid() = user_id);
create policy "habit_logs_delete_own" on public.habit_logs
  for delete using (auth.uid() = user_id);

-- xp_transactions: append-only ledger — owner can read/write, never edit/delete
create policy "xp_transactions_select_own" on public.xp_transactions
  for select using (auth.uid() = user_id);
create policy "xp_transactions_insert_own" on public.xp_transactions
  for insert with check (auth.uid() = user_id);

-- flashcard_decks: everyone can read system starter decks; users manage their own
create policy "flashcard_decks_select" on public.flashcard_decks
  for select using (is_system or auth.uid() = user_id);
create policy "flashcard_decks_insert_own" on public.flashcard_decks
  for insert with check (auth.uid() = user_id);
create policy "flashcard_decks_update_own" on public.flashcard_decks
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "flashcard_decks_delete_own" on public.flashcard_decks
  for delete using (auth.uid() = user_id);

-- flashcards: readable if the parent deck is readable; writable only on own decks
create policy "flashcards_select" on public.flashcards
  for select using (
    exists (
      select 1 from public.flashcard_decks d
      where d.id = flashcards.deck_id and (d.is_system or d.user_id = auth.uid())
    )
  );
create policy "flashcards_write_own" on public.flashcards
  for all using (
    exists (
      select 1 from public.flashcard_decks d
      where d.id = flashcards.deck_id and d.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.flashcard_decks d
      where d.id = flashcards.deck_id and d.user_id = auth.uid()
    )
  );

-- flashcard_reviews: owner only
create policy "flashcard_reviews_select_own" on public.flashcard_reviews
  for select using (auth.uid() = user_id);
create policy "flashcard_reviews_insert_own" on public.flashcard_reviews
  for insert with check (auth.uid() = user_id);

-- ai_daily_tasks: owner only, full CRUD
create policy "ai_daily_tasks_select_own" on public.ai_daily_tasks
  for select using (auth.uid() = user_id);
create policy "ai_daily_tasks_insert_own" on public.ai_daily_tasks
  for insert with check (auth.uid() = user_id);
create policy "ai_daily_tasks_update_own" on public.ai_daily_tasks
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "ai_daily_tasks_delete_own" on public.ai_daily_tasks
  for delete using (auth.uid() = user_id);

-- ai_subject_scores: append-only snapshots, owner only
create policy "ai_subject_scores_select_own" on public.ai_subject_scores
  for select using (auth.uid() = user_id);
create policy "ai_subject_scores_insert_own" on public.ai_subject_scores
  for insert with check (auth.uid() = user_id);

-- =============================================================
-- Not modeled yet on purpose: dashboard.html already links to
-- friends.html, yutuq.html (achievements), Leardboard.html,
-- profil.html, sozlamalar.html, darslar.html — none of those pages
-- exist in the repo yet, so their tables aren't guessed here.
-- Add them when those features are actually built.
-- =============================================================
