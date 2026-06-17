# Architecture Alignment Report

**Version:** 1.1  
**Date:** 2026-06-17  
**Baseline:** Local workspace (RC deployment recovery + architecture documentation integration)  
**Canonical reference:** [Master Architecture v1.0](./MUSHROOM_INTELLIGENCE_PLATFORM_MASTER_ARCHITECTURE_v1.0.md), [Scientific Constitution](./SCIENTIFIC_CONSTITUTION.md)

**Legend:** **Implemented** = production-viable or complete in-memory engine; **Partial** = structure exists, gaps remain; **Missing** = designed, not built; **Conflicting** = behavior contradicts frozen invariants; **Unsafe assumption** = code or UX implies capability not backed by architecture

---

## Executive summary

| Category | Count |
|----------|------:|
| Implemented | 20 |
| Partially implemented | 26 |
| Missing | 18 |
| Conflicting with invariants | 11 |
| Unsafe assumptions | 8 |

**Verdict:** MycoMiner is a **mature cultivation operations and orchestration platform** with strong deterministic engines and partial persistence hardening. Canonical production architecture is now **documented**; scientific runtime (Observation Engine, Claim Registry, Evidence Accrual, exports) remains **unimplemented** by design until post-GA.

---

## 1. Scientific core & governance docs

| Capability | Status | Evidence | Gap |
|------------|--------|----------|-----|
| Master Architecture v1.0 | **Implemented** | `docs/architecture/MUSHROOM_INTELLIGENCE_PLATFORM_MASTER_ARCHITECTURE_v1.0.md` | — |
| Scientific Constitution | **Implemented** | `SCIENTIFIC_CONSTITUTION.md` | — |
| Observation Engine invariants | **Implemented** (doc) | `OBSERVATION_ENGINE_INVARIANTS.md` | Runtime **Missing** |
| Scientific Claim Registry | **Implemented** (doc) | `SCIENTIFIC_CLAIM_REGISTRY.md` | Runtime **Missing** |
| Evidence Accrual Engine | **Implemented** (doc) | `EVIDENCE_ACCRUAL_ENGINE.md` | Runtime **Missing** |
| Immutable Claim Snapshots | **Implemented** (doc) | `IMMUTABLE_CLAIM_SNAPSHOTS.md` | Runtime **Missing** |
| Claim Change Impact Reports | **Implemented** (doc) | `CLAIM_CHANGE_IMPACT_REPORTS.md` | Runtime **Missing** |
| Golden Dataset Verification | **Implemented** (doc) | `GOLDEN_DATASET_VERIFICATION.md` | Test harness **Missing** |
| Observation Engine (runtime) | **Missing** | No `observations` schema | Community grow logs mutable |
| Verification Engine | **Missing** | — | No replay pipeline |
| Formula / algorithm registry | **Missing** | — | Embedded calculations |
| Chain of custody | **Missing** | — | LIMS not started |

---

## 2. Evidence & telemetry

| Capability | Status | Evidence | Gap |
|------------|--------|----------|-----|
| Evidence blob store + hashes | **Missing** | Doc only | No upload pipeline |
| Durable telemetry TSDB | **Missing** | Digital twin sample data | No replay store |
| Sensor adapters (MQTT/CSV) | **Missing** | Telemetry engine in-memory | No ingestion |
| Clock drift / gap / dedup | **Missing** | — | — |
| Photo evidence linkage | **Partial** | Community references images | No server hash |
| Offline field observation queue | **Missing** | Community offline copy only | No sync API |

---

## 3. Knowledge & intelligence

| Capability | Status | Evidence | Gap |
|------------|--------|----------|-----|
| Fabric knowledge mesh | **Implemented** | `app/fabric/` | Links lack observation IDs |
| Intelligence Hub | **Implemented** | `app/intelligenceHub/` | Mock fetchers |
| Knowledge Graph | **Partial** | `app/knowledgeGraph/` | Seeded data |
| Insights / knowledge packs | **Partial** | `app/insights/` | Not Claim Registry |
| Multi-agent orchestration | **Implemented** | `app/api/agent/`, agent-runtime | Ephemeral explainability |
| Closed-loop intelligence | **Partial** | Coach, optimization | No unified approval gate |
| Federation analytics | **Partial** | `app/federationMarketplace/` | Placeholder metrics |

---

## 4. Operations & LIMS-adjacent

| Capability | Status | Evidence | Gap |
|------------|--------|----------|-----|
| Workflow orchestration (persisted) | **Implemented** | Supabase RPCs | Not specimen-scoped |
| Marketplace checkout | **Implemented** | Migrations 005–006 | — |
| Billing / economy APIs | **Partial** | Routes + partial Supabase | WIP on disk |
| Digital Twin | **Partial** | `app/digitalTwin/` | Sample-driven |
| Simulation / forecasting | **Implemented** | Deterministic engines | No observation provenance |
| SOP / training | **Implemented** | `app/sop/`, `app/training/` | Not claim-linked |
| LIMS workflows (13 flows) | **Missing** | QA audit | 0/13 end-to-end |
| Multi-facility | **Partial** | Mock snapshots | In-memory |

