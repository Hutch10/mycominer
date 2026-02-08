# Phase 60 Quick Reference

**Enterprise Export Hub & External Compliance Distribution Center**

---

## Quick Start

### Basic Export Example

```typescript
import { 
  ExportEngine, 
  ExportBuilder, 
  ExportPolicyEngine, 
  ExportLog,
  ExportQuery,
  ExportPolicyContext,
  ExportDataInput 
} from '@/app/exportHub';

// 1. Create engines
const builder = new ExportBuilder();
const policyEngine = new ExportPolicyEngine();
const log = new ExportLog();
const engine = new ExportEngine(builder, policyEngine, log);

// 2. Prepare data (from Phases 50-59)
const data: ExportDataInput = {
  auditFindings: [...],    // Phase 50
  driftEvents: [...],      // Phase 51
  alerts: [...],           // Phase 52
  tasks: [...],            // Phase 53
  operatorMetrics: [...],  // Phase 54
  realTimeSignals: [...],  // Phase 55
  capacityProjections: [...], // Phase 56
  schedules: [...],        // Phase 57
  insights: [...],         // Phase 58
  reports: [...]           // Phase 59
};

// 3. Create export query
const query: ExportQuery = {
  queryId: 'export-001',
  description: 'Compliance pack for Q1 audit',
  scope: {
    tenantId: 'tenant-alpha',
    facilityId: 'facility-1'
  },
  category: 'compliance-pack',
  format: 'html',
  timeRange: {
    start: '2025-01-01T00:00:00Z',
    end: '2025-03-31T23:59:59Z'
  },
  options: {
    includeMetadata: true,
    includeReferences: true,
    includeRawData: false,
    compressOutput: false
  },
  requestedBy: 'auditor@company.com',
  requestedAt: new Date().toISOString()
};

// 4. Create policy context
const policyContext: ExportPolicyContext = {
  userId: 'auditor@company.com',
  userTenantId: 'tenant-alpha',
  permissions: [
    'export:compliance-pack',
    'export:bundle-formats'
  ],
  role: 'auditor'
};

// 5. Execute export
const result = await engine.executeExport(query, data, policyContext);

// 6. Handle result
if (result.success) {
  console.log('Bundle ID:', result.bundle?.bundleId);
  console.log('Sections:', result.bundle?.sections.length);
  console.log('Total Items:', result.metadata.itemsIncluded);
  
  // Download export file
  if (result.exportedContent) {
    const blob = new Blob(
      [result.exportedContent.content as string],
      { type: result.exportedContent.mimeType }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = result.exportedContent.filename;
    a.click();
  }
} else {
  console.error('Export failed:', result.error);
}
```

---

## Common Export Patterns

### Pattern 1: Compliance Pack for Audits

**Use Case:** External auditor needs full compliance bundle  
**Category:** `compliance-pack`  
**Format:** `auditor-package`  
**Required Role:** `auditor`, `executive`, or `admin`

```typescript
const query: ExportQuery = {
  queryId: `compliance-${Date.now()}`,
  description: 'Q1 2025 compliance audit package',
  scope: { tenantId: 'tenant-alpha' },
  category: 'compliance-pack',
  format: 'auditor-package',
  timeRange: {
    start: '2025-01-01T00:00:00Z',
    end: '2025-03-31T23:59:59Z'
  },
  options: {
    includeMetadata: true,
    includeReferences: true,
    includeRawData: true,  // Requires export:raw-data permission
    compressOutput: true
  },
  requestedBy: 'auditor@company.com',
  requestedAt: new Date().toISOString()
};

const policyContext: ExportPolicyContext = {
  userId: 'auditor@company.com',
  userTenantId: 'tenant-alpha',
  permissions: [
    'export:compliance-pack',
    'export:bundle-formats',
    'export:raw-data',
    'export:long-range'
  ],
  role: 'auditor'
};
```

