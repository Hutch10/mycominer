# Mushroom Intelligence Platform — Master Architecture v1.0

**Document ID:** MIP-ARCH-1.0  
**Status:** Approved source of truth  
**Supersedes:** Distributed phase summaries as primary architecture reference  
**Canonical design input:** Google AI Studio (Mushroom Intelligence Platform)  
**Implementation repository:** MycoMiner (`github.com/Hutch10/mycominer`)

---

## 1. Purpose

This document integrates the **Google AI Studio architectural vision**, the **locked project constitution**, and the **implemented MycoMiner codebase** into a single maintainable architecture.

It exists so engineers, operators, and auditors can answer:

- What the platform is meant to be
- What is already built
- What must not be built before evidence foundations exist
- How scientific credibility is preserved

---

## 2. System context

```
                    ┌──────────────────────────────────────┐
                    │  Operators · Scientists · Reviewers   │
                    └──────────────────┬───────────────────┘
                                       │
         ┌─────────────────────────────▼─────────────────────────────┐
         │              Next.js Application (MycoMiner)               │
         │  Experience · Operations · Intelligence surfaces           │
         │  API routes · Auth · Rate limits · Deployment fingerprint  │
         └─────────────┬───────────────────────┬─────────────────────┘
                       │                       │
         ┌─────────────▼────────────┐   ┌──────▼──────────────────────┐
         │  Agent Runtime (Express)  │   │  Supabase PostgreSQL         │
         │  Orchestrator · Policy    │   │  `mycominer` schema          │
         │  Explainability (session) │   │  Workflows · Billing · Audit   │
         └──────────────────────────┘   └──────────────────────────────┘
                       │
         ┌─────────────▼────────────────────────────────────────────┐
         │  Post-GA scientific stores (planned, not yet deployed)      │
         │  Observations · Evidence blobs · Claims · Custody · TSDB   │
         └──────────────────────────────────────────────────────────┘
```

---

## 3. Architectural layers

See [CANONICAL_VISION.md](./CANONICAL_VISION.md) for the full layer diagram.

| Layer | v1.0 responsibility | Implementation maturity |
|-------|---------------------|-------------------------|
| Experience | Dashboards, training, SOP, community, guides | **High** — extensive phased UI |
| Operations | Workflows, multi-facility, alerts, compliance, marketplace | **Medium** — persistence for orchestration/billing |
| Intelligence | Agents, insights, forecasting, advisory closed-loop | **Medium** — deterministic engines; advisory not gated uniformly |
| Knowledge | Fabric, KG, Hub, federation | **Medium** — strong engines; evidence linkage weak |
| Scientific core | Observations, verification, claims, formulas, custody, DQ | **Low** — designed, not implemented |
| Evidence | Raw media, telemetry, lab imports | **Low** |
| Governance & trust | Policy, audit, explainability, human approval | **Medium** — DB audit for orchestration; ephemeral elsewhere |
| Infrastructure | Supabase, Upstash, Stripe, Vercel, DR | **Medium** — RC recovery done; GA env incomplete |

---

## 4. Scientific doctrine

### 4.1 Philosophy sequence

```
Observation → Verification → Evidence → Knowledge → Intelligence → Recommendation
```

Intelligence and recommendations are **downstream**. They must not author scientific truth without passing through verification and the Claim Registry.

### 4.2 Frozen invariants

See [SCIENTIFIC_INVARIANTS.md](./SCIENTIFIC_INVARIANTS.md). Summary:

1. Immutable observations  
2. Raw evidence preservation  
3. Mandatory provenance  
4. Deterministic replay  
5. Append-only audit trails  
6. Explainable AI  
7. Human approval for consequential actions  
8. Scientific Claim Registry as canonical source of conclusions  

### 4.3 Informational vs verified

| Class | Definition | May appear in UI | May export as science |
|-------|------------|------------------|------------------------|
| **Informational** | Helpful but not replay-verified | Yes, labeled | No |
| **Verified** | Claim Registry entry with provenance | Yes | Yes |

Current engines default to **informational** unless explicitly integrated post-M5.

---

## 5. Domain architecture

### 5.1 Observation & evidence (target)

