/**
 * Phase 43: System Health - Integrity Scanner
 * 
 * Scans for broken references, missing links, orphaned data, and integrity violations
 * across the entire system. All operations are read-only and deterministic.
 */

import {
  IntegrityFinding,
  AffectedItem,
  HealthReference,
  HealthSeverity
} from './healthTypes';

// ============================================================================
// INTEGRITY SCANNER CLASS
// ============================================================================

export class IntegrityScanner {
  private tenantId: string;
  private facilityId?: string;

  constructor(tenantId: string, facilityId?: string) {
    this.tenantId = tenantId;
    this.facilityId = facilityId;
  }

  // ==========================================================================
  // KNOWLEDGE GRAPH INTEGRITY
  // ==========================================================================

  /**
   * Scan for missing KG nodes
   */
  scanMissingKGNodes(
    edges: unknown[],
    nodes: unknown[]
  ): IntegrityFinding[] {
    const findings: IntegrityFinding[] = [];
    const nodeIds = new Set(nodes.map(n => String((n as Record<string, unknown>).id)));

    for (const edge of edges) {
      const edgeData = edge as Record<string, unknown>;
      const sourceId = String(edgeData.source);
      const targetId = String(edgeData.target);

      const affectedItems: AffectedItem[] = [];

      if (!nodeIds.has(sourceId)) {
        affectedItems.push({
          type: 'kg-node',
          id: sourceId,
          name: `Missing Source Node ${sourceId}`,
          issue: 'Referenced by edge but node does not exist'
        });
      }

      if (!nodeIds.has(targetId)) {
        affectedItems.push({
          type: 'kg-node',
          id: targetId,
          name: `Missing Target Node ${targetId}`,
          issue: 'Referenced by edge but node does not exist'
        });
      }

      if (affectedItems.length > 0) {
        findings.push(this.createIntegrityFinding(
          'kg-link-integrity',
          'missing-kg-node',
          'kg-edge',
          String(edgeData.id),
          String(edgeData.label || edgeData.id),
          'Edge references non-existent nodes',
          'Knowledge graph edge integrity violation: source or target node missing from graph.',
          affectedItems,
          [{ type: 'kg-edge', id: String(edgeData.id), name: String(edgeData.label || edgeData.id) }]
        ));
      }
    }

    return findings;
  }

  /**
   * Scan for broken KG edges
   */
  scanBrokenKGEdges(
    edges: unknown[],
    validRelationshipTypes: Set<string>
  ): IntegrityFinding[] {
    const findings: IntegrityFinding[] = [];

    for (const edge of edges) {
      const edgeData = edge as Record<string, unknown>;
      const relationshipType = String(edgeData.relationshipType || edgeData.type);

      if (!validRelationshipTypes.has(relationshipType)) {
        findings.push(this.createIntegrityFinding(
          'kg-link-integrity',
          'broken-kg-edge',
          'kg-edge',
          String(edgeData.id),
          String(edgeData.label || edgeData.id),
          `Invalid relationship type: ${relationshipType}`,
          'Knowledge graph edge uses an undefined or invalid relationship type.',
          [{
            type: 'kg-edge',
            id: String(edgeData.id),
            name: String(edgeData.label || edgeData.id),
            issue: `Invalid relationship type: ${relationshipType}`
          }],
          [{ type: 'kg-edge', id: String(edgeData.id), name: String(edgeData.label || edgeData.id) }]
        ));
      }
    }

    return findings;
  }

  // ==========================================================================
  // SOP/WORKFLOW INTEGRITY
  // ==========================================================================

  /**
   * Scan for SOP steps referencing missing assets
   */
  scanSOPAssetReferences(
    sops: unknown[],
    availableAssets: Map<string, unknown>
  ): IntegrityFinding[] {
    const findings: IntegrityFinding[] = [];

    for (const sop of sops) {
      const sopData = sop as Record<string, unknown>;
      const steps = (sopData.steps || []) as unknown[];
      const affectedItems: AffectedItem[] = [];

      for (const step of steps) {
        const stepData = step as Record<string, unknown>;
        const assetRefs = (stepData.assetReferences || []) as unknown[];

        for (const ref of assetRefs) {
          const refData = ref as Record<string, unknown>;
          const assetId = String(refData.assetId);

          if (!availableAssets.has(assetId)) {
            affectedItems.push({
              type: 'resource',
              id: assetId,
              name: String(refData.assetName || assetId),
              issue: 'Asset referenced by SOP step does not exist'
            });
          }
        }
      }

      if (affectedItems.length > 0) {
        findings.push(this.createIntegrityFinding(
          'sop-workflow-mismatch',
          'missing-sop-asset',
          'sop',
          String(sopData.id),
          String(sopData.name || sopData.id),
          `SOP references ${affectedItems.length} missing asset(s)`,
          'SOP steps reference resources or assets that are no longer available in the system.',
          affectedItems,
          [{ type: 'sop', id: String(sopData.id), name: String(sopData.name || sopData.id) }]
        ));
      }
    }

    return findings;
  }

