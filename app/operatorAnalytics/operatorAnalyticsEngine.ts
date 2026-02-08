/**
 * OPERATOR ANALYTICS ENGINE
 * Phase 54: Operator Performance & Workflow Analytics Center
 * 
 * Main orchestrator for operator performance analytics.
 * Coordinates metric computation, policy enforcement, and logging.
 * 
 * DETERMINISTIC OPERATION ONLY - NO GENERATIVE AI
 */

import { OperatorAnalyticsAggregator } from './operatorAnalyticsAggregator';
import { OperatorAnalyticsPolicyEngine } from './operatorAnalyticsPolicyEngine';
import { OperatorAnalyticsLog } from './operatorAnalyticsLog';
import {
  OperatorMetricQuery,
  OperatorMetricResult,
  OperatorAnalyticsPolicyContext,
  TaskDataInput,
  AlertDataInput,
  OperatorPerformanceSnapshot,
  OperatorWorkloadProfile,
  AnyOperatorMetric,
  OperatorAnalyticsStatistics,
  SLAThresholds,
} from './operatorAnalyticsTypes';

// ============================================================================
// OPERATOR ANALYTICS ENGINE
// ============================================================================

export class OperatorAnalyticsEngine {
  private aggregator: OperatorAnalyticsAggregator;
  private policyEngine: OperatorAnalyticsPolicyEngine;
  private log: OperatorAnalyticsLog;

  // In-memory data stores (in production, these would be database queries)
  private taskData: TaskDataInput[] = [];
  private alertData: AlertDataInput[] = [];

  constructor() {
    this.aggregator = new OperatorAnalyticsAggregator();
    this.policyEngine = new OperatorAnalyticsPolicyEngine();
    this.log = new OperatorAnalyticsLog();
  }

  // ==========================================================================
  // DATA INGESTION
  // ==========================================================================

  ingestTaskData(tasks: TaskDataInput[]): void {
    this.taskData.push(...tasks);
  }

  ingestAlertData(alerts: AlertDataInput[]): void {
    this.alertData.push(...alerts);
  }

  clearData(): void {
    this.taskData = [];
    this.alertData = [];
  }

  // ==========================================================================
  // QUERY EXECUTION
  // ==========================================================================

