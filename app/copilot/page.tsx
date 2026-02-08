import { CopilotDashboard } from './components/CopilotDashboard';
import { CopilotQuery } from './copilotTypes';

const initialQuery: CopilotQuery = {
  text: 'What should I check if Room A is over temperature?',
  scope: 'federated',
  context: {
    tenantId: 'tenant-alpha',
    federatedTenantIds: ['tenant-beta'],
    facilityId: 'facility-01',
    roomId: 'rm-clean-a',
    telemetryStreamId: 'telemetry-fruit',
    sopId: 'sop-alpha-template',
    tags: ['temperature', 'telemetry'],
  },
};

export default function CopilotPage() {
  return <CopilotDashboard initialQuery={initialQuery} />;
}
