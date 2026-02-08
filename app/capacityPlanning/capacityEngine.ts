/**
 * CAPACITY ENGINE
 * Phase 56: Capacity Planning & Resource Forecasting
 * 
 * Main orchestrator: baseline extraction, projection computation, policy evaluation, query execution.
 * 
 * NO GENERATIVE AI. NO PROBABILISTIC PREDICTION.
 */

import {
  CapacityQuery,
  CapacityResult,
  CapacityProjection,
  CapacityRiskWindow,
  CapacityBaseline,
  CapacityPolicyContext,
  HistoricalMetricsInput,
  RealTimeSignalsInput,
  CapacityProjectionCategory,
  CapacityTimeWindow,
  ProjectionMethod,
} from './capacityTypes';
import { CapacityAggregator } from './capacityAggregator';
import { CapacityPolicyEngine } from './capacityPolicyEngine';
import { CapacityLog } from './capacityLog';

// ============================================================================
// CAPACITY ENGINE
// ============================================================================

export class CapacityEngine {
  private aggregator: CapacityAggregator;
  private policyEngine: CapacityPolicyEngine;
  private log: CapacityLog;

  constructor() {
    this.aggregator = new CapacityAggregator();
    this.policyEngine = new CapacityPolicyEngine();
    this.log = new CapacityLog();
  }

  // ==========================================================================
  // QUERY EXECUTION
  // ==========================================================================

  /**
   * Execute capacity query
   */
  async executeQuery(
    query: CapacityQuery,
    historicalMetrics: HistoricalMetricsInput[],
    realTimeSignals: RealTimeSignalsInput[],
    context: CapacityPolicyContext
  ): Promise<CapacityResult> {
    const startTime = Date.now();

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
        this.log.logError({
          scope: query.scope,
          errorCode: 'POLICY_VIOLATION',
          message: policyDecision.reason,
          details: {
            violations: policyDecision.violations,
          },
        });

        throw new Error(`Policy violation: ${policyDecision.reason}`);
      }

      // Step 2: Extract baseline (if requested)
      let baseline: CapacityBaseline | null = null;
      if (query.includeBaseline) {
        baseline = this.aggregator.computeBaseline(historicalMetrics, query.scope);
        this.log.logBaselineComputed({
          baseline,
        });
      }

      // Step 3: Compute projections
      const projections: CapacityProjection[] = [];

      const categories = query.categories || [];
      const timeWindows = query.timeWindows || [];
      const methods = query.methods || [];
      
      for (const category of categories) {
        for (const timeWindow of timeWindows) {
          for (const method of methods) {
            const projection = await this.computeProjection(
              category,
              timeWindow,
              method,
              historicalMetrics,
              realTimeSignals,
              baseline,
              query.scope,
              context
            );

            if (projection) {
              projections.push(projection);
              this.log.logProjectionComputed({
                projection,
              });
            }
          }
        }
      }

      // Step 4: Filter projections by visibility policy
      const visibleProjections = projections.filter(proj =>
        this.policyEngine.evaluateProjectionVisibility(proj, context)
      );

      // Step 5: Identify risk windows (if requested)
      const riskWindows: CapacityRiskWindow[] = [];
      if (query.includeRiskWindows) {
        const identifiedRisks = this.identifyRisks(visibleProjections, baseline, query.scope);
        
        for (const risk of identifiedRisks) {
          if (this.policyEngine.evaluateRiskVisibility(risk, context)) {
            riskWindows.push(risk);
            this.log.logRiskIdentified({
              risk,
            });
          }
        }
      }

