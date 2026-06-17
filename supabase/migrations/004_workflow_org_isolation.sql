-- P1: workflow org isolation

alter table mycominer.workflows
  add column if not exists org_id text;

alter table mycominer.workflow_runs
  add column if not exists org_id text;

update mycominer.workflows
set org_id = 'legacy-unassigned'
where org_id is null;

update mycominer.workflow_runs wr
set org_id = coalesce(w.org_id, 'legacy-unassigned')
from mycominer.workflows w
where wr.workflow_id = w.id
  and wr.org_id is null;

update mycominer.workflow_runs
set org_id = 'legacy-unassigned'
where org_id is null;

alter table mycominer.workflows
  alter column org_id set not null;

alter table mycominer.workflow_runs
  alter column org_id set not null;

create index if not exists workflows_org_id_idx on mycominer.workflows (org_id);
create index if not exists workflow_runs_org_id_idx on mycominer.workflow_runs (org_id);
create index if not exists workflow_runs_org_workflow_idx on mycominer.workflow_runs (org_id, workflow_id);

drop function if exists mycominer.create_workflow_with_log(text, text, jsonb, boolean, uuid, text, text, jsonb);
drop function if exists mycominer.schedule_run_with_log(uuid, jsonb, uuid, text, text);
drop function if exists mycominer.cancel_run_with_log(uuid, text, text);

create or replace function mycominer.create_workflow_with_log(
  p_org_id text,
  p_name text,
  p_description text,
  p_steps jsonb,
  p_enabled boolean,
  p_workflow_id uuid,
  p_actor_id text,
  p_request_id text,
  p_payload jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = mycominer
as $$
declare
  v_workflow workflows%rowtype;
begin
  insert into workflows (id, org_id, name, description, steps, enabled)
  values (
    coalesce(p_workflow_id, uuid_generate_v4()),
    p_org_id,
    p_name,
    p_description,
    coalesce(p_steps, '[]'::jsonb),
    coalesce(p_enabled, true)
  )
  returning * into v_workflow;

  insert into orchestration_log (
    event_type,
    workflow_id,
    actor_id,
    request_id,
    payload
  )
  values (
    'workflow_created',
    v_workflow.id,
    p_actor_id,
    p_request_id,
    coalesce(p_payload, '{}'::jsonb)
  );

  return to_jsonb(v_workflow);
end;
$$;

create or replace function mycominer.schedule_run_with_log(
  p_org_id text,
  p_workflow_id uuid,
  p_input jsonb,
  p_run_id uuid,
  p_actor_id text,
  p_request_id text
)
returns jsonb
language plpgsql
security definer
set search_path = mycominer
as $$
declare
  v_workflow workflows%rowtype;
  v_run workflow_runs%rowtype;
begin
  select * into v_workflow
  from workflows
  where id = p_workflow_id and org_id = p_org_id;

  if not found then
    raise exception 'workflow_not_found';
  end if;

  insert into workflow_runs (id, workflow_id, org_id, status, input)
  values (
    coalesce(p_run_id, uuid_generate_v4()),
    p_workflow_id,
    p_org_id,
    'scheduled',
    coalesce(p_input, '{}'::jsonb)
  )
  returning * into v_run;

  insert into orchestration_log (
    event_type,
    workflow_id,
    run_id,
    actor_id,
    request_id,
    payload
  )
  values (
    'run_scheduled',
    p_workflow_id,
    v_run.id,
    p_actor_id,
    p_request_id,
    jsonb_build_object('input', coalesce(p_input, '{}'::jsonb))
  );

  return to_jsonb(v_run);
end;
$$;

create or replace function mycominer.cancel_run_with_log(
  p_org_id text,
  p_run_id uuid,
  p_actor_id text,
  p_request_id text
)
returns jsonb
language plpgsql
security definer
set search_path = mycominer
as $$
declare
  v_run workflow_runs%rowtype;
begin
  update workflow_runs wr
  set status = 'cancelling',
      cancelled_at = timezone('utc', now())
  from workflows w
  where wr.id = p_run_id
    and wr.workflow_id = w.id
    and wr.org_id = p_org_id
    and w.org_id = p_org_id
  returning wr.* into v_run;

  if not found then
    raise exception 'run_not_found';
  end if;

  insert into orchestration_log (
    event_type,
    workflow_id,
    run_id,
    actor_id,
    request_id,
    payload
  )
  values (
    'run_cancel_requested',
    v_run.workflow_id,
    v_run.id,
    p_actor_id,
    p_request_id,
    jsonb_build_object('requested_at', timezone('utc', now()))
  );

  return to_jsonb(v_run);
end;
$$;

revoke all on function mycominer.create_workflow_with_log(text, text, text, jsonb, boolean, uuid, text, text, jsonb) from public;
revoke all on function mycominer.schedule_run_with_log(text, uuid, jsonb, uuid, text, text) from public;
revoke all on function mycominer.cancel_run_with_log(text, uuid, text, text) from public;

grant execute on function mycominer.create_workflow_with_log(text, text, text, jsonb, boolean, uuid, text, text, jsonb) to service_role;
grant execute on function mycominer.schedule_run_with_log(text, uuid, jsonb, uuid, text, text) to service_role;
grant execute on function mycominer.cancel_run_with_log(text, uuid, text, text) to service_role;
