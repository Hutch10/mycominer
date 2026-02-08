# PHASE 54 QUICK REFERENCE
## Operator Performance & Workflow Analytics Center

**One-Page Guide for Developers**

---

## IMPORTS

```typescript
import {
  OperatorAnalyticsEngine,
  OperatorMetricQuery,
  OperatorMetricResult,
  OperatorAnalyticsPolicyContext,
  TaskDataInput,
  AlertDataInput,
  SLAThresholds,
} from '@/app/operatorAnalytics';
```

---

## QUICK START (3 Steps)

### Step 1: Create Engine
```typescript
const engine = new OperatorAnalyticsEngine();
```

### Step 2: Ingest Data
```typescript
// From Phase 53 (Action Center)
const tasks: TaskDataInput[] = getTasksFromActionCenter();
engine.ingestTaskData(tasks);

// From Phase 52 (Alert Center)
const alerts: AlertDataInput[] = getAlertsFromAlertCenter();
engine.ingestAlertData(alerts);
```

### Step 3: Execute Query
```typescript
const context: OperatorAnalyticsPolicyContext = {
  userId: 'user-001',
  userTenantId: 'tenant-001',
  userFederationId: 'fed-001',
  permissions: ['view-all-operators'],
};

const result = await engine.executeQuery({
  queryId: 'query-001',
  description: 'Monthly analytics',
  scope: { tenantId: 'tenant-001' },
  categories: ['task-throughput', 'sla-adherence'],
  timeRange: {
    startDate: '2024-01-01T00:00:00Z',
    endDate: '2024-01-31T23:59:59Z',
  },
  triggeredBy: context.userId,
  triggeredAt: new Date().toISOString(),
}, context);

console.log(result.metrics); // Array of computed metrics
```

---

## METRIC CATEGORIES (10)

| Category | Description | Breakdown |
|----------|-------------|-----------|
| `task-throughput` | Tasks completed per time period | By category, severity, status |
| `alert-response-time` | Time to acknowledge tasks | By severity, category, percentiles |
| `audit-remediation-timeline` | Time to resolve audit findings | By severity, category, percentiles |
| `drift-remediation-timeline` | Time to resolve drift issues | By severity, category, percentiles |
| `governance-resolution-time` | Time to resolve governance issues | By severity, category, percentiles |
| `documentation-remediation` | Time to complete documentation | By severity, category, percentiles |
| `simulation-resolution` | Time to resolve simulation issues | By severity, category, percentiles |
| `cross-engine-efficiency` | Efficiency across engines | By engine, correlations |
| `sla-adherence` | Tasks resolved within SLA | By severity, category, adherence % |
| `workload-distribution` | Task distribution across operators | By operator, balance score |

---

## QUICK QUERY METHODS

### Query Throughput
```typescript
const result = await engine.queryThroughput(
  { tenantId: 'tenant-001', facilityId: 'facility-001' },
  { startDate: '2024-01-01T00:00:00Z', endDate: '2024-01-07T23:59:59Z' },
  context
);

console.log(result.metrics[0].value); // 85 tasks
```

### Query SLA
```typescript
const slaThresholds: SLAThresholds = {
  bySeverity: { critical: 4, high: 24, medium: 72, low: 168, info: 720 },
};

const result = await engine.querySLA(
  { tenantId: 'tenant-001' },
  { startDate: '2024-01-01T00:00:00Z', endDate: '2024-01-31T23:59:59Z' },
  context,
  slaThresholds
);

console.log(result.metrics[0].value); // 92.5% adherence
```

### Query Operator Performance
```typescript
const result = await engine.queryOperatorPerformance(
  'operator-1',
  { tenantId: 'tenant-001' },
  { startDate: '2024-01-01T00:00:00Z', endDate: '2024-01-31T23:59:59Z' },
  context
);

console.log(result.performanceSnapshots[0].tasksCompleted); // 45
console.log(result.performanceSnapshots[0].slaAdherencePercentage); // 94.2%
```

---

## METRIC RESULT STRUCTURE

