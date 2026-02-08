/**
 * Phase 46: Multi-Tenant Data Fabric - Fabric Linker
 * 
 * Unifies entities across engines using deterministic IDs, semantic relationships,
 * and cross-engine references. Generates FabricEdge objects for various relationship types.
 */

import {
  FabricNode,
  FabricEdge,
  FabricEntityType,
  FabricEdgeType,
  FabricScopeContext,
  FabricLinkRequest,
  FabricLinkResult,
  FabricPolicyEvaluation
} from './fabricTypes';

// ============================================================================
// FABRIC LINKER CLASS
// ============================================================================

export class FabricLinker {
  private nodes: Map<string, FabricNode> = new Map();
  private edges: Map<string, FabricEdge> = new Map();
  private tenantId: string;
  private facilityId?: string;

  constructor(tenantId: string, facilityId?: string) {
    this.tenantId = tenantId;
    this.facilityId = facilityId;
  }

  /**
   * Register a node in the fabric
   */
  registerNode(
    entityId: string,
    entityType: FabricEntityType,
    sourceEngine: string,
    sourcePhase: number,
    name: string,
    scope: FabricScopeContext,
    metadata: Record<string, any> = {}
  ): FabricNode {
    const nodeId = this.generateNodeId(entityId, entityType);
    
    const node: FabricNode = {
      id: nodeId,
      entityType,
      entityId,
      sourceEngine,
      sourcePhase,
      scope,
      name,
      description: metadata.description,
      metadata,
      created: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      visibility: this.determineVisibility(scope),
      federationAllowed: this.isFederationAllowed(scope)
    };

    this.nodes.set(nodeId, node);
    return node;
  }

  /**
   * Create a link between two nodes
   */
  createLink(request: FabricLinkRequest): FabricLinkResult {
    const fromNodeId = this.generateNodeId(request.fromEntityId, request.fromEntityType);
    const toNodeId = this.generateNodeId(request.toEntityId, request.toEntityType);

    const fromNode = this.nodes.get(fromNodeId);
    const toNode = this.nodes.get(toNodeId);

    if (!fromNode || !toNode) {
      return {
        success: false,
        error: 'One or both nodes not found in fabric',
        policyEvaluations: []
      };
    }

    // Check tenant boundaries
    if (fromNode.scope.tenantId !== toNode.scope.tenantId) {
      if (!fromNode.federationAllowed || !toNode.federationAllowed) {
        return {
          success: false,
          error: 'Cross-tenant linking not allowed by federation policy',
          policyEvaluations: [{
            policyId: 'tenant-isolation',
            policyName: 'Tenant Isolation Policy',
            allowed: false,
            reason: 'Nodes belong to different tenants and federation is disabled',
            timestamp: new Date().toISOString()
          }]
        };
      }
    }

    // Create edge
    const edgeId = this.generateEdgeId(fromNodeId, toNodeId, request.edgeType);
    const edge: FabricEdge = {
      id: edgeId,
      edgeType: request.edgeType,
      fromNodeId,
      toNodeId,
      fromEntityType: request.fromEntityType,
      toEntityType: request.toEntityType,
      relationshipStrength: this.calculateStrength(request.edgeType),
      relationshipRationale: request.rationale,
      scope: this.mergeScopes(fromNode.scope, toNode.scope),
      created: new Date().toISOString(),
      createdBy: request.requestedBy,
      visibility: this.determineEdgeVisibility(fromNode, toNode)
    };

    this.edges.set(edgeId, edge);

    return {
      success: true,
      edge,
      policyEvaluations: [{
        policyId: 'link-creation',
        policyName: 'Link Creation Policy',
        allowed: true,
        reason: 'Link creation approved',
        timestamp: new Date().toISOString()
      }]
    };
  }

