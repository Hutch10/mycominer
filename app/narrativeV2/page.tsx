import { NarrativeDashboard } from './components/NarrativeDashboard';
import { NarrativeReference, NarrativeRequest } from './narrativeTypes';

const references: NarrativeReference[] = [
  { id: 'forecast-alpha', type: 'forecast', tenantId: 'tenant-alpha', label: 'Forecast: Alpha Yield', link: '/forecasting/forecast-alpha' },
  { id: 'telemetry-fruit', type: 'telemetryStream', tenantId: 'tenant-alpha', label: 'Telemetry: Fruiting Room', link: '/telemetry/telemetry-fruit' },
  { id: 'sop-alpha-template', type: 'sop', tenantId: 'tenant-alpha', label: 'SOP: Sterile Prep', link: '/sop/sop-alpha-template' },
  { id: 'dev-alpha-1', type: 'deviation', tenantId: 'tenant-alpha', label: 'Deviation: Filter Delay', link: '/compliance/dev-alpha-1' },
  { id: 'capa-alpha-1', type: 'capa', tenantId: 'tenant-alpha', label: 'CAPA: Replace Filter', link: '/compliance/capa-alpha-1' },
  { id: 'wf-prep-fruit', type: 'workflow', tenantId: 'tenant-alpha', label: 'Workflow: Prep & Fruit', link: '/workflows/wf-prep-fruit' },
  { id: 'kg-node-wf-prep-fruit', type: 'KGNeighborhood', tenantId: 'tenant-alpha', label: 'KG: Prep & Fruit neighborhood', link: '/knowledgeGraph' },
  { id: 'search-sop-telemetry', type: 'searchResultSet', tenantId: 'tenant-alpha', label: 'Search results: SOP + telemetry', link: '/globalSearch' },
  { id: 'copilot-overtemp', type: 'copilotSuggestion', tenantId: 'tenant-alpha', label: 'Copilot suggestion: Over-temp', link: '/copilot' },
];

const initialRequest: NarrativeRequest = {
  requestId: 'nreq-1',
  createdAt: new Date().toISOString(),
  prompt: 'Explain this forecast and related telemetry',
  context: {
    tenantId: 'tenant-alpha',
    federatedTenantIds: ['tenant-beta'],
    target: 'forecast',
    targetId: 'forecast-alpha',
    facilityId: 'facility-01',
    scope: 'federated',
    tags: ['forecast', 'telemetry'],
    relatedIds: ['telemetry-fruit', 'sop-alpha-template'],
  },
};

export default function NarrativePage() {
  return <NarrativeDashboard initialRequest={initialRequest} references={references} />;
}
