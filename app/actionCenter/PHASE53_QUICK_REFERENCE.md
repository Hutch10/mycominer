# Phase 53: Operator Action Center — Quick Reference

## Quick Start

```typescript
import { ActionEngine, ActionQuery, ActionPolicyContext, EngineInputs } from '@/app/actionCenter';

// 1. Initialize engine
const actionEngine = new ActionEngine('tenant-alpha');

// 2. Define query
const query: ActionQuery = {
  queryId: 'query-001',
  description: 'All action tasks',
  scope: { tenantId: 'tenant-alpha' },
  triggeredBy: 'user-001',
  triggeredAt: new Date().toISOString(),
};

// 3. Define context
const context: ActionPolicyContext = {
  tenantId: 'tenant-alpha',
  performedBy: 'user-001',
  userRoles: ['operator'],
  userPermissions: ['action.query', 'action.view-all'],
};

// 4. Provide engine inputs
const inputs: EngineInputs = {
  alerts: [...],          // From Alert Center (Phase 52)
  auditFindings: [...],   // From Auditor (Phase 50)
  integrityDrift: [...],  // From Integrity Monitor (Phase 51)
};

// 5. Execute query
const result = await actionEngine.executeQuery(query, context, inputs);

// 6. Use results
console.log(`Total tasks: ${result.totalTasks}`);
console.log(`New tasks: ${result.newTasks}`);
```

---

## Task Categories

| Category | Description | Priority |
|----------|-------------|----------|
| `alert-remediation` | Tasks from Alert Center | Medium |
| `audit-remediation` | Audit findings to remediate | High |
| `integrity-drift-remediation` | Integrity drift to fix | High |
| `governance-lineage-issue` | Governance drift/lineage breaks | High |
| `documentation-completeness` | Missing/outdated docs | Low |
| `fabric-link-breakage` | Broken fabric links | Low |
| `compliance-pack-issue` | Compliance violations | High |
| `simulation-mismatch` | Simulation forecast drift | Medium |

---

## Task Severity

- **critical**: Immediate action (production, regulatory)
- **high**: Urgent (governance, audit)
- **medium**: Important (alerts, simulation)
- **low**: Minor (docs, links)
- **info**: Informational

---

## Task Status Lifecycle

```
new → acknowledged → assigned → in-progress → resolved
                                          ↓
                                     dismissed
```

---

## Common Query Patterns

### 1. Query All Tasks

```typescript
const query: ActionQuery = {
  queryId: 'query-001',
  description: 'All action tasks',
  scope: { tenantId: 'tenant-alpha' },
  triggeredBy: 'user-001',
  triggeredAt: new Date().toISOString(),
};

const result = await actionEngine.executeQuery(query, context, inputs);
```

### 2. Query Critical Tasks

```typescript
const query: ActionQuery = {
  queryId: 'query-002',
  description: 'Critical tasks only',
  scope: { tenantId: 'tenant-alpha' },
  severities: ['critical', 'high'],
  statuses: ['new', 'assigned'],
  triggeredBy: 'user-001',
  triggeredAt: new Date().toISOString(),
};
```

### 3. Query Audit Tasks

```typescript
const query: ActionQuery = {
  queryId: 'query-003',
  description: 'Audit remediation tasks',
  scope: { tenantId: 'tenant-alpha' },
  categories: ['audit-remediation'],
  triggeredBy: 'user-001',
  triggeredAt: new Date().toISOString(),
};
```

### 4. Query Tasks for Entity

```typescript
const query: ActionQuery = {
  queryId: 'query-004',
  description: 'Tasks affecting workflow WF-12',
  scope: { tenantId: 'tenant-alpha' },
  entityId: 'WF-12',
  entityType: 'workflow',
  triggeredBy: 'user-001',
  triggeredAt: new Date().toISOString(),
};
```

### 5. Query Tasks Assigned to Me

```typescript
const query: ActionQuery = {
  queryId: 'query-005',
  description: 'My assigned tasks',
  scope: { tenantId: 'tenant-alpha' },
  assignedTo: 'user-001',
  statuses: ['assigned', 'in-progress'],
  triggeredBy: 'user-001',
  triggeredAt: new Date().toISOString(),
};
```

