/**
 * Phase 50: Autonomous System Auditor - Rule Library
 * 
 * Static, deterministic audit rules for compliance evaluation.
 * NO generative logic, NO predictions, NO invented violations.
 * All rules map 1:1 to real metadata fields.
 */

import type { AuditRule, AuditCategory, AuditSeverity } from './auditorTypes';

// ============================================================================
// AUDIT RULE LIBRARY
// ============================================================================

export class AuditorRuleLibrary {
  private tenantId: string;
  private rules: Map<string, AuditRule> = new Map();

  constructor(tenantId: string) {
    this.tenantId = tenantId;
    this.initializeRules();
  }

  // ==========================================================================
  // RULE INITIALIZATION
  // ==========================================================================

  private initializeRules(): void {
    // Workflow/SOP Alignment Rules
    this.addRule(this.createWorkflowSOPAlignmentRule());
    this.addRule(this.createWorkflowStepSOPReferenceRule());
    this.addRule(this.createWorkflowResourceValidationRule());

    // Governance Correctness Rules
    this.addRule(this.createGovernanceDecisionApprovalRule());
    this.addRule(this.createGovernanceDecisionDocumentationRule());
    this.addRule(this.createGovernanceRoleAssignmentRule());

    // Governance Lineage Rules
    this.addRule(this.createGovernanceLineageChainRule());
    this.addRule(this.createGovernanceLineageConsistencyRule());

    // Health Drift Validation Rules
    this.addRule(this.createHealthDriftTimelineAlignmentRule());
    this.addRule(this.createHealthDriftThresholdRule());

    // Analytics Consistency Rules
    this.addRule(this.createAnalyticsPatternConsistencyRule());
    this.addRule(this.createAnalyticsIncidentReferenceRule());

    // Documentation Completeness Rules
    this.addRule(this.createDocumentationBundleCompletenessRule());
    this.addRule(this.createDocumentationSOPReferenceRule());
    this.addRule(this.createDocumentationMetadataRule());

    // Fabric Integrity Rules
    this.addRule(this.createFabricLinkResolutionRule());
    this.addRule(this.createFabricLinkBidirectionalityRule());

    // Cross-Engine Consistency Rules
    this.addRule(this.createCrossEngineMetadataConsistencyRule());
    this.addRule(this.createCrossEngineTenantIsolationRule());

    // Compliance Pack Validation Rules
    this.addRule(this.createCompliancePackCompletenessRule());
    this.addRule(this.createCompliancePackValidityRule());
  }

  // ==========================================================================
  // WORKFLOW/SOP ALIGNMENT RULES
  // ==========================================================================

  private createWorkflowSOPAlignmentRule(): AuditRule {
    return {
      ruleId: 'workflow-sop-alignment-001',
      ruleName: 'Workflow Must Reference Valid SOP',
      ruleDescription: 'Each workflow must reference at least one valid SOP from the SOP Engine',
      category: 'workflow-sop-alignment',
      severity: 'high',
      condition: {
        field: 'workflow.sopReferences',
        operator: 'exists',
      },
      remediation: {
        description: 'Add SOP reference to workflow metadata',
        actionType: 'update-reference',
        targetEngine: 'workflow',
      },
      metadata: {
        sourceEngine: 'workflow',
        tags: ['workflow', 'sop', 'alignment'],
        enabled: true,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      },
    };
  }

  private createWorkflowStepSOPReferenceRule(): AuditRule {
    return {
      ruleId: 'workflow-sop-alignment-002',
      ruleName: 'Workflow Steps Must Align with SOP Procedures',
      ruleDescription: 'Each workflow step should map to a corresponding SOP procedure step',
      category: 'workflow-sop-alignment',
      severity: 'medium',
      condition: {
        field: 'workflowStep.sopProcedureId',
        operator: 'resolved',
      },
      remediation: {
        description: 'Map workflow steps to SOP procedures',
        actionType: 'align-workflow',
        targetEngine: 'workflow',
      },
      metadata: {
        sourceEngine: 'workflow',
        tags: ['workflow', 'sop', 'procedure', 'alignment'],
        enabled: true,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      },
    };
  }

