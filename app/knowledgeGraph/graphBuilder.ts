import { KGNode, KGEdge, KGEdgeType, KGNodeType } from './knowledgeGraphTypes';
import { logGraphEvent } from './knowledgeGraphLog';

export interface GraphSourceRecord {
  id: string;
  name: string;
  type: KGNodeType;
  tenantId: string;
  facilityId?: string;
  tags?: string[];
  relatedIds?: string[];
  sourceSystem: string;
  metadata?: Record<string, unknown>;
}

export interface GraphSourceEdge {
  from: string;
  to: string;
  type: KGEdgeType;
  tenantId: string;
  label?: string;
  metadata?: Record<string, unknown>;
}

export interface GraphBuilderInput {
  tenantId: string;
  federatedTenantIds?: string[];
  sources: {
    records: GraphSourceRecord[];
    edges: GraphSourceEdge[];
  };
}

export interface BuiltGraph {
  nodes: KGNode[];
  edges: KGEdge[];
}

function isTenantAllowed(nodeTenant: string, ctxTenant: string, federated?: string[]): boolean {
  if (nodeTenant === ctxTenant) return true;
  return federated?.includes(nodeTenant) === true;
}

export function buildKnowledgeGraph(input: GraphBuilderInput): BuiltGraph {
  const { tenantId, federatedTenantIds, sources } = input;
  const nodes: KGNode[] = [];
  const edges: KGEdge[] = [];

  sources.records.forEach((rec) => {
    if (!isTenantAllowed(rec.tenantId, tenantId, federatedTenantIds)) {
      logGraphEvent('access', 'Node excluded by tenant boundary', { nodeId: rec.id, nodeTenant: rec.tenantId, scopeTenant: tenantId });
      return;
    }
    nodes.push({ ...rec });
  });

  sources.edges.forEach((edge, idx) => {
    const fromAllowed = nodes.some((n) => n.id === edge.from);
    const toAllowed = nodes.some((n) => n.id === edge.to);
    const federated = edge.tenantId !== tenantId;

    if (!fromAllowed || !toAllowed) {
      logGraphEvent('access', 'Edge excluded due to boundary or missing node', { edgeIdx: idx, from: edge.from, to: edge.to });
      return;
    }

    if (federated && !isTenantAllowed(edge.tenantId, tenantId, federatedTenantIds)) {
      logGraphEvent('federation', 'Edge excluded by federation policy', { edgeIdx: idx, edgeTenant: edge.tenantId });
      return;
    }

    edges.push({ id: `edge-${idx}-${Date.now()}`, ...edge, federated });
  });

  logGraphEvent('build', 'Knowledge graph built', { nodes: nodes.length, edges: edges.length, scopeTenant: tenantId, federated: federatedTenantIds?.length ?? 0 });
  return { nodes, edges };
}