### 6. Query with Grouping

```typescript
const query: ActionQuery = {
  queryId: 'query-006',
  description: 'Tasks grouped by category',
  scope: { tenantId: 'tenant-alpha' },
  options: {
    groupBy: 'category',
    sortBy: 'severity',
    sortOrder: 'desc',
  },
  triggeredBy: 'user-001',
  triggeredAt: new Date().toISOString(),
};

const result = await actionEngine.executeQuery(query, context, inputs);

for (const group of result.groups || []) {
  console.log(`${group.groupKey}: ${group.summary.totalTasks} tasks`);
}
```

### 7. Query Date Range

```typescript
const query: ActionQuery = {
  queryId: 'query-007',
  description: 'Tasks created last week',
  scope: { tenantId: 'tenant-alpha' },
  dateRange: {
    startDate: '2026-01-14',
    endDate: '2026-01-21',
  },
  triggeredBy: 'user-001',
  triggeredAt: new Date().toISOString(),
};
```

### 8. Query by Facility

```typescript
const query: ActionQuery = {
  queryId: 'query-008',
  description: 'Tasks for Facility 01',
  scope: { 
    tenantId: 'tenant-alpha',
    facilityId: 'facility-01',
  },
  triggeredBy: 'user-001',
  triggeredAt: new Date().toISOString(),
};
```

### 9. Query Resolved Tasks

```typescript
const query: ActionQuery = {
  queryId: 'query-009',
  description: 'Resolved tasks',
  scope: { tenantId: 'tenant-alpha' },
  statuses: ['resolved'],
  options: {
    includeResolved: true,
  },
  triggeredBy: 'user-001',
  triggeredAt: new Date().toISOString(),
};
```

### 10. Query with Max Limit

```typescript
const query: ActionQuery = {
  queryId: 'query-010',
  description: 'Top 50 tasks',
  scope: { tenantId: 'tenant-alpha' },
  options: {
    maxTasks: 50,
    sortBy: 'severity',
    sortOrder: 'desc',
  },
  triggeredBy: 'user-001',
  triggeredAt: new Date().toISOString(),
};
```

---

## Lifecycle Operations

### Acknowledge Task

```typescript
const { success, task, error } = await actionEngine.acknowledgeTask(
  'task-alert-001',
  context
);

if (success) {
  console.log(`Acknowledged: ${task?.acknowledgedAt}`);
} else {
  console.error(`Failed: ${error}`);
}
```

### Assign Task

```typescript
const { success, task, error } = await actionEngine.assignTask(
  'task-audit-001',
  'operator-jane', // Assignee
  context
);

if (success) {
  console.log(`Assigned to: ${task?.assignedTo}`);
}
```

### Resolve Task

```typescript
const { success, task, error } = await actionEngine.resolveTask(
  'task-integrity-001',
  context
);

if (success) {
  console.log(`Resolved at: ${task?.resolvedAt}`);
}
```

### Dismiss Task

```typescript
const { success, task, error } = await actionEngine.dismissTask(
  'task-doc-001',
  'Not applicable for current phase', // Reason
  context
);

if (success) {
  console.log(`Dismissed: ${task?.dismissalReason}`);
}
```

---

## API Reference

### ActionEngine

#### Constructor
```typescript
constructor(tenantId: string)
```

#### Methods

**`executeQuery(query, context, inputs): Promise<ActionResult>`**
- Execute task query
- Returns: ActionResult with tasks, groups, summary

**`acknowledgeTask(taskId, context): Promise<{success, task?, error?}>`**
- Acknowledge task (new → acknowledged)
- Returns: Success status and updated task

**`assignTask(taskId, assignedTo, context): Promise<{success, task?, error?}>`**
- Assign task to operator (acknowledged → assigned)
- Returns: Success status and updated task

**`resolveTask(taskId, context): Promise<{success, task?, error?}>`**
- Resolve task (any status → resolved)
- Returns: Success status and updated task

