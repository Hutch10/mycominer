# Production Deployment Posture

**Document ID:** MIP-DEPLOY-1.0  
**Status:** Active  
**Parent:** [Master Architecture v1.0](./MUSHROOM_INTELLIGENCE_PLATFORM_MASTER_ARCHITECTURE_v1.0.md)

Defines how MycoMiner / Mushroom Intelligence Platform is **built, configured, deployed, and verified** in production.

---

## 1. Deployment topology

| Component | Host | Notes |
|-----------|------|-------|
| Next.js application | Vercel | Primary user + API surface |
| PostgreSQL (`mycominer` schema) | Supabase | Dedicated prod project required |
| Rate limiting | Upstash Redis | Required in production |
| Payments | Stripe | Test mode pre-GA; live after certification |
| Agent runtime | Separate Express deploy | Optional; governance in memory |
| Object storage (post-GA) | Supabase Storage | Evidence Accrual Engine |

---

## 2. Environment contract

See `.env.example`. Production-required variables validated by `scripts/ga-validate-env.mjs`:

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server only)
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `MYCOMINER_MIGRATION_VERSION` (currently `008`)
- `MYCOMINER_ARCHITECTURE_VERSION` (`1.0`)
- `MYCOMINER_RELEASE_CHANNEL`
- `MYCOMINER_GIT_COMMIT`, `MYCOMINER_BUILD_TIMESTAMP` (set at build)

**Forbidden in production:** `MYCOMINER_DEV_AUTH_HEADERS=1`

---

## 3. Build posture

| Setting | Value | Rationale |
|---------|-------|-----------|
| React | 18.3.1 (pinned) | Peer dependency stability |
| `vercel.json` | Modern Next.js | No legacy `builds` array |
| TypeScript | `tsc --noEmit` in CI | Zero errors target |
| Client secret scan | Post-build CI step | Prevent credential leak |

Local WIP may fail full `npm run build` when uncommitted routes reference unavailable deps — **deploy from clean RC commit**.

---

## 4. Deployment fingerprint

`GET /api/admin/deployment-fingerprint` (admin JWT) returns:

```json
{
  "git_commit": "...",
  "build_timestamp": "...",
  "migration_version": "008",
  "architecture_version": "1.0",
  "release_channel": "closed-beta",
  "environment": "production"
}
```

Operators verify deployed artifact matches certified commit.

---

## 5. Database migrations

- Migrations `001`–`008` in `supabase/migrations/`
- Apply via Supabase CLI or SQL editor on target project
- Verify: `node scripts/verify-migrations.mjs`
- Row-level security enabled on orchestration tables
- **No scientific migrations** until post-GA M3+

---

## 6. Release channels

| Channel | Purpose |
|---------|---------|
| `release-candidate` | Pre-GA validation |
| `closed-beta` | Limited operator access |
| `general-availability` | Post-certification production |

Promotion requires [`ga-certification-report.md`](../operations/ga-certification-report.md) evidence.

---

## 7. Operational gates (RC → GA)

1. Dedicated Supabase production project provisioned and migrated
2. Vercel production env configured and validated
3. Stripe webhook registered and tested
4. Upstash rate limiting verified under load
5. 72-hour burn-in without critical incidents
6. Disaster recovery drill executed and documented

---

## 8. Rollback posture

| Failure | Action |
|---------|--------|
| Bad deploy | Vercel instant rollback to prior deployment |
| Migration issue | Forward-fix migration; no destructive rollback on prod data |
| Secret compromise | Rotate keys; redeploy; audit `orchestration_log` |

---

## 9. Monitoring (recommended)

- Vercel analytics / logs
- Supabase dashboard (connections, RLS denials)
- Stripe webhook delivery dashboard
- Deployment fingerprint check in runbook after each deploy

---

## Version history

| Version | Date | Summary |
|---------|------|---------|
| 1.0 | 2026-06-17 | Production posture integrated with RC recovery |
