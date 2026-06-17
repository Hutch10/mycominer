# Immutable Claim Snapshots

**Document ID:** MIP-CLAIM-SNAP-1.0  
**Status:** Canonical contract (not yet implemented)  
**Parent:** [Scientific Claim Registry](./SCIENTIFIC_CLAIM_REGISTRY.md)

When a claim reaches `approved`, the platform writes an **immutable snapshot** capturing the full provenance state at approval time.

---

## 1. Purpose

- Enable **point-in-time audit** without replaying entire history
- Support **regulatory submission** and **publication** with fixed references
- Detect **silent drift** if underlying observations change (via supersession)

---

## 2. Snapshot contents

Each snapshot is an append-only record:

| Field | Description |
|-------|-------------|
| `snapshot_id` | UUID |
| `claim_id` | Parent claim |
| `snapshot_hash` | Hash of canonical snapshot JSON |
| `claim_text` | Text at approval |
| `observation_manifest` | Array of `{ id, content_hash, observed_at }` |
| `evidence_manifest` | Array of `{ blob_id, content_hash }` |
| `verification_run_id` | Verification output hash |
| `transformation_id` + `version` | Algorithm version |
| `approved_by` / `approved_at` | Approval metadata |
| `regulatory_profile_id` | Active profile at approval (if any) |
| `platform_version` | `architecture_version` + `migration_version` |

---

## 3. Invariants

| ID | Rule |
|----|------|
| S-1 | Snapshots are append-only; never updated |
| S-2 | New approval after supersession creates **new** snapshot |
| S-3 | Export packages reference `snapshot_id` + `snapshot_hash` |
| S-4 | Replay from snapshot manifest must reproduce verification `output_hash` |

---

## 4. Supersession behavior

If an observation in the manifest is later superseded:

- The snapshot remains **valid for historical audit** (what was known at approval)
- Downstream systems must check **current** observation stream for live decisions
- [Claim Change Impact Reports](./CLAIM_CHANGE_IMPACT_REPORTS.md) flag affected claims

---

## 5. Storage

Proposed table: `claim_snapshots` (append-only, RLS by `org_id`).

Large manifests may use content-addressed blob storage with hash in row.

---

## 6. Current implementation status

**Missing** — no snapshot table or export integration.

Operational report snapshots (`performance-snapshots`, `alert-snapshots` in archive center) are **operational**, not scientific claim snapshots.

---

## Version history

| Version | Date | Summary |
|---------|------|---------|
| 1.0 | 2026-06-17 | Immutable snapshot contract |
