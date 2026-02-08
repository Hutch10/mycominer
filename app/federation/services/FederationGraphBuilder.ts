/**
 * Federation Graph Builder
 * 
 * Builds and maintains a knowledge graph of the federation:
 * - Organizations and their relationships
 * - Trust networks and collaboration patterns
 * - Data flows and model exchanges
 * - Integration with Phase 68 Knowledge Graph
 * 
 * Graph Structure:
 * - Nodes: Organizations, Models, Insights, Extensions
 * - Edges: Trusts, Collaborates, Uses, Publishes, Installs
 */

import { federationRegistry } from './FederationRegistry';
import { Organization, TrustRelationship } from '../types';

export interface GraphNode {
  id: string;
  type: 'organization' | 'model' | 'insight' | 'extension' | 'policy';
  label: string;
  properties: Record<string, unknown>;
  metadata: {
    created: Date;
    updated: Date;
  };
}

export interface GraphEdge {
  id: string;
  source: string; // Node ID
  target: string; // Node ID
  type: 'trusts' | 'collaborates' | 'uses' | 'publishes' | 'installs' | 'enforces';
  weight: number; // 0-1
  properties: Record<string, unknown>;
  metadata: {
    created: Date;
    updated: Date;
  };
}

export interface GraphQuery {
  nodeTypes?: string[];
  edgeTypes?: string[];
  filters?: {
    property: string;
    operator: 'eq' | 'gt' | 'lt' | 'contains';
    value: unknown;
  }[];
  limit?: number;
}

export interface PathResult {
  path: string[]; // Node IDs
  length: number;
  weight: number; // Average edge weight
  edges: GraphEdge[];
}

export class FederationGraphBuilder {
  private nodes: Map<string, GraphNode> = new Map();
  private edges: Map<string, GraphEdge> = new Map();
  private adjacencyList: Map<string, string[]> = new Map(); // nodeId -> connected nodeIds

  /**
   * Initialize graph from current federation state
   */
  async initializeGraph(): Promise<void> {
    // Load organizations as nodes
    const stats = await federationRegistry.getStatistics();
    const orgs = await federationRegistry.listVerifiedOrganizations();

    for (const org of orgs) {
      await this.addOrganizationNode(org);
    }

    // Load trust relationships as edges
    for (const org of orgs) {
      const relationships = await federationRegistry.getTrustRelationships(org.id);
      for (const rel of relationships) {
        await this.addTrustEdge(rel);
      }
    }

    console.log(`[FederationGraph] Initialized with ${this.nodes.size} nodes and ${this.edges.size} edges`);
  }

  /**
   * Add organization node
   */
  async addOrganizationNode(org: Organization): Promise<GraphNode> {
    const node: GraphNode = {
      id: org.id,
      type: 'organization',
      label: org.name,
      properties: {
        country: org.country,
        region: org.region,
        orgType: org.type,
        trustScore: org.trustScore,
        verificationLevel: org.verificationLevel,
        verificationStatus: org.verificationStatus,
        size: org.metadata.size,
      },
      metadata: {
        created: org.joinedAt,
        updated: new Date(),
      },
    };

    this.nodes.set(node.id, node);
    
    if (!this.adjacencyList.has(node.id)) {
      this.adjacencyList.set(node.id, []);
    }

    return node;
  }

  /**
   * Add trust relationship edge
   */
  async addTrustEdge(rel: TrustRelationship): Promise<GraphEdge> {
    const edgeId = `${rel.fromOrgId}-trusts-${rel.toOrgId}`;
    
    const edge: GraphEdge = {
      id: edgeId,
      source: rel.fromOrgId,
      target: rel.toOrgId,
      type: 'trusts',
      weight: rel.trustLevel,
      properties: {
        relationshipType: rel.relationshipType,
        interactions: rel.interactions,
        incidents: rel.incidents,
      },
      metadata: {
        created: rel.establishedAt,
        updated: rel.lastUpdated,
      },
    };

    this.edges.set(edgeId, edge);
    
    // Update adjacency list
    if (!this.adjacencyList.has(rel.fromOrgId)) {
      this.adjacencyList.set(rel.fromOrgId, []);
    }
    this.adjacencyList.get(rel.fromOrgId)!.push(rel.toOrgId);

    return edge;
  }

