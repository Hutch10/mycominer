/**
 * CAPACITY AGGREGATOR
 * Phase 56: Capacity Planning & Resource Forecasting
 * 
 * Compute deterministic projections using:
 * - Rolling averages
 * - Moving windows
 * - Baseline deltas
 * - Trend slopes (non-predictive)
 * 
 * NO GENERATIVE AI. NO PROBABILISTIC PREDICTION.
 * All projections derived from real historical data.
 */

import {
  CapacityBaseline,
  CapacityProjection,
  CapacityProjectionCategory,
  CapacityTimeWindow,
  ProjectionMethod,
  CapacityRiskWindow,
  CapacityRiskLevel,
  HistoricalMetricsInput,
  RealTimeSignalsInput,
} from './capacityTypes';

// ============================================================================
// CAPACITY AGGREGATOR
// ============================================================================

export class CapacityAggregator {
  // ==========================================================================
  // BASELINE COMPUTATION
  // ==========================================================================

  /**
   * Compute historical baseline from metrics
   */
  computeBaseline(
    historicalMetrics: HistoricalMetricsInput[],
    scope: { tenantId: string; facilityId?: string; federationId?: string }
  ): CapacityBaseline {
    if (historicalMetrics.length === 0) {
      throw new Error('No historical metrics available for baseline computation');
    }

    // Calculate period
    const timestamps = historicalMetrics.map(m => new Date(m.timeRange.start).getTime());
    const periodStart = new Date(Math.min(...timestamps)).toISOString();
    const periodEnd = new Date(Math.max(...timestamps)).toISOString();
    const periodDurationHours = (Math.max(...timestamps) - Math.min(...timestamps)) / (1000 * 60 * 60);

    // Calculate averages
    const totalTaskThroughput = historicalMetrics.reduce((sum, m) => sum + m.taskThroughput, 0);
    const totalAlertVolume = historicalMetrics.reduce((sum, m) => sum + m.alertVolume, 0);
    const averageTasksPerHour = totalTaskThroughput / (periodDurationHours || 1);
    const averageAlertsPerHour = totalAlertVolume / (periodDurationHours || 1);

    // Calculate operator workload
    const allOperatorLoads: number[] = [];
    const workloadByOperator: Record<string, number> = {};
    for (const metric of historicalMetrics) {
      for (const [operatorId, load] of Object.entries(metric.operatorWorkload)) {
        workloadByOperator[operatorId] = (workloadByOperator[operatorId] || 0) + load;
        allOperatorLoads.push(load);
      }
    }
    const averageOperatorLoad = allOperatorLoads.length > 0
      ? allOperatorLoads.reduce((sum, load) => sum + load, 0) / allOperatorLoads.length
      : 0;
    const peakOperatorLoad = allOperatorLoads.length > 0 ? Math.max(...allOperatorLoads) : 0;

    // Calculate SLA metrics
    const averageSLAAdherence = historicalMetrics.reduce((sum, m) => sum + m.slaAdherence, 0) / historicalMetrics.length;
    const slaBreachCount = historicalMetrics.filter(m => m.slaAdherence < 95).length;

    return {
      baselineId: `baseline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      scope,
      periodStart,
      periodEnd,
      periodDurationHours,
      averageTasksPerHour,
      averageAlertsPerHour,
      averageOperatorLoad,
      peakOperatorLoad,
      tasksByCategory: {},
      alertsBySeverity: {},
      workloadByOperator,
      averageSLAAdherence,
      slaBreachCount,
      computedAt: new Date().toISOString(),
      dataPoints: historicalMetrics.length,
      confidenceLevel: historicalMetrics.length >= 100 ? 'high' : historicalMetrics.length >= 30 ? 'medium' : 'low',
    };
  }

  // ==========================================================================
  // PROJECTION METHODS
  // ==========================================================================

  /**
   * Compute projection using rolling average
   */
  public computeRollingAverage(
    values: number[],
    windowSize: number = 10
  ): { value: number; min: number; max: number } {
    if (values.length === 0) return { value: 0, min: 0, max: 0 };

    const window = values.slice(-windowSize);
    const sum = window.reduce((a, b) => a + b, 0);
    const average = sum / window.length;
    const min = Math.min(...window);
    const max = Math.max(...window);

    return { value: average, min, max };
  }

  /**
   * Compute projection using weighted average (recent data weighted more)
   */
  public computeWeightedAverage(
    values: number[]
  ): { value: number; min: number; max: number } {
    if (values.length === 0) return { value: 0, min: 0, max: 0 };

    let weightedSum = 0;
    let totalWeight = 0;

    for (let i = 0; i < values.length; i++) {
      const weight = i + 1; // More recent values have higher weight
      weightedSum += values[i] * weight;
      totalWeight += weight;
    }

    const average = weightedSum / totalWeight;
    const min = Math.min(...values);
    const max = Math.max(...values);

    return { value: average, min, max };
  }

  /**
   * Compute projection using baseline delta
   */
  private computeBaselineDelta(
    currentValue: number,
    baselineValue: number
  ): { value: number; min: number; max: number } {
    const delta = currentValue - baselineValue;
    const projected = currentValue + delta;

    return {
      value: projected,
      min: Math.min(currentValue, projected),
      max: Math.max(currentValue, projected),
    };
  }

  /**
   * Compute projection using trend slope (linear)
   */
  public computeTrendSlope(
    values: number[]
  ): { value: number; slope: number; min: number; max: number } {
    if (values.length < 2) return { value: values[0] || 0, slope: 0, min: 0, max: 0 };

    // Simple linear regression
    const n = values.length;
    const xValues = Array.from({ length: n }, (_, i) => i);
    const xSum = xValues.reduce((a, b) => a + b, 0);
    const ySum = values.reduce((a, b) => a + b, 0);
    const xMean = xSum / n;
    const yMean = ySum / n;

    let numerator = 0;
    let denominator = 0;
    for (let i = 0; i < n; i++) {
      numerator += (xValues[i] - xMean) * (values[i] - yMean);
      denominator += (xValues[i] - xMean) ** 2;
    }

    const slope = denominator !== 0 ? numerator / denominator : 0;
    const intercept = yMean - slope * xMean;

    // Project next value
    const projected = slope * n + intercept;

    return {
      value: projected,
      slope,
      min: Math.min(...values),
      max: Math.max(...values),
    };
  }

  // ==========================================================================
  // OPERATOR WORKLOAD PROJECTION
  // ==========================================================================

  /**
   * Project operator workload
   */
  computeOperatorWorkloadProjection(
    historicalMetrics: HistoricalMetricsInput[],
    realTimeSignal: RealTimeSignalsInput | null,
    baseline: CapacityBaseline | null,
    timeWindow: CapacityTimeWindow,
    method: ProjectionMethod,
    scope: { tenantId: string; facilityId?: string; federationId?: string }
  ): CapacityProjection {
    // Extract historical workload values
    const workloadValues = historicalMetrics.map(m => {
      const loads = Object.values(m.operatorWorkload);
      return loads.reduce((sum, load) => sum + load, 0) / (loads.length || 1);
    });

    // Compute projection based on method
    let result: { value: number; min: number; max: number; slope?: number };
    switch (method) {
      case 'rolling-average':
        result = this.computeRollingAverage(workloadValues);
        break;
      case 'weighted-average':
        result = this.computeWeightedAverage(workloadValues);
        break;
      case 'baseline-delta':
        if (realTimeSignal && baseline) {
          result = this.computeBaselineDelta(realTimeSignal.liveWorkload, baseline.averageOperatorLoad);
        } else {
          result = this.computeRollingAverage(workloadValues);
        }
        break;
      case 'trend-slope':
        result = this.computeTrendSlope(workloadValues);
        break;
      default:
        result = this.computeRollingAverage(workloadValues);
    }

    const trendSlope = result.slope || 0;
    const trendDirection = trendSlope > 0.5 ? 'increasing' : trendSlope < -0.5 ? 'decreasing' : 'stable';
    
    const baselineValue = baseline?.averageOperatorLoad || 50;

    return {
      projectionId: `proj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      category: 'operator-workload',
      timeWindow,
      method,
      scope,
      projectedValue: result.value,
      projectedMin: result.min,
      projectedMax: result.max,
      unit: 'tasks/operator',
      baselineValue,
      deltaFromBaseline: result.value - baselineValue,
      deltaPercentage: ((result.value - baselineValue) / (baselineValue || 1)) * 100,
      trendDirection,
      trendSlope,
      computedAt: new Date().toISOString(),
      validUntil: this.calculateValidUntil(timeWindow),
      dataPoints: workloadValues.length,
      confidenceLevel: workloadValues.length >= 50 ? 'high' : workloadValues.length >= 20 ? 'medium' : 'low',
    };
  }

