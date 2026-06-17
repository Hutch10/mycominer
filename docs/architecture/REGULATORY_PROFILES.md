# Regulatory Profiles

**Document ID:** MIP-REG-PROF-1.0  
**Status:** Canonical contract (not yet implemented)  
**Parent:** [Scientific Constitution](./SCIENTIFIC_CONSTITUTION.md)

Regulatory profiles encode **jurisdiction-specific constraints** on claims, exports, retention, and approval workflows.

---

## 1. Purpose

Organizations operating under food safety, research ethics, or export control regimes enable a profile that **gates** claim promotion and export without forking the codebase.

---

## 2. Profile record

| Field | Description |
|-------|-------------|
| `profile_id` | e.g. `us-fda-food`, `eu-gmp-research`, `internal-qa` |
| `name` | Display name |
| `retention_years` | Minimum evidence retention |
| `requires_dual_approval` | Two human approvers for claims |
| `export_formats_allowed` | Subset of reproducibility formats |
| `pii_redaction_rules` | Field-level redaction for exports |
| `audit_fields_required` | Extra metadata on observations/claims |
| `chain_of_custody_required` | Boolean for specimen workflows |

---

## 3. Enforcement points

| Stage | Profile check |
|-------|---------------|
| Observation ingest | Required metadata fields |
| Claim submit | Approval count, reviewer roles |
| Snapshot write | Profile ID stamped on snapshot |
| Export | Format allowlist + redaction |
| CCIR severity | Escalation rules per profile |

---

## 4. Built-in profiles (v1.0 catalog)

| Profile | Use case |
|---------|----------|
| `default` | Standard cultivation operations; informational + verified paths |
| `research-export` | FAIR/RO-Crate required fields enforced |
| `food-safety` | Dual approval + extended retention |
| `internal-qa` | Golden dataset regression required before claim approval |

Profiles are **configuration**, not code branches.

---

## 5. Current implementation status

| Area | Status |
|------|--------|
| Profile engine | **Missing** |
| Compliance module | **Partial** — CAPA in-memory; not profile-driven |
| Enterprise reporting regulatory tags | **Partial** — copy only |
| Federation org verification | **Partial** — not regulatory profile |

---

## Version history

| Version | Date | Summary |
|---------|------|---------|
| 1.0 | 2026-06-17 | Regulatory profile contract |