**Output Structure:**
```
tenant-alpha-compliance-pack-Q1-2025/
├── audit-findings/
│   ├── findings.json
│   └── findings.csv
├── drift-logs/
│   ├── drifts.json
│   └── drifts.csv
├── sla-compliance/
│   ├── sla.json
│   └── sla.csv
├── metadata/
│   ├── export-info.json
│   └── README.md
└── index.html
```

---

### Pattern 2: Executive Summary for Board Meeting

**Use Case:** CEO needs strategic insights for quarterly board meeting  
**Category:** `executive-summary`  
**Format:** `html`  
**Required Role:** `executive` or `admin`

```typescript
const query: ExportQuery = {
  queryId: `exec-summary-${Date.now()}`,
  description: 'Q1 2025 executive summary for board',
  scope: { tenantId: 'tenant-alpha' },
  category: 'executive-summary',
  format: 'html',
  timeRange: {
    start: '2025-01-01T00:00:00Z',
    end: '2025-03-31T23:59:59Z'
  },
  options: {
    includeMetadata: true,
    includeReferences: false,
    includeRawData: false,
    compressOutput: false
  },
  requestedBy: 'ceo@company.com',
  requestedAt: new Date().toISOString()
};

const policyContext: ExportPolicyContext = {
  userId: 'ceo@company.com',
  userTenantId: 'tenant-alpha',
  permissions: ['export:executive-view'],
  role: 'executive'
};
```

**Output:** Styled HTML document with insights and reports from Phases 58-59

---

### Pattern 3: Daily Operational Snapshot

**Use Case:** Operations manager needs current operational state  
**Category:** `operational-snapshot`  
**Format:** `json`  
**Required Role:** `manager` or `operator`

```typescript
const now = new Date();
const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

const query: ExportQuery = {
  queryId: `ops-snapshot-${Date.now()}`,
  description: 'Daily operational snapshot',
  scope: {
    tenantId: 'tenant-alpha',
    facilityId: 'facility-1'
  },
  category: 'operational-snapshot',
  format: 'json',
  timeRange: {
    start: yesterday.toISOString(),
    end: now.toISOString()
  },
  options: {
    includeMetadata: true,
    includeReferences: true,
    includeRawData: false,
    compressOutput: false
  },
  requestedBy: 'ops-manager@company.com',
  requestedAt: now.toISOString()
};

const policyContext: ExportPolicyContext = {
  userId: 'ops-manager@company.com',
  userTenantId: 'tenant-alpha',
  permissions: [],
  role: 'manager'
};
```

**Output:** JSON with tasks, alerts, schedules, and capacity from last 24 hours

---

### Pattern 4: Drift Analysis for Engineering

**Use Case:** Engineer needs drift event logs for analysis  
**Category:** `drift-logs`  
**Format:** `csv`  
**Required Role:** Any authenticated user

```typescript
const query: ExportQuery = {
  queryId: `drift-analysis-${Date.now()}`,
  description: 'Drift events for analysis',
  scope: {
    tenantId: 'tenant-alpha',
    facilityId: 'facility-1'
  },
  category: 'drift-logs',
  format: 'csv',
  timeRange: {
    start: '2025-01-01T00:00:00Z',
    end: '2025-01-31T23:59:59Z'
  },
  options: {
    includeMetadata: false,
    includeReferences: false,
    includeRawData: true,
    compressOutput: false
  },
  requestedBy: 'engineer@company.com',
  requestedAt: new Date().toISOString()
};

const policyContext: ExportPolicyContext = {
  userId: 'engineer@company.com',
  userTenantId: 'tenant-alpha',
  permissions: ['export:raw-data'],
  role: 'operator'
};
```

**Output:** CSV with all drift events, ready for Excel/Python analysis

---

### Pattern 5: Capacity Planning Report

**Use Case:** Resource planner needs capacity forecasts  
**Category:** `capacity-forecasts`  
**Format:** `markdown`  
**Required Role:** `manager` or `admin`

