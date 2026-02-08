/**
 * Phase 46: Multi-Tenant Data Fabric - Fabric Resolver
 * 
 * Resolves queries across the unified knowledge mesh, producing FabricResult
 * objects with nodes, edges, scopes, and references.
 */

import {
  FabricQuery,
  FabricResult,
  FabricNode,
  FabricEdge,
  FabricReference,
  FabricQueryType,
  FabricEntityType,
  FabricEdgeType,
  FabricPolicyEvaluation
} from './fabricTypes';
import { FabricLinker } from './fabricLinker';

// ============================================================================
// FABRIC RESOLVER CLASS
// ============================================================================

export class FabricResolver {
  private linker: FabricLinker;
  private tenantId: string;
  private facilityId?: string;

  constructor(linker: FabricLinker, tenantId: string, facilityId?: string) {
    this.linker = linker;
    this.tenantId = tenantId;
    this.facilityId = facilityId;
  }

  /**
   * Resolve a fabric query
   */
  resolve(query: FabricQuery): FabricResult {
    const startTime = Date.now();
    const queryId = `query-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    let nodes: FabricNode[] = [];
    let edges: FabricEdge[] = [];
    let references: FabricReference[] = [];
    let policyEvaluations: FabricPolicyEvaluation[] = [];

    // Resolve based on query type
    switch (query.queryType) {
      case 'node-by-id':
        ({ nodes, edges, references } = this.resolveNodeById(query));
        break;
      
      case 'nodes-by-type':
        ({ nodes, edges, references } = this.resolveNodesByType(query));
        break;
      
      case 'edges-by-node':
        ({ nodes, edges, references } = this.resolveEdgesByNode(query));
        break;
      
      case 'knowledge-for-entity':
        ({ nodes, edges, references } = this.resolveKnowledgeForEntity(query));
        break;
      
      case 'cross-engine-search':
        ({ nodes, edges, references } = this.resolveCrossEngineSearch(query));
        break;
      
      case 'lineage-trace':
        ({ nodes, edges, references } = this.resolveLineageTrace(query));
        break;
      
      case 'impact-analysis':
        ({ nodes, edges, references } = this.resolveImpactAnalysis(query));
        break;
      
      default:
        throw new Error(`Unknown query type: ${query.queryType}`);
    }

    // Filter by scope
    nodes = this.filterByScope(nodes, query.scope);
    edges = this.filterEdgesByScope(edges, query.scope);

    // Apply max results limit
    if (query.maxResults && nodes.length > query.maxResults) {
      nodes = nodes.slice(0, query.maxResults);
    }

    // Policy evaluation
    policyEvaluations.push({
      policyId: 'query-execution',
      policyName: 'Query Execution Policy',
      allowed: true,
      reason: 'Query execution approved',
      timestamp: new Date().toISOString()
    });

    const executionTimeMs = Date.now() - startTime;

    return {
      queryId,
      timestamp: new Date().toISOString(),
      queryType: query.queryType,
      nodes,
      edges,
      totalNodes: nodes.length,
      totalEdges: edges.length,
      executionTimeMs,
      references,
      policyEvaluations
    };
  }

  /**
   * Resolve knowledge for a specific entity
   */
  resolveKnowledgeForEntity(query: FabricQuery): {
    nodes: FabricNode[];
    edges: FabricEdge[];
    references: FabricReference[];
  } {
    const { entityId, entityType, maxDepth = 2 } = query.filters || {};
    
    if (!entityId || !entityType) {
      return { nodes: [], edges: [], references: [] };
    }

    const nodeId = `node-${entityType}-${entityId}`;
    const startNode = this.linker.getNode(nodeId);
    
    if (!startNode) {
      return { nodes: [], edges: [], references: [] };
    }

    const nodes: FabricNode[] = [startNode];
    const edges: FabricEdge[] = [];
    const references: FabricReference[] = [];
    const visited = new Set<string>([nodeId]);

    // BFS traversal
    const queue: Array<{ node: FabricNode; depth: number }> = [{ node: startNode, depth: 0 }];

    while (queue.length > 0) {
      const { node, depth } = queue.shift()!;
      
      if (depth >= maxDepth) continue;

      const nodeEdges = this.linker.getEdgesForNode(node.id);
      
      for (const edge of nodeEdges) {
        if (!edges.find(e => e.id === edge.id)) {
          edges.push(edge);
        }

        // Add connected nodes
        const connectedNodeId = edge.fromNodeId === node.id ? edge.toNodeId : edge.fromNodeId;
        
        if (!visited.has(connectedNodeId)) {
          const connectedNode = this.linker.getNode(connectedNodeId);
          if (connectedNode) {
            nodes.push(connectedNode);
            visited.add(connectedNodeId);
            queue.push({ node: connectedNode, depth: depth + 1 });

            // Generate references
            references.push({
              referenceType: 'cross-engine',
              targetEngine: connectedNode.sourceEngine,
              targetPhase: connectedNode.sourcePhase,
              targetEntityId: connectedNode.entityId,
              targetEntityType: connectedNode.entityType,
              description: `${connectedNode.name} (${connectedNode.entityType})`
            });
          }
        }
      }
    }

    return { nodes, edges, references };
  }

  // ============================================================================
  // PRIVATE QUERY RESOLVERS
  // ============================================================================

  private resolveNodeById(query: FabricQuery): {
    nodes: FabricNode[];
    edges: FabricEdge[];
    references: FabricReference[];
  } {
    const { entityId, entityType } = query.filters || {};
    
    if (!entityId || !entityType) {
      return { nodes: [], edges: [], references: [] };
    }

    const nodeId = `node-${entityType}-${entityId}`;
    const node = this.linker.getNode(nodeId);
    
    if (!node) {
      return { nodes: [], edges: [], references: [] };
    }

    const edges = this.linker.getEdgesForNode(nodeId);
    const references: FabricReference[] = [{
      referenceType: 'cross-engine',
      targetEngine: node.sourceEngine,
      targetPhase: node.sourcePhase,
      targetEntityId: node.entityId,
      targetEntityType: node.entityType,
      description: node.name
    }];

    return { nodes: [node], edges, references };
  }

  private resolveNodesByType(query: FabricQuery): {
    nodes: FabricNode[];
    edges: FabricEdge[];
    references: FabricReference[];
  } {
    const { entityType } = query.filters || {};
    
    if (!entityType) {
      return { nodes: [], edges: [], references: [] };
    }

    const nodes = this.linker.getNodesByType(entityType);
    const edges: FabricEdge[] = [];
    const references: FabricReference[] = [];

    // Get edges between these nodes
    for (const node of nodes) {
      const nodeEdges = this.linker.getEdgesForNode(node.id);
      for (const edge of nodeEdges) {
        if (!edges.find(e => e.id === edge.id)) {
          edges.push(edge);
        }
      }

      references.push({
        referenceType: 'cross-engine',
        targetEngine: node.sourceEngine,
        targetPhase: node.sourcePhase,
        targetEntityId: node.entityId,
        targetEntityType: node.entityType,
        description: node.name
      });
    }

    return { nodes, edges, references };
  }

  private resolveEdgesByNode(query: FabricQuery): {
    nodes: FabricNode[];
    edges: FabricEdge[];
    references: FabricReference[];
  } {
    const { entityId, entityType } = query.filters || {};
    
    if (!entityId || !entityType) {
      return { nodes: [], edges: [], references: [] };
    }

    const nodeId = `node-${entityType}-${entityId}`;
    const edges = this.linker.getEdgesForNode(nodeId);
    const nodes: FabricNode[] = [];
    const references: FabricReference[] = [];
    const nodeIds = new Set<string>();

    // Collect all nodes connected by these edges
    for (const edge of edges) {
      if (!nodeIds.has(edge.fromNodeId)) {
        const node = this.linker.getNode(edge.fromNodeId);
        if (node) {
          nodes.push(node);
          nodeIds.add(edge.fromNodeId);
        }
      }
      
      if (!nodeIds.has(edge.toNodeId)) {
        const node = this.linker.getNode(edge.toNodeId);
        if (node) {
          nodes.push(node);
          nodeIds.add(edge.toNodeId);
        }
      }
    }

    for (const node of nodes) {
      references.push({
        referenceType: 'cross-engine',
        targetEngine: node.sourceEngine,
        targetPhase: node.sourcePhase,
        targetEntityId: node.entityId,
        targetEntityType: node.entityType,
        description: node.name
      });
    }

    return { nodes, edges, references };
  }

  private resolveCrossEngineSearch(query: FabricQuery): {
    nodes: FabricNode[];
    edges: FabricEdge[];
    references: FabricReference[];
  } {
    const { sourceEngine } = query.filters || {};
    
    const allNodes = this.linker.getAllNodes();
    const nodes = sourceEngine 
      ? allNodes.filter(n => n.sourceEngine === sourceEngine)
      : allNodes;

    const edges: FabricEdge[] = [];
    const references: FabricReference[] = [];

    for (const node of nodes) {
      const nodeEdges = this.linker.getEdgesForNode(node.id);
      for (const edge of nodeEdges) {
        if (!edges.find(e => e.id === edge.id)) {
          edges.push(edge);
        }
      }

      references.push({
        referenceType: 'cross-engine',
        targetEngine: node.sourceEngine,
        targetPhase: node.sourcePhase,
        targetEntityId: node.entityId,
        targetEntityType: node.entityType,
        description: node.name
      });
    }

    return { nodes, edges, references };
  }

  private resolveLineageTrace(query: FabricQuery): {
    nodes: FabricNode[];
    edges: FabricEdge[];
    references: FabricReference[];
  } {
    const { entityId, entityType, maxDepth = 5 } = query.filters || {};
    
    if (!entityId || !entityType) {
      return { nodes: [], edges: [], references: [] };
    }

    const nodeId = `node-${entityType}-${entityId}`;
    const startNode = this.linker.getNode(nodeId);
    
    if (!startNode) {
      return { nodes: [], edges: [], references: [] };
    }

    const nodes: FabricNode[] = [startNode];
    const edges: FabricEdge[] = [];
    const references: FabricReference[] = [];
    const visited = new Set<string>([nodeId]);

    // Trace lineage (derived-from, is-sourced-from edges)
    const queue: Array<{ nodeId: string; depth: number }> = [{ nodeId, depth: 0 }];

    while (queue.length > 0) {
      const { nodeId: currentNodeId, depth } = queue.shift()!;
      
      if (depth >= maxDepth) continue;

      const nodeEdges = this.linker.getEdgesForNode(currentNodeId);
      const lineageEdges = nodeEdges.filter(e => 
        e.edgeType === 'derived-from' || e.edgeType === 'is-sourced-from'
      );

      for (const edge of lineageEdges) {
        if (!edges.find(e => e.id === edge.id)) {
          edges.push(edge);
        }

        const nextNodeId = edge.fromNodeId === currentNodeId ? edge.toNodeId : edge.fromNodeId;
        
        if (!visited.has(nextNodeId)) {
          const nextNode = this.linker.getNode(nextNodeId);
          if (nextNode) {
            nodes.push(nextNode);
            visited.add(nextNodeId);
            queue.push({ nodeId: nextNodeId, depth: depth + 1 });

            references.push({
              referenceType: 'cross-engine',
              targetEngine: nextNode.sourceEngine,
              targetPhase: nextNode.sourcePhase,
              targetEntityId: nextNode.entityId,
              targetEntityType: nextNode.entityType,
              description: `${nextNode.name} (lineage)`
            });
          }
        }
      }
    }

    return { nodes, edges, references };
  }

  private resolveImpactAnalysis(query: FabricQuery): {
    nodes: FabricNode[];
    edges: FabricEdge[];
    references: FabricReference[];
  } {
    const { entityId, entityType, maxDepth = 3 } = query.filters || {};
    
    if (!entityId || !entityType) {
      return { nodes: [], edges: [], references: [] };
    }

    const nodeId = `node-${entityType}-${entityId}`;
    const startNode = this.linker.getNode(nodeId);
    
    if (!startNode) {
      return { nodes: [], edges: [], references: [] };
    }

    const nodes: FabricNode[] = [startNode];
    const edges: FabricEdge[] = [];
    const references: FabricReference[] = [];
    const visited = new Set<string>([nodeId]);

    // Trace impact (affects, triggers edges)
    const queue: Array<{ nodeId: string; depth: number }> = [{ nodeId, depth: 0 }];

    while (queue.length > 0) {
      const { nodeId: currentNodeId, depth } = queue.shift()!;
      
      if (depth >= maxDepth) continue;

      const nodeEdges = this.linker.getEdgesForNode(currentNodeId);
      const impactEdges = nodeEdges.filter(e => 
        e.edgeType === 'affects' || e.edgeType === 'triggers'
      );

      for (const edge of impactEdges) {
        if (!edges.find(e => e.id === edge.id)) {
          edges.push(edge);
        }

        const nextNodeId = edge.fromNodeId === currentNodeId ? edge.toNodeId : edge.fromNodeId;
        
        if (!visited.has(nextNodeId)) {
          const nextNode = this.linker.getNode(nextNodeId);
          if (nextNode) {
            nodes.push(nextNode);
            visited.add(nextNodeId);
            queue.push({ nodeId: nextNodeId, depth: depth + 1 });

            references.push({
              referenceType: 'cross-engine',
              targetEngine: nextNode.sourceEngine,
              targetPhase: nextNode.sourcePhase,
              targetEntityId: nextNode.entityId,
              targetEntityType: nextNode.entityType,
              description: `${nextNode.name} (impacted)`
            });
          }
        }
      }
    }

    return { nodes, edges, references };
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private filterByScope(nodes: FabricNode[], scope: FabricQuery['scope']): FabricNode[] {
    return nodes.filter(node => {
      if (node.scope.tenantId !== scope.tenantId) return false;
      if (scope.facilityId && node.scope.facilityId !== scope.facilityId) return false;
      if (scope.roomId && node.scope.roomId !== scope.roomId) return false;
      return true;
    });
  }

  private filterEdgesByScope(edges: FabricEdge[], scope: FabricQuery['scope']): FabricEdge[] {
    return edges.filter(edge => {
      if (edge.scope.tenantId !== scope.tenantId) return false;
      if (scope.facilityId && edge.scope.facilityId !== scope.facilityId) return false;
      if (scope.roomId && edge.scope.roomId !== scope.roomId) return false;
      return true;
    });
  }
}

// ============================================================================
// RESOLVER UTILITIES
// ============================================================================

/**
 * Create a resolver instance
 */
export function createFabricResolver(
  linker: FabricLinker,
  tenantId: string,
  facilityId?: string
): FabricResolver {
  return new FabricResolver(linker, tenantId, facilityId);
}
