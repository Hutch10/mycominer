/**
 * Phase 48: Operator Intelligence Hub - Assembler
 * 
 * Merges routed results into unified HubResult.
 * Builds cross-engine relationships, lineage chains, and impact maps.
 * 
 * CRITICAL CONSTRAINTS:
 * - No invented content
 * - Deterministic ordering
 * - All relationships grounded in real data
 * - No generative summaries
 */

import type {
  HubQuery,
  HubResult,
  HubSection,
  HubReference,
  HubLineageChain,
  HubLineageNode,
  HubImpactMap,
  HubImpactNode,
  HubAssemblyConfig,
  HubSourceEngine,
} from './hubTypes';

// ============================================================================
// HUB ASSEMBLER
// ============================================================================

export class HubAssembler {
  private tenantId: string;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
  }

  // ==========================================================================
  // MAIN ASSEMBLY
  // ==========================================================================

  /**
   * Assemble sections into unified result
   */
  public assembleResult(
    query: HubQuery,
    sections: HubSection[],
    config: HubAssemblyConfig
  ): HubResult {
    const startTime = Date.now();

    // Collect all references
    let allReferences = this.collectAllReferences(sections);

    // Merge duplicates if requested
    if (config.mergeDuplicateReferences) {
      allReferences = this.mergeDuplicateReferences(allReferences);
    }

    // Sort references if requested
    if (config.sortReferencesByRelevance) {
      allReferences = this.sortReferencesByRelevance(allReferences, query);
    }

    // Build lineage chains if requested
    let lineageChains: HubLineageChain[] | undefined;
    if (config.buildLineageChains && query.options?.includeLineage) {
      lineageChains = this.buildLineageChains(allReferences);
    }

    // Build impact map if requested
    let impactMap: HubImpactMap | undefined;
    if (config.buildImpactMaps && query.options?.includeImpact) {
      impactMap = this.buildImpactMap(query, allReferences);
    }

    // Generate summary
    const summary = this.generateSummary(sections, allReferences);

    // Calculate execution time
    const executionTime = Date.now() - startTime;

    return {
      resultId: `result-${query.queryId}`,
      query,
      sections,
      allReferences,
      lineageChains,
      impactMap,
      summary: {
        ...summary,
        queryExecutionTime: executionTime,
      },
      metadata: {
        policyDecisions: [],
        errors: [],
        warnings: [],
      },
      performedAt: new Date().toISOString(),
      performedBy: query.performedBy,
    };
  }

  // ==========================================================================
  // REFERENCE COLLECTION
  // ==========================================================================

  /**
   * Collect all references from sections
   */
  private collectAllReferences(sections: HubSection[]): HubReference[] {
    const allReferences: HubReference[] = [];

    for (const section of sections) {
      allReferences.push(...section.references);
    }

    return allReferences;
  }

  /**
   * Merge duplicate references (same entityId + entityType)
   */
  private mergeDuplicateReferences(references: HubReference[]): HubReference[] {
    const seen = new Map<string, HubReference>();

    for (const ref of references) {
      const key = `${ref.entityType}:${ref.entityId}`;
      
      if (!seen.has(key)) {
        seen.set(key, ref);
      } else {
        // Keep the reference with more metadata
        const existing = seen.get(key)!;
        const existingKeys = Object.keys(existing.metadata || {}).length;
        const newKeys = Object.keys(ref.metadata || {}).length;
        
        if (newKeys > existingKeys) {
          seen.set(key, ref);
        }
      }
    }

    return Array.from(seen.values());
  }

  /**
   * Sort references by relevance to query
   */
  private sortReferencesByRelevance(
    references: HubReference[],
    query: HubQuery
  ): HubReference[] {
    // Sort by:
    // 1. Exact entity match
    // 2. Engine priority
    // 3. Metadata richness
    return references.sort((a, b) => {
      // Exact match to query entity
      if (query.entityId) {
        if (a.entityId === query.entityId && b.entityId !== query.entityId) return -1;
        if (a.entityId !== query.entityId && b.entityId === query.entityId) return 1;
      }

      // Engine priority
      const aPriority = this.getEnginePriority(a.sourceEngine);
      const bPriority = this.getEnginePriority(b.sourceEngine);
      if (aPriority !== bPriority) return aPriority - bPriority;

      // Metadata richness
      const aKeys = Object.keys(a.metadata || {}).length;
      const bKeys = Object.keys(b.metadata || {}).length;
      return bKeys - aKeys;
    });
  }

  /**
   * Get engine priority for sorting (lower = higher priority)
   */
  private getEnginePriority(engine: HubSourceEngine): number {
    const priorities: Record<HubSourceEngine, number> = {
      'knowledge-graph': 1,
      'fabric': 2,
      'governance': 3,
      'health': 4,
      'timeline': 5,
      'analytics': 6,
      'search': 7,
      'narrative': 8,
      'insights': 9,
      'documentation': 10,
      'training': 11,
      'marketplace': 12,
      'governance-history': 13,
    };
    return priorities[engine] || 99;
  }

  // ==========================================================================
  // LINEAGE CHAINS
  // ==========================================================================

  /**
   * Build lineage chains from references
   */
  private buildLineageChains(references: HubReference[]): HubLineageChain[] {
    const chains: HubLineageChain[] = [];

    // Find fabric links (they contain lineage relationships)
    const fabricRefs = references.filter(r => r.sourceEngine === 'fabric');

    // Find governance history refs (they contain approval chains)
    const govHistoryRefs = references.filter(r => r.sourceEngine === 'governance-history');

    // Build fabric lineage chains
    for (const fabricRef of fabricRefs) {
      if (fabricRef.metadata.source && fabricRef.metadata.target) {
        const sourceRef = references.find(r => r.entityId === fabricRef.metadata.source);
        const targetRef = references.find(r => r.entityId === fabricRef.metadata.target);

        if (sourceRef && targetRef) {
          chains.push({
            chainId: `chain-${fabricRef.referenceId}`,
            startEntity: this.refToLineageNode(sourceRef, fabricRef.relationshipType || 'related-to'),
            endEntity: this.refToLineageNode(targetRef, fabricRef.relationshipType || 'related-to'),
            intermediateNodes: [],
            totalDepth: 1,
          });
        }
      }
    }

    // Build governance lineage chains
    for (const govRef of govHistoryRefs) {
      if (govRef.metadata.predecessorId) {
        const predecessorRef = references.find(r => r.entityId === govRef.metadata.predecessorId);
        
        if (predecessorRef) {
          chains.push({
            chainId: `chain-gov-${govRef.referenceId}`,
            startEntity: this.refToLineageNode(predecessorRef, 'predecessor'),
            endEntity: this.refToLineageNode(govRef, 'successor'),
            intermediateNodes: [],
            totalDepth: 1,
          });
        }
      }
    }

    return chains;
  }

  /**
   * Convert reference to lineage node
   */
  private refToLineageNode(ref: HubReference, relationshipType: string): HubLineageNode {
    return {
      entityId: ref.entityId,
      entityType: ref.entityType,
      title: ref.title,
      sourceEngine: ref.sourceEngine,
      relationshipType,
      metadata: ref.metadata,
    };
  }

  // ==========================================================================
  // IMPACT MAPS
  // ==========================================================================

  /**
   * Build impact map for query entity
   */
  private buildImpactMap(
    query: HubQuery,
    references: HubReference[]
  ): HubImpactMap | undefined {
    if (!query.entityId) return undefined;

    const targetRef = references.find(r => r.entityId === query.entityId);
    if (!targetRef) return undefined;

    // Find upstream impacts (entities this depends on)
    const upstreamImpacts = this.findUpstreamImpacts(query.entityId, references);

    // Find downstream impacts (entities that depend on this)
    const downstreamImpacts = this.findDownstreamImpacts(query.entityId, references);

    // Find peer impacts (entities at same level)
    const peerImpacts = this.findPeerImpacts(query.entityId, references);

    // Calculate total impact score
    const totalImpactScore = this.calculateImpactScore(
      upstreamImpacts,
      downstreamImpacts,
      peerImpacts
    );

    return {
      mapId: `impact-${query.entityId}`,
      targetEntity: {
        entityId: targetRef.entityId,
        entityType: targetRef.entityType,
        title: targetRef.title,
      },
      upstreamImpacts,
      downstreamImpacts,
      peerImpacts,
      totalImpactScore,
    };
  }

  /**
   * Find upstream impacts (dependencies)
   */
  private findUpstreamImpacts(
    entityId: string,
    references: HubReference[]
  ): HubImpactNode[] {
    const impacts: HubImpactNode[] = [];

    // Look for fabric links where entityId is the target
    const fabricRefs = references.filter(
      r => r.sourceEngine === 'fabric' && r.metadata.target === entityId
    );

    for (const fabricRef of fabricRefs) {
      const sourceRef = references.find(r => r.entityId === fabricRef.metadata.source);
      if (sourceRef) {
        impacts.push({
          entityId: sourceRef.entityId,
          entityType: sourceRef.entityType,
          title: sourceRef.title,
          sourceEngine: sourceRef.sourceEngine,
          impactType: 'upstream',
          impactSeverity: this.assessImpactSeverity(fabricRef.relationshipType),
          description: `${sourceRef.title} is a dependency`,
        });
      }
    }

    return impacts;
  }

  /**
   * Find downstream impacts (dependents)
   */
  private findDownstreamImpacts(
    entityId: string,
    references: HubReference[]
  ): HubImpactNode[] {
    const impacts: HubImpactNode[] = [];

    // Look for fabric links where entityId is the source
    const fabricRefs = references.filter(
      r => r.sourceEngine === 'fabric' && r.metadata.source === entityId
    );

    for (const fabricRef of fabricRefs) {
      const targetRef = references.find(r => r.entityId === fabricRef.metadata.target);
      if (targetRef) {
        impacts.push({
          entityId: targetRef.entityId,
          entityType: targetRef.entityType,
          title: targetRef.title,
          sourceEngine: targetRef.sourceEngine,
          impactType: 'downstream',
          impactSeverity: this.assessImpactSeverity(fabricRef.relationshipType),
          description: `${targetRef.title} depends on this`,
        });
      }
    }

    return impacts;
  }

  /**
   * Find peer impacts (same level entities)
   */
  private findPeerImpacts(
    entityId: string,
    references: HubReference[]
  ): HubImpactNode[] {
    const impacts: HubImpactNode[] = [];

    // Look for entities with same type from analytics patterns
    const targetRef = references.find(r => r.entityId === entityId);
    if (!targetRef) return impacts;

    const sameTypeRefs = references.filter(
      r => r.entityType === targetRef.entityType &&
           r.entityId !== entityId &&
           r.sourceEngine === 'analytics'
    );

    for (const ref of sameTypeRefs.slice(0, 5)) {
      impacts.push({
        entityId: ref.entityId,
        entityType: ref.entityType,
        title: ref.title,
        sourceEngine: ref.sourceEngine,
        impactType: 'peer',
        impactSeverity: 'low',
        description: `Similar entity: ${ref.title}`,
      });
    }

    return impacts;
  }

  /**
   * Assess impact severity based on relationship type
   */
  private assessImpactSeverity(relationshipType?: string): 'critical' | 'high' | 'medium' | 'low' {
    if (!relationshipType) return 'low';

    const criticalTypes = ['required-by', 'blocks', 'critical-dependency'];
    const highTypes = ['depends-on', 'required-for', 'affects'];
    const mediumTypes = ['related-to', 'references', 'linked-to'];

    if (criticalTypes.includes(relationshipType)) return 'critical';
    if (highTypes.includes(relationshipType)) return 'high';
    if (mediumTypes.includes(relationshipType)) return 'medium';
    return 'low';
  }

  /**
   * Calculate total impact score (0-100)
   */
  private calculateImpactScore(
    upstream: HubImpactNode[],
    downstream: HubImpactNode[],
    peer: HubImpactNode[]
  ): number {
    const severityWeights = {
      critical: 25,
      high: 15,
      medium: 10,
      low: 5,
    };

    let score = 0;

    // Upstream impacts (weighted more heavily)
    for (const impact of upstream) {
      score += severityWeights[impact.impactSeverity] * 1.5;
    }

    // Downstream impacts
    for (const impact of downstream) {
      score += severityWeights[impact.impactSeverity];
    }

    // Peer impacts (weighted less)
    for (const impact of peer) {
      score += severityWeights[impact.impactSeverity] * 0.5;
    }

    return Math.min(100, Math.round(score));
  }

  // ==========================================================================
  // SUMMARY GENERATION
  // ==========================================================================

  /**
   * Generate result summary
   */
  private generateSummary(
    sections: HubSection[],
    allReferences: HubReference[]
  ): {
    totalEnginesQueried: number;
    enginesWithResults: HubSourceEngine[];
    totalReferences: number;
    totalLineageChains: number;
    queryExecutionTime: number;
  } {
    const enginesWithResults = sections
      .filter(s => s.references.length > 0)
      .map(s => s.sourceEngine);

    return {
      totalEnginesQueried: sections.length,
      enginesWithResults,
      totalReferences: allReferences.length,
      totalLineageChains: 0, // Updated by caller if lineage chains built
      queryExecutionTime: 0, // Updated by caller
    };
  }
}
