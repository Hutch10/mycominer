import { SOPDocument, SOPSafetyNote, SOPResourceRequirement } from './sopTypes';
import { buildWorkflowTemplate } from './sopTemplateLibrary';
import { addSopLog } from './sopLog';

export interface WorkflowData {
  workflowId: string;
  name: string;
  steps: Array<{ id: string; title: string; description: string; durationMinutes?: number }>;
  resources: SOPResourceRequirement[];
  safety: SOPSafetyNote[];
  timingNotes?: string;
}

export interface AssemblerInput {
  workflow: WorkflowData;
  category: SOPDocument['category'];
}

export function assembleSOP(input: AssemblerInput): SOPDocument {
  const doc = buildWorkflowTemplate({
    title: `${input.workflow.name} SOP`,
    category: input.category,
    workflowName: input.workflow.name,
    steps: input.workflow.steps,
    resources: input.workflow.resources,
    safetyNotes: input.workflow.safety,
    timingNotes: input.workflow.timingNotes,
  });

  addSopLog({ category: 'generation', message: `SOP generated for ${input.workflow.name}`, context: { sopId: doc.sopId } });
  return doc;
}
