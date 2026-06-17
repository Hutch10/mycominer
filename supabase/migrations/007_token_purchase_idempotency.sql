-- Closed Beta: durable token purchase idempotency (multi-instance safe replay)

create table if not exists mycominer.token_purchase_idempotency (
  org_id text not null,
  idempotency_key text not null,
  response_json jsonb not null,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (org_id, idempotency_key)
);

create index if not exists token_purchase_idempotency_created_at_idx
  on mycominer.token_purchase_idempotency (created_at desc);

alter table mycominer.token_purchase_idempotency enable row level security;

create policy "service_role_all_token_purchase_idempotency"
  on mycominer.token_purchase_idempotency for all to service_role using (true) with check (true);

grant all on mycominer.token_purchase_idempotency to service_role;

create or replace function mycominer.get_token_purchase_replay(
  p_org_id text,
  p_idempotency_key text
)
returns jsonb
language plpgsql
security definer
set search_path = mycominer
as $$
declare
  v_key text := nullif(trim(p_idempotency_key), '');
  v_response jsonb;
begin
  if v_key is null then
    raise exception 'idempotency_key_required';
  end if;

  select response_json into v_response
  from token_purchase_idempotency
  where org_id = p_org_id
    and idempotency_key = v_key;

  return v_response;
end;
$$;

create or replace function mycominer.save_token_purchase_replay(
  p_org_id text,
  p_idempotency_key text,
  p_response_json jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = mycominer
as $$
declare
  v_key text := nullif(trim(p_idempotency_key), '');
  v_response jsonb;
begin
  if v_key is null then
    raise exception 'idempotency_key_required';
  end if;

  insert into token_purchase_idempotency (org_id, idempotency_key, response_json)
  values (p_org_id, v_key, p_response_json)
  on conflict (org_id, idempotency_key) do nothing;

  select response_json into v_response
  from token_purchase_idempotency
  where org_id = p_org_id
    and idempotency_key = v_key;

  return v_response;
end;
$$;

grant execute on function mycominer.get_token_purchase_replay(text, text) to service_role;
grant execute on function mycominer.save_token_purchase_replay(text, text, jsonb) to service_role;