  /**
   * Scan for workflow/SOP mismatches
   */
  scanWorkflowSOPMismatch(
    workflows: unknown[],
    sops: Map<string, unknown>
  ): IntegrityFinding[] {
    const findings: IntegrityFinding[] = [];

    for (const workflow of workflows) {
      const wfData = workflow as Record<string, unknown>;
      const sopRefs = (wfData.sopReferences || []) as unknown[];
      const affectedItems: AffectedItem[] = [];

      for (const sopRef of sopRefs) {
        const sopRefData = sopRef as Record<string, unknown>;
        const sopId = String(sopRefData.sopId);

        if (!sops.has(sopId)) {
          affectedItems.push({
            type: 'sop',
            id: sopId,
            name: String(sopRefData.sopName || sopId),
            issue: 'SOP referenced by workflow does not exist'
          });
        }
      }

      if (affectedItems.length > 0) {
        findings.push(this.createIntegrityFinding(
          'sop-workflow-mismatch',
          'missing-sop-asset',
          'workflow',
          String(wfData.id),
          String(wfData.name || wfData.id),
          `Workflow references ${affectedItems.length} missing SOP(s)`,
          'Workflow template references SOPs that are no longer available in the system.',
          affectedItems,
          [{ type: 'workflow', id: String(wfData.id), name: String(wfData.name || wfData.id) }]
        ));
      }
    }

    return findings;
  }

  // ==========================================================================
  // TIMELINE INTEGRITY
  // ==========================================================================

  /**
   * Scan for stale timeline references
   */
  scanStaleTimelineReferences(
    timelineEvents: unknown[],
    validEntityIds: Set<string>,
    staleThresholdDays: number = 365
  ): IntegrityFinding[] {
    const findings: IntegrityFinding[] = [];
    const staleThreshold = new Date();
    staleThreshold.setDate(staleThreshold.getDate() - staleThresholdDays);

    for (const event of timelineEvents) {
      const eventData = event as Record<string, unknown>;
      const entityId = String(eventData.entityId || '');
      const timestamp = new Date(String(eventData.timestamp));

      const affectedItems: AffectedItem[] = [];

      // Check if entity still exists
      if (entityId && !validEntityIds.has(entityId)) {
        affectedItems.push({
          type: 'entity',
          id: entityId,
          name: String(eventData.entityName || entityId),
          issue: 'Entity referenced by timeline event no longer exists'
        });
      }

      // Check if event is stale
      if (timestamp < staleThreshold) {
        affectedItems.push({
          type: 'timeline-event',
          id: String(eventData.id),
          name: String(eventData.title || eventData.id),
          issue: `Event is older than ${staleThresholdDays} days`
        });
      }

      if (affectedItems.length > 0) {
        findings.push(this.createIntegrityFinding(
          'stale-orphaned-references',
          'stale-timeline-reference',
          'timeline-event',
          String(eventData.id),
          String(eventData.title || eventData.id),
          `Stale or orphaned timeline reference`,
          'Timeline event references entities that no longer exist or is older than retention threshold.',
          affectedItems,
          [{ type: 'timeline-event', id: String(eventData.id), name: String(eventData.title || eventData.id) }]
        ));
      }
    }

    return findings;
  }

  // ==========================================================================
  // COMPLIANCE INTEGRITY
  // ==========================================================================

