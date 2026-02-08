# Phase 46: Multi-Tenant Data Fabric - Quick Reference

**One-page reference for operators and developers**

---

## What Is It?

A **unified knowledge mesh** that connects entities from **14 phases** and **9 engines** into a single semantic graph with cross-engine search, lineage tracing, and impact analysis.

---

## Quick Start

```typescript
import { FabricEngine, initializeFabricWithSampleData } from '@/app/fabric';

// 1. Create engine
const engine = new FabricEngine('tenant-1', 'facility-alpha');

// 2. Load sample data
initializeFabricWithSampleData(engine);

// 3. Query knowledge
const result = engine.executeQuery({
  queryType: 'knowledge-for-entity',
  scope: { scope: 'facility', tenantId: 'tenant-1', facilityId: 'facility-alpha' },
  filters: { startNodeId: 'training-module-123', maxDepth: 2 }
}, 'user-123');

// 4. View statistics
const stats = engine.getStatistics();
console.log(`${stats.totalNodes} nodes, ${stats.totalEdges} edges`);
```

---

## Entity Types (30+)

### By Source Engine

| Engine | Entity Types |
|--------|-------------|
| **Knowledge Graph** | kg-node |
| **Search** | search-entity |
| **Timeline** | timeline-event |
| **Narrative** | narrative-reference, narrative-explanation |
| **Analytics** | analytics-pattern, analytics-cluster, analytics-trend |
| **Training** | training-module, training-step, training-certification |
| **Marketplace** | marketplace-asset, marketplace-vendor |
| **Insights** | knowledge-pack, insight |
| **Health** | health-finding, health-drift, integrity-issue |
| **Governance** | governance-role, governance-permission, governance-policy, governance-change, governance-lineage |

---

## Relationship Types (10)

1. **derived-from** - Knowledge lineage
2. **references** - Cross-references
3. **explains** - Narrative explanations
4. **is-related-to** - General relationships
5. **is-sourced-from** - Data provenance
6. **contains** - Hierarchical containment
7. **uses** - Dependency relationships
8. **produces** - Output relationships
9. **affects** - Impact relationships
10. **triggers** - Causal relationships

---

## Query Types (7)

### 1. node-by-id
Fetch single entity with its edges.

```typescript
engine.executeQuery({
  queryType: 'node-by-id',
  scope: { scope: 'facility', tenantId: 'tenant-1', facilityId: 'facility-alpha' },
  filters: { nodeId: 'training-module-123' }
}, 'user-123');
```

### 2. nodes-by-type
Filter entities by type.

```typescript
engine.executeQuery({
  queryType: 'nodes-by-type',
  scope: { scope: 'tenant', tenantId: 'tenant-1' },
  filters: { entityType: 'knowledge-pack' }
}, 'user-123');
```

### 3. edges-by-node
Get all relationships for an entity.

```typescript
engine.executeQuery({
  queryType: 'edges-by-node',
  scope: { scope: 'facility', tenantId: 'tenant-1', facilityId: 'facility-alpha' },
  filters: { nodeId: 'training-module-123' }
}, 'user-123');
```

### 4. knowledge-for-entity
BFS graph traversal (default depth: 2).

```typescript
engine.executeQuery({
  queryType: 'knowledge-for-entity',
  scope: { scope: 'facility', tenantId: 'tenant-1', facilityId: 'facility-alpha' },
  filters: { startNodeId: 'training-module-123', maxDepth: 2 }
}, 'user-123');
```

### 5. cross-engine-search
Search across multiple engines.

```typescript
engine.executeQuery({
  queryType: 'cross-engine-search',
  scope: { scope: 'tenant', tenantId: 'tenant-1' },
  filters: { searchTerm: 'contamination', engineFilter: ['training', 'insights', 'health'] }
}, 'user-123');
```

### 6. lineage-trace
Follow derived-from chains (default depth: 5).

```typescript
engine.executeQuery({
  queryType: 'lineage-trace',
  scope: { scope: 'facility', tenantId: 'tenant-1', facilityId: 'facility-alpha' },
  filters: { startNodeId: 'knowledge-pack-456', maxDepth: 5 }
}, 'admin-user');
```

### 7. impact-analysis
Follow affects/triggers chains (default depth: 3).

```typescript
engine.executeQuery({
  queryType: 'impact-analysis',
  scope: { scope: 'facility', tenantId: 'tenant-1', facilityId: 'facility-alpha' },
  filters: { startNodeId: 'analytics-pattern-789', maxDepth: 3 }
}, 'admin-user');
```

---

## Register Entity

