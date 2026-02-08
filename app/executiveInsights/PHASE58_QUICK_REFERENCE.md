# Phase 58: Executive Insights - Quick Reference

**Deterministic enterprise reporting with NO generative AI**

---

## Quick Start

### 1. Generate Executive Insights

```typescript
import { InsightsEngine, InsightQuery, InsightsPolicyContext, AggregatedDataInput } from '@/app/executiveInsights';

// Initialize engine
const engine = new InsightsEngine();

// Prepare query
const query: InsightQuery = {
  queryId: `query-${Date.now()}`,
  description: 'Daily executive dashboard',
  scope: {
    tenantId: 'tenant-alpha',    // Required for tenant-specific insights
    facilityId: 'facility-1',    // Optional: specific facility
  },
  categories: [
    'cross-engine-operational',  // System-wide summary
    'tenant-performance',        // Tenant KPIs
    'sla-compliance',           // SLA tracking
  ],
  timePeriod: '24h',            // 1h, 6h, 24h, 7d, 30d, or 'custom'
  includeTrends: true,          // Analyze time series trends
  includeCorrelations: true,    // Find cross-metric relationships
  aggregationLevel: 'facility', // tenant, facility, room, or operator
  requestedBy: 'user-123',
  requestedAt: new Date().toISOString(),
};

// Set context (user authorization)
const context: InsightsPolicyContext = {
  userId: 'user-123',
  userTenantId: 'tenant-alpha',
  userFederationId: 'fed-1',
  permissions: [
    'insights:executive-view',       // Required for cross-engine insights
    'insights:view-operator-details' // Optional: operator-level aggregation
  ],
  role: 'executive', // 'executive', 'admin', 'manager', 'operator'
};

// Prepare data (from Phases 50-57)
const data: AggregatedDataInput = {
  auditFindings: [...],      // Phase 50: Compliance Auditor
  driftEvents: [...],        // Phase 51: Integrity Engine
  alerts: [...],             // Phase 52: Alert Aggregation
  tasks: [...],              // Phase 53: Task Management
  operatorMetrics: [...],    // Phase 54: Operator Analytics
  realTimeSignals: [...],    // Phase 55: Real-Time Monitoring
  capacityProjections: [...],// Phase 56: Capacity Planning
  schedules: [...],          // Phase 57: Workload Orchestration
};

// Execute query
const result = engine.executeQuery(query, context, data);

if (result.success) {
  console.log(`Generated ${result.summaries.length} summaries in ${result.metadata.computationTimeMs}ms`);
  console.log('Data sources:', result.metadata.dataSourcesQueried);
} else {
  console.error('Query failed:', result.error);
}
```

---

## Common Query Patterns

### Pattern 1: Executive Dashboard (Cross-Engine Overview)

```typescript
const query: InsightQuery = {
  queryId: 'exec-dashboard-' + Date.now(),
  description: 'C-level executive dashboard',
  scope: {},  // No scope = cross-tenant (requires permission)
  categories: ['cross-engine-operational'],
  timePeriod: '24h',
  includeTrends: false,
  includeCorrelations: false,
  aggregationLevel: 'tenant',
  requestedBy: 'ceo-user',
  requestedAt: new Date().toISOString(),
};

// Context requires executive role or permission
const context: InsightsPolicyContext = {
  userId: 'ceo-user',
  userTenantId: 'tenant-alpha',
  permissions: ['insights:executive-view', 'insights:cross-tenant-read'],
  role: 'executive',
};
```

**Result:** System-wide summary with tasks, alerts, drifts, findings, capacity, SLA compliance.

---

### Pattern 2: Tenant Performance Report

```typescript
const query: InsightQuery = {
  queryId: 'tenant-report-' + Date.now(),
  description: 'Monthly tenant performance review',
  scope: { tenantId: 'tenant-alpha' },
  categories: [
    'tenant-performance',
    'sla-compliance',
    'risk-drift',
    'operator-performance',
  ],
  timePeriod: '30d',
  includeTrends: true,  // Show performance trends over 30 days
  includeCorrelations: true,
  aggregationLevel: 'tenant',
  requestedBy: 'manager-user',
  requestedAt: new Date().toISOString(),
};

const context: InsightsPolicyContext = {
  userId: 'manager-user',
  userTenantId: 'tenant-alpha',
  permissions: ['insights:long-range-analysis'],  // Required for >30 days
  role: 'manager',
};
```

**Result:** Complete tenant report with task/alert completion, compliance scores, risk levels, operator performance, and 30-day trends.

---

### Pattern 3: Facility Operations Dashboard

