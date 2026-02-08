# Phase 53: Operator Action Center — Summary

## Overview

The **Operator Action Center** (Phase 53) is a deterministic, read-only tasking and remediation workflow system that converts alerts, audit findings, integrity drift, and cross-engine issues into structured operator tasks. It provides a unified interface for operators to acknowledge, assign, group, and track remediation work without modifying underlying engine data.

**Core Principle**: All tasks originate from real alerts, findings, or drift events. No generative AI, no invented tasks, no predictions.

## Core Objectives

1. **Task Aggregation**: Convert alerts/findings/drift from 8+ engines into unified ActionTask objects
2. **Deterministic Routing**: Normalize tasks from heterogeneous engines with tenant-aware filtering
3. **Remediation Workflow**: Support acknowledge → assign → in-progress → resolve lifecycle
4. **Policy Enforcement**: Enforce tenant isolation, federation rules, and engine-level permissions
5. **Task Organization**: Group by category, severity, entity, source, or status
6. **Complete Audit Trail**: Log all task operations, routing events, and lifecycle changes
7. **Cross-Engine Navigation**: Provide 9 navigation hooks to related systems
8. **Read-Only Operation**: All task management is read-only; NO modifications to source engines

---

## Task Model

### Task Categories (8)

| Category | Description | Source Engine(s) |
|----------|-------------|------------------|
| **alert-remediation** | Tasks from Alert Center | Phase 52: Alert Center |
| **audit-remediation** | Tasks from audit findings | Phase 50: Auditor |
| **integrity-drift-remediation** | Tasks from integrity drift | Phase 51: Integrity Monitor |
| **governance-lineage-issue** | Governance drift/lineage breaks | Phases 44-45: Governance |
| **documentation-completeness** | Documentation issues | Phase 47: Documentation Engine |
| **fabric-link-breakage** | Broken/unresolved links | Phase 46: Knowledge Fabric |
| **compliance-pack-issue** | Compliance violations | Phase 32: Compliance Engine |
| **simulation-mismatch** | Simulation forecast drift | Phase 49: Simulation Mode |

### Task Severity Levels (5)

- **critical**: Immediate action required (production impact, regulatory)
- **high**: Urgent action needed (governance drift, audit findings)
- **medium**: Important but not urgent (documentation issues, fabric links)
- **low**: Minor issues (info updates)
- **info**: Informational only

### Task Status Lifecycle

```
new → acknowledged → assigned → in-progress → resolved
                                          ↓
                                     dismissed
```

- **new**: Task created, not yet acknowledged
- **acknowledged**: Operator has seen the task
- **assigned**: Task assigned to specific operator
- **in-progress**: Work has begun
- **resolved**: Task completed successfully
- **dismissed**: Task dismissed with reason

### Task Sources (9 Engines)

1. **alert-center** (Phase 52)
2. **auditor** (Phase 50)
3. **integrity-monitor** (Phase 51)
4. **governance-system** (Phase 44)
5. **governance-lineage** (Phase 45)
6. **documentation-bundler** (Phase 47)
7. **knowledge-fabric** (Phase 46)
8. **compliance-engine** (Phase 32)
9. **simulation-engine** (Phase 49)

---

## Routing Logic

### Ingestion Process

The **ActionRouter** ingests tasks from 8+ engines and normalizes them:

```typescript
// 1. Filter by tenant BEFORE normalization (tenant isolation)
const filtered = alerts.filter(alert => alert.scope.tenantId === this.tenantId);

// 2. Normalize into ActionTask
const tasks = filtered.map(alert => this.normalizeAlert(alert));

// 3. Return normalized tasks
return tasks;
```

### Engine-Specific Routing Methods

| Method | Source Engine | Converts From → To |
|--------|---------------|-------------------|
| `routeFromAlertCenter()` | Alert Center (Phase 52) | Alert → ActionTask |
| `routeFromAuditor()` | Auditor (Phase 50) | AuditFinding → ActionTask |
| `routeFromIntegrityMonitor()` | Integrity Monitor (Phase 51) | IntegrityDrift → ActionTask |
| `routeFromGovernance()` | Governance (Phases 44-45) | GovernanceIssue → ActionTask |
| `routeFromDocumentation()` | Documentation Engine (Phase 47) | DocumentationIssue → ActionTask |
| `routeFromFabric()` | Knowledge Fabric (Phase 46) | FabricLinkIssue → ActionTask |
| `routeFromCompliance()` | Compliance Engine (Phase 32) | ComplianceIssue → ActionTask |
| `routeFromSimulation()` | Simulation Engine (Phase 49) | SimulationMismatch → ActionTask |

