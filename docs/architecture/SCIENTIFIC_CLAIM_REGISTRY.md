# Scientific Claim Registry

**Document ID:** MIP-CLAIM-REG-1.0  
**Status:** Canonical contract (not yet implemented)  
**Parent:** [Scientific Constitution](./SCIENTIFIC_CONSTITUTION.md)  
**Implementation:** Post-GA migration M5

The **Scientific Claim Registry** is the sole canonical source of **verified scientific conclusions** on the platform.

---

## 1. Purpose

Distinguish **verified science** from informational insights, operator recommendations, and AI-generated text. Federation, publication, and regulatory exports may cite **verified** status only from registry entries.

---

## 2. Claim lifecycle

```
draft → submitted → under_review → approved | rejected → superseded
```

| State | Meaning |
|-------|---------|
| `draft` | Author composing; not visible as verified |
| `submitted` | Awaiting verification run + reviewer |
| `under_review` | Human reviewer assigned |
| `approved` | Verified claim; eligible for export and KG linkage |
| `rejected` | Failed verification or review |
| `superseded` | Replaced by newer approved claim |

State transitions are **append-only events** in `claim_audit_log`.

---

## 3. Claim record (required fields)

| Field | Description |
|-------|-------------|
| `id` | Stable UUID |
| `org_id` | Tenant |
| `claim_text` | Human-readable conclusion |
| `claim_type` | Taxonomy: `measurement`, `classification`, `causal`, `comparative`, etc. |
| `status` | Lifecycle state |
| `verification_run_id` | Link to Verification Engine output |
| `observation_ids` | Source observations (minimum one) |
| `transformation_id` + `version` | Algorithm that produced result |
| `confidence` | Point estimate |
| `uncertainty` | Interval or distribution metadata |
| `limitations` | Explicit scope limits |
| `approved_by` / `approved_at` | Human approval record |
| `informational_only` | `false` only when fully verified |

---

## 4. Promotion gates

A claim may reach `approved` only when:

1. All source observations exist and are non-superseded (or supersession chain documented).
2. Verification Engine replay matches stored `output_hash`.
3. Human reviewer attests scope and limitations.
4. [Immutable Claim Snapshot](./IMMUTABLE_CLAIM_SNAPSHOTS.md) is written.
5. Regulatory profile constraints satisfied (if applicable).

---

## 5. Downstream binding

| Artifact | Requirement |
|----------|-------------|
| Knowledge Graph edge (`verified: true`) | Must include `claim_id` |
| FAIR / RO-Crate export | Claims section cites registry IDs |
| Federation share | Verified badge requires registry lookup |
| UI "Verified" badge | `claim_id` + snapshot hash displayed |

---

## 6. API contract (additive, post-GA)

| Method | Route | Semantics |
|--------|-------|-----------|
| POST | `/api/claims` | Create draft |
| POST | `/api/claims/:id/submit` | Trigger verification |
| POST | `/api/claims/:id/approve` | Human approval |
| POST | `/api/claims/:id/reject` | Human rejection |
| GET | `/api/claims/:id/provenance` | Full provenance chain |
| GET | `/api/claims` | Paginated list, filter by status |

---

## 7. Current implementation status

| Area | Status |
|------|--------|
| Database schema | **Missing** |
| API routes | **Missing** |
| `app/insights/knowledgePackLibrary.ts` | **Partial** — static packs, not registry |
| Federation org verification | **Conflicting** — org trust ≠ specimen claim |

---

## Version history

| Version | Date | Summary |
|---------|------|---------|
| 1.0 | 2026-06-17 | Registry contract from AI Studio architecture |
