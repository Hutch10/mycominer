# Phase 59: Enterprise Reporting & Compliance Pack Generator - Quick Reference

**Deterministic report generation from real operational data**

---

## Quick Start

### 1. Generate a Report

```typescript
import { ReportingEngine, ReportQuery, ReportingPolicyContext, ReportingDataInput } from '@/app/enterpriseReporting';

// Initialize engine
const engine = new ReportingEngine();

// Prepare query
const query: ReportQuery = {
  queryId: `query-${Date.now()}`,
  description: 'Monthly executive summary report',
  scope: {
    tenantId: 'tenant-alpha',
    facilityId: 'facility-1',
  },
  category: 'executive-summary',  // 9 categories available
  timePeriod: 'monthly',          // daily, weekly, monthly, quarterly, custom
  format: 'markdown',             // json, markdown, html, csv
  includeSummary: true,
  includeDetails: true,
  includeRecommendations: true,
  includeReferences: true,
  includeMetadata: true,
  requestedBy: 'user-123',
  requestedAt: new Date().toISOString(),
};

// Set context
const context: ReportingPolicyContext = {
  userId: 'user-123',
  userTenantId: 'tenant-alpha',
  permissions: ['reporting:executive-view'],
  role: 'executive',
};

// Prepare data (from Phases 50-58)
const data: ReportingDataInput = {
  tasks: [...],              // Phase 53
  alerts: [...],             // Phase 52
  driftEvents: [...],        // Phase 51
  auditFindings: [...],      // Phase 50
  operatorMetrics: [...],    // Phase 54
  realTimeSignals: [...],    // Phase 55
  capacityProjections: [...],// Phase 56
  schedules: [...],          // Phase 57
};

// Execute
const result = engine.executeQuery(query, context, data);

if (result.success) {
  console.log('Report generated:', result.bundle?.title);
  console.log('Sections:', result.bundle?.sections.length);
  
  // Download exported content
  if (result.exportedContent) {
    const blob = new Blob([result.exportedContent.content]);
    // ... trigger download
  }
}
```

---

## Report Categories

### 1. Executive Summary
**Use Case:** C-level overview report  
**Includes:** KPIs, risk assessment, capacity overview  
**Permission:** `reporting:executive-view` OR role=`executive`/`admin`

```typescript
const query: ReportQuery = {
  // ...
  category: 'executive-summary',
  timePeriod: 'monthly',
};
```

### 2. SLA Compliance
**Use Case:** SLA tracking and compliance  
**Includes:** Task SLA, alert SLA, schedule SLA compliance  
**Permission:** None (tenant-level access)

```typescript
const query: ReportQuery = {
  // ...
  category: 'sla-compliance',
  timePeriod: 'weekly',
};
```

### 3. Capacity & Scheduling
**Use Case:** Resource planning and optimization  
**Includes:** Capacity projections, scheduling efficiency, conflicts  
**Permission:** None (tenant-level access)

```typescript
const query: ReportQuery = {
  // ...
  category: 'capacity-scheduling',
  timePeriod: 'monthly',
};
```

### 4. Operator Performance
**Use Case:** Workforce analytics  
**Includes:** Top performers, utilization distribution, workload metrics  
**Permission:** None (tenant-level access)

```typescript
const query: ReportQuery = {
  // ...
  category: 'operator-performance',
  timePeriod: 'monthly',
};
```

### 5. Risk & Drift
**Use Case:** Risk assessment and integrity monitoring  
**Includes:** Drift events, audit findings, integrity scores  
**Permission:** None (tenant-level access)

```typescript
const query: ReportQuery = {
  // ...
  category: 'risk-drift',
  timePeriod: 'weekly',
};
```

### 6. Audit & Governance
**Use Case:** Compliance reporting  
**Includes:** Audit findings by severity/category, compliance rates  
**Permission:** None (tenant-level access)

```typescript
const query: ReportQuery = {
  // ...
  category: 'audit-governance',
  timePeriod: 'quarterly',
};
```

### 7. Documentation Completeness
**Use Case:** Documentation status  
**Includes:** Completeness metrics, missing documents  
**Permission:** None (tenant-level access)

```typescript
const query: ReportQuery = {
  // ...
  category: 'documentation-completeness',
  timePeriod: 'monthly',
};
```

