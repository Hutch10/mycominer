# Mushroom Intelligence Platform — Architecture Documentation

**Product names:** Mycology OS · Mushroom Intelligence Platform · MycoMiner (repository)  
**Status:** Canonical production architecture (AI Studio design integrated)  
**Master document:** [MUSHROOM_INTELLIGENCE_PLATFORM_MASTER_ARCHITECTURE_v1.0.md](./MUSHROOM_INTELLIGENCE_PLATFORM_MASTER_ARCHITECTURE_v1.0.md)

---

## Document hierarchy

### Tier 1 — Platform architecture

| Document | Purpose |
|----------|---------|
| [Master Architecture v1.0](./MUSHROOM_INTELLIGENCE_PLATFORM_MASTER_ARCHITECTURE_v1.0.md) | Integrated platform architecture |
| [Canonical Vision](./CANONICAL_VISION.md) | AI Studio layer model and design principles |
| [Architecture Alignment Report](./ARCHITECTURE_ALIGNMENT_REPORT.md) | Implementation vs vision gap analysis |
| [Migration Plan](./MIGRATION_PLAN.md) | Schema/API migration sequence |
| [Legacy Phase Map](./LEGACY_PHASE_MAP.md) | Historical `PHASE*_SUMMARY.md` index |

### Tier 2 — Scientific governance

| Document | Purpose |
|----------|---------|
| [Scientific Constitution](./SCIENTIFIC_CONSTITUTION.md) | Governing scientific law |
| [Scientific Invariants](./SCIENTIFIC_INVARIANTS.md) | Frozen technical invariants (8 rules) |
| [Observation Engine Invariants](./OBSERVATION_ENGINE_INVARIANTS.md) | Observation capture contract |
| [Scientific Claim Registry](./SCIENTIFIC_CLAIM_REGISTRY.md) | Verified conclusions canonical store |
| [Evidence Accrual Engine](./EVIDENCE_ACCRUAL_ENGINE.md) | Raw evidence preservation |
| [Immutable Claim Snapshots](./IMMUTABLE_CLAIM_SNAPSHOTS.md) | Point-in-time claim records |
| [Claim Change Impact Reports](./CLAIM_CHANGE_IMPACT_REPORTS.md) | Impact analysis on source changes |
| [Golden Dataset Verification](./GOLDEN_DATASET_VERIFICATION.md) | Regression science harness |
| [Reproducibility Export Standards](./REPRODUCIBILITY_EXPORT_STANDARDS.md) | FAIR / replay packages |

### Tier 3 — Production & platform

| Document | Purpose |
|----------|---------|
| [Production Deployment Posture](./PRODUCTION_DEPLOYMENT_POSTURE.md) | Build, env, deploy, rollback |
| [GA Certification Harness](./GA_CERTIFICATION_HARNESS.md) | RC → GA validation toolchain |
| [ASP Validation](./ASP_VALIDATION.md) | Accessibility, security, performance |
| [Plugin SDK Governance](./PLUGIN_SDK_GOVERNANCE.md) | Extension and adapter rules |
| [Offline-First Field Mode](./OFFLINE_FIRST_FIELD_MODE.md) | Field capture sync contract |
| [Regulatory Profiles](./REGULATORY_PROFILES.md) | Jurisdiction-specific constraints |

---

## Operational documentation (separate scope)

Operational runbooks: [`docs/operations/`](../operations/). They govern **RC → GA** readiness, not product architecture.

---

## Engineering policy (current lifecycle)

| Policy | Value |
|--------|-------|
| Lifecycle | Release Candidate → General Availability |
| Code freeze | Exception-only |
| Scientific implementation | Deferred until post-GA M3+ |
| Architecture changes | Document-first; no speculative runtime features |

---

## Quick links

- Engineering entry: [`README.md`](../../README.md)
- Release baseline: [`RELEASE.md`](../../RELEASE.md)
- Migrations: [`supabase/migrations/`](../../supabase/migrations/)
