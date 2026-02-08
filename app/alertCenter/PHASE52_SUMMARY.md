# Phase 52: Unified Alerting & Notification Center — SUMMARY

## 🚨 Overview

Phase 52 implements a **deterministic, read-only alerting and notification center** that aggregates alerts from all engines (Integrity Monitor, Auditor, Health, Governance, Fabric, Documentation, Intelligence Hub, Simulation, Timeline, Analytics, Compliance) into a single operator-facing system. The center classifies, routes, groups, and displays alerts with full evidence, severity, and cross-engine references.

**Critical Constraint**: No generative AI, no invented alerts, no predictions. All alerts originate from real engine outputs.

---

## 🎯 Core Objectives

1. **Cross-Engine Aggregation**: Collect alerts from 12+ engines into unified system
2. **Deterministic Routing**: Normalize alerts from different engines into consistent Alert objects
3. **Intelligent Grouping**: Group by category, severity, entity, or engine with duplicate merging
4. **Policy Enforcement**: Strict tenant isolation, federation rules, and permission validation
5. **Complete Visibility**: Full evidence, references, and cross-engine navigation
6. **Audit Trail**: Log all routing events, queries, policy decisions, and errors
7. **Operator-Friendly UI**: Browse, filter, inspect alerts with 12 cross-engine hooks

---

## 📋 Alert Model

### 12 Alert Categories

1. **integrity-drift**: Phase 51 Integrity Monitor alerts (governance drift, lineage breaks, fabric breaks, etc.)
2. **audit-finding**: Phase 50 Autonomous Auditor findings (compliance violations, policy breaks)
3. **governance-drift**: Phase 44 Governance System alerts (decision changes, approval issues)
4. **governance-lineage-break**: Phase 45 Governance Lineage alerts (chain breaks, reference failures)
5. **fabric-link-break**: Phase 46 Knowledge Fabric alerts (link resolution failures, bidirectional breaks)
6. **documentation-drift**: Phase 47 Documentation Bundler alerts (missing sections, SOP drift)
7. **health-drift**: Phase 43 Health Engine alerts (metric/timeline misalignment, threshold issues - non-biological)
8. **analytics-anomaly**: Phase 39 Pattern Recognition alerts (pattern drift, incident reference failures)
9. **timeline-incident**: Phase 35 Timeline / Phase 38 Incident Tracker alerts (detected incidents)
10. **compliance-issue**: Phase 32 Compliance Engine alerts (missing controls, invalid configurations)
11. **simulation-mismatch**: Phase 49 Simulation Engine alerts (deviation from real-world data)
12. **intelligence-finding**: Phase 48 Intelligence Hub alerts (cross-engine findings)

### 5 Severity Levels

- **critical**: System integrity severely compromised, immediate action required
- **high**: Significant issue, action needed soon
- **medium**: Moderate issue, should be addressed
- **low**: Minor issue, monitor for trends
- **info**: Informational, no immediate action needed

### 12 Alert Sources (Engines)

1. **integrity-monitor** (Phase 51)
2. **auditor** (Phase 50)
3. **health-engine** (Phase 43)
4. **governance-system** (Phase 44)
5. **governance-lineage** (Phase 45)
6. **knowledge-fabric** (Phase 46)
7. **documentation-bundler** (Phase 47)
8. **intelligence-hub** (Phase 48)
9. **simulation-engine** (Phase 49)
10. **timeline-system** (Phase 35/38)
11. **analytics-engine** (Phase 39)
12. **compliance-engine** (Phase 32)

---

## 🔄 Routing Logic

### Alert Ingestion

AlertRouter ingests alerts from all 12 engines via dedicated routing methods:

```typescript
routeFromIntegrityMonitor(monitorAlerts) → Alert[]
routeFromAuditor(auditFindings) → Alert[]
routeFromHealthEngine(healthAlerts) → Alert[]
routeFromGovernance(governanceAlerts) → Alert[]
routeFromGovernanceLineage(lineageAlerts) → Alert[]
routeFromFabric(fabricAlerts) → Alert[]
routeFromDocumentation(docAlerts) → Alert[]
routeFromIntelligenceHub(intelligenceAlerts) → Alert[]
routeFromSimulation(simulationAlerts) → Alert[]
routeFromTimeline(timelineAlerts) → Alert[]
routeFromAnalytics(analyticsAlerts) → Alert[]
routeFromCompliance(complianceAlerts) → Alert[]
```

