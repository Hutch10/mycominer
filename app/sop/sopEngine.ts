import { assembleSOP, AssemblerInput } from './sopAssembler';
import { promoteLifecycle } from './sopVersioning';
import { addSopLog } from './sopLog';
import { SOPDocument } from './sopTypes';

export interface SopEngineInput extends AssemblerInput {
  autoApprove?: boolean;
}

export interface SopEngineResult {
  sop: SOPDocument;
}

export function buildDeterministicSOP(input: SopEngineInput): SopEngineResult {
  const sop = assembleSOP(input);

  addSopLog({ category: 'generation', message: `SOP draft created: ${sop.title}`, context: { sopId: sop.sopId, versionId: sop.version.versionId } });

  const finalSop = input.autoApprove ? promoteLifecycle(sop, 'approved') : sop;
  if (input.autoApprove) {
    addSopLog({ category: 'approval', message: `SOP auto-approved: ${sop.title}`, context: { sopId: sop.sopId, versionId: sop.version.versionId } });
  }

  return { sop: finalSop };
}
