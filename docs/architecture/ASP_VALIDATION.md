# Accessibility, Security, and Performance Validation

**Document ID:** MIP-ASP-1.0  
**Status:** Canonical validation framework  
**Parent:** [GA Certification Harness](./GA_CERTIFICATION_HARNESS.md)

Defines how the platform validates **accessibility (A)**, **security (S)**, and **performance (P)** for production readiness.

---

## 1. Accessibility validation

### Target standard

WCAG 2.1 Level AA for operator-facing surfaces; Level A minimum for education content.

### Required checks (release gate)

| Check | Method | Current status |
|-------|--------|----------------|
| Keyboard navigation | Manual + axe in CI (planned) | **Partial** — modals inconsistent |
| Focus management | Manual audit | **Partial** |
| Color contrast | Design tokens / audit | **Not automated** |
| Form labels & errors | Component review | **Partial** — many `alert()` errors |
| Screen reader labels | `aria-*` on interactive controls | **Partial** |

### Known defects (from scientific QA audit)

- Dead links: `/troubleshooting/green-mold`, `/integrity`, `/workflows/*`, `/resources/*`
- Modal focus trap not systematic
- Export actions lack accessible progress feedback

### Validation commands (planned)

```bash
# Post-GA: add to CI
npx @axe-core/cli http://localhost:3000 --exit
```

---

## 2. Security validation

### Automated (active)

| Check | Command / location | Status |
|-------|-------------------|--------|
| Client secret scan | `npm run scan-secrets` | **PASS** |
| Type safety | `npm run type-check` | Run in CI |
| Dev auth blocked in prod | `ga-validate-env.mjs` | **PASS** (code) |
| Org isolation tests | `tests/persistence-security.test.ts` | **Local** |
| Rate limiting | `app/lib/auth/distributedRateLimit.ts` | **Code complete**; Upstash ops pending |

### Manual gates

| Check | Status |
|-------|--------|
| RLS on `mycominer` tables | Verified on source DB |
| Unauthenticated mutation audit | RC remediation complete |
| Service role never in client | Scan enforced |
| Stripe webhook signature | Manual pending |

### Production risks

- Mock-driven enterprise dashboards may imply false operational truth — use feature flags or demo banners
- WIP API routes on disk extend auth surface — must pass `withPersistenceAuth` before deploy

---

## 3. Performance validation

### Targets (staging / production)

| Metric | Target | Measurement |
|--------|--------|-------------|
| LCP (p75) | < 2.5s | Lighthouse |
| API p95 (orchestration) | < 500ms | APM / logs |
| Build time | < 10 min | CI |
| Telemetry ingest (post-GA) | Documented TPS | Load test |

### Current status

| Area | Status |
|------|--------|
| CI performance budgets | **Missing** |
| k6 load tests | **Missing** |
| KG large-graph pagination | **Missing** |
| Telemetry in-memory 1000 cap | **Not production-scalable** |

### Validation commands (planned)

```bash
# Post-GA staging
npx lighthouse http://staging.example.com --preset=desktop
k6 run scripts/load/orchestration-smoke.js
```

---

## 4. ASP release checklist

Before GA promotion:

- [ ] Security: `scan-secrets` PASS in CI
- [ ] Security: production env validated via `ga-validate-env.mjs`
- [ ] Security: persistence security tests PASS
- [ ] Accessibility: critical dead links fixed or removed from nav
- [ ] Accessibility: demo data banners on mock pages
- [ ] Performance: staging Lighthouse baseline recorded
- [ ] Performance: 72h burn-in without SLO breach

Full ASP automation is **post-GA**; operational GA uses manual evidence + existing scripts.

---

## Version history

| Version | Date | Summary |
|---------|------|---------|
| 1.0 | 2026-06-17 | ASP framework from audits + AI Studio posture |
