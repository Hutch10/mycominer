import { KGQuery } from '../knowledgeGraph/knowledgeGraphTypes';
import { SearchQuery, SearchScope } from './globalSearchTypes';
import { logSearch } from './searchLog';

const typeKeywords: Record<string, string[]> = {
  workflow: ['workflow', 'run', 'process'],
  sop: ['sop', 'procedure'],
  facility: ['facility', 'site', 'campus'],
  room: ['room', 'space'],
  equipment: ['equipment', 'machine', 'autoclave'],
  complianceEvent: ['compliance', 'audit'],
  deviation: ['deviation', 'deviations'],
  capa: ['capa', 'corrective'],
  telemetryStream: ['telemetry', 'sensor', 'stream'],
  forecast: ['forecast', 'projection'],
  sandboxScenario: ['sandbox', 'what-if'],
  plugin: ['plugin', 'extension', 'marketplace'],
  digitalTwinSnapshot: ['digital twin', 'twin'],
  resource: ['resource', 'material'],
};

function detectTypes(text?: string): string[] {
  if (!text) return [];
  const lower = text.toLowerCase();
  return Object.entries(typeKeywords)
    .filter(([, keys]) => keys.some((k) => lower.includes(k)))
    .map(([type]) => type);
}

function normalizeScope(scope: SearchScope, tenantId: string, federatedTenantIds?: string[]): { scope: SearchScope; tenantId: string; federatedTenantIds?: string[] } {
  if (scope === 'tenant') return { scope, tenantId };
  const allowedFederated = federatedTenantIds?.length ? federatedTenantIds : [];
  return { scope, tenantId, federatedTenantIds: allowedFederated };
}

export interface ParsedQuery {
  search: SearchQuery;
  kgQueries: KGQuery[];
}

export function parseSearchQuery(input: SearchQuery): ParsedQuery {
  const scopeInfo = normalizeScope(input.scope, input.tenantId, input.federatedTenantIds);
  const inferredTypes = input.filters?.types?.length ? input.filters.types : detectTypes(input.text);

  const kgQuery: KGQuery = {
    scope: scopeInfo.scope,
    tenantId: scopeInfo.tenantId,
    federatedTenantIds: scopeInfo.federatedTenantIds,
    nodeTypes: inferredTypes.length ? (inferredTypes as any) : undefined,
    facilities: input.filters?.facilities,
    tenants: input.filters?.tenants,
    tags: input.filters?.tags,
    maxNodes: 120,
  };

  logSearch('query', 'Parsed search query', {
    scope: scopeInfo.scope,
    tenant: scopeInfo.tenantId,
    federated: scopeInfo.federatedTenantIds?.length ?? 0,
    text: input.text,
    inferredTypes,
  });

  return {
    search: { ...input, scope: scopeInfo.scope, federatedTenantIds: scopeInfo.federatedTenantIds },
    kgQueries: [kgQuery],
  };
}