```typescript
const query: InsightQuery = {
  queryId: 'facility-ops-' + Date.now(),
  description: 'Facility operational dashboard',
  scope: {
    tenantId: 'tenant-alpha',
    facilityId: 'facility-1',
  },
  categories: [
    'facility-performance',
    'capacity-scheduling',
    'operator-performance',
  ],
  timePeriod: '7d',
  includeTrends: true,
  includeCorrelations: false,
  aggregationLevel: 'facility',
  requestedBy: 'facility-manager',
  requestedAt: new Date().toISOString(),
};

const context: InsightsPolicyContext = {
  userId: 'facility-manager',
  userTenantId: 'tenant-alpha',
  permissions: ['insights:view-operator-details'],
  role: 'manager',
};
```

**Result:** Facility-specific metrics including rooms, operators, tasks per room, capacity utilization, workload balance, operator distribution.

---

### Pattern 4: Risk & Compliance Report

```typescript
const query: InsightQuery = {
  queryId: 'risk-compliance-' + Date.now(),
  description: 'Weekly risk and compliance report',
  scope: { tenantId: 'tenant-alpha' },
  categories: [
    'risk-drift',
    'sla-compliance',
    'governance-documentation',
  ],
  timePeriod: '7d',
  includeTrends: true,
  includeCorrelations: false,
  aggregationLevel: 'tenant',
  requestedBy: 'compliance-officer',
  requestedAt: new Date().toISOString(),
};

const context: InsightsPolicyContext = {
  userId: 'compliance-officer',
  userTenantId: 'tenant-alpha',
  permissions: [],
  role: 'manager',
};
```

**Result:** Risk summary (drift events, audit findings, integrity score), SLA compliance breakdown, documentation completeness.

---

## Metric Reference

### Cross-Engine Operational Summary

| Metric | Formula | Source |
|--------|---------|--------|
| Total Tasks | Count of all tasks | Phase 53 |
| Critical Tasks | `priority === 'critical'` | Phase 53 |
| Total Alerts | Count of all alerts | Phase 52 |
| Critical Alerts | `severity === 'critical'` | Phase 52 |
| Total Drift Events | Count of all drifts | Phase 51 |
| Critical Drifts | `severity >= 80` | Phase 51 |
| Total Audit Findings | Count of all findings | Phase 50 |
| Critical Audit Findings | `severity === 'critical'` | Phase 50 |
| Scheduled Slots | Sum of all schedule slots | Phase 57 |
| Total Operators | Count of unique operators | Phase 54 |
| Avg Capacity Utilization | `sum(schedule.avgCapacity) / schedules.length` | Phase 57 |
| Avg Operator Utilization | `sum(op.utilization) / operators.length` | Phase 54 |
| SLA Compliance Rate | Average of task and schedule SLA compliance | Phases 53, 57 |

### Tenant Performance Summary

| Metric | Formula | Threshold |
|--------|---------|-----------|
| Task Completion Rate | `(completed / total) * 100` | >90% = good |
| Alert Resolution Rate | `(resolved / total) * 100` | >85% = good |
| Audit Compliance Score | `100 - (unresolved / total * 100)` | >95% = excellent |
| Drift Score | Average drift severity | <20 = good |
| Documentation Completeness | `(complete / total) * 100` | >90% = good |
| Schedule Efficiency | `100 - (conflicts / slots * 100)` | >95% = excellent |
| Risk Score | `(findingRisk + driftRisk + scheduleRisk) / 3` | <25 = low |
| Risk Level | `critical ≥75, high ≥50, medium ≥25, low <25` | low = good |

### SLA Compliance Definitions

| Status | Task Criteria | Alert Criteria | Schedule Criteria |
|--------|---------------|----------------|-------------------|
| **Met** | `completedAt <= slaDeadline` | `resolvedAt <= slaDeadline` | `slaRiskScore < 20` |
| **At Risk** | `!completed && (deadline - now) < 1h` | `!resolved && (deadline - now) < 1h` | `slaRiskScore >= 20 && < 50` |
| **Breached** | `!completed && deadline < now` | `!resolved && deadline < now` | `slaRiskScore >= 50` |

### Operator Performance Thresholds

| Metric | Underutilized | Optimal | Overutilized |
|--------|---------------|---------|--------------|
| Utilization Rate | <40% | 40-80% | >80% |
| SLA Compliance | <85% | 85-95% | >95% |
| Task Completion | <80% | 80-95% | >95% |

### Risk Levels

