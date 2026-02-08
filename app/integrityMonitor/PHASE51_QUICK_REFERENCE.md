# Phase 51: Continuous Integrity Monitor — QUICK REFERENCE

**Deterministic drift detection with baseline comparison. No generative AI. All alerts from real data.**

---

## 🚀 Quick Start

### 1. Initialize Monitor

```typescript
import { MonitorEngine } from '@/app/integrityMonitor';

const monitor = new MonitorEngine('tenant-alpha');
```

### 2. Run Manual Check

```typescript
const check = {
  checkId: 'check-001',
  checkType: 'full-system',
  description: 'Full system integrity check',
  scope: { tenantId: 'tenant-alpha' },
  triggeredBy: 'manual',
  triggeredAt: new Date().toISOString(),
};

const policyContext = {
  tenantId: 'tenant-alpha',
  performedBy: 'user-001',
  userRoles: ['operator'],
  userPermissions: ['monitor.run', 'monitor.full-system'],
};

const result = await monitor.executeCheck(check, policyContext, 'manual');

console.log(`Alerts: ${result.cycle.totalAlerts}`);
```

### 3. Schedule Automated Monitoring

```typescript
const scheduler = monitor.getScheduler();

const schedule = scheduler.createSchedule({
  scheduleId: 'schedule-001',
  frequency: 'daily',
  categories: ['governance-drift', 'compliance-pack-drift'],
  scope: { tenantId: 'tenant-alpha' },
  enabled: true,
  createdBy: 'system',
  createdAt: new Date().toISOString(),
});

await scheduler.startSchedule(schedule.scheduleId, monitor, policyContext);
```

---

## 📋 Check Types

| Check Type | Description | Permission Required |
|-----------|-------------|---------------------|
| `full-system` | Monitor all categories across entire tenant | `monitor.full-system` |
| `facility` | Monitor specific facility | `monitor.facility` + `facility.monitor` |
| `category` | Monitor specific categories | `monitor.category` + category permissions |
| `rule` | Monitor specific rules | `monitor.rule` |

---

## 🎯 Monitoring Categories (9)

1. **governance-drift**: Governance role/status/approval changes
2. **governance-lineage-breakage**: Broken lineage chains
3. **workflow-sop-drift**: Workflow/SOP mismatches
4. **documentation-completeness-drift**: Missing documentation sections
5. **fabric-link-breakage**: Broken fabric links
6. **cross-engine-metadata-mismatch**: Metadata inconsistencies
7. **health-drift**: Metric/timeline misalignment (non-biological)
8. **analytics-pattern-drift**: Pattern baseline drift
9. **compliance-pack-drift**: Missing compliance controls

---

## ⚠️ Severity Levels (5)

- **critical**: Immediate action required (system integrity severely compromised)
- **high**: Action needed soon (significant integrity issue)
- **medium**: Should be addressed (moderate integrity issue)
- **low**: Monitor for trends (minor integrity issue)
- **info**: Informational (no immediate action needed)

---

## ⏰ Frequencies

- **hourly**: Every hour (critical systems)
- **daily**: Once per day (standard monitoring)
- **weekly**: Once per week (stable systems)
- **manual**: On-demand execution

---

## 🔍 Common Usage Patterns

### Pattern 1: Full-System Daily Monitoring

```typescript
const monitor = new MonitorEngine('tenant-alpha');
const scheduler = monitor.getScheduler();

const schedule = scheduler.createSchedule({
  scheduleId: 'daily-full-system',
  frequency: 'daily',
  scope: { tenantId: 'tenant-alpha' },
  enabled: true,
  createdBy: 'system',
  createdAt: new Date().toISOString(),
});

await scheduler.startSchedule(schedule.scheduleId, monitor, policyContext);
```

### Pattern 2: Facility-Specific Hourly Monitoring

```typescript
const check = {
  checkId: 'facility-check',
  checkType: 'facility',
  description: 'Monitor Facility 01',
  scope: { 
    tenantId: 'tenant-alpha',
    facilityId: 'facility-01' 
  },
  triggeredBy: 'manual',
  triggeredAt: new Date().toISOString(),
};

const result = await monitor.executeCheck(check, policyContext, 'hourly');
```

