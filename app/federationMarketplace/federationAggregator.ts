/**
 * Phase 62: Federation Marketplace - Aggregation Engine
 * 
 * Collects and aggregates data across multiple tenants within federations
 * while enforcing strict privacy controls and anonymization requirements.
 */

import type {
  Federation,
  FederationMetric,
  FederationDataCategory,
  AnonymizationResult,
  SharingAgreement,
} from './federationTypes';

/**
 * Aggregates data from multiple tenants in a privacy-compliant manner
 */
export class FederationAggregator {
  private federationId: string;

  constructor(federationId: string) {
    this.federationId = federationId;
  }

  /**
   * Aggregate metrics from multiple tenants
   * Only returns data if minimum threshold is met
   */
  aggregateMetrics(
    category: FederationDataCategory,
    metricName: string,
    tenantData: Array<{ tenantId: string; value: number; timestamp: Date }>,
    sharingAgreement: SharingAgreement
  ): FederationMetric | null {
    // Enforce aggregation threshold (minimum number of tenants)
    if (tenantData.length < sharingAgreement.aggregationThreshold) {
      console.log(`Insufficient data: ${tenantData.length} < ${sharingAgreement.aggregationThreshold}`);
      return null; // Cannot share data with too few contributors
    }

    // Check if category is allowed
    if (!sharingAgreement.allowedCategories.includes(category)) {
      console.log(`Category ${category} not allowed in federation ${this.federationId}`);
      return null;
    }

    const values = tenantData.map(d => d.value);
    const timestamps = tenantData.map(d => d.timestamp);

    return {
      metricId: `metric-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      federationId: this.federationId,
      category,
      metricName,
      value: this.calculateMedian(values),
      unit: this.getUnitForMetric(metricName),
      aggregationType: 'median',
      contributingTenants: tenantData.length, // Count only, no IDs
      timestamp: new Date(),
      timeRange: {
        start: new Date(Math.min(...timestamps.map(t => t.getTime()))),
        end: new Date(Math.max(...timestamps.map(t => t.getTime()))),
      },
      metadata: {
        mean: this.calculateMean(values),
        p25: this.calculatePercentile(values, 25),
        p50: this.calculatePercentile(values, 50),
        p75: this.calculatePercentile(values, 75),
        p90: this.calculatePercentile(values, 90),
        p95: this.calculatePercentile(values, 95),
        p99: this.calculatePercentile(values, 99),
        min: Math.min(...values),
        max: Math.max(...values),
      },
    };
  }

  /**
   * Aggregate multiple metrics across categories
   */
  aggregateMultipleMetrics(
    tenantDataSets: Array<{
      category: FederationDataCategory;
      metricName: string;
      data: Array<{ tenantId: string; value: number; timestamp: Date }>;
    }>,
    sharingAgreement: SharingAgreement
  ): FederationMetric[] {
    const metrics: FederationMetric[] = [];

    for (const dataset of tenantDataSets) {
      const metric = this.aggregateMetrics(
        dataset.category,
        dataset.metricName,
        dataset.data,
        sharingAgreement
      );
      if (metric) {
        metrics.push(metric);
      }
    }

    return metrics;
  }

  /**
   * Anonymize tenant data before aggregation
   * Removes identifying fields and applies privacy controls
   */
  anonymizeData<T extends Record<string, any>>(
    data: T[],
    sharingAgreement: SharingAgreement
  ): AnonymizationResult {
    const originalCount = data.length;
    const fieldsRemoved = [...sharingAgreement.excludedFields];
    
    // Remove excluded fields
    const anonymized = data.map(record => {
      const cleaned = { ...record };
      for (const field of sharingAgreement.excludedFields) {
        delete cleaned[field];
      }
      return cleaned;
    });

    // Apply anonymization level
    let finalData = anonymized;
    if (sharingAgreement.anonymizationLevel === 'full') {
      // Replace tenant IDs with anonymized IDs
      finalData = anonymized.map(record => ({
        ...record,
        tenantId: this.generateAnonymizedId(record.tenantId || 'unknown'),
      }));
      fieldsRemoved.push('original-tenantId');
    }

    return {
      success: true,
      originalRecordCount: originalCount,
      anonymizedRecordCount: finalData.length,
      fieldsRemoved,
      aggregationApplied: finalData.length >= sharingAgreement.aggregationThreshold,
      privacyLevel: sharingAgreement.anonymizationLevel,
    };
  }

  /**
   * Calculate percentile rank for a value
   */
  calculatePercentileRank(value: number, values: number[]): number {
    const sorted = [...values].sort((a, b) => a - b);
    const index = sorted.findIndex(v => v >= value);
    if (index === -1) return 100; // Value is max
    return (index / sorted.length) * 100;
  }

  /**
   * Get comparison status based on percentile
   */
  getComparisonStatus(percentile: number): 'above-average' | 'average' | 'below-average' | 'top-quartile' | 'bottom-quartile' {
    if (percentile >= 75) return 'top-quartile';
    if (percentile >= 55) return 'above-average';
    if (percentile >= 45) return 'average';
    if (percentile >= 25) return 'below-average';
    return 'bottom-quartile';
  }

  // Statistical calculation helpers
  private calculateMean(values: number[]): number {
    return values.reduce((sum, v) => sum + v, 0) / values.length;
  }

  private calculateMedian(values: number[]): number {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  }

  private calculatePercentile(values: number[], percentile: number): number {
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  private generateAnonymizedId(tenantId: string): string {
    // Simple hash-based anonymization (in production, use proper crypto)
    let hash = 0;
    for (let i = 0; i < tenantId.length; i++) {
      hash = ((hash << 5) - hash) + tenantId.charCodeAt(i);
      hash = hash & hash;
    }
    return `anon-${Math.abs(hash).toString(36)}`;
  }

  private getUnitForMetric(metricName: string): string {
    const unitMap: Record<string, string> = {
      'compliance-rate': '%',
      'utilization': '%',
      'resolution-time': 'hours',
      'completion-rate': '%',
      'alert-volume': 'count',
      'cost-per-unit': 'USD',
      'efficiency-score': 'score',
      'quality-score': 'score',
      'productivity-score': 'score',
      'training-completion': '%',
    };

    for (const [key, unit] of Object.entries(unitMap)) {
      if (metricName.toLowerCase().includes(key)) {
        return unit;
      }
    }

    return 'value';
  }

  /**
   * Aggregate data by time buckets for trend analysis
   */
  aggregateByTimeBucket(
    data: Array<{ value: number; timestamp: Date }>,
    bucketSize: 'hour' | 'day' | 'week' | 'month'
  ): Array<{ bucket: string; value: number; count: number }> {
    const buckets = new Map<string, { sum: number; count: number }>();

    for (const point of data) {
      const bucketKey = this.getBucketKey(point.timestamp, bucketSize);
      const existing = buckets.get(bucketKey) || { sum: 0, count: 0 };
      buckets.set(bucketKey, {
        sum: existing.sum + point.value,
        count: existing.count + 1,
      });
    }

    return Array.from(buckets.entries()).map(([bucket, { sum, count }]) => ({
      bucket,
      value: sum / count, // Average for bucket
      count,
    }));
  }

  private getBucketKey(date: Date, bucketSize: 'hour' | 'day' | 'week' | 'month'): string {
    switch (bucketSize) {
      case 'hour':
        return date.toISOString().substring(0, 13);
      case 'day':
        return date.toISOString().substring(0, 10);
      case 'week':
        const weekNum = this.getWeekNumber(date);
        return `${date.getFullYear()}-W${weekNum}`;
      case 'month':
        return date.toISOString().substring(0, 7);
    }
  }

  private getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }
}
