# Phase 52: Unified Alerting & Notification Center — QUICK REFERENCE

**Cross-engine alert aggregation with deterministic routing. No generative AI. All alerts from real engines.**

---

## 🚀 Quick Start

### 1. Initialize Alert Engine

```typescript
import { AlertEngine } from '@/app/alertCenter';

const alertEngine = new AlertEngine('tenant-alpha');
```

### 2. Query Alerts

```typescript
const query = {
  queryId: 'query-001',
  description: 'All critical alerts',
  scope: { tenantId: 'tenant-alpha' },
  severities: ['critical', 'high'],
  options: {
    sortBy: 'severity',
    sortOrder: 'desc',
    maxAlerts: 50,
  },
  triggeredBy: 'user-001',
  triggeredAt: new Date().toISOString(),
};

const policyContext = {
  tenantId: 'tenant-alpha',
  performedBy: 'user-001',
  userRoles: ['operator'],
  userPermissions: ['alert.query', 'alert.view-all'],
};

const engineAlerts = {
  integrityMonitor: [...],  // From Phase 51
  auditor: [...],           // From Phase 50
  compliance: [...],        // From Phase 32
  // ... other engines
};

const result = await alertEngine.executeQuery(query, policyContext, engineAlerts);

console.log(`Total: ${result.totalAlerts}, New: ${result.newAlerts}`);
```

---

## 📋 Alert Categories (12)

| Category | Description | Source Engine |
|----------|-------------|---------------|
| `integrity-drift` | Integrity Monitor alerts | Phase 51 |
| `audit-finding` | Auditor findings | Phase 50 |
| `governance-drift` | Governance changes | Phase 44 |
| `governance-lineage-break` | Lineage chain breaks | Phase 45 |
| `fabric-link-break` | Fabric link failures | Phase 46 |
| `documentation-drift` | Documentation issues | Phase 47 |
| `health-drift` | Health metric drift (non-biological) | Phase 43 |
| `analytics-anomaly` | Pattern drift | Phase 39 |
| `timeline-incident` | Timeline incidents | Phase 35/38 |
| `compliance-issue` | Compliance violations | Phase 32 |
| `simulation-mismatch` | Simulation deviations | Phase 49 |
| `intelligence-finding` | Intelligence Hub findings | Phase 48 |

---

## ⚠️ Severity Levels (5)

- **critical**: Immediate action required
- **high**: Action needed soon
- **medium**: Should be addressed
- **low**: Monitor for trends
- **info**: Informational

---

## 🔍 Common Query Patterns

### Pattern 1: All Alerts for Tenant

```typescript
const query = {
  queryId: 'query-all',
  description: 'All alerts',
  scope: { tenantId: 'tenant-alpha' },
  options: {
    sortBy: 'severity',
    sortOrder: 'desc',
  },
  triggeredBy: 'user-001',
  triggeredAt: new Date().toISOString(),
};

const result = await alertEngine.executeQuery(query, policyContext, engineAlerts);
```

### Pattern 2: Critical Governance Alerts

```typescript
const query = {
  queryId: 'query-gov',
  description: 'Critical governance alerts',
  scope: { tenantId: 'tenant-alpha' },
  categories: ['governance-drift', 'governance-lineage-break'],
  severities: ['critical', 'high'],
  options: {
    sortBy: 'detectedAt',
    sortOrder: 'desc',
  },
  triggeredBy: 'user-001',
  triggeredAt: new Date().toISOString(),
};

const result = await alertEngine.executeQuery(query, policyContext, engineAlerts);
```

### Pattern 3: Alerts Affecting Specific Entity

```typescript
const query = {
  queryId: 'query-entity',
  description: 'Alerts for Workflow WF-12',
  scope: { tenantId: 'tenant-alpha' },
  entityId: 'WF-12',
  entityType: 'workflow',
  options: {
    sortBy: 'detectedAt',
    sortOrder: 'desc',
  },
  triggeredBy: 'user-001',
  triggeredAt: new Date().toISOString(),
};

const result = await alertEngine.executeQuery(query, policyContext, engineAlerts);
```

### Pattern 4: Group Alerts by Category

