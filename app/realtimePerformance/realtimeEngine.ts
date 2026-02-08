/**
 * REAL-TIME ENGINE
 * Phase 55: Real-Time Performance Monitoring
 * 
 * Main orchestrator for real-time monitoring:
 * - Event streaming from Phases 45-54
 * - Metric aggregation
 * - Policy evaluation
 * - Query execution
 * 
 * NO GENERATIVE AI. NO PREDICTIONS. NO SYNTHETIC EVENTS.
 */

import { RealTimeStream } from './realtimeStream';
import { RealTimeAggregator } from './realtimeAggregator';
import { RealTimePolicyEngine } from './realtimePolicyEngine';
import { RealTimeLog } from './realtimeLog';
import {
  RealTimeEvent,
  RealTimeQuery,
  RealTimeResult,
  RealTimePolicyContext,
  RealTimeMetricCategory,
  RealTimeReference,
} from './realtimeTypes';

// ============================================================================
// REAL-TIME ENGINE
// ============================================================================

export class RealTimeEngine {
  private stream: RealTimeStream;
  private aggregator: RealTimeAggregator;
  private policyEngine: RealTimePolicyEngine;
  private log: RealTimeLog;

  constructor() {
    this.stream = new RealTimeStream();
    this.aggregator = new RealTimeAggregator();
    this.policyEngine = new RealTimePolicyEngine();
    this.log = new RealTimeLog();
  }

  // ==========================================================================
  // EVENT INGESTION
  // ==========================================================================

  /**
   * Ingest a real-time event from external systems
   */
  ingestEvent(event: RealTimeEvent): void {
    // Log event received
    this.log.logEventReceived({ event });

    // Add to stream
    this.stream.ingestEvent(event);
  }

  /**
   * Batch ingest events
   */
  ingestEvents(events: RealTimeEvent[]): void {
    for (const event of events) {
      this.ingestEvent(event);
    }
  }

  // ==========================================================================
  // QUERY EXECUTION
  // ==========================================================================

  /**
   * Execute a real-time monitoring query
   */
  async executeQuery(
    query: RealTimeQuery,
    context: RealTimePolicyContext
  ): Promise<RealTimeResult> {
    // Step 1: Evaluate policy
    const decision = this.policyEngine.evaluateQueryPolicy(query, context);

    // Step 2: Log policy decision
    this.log.logPolicyDecision({
      queryId: query.queryId,
      scope: query.scope,
      allowed: decision.allowed,
      reason: decision.reason,
      violations: decision.violations,
      warnings: decision.warnings,
    });

    // Step 3: Return error if denied
    if (!decision.allowed) {
      return this.createErrorResult(query, decision.reason);
    }

    // Step 4: Get stream state
    const streamState = this.stream.getStreamState(query.scope);
    if (!streamState) {
      return this.createErrorResult(query, 'No stream state found for scope');
    }

    // Step 5: Compute metrics
    const categories = query.categories || this.getDefaultCategories();
    const metrics = this.aggregator.computeMetrics(streamState, categories);

    // Step 6: Filter metrics by visibility policy
    const visibleMetrics = metrics.filter(metric =>
      this.policyEngine.evaluateMetricVisibility(metric, context)
    );

    // Step 7: Log computed metrics
    for (const metric of visibleMetrics) {
      this.log.logMetricComputed({ metric });
    }

    // Step 8: Collect references
    const references = this.collectReferences(streamState, query);

    // Step 9: Create summary
    const summary = this.createSummary(visibleMetrics, streamState);

    // Step 10: Log stream state update
    this.log.logStreamStateUpdate({
      stateId: streamState.stateId,
      scope: streamState.scope,
      eventsProcessed: streamState.recentEvents.length,
      metricsComputed: visibleMetrics.length,
    });

    // Step 11: Return result
    return {
      resultId: `result-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      query,
      metrics: visibleMetrics,
      streamState,
      references,
      summary,
      metadata: {
        computedAt: new Date().toISOString(),
        computationTimeMs: 0, // Would be tracked with performance monitoring
        dataSourcesQueried: this.getDataSources(categories),
      },
      success: true,
    };
  }

  // ==========================================================================
  // QUICK QUERY METHODS
  // ==========================================================================

  /**
   * Query live workload
   */
  async queryLiveWorkload(
    scope: { tenantId: string; facilityId?: string; federationId?: string },
    context: RealTimePolicyContext,
    operatorId?: string
  ): Promise<RealTimeResult> {
    const query: RealTimeQuery = {
      queryId: `query-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      description: 'Query live workload',
      scope,
      categories: ['live-workload'],
      operatorIds: operatorId ? [operatorId] : undefined,
      requestedBy: context.userId,
      requestedAt: new Date().toISOString(),
    };

    return this.executeQuery(query, context);
  }