### Normalization Rules

**Alert → ActionTask**:
- `category`: Always `'alert-remediation'`
- `severity`: Normalized to 5-level scale
- `title`: Prefixed with "Remediate: "
- `remediation`: Generated from alert context
- `status`: `'new'` or `'resolved'` (if already resolved in source)

**AuditFinding → ActionTask**:
- `category`: Always `'audit-remediation'`
- `severity`: Normalized from finding severity
- `title`: Prefixed with "Remediate Audit Finding: "
- `remediation`: High priority suggested actions
- `metadata`: Includes `auditId` and `sourceFindingId`

**IntegrityDrift → ActionTask**:
- `category`: Always `'integrity-drift-remediation'`
- `severity`: Normalized from drift severity
- `title`: Prefixed with "Remediate Drift: "
- `metadata`: Includes `ruleId` and `evidence`
- `remediation`: Investigation-focused actions

---

## Task Building Logic

### Grouping Strategies

The **ActionTaskBuilder** provides 5 grouping strategies:

#### 1. Group by Category
```typescript
groupByCategory(tasks: ActionTask[]): ActionGroup[]
```
Groups tasks by 8 task categories. Useful for organizing work by functional area.

#### 2. Group by Severity
```typescript
groupBySeverity(tasks: ActionTask[]): ActionGroup[]
```
Groups tasks by 5 severity levels. Useful for prioritizing critical work.

#### 3. Group by Entity
```typescript
groupByEntity(tasks: ActionTask[]): ActionGroup[]
```
Groups tasks by affected entities (workflows, SOPs, decisions, etc.). Useful for entity-centric remediation.

#### 4. Group by Source
```typescript
groupBySource(tasks: ActionTask[]): ActionGroup[]
```
Groups tasks by 9 source engines. Useful for engine-specific workflows.

#### 5. Group by Status
```typescript
groupByStatus(tasks: ActionTask[]): ActionGroup[]
```
Groups tasks by 6 status values. Useful for tracking work progress.

### Duplicate Merging

```typescript
mergeDuplicates(tasks: ActionTask[]): ActionTask[]
```

Merges tasks with same:
- Title
- Category
- Affected entities

**Preserves ALL**:
- References from all duplicates
- Evidence from all duplicates
- Metadata from all duplicates

### Priority Calculation

Priority score formula:
```
score = severityScore + ageScore + categoryScore - statusPenalty

severityScore:
  critical: 100, high: 75, medium: 50, low: 25, info: 10

ageScore: min(hours_since_creation, 100)

categoryScore:
  audit-remediation: 20
  compliance-pack-issue: 20
  integrity-drift-remediation: 15
  governance-lineage-issue: 15
  alert-remediation: 10
  fabric-link-breakage: 5
  documentation-completeness: 5
  simulation-mismatch: 5

statusPenalty:
  resolved: -500
  dismissed: -500
  in-progress: +10
```

### Remediation Metadata

Each task includes non-generative remediation suggestions:

```typescript
interface RemediationMetadata {
  suggestedAction: string;       // Deterministic action (e.g., "Review and resolve alert")
  estimatedEffort: 'low' | 'medium' | 'high';
  requiredPermissions: string[]; // Permissions needed
  relatedDocumentation?: string; // Link to docs
  relatedSOP?: string;           // Link to SOP
  prerequisiteTasks?: string[];  // Task dependencies
}
```

**Example Remediations**:
- **Audit Finding**: "Address audit finding: [title]"
- **Integrity Drift**: "Investigate and resolve integrity drift"
- **Governance Issue**: "Restore governance lineage chain" OR "Align governance decision with baseline"
- **Fabric Link Issue**: "Restore broken fabric link or remove orphaned reference"
- **Documentation Issue**: "Complete missing documentation sections"

---

## Policy Enforcement

### Authorization Model

The **ActionPolicyEngine** validates:
1. Tenant isolation
2. Federation rules
3. Query permissions
4. Category-level permissions
5. Source-level permissions
6. Lifecycle operation permissions

