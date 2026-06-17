-- MycoMiner orchestration persistence (isolated schema)

create schema if not exists mycominer;
create extension if not exists "uuid-ossp";

create table mycominer.workflows (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  steps jsonb not null default '[]'::jsonb,
  enabled boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

create index workflows_enabled_idx on mycominer.workflows (enabled) where enabled = true;

create table mycominer.workflow_runs (
  id uuid primary key default uuid_generate_v4(),
  workflow_id uuid not null references mycominer.workflows (id) on delete cascade,
  status text not null default 'scheduled'
    check (status in ('scheduled', 'running', 'completed', 'failed', 'cancelling', 'cancelled')),
  input jsonb not null default '{}'::jsonb,
  scheduled_at timestamptz not null default timezone('utc', now()),
  started_at timestamptz,
  completed_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create index workflow_runs_workflow_id_idx on mycominer.workflow_runs (workflow_id);
create index workflow_runs_status_idx on mycominer.workflow_runs (status);

create table mycominer.orchestration_log (
  id uuid primary key default uuid_generate_v4(),
  event_type text not null,
  workflow_id uuid references mycominer.workflows (id) on delete set null,
  run_id uuid references mycominer.workflow_runs (id) on delete set null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index orchestration_log_workflow_id_idx on mycominer.orchestration_log (workflow_id);
create index orchestration_log_run_id_idx on mycominer.orchestration_log (run_id);
create index orchestration_log_created_at_idx on mycominer.orchestration_log (created_at desc);

create table mycominer.marketplace_revenue (
  id uuid primary key default uuid_generate_v4(),
  item_id text not null,
  org_id text not null,
  developer_id text,
  gross numeric(12, 2) not null,
  fees numeric(12, 2) not null default 0,
  taxes numeric(12, 2) not null default 0,
  net numeric(12, 2) not null,
  period timestamptz not null,
  created_at timestamptz not null default timezone('utc', now())
);

create index marketplace_revenue_org_id_idx on mycominer.marketplace_revenue (org_id);
create index marketplace_revenue_period_idx on mycominer.marketplace_revenue (period desc);

alter table mycominer.workflows enable row level security;
alter table mycominer.workflow_runs enable row level security;
alter table mycominer.orchestration_log enable row level security;
alter table mycominer.marketplace_revenue enable row level security;

create policy "service_role_all_workflows"
  on mycominer.workflows for all to service_role using (true) with check (true);

create policy "service_role_all_workflow_runs"
  on mycominer.workflow_runs for all to service_role using (true) with check (true);

create policy "service_role_all_orchestration_log"
  on mycominer.orchestration_log for all to service_role using (true) with check (true);

create policy "service_role_all_marketplace_revenue"
  on mycominer.marketplace_revenue for all to service_role using (true) with check (true);

grant usage on schema mycominer to service_role;
grant all on all tables in schema mycominer to service_role;
alter default privileges in schema mycominer grant all on tables to service_role;

-- Expose schema to PostgREST / supabase-js
alter role authenticator set pgrst.db_schemas = 'public, mycominer';
notify pgrst, 'reload config';
