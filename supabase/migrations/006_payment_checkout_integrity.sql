-- GA: durable marketplace checkout + reconciliation

create table if not exists mycominer.marketplace_checkout_sessions (
  id uuid primary key default uuid_generate_v4(),
  org_id text not null,
  idempotency_key text not null,
  item_id text not null,
  gross numeric(12, 2) not null,
  fees numeric(12, 2) not null default 0,
  taxes numeric(12, 2) not null default 0,
  net numeric(12, 2) not null,
  status text not null default 'pending'
    check (status in ('pending', 'charged', 'completed', 'failed', 'needs_reconciliation')),
  charge_id text,
  revenue_id uuid references mycominer.marketplace_revenue (id) on delete set null,
  failure_reason text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists marketplace_checkout_sessions_org_idempotency_idx
  on mycominer.marketplace_checkout_sessions (org_id, idempotency_key);

create index if not exists marketplace_checkout_sessions_status_idx
  on mycominer.marketplace_checkout_sessions (status);

alter table mycominer.marketplace_checkout_sessions enable row level security;

create policy "service_role_all_marketplace_checkout_sessions"
  on mycominer.marketplace_checkout_sessions for all to service_role using (true) with check (true);

grant all on mycominer.marketplace_checkout_sessions to service_role;

create or replace function mycominer.begin_marketplace_checkout(
  p_org_id text,
  p_item_id text,
  p_gross numeric,
  p_fees numeric,
  p_taxes numeric,
  p_net numeric,
  p_idempotency_key text,
  p_actor_id text,
  p_request_id text
)
returns jsonb
language plpgsql
security definer
set search_path = mycominer
as $$
declare
  v_session marketplace_checkout_sessions%rowtype;
  v_key text := nullif(trim(p_idempotency_key), '');
begin
  if v_key is null then
    raise exception 'idempotency_key_required';
  end if;

  select * into v_session
  from marketplace_checkout_sessions
  where org_id = p_org_id
    and idempotency_key = v_key;

  if found then
    return to_jsonb(v_session);
  end if;

  insert into marketplace_checkout_sessions (
    org_id,
    idempotency_key,
    item_id,
    gross,
    fees,
    taxes,
    net,
    status
  )
  values (
    p_org_id,
    v_key,
    p_item_id,
    p_gross,
    p_fees,
    p_taxes,
    p_net,
    'pending'
  )
  returning * into v_session;

  insert into orchestration_log (
    event_type,
    actor_id,
    request_id,
    payload
  )
  values (
    'marketplace_checkout_started',
    p_actor_id,
    p_request_id,
    jsonb_build_object('session_id', v_session.id, 'item_id', p_item_id)
  );

  return to_jsonb(v_session);
exception
  when unique_violation then
    select * into v_session
    from marketplace_checkout_sessions
    where org_id = p_org_id
      and idempotency_key = v_key;
    return to_jsonb(v_session);
end;
$$;

create or replace function mycominer.record_marketplace_charge(
  p_org_id text,
  p_session_id uuid,
  p_charge_id text,
  p_actor_id text,
  p_request_id text
)
returns jsonb
language plpgsql
security definer
set search_path = mycominer
as $$
declare
  v_session marketplace_checkout_sessions%rowtype;
begin
  update marketplace_checkout_sessions
  set status = 'charged',
      charge_id = p_charge_id,
      updated_at = timezone('utc', now())
  where id = p_session_id
    and org_id = p_org_id
    and status in ('pending', 'charged')
  returning * into v_session;

  if not found then
    raise exception 'checkout_session_not_found';
  end if;

  insert into orchestration_log (
    event_type,
    actor_id,
    request_id,
    payload
  )
  values (
    'marketplace_charge_recorded',
    p_actor_id,
    p_request_id,
    jsonb_build_object('session_id', v_session.id, 'charge_id', p_charge_id)
  );

  return to_jsonb(v_session);
end;
$$;

create or replace function mycominer.complete_marketplace_checkout(
  p_org_id text,
  p_session_id uuid,
  p_developer_id text,
  p_period timestamptz,
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
  v_session marketplace_checkout_sessions%rowtype;
  v_revenue marketplace_revenue%rowtype;
begin
  select * into v_session
  from marketplace_checkout_sessions
  where id = p_session_id
    and org_id = p_org_id;

  if not found then
    raise exception 'checkout_session_not_found';
  end if;

  if v_session.status = 'completed' and v_session.revenue_id is not null then
    select * into v_revenue from marketplace_revenue where id = v_session.revenue_id;
    return jsonb_build_object(
      'session', to_jsonb(v_session),
      'revenue', to_jsonb(v_revenue),
      'idempotent_replay', true
    );
  end if;

  if v_session.status not in ('charged', 'completed') or v_session.charge_id is null then
    raise exception 'checkout_not_charged';
  end if;

  insert into marketplace_revenue (
    item_id,
    org_id,
    developer_id,
    gross,
    fees,
    taxes,
    net,
    period,
    idempotency_key
  )
  values (
    v_session.item_id,
    v_session.org_id,
    p_developer_id,
    v_session.gross,
    v_session.fees,
    v_session.taxes,
    v_session.net,
    p_period,
    v_session.idempotency_key
  )
  returning * into v_revenue;

  update marketplace_checkout_sessions
  set status = 'completed',
      revenue_id = v_revenue.id,
      updated_at = timezone('utc', now())
  where id = v_session.id
  returning * into v_session;

  insert into orchestration_log (
    event_type,
    actor_id,
    request_id,
    payload
  )
  values (
    'marketplace_revenue_recorded',
    p_actor_id,
    p_request_id,
    coalesce(p_payload, '{}'::jsonb) || jsonb_build_object(
      'revenue_id', v_revenue.id,
      'session_id', v_session.id,
      'charge_id', v_session.charge_id
    )
  );

  return jsonb_build_object(
    'session', to_jsonb(v_session),
    'revenue', to_jsonb(v_revenue),
    'idempotent_replay', false
  );
exception
  when unique_violation then
    select * into v_revenue
    from marketplace_revenue
    where org_id = p_org_id
      and idempotency_key = v_session.idempotency_key;

    update marketplace_checkout_sessions
    set status = 'completed',
        revenue_id = v_revenue.id,
        updated_at = timezone('utc', now())
    where id = v_session.id
    returning * into v_session;

    return jsonb_build_object(
      'session', to_jsonb(v_session),
      'revenue', to_jsonb(v_revenue),
      'idempotent_replay', true
    );
end;
$$;

create or replace function mycominer.mark_checkout_needs_reconciliation(
  p_org_id text,
  p_session_id uuid,
  p_failure_reason text,
  p_actor_id text,
  p_request_id text
)
returns jsonb
language plpgsql
security definer
set search_path = mycominer
as $$
declare
  v_session marketplace_checkout_sessions%rowtype;
begin
  update marketplace_checkout_sessions
  set status = 'needs_reconciliation',
      failure_reason = p_failure_reason,
      updated_at = timezone('utc', now())
  where id = p_session_id
    and org_id = p_org_id
  returning * into v_session;

  if not found then
    raise exception 'checkout_session_not_found';
  end if;

  insert into orchestration_log (
    event_type,
    actor_id,
    request_id,
    payload
  )
  values (
    'marketplace_checkout_needs_reconciliation',
    p_actor_id,
    p_request_id,
    jsonb_build_object(
      'session_id', v_session.id,
      'charge_id', v_session.charge_id,
      'failure_reason', p_failure_reason
    )
  );

  return to_jsonb(v_session);
end;
$$;

revoke all on function mycominer.begin_marketplace_checkout(text, text, numeric, numeric, numeric, numeric, text, text, text) from public;
revoke all on function mycominer.record_marketplace_charge(text, uuid, text, text, text) from public;
revoke all on function mycominer.complete_marketplace_checkout(text, uuid, text, timestamptz, text, text, jsonb) from public;
revoke all on function mycominer.mark_checkout_needs_reconciliation(text, uuid, text, text, text) from public;

grant execute on function mycominer.begin_marketplace_checkout(text, text, numeric, numeric, numeric, numeric, text, text, text) to service_role;
grant execute on function mycominer.record_marketplace_charge(text, uuid, text, text, text) to service_role;
grant execute on function mycominer.complete_marketplace_checkout(text, uuid, text, timestamptz, text, text, jsonb) to service_role;
grant execute on function mycominer.mark_checkout_needs_reconciliation(text, uuid, text, text, text) to service_role;
