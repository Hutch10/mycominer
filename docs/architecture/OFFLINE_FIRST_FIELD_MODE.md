# Offline-First Field Mode

**Document ID:** MIP-OFFLINE-1.0  
**Status:** Canonical contract (partial client patterns exist)  
**Parent:** [Observation Engine Invariants](./OBSERVATION_ENGINE_INVARIANTS.md)

Field operators (grow rooms, remote sites) must capture observations **without continuous connectivity**, synchronizing when online.

---

## 1. Purpose

- Reliable human and sensor observation capture in low-connectivity environments
- No data loss on sync conflict — supersession and hash rules apply
- Clear UX distinction between **queued** and **committed** observations

---

## 2. Architecture

```
Field client (PWA / mobile)
  → Local append-only queue (IndexedDB)
  → Optional local evidence cache (encrypted)
  → Sync worker on connectivity
  → POST /api/observations (batch) + evidence upload
  → Server assigns definitive IDs; client maps local → server IDs
```

---

## 3. Local queue invariants

| ID | Rule |
|----|------|
| F-1 | Local events are append-only until acknowledged by server |
| F-2 | Each queued event has client-generated `local_id` + `content_hash` |
| F-3 | Sync retries are idempotent (server dedupes by `client_idempotency_key`) |
| F-4 | Conflicts resolved via supersession, never overwrite |
| F-5 | Evidence blobs upload before observation references them |

---

## 4. UX requirements

| State | User-visible label |
|-------|-------------------|
| Queued locally | "Pending sync" |
| Syncing | Progress indicator |
| Committed | Observation ID shown |
| Sync failed | Retry + offline reason |

Verified claims cannot be created from **uncommitted** local observations.

---

## 5. Security

- Local queue encrypted at rest (device keychain)
- No service role in client
- Sync uses standard org-scoped JWT

---

## 6. Current implementation status

| Area | Status |
|------|--------|
| Community layer offline copy | **Partial** — `app/community/guidelines/page.tsx` states offline; no observation queue |
| Service worker / PWA | **Missing** for scientific capture |
| Observation API | **Missing** |
| Training walkthrough offline | **Partial** — session log local only |

Education content offline ≠ scientific observation offline.

---

## Version history

| Version | Date | Summary |
|---------|------|---------|
| 1.0 | 2026-06-17 | Offline-first field mode contract |
