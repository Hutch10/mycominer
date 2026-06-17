-- P0 security hardening: audit attribution, append-only log, atomic RPCs

alter table mycominer.orchestration_log
  add column if not exists actor_id text,
  add column if not exists request_id text;

update mycominer.orchestration_log
set actor_id = coalesce(actor_id, 'legacy'),
    request_id = coalesce(request_id, 'legacy')
where actor_id is null or request_id is null;

alter table mycominer.orchestration_log
  alter column actor_id set not null,
  alter column request_id set not null;

create or replace function mycominer.prevent_orchestration_log_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'orchestration_log is append-only';
end;
$$;

drop trigger if exists orchestration_log_no_update on mycominer.orchestration_log;
drop trigger if exists orchestration_log_no_delete on mycominer.orchestration_log;

create trigger orchestration_log_no_update
  before update on mycominer.orchestration_log
  for each row execute function mycominer.prevent_orchestration_log_mutation();

create trigger orchestration_log_no_delete
  before delete on mycominer.orchestration_log
  for each row execute function mycominer.prevent_orchestration_log_mutation();

revoke update, delete on mycominer.orchestration_log from service_role;

create or replace function mycominer.create_workflow_with_log(
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
  insert into workflows (id, name, description, steps, enabled)
  values (
    coalesce(p_workflow_id, uuid_generate_v4()),
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
  v_run workflow_runs%rowtype;
begin
  if not exists (select 1 from workflows where id = p_workflow_id) then
    raise exception 'workflow_not_found';
  end if;

  insert into workflow_runs (id, workflow_id, status, input)
  values (
    coalesce(p_run_id, uuid_generate_v4()),
    p_workflow_id,
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
  update workflow_runs
  set status = 'cancelling',
      cancelled_at = timezone('utc', now())
  where id = p_run_id
  returning * into v_run;

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

revoke all on function mycominer.create_workflow_with_log(text, text, jsonb, boolean, uuid, text, text, jsonb) from public;
revoke all on function mycominer.schedule_run_with_log(uuid, jsonb, uuid, text, text) from public;
revoke all on function mycominer.cancel_run_with_log(uuid, text, text) from public;

grant execute on function mycominer.create_workflow_with_log(text, text, jsonb, boolean, uuid, text, text, jsonb) to service_role;
grant execute on function mycominer.schedule_run_with_log(uuid, jsonb, uuid, text, text) to service_role;
grant execute on function mycominer.cancel_run_with_log(uuid, text, text) to service_role;
