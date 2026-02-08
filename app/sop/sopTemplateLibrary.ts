import { SOPDocument, SOPSection, SOPStep, SOPSafetyNote, SOPResourceRequirement } from './sopTypes';

export interface TemplateContext {
  title: string;
  category: SOPDocument['category'];
  workflowName?: string;
  steps: Array<{ id: string; title: string; description: string; durationMinutes?: number }>;
  resources: SOPResourceRequirement[];
  safetyNotes: SOPSafetyNote[];
  timingNotes?: string;
}

export function buildWorkflowTemplate(ctx: TemplateContext): SOPDocument {
  const sections: SOPSection[] = [
    {
      sectionId: 'overview',
      title: 'Overview',
      summary: ctx.timingNotes ?? 'Deterministic SOP derived from workflow timing and resources.',
      steps: [],
    },
    {
      sectionId: 'steps',
      title: 'Procedure',
      steps: ctx.steps.map((s) => stepFromContext(s, ctx.safetyNotes, ctx.resources)),
    },
    {
      sectionId: 'safety',
      title: 'Safety Notes',
      steps: ctx.safetyNotes.map((note) => safetyStep(note)),
    },
  ];

  return {
    sopId: `sop-${Date.now()}`,
    title: ctx.title,
    category: ctx.category,
    description: `Generated from workflow ${ctx.workflowName ?? 'N/A'} using existing operational data.`,
    sections,
    resources: ctx.resources,
    safety: ctx.safetyNotes,
    timingNotes: ctx.timingNotes,
    version: {
      versionId: `v1-${Date.now()}`,
      createdAt: new Date().toISOString(),
      author: 'system',
      lifecycle: 'draft',
      changeSummary: { summary: 'Initial deterministic generation', highlights: [] },
    },
    baselineWorkflowId: ctx.workflowName,
    relatedWorkflowIds: ctx.workflowName ? [ctx.workflowName] : [],
  };
}

function stepFromContext(
  s: { id: string; title: string; description: string; durationMinutes?: number },
  safety: SOPSafetyNote[],
  resources: SOPResourceRequirement[]
): SOPStep {
  return {
    stepId: s.id,
    title: s.title,
    description: s.description,
    durationMinutes: s.durationMinutes,
    dependencies: [],
    safetyNotes: safety,
    resources,
  };
}

function safetyStep(note: SOPSafetyNote): SOPStep {
  return {
    stepId: `safety-${note.noteId}`,
    title: note.title,
    description: note.description,
    durationMinutes: 0,
    safetyNotes: [note],
    resources: [],
  };
}
