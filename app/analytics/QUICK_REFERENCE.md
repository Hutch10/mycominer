# Phase 39 Quick Reference Guide

## File Structure
```
app/analytics/
├── analyticsTypes.ts          (Types: Query, Scope, Cluster, Pattern, Trend, Result, Log)
├── analyticsLog.ts            (Logging: query, clustering, patterns, trends, errors)
├── incidentClusterer.ts       (Clustering: 6 strategies, similarity scoring)
├── patternLibrary.ts          (Patterns: derivation, registration, querying)
├── trendAnalyzer.ts           (Trends: 5 types, cross-facility comparisons)
├── analyticsEngine.ts         (Orchestrator: master query facade)
├── components/
│   ├── AnalyticsQueryPanel.tsx        (Query builder UI)
│   ├── IncidentClusterViewer.tsx      (Cluster display)
│   ├── PatternLibraryViewer.tsx       (Pattern browser)
│   ├── TrendSummaryPanel.tsx          (Trend charts & tables)
│   ├── AnalyticsHistoryViewer.tsx     (Audit log)
│   └── AnalyticsDashboard.tsx         (Tab orchestrator)
├── page.tsx                   (Sample data & page)
└── PHASE39_SUMMARY.md         (This implementation guide)
```

---

## Core Concepts

### Incident Cluster
Groups of similar incidents identified by:
- Event sequence (exact type sequence match)
- Severity transitions (high→high→medium→info pattern)
- SOP references (shared SOPs)
- CAPA themes (common remediation approaches)
- Telemetry anomalies (environmental spike types)
- Facility context (location-based patterns)

**Properties**:
```typescript
{
  clusterId: string;
  archetype: string;                          // Human-readable name
  incidentIds: string[];                      // Member incident thread IDs
  characteristicSequence: string[];           // Event type sequence
  severityTransitionPattern: string[];        // Severity progression
  commonSOPReferences: string[];              // Shared SOPs
  commonCAPAThemes: string[];                 // Common remediation themes
  commonTelemetryAnomalies: string[];         // Shared anomaly types
  frequencyInDataset: number;                 // How many incidents match
  clusterSize: number;                        // Unique incident count
}
```

### Pattern Signature
Recurring pattern distilled from clusters.

**Properties**:
```typescript
{
  patternId: string;
  name: string;                               // Archetype name
  characteristicSequence: string[];           // Event type sequence
  representativeIncidents: string[];          // Up to 3 sample incident IDs
  clusterCount: number;                       // How many clusters match this pattern
  incidentsUnderPattern: number;              // Total incidents grouped here
  severityProfile: Record<string, number>;    // {high: 0.4, medium: 0.5, info: 0.1}
  confidence: number;                         // 0-1 based on cluster frequency
  telemetrySignatures: string[];              // ['temp-spike', 'humidity-drift']
}
```

### Trend Summary
Time-series analysis of incidents, CAPAs, SOPs, or facility metrics.

**Types**:
1. Incident Frequency - Count of incident clusters per time period
2. CAPA Recurrence - Count of CAPA actions per time period
3. SOP Change Density - Count of SOP references per time period
4. Environmental Rhythm - Hourly distribution of environmental exceptions
5. Facility Comparison - Cross-facility metric comparison

**Insights Generated**:
- Average value over time period
- Peak value
- Lowest value
- Trend direction (increasing/decreasing)

---

## Common Queries & Usage

### Query 1: Find Recurring Incident Patterns
```typescript
const query: AnalyticsQuery = {
  queryId: `query-${Date.now()}`,
  timestamp: new Date().toISOString(),
  tenantId: 'tenant-alpha',
  target: 'incidents',
  scope: {
    tenantId: 'tenant-alpha',
    facilityId: 'facility-01',        // Optional
  },
  description: 'Show recurring incident patterns for Facility 01',
  includePatterns: true,
  includeTrends: true,
  clusteringStrategy: 'event-sequence',
};

const result = queryAnalytics(query);
// result.clusters: [Cluster, Cluster, ...]
// result.patterns: [Pattern, Pattern, ...]
// result.trends: [Trend, Trend, ...]
```

### Query 2: Find CAPA Patterns
```typescript
const query: AnalyticsQuery = {
  // ... same as above
  target: 'capa',
  clusteringStrategy: 'capa-pattern',
  description: 'Show recurring CAPA patterns for Tenant Alpha',
};
```

### Query 3: Analyze Cross-Facility Trends
```typescript
const query: AnalyticsQuery = {
  // ... same as above
  description: 'Compare incident frequency across facilities',
  clusteringStrategy: 'facility-context',
};

const result = queryAnalytics(query);
// result.trends includes facility comparison trend
```

