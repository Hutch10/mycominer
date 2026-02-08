import { GlobalSearchDashboard } from './components/GlobalSearchDashboard';
import { SearchQuery, SearchResultItem, SearchSource } from './globalSearchTypes';
import { GraphBuilderInput } from '../knowledgeGraph/graphBuilder';

const builderInput: GraphBuilderInput = {
  tenantId: 'tenant-alpha',
  federatedTenantIds: ['tenant-beta'],
  sources: {
    records: [
      { id: 'wf-prep-fruit', name: 'Prep & Fruit Workflow', type: 'workflow', tenantId: 'tenant-alpha', facilityId: 'facility-01', tags: ['fruiting', 'ops'], relatedIds: ['eq-autoclave-1', 'rm-clean-a'], sourceSystem: 'Workflow Engine', metadata: { phase: 19 } },
      { id: 'wf-beta-sterile', name: 'Beta Sterile Run', type: 'workflow', tenantId: 'tenant-beta', facilityId: 'facility-03', tags: ['sterile'], relatedIds: ['eq-beta-autoclave'], sourceSystem: 'Workflow Engine', metadata: { phase: 19 } },
      { id: 'res-agar', name: 'Agar Prep Resource', type: 'resource', tenantId: 'tenant-alpha', facilityId: 'facility-01', tags: ['media'], sourceSystem: 'Resource Engine', metadata: { phase: 20 } },
      { id: 'eq-autoclave-1', name: 'Autoclave North 1', type: 'equipment', tenantId: 'tenant-alpha', facilityId: 'facility-01', tags: ['sterilization'], sourceSystem: 'Resource Engine', metadata: { phase: 20 } },
      { id: 'eq-beta-autoclave', name: 'Autoclave South', type: 'equipment', tenantId: 'tenant-beta', facilityId: 'facility-03', tags: ['sterilization'], sourceSystem: 'Resource Engine', metadata: { phase: 20 } },
      { id: 'facility-01', name: 'North Campus Facility 01', type: 'facility', tenantId: 'tenant-alpha', tags: ['north'], sourceSystem: 'Multi-Facility Engine', metadata: { phase: 23 } },
      { id: 'facility-03', name: 'South Lab', type: 'facility', tenantId: 'tenant-beta', tags: ['south'], sourceSystem: 'Multi-Facility Engine', metadata: { phase: 23 } },
      { id: 'rm-clean-a', name: 'Clean Room A', type: 'room', tenantId: 'tenant-alpha', facilityId: 'facility-01', tags: ['iso7'], sourceSystem: 'Execution Engine', metadata: { phase: 21 } },
      { id: 'sop-alpha-template', name: 'SOP: Sterile Prep', type: 'sop', tenantId: 'tenant-alpha', facilityId: 'facility-01', tags: ['sterile'], sourceSystem: 'SOP Engine', metadata: { phase: 31 } },
      { id: 'sop-beta-template', name: 'SOP: Beta Clean', type: 'sop', tenantId: 'tenant-beta', facilityId: 'facility-03', tags: ['clean'], sourceSystem: 'SOP Engine', metadata: { phase: 31 } },
      { id: 'comp-alpha-1', name: 'Compliance Event Alpha', type: 'complianceEvent', tenantId: 'tenant-alpha', facilityId: 'facility-01', tags: ['audit'], sourceSystem: 'Compliance Engine', metadata: { phase: 32 } },
      { id: 'dev-alpha-1', name: 'Deviation: Filter Delay', type: 'deviation', tenantId: 'tenant-alpha', facilityId: 'facility-01', tags: ['delay'], sourceSystem: 'Compliance Engine', metadata: { phase: 32 } },
      { id: 'capa-alpha-1', name: 'CAPA: Replace Filter', type: 'capa', tenantId: 'tenant-alpha', facilityId: 'facility-01', tags: ['capa'], sourceSystem: 'Compliance Engine', metadata: { phase: 32 } },
      { id: 'telemetry-fruit', name: 'Telemetry: Fruiting Room', type: 'telemetryStream', tenantId: 'tenant-alpha', facilityId: 'facility-01', tags: ['humidity', 'temp'], sourceSystem: 'Telemetry Engine', metadata: { phase: 8 } },
      { id: 'forecast-alpha', name: 'Forecast: Alpha Yield', type: 'forecast', tenantId: 'tenant-alpha', facilityId: 'facility-01', tags: ['forecast'], sourceSystem: 'Forecasting Engine', metadata: { phase: 29 } },
      { id: 'sandbox-alpha', name: 'Sandbox Scenario Alpha', type: 'sandboxScenario', tenantId: 'tenant-alpha', facilityId: 'facility-01', tags: ['what-if'], sourceSystem: 'Sandbox Engine', metadata: { phase: 30 } },
      { id: 'plugin-market-insight', name: 'Marketplace Insight Plugin', type: 'plugin', tenantId: 'tenant-alpha', tags: ['marketplace'], sourceSystem: 'Marketplace', metadata: { phase: 27 } },
      { id: 'dt-alpha', name: 'Digital Twin Snapshot Alpha', type: 'digitalTwinSnapshot', tenantId: 'tenant-alpha', facilityId: 'facility-01', tags: ['twin'], sourceSystem: 'Digital Twin', metadata: { phase: 28 } },
      { id: 'telemetry-beta', name: 'Telemetry: Beta Room', type: 'telemetryStream', tenantId: 'tenant-beta', facilityId: 'facility-03', tags: ['humidity'], sourceSystem: 'Telemetry Engine', metadata: { phase: 8 } },
      { id: 'forecast-beta', name: 'Forecast: Beta', type: 'forecast', tenantId: 'tenant-beta', facilityId: 'facility-03', tags: ['forecast'], sourceSystem: 'Forecasting Engine', metadata: { phase: 29 } },
      { id: 'sandbox-beta', name: 'Sandbox Scenario Beta', type: 'sandboxScenario', tenantId: 'tenant-beta', facilityId: 'facility-03', tags: ['what-if'], sourceSystem: 'Sandbox Engine', metadata: { phase: 30 } },
      { id: 'plugin-quality-check', name: 'Marketplace Quality Plugin', type: 'plugin', tenantId: 'tenant-beta', tags: ['marketplace'], sourceSystem: 'Marketplace', metadata: { phase: 27 } },
      { id: 'dt-beta', name: 'Digital Twin Snapshot Beta', type: 'digitalTwinSnapshot', tenantId: 'tenant-beta', facilityId: 'facility-03', tags: ['twin'], sourceSystem: 'Digital Twin', metadata: { phase: 28 } },
    ],
    edges: [
      { from: 'wf-prep-fruit', to: 'facility-01', type: 'locatedIn', tenantId: 'tenant-alpha', label: 'Executes in facility' },
      { from: 'wf-prep-fruit', to: 'rm-clean-a', type: 'locatedIn', tenantId: 'tenant-alpha', label: 'Runs in room' },
      { from: 'wf-prep-fruit', to: 'eq-autoclave-1', type: 'usesResource', tenantId: 'tenant-alpha', label: 'Sterilizes with' },
      { from: 'wf-prep-fruit', to: 'res-agar', type: 'dependsOn', tenantId: 'tenant-alpha', label: 'Needs resource' },
      { from: 'wf-prep-fruit', to: 'sop-alpha-template', type: 'implements', tenantId: 'tenant-alpha', label: 'Guided by SOP' },
      { from: 'wf-prep-fruit', to: 'telemetry-fruit', type: 'observes', tenantId: 'tenant-alpha', label: 'Reads telemetry' },
      { from: 'wf-prep-fruit', to: 'comp-alpha-1', type: 'covers', tenantId: 'tenant-alpha', label: 'Compliance coverage' },
      { from: 'dev-alpha-1', to: 'wf-prep-fruit', type: 'relatesTo', tenantId: 'tenant-alpha', label: 'Deviation linked' },
      { from: 'capa-alpha-1', to: 'dev-alpha-1', type: 'resolves', tenantId: 'tenant-alpha', label: 'CAPA resolves' },
      { from: 'telemetry-fruit', to: 'forecast-alpha', type: 'feeds', tenantId: 'tenant-alpha', label: 'Feeds forecast' },
      { from: 'sandbox-alpha', to: 'wf-prep-fruit', type: 'simulatedBy', tenantId: 'tenant-alpha', label: 'Sandbox scenario' },
      { from: 'plugin-market-insight', to: 'wf-prep-fruit', type: 'providedBy', tenantId: 'tenant-alpha', label: 'Marketplace plugin' },
      { from: 'dt-alpha', to: 'wf-prep-fruit', type: 'mirrors', tenantId: 'tenant-alpha', label: 'Digital twin snapshot' },

      { from: 'wf-beta-sterile', to: 'facility-03', type: 'locatedIn', tenantId: 'tenant-beta', label: 'Executes in facility' },
      { from: 'wf-beta-sterile', to: 'eq-beta-autoclave', type: 'usesResource', tenantId: 'tenant-beta', label: 'Sterilizes with' },
      { from: 'wf-beta-sterile', to: 'sop-beta-template', type: 'implements', tenantId: 'tenant-beta', label: 'Guided by SOP' },
      { from: 'telemetry-beta', to: 'forecast-beta', type: 'feeds', tenantId: 'tenant-beta', label: 'Feeds forecast' },
      { from: 'sandbox-beta', to: 'wf-beta-sterile', type: 'simulatedBy', tenantId: 'tenant-beta', label: 'Sandbox scenario' },
      { from: 'plugin-quality-check', to: 'wf-beta-sterile', type: 'providedBy', tenantId: 'tenant-beta', label: 'Marketplace plugin' },
      { from: 'dt-beta', to: 'wf-beta-sterile', type: 'mirrors', tenantId: 'tenant-beta', label: 'Digital twin snapshot' },

      { from: 'sop-alpha-template', to: 'wf-beta-sterile', type: 'federatedShare', tenantId: 'tenant-alpha', label: 'Read-only SOP share' },
    ],
  },
};

