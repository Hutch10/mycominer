/**
 * Trust Score Engine
 * 
 * Multi-factor trust scoring system that evaluates organizations based on:
 * - Historical interactions and behavior
 * - Reputation metrics
 * - Network position (centrality, connections)
 * - Compliance and security posture
 * - Community feedback
 * - Data quality contributions
 */

import { federationRegistry } from './FederationRegistry';
import { federationGraphBuilder } from './FederationGraphBuilder';
import { Organization } from '../types';

export interface TrustScoreComponents {
  historical: number; // 0-100: Based on past behavior
  reputation: number; // 0-100: Community reputation
  network: number; // 0-100: Network centrality and connections
  compliance: number; // 0-100: Policy adherence
  security: number; // 0-100: Security posture
  contribution: number; // 0-100: Data/model contributions
  overall: number; // Weighted composite
}

export interface TrustScoreHistory {
  timestamp: Date;
  score: number;
  components: TrustScoreComponents;
  reason: string;
}

export class TrustScoreEngine {
  private scoreHistory: Map<string, TrustScoreHistory[]> = new Map();

  // Weights for composite score
  private readonly weights = {
    historical: 0.25,
    reputation: 0.20,
    network: 0.15,
    compliance: 0.20,
    security: 0.10,
    contribution: 0.10,
  };

  /**
   * Calculate comprehensive trust score
   */
  async calculateTrustScore(organizationId: string): Promise<TrustScoreComponents> {
    const org = await federationRegistry.getOrganization(organizationId);
    if (!org) {
      throw new Error('Organization not found');
    }

    const components: TrustScoreComponents = {
      historical: await this.calculateHistoricalScore(organizationId),
      reputation: await this.calculateReputationScore(org),
      network: await this.calculateNetworkScore(organizationId),
      compliance: await this.calculateComplianceScore(organizationId),
      security: await this.calculateSecurityScore(organizationId),
      contribution: await this.calculateContributionScore(org),
      overall: 0,
    };

    // Calculate weighted composite
    components.overall = 
      components.historical * this.weights.historical +
      components.reputation * this.weights.reputation +
      components.network * this.weights.network +
      components.compliance * this.weights.compliance +
      components.security * this.weights.security +
      components.contribution * this.weights.contribution;

    // Record history
    await this.recordScore(organizationId, components, 'periodic-calculation');

    // Update organization trust score
    await federationRegistry.updateOrganization(organizationId, {
      trustScore: Math.round(components.overall),
    });

    return components;
  }

  /**
   * Calculate historical behavior score
   */
  private async calculateHistoricalScore(organizationId: string): Promise<number> {
    const relationships = await federationRegistry.getTrustRelationships(organizationId);
    
    if (relationships.length === 0) return 50; // Neutral for new orgs

    let totalScore = 0;
    let totalWeight = 0;

    for (const rel of relationships) {
      // Weight recent interactions more heavily
      const age = Date.now() - rel.lastUpdated.getTime();
      const recencyWeight = Math.exp(-age / (90 * 24 * 60 * 60 * 1000)); // 90-day decay

      // Positive: successful interactions
      const positiveScore = (rel.interactions * rel.trustLevel) * recencyWeight;
      
      // Negative: incidents
      const negativeScore = rel.incidents * 10 * recencyWeight;

      totalScore += positiveScore - negativeScore;
      totalWeight += rel.interactions * recencyWeight;
    }

    if (totalWeight === 0) return 50;

    // Normalize to 0-100
    const rawScore = (totalScore / totalWeight) * 100;
    return Math.max(0, Math.min(100, rawScore));
  }

  /**
   * Calculate reputation score from org metrics
   */
  private async calculateReputationScore(org: Organization): Promise<number> {
    return org.reputationMetrics.overallScore;
  }