**Observation Engine** captures typed events: `human | sensor | image | lab_import | system`.

Each observation carries: stable ID, UTC time, actor/device, raw payload, optional normalized values, calibration, batch/facility linkage, content hash, optional `supersedes_id`.

**Evidence Repository** stores blobs (images, files) with server-computed hashes linked to observations.

**Telemetry Store** (durable TSDB) feeds Digital Twin replay and data quality modules.

*Status: Missing — see [MIGRATION_PLAN.md](./MIGRATION_PLAN.md) M3–M4.*

### 5.2 Verification & claims (target)

**Verification Engine** runs versioned transformations over observation sets, records input/output hashes, exposes uncertainty.

**Scientific Claim Registry** holds approved conclusions. Promotion requires human approval and successful replay check.

*Status: Missing — M5.*

### 5.3 Knowledge mesh (implemented, refactor pending)

| Component | Path | Role |
|-----------|------|------|
| Fabric | `app/fabric/` | Cross-engine links, lineage, `is-sourced-from` |
| Knowledge Graph | `app/knowledgeGraph/` | Entity relationships |
| Intelligence Hub | `app/intelligenceHub/` | Unified operator queries |
| Insights | `app/insights/` | Knowledge packs, assembled insights |

**v1.0 alignment action:** Require observation or claim IDs on edges post-M6.

### 5.4 Operations plane (implemented)

| Component | Path | Persistence |
|-----------|------|-------------|
| Workflow orchestration | `app/api/workflows/*`, `app/lib/orchestration/` | Supabase RPCs |
| Marketplace | `app/marketplace/`, `app/api/marketplace/*` | Checkout sessions + revenue |
| Billing / economy | `app/api/billing/*`, `app/api/economy/*` | Partial Supabase |
| Multi-facility | `app/multiFacility/` | In-memory |
| Digital Twin | `app/digitalTwin/` | Deterministic; sample-driven |
| Simulation / forecasting | `app/simulation/`, `app/forecasting/` | In-memory logs |
| Compliance | `app/compliance/` | In-memory |
| SOP / training | `app/sop/`, `app/training/` | In-memory |

### 5.5 Intelligence & agents (implemented, advisory)

| Component | Path | Notes |
|-----------|------|-------|
| Multi-agent API | `app/api/agent/route.ts` | Policy + explainability |
| Agent runtime | `agent-runtime/` | Express service |
| Domain agents | `app/agents/*` | Rule-based, non-LLM |
| Coach / optimization | `app/coach/`, `app/optimization/` | Recommendations |

**Invariant 7:** Closed-loop must remain recommend-only until validation data and approval middleware exist.

### 5.6 Federation (partial)

| Component | Path |
|-----------|------|
| Federation registry | `app/federation/services/` |
| Federation marketplace | `app/federationMarketplace/` |
| Trust graph API | `app/api/federation/trust-graph/` |

`ExplainabilityMetadata` in `app/federation/types.ts` models method, factors, data sources, limitations — align with invariant 6 for federated insights.

### 5.7 Governance & audit (partial)

| Mechanism | Scope | Durability |
|-----------|-------|------------|
| `orchestration_log` | Workflows, marketplace, billing mutations | **Durable**, append-only (migration 003) |
| `withApiMutationAuth` + `auditEventType` | API mutations | Durable when persisted |
| `governanceLog`, `complianceLog`, module `*Log.ts` | Domain engines | In-memory |
| Explainability graph | Agent sessions | In-memory |
| Policy engine | Pre/post message validation | Runtime |

---

## 6. Data architecture

### 6.1 Current persistent schema (`mycominer`)

| Table / artifact | Purpose |
|------------------|---------|
| `workflows`, `workflow_runs` | Org-scoped orchestration |
| `orchestration_log` | Append-only audit |
| `marketplace_checkout_sessions`, revenue | Atomic checkout |
| `invoices`, `license_tokens`, `reward_tokens` | Economy reads |
| `token_purchase_idempotency` | Durable idempotency |

Migrations `001`–`008` documented in `supabase/migrations/`.

### 6.2 Planned scientific schema

Detailed in [MIGRATION_PLAN.md](./MIGRATION_PLAN.md): `observations`, `evidence_blobs`, `scientific_claims`, `transformation_registry`, `custody_events`, etc.

