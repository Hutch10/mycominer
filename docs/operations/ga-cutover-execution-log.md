# GA Cutover Execution Log — 2026-06-16

**Commit:** `1c751d0ef06d848740f217ff3e994ab70520cabb`  
**Final recommendation:** **Release Candidate**

---

## Checklist execution summary

| # | Step | Status | Evidence / blocker |
|---|------|--------|-------------------|
| 1 | Provision dedicated Supabase project | **BLOCKED** | Supabase API: org admin at **2 active free-project limit**. `create_project` for "MycoMiner Prod" rejected. Active: Rockhounding v1, Rollin Eats and Treats. |
| 2 | Schema migration + parity validation | **PARTIAL** | Source (`dcbjjvygjhmngwzuwdjj`) fully migrated. Target project does not exist. `verify-migrations.mjs` / `ga-validate-db.mjs` ready; not run on dedicated DB. |
| 3 | Configure production environment variables | **NOT EXECUTED** | No hosting linkage in repo (no `.vercel/project.json`). `ga-validate-env.mjs` not run against production shell. |
| 4 | Upstash distributed rate limiting | **NOT VERIFIED** | Code enforces Upstash in production (`requirePersistenceBackend`). No `UPSTASH_REDIS_*` credentials available in this environment. |
| 5 | Stripe test mode + webhook | **NOT VERIFIED** | Adapter + `/api/billing/stripe/webhook` implemented. No `STRIPE_*` secrets; webhook not registered in Stripe dashboard. |
| 6 | Staging smoke tests | **PARTIAL** | Automated: 29/29 unit tests. Live staging API smoke tests not executed (no deployed staging URL + auth). |
| 7 | 72-hour burn-in | **NOT EXECUTED** | Requires deployed staging/production with telemetry. |
| 8 | Backup / restore drill | **NOT EXECUTED** | Runbook exists; no restore exercise performed. |
| 9 | Final GA certification report | **COMPLETE** | This document + [`ga-certification-report.md`](./ga-certification-report.md) |

---

## Step 1 — Dedicated Supabase provisioning (blocked)

**Attempted:**

```
create_project(name="MycoMiner Prod", region=us-west-1, org=zrzohlnpchffxzrmiovn)
```

**Result:**

> The following organization members have reached their maximum limits for the number of active free projects… Hutch10 (2 project limit).

**Remediation (operator action required — pick one):**

1. **Pause** an unused active project, then create `MycoMiner Prod`.
2. **Upgrade** Supabase org plan to allow additional active projects.
3. **Repurpose** an `INACTIVE` project (e.g. Nova Studio `hexzaduzzqpluixwfgdh`) — apply `001`–`006` only after confirming no conflicting schema.

**Cost confirmed:** $0/month (free tier) before rejection.

---

## Step 2 — Migration verification (source baseline)

### Source project: Rockhounding v1 (`dcbjjvygjhmngwzuwdjj`)

**Tables (8):** `workflows`, `workflow_runs`, `orchestration_log`, `marketplace_revenue`, `marketplace_checkout_sessions`, `invoices`, `license_tokens`, `reward_tokens`

**Checkout RPCs (4/4):**

- `begin_marketplace_checkout`
- `record_marketplace_charge`
- `complete_marketplace_checkout`
- `mark_checkout_needs_reconciliation`

**Additional RPCs present:** `checkout_marketplace_with_log`, `create_workflow_with_log`

**Row counts (parity baseline — all zero pre-launch):**

| Table | Count |
|-------|------:|
| workflows | 0 |
| workflow_runs | 0 |
| marketplace_revenue | 0 |
| marketplace_checkout_sessions | 0 |
| orchestration_log | 0 |

**Integrity:** `legacy-unassigned` = 0; orphaned completed checkout sessions = 0.

**Repo migrations:** `supabase/migrations/001` through `006` (6 files).

**Target parity:** **NOT VERIFIED** — no dedicated project to compare.

---

## Step 3 — Environment verification

| Variable | Production verified |
|----------|-------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ❌ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ❌ |
| `SUPABASE_SERVICE_ROLE_KEY` | ❌ |
| `UPSTASH_REDIS_REST_URL` | ❌ |
| `UPSTASH_REDIS_REST_TOKEN` | ❌ |
| `STRIPE_SECRET_KEY` | ❌ |
| `STRIPE_WEBHOOK_SECRET` | ❌ |
| `MYCOMINER_DEV_AUTH_HEADERS` ≠ `1` | ❌ (hosting not inspected) |

