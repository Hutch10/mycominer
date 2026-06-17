# Scientific Constitution — Mycology OS / Mushroom Intelligence Platform

**Document ID:** MIP-SCI-CONST-1.0  
**Status:** Frozen — amendments require architecture review and version bump  
**Authority:** [Master Architecture v1.0](./MUSHROOM_INTELLIGENCE_PLATFORM_MASTER_ARCHITECTURE_v1.0.md)

This constitution governs all **scientific** behavior on the platform. Operational orchestration (billing, marketplace checkout, workflow scheduling) follows operational runbooks but must not present operational convenience as verified science.

---

## Article I — Purpose

The platform exists to produce **reproducible, auditable mycological knowledge** from immutable evidence. Feature velocity must not outpace scientific defensibility.

---

## Article II — Authoritative doctrine

```
Observation → Verification → Evidence → Knowledge → Intelligence → Recommendation
```

No module may invert this sequence. Intelligence and recommendations are **downstream** of verified claims.

---

## Article III — Post-GA scientific development rule

> **No derived metric, graph edge, recommendation, confidence score, publication artifact, or AI-generated insight may exist unless it can be traced to immutable source observations and versioned transformation metadata.**

If replay cannot reproduce a result within declared tolerance, the output is **informational only**.

---

## Article IV — Frozen invariants

The eight technical invariants are defined in [SCIENTIFIC_INVARIANTS.md](./SCIENTIFIC_INVARIANTS.md) and summarized here:

| # | Invariant |
|---|-----------|
| 1 | Immutable observations (append-only; supersession only) |
| 2 | Raw evidence preservation |
| 3 | Mandatory provenance on all derived artifacts |
| 4 | Deterministic replay |
| 5 | Append-only audit trails |
| 6 | Explainable AI |
| 7 | Human approval for consequential actions |
| 8 | Scientific Claim Registry as canonical source of conclusions |

---

## Article V — Classification of outputs

| Class | Definition | UI label | Export as science |
|-------|------------|----------|-------------------|
| **Informational** | Helpful, not replay-verified | Required | Prohibited |
| **Verified** | Claim Registry entry with provenance | Required | Permitted |

Current shipped engines default to **informational** until integrated with the Observation Engine and Claim Registry.

---

## Article VI — Lifecycle and change control

| Phase | Scientific work authorized |
|-------|---------------------------|
| RC → GA | Documentation only; operational validation |
| Post-GA M2 | Freeze [Observation Engine invariants](./OBSERVATION_ENGINE_INVARIANTS.md) |
| Post-GA M3+ | Schema and API implementation per [MIGRATION_PLAN.md](./MIGRATION_PLAN.md) |

`OBSERVATION_ENGINE_SPECIFICATION.md` (implementation contract) is frozen **after** operational GA, not before.

---

## Article VII — Acceptance gate (all new scientific modules)

Before merge, answer:

1. What observations produced this result?
2. Which algorithm/version transformed those observations?
3. Can an independent auditor replay and obtain the same output?
4. If not, is the output explicitly marked non-verified?

---

## Article VIII — Related contracts

| Contract | Document |
|----------|----------|
| Observation capture | [OBSERVATION_ENGINE_INVARIANTS.md](./OBSERVATION_ENGINE_INVARIANTS.md) |
| Verified conclusions | [SCIENTIFIC_CLAIM_REGISTRY.md](./SCIENTIFIC_CLAIM_REGISTRY.md) |
| Evidence accumulation | [EVIDENCE_ACCRUAL_ENGINE.md](./EVIDENCE_ACCRUAL_ENGINE.md) |
| Claim immutability | [IMMUTABLE_CLAIM_SNAPSHOTS.md](./IMMUTABLE_CLAIM_SNAPSHOTS.md) |
| Claim change analysis | [CLAIM_CHANGE_IMPACT_REPORTS.md](./CLAIM_CHANGE_IMPACT_REPORTS.md) |
| Regression science | [GOLDEN_DATASET_VERIFICATION.md](./GOLDEN_DATASET_VERIFICATION.md) |
| Exports | [REPRODUCIBILITY_EXPORT_STANDARDS.md](./REPRODUCIBILITY_EXPORT_STANDARDS.md) |
| Regulatory context | [REGULATORY_PROFILES.md](./REGULATORY_PROFILES.md) |

---

## Version history

| Version | Date | Summary |
|---------|------|---------|
| 1.0 | 2026-06-17 | Initial constitution; AI Studio design integrated |
