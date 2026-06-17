# Closed Beta Operational Validation Log

**Date:** 2026-06-17 (updated after migration `008` hotfix)  
**Staging Supabase:** Rockhounding v1 (`dcbjjvygjhmngwzuwdjj`)  
**Vercel project:** `mycominer` (`prj_3yUe2d1ThQzGTjltILvwMsx2tXZZ`)  
**Final recommendation:** **Closed Beta Blocked** (database blocker resolved; deploy/Stripe/Upstash/DR remain)

---

## 1. Migrations applied (001–008)

| Migration | Staging status | Evidence |
|-----------|----------------|----------|
| `001_orchestration_persistence` | Applied (2026-06-15) | `mycominer_orchestration_persistence` |
| `002_economy_billing` | Applied | `mycominer_economy_billing` |
| `003_p0_security_hardening` | Applied | `p0_security_hardening` |
| `004_workflow_org_isolation` | Applied | `004_workflow_org_isolation` |
| `005_marketplace_atomic_idempotency` | Applied | `005_marketplace_atomic_idempotency` |
| `006_payment_checkout_integrity` | Applied | `006_payment_checkout_integrity` + objects |
| `007_token_purchase_idempotency` | Applied | `007_token_purchase_idempotency` @ 2026-06-17T13:07:33Z |
| `008_fix_rpc_extensions_search_path` | **Applied** | `008_fix_rpc_extensions_search_path` @ 2026-06-17T13:24:00Z |

---

## 1b. Migration `008` hotfix (workflow RPC UUID)

**Root cause:** `create_workflow_with_log` and `schedule_run_with_log` called `uuid_generate_v4()` inside plpgsql with `search_path = mycominer`. On Supabase, `uuid-ossp` functions live in the `extensions` schema.

**Fix:** Replaced explicit `uuid_generate_v4()` with built-in `gen_random_uuid()` in both RPCs.

**RPC review (004–007):**

| RPC | `uuid_generate_v4()` in body? | Action |
|-----|------------------------------|--------|
| `create_workflow_with_log` | Yes | **Fixed** → `gen_random_uuid()` |
| `schedule_run_with_log` | Yes | **Fixed** → `gen_random_uuid()` |
| `cancel_run_with_log` | No | No change |
| `checkout_marketplace_with_log` | No | No change |
| `begin_marketplace_checkout` | No (table default only) | No change |
| `record_marketplace_charge` | No | No change |
| `complete_marketplace_checkout` | No | No change |
| `mark_checkout_needs_reconciliation` | No | No change |
| `get_token_purchase_replay` | No | No change |
| `save_token_purchase_replay` | No | No change |

`ga-validate-db.mjs` adds `workflow_rpc_uuid_fix` check (both workflow RPCs must contain `gen_random_uuid`).

---

## 2. Validation commands

### `node scripts/verify-migrations.mjs`

| Result | Detail |
|--------|--------|
| **NOT RUN** | `DATABASE_URL` unset in shell; `psql` not on PATH |

### `node scripts/ga-validate-db.mjs`

| Result | Detail |
|--------|--------|
| **NOT RUN** | `DATABASE_URL` unset in shell |

### Equivalent staging SQL validation (Supabase MCP)

| Check | Result |
|-------|--------|
| `token_purchase_idempotency` table | **PASS** |
| Token purchase RPCs (2/2) | **PASS** |
| Checkout RPCs (4/4) | **PASS** |
| `legacy-unassigned` workflows | **PASS** (0) |
| `workflow_rpc_uuid_fix` (2 RPCs use `gen_random_uuid`) | **PASS** |
| RLS on checkout + token tables | **PASS** |

### Post-`008` staging SQL smoke (2026-06-17)

| Test | Result | Evidence |
|------|--------|----------|
| `create_workflow_with_log` | **PASS** | Workflow `ab32cdc2-5858-404b-843b-65c620759f04` |
| `schedule_run_with_log` | **PASS** | Run `4b5f203f-8df0-4ce7-902d-72e7c705c573` |
| `cancel_run_with_log` | **PASS** | Status `cancelling` |
| Marketplace checkout flow | **PASS** | Session `87713013-4b52-45bf-a2a0-1b5a407a3336` → revenue `7e58bc13-aba4-4bfa-8854-32a7a99a1be9` |
| Token purchase replay | **PASS** | `save_token_purchase_replay` / `get_token_purchase_replay` |
| Audit log append | **PASS** | `workflow_created`, `run_scheduled`, `run_cancel_requested`, `marketplace_checkout_started`, `marketplace_charge_recorded`, `marketplace_revenue_recorded` |

### `node scripts/closed-beta-operational-validate.mjs`

| Result | Detail |
|--------|--------|
| **FAIL** | Missing `UPSTASH_*`, `STRIPE_*`, `DATABASE_URL`, `MYCOMINER_MIGRATION_VERSION` on deploy target |

---

## 3. Deploy target configuration

**Vercel deployment state:** Production deployment `dpl_9WofK19ycaCcuaL5hKhPi7YEXgpt` = **READY** (CLI deploy 2026-06-17). https://www.mycominer.com returns HTTP 200. Git `main` build fixes committed to prevent regression from `1c751d0` ERROR state. Fingerprint endpoint returns **503** until Supabase/Upstash env vars are configured on Vercel.