  // ==========================================================================
  // TASK VOLUME PROJECTION
  // ==========================================================================

  /**
   * Project task volume
   */
  computeTaskVolumeProjection(
    historicalMetrics: HistoricalMetricsInput[],
    realTimeSignal: RealTimeSignalsInput | null,
    baseline: CapacityBaseline | null,
    timeWindow: CapacityTimeWindow,
    method: ProjectionMethod,
    scope: { tenantId: string; facilityId?: string; federationId?: string }
  ): CapacityProjection {
    const taskValues = historicalMetrics.map(m => m.taskThroughput);

    let result: { value: number; min: number; max: number; slope?: number };
    switch (method) {
      case 'rolling-average':
        result = this.computeRollingAverage(taskValues);
        break;
      case 'weighted-average':
        result = this.computeWeightedAverage(taskValues);
        break;
      case 'baseline-delta':
        if (realTimeSignal && baseline) {
          result = this.computeBaselineDelta(realTimeSignal.activeTasks, baseline.averageTasksPerHour);
        } else {
          result = this.computeRollingAverage(taskValues);
        }
        break;
      case 'trend-slope':
        result = this.computeTrendSlope(taskValues);
        break;
      default:
        result = this.computeRollingAverage(taskValues);
    }

    const trendSlope = result.slope || 0;
    const trendDirection = trendSlope > 0.5 ? 'increasing' : trendSlope < -0.5 ? 'decreasing' : 'stable';
    
    const baselineValue = baseline?.averageTasksPerHour || 80;

    return {
      projectionId: `proj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      category: 'task-volume',
      timeWindow,
      method,
      scope,
      projectedValue: result.value,
      projectedMin: result.min,
      projectedMax: result.max,
      unit: 'tasks/hour',
      baselineValue,
      deltaFromBaseline: result.value - baselineValue,
      deltaPercentage: ((result.value - baselineValue) / (baselineValue || 1)) * 100,
      trendDirection,
      trendSlope,
      computedAt: new Date().toISOString(),
      validUntil: this.calculateValidUntil(timeWindow),
      dataPoints: taskValues.length,
      confidenceLevel: taskValues.length >= 50 ? 'high' : taskValues.length >= 20 ? 'medium' : 'low',
    };
  }

  // ==========================================================================
  // ALERT VOLUME PROJECTION
  // ==========================================================================

  /**
   * Project alert volume
   */
  computeAlertVolumeProjection(
    historicalMetrics: HistoricalMetricsInput[],
    realTimeSignal: RealTimeSignalsInput | null,
    baseline: CapacityBaseline | null,
    timeWindow: CapacityTimeWindow,
    method: ProjectionMethod,
    scope: { tenantId: string; facilityId?: string; federationId?: string }
  ): CapacityProjection {
    const alertValues = historicalMetrics.map(m => m.alertVolume);

    let result: { value: number; min: number; max: number; slope?: number };
    switch (method) {
      case 'rolling-average':
        result = this.computeRollingAverage(alertValues);
        break;
      case 'weighted-average':
        result = this.computeWeightedAverage(alertValues);
        break;
      case 'baseline-delta':
        if (realTimeSignal && baseline) {
          result = this.computeBaselineDelta(realTimeSignal.activeAlerts, baseline.averageAlertsPerHour);
        } else {
          result = this.computeRollingAverage(alertValues);
        }
        break;
      case 'trend-slope':
        result = this.computeTrendSlope(alertValues);
        break;
      default:
        result = this.computeRollingAverage(alertValues);
    }

    const trendSlope = result.slope || 0;
    const trendDirection = trendSlope > 0.5 ? 'increasing' : trendSlope < -0.5 ? 'decreasing' : 'stable';
    
    const baselineValue = baseline?.averageAlertsPerHour || 30;

    return {
      projectionId: `proj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      category: 'alert-volume',
      timeWindow,
      method,
      scope,
      projectedValue: result.value,
      projectedMin: result.min,
      projectedMax: result.max,
      unit: 'alerts/hour',
      baselineValue,
      deltaFromBaseline: result.value - baselineValue,
      deltaPercentage: ((result.value - baselineValue) / (baselineValue || 1)) * 100,
      trendDirection,
      trendSlope,
      computedAt: new Date().toISOString(),
      validUntil: this.calculateValidUntil(timeWindow),
      dataPoints: alertValues.length,
      confidenceLevel: alertValues.length >= 50 ? 'high' : alertValues.length >= 20 ? 'medium' : 'low',
    };
  }

