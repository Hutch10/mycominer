# Phase 48: Operator Intelligence Hub — Quick Reference

## Quick Start

```typescript
import { HubEngine } from '@/app/intelligenceHub';

// Create hub engine
const hub = new HubEngine('tenant-alpha');

// Execute entity lookup
const query = hub.buildEntityLookupQuery('incident-001', 'incident', 'admin');
const result = await hub.executeQuery(query);

// Access results
console.log(`Found ${result.summary.totalReferences} references`);
console.log(`Queried ${result.summary.totalEnginesQueried} engines`);
console.log(`Impact Score: ${result.impactMap?.totalImpactScore}/100`);
```

---

## Query Types (8)

| Type | Purpose | Engines Used |
|------|---------|--------------|
| `entity-lookup` | Find all info about entity | KG, Search, Timeline, Narrative, Fabric, Documentation, Governance, Health |
| `cross-engine-summary` | Summarize across all engines | All 13 engines |
| `incident-overview` | Full incident details | Timeline, Analytics, Narrative, Health, Fabric, Documentation, Governance |
| `lineage-trace` | Trace lineage | KG, Governance History, Fabric, Health |
| `impact-analysis` | Analyze impact | Fabric, KG, Analytics, Insights, Health |
| `governance-explanation` | Explain governance | Governance, Gov History, Narrative, Documentation |
| `documentation-bundle` | Retrieve docs | Documentation, Training, Marketplace, Narrative |
| `fabric-neighborhood` | Get fabric links | Fabric, KG, Search |

---

## Source Engines (13)

1. **Search** (Phase 35) — Full-text search
2. **Knowledge Graph** (Phase 34) — Entity relationships  
3. **Narrative** (Phase 37) — Contextual narratives
4. **Timeline** (Phase 38) — Event sequences
5. **Analytics** (Phase 39) — Pattern detection
6. **Training** (Phase 40) — Training modules
7. **Marketplace** (Phase 41) — Shareable assets
8. **Insights** (Phase 42) — Knowledge packs
9. **Health** (Phase 43) — System health
10. **Governance** (Phase 44) — Governance decisions
11. **Governance History** (Phase 45) — Decision lineage
12. **Fabric** (Phase 46) — Cross-engine links
13. **Documentation** (Phase 47) — Documentation bundles

---

## Query Builder Methods

```typescript
const hub = new HubEngine('tenant-alpha');

// 1. Entity Lookup
const q1 = hub.buildEntityLookupQuery(entityId, entityType, performedBy);

// 2. Cross-Engine Summary
const q2 = hub.buildCrossEngineSummaryQuery(queryText, facilityId, performedBy);

// 3. Incident Overview
const q3 = hub.buildIncidentOverviewQuery(incidentId, performedBy);

// 4. Lineage Trace
const q4 = hub.buildLineageTraceQuery(entityId, entityType, performedBy);

// 5. Impact Analysis
const q5 = hub.buildImpactAnalysisQuery(entityId, entityType, performedBy);

// 6. Governance Explanation
const q6 = hub.buildGovernanceExplanationQuery(decisionId, performedBy);

// 7. Documentation Bundle
const q7 = hub.buildDocumentationBundleQuery(topic, performedBy);

// 8. Fabric Neighborhood
const q8 = hub.buildFabricNeighborhoodQuery(entityId, entityType, performedBy);
```

---

## HubResult Structure

```typescript
interface HubResult {
  resultId: string;
  query: HubQuery;
  sections: HubSection[];              // Results from each engine
  allReferences: HubReference[];       // All collected references
  lineageChains?: HubLineageChain[];   // Lineage traces (if requested)
  impactMap?: HubImpactMap;            // Impact analysis (if requested)
  
  summary: {
    totalEnginesQueried: number;
    enginesWithResults: HubSourceEngine[];
    totalReferences: number;
    totalLineageChains: number;
    queryExecutionTime: number;        // milliseconds
  };
  
  metadata: {
    policyDecisions: string[];
    errors: Array<{ engine: HubSourceEngine; error: string }>;
    warnings: string[];
  };
  
  performedAt: string;
  performedBy: string;
}
```

---

## HubSection Structure

