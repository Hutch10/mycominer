# PHASE 56: CAPACITY PLANNING - QUICK REFERENCE

**Last Updated:** 2025  
**Status:** ✅ Production Ready  

---

## QUICK START

### 1. Create Engine Instance
```typescript
import { CapacityEngine } from '@/app/capacityPlanning';

const engine = new CapacityEngine();
```

### 2. Prepare Input Data
```typescript
import { HistoricalMetricsInput, RealTimeSignalsInput, CapacityPolicyContext } from '@/app/capacityPlanning';

// Historical metrics (Phase 54)
const historicalMetrics: HistoricalMetricsInput[] = [
  {
    metricId: 'metric-1',
    timestamp: '2025-01-15T10:00:00Z',
    tenantId: 'tenant-mushroom-site',
    operatorWorkload: { 'operator-alice': 52.5 },
    taskThroughput: 85,
    totalAlertVolume: 32,
    slaAdherence: 94.2,
  },
  // ... more metrics
];

// Real-time signals (Phase 55)
const realTimeSignals: RealTimeSignalsInput[] = [
  {
    signalId: 'signal-1',
    timestamp: '2025-01-15T11:00:00Z',
    tenantId: 'tenant-mushroom-site',
    liveWorkload: { 'operator-alice': 58.3 },
    activeTasks: 47,
    activeAlerts: 19,
    workloadDelta: 5.8,
  },
  // ... more signals
];

// Policy context
const context: CapacityPolicyContext = {
  userId: 'user-admin',
  userTenantId: 'tenant-mushroom-site',
  permissions: ['capacity:execute-query', 'capacity:view-all-operators'],
};
```

### 3. Execute Query
```typescript
import { CapacityQuery } from '@/app/capacityPlanning';

const query: CapacityQuery = {
  queryId: 'query-1',
  description: 'Quick capacity forecast',
  scope: { tenantId: 'tenant-mushroom-site' },
  categories: ['operator-workload', 'task-volume'],
  timeWindows: ['next-1-hour', 'next-4-hours'],
  methods: ['rolling-average'],
  includeRiskWindows: true,
  includeBaseline: true,
};

const result = await engine.executeQuery(query, historicalMetrics, realTimeSignals, context);

console.log(`Projections: ${result.projections.length}`);
console.log(`Risks: ${result.riskWindows.length}`);
```

---

## PROJECTION CATEGORIES

| Category | Description | Unit |
|----------|-------------|------|
| **operator-workload** | Operator utilization over time | % |
| **task-volume** | Task throughput forecast | tasks/hr |
| **alert-volume** | Alert generation rate | alerts/hr |
| **sla-risk** | SLA adherence projection | % |
| **remediation-backlog** | Pending task accumulation | tasks |
| **cross-engine-correlation** | Alert-to-task correlation | % |
| **resource-utilization** | Overall system capacity | % |

---

## TIME WINDOWS

| Window | Duration | Use Case |
|--------|----------|----------|
| `next-1-hour` | 1 hour | Immediate planning |
| `next-4-hours` | 4 hours | Short-term allocation |
| `next-8-hours` | 8 hours | Shift planning |
| `next-12-hours` | 12 hours | Daily operations |
| `next-24-hours` | 1 day | Next-day forecast |
| `next-48-hours` | 2 days | Weekend planning |
| `next-7-days` | 1 week | Strategic planning |

---

## PROJECTION METHODS

### rolling-average
**Simple moving average**
- Window: Last 10 data points
- Best for: Stable workloads
- Confidence: High with ≥50 points

### weighted-average
**Time-weighted average**
- Recent data weighted more
- Best for: Trending workloads
- Confidence: High with ≥50 points

### baseline-delta
**Current vs baseline projection**
- Formula: `projected = current + (current - baseline)`
- Best for: Cyclic patterns
- Confidence: Requires valid baseline

### trend-slope
**Linear regression**
- Formula: `y = mx + b`
- Best for: Linear trends
- Confidence: High with ≥30 points

### moving-window
**Sliding window analysis**
- Adapts to recent patterns
- Best for: Dynamic workloads
- Confidence: Medium with ≥20 points

---

## METHOD COMPARISON