### 6.3 Provenance chain (target end state)

```
Evidence blob → Observation → Transformation (versioned) → Verification run
  → Scientific claim → Knowledge graph edge / Export / Publication package
```

---

## 7. Security & multi-tenancy

- **Org isolation:** JWT `org_id` + `rejectClientOrgId`; workflow/marketplace RPCs org-scoped (migration 004)
- **Service role:** Server-only; secret scan in CI
- **Rate limiting:** Upstash required in production (`requirePersistenceBackend`)
- **RLS:** Enabled on orchestration tables; scientific tables will follow same pattern

---

## 8. Deployment & lifecycle

| State | Focus |
|-------|-------|
| **RC → GA** | Operational evidence only ([`docs/operations/`](../operations/)) |
| **Post-GA** | Observation spec freeze → migration M3+ |
| **Code freeze** | Exception-only until GA |

Deployment fingerprint (`app/lib/deploy/fingerprint.ts`): reports `migration_version` (currently `008`), `architecture_version` (`1.0`), git commit, release channel. See [Production Deployment Posture](./PRODUCTION_DEPLOYMENT_POSTURE.md).

---

## 9. Canonical module index

| Module | Document |
|--------|----------|
| Scientific governance | [Scientific Constitution](./SCIENTIFIC_CONSTITUTION.md) |
| Observations | [Observation Engine Invariants](./OBSERVATION_ENGINE_INVARIANTS.md) |
| Claims | [Scientific Claim Registry](./SCIENTIFIC_CLAIM_REGISTRY.md) |
| Evidence | [Evidence Accrual Engine](./EVIDENCE_ACCRUAL_ENGINE.md) |
| Snapshots & impact | [Immutable Claim Snapshots](./IMMUTABLE_CLAIM_SNAPSHOTS.md), [Claim Change Impact Reports](./CLAIM_CHANGE_IMPACT_REPORTS.md) |
| Verification science | [Golden Dataset Verification](./GOLDEN_DATASET_VERIFICATION.md) |
| Exports | [Reproducibility Export Standards](./REPRODUCIBILITY_EXPORT_STANDARDS.md) |
| Production | [Production Deployment Posture](./PRODUCTION_DEPLOYMENT_POSTURE.md), [GA Certification Harness](./GA_CERTIFICATION_HARNESS.md) |
| Quality gates | [ASP Validation](./ASP_VALIDATION.md) |
| Extensions | [Plugin SDK Governance](./PLUGIN_SDK_GOVERNANCE.md) |
| Field operations | [Offline-First Field Mode](./OFFLINE_FIRST_FIELD_MODE.md) |
| Compliance config | [Regulatory Profiles](./REGULATORY_PROFILES.md) |

---

## 10. Alignment & gaps

Full matrix: [ARCHITECTURE_ALIGNMENT_REPORT.md](./ARCHITECTURE_ALIGNMENT_REPORT.md)

**Strategic gap:** Platform excels at **operations orchestration** and **deterministic engines** but lacks **immutable observation substrate** and **Claim Registry**. This is expected pre-GA per governance.

---

## 10. Document maintenance

| Change type | Required action |
|-------------|-----------------|
| New scientific module | Update constitution, alignment report, migration plan |
| New operational gate | Update `docs/operations/` only |
| Breaking API | Migration plan + version bump to ARCH-1.x |
| AI Studio design revision | Update CANONICAL_VISION + Master Architecture minor version |

**Owners:** Architecture changes require review against [Scientific Constitution](./SCIENTIFIC_CONSTITUTION.md).

---

## 11. Related documents

- [Architecture README](./README.md) — full document hierarchy  
- [README.md](../../README.md) — engineering quick start  
- [LEGACY_PHASE_MAP.md](./LEGACY_PHASE_MAP.md) — phase module index  
- [RELEASE.md](../../RELEASE.md) — RC baseline  

---

## Version history

| Version | Date | Summary |
|---------|------|---------|
| 1.0 | 2026-06-17 | Initial integrated architecture; AI Studio vision + codebase audit |
| 1.0.1 | 2026-06-17 | Full canonical module index (15 production architecture docs) |