  // ==========================================================================
  // RISK WINDOW IDENTIFICATION
  // ==========================================================================

  /**
   * Identify SLA risk windows
   */
  identifySLARiskWindows(
    projections: CapacityProjection[],
    baseline: CapacityBaseline,
    scope: { tenantId: string; facilityId?: string; federationId?: string }
  ): CapacityRiskWindow[] {
    const risks: CapacityRiskWindow[] = [];

    // Check for workload overload risk
    const workloadProjection = projections.find(p => p.category === 'operator-workload');
    if (workloadProjection && workloadProjection.projectedValue > baseline.peakOperatorLoad * 1.2) {
      risks.push({
        riskId: `risk-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        riskType: 'overload',
        severity: workloadProjection.projectedValue > baseline.peakOperatorLoad * 1.5 ? 'critical' : 'high',
        scope,
        windowStart: new Date().toISOString(),
        windowEnd: workloadProjection.validUntil,
        windowDurationHours: this.getTimeWindowHours(workloadProjection.timeWindow),
        description: `Projected operator workload (${workloadProjection.projectedValue.toFixed(1)}) exceeds peak historical load (${baseline.peakOperatorLoad.toFixed(1)}) by ${workloadProjection.deltaPercentage.toFixed(1)}%`,
        affectedEntities: {},
        riskScore: Math.min(100, (workloadProjection.deltaPercentage / 50) * 100),
        probabilityScore: workloadProjection.confidenceLevel === 'high' ? 80 : workloadProjection.confidenceLevel === 'medium' ? 60 : 40,
        impactScore: 85,
        recommendations: [
          'Consider redistributing workload across operators',
          'Review task prioritization policies',
          'Evaluate need for additional operator capacity',
        ],
        computedAt: new Date().toISOString(),
        dataPoints: workloadProjection.dataPoints,
      });
    }

    // Check for SLA breach risk based on historical adherence
    if (baseline.averageSLAAdherence < 95) {
      const taskProjection = projections.find(p => p.category === 'task-volume');
      if (taskProjection && taskProjection.trendDirection === 'increasing') {
        risks.push({
          riskId: `risk-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          riskType: 'sla-breach',
          severity: baseline.averageSLAAdherence < 90 ? 'critical' : 'high',
          scope,
          windowStart: new Date().toISOString(),
          windowEnd: taskProjection.validUntil,
          windowDurationHours: this.getTimeWindowHours(taskProjection.timeWindow),
          description: `Historical SLA adherence (${baseline.averageSLAAdherence.toFixed(1)}%) below target with increasing task volume`,
          affectedEntities: {},
          riskScore: Math.min(100, ((100 - baseline.averageSLAAdherence) / 10) * 100),
          probabilityScore: 70,
          impactScore: 90,
          recommendations: [
            'Prioritize critical tasks',
            'Review SLA thresholds',
            'Increase operator availability',
          ],
          computedAt: new Date().toISOString(),
          dataPoints: taskProjection.dataPoints,
        });
      }
    }