      // Step 6: Build result
      const result: CapacityResult = {
        resultId: `result-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        query,
        baseline: baseline || undefined,
        projections: visibleProjections,
        riskWindows,
        summary: {
          totalProjections: visibleProjections.length,
          totalRisks: riskWindows.length,
          criticalRisks: riskWindows.filter(r => r.severity === 'critical').length,
          highRisks: riskWindows.filter(r => r.severity === 'high').length,
          averageConfidence: this.calculateAverageConfidence(visibleProjections),
          projectionRange: {
            minValue: 0,
            maxValue: 100,
            unit: 'various',
          },
        },
        references: {
          metricsUsed: historicalMetrics.map(m => m.metricsId),
          realTimeSignalsUsed: realTimeSignals.map(s => s.signalId),
          tasksAnalyzed: this.countTasksAnalyzed(historicalMetrics),
          alertsAnalyzed: this.countAlertsAnalyzed(historicalMetrics),
          timeRangeCovered: {
            start: historicalMetrics.length > 0 ? historicalMetrics[0].timeRange.start : new Date().toISOString(),
            end: historicalMetrics.length > 0 ? historicalMetrics[historicalMetrics.length - 1].timeRange.end : new Date().toISOString(),
            durationHours: this.calculateTimeRangeHours(historicalMetrics),
          },
        },
        metadata: {
          computedAt: new Date().toISOString(),
          computationTimeMs: Date.now() - startTime,
          dataSourcesQueried: ['historical-metrics', 'real-time-signals'],
        },
        success: true,
      };

      // Log query execution
      this.log.logQueryExecuted({
        query,
        projectionsComputed: visibleProjections.length,
        risksIdentified: riskWindows.length,
      });

      return result;

    } catch (error) {
      this.log.logError({
        scope: query.scope,
        errorCode: 'QUERY_EXECUTION_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: {
          query: query.queryId,
          categories: query.categories,
        },
      });

      throw error;
    }
  }

  // ==========================================================================
  // PROJECTION COMPUTATION
  // ==========================================================================

  private async computeProjection(
    category: CapacityProjectionCategory,
    timeWindow: CapacityTimeWindow,
    method: ProjectionMethod,
    historicalMetrics: HistoricalMetricsInput[],
    realTimeSignals: RealTimeSignalsInput[],
    baseline: CapacityBaseline | null,
    scope: CapacityQuery['scope'],
    context: CapacityPolicyContext
  ): Promise<CapacityProjection | null> {
    try {
      switch (category) {
        case 'operator-workload':
          return this.aggregator.computeOperatorWorkloadProjection(
            historicalMetrics,
            realTimeSignals[realTimeSignals.length - 1] || null,
            baseline,
            timeWindow,
            method,
            scope
          );

        case 'task-volume':
          return this.aggregator.computeTaskVolumeProjection(
            historicalMetrics,
            realTimeSignals[realTimeSignals.length - 1] || null,
            baseline,
            timeWindow,
            method,
            scope
          );

        case 'alert-volume':
          return this.aggregator.computeAlertVolumeProjection(
            historicalMetrics,
            realTimeSignals[realTimeSignals.length - 1] || null,
            baseline,
            timeWindow,
            method,
            scope
          );

        case 'sla-risk':
          return this.computeSLARiskProjection(
            historicalMetrics,
            realTimeSignals,
            baseline,
            timeWindow,
            method,
            scope
          );

        case 'remediation-backlog':
          return this.computeRemediationBacklogProjection(
            historicalMetrics,
            realTimeSignals,
            baseline,
            timeWindow,
            method,
            scope
          );

        case 'cross-engine-correlation':
          // Check permission
          if (!context.permissions.includes('capacity:view-cross-engine')) {
            return null;
          }
          return this.computeCrossEngineProjection(
            historicalMetrics,
            realTimeSignals,
            baseline,
            timeWindow,
            method,
            scope
          );

        case 'resource-utilization':
          // Check permission
          if (!context.permissions.includes('capacity:view-resource-utilization')) {
            return null;
          }
          return this.computeResourceUtilizationProjection(
            historicalMetrics,
            realTimeSignals,
            baseline,
            timeWindow,
            method,
            scope
          );

        default:
          return null;
      }
    } catch (error) {
      this.log.logError({
        scope,
        errorCode: 'PROJECTION_COMPUTATION_FAILED',
        message: `Failed to compute ${category} projection: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: {
          category,
          timeWindow,
          method,
        },
      });
      return null;
    }
  }

  private computeSLARiskProjection(
    historicalMetrics: HistoricalMetricsInput[],
    realTimeSignals: RealTimeSignalsInput[],
    baseline: CapacityBaseline | null,
    timeWindow: CapacityTimeWindow,
    method: ProjectionMethod,
    scope: CapacityQuery['scope']
  ): CapacityProjection {
    // Extract SLA adherence values
    const slaValues = historicalMetrics
      .filter(m => m.slaAdherence !== undefined)
      .map(m => m.slaAdherence!);

    // Apply projection method
    let projectedSLA: number;
    let projectedMin: number;
    let projectedMax: number;

    if (method === 'rolling-average') {
      const result = this.aggregator.computeRollingAverage(slaValues);
      projectedSLA = result.value;
      projectedMin = result.min;
      projectedMax = result.max;
    } else if (method === 'weighted-average') {
      const result = this.aggregator.computeWeightedAverage(slaValues);
      projectedSLA = result.value;
      projectedMin = result.min;
      projectedMax = result.max;
    } else if (method === 'trend-slope') {
      const result = this.aggregator.computeTrendSlope(slaValues);
      projectedSLA = result.value;
      projectedMin = result.min;
      projectedMax = result.max;
    } else {
      projectedSLA = slaValues.length > 0 ? slaValues[slaValues.length - 1] : 95;
      projectedMin = Math.min(...slaValues);
      projectedMax = Math.max(...slaValues);
    }

    const baselineValue = baseline?.averageSLAAdherence || 95;
    const delta = projectedSLA - baselineValue;
    const deltaPercentage = (delta / baselineValue) * 100;

    return {
      projectionId: `proj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      category: 'sla-risk',
      timeWindow,
      method,
      scope,
      projectedValue: projectedSLA,
      projectedMin,
      projectedMax,
      unit: '%',
      baselineValue,
      deltaFromBaseline: delta,
      deltaPercentage,
      trendDirection: delta > 0.5 ? 'increasing' : delta < -0.5 ? 'decreasing' : 'stable',
      trendSlope: delta,
      dataPoints: slaValues.length,
      confidenceLevel: slaValues.length >= 50 ? 'high' : slaValues.length >= 20 ? 'medium' : 'low',
      computedAt: new Date().toISOString(),
      validUntil: this.aggregator['calculateValidUntil'](timeWindow),
    };
  }

  private computeRemediationBacklogProjection(
    historicalMetrics: HistoricalMetricsInput[],
    realTimeSignals: RealTimeSignalsInput[],
    baseline: CapacityBaseline | null,
    timeWindow: CapacityTimeWindow,
    method: ProjectionMethod,
    scope: CapacityQuery['scope']
  ): CapacityProjection {
    // Extract pending tasks - estimate from task throughput
    const pendingTasks = historicalMetrics.map(m => m.taskThroughput * 0.1); // Estimate 10% backlog

    // Apply projection method
    let projectedBacklog: number;
    let projectedMin: number;
    let projectedMax: number;

    if (method === 'rolling-average') {
      const result = this.aggregator.computeRollingAverage(pendingTasks);
      projectedBacklog = result.value;
      projectedMin = result.min;
      projectedMax = result.max;
    } else if (method === 'trend-slope') {
      const result = this.aggregator.computeTrendSlope(pendingTasks);
      projectedBacklog = result.value;
      projectedMin = result.min;
      projectedMax = result.max;
    } else {
      projectedBacklog = pendingTasks.length > 0 ? pendingTasks[pendingTasks.length - 1] : 0;
      projectedMin = Math.min(...pendingTasks);
      projectedMax = Math.max(...pendingTasks);
    }

    const baselineValue = baseline ? baseline.averageTasksPerHour * 0.1 : 10; // Estimate 10% backlog
    const delta = projectedBacklog - baselineValue;
    const deltaPercentage = baselineValue > 0 ? (delta / baselineValue) * 100 : 0;

    return {
      projectionId: `proj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      category: 'remediation-backlog',
      timeWindow,
      method,
      scope,
      projectedValue: projectedBacklog,
      projectedMin,
      projectedMax,
      unit: 'tasks',
      baselineValue,
      deltaFromBaseline: delta,
      deltaPercentage,
      trendDirection: delta > 5 ? 'increasing' : delta < -5 ? 'decreasing' : 'stable',
      trendSlope: delta,
      dataPoints: pendingTasks.length,
      confidenceLevel: pendingTasks.length >= 50 ? 'high' : pendingTasks.length >= 20 ? 'medium' : 'low',
      computedAt: new Date().toISOString(),
      validUntil: this.aggregator['calculateValidUntil'](timeWindow),
    };
  }

  private computeCrossEngineProjection(
    historicalMetrics: HistoricalMetricsInput[],
    realTimeSignals: RealTimeSignalsInput[],
    baseline: CapacityBaseline | null,
    timeWindow: CapacityTimeWindow,
    method: ProjectionMethod,
    scope: CapacityQuery['scope']
  ): CapacityProjection {
    // Analyze correlation between alerts and tasks
    const correlationScores: number[] = [];

    for (let i = 0; i < historicalMetrics.length - 1; i++) {
      const current = historicalMetrics[i];
      const next = historicalMetrics[i + 1];

      // Simple correlation: high alerts followed by high tasks
      const alertIncrease = (next.alertVolume || 0) - (current.alertVolume || 0);
      const taskIncrease = (next.taskThroughput || 0) - (current.taskThroughput || 0);

      if (alertIncrease > 0 && taskIncrease > 0) {
        correlationScores.push(1);
      } else if (alertIncrease < 0 && taskIncrease < 0) {
        correlationScores.push(1);
      } else {
        correlationScores.push(0);
      }
    }

    const averageCorrelation = correlationScores.length > 0
      ? correlationScores.reduce((a, b) => a + b, 0) / correlationScores.length
      : 0.5;

    return {
      projectionId: `proj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      category: 'cross-engine-correlation',
      timeWindow,
      method,
      scope,
      projectedValue: averageCorrelation * 100,
      projectedMin: 0,
      projectedMax: 100,
      unit: '%',
      baselineValue: 50,
      deltaFromBaseline: (averageCorrelation * 100) - 50,
      deltaPercentage: ((averageCorrelation * 100) - 50) / 50 * 100,
      trendDirection: 'stable',
      trendSlope: 0,
      dataPoints: correlationScores.length,
      confidenceLevel: correlationScores.length >= 30 ? 'high' : correlationScores.length >= 10 ? 'medium' : 'low',
      computedAt: new Date().toISOString(),
      validUntil: this.aggregator['calculateValidUntil'](timeWindow),
    };
  }

  private computeResourceUtilizationProjection(
    historicalMetrics: HistoricalMetricsInput[],
    realTimeSignals: RealTimeSignalsInput[],
    baseline: CapacityBaseline | null,
    timeWindow: CapacityTimeWindow,
    method: ProjectionMethod,
    scope: CapacityQuery['scope']
  ): CapacityProjection {
    // Calculate resource utilization based on operator workload
    const workloadValues = historicalMetrics.flatMap(m =>
      Object.values(m.operatorWorkload || {})
    );

    // Apply projection method
    let projectedUtilization: number;
    let projectedMin: number;
    let projectedMax: number;

    if (method === 'rolling-average') {
      const result = this.aggregator.computeRollingAverage(workloadValues);
      projectedUtilization = result.value;
      projectedMin = result.min;
      projectedMax = result.max;
    } else if (method === 'trend-slope') {
      const result = this.aggregator.computeTrendSlope(workloadValues);
      projectedUtilization = result.value;
      projectedMin = result.min;
      projectedMax = result.max;
    } else {
      projectedUtilization = workloadValues.length > 0 ? workloadValues[workloadValues.length - 1] : 50;
      projectedMin = Math.min(...workloadValues);
      projectedMax = Math.max(...workloadValues);
    }

    const baselineValue = baseline?.averageOperatorLoad || 50;
    const delta = projectedUtilization - baselineValue;
    const deltaPercentage = (delta / baselineValue) * 100;

    return {
      projectionId: `proj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      category: 'resource-utilization',
      timeWindow,
      method,
      scope,
      projectedValue: projectedUtilization,
      projectedMin,
      projectedMax,
      unit: '%',
      baselineValue,
      deltaFromBaseline: delta,
      deltaPercentage,
      trendDirection: delta > 5 ? 'increasing' : delta < -5 ? 'decreasing' : 'stable',
      trendSlope: delta,
      dataPoints: workloadValues.length,
      confidenceLevel: workloadValues.length >= 50 ? 'high' : workloadValues.length >= 20 ? 'medium' : 'low',
      computedAt: new Date().toISOString(),
      validUntil: this.aggregator['calculateValidUntil'](timeWindow),
    };
  }

  // ==========================================================================
  // RISK IDENTIFICATION
  // ==========================================================================

  private identifyRisks(
    projections: CapacityProjection[],
    baseline: CapacityBaseline | null,
    scope: CapacityQuery['scope']
  ): CapacityRiskWindow[] {
    const risks: CapacityRiskWindow[] = [];

    // Identify SLA risk windows
    if (baseline) {
      const slaRisks = this.aggregator.identifySLARiskWindows(projections, baseline, scope);
      risks.push(...slaRisks);
    }

    // Identify backlog risk
    const taskProj = projections.find(p => p.category === 'task-volume');
    const workloadProj = projections.find(p => p.category === 'operator-workload');

    if (taskProj && workloadProj) {
      const backlogRisk = this.aggregator.identifyBacklogRisk(taskProj, workloadProj, scope);
      if (backlogRisk) {
        risks.push(backlogRisk);
      }
    }

    return risks;
  }

  private isRelatedToRisk(projection: CapacityProjection, risk: CapacityRiskWindow): boolean {
    // Simple heuristic: projection category matches risk type
    if (risk.riskType === 'sla-breach' && projection.category === 'sla-risk') return true;
    if (risk.riskType === 'overload' && projection.category === 'operator-workload') return true;
    if (risk.riskType === 'backlog-accumulation' && projection.category === 'task-volume') return true;
    if (risk.riskType === 'resource-exhaustion' && projection.category === 'resource-utilization') return true;
    return false;
  }

  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================

  private calculateAverageConfidence(projections: CapacityProjection[]): number {
    if (projections.length === 0) return 0;

    const confidenceMap = { high: 3, medium: 2, low: 1 };
    const totalConfidence = projections.reduce((sum, p) => sum + confidenceMap[p.confidenceLevel], 0);
    const averageConfidence = totalConfidence / projections.length;

    return Math.round((averageConfidence / 3) * 100);
  }

  private getEarliestProjectionTime(projections: CapacityProjection[]): string {
    if (projections.length === 0) return new Date().toISOString();
    const times = projections.map(p => new Date(p.computedAt).getTime());
    return new Date(Math.min(...times)).toISOString();
  }

  private getLatestProjectionTime(projections: CapacityProjection[]): string {
    if (projections.length === 0) return new Date().toISOString();
    const times = projections.map(p => new Date(p.validUntil).getTime());
    return new Date(Math.max(...times)).toISOString();
  }

  private countTasksAnalyzed(historicalMetrics: HistoricalMetricsInput[]): number {
    return historicalMetrics.reduce((sum, m) => sum + (m.taskThroughput || 0), 0);
  }

  private countAlertsAnalyzed(historicalMetrics: HistoricalMetricsInput[]): number {
    return historicalMetrics.reduce((sum, m) => sum + (m.alertVolume || 0), 0);
  }

  private calculateTimeRangeHours(historicalMetrics: HistoricalMetricsInput[]): number {
    if (historicalMetrics.length === 0) return 0;

    const timestamps = historicalMetrics.map(m => new Date(m.timeRange.start).getTime());
    const min = Math.min(...timestamps);
    const max = Math.max(...timestamps);
    const hours = Math.round((max - min) / (1000 * 60 * 60));

    return hours;
  }

  // ==========================================================================
  // PUBLIC ACCESS METHODS
  // ==========================================================================

  /**
   * Get capacity log
   */
  getLog(): CapacityLog {
    return this.log;
  }

  /**
   * Get capacity aggregator
   */
  getAggregator(): CapacityAggregator {
    return this.aggregator;
  }

  /**
   * Get capacity policy engine
   */
  getPolicyEngine(): CapacityPolicyEngine {
    return this.policyEngine;
  }
}
