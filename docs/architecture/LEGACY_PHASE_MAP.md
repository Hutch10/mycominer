# Legacy Phase Map → Architecture v1.0

Phase summaries (`app/*/PHASE*_SUMMARY.md`) remain useful for **module history** but are **not** the architectural source of truth. Use this map to locate legacy docs under the v1.0 layer model.

| Phase | Module path | v1.0 layer | v1.0 domain |
|------:|-------------|------------|-------------|
| 32–38 | Various early engines | Experience / Operations | Foundations |
| 39 | `app/analytics/` | Intelligence | Operational analytics |
| 44–45 | `app/governance/`, `app/governanceHistory/` | Governance & trust | RBAC, policy lineage |
| 46 | `app/fabric/` | Knowledge | Fabric mesh, provenance links |
| 47 | `app/documentation/` | Experience | Auto documentation |
| 48 | `app/intelligenceHub/` | Knowledge | Operator hub |
| 50 | `app/auditor/` | Governance & trust | System auditor |
| 51 | `app/integrityMonitor/` | Governance & trust | Integrity rules |
| 52 | `app/alertCenter/` | Operations | Alerts |
| 53 | `app/actionCenter/` | Operations | Actions |
| 54+ | `app/simulation/`, `app/forecasting/` | Intelligence | Deterministic models |
| 55+ | `app/digitalTwin/` | Operations / Scientific | Twin (needs observation feed) |
| 56+ | `app/training/`, `app/sop/` | Experience | Training & SOP |
| 57+ | `app/compliance/` | Operations | Compliance |
| 58+ | `app/insights/` | Knowledge / Intelligence | Insights (informational) |
| 59+ | `app/knowledgeGraph/` | Knowledge | KG (needs evidence edges) |
| 60+ | `app/federationMarketplace/` | Operations / Federation | Marketplace |
| 62+ | `app/multiFacility/` | Operations | Multi-facility |
| 73 | `app/federation/` | Knowledge / Federation | Global federation |

## Unmapped / cross-cutting

| Area | Path | Notes |
|------|------|-------|
| Agent runtime | `agent-runtime/` | Infrastructure + Intelligence |
| Persistence | `app/lib/db/`, `supabase/migrations/` | Infrastructure |
| Auth | `app/lib/auth/` | Governance & trust |
| Community | `app/community/` | Experience (not scientific observations) |
| Coach | `app/coach/` | Intelligence (advisory) |

## Deprecation policy

- Do **not** delete phase summaries in v1.0
- Add header to phase docs when touched: `> Historical module doc. See docs/architecture/ for current architecture.`
- New modules should be documented under `docs/architecture/` first, then implemented
