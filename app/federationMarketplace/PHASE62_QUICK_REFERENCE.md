# PHASE 62 QUICK REFERENCE

## Quick Start

```typescript
import { FederationEngine } from '@/app/federationMarketplace';

// Create engine
const engine = new FederationEngine('tenant-alpha');

// Execute query
const result = await engine.executeQuery(query, context, data);

if (result.success) {
  console.log('Benchmarks:', result.data.benchmarks);
  console.log('Insights:', result.data.insights);
}
```

---

## Federation Data Categories

| Category | Description | Examples |
|----------|-------------|----------|
| `performance-metrics` | Efficiency and completion rates | overall-efficiency, task-completion-rate |
| `compliance-rates` | Compliance and audit scores | compliance-score, audit-pass-rate |
| `capacity-utilization` | Resource utilization | resource-utilization, workload-balance |
| `alert-volumes` | Alert frequency and resolution | alert-frequency, resolution-time |
| `workflow-efficiency` | Workflow metrics | completion-rate, cycle-time |
| `training-completion` | Training and certification | training-completion-rate, certification-rate |
| `audit-findings-summary` | Audit statistics | findings-count, remediation-time |
| `operator-productivity` | Productivity metrics | productivity-score, tasks-per-shift |
| `cost-benchmarks` | Cost efficiency | cost-per-unit, operational-efficiency |
| `quality-metrics` | Quality scores | quality-score, defect-rate |

---

## Query Types

| Type | Purpose | Required Fields |
|------|---------|----------------|
| `list-federations` | Browse federations | - |
| `get-federation-metrics` | Get aggregated metrics | `federationId`, `categories` |
| `get-tenant-benchmarks` | Compare vs federation | `federationId`, `tenantId`, `categories` |
| `get-federation-insights` | Get recommendations | `federationId`, `categories` |
| `compare-tenants` | Anonymized peer comparison | `federationId`, `categories` |
| `trend-analysis` | Time-series trends | `federationId`, `categories`, `timeRange` |
| `cross-federation-compare` | Compare federations | `categories` |

---

## Standard Permissions

### Viewer Role
```typescript
const permissions = FederationPolicyEngine.getStandardPermissions('viewer');
// Returns: ['federation:view', 'federation:list', 'federation:view-metrics']
```

### Participant Role
```typescript
const permissions = FederationPolicyEngine.getStandardPermissions('participant');
// Returns: viewer permissions + benchmarks, insights, trends, data sharing
```

### Admin Role
```typescript
const permissions = FederationPolicyEngine.getStandardPermissions('admin');
// Returns: all permissions including cross-federation, all-tenant access
```

### Auditor Role
```typescript
const permissions = FederationPolicyEngine.getStandardPermissions('auditor');
// Returns: read-only access to all data for compliance
```

---

## Privacy Configuration

### Strict Privacy
```typescript
{
  privacyLevel: 'strict',
  sharingAgreement: {
    anonymizationLevel: 'full',
    aggregationThreshold: 5,  // minimum 5 tenants
    excludedFields: ['operator-names', 'facility-addresses', 'financial-details'],
    retentionDays: 365
  }
}
```

### Moderate Privacy
```typescript
{
  privacyLevel: 'moderate',
  sharingAgreement: {
    anonymizationLevel: 'partial',
    aggregationThreshold: 3,  // minimum 3 tenants
    excludedFields: ['operator-names'],
    retentionDays: 730
  }
}
```

---

## Aggregation

### Aggregate Metrics
```typescript
const aggregator = new FederationAggregator('fed-id');

const metric = aggregator.aggregateMetrics(
  'performance-metrics',
  'overall-efficiency',
  [
    { tenantId: 't1', value: 85.0, timestamp: new Date() },
    { tenantId: 't2', value: 82.5, timestamp: new Date() },
    { tenantId: 't3', value: 90.0, timestamp: new Date() },
    // ... more tenants
  ],
  sharingAgreement
);

// metric.value = median (82.5)
// metric.metadata = { mean, p25, p50, p75, p90, p95, p99, min, max }
```

