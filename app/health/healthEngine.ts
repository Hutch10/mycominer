/**
 * Phase 43: System Health - Health Engine
 * 
 * Orchestrates drift detection, integrity scanning, and policy evaluation.
 * Accepts health queries and returns comprehensive health results.
 * All operations are read-only and deterministic.
 */

import { DriftDetector } from './driftDetector';
import { IntegrityScanner } from './integrityScanner';
import { HealthPolicyEngine } from './healthPolicyEngine';
import { HealthLog } from './healthLog';
import {
  HealthQuery,
  HealthResult,
  HealthSummary,
  HealthStatus,
  HealthEngineConfig,
  HealthCategory,
  DriftFinding,
  IntegrityFinding,
  HealthReference,
  HealthBaseline
} from './healthTypes';

// ============================================================================
// HEALTH ENGINE CLASS
// ============================================================================

export class HealthEngine {
  private config: HealthEngineConfig;
  private driftDetector: DriftDetector;
  private integrityScanner: IntegrityScanner;
  private policyEngine: HealthPolicyEngine;
  private healthLog: HealthLog;

  constructor(config: HealthEngineConfig) {
    this.config = config;
    this.driftDetector = new DriftDetector(config.tenantId, config.facilityId);
    this.integrityScanner = new IntegrityScanner(config.tenantId, config.facilityId);
    this.policyEngine = new HealthPolicyEngine(config.tenantId, config.facilityId);
    this.healthLog = new HealthLog(config.tenantId, config.facilityId, config.retentionDays);
  }

  /**
   * Execute a health query
   */
  async executeQuery(query: HealthQuery, systemData: SystemData): Promise<HealthResult> {
    const startTime = Date.now();

    // Log the query
    this.healthLog.logQuery(query);

    // Initialize findings
    let driftFindings: DriftFinding[] = [];
    let integrityFindings: IntegrityFinding[] = [];
    let checksRun = 0;

    // Execute based on query type
    switch (query.queryType) {
      case 'full-scan':
        driftFindings = await this.performFullDriftScan(systemData);
        integrityFindings = await this.performFullIntegrityScan(systemData);
        checksRun = this.config.enabledCategories.length * 2;
        break;

      case 'drift-only':
        driftFindings = await this.performDriftScan(query, systemData);
        checksRun = this.countDriftChecks(query);
        break;

      case 'integrity-only':
        integrityFindings = await this.performIntegrityScan(query, systemData);
        checksRun = this.countIntegrityChecks(query);
        break;

      case 'category-specific':
        if (query.categories) {
          for (const category of query.categories) {
            if (category === 'configuration-drift') {
              driftFindings.push(...await this.performDriftScan(query, systemData));
            } else {
              integrityFindings.push(...await this.performIntegrityScanByCategory(category, systemData));
            }
          }
          checksRun = query.categories.length;
        }
        break;

      case 'asset-specific':
        if (query.assetIds && query.assetTypes) {
          const assetResults = await this.performAssetSpecificScan(query, systemData);
          driftFindings = assetResults.drift;
          integrityFindings = assetResults.integrity;
          checksRun = query.assetIds.length;
        }
        break;
    }

    // Filter by severity threshold if specified
    if (query.severityThreshold) {
      driftFindings = this.filterBySeverity(driftFindings, query.severityThreshold);
      integrityFindings = this.filterBySeverity(integrityFindings, query.severityThreshold);
    }

    // Log all findings
    for (const finding of driftFindings) {
      this.healthLog.logDriftFinding(finding, query.userId);
    }
    for (const finding of integrityFindings) {
      this.healthLog.logIntegrityFinding(finding, query.userId);
    }

    // Compute summary
    const summary = this.computeSummary(driftFindings, integrityFindings);

    // Determine overall status
    const overallStatus = this.determineOverallStatus(summary);

    // Collect all references
    const references = this.collectReferences(driftFindings, integrityFindings);

    // Compute scan duration
    const scanDuration = Date.now() - startTime;

    // Create result
    const result: HealthResult = {
      queryId: query.id,
      timestamp: new Date().toISOString(),
      tenantId: query.tenantId,
      facilityId: query.facilityId,
      overallStatus,
      driftFindings,
      integrityFindings,
      summary,
      references,
      scanDuration,
      checksRun,
      logEntryIds: [] // Populated below
    };

    return result;
  }

