# Phase 50: Autonomous System Auditor — Quick Reference

## Quick Start

```typescript
import { AuditorEngine, AuditQuery, AuditPolicyContext } from '@/app/auditor';

// 1. Initialize
const auditor = new AuditorEngine('tenant-alpha');

// 2. Create query
const query: AuditQuery = {
  queryId: 'audit-001',
  queryType: 'facility',
  queryText: 'Audit Facility 01',
  scope: { tenantId: 'tenant-alpha', facilityId: 'facility-01' },
  performedBy: 'user-001',
  performedAt: new Date().toISOString(),
};

// 3. Create policy context
const policyContext: AuditPolicyContext = {
  tenantId: 'tenant-alpha',
  performedBy: 'user-001',
  userRoles: ['auditor'],
  userPermissions: ['audit.run', 'audit.facility'],
};

// 4. Execute
const result = await auditor.executeAudit(query, policyContext);

// 5. Process results
console.log(`Found ${result.totalFindings} issues`);
```

---

## Audit Categories

| Category | Rules | Focus |
|----------|-------|-------|
| `workflow-sop-alignment` | 3 | Workflows reference valid SOPs |
| `governance-correctness` | 3 | Decisions have approval/docs |
| `governance-lineage` | 2 | Lineage chains complete |
| `health-drift-validation` | 2 | Health drifts align with timeline |
| `analytics-consistency` | 2 | Patterns reference valid incidents |
| `documentation-completeness` | 3 | Docs have required sections |
| `fabric-integrity` | 2 | Links resolve to valid entities |
| `cross-engine-consistency` | 2 | Metadata consistent across engines |
| `compliance-pack-validation` | 2 | Compliance packs complete |

**Total**: 22 deterministic rules

---

## Severity Levels

| Severity | Color | Usage |
|----------|-------|-------|
| `critical` | 🔴 Red | System-breaking issues (approval missing, tenant isolation violated) |
| `high` | 🟠 Orange | Major compliance violations (SOP missing, docs incomplete) |
| `medium` | 🟡 Yellow | Notable issues (lineage inconsistent, pattern invalid) |
| `low` | 🔵 Blue | Minor issues (bidirectional link missing) |
| `info` | ⚪ White | Informational findings (metadata missing) |

---

## Query Types

### 1. Full System Audit
```typescript
const query: AuditQuery = {
  queryType: 'full-system',
  queryText: 'Audit entire system',
  scope: { tenantId: 'tenant-alpha' },
  // ... other fields
};
```

### 2. Facility Audit
```typescript
const query: AuditQuery = {
  queryType: 'facility',
  queryText: 'Audit Facility 01',
  scope: { tenantId: 'tenant-alpha', facilityId: 'facility-01' },
};
```

### 3. Category Audit
```typescript
const query: AuditQuery = {
  queryType: 'category',
  queryText: 'Audit workflow/SOP alignment',
  scope: { tenantId: 'tenant-alpha' },
  categories: ['workflow-sop-alignment'],
};
```

### 4. Rule Audit
```typescript
const query: AuditQuery = {
  queryType: 'rule',
  queryText: 'Check workflow SOP references',
  scope: { tenantId: 'tenant-alpha' },
  ruleIds: ['workflow-sop-alignment-001'],
};
```

### 5. Entity Audit
```typescript
const query: AuditQuery = {
  queryType: 'entity',
  queryText: 'Audit Workflow WF-001',
  scope: { tenantId: 'tenant-alpha' },
  entityIds: ['workflow-001'],
};
```

---

## Required Permissions

### Basic Permissions
- `audit.run` — Run audits
- `audit.full-system` — Full system audits
- `audit.facility` — Facility audits
- `audit.category` — Category audits
- `audit.rule` — Rule audits
- `audit.entity` — Entity audits

### Scope Permissions
- `facility.audit` — Audit facility-scoped entities
- `room.audit` — Audit room-scoped entities

### Category Permissions
- `audit.workflow-sop-alignment`
- `audit.governance-correctness`
- `audit.governance-lineage`
- `audit.health-drift-validation`
- `audit.analytics-consistency`
- `audit.documentation-completeness`
- `audit.fabric-integrity`
- `audit.cross-engine-consistency`
- `audit.compliance-pack-validation`

### Federation Permission
- `audit.federated` — Cross-tenant audits

---

## Common Usage Patterns

