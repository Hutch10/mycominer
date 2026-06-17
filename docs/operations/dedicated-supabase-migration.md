# Dedicated Supabase Project Migration Runbook

MycoMiner currently shares Supabase project **Rockhounding v1** (`dcbjjvygjhmngwzuwdjj`) with schema isolation via `mycominer`. Before General Availability, provision a **dedicated** Supabase project.

## Prerequisites

- [ ] New Supabase project created (recommended name: `mycominer-prod`)
- [ ] Supabase CLI installed (`npx supabase --version`)
- [ ] Maintenance window scheduled (read-only mode optional)
- [ ] Backup of current `mycominer` schema verified

## Environment Variable Checklist

### Source (shared project — retire after cutover)

| Variable | Notes |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://dcbjjvygjhmngwzuwdjj.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Publishable/anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only; rotate after migration |

### Target (dedicated project)

| Variable | Required | Notes |
|----------|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | New project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | New anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | New service role (Vercel/hosting secret only) |
| `UPSTASH_REDIS_REST_URL` | Yes (prod) | Distributed rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | Yes (prod) | Distributed rate limiting |
| `STRIPE_SECRET_KEY` | Optional | `sk_test_*` until go-live; `sk_live_*` for production charges |
| `STRIPE_WEBHOOK_SECRET` | Optional | Webhook signing secret from Stripe dashboard |
| `MYCOMINER_DEV_AUTH_HEADERS` | **Must be `0` or unset** | Never `1` in production |

## Pre-Migration Verification Queries (source)

Run against source project before export:

```sql
-- Row counts by table
SELECT 'workflows' AS tbl, count(*) FROM mycominer.workflows
UNION ALL SELECT 'workflow_runs', count(*) FROM mycominer.workflow_runs
UNION ALL SELECT 'marketplace_revenue', count(*) FROM mycominer.marketplace_revenue
UNION ALL SELECT 'marketplace_checkout_sessions', count(*) FROM mycominer.marketplace_checkout_sessions
UNION ALL SELECT 'orchestration_log', count(*) FROM mycominer.orchestration_log;

-- No placeholder tenants
SELECT count(*) AS legacy_unassigned
FROM mycominer.workflows
WHERE org_id = 'legacy-unassigned';

-- Checkout RPCs present
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'mycominer'
  AND routine_name IN (
    'begin_marketplace_checkout',
    'record_marketplace_charge',
    'complete_marketplace_checkout',
    'mark_checkout_needs_reconciliation'
  );
```

## Migration Steps

### 1. Provision target project

1. Create project in [Supabase Dashboard](https://supabase.com/dashboard).
2. Enable `uuid-ossp` if not already enabled.
3. Record new project ref and API keys.

### 2. Apply schema (clean database)

```bash
export DATABASE_URL="postgresql://postgres:<password>@db.<new-ref>.supabase.co:5432/postgres"
node scripts/verify-migrations.mjs
```

Confirms migrations `001`–`006` apply in order on empty schema.

### 3. Data export / import (when ready)

```bash
# Export source schema data only
pg_dump "$SOURCE_DATABASE_URL" \
  --schema=mycominer \
  --data-only \
  --no-owner \
  -f mycominer_data.sql

# Import to target (after verify-migrations)
psql "$TARGET_DATABASE_URL" -v ON_ERROR_STOP=1 -f mycominer_data.sql
```

### 4. Update application secrets

1. Set new env vars in Vercel/hosting (staging first).
2. Deploy application build.
3. Run post-migration smoke tests (below).

### 5. Cutover

1. Put source app in maintenance mode (optional).
2. Final incremental export if needed.
3. Switch DNS/env to target project.
4. Smoke test.
5. Decommission source credentials (rotate service role on shared project).

## Post-Migration Smoke Test

```bash
npm run type-check
npm test
npm run build
node scripts/scan-client-secrets.mjs
```

Manual API checks (authenticated):

- [ ] `POST /api/workflows/create` — creates workflow scoped to org
- [ ] `POST /api/marketplace/checkout` with `Idempotency-Key` — session + revenue
- [ ] `POST /api/billing/purchase-tokens` with `Idempotency-Key`
- [ ] Audit events visible in `mycominer.orchestration_log`
- [ ] Rate limit returns `429` after tier threshold (distributed)

## Rollback Plan

1. Revert hosting env vars to source project URL/keys.
2. Redeploy previous application revision.
3. If data was written to target only, replay from `orchestration_log` or restore source backup.
4. Document any dual-write window and reconcile `marketplace_checkout_sessions` with `status = 'needs_reconciliation'`.

```sql
SELECT id, org_id, charge_id, failure_reason, updated_at
FROM mycominer.marketplace_checkout_sessions
WHERE status = 'needs_reconciliation'
ORDER BY updated_at DESC;
```

## Success Criteria

- [ ] All migrations applied on dedicated project
- [ ] Row counts match source (± in-flight transactions)
- [ ] Zero `legacy-unassigned` org rows
- [ ] Production has no `MYCOMINER_DEV_AUTH_HEADERS=1`
- [ ] Secret scan passes on production build
- [ ] Stripe webhooks point to `/api/billing/stripe/webhook` on production URL
