// Phase 40: Operator Training Mode & Scenario Walkthroughs
// trainingScenarioLibrary.ts
// Deterministic training scenarios and modules with real references

import { TrainingScenario, TrainingModule, TrainingStep, TrainingScenarioSource, TrainingDifficulty } from './trainingTypes';

let scenarioLibrary: TrainingScenario[] = [];
let moduleLibrary: TrainingModule[] = [];

// Predefined training scenarios
export function initializeScenarioLibrary(tenantId: string): void {
  const scenarios: TrainingScenario[] = [
    {
      scenarioId: 'scenario-env-exception-response',
      name: 'Environmental Exception Response',
      description: 'Learn how to respond to environmental threshold breaches (temperature, humidity, pressure) with proper deviation logging and CAPA follow-up.',
      source: 'incident-thread',
      difficulty: 'beginner',
      estimatedDurationMinutes: 15,
      learningObjectives: [
        'Identify environmental exceptions from telemetry alerts',
        'Log deviation with proper documentation',
        'Reference appropriate SOP for stabilization',
        'Initiate CAPA action',
        'Verify stabilization and close incident',
      ],
      prerequisites: ['Basic facility operations knowledge'],
      tags: ['environmental', 'deviation', 'capa', 'temperature', 'incident-response'],
      tenantId,
      sourceIncidentId: 'incident-2026-01-20-facility-01',
      sourceSOPId: 'sop-alpha-template',
      createdAt: new Date().toISOString(),
    },
    {
      scenarioId: 'scenario-sop-walkthrough',
      name: 'SOP Execution Walkthrough',
      description: 'Step-by-step walkthrough of a standard operating procedure for substrate preparation and inoculation.',
      source: 'sop-walkthrough',
      difficulty: 'beginner',
      estimatedDurationMinutes: 20,
      learningObjectives: [
        'Understand SOP structure and sections',
        'Follow safety protocols',
        'Execute procedure steps in sequence',
        'Document execution',
        'Verify completion criteria',
      ],
      prerequisites: ['Completed facility orientation'],
      tags: ['sop', 'procedure', 'substrate', 'inoculation', 'safety'],
      tenantId,
      sourceSOPId: 'sop-alpha-template',
      createdAt: new Date().toISOString(),
    },
    {
      scenarioId: 'scenario-deviation-capa',
      name: 'Deviation Follow-Up and CAPA Review',
      description: 'Learn the deviation lifecycle from detection through CAPA completion and compliance verification.',
      source: 'deviation-capa',
      difficulty: 'intermediate',
      estimatedDurationMinutes: 25,
      learningObjectives: [
        'Recognize deviation triggers',
        'Log deviation with root cause analysis',
        'Design corrective action (CAPA)',
        'Implement and verify CAPA',
        'Generate compliance summary',
      ],
      prerequisites: ['Basic compliance knowledge', 'Environmental Exception Response'],
      tags: ['deviation', 'capa', 'compliance', 'root-cause', 'corrective-action'],
      tenantId,
      createdAt: new Date().toISOString(),
    },
    {
      scenarioId: 'scenario-sandbox-interpretation',
      name: 'Sandbox Scenario Interpretation',
      description: 'Learn to interpret sandbox simulation results and translate them into operational decisions.',
      source: 'sandbox-scenario',
      difficulty: 'intermediate',
      estimatedDurationMinutes: 30,
      learningObjectives: [
        'Understand sandbox constraints and parameters',
        'Interpret projected outcomes',
        'Compare scenarios',
        'Identify operational risks',
        'Make data-informed decisions',
      ],
      prerequisites: ['Basic workflow knowledge', 'Forecasting basics'],
      tags: ['sandbox', 'scenario', 'simulation', 'decision-making', 'risk-assessment'],
      tenantId,
      sourceSandboxId: 'sandbox-alpha',
      createdAt: new Date().toISOString(),
    },
    {
      scenarioId: 'scenario-forecast-interpretation',
      name: 'Forecast Interpretation Basics',
      description: 'Learn to read and interpret deterministic yield forecasts and understand their limitations.',
      source: 'forecast-interpretation',
      difficulty: 'beginner',
      estimatedDurationMinutes: 15,
      learningObjectives: [
        'Read forecast projections',
        'Understand forecast constraints',
        'Recognize forecast boundaries (no predictions)',
        'Use forecasts for planning',
        'Integrate with operational schedules',
      ],
      prerequisites: ['Basic facility operations'],
      tags: ['forecast', 'planning', 'yield', 'deterministic', 'projection'],
      tenantId,
      createdAt: new Date().toISOString(),
    },
    {
      scenarioId: 'scenario-workflow-execution',
      name: 'Workflow Execution Training',
      description: 'Learn to execute multi-step workflows with resource allocation, telemetry monitoring, and exception handling.',
      source: 'workflow-execution',
      difficulty: 'intermediate',
      estimatedDurationMinutes: 35,
      learningObjectives: [
        'Review workflow prerequisites',
        'Execute steps in sequence',
        'Monitor telemetry during execution',
        'Handle exceptions and delays',
        'Verify completion criteria',
      ],
      prerequisites: ['SOP Execution Walkthrough'],
      tags: ['workflow', 'execution', 'resources', 'telemetry', 'exceptions'],
      tenantId,
      sourceWorkflowId: 'wf-prep-fruit',
      createdAt: new Date().toISOString(),
    },
  ];

  scenarioLibrary = scenarios;
}

