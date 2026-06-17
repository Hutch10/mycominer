# GA Operational Evidence Package

**Purpose:** Auditable evidence for Release Candidate → General Availability review.  
**Governance:** Exception-only code freeze; no feature work.  
**Authoritative runbooks:** [`RELEASE.md`](../../RELEASE.md), [`ga-cutover-execution-log.md`](./ga-cutover-execution-log.md)

---

## Readiness classification

| Classification | Criteria |
|----------------|----------|
| **Release Candidate** | Engineering complete; operational gates incomplete |
| **GA Blocked** | Critical infrastructure blocker (e.g. cannot provision DB) |
| **GA Ready Pending Review** | All five gates evidenced; awaiting sign-off |
| **General Availability** | All gates evidenced + independent review approved |

### Current classification (update when evidence changes)

| Field | Value |
|-------|-------|
| **Classification** | **GA Blocked** |
| **Also valid label** | Release Candidate (engineering) |
| **Date** | 2026-06-17 |
| **Commit SHA** | `1c751d0ef06d848740f217ff3e994ab70520cabb` |
| **Recommendation** | **Do not award GA** — operational evidence incomplete |

**Primary blocker:** Dedicated Supabase production project not provisioned (org free-tier 2-project limit).

---

## Evidence inventory

### Gate 1 — Dedicated production infrastructure readiness

| Evidence item | Status | Location / notes |
|---------------|--------|----------------|
| Dedicated Supabase project exists | ❌ MISSING | `create_project` blocked 2026-06-16 |
| Migrations `001`–`006` in repo | ✅ AVAILABLE | `supabase/migrations/` |
| Clean DB migration apply script | ✅ AVAILABLE | `scripts/verify-migrations.mjs` |
| DB validation script | ✅ AVAILABLE | `scripts/ga-validate-db.mjs` |
| Source DB: checkout RPCs (4/4) | ✅ VERIFIED | Rockhounding v1 — 2026-06-16 |
| Source DB: `marketplace_checkout_sessions` | ✅ VERIFIED | Table exists |
| Target DB: parity row counts | ❌ MISSING | No dedicated project |
| Dedicated migration runbook | ✅ AVAILABLE | `dedicated-supabase-migration.md` |
| Cutover execution log | ✅ AVAILABLE | `ga-cutover-execution-log.md` |

### Gate 2 — Production environment variable validation

| Evidence item | Status | Location / notes |
|---------------|--------|----------------|
| Env checklist documented | ✅ AVAILABLE | `RELEASE.md` |
| Env validation script | ✅ AVAILABLE | `scripts/ga-validate-env.mjs` |
| `ga:validate-env` npm script | ✅ AVAILABLE | `package.json` |
| Production shell validation run | ❌ MISSING | Requires hosting access |
| `MYCOMINER_DEV_AUTH_HEADERS` ≠ `1` in prod | ❌ MISSING | Not inspected |

### Gate 3 — Production secret safety verification

| Evidence item | Status | Location / notes |
|---------------|--------|----------------|
| Client bundle secret scan script | ✅ AVAILABLE | `scripts/scan-client-secrets.mjs` |
| CI secret scan step | ✅ AVAILABLE | `.github/workflows/ci.yml` |
| Latest local scan result | ✅ PASS | 83 files scanned — 2026-06-17 |
| Production build artifact scan | ❌ MISSING | Run on staging/prod deploy output |
| Service role not in client bundles | ✅ PASS | Local build scan |

### Gate 4 — Distributed rate-limit validation

| Evidence item | Status | Location / notes |
|---------------|--------|----------------|
| Upstash implementation | ✅ AVAILABLE | `app/lib/auth/distributedRateLimit.ts` |
| Production fail-fast without Upstash | ✅ AVAILABLE | `requirePersistenceBackend()` + tests |
| Unit tests (Retry-After, tiers) | ✅ AVAILABLE | `tests/persistence-security.test.ts` |
| Multi-instance global enforcement | ❌ MISSING | Requires Upstash + ≥2 instances |
| Counters survive restart | ❌ MISSING | Operational test on Upstash |
| Live 429 after strict tier | ❌ MISSING | Staging API test |

### Gate 5 — Burn-in and disaster recovery evidence

| Evidence item | Status | Location / notes |
|---------------|--------|----------------|
| DR runbook | ✅ AVAILABLE | `backup-disaster-recovery.md` |
| 72-hour burn-in metrics | ❌ MISSING | Not started |
| Backup creation record | ❌ MISSING | Not executed |
| Restore drill record | ❌ MISSING | Not executed |
| RPO/RTO achieved | ❌ MISSING | Targets: 24h / 4h |
| Staging live API smoke tests | ❌ MISSING | Documented in `RELEASE.md` |

