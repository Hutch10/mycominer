# Canonical Vision — Google AI Studio (Mushroom Intelligence Platform)

**Version:** 1.0  
**Role:** Architectural north star; supersedes scattered phase READMEs for **intent** (implementation status remains in the Alignment Report)

The Mushroom Intelligence Platform design produced in **Google AI Studio** defines a single integrated system for evidence-backed mycology: laboratory-grade traceability, cultivation operations, and advisory intelligence—without conflating operational convenience with verified science.

This document formalizes that vision for the MycoMiner codebase. UI mockups from AI Studio are **not** migration targets; behavioral contracts, data layers, and governance flows are.

---

## Platform purpose

Deliver a **reproducible, auditable** mushroom intelligence platform that:

1. Captures immutable evidence from humans, sensors, instruments, and systems
2. Verifies and registers scientific claims through explicit workflows
3. Powers operations (multi-facility, workflows, compliance, marketplace) on durable infrastructure
4. Provides advisory intelligence with explainability and human gates
5. Enables federation and research export without breaking provenance

---

## Layered architecture (AI Studio → v1.0)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  EXPERIENCE LAYER                                                        │
│  Operator dashboards · Training · SOP · Community · Command surfaces     │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼─────────────────────────────────────┐
│  OPERATIONS LAYER                                                        │
│  Workflows · Multi-facility · Action/Alert · Compliance · Marketplace    │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼─────────────────────────────────────┐
│  INTELLIGENCE LAYER (advisory)                                           │
│  Agents · Insights · Forecasting · Closed-loop recommendations           │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │ derives from (post-GA contract)
┌───────────────────────────────────▼─────────────────────────────────────┐
│  KNOWLEDGE LAYER                                                         │
│  Fabric mesh · Knowledge Graph · Intelligence Hub · Federation           │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼─────────────────────────────────────┐
│  SCIENTIFIC CORE                                                         │
│  Observation Engine · Verification Engine · Scientific Claim Registry    │
│  Formula/Algorithm Registry · Chain of Custody · Data Quality/Statistics │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼─────────────────────────────────────┐
│  EVIDENCE LAYER                                                          │
│  Raw observations · Media evidence · Telemetry time-series · Lab imports │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼─────────────────────────────────────┐
│  GOVERNANCE & TRUST                                                      │
│  Policy engine · Append-only audit · Explainability · Human approval     │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼─────────────────────────────────────┐
│  PLATFORM INFRASTRUCTURE                                                 │
│  Supabase (mycominer schema) · Upstash rate limits · Agent runtime       │
│  Stripe billing · Deployment fingerprint · DR/backup                     │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Core domain modules (vision)

| Domain | Responsibility | Primary consumers |
|--------|----------------|-------------------|
| **Observation Engine** | Immutable event capture (human, sensor, image, lab import, system) | All scientific modules |
| **Evidence Repository** | Raw media, hashes, storage tiers | Observations, publications |
| **Telemetry Store** | Durable time-series, drift/missing/duplicate handling | Digital Twin, DQ, closed-loop |
| **Chain of Custody** | Specimen/isolate lineage, transfers, custody events | LIMS workflows, verification |
| **Verification Engine** | Reproducible scoring, confidence with uncertainty | Claim Registry |
| **Scientific Claim Registry** | Canonical verified conclusions | KG, exports, federation |
| **Formula Registry** | Versioned algorithms and calculation metadata | Replay, publications |
| **Digital Twin** | Deterministic facility/batch state reconstruction | Operations, simulation |
| **Knowledge Graph** | Evidence-backed entities and relationships | Hub, insights, search |
| **Data Quality & Statistics** | DQI, sample size, uncertainty propagation | Verification, claims |
| **Closed-Loop Intelligence** | Sense→validate→recommend→approve→measure loop | Operators (advisory) |
| **Publication / FAIR** | RO-Crate, methods, provenance bundles | Research pipeline |
| **Fabric / Hub** | Cross-engine linking and operator queries | All layers |
| **Federation** | Org trust, marketplace, privacy-preserving exchange | Multi-org deployments |

---

## Closed-loop pattern (advisory)

```
Sense → Validate → Classify → Recommend → Human approval → Record intervention
  → Measure outcome → Update confidence → Append to immutable ledger
```

Automatic actuation is **out of scope** until explicit safeguards and validation data exist.

---

## Relationship to MycoMiner / Mycology Operating System

- **MycoMiner** is the implementation repository for this platform.
- **Mycology Operating System** is the product name used in governance and scientific QA audits.
- **Mushroom Intelligence Platform** is the AI Studio architectural product name—all three refer to the same v1.0 architecture with different emphasis (engineering, science, design).

---

## What this document does not do

- Does not mandate UI parity with AI Studio prototypes
- Does not authorize pre-GA scientific schema work (see [MIGRATION_PLAN.md](./MIGRATION_PLAN.md))
- Does not replace operational runbooks in `docs/operations/`
