# Scientific Invariants (Frozen)

**Version:** 1.0  
**Status:** Frozen — changes require explicit architecture review and version bump  
**Authority:** [Scientific Constitution](./SCIENTIFIC_CONSTITUTION.md) · Mushroom Intelligence Platform Master Architecture v1.0

These invariants apply to all scientific functionality. Operational orchestration (billing, workflows, marketplace checkout) must still meet audit requirements but is not governed by the scientific claim contract until integrated with the Observation Engine.

---

## 1. Immutable observations

- Observations are **append-only** events.
- Corrections use **supersession** (new observation references prior); never in-place overwrite of raw values.
- Observation IDs are stable, globally unique within a tenant scope.

## 2. Raw evidence preservation

- Raw sensor payloads, images, lab instrument exports, and human-entered values are stored **indefinitely** in original or lossless form.
- Normalization is a **derived** layer; raw remains addressable.

## 3. Mandatory provenance

- Every derived artifact (metric, graph edge, twin state, insight, recommendation, export) must reference:
  - source observation ID(s)
  - transformation identity (algorithm / formula / pipeline)
  - transformation version
  - actor or system component that produced the derivation

## 4. Deterministic replay

- Given stored observations, transformation version, and parameters, an independent auditor must reproduce the same derived output (within declared numerical tolerance).
- Non-reproducible outputs must be labeled **informational only**, not verified scientific knowledge.

## 5. Append-only audit trails

- Security, governance, and scientific mutation events use append-only logs.
- Deletes are prohibited for audit and observation stores; retention policies use archival tiers, not silent removal.

## 6. Explainable AI

- AI-assisted outputs must expose reasoning structure: inputs consulted, policies applied, tools invoked, and limitations.
- Opaque model output must not be presented as verified scientific conclusion.

## 7. Human approval for consequential actions

- Closed-loop cultivation intelligence remains **advisory** until validation thresholds are met.
- Environmental control, batch disposition, publication submission, and claim promotion require explicit human approval with audit record.

## 8. Formal Scientific Claim Registry

- The **Scientific Claim Registry** is the canonical source of **scientific conclusions** (verified claims), distinct from informational insights or operator recommendations.
- A claim enters the registry only after verification workflow passes and provenance/replay gates are satisfied.
- Downstream publication, FAIR export, and federation sharing of "verified" status must cite registry entries.

---

## Governing doctrine

```
Observation → Verification → Evidence → Knowledge → Intelligence → Recommendation
```

No module may invert this sequence (e.g., generate claims without observations).

## Acceptance gate (all new scientific modules)

1. What observations produced this result?
2. Which algorithm/version transformed those observations?
3. Can an independent auditor replay and obtain the same output?
4. If not, is the output explicitly marked non-verified?

## Planned canonical contract (post-GA)

`OBSERVATION_ENGINE_SPECIFICATION.md` will be frozen as the implementation contract for invariants 1–4. Until GA completes, this document defines the target invariants; implementation is tracked in [ARCHITECTURE_ALIGNMENT_REPORT.md](./ARCHITECTURE_ALIGNMENT_REPORT.md).