  /**
   * Query SLA countdowns
   */
  async querySLACountdowns(
    scope: { tenantId: string; facilityId?: string; federationId?: string },
    context: RealTimePolicyContext
  ): Promise<RealTimeResult> {
    const query: RealTimeQuery = {
      queryId: `query-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      description: 'Query SLA countdowns',
      scope,
      categories: ['sla-countdown'],
      requestedBy: context.userId,
      requestedAt: new Date().toISOString(),
    };

    return this.executeQuery(query, context);
  }

  /**
   * Query active tasks
   */
  async queryActiveTasks(
    scope: { tenantId: string; facilityId?: string; federationId?: string },
    context: RealTimePolicyContext
  ): Promise<RealTimeResult> {
    const query: RealTimeQuery = {
      queryId: `query-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      description: 'Query active tasks',
      scope,
      categories: ['active-tasks'],
      requestedBy: context.userId,
      requestedAt: new Date().toISOString(),
    };

    return this.executeQuery(query, context);
  }

  /**
   * Query cross-engine performance
   */
  async queryCrossEnginePerformance(
    scope: { tenantId: string; facilityId?: string; federationId?: string },
    context: RealTimePolicyContext
  ): Promise<RealTimeResult> {
    const query: RealTimeQuery = {
      queryId: `query-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      description: 'Query cross-engine performance',
      scope,
      categories: ['cross-engine-performance'],
      requestedBy: context.userId,
      requestedAt: new Date().toISOString(),
    };

    return this.executeQuery(query, context);
  }

  // ==========================================================================
  // SUBSCRIPTION MANAGEMENT
  // ==========================================================================

  /**
   * Subscribe to real-time events
   */
  subscribeToEvents(
    scope: { tenantId: string; facilityId?: string; federationId?: string },
    categories: RealTimeEvent['category'][],
    callback: (event: RealTimeEvent) => void,
    context: RealTimePolicyContext
  ): string {
    // Validate subscription policy
    // In production, would validate permissions here

    return this.stream.subscribe({
      scope,
      categories,
      callback: (event: RealTimeEvent) => {
        // Check event visibility
        if (this.policyEngine.evaluateEventVisibility(event, context)) {
          callback(event);
        }
      },
    });
  }

  /**
   * Unsubscribe from real-time events
   */
  unsubscribeFromEvents(subscriptionId: string): void {
    this.stream.unsubscribe(subscriptionId);
  }

  // ==========================================================================
  // STREAM STATE ACCESS
  // ==========================================================================

  /**
   * Get current stream state
   */
  getStreamState(scope: {
    tenantId: string;
    facilityId?: string;
    federationId?: string;
  }) {
    return this.stream.getStreamState(scope);
  }

  /**
   * Get recent events
   */
  getRecentEvents(
    scope: {
      tenantId: string;
      facilityId?: string;
      federationId?: string;
    },
    limit?: number
  ) {
    return this.stream.getRecentEvents(scope, limit);
  }

  /**
   * Get SLA countdowns
   */
  getSLACountdowns(scope: {
    tenantId: string;
    facilityId?: string;
    federationId?: string;
  }) {
    return this.stream.getSLACountdowns(scope);
  }

  /**
   * Get workload state
   */
  getWorkloadState(scope: {
    tenantId: string;
    facilityId?: string;
    federationId?: string;
  }) {
    return this.stream.getWorkloadState(scope);
  }

  // ==========================================================================
  // LOG ACCESS
  // ==========================================================================

  /**
   * Get log entries
   */
  getLog(filter?: Parameters<RealTimeLog['getEntries']>[0]) {
    return this.log.getEntries(filter);
  }

  /**
   * Get statistics
   */
  getStatistics() {
    return this.log.getStatistics();
  }

  /**
   * Export logs
   */
  exportLogs(format: 'json' | 'csv', filter?: Parameters<RealTimeLog['getEntries']>[0]): string {
    if (format === 'json') {
      return this.log.exportToJSON(filter);
    } else {
      return this.log.exportToCSV(filter);
    }
  }

  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================

  private getDefaultCategories(): RealTimeMetricCategory[] {
    return [
      'live-workload',
      'active-tasks',
      'sla-countdown',
      'response-latency',
      'remediation-timeline',
      'cross-engine-performance',
      'workload-delta',
      'trend-signal',
    ];
  }

  private getDataSources(categories: RealTimeMetricCategory[]): string[] {
    const sources: Set<string> = new Set();

    for (const category of categories) {
      switch (category) {
        case 'live-workload':
        case 'active-tasks':
        case 'workload-delta':
          sources.add('action-center');
          break;
        case 'sla-countdown':
          sources.add('action-center');
          sources.add('alert-center');
          break;
        case 'response-latency':
          sources.add('alert-center');
          break;
        case 'remediation-timeline':
          sources.add('auditor');
          sources.add('integrity-monitor');
          sources.add('governance-history');
          sources.add('documentation-engine');
          sources.add('simulation-mode');
          break;
        case 'cross-engine-performance':
          sources.add('all-engines');
          break;
        case 'trend-signal':
          sources.add('all-engines');
          break;
      }
    }

    return Array.from(sources);
  }

  private collectReferences(
    streamState: any,
    query: RealTimeQuery
  ): RealTimeResult['references'] {
    const taskIds = new Set<string>();
    const alertIds = new Set<string>();
    const auditFindingIds = new Set<string>();
    const driftEventIds = new Set<string>();
    const governanceLineageIds = new Set<string>();
    const documentationBundleIds = new Set<string>();
    const simulationScenarioIds = new Set<string>();
    const analyticsMetricIds = new Set<string>();

    for (const event of streamState.recentEvents) {
      switch (event.category) {
        case 'task-lifecycle':
          taskIds.add(event.entityId);
          break;
        case 'alert-lifecycle':
          alertIds.add(event.entityId);
          break;
        case 'audit-finding':
          auditFindingIds.add(event.entityId);
          break;
        case 'drift-detection':
          driftEventIds.add(event.entityId);
          break;
        case 'governance-lineage':
          governanceLineageIds.add(event.entityId);
          break;
        case 'documentation-drift':
          documentationBundleIds.add(event.entityId);
          break;
        case 'simulation-mismatch':
          simulationScenarioIds.add(event.entityId);
          break;
        case 'performance-signal':
          analyticsMetricIds.add(event.entityId);
          break;
      }
    }

    return {
      taskIds: Array.from(taskIds),
      alertIds: Array.from(alertIds),
      auditFindingIds: Array.from(auditFindingIds),
      driftEventIds: Array.from(driftEventIds),
      governanceLineageIds: Array.from(governanceLineageIds),
      documentationBundleIds: Array.from(documentationBundleIds),
      simulationScenarioIds: Array.from(simulationScenarioIds),
      analyticsMetricIds: Array.from(analyticsMetricIds),
    };
  }

  private createSummary(metrics: any[], streamState: any): RealTimeResult['summary'] {
    const liveWorkloadMetric = metrics.find(m => m.category === 'live-workload');
    const activeTasksMetric = metrics.find(m => m.category === 'active-tasks');
    const slaCountdownMetric = metrics.find(m => m.category === 'sla-countdown');
    const responseLatencyMetric = metrics.find(m => m.category === 'response-latency');

    return {
      totalMetrics: metrics.length,
      activeAlerts: streamState.recentEvents.filter((e: any) => e.category === 'alert-lifecycle').length,
      activeTasks: activeTasksMetric?.value || 0,
      operatorsOnline: streamState.workloadState.length,
      avgResponseTime: responseLatencyMetric?.value || 0,
      slaAdherence: slaCountdownMetric
        ? ((slaCountdownMetric.breakdown?.byStatus?.ok || 0) / (slaCountdownMetric.value || 1)) * 100
        : 100,
    };
  }

  private createErrorResult(query: RealTimeQuery, error: string): RealTimeResult {
    this.log.logError({
      scope: query.scope,
      errorCode: 'QUERY_FAILED',
      message: error,
      details: { queryId: query.queryId },
    });

    return {
      resultId: `result-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      query,
      metrics: [],
      streamState: this.stream.getStreamState(query.scope) || this.createEmptyStreamState(query.scope),
      references: {
        taskIds: [],
        alertIds: [],
        auditFindingIds: [],
        driftEventIds: [],
        governanceLineageIds: [],
        documentationBundleIds: [],
        simulationScenarioIds: [],
        analyticsMetricIds: [],
      },
      summary: {
        totalMetrics: 0,
        activeAlerts: 0,
        activeTasks: 0,
        operatorsOnline: 0,
        avgResponseTime: 0,
        slaAdherence: 0,
      },
      metadata: {
        computedAt: new Date().toISOString(),
        computationTimeMs: 0,
        dataSourcesQueried: [],
      },
      success: false,
      error,
    };
  }

  private createEmptyStreamState(scope: {
    tenantId: string;
    facilityId?: string;
    federationId?: string;
  }): any {
    return {
      stateId: `state-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      scope,
      recentEvents: [],
      maxEventBufferSize: 1000,
      rollingMetrics: {
        totalEventsReceived: 0,
        eventsPerMinute: 0,
        eventsByCategory: {},
        eventsBySeverity: {},
      },
      slaCountdowns: [],
      workloadState: [],
      streamHealth: {
        isActive: false,
        lastEventReceived: new Date().toISOString(),
        eventLag: 0,
        missedEvents: 0,
      },
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };
  }
}
