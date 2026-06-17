# GA Certification Harness

**Document ID:** MIP-GA-HARNESS-1.0  
**Status:** Active (operational); scientific extensions post-GA  
**Parent:** [Production Deployment Posture](./PRODUCTION_DEPLOYMENT_POSTURE.md)

The GA Certification Harness is the **automated and manual validation toolchain** that determines whether the platform meets Release Candidate → General Availability gates.

---

## 1. Scope split

| Track | Purpose | When |
|-------|---------|------|
| **Operational GA** | Auth, persistence, billing, deploy, secrets | RC → GA (now) |
| **Scientific GA** | Observation engine, claim registry, golden datasets | Post-GA program |

This document covers **operational GA**; scientific gates reference [GOLDEN_DATASET_VERIFICATION.md](./GOLDEN_DATASET_VERIFICATION.md).

---

## 2. Harness components

| Script / test | Command | Validates |
|---------------|---------|-----------|
| Type check | `npm run type-check` | TypeScript compile |
| Unit / integration tests | `npm test` | Deployment fingerprint |
| Extended tests (local) | `node --import tsx --test tests/*.test.ts` | Persistence, GA ops |
| Production build | `npm run build` | Next.js build |
| Client secret scan | `npm run scan-secrets` | No service role in client bundle |
| Env validation | `NODE_ENV=production node scripts/ga-validate-env.mjs` | Required env vars |
| DB validation | `DATABASE_URL=... node scripts/ga-validate-db.mjs` | Schema, RPCs, RLS |
| Migration verify | `DATABASE_URL=... node scripts/verify-migrations.mjs` | Applied migrations |
| Local GA bundle | `node scripts/ga-verify-local.mjs` | Aggregated local checks |

---

## 3. CI integration

`.github/workflows/ci.yml` runs on push/PR:

1. `npm ci`
2. `npm run type-check`
3. `npm test` (fingerprint tests in default `npm test`)
4. `npm run build` with fingerprint env vars
5. `node scripts/scan-client-secrets.mjs`

**Gap:** Full `tests/ga-operational.test.ts` and persistence tests not in default `npm test` script.

---

## 4. Manual gates (documented evidence)

| Gate | Evidence location |
|------|-------------------|
| Dedicated Supabase cutover | `docs/operations/dedicated-supabase-migration.md` |
| Production secrets on Vercel | `docs/operations/ga-certification-report.md` |
| Stripe live webhook | Manual + `tests/ga-operational.test.ts` |
| 72-hour burn-in | `docs/operations/ga-cutover-execution-log.md` |
| DR drill | `docs/operations/backup-disaster-recovery.md` |

---

## 5. Certification outputs

| Artifact | Purpose |
|----------|---------|
| `docs/operations/ga-certification-report.md` | Human-readable certification |
| Deployment fingerprint API | Runtime build metadata (`architecture_version`, `migration_version`) |
| `RELEASE.md` | RC baseline and promotion checklist |

---

## 6. Recommended harness improvements (post-doc, pre-GA)

1. Add `npm run test:ga` aggregating all `tests/*.test.ts`
2. Add `npm run validate:ga` running env + migration scripts
3. Wire `test:ga` into CI when WIP persistence routes stabilize

*Not implemented in this pass — documentation only per code freeze.*

---

## Version history

| Version | Date | Summary |
|---------|------|---------|
| 1.0 | 2026-06-17 | Harness inventory and gaps |
