# Phase 61 Quick Reference

**Enterprise Archive & Retention Center**

---

## Quick Start

### Basic Archive Creation Example

```typescript
import {
  ArchiveEngine,
  ArchiveStore,
  ArchivePolicyEngine,
  ArchiveLog,
  ArchiveQuery,
  ArchivePolicyContext
} from '@/app/archiveCenter';

// 1. Initialize archive system
const store = new ArchiveStore();
const policyEngine = new ArchivePolicyEngine();
const log = new ArchiveLog();
const engine = new ArchiveEngine(store, policyEngine, log);

// 2. Create archive query
const query: ArchiveQuery = {
  queryId: 'archive-001',
  queryType: 'create',
  description: 'Archive Q1 2025 compliance report',
  createData: {
    category: 'compliance-packs',
    originalId: 'report-q1-2025',
    originalType: 'compliance-report',
    data: {
      reportId: 'report-q1-2025',
      title: 'Q1 2025 Compliance Report',
      generatedAt: '2025-03-31T23:59:59Z',
      sections: [...],
      findings: [...]
    },
    format: 'json',
    metadata: {
      title: 'Q1 2025 Compliance Report',
      description: 'Quarterly compliance report for Q1 2025',
      tags: ['compliance', 'q1-2025', 'quarterly'],
      sourcePhase: 'Phase 59: Enterprise Reporting',
      sourceEngine: 'reportingEngine',
      originalTimestamp: '2025-03-31T23:59:59Z'
    },
    references: {
      reportIds: ['report-q1-2025'],
      auditFindingIds: ['audit-001', 'audit-002']
    },
    retentionPolicyId: 'policy-compliance-2555'
  },
  requestedBy: 'admin@company.com',
  requestedAt: new Date().toISOString()
};

// 3. Create policy context
const policyContext: ArchivePolicyContext = {
  userId: 'admin@company.com',
  userTenantId: 'tenant-alpha',
  permissions: [
    'archive:compliance-access',
    'archive:executive-view'
  ],
  role: 'admin'
};

// 4. Archive the item
const result = await engine.archiveItem(query, policyContext);

// 5. Handle result
if (result.success) {
  console.log('Archive created:', result.item?.archiveId);
  console.log('Version:', result.item?.version);
  console.log('Expires:', result.item?.retention.expiresAt);
} else {
  console.error('Archive failed:', result.error);
}
```

---

## Common Archive Patterns

### Pattern 1: Archive Reports with Long-Term Retention

**Use Case:** Archive quarterly compliance reports for 7-year retention  
**Category:** `compliance-packs`  
**Retention:** 2555 days (7 years)

```typescript
const query: ArchiveQuery = {
  queryId: `archive-compliance-${Date.now()}`,
  queryType: 'create',
  description: 'Archive compliance report with 7-year retention',
  createData: {
    category: 'compliance-packs',
    originalId: 'compliance-report-q4-2024',
    originalType: 'compliance-report',
    data: {
      // Full report data from Phase 59
      reportId: 'compliance-report-q4-2024',
      category: 'compliance',
      title: 'Q4 2024 Compliance Report',
      sections: [...],
      metrics: {...}
    },
    format: 'json',
    metadata: {
      title: 'Q4 2024 Compliance Report',
      description: 'Comprehensive compliance report for Q4 2024',
      tags: ['compliance', 'q4-2024', 'regulatory'],
      sourcePhase: 'Phase 59: Enterprise Reporting',
      sourceEngine: 'reportingEngine',
      originalTimestamp: '2024-12-31T23:59:59Z'
    },
    references: {
      reportIds: ['compliance-report-q4-2024'],
      auditFindingIds: [...],
      driftEventIds: [...]
    },
    retentionPolicyId: 'policy-compliance-2555'  // 7 years
  },
  requestedBy: 'compliance-officer@company.com',
  requestedAt: new Date().toISOString()
};

const policyContext: ArchivePolicyContext = {
  userId: 'compliance-officer@company.com',
  userTenantId: 'tenant-alpha',
  permissions: ['archive:compliance-access'],
  role: 'compliance-officer'
};

const result = await engine.archiveItem(query, policyContext);
```

---

### Pattern 2: Archive Export Bundles with Auto-Delete

**Use Case:** Archive export bundles with 90-day retention and auto-delete  
**Category:** `export-bundles`  
**Retention:** 90 days (auto-delete)