  /**
   * Load baselines for drift detection
   */
  loadBaselines(baselines: HealthBaseline[]): void {
    this.driftDetector.loadBaselines(baselines);
  }

  /**
   * Get health log
   */
  getHealthLog(): HealthLog {
    return this.healthLog;
  }

  // ==========================================================================
  // DRIFT SCANNING
  // ==========================================================================

  private async performFullDriftScan(systemData: SystemData): Promise<DriftFinding[]> {
    const findings: DriftFinding[] = [];

    if (this.isCategoryEnabled('configuration-drift')) {
      findings.push(...this.driftDetector.detectSOPDrift(systemData.sops));
      findings.push(...this.driftDetector.detectWorkflowDrift(systemData.workflows));
      findings.push(...this.driftDetector.detectResourceDrift(systemData.resources));
      findings.push(...this.driftDetector.detectFacilityDrift(systemData.facilities));
      findings.push(...this.driftDetector.detectSandboxDrift(systemData.sandboxScenarios));
      findings.push(...this.driftDetector.detectForecastMetadataDrift(systemData.forecasts));
    }

    return findings;
  }

  private async performDriftScan(query: HealthQuery, systemData: SystemData): Promise<DriftFinding[]> {
    const findings: DriftFinding[] = [];

    if (query.assetTypes) {
      for (const assetType of query.assetTypes) {
        switch (assetType) {
          case 'sop':
            findings.push(...this.driftDetector.detectSOPDrift(systemData.sops));
            break;
          case 'workflow':
            findings.push(...this.driftDetector.detectWorkflowDrift(systemData.workflows));
            break;
          case 'resource':
            findings.push(...this.driftDetector.detectResourceDrift(systemData.resources));
            break;
          case 'facility':
            findings.push(...this.driftDetector.detectFacilityDrift(systemData.facilities));
            break;
          case 'sandbox-scenario':
            findings.push(...this.driftDetector.detectSandboxDrift(systemData.sandboxScenarios));
            break;
          case 'forecast':
            findings.push(...this.driftDetector.detectForecastMetadataDrift(systemData.forecasts));
            break;
        }
      }
    } else {
      findings.push(...await this.performFullDriftScan(systemData));
    }

    return findings;
  }

  // ==========================================================================
  // INTEGRITY SCANNING
  // ==========================================================================

  private async performFullIntegrityScan(systemData: SystemData): Promise<IntegrityFinding[]> {
    const findings: IntegrityFinding[] = [];

    if (this.isCategoryEnabled('kg-link-integrity')) {
      findings.push(...this.integrityScanner.scanMissingKGNodes(
        systemData.kgEdges,
        systemData.kgNodes
      ));
      findings.push(...this.integrityScanner.scanBrokenKGEdges(
        systemData.kgEdges,
        systemData.validRelationshipTypes
      ));
    }

    if (this.isCategoryEnabled('sop-workflow-mismatch')) {
      findings.push(...this.integrityScanner.scanSOPAssetReferences(
        systemData.sops,
        systemData.availableAssets
      ));
      findings.push(...this.integrityScanner.scanWorkflowSOPMismatch(
        systemData.workflows,
        systemData.sopMap
      ));
    }

    if (this.isCategoryEnabled('stale-orphaned-references')) {
      findings.push(...this.integrityScanner.scanStaleTimelineReferences(
        systemData.timelineEvents,
        systemData.validEntityIds
      ));
    }

    if (this.isCategoryEnabled('compliance-record-consistency')) {
      findings.push(...this.integrityScanner.scanOrphanedCAPALinks(
        systemData.capas,
        systemData.incidentMap,
        systemData.deviationMap
      ));
      findings.push(...this.integrityScanner.scanComplianceRecordConsistency(
        systemData.complianceRecords,
        systemData.requiredComplianceFields
      ));
    }

    if (this.isCategoryEnabled('sandbox-scenario-staleness')) {
      findings.push(...this.integrityScanner.scanSandboxScenarioStaleness(
        systemData.sandboxScenarios,
        systemData.currentWorkflowVersions
      ));
    }

    if (this.isCategoryEnabled('forecast-metadata-drift')) {
      findings.push(...this.integrityScanner.scanForecastMetadataDrift(
        systemData.forecasts,
        systemData.requiredForecastMetadata
      ));
    }

    return findings;
  }

