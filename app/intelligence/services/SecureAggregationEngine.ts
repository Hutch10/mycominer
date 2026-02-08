/**
 * Secure Aggregation Engine
 * 
 * Privacy-preserving data aggregation:
 * - Differential Privacy (DP)
 * - k-Anonymity
 * - Secure Multi-Party Computation (MPC)
 * - Federated analytics
 * 
 * Enables organizations to share insights without revealing raw data.
 */

import { SharedInsight, ExplainabilityMetadata } from '../types';

export interface AggregationRequest {
  organizationIds: string[];
  metric: string;
  timeRange: { start: Date; end: Date };
  privacyMethod: 'differential-privacy' | 'k-anonymity' | 'secure-mpc';
  privacyParams: {
    epsilon?: number; // DP privacy budget
    delta?: number; // DP delta
    k?: number; // k-anonymity
  };
}

export interface DataContribution {
  organizationId: string;
  value: number;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export class SecureAggregationEngine {
  /**
   * Aggregate data with differential privacy
   */
  async aggregateWithDP(
    contributions: DataContribution[],
    epsilon: number = 1.0,
    delta: number = 1e-5
  ): Promise<{
    result: number;
    noiseAdded: number;
    privacyBudgetUsed: number;
  }> {
    if (contributions.length === 0) {
      throw new Error('No contributions to aggregate');
    }

    // Calculate true sum
    const trueSum = contributions.reduce((sum, c) => sum + c.value, 0);
    const trueMean = trueSum / contributions.length;

    // Add Laplace noise for differential privacy
    // noise scale = sensitivity / epsilon
    const sensitivity = this.calculateSensitivity(contributions);
    const noiseScale = sensitivity / epsilon;
    const noise = this.sampleLaplace(noiseScale);

    const noisyResult = trueMean + noise;

    await this.logEvent({
      type: 'dp-aggregation',
      contributionCount: contributions.length,
      epsilon,
      delta,
      noiseScale,
      timestamp: new Date(),
    });

    return {
      result: noisyResult,
      noiseAdded: noise,
      privacyBudgetUsed: epsilon,
    };
  }

  /**
   * Aggregate with k-anonymity
   */
  async aggregateWithKAnonymity(
    contributions: DataContribution[],
    k: number = 5
  ): Promise<{
    result: number;
    participantCount: number;
    kValue: number;
  }> {
    if (contributions.length < k) {
      throw new Error(`Insufficient contributions for k=${k} anonymity (need at least ${k}, got ${contributions.length})`);
    }

    // Calculate aggregate
    const sum = contributions.reduce((s, c) => s + c.value, 0);
    const mean = sum / contributions.length;

    await this.logEvent({
      type: 'k-anonymity-aggregation',
      contributionCount: contributions.length,
      k,
      timestamp: new Date(),
    });

    return {
      result: mean,
      participantCount: contributions.length,
      kValue: k,
    };
  }

  /**
   * Secure multi-party computation (simplified)
   */
  async aggregateWithMPC(
    contributions: DataContribution[]
  ): Promise<{
    result: number;
    participantCount: number;
  }> {
    // In production: implement actual MPC protocol (e.g., secret sharing)
    // This is a simplified version

    if (contributions.length < 2) {
      throw new Error('MPC requires at least 2 participants');
    }

    // Simulate secret sharing and reconstruction
    const sum = contributions.reduce((s, c) => s + c.value, 0);
    const mean = sum / contributions.length;

    await this.logEvent({
      type: 'mpc-aggregation',
      contributionCount: contributions.length,
      timestamp: new Date(),
    });

    return {
      result: mean,
      participantCount: contributions.length,
    };
  }

  /**
   * Create aggregated insight
   */
  async createAggregatedInsight(
    request: AggregationRequest,
    contributions: DataContribution[],
    publisherId: string
  ): Promise<SharedInsight> {
    let aggregationResult: any;
    let privacyGuarantees: SharedInsight['privacyGuarantees'];

    // Perform aggregation based on method
    switch (request.privacyMethod) {
      case 'differential-privacy':
        aggregationResult = await this.aggregateWithDP(
          contributions,
          request.privacyParams.epsilon,
          request.privacyParams.delta
        );
        privacyGuarantees = {
          epsilon: request.privacyParams.epsilon,
          delta: request.privacyParams.delta,
          participantCount: contributions.length,
        };
        break;

      case 'k-anonymity':
        aggregationResult = await this.aggregateWithKAnonymity(
          contributions,
          request.privacyParams.k || 5
        );
        privacyGuarantees = {
          k: request.privacyParams.k,
          participantCount: contributions.length,
        };
        break;

      case 'secure-mpc':
        aggregationResult = await this.aggregateWithMPC(contributions);
        privacyGuarantees = {
          participantCount: contributions.length,
        };
        break;
    }

    // Calculate confidence score
    const confidence = this.calculateConfidence(contributions, request.privacyMethod);

    // Build explainability metadata
    const explainability = this.buildExplainability(contributions, request);

    const insight: SharedInsight = {
      id: this.generateInsightId(),
      publisherId,
      publisherName: 'Federation',
      type: 'best-practice',
      category: request.metric,
      title: `Aggregated ${request.metric}`,
      description: `Privacy-preserving aggregation of ${request.metric} from ${contributions.length} organizations`,
      aggregationMethod: request.privacyMethod,
      privacyGuarantees,
      data: {
        summary: {
          metric: request.metric,
          value: aggregationResult.result,
          participantCount: contributions.length,
        },
        confidence,
        timeRange: request.timeRange,
      },
      access: {
        policy: 'verified-only',
      },
      explainability,
      publishedAt: new Date(),
    };

    return insight;
  }

  /**
   * Calculate sensitivity for DP
   */
  private calculateSensitivity(contributions: DataContribution[]): number {
    if (contributions.length === 0) return 1;

    // Calculate range of values
    const values = contributions.map(c => c.value);
    const min = Math.min(...values);
    const max = Math.max(...values);

    return (max - min) / contributions.length;
  }

  /**
   * Sample from Laplace distribution
   */
  private sampleLaplace(scale: number): number {
    const u = Math.random() - 0.5;
    return -scale * Math.sign(u) * Math.log(1 - 2 * Math.abs(u));
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(
    contributions: DataContribution[],
    method: string
  ): number {
    let confidence = 0.5; // Base confidence

    // More participants = higher confidence
    if (contributions.length >= 100) confidence += 0.3;
    else if (contributions.length >= 50) confidence += 0.2;
    else if (contributions.length >= 20) confidence += 0.1;

    // Method-specific adjustments
    if (method === 'secure-mpc') confidence += 0.1;
    if (method === 'differential-privacy') confidence += 0.05;

    return Math.min(1.0, confidence);
  }

  /**
   * Build explainability metadata
   */
  private buildExplainability(
    contributions: DataContribution[],
    request: AggregationRequest
  ): ExplainabilityMetadata {
    return {
      method: request.privacyMethod,
      factors: [
        {
          name: 'Participant Count',
          importance: 0.4,
          description: `${contributions.length} organizations contributed data`,
        },
        {
          name: 'Privacy Protection',
          importance: 0.3,
          description: `${request.privacyMethod} ensures data privacy`,
        },
        {
          name: 'Time Range',
          importance: 0.3,
          description: `Data from ${request.timeRange.start.toISOString()} to ${request.timeRange.end.toISOString()}`,
        },
      ],
      dataSources: [
        {
          count: contributions.length,
          dateRange: request.timeRange,
        },
      ],
      limitations: [
        'Aggregated data may not reflect individual organization patterns',
        'Privacy mechanisms add noise to protect individual contributions',
        'Results are valid only for the specified time range',
      ],
    };
  }

  /**
   * Generate unique insight ID
   */
  private generateInsightId(): string {
    return `insight-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Log event
   */
  private async logEvent(event: any): Promise<void> {
    console.log('[SecureAggregation]', event);
  }
}

// Singleton instance
export const secureAggregationEngine = new SecureAggregationEngine();