export function registerModule(module: TrainingModule): void {
  const existing = moduleLibrary.find((m) => m.moduleId === module.moduleId);
  if (!existing) {
    moduleLibrary.push(module);
  }
}

export function buildModuleFromScenario(scenario: TrainingScenario): TrainingModule {
  const steps: TrainingStep[] = [];

  // Build steps based on scenario source
  if (scenario.source === 'incident-thread') {
    steps.push(
      {
        stepId: `${scenario.scenarioId}-step-1`,
        stepNumber: 1,
        type: 'context-review',
        title: 'Incident Context Review',
        description: 'Review the timeline of the environmental exception incident',
        content: `This training module is based on a real incident: ${scenario.sourceIncidentId}.
        
Review the incident timeline:
- Environmental exception detected (temperature spike to 28.5°C)
- Telemetry alert triggered
- Operator notification

Your objective: Understand the incident context before proceeding to response steps.`,
        references: {
          incidentIds: scenario.sourceIncidentId ? [scenario.sourceIncidentId] : [],
        },
        rationale: 'Understanding the full context before responding ensures appropriate action.',
      },
      {
        stepId: `${scenario.scenarioId}-step-2`,
        stepNumber: 2,
        type: 'safety-check',
        title: 'Safety Assessment',
        description: 'Verify facility and personnel safety before proceeding',
        content: `Safety Check:
1. Verify no personnel are in the affected room
2. Check HVAC system status
3. Review any active alarms
4. Ensure PPE is available if room entry required

Safety Notes:
- Do not enter the room until temperature is confirmed below 26°C
- Alert supervisor if multiple rooms are affected
- Emergency stop procedures available at all times`,
        safetyNotes: [
          'Do not enter room above 26°C',
          'Alert supervisor if escalation needed',
          'Emergency stop available',
        ],
        checklistItems: ['Personnel clear', 'HVAC status checked', 'Alarms reviewed', 'PPE ready'],
      },
      {
        stepId: `${scenario.scenarioId}-step-3`,
        stepNumber: 3,
        type: 'action-required',
        title: 'Log Deviation',
        description: 'Create deviation record for environmental threshold breach',
        content: `Action Required: Log Deviation

Navigate to Compliance Engine and create a new deviation:
- Type: Environmental Threshold Breach
- Severity: High
- Facility: ${scenario.facilityId || 'facility-01'}
- Description: Temperature exceeded threshold (28.5°C detected)
- Root Cause: Under investigation (preliminary: HVAC filter clogged)

Reference SOP: ${scenario.sourceSOPId || 'sop-alpha-template'}`,
        references: {
          sopIds: scenario.sourceSOPId ? [scenario.sourceSOPId] : [],
        },
        expectedOutcome: 'Deviation logged with unique ID (e.g., dev-alpha-1)',
        hints: ['Use Compliance Engine deviation logging interface', 'Include all telemetry readings'],
      },
      {
        stepId: `${scenario.scenarioId}-step-4`,
        stepNumber: 4,
        type: 'reference-lookup',
        title: 'Reference Emergency Stabilization SOP',
        description: 'Look up and review emergency HVAC stabilization procedure',
        content: `Reference SOP: Emergency HVAC Stabilization (${scenario.sourceSOPId})

Key steps from SOP:
1. Isolate affected room
2. Increase HVAC airflow temporarily
3. Monitor temperature every 5 minutes
4. Once stabilized, inspect HVAC filter
5. Replace filter if clogged
6. Verify normal operation

Proceed to next step once you've reviewed the SOP.`,
        references: {
          sopIds: scenario.sourceSOPId ? [scenario.sourceSOPId] : [],
        },
      },
      {
        stepId: `${scenario.scenarioId}-step-5`,
        stepNumber: 5,
        type: 'action-required',
        title: 'Initiate CAPA Action',
        description: 'Create corrective action to prevent recurrence',
        content: `Action Required: Initiate CAPA

Create CAPA record:
- Linked to: Deviation logged in Step 3
- Action: Replace HVAC filter
- Responsible: Facilities team
- Target completion: Within 24 hours
- Verification: Temperature monitoring for 48 hours post-fix

CAPA ID will be generated (e.g., capa-alpha-1)`,
        references: {
          deviationIds: ['dev-alpha-1'],
        },
        expectedOutcome: 'CAPA created and assigned',
      },
      {
        stepId: `${scenario.scenarioId}-step-6`,
        stepNumber: 6,
        type: 'verification',
        title: 'Verify Stabilization',
        description: 'Confirm environmental parameters have returned to normal',
        content: `Verification:

Check telemetry readings:
- Current temperature: Should be ≤ 23.5°C
- HVAC airflow: Should be nominal
- No active alarms

If verified:
- Update incident thread with stabilization confirmation
- Close incident
- Schedule follow-up review in 48 hours

Training complete when stabilization is confirmed.`,
        checklistItems: [
          'Temperature within normal range',
          'HVAC functioning normally',
          'No active alarms',
          'Incident thread updated',
        ],
        expectedOutcome: 'Incident closed, stabilization confirmed',
      }
    );
  } else if (scenario.source === 'sop-walkthrough') {
    steps.push(
      {
        stepId: `${scenario.scenarioId}-step-1`,
        stepNumber: 1,
        type: 'context-review',
        title: 'SOP Overview',
        description: 'Review SOP structure and purpose',
        content: `SOP: ${scenario.sourceSOPId}

Structure:
- Title and version
- Purpose and scope
- Prerequisites
- Safety protocols
- Step-by-step procedure
- Verification criteria
- References

This walkthrough will guide you through executing this SOP step-by-step.`,
        references: {
          sopIds: scenario.sourceSOPId ? [scenario.sourceSOPId] : [],
        },
      },
      {
        stepId: `${scenario.scenarioId}-step-2`,
        stepNumber: 2,
        type: 'safety-check',
        title: 'Review Safety Protocols',
        description: 'Understand all safety requirements before beginning',
        content: `Safety Protocols:

1. PPE Required:
   - Gloves (nitrile)
   - Lab coat
   - Safety glasses
   - Face mask

2. Environmental Requirements:
   - Clean room conditions
   - Temperature: 20-24°C
   - Humidity: 60-70%

3. Emergency Procedures:
   - Spill response kit location
   - Emergency contacts
   - Evacuation routes

Confirm all safety requirements before proceeding.`,
        safetyNotes: ['PPE mandatory', 'Clean room required', 'Emergency kit accessible'],
        checklistItems: ['PPE donned', 'Environment verified', 'Emergency procedures reviewed'],
      },
      // Additional steps would continue...
      {
        stepId: `${scenario.scenarioId}-step-3`,
        stepNumber: 3,
        type: 'action-required',
        title: 'Execute Procedure Steps',
        description: 'Follow SOP procedure in sequence',
        content: `Execute SOP steps as documented:

This is a simplified training walkthrough. In real execution, you would follow each detailed step in the SOP.

Key principle: Never skip steps or deviate from procedure without supervisor approval.`,
        references: {
          sopIds: scenario.sourceSOPId ? [scenario.sourceSOPId] : [],
        },
      }
    );
  } else {
    // Default generic steps for other scenario types
    steps.push({
      stepId: `${scenario.scenarioId}-step-1`,
      stepNumber: 1,
      type: 'information',
      title: 'Scenario Introduction',
      description: scenario.description,
      content: `Learning Objectives:\n${scenario.learningObjectives.map((obj, i) => `${i + 1}. ${obj}`).join('\n')}`,
    });
  }

  const module: TrainingModule = {
    moduleId: `module-${scenario.scenarioId}`,
    scenario,
    steps,
    totalSteps: steps.length,
    metadata: {
      version: '1.0',
      lastUpdated: new Date().toISOString(),
      approvalStatus: 'approved',
    },
    summary: `${scenario.name}: ${scenario.description}`,
    completionCriteria: ['View all steps', 'Complete all action items', 'Pass verification checks'],
  };

  return module;
}

export function getScenarioLibrary(): TrainingScenario[] {
  return [...scenarioLibrary];
}

export function getScenariosByTenant(tenantId: string): TrainingScenario[] {
  return scenarioLibrary.filter((s) => s.tenantId === tenantId);
}

export function getScenariosBySource(source: TrainingScenarioSource): TrainingScenario[] {
  return scenarioLibrary.filter((s) => s.source === source);
}

export function getScenariosByDifficulty(difficulty: TrainingDifficulty): TrainingScenario[] {
  return scenarioLibrary.filter((s) => s.difficulty === difficulty);
}

export function searchScenarios(query: string): TrainingScenario[] {
  return scenarioLibrary.filter(
    (s) =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.description.toLowerCase().includes(query.toLowerCase()) ||
      s.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()))
  );
}

export function getModuleLibrary(): TrainingModule[] {
  return [...moduleLibrary];
}

export function getModuleById(moduleId: string): TrainingModule | null {
  return moduleLibrary.find((m) => m.moduleId === moduleId) || null;
}

export function clearScenarioLibrary(): void {
  scenarioLibrary = [];
  moduleLibrary = [];
}