### Normalization

Each engine's alert format is normalized into a consistent `Alert` object:

```typescript
{
  alertId: string;           // Unique ID (prefixed by source)
  category: AlertCategory;   // Mapped to 12 categories
  severity: AlertSeverity;   // Mapped to 5 severities
  source: AlertSource;       // Engine that produced alert
  title: string;             // Human-readable title
  description: string;       // Detailed description
  scope: AlertScope;         // tenantId, facilityId?, roomId?
  affectedEntities: AlertReference[];  // Entities affected by alert
  relatedReferences: AlertReference[]; // Related entities
  evidence?: AlertEvidence[];          // Drift evidence (baseline vs current)
  detectedAt: string;        // ISO timestamp
  status: 'new' | 'acknowledged' | 'resolved' | 'false-positive' | 'suppressed';
  metadata: {
    sourceAlertId?: string;  // Original alert ID from engine
    ruleId?: string;         // Rule that triggered alert
    tags?: string[];         // Classification tags
  };
}
```

### Tenant Isolation

**ALL** routing methods filter by `tenantId` BEFORE normalization:

```typescript
routeFromIntegrityMonitor(monitorAlerts: any[]): Alert[] {
  return monitorAlerts
    .filter(ma => ma.scope.tenantId === this.tenantId)  // ← Tenant isolation
    .map(ma => this.normalizeIntegrityAlert(ma));
}
```

---

## 🗂️ Aggregation Logic

### Grouping Strategies

AlertAggregator provides 4 grouping strategies:

1. **groupByCategory(alerts)**: Groups by alert category (12 categories)
2. **groupBySeverity(alerts)**: Groups by severity (5 severities)
3. **groupByEntity(alerts)**: Groups by affected entity (workflow, SOP, decision, etc.)
4. **groupByEngine(alerts)**: Groups by source engine (12 engines)

Each group includes:
- **alerts**: All alerts in group
- **summary**: Counts by category, severity, affected entities
- **evidence**: Merged evidence from all alerts
- **references**: Merged references (deduplicated)
- **metadata**: Creation/update timestamps, grouped by user/system

### Duplicate Merging

AlertAggregator merges duplicates based on:
- Title
- Category
- Affected entities

Merging preserves:
- ALL evidence (no data loss)
- ALL references (deduplicated by referenceId)
- ALL tags (deduplicated)

### Deterministic Sorting

Alerts sorted by:
- **severity**: critical → high → medium → low → info
- **detectedAt**: Most recent first (or oldest first)
- **category**: Alphabetical
- **source**: Alphabetical

---

## 🔒 Policy Enforcement

### Authorization Model

AlertPolicyEngine enforces:

1. **Tenant Isolation**: Query scope tenant must match policy context tenant
2. **Federation Rules**: Cross-tenant queries require `alert.federated` permission
3. **Query Permission**: Requires `alert.query` or `facility.alert.query`
4. **Category Permissions**: Each category requires specific permission (e.g., `alert.governance-drift`)
5. **Source Permissions**: Each engine requires specific permission (e.g., `alert.source.integrity-monitor`)
6. **Alert Visibility**: Individual alerts validated before display

### Permission Model

**Global Permissions**:
- `alert.query` — Query alerts
- `alert.view-all` — View all categories and sources (bypass category/source checks)
- `alert.federated` — Query across federated tenants

**Category Permissions** (one per category):
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

**Source Permissions** (one per engine):
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

**Scope Permissions**:
- `facility.alert.query` — Query facility alerts

### Partial Authorization

If user lacks some category/source permissions, query succeeds with **partial results**:
- Authorized categories/sources included
- Denied categories/sources excluded
- Policy decision includes `deniedCategories` and `deniedSources` arrays

---

## 🏗️ Architecture

### Core Components

1. **AlertRouter**: Ingests and normalizes alerts from 12 engines
   - 12 routing methods (one per engine)
   - Tenant filtering before normalization
   - Category/severity mapping
   - Reference normalization

2. **AlertAggregator**: Groups and merges alerts
   - 4 grouping strategies (category/severity/entity/engine)
   - Duplicate merging with evidence preservation
   - Deterministic sorting

