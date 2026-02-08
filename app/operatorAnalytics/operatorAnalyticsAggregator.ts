/**
 * OPERATOR ANALYTICS AGGREGATOR
 * Phase 54: Operator Performance & Workflow Analytics Center
 * 
 * Computes deterministic metrics from real system data.
 * NO GENERATIVE AI. NO INVENTED METRICS.
 */

import {
  OperatorMetric,
  OperatorMetricCategory,
  OperatorAnalyticsScope,
  TaskDataInput,
  AlertDataInput,
  ThroughputMetric,
  ResponseTimeMetric,
  RemediationTimelineMetric,
  SLAMetric,
  WorkloadMetric,
  CrossEngineMetric,
  OperatorPerformanceSnapshot,
  OperatorWorkloadProfile,
  SLAThresholds,
  MetricAggregation,
  AnyOperatorMetric,
} from './operatorAnalyticsTypes';

// ============================================================================
// OPERATOR ANALYTICS AGGREGATOR
// ============================================================================

export class OperatorAnalyticsAggregator {
  // ==========================================================================
  // THROUGHPUT METRICS
  // ==========================================================================

  computeThroughputMetric(
    tasks: TaskDataInput[],
    scope: OperatorAnalyticsScope,
    timeRange: { startDate: string; endDate: string }
  ): ThroughputMetric {
    const completedTasks = tasks.filter(t => t.status === 'resolved');
    
    const breakdown = {
      byCategory: {} as Record<string, number>,
      bySeverity: {} as Record<string, number>,
      byStatus: {} as Record<string, number>,
    };

    for (const task of completedTasks) {
      breakdown.byCategory[task.category] = (breakdown.byCategory[task.category] || 0) + 1;
      breakdown.bySeverity[task.severity] = (breakdown.bySeverity[task.severity] || 0) + 1;
      breakdown.byStatus[task.status] = (breakdown.byStatus[task.status] || 0) + 1;
    }

    return {
      metricId: `metric-throughput-${Date.now()}`,
      category: 'task-throughput',
      name: 'Task Throughput',
      description: 'Number of tasks completed per time period',
      value: completedTasks.length,
      unit: 'tasks',
      scope,
      timeRange,
      breakdown,
      metadata: {
        sampleSize: tasks.length,
        aggregation: 'count',
        dataSource: ['action-center'],
      },
      computedAt: new Date().toISOString(),
    };
  }

  // ==========================================================================
  // RESPONSE TIME METRICS
  // ==========================================================================

  computeResponseTimeMetric(
    tasks: TaskDataInput[],
    alerts: AlertDataInput[],
    scope: OperatorAnalyticsScope,
    timeRange: { startDate: string; endDate: string }
  ): ResponseTimeMetric {
    const responseTimes: number[] = [];
    const bySeverity: Record<string, number[]> = {};
    const byCategory: Record<string, number[]> = {};

    // Calculate response time for tasks that were acknowledged
    for (const task of tasks) {
      if (task.acknowledgedAt) {
        const created = new Date(task.createdAt).getTime();
        const acknowledged = new Date(task.acknowledgedAt).getTime();
        const responseTimeHours = (acknowledged - created) / (1000 * 60 * 60);
        
        responseTimes.push(responseTimeHours);
        
        if (!bySeverity[task.severity]) bySeverity[task.severity] = [];
        bySeverity[task.severity].push(responseTimeHours);
        
        if (!byCategory[task.category]) byCategory[task.category] = [];
        byCategory[task.category].push(responseTimeHours);
      }
    }

    const averageResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((sum, t) => sum + t, 0) / responseTimes.length
      : 0;

    const percentiles = this.calculatePercentiles(responseTimes);

    const breakdown = {
      bySeverity: {} as Record<string, number>,
      byCategory: {} as Record<string, number>,
      percentiles,
    };

    // Calculate averages per severity/category
    for (const [severity, times] of Object.entries(bySeverity)) {
      breakdown.bySeverity[severity] = times.reduce((sum, t) => sum + t, 0) / times.length;
    }

    for (const [category, times] of Object.entries(byCategory)) {
      breakdown.byCategory[category] = times.reduce((sum, t) => sum + t, 0) / times.length;
    }

    return {
      metricId: `metric-response-${Date.now()}`,
      category: 'alert-response-time',
      name: 'Alert Response Time',
      description: 'Average time from task creation to acknowledgement',
      value: averageResponseTime,
      unit: 'hours',
      scope,
      timeRange,
      breakdown,
      metadata: {
        sampleSize: responseTimes.length,
        aggregation: 'average',
        dataSource: ['action-center', 'alert-center'],
      },
      computedAt: new Date().toISOString(),
    };
  }