  /**
   * Generate automatic links based on semantic relationships
   */
  generateAutomaticLinks(nodeId: string): FabricEdge[] {
    const node = this.nodes.get(nodeId);
    if (!node) return [];

    const generatedEdges: FabricEdge[] = [];

    // Find related nodes by type and scope
    for (const [targetNodeId, targetNode] of this.nodes.entries()) {
      if (targetNodeId === nodeId) continue;
      if (targetNode.scope.tenantId !== node.scope.tenantId) continue;

      const relationship = this.detectRelationship(node, targetNode);
      if (relationship) {
        const edgeId = this.generateEdgeId(nodeId, targetNodeId, relationship.edgeType);
        
        // Only create if doesn't exist
        if (!this.edges.has(edgeId)) {
          const edge: FabricEdge = {
            id: edgeId,
            edgeType: relationship.edgeType,
            fromNodeId: nodeId,
            toNodeId: targetNodeId,
            fromEntityType: node.entityType,
            toEntityType: targetNode.entityType,
            relationshipStrength: relationship.strength,
            relationshipRationale: relationship.rationale,
            scope: this.mergeScopes(node.scope, targetNode.scope),
            created: new Date().toISOString(),
            createdBy: 'system',
            visibility: this.determineEdgeVisibility(node, targetNode)
          };

          this.edges.set(edgeId, edge);
          generatedEdges.push(edge);
        }
      }
    }

    return generatedEdges;
  }

  /**
   * Get all nodes
   */
  getAllNodes(): FabricNode[] {
    return Array.from(this.nodes.values());
  }

  /**
   * Get all edges
   */
  getAllEdges(): FabricEdge[] {
    return Array.from(this.edges.values());
  }

  /**
   * Get node by ID
   */
  getNode(nodeId: string): FabricNode | undefined {
    return this.nodes.get(nodeId);
  }

  /**
   * Get edges for a node
   */
  getEdgesForNode(nodeId: string): FabricEdge[] {
    return Array.from(this.edges.values()).filter(
      edge => edge.fromNodeId === nodeId || edge.toNodeId === nodeId
    );
  }

  /**
   * Get nodes by type
   */
  getNodesByType(entityType: FabricEntityType): FabricNode[] {
    return Array.from(this.nodes.values()).filter(
      node => node.entityType === entityType
    );
  }