3. **AlertPolicyEngine**: Enforces tenant isolation and permissions
   - Tenant validation
   - Federation rules
   - Category/source permission checks
   - Alert-level visibility validation

4. **AlertLog**: Complete audit trail
   - Logs alerts, queries, groups, routing events, policy decisions, errors
   - Query by type, tenant, performer, date range
   - Statistics (totals, trends, distributions)
   - Export with filters

5. **AlertEngine**: Main orchestrator
   - Coordinates routing, aggregation, policy evaluation
   - Executes AlertQuery objects
   - Returns AlertResult with alerts, groups, summary, metadata
   - Public accessors for all sub-engines

### Data Flow

```
1. AlertQuery received
   ↓
2. AlertEngine.executeQuery()
   ↓
3. AlertPolicyEngine.authorizeQuery() — Validate permissions
   ↓
4. AlertRouter.routeAll() — Ingest from 12 engines
   ↓
5. Filter by query parameters (category, severity, source, status, entity, date range)
   ↓
6. AlertAggregator.mergeDuplicates() — Merge duplicates
   ↓
7. AlertAggregator.sortAlerts() — Sort by severity/date/category/source
   ↓
8. Apply max limit (if specified)
   ↓
9. AlertAggregator.groupByX() — Group if requested
   ↓
10. Calculate summary statistics
   ↓
11. AlertLog.logQuery() — Log query
12. AlertLog.logAlert() — Log each alert
13. AlertLog.logGroup() — Log each group
   ↓
14. Return AlertResult
```

---

## 🔗 Integration Points

Phase 52 integrates with **ALL 20 previous phases (32-51)**:

### Alert Sources (12 engines):
1. **Phase 32**: Compliance Engine — compliance-issue alerts
2. **Phase 35/38**: Timeline System / Incident Tracker — timeline-incident alerts
3. **Phase 39**: Pattern Recognition — analytics-anomaly alerts
4. **Phase 43**: Health Engine — health-drift alerts (non-biological)
5. **Phase 44**: Governance System — governance-drift alerts
6. **Phase 45**: Governance Lineage — governance-lineage-break alerts
7. **Phase 46**: Knowledge Fabric — fabric-link-break alerts
8. **Phase 47**: Documentation Bundler — documentation-drift alerts
9. **Phase 48**: Intelligence Hub — intelligence-finding alerts
10. **Phase 49**: Simulation Engine — simulation-mismatch alerts
11. **Phase 50**: Autonomous Auditor — audit-finding alerts
12. **Phase 51**: Integrity Monitor — integrity-drift alerts

### Cross-Engine Hooks (12 navigation targets):
- **Phase 37**: Explanation Engine (Explain This Alert)
- **Phase 38**: Incident Tracker (Open Related Incident)
- **Phase 39**: Pattern Recognition (Open Related Pattern)
- **Phase 40**: Training System (Open Training Module)
- **Phase 44**: Governance System (Open Governance Decision)
- **Phase 45**: Governance Lineage (Open Governance Lineage)
- **Phase 46**: Knowledge Fabric (Open Fabric Links)
- **Phase 47**: Documentation Bundler (Open Documentation Bundle)
- **Phase 48**: Intelligence Hub (Open Intelligence Hub Result)
- **Phase 49**: Simulation Engine (Open Simulation Scenario)
- **Phase 50**: Autonomous Auditor (Open Audit Result)
- **Phase 51**: Integrity Monitor (Open Integrity Monitor Alert)

---

## 📊 Statistics & Reporting

### Alert Statistics

- **Total Alerts**: All-time alert count
- **Total Groups**: All-time group count
- **Total Queries**: All-time query count
- **Alerts Last 24 Hours**: Recent alert count
- **Queries Last 24 Hours**: Recent query count
- **Alerts by Category**: Distribution across 12 categories
- **Alerts by Severity**: Distribution across 5 severities
- **Alerts by Source**: Distribution across 12 engines
- **Alerts by Status**: Distribution (new/acknowledged/resolved/false-positive/suppressed)
- **Most Common Category**: Category with most alerts
- **Most Common Severity**: Severity with most alerts
- **Most Common Source**: Engine with most alerts

### Policy Statistics

- **Total Checks**: All authorization checks
- **Authorized Checks**: Successful authorizations
- **Denied Checks**: Failed authorizations
- **Checks Last 24 Hours**: Recent authorization count