### Engineering baseline (supports gates, not sufficient alone)

| Evidence item | Status | Last verified |
|---------------|--------|---------------|
| Type-check (0 errors) | ✅ PASS | 2026-06-17 |
| Automated tests | ✅ PASS (35/35) | 2026-06-17 |
| Production build | ✅ PASS | 2026-06-17 |
| Deployment fingerprint endpoint | ✅ AVAILABLE | `GET /api/admin/deployment-fingerprint` |
| Fingerprint unit tests | ✅ PASS | `tests/deployment-fingerprint.test.ts` |
| Stripe stub operational tests | ✅ PASS | `tests/ga-operational.test.ts` |

### Stripe / webhook (subset of gates 2–5)

| Evidence item | Status |
|---------------|--------|
| Stripe adapter (test/live gated) | ✅ Code complete |
| Webhook route | ✅ `/api/billing/stripe/webhook` |
| `STRIPE_SECRET_KEY` configured | ❌ MISSING |
| `STRIPE_WEBHOOK_SECRET` configured | ❌ MISSING |
| Test-mode E2E checkout | ❌ MISSING |
| Webhook retry / reconciliation live | ❌ MISSING |

---

## Operator command package

### A. Local engineering verification (no secrets required)

```bash
# Single orchestrated run
npm run ga:verify-local

# Or step by step
npm run type-check
npm test
npm run build
npm run scan-secrets
```

### B. Database verification (requires `DATABASE_URL` + `psql`)

```bash
# Apply migrations 001–006 on clean Postgres (new dedicated project)
export DATABASE_URL="postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres"
node scripts/verify-migrations.mjs

# Validate schema, RPCs, orphans, row counts
node scripts/ga-validate-db.mjs
```

### C. Production environment validation (run on hosting shell)

```bash
export NODE_ENV=production
# Set all required secrets on platform first — see RELEASE.md
npm run ga:validate-env
```

### D. Deployment fingerprint (live staging/production)

```bash
# Platform admin JWT required
curl -s -H "Authorization: Bearer <admin-jwt>" \
  https://<staging-host>/api/admin/deployment-fingerprint | jq
```

Expected fields: `git_commit`, `build_timestamp`, `migration_version`, `release_channel`, `environment`.

### E. Stripe webhook (staging)

```bash
# Stripe CLI — after webhook registered to staging URL
stripe listen --forward-to https://<staging-host>/api/billing/stripe/webhook
stripe trigger payment_intent.succeeded
```

Record HTTP 200 and corresponding `orchestration_log` / reconciliation entries.

### F. Distributed rate limiting (multi-instance)

1. Deploy ≥2 instances with `UPSTASH_REDIS_*` set.
2. Send >20 POST requests/min to `/api/marketplace/checkout` (strict tier) from same user.
3. Record `429` with `Retry-After` header.
4. Restart one instance; confirm limit still enforced (shared Redis counter).

### G. Burn-in (72 hours)

Record in section below: error rate, p95 latency, DB latency, Redis latency, webhook success rate, audit completeness.

### H. Disaster recovery drill

Follow `backup-disaster-recovery.md`. Record backup time, restore time, post-restore smoke results, RPO/RTO.

---

## Evidence record (fill as operations complete)

### Build & commit

| Field | Value |
|-------|-------|
| Commit SHA | `1c751d0ef06d848740f217ff3e994ab70520cabb` |
| Build timestamp | _[from CI or fingerprint endpoint]_ |
| Release channel | `release-candidate` |
| Migration version | `006` |
| Verified by | _[operator name]_ |
| Verified at (UTC) | _[ISO timestamp]_ |

### Test results

| Command | Result | Date | Log reference |
|---------|--------|------|---------------|
| `npm run type-check` | PASS (0 errors) | 2026-06-17 | local run |
| `npm test` | PASS (35/35) | 2026-06-17 | local run |
| `npm run build` | PASS | 2026-06-17 | local run |
| `npm run scan-secrets` | PASS (83 files) | 2026-06-17 | local run |

### Migration status

| Item | Status | Evidence |
|------|--------|----------|
| Repo migrations `001`–`006` | ✅ Present | `supabase/migrations/` |
| Dedicated project migrations applied | ❌ | _[paste `verify-migrations.mjs` output]_ |
| `ga-validate-db.mjs` on target | ❌ | _[paste output]_ |
| Source vs target row parity | ❌ | _[SQL counts]_ |