```typescript
const query: ArchiveQuery = {
  queryId: `archive-export-${Date.now()}`,
  queryType: 'create',
  description: 'Archive export bundle with 90-day retention',
  createData: {
    category: 'export-bundles',
    originalId: 'export-bundle-jan-2025',
    originalType: 'compliance-export',
    data: {
      // Export bundle from Phase 60
      bundleId: 'export-bundle-jan-2025',
      category: 'compliance-pack',
      format: 'html',
      sections: [...],
      exportedAt: '2025-01-15T10:00:00Z'
    },
    format: 'html',
    metadata: {
      title: 'January 2025 Compliance Export',
      description: 'Monthly compliance export bundle',
      tags: ['export', 'jan-2025', 'monthly'],
      sourcePhase: 'Phase 60: Export Hub',
      sourceEngine: 'exportEngine',
      originalTimestamp: '2025-01-15T10:00:00Z'
    },
    references: {
      exportIds: ['export-bundle-jan-2025']
    },
    retentionPolicyId: 'policy-exports-90'  // 90 days, auto-delete
  },
  requestedBy: 'operator@company.com',
  requestedAt: new Date().toISOString()
};

const policyContext: ArchivePolicyContext = {
  userId: 'operator@company.com',
  userTenantId: 'tenant-alpha',
  permissions: [],
  role: 'operator'
};

const result = await engine.archiveItem(query, policyContext);
```

---

### Pattern 3: Retrieve Archive by ID

**Use Case:** Retrieve specific archive for viewing or download

```typescript
const retrieveQuery: ArchiveQuery = {
  queryId: `retrieve-${Date.now()}`,
  queryType: 'retrieve',
  description: 'Retrieve compliance report archive',
  filters: {
    archiveIds: ['archive-compliance-packs-report-q1-2025-v1-...']
  },
  requestedBy: 'auditor@company.com',
  requestedAt: new Date().toISOString()
};

const policyContext: ArchivePolicyContext = {
  userId: 'auditor@company.com',
  userTenantId: 'tenant-alpha',
  permissions: ['archive:compliance-access'],
  role: 'auditor'
};

const result = await engine.retrieveArchive(retrieveQuery, policyContext);

if (result.success && result.item) {
  console.log('Archive retrieved:', result.item.metadata.title);
  console.log('Content size:', result.item.content.sizeBytes);
  console.log('Access count:', result.item.metadata.accessCount);
  
  // Access archived data
  const archivedData = result.item.content.data;
}
```

---

### Pattern 4: List Archives by Category and Time Range

**Use Case:** Find all compliance reports from last quarter

```typescript
const listQuery: ArchiveQuery = {
  queryId: `list-${Date.now()}`,
  queryType: 'list',
  description: 'List Q1 2025 compliance reports',
  filters: {
    categories: ['compliance-packs'],
    tenantId: 'tenant-alpha',
    timeRange: {
      start: '2025-01-01T00:00:00Z',
      end: '2025-03-31T23:59:59Z'
    }
  },
  requestedBy: 'auditor@company.com',
  requestedAt: new Date().toISOString()
};

const result = await engine.listArchives(listQuery, policyContext);

if (result.success && result.items) {
  console.log(`Found ${result.items.length} compliance archives`);
  result.items.forEach(archive => {
    console.log(`- ${archive.metadata.title} (v${archive.version})`);
  });
}
```

---

### Pattern 5: Get Version History

**Use Case:** View all versions of a specific report

```typescript
const versions = engine.getVersionHistory('report-q1-2025');

console.log(`Found ${versions.versions?.length} versions:`);
versions.versions?.forEach(version => {
  console.log(`Version ${version.version}:`);
  console.log(`  Archived: ${new Date(version.archivedAt).toLocaleString()}`);
  console.log(`  By: ${version.archivedBy}`);
  console.log(`  Size: ${version.contentSizeBytes} bytes`);
  if (version.changeDescription) {
    console.log(`  Changes: ${version.changeDescription}`);
  }
});
```

---

### Pattern 6: Apply Legal Hold

**Use Case:** Prevent deletion of archive for litigation

```typescript
const success = await engine.applyLegalHold(
  'archive-compliance-packs-report-q1-2025-v1-...',
  'Litigation hold - Case #2025-001 - Securities inquiry',
  policyContext  // Must be compliance-officer or admin
);

if (success) {
  console.log('Legal hold applied successfully');
  
  // Archive now cannot be deleted until legal hold removed
  // Even if retention period expires
}
```

---

### Pattern 7: Evaluate and Apply Retention

**Use Case:** Automated retention cleanup (scheduled job)