  /**
   * Add model node
   */
  async addModelNode(modelId: string, name: string, publisherId: string): Promise<GraphNode> {
    const node: GraphNode = {
      id: modelId,
      type: 'model',
      label: name,
      properties: {
        publisherId,
      },
      metadata: {
        created: new Date(),
        updated: new Date(),
      },
    };

    this.nodes.set(node.id, node);

    // Add "publishes" edge
    const edgeId = `${publisherId}-publishes-${modelId}`;
    const edge: GraphEdge = {
      id: edgeId,
      source: publisherId,
      target: modelId,
      type: 'publishes',
      weight: 1.0,
      properties: {},
      metadata: {
        created: new Date(),
        updated: new Date(),
      },
    };

    this.edges.set(edgeId, edge);
    
    if (!this.adjacencyList.has(publisherId)) {
      this.adjacencyList.set(publisherId, []);
    }
    this.adjacencyList.get(publisherId)!.push(modelId);

    return node;
  }

  /**
   * Add "uses" relationship (org uses model/extension)
   */
  async addUsageEdge(orgId: string, resourceId: string, resourceType: 'model' | 'extension'): Promise<GraphEdge> {
    const edgeId = `${orgId}-uses-${resourceId}`;
    
    const edge: GraphEdge = {
      id: edgeId,
      source: orgId,
      target: resourceId,
      type: 'uses',
      weight: 0.8,
      properties: {
        resourceType,
        usageCount: 1,
      },
      metadata: {
        created: new Date(),
        updated: new Date(),
      },
    };

    this.edges.set(edgeId, edge);
    
    if (!this.adjacencyList.has(orgId)) {
      this.adjacencyList.set(orgId, []);
    }
    this.adjacencyList.get(orgId)!.push(resourceId);

    return edge;
  }

  /**
   * Query graph with filters
   */
  async query(query: GraphQuery): Promise<{ nodes: GraphNode[]; edges: GraphEdge[] }> {
    let nodes = Array.from(this.nodes.values());
    let edges = Array.from(this.edges.values());

    // Filter by node type
    if (query.nodeTypes && query.nodeTypes.length > 0) {
      nodes = nodes.filter(n => query.nodeTypes!.includes(n.type));
    }

    // Filter by edge type
    if (query.edgeTypes && query.edgeTypes.length > 0) {
      edges = edges.filter(e => query.edgeTypes!.includes(e.type));
    }

    // Apply property filters
    if (query.filters) {
      for (const filter of query.filters) {
        nodes = nodes.filter(n => {
          const value = n.properties[filter.property];
          switch (filter.operator) {
            case 'eq':
              return value === filter.value;
            case 'gt':
              return typeof value === 'number' && value > (filter.value as number);
            case 'lt':
              return typeof value === 'number' && value < (filter.value as number);
            case 'contains':
              return typeof value === 'string' && value.includes(filter.value as string);
            default:
              return true;
          }
        });
      }
    }

    // Limit results
    if (query.limit) {
      nodes = nodes.slice(0, query.limit);
      // Filter edges to only include those connecting returned nodes
      const nodeIds = new Set(nodes.map(n => n.id));
      edges = edges.filter(e => nodeIds.has(e.source) && nodeIds.has(e.target));
    }

    return { nodes, edges };
  }