```typescript
interface HubSection {
  sectionId: string;
  sourceEngine: HubSourceEngine;
  title: string;
  summary: string;
  data: any;                           // Engine-specific data
  references: HubReference[];
  
  metadata: {
    queryTime: number;                 // milliseconds
    resultCount: number;
    hasMoreResults: boolean;
    errors?: string[];
  };
}
```

---

## HubReference Structure

```typescript
interface HubReference {
  referenceId: string;
  referenceType: 'entity' | 'incident' | 'pattern' | 'training' | 'asset' | 'decision' | 'document';
  entityId: string;
  entityType: string;
  title: string;
  description?: string;
  sourceEngine: HubSourceEngine;
  relationshipType?: string;
  
  metadata: {
    createdAt?: string;
    updatedAt?: string;
    author?: string;
    status?: string;
    severity?: string;
    [key: string]: any;
  };
}
```

---

## Common Usage Patterns

### 1. Entity Lookup

```typescript
const hub = new HubEngine('tenant-alpha');
const query = hub.buildEntityLookupQuery('incident-001', 'incident', 'admin');
const result = await hub.executeQuery(query);

// Access references
for (const section of result.sections) {
  console.log(`${section.sourceEngine}: ${section.references.length} results`);
}
```

### 2. Cross-Engine Summary

```typescript
const query = hub.buildCrossEngineSummaryQuery(
  'Contamination in Facility 01',
  'facility-01',
  'admin'
);
const result = await hub.executeQuery(query);

// Access all references
console.log(`Total references: ${result.allReferences.length}`);
```

### 3. Lineage Trace

```typescript
const query = hub.buildLineageTraceQuery('capa-001', 'capa', 'admin');
query.options!.includeLineage = true;
const result = await hub.executeQuery(query);

// Access lineage chains
if (result.lineageChains) {
  for (const chain of result.lineageChains) {
    console.log(`${chain.startEntity.title} → ${chain.endEntity.title}`);
  }
}
```

### 4. Impact Analysis

```typescript
const query = hub.buildImpactAnalysisQuery('workflow-001', 'workflow', 'admin');
query.options!.includeImpact = true;
const result = await hub.executeQuery(query);

// Access impact map
if (result.impactMap) {
  console.log(`Impact Score: ${result.impactMap.totalImpactScore}/100`);
  console.log(`Upstream impacts: ${result.impactMap.upstreamImpacts.length}`);
  console.log(`Downstream impacts: ${result.impactMap.downstreamImpacts.length}`);
}
```

### 5. Governance Explanation

```typescript
const query = hub.buildGovernanceExplanationQuery('decision-001', 'admin');
const result = await hub.executeQuery(query);

// Get governance sections
const govSection = result.sections.find(s => s.sourceEngine === 'governance');
const historySection = result.sections.find(s => s.sourceEngine === 'governance-history');
```

---

## Statistics & Logging

```typescript
const hub = new HubEngine('tenant-alpha');

// Get statistics
const stats = hub.getStatistics();
console.log(`Total queries: ${stats.totalQueries}`);
console.log(`Average time: ${stats.averageQueryTime}ms`);
console.log(`Most used: ${stats.mostUsedQueryType}`);

// Get log entries
const log = hub.getLog();
const recentQueries = log.getSuccessfulQueries().slice(-10);
const failedQueries = log.getFailedQueries();

// Export log
const logJson = hub.exportLog({
  entryType: 'query',
  startDate: '2026-01-01',
  endDate: '2026-01-31'
});
```

---

## Policy Context

```typescript
interface HubPolicyContext {
  tenantId: string;
  facilityId?: string;
  roomId?: string;
  performedBy: string;
  userRoles: string[];
  userPermissions: string[];
  federationTenants?: string[];
}

// Policy checks
// - Tenant isolation validated
// - Federation rules enforced
// - Engine permissions checked
// - Reference visibility authorized
```

---

## Dashboard Access

Navigate to `/app/intelligenceHub` to access the UI dashboard.

### Dashboard Tabs

1. **Query** — Select query type, input parameters, execute
2. **Results** — View unified results with sections, lineage, impact
3. **History** — View last 20 operations with status
4. **Statistics** — View query stats by type and engine

---

## File Structure