### Export Capabilities

- **JSON Export**: `AlertLog.exportLog()` with filters
- **Filters**: By date range, entry types, performer, tenant, success/failure
- **Use Cases**: Compliance reporting, trend analysis, external SIEM integration

---

## 🚀 Usage Examples

### Example 1: Query All Alerts

```typescript
import { AlertEngine } from '@/app/alertCenter';

const alertEngine = new AlertEngine('tenant-alpha');

const query = {
  queryId: 'query-001',
  description: 'All alerts for tenant',
  scope: { tenantId: 'tenant-alpha' },
  options: {
    sortBy: 'severity',
    sortOrder: 'desc',
    maxAlerts: 100,
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

const result = await alertEngine.executeQuery(query, policyContext, engineAlerts);

console.log(`Total Alerts: ${result.totalAlerts}`);
console.log(`New Alerts: ${result.newAlerts}`);
```

### Example 2: Query Critical Governance Alerts

```typescript
const query = {
  queryId: 'query-002',
  description: 'Critical governance alerts',
  scope: { tenantId: 'tenant-alpha' },
  categories: ['governance-drift', 'governance-lineage-break'],
  severities: ['critical', 'high'],
  options: {
    sortBy: 'severity',
    sortOrder: 'desc',
  },
  triggeredBy: 'user-001',
  triggeredAt: new Date().toISOString(),
};

const result = await alertEngine.executeQuery(query, policyContext, engineAlerts);
```

### Example 3: Query Alerts Affecting Specific Entity

```typescript
const query = {
  queryId: 'query-003',
  description: 'Alerts affecting Workflow WF-12',
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

### Example 4: Group Alerts by Category

```typescript
const query = {
  queryId: 'query-004',
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

console.log(`Groups: ${result.groups?.length}`);
result.groups?.forEach(group => {
  console.log(`${group.groupKey}: ${group.summary.totalAlerts} alerts`);
});
```

### Example 5: Export Alert Log

```typescript
const log = alertEngine.getAlertLog();

const exported = log.exportLog({
  startDate: '2026-01-01T00:00:00Z',
  endDate: '2026-01-20T23:59:59Z',
  entryTypes: ['alert', 'query'],
  successOnly: true,
});

fs.writeFileSync('alert-export.json', JSON.stringify(exported, null, 2));
```

---

## 🔧 Maintenance

### Log Retention

```typescript
const log = alertEngine.getAlertLog();

// Clear entries older than 90 days
const cleared = log.clearOldEntries(90);
console.log(`Cleared ${cleared} old entries`);
```

### Statistics Query

```typescript
const stats = alertEngine.getStatistics();

console.log(`Total Alerts: ${stats.totalAlerts}`);
console.log(`Alerts Last 24h: ${stats.alertsLast24Hours}`);
console.log(`Most Common Category: ${stats.mostCommonCategory}`);
console.log(`Most Common Severity: ${stats.mostCommonSeverity}`);
```

---

## 📈 Future Enhancements

1. **Real-Time Alerts**: WebSocket-based live alert feed
2. **Alert Workflows**: Acknowledge, assign, resolve, escalate
3. **Alert Routing**: Route to users/teams by category/severity
4. **Email/SMS Notifications**: External notification channels
5. **Alert Thresholds**: Suppress low-priority alerts when volume high
6. **Trend Analysis**: Historical alert trend visualization
7. **Alert Correlation**: Detect related alerts across engines
8. **Auto-Remediation**: Trigger automated fixes for common alerts

---

## ✅ Completion Checklist

- [x] AlertTypes: Complete type system (12 categories, 12 sources, 5 severities)
- [x] AlertRouter: 12 engine routing methods with normalization
- [x] AlertAggregator: 4 grouping strategies with duplicate merging
- [x] AlertPolicyEngine: Complete policy enforcement with tenant isolation
- [x] AlertLog: Full audit trail with statistics and export
- [x] AlertEngine: Main orchestrator with query execution
- [x] Index: Public API exports
- [x] UI Dashboard: 8 components (Query, List, Group, GroupDetail, Detail, Reference, History, Statistics) with 12 cross-engine hooks
- [x] Documentation: Summary and quick reference

**Phase 52 Status**: ✅ COMPLETE

---

**Deterministic. Read-only. No generative AI. All alerts from real engine outputs.**