```typescript
const query = {
  queryId: 'query-grouped',
  description: 'Grouped alerts',
  scope: { tenantId: 'tenant-alpha' },
  options: {
    groupBy: 'category',
    sortBy: 'severity',
    sortOrder: 'desc',
  },
  triggeredBy: 'user-001',
  triggeredAt: new Date().toISOString(),
};

const result = await alertEngine.executeQuery(query, policyContext, engineAlerts);

result.groups?.forEach(group => {
  console.log(`${group.groupKey}: ${group.summary.totalAlerts} alerts`);
});
```

### Pattern 5: Alerts from Specific Engine

```typescript
const query = {
  queryId: 'query-source',
  description: 'Integrity Monitor alerts',
  scope: { tenantId: 'tenant-alpha' },
  sources: ['integrity-monitor'],
  options: {
    sortBy: 'severity',
    sortOrder: 'desc',
  },
  triggeredBy: 'user-001',
  triggeredAt: new Date().toISOString(),
};

const result = await alertEngine.executeQuery(query, policyContext, engineAlerts);
```

### Pattern 6: Alerts in Date Range

```typescript
const query = {
  queryId: 'query-range',
  description: 'Alerts last 7 days',
  scope: { tenantId: 'tenant-alpha' },
  dateRange: {
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    end: new Date().toISOString(),
  },
  options: {
    sortBy: 'detectedAt',
    sortOrder: 'desc',
  },
  triggeredBy: 'user-001',
  triggeredAt: new Date().toISOString(),
};

const result = await alertEngine.executeQuery(query, policyContext, engineAlerts);
```

### Pattern 7: Query Alert Log

```typescript
const log = alertEngine.getAlertLog();

// Get all alerts
const allAlerts = log.getAllAlerts();

// Get alerts by category
const govAlerts = log.getAlertsByCategory('governance-drift');

// Get alerts by severity
const criticalAlerts = log.getAlertsBySeverity('critical');

// Get alerts by source
const integrityAlerts = log.getAlertsBySource('integrity-monitor');

// Get recent entries
const recentEntries = log.getRecentEntries(50);
```

### Pattern 8: View Statistics

```typescript
const stats = alertEngine.getStatistics();

console.log(`Total Alerts: ${stats.totalAlerts}`);
console.log(`Alerts Last 24h: ${stats.alertsLast24Hours}`);
console.log(`Total Groups: ${stats.totalGroups}`);
console.log(`Total Queries: ${stats.totalQueries}`);
console.log(`Most Common Category: ${stats.mostCommonCategory}`);
console.log(`Most Common Severity: ${stats.mostCommonSeverity}`);
console.log(`Most Common Source: ${stats.mostCommonSource}`);

// Breakdown
console.log('By Category:', stats.alertsByCategory);
console.log('By Severity:', stats.alertsBySeverity);
console.log('By Source:', stats.alertsBySource);
```

### Pattern 9: Export Alert Log

```typescript
const log = alertEngine.getAlertLog();

// Export all entries
const exportAll = log.exportLog();

// Export with filters
const exportFiltered = log.exportLog({
  startDate: '2026-01-01T00:00:00Z',
  endDate: '2026-01-20T23:59:59Z',
  entryTypes: ['alert', 'query'],
  performer: 'user-001',
  tenantId: 'tenant-alpha',
  successOnly: true,
});

console.log(`Exported ${exportFiltered.entries.length} entries`);

// Save to file
fs.writeFileSync('alert-export.json', JSON.stringify(exportFiltered, null, 2));
```

### Pattern 10: Group by Different Keys

```typescript
// Group by severity
const query1 = {
  queryId: 'query-sev',
  description: 'Group by severity',
  scope: { tenantId: 'tenant-alpha' },
  options: { groupBy: 'severity' },
  triggeredBy: 'user-001',
  triggeredAt: new Date().toISOString(),
};

// Group by entity
const query2 = {
  queryId: 'query-ent',
  description: 'Group by entity',
  scope: { tenantId: 'tenant-alpha' },
  options: { groupBy: 'entity' },
  triggeredBy: 'user-001',
  triggeredAt: new Date().toISOString(),
};

// Group by engine
const query3 = {
  queryId: 'query-eng',
  description: 'Group by engine',
  scope: { tenantId: 'tenant-alpha' },
  options: { groupBy: 'engine' },
  triggeredBy: 'user-001',
  triggeredAt: new Date().toISOString(),
};
```

---

## 📊 API Reference

### AlertEngine