  /**
   * Scan for orphaned CAPA links
   */
  scanOrphanedCAPALinks(
    capas: unknown[],
    incidents: Map<string, unknown>,
    deviations: Map<string, unknown>
  ): IntegrityFinding[] {
    const findings: IntegrityFinding[] = [];

    for (const capa of capas) {
      const capaData = capa as Record<string, unknown>;
      const incidentId = String(capaData.incidentId || '');
      const deviationId = String(capaData.deviationId || '');
      const affectedItems: AffectedItem[] = [];

      if (incidentId && !incidents.has(incidentId)) {
        affectedItems.push({
          type: 'incident',
          id: incidentId,
          name: incidentId,
          issue: 'CAPA references non-existent incident'
        });
      }

      if (deviationId && !deviations.has(deviationId)) {
        affectedItems.push({
          type: 'deviation',
          id: deviationId,
          name: deviationId,
          issue: 'CAPA references non-existent deviation'
        });
      }

      if (affectedItems.length > 0) {
        findings.push(this.createIntegrityFinding(
          'compliance-record-consistency',
          'orphaned-capa-link',
          'capa',
          String(capaData.id),
          String(capaData.title || capaData.id),
          `CAPA has orphaned links`,
          'CAPA record references incidents or deviations that no longer exist in the system.',
          affectedItems,
          [{ type: 'capa', id: String(capaData.id), name: String(capaData.title || capaData.id) }]
        ));
      }
    }

    return findings;
  }

  /**
   * Scan for compliance record consistency
   */
  scanComplianceRecordConsistency(
    complianceRecords: unknown[],
    requiredFields: string[]
  ): IntegrityFinding[] {
    const findings: IntegrityFinding[] = [];

    for (const record of complianceRecords) {
      const recordData = record as Record<string, unknown>;
      const affectedItems: AffectedItem[] = [];

      for (const field of requiredFields) {
        if (!(field in recordData) || recordData[field] === null || recordData[field] === undefined || recordData[field] === '') {
          affectedItems.push({
            type: 'compliance-record',
            id: String(recordData.id),
            name: String(recordData.title || recordData.id),
            issue: `Missing required field: ${field}`
          });
        }
      }

      if (affectedItems.length > 0) {
        findings.push(this.createIntegrityFinding(
          'compliance-record-consistency',
          'compliance-record-mismatch',
          'compliance-record',
          String(recordData.id),
          String(recordData.title || recordData.id),
          `Compliance record missing ${affectedItems.length} required field(s)`,
          'Compliance record is incomplete or inconsistent with required schema.',
          affectedItems,
          [{ type: 'compliance-record', id: String(recordData.id), name: String(recordData.title || recordData.id) }]
        ));
      }
    }

    return findings;
  }

  // ==========================================================================
  // SANDBOX INTEGRITY
  // ==========================================================================

  /**
   * Scan for sandbox scenarios with outdated workflows
   */
  scanSandboxScenarioStaleness(
    scenarios: unknown[],
    currentWorkflows: Map<string, { version: string }>,
    staleThresholdDays: number = 90
  ): IntegrityFinding[] {
    const findings: IntegrityFinding[] = [];
    const staleThreshold = new Date();
    staleThreshold.setDate(staleThreshold.getDate() - staleThresholdDays);

    for (const scenario of scenarios) {
      const scenarioData = scenario as Record<string, unknown>;
      const workflowId = String(scenarioData.workflowId || '');
      const scenarioVersion = String(scenarioData.workflowVersion || '0.0.0');
      const lastRun = scenarioData.lastRun ? new Date(String(scenarioData.lastRun)) : null;

      const affectedItems: AffectedItem[] = [];

      // Check if workflow version matches
      const currentWorkflow = currentWorkflows.get(workflowId);
      if (currentWorkflow && currentWorkflow.version !== scenarioVersion) {
        affectedItems.push({
          type: 'sandbox-scenario',
          id: String(scenarioData.id),
          name: String(scenarioData.name || scenarioData.id),
          issue: `Workflow version mismatch: scenario uses ${scenarioVersion}, current is ${currentWorkflow.version}`
        });
      }

      // Check if scenario is stale
      if (lastRun && lastRun < staleThreshold) {
        affectedItems.push({
          type: 'sandbox-scenario',
          id: String(scenarioData.id),
          name: String(scenarioData.name || scenarioData.id),
          issue: `Scenario not run in ${staleThresholdDays} days`
        });
      }

      if (affectedItems.length > 0) {
        findings.push(this.createIntegrityFinding(
          'sandbox-scenario-staleness',
          'outdated-sandbox-workflow',
          'sandbox-scenario',
          String(scenarioData.id),
          String(scenarioData.name || scenarioData.id),
          'Sandbox scenario is stale or uses outdated workflow',
          'Sandbox scenario references an outdated workflow version or has not been run recently.',
          affectedItems,
          [{ type: 'sandbox-scenario', id: String(scenarioData.id), name: String(scenarioData.name || scenarioData.id) }]
        ));
      }
    }

    return findings;
  }