| Method | Stability | Responsiveness | Best For | Data Needed |
|--------|-----------|----------------|----------|-------------|
| **rolling-average** | High | Low | Stable workloads | ≥50 points |
| **weighted-average** | Medium | Medium | Trending workloads | ≥50 points |
| **baseline-delta** | Medium | High | Cyclic patterns | Valid baseline |
| **trend-slope** | Low | High | Linear trends | ≥30 points |
| **moving-window** | Medium | Medium | Dynamic workloads | ≥20 points |

---

## QUERY EXAMPLES

### Example 1: Quick 1-Hour Forecast
```typescript
const query: CapacityQuery = {
  queryId: 'quick-1h',
  description: 'Quick 1-hour capacity check',
  scope: { tenantId: 'tenant-mushroom-site' },
  categories: ['operator-workload', 'task-volume'],
  timeWindows: ['next-1-hour'],
  methods: ['rolling-average'],
  includeRiskWindows: true,
  includeBaseline: false,
};
```

### Example 2: Full Day Forecast
```typescript
const query: CapacityQuery = {
  queryId: 'full-day',
  description: 'Full 24-hour forecast',
  scope: { tenantId: 'tenant-mushroom-site' },
  categories: ['operator-workload', 'task-volume', 'alert-volume', 'sla-risk'],
  timeWindows: ['next-4-hours', 'next-12-hours', 'next-24-hours'],
  methods: ['rolling-average', 'trend-slope'],
  includeRiskWindows: true,
  includeBaseline: true,
};
```

### Example 3: Multi-Method Comparison
```typescript
const query: CapacityQuery = {
  queryId: 'multi-method',
  description: 'Compare all projection methods',
  scope: { tenantId: 'tenant-mushroom-site' },
  categories: ['operator-workload'],
  timeWindows: ['next-4-hours'],
  methods: ['rolling-average', 'weighted-average', 'baseline-delta', 'trend-slope', 'moving-window'],
  includeRiskWindows: false,
  includeBaseline: true,
};
```

### Example 4: Long-Range Forecast (Requires Permission)
```typescript
const query: CapacityQuery = {
  queryId: 'long-range',
  description: '7-day strategic forecast',
  scope: { tenantId: 'tenant-mushroom-site' },
  categories: ['operator-workload', 'task-volume', 'resource-utilization'],
  timeWindows: ['next-7-days'],
  methods: ['trend-slope'],
  includeRiskWindows: true,
  includeBaseline: true,
};

// Requires: capacity:long-range-forecast permission
```

### Example 5: Federation Query
```typescript
const query: CapacityQuery = {
  queryId: 'federation',
  description: 'Federation-wide capacity',
  scope: {
    tenantId: 'tenant-mushroom-site',
    federationId: 'federation-growers',
  },
  categories: ['operator-workload', 'task-volume'],
  timeWindows: ['next-24-hours'],
  methods: ['rolling-average'],
  includeRiskWindows: true,
  includeBaseline: true,
};

// Requires: capacity:federation-admin OR member of federation
```

---

## RISK TYPES

### sla-breach
**Trigger:** `slaAdherence < 95% AND taskTrend = 'increasing'`  
**Severity:** Critical  
**Recommendations:**
- Redistribute workload
- Review prioritization
- Add capacity

### overload
**Trigger:** `projectedWorkload > peakBaseline * 1.2`  
**Severity:** Critical (>150%), High (>120%)  
**Recommendations:**
- Add capacity immediately
- Defer non-critical tasks
- Enable overflow routing

### backlog-accumulation
**Trigger:** `taskTrend = 'increasing' AND workload > 90%`  
**Severity:** High  
**Recommendations:**
- Scale operator pool
- Implement batching
- Review automation

### resource-exhaustion
**Trigger:** `utilization > 85% AND trend = 'increasing'`  
**Severity:** Medium to High  
**Recommendations:**
- Plan expansion
- Optimize allocation
- Review scaling policies

---

## PERMISSIONS

