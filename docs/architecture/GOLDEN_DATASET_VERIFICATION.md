# Golden Dataset Verification

**Document ID:** MIP-GOLDEN-1.0  
**Status:** Canonical contract (not yet implemented)  
**Parent:** [Scientific Constitution](./SCIENTIFIC_CONSTITUTION.md)

Golden datasets are **frozen reference observation sets** with known verification outcomes. They regression-test transformations and verification pipelines.

---

## 1. Purpose

- Prove **deterministic replay** (constitution invariant 4)
- Block promotion of transformation versions that fail regression
- Provide auditor-ready evidence that algorithms behave as documented

---

## 2. Golden dataset record

| Field | Description |
|-------|-------------|
| `dataset_id` | UUID |
| `name` | e.g. `spawn-viability-v1` |
| `version` | Semver |
| `observation_bundle_uri` | Immutable bundle of observations + evidence hashes |
| `expected_outputs` | Map of `transformation_id@version` → `output_hash` |
| `tolerance` | Numerical tolerance metadata |
| `approved_by` | Steward who froze dataset |
| `frozen_at` | UTC |

---

## 3. Verification harness flow

```
On transformation version publish:
  Load golden datasets for that transformation family
  → Replay each bundle
  → Compare output_hash to expected
  → PASS: allow registry promotion
  → FAIL: block + generate CCIR if prior claims used failed version
```

Integrated with [GA Certification Harness](./GA_CERTIFICATION_HARNESS.md) for platform releases (operational subset) and scientific CI (full golden suite post-GA).

---

## 4. Dataset stewardship

| Rule | Description |
|------|-------------|
| G-1 | Golden data is append-only; new versions get new `dataset_id` or semver bump |
| G-2 | Source observations in golden bundles are real (anonymized) or synthetically documented |
| G-3 | Failed regression blocks `approved` claim promotion using affected transformation |
| G-4 | Results published in verification run log |

---

## 5. Repository layout (planned)

```
tests/golden/
  manifest.json          # Index of datasets
  spawn-viability-v1/
    observations.json
    evidence/            # Content-addressed blobs
    expected.json
```

---

## 6. Current implementation status

| Area | Status |
|------|--------|
| Golden datasets | **Missing** |
| `tests/ga-operational.test.ts` | **Partial** — operational Stripe/idempotency only |
| Transformation registry | **Missing** |

---

## Version history

| Version | Date | Summary |
|---------|------|---------|
| 1.0 | 2026-06-17 | Golden dataset contract |
