-- MycoMiner economy & billing tables

create table mycominer.invoices (
  id uuid primary key default uuid_generate_v4(),
  org_id text not null,
  amount numeric(12, 2) not null,
  status text not null default 'pending',
  due_date timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index invoices_org_id_idx on mycominer.invoices (org_id);

create table mycominer.reward_tokens (
  id uuid primary key default uuid_generate_v4(),
  org_id text not null,
  token_type text not null,
  amount numeric(12, 2) not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index reward_tokens_org_id_idx on mycominer.reward_tokens (org_id);

create table mycominer.license_tokens (
  id uuid primary key default uuid_generate_v4(),
  org_id text not null,
  license_key text not null,
  tier text,
  expires_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index license_tokens_org_id_idx on mycominer.license_tokens (org_id);

alter table mycominer.invoices enable row level security;
alter table mycominer.reward_tokens enable row level security;
alter table mycominer.license_tokens enable row level security;

create policy "service_role_all_invoices"
  on mycominer.invoices for all to service_role using (true) with check (true);

create policy "service_role_all_reward_tokens"
  on mycominer.reward_tokens for all to service_role using (true) with check (true);

create policy "service_role_all_license_tokens"
  on mycominer.license_tokens for all to service_role using (true) with check (true);

grant all on all tables in schema mycominer to service_role;