```typescript
engine.registerEntity(
  'training-module-123',           // Source entity ID
  'training-module',                // Entity type
  'training',                       // Source engine
  40,                               // Source phase
  'Sterile Technique Basics',       // Name
  {                                 // Scope
    scope: 'facility',
    tenantId: 'tenant-1',
    facilityId: 'facility-alpha'
  },
  {                                 // Metadata
    description: 'Learn proper sterile technique',
    difficulty: 'beginner',
    duration: '30min'
  }
);
```

---

## Create Link

```typescript
engine.createLink(
  'training-module-123',            // From node ID
  'knowledge-pack-456',             // To node ID
  'references',                     // Edge type
  0.8,                              // Strength (0-1)
  'Training module references knowledge pack',  // Rationale
  'system'                          // Created by
);
```

---

## Automatic Linking

Fabric automatically detects semantic relationships:

| From | To | Edge Type | Strength |
|------|----|-----------|---------:|
| training-module | knowledge-pack | references | 0.8 |
| analytics-pattern | health-finding | affects | 0.7 |
| timeline-event | governance-change | is-related-to | 0.6 |
| knowledge-pack | insight | contains | 0.9 |
| narrative-explanation | kg-node | explains | 0.9 |
| governance-role | training-certification | uses | 0.7 |

---

## Tenant Isolation

### Default Behavior
- ❌ Cross-tenant links **blocked**
- ✅ Same-tenant links **allowed**
- ✅ Queries scoped to tenant

### Federation Exceptions
- ✅ `knowledge-pack` can be shared
- ✅ `insight` can be shared
- ✅ `marketplace-asset` can be shared
- ⚠️ Requires `federationAllowed: true` flag

---

## Statistics

```typescript
const stats = engine.getStatistics();

console.log(stats.totalNodes);           // Total entities
console.log(stats.totalEdges);           // Total relationships
console.log(stats.nodesByType);          // Entities per type
console.log(stats.edgesByType);          // Relationships per type
console.log(stats.nodesByEngine);        // Entities per engine
console.log(stats.queriesLast24h);       // Recent query count
console.log(stats.linksGeneratedLast24h); // Recent link count
```

---

## Audit Log

```typescript
const log = engine.getLog();

// Get all entries
const entries = log.getAllEntries();

// Filter by type
const queries = log.getEntriesByType('query');
const links = log.getEntriesByType('link-generation');

// Filter by time range
const recent = log.getEntriesInRange(
  new Date(Date.now() - 86400000),  // Last 24h
  new Date()
);

// Get statistics
const queryStats = log.getQueryStatistics();
console.log(`${queryStats.totalQueries} queries, ${queryStats.averageExecutionTimeMs}ms avg`);
```

---

## Export Fabric

```typescript
const exported = engine.exportFabric();

console.log(exported.nodes);        // All nodes
console.log(exported.edges);        // All edges
console.log(exported.statistics);   // Current statistics
console.log(exported.exportedAt);   // Export timestamp
```

---

## Dashboard

Access at: `/fabric`

### Tabs
1. **Overview** - Statistics, entity types, engines, quick actions
2. **Query** - Execute queries, view results, explore entities
3. **Graph** - Visualization placeholder (D3.js ready)
4. **History** - Recent operations, audit trail

### Detail Panels
- **Node Details** - Click any node to see name, type, engine, scope, edges
- **Edge Details** - Click any edge to see type, from/to, strength, rationale

---

## Policies

### Default Policies (4)

1. **Tenant Isolation Policy**
   - No cross-tenant links

2. **Federation Policy**
   - Allow knowledge-pack, insight, marketplace-asset cross-tenant
   - Only with references or is-related-to edges

3. **Edge Type Policy**
   - Allow all 10 edge types

4. **Query Execution Policy**
   - Tenant-scoped queries only

### Add Custom Policy

```typescript
engine.addPolicy({
  id: 'custom-policy-1',
  name: 'Restrict Impact Analysis',
  description: 'Only admins can run impact analysis',
  effect: 'deny',
  conditions: {
    queryType: 'impact-analysis',
    requiredRole: 'admin'
  }
});
```

---

## Common Tasks

### Find All Training Modules

```typescript
const result = engine.executeQuery({
  queryType: 'nodes-by-type',
  scope: { scope: 'tenant', tenantId: 'tenant-1' },
  filters: { entityType: 'training-module' }
}, 'user-123');
```

### Find Knowledge for Training Module

```typescript
const result = engine.executeQuery({
  queryType: 'knowledge-for-entity',
  scope: { scope: 'facility', tenantId: 'tenant-1', facilityId: 'facility-alpha' },
  filters: { startNodeId: 'training-module-123', maxDepth: 2 }
}, 'user-123');
```