  // ==========================================================================
  // REMEDIATION TIMELINE METRICS
  // ==========================================================================

  computeRemediationTimelineMetric(
    tasks: TaskDataInput[],
    category: 'audit-remediation-timeline' | 'drift-remediation-timeline' | 'governance-resolution-time' | 'documentation-remediation' | 'simulation-resolution',
    scope: OperatorAnalyticsScope,
    timeRange: { startDate: string; endDate: string }
  ): RemediationTimelineMetric {
    const resolutionTimes: number[] = [];
    const bySeverity: Record<string, number[]> = {};
    const byCategory: Record<string, number[]> = {};

    // Calculate resolution time for resolved tasks
    for (const task of tasks) {
      if (task.resolvedAt) {
        const created = new Date(task.createdAt).getTime();
        const resolved = new Date(task.resolvedAt).getTime();
        const resolutionTimeHours = (resolved - created) / (1000 * 60 * 60);
        
        resolutionTimes.push(resolutionTimeHours);
        
        if (!bySeverity[task.severity]) bySeverity[task.severity] = [];
        bySeverity[task.severity].push(resolutionTimeHours);
        
        if (!byCategory[task.category]) byCategory[task.category] = [];
        byCategory[task.category].push(resolutionTimeHours);
      }
    }

    const averageResolutionTime = resolutionTimes.length > 0
      ? resolutionTimes.reduce((sum, t) => sum + t, 0) / resolutionTimes.length
      : 0;

    const percentiles = this.calculatePercentiles(resolutionTimes);

    const breakdown = {
      bySeverity: {} as Record<string, number>,
      byCategory: {} as Record<string, number>,
      percentiles,
    };

    for (const [severity, times] of Object.entries(bySeverity)) {
      breakdown.bySeverity[severity] = times.reduce((sum, t) => sum + t, 0) / times.length;
    }

    for (const [cat, times] of Object.entries(byCategory)) {
      breakdown.byCategory[cat] = times.reduce((sum, t) => sum + t, 0) / times.length;
    }

    return {
      metricId: `metric-remediation-${Date.now()}`,
      category,
      name: this.getRemediationMetricName(category),
      description: 'Average time from task creation to resolution',
      value: averageResolutionTime,
      unit: 'hours',
      scope,
      timeRange,
      breakdown,
      metadata: {
        sampleSize: resolutionTimes.length,
        aggregation: 'average',
        dataSource: ['action-center'],
      },
      computedAt: new Date().toISOString(),
    };
  }

  private getRemediationMetricName(category: string): string {
    const names: Record<string, string> = {
      'audit-remediation-timeline': 'Audit Remediation Timeline',
      'drift-remediation-timeline': 'Drift Remediation Timeline',
      'governance-resolution-time': 'Governance Resolution Time',
      'documentation-remediation': 'Documentation Remediation Time',
      'simulation-resolution': 'Simulation Resolution Time',
    };
    return names[category] || 'Remediation Timeline';
  }

  // ==========================================================================
  // SLA ADHERENCE METRICS
  // ==========================================================================

