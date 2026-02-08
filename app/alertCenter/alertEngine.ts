/**
 * Phase 52: Unified Alerting & Notification Center — Alert Engine
 * 
 * Main orchestrator coordinating routing, aggregation, and policy evaluation.
 * Accepts AlertQuery objects and returns AlertResult.
 */

import { AlertRouter } from './alertRouter';
import { AlertAggregator } from './alertAggregator';
import { AlertPolicyEngine } from './alertPolicyEngine';
import { AlertLog } from './alertLog';
import type {
  Alert,
  AlertQuery,
  AlertResult,
  AlertPolicyContext,
  AlertCategory,
  AlertSeverity,
  AlertSource,
  AlertStatistics,
  AlertPolicyStatistics,
} from './alertTypes';

// ============================================================================
// ALERT ENGINE
// ============================================================================

export class AlertEngine {
  private tenantId: string;
  private router: AlertRouter;
  private aggregator: AlertAggregator;
  private policyEngine: AlertPolicyEngine;
  private alertLog: AlertLog;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
    this.router = new AlertRouter(tenantId);
    this.aggregator = new AlertAggregator();
    this.policyEngine = new AlertPolicyEngine();
    this.alertLog = new AlertLog();
  }

  // ==========================================================================
  // MAIN QUERY METHOD
  // ==========================================================================

  /**
   * Execute an alert query.
   */
  async executeQuery(
    query: AlertQuery,
    policyContext: AlertPolicyContext,
    engineAlerts?: {
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
    }
  ): Promise<AlertResult> {
    const startTime = Date.now();

    try {
      // Step 1: Authorize query
      const policyDecision = this.policyEngine.authorizeQuery(query, policyContext);
      if (!policyDecision.authorized) {
        return this.createErrorResult(
          query,
          `Authorization failed: ${policyDecision.reason}`,
          startTime
        );
      }

      // Step 2: Route alerts from all engines
      const routedAlerts = this.routeAlerts(engineAlerts || {}, policyContext);

      // Step 3: Filter alerts based on query
      let filteredAlerts = this.filterAlerts(routedAlerts, query, policyDecision);

      // Step 4: Merge duplicates
      if (!query.options?.includeSuppressed) {
        filteredAlerts = filteredAlerts.filter(alert => alert.status !== 'suppressed');
      }
      filteredAlerts = this.aggregator.mergeDuplicates(filteredAlerts);

      // Step 5: Sort alerts
      const sortBy = query.options?.sortBy || 'severity';
      const sortOrder = query.options?.sortOrder || 'desc';
      filteredAlerts = this.aggregator.sortAlerts(filteredAlerts, sortBy, sortOrder);

      // Step 6: Apply max limit
      if (query.options?.maxAlerts) {
        filteredAlerts = filteredAlerts.slice(0, query.options.maxAlerts);
      }

      // Step 7: Group alerts (if requested)
      let groups = undefined;
      if (query.options?.groupBy) {
        groups = this.groupAlerts(filteredAlerts, query.options.groupBy);
        // Log groups
        for (const group of groups) {
          this.alertLog.logGroup(group, policyContext.performedBy);
        }
      }

      // Step 8: Calculate summary
      const summary = this.calculateSummary(filteredAlerts);

      // Step 9: Create result
      const result: AlertResult = {
        resultId: `result-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        query,
        alerts: filteredAlerts,
        groups,
        totalAlerts: filteredAlerts.length,
        newAlerts: filteredAlerts.filter(a => a.status === 'new').length,
        summary,
        metadata: {
          executionTime: Date.now() - startTime,
          evaluatedEngines: this.getEvaluatedEngines(engineAlerts || {}),
          scope: query.scope,
          queriedAt: query.triggeredAt,
          completedAt: new Date().toISOString(),
        },
        success: true,
      };

      // Step 10: Log query
      this.alertLog.logQuery(
        query,
        result.resultId,
        result.totalAlerts,
        policyContext.performedBy,
        true
      );

      // Step 11: Log alerts
      for (const alert of filteredAlerts) {
        this.alertLog.logAlert(alert, policyContext.performedBy);
      }

      return result;
    } catch (error) {
      this.alertLog.logError(
        'executeQuery',
        error as Error,
        policyContext.tenantId,
        policyContext.performedBy
      );
      return this.createErrorResult(query, (error as Error).message, startTime);
    }
  }

  // ==========================================================================
  // ROUTING
  // ==========================================================================

  /**
   * Route alerts from all engines.
   */
  private routeAlerts(
    engineAlerts: {
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
    },
    policyContext: AlertPolicyContext
  ): Alert[] {
    const routed = this.router.routeAll(engineAlerts);

    // Log routing events
    const engineKeys = Object.keys(engineAlerts) as (keyof typeof engineAlerts)[];
    for (const key of engineKeys) {
      const alerts = engineAlerts[key];
      if (alerts && alerts.length > 0) {
        const sourceEngine = this.mapEngineKeyToSource(key);
        this.alertLog.logRouting(
          sourceEngine,
          alerts.length,
          0, // Filtering done later
          policyContext.tenantId,
          policyContext.performedBy
        );
      }
    }

    return routed;
  }

  /**
   * Map engine key to AlertSource.
   */
  private mapEngineKeyToSource(key: string): AlertSource {
    const mapping: Record<string, AlertSource> = {
      integrityMonitor: 'integrity-monitor',
      auditor: 'auditor',
      healthEngine: 'health-engine',
      governance: 'governance-system',
      governanceLineage: 'governance-lineage',
      fabric: 'knowledge-fabric',
      documentation: 'documentation-bundler',
      intelligenceHub: 'intelligence-hub',
      simulation: 'simulation-engine',
      timeline: 'timeline-system',
      analytics: 'analytics-engine',
      compliance: 'compliance-engine',
    };
    return mapping[key] || 'compliance-engine';
  }

  // ==========================================================================
  // FILTERING
  // ==========================================================================

  /**
   * Filter alerts based on query and policy decision.
   */
  private filterAlerts(
    alerts: Alert[],
    query: AlertQuery,
    policyDecision: { deniedCategories?: AlertCategory[]; deniedSources?: AlertSource[] }
  ): Alert[] {
    let filtered = alerts;

    // Filter by categories
    if (query.categories && query.categories.length > 0) {
      filtered = filtered.filter(alert => {
        const allowed = query.categories!.includes(alert.category);
        const notDenied = !policyDecision.deniedCategories?.includes(alert.category);
        return allowed && notDenied;
      });
    } else if (policyDecision.deniedCategories && policyDecision.deniedCategories.length > 0) {
      filtered = filtered.filter(
        alert => !policyDecision.deniedCategories!.includes(alert.category)
      );
    }

    // Filter by severities
    if (query.severities && query.severities.length > 0) {
      filtered = filtered.filter(alert => query.severities!.includes(alert.severity));
    }

    // Filter by sources
    if (query.sources && query.sources.length > 0) {
      filtered = filtered.filter(alert => {
        const allowed = query.sources!.includes(alert.source);
        const notDenied = !policyDecision.deniedSources?.includes(alert.source);
        return allowed && notDenied;
      });
    } else if (policyDecision.deniedSources && policyDecision.deniedSources.length > 0) {
      filtered = filtered.filter(alert => !policyDecision.deniedSources!.includes(alert.source));
    }

    // Filter by status
    if (query.status && query.status.length > 0) {
      filtered = filtered.filter(alert => query.status!.includes(alert.status));
    }

    // Filter by entity
    if (query.entityId && query.entityType) {
      filtered = filtered.filter(alert =>
        alert.affectedEntities.some(
          entity => entity.entityId === query.entityId && entity.entityType === query.entityType
        )
      );
    }

    // Filter by date range
    if (query.dateRange) {
      const start = new Date(query.dateRange.start);
      const end = new Date(query.dateRange.end);
      filtered = filtered.filter(alert => {
        const detectedDate = new Date(alert.detectedAt);
        return detectedDate >= start && detectedDate <= end;
      });
    }

    // Filter by facility (if specified in scope)
    if (query.scope.facilityId) {
      filtered = filtered.filter(
        alert => alert.scope.facilityId === query.scope.facilityId
      );
    }

    // Filter by room (if specified in scope)
    if (query.scope.roomId) {
      filtered = filtered.filter(alert => alert.scope.roomId === query.scope.roomId);
    }

    return filtered;
  }

  // ==========================================================================
  // GROUPING
  // ==========================================================================

  /**
   * Group alerts by specified key.
   */
  private groupAlerts(
    alerts: Alert[],
    groupBy: 'category' | 'severity' | 'entity' | 'engine'
  ) {
    if (groupBy === 'category') {
      return this.aggregator.groupByCategory(alerts);
    } else if (groupBy === 'severity') {
      return this.aggregator.groupBySeverity(alerts);
    } else if (groupBy === 'entity') {
      return this.aggregator.groupByEntity(alerts);
    } else if (groupBy === 'engine') {
      return this.aggregator.groupByEngine(alerts);
    }
    return [];
  }

  // ==========================================================================
  // SUMMARY & STATISTICS
  // ==========================================================================

  /**
   * Calculate summary statistics for alerts.
   */
  private calculateSummary(alerts: Alert[]) {
    const alertsByCategory: Record<AlertCategory, number> = {} as any;
    const alertsBySeverity: Record<AlertSeverity, number> = {} as any;
    const alertsBySource: Record<AlertSource, number> = {} as any;

    for (const alert of alerts) {
      alertsByCategory[alert.category] = (alertsByCategory[alert.category] || 0) + 1;
      alertsBySeverity[alert.severity] = (alertsBySeverity[alert.severity] || 0) + 1;
      alertsBySource[alert.source] = (alertsBySource[alert.source] || 0) + 1;
    }

    const affectedEntitiesSet = new Set<string>();
    for (const alert of alerts) {
      for (const entity of alert.affectedEntities) {
        affectedEntitiesSet.add(`${entity.entityType}:${entity.entityId}`);
      }
    }

    return {
      alertsByCategory,
      alertsBySeverity,
      alertsBySource,
      affectedEntitiesCount: affectedEntitiesSet.size,
    };
  }

  /**
   * Get evaluated engines from engineAlerts.
   */
  private getEvaluatedEngines(engineAlerts: any): AlertSource[] {
    const sources: AlertSource[] = [];
    if (engineAlerts.integrityMonitor) sources.push('integrity-monitor');
    if (engineAlerts.auditor) sources.push('auditor');
    if (engineAlerts.healthEngine) sources.push('health-engine');
    if (engineAlerts.governance) sources.push('governance-system');
    if (engineAlerts.governanceLineage) sources.push('governance-lineage');
    if (engineAlerts.fabric) sources.push('knowledge-fabric');
    if (engineAlerts.documentation) sources.push('documentation-bundler');
    if (engineAlerts.intelligenceHub) sources.push('intelligence-hub');
    if (engineAlerts.simulation) sources.push('simulation-engine');
    if (engineAlerts.timeline) sources.push('timeline-system');
    if (engineAlerts.analytics) sources.push('analytics-engine');
    if (engineAlerts.compliance) sources.push('compliance-engine');
    return sources;
  }

  // ==========================================================================
  // ERROR HANDLING
  // ==========================================================================

  /**
   * Create error result.
   */
  private createErrorResult(query: AlertQuery, errorMessage: string, startTime: number): AlertResult {
    return {
      resultId: `result-error-${Date.now()}`,
      query,
      alerts: [],
      totalAlerts: 0,
      newAlerts: 0,
      summary: {
        alertsByCategory: {} as any,
        alertsBySeverity: {} as any,
        alertsBySource: {} as any,
        affectedEntitiesCount: 0,
      },
      metadata: {
        executionTime: Date.now() - startTime,
        evaluatedEngines: [],
        scope: query.scope,
        queriedAt: query.triggeredAt,
        completedAt: new Date().toISOString(),
      },
      success: false,
      error: errorMessage,
    };
  }

  // ==========================================================================
  // PUBLIC ACCESSORS
  // ==========================================================================

  /**
   * Get alert router.
   */
  getRouter(): AlertRouter {
    return this.router;
  }

  /**
   * Get alert aggregator.
   */
  getAggregator(): AlertAggregator {
    return this.aggregator;
  }

  /**
   * Get policy engine.
   */
  getPolicyEngine(): AlertPolicyEngine {
    return this.policyEngine;
  }

  /**
   * Get alert log.
   */
  getAlertLog(): AlertLog {
    return this.alertLog;
  }

  /**
   * Get statistics.
   */
  getStatistics(): AlertStatistics {
    return this.alertLog.getStatistics();
  }

  /**
   * Get policy statistics.
   */
  getPolicyStatistics(): AlertPolicyStatistics {
    return this.policyEngine.getPolicyStatistics();
  }
}