| Level | Score Range | Color | Action Required |
|-------|-------------|-------|-----------------|
| **Critical** | 75-100 | Red | Immediate action |
| **High** | 50-74 | Orange | Action within 24h |
| **Medium** | 25-49 | Yellow | Monitor closely |
| **Low** | 0-24 | Green | Standard monitoring |

---

## Trend Analysis

### Direction Thresholds

```typescript
const direction = 
  Math.abs(changePercentage) < 5 ? 'stable' :
  changePercentage >= 5 ? 'increasing' :
  changePercentage <= -5 ? 'decreasing' :
  'volatile';
```

### Volatility Calculation

```typescript
// Coefficient of Variation
const mean = dataPoints.reduce((sum, p) => sum + p.value, 0) / dataPoints.length;
const variance = dataPoints.reduce((sum, p) => sum + Math.pow(p.value - mean, 2), 0) / dataPoints.length;
const stdDev = Math.sqrt(variance);
const volatility = (stdDev / mean) * 100;
```

### Significance Levels

| Significance | Change Percentage | Interpretation |
|--------------|-------------------|----------------|
| **Low** | <10% | Minor fluctuation |
| **Medium** | 10-30% | Moderate change |
| **High** | >30% | Significant shift |

---

## Correlation Analysis

### Strength Classification

| Strength | Coefficient Range | Interpretation |
|----------|-------------------|----------------|
| **Weak** | 0.0 - 0.3 | Little relationship |
| **Moderate** | 0.3 - 0.7 | Clear relationship |
| **Strong** | 0.7 - 1.0 | Very strong relationship |

### Example Correlations

1. **Capacity Utilization ↔ Task Completion Rate**
   - Expected: Positive moderate (0.5-0.7)
   - Interpretation: Higher capacity → more completed tasks

2. **Drift Events ↔ Alert Count**
   - Expected: Positive strong (0.7-0.9)
   - Interpretation: Drift detection triggers alerts

3. **Operator Utilization ↔ SLA Compliance**
   - Expected: Negative weak (-0.3 to 0)
   - Interpretation: Overutilized operators may miss SLAs

---

## Policy Permissions

### Required Permissions

| Action | Permission | Default Roles |
|--------|------------|---------------|
| Query own tenant | (none) | All roles |
| Query other tenants | `insights:cross-tenant-read` | Admin only |
| Cross-engine insights | `insights:executive-view` | Executive, Admin |
| Operator-level details | `insights:view-operator-details` | Manager, Admin |
| >30 day queries | `insights:long-range-analysis` | Executive, Admin |
| Federation insights | `insights:federation-admin` | Admin only |
| Specific federation | `insights:federation:{id}` | Assigned users |

### Role Defaults

```typescript
const rolePermissions = {
  executive: [
    'insights:executive-view',
    'insights:cross-tenant-read',
    'insights:long-range-analysis',
    'insights:view-operator-details',
  ],
  admin: [
    'insights:executive-view',
    'insights:cross-tenant-read',
    'insights:federation-admin',
    'insights:long-range-analysis',
    'insights:view-operator-details',
  ],
  manager: [
    'insights:view-operator-details',
  ],
  operator: [],
};
```

---

## Log & Statistics

### Query Log Entries

```typescript
// Get recent insights
const entries = engine.getLog().getLatestEntries(50);

// Filter by tenant
const tenantEntries = engine.getLog().getEntries({
  tenantId: 'tenant-alpha',
  startDate: new Date('2024-01-01').toISOString(),
  endDate: new Date('2024-01-31').toISOString(),
});

// Get statistics
const stats = engine.getStatistics();
console.log(`Total insights: ${stats.totalInsights}`);
console.log(`24h change: ${stats.trends.insightsChange}`);
```

### Export Data

```typescript
// Export to JSON
const json = engine.getLog().exportToJSON({
  tenantId: 'tenant-alpha',
  entryType: 'insight-generated',
  limit: 1000,
});

// Export to CSV
const csv = engine.getLog().exportToCSV({
  startDate: new Date('2024-01-01').toISOString(),
  endDate: new Date('2024-01-31').toISOString(),
});
```

---

## Troubleshooting

### Issue: "Policy violation: Cross-tenant access denied"

**Cause:** User trying to query insights for different tenant  
**Solution:** Add `insights:cross-tenant-read` permission OR set `scope.tenantId` to user's own tenant

```typescript
// Fix 1: Add permission
context.permissions.push('insights:cross-tenant-read');

// Fix 2: Restrict scope
query.scope = { tenantId: context.userTenantId };
```

---

### Issue: "Policy violation: Executive-level insights require executive permissions"

**Cause:** User lacks permission for `cross-engine-operational` category  
**Solution:** Add executive role or `insights:executive-view` permission