  private createWorkflowResourceValidationRule(): AuditRule {
    return {
      ruleId: 'workflow-sop-alignment-003',
      ruleName: 'Workflow Resources Must Be Valid',
      ruleDescription: 'All resources referenced in workflow must exist and be accessible',
      category: 'workflow-sop-alignment',
      severity: 'high',
      condition: {
        field: 'workflow.resources',
        operator: 'resolved',
      },
      remediation: {
        description: 'Validate all resource references in workflow',
        actionType: 'fix-link',
        targetEngine: 'workflow',
      },
      metadata: {
        sourceEngine: 'workflow',
        tags: ['workflow', 'resource', 'validation'],
        enabled: true,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      },
    };
  }

  // ==========================================================================
  // GOVERNANCE CORRECTNESS RULES
  // ==========================================================================

  private createGovernanceDecisionApprovalRule(): AuditRule {
    return {
      ruleId: 'governance-correctness-001',
      ruleName: 'Governance Decision Must Have Approval',
      ruleDescription: 'All governance decisions must have valid approval from authorized personnel',
      category: 'governance-correctness',
      severity: 'critical',
      condition: {
        field: 'governanceDecision.approvedBy',
        operator: 'exists',
      },
      remediation: {
        description: 'Obtain approval for governance decision',
        actionType: 'review-governance',
        targetEngine: 'governance',
      },
      metadata: {
        sourceEngine: 'governance',
        tags: ['governance', 'approval', 'compliance'],
        enabled: true,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      },
    };
  }

  private createGovernanceDecisionDocumentationRule(): AuditRule {
    return {
      ruleId: 'governance-correctness-002',
      ruleName: 'Governance Decision Must Be Documented',
      ruleDescription: 'All governance decisions must have complete documentation',
      category: 'governance-correctness',
      severity: 'high',
      condition: {
        field: 'governanceDecision.documentation',
        operator: 'exists',
      },
      remediation: {
        description: 'Add documentation to governance decision',
        actionType: 'complete-documentation',
        targetEngine: 'governance',
      },
      metadata: {
        sourceEngine: 'governance',
        tags: ['governance', 'documentation', 'compliance'],
        enabled: true,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      },
    };
  }

  private createGovernanceRoleAssignmentRule(): AuditRule {
    return {
      ruleId: 'governance-correctness-003',
      ruleName: 'Governance Roles Must Be Valid',
      ruleDescription: 'All role assignments in governance decisions must reference valid roles',
      category: 'governance-correctness',
      severity: 'high',
      condition: {
        field: 'governanceDecision.assignedRoles',
        operator: 'resolved',
      },
      remediation: {
        description: 'Validate role references in governance decision',
        actionType: 'update-reference',
        targetEngine: 'governance',
      },
      metadata: {
        sourceEngine: 'governance',
        tags: ['governance', 'roles', 'validation'],
        enabled: true,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      },
    };
  }

  // ==========================================================================
  // GOVERNANCE LINEAGE RULES
  // ==========================================================================

  private createGovernanceLineageChainRule(): AuditRule {
    return {
      ruleId: 'governance-lineage-001',
      ruleName: 'Governance Decision Must Have Lineage Chain',
      ruleDescription: 'All governance decisions must have complete lineage chain from origin',
      category: 'governance-lineage',
      severity: 'high',
      condition: {
        field: 'governanceDecision.lineageChain',
        operator: 'exists',
      },
      remediation: {
        description: 'Establish lineage chain for governance decision',
        actionType: 'add-metadata',
        targetEngine: 'governance-history',
      },
      metadata: {
        sourceEngine: 'governance-history',
        tags: ['governance', 'lineage', 'chain'],
        enabled: true,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      },
    };
  }

