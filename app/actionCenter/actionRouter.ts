/**
 * ACTION ROUTER
 * Phase 53: Operator Action Center
 * 
 * Ingests tasks from multiple engines and normalizes them into ActionTask objects.
 * Enforces tenant/facility/room scope filtering.
 * 
 * DETERMINISTIC ROUTING ONLY. NO GENERATIVE AI.
 */

import {
  ActionTask,
  ActionSeverity,
  RemediationMetadata,
  AlertInput,
  AuditFindingInput,
  IntegrityDriftInput,
  GovernanceIssueInput,
  DocumentationIssueInput,
  FabricLinkIssueInput,
  ComplianceIssueInput,
  SimulationMismatchInput,
  EngineInputs,
} from './actionTypes';

// ============================================================================
// ACTION ROUTER
// ============================================================================

export class ActionRouter {
  private tenantId: string;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
  }

  // ==========================================================================
  // ROUTE FROM ALERT CENTER (Phase 52)
  // ==========================================================================

  routeFromAlertCenter(alerts: AlertInput[]): ActionTask[] {
    // Filter by tenant BEFORE normalization
    const filtered = alerts.filter(alert => alert.scope.tenantId === this.tenantId);

    return filtered.map(alert => this.normalizeAlert(alert));
  }

  private normalizeAlert(alert: AlertInput): ActionTask {
    return {
      taskId: `task-alert-${alert.alertId}`,
      category: 'alert-remediation',
      severity: this.normalizeSeverity(alert.severity),
      source: 'alert-center',
      title: `Remediate: ${alert.title}`,
      description: alert.description,
      scope: alert.scope,
      affectedEntities: alert.affectedEntities,
      relatedReferences: [
        {
          referenceId: alert.alertId,
          referenceType: 'alert',
          title: alert.title,
          sourceEngine: 'alert-center',
        },
        ...alert.relatedReferences,
      ],
      remediation: this.buildAlertRemediation(alert),
      status: alert.status === 'resolved' ? 'resolved' : 'new',
      createdAt: alert.detectedAt,
      metadata: {
        sourceAlertId: alert.alertId,
        tags: ['alert', 'phase-52'],
      },
    };
  }

  private buildAlertRemediation(alert: AlertInput): RemediationMetadata {
    return {
      suggestedAction: `Review and resolve alert: ${alert.title}`,
      estimatedEffort: this.estimateEffortFromSeverity(alert.severity),
      requiredPermissions: ['action.resolve', 'alert.view'],
      relatedDocumentation: '/app/alertCenter',
    };
  }

  // ==========================================================================
  // ROUTE FROM AUDITOR (Phase 50)
  // ==========================================================================

  routeFromAuditor(findings: AuditFindingInput[]): ActionTask[] {
    const filtered = findings.filter(f => f.scope.tenantId === this.tenantId);
    return filtered.map(finding => this.normalizeAuditFinding(finding));
  }

  private normalizeAuditFinding(finding: AuditFindingInput): ActionTask {
    return {
      taskId: `task-audit-${finding.findingId}`,
      category: 'audit-remediation',
      severity: this.normalizeSeverity(finding.severity),
      source: 'auditor',
      title: `Remediate Audit Finding: ${finding.title}`,
      description: finding.description,
      scope: finding.scope,
      affectedEntities: finding.affectedEntities,
      relatedReferences: [
        {
          referenceId: finding.findingId,
          referenceType: 'finding',
          title: finding.title,
          sourceEngine: 'auditor',
        },
        ...finding.relatedReferences,
      ],
      remediation: {
        suggestedAction: `Address audit finding: ${finding.title}`,
        estimatedEffort: finding.severity === 'critical' ? 'high' : 'medium',
        requiredPermissions: ['action.resolve', 'audit.view'],
        relatedDocumentation: '/app/auditor',
      },
      status: finding.status === 'resolved' ? 'resolved' : 'new',
      createdAt: finding.auditedAt,
      metadata: {
        sourceFindingId: finding.findingId,
        auditId: finding.auditId,
        tags: ['audit', 'phase-50'],
      },
    };
  }

  // ==========================================================================
  // ROUTE FROM INTEGRITY MONITOR (Phase 51)
  // ==========================================================================

  routeFromIntegrityMonitor(drifts: IntegrityDriftInput[]): ActionTask[] {
    const filtered = drifts.filter(d => d.scope.tenantId === this.tenantId);
    return filtered.map(drift => this.normalizeIntegrityDrift(drift));
  }

  private normalizeIntegrityDrift(drift: IntegrityDriftInput): ActionTask {
    return {
      taskId: `task-integrity-${drift.alertId}`,
      category: 'integrity-drift-remediation',
      severity: this.normalizeSeverity(drift.severity),
      source: 'integrity-monitor',
      title: `Remediate Drift: ${drift.title}`,
      description: drift.description,
      scope: drift.scope,
      affectedEntities: drift.affectedEntities,
      relatedReferences: [
        {
          referenceId: drift.alertId,
          referenceType: 'drift',
          title: drift.title,
          sourceEngine: 'integrity-monitor',
        },
        ...drift.relatedReferences,
      ],
      remediation: {
        suggestedAction: `Investigate and resolve integrity drift: ${drift.title}`,
        estimatedEffort: this.estimateEffortFromSeverity(drift.severity),
        requiredPermissions: ['action.resolve', 'integrity.view'],
        relatedDocumentation: '/app/integrityMonitor',
      },
      status: drift.status === 'resolved' ? 'resolved' : 'new',
      createdAt: drift.detectedAt,
      metadata: {
        sourceDriftId: drift.alertId,
        ruleId: drift.rule.ruleId,
        evidence: drift.evidence,
        tags: ['integrity', 'phase-51'],
      },
    };
  }

  // ==========================================================================
  // ROUTE FROM GOVERNANCE (Phases 44-45)
  // ==========================================================================

  routeFromGovernance(issues: GovernanceIssueInput[]): ActionTask[] {
    const filtered = issues.filter(i => i.scope.tenantId === this.tenantId);
    return filtered.map(issue => this.normalizeGovernanceIssue(issue));
  }

  private normalizeGovernanceIssue(issue: GovernanceIssueInput): ActionTask {
    return {
      taskId: `task-governance-${issue.issueId}`,
      category: 'governance-lineage-issue',
      severity: this.normalizeSeverity(issue.severity),
      source: issue.issueType === 'lineage-break' ? 'governance-lineage' : 'governance-system',
      title: `Remediate Governance Issue: ${issue.title}`,
      description: issue.description,
      scope: issue.scope,
      affectedEntities: issue.affectedEntities,
      relatedReferences: [
        {
          referenceId: issue.issueId,
          referenceType: 'decision',
          title: issue.title,
          sourceEngine: issue.issueType === 'lineage-break' ? 'governance-lineage' : 'governance-system',
        },
        ...issue.relatedReferences,
      ],
      remediation: {
        suggestedAction: issue.issueType === 'lineage-break'
          ? 'Restore governance lineage chain'
          : 'Align governance decision with approved baseline',
        estimatedEffort: 'medium',
        requiredPermissions: ['action.resolve', 'governance.view'],
        relatedDocumentation: issue.issueType === 'lineage-break' ? '/app/governance/lineage' : '/app/governance',
      },
      status: issue.status === 'resolved' ? 'resolved' : 'new',
      createdAt: issue.detectedAt,
      metadata: {
        issueType: issue.issueType,
        tags: ['governance', issue.issueType === 'lineage-break' ? 'phase-45' : 'phase-44'],
      },
    };
  }

  // ==========================================================================
  // ROUTE FROM DOCUMENTATION ENGINE (Phase 47)
  // ==========================================================================

  routeFromDocumentation(issues: DocumentationIssueInput[]): ActionTask[] {
    const filtered = issues.filter(i => i.scope.tenantId === this.tenantId);
    return filtered.map(issue => this.normalizeDocumentationIssue(issue));
  }

  private normalizeDocumentationIssue(issue: DocumentationIssueInput): ActionTask {
    return {
      taskId: `task-doc-${issue.issueId}`,
      category: 'documentation-completeness',
      severity: this.normalizeSeverity(issue.severity),
      source: 'documentation-bundler',
      title: `Remediate Documentation Issue: ${issue.title}`,
      description: issue.description,
      scope: issue.scope,
      affectedEntities: issue.affectedEntities,
      relatedReferences: [
        {
          referenceId: issue.issueId,
          referenceType: 'bundle',
          title: issue.title,
          sourceEngine: 'documentation-bundler',
        },
        ...issue.relatedReferences,
      ],
      remediation: {
        suggestedAction: issue.issueType === 'completeness'
          ? 'Complete missing documentation sections'
          : 'Update documentation to match current state',
        estimatedEffort: 'low',
        requiredPermissions: ['action.resolve', 'documentation.view'],
        relatedDocumentation: '/app/documentation',
      },
      status: issue.status === 'resolved' ? 'resolved' : 'new',
      createdAt: issue.detectedAt,
      metadata: {
        issueType: issue.issueType,
        tags: ['documentation', 'phase-47'],
      },
    };
  }

  // ==========================================================================
  // ROUTE FROM FABRIC (Phase 46)
  // ==========================================================================

  routeFromFabric(issues: FabricLinkIssueInput[]): ActionTask[] {
    const filtered = issues.filter(i => i.scope.tenantId === this.tenantId);
    return filtered.map(issue => this.normalizeFabricLinkIssue(issue));
  }

  private normalizeFabricLinkIssue(issue: FabricLinkIssueInput): ActionTask {
    return {
      taskId: `task-fabric-${issue.linkId}`,
      category: 'fabric-link-breakage',
      severity: this.normalizeSeverity(issue.severity),
      source: 'knowledge-fabric',
      title: `Remediate Fabric Link Issue: ${issue.title}`,
      description: issue.description,
      scope: issue.scope,
      affectedEntities: issue.affectedEntities,
      relatedReferences: [
        {
          referenceId: issue.linkId,
          referenceType: 'link',
          title: issue.title,
          sourceEngine: 'knowledge-fabric',
        },
        ...issue.relatedReferences,
      ],
      remediation: {
        suggestedAction: issue.issueType === 'breakage'
          ? 'Restore broken fabric link or remove orphaned reference'
          : 'Resolve unresolved fabric link',
        estimatedEffort: 'low',
        requiredPermissions: ['action.resolve', 'fabric.view'],
        relatedDocumentation: '/app/fabric',
      },
      status: issue.status === 'resolved' ? 'resolved' : 'new',
      createdAt: issue.detectedAt,
      metadata: {
        issueType: issue.issueType,
        tags: ['fabric', 'phase-46'],
      },
    };
  }

  // ==========================================================================
  // ROUTE FROM COMPLIANCE ENGINE (Phase 32)
  // ==========================================================================

  routeFromCompliance(issues: ComplianceIssueInput[]): ActionTask[] {
    const filtered = issues.filter(i => i.scope.tenantId === this.tenantId);
    return filtered.map(issue => this.normalizeComplianceIssue(issue));
  }

  private normalizeComplianceIssue(issue: ComplianceIssueInput): ActionTask {
    return {
      taskId: `task-compliance-${issue.packId}`,
      category: 'compliance-pack-issue',
      severity: this.normalizeSeverity(issue.severity),
      source: 'compliance-engine',
      title: `Remediate Compliance Issue: ${issue.title}`,
      description: issue.description,
      scope: issue.scope,
      affectedEntities: issue.affectedEntities,
      relatedReferences: [
        {
          referenceId: issue.packId,
          referenceType: 'pattern',
          title: issue.title,
          sourceEngine: 'compliance-engine',
        },
        ...issue.relatedReferences,
      ],
      remediation: {
        suggestedAction: issue.issueType === 'control-missing'
          ? 'Implement missing compliance control'
          : 'Fix compliance pack configuration',
        estimatedEffort: issue.issueType === 'control-missing' ? 'high' : 'medium',
        requiredPermissions: ['action.resolve', 'compliance.view'],
        relatedDocumentation: '/app/compliance',
      },
      status: issue.status === 'resolved' ? 'resolved' : 'new',
      createdAt: issue.timestamp,
      metadata: {
        issueType: issue.issueType,
        packId: issue.packId,
        tags: ['compliance', 'phase-32'],
      },
    };
  }

  // ==========================================================================
  // ROUTE FROM SIMULATION ENGINE (Phase 49)
  // ==========================================================================

  routeFromSimulation(mismatches: SimulationMismatchInput[]): ActionTask[] {
    const filtered = mismatches.filter(m => m.scope.tenantId === this.tenantId);
    return filtered.map(mismatch => this.normalizeSimulationMismatch(mismatch));
  }

  private normalizeSimulationMismatch(mismatch: SimulationMismatchInput): ActionTask {
    return {
      taskId: `task-simulation-${mismatch.scenarioId}`,
      category: 'simulation-mismatch',
      severity: this.normalizeSeverity(mismatch.severity),
      source: 'simulation-engine',
      title: `Remediate Simulation Mismatch: ${mismatch.title}`,
      description: mismatch.description,
      scope: mismatch.scope,
      affectedEntities: mismatch.affectedEntities,
      relatedReferences: [
        {
          referenceId: mismatch.scenarioId,
          referenceType: 'scenario',
          title: mismatch.title,
          sourceEngine: 'simulation-engine',
        },
        ...mismatch.relatedReferences,
      ],
      remediation: {
        suggestedAction: mismatch.mismatchType === 'forecast-drift'
          ? 'Update forecast parameters to match current state'
          : 'Align simulation parameters with actual values',
        estimatedEffort: 'medium',
        requiredPermissions: ['action.resolve', 'simulation.view'],
        relatedDocumentation: '/app/simulation',
      },
      status: mismatch.status === 'resolved' ? 'resolved' : 'new',
      createdAt: mismatch.detectedAt,
      metadata: {
        mismatchType: mismatch.mismatchType,
        tags: ['simulation', 'phase-49'],
      },
    };
  }

  // ==========================================================================
  // BATCH ROUTING
  // ==========================================================================

  routeAll(inputs: EngineInputs): ActionTask[] {
    const tasks: ActionTask[] = [];

    if (inputs.alerts) {
      tasks.push(...this.routeFromAlertCenter(inputs.alerts));
    }

    if (inputs.auditFindings) {
      tasks.push(...this.routeFromAuditor(inputs.auditFindings));
    }

    if (inputs.integrityDrift) {
      tasks.push(...this.routeFromIntegrityMonitor(inputs.integrityDrift));
    }

    if (inputs.governanceIssues) {
      tasks.push(...this.routeFromGovernance(inputs.governanceIssues));
    }

    if (inputs.documentationIssues) {
      tasks.push(...this.routeFromDocumentation(inputs.documentationIssues));
    }

    if (inputs.fabricLinkIssues) {
      tasks.push(...this.routeFromFabric(inputs.fabricLinkIssues));
    }

    if (inputs.complianceIssues) {
      tasks.push(...this.routeFromCompliance(inputs.complianceIssues));
    }

    if (inputs.simulationMismatches) {
      tasks.push(...this.routeFromSimulation(inputs.simulationMismatches));
    }

    return tasks;
  }

  // ==========================================================================
  // HELPERS
  // ==========================================================================

  private normalizeSeverity(severity: string): ActionSeverity {
    const s = severity.toLowerCase();
    if (s === 'critical') return 'critical';
    if (s === 'high') return 'high';
    if (s === 'medium') return 'medium';
    if (s === 'low') return 'low';
    return 'info';
  }

  private estimateEffortFromSeverity(severity: string): 'low' | 'medium' | 'high' {
    const s = severity.toLowerCase();
    if (s === 'critical') return 'high';
    if (s === 'high') return 'high';
    if (s === 'medium') return 'medium';
    return 'low';
  }
}