  computeSLAMetric(
    tasks: TaskDataInput[],
    slaThresholds: SLAThresholds,
    scope: OperatorAnalyticsScope,
    timeRange: { startDate: string; endDate: string }
  ): SLAMetric {
    let totalTasks = 0;
    let withinSLA = 0;
    const bySeverity: Record<string, { total: number; withinSLA: number; percentage: number }> = {};
    const byCategory: Record<string, { total: number; withinSLA: number; percentage: number }> = {};

    for (const task of tasks) {
      if (task.resolvedAt) {
        totalTasks++;
        
        const created = new Date(task.createdAt).getTime();
        const resolved = new Date(task.resolvedAt).getTime();
        const resolutionTimeHours = (resolved - created) / (1000 * 60 * 60);
        
        // Get SLA threshold
        let threshold = slaThresholds.bySeverity[task.severity as keyof typeof slaThresholds.bySeverity];
        if (slaThresholds.byCategory && slaThresholds.byCategory[task.category]) {
          threshold = slaThresholds.byCategory[task.category];
        }
        
        const meetsSLA = resolutionTimeHours <= threshold;
        if (meetsSLA) withinSLA++;
        
        // Track by severity
        if (!bySeverity[task.severity]) {
          bySeverity[task.severity] = { total: 0, withinSLA: 0, percentage: 0 };
        }
        bySeverity[task.severity].total++;
        if (meetsSLA) bySeverity[task.severity].withinSLA++;
        
        // Track by category
        if (!byCategory[task.category]) {
          byCategory[task.category] = { total: 0, withinSLA: 0, percentage: 0 };
        }
        byCategory[task.category].total++;
        if (meetsSLA) byCategory[task.category].withinSLA++;
      }
    }

    // Calculate percentages
    for (const severity in bySeverity) {
      bySeverity[severity].percentage = 
        (bySeverity[severity].withinSLA / bySeverity[severity].total) * 100;
    }

    for (const category in byCategory) {
      byCategory[category].percentage = 
        (byCategory[category].withinSLA / byCategory[category].total) * 100;
    }

    const adherencePercentage = totalTasks > 0 ? (withinSLA / totalTasks) * 100 : 0;

    return {
      metricId: `metric-sla-${Date.now()}`,
      category: 'sla-adherence',
      name: 'SLA Adherence',
      description: 'Percentage of tasks resolved within SLA thresholds',
      value: adherencePercentage,
      unit: 'percentage',
      scope,
      timeRange,
      breakdown: {
        totalTasks,
        withinSLA,
        outsideSLA: totalTasks - withinSLA,
        adherencePercentage,
        bySeverity,
        byCategory,
      },
      metadata: {
        sampleSize: totalTasks,
        aggregation: 'average',
        dataSource: ['action-center'],
        slaThresholds,
      },
      computedAt: new Date().toISOString(),
    };
  }

  // ==========================================================================
  // WORKLOAD DISTRIBUTION METRICS
  // ==========================================================================

  computeWorkloadMetric(
    tasks: TaskDataInput[],
    scope: OperatorAnalyticsScope,
    timeRange: { startDate: string; endDate: string }
  ): WorkloadMetric {
    const byOperator: Record<string, {
      totalTasks: number;
      activeTasks: number;
      completedTasks: number;
      completionRate: number;
    }> = {};

    let totalTasks = 0;
    let activeTasks = 0;
    let completedTasks = 0;

    for (const task of tasks) {
      totalTasks++;
      
      if (task.status === 'resolved') {
        completedTasks++;
      } else {
        activeTasks++;
      }
      
      const operatorId = task.assignedTo || 'unassigned';
      
      if (!byOperator[operatorId]) {
        byOperator[operatorId] = {
          totalTasks: 0,
          activeTasks: 0,
          completedTasks: 0,
          completionRate: 0,
        };
      }
      
      byOperator[operatorId].totalTasks++;
      
      if (task.status === 'resolved') {
        byOperator[operatorId].completedTasks++;
      } else {
        byOperator[operatorId].activeTasks++;
      }
    }

    // Calculate completion rates
    for (const operatorId in byOperator) {
      const op = byOperator[operatorId];
      op.completionRate = op.totalTasks > 0 
        ? (op.completedTasks / op.totalTasks) * 100 
        : 0;
    }

    const operatorCount = Object.keys(byOperator).filter(id => id !== 'unassigned').length;
    const averageTasksPerOperator = operatorCount > 0 ? totalTasks / operatorCount : 0;

    return {
      metricId: `metric-workload-${Date.now()}`,
      category: 'workload-distribution',
      name: 'Workload Distribution',
      description: 'Distribution of tasks across operators',
      value: averageTasksPerOperator,
      unit: 'tasks per operator',
      scope,
      timeRange,
      breakdown: {
        totalTasks,
        activeTasks,
        completedTasks,
        averageTasksPerOperator,
        byOperator,
      },
      metadata: {
        sampleSize: totalTasks,
        aggregation: 'average',
        dataSource: ['action-center'],
      },
      computedAt: new Date().toISOString(),
    };
  }

  // ==========================================================================
  // CROSS-ENGINE EFFICIENCY METRICS
  // ==========================================================================