```typescript
const now = new Date();
const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

const query: ExportQuery = {
  queryId: `capacity-forecast-${Date.now()}`,
  description: 'Capacity forecasts for next month',
  scope: { tenantId: 'tenant-alpha' },
  category: 'capacity-forecasts',
  format: 'markdown',
  timeRange: {
    start: now.toISOString(),
    end: nextMonth.toISOString()
  },
  options: {
    includeMetadata: true,
    includeReferences: true,
    includeRawData: false,
    compressOutput: false
  },
  requestedBy: 'planner@company.com',
  requestedAt: now.toISOString()
};

const policyContext: ExportPolicyContext = {
  userId: 'planner@company.com',
  userTenantId: 'tenant-alpha',
  permissions: [],
  role: 'manager'
};
```

**Output:** Markdown document with capacity projections, suitable for wikis

---

### Pattern 6: Full Operational Export for Archival

**Use Case:** System admin needs complete operational data backup  
**Category:** `full-operational`  
**Format:** `zip`  
**Required Role:** `admin` or `executive`

```typescript
const query: ExportQuery = {
  queryId: `full-backup-${Date.now()}`,
  description: 'Full operational data backup',
  scope: { tenantId: 'tenant-alpha' },
  category: 'full-operational',
  format: 'zip',
  timeRange: {
    start: '2025-01-01T00:00:00Z',
    end: '2025-12-31T23:59:59Z'
  },
  options: {
    includeMetadata: true,
    includeReferences: true,
    includeRawData: true,
    compressOutput: true
  },
  requestedBy: 'admin@company.com',
  requestedAt: new Date().toISOString()
};

const policyContext: ExportPolicyContext = {
  userId: 'admin@company.com',
  userTenantId: 'tenant-alpha',
  permissions: [
    'export:executive-view',
    'export:bundle-formats',
    'export:raw-data',
    'export:long-range'
  ],
  role: 'admin'
};
```

**Output:** ZIP archive with JSON, CSV, and HTML files for all 10 phases

---

## Format Comparison

| Feature | JSON | CSV | HTML | Markdown | ZIP | Auditor Package |
|---------|------|-----|------|----------|-----|-----------------|
| **Human Readable** | ⚠️ | ✅ | ✅✅ | ✅✅ | ✅✅ | ✅✅ |
| **Machine Readable** | ✅✅ | ✅✅ | ⚠️ | ⚠️ | ✅ | ✅ |
| **Styled Presentation** | ❌ | ❌ | ✅✅ | ⚠️ | ✅✅ | ✅✅ |
| **Excel Compatible** | ⚠️ | ✅✅ | ⚠️ | ❌ | ✅ | ✅ |
| **API Consumption** | ✅✅ | ⚠️ | ❌ | ❌ | ⚠️ | ⚠️ |
| **Printing** | ❌ | ⚠️ | ✅✅ | ⚠️ | ✅ | ✅✅ |
| **Email Sharing** | ⚠️ | ⚠️ | ✅✅ | ✅ | ✅✅ | ✅✅ |
| **Multi-File** | ❌ | ❌ | ❌ | ❌ | ✅✅ | ✅✅ |
| **Structured Folders** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅✅ |
| **File Size** | Medium | Small | Large | Medium | Large | Very Large |
| **Generation Speed** | Fast | Fast | Medium | Medium | Slow* | Slow* |

**Legend:** ✅✅ Excellent • ✅ Good • ⚠️ Limited • ❌ No  
*Requires ZIP library (JSZip) in production

---

## Permission Management

### Permission Reference

| Permission | Purpose | Use Cases |
|------------|---------|-----------|
| `export:cross-tenant` | Access data from other tenants | Multi-tenant dashboards |
| `export:federation-admin` | Access all federation data | Federation administrators |
| `export:federation:{id}` | Access specific federation | Federation members |
| `export:executive-view` | Generate executive exports | Executive summaries |
| `export:compliance-pack` | Generate compliance packs | Audit preparation |
| `export:bundle-formats` | Use ZIP/Auditor Package formats | Multi-file exports |
| `export:raw-data` | Include raw operational data | Deep analysis |
| `export:long-range` | Export data >90 days old | Historical analysis |

