-- Enables Postgres → Realtime so browsers can "listen" when another device updates the row.
-- Apply in Supabase → SQL Editor (or `supabase db push`). If you see "already member of publication", skip.
alter publication supabase_realtime add table public.user_dashboard_state;
