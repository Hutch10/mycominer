# Claim Change Impact Reports

**Document ID:** MIP-CLAIM-IMPACT-1.0  
**Status:** Canonical contract (not yet implemented)  
**Parent:** [Scientific Claim Registry](./SCIENTIFIC_CLAIM_REGISTRY.md), [Immutable Claim Snapshots](./IMMUTABLE_CLAIM_SNAPSHOTS.md)

When source observations, evidence, or transformations change, the platform generates **Claim Change Impact Reports** (CCIRs) listing affected verified claims.

---

## 1. Purpose

- Prevent silent invalidation of verified conclusions
- Give reviewers actionable lists when supersession or calibration updates occur
- Support regulatory re-review workflows

---

## 2. Trigger events

| Event | CCIR scope |
|-------|------------|
| Observation superseded | Claims citing original observation |
| Evidence blob re-linked | Claims with evidence in manifest |
| Transformation version deprecated | Claims using that version |
| Calibration certificate expired | Claims on affected device observations |
| Golden dataset regression failure | Claims verified by affected transformation |

---

## 3. Report structure

| Field | Description |
|-------|-------------|
| `report_id` | UUID |
| `org_id` | Tenant |
| `trigger_event` | Event type + reference IDs |
| `generated_at` | UTC |
| `affected_claim_ids` | List of approved/superseded claims |
| `affected_snapshot_ids` | Snapshots now historically inconsistent with live stream |
| `recommended_actions` | `re_verify` \| `supersede_claim` \| `informational_downgrade` \| `no_action` |
| `severity` | `low` \| `medium` \| `high` \| `critical` |

---

## 4. Workflow

```
Trigger detected → Compute dependency graph (claims ← observations ← evidence)
  → Generate CCIR → Notify reviewers → Optional auto-downgrade to informational (policy)
```

**Human approval** required before auto-revoking `approved` status (constitution Article VII).

---

## 5. API contract (additive, post-GA)

| Method | Route | Semantics |
|--------|-------|-----------|
| GET | `/api/claims/impact-reports` | List CCIRs |
| GET | `/api/claims/impact-reports/:id` | Full report |
| POST | `/api/claims/impact-reports/:id/acknowledge` | Reviewer acknowledgment |

---

## 6. Current implementation status

**Missing** — no dependency graph from claims to observations exists in codebase.

Related partial: `app/fabric/` lineage links are not claim-aware.

---

## Version history

| Version | Date | Summary |
|---------|------|---------|
| 1.0 | 2026-06-17 | CCIR contract |