### 8. Cross-Engine Operational
**Use Case:** Multi-system operational view  
**Includes:** Metrics from all engines (Phases 50-57)  
**Permission:** `reporting:executive-view` OR role=`executive`/`admin`

```typescript
const query: ReportQuery = {
  // ...
  category: 'cross-engine-operational',
  timePeriod: 'daily',
};
```

### 9. Compliance Pack
**Use Case:** Full compliance bundle (Phase 32 integration)  
**Includes:** SLA, audit, governance, documentation, risk reports combined  
**Permission:** `reporting:compliance-pack` OR role=`auditor`/`executive`/`admin`

```typescript
const query: ReportQuery = {
  // ...
  category: 'compliance-pack',
  timePeriod: 'monthly',
};
```

---

## Export Formats

### JSON (Structured Data)
```typescript
query.format = 'json';
// Result: Complete report bundle as JSON
```

### Markdown (Documentation)
```typescript
query.format = 'markdown';
// Result: .md file with sections, tables, metrics
```

### HTML (Web View)
```typescript
query.format = 'html';
// Result: Styled HTML document with tables and sections
```

### CSV (Tabular Data)
```typescript
query.format = 'csv';
// Result: Metrics extracted as CSV (Section, Metric, Value)
```

---

## Policy Permissions

### Required Permissions

| Action | Permission | Default Roles |
|--------|------------|---------------|
| Generate any report | (none) | All roles (own tenant) |
| Cross-tenant reports | `reporting:cross-tenant-read` | Admin only |
| Executive reports | `reporting:executive-view` | Executive, Admin |
| Compliance packs | `reporting:compliance-pack` | Auditor, Executive, Admin |
| >90 day reports | `reporting:long-range-reports` | Executive, Admin |
| Federation reports | `reporting:federation-admin` | Admin only |

### Role Defaults

```typescript
const rolePermissions = {
  executive: [
    'reporting:executive-view',
    'reporting:cross-tenant-read',
    'reporting:long-range-reports',
    'reporting:compliance-pack',
  ],
  admin: [
    'reporting:executive-view',
    'reporting:cross-tenant-read',
    'reporting:federation-admin',
    'reporting:long-range-reports',
    'reporting:compliance-pack',
  ],
  auditor: [
    'reporting:compliance-pack',
  ],
  manager: [],
  operator: [],
};
```

---

## Common Patterns

### Pattern 1: Monthly Executive Report

```typescript
const query: ReportQuery = {
  queryId: 'exec-monthly-' + Date.now(),
  description: 'Monthly executive summary for board meeting',
  scope: { tenantId: 'tenant-alpha' },
  category: 'executive-summary',
  timePeriod: 'monthly',
  format: 'markdown',
  includeSummary: true,
  includeDetails: true,
  includeRecommendations: true,
  includeReferences: true,
  includeMetadata: true,
  requestedBy: 'ceo-user',
  requestedAt: new Date().toISOString(),
};

const context: ReportingPolicyContext = {
  userId: 'ceo-user',
  userTenantId: 'tenant-alpha',
  permissions: ['reporting:executive-view'],
  role: 'executive',
};
```

### Pattern 2: Quarterly Compliance Pack

```typescript
const query: ReportQuery = {
  queryId: 'compliance-q1-' + Date.now(),
  description: 'Q1 compliance pack for audit',
  scope: { tenantId: 'tenant-alpha' },
  category: 'compliance-pack',
  timePeriod: 'quarterly',
  format: 'html',
  includeSummary: true,
  includeDetails: true,
  includeRecommendations: true,
  includeReferences: true,
  includeMetadata: true,
  requestedBy: 'auditor-user',
  requestedAt: new Date().toISOString(),
};

const context: ReportingPolicyContext = {
  userId: 'auditor-user',
  userTenantId: 'tenant-alpha',
  permissions: ['reporting:compliance-pack'],
  role: 'auditor',
};
```

### Pattern 3: Weekly SLA Report

```typescript
const query: ReportQuery = {
  queryId: 'sla-weekly-' + Date.now(),
  description: 'Weekly SLA compliance report',
  scope: {
    tenantId: 'tenant-alpha',
    facilityId: 'facility-1',
  },
  category: 'sla-compliance',
  timePeriod: 'weekly',
  format: 'csv',  // Easy to import into Excel
  includeSummary: true,
  includeDetails: true,
  includeRecommendations: false,
  includeReferences: false,
  includeMetadata: false,
  requestedBy: 'manager-user',
  requestedAt: new Date().toISOString(),
};
```

