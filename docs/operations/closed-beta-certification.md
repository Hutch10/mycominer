# Closed Beta Certification Report

**Product:** MycoMiner  
**Prior designation:** Internal Alpha (P0 security remediation complete)  
**Target designation:** Closed Beta operational readiness  
**Report date:** 2026-06-17 (updated after migration `008`)  
**Migration baseline:** `001`–`008`  
**Execution log:** [`closed-beta-operational-log.md`](./closed-beta-operational-log.md)

---

## Executive summary

**Closed Beta engineering readiness remains approved.** Staging Supabase (Rockhounding v1, `dcbjjvygjhmngwzuwdjj`) has migrations `001`–`008` applied. The workflow RPC database blocker is **resolved** via migration `008` (`gen_random_uuid()`). All core persistence RPCs pass staging SQL smoke tests.

**Closed Beta operational readiness is not achieved.** Vercel `mycominer` has no healthy deployment, Upstash and Stripe are not configured, `DATABASE_URL` validation scripts were not run locally, and a full DR restore drill was not performed.

**Final recommendation: Closed Beta Blocked** — database gate cleared; deploy, Stripe, Upstash, and DR gates remain.

**GA remains blocked** until RC operational gates in [`ga-certification-report.md`](./ga-certification-report.md) complete.

---

## P1 engineering matrix (unchanged)

| # | Requirement | Engineering status |
|---|-------------|------------------|
| 1 | Workflow org isolation | **PASS** |
| 2 | Marketplace checkout atomicity | **PASS** |
| 3 | Backup / DR runbook | **PASS** (documented) |
| 4 | Rate limiting | **PASS** (code) |
| 5 | CI secret scan | **PASS** |
| 6 | Audit log completeness | **PASS** (code + DB smoke) |

---

## Operational validation matrix

| # | Gate | Status | Evidence |
|---|------|--------|----------|
| 1 | Migrations `001`–`008` on staging | **PASS** | `008_fix_rpc_extensions_search_path` applied 2026-06-17 |
| 2 | `verify-migrations.mjs` | **NOT RUN** | `DATABASE_URL` unset; `psql` unavailable |
| 3 | `ga-validate-db.mjs` | **NOT RUN** | `DATABASE_URL` unset (includes new `workflow_rpc_uuid_fix` check) |
| 3b | Staging SQL smoke (all RPCs) | **PASS** | create/schedule/cancel workflow; marketplace checkout; token replay |
| 4 | Deploy secrets configured | **FAIL** | `UPSTASH_*`, `STRIPE_*` missing locally; Vercel state unknown |
| 5 | Multi-instance rate limiting | **NOT VERIFIED** | No Upstash credentials |
| 6 | Stripe test-mode purchase | **NOT VERIFIED** | No `STRIPE_SECRET_KEY` |
| 7 | Webhook retry / reconciliation | **NOT VERIFIED** | No webhook secret or live URL |
| 8 | Token purchase idempotency (HTTP) | **NOT RUN** | DB RPC smoke **PASS** |
| 9 | Marketplace checkout idempotency (HTTP) | **NOT RUN** | DB RPC smoke **PASS** |
| 10 | Audit log entries | **PASS** | Workflow + marketplace events in `orchestration_log` |
| 11 | Deployment fingerprint | **PARTIAL** | Local build **PASS**; live endpoint **NOT RUN** |
| 12 | Workflow create on staging | **PASS** | Fixed by `008`; workflow `ab32cdc2-…` created |
| 13 | DR restore drill | **NOT EXECUTED** | Read-only schema checklist **PARTIAL PASS** |
| 14 | Vercel deployment healthy | **FAIL** | Latest production deployment **ERROR**; `live: false` |

---

## Security assessment (operational)

| Control | Operational status |
|---------|-------------------|
| Staging schema isolation (`mycominer`) | **PASS** |
| Workflow RPCs (create/schedule/cancel) | **PASS** (post-`008`) |
| Marketplace atomic checkout (DB) | **PASS** |
| Token purchase durable idempotency (DB) | **PASS** |
| Distributed rate limiting | **NOT VERIFIED** |
| Live API auth / cross-org | **NOT VERIFIED** |
| Secret scan (CI) | **PASS** (engineering) |

---

## Certification level

| Level | Status |
|-------|--------|
| Internal Alpha | **SUPERSEDED** |
| Closed Beta (engineering) | **READY** |
| Closed Beta (database / staging SQL) | **READY** |
| **Closed Beta (operational)** | **BLOCKED** |
| GA / RC | **BLOCKED** |

---

## Sign-off checklist

- [x] Apply migrations `001`–`008` on staging Supabase
- [x] Workflow RPC UUID hotfix verified on staging
- [ ] Configure `UPSTASH_REDIS_REST_*` on deploy target
- [ ] Configure `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET`
- [ ] Fix Vercel deployment (currently ERROR)
- [ ] Run `DATABASE_URL=... node scripts/verify-migrations.mjs`
- [ ] Run `DATABASE_URL=... node scripts/ga-validate-db.mjs`
- [ ] Run restore verification checklist (full DR drill)
- [ ] Stripe test-mode purchase + webhook retry exercise
- [ ] Operator smoke: cross-org workflow 404, live checkout + token purchase replay
- [ ] Live deployment fingerprint with `MYCOMINER_MIGRATION_VERSION=008`

| Role | Name | Date | Result |
|------|------|------|--------|
| Engineering | Auto validation | 2026-06-17 | **Blocked** — DB fixed; deploy/Stripe/Upstash/DR remain |
| Ops | | | |

---

## Revision history

| Version | Date | Change |
|---------|------|--------|
| 1.0 | 2026-06-17 | Initial Closed Beta certification (P1 sprint) |
| 1.1 | 2026-06-17 | Operational validation — **Closed Beta Blocked** |
| 1.2 | 2026-06-17 | Migration `008` hotfix — database blocker **resolved**; operational still **Blocked** |