  async executeQuery(
    query: OperatorMetricQuery,
    context: OperatorAnalyticsPolicyContext
  ): Promise<OperatorMetricResult> {
    try {
      // 1. Log the query
      this.log.logQuery({
        queryId: query.queryId,
        description: query.description,
        scope: query.scope,
        categories: query.categories || [],
        operatorIds: query.operatorIds || [],
        timeRange: query.timeRange,
        triggeredBy: query.triggeredBy,
      });

      // 2. Evaluate policy
      const policyDecision = this.policyEngine.evaluateQueryPolicy(query, context);

      // 3. Log policy decision
      this.log.logPolicyDecision({
        queryId: query.queryId,
        scope: query.scope,
        allowed: policyDecision.allowed,
        reason: policyDecision.reason,
        violations: policyDecision.violations,
        warnings: policyDecision.warnings,
      });

      // 4. If denied, return error result
      if (!policyDecision.allowed) {
        return this.createErrorResult(query, policyDecision.reason);
      }

      // 5. Filter data by scope and time range
      const filteredTasks = this.filterTasks(query);
      const filteredAlerts = this.filterAlerts(query);

      // 6. Compute requested metrics
      const metrics = await this.computeMetrics(query, filteredTasks, filteredAlerts);

      // 7. Compute performance snapshots (if operators specified)
      const performanceSnapshots = await this.computePerformanceSnapshots(
        query,
        filteredTasks,
        context
      );

      // 8. Compute workload profile
      const workloadProfile = await this.computeWorkloadProfile(query, filteredTasks);

      // 9. Create result summary
      const summary = this.createSummary(metrics, performanceSnapshots, workloadProfile);

      // 10. Log metrics, snapshots, and profile
      for (const metric of metrics) {
        this.log.logMetric({
          metricId: metric.metricId,
          category: metric.category,
          scope: metric.scope,
          value: metric.value,
          unit: metric.unit,
        });
      }

      for (const snapshot of performanceSnapshots) {
        this.log.logSnapshot({
          snapshotId: snapshot.snapshotId,
          operatorId: snapshot.operatorId,
          operatorName: snapshot.operatorName,
          scope: snapshot.scope,
          tasksCompleted: snapshot.tasksCompleted,
          tasksActive: snapshot.tasksActive,
        });
      }

      if (workloadProfile) {
        this.log.logWorkloadProfile({
          profileId: workloadProfile.profileId,
          scope: workloadProfile.scope,
          totalOperators: workloadProfile.totalOperators,
          totalTasks: workloadProfile.totalTasks,
        });
      }

      // 11. Return result
      const result: OperatorMetricResult = {
        resultId: `result-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        query,
        metrics,
        performanceSnapshots,
        workloadProfile,
        summary,
        metadata: {
          executionTimeMs: 0, // Would be computed from start time
          dataSourcesQueried: this.getDataSources(query.categories || []),
          filtersApplied: this.getFiltersApplied(query),
        },
        success: true,
        computedAt: new Date().toISOString(),
      };

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      this.log.logError({
        scope: query.scope,
        errorCode: 'QUERY_EXECUTION_ERROR',
        message: errorMessage,
        details: { queryId: query.queryId, error: String(error) },
      });

      return this.createErrorResult(query, errorMessage);
    }
  }

  // ==========================================================================
  // METRIC COMPUTATION
  // ==========================================================================

  private async computeMetrics(
    query: OperatorMetricQuery,
    tasks: TaskDataInput[],
    alerts: AlertDataInput[]
  ): Promise<AnyOperatorMetric[]> {
    const metrics: AnyOperatorMetric[] = [];

    const slaThresholds = query.slaThresholds || {
      bySeverity: { critical: 4, high: 24, medium: 72, low: 168, info: 720 },
    };

    for (const category of (query.categories || [])) {
      try {
        switch (category) {
          case 'task-throughput':
            metrics.push(
              this.aggregator.computeThroughputMetric(tasks, query.scope, query.timeRange)
            );
            break;

          case 'alert-response-time':
            metrics.push(
              this.aggregator.computeResponseTimeMetric(tasks, alerts, query.scope, query.timeRange)
            );
            break;

          case 'audit-remediation-timeline':
          case 'drift-remediation-timeline':
          case 'governance-resolution-time':
          case 'documentation-remediation':
          case 'simulation-resolution':
            const categoryTasks = tasks.filter(t => this.matchesCategory(t, category));
            metrics.push(
              this.aggregator.computeRemediationTimelineMetric(
                categoryTasks,
                category,
                query.scope,
                query.timeRange
              )
            );
            break;

          case 'sla-adherence':
            metrics.push(
              this.aggregator.computeSLAMetric(tasks, slaThresholds, query.scope, query.timeRange)
            );
            break;

          case 'workload-distribution':
            metrics.push(
              this.aggregator.computeWorkloadMetric(tasks, query.scope, query.timeRange)
            );
            break;

          case 'cross-engine-efficiency':
            metrics.push(
              this.aggregator.computeCrossEngineMetric(tasks, query.scope, query.timeRange)
            );
            break;
        }
      } catch (error) {
        console.error(`Error computing metric ${category}:`, error);
        // Continue with other metrics
      }
    }

    return metrics;
  }

  private matchesCategory(task: TaskDataInput, metricCategory: string): boolean {
    const mapping: Record<string, string[]> = {
      'audit-remediation-timeline': ['audit-remediation'],
      'drift-remediation-timeline': ['integrity-drift-remediation'],
      'governance-resolution-time': ['governance-lineage-issue'],
      'documentation-remediation': ['documentation-completeness'],
      'simulation-resolution': ['simulation-mismatch'],
    };

    return mapping[metricCategory]?.includes(task.category) || false;
  }

  // ==========================================================================
  // PERFORMANCE SNAPSHOTS
  // ==========================================================================

  private async computePerformanceSnapshots(
    query: OperatorMetricQuery,
    tasks: TaskDataInput[],
    context: OperatorAnalyticsPolicyContext
  ): Promise<OperatorPerformanceSnapshot[]> {
    const snapshots: OperatorPerformanceSnapshot[] = [];

    if (!query.operatorIds || query.operatorIds.length === 0) {
      return snapshots;
    }

    for (const operatorId of query.operatorIds) {
      // Check permissions
      if (!this.policyEngine.canAccessOperator(context, operatorId)) {
        continue;
      }

      const operatorTasks = tasks.filter(t => t.assignedTo === operatorId);

      if (operatorTasks.length > 0) {
        const snapshot = this.aggregator.computePerformanceSnapshot(
          operatorTasks,
          operatorId,
          operatorId, // In real system, look up operator name
          query.scope,
          query.timeRange
        );

        snapshots.push(snapshot);
      }
    }

    return snapshots;
  }

  // ==========================================================================
  // WORKLOAD PROFILE
  // ==========================================================================

  private async computeWorkloadProfile(
    query: OperatorMetricQuery,
    tasks: TaskDataInput[]
  ): Promise<OperatorWorkloadProfile | undefined> {
    // Only compute workload profile if requested
    if (!(query.categories || []).includes('workload-distribution')) {
      return undefined;
    }

    return this.aggregator.computeWorkloadProfile(tasks, query.scope, query.timeRange);
  }

  // ==========================================================================
  // DATA FILTERING
  // ==========================================================================

  private filterTasks(query: OperatorMetricQuery): TaskDataInput[] {
    let filtered = [...this.taskData];

    // Filter by scope
    filtered = filtered.filter(t => t.scope.tenantId === query.scope.tenantId);

    if (query.scope.facilityId) {
      filtered = filtered.filter(t => t.scope.facilityId === query.scope.facilityId);
    }

    if (query.scope.federationId) {
      filtered = filtered.filter(t => t.scope.federationId === query.scope.federationId);
    }

    // Filter by time range
    const start = new Date(query.timeRange.startDate).getTime();
    const end = new Date(query.timeRange.endDate).getTime();

    filtered = filtered.filter(t => {
      const created = new Date(t.createdAt).getTime();
      return created >= start && created <= end;
    });

    // Filter by operators (if specified)
    if (query.operatorIds && query.operatorIds.length > 0) {
      filtered = filtered.filter(t => 
        query.operatorIds!.includes(t.assignedTo || '') || 
        query.operatorIds!.includes(t.resolvedBy || '')
      );
    }

    return filtered;
  }

  private filterAlerts(query: OperatorMetricQuery): AlertDataInput[] {
    let filtered = [...this.alertData];

    // Filter by scope
    filtered = filtered.filter(a => a.scope.tenantId === query.scope.tenantId);

    if (query.scope.facilityId) {
      filtered = filtered.filter(a => a.scope.facilityId === query.scope.facilityId);
    }

    if (query.scope.federationId) {
      filtered = filtered.filter(a => a.scope.federationId === query.scope.federationId);
    }

    // Filter by time range
    const start = new Date(query.timeRange.startDate).getTime();
    const end = new Date(query.timeRange.endDate).getTime();

    filtered = filtered.filter(a => {
      const detected = new Date(a.detectedAt).getTime();
      return detected >= start && detected <= end;
    });

    return filtered;
  }

  // ==========================================================================
  // SUMMARY CREATION
  // ==========================================================================

  private createSummary(
    metrics: AnyOperatorMetric[],
    snapshots: OperatorPerformanceSnapshot[],
    profile: OperatorWorkloadProfile | undefined
  ): {
    totalMetrics: number;
    byCategory: Record<string, number>;
    overallSLAAdherence: number | null;
    overallAverageResolutionTime: number | null;
    overallThroughput: number | null;
  } {
    const byCategory: Record<string, number> = {};

    for (const metric of metrics) {
      byCategory[metric.category] = (byCategory[metric.category] || 0) + 1;
    }

    // Extract key metrics
    const slaMetric = metrics.find(m => m.category === 'sla-adherence');
    const throughputMetric = metrics.find(m => m.category === 'task-throughput');
    
    // Calculate average resolution time from remediation metrics
    const remediationMetrics = metrics.filter(m =>
      ['audit-remediation-timeline', 'drift-remediation-timeline', 'governance-resolution-time'].includes(m.category)
    );
    
    const averageResolutionTime = remediationMetrics.length > 0
      ? remediationMetrics.reduce((sum, m) => sum + m.value, 0) / remediationMetrics.length
      : null;

    return {
      totalMetrics: metrics.length,
      byCategory,
      overallSLAAdherence: slaMetric ? slaMetric.value : undefined,
      overallAverageResolutionTime: averageResolutionTime || undefined,
      overallThroughput: throughputMetric ? throughputMetric.value : undefined,
    };
  }

  // ==========================================================================
  // ERROR HANDLING
  // ==========================================================================

  private createErrorResult(
    query: OperatorMetricQuery,
    errorMessage: string
  ): OperatorMetricResult {
    return {
      resultId: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      query,
      metrics: [],
      performanceSnapshots: [],
      workloadProfile: undefined,
      summary: {
        totalMetrics: 0,
        byCategory: {},
        overallSLAAdherence: undefined,
        overallAverageResolutionTime: undefined,
        overallThroughput: undefined,
      },
      metadata: {
        executionTimeMs: 0,
        dataSourcesQueried: [],
        filtersApplied: [],
      },
      success: false,
      error: errorMessage,
      computedAt: new Date().toISOString(),
    };
  }

  // ==========================================================================
  // HELPERS
  // ==========================================================================

  private getDataSources(categories: string[]): string[] {
    const sources = new Set<string>();

    for (const category of categories) {
      if (category.includes('task') || category.includes('remediation')) {
        sources.add('action-center');
      }
      if (category.includes('alert')) {
        sources.add('alert-center');
      }
      if (category.includes('audit')) {
        sources.add('auditor');
      }
      if (category.includes('drift')) {
        sources.add('integrity-monitor');
      }
      if (category.includes('governance')) {
        sources.add('governance');
      }
      if (category.includes('documentation')) {
        sources.add('documentation');
      }
      if (category.includes('simulation')) {
        sources.add('simulation');
      }
    }

    return Array.from(sources);
  }

  private getFiltersApplied(query: OperatorMetricQuery): string[] {
    const filters: string[] = [];

    filters.push(`tenant:${query.scope.tenantId}`);

    if (query.scope.facilityId) {
      filters.push(`facility:${query.scope.facilityId}`);
    }

    if (query.scope.federationId) {
      filters.push(`federation:${query.scope.federationId}`);
    }

    if (query.operatorIds && query.operatorIds.length > 0) {
      filters.push(`operators:${query.operatorIds.length}`);
    }

    filters.push(`categories:${(query.categories || []).length}`);
    filters.push(`timeRange:${query.timeRange.startDate} to ${query.timeRange.endDate}`);

    return filters;
  }

  // ==========================================================================
  // LOG & STATISTICS ACCESS
  // ==========================================================================

  getLog(): OperatorAnalyticsLog {
    return this.log;
  }

  getStatistics(): OperatorAnalyticsStatistics {
    return this.log.getStatistics();
  }

  exportLogs(): string {
    return this.log.exportToJSON();
  }

  // ==========================================================================
  // QUICK QUERY METHODS
  // ==========================================================================

  async queryThroughput(
    scope: OperatorMetricQuery['scope'],
    timeRange: OperatorMetricQuery['timeRange'],
    context: OperatorAnalyticsPolicyContext
  ): Promise<OperatorMetricResult> {
    const query: OperatorMetricQuery = {
      queryId: `quick-throughput-${Date.now()}`,
      description: 'Quick throughput query',
      scope,
      categories: ['task-throughput'],
      timeRange,
      triggeredBy: context.userId,
      triggeredAt: new Date().toISOString(),
    };

    return this.executeQuery(query, context);
  }

  async querySLA(
    scope: OperatorMetricQuery['scope'],
    timeRange: OperatorMetricQuery['timeRange'],
    context: OperatorAnalyticsPolicyContext,
    slaThresholds?: SLAThresholds
  ): Promise<OperatorMetricResult> {
    const query: OperatorMetricQuery = {
      queryId: `quick-sla-${Date.now()}`,
      description: 'Quick SLA adherence query',
      scope,
      categories: ['sla-adherence'],
      timeRange,
      slaThresholds,
      triggeredBy: context.userId,
      triggeredAt: new Date().toISOString(),
    };

    return this.executeQuery(query, context);
  }

  async queryOperatorPerformance(
    operatorId: string,
    scope: OperatorMetricQuery['scope'],
    timeRange: OperatorMetricQuery['timeRange'],
    context: OperatorAnalyticsPolicyContext
  ): Promise<OperatorMetricResult> {
    const query: OperatorMetricQuery = {
      queryId: `quick-operator-${Date.now()}`,
      description: `Performance query for operator ${operatorId}`,
      scope,
      categories: ['task-throughput', 'sla-adherence', 'alert-response-time'],
      operatorIds: [operatorId],
      timeRange,
      triggeredBy: context.userId,
      triggeredAt: new Date().toISOString(),
    };

    return this.executeQuery(query, context);
  }
}