### Pattern 4: Custom Date Range Report

```typescript
const query: ReportQuery = {
  queryId: 'custom-range-' + Date.now(),
  description: 'Custom period operator performance',
  scope: { tenantId: 'tenant-alpha' },
  category: 'operator-performance',
  timePeriod: 'custom',
  customTimeRange: {
    start: '2024-01-01T00:00:00Z',
    end: '2024-01-15T23:59:59Z',
  },
  format: 'markdown',
  includeSummary: true,
  includeDetails: true,
  includeRecommendations: true,
  includeReferences: true,
  includeMetadata: true,
  requestedBy: 'hr-user',
  requestedAt: new Date().toISOString(),
};
```

---

## Report Structure

### Report Bundle

```typescript
{
  bundleId: string;
  reportId: string;
  title: string;
  category: ReportCategory;
  timePeriod: ReportTimePeriod;
  periodStart: string;
  periodEnd: string;
  scope: { tenantId?, facilityId?, federationId? };
  
  // Content
  sections: ReportSection[];
  
  // Always included
  executiveSummary: {
    overview: string;
    keyFindings: string[];
    criticalIssues: string[];
    recommendations: string[];
  };
  
  // References to source data
  references: {
    insightIds: string[];       // Phase 58
    metricIds: string[];        // Phase 54
    signalIds: string[];        // Phase 55
    projectionIds: string[];    // Phase 56
    scheduleIds: string[];      // Phase 57
    taskIds: string[];          // Phase 53
    alertIds: string[];         // Phase 52
    driftIds: string[];         // Phase 51
    auditFindingIds: string[];  // Phase 50
  };
  
  // Metadata
  metadata: {
    generatedAt: string;
    generatedBy: string;
    format: ReportFormat;
    pageCount?: number;
    wordCount?: number;
    dataSourcesUsed: string[];
    computationTimeMs: number;
  };
}
```

### Report Section

```typescript
{
  sectionId: string;
  title: string;
  sectionType: 
    | 'executive-summary'
    | 'kpi-overview'
    | 'detailed-metrics'
    | 'trend-analysis'
    | 'compliance-status'
    | 'risk-assessment'
    | 'recommendations'
    | 'references';
  
  content: {
    summary?: string;
    metrics?: Record<string, number | string>;
    tables?: ReportTable[];
    charts?: ReportChart[];  // Future: visualization data
    text?: string;
  };
  
  dataSources: string[];  // ["Phase 53: Tasks", ...]
  computedAt: string;
}
```

---

## Log & Statistics

### Query Log

```typescript
// Get recent reports
const entries = engine.getLog().getLatestEntries(50);

// Filter by tenant
const tenantReports = engine.getLog().getEntries({
  entryType: 'report-generated',
  tenantId: 'tenant-alpha',
  startDate: '2024-01-01T00:00:00Z',
  endDate: '2024-01-31T23:59:59Z',
});

// Get statistics
const stats = engine.getStatistics();
console.log(`Total reports: ${stats.totalReports}`);
console.log(`24h change: ${stats.trends.reportsChange}`);
```

### Export Logs

```typescript
// JSON export
const json = engine.getLog().exportToJSON({
  entryType: 'report-generated',
  tenantId: 'tenant-alpha',
});

// CSV export
const csv = engine.getLog().exportToCSV({
  startDate: '2024-01-01T00:00:00Z',
  endDate: '2024-01-31T23:59:59Z',
});
```

---

## Troubleshooting

### Issue: "Cross-tenant report access denied"

**Cause:** User trying to generate report for different tenant  
**Solution:** Add `reporting:cross-tenant-read` permission OR restrict scope to user's tenant

```typescript
// Fix 1: Add permission
context.permissions.push('reporting:cross-tenant-read');

// Fix 2: Restrict scope
query.scope = { tenantId: context.userTenantId };
```

---

### Issue: "Executive-level reports require executive permissions"

**Cause:** User lacks permission for executive/cross-engine reports  
**Solution:** Add executive role or `reporting:executive-view` permission

