# Supabase setup (Phase 3)

Optional. Only needed if you want sign-in and per-user cloud persistence.

1. Create a project at [supabase.com](https://supabase.com). Copy **Project URL** and **anon public** key from Settings → API.
2. Add to `.env` (see `.env.example`):
   - `VITE_SUPABASE_URL=<Project URL>`
   - `VITE_SUPABASE_ANON_KEY=<anon public key>`
3. In the Supabase SQL editor, run the following to create the table and RLS:

```sql
-- Table for per-user dashboard state (Phase 3).
create table if not exists public.dashboard_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

-- RLS: users can only read/write their own row.
alter table public.dashboard_state enable row level security;

create policy "Users can read own dashboard_state"
  on public.dashboard_state for select
  using (auth.uid() = user_id);

create policy "Users can insert own dashboard_state"
  on public.dashboard_state for insert
  with check (auth.uid() = user_id);

create policy "Users can update own dashboard_state"
  on public.dashboard_state for update
  using (auth.uid() = user_id);
```

1. Enable Email auth in Supabase: Authentication → Providers → Email (enable, optionally disable "Confirm email" for dev).
