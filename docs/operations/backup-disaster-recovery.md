# MycoMiner Backup and Disaster Recovery Runbook

## Scope

This runbook covers the Supabase-hosted `mycominer` schema (workflows, workflow runs, orchestration audit log, marketplace revenue, billing tables) used by MycoMiner persistence APIs.

## Recovery Objectives

| Metric | Target | Notes |
|--------|--------|-------|
| **RPO** (Recovery Point Objective) | 24 hours | Supabase Pro daily backups; point-in-time recovery (PITR) available on paid plans |
| **RTO** (Recovery Time Objective) | 4 hours | Includes restore, migration verification, and smoke tests |

## Prerequisites

- Supabase project access (owner or admin)
- `SUPABASE_SERVICE_ROLE_KEY` and project reference ID
- Local copy of migrations in `supabase/migrations/`
- CI secret-scan and persistence security tests passing

---

## 1. Backup Procedure

### 1.1 Automated platform backups (primary)

Supabase performs automated daily backups for paid projects. Verify in the Supabase Dashboard:

1. Open **Project Settings → Database → Backups**
2. Confirm daily backups are enabled
3. Note the retention window and whether PITR is enabled

### 1.2 Logical export (secondary, recommended before major releases)

Export the `mycominer` schema using `pg_dump` against the connection pooler:

```bash
pg_dump "postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres" \
  --schema=mycominer \
  --no-owner \
  --no-privileges \
  -f "mycominer-backup-$(date +%Y%m%d).sql"
```

Store the dump in encrypted object storage (S3, GCS, or Azure Blob) with:

- Versioning enabled
- 90-day retention minimum
- Access limited to ops/admin roles

### 1.3 Configuration backup

Export and store separately (never in client bundles):

- Environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, Stripe keys)
- Migration history (`supabase/migrations/*.sql`)
- RLS policies and RPC definitions (included in migrations)

### 1.4 Backup schedule

| Action | Frequency | Owner |
|--------|-----------|-------|
| Verify Supabase automated backups | Weekly | Ops |
| Logical `pg_dump` of `mycominer` | Before each Closed Beta / production promotion | Engineering |
| Config snapshot | On env change | Engineering |

---

## 2. Restore Procedure

### 2.1 Assess incident

1. Identify failure mode: data corruption, accidental delete, region outage, or bad migration
2. Record incident time (UTC) — this defines the PITR target if used
3. Halt write traffic: disable affected API routes or pause deployments

### 2.2 Restore from Supabase backup (platform)

1. Dashboard → **Database → Backups**
2. Select backup closest to (but before) incident time
3. Initiate restore to a **new** project or branch when possible (avoid overwriting production in-place without approval)
4. Update `NEXT_PUBLIC_SUPABASE_URL` and keys if project ref changes

### 2.3 Restore from logical dump

```bash
psql "postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres" \
  -c "DROP SCHEMA IF EXISTS mycominer CASCADE;"

psql "postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres" \
  -f mycominer-backup-YYYYMMDD.sql
```

Re-apply any migrations newer than the dump:

```bash
# Apply via Supabase CLI or Dashboard SQL editor
# Files: supabase/migrations/00*.sql in order
```

### 2.4 Post-restore application steps

1. Redeploy application with correct env vars
2. Run restore verification checklist (Section 3)
3. Re-enable traffic gradually
4. Document root cause and timeline

---

## 3. Restore Verification Checklist

Run after every restore (staging first, then production).

### 3.1 Schema integrity

- [ ] `mycominer.workflows` has `org_id` column (NOT NULL)
- [ ] `mycominer.workflow_runs` has `org_id` column (NOT NULL)
- [ ] `mycominer.marketplace_revenue` has `idempotency_key` column
- [ ] `mycominer.marketplace_checkout_sessions` table exists
- [ ] `mycominer.token_purchase_idempotency` table exists
- [ ] Workflow RPCs: `create_workflow_with_log`, `schedule_run_with_log`, `cancel_run_with_log`
- [ ] Marketplace checkout RPCs: `begin_marketplace_checkout`, `record_marketplace_charge`, `complete_marketplace_checkout`, `mark_checkout_needs_reconciliation`
- [ ] Token purchase RPCs: `get_token_purchase_replay`, `save_token_purchase_replay`
- [ ] Legacy RPC (optional): `checkout_marketplace_with_log` from migration `005`
- [ ] `orchestration_log` UPDATE/DELETE revoked (append-only)

### 3.2 Data sanity

- [ ] Row counts within expected range (compare to pre-incident metrics)
- [ ] No workflows with null `org_id`
- [ ] Legacy rows tagged `legacy-unassigned` are documented if present

### 3.3 Application smoke tests

```bash
npm test
npm run type-check
npm run build
node scripts/scan-client-secrets.mjs
```

### 3.4 API verification (authenticated)

- [ ] `POST /api/workflows/create` — creates workflow scoped to JWT org
- [ ] `GET /api/workflows/[id]` — returns 404 for cross-org workflow ID
- [ ] `POST /api/workflows/execute` — schedules run only for own-org workflow
- [ ] `POST /api/marketplace/checkout` with `Idempotency-Key` — replays without duplicate revenue
- [ ] `POST /api/billing/purchase-tokens` with `Idempotency-Key` — replays without duplicate charge/mint

### 3.5 Security

- [ ] Production build does not contain `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Unauthenticated requests return 401
- [ ] Cross-org `orgId` in body returns 403

### 3.6 Sign-off

| Role | Name | Date | Result |
|------|------|------|--------|
| Engineering | | | |
| Ops | | | |

---

## 4. Escalation

1. **SEV-2** (partial data loss): Initiate restore within 1 hour; target RTO 4 hours
2. **SEV-1** (full persistence outage): Fail-fast responses active; communicate status page update
3. Contact Supabase support for PITR or backup corruption issues

---

## 5. Revision History

| Version | Date | Change |
|---------|------|--------|
| 1.1 | 2026-06-17 | Added migration `007` token purchase idempotency RPCs |