```typescript
// Run daily to check retention status
cron.schedule('0 2 * * *', async () => {
  // Check which archives are expired
  const retentionStatus = engine.evaluateRetention();
  
  console.log('Retention evaluation:');
  console.log(`  Evaluated: ${retentionStatus.retentionStatus?.evaluated}`);
  console.log(`  Expired: ${retentionStatus.retentionStatus?.expired}`);
  console.log(`  Active: ${retentionStatus.retentionStatus?.active}`);
  console.log(`  Legal Hold: ${retentionStatus.retentionStatus?.legalHold}`);
  
  // Apply retention (soft delete expired archives)
  const deletedCount = engine.applyRetention({
    userId: 'system-retention-job',
    userTenantId: 'system',
    permissions: [],
    role: 'admin'
  });
  
  console.log(`Soft-deleted ${deletedCount} expired archives`);
});
```

---

## Retention Policy Reference

| Category | Retention | Auto-Delete | Use Case |
|----------|-----------|-------------|----------|
| **reports** | 365 days (1 year) | No | Executive reports, operational reports |
| **export-bundles** | 90 days (3 months) | Yes | Export packages, temporary distributions |
| **compliance-packs** | 2555 days (7 years) | No | Legal compliance documents |
| **executive-insights** | 180 days (6 months) | No | Strategic insights, KPI analysis |
| **capacity-projections** | 365 days (1 year) | Yes | Capacity forecasts, resource planning |
| **schedules** | 90 days (3 months) | Yes | Schedule snapshots, orchestration logs |
| **performance-snapshots** | 180 days (6 months) | Yes | Performance metrics, telemetry data |
| **audit-logs** | 1825 days (5 years) | No | Audit trails, compliance logs |
| **drift-logs** | 365 days (1 year) | Yes | Environmental drift events |
| **alert-snapshots** | 180 days (6 months) | Yes | Alert history, notification logs |
| **task-snapshots** | 180 days (6 months) | Yes | Task execution history |

---

## Permission Management

### Permission Reference

| Permission | Purpose | Use Cases |
|------------|---------|-----------|
| `archive:cross-tenant` | Access archives from other tenants | Multi-tenant dashboards |
| `archive:federation-admin` | Access all federation archives | Federation administrators |
| `archive:federation:{id}` | Access specific federation | Federation members |
| `archive:executive-view` | Access executive insights | Executive-level reporting |
| `archive:compliance-access` | Access compliance and audit archives | Auditors, compliance officers |
| `archive:legal-hold-access` | View/manage legal hold archives | Legal/compliance teams |
| `archive:view-deleted` | View soft-deleted archives | Administrators, recovery operations |

### Role-Based Permissions

#### Executive
```typescript
{
  role: 'executive',
  permissions: [
    'archive:executive-view',
    'archive:compliance-access'
  ]
}
```
**Can Access:** All archive categories except legal holds

#### Admin
```typescript
{
  role: 'admin',
  permissions: [
    'archive:executive-view',
    'archive:compliance-access',
    'archive:legal-hold-access',
    'archive:view-deleted'
  ]
}
```
**Can Access:** All archives including legal holds and deleted

#### Compliance Officer
```typescript
{
  role: 'compliance-officer',
  permissions: [
    'archive:compliance-access',
    'archive:legal-hold-access'
  ]
}
```
**Can Access:** Compliance packs, audit logs, legal holds

#### Auditor
```typescript
{
  role: 'auditor',
  permissions: [
    'archive:compliance-access'
  ]
}
```
**Can Access:** Compliance packs, audit logs (no legal hold management)

#### Manager
```typescript
{
  role: 'manager',
  permissions: []
}
```
**Can Access:** Reports, exports, schedules, performance data (standard archives)

#### Operator
```typescript
{
  role: 'operator',
  permissions: []
}
```
**Can Access:** Exports, schedules, performance snapshots (operational archives only)

---

## Troubleshooting

### Issue 1: Cross-Tenant Access Denied

**Error:**
```
Archive failed: Cross-tenant archive access denied
```

**Cause:** User trying to access archive from different tenant

**Solution:**
```typescript
// Option 1: Add cross-tenant permission
const policyContext: ArchivePolicyContext = {
  userId: 'user@company.com',
  userTenantId: 'tenant-alpha',
  permissions: ['archive:cross-tenant'],  // Add this
  role: 'manager'
};

// Option 2: Ensure correct tenant filter
const query: ArchiveQuery = {
  // ...
  filters: {
    tenantId: 'tenant-alpha'  // Match user's tenant
  }
};
```

---

### Issue 2: Compliance Archive Access Denied

**Error:**
```
Category 'compliance-packs' requires auditor, compliance-officer, executive, or admin role
```

