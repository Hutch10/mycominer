import { parseSearchQuery } from './queryParser';
import { aggregateResults } from './resultAggregator';
import { SearchQuery, SearchResultItem, SearchResultSet, SearchSource } from './globalSearchTypes';
import { logSearch } from './searchLog';
import { KnowledgeGraphState, initializeKnowledgeGraph, runKnowledgeGraphQuery } from '../knowledgeGraph/knowledgeGraphEngine';
import { GraphBuilderInput } from '../knowledgeGraph/graphBuilder';

export interface GlobalSearchInput {
  builderInput: GraphBuilderInput;
  searchQuery: SearchQuery;
  sourceData: Record<SearchSource, SearchResultItem[]>;
}

export interface GlobalSearchState {
  kg: KnowledgeGraphState;
  lastResult: SearchResultSet;
}

function scopeFilter(items: SearchResultItem[], tenantId: string, federatedTenantIds?: string[]): SearchResultItem[] {
  const allowed = new Set([tenantId, ...(federatedTenantIds ?? [])]);
  return items.map((item) => ({ ...item, federated: item.tenantId !== tenantId })).filter((item) => allowed.has(item.tenantId));
}

export function runGlobalSearch(input: GlobalSearchInput): GlobalSearchState {
  const parsed = parseSearchQuery(input.searchQuery);
  const kgState = initializeKnowledgeGraph(input.builderInput);

  const kgResults = parsed.kgQueries.flatMap((kgq) => {
    const res = runKnowledgeGraphQuery(kgState, kgq);
    return [
      ...res.nodes.map((n) => ({
        id: n.id,
        name: n.name,
        type: n.type,
        tenantId: n.tenantId,
        facilityId: n.facilityId,
        source: 'knowledgeGraph' as SearchSource,
        federated: kgq.scope === 'federated' && kgq.tenantId !== n.tenantId,
        reason: 'Matched KG query',
        tags: n.tags,
        metadata: n.metadata,
      })),
    ];
  });

  const scopedSources = Object.entries(input.sourceData).flatMap(([sourceKey, items]) => {
    const typedItems = scopeFilter(items, parsed.search.tenantId, parsed.search.federatedTenantIds);
    return typedItems.map((item) => ({ ...item, source: sourceKey as SearchSource }));
  });

  const combined = [...kgResults, ...scopedSources];
  const result = aggregateResults({
    scope: parsed.search.scope,
    tenantId: parsed.search.tenantId,
    federatedTenantIds: parsed.search.federatedTenantIds,
    items: combined,
  });

  logSearch('query', 'Global search executed', {
    scope: parsed.search.scope,
    tenant: parsed.search.tenantId,
    federated: parsed.search.federatedTenantIds?.length ?? 0,
    total: result.total,
  });

  return { kg: kgState, lastResult: result };
}
