/**
 * Federation Registry Service
 * 
 * Manages the registry of federated organizations:
 * - Organization registration and profile management
 * - Trust relationships between organizations
 * - Federation node discovery and health monitoring
 * - Cross-organization capability matching
 */

import { Organization, FederationNode, TrustRelationship, ReputationMetrics } from '../types';

export class FederationRegistry {
  private organizations: Map<string, Organization> = new Map();
  private nodes: Map<string, FederationNode> = new Map();
  private trustGraph: Map<string, TrustRelationship[]> = new Map();

  /**
   * Register a new organization in the federation
   */
  async registerOrganization(data: Omit<Organization, 'id' | 'joinedAt' | 'trustScore' | 'reputationMetrics'>): Promise<Organization> {
    const id = this.generateOrganizationId();
    
    const organization: Organization = {
      id,
      ...data,
      joinedAt: new Date(),
      verificationStatus: 'pending',
      trustScore: 50, // Default neutral score
      reputationMetrics: {
        contributionScore: 0,
        usageScore: 0,
        complianceScore: 100,
        communityScore: 50,
        recencyScore: 100,
        overallScore: 50,
      },
    };

    this.organizations.set(id, organization);

    // Log registration
    await this.logEvent({
      type: 'organization-registered',
      organizationId: id,
      timestamp: new Date(),
    });

    return organization;
  }

  /**
   * Get organization by ID
   */
  async getOrganization(id: string): Promise<Organization | null> {
    return this.organizations.get(id) || null;
  }

  /**
   * Update organization profile
   */
  async updateOrganization(id: string, updates: Partial<Organization>): Promise<Organization | null> {
    const org = this.organizations.get(id);
    if (!org) return null;

    const updated = { ...org, ...updates };
    this.organizations.set(id, updated);

    await this.logEvent({
      type: 'organization-updated',
      organizationId: id,
      timestamp: new Date(),
    });

    return updated;
  }

  /**
   * Register a federation node (API endpoint)
   */
  async registerNode(node: FederationNode): Promise<void> {
    this.nodes.set(node.organizationId, node);

    await this.logEvent({
      type: 'node-registered',
      organizationId: node.organizationId,
      timestamp: new Date(),
      details: { endpoint: node.endpoint, capabilities: node.capabilities },
    });
  }

  /**
   * Update node heartbeat
   */
  async updateNodeHeartbeat(organizationId: string): Promise<void> {
    const node = this.nodes.get(organizationId);
    if (node) {
      node.lastHeartbeat = new Date();
      node.status = 'online';
      this.nodes.set(organizationId, node);
    }
  }

  /**
   * Find nodes by capability
   */
  async findNodesByCapability(capability: string): Promise<FederationNode[]> {
    const results: FederationNode[] = [];
    
    for (const node of this.nodes.values()) {
      if (node.capabilities.includes(capability as any) && node.status === 'online') {
        results.push(node);
      }
    }

    return results;
  }

  /**
   * Find nodes by region
   */
  async findNodesByRegion(region: string): Promise<FederationNode[]> {
    const results: FederationNode[] = [];
    
    for (const node of this.nodes.values()) {
      if (node.regions.includes(region) && node.status === 'online') {
        results.push(node);
      }
    }

    return results;
  }

  /**
   * Establish trust relationship between organizations
   */
  async establishTrust(fromOrgId: string, toOrgId: string, initialTrustLevel: number = 0.5): Promise<TrustRelationship> {
    const relationship: TrustRelationship = {
      fromOrgId,
      toOrgId,
      trustLevel: initialTrustLevel,
      relationshipType: 'peer',
      establishedAt: new Date(),
      lastUpdated: new Date(),
      interactions: 0,
      incidents: 0,
    };

    if (!this.trustGraph.has(fromOrgId)) {
      this.trustGraph.set(fromOrgId, []);
    }
    this.trustGraph.get(fromOrgId)!.push(relationship);

    await this.logEvent({
      type: 'trust-established',
      organizationId: fromOrgId,
      timestamp: new Date(),
      details: { targetOrg: toOrgId, trustLevel: initialTrustLevel },
    });

    return relationship;
  }

