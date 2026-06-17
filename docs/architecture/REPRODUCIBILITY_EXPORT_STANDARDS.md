# Reproducibility Export Standards

**Document ID:** MIP-EXPORT-1.0  
**Status:** Canonical contract (not yet implemented)  
**Parent:** [Scientific Claim Registry](./SCIENTIFIC_CLAIM_REGISTRY.md), [Immutable Claim Snapshots](./IMMUTABLE_CLAIM_SNAPSHOTS.md)

Defines **machine-readable export packages** that enable independent reproduction of verified claims.

---

## 1. Supported formats (v1.0)

| Format | Use case | Standard |
|--------|----------|----------|
| **RO-Crate** | FAIR research publication | W3C RO-Crate 1.1+ |
| **Reviewer Replay Package** | Journal / auditor reproduction | Platform bundle (ZIP) |
| **Observation Manifest** | Raw data citation | JSON + content hashes |
| **Claim Snapshot Export** | Point-in-time certified conclusion | JSON + snapshot hash |

Informational insights **must not** use these formats without `informational_only: true` watermark.

---

## 2. Reviewer Replay Package structure

```
replay-package-{snapshot_id}/
  MANIFEST.json              # Package metadata, hashes
  claims/
    {claim_id}.json          # Claim + snapshot reference
  observations/
    manifest.json            # observation_id → content_hash
    bundles/                 # Optional embedded bundles
  evidence/
    manifest.json            # blob_id → content_hash
  transformations/
    {id}@{version}.json      # Algorithm spec + parameters schema
  scripts/
    replay.sh                # Documented replay steps
  LICENSE.txt
  METHODS.md                 # Auto-generated methods section
```

---

## 3. MANIFEST.json (required fields)

```json
{
  "export_version": "1.0",
  "generated_at": "ISO-8601",
  "org_id": "string",
  "architecture_version": "1.0",
  "migration_version": "008",
  "snapshot_ids": ["uuid"],
  "content_hashes": {
    "package": "sha256:..."
  },
  "regulatory_profile_id": "optional"
}
```

---

## 4. Methods section generation

Auto-include:

- Observation count and time range
- Transformation names and versions
- Verification run hashes
- Known limitations from claim record
- Software versions (`platform_version` from snapshot)

---

## 5. Invariants

| ID | Rule |
|----|------|
| X-1 | Export bytes hashed; hash in manifest |
| X-2 | Verified export requires approved claim + snapshot |
| X-3 | Redaction per [Regulatory Profiles](./REGULATORY_PROFILES.md) |
| X-4 | Missing evidence → export blocked or marked incomplete |

---

## 6. API contract (additive, post-GA)

| Method | Route | Semantics |
|--------|-------|-----------|
| POST | `/api/publications/export` | Generate package by `snapshot_id` or `claim_id` |
| GET | `/api/publications/export/:id` | Download signed URL |

---

## 7. Current implementation status

| Area | Status |
|------|--------|
| `ExportEngine` auditor package | **Conflicting** — placeholder text bytes |
| FAIR metadata | **Missing** |
| RO-Crate | **Missing** |

---

## Version history

| Version | Date | Summary |
|---------|------|---------|
| 1.0 | 2026-06-17 | Export standards contract |