  private async performIntegrityScan(query: HealthQuery, systemData: SystemData): Promise<IntegrityFinding[]> {
    return await this.performFullIntegrityScan(systemData);
  }

  private async performIntegrityScanByCategory(
    category: HealthCategory,
    systemData: SystemData
  ): Promise<IntegrityFinding[]> {
    const findings: IntegrityFinding[] = [];

    switch (category) {
      case 'kg-link-integrity':
        findings.push(...this.integrityScanner.scanMissingKGNodes(
          systemData.kgEdges,
          systemData.kgNodes
        ));
        findings.push(...this.integrityScanner.scanBrokenKGEdges(
          systemData.kgEdges,
          systemData.validRelationshipTypes
        ));
        break;

      case 'sop-workflow-mismatch':
        findings.push(...this.integrityScanner.scanSOPAssetReferences(
          systemData.sops,
          systemData.availableAssets
        ));
        break;

      case 'compliance-record-consistency':
        findings.push(...this.integrityScanner.scanComplianceRecordConsistency(
          systemData.complianceRecords,
          systemData.requiredComplianceFields
        ));
        break;
    }

    return findings;
  }

  private async performAssetSpecificScan(
    query: HealthQuery,
    systemData: SystemData
  ): Promise<{ drift: DriftFinding[]; integrity: IntegrityFinding[] }> {
    // Filter system data to only include specified assets
    const filteredData = this.filterSystemDataByAssets(systemData, query.assetIds || [], query.assetTypes || []);
    
    const drift = await this.performDriftScan(query, filteredData);
    const integrity = await this.performIntegrityScan(query, filteredData);

    return { drift, integrity };
  }

  // ==========================================================================
  // HELPERS
  // ==========================================================================

  private isCategoryEnabled(category: HealthCategory): boolean {
    return this.config.enabledCategories.includes(category);
  }

  private filterBySeverity<T extends { severity: string }>(
    findings: T[],
    threshold: string
  ): T[] {
    const severityLevels = ['info', 'low', 'medium', 'high', 'critical'];
    const thresholdIndex = severityLevels.indexOf(threshold);

    return findings.filter(f => {
      const findingSeverityIndex = severityLevels.indexOf(f.severity);
      return findingSeverityIndex >= thresholdIndex;
    });
  }

  private computeSummary(
    driftFindings: DriftFinding[],
    integrityFindings: IntegrityFinding[]
  ): HealthSummary {
    const allFindings = [...driftFindings, ...integrityFindings];
    const totalFindings = allFindings.length;

    const findingsBySeverity = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      info: 0
    };

    const findingsByCategory: Partial<Record<HealthCategory, number>> = {};

    for (const finding of allFindings) {
      findingsBySeverity[finding.severity]++;
      findingsByCategory[finding.category] = (findingsByCategory[finding.category] || 0) + 1;
    }

    const criticalIssues = allFindings
      .filter(f => f.severity === 'critical')
      .map(f => {
        if ('driftType' in f) {
          return `${f.assetType} ${f.assetName}: ${f.driftType}`;
        } else {
          return `${f.assetType} ${f.assetName}: ${f.issueType}`;
        }
      });

    const healthScore = this.calculateHealthScore(findingsBySeverity);

