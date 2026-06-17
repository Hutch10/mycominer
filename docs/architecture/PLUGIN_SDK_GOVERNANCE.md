# Plugin SDK Governance

**Document ID:** MIP-PLUGIN-1.0  
**Status:** Canonical contract (SDK not yet published)  
**Parent:** [Master Architecture v1.0](./MUSHROOM_INTELLIGENCE_PLATFORM_MASTER_ARCHITECTURE_v1.0.md)

Governance for **third-party and internal plugins** that extend the Mushroom Intelligence Platform (marketplace extensions, sensor adapters, transformation modules).

---

## 1. Principles

| Principle | Rule |
|-----------|------|
| Sandboxing | Plugins cannot bypass Observation Engine for verified science |
| Provenance | Plugins declare `transformation_id`, version, and input/output schemas |
| Least privilege | Scoped API tokens; org-bound |
| Audit | All plugin invocations append to orchestration or scientific audit log |
| No silent mutation | Plugins may not overwrite observations or claims |

---

## 2. Plugin categories

| Category | Examples | Verification |
|----------|----------|--------------|
| **Sensor adapter** | MQTT, ESP32, CSV importers | Emits observations only |
| **Transformation** | Metric calculators, classifiers | Registered in formula registry; golden tests required |
| **UI extension** | Dashboard widgets | Informational display unless `claim_id` bound |
| **Export formatter** | RO-Crate, custom reports | Must use [Reproducibility Export Standards](./REPRODUCIBILITY_EXPORT_STANDARDS.md) |
| **Federation connector** | Org data exchange | Trust graph + regulatory profile compliance |

---

## 3. SDK surface (planned)

```
@mycominer/plugin-sdk
  - registerSensorAdapter()
  - registerTransformation()
  - registerUiExtension()
  - manifest: { id, version, permissions[], observationTypes[] }
```

Plugins ship a **manifest** signed by publisher; marketplace verifies signature before install.

---

## 4. Permission model

| Permission | Grants |
|------------|--------|
| `observations:write` | Append observations (not update) |
| `evidence:write` | Accrue blobs via Evidence Accrual Engine |
| `claims:read` | Read approved claims |
| `transform:execute` | Run registered transformation |
| `export:generate` | Build export packages |

**Forbidden:** `observations:update`, `claims:approve`, `audit:delete`, `service_role`

---

## 5. Review and publication

1. Static analysis + secret scan on plugin bundle
2. Golden dataset pass for transformations
3. Security review for network egress
4. Marketplace listing with version pinning
5. Org admin enable/disable per plugin

---

## 6. Current implementation status

| Area | Status |
|------|--------|
| `@mycominer/plugin-sdk` package | **Missing** |
| Marketplace checkout | **Implemented** — digital goods, not plugin runtime |
| `globalSearch` plugin facet | **Partial** — search taxonomy only |
| Sensor adapters in telemetry | **Partial** — in-process, not plugin isolated |

---

## Version history

| Version | Date | Summary |
|---------|------|---------|
| 1.0 | 2026-06-17 | Plugin governance contract |