  computeCrossEngineMetric(
    tasks: TaskDataInput[],
    scope: OperatorAnalyticsScope,
    timeRange: { startDate: string; endDate: string }
  ): CrossEngineMetric {
    const byEngine: Record<string, {
      totalTasks: number;
      resolvedTasks: number;
      totalResolutionTime: number;
      averageResolutionTime: number;
      completionRate: number;
    }> = {};

    for (const task of tasks) {
      // Extract engine from task category (e.g., 'alert-remediation' -> 'alert-center')
      const engine = this.getEngineFromCategory(task.category);
      
      if (!byEngine[engine]) {
        byEngine[engine] = {
          totalTasks: 0,
          resolvedTasks: 0,
          totalResolutionTime: 0,
          averageResolutionTime: 0,
          completionRate: 0,
        };
      }
      
      byEngine[engine].totalTasks++;
      
      if (task.resolvedAt) {
        byEngine[engine].resolvedTasks++;
        
        const created = new Date(task.createdAt).getTime();
        const resolved = new Date(task.resolvedAt).getTime();
        const resolutionTimeHours = (resolved - created) / (1000 * 60 * 60);
        
        byEngine[engine].totalResolutionTime += resolutionTimeHours;
      }
    }

    // Calculate averages and completion rates
    for (const engine in byEngine) {
      const e = byEngine[engine];
      e.averageResolutionTime = e.resolvedTasks > 0 
        ? e.totalResolutionTime / e.resolvedTasks 
        : 0;
      e.completionRate = e.totalTasks > 0 
        ? (e.resolvedTasks / e.totalTasks) * 100 
        : 0;
    }

    // Calculate simple correlations (tasks from similar engines resolved together)
    const correlations = this.calculateEngineCorrelations(byEngine);

    const totalTasks = Object.values(byEngine).reduce((sum, e) => sum + e.totalTasks, 0);
    const totalResolved = Object.values(byEngine).reduce((sum, e) => sum + e.resolvedTasks, 0);
    const overallCompletionRate = totalTasks > 0 ? (totalResolved / totalTasks) * 100 : 0;

    return {
      metricId: `metric-cross-engine-${Date.now()}`,
      category: 'cross-engine-efficiency',
      name: 'Cross-Engine Efficiency',
      description: 'Operational efficiency across different engines',
      value: overallCompletionRate,
      unit: 'percentage',
      scope,
      timeRange,
      breakdown: {
        byEngine,
        correlations,
      },
      metadata: {
        sampleSize: totalTasks,
        aggregation: 'average',
        dataSource: ['action-center', 'alert-center', 'auditor', 'integrity-monitor'],
      },
      computedAt: new Date().toISOString(),
    };
  }

  private getEngineFromCategory(category: string): string {
    const mapping: Record<string, string> = {
      'alert-remediation': 'alert-center',
      'audit-remediation': 'auditor',
      'integrity-drift-remediation': 'integrity-monitor',
      'governance-lineage-issue': 'governance',
      'documentation-completeness': 'documentation',
      'fabric-link-breakage': 'fabric',
      'compliance-pack-issue': 'compliance',
      'simulation-mismatch': 'simulation',
    };
    return mapping[category] || 'unknown';
  }

  private calculateEngineCorrelations(byEngine: Record<string, any>): {
    engine1: string;
    engine2: string;
    correlation: number;
    description: string;
  }[] {
    // Simple correlation: engines with similar completion rates
    const engines = Object.keys(byEngine);
    const correlations: any[] = [];

    for (let i = 0; i < engines.length; i++) {
      for (let j = i + 1; j < engines.length; j++) {
        const engine1 = engines[i];
        const engine2 = engines[j];
        const rate1 = byEngine[engine1].completionRate;
        const rate2 = byEngine[engine2].completionRate;
        
        // Simple correlation: how close are the completion rates
        const correlation = 1 - Math.abs(rate1 - rate2) / 100;
        
        correlations.push({
          engine1,
          engine2,
          correlation,
          description: `${engine1} and ${engine2} have ${correlation > 0.8 ? 'high' : correlation > 0.5 ? 'moderate' : 'low'} operational correlation`,
        });
      }
    }

    return correlations;
  }

  // ==========================================================================
  // PERFORMANCE SNAPSHOT
  // ==========================================================================

