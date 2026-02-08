/**
 * Phase 51: Continuous Integrity Monitor - Rule Library
 * 
 * Static, deterministic monitoring rules for drift and anomaly detection.
 */

import type { MonitorRule, MonitorCategory, MonitorSeverity } from './monitorTypes';

// ============================================================================
// MONITOR RULE LIBRARY
// ============================================================================

export class MonitorRuleLibrary {
  private tenantId: string;
  private rules: Map<string, MonitorRule> = new Map();

  constructor(tenantId: string) {
    this.tenantId = tenantId;
    this.initializeRules();
  }

  // ==========================================================================
  // INITIALIZATION
  // ==========================================================================

  private initializeRules(): void {
    const rules: MonitorRule[] = [
      // ====================================================================
      // GOVERNANCE DRIFT (3 rules)
      // ====================================================================
      {
        ruleId: 'governance-drift-001',
        ruleName: 'Governance Role Must Match Approved Lineage',
        ruleDescription: 'Governance decision roles must match the last approved lineage snapshot',
        category: 'governance-drift',
        severity: 'high',
        condition: {
          field: 'governanceDecision.assignedRoles',
          operator: 'drift-detected',
        },
        remediation: {
          description: 'Reconcile governance roles with approved lineage',
          actionType: 'governance-reconciliation',
          targetEngine: 'governance',
          estimatedEffort: 'medium',
        },
        metadata: {
          sourceEngine: 'governance',
          tags: ['governance', 'drift', 'roles'],
          enabled: true,
          createdAt: '2026-01-20T00:00:00Z',
          updatedAt: '2026-01-20T00:00:00Z',
        },
      },
      {
        ruleId: 'governance-drift-002',
        ruleName: 'Governance Decision Status Must Be Stable',
        ruleDescription: 'Approved governance decisions should not change status unexpectedly',
        category: 'governance-drift',
        severity: 'critical',
        condition: {
          field: 'governanceDecision.status',
          operator: 'changed-from',
          value: 'approved',
        },
        remediation: {
          description: 'Investigate unexpected status change and restore if necessary',
          actionType: 'governance-investigation',
          targetEngine: 'governance',
          estimatedEffort: 'high',
        },
        metadata: {
          sourceEngine: 'governance',
          tags: ['governance', 'drift', 'status'],
          enabled: true,
          createdAt: '2026-01-20T00:00:00Z',
          updatedAt: '2026-01-20T00:00:00Z',
        },
      },
      {
        ruleId: 'governance-drift-003',
        ruleName: 'Governance Approval Must Remain Valid',
        ruleDescription: 'Governance decision approvals must not be removed or modified',
        category: 'governance-drift',
        severity: 'critical',
        condition: {
          field: 'governanceDecision.approvedBy',
          operator: 'drift-detected',
        },
        remediation: {
          description: 'Restore original approval or obtain new approval',
          actionType: 'governance-restoration',
          targetEngine: 'governance',
          estimatedEffort: 'high',
        },
        metadata: {
          sourceEngine: 'governance',
          tags: ['governance', 'drift', 'approval'],
          enabled: true,
          createdAt: '2026-01-20T00:00:00Z',
          updatedAt: '2026-01-20T00:00:00Z',
        },
      },

      // ====================================================================
      // GOVERNANCE LINEAGE BREAKAGE (2 rules)
      // ====================================================================
      {
        ruleId: 'governance-lineage-breakage-001',
        ruleName: 'Governance Lineage Chain Must Be Intact',
        ruleDescription: 'Governance lineage chains must not have missing or broken links',
        category: 'governance-lineage-breakage',
        severity: 'high',
        condition: {
          field: 'governanceLineage.chain',
          operator: 'drift-detected',
        },
        remediation: {
          description: 'Rebuild lineage chain from governance history',
          actionType: 'lineage-rebuild',
          targetEngine: 'governance-history',
          estimatedEffort: 'medium',
        },
        metadata: {
          sourceEngine: 'governance-history',
          tags: ['governance', 'lineage', 'breakage'],
          enabled: true,
          createdAt: '2026-01-20T00:00:00Z',
          updatedAt: '2026-01-20T00:00:00Z',
        },
      },
      {
        ruleId: 'governance-lineage-breakage-002',
        ruleName: 'Governance Lineage References Must Resolve',
        ruleDescription: 'All references in governance lineage must resolve to valid entities',
        category: 'governance-lineage-breakage',
        severity: 'high',
        condition: {
          field: 'governanceLineage.references',
          operator: 'resolved',
        },
        remediation: {
          description: 'Fix or remove broken lineage references',
          actionType: 'lineage-reference-fix',
          targetEngine: 'governance-history',
          estimatedEffort: 'medium',
        },
        metadata: {
          sourceEngine: 'governance-history',
          tags: ['governance', 'lineage', 'references'],
          enabled: true,
          createdAt: '2026-01-20T00:00:00Z',
          updatedAt: '2026-01-20T00:00:00Z',
        },
      },

      // ====================================================================
      // WORKFLOW/SOP DRIFT (3 rules)
      // ====================================================================
      {
        ruleId: 'workflow-sop-drift-001',
        ruleName: 'Workflow SOP Reference Must Be Stable',
        ruleDescription: 'Workflow SOP references should not change unexpectedly',
        category: 'workflow-sop-drift',
        severity: 'medium',
        condition: {
          field: 'workflow.sopReferences',
          operator: 'drift-detected',
        },
        remediation: {
          description: 'Verify SOP reference change is intentional',
          actionType: 'workflow-verification',
          targetEngine: 'workflow',
          estimatedEffort: 'low',
        },
        metadata: {
          sourceEngine: 'workflow',
          tags: ['workflow', 'sop', 'drift'],
          enabled: true,
          createdAt: '2026-01-20T00:00:00Z',
          updatedAt: '2026-01-20T00:00:00Z',
        },
      },
      {
        ruleId: 'workflow-sop-drift-002',
        ruleName: 'Workflow Steps Must Match SOP Procedures',
        ruleDescription: 'Workflow steps must continue to align with SOP procedures',
        category: 'workflow-sop-drift',
        severity: 'medium',
        condition: {
          field: 'workflowStep.sopProcedureId',
          operator: 'drift-detected',
        },
        remediation: {
          description: 'Realign workflow steps with SOP procedures',
          actionType: 'workflow-realignment',
          targetEngine: 'workflow',
          estimatedEffort: 'medium',
        },
        metadata: {
          sourceEngine: 'workflow',
          tags: ['workflow', 'sop', 'steps'],
          enabled: true,
          createdAt: '2026-01-20T00:00:00Z',
          updatedAt: '2026-01-20T00:00:00Z',
        },
      },
      {
        ruleId: 'workflow-sop-drift-003',
        ruleName: 'Workflow Resources Must Remain Valid',
        ruleDescription: 'Workflow resource references must not break or drift',
        category: 'workflow-sop-drift',
        severity: 'high',
        condition: {
          field: 'workflow.resources',
          operator: 'resolved',
        },
        remediation: {
          description: 'Fix broken resource references',
          actionType: 'workflow-resource-fix',
          targetEngine: 'workflow',
          estimatedEffort: 'medium',
        },
        metadata: {
          sourceEngine: 'workflow',
          tags: ['workflow', 'resources', 'drift'],
          enabled: true,
          createdAt: '2026-01-20T00:00:00Z',
          updatedAt: '2026-01-20T00:00:00Z',
        },
      },

      // ====================================================================
      // DOCUMENTATION COMPLETENESS DRIFT (2 rules)
      // ====================================================================
      {
        ruleId: 'documentation-completeness-drift-001',
        ruleName: 'Documentation Bundle Must Remain Complete',
        ruleDescription: 'Documentation bundles must not lose required sections',
        category: 'documentation-completeness-drift',
        severity: 'high',
        condition: {
          field: 'documentationBundle.requiredSections',
          operator: 'drift-detected',
        },
        remediation: {
          description: 'Restore missing documentation sections',
          actionType: 'documentation-restoration',
          targetEngine: 'documentation',
          estimatedEffort: 'medium',
        },
        metadata: {
          sourceEngine: 'documentation',
          tags: ['documentation', 'completeness', 'drift'],
          enabled: true,
          createdAt: '2026-01-20T00:00:00Z',
          updatedAt: '2026-01-20T00:00:00Z',
        },
      },
      {
        ruleId: 'documentation-completeness-drift-002',
        ruleName: 'Documentation SOP References Must Be Stable',
        ruleDescription: 'Documentation SOP references should not change or break',
        category: 'documentation-completeness-drift',
        severity: 'medium',
        condition: {
          field: 'documentation.sopReferences',
          operator: 'drift-detected',
        },
        remediation: {
          description: 'Verify or restore SOP references',
          actionType: 'documentation-sop-fix',
          targetEngine: 'documentation',
          estimatedEffort: 'low',
        },
        metadata: {
          sourceEngine: 'documentation',
          tags: ['documentation', 'sop', 'references'],
          enabled: true,
          createdAt: '2026-01-20T00:00:00Z',
          updatedAt: '2026-01-20T00:00:00Z',
        },
      },

      // ====================================================================
      // FABRIC LINK BREAKAGE (2 rules)
      // ====================================================================
      {
        ruleId: 'fabric-link-breakage-001',
        ruleName: 'Fabric Links Must Continue to Resolve',
        ruleDescription: 'Fabric links must resolve to valid entities continuously',
        category: 'fabric-link-breakage',
        severity: 'high',
        condition: {
          field: 'fabricLink.targetEntity',
          operator: 'resolved',
        },
        remediation: {
          description: 'Fix or remove broken fabric links',
          actionType: 'fabric-link-fix',
          targetEngine: 'fabric',
          estimatedEffort: 'medium',
        },
        metadata: {
          sourceEngine: 'fabric',
          tags: ['fabric', 'links', 'breakage'],
          enabled: true,
          createdAt: '2026-01-20T00:00:00Z',
          updatedAt: '2026-01-20T00:00:00Z',
        },
      },
      {
        ruleId: 'fabric-link-breakage-002',
        ruleName: 'Fabric Bidirectional Links Must Remain Intact',
        ruleDescription: 'Bidirectional fabric links must not drift or break',
        category: 'fabric-link-breakage',
        severity: 'medium',
        condition: {
          field: 'fabricLink.bidirectional',
          operator: 'drift-detected',
        },
        remediation: {
          description: 'Restore bidirectional link integrity',
          actionType: 'fabric-link-restoration',
          targetEngine: 'fabric',
          estimatedEffort: 'low',
        },
        metadata: {
          sourceEngine: 'fabric',
          tags: ['fabric', 'links', 'bidirectional'],
          enabled: true,
          createdAt: '2026-01-20T00:00:00Z',
          updatedAt: '2026-01-20T00:00:00Z',
        },
      },

      // ====================================================================
      // CROSS-ENGINE METADATA MISMATCH (2 rules)
      // ====================================================================
      {
        ruleId: 'cross-engine-metadata-mismatch-001',
        ruleName: 'Cross-Engine Metadata Must Stay Consistent',
        ruleDescription: 'Metadata must remain consistent across all engines',
        category: 'cross-engine-metadata-mismatch',
        severity: 'medium',
        condition: {
          field: 'entity.metadata.consistency',
          operator: 'drift-detected',
        },
        remediation: {
          description: 'Reconcile metadata across engines',
          actionType: 'metadata-reconciliation',
          targetEngine: 'intelligence-hub',
          estimatedEffort: 'medium',
        },
        metadata: {
          sourceEngine: 'intelligence-hub',
          tags: ['cross-engine', 'metadata', 'mismatch'],
          enabled: true,
          createdAt: '2026-01-20T00:00:00Z',
          updatedAt: '2026-01-20T00:00:00Z',
        },
      },
      {
        ruleId: 'cross-engine-metadata-mismatch-002',
        ruleName: 'Tenant Isolation Must Remain Enforced',
        ruleDescription: 'Cross-tenant references must not appear unexpectedly',
        category: 'cross-engine-metadata-mismatch',
        severity: 'critical',
        condition: {
          field: 'reference.tenantId',
          operator: 'equals',
        },
        remediation: {
          description: 'Remove cross-tenant reference violations immediately',
          actionType: 'tenant-isolation-fix',
          targetEngine: 'intelligence-hub',
          estimatedEffort: 'high',
        },
        metadata: {
          sourceEngine: 'intelligence-hub',
          tags: ['cross-engine', 'tenant', 'isolation'],
          enabled: true,
          createdAt: '2026-01-20T00:00:00Z',
          updatedAt: '2026-01-20T00:00:00Z',
        },
      },

      // ====================================================================
      // HEALTH DRIFT (2 rules) - NON-BIOLOGICAL
      // ====================================================================
      {
        ruleId: 'health-drift-001',
        ruleName: 'Health Metrics Must Align with Timeline Events',
        ruleDescription: 'Health metric changes must correlate with timeline events',
        category: 'health-drift',
        severity: 'medium',
        condition: {
          field: 'healthMetric.timelineEventId',
          operator: 'resolved',
        },
        remediation: {
          description: 'Link health metric to corresponding timeline event',
          actionType: 'health-timeline-alignment',
          targetEngine: 'health',
          estimatedEffort: 'low',
        },
        metadata: {
          sourceEngine: 'health',
          tags: ['health', 'timeline', 'drift'],
          enabled: true,
          createdAt: '2026-01-20T00:00:00Z',
          updatedAt: '2026-01-20T00:00:00Z',
        },
      },
      {
        ruleId: 'health-drift-002',
        ruleName: 'Health Thresholds Must Remain Defined',
        ruleDescription: 'Health metric thresholds must not be removed or drift',
        category: 'health-drift',
        severity: 'medium',
        condition: {
          field: 'healthMetric.thresholds',
          operator: 'drift-detected',
        },
        remediation: {
          description: 'Restore or redefine health metric thresholds',
          actionType: 'health-threshold-restoration',
          targetEngine: 'health',
          estimatedEffort: 'low',
        },
        metadata: {
          sourceEngine: 'health',
          tags: ['health', 'thresholds', 'drift'],
          enabled: true,
          createdAt: '2026-01-20T00:00:00Z',
          updatedAt: '2026-01-20T00:00:00Z',
        },
      },

      // ====================================================================
      // ANALYTICS PATTERN DRIFT (2 rules)
      // ====================================================================
      {
        ruleId: 'analytics-pattern-drift-001',
        ruleName: 'Analytics Pattern Must Match Baseline',
        ruleDescription: 'Analytics patterns must remain consistent with baseline',
        category: 'analytics-pattern-drift',
        severity: 'medium',
        condition: {
          field: 'analyticsPattern.baseline',
          operator: 'drift-detected',
        },
        remediation: {
          description: 'Recalculate pattern or update baseline',
          actionType: 'analytics-pattern-recalculation',
          targetEngine: 'analytics',
          estimatedEffort: 'medium',
        },
        metadata: {
          sourceEngine: 'analytics',
          tags: ['analytics', 'pattern', 'drift'],
          enabled: true,
          createdAt: '2026-01-20T00:00:00Z',
          updatedAt: '2026-01-20T00:00:00Z',
        },
      },
      {
        ruleId: 'analytics-pattern-drift-002',
        ruleName: 'Analytics Pattern Incident References Must Be Stable',
        ruleDescription: 'Analytics pattern incident references must not drift or break',
        category: 'analytics-pattern-drift',
        severity: 'high',
        condition: {
          field: 'analyticsPattern.incidents',
          operator: 'resolved',
        },
        remediation: {
          description: 'Fix broken incident references',
          actionType: 'analytics-incident-fix',
          targetEngine: 'analytics',
          estimatedEffort: 'medium',
        },
        metadata: {
          sourceEngine: 'analytics',
          tags: ['analytics', 'incidents', 'references'],
          enabled: true,
          createdAt: '2026-01-20T00:00:00Z',
          updatedAt: '2026-01-20T00:00:00Z',
        },
      },

      // ====================================================================
      // COMPLIANCE PACK DRIFT (2 rules)
      // ====================================================================
      {
        ruleId: 'compliance-pack-drift-001',
        ruleName: 'Compliance Pack Controls Must Remain Complete',
        ruleDescription: 'Compliance pack controls must not be removed or drift',
        category: 'compliance-pack-drift',
        severity: 'critical',
        condition: {
          field: 'compliancePack.controls',
          operator: 'drift-detected',
        },
        remediation: {
          description: 'Restore missing compliance controls',
          actionType: 'compliance-control-restoration',
          targetEngine: 'compliance',
          estimatedEffort: 'high',
        },
        metadata: {
          sourceEngine: 'compliance',
          tags: ['compliance', 'controls', 'drift'],
          enabled: true,
          createdAt: '2026-01-20T00:00:00Z',
          updatedAt: '2026-01-20T00:00:00Z',
        },
      },
      {
        ruleId: 'compliance-pack-drift-002',
        ruleName: 'Compliance Pack Configuration Must Be Valid',
        ruleDescription: 'Compliance pack configuration must remain valid',
        category: 'compliance-pack-drift',
        severity: 'high',
        condition: {
          field: 'compliancePack.valid',
          operator: 'equals',
          value: true,
        },
        remediation: {
          description: 'Validate and fix compliance pack configuration',
          actionType: 'compliance-validation',
          targetEngine: 'compliance',
          estimatedEffort: 'medium',
        },
        metadata: {
          sourceEngine: 'compliance',
          tags: ['compliance', 'configuration', 'validation'],
          enabled: true,
          createdAt: '2026-01-20T00:00:00Z',
          updatedAt: '2026-01-20T00:00:00Z',
        },
      },
    ];

    // Store rules
    for (const rule of rules) {
      this.rules.set(rule.ruleId, rule);
    }
  }

  // ==========================================================================
  // QUERY METHODS
  // ==========================================================================

  public getRule(ruleId: string): MonitorRule | null {
    return this.rules.get(ruleId) || null;
  }

  public getAllRules(): MonitorRule[] {
    return Array.from(this.rules.values()).filter(r => r.metadata.enabled);
  }

  public getRulesByCategory(category: MonitorCategory): MonitorRule[] {
    return this.getAllRules().filter(r => r.category === category);
  }

  public getRulesBySeverity(severity: MonitorSeverity): MonitorRule[] {
    return this.getAllRules().filter(r => r.severity === severity);
  }

  public getRulesByEngine(engine: string): MonitorRule[] {
    return this.getAllRules().filter(r => r.metadata.sourceEngine === engine);
  }

  public getRuleCount(): number {
    return this.getAllRules().length;
  }
}