```typescript
// Fix 1: Use executive role
context.role = 'executive';

// Fix 2: Add permission
context.permissions.push('reporting:executive-view');

// Fix 3: Use non-executive report category
query.category = 'sla-compliance';  // Instead of 'executive-summary'
```

---

### Issue: "Compliance pack generation requires auditor role"

**Cause:** User lacks permission for compliance packs  
**Solution:** Add auditor/executive/admin role OR `reporting:compliance-pack` permission

```typescript
// Fix 1: Use auditor role
context.role = 'auditor';

// Fix 2: Add permission
context.permissions.push('reporting:compliance-pack');
```

---

### Issue: "Time period exceeds 90 days"

**Cause:** Quarterly or custom range >90 days without permission  
**Solution:** Add `reporting:long-range-reports` permission OR reduce period

```typescript
// Fix 1: Add permission
context.permissions.push('reporting:long-range-reports');

// Fix 2: Reduce period
query.timePeriod = 'monthly';  // Instead of 'quarterly'
```

---

### Issue: "Report generation failed"

**Cause:** Missing data or invalid scope  
**Solution:** Check data input and scope validity

```typescript
// Verify data exists
console.log('Tasks:', data.tasks?.length || 0);
console.log('Alerts:', data.alerts?.length || 0);
console.log('Operators:', data.operatorMetrics?.length || 0);

// Check scope
console.log('Scope:', query.scope);

// Review log
const errors = engine.getLog().getEntries({ entryType: 'error' });
console.log('Recent errors:', errors);
```

---

## Integration Examples

### React Hook

```typescript
import { useState, useCallback } from 'react';
import { ReportingEngine } from '@/app/enterpriseReporting';

export function useReportGeneration() {
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  const engine = useMemo(() => new ReportingEngine(), []);
  
  const generateReport = useCallback(async (query, context) => {
    setGenerating(true);
    setError(null);
    
    try {
      // Fetch data from APIs (Phases 50-58)
      const data = await fetchOperationalData(query.scope);
      
      const result = engine.executeQuery(query, context, data);
      
      if (result.success) {
        setResult(result);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  }, [engine]);
  
  return { generateReport, generating, result, error };
}
```

### API Endpoint (Next.js)

```typescript
// app/api/reports/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ReportingEngine } from '@/app/enterpriseReporting';

export async function POST(req: NextRequest) {
  const { query, context, data } = await req.json();
  
  const engine = new ReportingEngine();
  const result = engine.executeQuery(query, context, data);
  
  return NextResponse.json(result);
}
```

---

## Best Practices

### ✅ DO

- Always provide `requestedBy` and `requestedAt` for audit trail
- Use specific scope (tenantId, facilityId) for accurate reports
- Choose appropriate time period (don't use quarterly for daily operations)
- Check `result.success` before accessing bundle
- Export to appropriate format (markdown for docs, CSV for analysis, HTML for sharing)
- Review policy violations in logs for security monitoring
- Generate compliance packs quarterly for audit readiness

### ❌ DON'T

- Don't generate reports without proper permissions (will fail policy check)
- Don't request all report categories when only one is needed
- Don't use >90 day periods for operational dashboards (use quarterly sparingly)
- Don't skip error handling (policy violations and generation failures occur)
- Don't modify report bundles (read-only)
- Don't bypass policy engine (all reports must go through executeQuery)

---

## Quick Reference Card

| Category | Time Period | Format | Use Case | Permission |
|----------|-------------|--------|----------|------------|
| `executive-summary` | monthly | markdown | Board meetings | Executive |
| `sla-compliance` | weekly | csv | SLA tracking | Manager |
| `capacity-scheduling` | monthly | markdown | Resource planning | Manager |
| `operator-performance` | monthly | html | HR reviews | Manager |
| `risk-drift` | weekly | markdown | Risk assessment | Manager |
| `audit-governance` | quarterly | html | Compliance reviews | Auditor |
| `documentation-completeness` | monthly | markdown | Doc audits | Manager |
| `cross-engine-operational` | daily | json | System monitoring | Executive |
| `compliance-pack` | quarterly | html | Audit readiness | Auditor |

---

**Phase 59 Complete** • Deterministic reporting from real data • NO generative AI • Full traceability