**`dismissTask(taskId, reason, context): Promise<{success, task?, error?}>`**
- Dismiss task with reason (any status → dismissed)
- Returns: Success status and updated task

**`getRouter(): ActionRouter`**
- Get router instance for custom routing

**`getTaskBuilder(): ActionTaskBuilder`**
- Get task builder for custom grouping/sorting

**`getPolicyEngine(): ActionPolicyEngine`**
- Get policy engine for custom authorization

**`getActionLog(): ActionLog`**
- Get action log for queries

**`getStatistics(): ActionStatistics`**
- Get task statistics

**`getPolicyStatistics()`**
- Get policy decision statistics

---

### ActionRouter

**`routeFromAlertCenter(alerts): ActionTask[]`**
- Route tasks from Alert Center (Phase 52)

**`routeFromAuditor(findings): ActionTask[]`**
- Route tasks from Auditor (Phase 50)

**`routeFromIntegrityMonitor(drifts): ActionTask[]`**
- Route tasks from Integrity Monitor (Phase 51)

**`routeFromGovernance(issues): ActionTask[]`**
- Route tasks from Governance (Phases 44-45)

**`routeFromDocumentation(issues): ActionTask[]`**
- Route tasks from Documentation Engine (Phase 47)

**`routeFromFabric(issues): ActionTask[]`**
- Route tasks from Knowledge Fabric (Phase 46)

**`routeFromCompliance(issues): ActionTask[]`**
- Route tasks from Compliance Engine (Phase 32)

**`routeFromSimulation(mismatches): ActionTask[]`**
- Route tasks from Simulation Engine (Phase 49)

**`routeAll(inputs): ActionTask[]`**
- Batch route from all engines

---

### ActionTaskBuilder

**`groupByCategory(tasks): ActionGroup[]`**
- Group tasks by category

**`groupBySeverity(tasks): ActionGroup[]`**
- Group tasks by severity

**`groupByEntity(tasks): ActionGroup[]`**
- Group tasks by affected entity

**`groupBySource(tasks): ActionGroup[]`**
- Group tasks by source engine

**`groupByStatus(tasks): ActionGroup[]`**
- Group tasks by status

**`mergeDuplicates(tasks): ActionTask[]`**
- Merge duplicate tasks, preserve all references

**`sortTasks(tasks): ActionTask[]`**
- Sort by severity (critical first), then by date (newest first)

**`sortByPriority(tasks): ActionTask[]`**
- Sort by priority score (severity + age + category)

**`calculatePriority(task): number`**
- Calculate priority score for task

**`filterByAssignee(tasks, assignedTo): ActionTask[]`**
- Filter tasks by assignee

**`filterByFacility(tasks, facilityId): ActionTask[]`**
- Filter tasks by facility

**`filterByRoom(tasks, roomId): ActionTask[]`**
- Filter tasks by room

**`filterByDateRange(tasks, startDate, endDate): ActionTask[]`**
- Filter tasks by date range

**`filterByPermissions(tasks, userPermissions): ActionTask[]`**
- Filter tasks requiring specific permissions

---

### ActionPolicyEngine

**`authorizeQuery(query, context): ActionPolicyDecision`**
- Authorize query, returns decision with denied categories/sources

**`authorizeTask(task, context): ActionPolicyDecision`**
- Authorize individual task visibility

**`authorizeLifecycleChange(task, operation, context): ActionPolicyDecision`**
- Authorize lifecycle operation (acknowledge/assign/resolve/dismiss)

**`getPolicyLog(): PolicyDecisionLogEntry[]`**
- Get policy decision log

**`getPolicyStatistics()`**
- Get policy statistics

**`clearPolicyLog(): void`**
- Clear policy log (maintenance)

---

### ActionLog

**`logTask(task, performedBy, success?, error?): void`**
- Log task

**`logQuery(query, resultCount, success?, error?): void`**
- Log query

**`logGroup(group, tenantId, performedBy, facilityId?, success?, error?): void`**
- Log group

**`logRouting(sourceEngine, tasksRouted, tasksFiltered, tenantId, performedBy, facilityId?, success?, error?): void`**
- Log routing event