  /**
   * Update trust level based on interactions
   */
  async updateTrustLevel(
    fromOrgId: string,
    toOrgId: string,
    delta: number,
    reason: string
  ): Promise<void> {
    const relationships = this.trustGraph.get(fromOrgId);
    if (!relationships) return;

    const rel = relationships.find(r => r.toOrgId === toOrgId);
    if (!rel) return;

    // Update trust level (clamped to 0-1)
    rel.trustLevel = Math.max(0, Math.min(1, rel.trustLevel + delta));
    rel.lastUpdated = new Date();
    rel.interactions++;

    // Update relationship type based on trust level
    if (rel.trustLevel >= 0.8) {
      rel.relationshipType = 'partner';
    } else if (rel.trustLevel >= 0.6) {
      rel.relationshipType = 'verified';
    } else if (rel.trustLevel < 0.3) {
      rel.relationshipType = 'suspicious';
    } else {
      rel.relationshipType = 'peer';
    }

    await this.logEvent({
      type: 'trust-updated',
      organizationId: fromOrgId,
      timestamp: new Date(),
      details: { targetOrg: toOrgId, newLevel: rel.trustLevel, reason },
    });
  }

  /**
   * Record an incident (negative interaction)
   */
  async recordIncident(fromOrgId: string, toOrgId: string, severity: number): Promise<void> {
    const relationships = this.trustGraph.get(fromOrgId);
    if (!relationships) return;

    const rel = relationships.find(r => r.toOrgId === toOrgId);
    if (!rel) return;

    rel.incidents++;
    
    // Reduce trust based on severity (0.1 to 0.5)
    const trustPenalty = -0.1 * severity;
    await this.updateTrustLevel(fromOrgId, toOrgId, trustPenalty, `incident-severity-${severity}`);
  }

  /**
   * Get trust relationships for an organization
   */
  async getTrustRelationships(organizationId: string): Promise<TrustRelationship[]> {
    return this.trustGraph.get(organizationId) || [];
  }

  /**
   * Get bidirectional trust score
   */
  async getBidirectionalTrust(orgId1: string, orgId2: string): Promise<number> {
    const trust1to2 = await this.getTrustLevel(orgId1, orgId2);
    const trust2to1 = await this.getTrustLevel(orgId2, orgId1);
    
    // Return minimum of both directions (conservative)
    return Math.min(trust1to2, trust2to1);
  }

  /**
   * Get trust level from one org to another
   */
  private async getTrustLevel(fromOrgId: string, toOrgId: string): Promise<number> {
    const relationships = this.trustGraph.get(fromOrgId);
    if (!relationships) return 0.5; // Default neutral trust

    const rel = relationships.find(r => r.toOrgId === toOrgId);
    return rel ? rel.trustLevel : 0.5;
  }

  /**
   * Update reputation metrics
   */
  async updateReputationMetrics(organizationId: string, updates: Partial<ReputationMetrics>): Promise<void> {
    const org = this.organizations.get(organizationId);
    if (!org) return;

    org.reputationMetrics = { ...org.reputationMetrics, ...updates };

    // Recalculate overall score (weighted average)
    const weights = {
      contributionScore: 0.3,
      usageScore: 0.2,
      complianceScore: 0.25,
      communityScore: 0.15,
      recencyScore: 0.1,
    };

    org.reputationMetrics.overallScore = 
      org.reputationMetrics.contributionScore * weights.contributionScore +
      org.reputationMetrics.usageScore * weights.usageScore +
      org.reputationMetrics.complianceScore * weights.complianceScore +
      org.reputationMetrics.communityScore * weights.communityScore +
      org.reputationMetrics.recencyScore * weights.recencyScore;

    // Update trust score (combination of reputation and trust relationships)
    org.trustScore = this.calculateTrustScore(org);

    this.organizations.set(organizationId, org);
  }