### Pattern 3: Critical Alerts Only

```typescript
const check = {
  checkId: 'critical-only',
  checkType: 'full-system',
  description: 'Monitor critical issues only',
  scope: { tenantId: 'tenant-alpha' },
  severities: ['critical', 'high'],
  options: {
    sortBy: 'severity',
    sortOrder: 'desc',
  },
  triggeredBy: 'manual',
  triggeredAt: new Date().toISOString(),
};

const result = await monitor.executeCheck(check, policyContext, 'manual');
```

### Pattern 4: Governance & Compliance Focus

```typescript
const check = {
  checkId: 'governance-compliance',
  checkType: 'category',
  description: 'Monitor governance and compliance',
  scope: { tenantId: 'tenant-alpha' },
  categories: [
    'governance-drift',
    'governance-lineage-breakage',
    'compliance-pack-drift'
  ],
  triggeredBy: 'manual',
  triggeredAt: new Date().toISOString(),
};

const result = await monitor.executeCheck(check, policyContext, 'manual');
```

### Pattern 5: Query Alerts by Category

```typescript
const log = monitor.getMonitorLog();
const allEntries = log.getAllEntries();

const governanceAlerts = allEntries.filter(entry => 
  entry.entryType === 'alert' && 
  entry.details.alert.category === 'governance-drift'
);

console.log(`Governance drift alerts: ${governanceAlerts.length}`);
```

### Pattern 6: Export Monitoring Log

```typescript
const log = monitor.getMonitorLog();

// Export last 7 days
const startDate = new Date();
startDate.setDate(startDate.getDate() - 7);

const exported = log.exportLog({
  startDate: startDate.toISOString(),
  endDate: new Date().toISOString(),
  entryTypes: ['cycle', 'alert'],
});

fs.writeFileSync('monitor-export.json', JSON.stringify(exported, null, 2));
```

### Pattern 7: View Statistics

```typescript
const stats = monitor.getStatistics();

console.log(`Total Cycles: ${stats.totalCycles}`);
console.log(`Total Alerts: ${stats.totalAlerts}`);
console.log(`Critical Alerts: ${stats.alertsBySeverity.critical}`);
console.log(`Most Common Category: ${stats.mostCommonCategory}`);
```

### Pattern 8: Schedule Management

```typescript
const scheduler = monitor.getScheduler();

// Create schedule
const schedule = scheduler.createSchedule({
  scheduleId: 'hourly-governance',
  frequency: 'hourly',
  categories: ['governance-drift'],
  scope: { tenantId: 'tenant-alpha' },
  enabled: true,
  createdBy: 'system',
  createdAt: new Date().toISOString(),
});

// Start schedule
await scheduler.startSchedule(schedule.scheduleId, monitor, policyContext);

// Check status
const status = scheduler.getSchedule(schedule.scheduleId);
console.log(`Next run: ${status?.nextRun}`);

// Stop schedule
scheduler.stopSchedule(schedule.scheduleId);

// Delete schedule
scheduler.deleteSchedule(schedule.scheduleId);
```

### Pattern 9: Rule-Specific Monitoring

```typescript
const ruleLibrary = monitor.getRuleLibrary();

// Get specific rule
const rule = ruleLibrary.getRule('governance-drift-001');

// Monitor specific rule
const check = {
  checkId: 'rule-check',
  checkType: 'rule',
  description: `Monitor ${rule?.ruleName}`,
  scope: { tenantId: 'tenant-alpha' },
  ruleIds: ['governance-drift-001'],
  triggeredBy: 'manual',
  triggeredAt: new Date().toISOString(),
};

const result = await monitor.executeCheck(check, policyContext, 'manual');
```

### Pattern 10: Monitor Recent Cycles

```typescript
const log = monitor.getMonitorLog();
const recentCycles = log.getRecentEntries(20)
  .filter(entry => entry.entryType === 'cycle');

recentCycles.forEach(entry => {
  if (entry.entryType === 'cycle') {
    const cycle = entry.details.cycle;
    console.log(`Cycle ${cycle.cycleId}: ${cycle.totalAlerts} alerts`);
  }
});
```

---

## 📊 API Reference

### MonitorEngine

