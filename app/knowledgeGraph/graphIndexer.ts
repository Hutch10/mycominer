import { KGEdge, KGNode, KGEdgeType, KGNodeType } from './knowledgeGraphTypes';

export interface GraphIndex {
  byType: Map<KGNodeType, KGNode[]>;
  byFacility: Map<string, KGNode[]>;
  byTenant: Map<string, KGNode[]>;
  byTag: Map<string, KGNode[]>;
  edgeByType: Map<KGEdgeType, KGEdge[]>;
  edgesFrom: Map<string, KGEdge[]>;
  edgesTo: Map<string, KGEdge[]>;
}

export function createGraphIndex(nodes: KGNode[], edges: KGEdge[]): GraphIndex {
  const byType = new Map<KGNodeType, KGNode[]>();
  const byFacility = new Map<string, KGNode[]>();
  const byTenant = new Map<string, KGNode[]>();
  const byTag = new Map<string, KGNode[]>();
  const edgeByType = new Map<KGEdgeType, KGEdge[]>();
  const edgesFrom = new Map<string, KGEdge[]>();
  const edgesTo = new Map<string, KGEdge[]>();

  nodes.forEach((node) => {
    byType.set(node.type, [...(byType.get(node.type) ?? []), node]);
    if (node.facilityId) byFacility.set(node.facilityId, [...(byFacility.get(node.facilityId) ?? []), node]);
    byTenant.set(node.tenantId, [...(byTenant.get(node.tenantId) ?? []), node]);
    node.tags?.forEach((tag) => byTag.set(tag, [...(byTag.get(tag) ?? []), node]));
  });

  edges.forEach((edge) => {
    edgeByType.set(edge.type, [...(edgeByType.get(edge.type) ?? []), edge]);
    edgesFrom.set(edge.from, [...(edgesFrom.get(edge.from) ?? []), edge]);
    edgesTo.set(edge.to, [...(edgesTo.get(edge.to) ?? []), edge]);
  });

  return { byType, byFacility, byTenant, byTag, edgeByType, edgesFrom, edgesTo };
}

export function neighbors(nodeId: string, index: GraphIndex, filter?: { types?: KGEdgeType[] }): KGEdge[] {
  const out = index.edgesFrom.get(nodeId) ?? [];
  const incoming = index.edgesTo.get(nodeId) ?? [];
  const all = [...out, ...incoming];
  if (!filter?.types) return all;
  return all.filter((e) => filter.types?.includes(e.type));
}

export function boundedPath(startId: string, targetId: string, index: GraphIndex, maxDepth = 3): KGEdge[] {
  const visited = new Set<string>([startId]);
  const queue: { nodeId: string; path: KGEdge[] }[] = [{ nodeId: startId, path: [] }];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) break;
    if (current.path.length > maxDepth) continue;

    const edges = neighbors(current.nodeId, index);
    for (const edge of edges) {
      const nextNode = edge.from === current.nodeId ? edge.to : edge.from;
      if (visited.has(nextNode)) continue;
      const nextPath = [...current.path, edge];
      if (nextNode === targetId) return nextPath;
      visited.add(nextNode);
      queue.push({ nodeId: nextNode, path: nextPath });
    }
  }

  return [];
}