### Permission Model

#### Global Permissions
- `action.query` — Required to execute queries
- `action.view-all` — View all categories and sources (bypasses per-category checks)
- `action.federated` — Query across tenants (requires federation enabled)

#### Category Permissions
- `action.alert-remediation`
- `action.audit-remediation`
- `action.integrity-drift-remediation`
- `action.governance-lineage-issue`
- `action.documentation-completeness`
- `action.fabric-link-breakage`
- `action.compliance-pack-issue`
- `action.simulation-mismatch`

#### Source Permissions
- `action.source.alert-center`
- `action.source.auditor`
- `action.source.integrity-monitor`
- `action.source.governance-system`
- `action.source.governance-lineage`
- `action.source.documentation-bundler`
- `action.source.knowledge-fabric`
- `action.source.compliance-engine`
- `action.source.simulation-engine`

#### Lifecycle Permissions
- `action.acknowledge` — Acknowledge tasks
- `action.assign` — Assign tasks to self
- `action.assign-others` — Assign tasks to others
- `action.resolve` — Resolve tasks
- `action.dismiss` — Dismiss tasks

#### Scope Permissions
- `facility.action.query` — Query tasks from other facilities

### Partial Authorization

If user lacks some category/source permissions, query returns:
```typescript
{
  authorized: true,
  reason: 'Partial authorization',
  deniedCategories: ['audit-remediation', 'compliance-pack-issue'],
  deniedSources: ['auditor', 'compliance-engine']
}
```

Tasks from denied categories/sources are automatically filtered out.

---

## Architecture

### Core Components

#### 1. ActionRouter
- **Responsibility**: Ingest tasks from 8+ engines, normalize into ActionTask objects
- **Methods**: 8 routing methods (one per engine), `routeAll()` for batch
- **Tenant Isolation**: Filters by tenantId BEFORE normalization

#### 2. ActionTaskBuilder
- **Responsibility**: Group, merge, sort, and prioritize tasks
- **Methods**: 5 grouping strategies, duplicate merging, priority calculation
- **Features**: Filtering by facility/room/assignee/permissions

#### 3. ActionPolicyEngine
- **Responsibility**: Enforce tenant isolation and permissions
- **Methods**: `authorizeQuery()`, `authorizeTask()`, `authorizeLifecycleChange()`
- **Features**: Partial authorization, policy decision logging

#### 4. ActionLog
- **Responsibility**: Complete audit trail for all operations
- **Logged Events**: Tasks, queries, groups, routing, policy decisions, lifecycle changes, errors
- **Features**: Filtering, statistics, export with date/performer/tenant filters

#### 5. ActionEngine
- **Responsibility**: Main orchestrator
- **Methods**: `executeQuery()`, `acknowledgeTask()`, `assignTask()`, `resolveTask()`, `dismissTask()`
- **Process**: 10-step query execution (authorize → route → filter → merge → sort → limit → group → summarize → result → log)

### Data Flow

```
1. User submits ActionQuery
2. ActionEngine receives query + context + engine inputs
3. ActionPolicyEngine validates query authorization
4. ActionRouter ingests tasks from all engines (with tenant filtering)
5. ActionEngine filters tasks by query parameters
6. ActionTaskBuilder merges duplicates (if enabled)
7. ActionTaskBuilder sorts tasks by priority/severity
8. ActionEngine applies max task limit
9. ActionTaskBuilder groups tasks (if requested)
10. ActionEngine calculates summary statistics
11. ActionEngine creates ActionResult
12. ActionLog records query + tasks + groups
13. ActionEngine returns result to UI
14. UI displays tasks/groups with cross-engine hooks
```

---

## Integration Points

### Task Sources (Phases 32-51)

| Source Engine | Phase | Input Type | Task Category |
|---------------|-------|------------|---------------|
| Alert Center | 52 | AlertInput | alert-remediation |
| Auditor | 50 | AuditFindingInput | audit-remediation |
| Integrity Monitor | 51 | IntegrityDriftInput | integrity-drift-remediation |
| Governance System | 44 | GovernanceIssueInput | governance-lineage-issue |
| Governance Lineage | 45 | GovernanceIssueInput | governance-lineage-issue |
| Documentation Bundler | 47 | DocumentationIssueInput | documentation-completeness |
| Knowledge Fabric | 46 | FabricLinkIssueInput | fabric-link-breakage |
| Compliance Engine | 32 | ComplianceIssueInput | compliance-pack-issue |
| Simulation Engine | 49 | SimulationMismatchInput | simulation-mismatch |

