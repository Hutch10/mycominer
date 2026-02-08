/**
 * Phase 62: Federation Marketplace - Main Engine
 * 
 * Orchestrates all federation components to provide unified multi-tenant insights.
 * Coordinates queries, benchmarking, analytics, and policy enforcement.
 */

import type {
  FederationQuery,
  FederationQueryResult,
  FederationContext,
  FederationResultData,
  Federation,
  FederationMetric,
  FederationBenchmark,
  FederationDataCategory,
} from './federationTypes';
import { FederationAggregator } from './federationAggregator';
import { FederationPolicyEngine } from './federationPolicyEngine';
import { FederationAnalyticsEngine } from './federationAnalyticsEngine';
import { FederationLog } from './federationLog';

/**
 * Main federation engine - orchestrates all federation operations
 */
export class FederationEngine {
  private tenantId: string;
  private policyEngine: FederationPolicyEngine;
  private log: FederationLog;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
    this.policyEngine = new FederationPolicyEngine(tenantId);
    this.log = new FederationLog(tenantId);
  }

  /**
   * Execute a federation query
   */
  async executeQuery(
    query: FederationQuery,
    context: FederationContext,
    data?: {
      federations?: Federation[];
      tenantData?: any;
      crossEngineData?: any;
    }
  ): Promise<FederationQueryResult> {
    const startTime = Date.now();

    try {
      // 1. Policy evaluation
      const policyDecision = this.policyEngine.evaluateQueryPolicy(
        query.queryType,
        query.federationId,
        query.tenantId,
        context
      );

      this.log.logPolicyEvaluation(policyDecision, context, {
        queryId: query.queryId,
        queryType: query.queryType,
      });

      if (!policyDecision.allowed) {
        const result: FederationQueryResult = {
          success: false,
          queryId: query.queryId,
          queryType: query.queryType,
          data: {},
          metadata: {
            executionTimeMs: Date.now() - startTime,
            tenantsIncluded: 0,
            federationsIncluded: 0,
            dataPointsAnalyzed: 0,
            timestamp: new Date(),
          },
          error: {
            code: 'POLICY_VIOLATION',
            message: policyDecision.reason,
            details: policyDecision,
          },
        };

        this.log.logQuery(query, result, context);
        return result;
      }

      // 2. Execute query based on type
      let resultData: FederationResultData = {};

      switch (query.queryType) {
        case 'list-federations':
          resultData = await this.listFederations(data?.federations || [], context);
          break;

        case 'get-federation-metrics':
          resultData = await this.getFederationMetrics(query, data, context);
          break;

        case 'get-tenant-benchmarks':
          resultData = await this.getTenantBenchmarks(query, data, context);
          break;

        case 'get-federation-insights':
          resultData = await this.getFederationInsights(query, data, context);
          break;

        case 'compare-tenants':
          resultData = await this.compareTenants(query, data, context);
          break;

        case 'trend-analysis':
          resultData = await this.analyzeTrends(query, data, context);
          break;

        case 'cross-federation-compare':
          resultData = await this.crossFederationCompare(query, data, context);
          break;

        default:
          throw new Error(`Unknown query type: ${query.queryType}`);
      }

      // 3. Build successful result
      const result: FederationQueryResult = {
        success: true,
        queryId: query.queryId,
        queryType: query.queryType,
        data: resultData,
        metadata: {
          executionTimeMs: Date.now() - startTime,
          tenantsIncluded: this.countTenants(resultData),
          federationsIncluded: this.countFederations(resultData),
          dataPointsAnalyzed: this.countDataPoints(resultData),
          timestamp: new Date(),
        },
      };

      this.log.logQuery(query, result, context);
      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const result: FederationQueryResult = {
        success: false,
        queryId: query.queryId,
        queryType: query.queryType,
        data: {},
        metadata: {
          executionTimeMs: Date.now() - startTime,
          tenantsIncluded: 0,
          federationsIncluded: 0,
          dataPointsAnalyzed: 0,
          timestamp: new Date(),
        },
        error: {
          code: 'EXECUTION_ERROR',
          message: errorMessage,
          details: error,
        },
      };

      this.log.logQuery(query, result, context);
      return result;
    }
  }

  /**
   * List available federations
   */
  private async listFederations(
    federations: Federation[],
    context: FederationContext
  ): Promise<FederationResultData> {
    // Filter federations based on tenant membership
    const accessible = federations.filter(fed =>
      fed.tenantIds.includes(context.tenantId || '') ||
      context.permissions.includes('federation:view-all')
    );

    return { federations: accessible };
  }

  /**
   * Get aggregated metrics for a federation
   */
  private async getFederationMetrics(
    query: FederationQuery,
    data: any,
    context: FederationContext
  ): Promise<FederationResultData> {
    if (!query.federationId) {
      throw new Error('federationId required for get-federation-metrics query');
    }

    const federation = data?.federations?.find((f: Federation) => f.federationId === query.federationId);
    if (!federation) {
      throw new Error(`Federation ${query.federationId} not found`);
    }

    const aggregator = new FederationAggregator(query.federationId);

    // Mock tenant data (in production, fetch from Phases 50-61)
    const mockTenantData = this.generateMockTenantData(
      federation.tenantIds,
      query.categories || []
    );

    const metrics: FederationMetric[] = [];

    for (const category of query.categories || []) {
      for (const metricName of this.getMetricsForCategory(category)) {
        const tenantValues = mockTenantData
          .filter(d => d.category === category && d.metricName === metricName)
          .map(d => ({ tenantId: d.tenantId, value: d.value, timestamp: d.timestamp }));

        const metric = aggregator.aggregateMetrics(
          category,
          metricName,
          tenantValues,
          federation.sharingAgreement
        );

        if (metric) {
          metrics.push(metric);
        }
      }
    }

    return { metrics };
  }

  /**
   * Get benchmarks for a tenant
   */
  private async getTenantBenchmarks(
    query: FederationQuery,
    data: any,
    context: FederationContext
  ): Promise<FederationResultData> {
    const tenantId = query.tenantId || context.tenantId;
    if (!tenantId) {
      throw new Error('tenantId required for benchmark query');
    }

    if (!query.federationId) {
      throw new Error('federationId required for benchmark query');
    }

    const federation = data?.federations?.find((f: Federation) => f.federationId === query.federationId);
    if (!federation) {
      throw new Error(`Federation ${query.federationId} not found`);
    }

    // Get tenant metrics and federation metrics
    const federationMetricsResult = await this.getFederationMetrics(query, data, context);
    const federationMetrics = federationMetricsResult.metrics || [];

    // Mock tenant data
    const tenantMetrics = this.generateMockTenantMetrics(
      tenantId,
      query.categories || []
    );

    const analyticsEngine = new FederationAnalyticsEngine(query.federationId);
    const benchmarks = analyticsEngine.generateBenchmarks(
      tenantId,
      tenantMetrics,
      federationMetrics
    );

    this.log.logBenchmark(tenantId, query.federationId, benchmarks.length, true, context);

    return { benchmarks };
  }

  /**
   * Get insights for a federation
   */
  private async getFederationInsights(
    query: FederationQuery,
    data: any,
    context: FederationContext
  ): Promise<FederationResultData> {
    if (!query.federationId) {
      throw new Error('federationId required for insights query');
    }

    // Get benchmarks first
    const benchmarksResult = await this.getTenantBenchmarks(query, data, context);
    const benchmarks = benchmarksResult.benchmarks || [];

    const analyticsEngine = new FederationAnalyticsEngine(query.federationId);
    const insights = analyticsEngine.generateInsights(benchmarks);

    this.log.logInsightGeneration(
      query.federationId,
      insights.length,
      query.categories || [],
      true,
      context
    );

    return { insights };
  }

  /**
   * Compare tenants (anonymized)
   */
  private async compareTenants(
    query: FederationQuery,
    data: any,
    context: FederationContext
  ): Promise<FederationResultData> {
    if (!query.federationId) {
      throw new Error('federationId required for tenant comparison');
    }

    const federation = data?.federations?.find((f: Federation) => f.federationId === query.federationId);
    if (!federation) {
      throw new Error(`Federation ${query.federationId} not found`);
    }

    // Get metrics for two tenants (anonymized if not self)
    const tenantIds = federation.tenantIds.slice(0, 2);
    if (tenantIds.length < 2) {
      throw new Error('Need at least 2 tenants for comparison');
    }

    const analyticsEngine = new FederationAnalyticsEngine(query.federationId);

    // Mock metrics for comparison
    const entityA = {
      type: 'tenant' as const,
      id: tenantIds[0],
      name: tenantIds[0] === context.tenantId ? 'Your Facility' : 'Peer A',
      metrics: [],
    };

    const entityB = {
      type: 'tenant' as const,
      id: tenantIds[1],
      name: tenantIds[1] === context.tenantId ? 'Your Facility' : 'Peer B',
      metrics: [],
    };

    const comparisons = analyticsEngine.compareEntities(
      entityA,
      entityB,
      query.categories || []
    );

    return { comparisons };
  }

  /**
   * Analyze trends over time
   */
  private async analyzeTrends(
    query: FederationQuery,
    data: any,
    context: FederationContext
  ): Promise<FederationResultData> {
    if (!query.federationId) {
      throw new Error('federationId required for trend analysis');
    }

    const analyticsEngine = new FederationAnalyticsEngine(query.federationId);
    const trends = [];

    for (const category of query.categories || []) {
      for (const metricName of this.getMetricsForCategory(category)) {
        // Mock time series data
        const dataPoints = this.generateMockTimeSeriesData(metricName, 30);
        const trend = analyticsEngine.analyzeTrends(category, metricName, dataPoints);
        if (trend) {
          trends.push(trend);
        }
      }
    }

    return { trends };
  }

  /**
   * Compare across federations
   */
  private async crossFederationCompare(
    query: FederationQuery,
    data: any,
    context: FederationContext
  ): Promise<FederationResultData> {
    const federations = data?.federations || [];
    
    if (federations.length < 2) {
      throw new Error('Need at least 2 federations for cross-federation comparison');
    }

    // Policy check for cross-federation access
    const policyDecision = this.policyEngine.evaluateCrossFederationPolicy(
      federations.map((f: Federation) => f.federationId),
      context
    );

    if (!policyDecision.allowed) {
      throw new Error(policyDecision.reason);
    }

    // Mock comparison (in production, aggregate metrics from each federation)
    const comparisons = [];

    return { comparisons };
  }

  // Helper methods for mock data generation
  private generateMockTenantData(
    tenantIds: string[],
    categories: FederationDataCategory[]
  ): Array<{ tenantId: string; category: FederationDataCategory; metricName: string; value: number; timestamp: Date }> {
    const data = [];
    for (const tenantId of tenantIds) {
      for (const category of categories) {
        for (const metricName of this.getMetricsForCategory(category)) {
          data.push({
            tenantId,
            category,
            metricName,
            value: 70 + Math.random() * 30, // 70-100 range
            timestamp: new Date(),
          });
        }
      }
    }
    return data;
  }

  private generateMockTenantMetrics(
    tenantId: string,
    categories: FederationDataCategory[]
  ): Array<{ category: FederationDataCategory; metricName: string; value: number }> {
    const metrics = [];
    for (const category of categories) {
      for (const metricName of this.getMetricsForCategory(category)) {
        metrics.push({
          category,
          metricName,
          value: 75 + Math.random() * 20, // 75-95 range
        });
      }
    }
    return metrics;
  }

  private generateMockTimeSeriesData(
    metricName: string,
    days: number
  ): Array<{ timestamp: Date; value: number }> {
    const data = [];
    const baseValue = 80;
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - i));
      data.push({
        timestamp: date,
        value: baseValue + Math.random() * 20 + (i * 0.2), // Slight upward trend
      });
    }
    return data;
  }

  private getMetricsForCategory(category: FederationDataCategory): string[] {
    const metricMap: Record<FederationDataCategory, string[]> = {
      'performance-metrics': ['overall-efficiency', 'task-completion-rate', 'response-time'],
      'compliance-rates': ['compliance-score', 'audit-pass-rate', 'policy-adherence'],
      'capacity-utilization': ['resource-utilization', 'capacity-efficiency', 'workload-balance'],
      'alert-volumes': ['alert-frequency', 'alert-resolution-time', 'critical-alert-rate'],
      'workflow-efficiency': ['workflow-completion-rate', 'average-cycle-time', 'bottleneck-score'],
      'training-completion': ['training-completion-rate', 'certification-rate', 'skills-coverage'],
      'audit-findings-summary': ['audit-findings-count', 'critical-findings-rate', 'remediation-time'],
      'operator-productivity': ['productivity-score', 'tasks-per-shift', 'quality-rate'],
      'cost-benchmarks': ['cost-per-unit', 'operational-efficiency', 'resource-optimization'],
      'quality-metrics': ['quality-score', 'defect-rate', 'customer-satisfaction'],
    };

    return metricMap[category] || [];
  }

  private countTenants(data: FederationResultData): number {
    const tenantIds = new Set<string>();
    data.benchmarks?.forEach(b => tenantIds.add(b.tenantId));
    data.comparisons?.forEach(c => {
      if (c.entityAType === 'tenant') tenantIds.add(c.entityAId);
      if (c.entityBType === 'tenant') tenantIds.add(c.entityBId);
    });
    return tenantIds.size;
  }

  private countFederations(data: FederationResultData): number {
    return data.federations?.length || 0;
  }

  private countDataPoints(data: FederationResultData): number {
    return (
      (data.metrics?.length || 0) +
      (data.benchmarks?.length || 0) +
      (data.insights?.length || 0) +
      (data.trends?.length || 0) +
      (data.comparisons?.length || 0)
    );
  }

  /**
   * Get log instance for external access
   */
  getLog(): FederationLog {
    return this.log;
  }

  /**
   * Get policy engine instance for external access
   */
  getPolicyEngine(): FederationPolicyEngine {
    return this.policyEngine;
  }
}