```typescript
{
  resultId: 'result-12345',
  query: { /* original query */ },
  metrics: [
    {
      metricId: 'metric-throughput-12345',
      category: 'task-throughput',
      value: 85,
      unit: 'tasks',
      breakdown: {
        byCategory: { 'alert-remediation': 45, 'audit-remediation': 40 },
        bySeverity: { critical: 10, high: 30, medium: 45 },
        byStatus: { resolved: 85 }
      }
    }
  ],
  performanceSnapshots: [
    {
      snapshotId: 'snapshot-op1-12345',
      operatorId: 'operator-1',
      tasksCompleted: 45,
      tasksActive: 8,
      averageResolutionTimeHours: 12.5,
      slaAdherencePercentage: 94.2
    }
  ],
  workloadProfile: {
    profileId: 'profile-12345',
    totalOperators: 5,
    totalTasks: 100,
    averageTasksPerOperator: 20.0,
    workloadBalance: { balanceScore: 81.0 }
  },
  summary: {
    totalMetrics: 5,
    overallSLAAdherence: 92.5,
    overallAverageResolutionTime: 15.3,
    overallThroughput: 85
  }
}
```

---

## SLA THRESHOLDS

```typescript
const slaThresholds: SLAThresholds = {
  bySeverity: {
    critical: 4,    // 4 hours
    high: 24,       // 24 hours
    medium: 72,     // 3 days
    low: 168,       // 7 days
    info: 720       // 30 days
  },
  byCategory: {
    'alert-remediation': 12,      // Override: 12 hours
    'simulation-mismatch': 48     // Override: 48 hours
  }
};
```

---

## PERMISSIONS

| Permission | Description |
|------------|-------------|
| `view-all-operators` | View all operator metrics |
| `view-team-operators` | View team operator metrics |
| `view-cross-engine-metrics` | Access cross-engine efficiency |
| `view-workload-metrics` | Access workload distribution |
| `view-sensitive-metrics` | Access sensitive categories |
| `cross-tenant-read` | Query across tenants |
| `federation-admin` | Full federation access |
| `federation-read:<fedId>` | Specific federation access |

---

## POLICY CONTEXT

```typescript
const context: OperatorAnalyticsPolicyContext = {
  userId: 'user-001',
  userTenantId: 'tenant-001',
  userFederationId: 'fed-001',
  permissions: [
    'view-all-operators',
    'view-cross-engine-metrics',
    'view-workload-metrics'
  ]
};
```

---

## LOGGING & STATISTICS

### Get Statistics
```typescript
const stats = engine.getStatistics();

console.log(stats.totalQueries);       // 150
console.log(stats.totalMetrics);       // 450
console.log(stats.byCategory);         // { 'task-throughput': 75, ... }
console.log(stats.trends.queriesChange); // +12.5%
```

### Get Log Entries
```typescript
const log = engine.getLog();

const entries = log.getEntries({
  entryType: 'metric',
  tenantId: 'tenant-001',
  category: 'sla-adherence',
  startDate: '2024-01-01T00:00:00Z',
  endDate: '2024-01-31T23:59:59Z',
  limit: 100
});

console.log(entries.length); // 25 metrics
```

### Get Errors
```typescript
const errors = log.getErrors({
  startDate: '2024-01-01T00:00:00Z',
  limit: 10
});

console.log(log.getErrorRate()); // 2.5%
```

### Export Logs
```typescript
const json = log.exportToJSON();
const csv = log.exportToCSV();
```

---

## PERFORMANCE SNAPSHOT STRUCTURE

```typescript
{
  snapshotId: 'snapshot-op1-12345',
  operatorId: 'operator-1',
  operatorName: 'John Smith',
  tasksCompleted: 45,
  tasksActive: 8,
  averageResolutionTimeHours: 12.5,
  slaAdherencePercentage: 94.2,
  byCategory: {
    'alert-remediation': {
      completed: 25,
      active: 3,
      averageResolutionTimeHours: 8.2
    }
  },
  bySeverity: {
    critical: {
      completed: 5,
      active: 1,
      averageResolutionTimeHours: 2.1
    }
  },
  trends: {
    throughputChange: 12.5,         // +12.5% vs previous period
    resolutionTimeChange: -8.3,     // -8.3% (faster)
    slaAdherenceChange: 2.1         // +2.1%
  }
}
```

---

## WORKLOAD PROFILE STRUCTURE

```typescript
{
  profileId: 'profile-12345',
  totalOperators: 5,
  totalTasks: 100,
  averageTasksPerOperator: 20.0,
  operators: [
    {
      operatorId: 'operator-1',
      operatorName: 'John Smith',
      totalTasks: 25,
      activeTasks: 5,
      completedTasks: 20,
      taskPercentage: 25.0,
      completionRate: 80.0,
      averageResolutionTimeHours: 10.5
    }
  ],
  workloadBalance: {
    minTasksPerOperator: 15,
    maxTasksPerOperator: 25,
    standardDeviation: 3.8,
    balanceScore: 81.0  // 100 = perfect balance
  }
}
```