**`logLifecycleChange(taskId, oldStatus, newStatus, tenantId, performedBy, facilityId?, reason?, success?, error?): void`**
- Log lifecycle change

**`logError(errorType, errorMessage, tenantId, performedBy, facilityId?, stackTrace?): void`**
- Log error

**`getAllEntries(): ActionLogEntry[]`**
- Get all log entries

**`getEntriesByType(type): ActionLogEntry[]`**
- Get entries by type

**`getEntriesInRange(startDate, endDate): ActionLogEntry[]`**
- Get entries in date range

**`getEntriesByPerformer(performedBy): ActionLogEntry[]`**
- Get entries by performer

**`getEntriesByTenant(tenantId): ActionLogEntry[]`**
- Get entries by tenant

**`getRecentEntries(count?): ActionLogEntry[]`**
- Get recent entries (default: 100)

**`getAllTasks(): ActionTask[]`**
- Get all tasks from log

**`getTasksByCategory(category): ActionTask[]`**
- Get tasks by category

**`getTasksBySeverity(severity): ActionTask[]`**
- Get tasks by severity

**`getTasksBySource(source): ActionTask[]`**
- Get tasks by source

**`getTasksByStatus(status): ActionTask[]`**
- Get tasks by status

**`getStatistics(): ActionStatistics`**
- Get comprehensive statistics

**`exportLog(options?): {entries, exportedAt, filters}`**
- Export log with filters

**`clearOldEntries(daysToKeep?): number`**
- Clear entries older than N days (default: 90)

**`clearAll(): void`**
- Clear all entries

**`getLogSize(): number`**
- Get log entry count

---

## Required Permissions

### Global Permissions

- **`action.query`** — Required to execute queries
- **`action.view-all`** — View all categories and sources
- **`action.federated`** — Query across tenants (with federation enabled)

### Category Permissions

- **`action.alert-remediation`** — View alert remediation tasks
- **`action.audit-remediation`** — View audit remediation tasks
- **`action.integrity-drift-remediation`** — View integrity drift tasks
- **`action.governance-lineage-issue`** — View governance issue tasks
- **`action.documentation-completeness`** — View documentation tasks
- **`action.fabric-link-breakage`** — View fabric link tasks
- **`action.compliance-pack-issue`** — View compliance tasks
- **`action.simulation-mismatch`** — View simulation tasks

### Source Permissions

- **`action.source.alert-center`** — View tasks from Alert Center
- **`action.source.auditor`** — View tasks from Auditor
- **`action.source.integrity-monitor`** — View tasks from Integrity Monitor
- **`action.source.governance-system`** — View tasks from Governance System
- **`action.source.governance-lineage`** — View tasks from Governance Lineage
- **`action.source.documentation-bundler`** — View tasks from Documentation Engine
- **`action.source.knowledge-fabric`** — View tasks from Knowledge Fabric
- **`action.source.compliance-engine`** — View tasks from Compliance Engine
- **`action.source.simulation-engine`** — View tasks from Simulation Engine

### Lifecycle Permissions

- **`action.acknowledge`** — Acknowledge tasks
- **`action.assign`** — Assign tasks to self
- **`action.assign-others`** — Assign tasks to others
- **`action.resolve`** — Resolve tasks
- **`action.dismiss`** — Dismiss tasks

### Scope Permissions

- **`facility.action.query`** — Query tasks from other facilities

---

## Troubleshooting

### Issue: Query returns no tasks

**Possible causes**:
1. No engine inputs provided
2. All tasks filtered out by query parameters
3. Denied categories/sources in policy decision

**Solutions**:
- Check `inputs` object has data from engines
- Check query filters (categories, severities, statuses)
- Check `result.metadata.decision` for denied categories/sources
- Verify user has required permissions

---

### Issue: Task lifecycle operation fails

**Possible causes**:
1. Missing lifecycle permission
2. Task not found
3. Invalid status transition

