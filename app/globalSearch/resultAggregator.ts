import { SearchResultItem, SearchResultSet, SearchScope } from './globalSearchTypes';
import { logSearch } from './searchLog';

export interface AggregationInput {
  scope: SearchScope;
  tenantId: string;
  federatedTenantIds?: string[];
  items: SearchResultItem[];
}

function isTenantAllowed(item: SearchResultItem, tenantId: string, federatedTenantIds?: string[]): boolean {
  if (item.tenantId === tenantId) return true;
  return federatedTenantIds?.includes(item.tenantId) === true;
}

function deterministicScore(item: SearchResultItem): number {
  // Deterministic relevance: base on type specificity and tag count
  const typeWeight = item.type ? 2 : 0;
  const tagWeight = item.tags?.length ? Math.min(item.tags.length, 3) : 0;
  return typeWeight + tagWeight;
}

export function aggregateResults(input: AggregationInput): SearchResultSet {
  const allowedItems = input.items.filter((item) => isTenantAllowed(item, input.tenantId, input.federatedTenantIds));

  const groupsMap = new Map<string, SearchResultItem[]>();
  allowedItems.forEach((item) => {
    const key = item.type;
    const list = groupsMap.get(key) ?? [];
    groupsMap.set(key, [...list, item]);
  });

  const groups = Array.from(groupsMap.entries()).map(([label, items]) => ({
    label,
    items: items.sort((a, b) => deterministicScore(b) - deterministicScore(a)),
  }));

  const flat = [...allowedItems].sort((a, b) => deterministicScore(b) - deterministicScore(a));

  logSearch('aggregation', 'Aggregated search results', {
    scope: input.scope,
    tenant: input.tenantId,
    federated: input.federatedTenantIds?.length ?? 0,
    total: flat.length,
  });

  return {
    scope: input.scope,
    tenantId: input.tenantId,
    federatedTenantIds: input.federatedTenantIds,
    total: flat.length,
    groups,
    flat,
    summary: `Grouped ${flat.length} items across ${groups.length} types under ${input.scope} scope`,
  };
}
