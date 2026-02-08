import { CopilotPlaybook } from './copilotTypes';
import { logCopilot } from './copilotSessionLog';

const playbooks: CopilotPlaybook[] = [
  {
    playbookId: 'pb-incident-room-overtemp',
    title: 'Incident Response: Room Over-Temperature',
    category: 'incident',
    severity: 'high',
    tenantId: 'tenant-alpha',
    facilityIds: ['facility-01'],
    tags: ['temperature', 'telemetry', 'safety'],
    summary: 'Guided checklist when a room exceeds temperature thresholds.',
    steps: [
      {
        id: 'step-1',
        title: 'Verify telemetry alert and threshold',
        references: [
          { stepId: 'telemetry-check', sourceType: 'playbook', sourceId: 'pb-incident-room-overtemp', description: 'Confirm telemetry stream and threshold breach', safetyNote: 'Do not enter hot room without PPE.' },
          { stepId: 'sop-alpha-telemetry-verify', sourceType: 'sop', sourceId: 'sop-alpha-template', description: 'Follow SOP section: Telemetry verification' },
        ],
      },
      {
        id: 'step-2',
        title: 'Stabilize environment per SOP',
        references: [
          { stepId: 'sop-alpha-stabilize', sourceType: 'sop', sourceId: 'sop-alpha-template', description: 'Adjust HVAC/airflow per SOP guidance', safetyNote: 'Avoid rapid temp swings to protect equipment.' },
        ],
      },
      {
        id: 'step-3',
        title: 'Log deviation and escalate',
        references: [
          { stepId: 'dev-alpha-1', sourceType: 'workflow', sourceId: 'wf-prep-fruit', description: 'Record deviation in compliance system' },
          { stepId: 'comp-alpha-1', sourceType: 'sop', sourceId: 'sop-alpha-template', description: 'Follow compliance notification steps' },
        ],
      },
    ],
  },
  {
    playbookId: 'pb-equipment-autoclave-down',
    title: 'Equipment Downtime: Autoclave',
    category: 'equipment',
    severity: 'medium',
    tenantId: 'tenant-alpha',
    facilityIds: ['facility-01'],
    tags: ['equipment', 'autoclave', 'maintenance'],
    summary: 'Steps to follow when autoclave is down.',
    steps: [
      {
        id: 'step-1',
        title: 'Switch to alternate autoclave or pause workflow',
        references: [
          { stepId: 'wf-prep-fruit-alt', sourceType: 'workflow', sourceId: 'wf-prep-fruit', description: 'Use alternate resource or pause run' },
        ],
      },
      {
        id: 'step-2',
        title: 'Initiate maintenance SOP',
        references: [
          { stepId: 'sop-alpha-maint', sourceType: 'sop', sourceId: 'sop-alpha-template', description: 'Maintenance and lockout/tagout procedures', safetyNote: 'Lockout/tagout before inspection.' },
        ],
      },
      {
        id: 'step-3',
        title: 'Log downtime in compliance',
        references: [
          { stepId: 'comp-alpha-1', sourceType: 'sop', sourceId: 'sop-alpha-template', description: 'Record downtime event' },
        ],
      },
    ],
  },
  {
    playbookId: 'pb-resource-shortage',
    title: 'Resource Shortage Response',
    category: 'resource',
    severity: 'medium',
    tenantId: 'tenant-alpha',
    tags: ['resource', 'supply'],
    summary: 'What to do when key media or inputs are low.',
    steps: [
      {
        id: 'step-1',
        title: 'Check inventory and substitutes',
        references: [
          { stepId: 'res-agar', sourceType: 'workflow', sourceId: 'wf-prep-fruit', description: 'Confirm resource quantities and substitutes' },
        ],
      },
      {
        id: 'step-2',
        title: 'Adjust workflow schedule',
        references: [
          { stepId: 'wf-prep-fruit', sourceType: 'workflow', sourceId: 'wf-prep-fruit', description: 'Reschedule non-critical runs' },
        ],
      },
    ],
  },
  {
    playbookId: 'pb-deviation-followup',
    title: 'Deviation Follow-up',
    category: 'deviation',
    severity: 'medium',
    tenantId: 'tenant-alpha',
    tags: ['deviation', 'compliance'],
    summary: 'Follow-up steps after a logged deviation.',
    steps: [
      {
        id: 'step-1',
        title: 'Review deviation record',
        references: [
          { stepId: 'dev-alpha-1', sourceType: 'workflow', sourceId: 'wf-prep-fruit', description: 'Open deviation record for details' },
        ],
      },
      {
        id: 'step-2',
        title: 'Apply CAPA actions',
        references: [
          { stepId: 'capa-alpha-1', sourceType: 'workflow', sourceId: 'wf-prep-fruit', description: 'Execute approved CAPA' },
        ],
      },
      {
        id: 'step-3',
        title: 'Document completion in compliance',
        references: [
          { stepId: 'comp-alpha-1', sourceType: 'sop', sourceId: 'sop-alpha-template', description: 'Update compliance record' },
        ],
      },
    ],
  },
  {
    playbookId: 'pb-maintenance-cleaning',
    title: 'Scheduled Cleaning Cycle',
    category: 'maintenance',
    severity: 'info',
    tenantId: 'tenant-alpha',
    tags: ['cleaning', 'maintenance'],
    summary: 'Routine cleaning checklist tied to SOP.',
    steps: [
      {
        id: 'step-1',
        title: 'Prepare room and PPE',
        references: [
          { stepId: 'sop-alpha-cleaning-prepare', sourceType: 'sop', sourceId: 'sop-alpha-template', description: 'Prep per cleaning SOP', safetyNote: 'Wear PPE per SOP.' },
        ],
      },
      {
        id: 'step-2',
        title: 'Execute cleaning steps',
        references: [
          { stepId: 'sop-alpha-cleaning-execute', sourceType: 'sop', sourceId: 'sop-alpha-template', description: 'Follow sequential cleaning steps' },
        ],
      },
      {
        id: 'step-3',
        title: 'Log completion',
        references: [
          { stepId: 'comp-alpha-1', sourceType: 'sop', sourceId: 'sop-alpha-template', description: 'Record cleaning completion' },
        ],
      },
    ],
  },
];

export function listPlaybooks(tenantId: string, federatedTenantIds?: string[]): CopilotPlaybook[] {
  const allowed = new Set([tenantId, ...(federatedTenantIds ?? [])]);
  return playbooks.filter((p) => allowed.has(p.tenantId));
}

export function getPlaybook(playbookId: string): CopilotPlaybook | undefined {
  return playbooks.find((p) => p.playbookId === playbookId);
}

export function findPlaybooksByTags(tags: string[], tenantId: string, federatedTenantIds?: string[]): CopilotPlaybook[] {
  const allowed = new Set([tenantId, ...(federatedTenantIds ?? [])]);
  const matched = playbooks.filter((p) => allowed.has(p.tenantId) && tags.some((tag) => p.tags?.includes(tag)));
  logCopilot('query', 'Playbooks filtered by tags', { tags, matched: matched.length });
  return matched;
}
