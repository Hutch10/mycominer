# Migration Plan — Architecture v1.0

**Version:** 1.0  
**Status:** Planning only — **no schema or API changes authorized until GA operational gates complete**  
**Prerequisite:** [SCIENTIFIC_INVARIANTS.md](./SCIENTIFIC_INVARIANTS.md) accepted; `OBSERVATION_ENGINE_SPECIFICATION.md` frozen (post-GA)

This plan migrates MycoMiner from RC operations platform to Mushroom Intelligence Platform v1.0 without breaking existing orchestration, billing, or marketplace contracts.

---

## Principles

1. **Additive first** — new tables and routes; deprecate later
2. **Dual-write optional** — observation layer can shadow existing telemetry before cutover
3. **Backwards compatible APIs** — version headers or `/api/v2/` only when necessary
4. **No big-bang** — each phase has rollback and evidence checklist

---

## Phase overview

| Phase | Name | GA blocker? | Schema change? | API change? |
|-------|------|-------------|----------------|-------------|
| M0 | Documentation & alignment | No | No | No |
| M1 | Operational GA completion | Yes | No* | No |
| M2 | Observation spec freeze | No | No | No |
| M3 | Evidence store foundations | No | Yes | Additive |
| M4 | Observation Engine MVP | No | Yes | Additive |
| M5 | Verification + Claim Registry | No | Yes | Additive |
| M6 | Downstream refactors | No | Yes | Versioned reads |
| M7 | LIMS & custody workflows | No | Yes | Additive |
| M8 | Publication / FAIR export | No | Yes | Additive |

\*Migrations 001–008 already applied for orchestration; no new migrations until M3.

---

## M0 — Documentation (current)

**Deliverables:**
- Master Architecture v1.0
- Alignment Report
- Scientific Invariants
- Legacy phase map

**Exit criteria:** Architecture docs are default onboarding path; README points to `docs/architecture/`

---

## M1 — Operational GA (in progress)

**Scope:** Vercel deploy, Supabase env, Upstash, Stripe test, DR drill, 72h burn-in

**No scientific migrations.**

**Exit criteria:** `docs/operations/ga-certification-report.md` → GA Ready

---

## M2 — Freeze observation contract

**Deliverables:**
- `docs/architecture/OBSERVATION_ENGINE_SPECIFICATION.md` (new, frozen)
- JSON schema for observation event envelope
- Hash/signature algorithm choice documented

**Exit criteria:** Explicit approval recorded; spec version `1.0.0-frozen`

---

## M3 — Evidence store foundations

**New tables (proposed `mycominer` schema):**

```sql
-- Illustrative; finalize in OBSERVATION_ENGINE_SPECIFICATION.md
evidence_blobs (id, org_id, content_hash, mime_type, storage_uri, created_at, ...)
evidence_links (id, org_id, observation_id, blob_id, role, ...)
```

**API (additive):**
- `POST /api/evidence/blobs` (presigned upload + hash verify)
- `GET /api/evidence/blobs/:id`

**Backwards compatibility:** No changes to existing routes.

**Rollback:** Drop new tables if empty; no orchestration impact.

---

## M4 — Observation Engine MVP

**New tables:**
```sql
observations (
  id uuid primary key,
  org_id text not null,
  observation_type text not null, -- human|sensor|image|lab_import|system
  observed_at timestamptz not null,
  actor_id text,
  device_id text,
  raw_payload jsonb not null,
  normalized_payload jsonb,
  calibration jsonb,
  batch_id text,
  facility_id text,
  content_hash text not null,
  supersedes_id uuid references observations(id),
  created_at timestamptz not null default now()
);
-- append-only triggers; no update/delete
observation_index_by_org_time ...
```

**API (additive):**
- `POST /api/observations` — append only
- `GET /api/observations` — paginated, org-scoped
- `POST /api/observations/:id/supersede`

**Integration:**
- Shadow-write from digital twin telemetry hooks (feature flag)

**Exit criteria:** Replay job reproduces sample twin state from observations

---

## M5 — Verification engine + Scientific Claim Registry

**New tables:**
```sql
transformation_registry (id, name, version, algorithm_ref, parameters_schema, ...)
verification_runs (id, org_id, observation_set_id, transformation_id, input_hash, output_hash, ...)
scientific_claims (
  id, org_id, claim_text, status, verification_run_id,
  confidence, uncertainty, limitations, approved_by, approved_at, ...
);
```

**API (additive):**
- `POST /api/verification/run`
- `POST /api/claims` (draft)
- `POST /api/claims/:id/submit` → human approval
- `POST /api/claims/:id/approve` | `reject`
- `GET /api/claims/:id/provenance`

**Downstream rule:** Insights/KG edges referencing `verified: true` must include `claim_id`.

---

## M6 — Downstream refactors (non-breaking)

| Module | Migration approach |
|--------|-------------------|
| Digital Twin | Read model from observations; deprecate inline sample data |
| Knowledge Graph | Edge create requires `observation_ids[]` or `claim_id` |
| Fabric | Map `is-sourced-from` to observation IDs |
| Forecasting / analytics | Tag outputs `informational` until claim-linked |
| Insights | Split `KnowledgePack` vs `VerifiedClaim` types |
| Agent runtime | Persist explainability graphs; link to observation context |

**API versioning:** Prefer response fields `provenance: { observationIds, transformationVersion }` on existing DTOs.

---

## M7 — LIMS & chain of custody

**New tables:** `specimens`, `custody_events`, `lab_assays`, `transfers`

**Workflows:** Map to existing orchestration engine with new step types

**Depends on:** M4 observations for environmental logging, harvest, contamination events

---

## M8 — Publication / FAIR

**Deliverables:**
- RO-Crate export from Claim Registry + observations
- Methods section generator (transformation versions)
- Reviewer replay package (observation subset + scripts)

**API:** `POST /api/publications/export`

---

## Risk register

| Risk | Mitigation |
|------|------------|
| Dual telemetry paths during M4 shadow-write | Feature flag `OBSERVATION_ENGINE_SHADOW` |
| In-memory engines ignore observations | Alignment labels in UI until refactored |
| Schema sprawl | All scientific tables in `mycominer` schema with RLS |
| Performance of append-only store | Partition by `observed_at`; archive policy |

---

## Approval required before execution

- [ ] GA operational gates complete
- [ ] `OBSERVATION_ENGINE_SPECIFICATION.md` frozen
- [ ] Migration M3+ reviewed for RLS and org isolation
- [ ] Operator sign-off on backwards compatibility matrix