**Solutions**:
- Verify context has required permission (`action.acknowledge`, `action.resolve`, etc.)
- Verify task exists in log: `actionEngine.getActionLog().getAllTasks()`
- Check current task status (can't resolve already-resolved task)

---

### Issue: Policy decision denies access

**Possible causes**:
1. Query tenant doesn't match context tenant
2. Federation not enabled
3. Missing category/source permissions

**Solutions**:
- Ensure `query.scope.tenantId === context.tenantId`
- Enable federation: `context.federationEnabled = true`
- Add required permissions to `context.userPermissions`

---

### Issue: Grouping returns empty groups

**Possible causes**:
1. No tasks match grouping criteria
2. Wrong groupBy value

**Solutions**:
- Verify tasks exist before grouping
- Check `groupBy` value: 'category', 'severity', 'entity', 'source', 'status'

---

### Issue: Statistics show zero tasks

**Possible causes**:
1. No tasks logged yet
2. Log cleared

**Solutions**:
- Execute queries first to log tasks
- Check log size: `actionEngine.getActionLog().getLogSize()`

---

## Best Practices

1. **Always provide context**: Include all required permissions in `ActionPolicyContext`
2. **Filter at query time**: Use query filters instead of post-processing
3. **Group for organization**: Use grouping for category/severity/entity-based workflows
4. **Log regularly**: Tasks are logged automatically during queries
5. **Export periodically**: Export logs for compliance and reporting
6. **Clear old entries**: Use `clearOldEntries(90)` to manage log size
7. **Check policy decisions**: Always inspect `result.metadata.decision` for denials
8. **Use lifecycle methods**: Use `acknowledgeTask()`, `assignTask()`, `resolveTask()` instead of manual status changes
9. **Provide remediation context**: Include `relatedDocumentation` and `relatedSOP` in task metadata
10. **Navigate cross-engine**: Use 9 navigation hooks for seamless operator workflow

---

## Cross-Engine Integration

Phase 53 integrates with:

1. **Phase 32** — Compliance Engine (compliance-pack-issue tasks)
2. **Phase 37** — Explanatory Content ("Explain This Task" hook)
3. **Phase 44** — Governance System (governance drift tasks)
4. **Phase 45** — Governance Lineage (lineage break tasks, navigation hook)
5. **Phase 46** — Knowledge Fabric (fabric link tasks, navigation hook)
6. **Phase 47** — Documentation Engine (documentation tasks, navigation hook)
7. **Phase 48** — Intelligence Hub (navigation hook for related findings)
8. **Phase 49** — Simulation Mode (simulation mismatch tasks, navigation hook)
9. **Phase 50** — Auditor (audit remediation tasks, navigation hook)
10. **Phase 51** — Integrity Monitor (integrity drift tasks, navigation hook)
11. **Phase 52** — Alert Center (alert remediation tasks, navigation hook)

---

## Quick Checklist

Before deploying Action Center:

- [ ] Define `ActionPolicyContext` with all required permissions
- [ ] Provide engine inputs from 8+ sources
- [ ] Set up query filters (categories, severities, sources, statuses)
- [ ] Configure grouping strategy (if needed)
- [ ] Test tenant isolation (different tenants should see different tasks)
- [ ] Test lifecycle operations (acknowledge, assign, resolve, dismiss)
- [ ] Test cross-engine navigation hooks
- [ ] Configure log retention policy
- [ ] Set up log export schedule
- [ ] Verify statistics calculation

---

## Summary

Phase 53 provides a **deterministic, read-only tasking system** that converts alerts, findings, and drift from 8+ engines into unified operator tasks. Use `ActionEngine.executeQuery()` to aggregate tasks, `acknowledgeTask()` / `assignTask()` / `resolveTask()` for lifecycle management, and 9 cross-engine hooks for seamless navigation.

**Key Features**:
- ✅ 8 task categories from 9 source engines
- ✅ 5 grouping strategies (category, severity, entity, source, status)
- ✅ Complete policy enforcement with tenant isolation
- ✅ 6-stage lifecycle (new → acknowledged → assigned → in-progress → resolved/dismissed)
- ✅ Complete audit trail with statistics
- ✅ 9 cross-engine navigation hooks
- ✅ Read-only operation (no engine modifications)

For detailed architecture, see [PHASE53_SUMMARY.md](./PHASE53_SUMMARY.md).