### Role-Based Permissions

#### Executive
```typescript
{
  role: 'executive',
  permissions: [
    'export:executive-view',
    'export:compliance-pack',
    'export:bundle-formats',
    'export:long-range'
  ]
}
```

**Can Export:** All categories, all formats

#### Admin
```typescript
{
  role: 'admin',
  permissions: [
    'export:executive-view',
    'export:compliance-pack',
    'export:bundle-formats',
    'export:raw-data',
    'export:long-range'
  ]
}
```

**Can Export:** All categories, all formats, includes raw data

#### Auditor
```typescript
{
  role: 'auditor',
  permissions: [
    'export:compliance-pack',
    'export:bundle-formats',
    'export:raw-data',
    'export:long-range'
  ]
}
```

**Can Export:** Compliance packs, single-phase exports

#### Manager
```typescript
{
  role: 'manager',
  permissions: [
    'export:raw-data'
  ]
}
```

**Can Export:** Operational snapshots, single-phase exports (JSON/CSV/HTML/Markdown)

#### Operator
```typescript
{
  role: 'operator',
  permissions: []
}
```

**Can Export:** Single-phase exports (JSON/CSV/HTML/Markdown only)

---

## Troubleshooting

### Issue 1: Policy Violation - Cross-Tenant Access

**Error:**
```
Export failed: Cross-tenant export access denied
```

**Cause:** User trying to export data from different tenant

**Solution:**
1. Verify user has `export:cross-tenant` OR `export:federation-admin` permission
2. Check `policyContext.userTenantId` matches `query.scope.tenantId`
3. If federation export, verify user has `export:federation-admin` or membership

**Example Fix:**
```typescript
const policyContext: ExportPolicyContext = {
  userId: 'user@company.com',
  userTenantId: 'tenant-alpha',
  permissions: ['export:cross-tenant'],  // Add this
  role: 'manager'
};
```

---

### Issue 2: Executive-Level Export Denied

**Error:**
```
Export failed: Executive-level exports require executive permissions
```

**Cause:** User lacks executive permissions for `executive-summary` or `full-operational`

**Solution:**
1. Change user role to `executive` or `admin`
2. OR grant `export:executive-view` permission
3. OR switch to different export category

**Example Fix:**
```typescript
// Option 1: Change role
const policyContext: ExportPolicyContext = {
  userId: 'user@company.com',
  userTenantId: 'tenant-alpha',
  permissions: [],
  role: 'executive'  // Change from 'manager'
};

// Option 2: Add permission
const policyContext: ExportPolicyContext = {
  userId: 'user@company.com',
  userTenantId: 'tenant-alpha',
  permissions: ['export:executive-view'],  // Add this
  role: 'manager'
};
```

---

### Issue 3: Long-Range Export Denied

**Error:**
```
Export failed: Time range exceeds 90 days. Requires export:long-range permission
```

**Cause:** Time range >90 days without `export:long-range` permission

**Solution:**
1. Grant `export:long-range` permission
2. OR reduce time range to ≤90 days

**Example Fix:**
```typescript
// Option 1: Add permission
const policyContext: ExportPolicyContext = {
  userId: 'user@company.com',
  userTenantId: 'tenant-alpha',
  permissions: ['export:long-range'],  // Add this
  role: 'manager'
};

// Option 2: Reduce time range
const query: ExportQuery = {
  // ... other fields
  timeRange: {
    start: '2025-01-01T00:00:00Z',
    end: '2025-03-31T23:59:59Z'  // 90 days only
  }
};
```

---

### Issue 4: Bundle Format Denied

**Error:**
```
Export failed: Format 'zip' requires export:bundle-formats permission
```