### Anonymize Data
```typescript
const result = aggregator.anonymizeData(data, sharingAgreement);

console.log(result.anonymizedRecordCount);
console.log(result.fieldsRemoved);
console.log(result.privacyLevel);
```

---

## Benchmarking

### Generate Benchmarks
```typescript
const analytics = new FederationAnalyticsEngine('fed-id');

const benchmarks = analytics.generateBenchmarks(
  'tenant-alpha',
  [
    { category: 'performance-metrics', metricName: 'efficiency', value: 87.5 },
    { category: 'compliance-rates', metricName: 'compliance-score', value: 94.2 },
  ],
  federationMetrics
);

// Each benchmark includes:
// - tenantValue, federationMedian, federationP25, federationP75
// - tenantPercentile (0-100)
// - comparisonStatus: 'top-quartile' | 'above-average' | 'average' | 'below-average' | 'bottom-quartile'
// - gap (difference from median)
```

### Generate Insights
```typescript
const insights = analytics.generateInsights(benchmarks, {
  performanceGapPercent: 20,
  complianceMinimum: 90,
  efficiencyMinimum: 80
});

// Returns array of insights:
// - performance-opportunity
// - compliance-gap
// - efficiency-leader
// - workflow-bottleneck
// - training-gap
// - cost-optimization
// - quality-variance
// - capacity-alert
```

---

## Trend Analysis

### Analyze Trends
```typescript
const trend = analytics.analyzeTrends(
  'performance-metrics',
  'overall-efficiency',
  [
    { timestamp: new Date('2026-01-01'), value: 80.0 },
    { timestamp: new Date('2026-01-07'), value: 82.5 },
    { timestamp: new Date('2026-01-14'), value: 85.0 },
    { timestamp: new Date('2026-01-21'), value: 87.5 },
  ]
);

console.log(trend.trendDirection); // 'improving' | 'stable' | 'declining'
console.log(trend.changeRate);     // % change per period
console.log(trend.significance);   // 'high' | 'medium' | 'low'
```

---

## Policy Evaluation

### Query Policy
```typescript
const policyEngine = new FederationPolicyEngine('tenant-alpha');

const decision = policyEngine.evaluateQueryPolicy(
  'get-tenant-benchmarks',
  'fed-mycology-network',
  'tenant-alpha',
  context
);

if (!decision.allowed) {
  console.error('Access denied:', decision.reason);
  console.error('Missing permissions:', decision.missingPermissions);
}
```

### Data Sharing Policy
```typescript
const decision = policyEngine.evaluateDataSharingPolicy(
  'performance-metrics',
  federation,
  context
);
```

### Anonymization Validation
```typescript
const decision = policyEngine.validateAnonymizationRequirements(
  tenantCount,
  'strict',
  5  // aggregation threshold
);
```

---

## Logging

### Log Operations
```typescript
const log = new FederationLog('tenant-alpha');

log.logQuery(query, result, context);
log.logBenchmark('tenant-id', 'fed-id', benchmarkCount, true, context);
log.logInsightGeneration('fed-id', insightCount, categories, true, context);
log.logDataSharing('tenant-id', 'fed-id', categories, recordCount, true, true, context);
log.logPolicyEvaluation(decision, context, operationDetails);
```

### Query Logs
```typescript
// Get logs for tenant
const logs = log.getLogsForTenant('tenant-alpha', {
  operationType: 'query',
  startDate: new Date('2026-01-01'),
  endDate: new Date('2026-01-21'),
  successOnly: true
});

// Get statistics
const stats = log.getStatistics({ start, end });
console.log('Success rate:', stats.successRate);
console.log('By operation:', stats.operationsByType);
```

### Export Logs
```typescript
const json = log.exportToJSON({
  startDate: new Date('2026-01-01'),
  tenantId: 'tenant-alpha'
});
```

---

## Complete Example