  private createGovernanceLineageConsistencyRule(): AuditRule {
    return {
      ruleId: 'governance-lineage-002',
      ruleName: 'Governance Lineage Must Be Consistent',
      ruleDescription: 'Lineage chain must be consistent with governance decision timeline',
      category: 'governance-lineage',
      severity: 'medium',
      condition: {
        field: 'governanceLineage.consistency',
        operator: 'equals',
        value: true,
      },
      remediation: {
        description: 'Reconcile lineage chain with decision timeline',
        actionType: 'fix-link',
        targetEngine: 'governance-history',
      },
      metadata: {
        sourceEngine: 'governance-history',
        tags: ['governance', 'lineage', 'consistency'],
        enabled: true,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      },
    };
  }

  // ==========================================================================
  // HEALTH DRIFT VALIDATION RULES
  // ==========================================================================

  private createHealthDriftTimelineAlignmentRule(): AuditRule {
    return {
      ruleId: 'health-drift-validation-001',
      ruleName: 'Health Drift Must Align with Timeline Events',
      ruleDescription: 'Health drift observations must correlate with timeline events',
      category: 'health-drift-validation',
      severity: 'medium',
      condition: {
        field: 'healthDrift.timelineEventId',
        operator: 'resolved',
      },
      remediation: {
        description: 'Link health drift to corresponding timeline event',
        actionType: 'fix-link',
        targetEngine: 'health',
      },
      metadata: {
        sourceEngine: 'health',
        tags: ['health', 'drift', 'timeline', 'alignment'],
        enabled: true,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      },
    };
  }

  private createHealthDriftThresholdRule(): AuditRule {
    return {
      ruleId: 'health-drift-validation-002',
      ruleName: 'Health Drift Must Have Defined Thresholds',
      ruleDescription: 'All health metrics must have defined thresholds for drift detection',
      category: 'health-drift-validation',
      severity: 'medium',
      condition: {
        field: 'healthMetric.thresholds',
        operator: 'exists',
      },
      remediation: {
        description: 'Define thresholds for health metrics',
        actionType: 'add-metadata',
        targetEngine: 'health',
      },
      metadata: {
        sourceEngine: 'health',
        tags: ['health', 'thresholds', 'monitoring'],
        enabled: true,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      },
    };
  }

  // ==========================================================================
  // ANALYTICS CONSISTENCY RULES
  // ==========================================================================

  private createAnalyticsPatternConsistencyRule(): AuditRule {
    return {
      ruleId: 'analytics-consistency-001',
      ruleName: 'Analytics Pattern Must Be Consistent',
      ruleDescription: 'Pattern occurrences must be consistent with underlying incident data',
      category: 'analytics-consistency',
      severity: 'medium',
      condition: {
        field: 'analyticsPattern.consistency',
        operator: 'equals',
        value: true,
      },
      remediation: {
        description: 'Recalculate pattern based on current incident data',
        actionType: 'update-reference',
        targetEngine: 'analytics',
      },
      metadata: {
        sourceEngine: 'analytics',
        tags: ['analytics', 'pattern', 'consistency'],
        enabled: true,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      },
    };
  }

  private createAnalyticsIncidentReferenceRule(): AuditRule {
    return {
      ruleId: 'analytics-consistency-002',
      ruleName: 'Analytics Pattern Must Reference Valid Incidents',
      ruleDescription: 'All incidents referenced in patterns must exist and be accessible',
      category: 'analytics-consistency',
      severity: 'high',
      condition: {
        field: 'analyticsPattern.incidents',
        operator: 'resolved',
      },
      remediation: {
        description: 'Validate incident references in pattern',
        actionType: 'fix-link',
        targetEngine: 'analytics',
      },
      metadata: {
        sourceEngine: 'analytics',
        tags: ['analytics', 'incident', 'reference'],
        enabled: true,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      },
    };
  }

  // ==========================================================================
  // DOCUMENTATION COMPLETENESS RULES
  // ==========================================================================