**Cause:** User trying to use ZIP or Auditor Package without permission

**Solution:**
1. Grant `export:bundle-formats` permission
2. OR switch to single-file format (JSON, CSV, HTML, Markdown)

**Example Fix:**
```typescript
// Option 1: Add permission
const policyContext: ExportPolicyContext = {
  userId: 'user@company.com',
  userTenantId: 'tenant-alpha',
  permissions: ['export:bundle-formats'],  // Add this
  role: 'manager'
};

// Option 2: Change format
const query: ExportQuery = {
  // ... other fields
  format: 'html'  // Change from 'zip'
};
```

---

### Issue 5: Empty Export Bundle

**Error:**
```
Export generated but bundle has 0 items
```

**Cause:** No data found matching scope and time range

**Solution:**
1. Check `query.scope.tenantId` and `query.scope.facilityId` are correct
2. Verify `query.timeRange` overlaps with actual data timestamps
3. Confirm data sources (Phases 50-59) contain data

**Example Fix:**
```typescript
// Option 1: Broaden scope
const query: ExportQuery = {
  // ... other fields
  scope: {
    tenantId: 'tenant-alpha'
    // Remove facilityId to include all facilities
  }
};

// Option 2: Expand time range
const query: ExportQuery = {
  // ... other fields
  timeRange: {
    start: '2025-01-01T00:00:00Z',
    end: '2025-12-31T23:59:59Z'  // Full year
  }
};
```

---

### Issue 6: Export Log Shows "Policy Denied"

**Symptom:** Log entry shows `allowed: false` with violations

**Diagnosis:**
```typescript
const log = engine.getLog();
const policyEntries = log.getEntries({ entryType: 'policy-decision' });
const denied = policyEntries.filter(e => !e.decision.allowed);

denied.forEach(entry => {
  console.log('Violations:', entry.decision.violations);
  console.log('Reason:', entry.decision.reason);
});
```

**Solution:** Review violations and adjust permissions accordingly

---

### Issue 7: Large Export Times Out

**Symptom:** Export takes >30 seconds for `full-operational` with 1+ year range

**Solution:**
1. Reduce time range to quarters or months
2. Use single-phase exports instead of `full-operational`
3. Export in JSON (fastest format)
4. Increase server timeout configuration

**Example Fix:**
```typescript
// Option 1: Quarterly exports
const q1Query = { timeRange: { start: '2025-01-01', end: '2025-03-31' } };
const q2Query = { timeRange: { start: '2025-04-01', end: '2025-06-30' } };
// ... etc

// Option 2: Single-phase exports
const complianceQuery = { category: 'compliance-pack' };  // Instead of full-operational
```

---

## Best Practices

### 1. Scope Exports Appropriately

✅ **DO:**
- Use `facilityId` for facility-specific exports
- Use `tenantId` only for tenant-wide exports
- Use `federationId` only for federation aggregates

❌ **DON'T:**
- Export entire federation when facility-level suffices
- Use cross-tenant without business justification
- Omit scope when data contains sensitive tenant info

---

### 2. Choose Format Based on Use Case

✅ **DO:**
- Use **JSON** for API consumption, programmatic processing
- Use **CSV** for Excel analysis, pivot tables, data science
- Use **HTML** for viewing, printing, email sharing
- Use **Markdown** for documentation, GitHub, wikis
- Use **ZIP** for multi-file packages, archival
- Use **Auditor Package** for compliance submissions

❌ **DON'T:**
- Use JSON for non-technical stakeholders
- Use HTML for API endpoints
- Use CSV for documents with complex structure

---

### 3. Set Reasonable Time Ranges

✅ **DO:**
- Use 24 hours for operational snapshots
- Use 30 days for monthly reports
- Use 90 days for quarterly audits
- Use 1 year for annual compliance (with `export:long-range`)

❌ **DON'T:**
- Export 5+ years unless archival requirement
- Use unbounded ranges (always set start/end)
- Overlap time ranges excessively in multiple exports