```typescript
class AlertEngine {
  constructor(tenantId: string)
  
  // Main method
  async executeQuery(
    query: AlertQuery,
    policyContext: AlertPolicyContext,
    engineAlerts?: { ... }
  ): Promise<AlertResult>
  
  // Accessors
  getRouter(): AlertRouter
  getAggregator(): AlertAggregator
  getPolicyEngine(): AlertPolicyEngine
  getAlertLog(): AlertLog
  getStatistics(): AlertStatistics
  getPolicyStatistics(): AlertPolicyStatistics
}
```

### AlertRouter

```typescript
class AlertRouter {
  constructor(tenantId: string)
  
  // Engine-specific routing
  routeFromIntegrityMonitor(monitorAlerts: any[]): Alert[]
  routeFromAuditor(auditFindings: any[]): Alert[]
  routeFromHealthEngine(healthAlerts: any[]): Alert[]
  routeFromGovernance(governanceAlerts: any[]): Alert[]
  routeFromGovernanceLineage(lineageAlerts: any[]): Alert[]
  routeFromFabric(fabricAlerts: any[]): Alert[]
  routeFromDocumentation(docAlerts: any[]): Alert[]
  routeFromIntelligenceHub(intelligenceAlerts: any[]): Alert[]
  routeFromSimulation(simulationAlerts: any[]): Alert[]
  routeFromTimeline(timelineAlerts: any[]): Alert[]
  routeFromAnalytics(analyticsAlerts: any[]): Alert[]
  routeFromCompliance(complianceAlerts: any[]): Alert[]
  
  // Batch routing
  routeAll(engineAlerts: { ... }): Alert[]
}
```

### AlertAggregator

```typescript
class AlertAggregator {
  groupByCategory(alerts: Alert[]): AlertGroup[]
  groupBySeverity(alerts: Alert[]): AlertGroup[]
  groupByEntity(alerts: Alert[]): AlertGroup[]
  groupByEngine(alerts: Alert[]): AlertGroup[]
  
  mergeDuplicates(alerts: Alert[]): Alert[]
  
  sortAlerts(
    alerts: Alert[],
    sortBy: 'severity' | 'detectedAt' | 'category' | 'source',
    sortOrder: 'asc' | 'desc'
  ): Alert[]
}
```

### AlertPolicyEngine

```typescript
class AlertPolicyEngine {
  authorizeQuery(
    query: AlertQuery,
    policyContext: AlertPolicyContext
  ): AlertPolicyDecision
  
  authorizeAlert(
    alert: Alert,
    policyContext: AlertPolicyContext
  ): AlertPolicyDecision
  
  getPolicyLog(): AlertLogEntry[]
  getPolicyStatistics(): AlertPolicyStatistics
}
```

### AlertLog

```typescript
class AlertLog {
  // Logging
  logAlert(alert: Alert, performer: string): void
  logQuery(query: any, resultId: string, totalAlerts: number, performer: string, success: boolean): void
  logGroup(group: AlertGroup, performer: string): void
  logRouting(sourceEngine: AlertSource, alertsRouted: number, alertsFiltered: number, tenantId: string, performer: string): void
  logError(operation: string, error: Error, tenantId: string, performer: string): void
  
  // Query
  getAllEntries(): AlertLogEntry[]
  getEntriesByType(entryType: string): AlertLogEntry[]
  getEntriesInRange(startDate: string, endDate: string): AlertLogEntry[]
  getEntriesByPerformer(performer: string): AlertLogEntry[]
  getEntriesByTenant(tenantId: string): AlertLogEntry[]
  getRecentEntries(count: number): AlertLogEntry[]
  
  getAllAlerts(): Alert[]
  getAlertsByCategory(category: AlertCategory): Alert[]
  getAlertsBySeverity(severity: AlertSeverity): Alert[]
  getAlertsBySource(source: AlertSource): Alert[]
  getAlertsByStatus(status: string): Alert[]
  
  // Statistics
  getStatistics(): AlertStatistics
  
  // Export
  exportLog(filters?: { ... }): { entries: AlertLogEntry[]; metadata: any }
  
  // Maintenance
  clearOldEntries(daysToKeep: number): number
  clearAll(): void
}
```

---

## 🔒 Required Permissions

### Global Permissions

- `alert.query` — Query alerts
- `alert.view-all` — View all categories and sources (bypass category/source checks)
- `alert.federated` — Query across federated tenants

### Category Permissions (one per category)