### Environment validation

| Variable | Verified | Date | Notes |
|----------|----------|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | ❌ | | |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ❌ | | |
| `SUPABASE_SERVICE_ROLE_KEY` | ❌ | | |
| `UPSTASH_REDIS_REST_URL` | ❌ | | |
| `UPSTASH_REDIS_REST_TOKEN` | ❌ | | |
| `STRIPE_SECRET_KEY` | ❌ | | |
| `STRIPE_WEBHOOK_SECRET` | ❌ | | |
| `MYCOMINER_DEV_AUTH_HEADERS` | ❌ | | Must not be `1` |

`ga:validate-env` output: _[attach or paste]_

### Stripe / webhook validation

| Test | Result | Date | Notes |
|------|--------|------|-------|
| Test-mode checkout E2E | ❌ | | |
| Failed payment handling | ❌ | | |
| Idempotent replay | ✅ (unit) | 2026-06-17 | `ga-operational.test.ts` |
| Webhook signature verification | ❌ | | |
| Webhook retry | ❌ | | |
| Reconciliation via webhook | ❌ | | |

### Distributed rate limiting validation

| Test | Result | Date | Notes |
|------|--------|------|-------|
| Upstash configured in production | ❌ | | |
| Global limit across 2+ instances | ❌ | | |
| Counter survives instance restart | ❌ | | |
| `Retry-After` on 429 | ✅ (unit) | | |
| Checkout strict tier + idempotency | ✅ (code) | | |

### Burn-in results (72-hour)

| Metric | Target | Observed | Period |
|--------|--------|----------|--------|
| Error rate | < 0.1% | — | |
| API latency p95 | < 500 ms | — | |
| Database latency | < 100 ms | — | |
| Redis latency | < 50 ms | — | |
| Webhook success rate | > 99% | — | |
| Audit completeness | 100% mutations | — | |

### Disaster recovery drill

| Step | Result | Date | Notes |
|------|--------|------|-------|
| Backup created | ❌ | | |
| Restore completed | ❌ | | |
| Post-restore auth | ❌ | | |
| Post-restore workflow | ❌ | | |
| Post-restore checkout | ❌ | | |
| **RPO achieved** | — | | target 24 h |
| **RTO achieved** | — | | target 4 h |

### Deployment fingerprint (live)

```json
{
  "git_commit": "",
  "build_timestamp": "",
  "migration_version": "",
  "release_channel": "",
  "environment": ""
}
```

_Paste response from staging/production after deploy._

---

## GA gate summary

| # | Gate | Status |
|---|------|--------|
| 1 | Dedicated production infrastructure | ❌ BLOCKED |
| 2 | Production environment validation | ❌ MISSING |
| 3 | Production secret safety | ⚠️ PARTIAL (local scan only) |
| 4 | Distributed rate-limit validation | ❌ MISSING (live) |
| 5 | Burn-in & DR evidence | ❌ MISSING |

**Gates passed:** 0 / 5 (live operational)  
**Engineering baseline:** Complete

---

## Final certification recommendation

| Designation | Status |
|-------------|--------|
| **Release Candidate** | ✅ Maintained |
| **GA Blocked** | ✅ Active (infrastructure + ops evidence) |
| **GA Ready Pending Review** | ❌ Not met |
| **General Availability** | ❌ **Not awarded** |

### Sign-off

| Role | Name | Date | Decision |
|------|------|------|----------|
| Engineering | _[closed]_ | 2026-06-16 | RC certified |
| Operations | _[pending]_ | | |
| Security | _[pending]_ | | |
| Final GA approver | _[pending]_ | | |

---

## Next operator actions (ordered)

1. **Unblock Supabase:** Pause unused project or upgrade org → create **MycoMiner Prod**.
2. **Migrate:** `DATABASE_URL=... node scripts/verify-migrations.mjs` → `npm run ga:validate-db`.
3. **Configure secrets** on staging → `NODE_ENV=production npm run ga:validate-env`.
4. **Deploy staging** → fingerprint curl → live API smoke tests (`RELEASE.md`).
5. **Stripe:** Register webhook → test-mode E2E + retry.
6. **Upstash:** Verify rate limits across ≥2 instances.
7. **Burn-in:** 72 hours → record metrics in this document.
8. **DR drill:** Execute → record RPO/RTO.
9. **Re-classify** as **GA Ready Pending Review** and schedule final certification.

---

## Document history

| Date | Change | Author |
|------|--------|--------|
| 2026-06-17 | Initial evidence package; inventory + command package | Operations |