  computePerformanceSnapshot(
    tasks: TaskDataInput[],
    operatorId: string,
    operatorName: string,
    scope: OperatorAnalyticsScope,
    timeRange: { startDate: string; endDate: string },
    previousSnapshot?: OperatorPerformanceSnapshot
  ): OperatorPerformanceSnapshot {
    const operatorTasks = tasks.filter(t => t.assignedTo === operatorId);
    
    const tasksCompleted = operatorTasks.filter(t => t.status === 'resolved').length;
    const tasksActive = operatorTasks.filter(t => t.status !== 'resolved').length;
    
    // Calculate average resolution time
    const resolutionTimes: number[] = [];
    for (const task of operatorTasks) {
      if (task.resolvedAt) {
        const created = new Date(task.createdAt).getTime();
        const resolved = new Date(task.resolvedAt).getTime();
        resolutionTimes.push((resolved - created) / (1000 * 60 * 60));
      }
    }
    
    const averageResolutionTimeHours = resolutionTimes.length > 0
      ? resolutionTimes.reduce((sum, t) => sum + t, 0) / resolutionTimes.length
      : 0;
    
    // Calculate SLA adherence (using default thresholds)
    const defaultSLA: SLAThresholds = {
      bySeverity: { critical: 4, high: 24, medium: 72, low: 168, info: 720 },
    };
    const slaMetric = this.computeSLAMetric(operatorTasks, defaultSLA, scope, timeRange);
    
    // Breakdown by category
    const byCategory: Record<string, any> = {};
    for (const task of operatorTasks) {
      if (!byCategory[task.category]) {
        byCategory[task.category] = { completed: 0, active: 0, totalTime: 0, count: 0 };
      }
      
      if (task.status === 'resolved') {
        byCategory[task.category].completed++;
        
        if (task.resolvedAt) {
          const created = new Date(task.createdAt).getTime();
          const resolved = new Date(task.resolvedAt).getTime();
          byCategory[task.category].totalTime += (resolved - created) / (1000 * 60 * 60);
          byCategory[task.category].count++;
        }
      } else {
        byCategory[task.category].active++;
      }
    }
    
    for (const cat in byCategory) {
      byCategory[cat].averageResolutionTimeHours = byCategory[cat].count > 0
        ? byCategory[cat].totalTime / byCategory[cat].count
        : 0;
      delete byCategory[cat].totalTime;
      delete byCategory[cat].count;
    }
    
    // Breakdown by severity
    const bySeverity: Record<string, any> = {};
    for (const task of operatorTasks) {
      if (!bySeverity[task.severity]) {
        bySeverity[task.severity] = { completed: 0, active: 0, totalTime: 0, count: 0 };
      }
      
      if (task.status === 'resolved') {
        bySeverity[task.severity].completed++;
        
        if (task.resolvedAt) {
          const created = new Date(task.createdAt).getTime();
          const resolved = new Date(task.resolvedAt).getTime();
          bySeverity[task.severity].totalTime += (resolved - created) / (1000 * 60 * 60);
          bySeverity[task.severity].count++;
        }
      } else {
        bySeverity[task.severity].active++;
      }
    }
    
    for (const sev in bySeverity) {
      bySeverity[sev].averageResolutionTimeHours = bySeverity[sev].count > 0
        ? bySeverity[sev].totalTime / bySeverity[sev].count
        : 0;
      delete bySeverity[sev].totalTime;
      delete bySeverity[sev].count;
    }
    
    // Calculate trends
    const trends = {
      throughputChange: 0,
      resolutionTimeChange: 0,
      slaAdherenceChange: 0,
    };
    
    if (previousSnapshot) {
      trends.throughputChange = previousSnapshot.tasksCompleted > 0
        ? ((tasksCompleted - previousSnapshot.tasksCompleted) / previousSnapshot.tasksCompleted) * 100
        : 0;
      
      trends.resolutionTimeChange = previousSnapshot.averageResolutionTimeHours > 0
        ? ((averageResolutionTimeHours - previousSnapshot.averageResolutionTimeHours) / previousSnapshot.averageResolutionTimeHours) * 100
        : 0;
      
      trends.slaAdherenceChange = previousSnapshot.slaAdherencePercentage > 0
        ? ((slaMetric.value - previousSnapshot.slaAdherencePercentage) / previousSnapshot.slaAdherencePercentage) * 100
        : 0;
    }
    
    return {
      snapshotId: `snapshot-${operatorId}-${Date.now()}`,
      operatorId,
      operatorName,
      scope,
      timeRange,
      tasksCompleted,
      tasksActive,
      averageResolutionTimeHours,
      slaAdherencePercentage: slaMetric.value,
      byCategory,
      bySeverity,
      trends,
      computedAt: new Date().toISOString(),
    };
  }

