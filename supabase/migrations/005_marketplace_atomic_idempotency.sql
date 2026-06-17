-- P1: marketplace checkout atomicity + idempotency

alter table mycominer.marketplace_revenue
  add column if not exists idempotency_key text;

create unique index if not exists marketplace_revenue_org_idempotency_idx
  on mycominer.marketplace_revenue (org_id, idempotency_key)
  where idempotency_key is not null;

create or replace function mycominer.checkout_marketplace_with_log(
  p_org_id text,
  p_item_id text,
  p_developer_id text,
  p_gross numeric,
  p_fees numeric,
  p_taxes numeric,
  p_net numeric,
  p_period timestamptz,
  p_idempotency_key text,
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
  v_existing marketplace_revenue%rowtype;
  v_revenue marketplace_revenue%rowtype;
begin
  if p_idempotency_key is not null and length(trim(p_idempotency_key)) > 0 then
    select * into v_existing
    from marketplace_revenue
    where org_id = p_org_id
      and idempotency_key = p_idempotency_key;

    if found then
      return jsonb_build_object(
        'revenue', to_jsonb(v_existing),
        'idempotent_replay', true
      );
    end if;
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
    p_item_id,
    p_org_id,
    p_developer_id,
    p_gross,
    p_fees,
    p_taxes,
    p_net,
    p_period,
    nullif(trim(p_idempotency_key), '')
  )
  returning * into v_revenue;

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
    coalesce(p_payload, '{}'::jsonb) || jsonb_build_object('revenue_id', v_revenue.id)
  );

  return jsonb_build_object(
    'revenue', to_jsonb(v_revenue),
    'idempotent_replay', false
  );
exception
  when unique_violation then
    select * into v_existing
    from marketplace_revenue
    where org_id = p_org_id
      and idempotency_key = p_idempotency_key;

    if not found then
      raise;
    end if;

    return jsonb_build_object(
      'revenue', to_jsonb(v_existing),
      'idempotent_replay', true
    );
end;
$$;

revoke all on function mycominer.checkout_marketplace_with_log(
  text, text, text, numeric, numeric, numeric, numeric, timestamptz, text, text, text, jsonb
) from public;

grant execute on function mycominer.checkout_marketplace_with_log(
  text, text, text, numeric, numeric, numeric, numeric, timestamptz, text, text, text, jsonb
) to service_role;
