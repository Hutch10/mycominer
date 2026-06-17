# MycoMiner — Release Candidate

**Status:** Release Candidate  
**General Availability:** Deferred pending operational validation  
**Code freeze:** Active — no features, refactors, or architectural changes until GA prerequisites below are met and evidenced.

> **Architecture:** Product architecture is defined in [`docs/architecture/MUSHROOM_INTELLIGENCE_PLATFORM_MASTER_ARCHITECTURE_v1.0.md`](./docs/architecture/MUSHROOM_INTELLIGENCE_PLATFORM_MASTER_ARCHITECTURE_v1.0.md). This release document governs operational RC → GA gates only.

---

## Release Candidate baseline

| Item | Value |
|------|-------|
| **Commit SHA** | `1c751d0ef06d848740f217ff3e994ab70520cabb` |
| **Certification date** | 2026-06-16 |
| **Type-check** | PASS (0 errors) |
| **Automated tests** | PASS (35/35) |
| **Production build** | PASS |
| **Client secret scan** | PASS |

Tag and deploy from this commit unless a hotfix is required for a production incident.

---

## Code freeze policy

Do **not** merge until GA promotion:

- New product features
- Refactors unrelated to deployment blockers
- Architectural changes

**Allowed** during code freeze:

- Operational runbook updates
- Environment and deployment configuration
- Hotfixes for production incidents (with incident record)
- Evidence collection for GA checklist (burn-in, DR, Stripe/Upstash validation)

**GA promotion requires** (all evidenced):

1. Dedicated Supabase project provisioned and cut over
2. Production environment variables configured and validated
3. Stripe webhook integration verified in staging (test mode first)
4. Upstash distributed rate limiting verified across multiple instances
5. Documented 72-hour burn-in and disaster recovery exercise

---

## Required production environment variables

Set on the hosting platform (server-only secrets must never ship to client bundles).

| Variable | Required | Notes |
|----------|----------|-------|
| `NODE_ENV` | Yes | Must be `production` |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Dedicated MycoMiner project URL (not shared Rockhounding v1 at GA) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Publishable/anon key from Supabase dashboard |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server-only; used by persistence APIs |
| `UPSTASH_REDIS_REST_URL` | Yes | Distributed rate limiting (production fail-fast without this) |
| `UPSTASH_REDIS_REST_TOKEN` | Yes | Paired with Upstash URL |
| `STRIPE_SECRET_KEY` | Yes (staging+) | Use `sk_test_*` until go-live; `sk_live_*` only after GA sign-off |
| `STRIPE_WEBHOOK_SECRET` | Yes (staging+) | From Stripe dashboard; endpoint `/api/billing/stripe/webhook` |
| `MYCOMINER_DEV_AUTH_HEADERS` | Must be `0` or unset | Never `1` in production |

**Optional:**

| Variable | Purpose |
|----------|---------|
| `AGENT_RUNTIME_URL` | Agent runtime service URL |
| `LOG_LEVEL` | `info` (default), `warn`, `error`, `debug` |

**Deployment fingerprint (server-only, optional overrides):**

| Variable | Default | Purpose |
|----------|---------|---------|
| `MYCOMINER_GIT_COMMIT` | `VERCEL_GIT_COMMIT_SHA` if present | Exposed via admin fingerprint API |
| `MYCOMINER_BUILD_TIMESTAMP` | `VERCEL_DEPLOYMENT_CREATED_AT` if present | Build/deploy time |
| `MYCOMINER_MIGRATION_VERSION` | `007` | Latest applied migration |
| `MYCOMINER_RELEASE_CHANNEL` | `release-candidate` | e.g. `release-candidate`, `ga` |

**Validate before deploy:**

```bash
NODE_ENV=production node scripts/ga-validate-env.mjs
```

---

## Database migration sequence

Apply in order on a **dedicated** Supabase project. All objects live in the `mycominer` schema.