  /**
   * Find shortest path between two organizations
   */
  async findPath(fromOrgId: string, toOrgId: string): Promise<PathResult | null> {
    if (!this.nodes.has(fromOrgId) || !this.nodes.has(toOrgId)) {
      return null;
    }

    // BFS to find shortest path
    const queue: string[][] = [[fromOrgId]];
    const visited = new Set<string>([fromOrgId]);

    while (queue.length > 0) {
      const path = queue.shift()!;
      const current = path[path.length - 1];

      if (current === toOrgId) {
        // Found path - calculate metrics
        const edges: GraphEdge[] = [];
        let totalWeight = 0;

        for (let i = 0; i < path.length - 1; i++) {
          const edgeId = `${path[i]}-trusts-${path[i + 1]}`;
          const edge = this.edges.get(edgeId);
          if (edge) {
            edges.push(edge);
            totalWeight += edge.weight;
          }
        }

        return {
          path,
          length: path.length - 1,
          weight: edges.length > 0 ? totalWeight / edges.length : 0,
          edges,
        };
      }

      const neighbors = this.adjacencyList.get(current) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push([...path, neighbor]);
        }
      }
    }

    return null; // No path found
  }

  /**
   * Find all paths within N hops
   */
  async findPathsWithinHops(fromOrgId: string, maxHops: number): Promise<PathResult[]> {
    if (!this.nodes.has(fromOrgId)) {
      return [];
    }

    const paths: PathResult[] = [];
    const queue: { path: string[]; hops: number }[] = [{ path: [fromOrgId], hops: 0 }];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const { path, hops } = queue.shift()!;
      const current = path[path.length - 1];

      if (hops > 0 && hops <= maxHops) {
        // Calculate path metrics
        const edges: GraphEdge[] = [];
        let totalWeight = 0;

        for (let i = 0; i < path.length - 1; i++) {
          const edgeId = `${path[i]}-trusts-${path[i + 1]}`;
          const edge = this.edges.get(edgeId);
          if (edge) {
            edges.push(edge);
            totalWeight += edge.weight;
          }
        }

        paths.push({
          path,
          length: hops,
          weight: edges.length > 0 ? totalWeight / edges.length : 0,
          edges,
        });
      }

      if (hops < maxHops) {
        const neighbors = this.adjacencyList.get(current) || [];
        for (const neighbor of neighbors) {
          const pathKey = [...path, neighbor].join('-');
          if (!visited.has(pathKey)) {
            visited.add(pathKey);
            queue.push({ path: [...path, neighbor], hops: hops + 1 });
          }
        }
      }
    }

    return paths;
  }

  /**
   * Find influential organizations (high centrality)
   */
  async findInfluentialOrganizations(limit: number = 10): Promise<{
    organizationId: string;
    name: string;
    influence: number;
    connections: number;
  }[]> {
    const orgNodes = Array.from(this.nodes.values()).filter(n => n.type === 'organization');
    
    const influence = orgNodes.map(node => {
      // Calculate degree centrality (number of connections)
      const outgoing = this.adjacencyList.get(node.id)?.length || 0;
      const incoming = Array.from(this.edges.values()).filter(e => e.target === node.id).length;
      const connections = outgoing + incoming;

      // Calculate weighted influence (average trust from/to this org)
      const relatedEdges = Array.from(this.edges.values()).filter(
        e => e.source === node.id || e.target === node.id
      );
      const avgWeight = relatedEdges.length > 0
        ? relatedEdges.reduce((sum, e) => sum + e.weight, 0) / relatedEdges.length
        : 0;

      return {
        organizationId: node.id,
        name: node.label,
        influence: connections * avgWeight,
        connections,
      };
    });

    return influence
      .sort((a, b) => b.influence - a.influence)
      .slice(0, limit);
  }

  /**
   * Detect communities (clusters of highly connected organizations)
   */
  async detectCommunities(): Promise<{
    communityId: string;
    organizations: string[];
    density: number; // Ratio of actual edges to possible edges
  }[]> {
    // Simplified community detection using connected components
    const visited = new Set<string>();
    const communities: { communityId: string; organizations: string[]; density: number }[] = [];

    const orgNodes = Array.from(this.nodes.values()).filter(n => n.type === 'organization');

    for (const node of orgNodes) {
      if (visited.has(node.id)) continue;

      const community = await this.exploreComponent(node.id, visited);
      
      // Calculate density
      const n = community.length;
      const possibleEdges = (n * (n - 1)) / 2;
      let actualEdges = 0;

      for (let i = 0; i < community.length; i++) {
        for (let j = i + 1; j < community.length; j++) {
          const edgeId1 = `${community[i]}-trusts-${community[j]}`;
          const edgeId2 = `${community[j]}-trusts-${community[i]}`;
          if (this.edges.has(edgeId1) || this.edges.has(edgeId2)) {
            actualEdges++;
          }
        }
      }

      const density = possibleEdges > 0 ? actualEdges / possibleEdges : 0;

      if (community.length > 1) {
        communities.push({
          communityId: `community-${communities.length + 1}`,
          organizations: community,
          density,
        });
      }
    }

    return communities.sort((a, b) => b.organizations.length - a.organizations.length);
  }

  /**
   * Explore connected component (DFS)
   */
  private async exploreComponent(startId: string, visited: Set<string>): Promise<string[]> {
    const component: string[] = [];
    const stack = [startId];

    while (stack.length > 0) {
      const current = stack.pop()!;
      
      if (visited.has(current)) continue;
      
      visited.add(current);
      component.push(current);

      const neighbors = this.adjacencyList.get(current) || [];
      for (const neighbor of neighbors) {
        const node = this.nodes.get(neighbor);
        if (node && node.type === 'organization' && !visited.has(neighbor)) {
          stack.push(neighbor);
        }
      }

      // Also check incoming edges
      const incomingEdges = Array.from(this.edges.values()).filter(
        e => e.target === current && e.type === 'trusts'
      );
      for (const edge of incomingEdges) {
        if (!visited.has(edge.source)) {
          stack.push(edge.source);
        }
      }
    }

    return component;
  }

  /**
   * Get graph statistics
   */
  async getGraphStatistics(): Promise<{
    nodeCount: number;
    edgeCount: number;
    nodesByType: Record<string, number>;
    edgesByType: Record<string, number>;
    avgDegree: number;
    density: number;
  }> {
    const nodesByType: Record<string, number> = {};
    const edgesByType: Record<string, number> = {};

    for (const node of this.nodes.values()) {
      nodesByType[node.type] = (nodesByType[node.type] || 0) + 1;
    }

    for (const edge of this.edges.values()) {
      edgesByType[edge.type] = (edgesByType[edge.type] || 0) + 1;
    }

    const orgNodes = Array.from(this.nodes.values()).filter(n => n.type === 'organization');
    const n = orgNodes.length;
    const m = this.edges.size;

    const avgDegree = n > 0 ? (2 * m) / n : 0;
    const density = n > 1 ? (2 * m) / (n * (n - 1)) : 0;

    return {
      nodeCount: this.nodes.size,
      edgeCount: this.edges.size,
      nodesByType,
      edgesByType,
      avgDegree,
      density,
    };
  }

  /**
   * Export graph for visualization
   */
  async exportForVisualization(): Promise<{
    nodes: { id: string; label: string; type: string; size: number }[];
    edges: { source: string; target: string; type: string; weight: number }[];
  }> {
    const nodes = Array.from(this.nodes.values()).map(n => ({
      id: n.id,
      label: n.label,
      type: n.type,
      size: (n.properties.trustScore as number) || 50,
    }));

    const edges = Array.from(this.edges.values()).map(e => ({
      source: e.source,
      target: e.target,
      type: e.type,
      weight: e.weight,
    }));

    return { nodes, edges };
  }
}

// Singleton instance
export const federationGraphBuilder = new FederationGraphBuilder();