---

### 4. Include Metadata Selectively

✅ **DO:**
- Set `includeMetadata: true` for compliance, audits
- Set `includeReferences: true` for traceability
- Set `includeRawData: true` for engineering analysis

❌ **DON'T:**
- Include raw data in executive summaries
- Omit metadata in compliance packs
- Include references when not needed (increases size)

---

### 5. Monitor Export Logs

✅ **DO:**
```typescript
// Review export statistics weekly
const stats = engine.getStatistics();
console.log('Exports this week:', stats.totalExports);
console.log('Trend:', stats.trends.exportsChange);
console.log('Top category:', 
  Object.entries(stats.byCategory).sort((a, b) => b[1] - a[1])[0]
);
```

❌ **DON'T:**
- Ignore policy denials (may indicate security issue)
- Ignore export errors (may indicate data quality issue)
- Let logs grow indefinitely (implement retention)

---

## Integration Examples

### Example 1: Scheduled Daily Exports

```typescript
// Cron job: Daily 2am operational snapshot
cron.schedule('0 2 * * *', async () => {
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const now = new Date();
  
  const query: ExportQuery = {
    queryId: `daily-snapshot-${now.toISOString().split('T')[0]}`,
    description: 'Automated daily operational snapshot',
    scope: { tenantId: 'tenant-alpha' },
    category: 'operational-snapshot',
    format: 'json',
    timeRange: {
      start: yesterday.toISOString(),
      end: now.toISOString()
    },
    options: {
      includeMetadata: true,
      includeReferences: true,
      includeRawData: false,
      compressOutput: false
    },
    requestedBy: 'system-cron',
    requestedAt: now.toISOString()
  };
  
  const result = await engine.executeExport(query, data, policyContext);
  
  if (result.success && result.exportedContent) {
    await saveToS3(
      `exports/daily/${result.exportedContent.filename}`,
      result.exportedContent.content
    );
  }
});
```

---

### Example 2: API Endpoint for On-Demand Exports

```typescript
// Express.js API endpoint
app.post('/api/exports', async (req, res) => {
  const { category, format, scope, timeRange } = req.body;
  const user = req.user;  // From auth middleware
  
  const query: ExportQuery = {
    queryId: `api-${Date.now()}`,
    description: `On-demand ${category} export`,
    scope,
    category,
    format,
    timeRange,
    options: {
      includeMetadata: true,
      includeReferences: true,
      includeRawData: false,
      compressOutput: false
    },
    requestedBy: user.email,
    requestedAt: new Date().toISOString()
  };
  
  const policyContext: ExportPolicyContext = {
    userId: user.id,
    userTenantId: user.tenantId,
    permissions: user.permissions,
    role: user.role
  };
  
  const result = await engine.executeExport(query, data, policyContext);
  
  if (result.success && result.exportedContent) {
    res.setHeader('Content-Type', result.exportedContent.mimeType);
    res.setHeader('Content-Disposition', 
      `attachment; filename="${result.exportedContent.filename}"`
    );
    res.send(result.exportedContent.content);
  } else {
    res.status(400).json({ error: result.error });
  }
});
```

---

### Example 3: Webhook Notification on Export

```typescript
// Notify Slack channel when export completes
const result = await engine.executeExport(query, data, policyContext);

if (result.success) {
  await fetch('https://hooks.slack.com/services/YOUR/WEBHOOK/URL', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: `✅ Export complete: ${result.bundle?.title}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Export Complete*\n• Category: ${result.bundle?.category}\n• Format: ${result.bundle?.format}\n• Items: ${result.metadata.itemsIncluded}\n• Size: ${(result.exportedContent?.sizeBytes || 0) / 1024} KB`
          }
        }
      ]
    })
  });
}
```

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Jan 2026 | Initial release with 14 categories, 6 formats, 6 policy rules |

---

**Phase 60** • Export Hub • Deterministic • NO Generative AI • Full Traceability
