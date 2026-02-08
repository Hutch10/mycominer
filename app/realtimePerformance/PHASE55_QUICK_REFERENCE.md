# Phase 55: Real-Time Performance Monitoring - Quick Reference

## One-Page Developer Guide

### Quick Start (3 Steps)

```typescript
// 1. Create engine
import { RealTimeEngine } from '@/app/realtimePerformance';
const engine = new RealTimeEngine();

// 2. Ingest events from source systems
engine.ingestEvent({
  eventId: 'event-001',
  category: 'task-lifecycle',
  eventType: 'created',
  timestamp: new Date().toISOString(),
  scope: { tenantId: 'tenant-alpha', facilityId: 'facility-01' },
  severity: 'critical',
  entityId: 'task-123',
  entityType: 'task',
  operatorId: 'op-001',
  metadata: { sourceSystem: 'action-center', sourcePhase: 53 },
  payload: {},
});

// 3. Query live metrics
const result = await engine.queryLiveWorkload(
  { tenantId: 'tenant-alpha', facilityId: 'facility-01' },
  { userId: 'user-001', userTenantId: 'tenant-alpha', permissions: [] }
);
console.log('Active tasks:', result.metrics[0].value);
```

---

## Event Categories (8)

| Category | Event Types | Source Phase |
|----------|------------|--------------|
| `task-lifecycle` | created, acknowledged, assigned, in-progress, resolved, dismissed | Phase 53 |
| `alert-lifecycle` | detected, acknowledged, escalated, resolved, dismissed | Phase 52 |
| `audit-finding` | finding-created, finding-acknowledged, remediation-started, remediation-completed | Phase 50 |
| `drift-detection` | drift-detected, drift-acknowledged, drift-remediated | Phase 51 |
| `governance-lineage` | lineage-updated, policy-violation, policy-resolved | Phase 45 |
| `documentation-drift` | doc-outdated, doc-updated, doc-validated | Phase 47 |
| `simulation-mismatch` | mismatch-detected, mismatch-analyzed, mismatch-resolved | Phase 49 |
| `performance-signal` | metric-computed, sla-breached, workload-changed | Phase 54 |

---

## Metric Categories (8)

| Category | Value Type | Update Frequency | Purpose |
|----------|-----------|------------------|---------|
| `live-workload` | tasks | Real-time | Current operator workload |
| `active-tasks` | tasks | 30 seconds | Tasks in progress |
| `sla-countdown` | timers | 10 seconds | SLA time remaining |
| `response-latency` | minutes | 1 minute | Alert acknowledgement time |
| `remediation-timeline` | remediations | 30 seconds | Active remediation count |
| `cross-engine-performance` | events/min | 1 minute | System-wide activity |
| `workload-delta` | tasks | 30 seconds | Workload change |
| `trend-signal` | events/min | 1 minute | Performance trend |

---

## Quick Query Methods

### Query Live Workload
```typescript
const result = await engine.queryLiveWorkload(
  { tenantId: 'tenant-alpha', facilityId: 'facility-01' },
  context,
  'operator-001' // optional: specific operator
);
```

### Query SLA Countdowns
```typescript
const result = await engine.querySLACountdowns(
  { tenantId: 'tenant-alpha' },
  context
);
const breaches = result.metrics[0].breakdown.byStatus.breach;
```

### Query Active Tasks
```typescript
const result = await engine.queryActiveTasks(
  { tenantId: 'tenant-alpha', facilityId: 'facility-01' },
  context
);
```

### Query Cross-Engine Performance
```typescript
const result = await engine.queryCrossEnginePerformance(
  { tenantId: 'tenant-alpha' },
  context
);
```

---

## Result Structure

```typescript
interface RealTimeResult {
  resultId: string;
  query: RealTimeQuery;
  metrics: RealTimeMetric[];
  streamState: RealTimeStreamState;
  references: {
    taskIds: string[];
    alertIds: string[];
    auditFindingIds: string[];
    driftEventIds: string[];
    // ...
  };
  summary: {
    totalMetrics: number;
    activeAlerts: number;
    activeTasks: number;
    operatorsOnline: number;
    avgResponseTime: number;
    slaAdherence: number;
  };
  success: boolean;
  error?: string;
}
```

---

## Stream State Access

### Get Current State
```typescript
const state = engine.getStreamState({ tenantId: 'tenant-alpha' });
console.log('Events per minute:', state.rollingMetrics.eventsPerMinute);
```

### Get Recent Events
```typescript
const events = engine.getRecentEvents({ tenantId: 'tenant-alpha' }, 20);
for (const event of events) {
  console.log(`${event.category}: ${event.eventType}`);
}
```

