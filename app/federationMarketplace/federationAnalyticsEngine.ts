/**
 * Phase 62: Federation Marketplace - Analytics Engine
 * 
 * Generates benchmarks, insights, trends, and comparisons from federation data.
 * All analysis is deterministic and derived from real aggregated metrics.
 */

import type {
  FederationMetric,
  FederationBenchmark,
  FederationInsight,
  FederationTrend,
  FederationComparison,
  FederationDataCategory,
  FederationInsightType,
} from './federationTypes';
import { FederationAggregator } from './federationAggregator';

/**
 * Analyzes federation data to generate actionable insights
 */
export class FederationAnalyticsEngine {
  private federationId: string;
  private aggregator: FederationAggregator;

  constructor(federationId: string) {
    this.federationId = federationId;
    this.aggregator = new FederationAggregator(federationId);
  }

  /**
   * Generate benchmarks for a tenant against federation
   */
  generateBenchmarks(
    tenantId: string,
    tenantMetrics: Array<{ category: FederationDataCategory; metricName: string; value: number }>,
    federationMetrics: FederationMetric[]
  ): FederationBenchmark[] {
    const benchmarks: FederationBenchmark[] = [];

    for (const tenantMetric of tenantMetrics) {
      // Find matching federation metric
      const fedMetric = federationMetrics.find(
        m => m.category === tenantMetric.category && m.metricName === tenantMetric.metricName
      );

      if (!fedMetric) continue;

      // Extract percentile data from federation metric metadata
      const p25 = fedMetric.metadata?.p25 || fedMetric.value * 0.75;
      const p50 = fedMetric.value; // Median
      const p75 = fedMetric.metadata?.p75 || fedMetric.value * 1.25;

      // Calculate tenant's percentile
      const allValues = [
        fedMetric.metadata?.min || p25,
        p25,
        p50,
        p75,
        fedMetric.metadata?.max || p75,
      ];
      const percentile = this.aggregator.calculatePercentileRank(tenantMetric.value, allValues);

      // Calculate gap from median
      const gap = tenantMetric.value - p50;

      benchmarks.push({
        benchmarkId: `benchmark-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        tenantId,
        federationId: this.federationId,
        category: tenantMetric.category,
        metricName: tenantMetric.metricName,
        tenantValue: tenantMetric.value,
        federationMedian: p50,
        federationP25: p25,
        federationP75: p75,
        tenantPercentile: percentile,
        comparisonStatus: this.aggregator.getComparisonStatus(percentile),
        gap,
        timestamp: new Date(),
      });
    }

    return benchmarks;
  }

  /**
   * Generate insights from benchmarks
   */
  generateInsights(
    benchmarks: FederationBenchmark[],
    thresholds?: {
      performanceGapPercent?: number;
      complianceMinimum?: number;
      efficiencyMinimum?: number;
    }
  ): FederationInsight[] {
    const insights: FederationInsight[] = [];
    const defaults = {
      performanceGapPercent: 20,
      complianceMinimum: 90,
      efficiencyMinimum: 80,
    };
    const config = { ...defaults, ...thresholds };

    for (const benchmark of benchmarks) {
      // Performance opportunity - significantly below average
      if (benchmark.tenantPercentile < 25 && Math.abs(benchmark.gap) > config.performanceGapPercent) {
        insights.push(this.createInsight(
          'performance-opportunity',
          `Below Average Performance in ${benchmark.metricName}`,
          `Your ${benchmark.metricName} (${benchmark.tenantValue.toFixed(2)}) is in the bottom quartile (${benchmark.tenantPercentile.toFixed(0)}th percentile). The federation median is ${benchmark.federationMedian.toFixed(2)}.`,
          'recommendation',
          [benchmark.category],
          [benchmark]
        ));
      }

      // Efficiency leader - top quartile
      if (benchmark.tenantPercentile >= 75) {
        insights.push(this.createInsight(
          'efficiency-leader',
          `Top Performer in ${benchmark.metricName}`,
          `Excellent work! Your ${benchmark.metricName} (${benchmark.tenantValue.toFixed(2)}) ranks in the top 25% (${benchmark.tenantPercentile.toFixed(0)}th percentile) across the federation.`,
          'info',
          [benchmark.category],
          [benchmark]
        ));
      }

      // Compliance gap - for compliance-related metrics
      if (benchmark.category === 'compliance-rates' && benchmark.tenantValue < config.complianceMinimum) {
        insights.push(this.createInsight(
          'compliance-gap',
          `Compliance Rate Below Standard`,
          `Your compliance rate (${benchmark.tenantValue.toFixed(1)}%) is below the recommended ${config.complianceMinimum}% threshold. Federation median is ${benchmark.federationMedian.toFixed(1)}%.`,
          'warning',
          [benchmark.category],
          [benchmark]
        ));
      }

      // Workflow bottleneck - for efficiency metrics
      if (benchmark.category === 'workflow-efficiency' && benchmark.tenantValue < config.efficiencyMinimum) {
        insights.push(this.createInsight(
          'workflow-bottleneck',
          `Workflow Efficiency Below Peers`,
          `Your workflow efficiency (${benchmark.tenantValue.toFixed(1)}%) is below federation standards (median: ${benchmark.federationMedian.toFixed(1)}%). This may indicate process bottlenecks.`,
          'recommendation',
          [benchmark.category],
          [benchmark]
        ));
      }
    }

    return insights;
  }

  /**
   * Analyze trends over time
   */
  analyzeTrends(
    category: FederationDataCategory,
    metricName: string,
    dataPoints: Array<{ timestamp: Date; value: number }>
  ): FederationTrend | null {
    if (dataPoints.length < 3) {
      return null; // Need minimum data points for trend analysis
    }

    // Sort by timestamp
    const sorted = [...dataPoints].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    // Calculate linear trend
    const n = sorted.length;
    const xValues = sorted.map((_, i) => i);
    const yValues = sorted.map(p => p.value);

    const xMean = xValues.reduce((sum, x) => sum + x, 0) / n;
    const yMean = yValues.reduce((sum, y) => sum + y, 0) / n;

    let numerator = 0;
    let denominator = 0;
    for (let i = 0; i < n; i++) {
      numerator += (xValues[i] - xMean) * (yValues[i] - yMean);
      denominator += Math.pow(xValues[i] - xMean, 2);
    }

    const slope = numerator / denominator;
    const changeRate = (slope / yMean) * 100; // Percentage change per period

    // Determine trend direction
    let trendDirection: 'improving' | 'stable' | 'declining';
    if (Math.abs(changeRate) < 2) {
      trendDirection = 'stable';
    } else if (this.isImprovingMetric(metricName)) {
      trendDirection = changeRate > 0 ? 'improving' : 'declining';
    } else {
      trendDirection = changeRate < 0 ? 'improving' : 'declining';
    }

    // Determine significance based on consistency
    const variance = this.calculateVariance(yValues);
    const significance: 'high' | 'medium' | 'low' = 
      variance < yMean * 0.1 ? 'high' :
      variance < yMean * 0.25 ? 'medium' : 'low';

    return {
      trendId: `trend-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      federationId: this.federationId,
      category,
      metricName,
      dataPoints: sorted,
      trendDirection,
      changeRate,
      significance,
    };
  }

  /**
   * Compare two entities (tenants or federations)
   */
  compareEntities(
    entityA: { type: 'tenant' | 'federation'; id: string; name?: string; metrics: FederationMetric[] },
    entityB: { type: 'tenant' | 'federation'; id: string; name?: string; metrics: FederationMetric[] },
    categories: FederationDataCategory[]
  ): FederationComparison[] {
    const comparisons: FederationComparison[] = [];

    for (const category of categories) {
      const metricsA = entityA.metrics.filter(m => m.category === category);
      const metricsB = entityB.metrics.filter(m => m.category === category);

      const metricComparisons: Array<{
        metricName: string;
        entityAValue: number;
        entityBValue: number;
        difference: number;
        differencePercent: number;
      }> = [];

      // Match metrics by name
      for (const metricA of metricsA) {
        const metricB = metricsB.find(m => m.metricName === metricA.metricName);
        if (!metricB) continue;

        const diff = metricA.value - metricB.value;
        const diffPercent = (diff / metricB.value) * 100;

        metricComparisons.push({
          metricName: metricA.metricName,
          entityAValue: metricA.value,
          entityBValue: metricB.value,
          difference: diff,
          differencePercent: diffPercent,
        });
      }

      if (metricComparisons.length > 0) {
        // Determine winner based on majority of metrics
        let aWins = 0;
        let bWins = 0;

        for (const comp of metricComparisons) {
          if (this.isImprovingMetric(comp.metricName)) {
            if (comp.entityAValue > comp.entityBValue) aWins++;
            else if (comp.entityBValue > comp.entityAValue) bWins++;
          } else {
            if (comp.entityAValue < comp.entityBValue) aWins++;
            else if (comp.entityBValue < comp.entityAValue) bWins++;
          }
        }

        const winner: 'entityA' | 'entityB' | 'tie' =
          aWins > bWins ? 'entityA' :
          bWins > aWins ? 'entityB' : 'tie';

        comparisons.push({
          comparisonId: `comparison-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          entityAType: entityA.type,
          entityAId: entityA.id,
          entityAName: entityA.name,
          entityBType: entityB.type,
          entityBId: entityB.id,
          entityBName: entityB.name,
          category,
          metrics: metricComparisons,
          winner,
          timestamp: new Date(),
        });
      }
    }

    return comparisons;
  }

  /**
   * Calculate aggregate statistics for a set of metrics
   */
  calculateStatistics(metrics: Array<{ value: number }>): {
    mean: number;
    median: number;
    stdDev: number;
    min: number;
    max: number;
    range: number;
  } {
    const values = metrics.map(m => m.value).sort((a, b) => a - b);
    const n = values.length;

    if (n === 0) {
      return { mean: 0, median: 0, stdDev: 0, min: 0, max: 0, range: 0 };
    }

    const mean = values.reduce((sum, v) => sum + v, 0) / n;
    const median = n % 2 === 0
      ? (values[n / 2 - 1] + values[n / 2]) / 2
      : values[Math.floor(n / 2)];

    const variance = this.calculateVariance(values);
    const stdDev = Math.sqrt(variance);

    return {
      mean,
      median,
      stdDev,
      min: values[0],
      max: values[n - 1],
      range: values[n - 1] - values[0],
    };
  }

  // Helper methods
  private createInsight(
    type: FederationInsightType,
    title: string,
    description: string,
    severity: 'info' | 'recommendation' | 'warning' | 'opportunity',
    categories: FederationDataCategory[],
    metrics: FederationMetric[]
  ): FederationInsight {
    const recommendations = this.generateRecommendations(type, metrics);

    return {
      insightId: `insight-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      federationId: this.federationId,
      type,
      title,
      description,
      severity,
      affectedCategories: categories,
      evidence: metrics,
      recommendations,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    };
  }

  private generateRecommendations(type: FederationInsightType, metrics: FederationMetric[]): string[] {
    const recommendations: string[] = [];

    switch (type) {
      case 'performance-opportunity':
        recommendations.push('Review operational procedures and compare with high-performing peers');
        recommendations.push('Consider simulation training to identify improvement areas');
        recommendations.push('Analyze workflow bottlenecks using Phase 43 Workflow Engine');
        break;

      case 'compliance-gap':
        recommendations.push('Review compliance policies and audit findings (Phase 50)');
        recommendations.push('Schedule additional training for operators');
        recommendations.push('Implement automated compliance checks');
        break;

      case 'workflow-bottleneck':
        recommendations.push('Use Phase 49 Simulation Mode to identify process inefficiencies');
        recommendations.push('Review SOP execution times and optimization opportunities');
        recommendations.push('Consider workload orchestration adjustments (Phase 57)');
        break;

      case 'training-gap':
        recommendations.push('Assign additional training modules (Phase 40)');
        recommendations.push('Review training completion rates by operator');
        recommendations.push('Consider peer mentoring programs');
        break;

      case 'cost-optimization':
        recommendations.push('Analyze capacity utilization (Phase 56)');
        recommendations.push('Review resource allocation and scheduling');
        recommendations.push('Consider efficiency improvements from top-performing peers');
        break;
    }

    return recommendations;
  }

  private isImprovingMetric(metricName: string): boolean {
    // Higher is better
    const higherIsBetter = [
      'compliance-rate',
      'completion-rate',
      'efficiency',
      'productivity',
      'quality',
      'utilization',
    ];

    // Lower is better
    const lowerIsBetter = [
      'resolution-time',
      'response-time',
      'cost',
      'alert-volume',
      'error-rate',
      'downtime',
    ];

    const nameLower = metricName.toLowerCase();

    for (const keyword of higherIsBetter) {
      if (nameLower.includes(keyword)) return true;
    }

    for (const keyword of lowerIsBetter) {
      if (nameLower.includes(keyword)) return false;
    }

    // Default: higher is better
    return true;
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    return squaredDiffs.reduce((sum, d) => sum + d, 0) / values.length;
  }
}