### Pattern 1: Daily Compliance Check
```typescript
const query: AuditQuery = {
  queryType: 'facility',
  scope: { tenantId, facilityId },
  severities: ['critical', 'high'],
  options: {
    includeResolved: false,
    maxFindings: 50,
    sortBy: 'severity',
  },
  performedBy: 'system-scheduler',
  performedAt: new Date().toISOString(),
};
```

### Pattern 2: Governance Audit
```typescript
const query: AuditQuery = {
  queryType: 'category',
  scope: { tenantId },
  categories: ['governance-correctness', 'governance-lineage'],
  options: {
    includeResolved: false,
    sortBy: 'detectedAt',
    sortOrder: 'desc',
  },
  performedBy: 'compliance-officer',
  performedAt: new Date().toISOString(),
};
```

### Pattern 3: Pre-Deployment Audit
```typescript
const query: AuditQuery = {
  queryType: 'full-system',
  scope: { tenantId, facilityId },
  severities: ['critical'],
  options: {
    includeResolved: false,
    maxFindings: 1, // Stop on first critical issue
  },
  performedBy: 'deployment-pipeline',
  performedAt: new Date().toISOString(),
};

const result = await auditor.executeAudit(query, policyContext);

if (result.totalFindings > 0) {
  throw new Error('Deployment blocked: Critical audit findings');
}
```

### Pattern 4: Remediation Tracking
```typescript
// Initial audit
const result1 = await auditor.executeAudit(query, policyContext);
const criticalFindings = result1.findings.filter(f => f.severity === 'critical');

// ... fix issues ...

// Re-audit
const result2 = await auditor.executeAudit(query, policyContext);
const remainingCritical = result2.findings.filter(f => f.severity === 'critical');

console.log(`Fixed ${criticalFindings.length - remainingCritical.length} critical issues`);
```

---

## Accessing Results

### Finding Details
```typescript
const finding = result.findings[0];

console.log(finding.severity);        // 'critical'
console.log(finding.category);        // 'governance-correctness'
console.log(finding.title);           // 'Governance Decision Must Have Approval Violation'
console.log(finding.description);     // Full description
console.log(finding.affectedEntities); // Array of references
console.log(finding.evidence);        // Evidence array
console.log(finding.remediation);     // Remediation guidance
```

### Evidence Inspection
```typescript
const evidence = finding.evidence[0];

console.log(evidence.field);            // 'approvedBy'
console.log(evidence.expectedValue);    // 'A valid user ID'
console.log(evidence.actualValue);      // undefined
console.log(evidence.additionalContext); // 'Decision decision-001 has no approval'
```

### Summary Statistics
```typescript
console.log(result.summary.findingsByCategory);
// { 'workflow-sop-alignment': 3, 'governance-correctness': 2, ... }

console.log(result.summary.findingsBySeverity);
// { critical: 1, high: 2, medium: 2, low: 0, info: 0 }

console.log(result.summary.affectedEntitiesCount); // 8
console.log(result.summary.rulesEvaluated);        // 22
console.log(result.summary.rulesPassed);           // 20
console.log(result.summary.rulesFailed);           // 2
```

---

## Audit Log

### Get Recent Audits
```typescript
const auditLog = auditor.getAuditLog();
const recent = auditLog.getRecentEntries(10);

for (const entry of recent) {
  console.log(`${entry.entryType}: ${entry.timestamp}`);
}
```

### Filter by Type
```typescript
const queries = auditLog.getEntriesByType('query');
const findings = auditLog.getEntriesByType('finding');
const errors = auditLog.getEntriesByType('error');
```

### Filter by Date Range
```typescript
const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
const today = new Date().toISOString();

const last24Hours = auditLog.getEntriesInRange(yesterday, today);
```

### Export Log
```typescript
const json = auditLog.exportLog({
  entryType: 'finding',
  startDate: '2025-01-01',
  endDate: '2025-12-31',
});

// Save to file or send to compliance system
```

---

## Statistics

### Get Audit Statistics
```typescript
const stats = auditor.getStatistics();

console.log(stats.totalAudits);           // 42
console.log(stats.totalFindings);         // 103
console.log(stats.auditsLast24Hours);     // 8
console.log(stats.findingsLast24Hours);   // 15
console.log(stats.averageFindingsPerAudit); // 2
console.log(stats.mostCommonCategory);    // 'workflow-sop-alignment'
console.log(stats.mostCommonSeverity);    // 'medium'
```

### Get Policy Statistics
```typescript
const policyStats = auditor.getPolicyStatistics();

console.log(policyStats.totalDecisions); // 42
console.log(policyStats.allowed);        // 38
console.log(policyStats.denied);         // 3
console.log(policyStats.partial);        // 1
```

