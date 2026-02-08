// Phase 35: Global Search & Natural-Language Query Layer types
// Deterministic, read-only search over knowledge graph and core engines

export type SearchScope = 'tenant' | 'federated';

export type SearchSource =
  | 'knowledgeGraph'
  | 'workflows'
  | 'resources'
  | 'execution'
  | 'telemetry'
  | 'forecasting'
  | 'sandbox'
  | 'sop'
  | 'compliance'
  | 'marketplace'
  | 'digitalTwin';

export interface SearchFilter {
  types?: string[];
  facilities?: string[];
  tenants?: string[];
  tags?: string[];
  sources?: SearchSource[];
}

export interface SearchQuery {
  text?: string;
  scope: SearchScope;
  tenantId: string;
  federatedTenantIds?: string[];
  filters?: SearchFilter;
}

export interface SearchResultItem {
  id: string;
  name: string;
  type: string;
  tenantId: string;
  facilityId?: string;
  source: SearchSource;
  federated?: boolean;
  reason?: string;
  link?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface SearchResultGroup {
  label: string;
  items: SearchResultItem[];
}

export interface SearchResultSet {
  scope: SearchScope;
  tenantId: string;
  federatedTenantIds?: string[];
  total: number;
  groups: SearchResultGroup[];
  flat: SearchResultItem[];
  summary: string;
}

export type SearchLogCategory = 'query' | 'access' | 'aggregation';

export interface SearchLogEntry {
  entryId: string;
  timestamp: string;
  category: SearchLogCategory;
  message: string;
  context?: Record<string, unknown>;
}