### Required Permissions
- `capacity:execute-query` - Execute capacity queries
- `capacity:view-all-operators` - View all operator projections
- `capacity:view-team-operators` - View team-level data
- `capacity:view-cross-engine` - Access cross-engine-correlation category
- `capacity:view-resource-utilization` - Access resource-utilization category
- `capacity:view-risk-analysis` - View risk windows
- `capacity:long-range-forecast` - Execute 7-day forecasts
- `capacity:cross-tenant-read` - Access other tenants
- `capacity:federation-admin` - Admin federation queries
- `capacity:federation:{id}` - Access specific federation

---

## COMMON PATTERNS

### Pattern 1: Real-Time Monitoring
```typescript
// Execute query every 5 minutes
setInterval(async () => {
  const result = await engine.executeQuery(query, metrics, signals, context);
  updateDashboard(result);
}, 300000);
```

### Pattern 2: Risk Alert System
```typescript
const result = await engine.executeQuery(query, metrics, signals, context);

const criticalRisks = result.riskWindows.filter(r => r.severity === 'critical');

if (criticalRisks.length > 0) {
  sendAlertNotification(criticalRisks);
}
```

### Pattern 3: Export Audit Log
```typescript
const log = engine.getLog();

// CSV export
const csv = log.exportToCSV({ tenantId: 'tenant-mushroom-site' });
downloadFile('capacity-log.csv', csv);

// JSON export
const json = log.exportToJSON({ startDate: '2025-01-01T00:00:00Z' });
downloadFile('capacity-log.json', json);
```

### Pattern 4: Statistics Dashboard
```typescript
const stats = engine.getLog().getStatistics();

console.log(`Total Queries: ${stats.totalQueries}`);
console.log(`Total Projections: ${stats.totalProjections}`);
console.log(`Critical Risks: ${stats.riskDistribution.critical}`);
console.log(`Average Confidence: ${stats.confidenceLevels.high}/${stats.totalProjections}`);
```

### Pattern 5: Error Monitoring
```typescript
const errors = engine.getLog().getErrors({ errorCode: 'POLICY_VIOLATION' });

if (errors.length > 10) {
  console.warn(`High policy violation rate: ${errors.length} violations`);
}

const errorRate = engine.getLog().getErrorRate();
if (errorRate > 5) {
  console.error(`System error rate: ${errorRate.toFixed(1)}%`);
}
```

---

## RESULT STRUCTURE

### CapacityResult
```typescript
interface CapacityResult {
  resultId: string;
  query: CapacityQuery;
  baseline?: CapacityBaseline;
  projections: CapacityProjection[];
  riskWindows: CapacityRiskWindow[];
  summary: {
    totalProjections: number;
    totalRisks: number;
    criticalRisks: number;
    highRisks: number;
    averageConfidence: number;
    projectionRange: { start: string; end: string };
  };
  references: {
    metricsUsed: number;
    realTimeSignalsUsed: number;
    tasksAnalyzed: number;
    alertsAnalyzed: number;
    timeRangeCovered: string;
  };
  metadata: {
    executionTime: number;
    computedAt: string;
    policyRestrictions: string[];
    warnings: string[];
  };
}
```

### Accessing Results
```typescript
// Access baseline
const avgTasksPerHour = result.baseline?.averageTasksPerHour;
const slaAdherence = result.baseline?.averageSLAAdherence;

// Access projections
for (const proj of result.projections) {
  console.log(`${proj.category} (${proj.timeWindow}): ${proj.projectedValue} ${proj.unit}`);
  console.log(`  Delta: ${proj.deltaPercentage?.toFixed(1)}%`);
  console.log(`  Trend: ${proj.trendDirection}`);
  console.log(`  Confidence: ${proj.confidenceLevel}`);
}

// Access risks
for (const risk of result.riskWindows) {
  console.log(`Risk: ${risk.riskType} - ${risk.severity}`);
  console.log(`  Score: ${risk.riskScore}/100`);
  console.log(`  Window: ${risk.windowStart} - ${risk.windowEnd}`);
  console.log(`  Recommendations:`, risk.recommendations);
}

// Access summary
console.log(`Total Projections: ${result.summary.totalProjections}`);
console.log(`Critical Risks: ${result.summary.criticalRisks}`);
console.log(`Avg Confidence: ${result.summary.averageConfidence}%`);
console.log(`Execution Time: ${result.metadata.executionTime}ms`);
```

