# GA Certification Report

**Product:** MycoMiner  
**Designation:** Release Candidate  
**Report date:** 2026-06-16 (cutover execution attempt)  
**Git commit:** `1c751d0ef06d848740f217ff3e994ab70520cabb`  
**Commit message:** Final build fixes: resolve module imports and stubs  
**Execution log:** [`ga-cutover-execution-log.md`](./ga-cutover-execution-log.md)

---

## Executive summary

The codebase meets GA **feature and security architecture** requirements. **General Availability is not recommended** until Phase 1 infrastructure cutover, production secret configuration, live Stripe webhook verification, 72-hour burn-in, and disaster recovery drill are completed with documented evidence.

---

## Phase 1 — Production infrastructure

### 1. Dedicated Supabase cutover

| Criterion | Status | Evidence |
|-----------|--------|----------|
| Dedicated `mycominer-prod` project provisioned | **BLOCKED** | Supabase `create_project` rejected: org at **2 active free-project limit** (2026-06-16). See execution log. |
| Row count parity (source vs target) | **BLOCKED** | Cutover not executed |
| Migrations `001`–`006` on target | **BLOCKED** | Run `DATABASE_URL=... node scripts/verify-migrations.mjs` on new project |
| RPC functions exist | **PASS (source)** | 4/4 checkout RPCs live on source |
| RLS policies | **PASS (source)** | 8 `service_role` policies on `mycominer` tables |
| `marketplace_checkout_sessions` | **PASS (schema)** | Table exists; 0 rows (pre-GA data) |
| Audit log integrity | **PASS (schema)** | `orchestration_log` present; append via RPCs |
| Zero orphaned records | **PASS** | 0 orphaned completed checkout sessions |
| Zero `legacy-unassigned` | **PASS** | 0 rows |

**Source row counts (2026-06-16):**

| Table | Count |
|-------|------:|
| workflows | 0 |
| workflow_runs | 0 |
| marketplace_revenue | 0 |
| marketplace_checkout_sessions | 0 |
| orchestration_log | 0 |

**Live migration versions (source project):** includes `004_workflow_org_isolation`, `005_marketplace_atomic_idempotency`, `006_payment_checkout_integrity`, `006_payment_checkout_integrity_objects`.

**Runbook:** [`dedicated-supabase-migration.md`](./dedicated-supabase-migration.md)  
**Validation script:** `node scripts/ga-validate-db.mjs` (requires `DATABASE_URL`)

---

### 2. Production secrets

| Variable | Status | Notes |
|----------|--------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | **UNVERIFIED** | No `.vercel/project.json`; hosting not linked in repo |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **UNVERIFIED** | Validate on deploy platform |
| `SUPABASE_SERVICE_ROLE_KEY` | **UNVERIFIED** | Must not appear in client bundle (scan passes locally) |
| `UPSTASH_REDIS_REST_URL` | **UNVERIFIED** | Required in production (`requirePersistenceBackend`) |
| `UPSTASH_REDIS_REST_TOKEN` | **UNVERIFIED** | Required in production |
| `STRIPE_SECRET_KEY` | **UNVERIFIED** | Use `sk_test_*` for pre-GA validation |
| `STRIPE_WEBHOOK_SECRET` | **UNVERIFIED** | Register webhook → `/api/billing/stripe/webhook` |
| `MYCOMINER_DEV_AUTH_HEADERS` | **CODE PASS** | Blocked in production at runtime |

**Validation script:** `NODE_ENV=production node scripts/ga-validate-env.mjs`

---

### 3. Stripe validation (test mode)

| Scenario | Automated | Status |
|----------|-----------|--------|
| Checkout session creation | `tests/ga-operational.test.ts` | **PASS** |
| Successful payment (stub) | `tests/ga-operational.test.ts` | **PASS** |
| Idempotent replay | `tests/ga-operational.test.ts` | **PASS** |
| Reconciliation marking | `tests/ga-operational.test.ts` | **PASS** |
| Duplicate begin (idempotency) | `tests/ga-operational.test.ts` | **PASS** |
| Failed payment (live Stripe) | Manual | **PENDING** — requires `STRIPE_SECRET_KEY` |
| Webhook retry | Manual | **PENDING** — requires Stripe CLI + webhook secret |
| Webhook reconciliation | Manual | **PENDING** — requires deployed URL |

**Stripe mode in CI/local:** `disabled` (stub) — production-safe default.

---

### 4. Distributed rate limiting

| Criterion | Status |
|-----------|--------|
| Implementation (Upstash) | **PASS** — `app/lib/auth/distributedRateLimit.ts` |
| Production fail-fast without Upstash | **PASS** — `requirePersistenceBackend()` |
| Multi-instance global enforcement | **PENDING** — requires Upstash + 2+ instances |
| Counters survive restarts | **PENDING** — operational test on Upstash |
| Retry-After headers | **PASS** — unit tests |
| Checkout abuse protection | **PASS** — strict tier 20/min + idempotency |