  // ==========================================================================
  // FORECAST INTEGRITY
  // ==========================================================================

  /**
   * Scan for forecast metadata drift
   */
  scanForecastMetadataDrift(
    forecasts: unknown[],
    requiredMetadataFields: string[]
  ): IntegrityFinding[] {
    const findings: IntegrityFinding[] = [];

    for (const forecast of forecasts) {
      const forecastData = forecast as Record<string, unknown>;
      const metadata = (forecastData.metadata || {}) as Record<string, unknown>;
      const affectedItems: AffectedItem[] = [];

      for (const field of requiredMetadataFields) {
        if (!(field in metadata) || metadata[field] === null || metadata[field] === undefined) {
          affectedItems.push({
            type: 'forecast',
            id: String(forecastData.id),
            name: String(forecastData.name || forecastData.id),
            issue: `Missing metadata field: ${field}`
          });
        }
      }

      if (affectedItems.length > 0) {
        findings.push(this.createIntegrityFinding(
          'forecast-metadata-drift',
          'stale-forecast-metadata',
          'forecast',
          String(forecastData.id),
          String(forecastData.name || forecastData.id),
          `Forecast missing ${affectedItems.length} metadata field(s)`,
          'Forecast metadata is incomplete or does not conform to required schema.',
          affectedItems,
          [{ type: 'forecast', id: String(forecastData.id), name: String(forecastData.name || forecastData.id) }]
        ));
      }
    }

    return findings;
  }

  // ==========================================================================
  // PRIVATE HELPERS
  // ==========================================================================

  /**
   * Create an integrity finding
   */
  private createIntegrityFinding(
    category: IntegrityFinding['category'],
    issueType: IntegrityFinding['issueType'],
    assetType: string,
    assetId: string,
    assetName: string,
    description: string,
    rationale: string,
    affectedItems: AffectedItem[],
    references: HealthReference[]
  ): IntegrityFinding {
    return {
      id: `integrity-${category}-${assetId}-${Date.now()}`,
      category,
      severity: this.calculateIntegritySeverity(issueType, affectedItems.length),
      timestamp: new Date().toISOString(),
      tenantId: this.tenantId,
      facilityId: this.facilityId,
      issueType,
      assetType,
      assetId,
      assetName,
      description,
      rationale,
      affectedItems,
      references,
      recommendation: this.generateRecommendation(issueType)
    };
  }

  /**
   * Calculate integrity severity
   */
  private calculateIntegritySeverity(
    issueType: IntegrityFinding['issueType'],
    affectedCount: number
  ): HealthSeverity {
    // Critical issues
    if (['missing-kg-node', 'orphaned-capa-link', 'compliance-record-mismatch'].includes(issueType)) {
      return 'critical';
    }

    // High priority issues
    if (['broken-kg-edge', 'missing-sop-asset', 'policy-violation'].includes(issueType)) {
      return 'high';
    }

    // Medium priority issues
    if (affectedCount > 5) {
      return 'medium';
    }

    // Low priority
    return 'low';
  }

  /**
   * Generate recommendation
   */
  private generateRecommendation(issueType: IntegrityFinding['issueType']): string {
    const recommendations: Record<string, string> = {
      'missing-kg-node': 'Restore missing nodes or remove invalid edges from knowledge graph.',
      'broken-kg-edge': 'Update edge relationship types to valid values or remove invalid edges.',
      'stale-timeline-reference': 'Archive or remove outdated timeline events and verify entity references.',
      'orphaned-capa-link': 'Update CAPA records to reference valid incidents/deviations or archive orphaned CAPAs.',
      'missing-sop-asset': 'Update SOP/workflow asset references to point to available resources.',
      'outdated-sandbox-workflow': 'Update sandbox scenarios to use current workflow versions or archive unused scenarios.',
      'stale-forecast-metadata': 'Update forecast metadata to include all required fields.',
      'compliance-record-mismatch': 'Complete compliance records with all required fields.',
      'policy-violation': 'Review and remediate policy violations to ensure compliance.',
      'inconsistent-schema': 'Update schema definitions to ensure cross-engine consistency.'
    };

    return recommendations[issueType] || 'Review and address integrity issue.';
  }
}
