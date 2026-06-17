-- Closed Beta hotfix: workflow RPCs call uuid_generate_v4() inside plpgsql bodies.
-- On Supabase, uuid-ossp lives in the extensions schema while RPC search_path is mycominer only.
-- gen_random_uuid() is built into PostgreSQL 13+ and does not require extensions on search_path.
-- Reviewed 004–007: only create_workflow_with_log and schedule_run_with_log need this fix.

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
    coalesce(p_workflow_id, gen_random_uuid()),
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
    coalesce(p_run_id, gen_random_uuid()),
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

revoke all on function mycominer.create_workflow_with_log(text, text, text, jsonb, boolean, uuid, text, text, jsonb) from public;
revoke all on function mycominer.schedule_run_with_log(text, uuid, jsonb, uuid, text, text) from public;

grant execute on function mycominer.create_workflow_with_log(text, text, text, jsonb, boolean, uuid, text, text, jsonb) to service_role;
grant execute on function mycominer.schedule_run_with_log(text, uuid, jsonb, uuid, text, text) to service_role;
