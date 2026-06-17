# Evidence Accrual Engine

**Document ID:** MIP-EVID-ACC-1.0  
**Status:** Canonical contract (not yet implemented)  
**Parent:** [Scientific Constitution](./SCIENTIFIC_CONSTITUTION.md)  
**Implementation:** Post-GA migration M3 (blobs) + M4 (observation linkage)

The Evidence Accrual Engine **accumulates and preserves raw evidence** (media, files, instrument exports) with integrity guarantees and links evidence to observations.

---

## 1. Purpose

Satisfy constitution invariants **raw evidence preservation** and **mandatory provenance**. Observations of type `image` and `lab_import` reference evidence blobs; the engine manages storage, hashing, and custody metadata.

---

## 2. Accrual pipeline

```
Upload / ingest → Server hash verify → Store (tiered) → Register blob record
  → Link to observation(s) → Append custody event (optional)
```

**Accrual** means evidence is **never discarded** on normalization; derived views reference blobs by ID and hash.

---

## 3. Blob record

| Field | Description |
|-------|-------------|
| `id` | UUID |
| `org_id` | Tenant |
| `content_hash` | SHA-256 of bytes (server-computed) |
| `mime_type` | Detected or declared |
| `byte_size` | Original size |
| `storage_uri` | Object store path (Supabase Storage or equivalent) |
| `storage_tier` | `hot` \| `warm` \| `archive` |
| `captured_at` | When evidence was captured (if known) |
| `ingested_at` | Server receipt |
| `source_device_id` | Camera, instrument, etc. |
| `legal_hold` | Boolean — blocks tier downgrade |

---

## 4. Linkage model

`evidence_links` table:

| Field | Description |
|-------|-------------|
| `observation_id` | Parent observation |
| `blob_id` | Evidence blob |
| `role` | `primary` \| `thumbnail` \| `attachment` \| `instrument_raw` |

One blob may link to multiple observations (e.g., shared plate photo).

---

## 5. Invariants

| ID | Rule |
|----|------|
| E-1 | Blobs are immutable after `content_hash` verification |
| E-2 | Hash mismatch on upload → reject |
| E-3 | Deletion prohibited; archival tier migration only |
| E-4 | All exports include blob hash in manifest |
| E-5 | Client cannot set `content_hash` without server verify |

---

## 6. API contract (additive, post-GA)

| Method | Route | Semantics |
|--------|-------|-----------|
| POST | `/api/evidence/blobs` | Presigned upload + register |
| GET | `/api/evidence/blobs/:id` | Metadata + signed download URL |
| POST | `/api/evidence/links` | Link blob to observation |

---

## 7. Current implementation status

| Area | Status |
|------|--------|
| Object storage pipeline | **Missing** |
| Community grow-log images | **Partial** — no server hash |
| Export placeholder bundles | **Conflicting** — no real evidence manifest |

---

## Version history

| Version | Date | Summary |
|---------|------|---------|
| 1.0 | 2026-06-17 | Evidence accrual contract |
