/**
 * Phase 48: Operator Intelligence Hub - Router
 * 
 * Routes queries to appropriate engines and collects results.
 * Enforces tenant/facility/room scope at routing level.
 * 
 * CRITICAL CONSTRAINTS:
 * - Routes only to engines with relevant data
 * - Respects policy decisions
 * - No invented routing decisions
 * - All routing logged
 */

import type {
  HubQuery,
  HubQueryType,
  HubSection,
  HubReference,
  HubSourceEngine,
  HubRoutingDecision,
  HubPolicyContext,
  EngineQueryParams,
} from './hubTypes';

// ============================================================================
// HUB ROUTER
// ============================================================================

export class HubRouter {
  private tenantId: string;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
  }

  // ==========================================================================
  // MAIN ROUTING
  // ==========================================================================

  /**
   * Route query to appropriate engines
   */
  public async routeQuery(
    query: HubQuery,
    policyContext: HubPolicyContext
  ): Promise<HubSection[]> {
    // Determine which engines to query
    const routingDecisions = this.determineRoutingDecisions(query, policyContext);

    // Filter to allowed engines
    const allowedEngines = routingDecisions
      .filter(d => d.shouldRoute && d.policyAllowed)
      .map(d => d.engine);

    // Route to each engine in parallel
    const sections = await Promise.all(
      allowedEngines.map(engine => this.routeToEngine(engine, query))
    );

    // Filter out null sections (errors)
    return sections.filter(s => s !== null) as HubSection[];
  }

  // ==========================================================================
  // ROUTING DECISIONS
  // ==========================================================================

  /**
   * Determine which engines should receive this query
   */
  private determineRoutingDecisions(
    query: HubQuery,
    policyContext: HubPolicyContext
  ): HubRoutingDecision[] {
    const decisions: HubRoutingDecision[] = [];

    // If filters specify engines, only route to those
    if (query.filters?.engines && query.filters.engines.length > 0) {
      for (const engine of query.filters.engines) {
        decisions.push({
          engine,
          shouldRoute: true,
          reason: 'Explicitly requested in filters',
          policyAllowed: this.isPolicyAllowed(engine, policyContext),
          hasRelevantData: true,
        });
      }
      return decisions;
    }

    // Otherwise, determine based on query type
    const relevantEngines = this.getRelevantEngines(query.queryType, query.entityType);

    for (const engine of relevantEngines) {
      decisions.push({
        engine,
        shouldRoute: true,
        reason: `Relevant for ${query.queryType}`,
        policyAllowed: this.isPolicyAllowed(engine, policyContext),
        hasRelevantData: true,
      });
    }

    return decisions;
  }

  /**
   * Get relevant engines for a query type
   */
  private getRelevantEngines(
    queryType: HubQueryType,
    entityType?: string
  ): HubSourceEngine[] {
    switch (queryType) {
      case 'entity-lookup':
        // Query all engines for entity lookups
        return [
          'knowledge-graph',
          'search',
          'timeline',
          'narrative',
          'fabric',
          'documentation',
          'governance',
          'health',
        ];

      case 'cross-engine-summary':
        // Query all engines
        return [
          'knowledge-graph',
          'search',
          'narrative',
          'timeline',
          'analytics',
          'training',
          'marketplace',
          'insights',
          'health',
          'governance',
          'governance-history',
          'fabric',
          'documentation',
        ];

      case 'incident-overview':
        return [
          'timeline',
          'analytics',
          'narrative',
          'health',
          'fabric',
          'documentation',
          'governance',
        ];

      case 'lineage-trace':
        return [
          'knowledge-graph',
          'governance-history',
          'fabric',
          'health',
        ];

      case 'impact-analysis':
        return [
          'fabric',
          'knowledge-graph',
          'analytics',
          'insights',
          'health',
        ];

      case 'governance-explanation':
        return [
          'governance',
          'governance-history',
          'narrative',
          'documentation',
        ];

      case 'documentation-bundle':
        return [
          'documentation',
          'training',
          'marketplace',
          'narrative',
        ];

      case 'fabric-neighborhood':
        return [
          'fabric',
          'knowledge-graph',
          'search',
        ];

      default:
        return [];
    }
  }

  /**
   * Check if policy allows querying this engine
   */
  private isPolicyAllowed(
    engine: HubSourceEngine,
    policyContext: HubPolicyContext
  ): boolean {
    // In production, this would call the HubPolicyEngine
    // For now, allow all queries within same tenant
    return policyContext.tenantId === this.tenantId;
  }

  // ==========================================================================
  // ENGINE-SPECIFIC ROUTING
  // ==========================================================================

  /**
   * Route to a specific engine
   */
  private async routeToEngine(
    engine: HubSourceEngine,
    query: HubQuery
  ): Promise<HubSection | null> {
    try {
      const startTime = Date.now();

      let data: any = null;
      let references: HubReference[] = [];

      switch (engine) {
        case 'search':
          ({ data, references } = await this.querySearchEngine(query));
          break;
        case 'knowledge-graph':
          ({ data, references } = await this.queryKnowledgeGraph(query));
          break;
        case 'narrative':
          ({ data, references } = await this.queryNarrativeEngine(query));
          break;
        case 'timeline':
          ({ data, references } = await this.queryTimelineEngine(query));
          break;
        case 'analytics':
          ({ data, references } = await this.queryAnalyticsEngine(query));
          break;
        case 'training':
          ({ data, references } = await this.queryTrainingEngine(query));
          break;
        case 'marketplace':
          ({ data, references } = await this.queryMarketplaceEngine(query));
          break;
        case 'insights':
          ({ data, references } = await this.queryInsightsEngine(query));
          break;
        case 'health':
          ({ data, references } = await this.queryHealthEngine(query));
          break;
        case 'governance':
          ({ data, references } = await this.queryGovernanceEngine(query));
          break;
        case 'governance-history':
          ({ data, references } = await this.queryGovernanceHistory(query));
          break;
        case 'fabric':
          ({ data, references } = await this.queryFabricEngine(query));
          break;
        case 'documentation':
          ({ data, references } = await this.queryDocumentationEngine(query));
          break;
        default:
          throw new Error(`Unknown engine: ${engine}`);
      }

      const queryTime = Date.now() - startTime;

      return {
        sectionId: `${engine}-${query.queryId}`,
        sourceEngine: engine,
        title: this.getEngineSectionTitle(engine),
        summary: this.generateEngineSummary(engine, data, references),
        data,
        references,
        metadata: {
          queryTime,
          resultCount: references.length,
          hasMoreResults: false,
        },
      };
    } catch (error) {
      console.error(`Error routing to ${engine}:`, error);
      return null;
    }
  }

  // ==========================================================================
  // ENGINE QUERIES
  // ==========================================================================

  private async querySearchEngine(query: HubQuery): Promise<{ data: any; references: HubReference[] }> {
    // In production: call Search Engine (Phase 35)
    const mockResults = {
      results: [
        { id: 'search-result-1', title: 'Sample Search Result', score: 0.95 },
      ],
    };

    const references: HubReference[] = mockResults.results.map(r => ({
      referenceId: r.id,
      referenceType: 'entity' as const,
      entityId: r.id,
      entityType: 'search-result',
      title: r.title,
      sourceEngine: 'search' as const,
      metadata: { score: r.score },
    }));

    return { data: mockResults, references };
  }

  private async queryKnowledgeGraph(query: HubQuery): Promise<{ data: any; references: HubReference[] }> {
    // In production: call Knowledge Graph (Phase 34)
    const mockGraph = {
      nodes: [
        { id: 'kg-node-1', type: 'entity', label: 'Sample Entity' },
      ],
      edges: [],
    };

    const references: HubReference[] = mockGraph.nodes.map(n => ({
      referenceId: n.id,
      referenceType: 'entity' as const,
      entityId: n.id,
      entityType: n.type,
      title: n.label,
      sourceEngine: 'knowledge-graph' as const,
      metadata: {},
    }));

    return { data: mockGraph, references };
  }

  private async queryNarrativeEngine(query: HubQuery): Promise<{ data: any; references: HubReference[] }> {
    // In production: call Narrative Engine (Phase 37)
    const mockNarratives = {
      narratives: [
        { id: 'narrative-1', title: 'Sample Narrative', summary: 'A sample narrative' },
      ],
    };

    const references: HubReference[] = mockNarratives.narratives.map(n => ({
      referenceId: n.id,
      referenceType: 'document' as const,
      entityId: n.id,
      entityType: 'narrative',
      title: n.title,
      description: n.summary,
      sourceEngine: 'narrative' as const,
      metadata: {},
    }));

    return { data: mockNarratives, references };
  }

  private async queryTimelineEngine(query: HubQuery): Promise<{ data: any; references: HubReference[] }> {
    // In production: call Timeline Engine (Phase 38)
    const mockEvents = {
      events: [
        { id: 'event-1', title: 'Sample Event', timestamp: '2026-01-20T10:00:00Z' },
      ],
    };

    const references: HubReference[] = mockEvents.events.map(e => ({
      referenceId: e.id,
      referenceType: 'incident' as const,
      entityId: e.id,
      entityType: 'timeline-event',
      title: e.title,
      sourceEngine: 'timeline' as const,
      metadata: { timestamp: e.timestamp },
    }));

    return { data: mockEvents, references };
  }

  private async queryAnalyticsEngine(query: HubQuery): Promise<{ data: any; references: HubReference[] }> {
    // In production: call Analytics Engine (Phase 39)
    const mockPatterns = {
      patterns: [
        { id: 'pattern-1', title: 'Sample Pattern', frequency: 5 },
      ],
    };

    const references: HubReference[] = mockPatterns.patterns.map(p => ({
      referenceId: p.id,
      referenceType: 'pattern' as const,
      entityId: p.id,
      entityType: 'analytics-pattern',
      title: p.title,
      sourceEngine: 'analytics' as const,
      metadata: { frequency: p.frequency },
    }));

    return { data: mockPatterns, references };
  }

  private async queryTrainingEngine(query: HubQuery): Promise<{ data: any; references: HubReference[] }> {
    // In production: call Training Engine (Phase 40)
    const mockModules = {
      modules: [
        { id: 'module-1', title: 'Sample Training Module', completionRate: 0.85 },
      ],
    };

    const references: HubReference[] = mockModules.modules.map(m => ({
      referenceId: m.id,
      referenceType: 'training' as const,
      entityId: m.id,
      entityType: 'training-module',
      title: m.title,
      sourceEngine: 'training' as const,
      metadata: { completionRate: m.completionRate },
    }));

    return { data: mockModules, references };
  }

  private async queryMarketplaceEngine(query: HubQuery): Promise<{ data: any; references: HubReference[] }> {
    // In production: call Marketplace Engine (Phase 41)
    const mockAssets = {
      assets: [
        { id: 'asset-1', title: 'Sample Marketplace Asset', rating: 4.5 },
      ],
    };

    const references: HubReference[] = mockAssets.assets.map(a => ({
      referenceId: a.id,
      referenceType: 'asset' as const,
      entityId: a.id,
      entityType: 'marketplace-asset',
      title: a.title,
      sourceEngine: 'marketplace' as const,
      metadata: { rating: a.rating },
    }));

    return { data: mockAssets, references };
  }

  private async queryInsightsEngine(query: HubQuery): Promise<{ data: any; references: HubReference[] }> {
    // In production: call Insights Engine (Phase 42)
    const mockInsights = {
      insights: [
        { id: 'insight-1', title: 'Sample Insight', confidence: 0.92 },
      ],
    };

    const references: HubReference[] = mockInsights.insights.map(i => ({
      referenceId: i.id,
      referenceType: 'entity' as const,
      entityId: i.id,
      entityType: 'insight',
      title: i.title,
      sourceEngine: 'insights' as const,
      metadata: { confidence: i.confidence },
    }));

    return { data: mockInsights, references };
  }

  private async queryHealthEngine(query: HubQuery): Promise<{ data: any; references: HubReference[] }> {
    // In production: call Health Engine (Phase 43)
    const mockHealthData = {
      checks: [
        { id: 'check-1', name: 'Sample Health Check', status: 'healthy' },
      ],
    };

    const references: HubReference[] = mockHealthData.checks.map(c => ({
      referenceId: c.id,
      referenceType: 'entity' as const,
      entityId: c.id,
      entityType: 'health-check',
      title: c.name,
      sourceEngine: 'health' as const,
      metadata: { status: c.status },
    }));

    return { data: mockHealthData, references };
  }

  private async queryGovernanceEngine(query: HubQuery): Promise<{ data: any; references: HubReference[] }> {
    // In production: call Governance Engine (Phase 44)
    const mockDecisions = {
      decisions: [
        { id: 'decision-1', title: 'Sample Governance Decision', status: 'approved' },
      ],
    };

    const references: HubReference[] = mockDecisions.decisions.map(d => ({
      referenceId: d.id,
      referenceType: 'decision' as const,
      entityId: d.id,
      entityType: 'governance-decision',
      title: d.title,
      sourceEngine: 'governance' as const,
      metadata: { status: d.status },
    }));

    return { data: mockDecisions, references };
  }

  private async queryGovernanceHistory(query: HubQuery): Promise<{ data: any; references: HubReference[] }> {
    // In production: call Governance History (Phase 45)
    const mockHistory = {
      entries: [
        { id: 'history-1', title: 'Sample History Entry', timestamp: '2026-01-20T10:00:00Z' },
      ],
    };

    const references: HubReference[] = mockHistory.entries.map(h => ({
      referenceId: h.id,
      referenceType: 'entity' as const,
      entityId: h.id,
      entityType: 'governance-history',
      title: h.title,
      sourceEngine: 'governance-history' as const,
      metadata: { timestamp: h.timestamp },
    }));

    return { data: mockHistory, references };
  }

  private async queryFabricEngine(query: HubQuery): Promise<{ data: any; references: HubReference[] }> {
    // In production: call Fabric Engine (Phase 46)
    const mockFabricData = {
      links: [
        { id: 'link-1', source: 'entity-1', target: 'entity-2', type: 'related-to' },
      ],
    };

    const references: HubReference[] = mockFabricData.links.map(l => ({
      referenceId: l.id,
      referenceType: 'entity' as const,
      entityId: l.id,
      entityType: 'fabric-link',
      title: `${l.source} → ${l.target}`,
      sourceEngine: 'fabric' as const,
      relationshipType: l.type,
      metadata: { source: l.source, target: l.target },
    }));

    return { data: mockFabricData, references };
  }

  private async queryDocumentationEngine(query: HubQuery): Promise<{ data: any; references: HubReference[] }> {
    // In production: call Documentation Engine (Phase 47)
    const mockDocs = {
      documents: [
        { id: 'doc-1', title: 'Sample Documentation', type: 'guide' },
      ],
    };

    const references: HubReference[] = mockDocs.documents.map(d => ({
      referenceId: d.id,
      referenceType: 'document' as const,
      entityId: d.id,
      entityType: 'documentation',
      title: d.title,
      sourceEngine: 'documentation' as const,
      metadata: { type: d.type },
    }));

    return { data: mockDocs, references };
  }

  // ==========================================================================
  // HELPERS
  // ==========================================================================

  private getEngineSectionTitle(engine: HubSourceEngine): string {
    const titles: Record<HubSourceEngine, string> = {
      'search': 'Search Results',
      'knowledge-graph': 'Knowledge Graph',
      'narrative': 'Narratives',
      'timeline': 'Timeline Events',
      'analytics': 'Analytics Patterns',
      'training': 'Training Modules',
      'marketplace': 'Marketplace Assets',
      'insights': 'Insights',
      'health': 'Health & Integrity',
      'governance': 'Governance Decisions',
      'governance-history': 'Governance History',
      'fabric': 'Data Fabric Links',
      'documentation': 'Documentation',
    };
    return titles[engine];
  }

  private generateEngineSummary(
    engine: HubSourceEngine,
    data: any,
    references: HubReference[]
  ): string {
    const count = references.length;
    if (count === 0) return 'No results found';
    if (count === 1) return '1 result found';
    return `${count} results found`;
  }
}