**Cause:** User lacks required role for compliance archives

**Solution:**
```typescript
// Option 1: Change role
const policyContext: ArchivePolicyContext = {
  userId: 'user@company.com',
  userTenantId: 'tenant-alpha',
  permissions: [],
  role: 'auditor'  // Or 'compliance-officer', 'executive', 'admin'
};

// Option 2: Grant permission
const policyContext: ArchivePolicyContext = {
  userId: 'user@company.com',
  userTenantId: 'tenant-alpha',
  permissions: ['archive:compliance-access'],  // Add this
  role: 'manager'
};
```

---

### Issue 3: Invalid Retention Policy

**Error:**
```
Retention policy policy-custom-180 not found or inactive
```

**Cause:** Using retention policy ID that doesn't exist

**Solution:**
```typescript
// Get available retention policies
const policies = engine.getRetentionPolicies();
console.log('Available policies:');
policies.forEach(p => {
  console.log(`  ${p.policyId}: ${p.policyName} (${p.retentionDays} days)`);
});

// Use valid policy ID
const query: ArchiveQuery = {
  // ...
  createData: {
    // ...
    retentionPolicyId: 'policy-compliance-2555'  // Valid policy
  }
};
```

---

### Issue 4: Legal Hold Prevents Deletion

**Error:**
```
Soft deletion failed: Archive has active legal hold
```

**Cause:** Trying to delete archive with legal hold

**Solution:**
```typescript
// Step 1: Check legal hold status
const archive = store.getArchive(archiveId);
if (archive?.retention.legalHold) {
  console.log('Legal hold reason:', archive.retention.legalHoldReason);
  console.log('Applied by:', archive.retention.legalHoldBy);
}

// Step 2: Remove legal hold (if authorized)
const removed = await engine.removeLegalHold(archiveId, policyContext);
if (removed) {
  // Now deletion can proceed
  const deleted = store.updateRetentionStatus(
    archiveId,
    'soft-delete',
    'Retention expired',
    'admin@company.com'
  );
}
```

---

### Issue 5: Archive Not Found

**Error:**
```
Archive archive-reports-report-123-v1-... not found
```

**Cause:** Archive doesn't exist or was soft-deleted

**Solution:**
```typescript
// Option 1: Check if soft-deleted
const listQuery: ArchiveQuery = {
  queryId: `list-${Date.now()}`,
  queryType: 'list',
  description: 'Search including deleted',
  filters: {
    includeDeleted: true,  // Include soft-deleted archives
    archiveIds: ['archive-reports-report-123-v1-...']
  },
  requestedBy: 'admin@company.com',
  requestedAt: new Date().toISOString()
};

// Option 2: Search by originalId
const versions = engine.getVersionHistory('report-123');
console.log('Available versions:', versions.versions?.length);
```

---

### Issue 6: Empty Archive List

**Symptom:** List query returns 0 archives but archives exist

**Diagnosis:**
```typescript
// Check total archives
const stats = engine.getStatistics();
console.log('Total archives:', stats.totalArchives);
console.log('By category:', stats.byCategory);

// Check filters
const listQuery: ArchiveQuery = {
  queryId: `debug-list-${Date.now()}`,
  queryType: 'list',
  description: 'Debug archive list',
  filters: {
    // Remove all filters to see everything
    tenantId: 'tenant-alpha'
  },
  requestedBy: 'admin@company.com',
  requestedAt: new Date().toISOString()
};

const result = await engine.listArchives(listQuery, policyContext);
console.log('Unfiltered count:', result.items?.length);
```

**Solution:** Adjust filters or check visibility permissions

---

### Issue 7: Version History Empty

**Symptom:** getVersionHistory returns empty array

**Cause:** No archives created for that originalId

**Solution:**
```typescript
// Search for archives with similar originalId
const allArchives = store.getAllArchives();
const matching = allArchives.filter(a => 
  a.content.originalId.includes('report-123')
);
console.log('Matching archives:', matching.length);
matching.forEach(a => {
  console.log(`  ${a.content.originalId} -> ${a.archiveId}`);
});
```

---

## Best Practices

### 1. Choose Appropriate Retention Policies

✅ **DO:**
- Use 7-year retention for compliance documents (legal requirement)
- Use 5-year retention for audit logs (regulatory requirement)
- Use 1-year retention for operational reports (business value)
- Use 90-day retention for temporary exports (cleanup efficiency)

❌ **DON'T:**
- Use short retention for compliance documents (legal risk)
- Use long retention for temporary data (storage waste)
- Mix retention policies across related archives