```typescript
class MonitorEngine {
  constructor(tenantId: string)
  
  // Main method
  async executeCheck(
    check: MonitorCheck,
    policyContext: MonitorPolicyContext,
    frequency: MonitorFrequency
  ): Promise<MonitorResult>
  
  // Accessors
  getRuleLibrary(): MonitorRuleLibrary
  getScheduler(): MonitorScheduler
  getMonitorLog(): MonitorLog
  getStatistics(): MonitorStatistics
  getPolicyStatistics(): MonitorPolicyStatistics
  
  // Cleanup
  cleanup(): void
}
```

### MonitorRuleLibrary

```typescript
class MonitorRuleLibrary {
  getRule(ruleId: string): MonitorRule | undefined
  getAllRules(): MonitorRule[]
  getRulesByCategory(category: MonitorCategory): MonitorRule[]
  getRulesBySeverity(severity: MonitorSeverity): MonitorRule[]
  getRulesByEngine(engine: string): MonitorRule[]
  getRuleCount(): number
}
```

### MonitorScheduler

```typescript
class MonitorScheduler {
  createSchedule(schedule: MonitorSchedule): MonitorSchedule
  updateSchedule(scheduleId: string, updates: Partial<MonitorSchedule>): MonitorSchedule
  deleteSchedule(scheduleId: string): boolean
  enableSchedule(scheduleId: string): MonitorSchedule
  disableSchedule(scheduleId: string): MonitorSchedule
  
  async startSchedule(scheduleId: string, engine: MonitorEngine, policyContext: MonitorPolicyContext): Promise<void>
  stopSchedule(scheduleId: string): void
  async runScheduleNow(scheduleId: string, engine: MonitorEngine, policyContext: MonitorPolicyContext): Promise<MonitorResult>
  
  getSchedule(scheduleId: string): MonitorSchedule | undefined
  getAllSchedules(): MonitorSchedule[]
  getEnabledSchedules(): MonitorSchedule[]
  getSchedulesByFrequency(frequency: MonitorFrequency): MonitorSchedule[]
  
  cleanup(): void
}
```

### MonitorLog

```typescript
class MonitorLog {
  logCycle(cycle: any, performer: string, success: boolean): void
  logCheck(check: MonitorCheck, performer: string): void
  logAlert(alert: MonitorAlert, performer: string): void
  logEvaluation(ruleId: string, passed: boolean, details: any, performer: string): void
  logError(operation: string, error: Error, performer: string): void
  
  getAllEntries(): MonitorLogEntry[]
  getEntriesByType(entryType: string): MonitorLogEntry[]
  getEntriesInRange(startDate: string, endDate: string): MonitorLogEntry[]
  getEntriesByPerformer(performer: string): MonitorLogEntry[]
  getRecentEntries(count: number): MonitorLogEntry[]
  
  getStatistics(): MonitorStatistics
  
  exportLog(filters?: {
    startDate?: string;
    endDate?: string;
    entryTypes?: string[];
    performer?: string;
    successOnly?: boolean;
  }): { entries: MonitorLogEntry[]; metadata: any }
  
  clearOldEntries(daysToKeep: number): number
  clearAll(): void
}
```

### MonitorPolicyEngine

```typescript
class MonitorPolicyEngine {
  authorizeCheck(
    check: MonitorCheck,
    policyContext: MonitorPolicyContext
  ): MonitorPolicyDecision
  
  getPolicyLog(): MonitorLogEntry[]
  getPolicyStatistics(): MonitorPolicyStatistics
}
```

---

## 🔒 Required Permissions

### Global Permissions

- `monitor.run` — Required for all monitoring operations
- `monitor.full-system` — Run full-system checks
- `monitor.facility` — Run facility checks
- `monitor.category` — Run category checks
- `monitor.rule` — Run rule checks
- `monitor.schedule` — Create/manage schedules
- `monitor.federated` — Monitor across federated tenants

### Scope Permissions

- `facility.monitor` — Monitor specific facility
- `room.monitor` — Monitor specific room

### Category Permissions

