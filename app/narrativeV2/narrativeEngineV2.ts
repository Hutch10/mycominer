import { assembleNarrative } from './narrativeAssembler';
import { NarrativeExplanation, NarrativeReference, NarrativeRequest } from './narrativeTypes';
import { logNarrative } from './narrativeLog';

export interface NarrativeEngineInput {
  request: NarrativeRequest;
  references: NarrativeReference[];
}

export function runNarrativeEngineV2(input: NarrativeEngineInput): NarrativeExplanation {
  logNarrative('request', 'Narrative request received', {
    requestId: input.request.requestId,
    target: input.request.context.target,
    tenant: input.request.context.tenantId,
    scope: input.request.context.scope,
  });

  const explanation = assembleNarrative({ request: input.request, references: input.references });

  logNarrative('output', 'Narrative explanation produced', {
    explanationId: explanation.explanationId,
    target: explanation.target,
    refs: explanation.references.length,
  });

  return explanation;
}