---

## 5. Production, validation & platform

| Capability | Status | Evidence | Gap |
|------------|--------|----------|-----|
| Production deployment posture (doc) | **Implemented** | `PRODUCTION_DEPLOYMENT_POSTURE.md` | Vercel env unverified |
| GA certification harness (doc) | **Implemented** | `GA_CERTIFICATION_HARNESS.md` | Full test suite not in `npm test` |
| ASP validation framework (doc) | **Implemented** | `ASP_VALIDATION.md` | No automated a11y/perf CI |
| Deployment fingerprint | **Partial** | `fingerprint.ts` + tests | Admin route WIP locally |
| Supabase persistence | **Implemented** | Migrations 001–008 | Scientific tables absent |
| Secret scan CI | **Implemented** | `scan-client-secrets.mjs` | — |
| Plugin SDK | **Missing** | Doc only | No `@mycominer/plugin-sdk` |
| Regulatory profiles | **Missing** | Doc only | Compliance not profile-driven |
| Reproducibility exports | **Missing** | Doc only | Placeholder export engine |
| DR drill | **Partial** | Runbook exists | Not executed |

---

## Conflicts with frozen invariants

| # | Conflict | Location | Resolution |
|---|----------|----------|------------|
| 1 | Derived metrics without observation provenance | Forecasting, analytics, digital twin | Post-GA: Observation Engine consumer |
| 2 | Mutable in-memory logs as audit | `*Log.ts` modules | Migrate to `orchestration_log` or scientific audit |
| 3 | KG edges without evidence IDs | `knowledgeGraph/` | Require observation/claim linkage |
| 4 | Insights as knowledge without registry | `insights/` | Informational vs verified labels |
| 5 | Explainability graphs ephemeral | agent-runtime | Persist + link observations |
| 6 | `inMemoryDb.update` allows overwrite | `inMemoryDb.ts` | Dev-only; ban for scientific data |
| 7 | Closed-loop without approval gate | Coach, optimization | Unified approval middleware |
| 8 | No deterministic replay contract | Derived engines | Formula registry + golden datasets |
| 9 | Export packages not scientifically auditable | Export engine | Reproducibility export standards |
| 10 | Org federation trust ≠ specimen claims | `OrganizationVerificationEngine` | Separate from Claim Registry |
| 11 | Operational snapshots named like claim snapshots | Archive center | Rename UX; scientific snapshots separate |

---

## Unsafe assumptions

| # | Assumption | Risk | Mitigation |
|---|------------|------|------------|
| U-1 | Enterprise dashboards display mock data as operational truth | Operators trust incorrect state | Demo banners; feature flags in prod |
| U-2 | "Verified" or confidence scores in UI imply scientific verification | False credibility | Label all current outputs **informational** |
| U-3 | Community offline mode covers scientific capture | Field data loss belief | Document until Observation sync ships |
| U-4 | Export ZIP contains auditable evidence | Compliance failure | Block verified export until standards implemented |
| U-5 | `npm test` PASS implies GA readiness | Under-tested persistence | Run full `tests/*.test.ts` before GA |
| U-6 | Federation org score validates lab specimens | Wrong trust model | Separate org trust from Claim Registry |
| U-7 | Training replay `alert()` stubs imply timeline engine | UX deception | Mark stubs explicitly |
| U-8 | Local full-tree build failure means deploy broken | CI may pass on clean commit | Deploy from certified SHA only |

---

## Recommended migration order

Aligned with [MIGRATION_PLAN.md](./MIGRATION_PLAN.md) and locked governance:

| Order | Phase | Deliverable | GA blocker? |
|------:|-------|-------------|-------------|
| 1 | M1 | Operational GA (Supabase, Vercel, Stripe, burn-in, DR) | **Yes** |
| 2 | M2 | Freeze `OBSERVATION_ENGINE_SPECIFICATION.md` | No |
| 3 | M3 | Evidence Accrual Engine (blobs + links) | No |
| 4 | M4 | Observation Engine runtime | No |
| 5 | M5 | Verification + Claim Registry + snapshots | No |
| 6 | — | Golden dataset harness + CCIR generation | No |
| 7 | M6 | Downstream refactors (twin, KG, insights, agents) | No |
| 8 | — | Regulatory profiles + reproducibility exports | No |
| 9 | M7 | LIMS & chain of custody | No |
| 10 | — | Plugin SDK + offline field sync | No |
| 11 | M8 | FAIR / publication pipeline | No |
| 12 | — | ASP automation (axe, Lighthouse, k6) | No |

**Do not reorder:** M3–M4 before M1 complete; M5 before M4; M6 before M5.

---

## Backwards compatibility

- Existing `/api/workflows/*`, `/api/marketplace/*`, `/api/billing/*` remain stable through M3.
- Phase UIs continue; scientific gating adds labels before restrictions.
- `orchestration_log` extended, not replaced, in early scientific phases.

---

## Version history

| Version | Date | Summary |
|---------|------|---------|
| 1.0 | 2026-06-17 | Initial alignment report |
| 1.1 | 2026-06-17 | Full architecture doc set; unsafe assumptions; migration order |