- `monitor.governance-drift`
- `monitor.governance-lineage-breakage`
- `monitor.workflow-sop-drift`
- `monitor.documentation-completeness-drift`
- `monitor.fabric-link-breakage`
- `monitor.cross-engine-metadata-mismatch`
- `monitor.health-drift`
- `monitor.analytics-pattern-drift`
- `monitor.compliance-pack-drift`

---

## 🛠️ Troubleshooting

### Issue: "Permission denied"

**Solution**: Ensure `policyContext.userPermissions` includes:
1. `monitor.run`
2. Check-type permission (`monitor.full-system`, `monitor.facility`, etc.)
3. Category permissions for each monitored category
4. Scope permissions (`facility.monitor`, `room.monitor`) if applicable

### Issue: "Tenant isolation violation"

**Solution**: Ensure `check.scope.tenantId` matches `policyContext.tenantId`.

### Issue: "Schedule not executing"

**Solution**:
1. Verify schedule is enabled: `scheduler.enableSchedule(scheduleId)`
2. Check schedule was started: `scheduler.startSchedule(scheduleId, engine, policyContext)`
3. Verify `nextRun` is set: `scheduler.getSchedule(scheduleId)`

### Issue: "No alerts generated"

**Possible causes**:
1. System is healthy (no drift detected) ✅
2. Baseline not set (all rules compare to baselines)
3. Rules filtered out by severity/category constraints
4. Suppressed alerts excluded (check `options.includeSuppressed`)

### Issue: "Too many alerts"

**Solution**: Filter by severity and category:

```typescript
const check = {
  checkId: 'filtered-check',
  checkType: 'full-system',
  description: 'Critical and high alerts only',
  scope: { tenantId: 'tenant-alpha' },
  severities: ['critical', 'high'],
  options: {
    maxAlerts: 50,
    sortBy: 'severity',
    sortOrder: 'desc',
  },
  triggeredBy: 'manual',
  triggeredAt: new Date().toISOString(),
};
```

### Issue: "Memory leak with schedules"

**Solution**: Always cleanup when done:

```typescript
// Before app shutdown or component unmount
monitor.cleanup();
```

---

## 📈 Best Practices

1. **Start with Manual Checks**: Test monitoring scope before scheduling
2. **Use Category Filters**: Focus on specific system areas first
3. **Monitor Critical Systems Hourly**: Governance, compliance, fabric links
4. **Monitor Stable Systems Weekly**: Documentation, analytics patterns
5. **Export Logs Regularly**: Archive for compliance and trend analysis
6. **Review Statistics Daily**: Track alert trends and common categories
7. **Set Baselines Carefully**: All drift detection depends on accurate baselines
8. **Suppress False Positives**: Keep alert noise low for operators
9. **Cleanup Old Logs**: Retain 90 days by default, archive older entries
10. **Test Policy Context**: Ensure permissions are correct before production

---

## 🔗 Cross-Engine Integration

Monitor alerts link to related systems:

- **Phase 37**: Explain This Alert (explanation engine)
- **Phase 38**: Open Related Incident (incident tracker)
- **Phase 39**: Open Related Pattern (pattern recognition)
- **Phase 40**: Open Training Module (training system)
- **Phase 44**: Open Governance Decision (governance system)
- **Phase 45**: Open Governance Lineage (lineage system)
- **Phase 46**: Open Fabric Links (knowledge fabric)
- **Phase 47**: Open Documentation Bundle (documentation bundler)
- **Phase 48**: Open Intelligence Hub Result (intelligence hub)
- **Phase 49**: Open Simulation Scenario (simulation engine)
- **Phase 50**: Open Audit Result (autonomous auditor)

---

## ✅ Quick Checklist

- [ ] Initialize MonitorEngine with tenant ID
- [ ] Create MonitorCheck with scope and categories
- [ ] Build MonitorPolicyContext with permissions
- [ ] Execute check or create schedule
- [ ] Review MonitorResult for alerts
- [ ] Inspect MonitorAlert details and evidence
- [ ] Query statistics for trends
- [ ] Export logs for compliance
- [ ] Cleanup schedules when done

---

**Phase 51: Continuous Integrity Monitor**

*Deterministic drift detection. Baseline comparison only. No generative AI. All alerts from real data.*

🛡️ Monitor. Detect. Alert. Remediate.