  /**
   * Calculate network position score
   */
  private async calculateNetworkScore(organizationId: string): Promise<number> {
    try {
      // Get network statistics
      const influential = await federationGraphBuilder.findInfluentialOrganizations(100);
      const orgInfluence = influential.find(i => i.organizationId === organizationId);

      if (!orgInfluence) return 30; // Low score if not well-connected

      // Normalize based on rank
      const rank = influential.findIndex(i => i.organizationId === organizationId);
      const normalizedRank = 1 - (rank / influential.length);

      // Score based on position (higher is better)
      return normalizedRank * 100;
    } catch (error) {
      return 50; // Default if graph analysis fails
    }
  }

  /**
   * Calculate compliance score
   */
  private async calculateComplianceScore(organizationId: string): Promise<number> {
    const org = await federationRegistry.getOrganization(organizationId);
    if (!org) return 0;

    let score = 0;

    // Verification status
    if (org.verificationStatus === 'verified') {
      score += 40;
      
      // Bonus for higher verification levels
      const levelBonus = {
        basic: 0,
        standard: 10,
        premium: 20,
        certified: 30,
      };
      score += levelBonus[org.verificationLevel] || 0;
    }

    // Compliance from reputation
    score += org.reputationMetrics.complianceScore * 0.3;

    return Math.min(100, score);
  }

  /**
   * Calculate security score
   */
  private async calculateSecurityScore(organizationId: string): Promise<number> {
    // In production: integrate with security scanning, vulnerability assessments
    const org = await federationRegistry.getOrganization(organizationId);
    if (!org) return 0;

    let score = 50; // Base score

    // Verified organizations get bonus
    if (org.verificationStatus === 'verified') {
      score += 20;
    }

    // Premium/certified get additional bonus
    if (org.verificationLevel === 'premium' || org.verificationLevel === 'certified') {
      score += 20;
    }

    // Check for certifications
    if (org.metadata.certifications && org.metadata.certifications.length > 0) {
      score += Math.min(10, org.metadata.certifications.length * 5);
    }

    return Math.min(100, score);
  }

  /**
   * Calculate contribution score
   */
  private async calculateContributionScore(org: Organization): Promise<number> {
    return org.reputationMetrics.contributionScore;
  }

  /**
   * Record score in history
   */
  private async recordScore(
    organizationId: string,
    components: TrustScoreComponents,
    reason: string
  ): Promise<void> {
    if (!this.scoreHistory.has(organizationId)) {
      this.scoreHistory.set(organizationId, []);
    }

    const history = this.scoreHistory.get(organizationId)!;
    history.push({
      timestamp: new Date(),
      score: components.overall,
      components,
      reason,
    });

    // Keep only last 100 records
    if (history.length > 100) {
      history.shift();
    }
  }

  /**
   * Get score history
   */
  async getScoreHistory(organizationId: string, limit: number = 30): Promise<TrustScoreHistory[]> {
    const history = this.scoreHistory.get(organizationId) || [];
    return history.slice(-limit);
  }

  /**
   * Calculate trust score between two organizations
   */
  async calculateBilateralTrust(org1Id: string, org2Id: string): Promise<number> {
    // Get direct trust relationships
    const directTrust = await federationRegistry.getBidirectionalTrust(org1Id, org2Id);

    // Get both organizations' trust scores
    const org1Score = await this.calculateTrustScore(org1Id);
    const org2Score = await this.calculateTrustScore(org2Id);

    // Combined trust: average of direct trust and mutual reputation
    const reputationTrust = (org1Score.overall + org2Score.overall) / 200;
    
    return (directTrust * 0.6 + reputationTrust * 0.4);
  }