### Cross-Engine Navigation Hooks (9)

Operators can navigate to related systems from task details:

1. **Phase 37 — Explain This Task**: Open explanatory content for task
2. **Phase 52 — Open Related Alert**: View source alert (if task from Alert Center)
3. **Phase 50 — Open Audit Finding**: View source audit finding (if task from Auditor)
4. **Phase 51 — Open Integrity Alert**: View source drift alert (if task from Integrity Monitor)
5. **Phase 45 — Open Governance Lineage**: View governance lineage chain (if governance task)
6. **Phase 46 — Open Fabric Links**: View fabric link details (if fabric task)
7. **Phase 47 — Open Documentation Bundle**: View documentation bundle (if documentation task)
8. **Phase 49 — Open Simulation Scenario**: View simulation scenario (if simulation task)
9. **Phase 48 — Open Intelligence Hub**: Query Intelligence Hub for related findings

---

## Statistics and Reporting

### Task Statistics

```typescript
interface ActionStatistics {
  totalTasks: number;
  newTasks: number;
  acknowledgedTasks: number;
  assignedTasks: number;
  inProgressTasks: number;
  resolvedTasks: number;
  dismissedTasks: number;
  
  byCategory: Record<string, number>;
  bySeverity: Record<ActionSeverity, number>;
  bySource: Record<string, number>;
  byStatus: Record<ActionStatus, number>;
  
  trends: {
    tasksCreatedToday: number;
    tasksResolvedToday: number;
    tasksCreatedThisWeek: number;
    tasksResolvedThisWeek: number;
    averageResolutionTimeHours: number;
  };
  
  mostCommonCategory: string;
  mostCommonSeverity: ActionSeverity;
  mostCommonSource: string;
}
```

### Policy Statistics

```typescript
{
  totalDecisions: number;
  authorized: number;
  denied: number;
  partiallyAuthorized: number;
  byReason: Record<string, number>;
  byTenant: Record<string, number>;
  byPerformer: Record<string, number>;
}
```

### Log Export

Export action log with filters:
- Date range (startDate, endDate)
- Entry types (task, query, group, routing, policy-decision, lifecycle-change, error)
- Performer (userId)
- Tenant (tenantId)
- Success only / failure only

---

## Usage Examples

### Example 1: Query All Tasks

```typescript
const actionEngine = new ActionEngine('tenant-alpha');

const query: ActionQuery = {
  queryId: 'query-001',
  description: 'All action tasks',
  scope: { tenantId: 'tenant-alpha' },
  options: {
    sortBy: 'severity',
    sortOrder: 'desc',
  },
  triggeredBy: 'user-001',
  triggeredAt: new Date().toISOString(),
};

const context: ActionPolicyContext = {
  tenantId: 'tenant-alpha',
  performedBy: 'user-001',
  userRoles: ['operator'],
  userPermissions: ['action.query', 'action.view-all'],
};

const inputs: EngineInputs = {
  alerts: [...],          // From Alert Center
  auditFindings: [...],   // From Auditor
  integrityDrift: [...],  // From Integrity Monitor
};

const result = await actionEngine.executeQuery(query, context, inputs);

console.log(`Total tasks: ${result.totalTasks}`);
console.log(`New tasks: ${result.newTasks}`);
console.log(`By severity:`, result.summary.bySeverity);
```

### Example 2: Query Critical Audit Tasks

```typescript
const query: ActionQuery = {
  queryId: 'query-002',
  description: 'Critical audit remediation tasks',
  scope: { tenantId: 'tenant-alpha' },
  categories: ['audit-remediation'],
  severities: ['critical', 'high'],
  statuses: ['new', 'assigned'],
  triggeredBy: 'user-001',
  triggeredAt: new Date().toISOString(),
};

const result = await actionEngine.executeQuery(query, context, inputs);
```

### Example 3: Query Tasks for Specific Entity

