/**
 * INSIGHTS ENGINE
 * Phase 58: Executive Insights
 * 
 * Main orchestrator. Query → Aggregate → Policy → Log.
 * 
 * NO GENERATIVE AI. NO PREDICTIONS. NO SYNTHETIC DATA.
 */

import {
  InsightQuery,
  InsightResult,
  InsightSummary,
  InsightTrend,
  InsightCorrelation,
  InsightsPolicyContext,
  AggregatedDataInput,
} from './insightsTypes';
import { InsightsAggregator } from './insightsAggregator';
import { InsightsPolicyEngine } from './insightsPolicyEngine';
import { InsightsLog } from './insightsLog';

// ============================================================================
// INSIGHTS ENGINE
// ============================================================================

export class InsightsEngine {
  private aggregator: InsightsAggregator;
  private policyEngine: InsightsPolicyEngine;
  private log: InsightsLog;

  constructor() {
    this.aggregator = new InsightsAggregator();
    this.policyEngine = new InsightsPolicyEngine();
    this.log = new InsightsLog();
  }

  // ==========================================================================
  // MAIN EXECUTION METHOD
  // ==========================================================================

  /**
   * Execute insight query
   * 
   * NO GENERATIVE AI. Deterministic aggregation from real engine outputs.
   */
  executeQuery(
    query: InsightQuery,
    context: InsightsPolicyContext,
    data: AggregatedDataInput,
  ): InsightResult {
    const computeStart = Date.now();

    try {
      // Step 1: Evaluate policy
      const policyDecision = this.policyEngine.evaluateQueryPolicy(query, context);
      this.log.logPolicyDecision({
        queryId: query.queryId,
        scope: query.scope,
        allowed: policyDecision.allowed,
        reason: policyDecision.reason,
        violations: policyDecision.violations,
        warnings: policyDecision.warnings,
      });

      if (!policyDecision.allowed) {
        return this.createErrorResult(
          query,
          computeStart,
          `Policy violation: ${policyDecision.reason}`,
        );
      }

      // Step 2: Filter data by scope
      const filteredData = this.filterDataByScope(data, query.scope, context);

      // Step 3: Determine time period
      const { periodStart, periodEnd } = this.getTimePeriod(query.timePeriod, query.customTimeRange);

      // Step 4: Generate summaries
      const summaries: InsightSummary[] = [];
      
      for (const category of query.categories) {
        let summary: InsightSummary | null = null;

        switch (category) {
          case 'cross-engine-operational':
            summary = this.aggregator.generateCrossEngineOperationalSummary(filteredData, periodStart, periodEnd);
            break;

          case 'tenant-performance':
            if (query.scope.tenantId) {
              summary = this.aggregator.generateTenantPerformanceSummary(query.scope.tenantId, filteredData, periodStart, periodEnd);
            }
            break;

          case 'facility-performance':
            if (query.scope.tenantId && query.scope.facilityId) {
              summary = this.aggregator.generateFacilityPerformanceSummary(query.scope.tenantId, query.scope.facilityId, filteredData, periodStart, periodEnd);
            }
            break;

          case 'sla-compliance':
            summary = this.aggregator.generateSLAComplianceSummary(filteredData, periodStart, periodEnd);
            break;

          case 'risk-drift':
            summary = this.aggregator.generateRiskDriftSummary(filteredData, periodStart, periodEnd);
            break;

          case 'capacity-scheduling':
            summary = this.aggregator.generateCapacitySchedulingSummary(filteredData, periodStart, periodEnd);
            break;

          case 'operator-performance':
            summary = this.aggregator.generateOperatorPerformanceSummary(filteredData, periodStart, periodEnd);
            break;

          case 'governance-documentation':
            summary = this.aggregator.generateGovernanceDocumentationSummary(filteredData, periodStart, periodEnd);
            break;
        }

        if (summary && this.policyEngine.evaluateSummaryVisibility(summary, context)) {
          summaries.push(summary);
        }
      }

      // Step 5: Generate trends (if requested)
      const trends: InsightTrend[] = [];
      if (query.includeTrends) {
        // Would analyze historical data for trends
        // For now, return empty array as we don't have historical data
      }

      // Step 6: Generate correlations (if requested)
      const correlations: InsightCorrelation[] = [];
      if (query.includeCorrelations) {
        // Analyze correlations between summaries
        const correlation = this.findCorrelations(summaries);
        if (correlation) {
          correlations.push(correlation);
          this.log.logCorrelationDetected({ correlation });
        }
      }

      // Step 7: Create result
      const result: InsightResult = {
        resultId: `result-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        query,
        summaries,
        trends: query.includeTrends ? trends : undefined,
        correlations: query.includeCorrelations ? correlations : undefined,
        references: {
          metricsUsed: (data.operatorMetrics || []).map(m => m.operatorId),
          signalsUsed: (data.realTimeSignals || []).map(s => s.signalId),
          projectionsUsed: (data.capacityProjections || []).map(p => p.projectionId),
          schedulesUsed: (data.schedules || []).map(s => s.scheduleId),
          tasksUsed: (data.tasks || []).map(t => t.taskId),
          alertsUsed: (data.alerts || []).map(a => a.alertId),
          driftsUsed: (data.driftEvents || []).map(d => d.driftId),
          auditFindingsUsed: (data.auditFindings || []).map(f => f.findingId),
        },
        metadata: {
          computedAt: new Date().toISOString(),
          computationTimeMs: Date.now() - computeStart,
          dataSourcesQueried: this.getDataSourcesQueried(data),
          aggregationLevel: query.aggregationLevel || 'tenant',
        },
        success: true,
      };

      // Step 8: Log result
      this.log.logInsightGenerated({
        result,
        summariesGenerated: summaries.length,
        trendsGenerated: trends.length,
        correlationsGenerated: correlations.length,
      });

      return result;
    } catch (error) {
      this.log.logError({
        scope: query.scope,
        errorCode: 'INSIGHTS_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: { query, error },
      });

      return this.createErrorResult(
        query,
        computeStart,
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================

  private filterDataByScope(
    data: AggregatedDataInput,
    scope: { tenantId?: string; facilityId?: string; federationId?: string },
    context: InsightsPolicyContext,
  ): AggregatedDataInput {
    // Determine effective tenant ID
    const effectiveTenantId = scope.tenantId || context.userTenantId;

    return {
      auditFindings: (data.auditFindings || []).filter(f =>
        (!scope.tenantId || f.tenantId === effectiveTenantId) &&
        (!scope.facilityId || f.facilityId === scope.facilityId)
      ),
      driftEvents: (data.driftEvents || []).filter(d =>
        (!scope.tenantId || d.tenantId === effectiveTenantId) &&
        (!scope.facilityId || d.facilityId === scope.facilityId)
      ),
      alerts: (data.alerts || []).filter(a =>
        (!scope.tenantId || a.tenantId === effectiveTenantId) &&
        (!scope.facilityId || a.facilityId === scope.facilityId)
      ),
      tasks: (data.tasks || []).filter(t =>
        (!scope.tenantId || t.tenantId === effectiveTenantId) &&
        (!scope.facilityId || t.facilityId === scope.facilityId)
      ),
      operatorMetrics: (data.operatorMetrics || []).filter(o =>
        (!scope.tenantId || o.tenantId === effectiveTenantId) &&
        (!scope.facilityId || o.facilityId === scope.facilityId)
      ),
      realTimeSignals: (data.realTimeSignals || []).filter(s =>
        (!scope.tenantId || s.tenantId === effectiveTenantId) &&
        (!scope.facilityId || s.facilityId === scope.facilityId)
      ),
      capacityProjections: (data.capacityProjections || []).filter(p =>
        (!scope.tenantId || p.tenantId === effectiveTenantId) &&
        (!scope.facilityId || p.facilityId === scope.facilityId)
      ),
      schedules: (data.schedules || []).filter(s =>
        (!scope.tenantId || s.tenantId === effectiveTenantId) &&
        (!scope.facilityId || s.facilityId === scope.facilityId)
      ),
    };
  }

  private getTimePeriod(
    timePeriod: string,
    customTimeRange?: { start: string; end: string },
  ): { periodStart: string; periodEnd: string } {
    const now = new Date();
    let periodStart: Date;
    const periodEnd = now;

    if (timePeriod === 'custom' && customTimeRange) {
      return {
        periodStart: customTimeRange.start,
        periodEnd: customTimeRange.end,
      };
    }

    const periodMap: Record<string, number> = {
      '1h': 3600000,
      '6h': 21600000,
      '24h': 86400000,
      '7d': 604800000,
      '30d': 2592000000,
    };

    const milliseconds = periodMap[timePeriod] || 86400000;
    periodStart = new Date(now.getTime() - milliseconds);

    return {
      periodStart: periodStart.toISOString(),
      periodEnd: periodEnd.toISOString(),
    };
  }

  private findCorrelations(summaries: InsightSummary[]): InsightCorrelation | null {
    // Example: Find correlation between capacity utilization and task completion
    const capacitySummary = summaries.find(s => s.category === 'capacity-scheduling');
    const tenantSummary = summaries.find(s => s.category === 'tenant-performance');

    if (capacitySummary && tenantSummary && 
        capacitySummary.category === 'capacity-scheduling' &&
        tenantSummary.category === 'tenant-performance') {
      return this.aggregator.analyzeCorrelation(
        'Phase 56: Capacity Planning',
        'Average Capacity Utilization',
        capacitySummary.averageCapacityUtilization,
        'Phase 53: Task Management',
        'Task Completion Rate',
        tenantSummary.taskCompletionRate,
      );
    }

    return null;
  }

  private getDataSourcesQueried(data: AggregatedDataInput): string[] {
    const sources: string[] = [];

    if (data.auditFindings && data.auditFindings.length > 0) sources.push('Phase 50: Compliance Auditor');
    if (data.driftEvents && data.driftEvents.length > 0) sources.push('Phase 51: Integrity Engine');
    if (data.alerts && data.alerts.length > 0) sources.push('Phase 52: Alert Aggregation');
    if (data.tasks && data.tasks.length > 0) sources.push('Phase 53: Task Management');
    if (data.operatorMetrics && data.operatorMetrics.length > 0) sources.push('Phase 54: Operator Analytics');
    if (data.realTimeSignals && data.realTimeSignals.length > 0) sources.push('Phase 55: Real-Time Monitoring');
    if (data.capacityProjections && data.capacityProjections.length > 0) sources.push('Phase 56: Capacity Planning');
    if (data.schedules && data.schedules.length > 0) sources.push('Phase 57: Workload Orchestration');

    return sources;
  }

  private createErrorResult(
    query: InsightQuery,
    computeStart: number,
    errorMessage: string,
  ): InsightResult {
    return {
      resultId: `result-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      query,
      summaries: [],
      references: {
        metricsUsed: [],
        signalsUsed: [],
        projectionsUsed: [],
        schedulesUsed: [],
        tasksUsed: [],
        alertsUsed: [],
        driftsUsed: [],
        auditFindingsUsed: [],
      },
      metadata: {
        computedAt: new Date().toISOString(),
        computationTimeMs: Date.now() - computeStart,
        dataSourcesQueried: ['error'],
        aggregationLevel: query.aggregationLevel || 'tenant',
      },
      success: false,
      error: errorMessage,
    };
  }

  // ==========================================================================
  // LOG ACCESS METHODS
  // ==========================================================================

  getLog(): InsightsLog {
    return this.log;
  }

  getStatistics() {
    return this.log.getStatistics();
  }
}