---

### 2. Apply Legal Holds Judiciously

✅ **DO:**
- Document reason for legal hold
- Review legal holds quarterly
- Remove legal holds when no longer needed
- Coordinate with legal team before applying/removing

❌ **DON'T:**
- Apply legal holds for operational reasons
- Leave legal holds indefinitely without review
- Remove legal holds without legal team approval

---

### 3. Version Archives Appropriately

✅ **DO:**
- Create new version when content changes significantly
- Include change description in version metadata
- Keep version count manageable (archive old versions)

❌ **DON'T:**
- Create new version for minor corrections
- Version archives excessively (storage impact)
- Lose version history (compliance risk)

---

### 4. Tag Archives Consistently

✅ **DO:**
```typescript
metadata: {
  tags: [
    'compliance',        // Category tag
    'q1-2025',          // Time period tag
    'tenant-alpha',     // Scope tag
    'regulatory',       // Type tag
    'sarbanes-oxley'    // Regulation tag
  ]
}
```

❌ **DON'T:**
- Use inconsistent tag formats
- Omit important tags
- Use too many tags (reduces value)

---

### 5. Monitor Archive Growth

✅ **DO:**
```typescript
// Weekly monitoring
const stats = engine.getStatistics();
console.log('Archive metrics:');
console.log(`  Total: ${stats.totalArchives}`);
console.log(`  Storage: ${(stats.totalSizeBytes / 1024 / 1024).toFixed(2)} MB`);
console.log(`  Expiring: ${stats.byRetentionStatus.expiring}`);
console.log(`  Expired: ${stats.byRetentionStatus.expired}`);

// Alert if growth exceeds thresholds
if (stats.totalSizeBytes > 10 * 1024 * 1024 * 1024) {  // 10 GB
  console.warn('Archive storage exceeds 10 GB');
}
```

❌ **DON'T:**
- Ignore storage growth
- Let expired archives accumulate
- Skip retention cleanup

---

## Integration Examples

### Example 1: Archive Report on Generation

```typescript
// In Phase 59 Reporting Engine
async function generateAndArchiveReport(reportData: any) {
  // Generate report
  const report = await reportingEngine.generateReport(reportData);
  
  // Archive report
  const archiveQuery: ArchiveQuery = {
    queryId: `archive-${report.reportId}`,
    queryType: 'create',
    description: `Archive ${report.title}`,
    createData: {
      category: 'reports',
      originalId: report.reportId,
      originalType: 'executive-report',
      data: report,
      format: 'json',
      metadata: {
        title: report.title,
        description: report.description,
        tags: ['auto-archived', report.category],
        sourcePhase: 'Phase 59',
        sourceEngine: 'reportingEngine',
        originalTimestamp: report.generatedAt
      },
      references: {
        reportIds: [report.reportId]
      },
      retentionPolicyId: 'policy-reports-365'
    },
    requestedBy: 'system-auto-archive',
    requestedAt: new Date().toISOString()
  };
  
  await archiveEngine.archiveItem(archiveQuery, systemContext);
}
```

---

### Example 2: Retrieve Archive for Viewing

```typescript
// In UI component
async function viewArchivedReport(archiveId: string) {
  const retrieveQuery: ArchiveQuery = {
    queryId: `view-${Date.now()}`,
    queryType: 'retrieve',
    description: 'View archived report',
    filters: { archiveIds: [archiveId] },
    requestedBy: currentUser.email,
    requestedAt: new Date().toISOString()
  };
  
  const result = await archiveEngine.retrieveArchive(retrieveQuery, userContext);
  
  if (result.success && result.item) {
    // Display report data
    setReportData(result.item.content.data);
    setMetadata(result.item.metadata);
  }
}
```

---

### Example 3: Search Archives by Reference

```typescript
// Find all archives related to a specific audit finding
const listQuery: ArchiveQuery = {
  queryId: `search-${Date.now()}`,
  queryType: 'list',
  description: 'Find archives related to audit finding',
  filters: {
    referenceIds: {
      type: 'auditFindingIds',
      ids: ['audit-finding-2025-001']
    },
    tenantId: 'tenant-alpha'
  },
  requestedBy: 'auditor@company.com',
  requestedAt: new Date().toISOString()
};

const result = await archiveEngine.listArchives(listQuery, policyContext);
console.log(`Found ${result.items?.length} related archives`);
```

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Jan 2026 | Initial release with 11 categories, versioning, retention policies, legal holds |

---

**Phase 61** • Archive Center • Deterministic • Version Control • Retention Compliance • NO Generative AI
