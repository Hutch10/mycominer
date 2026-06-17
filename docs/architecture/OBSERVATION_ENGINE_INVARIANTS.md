# Observation Engine — Invariants

**Document ID:** MIP-OBS-INV-1.0  
**Status:** Canonical contract (pre-implementation spec)  
**Parent:** [Scientific Constitution](./SCIENTIFIC_CONSTITUTION.md)  
**Implementation:** Post-GA migration M4 — see [MIGRATION_PLAN.md](./MIGRATION_PLAN.md)

The Observation Engine is the **scientific substrate**. All downstream modules consume observations; none may bypass this layer for verified science.

---

## 1. Event model

Every observation is an **immutable event** with:

| Field | Required | Description |
|-------|----------|-------------|
| `id` | Yes | Stable UUID within tenant |
| `org_id` | Yes | Tenant scope |
| `observation_type` | Yes | `human` \| `sensor` \| `image` \| `lab_import` \| `system` |
| `observed_at` | Yes | UTC timestamp (event time, not ingest time) |
| `ingested_at` | Yes | UTC server receipt time |
| `actor_id` | Conditional | Human or service identity |
| `device_id` | Conditional | Sensor or instrument identity |
| `raw_payload` | Yes | Lossless original values |
| `normalized_payload` | No | Derived normalization (separate from raw) |
| `calibration` | No | Calibration status, offset, certificate ref |
| `batch_id` / `facility_id` | No | Operational linkage |
| `content_hash` | Yes | Cryptographic hash of canonical raw envelope |
| `supersedes_id` | No | Prior observation this event corrects |
| `evidence_blob_ids` | No | Linked media from Evidence Accrual Engine |

---

## 2. Invariants (non-negotiable)

### O-1 Append-only

- `INSERT` only on `observations` table.
- `UPDATE` and `DELETE` prohibited by database triggers.
- Corrections create a **new** observation with `supersedes_id`.

### O-2 Raw preservation

- `raw_payload` is never modified after insert.
- Normalization writes only to `normalized_payload` or derived tables.

### O-3 Hash integrity

- `content_hash` computed server-side from canonical JSON (sorted keys, UTF-8).
- Client-supplied hashes are verified, not trusted blindly.

### O-4 Provenance envelope

Every observation records:

- source channel (UI, API, MQTT adapter, CSV import, lab instrument)
- ingestion pipeline version
- optional device firmware / instrument software version

### O-5 Supersession chain

- Supersession forms a directed acyclic graph.
- Queries default to **latest non-superseded** per logical stream unless historical replay requested.

### O-6 Tenant isolation

- RLS enforces `org_id` from JWT; client-supplied org IDs rejected.

### O-7 Replay contract

Given observation set + transformation version, derived outputs must be reproducible within declared numerical tolerance.

---

## 3. Observation types

| Type | Source | Raw payload examples |
|------|--------|---------------------|
| `human` | Operator UI, field app | Text notes, manual readings, classifications |
| `sensor` | MQTT, ESP32, CSV, telemetry adapter | JSON readings, units, sequence numbers |
| `image` | Camera, upload | Reference to evidence blob + capture metadata |
| `lab_import` | LIMS, instrument export | Original file hash + parsed fields |
| `system` | Platform events | Workflow step completion, calibration job |

---

## 4. API contract (additive, post-GA)

| Method | Route | Semantics |
|--------|-------|-----------|
| POST | `/api/observations` | Append observation |
| GET | `/api/observations` | Paginated, org-scoped, filter by type/time/batch |
| POST | `/api/observations/:id/supersede` | Create superseding observation |

No `PATCH` or `DELETE` routes.

---

## 5. Downstream consumption rules

| Consumer | Rule |
|----------|------|
| Digital Twin | Reconstruct state from observation stream |
| Knowledge Graph | Edges require `observation_ids[]` or `claim_id` |
| Insights | Informational until `claim_id` attached |
| Agents | Context may cite observations; conclusions require claim path |
| Exports | Verified exports cite observations + claim snapshots |

---

## 6. Relationship to full specification

After operational GA, `OBSERVATION_ENGINE_SPECIFICATION.md` will freeze JSON schemas, hash algorithms, and adapter interfaces. This document defines **invariants**; the specification defines **implementation details**.

---

## Version history

| Version | Date | Summary |
|---------|------|---------|
| 1.0 | 2026-06-17 | Initial invariant set from AI Studio + locked governance |