```typescript
const query: ActionQuery = {
  queryId: 'query-003',
  description: 'Tasks affecting workflow WF-12',
  scope: { tenantId: 'tenant-alpha' },
  entityId: 'WF-12',
  entityType: 'workflow',
  triggeredBy: 'user-001',
  triggeredAt: new Date().toISOString(),
};

const result = await actionEngine.executeQuery(query, context, inputs);
```

### Example 4: Query with Grouping

```typescript
const query: ActionQuery = {
  queryId: 'query-004',
  description: 'Tasks grouped by category',
  scope: { tenantId: 'tenant-alpha' },
  options: {
    groupBy: 'category',
    sortBy: 'severity',
  },
  triggeredBy: 'user-001',
  triggeredAt: new Date().toISOString(),
};

const result = await actionEngine.executeQuery(query, context, inputs);

console.log(`Groups: ${result.groups?.length}`);
for (const group of result.groups || []) {
  console.log(`${group.groupKey}: ${group.summary.totalTasks} tasks`);
}
```

### Example 5: Acknowledge Task

```typescript
const { success, task, error } = await actionEngine.acknowledgeTask(
  'task-alert-001',
  context
);

if (success) {
  console.log(`Task acknowledged: ${task?.status}`);
} else {
  console.error(`Failed: ${error}`);
}
```

### Example 6: Assign Task

```typescript
const { success, task, error } = await actionEngine.assignTask(
  'task-audit-001',
  'operator-jane',
  context
);

if (success) {
  console.log(`Task assigned to ${task?.assignedTo}`);
}
```

### Example 7: Resolve Task

```typescript
const { success, task, error } = await actionEngine.resolveTask(
  'task-integrity-001',
  context
);

if (success) {
  console.log(`Task resolved at ${task?.resolvedAt}`);
}
```

### Example 8: Export Log

```typescript
const exported = actionEngine.getActionLog().exportLog({
  startDate: '2026-01-01',
  endDate: '2026-01-31',
  entryTypes: ['task', 'query', 'lifecycle-change'],
  tenantId: 'tenant-alpha',
  successOnly: true,
});

console.log(`Exported ${exported.entries.length} entries`);
```

---

## Maintenance

### Log Retention

```typescript
// Clear entries older than 90 days
const cleared = actionEngine.getActionLog().clearOldEntries(90);
console.log(`Cleared ${cleared} old entries`);
```

### Statistics Query

```typescript
const stats = actionEngine.getStatistics();
console.log(`Average resolution time: ${stats.trends.averageResolutionTimeHours} hours`);
console.log(`Most common category: ${stats.mostCommonCategory}`);
```

### Policy Log Query

```typescript
const policyStats = actionEngine.getPolicyStatistics();
console.log(`Total decisions: ${policyStats.totalDecisions}`);
console.log(`Denied: ${policyStats.denied}`);
```

---

## Future Enhancements

1. **Real-Time Task Updates**: WebSocket notifications for new tasks
2. **Task Templates**: Predefined remediation workflows
3. **Automated Assignment**: Rule-based task assignment (by category, severity, expertise)
4. **Task Dependencies**: Mark prerequisite tasks, enforce completion order
5. **Escalation Rules**: Auto-escalate tasks not acknowledged within SLA
6. **Task Comments**: Allow operators to add notes/comments to tasks
7. **Bulk Operations**: Acknowledge/assign/resolve multiple tasks at once
8. **Task Metrics Dashboard**: Resolution time trends, operator performance, backlog growth
9. **Integration with Ticketing Systems**: Export tasks to Jira, ServiceNow, etc.
10. **Remediation Playbooks**: Link tasks to step-by-step remediation guides

---

## Conclusion

Phase 53 provides a **deterministic, read-only tasking and remediation workflow system** that unifies alerts, audit findings, integrity drift, and cross-engine issues into a single operator interface. All tasks originate from real engine outputs—no generative AI, no invented tasks.

**Key Capabilities**:
- ✅ Aggregate tasks from 8+ engines
- ✅ Normalize heterogeneous inputs into unified task model
- ✅ Enforce tenant isolation and permissions
- ✅ Support acknowledge → assign → resolve lifecycle
- ✅ Group by category, severity, entity, source, or status
- ✅ Complete audit trail with statistics
- ✅ 9 cross-engine navigation hooks
- ✅ Read-only operation (no engine modifications)

**Next Recommended Phase**: Real-time notification system, automated remediation workflows, or task escalation engine.