### Search for Contamination

```typescript
const result = engine.executeQuery({
  queryType: 'cross-engine-search',
  scope: { scope: 'tenant', tenantId: 'tenant-1' },
  filters: { searchTerm: 'contamination', engineFilter: ['training', 'insights', 'health'] }
}, 'user-123');
```

### Trace Knowledge Pack Lineage

```typescript
const result = engine.executeQuery({
  queryType: 'lineage-trace',
  scope: { scope: 'facility', tenantId: 'tenant-1', facilityId: 'facility-alpha' },
  filters: { startNodeId: 'knowledge-pack-456', maxDepth: 5 }
}, 'admin-user');
```

### Analyze Impact of Analytics Pattern

```typescript
const result = engine.executeQuery({
  queryType: 'impact-analysis',
  scope: { scope: 'facility', tenantId: 'tenant-1', facilityId: 'facility-alpha' },
  filters: { startNodeId: 'analytics-pattern-789', maxDepth: 3 }
}, 'admin-user');
```

---

## File Structure

```
/app/fabric/
├── fabricTypes.ts          # Type definitions (30+ types)
├── fabricLinker.ts         # Linking engine (470+ lines)
├── fabricResolver.ts       # Query engine (530+ lines)
├── fabricPolicyEngine.ts   # Access control (220+ lines)
├── fabricLog.ts            # Audit trail (200+ lines)
├── fabricEngine.ts         # Orchestration (260+ lines)
├── index.ts                # Public API (40 lines)
├── page.tsx                # Dashboard UI (700+ lines)
├── PHASE46_COMPLETION_REPORT.md
├── PHASE46_SUMMARY.md
├── PHASE46_QUICK_REFERENCE.md (this file)
└── PHASE46_FILE_MANIFEST.md
```

---

## Key Constraints

### ALWAYS
- ✅ Log every operation
- ✅ Enforce tenant isolation
- ✅ Validate policy before link creation
- ✅ Include source engine/phase in nodes
- ✅ Return complete audit trail

### NEVER
- ❌ Write to source engines
- ❌ Modify source entities
- ❌ Allow cross-tenant links without federation
- ❌ Skip policy evaluation
- ❌ Expose cross-tenant data

---

## Performance Tips

1. **Use Specific Queries** - `node-by-id` faster than `knowledge-for-entity`
2. **Limit Depth** - Keep maxDepth ≤ 3 for performance
3. **Filter Engines** - Use `engineFilter` to reduce search space
4. **Cache Results** - Store frequently used query results
5. **Batch Registrations** - Register multiple entities at once

---

## Troubleshooting

### No Results from Query
- ✅ Check scope matches entity scope
- ✅ Verify tenant isolation not blocking results
- ✅ Check entity exists in fabric
- ✅ Verify query filters are correct

### Link Creation Fails
- ✅ Check policy evaluation results
- ✅ Verify both nodes exist
- ✅ Check tenant isolation rules
- ✅ Verify edge type is allowed

### Cross-Tenant Links Blocked
- ✅ Check entity type supports federation
- ✅ Verify `federationAllowed: true` on both nodes
- ✅ Check edge type is `references` or `is-related-to`
- ✅ Review Federation Policy

### Query Too Slow
- ✅ Reduce `maxDepth`
- ✅ Use more specific query type
- ✅ Add `engineFilter` to limit search
- ✅ Use `nodes-by-type` instead of `cross-engine-search`

---

## Integration Checklist

### For New Phases

1. ✅ Add entity types to `FabricEntityType` in `fabricTypes.ts`
2. ✅ Register entities using `engine.registerEntity()`
3. ✅ Add relationship patterns to `detectRelationship()` in `fabricLinker.ts`
4. ✅ Update dashboard with entity type icons/actions
5. ✅ Update documentation with new entity types
6. ✅ Test tenant isolation for new types
7. ✅ Verify automatic linking works
8. ✅ Add to Phase Integration Matrix

---

## Support

**Documentation:**
- Completion Report: `PHASE46_COMPLETION_REPORT.md`
- Summary: `PHASE46_SUMMARY.md`
- File Manifest: `PHASE46_FILE_MANIFEST.md`

**Code Location:**
- `/app/fabric/` directory
- 8 files, ~2,800 lines

**Key Contacts:**
- Platform Team - General questions
- Governance Team - Policy questions
- Data Team - Integration questions

---

**Phase 46 Status:** ✅ **COMPLETE** | **8 files** | **~2,800 lines** | **0 errors**