---

## COMMON PATTERNS

### Pattern 1: Daily SLA Report
```typescript
const getDailySLAReport = async (date: string) => {
  const start = new Date(date);
  const end = new Date(start);
  end.setHours(23, 59, 59, 999);

  return await engine.querySLA(
    { tenantId: 'tenant-001' },
    { startDate: start.toISOString(), endDate: end.toISOString() },
    context
  );
};
```

### Pattern 2: Operator Leaderboard
```typescript
const getOperatorLeaderboard = async (operatorIds: string[]) => {
  const query: OperatorMetricQuery = {
    queryId: 'leaderboard',
    description: 'Operator leaderboard',
    scope: { tenantId: 'tenant-001' },
    categories: ['task-throughput', 'sla-adherence', 'alert-response-time'],
    operatorIds,
    timeRange: {
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date().toISOString()
    },
    triggeredBy: context.userId,
    triggeredAt: new Date().toISOString()
  };

  const result = await engine.executeQuery(query, context);
  
  return result.performanceSnapshots.sort(
    (a, b) => b.slaAdherencePercentage - a.slaAdherencePercentage
  );
};
```

### Pattern 3: Workload Rebalancing Alert
```typescript
const checkWorkloadBalance = async () => {
  const result = await engine.executeQuery({
    queryId: 'balance-check',
    description: 'Check workload balance',
    scope: { tenantId: 'tenant-001' },
    categories: ['workload-distribution'],
    timeRange: {
      startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date().toISOString()
    },
    triggeredBy: 'system',
    triggeredAt: new Date().toISOString()
  }, context);

  if (result.workloadProfile && result.workloadProfile.workloadBalance.balanceScore < 70) {
    console.warn('Workload imbalance detected!');
    console.log('Balance score:', result.workloadProfile.workloadBalance.balanceScore);
    console.log('Standard deviation:', result.workloadProfile.workloadBalance.standardDeviation);
  }
};
```

### Pattern 4: Cross-Engine Bottleneck Detection
```typescript
const detectBottlenecks = async () => {
  const result = await engine.executeQuery({
    queryId: 'bottleneck-detection',
    description: 'Detect cross-engine bottlenecks',
    scope: { tenantId: 'tenant-001' },
    categories: ['cross-engine-efficiency'],
    timeRange: {
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date().toISOString()
    },
    triggeredBy: 'system',
    triggeredAt: new Date().toISOString()
  }, context);

  const metric = result.metrics.find(m => m.category === 'cross-engine-efficiency');
  if (metric && 'breakdown' in metric) {
    const bottlenecks = Object.entries(metric.breakdown.byEngine)
      .filter(([_, data]: [string, any]) => data.completionRate < 70)
      .map(([engine, data]: [string, any]) => ({ engine, ...data }));

    if (bottlenecks.length > 0) {
      console.warn('Bottlenecks detected:', bottlenecks);
    }
  }
};
```

---

## ERROR HANDLING

```typescript
const result = await engine.executeQuery(query, context);

if (!result.success) {
  console.error('Query failed:', result.error);
  // Handle error
  return;
}

// Process successful result
console.log('Metrics:', result.metrics);
```

---

## POLICY VIOLATIONS

```typescript
const result = await engine.executeQuery(query, context);

if (!result.success && result.error.includes('Tenant isolation violated')) {
  // User tried to access another tenant's data
  console.error('Permission denied: Cross-tenant access not allowed');
}

if (!result.success && result.error.includes('Insufficient permissions')) {
  // User lacks required permission
  console.error('Permission denied: Missing required permission');
}
```

---

## AGGREGATOR DIRECT USAGE

```typescript
import { OperatorAnalyticsAggregator } from '@/app/operatorAnalytics';

const aggregator = new OperatorAnalyticsAggregator();

// Compute throughput
const throughput = aggregator.computeThroughputMetric(
  tasks,
  { tenantId: 'tenant-001' },
  { startDate: '2024-01-01T00:00:00Z', endDate: '2024-01-31T23:59:59Z' }
);

// Compute SLA
const sla = aggregator.computeSLAMetric(
  tasks,
  { bySeverity: { critical: 4, high: 24, medium: 72, low: 168, info: 720 } },
  { tenantId: 'tenant-001' },
  { startDate: '2024-01-01T00:00:00Z', endDate: '2024-01-31T23:59:59Z' }
);

// Compute workload profile
const profile = aggregator.computeWorkloadProfile(
  tasks,
  { tenantId: 'tenant-001' },
  { startDate: '2024-01-01T00:00:00Z', endDate: '2024-01-31T23:59:59Z' }
);
```