  /**
   * Calculate overall trust score
   */
  private calculateTrustScore(org: Organization): number {
    const reputationComponent = org.reputationMetrics.overallScore * 0.6;
    
    // Average trust from others
    let trustComponent = 0;
    const relationships = this.trustGraph.get(org.id);
    if (relationships && relationships.length > 0) {
      const avgTrust = relationships.reduce((sum, r) => sum + r.trustLevel, 0) / relationships.length;
      trustComponent = avgTrust * 100 * 0.4;
    }

    return Math.round(reputationComponent + trustComponent);
  }

  /**
   * List all verified organizations
   */
  async listVerifiedOrganizations(filters?: {
    type?: string;
    country?: string;
    minTrustScore?: number;
  }): Promise<Organization[]> {
    let results = Array.from(this.organizations.values()).filter(
      org => org.verificationStatus === 'verified'
    );

    if (filters?.type) {
      results = results.filter(org => org.type === filters.type);
    }

    if (filters?.country) {
      results = results.filter(org => org.country === filters.country);
    }

    if (filters?.minTrustScore !== undefined) {
      results = results.filter(org => org.trustScore >= filters.minTrustScore);
    }

    return results.sort((a, b) => b.trustScore - a.trustScore);
  }

  /**
   * Search organizations
   */
  async searchOrganizations(query: string, limit: number = 20): Promise<Organization[]> {
    const lowerQuery = query.toLowerCase();
    
    const results = Array.from(this.organizations.values()).filter(org => {
      return (
        org.name.toLowerCase().includes(lowerQuery) ||
        org.metadata.description.toLowerCase().includes(lowerQuery) ||
        org.country.toLowerCase().includes(lowerQuery) ||
        org.type.toLowerCase().includes(lowerQuery)
      );
    });

    return results.slice(0, limit);
  }

  /**
   * Get federation statistics
   */
  async getStatistics(): Promise<{
    totalOrganizations: number;
    verifiedOrganizations: number;
    activeNodes: number;
    trustRelationships: number;
    averageTrustScore: number;
    organizationsByType: Record<string, number>;
    organizationsByRegion: Record<string, number>;
  }> {
    const orgs = Array.from(this.organizations.values());
    const verified = orgs.filter(org => org.verificationStatus === 'verified');
    const activeNodes = Array.from(this.nodes.values()).filter(n => n.status === 'online');
    
    const totalTrustRelationships = Array.from(this.trustGraph.values())
      .reduce((sum, rels) => sum + rels.length, 0);

    const avgTrustScore = orgs.length > 0 
      ? orgs.reduce((sum, org) => sum + org.trustScore, 0) / orgs.length 
      : 0;

    const byType: Record<string, number> = {};
    const byRegion: Record<string, number> = {};

    orgs.forEach(org => {
      byType[org.type] = (byType[org.type] || 0) + 1;
      byRegion[org.region] = (byRegion[org.region] || 0) + 1;
    });

    return {
      totalOrganizations: orgs.length,
      verifiedOrganizations: verified.length,
      activeNodes: activeNodes.length,
      trustRelationships: totalTrustRelationships,
      averageTrustScore: Math.round(avgTrustScore),
      organizationsByType: byType,
      organizationsByRegion: byRegion,
    };
  }

  /**
   * Generate unique organization ID
   */
  private generateOrganizationId(): string {
    return `org-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Log event (integrate with Phase 50 Auditor)
   */
  private async logEvent(event: any): Promise<void> {
    // In production, integrate with AuditTrail from Phase 50
    console.log('[FederationRegistry]', event);
  }
}

// Singleton instance
export const federationRegistry = new FederationRegistry();
