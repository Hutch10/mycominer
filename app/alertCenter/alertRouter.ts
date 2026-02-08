/**
 * Phase 52: Unified Alerting & Notification Center — Alert Router
 * 
 * Ingests alerts from 10+ engines and normalizes into Alert objects.
 * Deterministic routing with tenant isolation.
 */

import type {
  Alert,
  AlertCategory,
  AlertSeverity,
  AlertSource,
  AlertScope,
  AlertReference,
  AlertEvidence,
} from './alertTypes';

// ============================================================================
// ALERT ROUTER
// ============================================================================

export class AlertRouter {
  private tenantId: string;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
  }

  // ==========================================================================
  // ROUTING ENTRY POINTS (10+ ENGINES)
  // ==========================================================================

  /**
   * Ingest alerts from Integrity Monitor (Phase 51).
   */
  routeFromIntegrityMonitor(monitorAlerts: any[]): Alert[] {
    return monitorAlerts
      .filter(ma => ma.scope.tenantId === this.tenantId)
      .map(ma => this.normalizeIntegrityAlert(ma));
  }

  /**
   * Ingest alerts from Autonomous Auditor (Phase 50).
   */
  routeFromAuditor(auditFindings: any[]): Alert[] {
    return auditFindings
      .filter(af => af.scope.tenantId === this.tenantId)
      .map(af => this.normalizeAuditFinding(af));
  }

  /**
   * Ingest alerts from Health Engine (Phase 43).
   */
  routeFromHealthEngine(healthAlerts: any[]): Alert[] {
    return healthAlerts
      .filter(ha => ha.scope.tenantId === this.tenantId)
      .map(ha => this.normalizeHealthAlert(ha));
  }

  /**
   * Ingest alerts from Governance System (Phase 44).
   */
  routeFromGovernance(governanceAlerts: any[]): Alert[] {
    return governanceAlerts
      .filter(ga => ga.tenantId === this.tenantId)
      .map(ga => this.normalizeGovernanceAlert(ga));
  }

  /**
   * Ingest alerts from Governance Lineage (Phase 45).
   */
  routeFromGovernanceLineage(lineageAlerts: any[]): Alert[] {
    return lineageAlerts
      .filter(la => la.tenantId === this.tenantId)
      .map(la => this.normalizeLineageAlert(la));
  }

  /**
   * Ingest alerts from Knowledge Fabric (Phase 46).
   */
  routeFromFabric(fabricAlerts: any[]): Alert[] {
    return fabricAlerts
      .filter(fa => fa.scope.tenantId === this.tenantId)
      .map(fa => this.normalizeFabricAlert(fa));
  }

  /**
   * Ingest alerts from Documentation Bundler (Phase 47).
   */
  routeFromDocumentation(docAlerts: any[]): Alert[] {
    return docAlerts
      .filter(da => da.scope.tenantId === this.tenantId)
      .map(da => this.normalizeDocumentationAlert(da));
  }

  /**
   * Ingest alerts from Intelligence Hub (Phase 48).
   */
  routeFromIntelligenceHub(intelligenceAlerts: any[]): Alert[] {
    return intelligenceAlerts
      .filter(ia => ia.scope.tenantId === this.tenantId)
      .map(ia => this.normalizeIntelligenceAlert(ia));
  }

  /**
   * Ingest alerts from Simulation Engine (Phase 49).
   */
  routeFromSimulation(simulationAlerts: any[]): Alert[] {
    return simulationAlerts
      .filter(sa => sa.scope.tenantId === this.tenantId)
      .map(sa => this.normalizeSimulationAlert(sa));
  }

  /**
   * Ingest alerts from Timeline System (Phase 35) / Incident Tracker (Phase 38).
   */
  routeFromTimeline(timelineAlerts: any[]): Alert[] {
    return timelineAlerts
      .filter(ta => ta.scope?.tenantId === this.tenantId)
      .map(ta => this.normalizeTimelineAlert(ta));
  }

  /**
   * Ingest alerts from Analytics Engine (Phase 39).
   */
  routeFromAnalytics(analyticsAlerts: any[]): Alert[] {
    return analyticsAlerts
      .filter(aa => aa.scope.tenantId === this.tenantId)
      .map(aa => this.normalizeAnalyticsAlert(aa));
  }

  /**
   * Ingest alerts from Compliance Engine (Phase 32).
   */
  routeFromCompliance(complianceAlerts: any[]): Alert[] {
    return complianceAlerts
      .filter(ca => ca.scope.tenantId === this.tenantId)
      .map(ca => this.normalizeComplianceAlert(ca));
  }

  // ==========================================================================
  // NORMALIZATION METHODS (ENGINE-SPECIFIC)
  // ==========================================================================

  /**
   * Normalize Integrity Monitor alert (Phase 51).
   */
  private normalizeIntegrityAlert(ma: any): Alert {
    return {
      alertId: `alert-integrity-${ma.alertId}`,
      category: this.mapIntegrityCategory(ma.category),
      severity: ma.severity as AlertSeverity,
      source: 'integrity-monitor',
      title: ma.title,
      description: ma.description,
      scope: ma.scope,
      affectedEntities: ma.affectedEntities.map((e: any) => this.normalizeReference(e, 'integrity-monitor')),
      relatedReferences: ma.relatedReferences?.map((r: any) => this.normalizeReference(r, 'integrity-monitor')) || [],
      evidence: ma.evidence,
      detectedAt: ma.detectedAt,
      status: ma.status,
      assignedTo: ma.assignedTo,
      metadata: {
        sourceAlertId: ma.alertId,
        ruleId: ma.rule?.ruleId,
        tags: ['integrity', 'drift-detection'],
      },
    };
  }

  /**
   * Normalize Auditor finding (Phase 50).
   */
  private normalizeAuditFinding(af: any): Alert {
    return {
      alertId: `alert-audit-${af.findingId}`,
      category: 'audit-finding',
      severity: af.severity as AlertSeverity,
      source: 'auditor',
      title: af.title,
      description: af.description,
      scope: af.scope,
      affectedEntities: af.affectedEntities?.map((e: any) => this.normalizeReference(e, 'auditor')) || [],
      relatedReferences: af.relatedReferences?.map((r: any) => this.normalizeReference(r, 'auditor')) || [],
      evidence: af.evidence,
      detectedAt: af.detectedAt || af.auditedAt,
      status: af.status || 'new',
      metadata: {
        sourceAlertId: af.findingId,
        auditId: af.auditId,
        tags: ['audit', 'compliance'],
      },
    };
  }

  /**
   * Normalize Health Engine alert (Phase 43).
   */
  private normalizeHealthAlert(ha: any): Alert {
    return {
      alertId: `alert-health-${ha.alertId || ha.metricId}`,
      category: 'health-drift',
      severity: ha.severity || this.inferSeverity(ha),
      source: 'health-engine',
      title: ha.title || `Health drift detected: ${ha.metricName}`,
      description: ha.description || `Metric ${ha.metricName} has drifted from baseline`,
      scope: ha.scope,
      affectedEntities: ha.affectedEntities?.map((e: any) => this.normalizeReference(e, 'health-engine')) || [],
      relatedReferences: ha.relatedReferences?.map((r: any) => this.normalizeReference(r, 'health-engine')) || [],
      evidence: ha.evidence,
      detectedAt: ha.detectedAt || ha.timestamp,
      status: ha.status || 'new',
      metadata: {
        sourceAlertId: ha.alertId || ha.metricId,
        tags: ['health', 'non-biological'],
      },
    };
  }

  /**
   * Normalize Governance alert (Phase 44).
   */
  private normalizeGovernanceAlert(ga: any): Alert {
    return {
      alertId: `alert-governance-${ga.alertId || ga.decisionId}`,
      category: 'governance-drift',
      severity: ga.severity || 'high',
      source: 'governance-system',
      title: ga.title || `Governance drift: ${ga.decisionTitle}`,
      description: ga.description || `Governance decision ${ga.decisionId} has drifted`,
      scope: {
        tenantId: ga.tenantId,
        facilityId: ga.facilityId,
      },
      affectedEntities: ga.affectedEntities?.map((e: any) => this.normalizeReference(e, 'governance-system')) || [],
      relatedReferences: ga.relatedReferences?.map((r: any) => this.normalizeReference(r, 'governance-system')) || [],
      evidence: ga.evidence,
      detectedAt: ga.detectedAt || ga.timestamp,
      status: ga.status || 'new',
      metadata: {
        sourceAlertId: ga.alertId || ga.decisionId,
        tags: ['governance', 'decision-drift'],
      },
    };
  }

  /**
   * Normalize Governance Lineage alert (Phase 45).
   */
  private normalizeLineageAlert(la: any): Alert {
    return {
      alertId: `alert-lineage-${la.alertId || la.chainId}`,
      category: 'governance-lineage-break',
      severity: la.severity || 'high',
      source: 'governance-lineage',
      title: la.title || `Lineage chain break: ${la.chainTitle}`,
      description: la.description || `Lineage chain ${la.chainId} is broken`,
      scope: {
        tenantId: la.tenantId,
        facilityId: la.facilityId,
      },
      affectedEntities: la.affectedEntities?.map((e: any) => this.normalizeReference(e, 'governance-lineage')) || [],
      relatedReferences: la.relatedReferences?.map((r: any) => this.normalizeReference(r, 'governance-lineage')) || [],
      evidence: la.evidence,
      detectedAt: la.detectedAt || la.timestamp,
      status: la.status || 'new',
      metadata: {
        sourceAlertId: la.alertId || la.chainId,
        tags: ['lineage', 'chain-break'],
      },
    };
  }

  /**
   * Normalize Fabric alert (Phase 46).
   */
  private normalizeFabricAlert(fa: any): Alert {
    return {
      alertId: `alert-fabric-${fa.alertId || fa.linkId}`,
      category: 'fabric-link-break',
      severity: fa.severity || 'medium',
      source: 'knowledge-fabric',
      title: fa.title || `Fabric link break: ${fa.linkTitle}`,
      description: fa.description || `Fabric link ${fa.linkId} is broken`,
      scope: fa.scope,
      affectedEntities: fa.affectedEntities?.map((e: any) => this.normalizeReference(e, 'knowledge-fabric')) || [],
      relatedReferences: fa.relatedReferences?.map((r: any) => this.normalizeReference(r, 'knowledge-fabric')) || [],
      evidence: fa.evidence,
      detectedAt: fa.detectedAt || fa.timestamp,
      status: fa.status || 'new',
      metadata: {
        sourceAlertId: fa.alertId || fa.linkId,
        tags: ['fabric', 'link-break'],
      },
    };
  }

  /**
   * Normalize Documentation alert (Phase 47).
   */
  private normalizeDocumentationAlert(da: any): Alert {
    return {
      alertId: `alert-doc-${da.alertId || da.bundleId}`,
      category: 'documentation-drift',
      severity: da.severity || 'medium',
      source: 'documentation-bundler',
      title: da.title || `Documentation drift: ${da.bundleTitle}`,
      description: da.description || `Documentation bundle ${da.bundleId} has drifted`,
      scope: da.scope,
      affectedEntities: da.affectedEntities?.map((e: any) => this.normalizeReference(e, 'documentation-bundler')) || [],
      relatedReferences: da.relatedReferences?.map((r: any) => this.normalizeReference(r, 'documentation-bundler')) || [],
      evidence: da.evidence,
      detectedAt: da.detectedAt || da.timestamp,
      status: da.status || 'new',
      metadata: {
        sourceAlertId: da.alertId || da.bundleId,
        tags: ['documentation', 'completeness-drift'],
      },
    };
  }

  /**
   * Normalize Intelligence Hub alert (Phase 48).
   */
  private normalizeIntelligenceAlert(ia: any): Alert {
    return {
      alertId: `alert-intelligence-${ia.alertId || ia.resultId}`,
      category: 'intelligence-finding',
      severity: ia.severity || 'info',
      source: 'intelligence-hub',
      title: ia.title || `Intelligence finding: ${ia.queryTitle}`,
      description: ia.description || `Intelligence Hub found: ${ia.resultSummary}`,
      scope: ia.scope,
      affectedEntities: ia.affectedEntities?.map((e: any) => this.normalizeReference(e, 'intelligence-hub')) || [],
      relatedReferences: ia.relatedReferences?.map((r: any) => this.normalizeReference(r, 'intelligence-hub')) || [],
      evidence: ia.evidence,
      detectedAt: ia.detectedAt || ia.timestamp,
      status: ia.status || 'new',
      metadata: {
        sourceAlertId: ia.alertId || ia.resultId,
        tags: ['intelligence', 'cross-engine-finding'],
      },
    };
  }

  /**
   * Normalize Simulation alert (Phase 49).
   */
  private normalizeSimulationAlert(sa: any): Alert {
    return {
      alertId: `alert-simulation-${sa.alertId || sa.scenarioId}`,
      category: 'simulation-mismatch',
      severity: sa.severity || 'low',
      source: 'simulation-engine',
      title: sa.title || `Simulation mismatch: ${sa.scenarioTitle}`,
      description: sa.description || `Simulation scenario ${sa.scenarioId} deviates from real-world data`,
      scope: sa.scope,
      affectedEntities: sa.affectedEntities?.map((e: any) => this.normalizeReference(e, 'simulation-engine')) || [],
      relatedReferences: sa.relatedReferences?.map((r: any) => this.normalizeReference(r, 'simulation-engine')) || [],
      evidence: sa.evidence,
      detectedAt: sa.detectedAt || sa.timestamp,
      status: sa.status || 'new',
      metadata: {
        sourceAlertId: sa.alertId || sa.scenarioId,
        tags: ['simulation', 'mismatch'],
      },
    };
  }

  /**
   * Normalize Timeline/Incident alert (Phase 35/38).
   */
  private normalizeTimelineAlert(ta: any): Alert {
    return {
      alertId: `alert-timeline-${ta.alertId || ta.incidentId}`,
      category: 'timeline-incident',
      severity: ta.severity || 'medium',
      source: 'timeline-system',
      title: ta.title || `Timeline incident: ${ta.incidentTitle}`,
      description: ta.description || `Incident ${ta.incidentId} detected in timeline`,
      scope: ta.scope || { tenantId: this.tenantId },
      affectedEntities: ta.affectedEntities?.map((e: any) => this.normalizeReference(e, 'timeline-system')) || [],
      relatedReferences: ta.relatedReferences?.map((r: any) => this.normalizeReference(r, 'timeline-system')) || [],
      evidence: ta.evidence,
      detectedAt: ta.detectedAt || ta.timestamp,
      status: ta.status || 'new',
      metadata: {
        sourceAlertId: ta.alertId || ta.incidentId,
        incidentId: ta.incidentId,
        tags: ['timeline', 'incident'],
      },
    };
  }

  /**
   * Normalize Analytics alert (Phase 39).
   */
  private normalizeAnalyticsAlert(aa: any): Alert {
    return {
      alertId: `alert-analytics-${aa.alertId || aa.patternId}`,
      category: 'analytics-anomaly',
      severity: aa.severity || 'medium',
      source: 'analytics-engine',
      title: aa.title || `Analytics anomaly: ${aa.patternTitle}`,
      description: aa.description || `Pattern ${aa.patternId} shows anomalous behavior`,
      scope: aa.scope,
      affectedEntities: aa.affectedEntities?.map((e: any) => this.normalizeReference(e, 'analytics-engine')) || [],
      relatedReferences: aa.relatedReferences?.map((r: any) => this.normalizeReference(r, 'analytics-engine')) || [],
      evidence: aa.evidence,
      detectedAt: aa.detectedAt || aa.timestamp,
      status: aa.status || 'new',
      metadata: {
        sourceAlertId: aa.alertId || aa.patternId,
        tags: ['analytics', 'pattern-drift'],
      },
    };
  }

  /**
   * Normalize Compliance alert (Phase 32).
   */
  private normalizeComplianceAlert(ca: any): Alert {
    return {
      alertId: `alert-compliance-${ca.alertId || ca.packId}`,
      category: 'compliance-issue',
      severity: ca.severity || 'critical',
      source: 'compliance-engine',
      title: ca.title || `Compliance issue: ${ca.packTitle}`,
      description: ca.description || `Compliance pack ${ca.packId} has issues`,
      scope: ca.scope,
      affectedEntities: ca.affectedEntities?.map((e: any) => this.normalizeReference(e, 'compliance-engine')) || [],
      relatedReferences: ca.relatedReferences?.map((r: any) => this.normalizeReference(r, 'compliance-engine')) || [],
      evidence: ca.evidence,
      detectedAt: ca.detectedAt || ca.timestamp,
      status: ca.status || 'new',
      metadata: {
        sourceAlertId: ca.alertId || ca.packId,
        tags: ['compliance', 'regulatory'],
      },
    };
  }

  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================

  /**
   * Map Integrity Monitor categories to AlertCategory.
   */
  private mapIntegrityCategory(integrityCategory: string): AlertCategory {
    const mapping: Record<string, AlertCategory> = {
      'governance-drift': 'governance-drift',
      'governance-lineage-breakage': 'governance-lineage-break',
      'workflow-sop-drift': 'compliance-issue',
      'documentation-completeness-drift': 'documentation-drift',
      'fabric-link-breakage': 'fabric-link-break',
      'cross-engine-metadata-mismatch': 'integrity-drift',
      'health-drift': 'health-drift',
      'analytics-pattern-drift': 'analytics-anomaly',
      'compliance-pack-drift': 'compliance-issue',
    };
    return mapping[integrityCategory] || 'integrity-drift';
  }

  /**
   * Normalize reference object.
   */
  private normalizeReference(ref: any, sourceEngine: AlertSource): AlertReference {
    return {
      referenceId: ref.referenceId || ref.entityId,
      referenceType: ref.referenceType || ref.entityType || 'entity',
      entityId: ref.entityId,
      entityType: ref.entityType || 'unknown',
      title: ref.title || ref.name || ref.entityId,
      sourceEngine,
      url: ref.url,
    };
  }

  /**
   * Infer severity from health alert data.
   */
  private inferSeverity(ha: any): AlertSeverity {
    if (ha.critical || ha.threshold === 'critical') return 'critical';
    if (ha.warning || ha.threshold === 'high') return 'high';
    if (ha.threshold === 'medium') return 'medium';
    return 'low';
  }

  // ==========================================================================
  // BATCH ROUTING
  // ==========================================================================

  /**
   * Route alerts from all engines in one batch.
   */
  routeAll(engineAlerts: {
    integrityMonitor?: any[];
    auditor?: any[];
    healthEngine?: any[];
    governance?: any[];
    governanceLineage?: any[];
    fabric?: any[];
    documentation?: any[];
    intelligenceHub?: any[];
    simulation?: any[];
    timeline?: any[];
    analytics?: any[];
    compliance?: any[];
  }): Alert[] {
    const allAlerts: Alert[] = [];

    if (engineAlerts.integrityMonitor) {
      allAlerts.push(...this.routeFromIntegrityMonitor(engineAlerts.integrityMonitor));
    }
    if (engineAlerts.auditor) {
      allAlerts.push(...this.routeFromAuditor(engineAlerts.auditor));
    }
    if (engineAlerts.healthEngine) {
      allAlerts.push(...this.routeFromHealthEngine(engineAlerts.healthEngine));
    }
    if (engineAlerts.governance) {
      allAlerts.push(...this.routeFromGovernance(engineAlerts.governance));
    }
    if (engineAlerts.governanceLineage) {
      allAlerts.push(...this.routeFromGovernanceLineage(engineAlerts.governanceLineage));
    }
    if (engineAlerts.fabric) {
      allAlerts.push(...this.routeFromFabric(engineAlerts.fabric));
    }
    if (engineAlerts.documentation) {
      allAlerts.push(...this.routeFromDocumentation(engineAlerts.documentation));
    }
    if (engineAlerts.intelligenceHub) {
      allAlerts.push(...this.routeFromIntelligenceHub(engineAlerts.intelligenceHub));
    }
    if (engineAlerts.simulation) {
      allAlerts.push(...this.routeFromSimulation(engineAlerts.simulation));
    }
    if (engineAlerts.timeline) {
      allAlerts.push(...this.routeFromTimeline(engineAlerts.timeline));
    }
    if (engineAlerts.analytics) {
      allAlerts.push(...this.routeFromAnalytics(engineAlerts.analytics));
    }
    if (engineAlerts.compliance) {
      allAlerts.push(...this.routeFromCompliance(engineAlerts.compliance));
    }

    return allAlerts;
  }
}