  // ==========================================================================
  // WORKLOAD PROFILE
  // ==========================================================================

  computeWorkloadProfile(
    tasks: TaskDataInput[],
    scope: OperatorAnalyticsScope,
    timeRange: { startDate: string; endDate: string }
  ): OperatorWorkloadProfile {
    const operatorData: Record<string, {
      totalTasks: number;
      activeTasks: number;
      completedTasks: number;
      totalResolutionTime: number;
      resolvedCount: number;
    }> = {};

    let totalTasks = 0;

    for (const task of tasks) {
      totalTasks++;
      const operatorId = task.assignedTo || 'unassigned';
      
      if (!operatorData[operatorId]) {
        operatorData[operatorId] = {
          totalTasks: 0,
          activeTasks: 0,
          completedTasks: 0,
          totalResolutionTime: 0,
          resolvedCount: 0,
        };
      }
      
      operatorData[operatorId].totalTasks++;
      
      if (task.status === 'resolved') {
        operatorData[operatorId].completedTasks++;
        
        if (task.resolvedAt) {
          const created = new Date(task.createdAt).getTime();
          const resolved = new Date(task.resolvedAt).getTime();
          operatorData[operatorId].totalResolutionTime += (resolved - created) / (1000 * 60 * 60);
          operatorData[operatorId].resolvedCount++;
        }
      } else {
        operatorData[operatorId].activeTasks++;
      }
    }

    const operators = Object.entries(operatorData)
      .filter(([id]) => id !== 'unassigned')
      .map(([operatorId, data]) => ({
        operatorId,
        operatorName: operatorId, // In real system, look up name
        totalTasks: data.totalTasks,
        activeTasks: data.activeTasks,
        completedTasks: data.completedTasks,
        taskPercentage: totalTasks > 0 ? (data.totalTasks / totalTasks) * 100 : 0,
        completionRate: data.totalTasks > 0 ? (data.completedTasks / data.totalTasks) * 100 : 0,
        averageResolutionTimeHours: data.resolvedCount > 0 
          ? data.totalResolutionTime / data.resolvedCount 
          : 0,
      }));

    const totalOperators = operators.length;
    const averageTasksPerOperator = totalOperators > 0 ? totalTasks / totalOperators : 0;

    // Calculate workload balance
    const taskCounts = operators.map(op => op.totalTasks);
    const minTasksPerOperator = Math.min(...taskCounts, 0);
    const maxTasksPerOperator = Math.max(...taskCounts, 0);
    
    const mean = averageTasksPerOperator;
    const squaredDiffs = taskCounts.map(count => Math.pow(count - mean, 2));
    const variance = squaredDiffs.length > 0 
      ? squaredDiffs.reduce((sum, diff) => sum + diff, 0) / squaredDiffs.length 
      : 0;
    const standardDeviation = Math.sqrt(variance);
    
    // Balance score: 100 when perfectly balanced, lower when imbalanced
    const balanceScore = mean > 0 
      ? Math.max(0, 100 - (standardDeviation / mean) * 100) 
      : 100;

    return {
      profileId: `profile-${Date.now()}`,
      scope,
      timeRange,
      totalOperators,
      totalTasks,
      averageTasksPerOperator,
      operators,
      workloadBalance: {
        minTasksPerOperator,
        maxTasksPerOperator,
        standardDeviation,
        balanceScore,
      },
      computedAt: new Date().toISOString(),
    };
  }

  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================

  private calculatePercentiles(values: number[]): {
    p50: number;
    p75: number;
    p90: number;
    p95: number;
    p99: number;
  } {
    if (values.length === 0) {
      return { p50: 0, p75: 0, p90: 0, p95: 0, p99: 0 };
    }

    const sorted = [...values].sort((a, b) => a - b);
    
    return {
      p50: this.percentile(sorted, 50),
      p75: this.percentile(sorted, 75),
      p90: this.percentile(sorted, 90),
      p95: this.percentile(sorted, 95),
      p99: this.percentile(sorted, 99),
    };
  }

  private percentile(sorted: number[], p: number): number {
    const index = (p / 100) * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;
    
    if (lower === upper) {
      return sorted[lower];
    }
    
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  }
}