const sourceData: Record<SearchSource, SearchResultItem[]> = {
  knowledgeGraph: [],
  workflows: [
    { id: 'wf-prep-fruit', name: 'Prep & Fruit Workflow', type: 'workflow', tenantId: 'tenant-alpha', facilityId: 'facility-01', source: 'workflows', tags: ['fruiting'], reason: 'Workflow registry', link: '/workflows/wf-prep-fruit' },
    { id: 'wf-beta-sterile', name: 'Beta Sterile Run', type: 'workflow', tenantId: 'tenant-beta', facilityId: 'facility-03', source: 'workflows', tags: ['sterile'], reason: 'Workflow registry', link: '/workflows/wf-beta-sterile' },
  ],
  resources: [
    { id: 'res-agar', name: 'Agar Prep Resource', type: 'resource', tenantId: 'tenant-alpha', facilityId: 'facility-01', source: 'resources', tags: ['media'], reason: 'Resource catalog', link: '/resources/res-agar' },
  ],
  execution: [
    { id: 'rm-clean-a', name: 'Clean Room A', type: 'room', tenantId: 'tenant-alpha', facilityId: 'facility-01', source: 'execution', tags: ['iso7'], reason: 'Execution engine', link: '/execution/rooms/rm-clean-a' },
  ],
  telemetry: [
    { id: 'telemetry-fruit', name: 'Telemetry: Fruiting Room', type: 'telemetryStream', tenantId: 'tenant-alpha', facilityId: 'facility-01', source: 'telemetry', tags: ['humidity', 'temp'], reason: 'Telemetry registry', link: '/telemetry/telemetry-fruit' },
    { id: 'telemetry-beta', name: 'Telemetry: Beta Room', type: 'telemetryStream', tenantId: 'tenant-beta', facilityId: 'facility-03', source: 'telemetry', tags: ['humidity'], reason: 'Telemetry registry', link: '/telemetry/telemetry-beta' },
  ],
  forecasting: [
    { id: 'forecast-alpha', name: 'Forecast: Alpha Yield', type: 'forecast', tenantId: 'tenant-alpha', facilityId: 'facility-01', source: 'forecasting', tags: ['forecast'], reason: 'Forecasting engine', link: '/forecasting/forecast-alpha' },
    { id: 'forecast-beta', name: 'Forecast: Beta', type: 'forecast', tenantId: 'tenant-beta', facilityId: 'facility-03', source: 'forecasting', tags: ['forecast'], reason: 'Forecasting engine', link: '/forecasting/forecast-beta' },
  ],
  sandbox: [
    { id: 'sandbox-alpha', name: 'Sandbox Scenario Alpha', type: 'sandboxScenario', tenantId: 'tenant-alpha', facilityId: 'facility-01', source: 'sandbox', tags: ['what-if'], reason: 'Sandbox scenarios', link: '/sandbox/sandbox-alpha' },
    { id: 'sandbox-beta', name: 'Sandbox Scenario Beta', type: 'sandboxScenario', tenantId: 'tenant-beta', facilityId: 'facility-03', source: 'sandbox', tags: ['what-if'], reason: 'Sandbox scenarios', link: '/sandbox/sandbox-beta' },
  ],
  sop: [
    { id: 'sop-alpha-template', name: 'SOP: Sterile Prep', type: 'sop', tenantId: 'tenant-alpha', facilityId: 'facility-01', source: 'sop', tags: ['sterile'], reason: 'SOP engine', link: '/sop/sop-alpha-template' },
    { id: 'sop-beta-template', name: 'SOP: Beta Clean', type: 'sop', tenantId: 'tenant-beta', facilityId: 'facility-03', source: 'sop', tags: ['clean'], reason: 'SOP engine', link: '/sop/sop-beta-template' },
  ],
  compliance: [
    { id: 'comp-alpha-1', name: 'Compliance Event Alpha', type: 'complianceEvent', tenantId: 'tenant-alpha', facilityId: 'facility-01', source: 'compliance', tags: ['audit'], reason: 'Compliance events', link: '/compliance/comp-alpha-1' },
    { id: 'dev-alpha-1', name: 'Deviation: Filter Delay', type: 'deviation', tenantId: 'tenant-alpha', facilityId: 'facility-01', source: 'compliance', tags: ['delay'], reason: 'Deviation log', link: '/compliance/dev-alpha-1' },
    { id: 'capa-alpha-1', name: 'CAPA: Replace Filter', type: 'capa', tenantId: 'tenant-alpha', facilityId: 'facility-01', source: 'compliance', tags: ['capa'], reason: 'CAPA record', link: '/compliance/capa-alpha-1' },
  ],
  marketplace: [
    { id: 'plugin-market-insight', name: 'Marketplace Insight Plugin', type: 'plugin', tenantId: 'tenant-alpha', source: 'marketplace', tags: ['marketplace'], reason: 'Marketplace listing', link: '/marketplace/plugin-market-insight' },
    { id: 'plugin-quality-check', name: 'Marketplace Quality Plugin', type: 'plugin', tenantId: 'tenant-beta', source: 'marketplace', tags: ['marketplace'], reason: 'Marketplace listing', link: '/marketplace/plugin-quality-check' },
  ],
  digitalTwin: [
    { id: 'dt-alpha', name: 'Digital Twin Snapshot Alpha', type: 'digitalTwinSnapshot', tenantId: 'tenant-alpha', facilityId: 'facility-01', source: 'digitalTwin', tags: ['twin'], reason: 'Digital twin snapshot', link: '/digitalTwin/dt-alpha' },
    { id: 'dt-beta', name: 'Digital Twin Snapshot Beta', type: 'digitalTwinSnapshot', tenantId: 'tenant-beta', facilityId: 'facility-03', source: 'digitalTwin', tags: ['twin'], reason: 'Digital twin snapshot', link: '/digitalTwin/dt-beta' },
  ],
};

const initialSearch: SearchQuery = {
  text: 'SOPs and telemetry in North Campus',
  scope: 'federated',
  tenantId: 'tenant-alpha',
  federatedTenantIds: ['tenant-beta'],
  filters: { types: ['sop', 'telemetryStream'] },
};

export default function GlobalSearchPage() {
  return <GlobalSearchDashboard builderInput={builderInput} searchQuery={initialSearch} sourceData={sourceData} />;
}