    return risks;
  }

  /**
   * Identify backlog accumulation risk
   */
  identifyBacklogRisk(
    taskProjection: CapacityProjection,
    workloadProjection: CapacityProjection,
    scope: { tenantId: string; facilityId?: string; federationId?: string }
  ): CapacityRiskWindow | null {
    // If task volume increasing faster than workload capacity
    if (taskProjection.trendDirection === 'increasing' && workloadProjection.projectedValue > workloadProjection.baselineValue * 1.1) {
      return {
        riskId: `risk-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        riskType: 'backlog-accumulation',
        severity: 'high',
        scope,
        windowStart: new Date().toISOString(),
        windowEnd: taskProjection.validUntil,
        windowDurationHours: this.getTimeWindowHours(taskProjection.timeWindow),
        description: `Task volume increasing (${taskProjection.deltaPercentage.toFixed(1)}%) while operator capacity near limit`,
        affectedEntities: {},
        riskScore: Math.min(100, (taskProjection.trendSlope / 2) * 100),
        probabilityScore: 65,
        impactScore: 75,
        recommendations: [
          'Implement task throttling',
          'Review task routing logic',
          'Consider temporary capacity expansion',
        ],
        computedAt: new Date().toISOString(),
        dataPoints: taskProjection.dataPoints,
      };
    }

    return null;
  }

  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================

  private calculateValidUntil(timeWindow: CapacityTimeWindow): string {
    const hours = this.getTimeWindowHours(timeWindow);
    return new Date(Date.now() + hours * 3600000).toISOString();
  }

  private getTimeWindowHours(timeWindow: CapacityTimeWindow): number {
    const map: Record<CapacityTimeWindow, number> = {
      'next-1-hour': 1,
      'next-4-hours': 4,
      'next-8-hours': 8,
      'next-12-hours': 12,
      'next-24-hours': 24,
      'next-48-hours': 48,
      'next-7-days': 168,
    };
    return map[timeWindow] || 1;
  }
}