```typescript
import { 
  FederationEngine, 
  FederationPolicyEngine,
  FederationQuery,
  FederationContext 
} from '@/app/federationMarketplace';

// 1. Setup
const engine = new FederationEngine('tenant-alpha');

// 2. Create query
const query: FederationQuery = {
  queryId: `query-${Date.now()}`,
  queryType: 'get-tenant-benchmarks',
  federationId: 'fed-mycology-network',
  tenantId: 'tenant-alpha',
  categories: ['performance-metrics', 'compliance-rates', 'workflow-efficiency'],
  timeRange: { 
    start: new Date('2026-01-01'), 
    end: new Date('2026-01-21') 
  },
  aggregationLevel: 'federation',
  includeAnonymizedData: true,
};

// 3. Create context with permissions
const context: FederationContext = {
  performerId: 'operator-001',
  performerRole: 'Facility Admin',
  tenantId: 'tenant-alpha',
  permissions: FederationPolicyEngine.getStandardPermissions('participant'),
  timestamp: new Date(),
};

// 4. Execute
const result = await engine.executeQuery(query, context, {
  federations: mockFederations,
  tenantData: mockData,
});

// 5. Handle results
if (result.success) {
  console.log('Execution time:', result.metadata.executionTimeMs, 'ms');
  console.log('Tenants included:', result.metadata.tenantsIncluded);
  
  // Process benchmarks
  if (result.data.benchmarks) {
    for (const benchmark of result.data.benchmarks) {
      console.log(`\n${benchmark.metricName}:`);
      console.log(`  Your Value: ${benchmark.tenantValue.toFixed(1)}%`);
      console.log(`  Federation Median: ${benchmark.federationMedian.toFixed(1)}%`);
      console.log(`  Percentile: ${benchmark.tenantPercentile}`);
      console.log(`  Status: ${benchmark.comparisonStatus}`);
      console.log(`  Gap: ${benchmark.gap > 0 ? '+' : ''}${benchmark.gap.toFixed(1)}%`);
    }
  }
  
  // Process insights
  if (result.data.insights) {
    console.log(`\n${result.data.insights.length} insights generated:`);
    for (const insight of result.data.insights) {
      console.log(`\n[${insight.severity.toUpperCase()}] ${insight.title}`);
      console.log(`  ${insight.description}`);
      if (insight.recommendations.length > 0) {
        console.log('  Recommendations:');
        insight.recommendations.forEach((rec, i) => {
          console.log(`    ${i + 1}. ${rec}`);
        });
      }
    }
  }
} else {
  console.error('Query failed:', result.error?.message);
}
```

---

## Insight Types

| Type | Trigger | Severity | Description |
|------|---------|----------|-------------|
| `performance-opportunity` | Percentile < 25, Gap > 20% | recommendation | Below-average performance |
| `efficiency-leader` | Percentile ≥ 75 | info | Top quartile performer |
| `compliance-gap` | compliance-rates < 90% | warning | Below compliance standards |
| `workflow-bottleneck` | workflow-efficiency < 80% | recommendation | Process inefficiencies |
| `training-gap` | training-completion < peers | recommendation | Training below federation |
| `cost-optimization` | cost metrics high | opportunity | Cost reduction potential |
| `quality-variance` | quality differs significantly | recommendation | Quality inconsistency |
| `capacity-alert` | capacity concerns vs peers | warning | Capacity issues detected |

---

## Comparison Status

| Percentile Range | Status | Color |
|-----------------|--------|-------|
| ≥ 75 | top-quartile | Green |
| 55-74 | above-average | Light Green |
| 45-54 | average | Gray |
| 25-44 | below-average | Light Red |
| < 25 | bottom-quartile | Red |

---

## Integration Points

- **Phase 50**: Audit findings → audit-findings-summary category
- **Phase 51**: Drift detection → capacity-utilization insights
- **Phase 52**: Alert Center → alert-volumes category
- **Phase 53**: Action Center → workflow-efficiency metrics
- **Phase 54**: Operator Analytics → operator-productivity category
- **Phase 55**: Real-time Performance → performance-metrics feed
- **Phase 56**: Capacity Planning → capacity-utilization category
- **Phase 57**: Workload Orchestration → workflow-efficiency data
- **Phase 58**: Executive Insights → aggregated reporting
- **Phase 59**: Enterprise Reporting → cross-federation reports
- **Phase 60**: Export Hub → data export integration
- **Phase 61**: Archive Center → historical trend data

---

## Phase 62 Complete ✅