### Get SLA Countdowns
```typescript
const countdowns = engine.getSLACountdowns({ tenantId: 'tenant-alpha' });
const breaches = countdowns.filter(c => c.status === 'breach');
```

### Get Workload State
```typescript
const workload = engine.getWorkloadState({ tenantId: 'tenant-alpha' });
for (const operator of workload) {
  console.log(`${operator.operatorName}: ${operator.activeTasks} tasks`);
}
```

---

## Permissions

| Permission | Purpose |
|-----------|---------|
| `realtime:cross-tenant-read` | Access data from other tenants |
| `realtime:federation-admin` | Full federation access |
| `realtime:view-all-operators` | View all operator metrics |
| `realtime:view-team-operators` | View team operator metrics |
| `realtime:view-cross-engine-metrics` | View cross-engine performance |
| `realtime:view-workload-metrics` | View workload delta metrics |
| `realtime:view-trend-metrics` | View trend signals |
| `realtime:bulk-query` | Query >10 operators at once |
| `realtime:view-sensitive-metrics` | View sensitive metric categories |

---

## Event Subscriptions

### Subscribe
```typescript
const subscriptionId = engine.subscribeToEvents(
  { tenantId: 'tenant-alpha', facilityId: 'facility-01' },
  ['task-lifecycle', 'alert-lifecycle'],
  (event) => {
    if (event.severity === 'critical') {
      notifyOperator(event);
    }
  },
  context
);
```

### Unsubscribe
```typescript
engine.unsubscribeFromEvents(subscriptionId);
```

---

## Logging & Statistics

### Get Statistics
```typescript
const stats = engine.getStatistics();
console.log('Total events:', stats.totalEventsReceived);
console.log('Events per minute change:', stats.trends.eventsPerMinuteChange);
```

### Get Log Entries
```typescript
const entries = engine.getLog({
  entryType: 'event-received',
  tenantId: 'tenant-alpha',
  startDate: '2026-01-20T00:00:00Z',
  limit: 100,
});
```

### Export Logs
```typescript
const jsonExport = engine.exportLogs('json', { tenantId: 'tenant-alpha' });
const csvExport = engine.exportLogs('csv', { tenantId: 'tenant-alpha' });
```

---

## Common Patterns

### Pattern 1: Live Dashboard
```typescript
// Subscribe to all events for live updates
const subId = engine.subscribeToEvents(
  { tenantId: 'tenant-alpha' },
  ['task-lifecycle', 'alert-lifecycle'],
  (event) => {
    // Update UI in real-time
    updateDashboard(event);
  },
  context
);

// Poll for metrics every 5 seconds
setInterval(async () => {
  const result = await engine.executeQuery({
    queryId: generateId(),
    description: 'Live dashboard query',
    scope: { tenantId: 'tenant-alpha' },
    categories: ['live-workload', 'sla-countdown', 'active-tasks'],
    requestedBy: userId,
    requestedAt: new Date().toISOString(),
  }, context);
  
  renderMetrics(result.metrics);
}, 5000);
```

### Pattern 2: SLA Breach Alerting
```typescript
// Monitor SLA countdowns
setInterval(() => {
  const countdowns = engine.getSLACountdowns({ tenantId: 'tenant-alpha' });
  const breaches = countdowns.filter(c => c.status === 'breach');
  
  for (const breach of breaches) {
    sendAlert({
      severity: 'critical',
      message: `SLA breached for ${breach.entityType} ${breach.entityId}`,
      timeOverdue: Math.abs(breach.timeRemainingHours),
    });
  }
}, 10000); // Check every 10 seconds
```

### Pattern 3: Workload Rebalancing
```typescript
// Monitor workload distribution
const result = await engine.queryLiveWorkload({ tenantId: 'tenant-alpha' }, context);
const workloadMetric = result.metrics[0];

const operators = Object.entries(workloadMetric.breakdown.byOperator);
const maxLoad = Math.max(...operators.map(([_, tasks]) => tasks));
const minLoad = Math.min(...operators.map(([_, tasks]) => tasks));

if (maxLoad - minLoad > 5) {
  console.log('Workload imbalance detected - consider rebalancing');
  // Trigger rebalancing logic
}
```