---

## Phase 2 — Operational validation (72-hour burn-in)

| Metric | Target | Status |
|--------|--------|--------|
| Error rate | < 0.1% | **NOT MEASURED** |
| API latency p95 | < 500ms | **NOT MEASURED** |
| Database latency | < 100ms | **NOT MEASURED** |
| Redis latency | < 50ms | **NOT MEASURED** |
| Webhook success rate | > 99% | **NOT MEASURED** |
| Audit log completeness | 100% mutations | **NOT MEASURED** (code paths audited) |
| Scheduler stability | No missed jobs | **NOT MEASURED** |

**Action:** Run 72-hour burn-in on staging with production-equivalent env; record metrics in this section before GA sign-off.

---

## Phase 3 — Disaster recovery drill

| Step | Status |
|------|--------|
| Backup creation | **DOCUMENTED** — [`backup-disaster-recovery.md`](./backup-disaster-recovery.md) |
| Database restoration | **NOT EXECUTED** |
| Application startup post-restore | **NOT EXECUTED** |
| Auth + workflow + checkout smoke | **NOT EXECUTED** |
| Audit replay | **NOT EXECUTED** |
| **RPO achieved** | — (target 24h) |
| **RTO achieved** | — (target 4h) |

---

## Phase 4 — Security verification

| Attack category | Result | Notes |
|-----------------|--------|-------|
| Authentication bypass | **PASS** | JWT via Supabase; dev headers disabled in production |
| Authorization bypass | **PASS** | `withPersistenceAuthOrg` / `withApiMutationAuth` on all mutations |
| IDOR (cross-org) | **PASS** | `rejectClientOrgId`; org-scoped DB queries |
| Replay attacks | **PARTIAL** | Marketplace idempotent via DB; token purchase uses in-process cache |
| Rate-limit bypass | **PASS** (prod) | Upstash required; in-memory dev-only |
| JWT tampering | **PASS** | `getUser(token)` server-side validation |
| Session fixation | **N/A** | Stateless JWT; no server session store |
| Marketplace abuse | **PASS** | Idempotency-Key required; strict rate limit |
| Audit log tampering | **PASS** | Append via service-role RPCs; RLS on tables |

| Severity | Finding | GA blocker |
|----------|---------|------------|
| High | Token purchase idempotency is process-local | Yes — multi-instance replay risk |
| High | Dedicated Supabase not provisioned | Yes — tenancy isolation |
| Medium | No hosting secret verification in CI | No — ops checklist |
| Low | Empty production dataset (0 rows) | No — pre-launch expected |

**Unresolved critical findings:** 0 code-level critical vulnerabilities identified. **2 high operational blockers** remain (dedicated DB, durable token idempotency).

---

## Phase 5 — Build and test evidence

| Command | Result |
|---------|--------|
| `npm run type-check` | **PASS** (0 errors) |
| `npm test` | **PASS** (29 tests) |
| `npm run build` | **PASS** |
| `node scripts/scan-client-secrets.mjs` | **PASS** |

**Repo migrations:** `001`–`006` in `supabase/migrations/`.

---

## GA readiness checklist

| Requirement | Met |
|-------------|-----|
| Infrastructure fully provisioned | ❌ |
| All production secrets configured | ❌ |
| Distributed rate limiting active in prod | ❌ |
| Stripe webhooks verified live | ❌ |
| Dedicated Supabase migration complete | ❌ |
| Disaster recovery demonstrated | ❌ |
| Security: no unresolved critical findings | ✅ |
| 72-hour burn-in complete | ❌ |

---

## Certification recommendation

### **Release Candidate** (retain)

Award **General Availability** only after:

1. Provision dedicated Supabase project and execute cutover with `ga-validate-db.mjs` parity checks  
2. Configure all production secrets; run `ga-validate-env.mjs` on hosting  
3. Complete Stripe test-mode E2E including webhook retry (Stripe CLI)  
4. Verify distributed rate limits across ≥2 instances  
5. Complete 72-hour burn-in with metrics recorded above  
6. Execute DR drill and document actual RPO/RTO  
7. Resolve token-purchase durable idempotency (DB session table)  

---

## Appendix — Commands

```bash
# Local certification suite
npm run type-check
npm test
npm run build
node scripts/scan-client-secrets.mjs

# Production env (on hosting shell or CI with secrets)
NODE_ENV=production node scripts/ga-validate-env.mjs

# Database parity (source or dedicated target)
DATABASE_URL="postgresql://..." node scripts/ga-validate-db.mjs

# Clean migration apply
DATABASE_URL="postgresql://..." node scripts/verify-migrations.mjs
```
