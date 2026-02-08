import { KGQuery, KGResult, KGNode, KGEdge } from './knowledgeGraphTypes';
import { GraphIndex, neighbors, boundedPath } from './graphIndexer';
import { logGraphEvent } from './knowledgeGraphLog';

interface SemanticQueryContext {
  nodes: KGNode[];
  edges: KGEdge[];
  index: GraphIndex;
}

function filterByScope<T extends { tenantId: string; federated?: boolean }>(items: T[], query: KGQuery): T[] {
  if (query.scope === 'tenant') return items.filter((i) => i.tenantId === query.tenantId);
  const allowed = new Set([query.tenantId, ...(query.federatedTenantIds ?? [])]);
  return items.filter((i) => allowed.has(i.tenantId));
}

function applyNodeFilters(nodes: KGNode[], query: KGQuery): KGNode[] {
  let filtered = nodes;
  if (query.nodeTypes?.length) filtered = filtered.filter((n) => query.nodeTypes?.includes(n.type));
  if (query.facilities?.length) filtered = filtered.filter((n) => n.facilityId && query.facilities?.includes(n.facilityId));
  if (query.tenants?.length) filtered = filtered.filter((n) => query.tenants?.includes(n.tenantId));
  if (query.tags?.length) filtered = filtered.filter((n) => n.tags?.some((t) => query.tags?.includes(t)));
  return filtered;
}

function buildNeighborhood(anchorId: string, ctx: SemanticQueryContext, query: KGQuery): { nodes: KGNode[]; edges: KGEdge[] } {
  const edgeFilter = query.relationships?.length ? { types: query.relationships } : undefined;
  const relevantEdges = neighbors(anchorId, ctx.index, edgeFilter);
  const nodeIds = new Set<string>([anchorId]);
  relevantEdges.forEach((e) => {
    nodeIds.add(e.from);
    nodeIds.add(e.to);
  });
  const nodes = ctx.nodes.filter((n) => nodeIds.has(n.id));
  return { nodes, edges: relevantEdges };
}

export function executeSemanticQuery(query: KGQuery, ctx: SemanticQueryContext): KGResult {
  const scopedNodes = filterByScope(ctx.nodes, query);
  const scopedEdges = filterByScope(ctx.edges, query);
  const filteredNodes = applyNodeFilters(scopedNodes, query);

  let resultNodes = filteredNodes;
  let resultEdges = scopedEdges.filter((e) => filteredNodes.some((n) => n.id === e.from || n.id === e.to));

  if (query.anchorId) {
    const neighborhood = buildNeighborhood(query.anchorId, ctx, query);
    resultNodes = applyNodeFilters(filterByScope(neighborhood.nodes, query), query);
    resultEdges = filterByScope(neighborhood.edges, query);
  }

  if (query.anchorId && query.maxDepth && query.maxDepth > 1 && query.relationships?.length === 1) {
    // Attempt a bounded path search for the same relationship type when both anchor and filters are present
    const pathEdges = boundedPath(query.anchorId, query.anchorId, ctx.index, query.maxDepth);
    if (pathEdges.length) resultEdges = [...new Set([...resultEdges, ...pathEdges])];
  }

  const limitedNodes = query.maxNodes ? resultNodes.slice(0, query.maxNodes) : resultNodes;
  const limitedEdges = query.maxNodes ? resultEdges.slice(0, query.maxNodes * 2) : resultEdges;

  logGraphEvent('query', 'Semantic query executed', {
    scope: query.scope,
    tenant: query.tenantId,
    federated: query.federatedTenantIds?.length ?? 0,
    nodeCount: limitedNodes.length,
    edgeCount: limitedEdges.length,
  });

  return {
    nodes: limitedNodes,
    edges: limitedEdges,
    scope: query.scope,
    context: { tenantId: query.tenantId, federatedTenantIds: query.federatedTenantIds, scope: query.scope },
    summary: `Returned ${limitedNodes.length} nodes and ${limitedEdges.length} edges under ${query.scope} scope`,
  };
}