  /**
   * Predict future trust trend
   */
  async predictTrustTrend(organizationId: string): Promise<{
    current: number;
    predicted30days: number;
    predicted90days: number;
    trend: 'increasing' | 'stable' | 'decreasing';
    confidence: number;
  }> {
    const history = await this.getScoreHistory(organizationId, 90);
    
    if (history.length < 5) {
      const currentOrg = await federationRegistry.getOrganization(organizationId);
      return {
        current: currentOrg?.trustScore || 50,
        predicted30days: currentOrg?.trustScore || 50,
        predicted90days: currentOrg?.trustScore || 50,
        trend: 'stable',
        confidence: 0.3,
      };
    }

    // Simple linear regression
    const xValues = history.map((_, i) => i);
    const yValues = history.map(h => h.score);
    
    const n = xValues.length;
    const sumX = xValues.reduce((a, b) => a + b, 0);
    const sumY = yValues.reduce((a, b) => a + b, 0);
    const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
    const sumX2 = xValues.reduce((sum, x) => sum + x * x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const current = yValues[yValues.length - 1];
    const predicted30 = intercept + slope * (n + 30);
    const predicted90 = intercept + slope * (n + 90);

    // Determine trend
    let trend: 'increasing' | 'stable' | 'decreasing';
    if (slope > 0.1) trend = 'increasing';
    else if (slope < -0.1) trend = 'decreasing';
    else trend = 'stable';

    // Calculate R² for confidence
    const yMean = sumY / n;
    const ssTotal = yValues.reduce((sum, y) => sum + Math.pow(y - yMean, 2), 0);
    const ssResidual = yValues.reduce((sum, y, i) => {
      const predicted = intercept + slope * xValues[i];
      return sum + Math.pow(y - predicted, 2);
    }, 0);
    const rSquared = 1 - (ssResidual / ssTotal);

    return {
      current,
      predicted30days: Math.max(0, Math.min(100, predicted30)),
      predicted90days: Math.max(0, Math.min(100, predicted90)),
      trend,
      confidence: Math.max(0, Math.min(1, rSquared)),
    };
  }

  /**
   * Compare organization against peer group
   */
  async compareToPeers(organizationId: string): Promise<{
    organization: TrustScoreComponents;
    peerAverage: TrustScoreComponents;
    percentile: number;
  }> {
    const org = await federationRegistry.getOrganization(organizationId);
    if (!org) {
      throw new Error('Organization not found');
    }

    const orgScore = await this.calculateTrustScore(organizationId);

    // Find peers (same type, similar size)
    const peers = await federationRegistry.listVerifiedOrganizations({
      type: org.type,
    });

    const peerScores: TrustScoreComponents[] = [];
    for (const peer of peers) {
      if (peer.id !== organizationId) {
        peerScores.push(await this.calculateTrustScore(peer.id));
      }
    }

    if (peerScores.length === 0) {
      return {
        organization: orgScore,
        peerAverage: orgScore,
        percentile: 50,
      };
    }

    // Calculate peer averages
    const peerAverage: TrustScoreComponents = {
      historical: peerScores.reduce((sum, s) => sum + s.historical, 0) / peerScores.length,
      reputation: peerScores.reduce((sum, s) => sum + s.reputation, 0) / peerScores.length,
      network: peerScores.reduce((sum, s) => sum + s.network, 0) / peerScores.length,
      compliance: peerScores.reduce((sum, s) => sum + s.compliance, 0) / peerScores.length,
      security: peerScores.reduce((sum, s) => sum + s.security, 0) / peerScores.length,
      contribution: peerScores.reduce((sum, s) => sum + s.contribution, 0) / peerScores.length,
      overall: peerScores.reduce((sum, s) => sum + s.overall, 0) / peerScores.length,
    };

    // Calculate percentile
    const belowCount = peerScores.filter(s => s.overall < orgScore.overall).length;
    const percentile = (belowCount / peerScores.length) * 100;

    return {
      organization: orgScore,
      peerAverage,
      percentile,
    };
  }

  /**
   * Batch calculate trust scores for all organizations
   */
  async recalculateAllScores(): Promise<void> {
    const stats = await federationRegistry.getStatistics();
    const orgs = await federationRegistry.listVerifiedOrganizations();

    console.log(`[TrustScoreEngine] Recalculating trust scores for ${orgs.length} organizations...`);

    for (const org of orgs) {
      try {
        await this.calculateTrustScore(org.id);
      } catch (error) {
        console.error(`[TrustScoreEngine] Error calculating score for ${org.id}:`, error);
      }
    }

    console.log('[TrustScoreEngine] Recalculation complete');
  }
}

// Singleton instance
export const trustScoreEngine = new TrustScoreEngine();