| Order | File | Purpose |
|------:|------|---------|
| 001 | `supabase/migrations/001_orchestration_persistence.sql` | Workflows, runs, orchestration log |
| 002 | `supabase/migrations/002_economy_billing.sql` | Billing, tokens, marketplace revenue |
| 003 | `supabase/migrations/003_p0_security_hardening.sql` | RLS, service-role policies |
| 004 | `supabase/migrations/004_workflow_org_isolation.sql` | Org-scoped workflows and RPCs |
| 005 | `supabase/migrations/005_marketplace_atomic_idempotency.sql` | Atomic checkout RPC, idempotency |
| 006 | `supabase/migrations/006_payment_checkout_integrity.sql` | Checkout sessions, charge/reconcile RPCs |

**Apply on clean database:**

```bash
export DATABASE_URL="postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres"
node scripts/verify-migrations.mjs
```

**Validate after apply:**

```bash
node scripts/ga-validate-db.mjs
```

**Expected checkout RPCs:** `begin_marketplace_checkout`, `record_marketplace_charge`, `complete_marketplace_checkout`, `mark_checkout_needs_reconciliation`

**Do not promote to GA on the shared Rockhounding v1 project** (`dcbjjvygjhmngwzuwdjj`). Provision a dedicated project first (pause/upgrade org if at free-tier project limit).

---

## Pre-deployment checklist

### Infrastructure

- [ ] Dedicated Supabase project created (e.g. **MycoMiner Prod**)
- [ ] Migrations `001`–`006` applied; `ga-validate-db.mjs` passes
- [ ] Row-count parity verified if migrating from source (see dedicated migration runbook)
- [ ] Upstash Redis database created; REST URL and token stored as secrets
- [ ] Stripe account in **test mode**; webhook registered to staging URL
- [ ] Hosting secrets set; `ga-validate-env.mjs` passes on production shell

### Application

- [ ] Deploy built from RC commit SHA (or documented hotfix)
- [ ] `MYCOMINER_DEV_AUTH_HEADERS` is not enabled
- [ ] `npm run type-check` && `npm test` && `npm run build` pass in CI
- [ ] `node scripts/scan-client-secrets.mjs` passes on build output

### Operational readiness (required before GA, recommended before production traffic)

- [ ] Staging smoke tests completed (see below)
- [ ] Stripe test-mode E2E including webhook retry
- [ ] Rate limits verified across ≥2 app instances
- [ ] 72-hour burn-in metrics recorded
- [ ] Backup and restore drill completed; RPO/RTO documented

---

## Post-deployment smoke tests

### Automated (run from repo)

```bash
npm run type-check
npm test
npm run build
node scripts/scan-client-secrets.mjs
```

### Live API (authenticated; staging first)

Use a valid Supabase JWT with `app_metadata.org_id` set, or staging test credentials.

| Test | Method | Endpoint | Expect |
|------|--------|----------|--------|
| Workflow create | POST | `/api/workflows/create` | 200; workflow scoped to org |
| Workflow execute | POST | `/api/workflows/execute` | 200 or expected business error |
| Marketplace checkout | POST | `/api/marketplace/checkout` | 200; requires `Idempotency-Key` header |
| Token purchase | POST | `/api/billing/purchase-tokens` | 200; requires `Idempotency-Key` header |
| Rate limit | POST | Any mutation route (×21 strict) | 429 with `Retry-After` after tier exceeded |
| Stripe webhook | POST | `/api/billing/stripe/webhook` | 200 with valid Stripe signature |
| Deployment fingerprint | GET | `/api/admin/deployment-fingerprint` | 200 for platform admin; returns commit, build time, migration version |

**Admin fingerprint** requires JWT with `app_metadata.role = "admin"` (or `platform_admin: true`, or `roles` containing `admin`). Development: `X-MycoMiner-Admin: 1` with dev auth headers.

Example response:

```json
{
  "git_commit": "1c751d0ef06d848740f217ff3e994ab70520cabb",
  "build_timestamp": "2026-06-16T00:00:00.000Z",
  "migration_version": "006",
  "release_channel": "release-candidate",
  "environment": "production"
}
```

### Database verification

```sql
-- No placeholder tenants
SELECT count(*) FROM mycominer.workflows WHERE org_id = 'legacy-unassigned';

-- Reconciliation queue empty or triaged
SELECT id, org_id, charge_id, failure_reason
FROM mycominer.marketplace_checkout_sessions
WHERE status = 'needs_reconciliation';

-- Recent audit events present after smoke tests
SELECT event_type, count(*) FROM mycominer.orchestration_log
WHERE created_at > now() - interval '1 hour'
GROUP BY event_type;
```

---

## Rollback procedure

### Application rollback

1. Revert hosting deployment to previous known-good release (RC commit or last stable).
2. Confirm `ga-validate-env.mjs` still passes on reverted environment.
3. Re-run automated smoke tests (`npm test`, secret scan).

### Database rollback

1. **Prefer:** Restore from Supabase platform backup or logical `pg_dump` taken before deploy.
2. **If dual-write window occurred:** Reconcile `marketplace_checkout_sessions` where `status = 'needs_reconciliation'`.
3. **If env pointed at wrong project:** Restore previous `NEXT_PUBLIC_SUPABASE_*` and `SUPABASE_SERVICE_ROLE_KEY`; redeploy.

### Stripe rollback

1. Disable or repoint webhook in Stripe dashboard.
2. Revoke/rotate `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` if compromised.
3. Audit `orchestration_log` for `tokens_purchase_*` and `marketplace_*` events during incident window.

### When to rollback

- Persistence APIs return 503 (`requirePersistenceBackend` failures)
- Elevated `needs_reconciliation` checkout sessions after deploy
- Auth bypass or cross-org access detected
- Rate limiting ineffective (abuse sustained above tier)

---

## Runbook references

| Document | Path |
|----------|------|
| Dedicated Supabase migration | [`docs/operations/dedicated-supabase-migration.md`](docs/operations/dedicated-supabase-migration.md) |
| Backup and disaster recovery | [`docs/operations/backup-disaster-recovery.md`](docs/operations/backup-disaster-recovery.md) |
| GA certification report | [`docs/operations/ga-certification-report.md`](docs/operations/ga-certification-report.md) |
| GA cutover execution log | [`docs/operations/ga-cutover-execution-log.md`](docs/operations/ga-cutover-execution-log.md) |
| **GA evidence package** | [`docs/operations/ga-evidence-package.md`](docs/operations/ga-evidence-package.md) |

### Validation scripts

| Script | Purpose |
|--------|---------|
| `scripts/verify-migrations.mjs` | Apply `001`–`006` on clean Postgres |
| `scripts/ga-validate-db.mjs` | Schema, RPCs, orphans, row counts |
| `scripts/ga-validate-env.mjs` | Production secret presence and format |
| `scripts/scan-client-secrets.mjs` | Ensure server secrets not in client bundles |

---

## Emergency contacts

> **Operator action:** Replace placeholders before first production deploy.

| Role | Contact | Escalation |
|------|---------|------------|
| On-call engineering | _[name / pager / Slack]_ | Primary incident response |
| Supabase admin | _[org owner]_ | Backup restore, project pause/upgrade |
| Stripe admin | _[billing owner]_ | Webhook, charge disputes, key rotation |
| Upstash admin | _[platform owner]_ | Rate-limit / Redis outages |

---

## Certification summary

| Designation | Status |
|-------------|--------|
| **Release Candidate** | Active — software ready pending ops |
| **General Availability** | Deferred until infrastructure and deployment prerequisites are completed and independently verified |

There is no technical justification to downgrade the software. There is no operational justification to promote to GA until the checklist above is complete and evidenced.