```typescript
// Fix 1: Use executive role
context.role = 'executive';

// Fix 2: Add permission
context.permissions.push('insights:executive-view');

// Fix 3: Remove cross-engine category
query.categories = query.categories.filter(c => c !== 'cross-engine-operational');
```

---

### Issue: "Policy violation: Time period exceeds 30 days"

**Cause:** Query for >30 days without long-range permission  
**Solution:** Add permission OR reduce time period

```typescript
// Fix 1: Add permission
context.permissions.push('insights:long-range-analysis');

// Fix 2: Reduce period
query.timePeriod = '7d'; // Instead of '30d' or custom range
```

---

### Issue: "No summaries generated"

**Cause:** Policy filtered out all summaries OR no data in scope  
**Solution:** Check policy decision and data filtering

```typescript
// Check log for policy decision
const logEntries = engine.getLog().getEntries({ entryType: 'policy-decision' });
console.log('Latest policy decision:', logEntries[logEntries.length - 1]);

// Verify data exists for scope
console.log('Filtered data counts:', {
  auditFindings: data.auditFindings.filter(f => f.tenantId === query.scope.tenantId).length,
  tasks: data.tasks.filter(t => t.tenantId === query.scope.tenantId).length,
  // ... check other arrays
});
```

---

### Issue: "Computation time too high (>500ms)"

**Cause:** Large data volume OR inefficient aggregation  
**Solution:** Reduce scope OR optimize data filtering

```typescript
// Fix 1: Add facility filter
query.scope.facilityId = 'facility-1';

// Fix 2: Reduce time period
query.timePeriod = '24h'; // Instead of '30d'

// Fix 3: Limit categories
query.categories = ['tenant-performance', 'sla-compliance']; // Only 2 instead of all 8
```

---

## Best Practices

### ✅ DO

- Always provide `requestedBy` and `requestedAt` for audit trail
- Use specific `scope` (tenantId, facilityId) when possible for performance
- Request only needed categories to reduce computation time
- Include trends for time-based reports (weekly, monthly)
- Include correlations for root cause analysis
- Check `result.success` before accessing summaries
- Log policy violations for security monitoring
- Export data periodically for long-term reporting

### ❌ DON'T

- Don't query without proper permissions (will fail policy check)
- Don't request all 8 categories unless needed (impacts performance)
- Don't use >30 day periods for real-time dashboards (reduced accuracy)
- Don't skip error handling (policy violations throw errors)
- Don't modify result objects (read-only)
- Don't bypass policy engine (all queries must go through executeQuery)

---

## Integration Examples

### React Hook

```typescript
import { useState, useEffect } from 'react';
import { InsightsEngine, InsightQuery, InsightsPolicyContext } from '@/app/executiveInsights';

export function useExecutiveInsights(query: InsightQuery, context: InsightsPolicyContext) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const engine = new InsightsEngine();
    // Fetch data from APIs for Phases 50-57
    Promise.all([
      fetch('/api/audit-findings').then(r => r.json()),
      fetch('/api/drift-events').then(r => r.json()),
      // ... fetch from all 8 phases
    ]).then(([auditFindings, driftEvents, ...rest]) => {
      const data = { auditFindings, driftEvents, /* ... */ };
      const result = engine.executeQuery(query, context, data);
      setResult(result);
      setLoading(false);
    }).catch(err => {
      setError(err);
      setLoading(false);
    });
  }, [query.queryId]);

  return { result, loading, error };
}
```

### API Endpoint (Next.js)

```typescript
// app/api/insights/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { InsightsEngine } from '@/app/executiveInsights';

export async function POST(req: NextRequest) {
  const { query, context, data } = await req.json();
  
  const engine = new InsightsEngine();
  const result = engine.executeQuery(query, context, data);
  
  return NextResponse.json(result);
}
```

---

## Quick Reference Card

| Category | Use Case | Time Period | Permissions |
|----------|----------|-------------|-------------|
| `cross-engine-operational` | C-level dashboard | 24h | Executive |
| `tenant-performance` | Tenant review | 7d-30d | Manager |
| `facility-performance` | Facility ops | 7d | Manager |
| `sla-compliance` | Compliance report | 7d-30d | Manager |
| `risk-drift` | Risk assessment | 24h-7d | Manager |
| `capacity-scheduling` | Resource planning | 7d | Manager |
| `operator-performance` | HR review | 30d | Manager + operator-details |
| `governance-documentation` | Audit prep | 30d | Manager |

---

**Phase 58 Complete** • Deterministic insights from real operational data • NO generative AI