  /**
   * Get edges by type
   */
  getEdgesByType(edgeType: FabricEdgeType): FabricEdge[] {
    return Array.from(this.edges.values()).filter(
      edge => edge.edgeType === edgeType
    );
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  private generateNodeId(entityId: string, entityType: FabricEntityType): string {
    return `node-${entityType}-${entityId}`;
  }

  private generateEdgeId(fromNodeId: string, toNodeId: string, edgeType: FabricEdgeType): string {
    return `edge-${edgeType}-${fromNodeId}-${toNodeId}`;
  }

  private determineVisibility(scope: FabricScopeContext): 'public' | 'tenant' | 'facility' | 'restricted' {
    if (scope.scope === 'global') return 'public';
    if (scope.scope === 'tenant') return 'tenant';
    if (scope.scope === 'facility') return 'facility';
    return 'restricted';
  }

  private isFederationAllowed(scope: FabricScopeContext): boolean {
    // Only global and tenant-level entities can be federated
    return scope.scope === 'global' || scope.scope === 'tenant';
  }

  private determineEdgeVisibility(fromNode: FabricNode, toNode: FabricNode): 'public' | 'tenant' | 'facility' | 'restricted' {
    // Edge visibility is the most restrictive of the two nodes
    const visibilityOrder = ['public', 'tenant', 'facility', 'restricted'];
    const fromIndex = visibilityOrder.indexOf(fromNode.visibility);
    const toIndex = visibilityOrder.indexOf(toNode.visibility);
    return visibilityOrder[Math.max(fromIndex, toIndex)] as any;
  }

  private mergeScopes(scope1: FabricScopeContext, scope2: FabricScopeContext): FabricScopeContext {
    // Merged scope is the most restrictive
    const scopeOrder: FabricScopeContext['scope'][] = ['global', 'tenant', 'facility', 'room', 'engine', 'asset-type'];
    const index1 = scopeOrder.indexOf(scope1.scope);
    const index2 = scopeOrder.indexOf(scope2.scope);
    
    const mergedScope = scopeOrder[Math.max(index1, index2)];
    
    return {
      scope: mergedScope,
      tenantId: scope1.tenantId,
      facilityId: scope1.facilityId || scope2.facilityId,
      roomId: scope1.roomId || scope2.roomId,
      engineId: scope1.engineId || scope2.engineId,
      assetTypeId: scope1.assetTypeId || scope2.assetTypeId
    };
  }

  private calculateStrength(edgeType: FabricEdgeType): number {
    // Relationship strength based on edge type
    const strengthMap: Record<FabricEdgeType, number> = {
      'derived-from': 1.0,
      'references': 0.8,
      'explains': 0.9,
      'is-related-to': 0.6,
      'is-sourced-from': 1.0,
      'contains': 0.9,
      'uses': 0.7,
      'produces': 0.8,
      'affects': 0.7,
      'triggers': 0.8
    };
    return strengthMap[edgeType] || 0.5;
  }

  private detectRelationship(
    node1: FabricNode,
    node2: FabricNode
  ): { edgeType: FabricEdgeType; strength: number; rationale: string } | null {
    // Detect automatic relationships based on entity types

    // Training module -> Knowledge pack
    if (node1.entityType === 'training-module' && node2.entityType === 'knowledge-pack') {
      return {
        edgeType: 'references',
        strength: 0.8,
        rationale: 'Training module references knowledge pack'
      };
    }

    // Analytics pattern -> Health finding
    if (node1.entityType === 'analytics-pattern' && node2.entityType === 'health-finding') {
      return {
        edgeType: 'affects',
        strength: 0.7,
        rationale: 'Analytics pattern detected in health finding'
      };
    }

    // Timeline event -> Governance change
    if (node1.entityType === 'timeline-event' && node2.entityType === 'governance-change') {
      return {
        edgeType: 'is-related-to',
        strength: 0.6,
        rationale: 'Timeline event related to governance change'
      };
    }

    // Knowledge pack -> Insight
    if (node1.entityType === 'knowledge-pack' && node2.entityType === 'insight') {
      return {
        edgeType: 'contains',
        strength: 0.9,
        rationale: 'Knowledge pack contains insight'
      };
    }

    // Narrative explanation -> KG node
    if (node1.entityType === 'narrative-explanation' && node2.entityType === 'kg-node') {
      return {
        edgeType: 'explains',
        strength: 0.9,
        rationale: 'Narrative explains knowledge graph node'
      };
    }

    // Governance role -> Training certification
    if (node1.entityType === 'governance-role' && node2.entityType === 'training-certification') {
      return {
        edgeType: 'uses',
        strength: 0.7,
        rationale: 'Governance role requires training certification'
      };
    }

    return null;
  }
}

// ============================================================================
// LINKER UTILITIES
// ============================================================================

/**
 * Create a linker instance
 */
export function createFabricLinker(tenantId: string, facilityId?: string): FabricLinker {
  return new FabricLinker(tenantId, facilityId);
}

/**
 * Validate link request
 */
export function validateLinkRequest(request: FabricLinkRequest): { valid: boolean; error?: string } {
  if (!request.fromEntityId || !request.toEntityId) {
    return { valid: false, error: 'Missing entity IDs' };
  }

  if (!request.fromEntityType || !request.toEntityType) {
    return { valid: false, error: 'Missing entity types' };
  }

  if (!request.edgeType) {
    return { valid: false, error: 'Missing edge type' };
  }

  if (!request.rationale) {
    return { valid: false, error: 'Missing rationale' };
  }

  return { valid: true };
}