### Pattern 4: Performance Degradation Detection
```typescript
// Monitor trend signals
const result = await engine.executeQuery({
  // ...
  categories: ['trend-signal', 'cross-engine-performance'],
}, context);

for (const metric of result.metrics) {
  if (metric.category === 'trend-signal' && metric.trend) {
    if (metric.trend.direction === 'decreasing' && metric.trend.changeRate < -20) {
      console.log('Performance degradation detected:', metric.trend);
      // Trigger investigation
    }
  }
}
```

---

## Error Handling

### Query Errors
```typescript
const result = await engine.executeQuery(query, context);

if (!result.success) {
  console.error('Query failed:', result.error);
  // Handle error
}
```

### Policy Violations
```typescript
// Check policy decision in log
const decisions = engine.getLog({ entryType: 'policy-decision' });
const denied = decisions.filter(d => !d.allowed);

for (const decision of denied) {
  console.log('Access denied:', decision.reason, decision.violations);
}
```

---

## Testing

### Unit Test Example
```typescript
import { RealTimeStream } from '@/app/realtimePerformance';

test('stream state updates on event ingestion', () => {
  const stream = new RealTimeStream();
  
  stream.ingestEvent({
    eventId: 'test-001',
    category: 'task-lifecycle',
    eventType: 'created',
    timestamp: new Date().toISOString(),
    scope: { tenantId: 'test-tenant' },
    severity: 'critical',
    entityId: 'task-123',
    entityType: 'task',
    metadata: { sourceSystem: 'test', sourcePhase: 0 },
    payload: {},
  });
  
  const state = stream.getStreamState({ tenantId: 'test-tenant' });
  expect(state.recentEvents.length).toBe(1);
  expect(state.rollingMetrics.totalEventsReceived).toBe(1);
});
```

---

## Performance Tips

1. **Limit Query Scope**: Query specific facilities instead of entire tenants
2. **Use Quick Methods**: Use `queryLiveWorkload()` instead of full `executeQuery()`
3. **Subscribe Selectively**: Only subscribe to needed event categories
4. **Batch Event Ingestion**: Use `ingestEvents()` for bulk ingestion
5. **Cache Results**: Cache metric results for their validity period

---

## Debugging

### Verbose Logging
```typescript
// Check stream health
const state = engine.getStreamState({ tenantId: 'tenant-alpha' });
console.log('Stream active:', state.streamHealth.isActive);
console.log('Event lag:', state.streamHealth.eventLag, 'ms');
console.log('Missed events:', state.streamHealth.missedEvents);
```

### Statistics Check
```typescript
const stats = engine.getStatistics();
console.log('Events received:', stats.totalEventsReceived);
console.log('Metrics computed:', stats.totalMetricsComputed);
console.log('Policy decisions:', stats.totalPolicyDecisions);
console.log('Error rate:', engine.getLog({ entryType: 'error' }).length);
```

---

## Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "No stream state found" | No events ingested yet | Ingest events before querying |
| "Tenant isolation violated" | Querying other tenant's data | Check permissions or scope |
| "Category access denied" | Missing category permission | Grant required permission |
| "Bulk query denied" | >10 operators without permission | Grant `realtime:bulk-query` or reduce scope |

---

## File Locations

- **Types**: `/app/realtimePerformance/realtimeTypes.ts`
- **Engine**: `/app/realtimePerformance/realtimeEngine.ts`
- **Stream**: `/app/realtimePerformance/realtimeStream.ts`
- **Aggregator**: `/app/realtimePerformance/realtimeAggregator.ts`
- **Policy**: `/app/realtimePerformance/realtimePolicyEngine.ts`
- **Log**: `/app/realtimePerformance/realtimeLog.ts`
- **UI**: `/app/realtimePerformance/page.tsx`

---

## Integration Points

**Upstream (Event Sources)**:
- Phase 53: Action Center (task lifecycle)
- Phase 52: Alert Center (alert lifecycle)
- Phase 50: Auditor (audit findings)
- Phase 51: Integrity Monitor (drift detection)
- Phase 45: Governance (lineage changes)
- Phase 47: Documentation (doc drift)
- Phase 49: Simulation (mismatches)
- Phase 54: Operator Analytics (performance signals)

**Downstream (Consumers)**:
- Live dashboards
- Alert systems
- Capacity planning (Phase 56)
- Automated scaling (Phase 57)
- Performance benchmarking (Phase 58)

---

## Next Steps

- **Phase 56**: Capacity Planning & Resource Forecasting
- **Phase 57**: Automated Scaling & Resource Allocation
- **Phase 58**: Performance Benchmarking & Comparison
- **Phase 59**: Compliance Reporting & Certification

---

**Phase 55 Complete**: Real-time monitoring operational with 8 event categories, 8 metric types, and 7 UI components.