```
/app/intelligenceHub/
├── hubTypes.ts           (440 lines) — Type definitions
├── hubRouter.ts          (650 lines) — Routes to 13 engines
├── hubAssembler.ts       (520 lines) — Merges results
├── hubPolicyEngine.ts    (380 lines) — Enforces policies
├── hubEngine.ts          (420 lines) — Main orchestrator
├── hubLog.ts             (360 lines) — Audit trail
├── index.ts              (35 lines)  — Public API
├── page.tsx              (720 lines) — UI dashboard
├── PHASE48_SUMMARY.md                — High-level overview
└── PHASE48_QUICK_REFERENCE.md        — This file
```

---

## Key Constraints

### ALWAYS ✅
- Ground responses in real system data
- Enforce tenant isolation
- Log all operations
- Validate permissions
- Use deterministic ordering
- Authorize all references

### NEVER ❌
- Use generative AI
- Invent content
- Make predictions
- Allow cross-tenant leakage
- Skip policy checks
- Omit audit logs

---

## Performance Tips

1. **Limit engines** — Use `filters.engines` to query only relevant engines
2. **Disable lineage** — Set `options.includeLineage = false` if not needed
3. **Disable impact** — Set `options.includeImpact = false` if not needed
4. **Limit results** — Set `options.maxResultsPerEngine` to reduce response size
5. **Use summary format** — Set `options.format = 'summary'` for faster queries

---

## Integration Examples

### With Compliance Engine (Phase 32)
```typescript
// Query compliance data
const query = hub.buildEntityLookupQuery('compliance-rule-001', 'compliance-rule', 'admin');
const result = await hub.executeQuery(query);
// Export log for compliance
const complianceLog = hub.exportLog({ performedBy: 'admin' });
```

### With Health Engine (Phase 43)
```typescript
// Query health status
const query = hub.buildCrossEngineSummaryQuery('System Health', 'facility-01', 'admin');
const result = await hub.executeQuery(query);
const healthSection = result.sections.find(s => s.sourceEngine === 'health');
```

### With Governance (Phase 44/45)
```typescript
// Explain governance decision
const query = hub.buildGovernanceExplanationQuery('decision-001', 'admin');
const result = await hub.executeQuery(query);
// Get lineage
const lineageQuery = hub.buildLineageTraceQuery('decision-001', 'governance-decision', 'admin');
lineageQuery.options!.includeLineage = true;
const lineageResult = await hub.executeQuery(lineageQuery);
```

### With Fabric (Phase 46)
```typescript
// Get fabric neighborhood
const query = hub.buildFabricNeighborhoodQuery('entity-001', 'incident', 'admin');
const result = await hub.executeQuery(query);
const fabricLinks = result.sections.find(s => s.sourceEngine === 'fabric')?.references;
```

---

## Error Handling

```typescript
try {
  const result = await hub.executeQuery(query);
  
  // Check for errors
  if (result.metadata.errors.length > 0) {
    console.warn('Partial failures:', result.metadata.errors);
  }
  
  // Check for warnings
  if (result.metadata.warnings.length > 0) {
    console.warn('Warnings:', result.metadata.warnings);
  }
  
} catch (error) {
  console.error('Query failed:', error);
  
  // Check log for details
  const log = hub.getLog();
  const failedQueries = log.getFailedQueries();
}
```

---

## Best Practices

### For Architects
- Use `entity-lookup` for comprehensive entity views
- Use `lineage-trace` for dependency analysis
- Use `impact-analysis` before making changes
- Always include lineage and impact for critical entities

### For Operators
- Use `incident-overview` for incident response
- Use `cross-engine-summary` for daily status
- Monitor statistics for system health
- Review history for audit trails

### For Admins
- Use `governance-explanation` for decision reviews
- Export logs regularly for compliance
- Monitor policy denials
- Review failed queries for permission issues

---

## Troubleshooting

### Query Returns No Results
- Check policy permissions
- Verify tenant/facility scope
- Check if entity exists
- Review log for errors

### Slow Queries
- Limit engines with `filters.engines`
- Reduce `maxResultsPerEngine`
- Disable lineage/impact if not needed
- Use `format: 'summary'`

### Policy Denials
- Check user permissions
- Verify tenant isolation
- Check federation rules
- Review policy log

### Missing References
- Check reference authorization
- Verify entity visibility
- Check facility/room scope
- Review policy decisions

---

**The Operator Intelligence Hub provides a unified, deterministic, cross-engine assistant for operators and admins to query, analyze, and understand relationships across all 13 system engines.**