---

## PERFORMANCE TIPS

### 1. Optimize Query Scope
```typescript
// ❌ Too broad
categories: ['operator-workload', 'task-volume', 'alert-volume', 'sla-risk', 'remediation-backlog', 'cross-engine-correlation', 'resource-utilization']

// ✅ Focused
categories: ['operator-workload', 'task-volume']
```

### 2. Limit Time Windows
```typescript
// ❌ Too many
timeWindows: ['next-1-hour', 'next-4-hours', 'next-8-hours', 'next-12-hours', 'next-24-hours', 'next-48-hours', 'next-7-days']

// ✅ Specific
timeWindows: ['next-4-hours', 'next-24-hours']
```

### 3. Choose Appropriate Methods
```typescript
// ❌ All methods for every query
methods: ['rolling-average', 'weighted-average', 'baseline-delta', 'trend-slope', 'moving-window']

// ✅ Best method for use case
methods: ['rolling-average'] // Stable workloads
methods: ['trend-slope']     // Linear trends
```

### 4. Cache Historical Metrics
```typescript
// ❌ Fetch every query
const metrics = await fetchHistoricalMetrics();

// ✅ Cache for 5 minutes
const cachedMetrics = getCachedMetrics() || await fetchHistoricalMetrics();
```

### 5. Prune Old Log Entries
```typescript
// Run daily
engine.getLog().clearOldEntries(30); // Keep 30 days
```

---

## TROUBLESHOOTING

### Issue: Low Confidence Projections
**Cause:** Insufficient historical data  
**Solution:** Collect more data (≥50 points for high confidence)

### Issue: Policy Violation Errors
**Cause:** Missing permissions  
**Solution:** Check user permissions match query requirements

### Issue: No Risks Identified
**Cause:** All projections within normal ranges  
**Solution:** This is expected for stable systems

### Issue: High Error Rate
**Cause:** Invalid input data or configuration errors  
**Solution:** Check log errors with `getErrors()`, validate inputs

### Issue: Outdated Projections
**Cause:** Not re-querying frequently enough  
**Solution:** Re-execute queries every 5-15 minutes for real-time monitoring

---

## INTEGRATION

### With Phase 54 (Operator Analytics)
```typescript
import { getOperatorMetrics } from '@/app/operatorAnalytics';

const historicalMetrics = await getOperatorMetrics({ 
  tenantId: 'tenant-mushroom-site',
  hours: 48 
});
```

### With Phase 55 (Real-Time Performance)
```typescript
import { getRealTimeSignals } from '@/app/realtimePerformance';

const realTimeSignals = await getRealTimeSignals({ 
  tenantId: 'tenant-mushroom-site' 
});
```

### With Phase 52 (Alert Aggregation)
```typescript
import { getAlertVolume } from '@/app/alertAggregation';

const alertData = await getAlertVolume({ 
  tenantId: 'tenant-mushroom-site' 
});
```

### With Phase 53 (Task Management)
```typescript
import { getTaskMetrics } from '@/app/taskManagement';

const taskData = await getTaskMetrics({ 
  tenantId: 'tenant-mushroom-site' 
});
```

---

## CHEAT SHEET

### Most Common Query
```typescript
const query: CapacityQuery = {
  queryId: `query-${Date.now()}`,
  description: 'Standard capacity check',
  scope: { tenantId: YOUR_TENANT_ID },
  categories: ['operator-workload', 'task-volume', 'sla-risk'],
  timeWindows: ['next-4-hours', 'next-24-hours'],
  methods: ['rolling-average'],
  includeRiskWindows: true,
  includeBaseline: true,
};
```

### Essential Permissions
```typescript
permissions: [
  'capacity:execute-query',
  'capacity:view-all-operators',
  'capacity:view-risk-analysis',
]
```

### Quick Risk Check
```typescript
const criticalRisks = result.riskWindows.filter(r => r.severity === 'critical');
if (criticalRisks.length > 0) alert('Critical capacity risks detected!');
```

---

**For detailed documentation, see:** [PHASE56_SUMMARY.md](PHASE56_SUMMARY.md)  
**For full API reference, see:** [capacityTypes.ts](capacityTypes.ts)