| Variable | Local `.env.local` | Vercel `mycominer` |
|----------|-------------------|-------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Set | **Missing** |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Set | **Missing** |
| `SUPABASE_SERVICE_ROLE_KEY` | Set | **Missing** |
| `UPSTASH_REDIS_REST_URL` | **Missing** | **Missing** |
| `UPSTASH_REDIS_REST_TOKEN` | **Missing** | **Missing** |
| `STRIPE_SECRET_KEY` | **Missing** | **Missing** |
| `STRIPE_WEBHOOK_SECRET` | **Missing** | **Missing** |
| `MYCOMINER_MIGRATION_VERSION` | **Missing** | **Missing** |

---

## 4. Live smoke test evidence

### Staging database (SQL-level — no HTTP deploy)

| Test | Result | Evidence |
|------|--------|----------|
| Marketplace checkout begin | **PASS** | Session `7d5c873e-f47b-484f-a018-098e2ea68c08` |
| Marketplace idempotent begin replay | **PASS** | Same session ID on duplicate `checkout-idem-smoke-1` |
| Marketplace charge + complete | **PASS** | Revenue `61628b88-45ad-4ea8-901c-d6bcc78b32e9` |
| Marketplace complete idempotent replay | **PASS** | `idempotent_replay: true` |
| Token purchase save/get replay | **PASS** | `save_token_purchase_replay` / `get_token_purchase_replay` |
| Audit log append (marketplace RPCs) | **PASS** | `marketplace_checkout_started`, `marketplace_charge_recorded`, `marketplace_revenue_recorded` |
| Workflow create RPC | **PASS** (post-`008`) | `gen_random_uuid()`; workflow `ab32cdc2-5858-404b-843b-65c620759f04` |
| Cross-org workflow HTTP 404 | **NOT RUN** | No live deployment |
| Deployment fingerprint HTTP | **NOT RUN** | No live deployment |

### Workflow RPC blocker — **RESOLVED** (migration `008`)

Previously `create_workflow_with_log` failed with `uuid_generate_v4() does not exist`. Fixed by switching to `gen_random_uuid()`. Staging smoke confirms create → schedule → cancel.

---

## 5. Stripe test evidence

| Scenario | Result |
|----------|--------|
| `STRIPE_SECRET_KEY` configured | **NOT CONFIGURED** |
| Test-mode purchase via API | **NOT RUN** |
| Webhook retry / reconciliation | **NOT RUN** |
| Token purchase API idempotency replay | **NOT RUN** (DB RPC only) |

Automated stub coverage remains **PASS** in `tests/ga-operational.test.ts` (local, no live Stripe).

---

## 6. Upstash evidence

| Scenario | Result |
|----------|--------|
| `UPSTASH_REDIS_REST_*` configured | **NOT CONFIGURED** |
| Multi-instance rate limit (429 across instances) | **NOT VERIFIED** |

Code enforces Upstash requirement in production (`requirePersistenceBackend`). In-memory rate limits verified locally in `tests/persistence-security.test.ts`.

---

## 7. DR drill evidence

| Step | Result | Notes |
|------|--------|-------|
| Full schema restore (`pg_dump` / PITR) | **NOT EXECUTED** | Shared Rockhounding project — destructive restore not performed without operator approval |
| Read-only restore verification (§3.1) | **PARTIAL PASS** | `org_id` NOT NULL on workflows/runs; checkout + token tables/RPCs present; append-only audit via RPC writes confirmed |
| Post-restore `npm test` / secret scan | **PASS** (local) | 43/43 tests; secret scan passed in prior engineering sprint |
| API verification (§3.4) | **PARTIAL** | DB-level marketplace + token idempotency only |

---

## 8. Deployment fingerprint

| Check | Result |
|-------|--------|
| Local default `migration_version` | **PASS** — `008` when unset |
| Live `/api/admin/deployment-fingerprint` | **503** — Supabase not configured on Vercel; admin JWT not tested |

---

## Operator actions required to unblock

1. ~~Fix Vercel `mycominer` production build~~ **DONE** (build recovery committed; redeploy via Git after push).
2. Set Vercel env: Supabase keys, `UPSTASH_REDIS_REST_*`, `STRIPE_SECRET_KEY` (`sk_test_…`), `STRIPE_WEBHOOK_SECRET`, `MYCOMINER_MIGRATION_VERSION=008`.
3. Provide `DATABASE_URL` and run `verify-migrations.mjs` + `ga-validate-db.mjs`.
4. Redeploy; run live API smoke + Stripe webhook CLI test.
5. Execute DR restore drill on non-production branch or dedicated project.
6. Re-run `node scripts/closed-beta-operational-validate.mjs` with `BASE_URL` set.

---

## Revision history

| Version | Date | Change |
|---------|------|--------|
| 1.0 | 2026-06-17 | Initial operational validation attempt |
| 1.1 | 2026-06-17 | Migration `008` workflow RPC UUID hotfix; staging SQL smoke re-run |