  private createDocumentationBundleCompletenessRule(): AuditRule {
    return {
      ruleId: 'documentation-completeness-001',
      ruleName: 'Documentation Bundle Must Be Complete',
      ruleDescription: 'Documentation bundles must include all required sections',
      category: 'documentation-completeness',
      severity: 'high',
      condition: {
        field: 'documentationBundle.requiredSections',
        operator: 'exists',
      },
      remediation: {
        description: 'Complete all required sections in documentation bundle',
        actionType: 'complete-documentation',
        targetEngine: 'documentation',
      },
      metadata: {
        sourceEngine: 'documentation',
        tags: ['documentation', 'completeness', 'bundle'],
        enabled: true,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      },
    };
  }

  private createDocumentationSOPReferenceRule(): AuditRule {
    return {
      ruleId: 'documentation-completeness-002',
      ruleName: 'Documentation Must Reference SOPs',
      ruleDescription: 'Technical documentation must reference relevant SOPs',
      category: 'documentation-completeness',
      severity: 'medium',
      condition: {
        field: 'documentation.sopReferences',
        operator: 'exists',
      },
      remediation: {
        description: 'Add SOP references to documentation',
        actionType: 'update-reference',
        targetEngine: 'documentation',
      },
      metadata: {
        sourceEngine: 'documentation',
        tags: ['documentation', 'sop', 'reference'],
        enabled: true,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      },
    };
  }

  private createDocumentationMetadataRule(): AuditRule {
    return {
      ruleId: 'documentation-completeness-003',
      ruleName: 'Documentation Must Have Metadata',
      ruleDescription: 'All documentation must have complete metadata (author, date, version)',
      category: 'documentation-completeness',
      severity: 'low',
      condition: {
        field: 'documentation.metadata',
        operator: 'exists',
      },
      remediation: {
        description: 'Add metadata to documentation',
        actionType: 'add-metadata',
        targetEngine: 'documentation',
      },
      metadata: {
        sourceEngine: 'documentation',
        tags: ['documentation', 'metadata'],
        enabled: true,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      },
    };
  }

  // ==========================================================================
  // FABRIC INTEGRITY RULES
  // ==========================================================================

  private createFabricLinkResolutionRule(): AuditRule {
    return {
      ruleId: 'fabric-integrity-001',
      ruleName: 'Fabric Links Must Resolve',
      ruleDescription: 'All fabric links must resolve to valid entities',
      category: 'fabric-integrity',
      severity: 'high',
      condition: {
        field: 'fabricLink.targetEntity',
        operator: 'resolved',
      },
      remediation: {
        description: 'Fix or remove broken fabric links',
        actionType: 'fix-link',
        targetEngine: 'fabric',
      },
      metadata: {
        sourceEngine: 'fabric',
        tags: ['fabric', 'link', 'resolution'],
        enabled: true,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      },
    };
  }

  private createFabricLinkBidirectionalityRule(): AuditRule {
    return {
      ruleId: 'fabric-integrity-002',
      ruleName: 'Fabric Links Must Be Bidirectional',
      ruleDescription: 'Fabric links should be bidirectional when appropriate',
      category: 'fabric-integrity',
      severity: 'low',
      condition: {
        field: 'fabricLink.bidirectional',
        operator: 'equals',
        value: true,
      },
      remediation: {
        description: 'Establish bidirectional fabric links',
        actionType: 'fix-link',
        targetEngine: 'fabric',
      },
      metadata: {
        sourceEngine: 'fabric',
        tags: ['fabric', 'link', 'bidirectional'],
        enabled: true,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      },
    };
  }

  // ==========================================================================
  // CROSS-ENGINE CONSISTENCY RULES
  // ==========================================================================