---

## TESTING

### Unit Test Example
```typescript
import { OperatorAnalyticsEngine } from '@/app/operatorAnalytics';

describe('OperatorAnalyticsEngine', () => {
  it('should compute throughput correctly', async () => {
    const engine = new OperatorAnalyticsEngine();
    
    const tasks: TaskDataInput[] = [
      {
        taskId: 'task-1',
        category: 'alert-remediation',
        severity: 'critical',
        status: 'resolved',
        createdAt: '2024-01-01T00:00:00Z',
        resolvedAt: '2024-01-01T02:00:00Z',
        assignedTo: 'operator-1',
        scope: { tenantId: 'tenant-001' }
      }
    ];

    engine.ingestTaskData(tasks);

    const result = await engine.queryThroughput(
      { tenantId: 'tenant-001' },
      { startDate: '2024-01-01T00:00:00Z', endDate: '2024-01-31T23:59:59Z' },
      { userId: 'user-1', userTenantId: 'tenant-001', permissions: [] }
    );

    expect(result.metrics[0].value).toBe(1);
  });
});
```

---

## PERFORMANCE TIPS

1. **Batch Queries**: Query multiple categories in one call instead of separate queries
2. **Limit Time Range**: Queries over 365 days are rejected; use smaller ranges
3. **Filter by Operator**: Query specific operators instead of all operators
4. **Cache Results**: Cache metric results for frequently accessed time periods
5. **Clear Old Data**: Use `engine.clearData()` to free memory after processing

---

## DEBUGGING

### Enable Verbose Logging
```typescript
const log = engine.getLog();

// Get recent entries
const recent = log.getLatestEntries(50);
console.log('Recent log entries:', recent);

// Get errors
const errors = log.getErrors({ limit: 10 });
console.log('Recent errors:', errors);

// Get policy decisions
const decisions = log.getPolicyDecisions({ allowed: false, limit: 10 });
console.log('Denied queries:', decisions);
```

### Check Statistics
```typescript
const stats = engine.getStatistics();
console.log('Query count:', stats.totalQueries);
console.log('Error rate:', log.getErrorRate());
console.log('Policy approval rate:', log.getPolicyApprovalRate());
```

---

## COMMON ERRORS

| Error | Cause | Solution |
|-------|-------|----------|
| "Tenant isolation violated" | Querying different tenant | Add `cross-tenant-read` permission |
| "Federation access denied" | No federation permission | Add `federation-admin` or `federation-read:<id>` |
| "Insufficient permissions" | Missing operator permission | Add `view-all-operators` or `view-team-operators` |
| "Time range cannot exceed 365 days" | Time range too large | Use smaller time ranges |
| "Start date cannot be in the future" | Invalid time range | Fix start date |

---

## FILE LOCATIONS

```
/app/operatorAnalytics/
├── operatorAnalyticsTypes.ts        # Type definitions
├── operatorAnalyticsAggregator.ts   # Metric computation
├── operatorAnalyticsPolicyEngine.ts # Authorization
├── operatorAnalyticsLog.ts          # Audit trail
├── operatorAnalyticsEngine.ts       # Main orchestrator
├── index.ts                         # Public API
├── page.tsx                         # UI components
├── PHASE54_SUMMARY.md               # Full documentation
└── PHASE54_QUICK_REFERENCE.md       # This file
```

---

## NEXT STEPS

1. **Integrate with UI**: Use provided React components in [page.tsx](c:\Users\hetfw\Documents\mushroom-site\app\operatorAnalytics\page.tsx)
2. **Connect Data Sources**: Replace sample data with real task/alert data from Phases 52-53
3. **Configure SLA**: Set tenant-specific SLA thresholds
4. **Set Permissions**: Configure user permissions based on roles
5. **Schedule Reports**: Set up automated daily/weekly/monthly reports

---

**Need More Help?** See [PHASE54_SUMMARY.md](c:\Users\hetfw\Documents\mushroom-site\app\operatorAnalytics\PHASE54_SUMMARY.md) for complete documentation.