---

## Rule Library

### Get All Rules
```typescript
const ruleLibrary = auditor.getRuleLibrary();
const allRules = ruleLibrary.getAllRules();

console.log(`Total rules: ${allRules.length}`); // 22
```

### Get Rules by Category
```typescript
const workflowRules = ruleLibrary.getRulesByCategory('workflow-sop-alignment');
console.log(`Workflow rules: ${workflowRules.length}`); // 3
```

### Get Rules by Severity
```typescript
const criticalRules = ruleLibrary.getRulesBySeverity('critical');
console.log(`Critical rules: ${criticalRules.length}`); // 3
```

### Get Specific Rule
```typescript
const rule = ruleLibrary.getRule('workflow-sop-alignment-001');

console.log(rule.ruleName);        // 'Workflow Must Reference Valid SOP'
console.log(rule.severity);        // 'high'
console.log(rule.condition.field); // 'workflow.sopReferences'
console.log(rule.condition.operator); // 'exists'
console.log(rule.remediation);     // 'Add SOP reference to workflow metadata'
```

---

## Error Handling

### Audit Execution Errors
```typescript
try {
  const result = await auditor.executeAudit(query, policyContext);
  
  // Check for errors in result
  if (result.metadata.error) {
    console.error('Audit error:', result.metadata.error);
  }
} catch (error) {
  console.error('Audit failed:', error);
}
```

### Policy Authorization Failures
```typescript
const result = await auditor.executeAudit(query, policyContext);

if (result.totalFindings === 0 && result.metadata.error) {
  // Policy denied or other error
  console.log('Authorization failed:', result.metadata.error);
}
```

---

## UI Dashboard Access

Navigate to: `/auditor`

**Features**:
- Query panel with category/severity filters
- Results viewer with findings list
- Finding details with evidence viewer
- Affected entities panel
- Audit history
- Statistics dashboard

---

## Integration Points

| Phase | Engine | Integration |
|-------|--------|-------------|
| 32 | Compliance | Compliance pack validation |
| 36 | Timeline | Health drift timeline alignment |
| 39 | Analytics | Pattern consistency checks |
| 43 | Workflow | Workflow/SOP alignment |
| 43 | Health | Health drift validation |
| 44 | Governance | Decision approval validation |
| 45 | Governance History | Lineage chain validation |
| 46 | Fabric | Link integrity checks |
| 47 | Documentation | Bundle completeness validation |
| 48 | Intelligence Hub | Cross-engine consistency |
| 49 | Simulation | Audit logging integration |

---

## Key Constraints

✅ **Read-Only**: Never modifies system data  
✅ **Deterministic**: Same input → same output  
✅ **No Generative AI**: All findings from real data  
✅ **Tenant Isolation**: Strict scoping enforced  
✅ **Evidence-Based**: All findings include evidence  
✅ **Complete Logging**: All operations logged  

---

## Common Troubleshooting

### Issue: No Findings Returned
- Check permissions in policyContext
- Verify query scope matches tenant
- Check if includeResolved option is set

### Issue: Policy Authorization Failed
- Verify user has `audit.run` permission
- Check category-specific permissions
- Ensure tenant ID matches

### Issue: Missing Evidence
- Check rule condition configuration
- Verify evaluator fetches correct metadata
- Review audit log for evaluation errors

### Issue: Slow Audit Execution
- Reduce maxFindings limit
- Filter by specific categories
- Use facility-scoped audits instead of full-system

---

## API Summary

### Main Classes
- `AuditorEngine` — Main orchestrator
- `AuditorRuleLibrary` — Rule management
- `AuditorEvaluator` — Rule evaluation
- `AuditorPolicyEngine` — Authorization
- `AuditorLog` — Audit trail

### Key Types
- `AuditQuery` — Audit request
- `AuditResult` — Audit response
- `AuditFinding` — Compliance issue
- `AuditPolicyContext` — Authorization context
- `AuditStatistics` — Audit metrics

### Severity Enum
- `'critical'` | `'high'` | `'medium'` | `'low'` | `'info'`

### Category Enum
- `'workflow-sop-alignment'`
- `'governance-correctness'`
- `'governance-lineage'`
- `'health-drift-validation'`
- `'analytics-consistency'`
- `'documentation-completeness'`
- `'fabric-integrity'`
- `'cross-engine-consistency'`
- `'compliance-pack-validation'`

---

**Quick Reference Complete** ✅

For full details, see [PHASE50_SUMMARY.md](./PHASE50_SUMMARY.md)