**Validator:** `NODE_ENV=production node scripts/ga-validate-env.mjs`

---

## Step 4 — Redis / rate-limit verification

| Check | Result |
|-------|--------|
| Implementation (Upstash sliding window) | ✅ Code complete |
| Production fail-fast without Upstash | ✅ `requirePersistenceBackend()` |
| Multi-instance global enforcement | ❌ Not tested |
| Counters survive process restart | ❌ Not tested |
| `Retry-After` on 429 | ✅ Unit tests |
| Checkout strict tier (20/min) + idempotency | ✅ Code + tests |

---

## Step 5 — Stripe reconciliation

| Scenario | Automated | Live staging |
|----------|-----------|--------------|
| Stub checkout (no key) | ✅ PASS | N/A |
| Session → charge → complete | ✅ PASS | ❌ |
| Idempotent replay | ✅ PASS | ❌ |
| Reconciliation marking | ✅ PASS | ❌ |
| Failed payment (`sk_test_*`) | ❌ | ❌ |
| Webhook retry | ❌ | ❌ |
| Webhook-driven reconciliation | ❌ | ❌ |

**Stripe mode:** `disabled` (stub) in CI/local. **Live test mode not activated.**

---

## Step 6 — Test results (2026-06-16)

| Command | Result |
|---------|--------|
| `npm run type-check` | **PASS** (0 errors) |
| `npm test` | **PASS** (29/29) |
| `npm run build` | **PASS** |
| `node scripts/scan-client-secrets.mjs` | **PASS** (83 files) |

---

## Step 7 — Burn-in metrics (72-hour)

**Status:** NOT EXECUTED

| Metric | Target | Observed |
|--------|--------|----------|
| Error rate | < 0.1% | — |
| API latency p95 | < 500 ms | — |
| Database latency | < 100 ms | — |
| Redis latency | < 50 ms | — |
| Webhook success rate | > 99% | — |
| Audit completeness | 100% mutations | — |

---

## Step 8 — Backup / restore

**Status:** NOT EXECUTED

| Step | Result |
|------|--------|
| Logical backup (`pg_dump mycominer`) | Not performed |
| Platform backup verified | Not performed |
| Restore to clean instance | Not performed |
| Post-restore smoke (auth, workflow, checkout) | Not performed |
| **RPO achieved** | — (target 24 h) |
| **RTO achieved** | — (target 4 h) |

**Runbook:** [`backup-disaster-recovery.md`](./backup-disaster-recovery.md)

---

## GA readiness gate

| Prerequisite | Met |
|--------------|:---:|
| Dedicated Supabase provisioned and cut over | ❌ |
| Schema parity verified (source vs target) | ❌ |
| Production secrets configured (no placeholders) | ❌ |
| Distributed rate limiting active in production | ❌ |
| Stripe webhooks verified in test mode | ❌ |
| Staging smoke tests (live APIs) | ❌ |
| 72-hour burn-in complete | ❌ |
| Backup/restore demonstrated | ❌ |
| Code quality (build, tests, type-check, secrets) | ✅ |

---

## Final recommendation

### **Release Candidate**

**General Availability is not awarded.** Operational prerequisites 1–8 are incomplete. The primary blocker is **Supabase org free-tier project limit** preventing dedicated project provisioning; secondary blockers are **unconfigured production secrets**, **unverified Upstash/Stripe**, and **absent burn-in/DR evidence**.

### Operator unblock sequence

1. Pause or upgrade Supabase org → create **MycoMiner Prod** → `DATABASE_URL=... node scripts/verify-migrations.mjs` → `ga-validate-db.mjs`
2. Set all production env vars → `NODE_ENV=production node scripts/ga-validate-env.mjs`
3. Deploy staging → register Stripe webhook → run test-mode E2E
4. Confirm Upstash limits across ≥2 instances
5. Run 72-hour burn-in; record metrics in this report
6. Execute DR drill; document RPO/RTO
7. Re-submit for GA sign-off

---

## Appendix — validation commands

```bash
npm run type-check && npm test && npm run build && node scripts/scan-client-secrets.mjs
DATABASE_URL="postgresql://..." node scripts/ga-validate-db.mjs
NODE_ENV=production node scripts/ga-validate-env.mjs
DATABASE_URL="postgresql://..." node scripts/verify-migrations.mjs
```