- `alert.integrity-drift`
- `alert.audit-finding`
- `alert.governance-drift`
- `alert.governance-lineage-break`
- `alert.fabric-link-break`
- `alert.documentation-drift`
- `alert.health-drift`
- `alert.analytics-anomaly`
- `alert.timeline-incident`
- `alert.compliance-issue`
- `alert.simulation-mismatch`
- `alert.intelligence-finding`

### Source Permissions (one per engine)

- `alert.source.integrity-monitor`
- `alert.source.auditor`
- `alert.source.health-engine`
- `alert.source.governance-system`
- `alert.source.governance-lineage`
- `alert.source.knowledge-fabric`
- `alert.source.documentation-bundler`
- `alert.source.intelligence-hub`
- `alert.source.simulation-engine`
- `alert.source.timeline-system`
- `alert.source.analytics-engine`
- `alert.source.compliance-engine`

### Scope Permissions

- `facility.alert.query` — Query facility alerts

---

## 🛠️ Troubleshooting

### Issue: "Permission denied"

**Solution**: Ensure `policyContext.userPermissions` includes:
1. `alert.query`
2. Category permissions for each queried category
3. Source permissions for each engine
4. Scope permissions (`facility.alert.query`) if applicable

Alternatively, use `alert.view-all` to bypass category/source checks.

### Issue: "Tenant isolation violation"

**Solution**: Ensure `query.scope.tenantId` matches `policyContext.tenantId`.

### Issue: "No alerts returned"

**Possible causes**:
1. No alerts from engines (check `engineAlerts` object)
2. Filters too restrictive (category/severity/source/date range)
3. All alerts suppressed (check `includeSuppressed` option)
4. Policy denying some categories/sources

### Issue: "Partial results"

**Expected behavior**: If user lacks some category/source permissions, query returns partial results. Check `policyDecision.deniedCategories` and `policyDecision.deniedSources`.

### Issue: "Groups not created"

**Solution**: Ensure `query.options.groupBy` is set to 'category', 'severity', 'entity', or 'engine'.

### Issue: "Duplicate alerts"

**Solution**: Use `mergeDuplicates: true` in options, or ensure `AlertAggregator.mergeDuplicates()` is called (done automatically by AlertEngine).

---

## 📈 Best Practices

1. **Use Filters**: Start with category/severity filters to reduce noise
2. **Group Related Alerts**: Use grouping for high alert volumes
3. **Monitor Trends**: Check statistics regularly to identify patterns
4. **Export for Compliance**: Archive alert logs for regulatory requirements
5. **Leverage Cross-Engine Hooks**: Navigate to related systems for context
6. **Set Appropriate Permissions**: Grant minimal permissions needed
7. **Handle Partial Results**: Check for denied categories/sources in policy decisions
8. **Query Date Ranges**: Use date filters for historical analysis
9. **Clear Old Logs**: Retain 90 days, archive older entries
10. **Test Policy Context**: Validate permissions before production

---

## 🔗 Cross-Engine Integration

Alert center provides 12 navigation hooks:

1. **Phase 37**: Explain This Alert (explanation engine)
2. **Phase 38**: Open Related Incident (incident tracker)
3. **Phase 39**: Open Related Pattern (pattern recognition)
4. **Phase 40**: Open Training Module (training system)
5. **Phase 44**: Open Governance Decision (governance system)
6. **Phase 45**: Open Governance Lineage (lineage system)
7. **Phase 46**: Open Fabric Links (knowledge fabric)
8. **Phase 47**: Open Documentation Bundle (documentation bundler)
9. **Phase 48**: Open Intelligence Hub Result (intelligence hub)
10. **Phase 49**: Open Simulation Scenario (simulation engine)
11. **Phase 50**: Open Audit Result (autonomous auditor)
12. **Phase 51**: Open Integrity Monitor Alert (integrity monitor)

---

## ✅ Quick Checklist

- [ ] Initialize AlertEngine with tenant ID
- [ ] Create AlertQuery with scope and filters
- [ ] Build AlertPolicyContext with permissions
- [ ] Provide engineAlerts from all sources
- [ ] Execute query
- [ ] Review AlertResult for alerts and groups
- [ ] Inspect individual alerts and evidence
- [ ] Query statistics for trends
- [ ] Export logs for compliance
- [ ] Use cross-engine hooks for navigation

---

**Phase 52: Unified Alerting & Notification Center**

*Cross-engine alert aggregation. Deterministic routing. No generative AI. All alerts from real engines.*

🚨 Aggregate. Route. Group. Display.