    return {
      totalFindings,
      findingsBySeverity,
      findingsByCategory: findingsByCategory as Record<HealthCategory, number>,
      criticalIssues,
      healthScore
    };
  }

  private calculateHealthScore(findingsBySeverity: Record<string, number>): number {
    // Start at 100, deduct points based on severity
    let score = 100;

    score -= findingsBySeverity.critical * 20;
    score -= findingsBySeverity.high * 10;
    score -= findingsBySeverity.medium * 5;
    score -= findingsBySeverity.low * 2;
    score -= findingsBySeverity.info * 1;

    return Math.max(0, Math.min(100, score));
  }

  private determineOverallStatus(summary: HealthSummary): HealthStatus {
    if (summary.findingsBySeverity.critical > 0) {
      return 'unhealthy';
    }

    if (summary.findingsBySeverity.high > 5 || summary.healthScore < 50) {
      return 'degraded';
    }

    if (summary.healthScore >= 80) {
      return 'healthy';
    }

    return 'degraded';
  }

  private collectReferences(
    driftFindings: DriftFinding[],
    integrityFindings: IntegrityFinding[]
  ): HealthReference[] {
    const refsMap = new Map<string, HealthReference>();

    for (const finding of driftFindings) {
      for (const ref of finding.references) {
        const key = `${ref.type}:${ref.id}`;
        refsMap.set(key, ref);
      }
    }

    for (const finding of integrityFindings) {
      for (const ref of finding.references) {
        const key = `${ref.type}:${ref.id}`;
        refsMap.set(key, ref);
      }
    }

    return Array.from(refsMap.values());
  }

  private countDriftChecks(query: HealthQuery): number {
    return query.assetTypes?.length || 6; // Default 6 asset types
  }

  private countIntegrityChecks(query: HealthQuery): number {
    return query.categories?.length || this.config.enabledCategories.length;
  }

  private filterSystemDataByAssets(
    systemData: SystemData,
    assetIds: string[],
    assetTypes: string[]
  ): SystemData {
    const assetIdSet = new Set(assetIds);
    const assetTypeSet = new Set(assetTypes);

    return {
      ...systemData,
      sops: assetTypeSet.has('sop') ? systemData.sops.filter(s => assetIdSet.has(String((s as any).id))) : [],
      workflows: assetTypeSet.has('workflow') ? systemData.workflows.filter(w => assetIdSet.has(String((w as any).id))) : [],
      resources: assetTypeSet.has('resource') ? systemData.resources.filter(r => assetIdSet.has(String((r as any).id))) : [],
      facilities: assetTypeSet.has('facility') ? systemData.facilities.filter(f => assetIdSet.has(String((f as any).id))) : [],
      sandboxScenarios: assetTypeSet.has('sandbox-scenario') ? systemData.sandboxScenarios.filter(s => assetIdSet.has(String((s as any).id))) : [],
      forecasts: assetTypeSet.has('forecast') ? systemData.forecasts.filter(f => assetIdSet.has(String((f as any).id))) : []
    };
  }
}

// ============================================================================
// SYSTEM DATA INTERFACE
// ============================================================================

export interface SystemData {
  // Drift detection data
  sops: unknown[];
  workflows: unknown[];
  resources: unknown[];
  facilities: unknown[];
  sandboxScenarios: unknown[];
  forecasts: unknown[];

  // Integrity scanning data
  kgNodes: unknown[];
  kgEdges: unknown[];
  validRelationshipTypes: Set<string>;
  availableAssets: Map<string, unknown>;
  sopMap: Map<string, unknown>;
  timelineEvents: unknown[];
  validEntityIds: Set<string>;
  capas: unknown[];
  incidentMap: Map<string, unknown>;
  deviationMap: Map<string, unknown>;
  complianceRecords: unknown[];
  requiredComplianceFields: string[];
  currentWorkflowVersions: Map<string, { version: string }>;
  requiredForecastMetadata: string[];
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Create a health query
 */
export function createHealthQuery(
  tenantId: string,
  userId: string,
  description: string,
  queryType: HealthQuery['queryType'] = 'full-scan',
  facilityId?: string
): HealthQuery {
  return {
    id: `query-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    tenantId,
    facilityId,
    userId,
    queryType,
    description
  };
}