  private createCrossEngineMetadataConsistencyRule(): AuditRule {
    return {
      ruleId: 'cross-engine-consistency-001',
      ruleName: 'Cross-Engine Metadata Must Be Consistent',
      ruleDescription: 'Metadata for shared entities must be consistent across engines',
      category: 'cross-engine-consistency',
      severity: 'medium',
      condition: {
        field: 'entity.metadata.consistency',
        operator: 'equals',
        value: true,
      },
      remediation: {
        description: 'Reconcile metadata across engines',
        actionType: 'update-reference',
      },
      metadata: {
        tags: ['cross-engine', 'metadata', 'consistency'],
        enabled: true,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      },
    };
  }

  private createCrossEngineTenantIsolationRule(): AuditRule {
    return {
      ruleId: 'cross-engine-consistency-002',
      ruleName: 'Tenant Isolation Must Be Enforced',
      ruleDescription: 'All cross-engine references must respect tenant boundaries',
      category: 'cross-engine-consistency',
      severity: 'critical',
      condition: {
        field: 'reference.tenantId',
        operator: 'equals',
      },
      remediation: {
        description: 'Fix cross-tenant reference violations',
        actionType: 'fix-link',
      },
      metadata: {
        tags: ['tenant', 'isolation', 'security'],
        enabled: true,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      },
    };
  }

  // ==========================================================================
  // COMPLIANCE PACK VALIDATION RULES
  // ==========================================================================

  private createCompliancePackCompletenessRule(): AuditRule {
    return {
      ruleId: 'compliance-pack-validation-001',
      ruleName: 'Compliance Pack Must Be Complete',
      ruleDescription: 'Compliance packs must include all required controls',
      category: 'compliance-pack-validation',
      severity: 'critical',
      condition: {
        field: 'compliancePack.controls',
        operator: 'exists',
      },
      remediation: {
        description: 'Complete all required controls in compliance pack',
        actionType: 'complete-documentation',
        targetEngine: 'compliance',
      },
      metadata: {
        sourceEngine: 'compliance',
        tags: ['compliance', 'pack', 'controls'],
        enabled: true,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      },
    };
  }

  private createCompliancePackValidityRule(): AuditRule {
    return {
      ruleId: 'compliance-pack-validation-002',
      ruleName: 'Compliance Pack Must Be Valid',
      ruleDescription: 'Compliance pack configuration must be valid and up to date',
      category: 'compliance-pack-validation',
      severity: 'high',
      condition: {
        field: 'compliancePack.valid',
        operator: 'equals',
        value: true,
      },
      remediation: {
        description: 'Validate and update compliance pack configuration',
        actionType: 'update-reference',
        targetEngine: 'compliance',
      },
      metadata: {
        sourceEngine: 'compliance',
        tags: ['compliance', 'pack', 'validation'],
        enabled: true,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      },
    };
  }

  // ==========================================================================
  // RULE MANAGEMENT
  // ==========================================================================

  private addRule(rule: AuditRule): void {
    this.rules.set(rule.ruleId, rule);
  }

  /**
   * Get rule by ID
   */
  public getRule(ruleId: string): AuditRule | undefined {
    return this.rules.get(ruleId);
  }

  /**
   * Get all rules
   */
  public getAllRules(): AuditRule[] {
    return Array.from(this.rules.values()).filter(r => r.metadata.enabled);
  }

  /**
   * Get rules by category
   */
  public getRulesByCategory(category: AuditCategory): AuditRule[] {
    return Array.from(this.rules.values())
      .filter(r => r.category === category && r.metadata.enabled);
  }

  /**
   * Get rules by severity
   */
  public getRulesBySeverity(severity: AuditSeverity): AuditRule[] {
    return Array.from(this.rules.values())
      .filter(r => r.severity === severity && r.metadata.enabled);
  }

  /**
   * Get rules by engine
   */
  public getRulesByEngine(engine: string): AuditRule[] {
    return Array.from(this.rules.values())
      .filter(r => r.metadata.sourceEngine === engine && r.metadata.enabled);
  }

  /**
   * Get rule count
   */
  public getRuleCount(): number {
    return Array.from(this.rules.values()).filter(r => r.metadata.enabled).length;
  }
}
