-- Reference copy of the schema. The actual migration applied to the
-- remote project lives in supabase/migrations/20261028000000_init_clients_responses.sql.

create table clients (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  company_name text not null,
  status text not null default 'not_started',
  created_at timestamptz not null default now()
);

create table responses (
  client_id uuid primary key references clients(id) on delete cascade,
  answers jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table clients enable row level security;
alter table responses enable row level security;
-- No public policies: all access goes through server-side code using the
-- service role key (API routes / server components), never the browser
-- anon key directly against these tables.