---

## Clustering Strategies

| Strategy | Use Case | Groups By |
|----------|----------|-----------|
| **event-sequence** | Find identical incident patterns | Exact event type sequence |
| **severity-transition** | Find patterns with similar severity escalation | Severity progression (high→medium→info) |
| **sop-reference** | Find incidents using same procedures | Shared SOP IDs |
| **capa-pattern** | Find incidents with similar remediation | Common CAPA themes |
| **telemetry-anomaly** | Find environmental patterns | Anomaly types (temp, humidity, pressure) |
| **facility-context** | Analyze facility-level rhythms | Facility location |

---

## Logging & Audit

### Log Entry Types
1. `query-initiated` - Query submitted
2. `clustering-complete` - Clustering finished
3. `pattern-library-queried` - Patterns retrieved
4. `trend-analysis-complete` - Trends computed
5. `result-generated` - Final result created
6. `export-requested` - Export initiated
7. `access-denied` - Authorization failed
8. `error` - Error occurred

### Accessing Logs
```typescript
// Get all logs
const allLogs = getAnalyticsLog();

// Get logs for specific tenant
const tenantLogs = getAnalyticsLogByTenant('tenant-alpha');

// Get logs of specific type
const queryLogs = getAnalyticsLogByType('query-initiated');

// Filter by custom predicate
const recentErrors = filterAnalyticsLog(
  (entry) => entry.status === 'failed' && 
             new Date(entry.timestamp) > Date.now() - 3600000
);

// Clear logs (use cautiously)
clearAnalyticsLog();
```

---

## UI Components Usage

### AnalyticsQueryPanel
Props: `tenantId`, `onQuerySubmit`
- Builds query form
- Handles submission
- Validation built-in

### IncidentClusterViewer
Props: `clusters`
- Displays cluster list
- Shows event sequences
- Severity badges (color-coded)
- SOP/CAPA/Anomaly badges

### PatternLibraryViewer
Props: `patterns`, `onExplainPattern?`
- Expandable pattern cards
- Confidence scores
- Severity distribution charts
- "Explain" button hooks to Phase 37

### TrendSummaryPanel
Props: `trends`
- Mini SVG bar charts
- Data point tables
- Auto-generated insights
- Aggregation level display

### AnalyticsHistoryViewer
Props: `logEntries`
- Scrollable audit log
- Entry type filter
- Expandable details
- Success rate summary

### AnalyticsDashboard
Props: `tenantId`, `onQuerySubmit`, `analyticsResults`, `analyticsLog`, `onExplainPattern?`, `onReplayIncident?`
- Orchestrator component
- Tab navigation
- Query builder + Results
- Full integration

---

## Integration Hooks

### Phase 37 (Narrative Engine) Hook
```typescript
onExplainPattern={(patternId: string) => {
  // Call Phase 37 Narrative Engine to explain pattern
  // Pass pattern signature as context
}}
```

### Phase 38 (Incident Replay) Hook
```typescript
onReplayIncident={(incidentId: string) => {
  // Call Phase 38 Incident Replay to step through incident
  // Pass incident thread ID
}}
```

---

## Performance Notes

- **Clustering**: O(n) in incident count per strategy
- **Pattern Derivation**: O(m log m) where m = unique sequences
- **Trend Analysis**: O(d log d) where d = data points
- **Memory**: In-memory storage; suitable for 1000s of incidents
- **Execution Time**: Typically <100ms for typical queries

---

## Future Extensions

### Near-Term
1. Database persistence for analytics state
2. Incremental clustering (add new incidents without full recompute)
3. Pattern export/import
4. Cross-tenant pattern discovery (with federation approval)
5. Custom metric definitions

### Medium-Term
1. Predictive pattern matching ("this looks like pattern X")
2. Anomaly detection (statistical outlier identification)
3. Root cause suggestion based on pattern analysis
4. SOP effectiveness scoring based on pattern recurrence
5. Analytics API endpoint for programmatic access

### Long-Term
1. Real-time analytics streaming
2. Pattern visualization graphs
3. Complex pattern query language
4. ML-assisted pattern refinement (human-in-the-loop)
5. Global tenant analytics (anonymized cross-tenant insights)

---

## Compliance & Safety

✅ **No Predictions**: All analysis historical
✅ **No Biological Inference**: Event sequences only
✅ **Fully Auditable**: Every query logged
✅ **Tenant-Isolated**: Strict scope enforcement
✅ **Read-Only**: No mutations to source data
✅ **Deterministic**: Same inputs → same outputs

---

**Last Updated**: Jan 20, 2026
**Phase**: 39 (Global Analytics & Incident Pattern Library)
**Status**: ✅ Production-Ready
