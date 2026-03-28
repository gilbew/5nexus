-- Run in Supabase → SQL Editor once per project.
-- One JSON dashboard blob per user; RLS = only auth.uid() can read/write own row.

create table if not exists public.user_dashboard_state (
  user_id uuid primary key references auth.users (id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists user_dashboard_state_updated_at_idx
  on public.user_dashboard_state (updated_at desc);

alter table public.user_dashboard_state enable row level security;

create policy "user_dashboard_state_select_own"
  on public.user_dashboard_state for select
  using (auth.uid() = user_id);

create policy "user_dashboard_state_insert_own"
  on public.user_dashboard_state for insert
  with check (auth.uid() = user_id);

create policy "user_dashboard_state_update_own"
  on public.user_dashboard_state for update
  using (auth.uid() = user_id);

grant select, insert, update on table public.user_dashboard_state to authenticated;
