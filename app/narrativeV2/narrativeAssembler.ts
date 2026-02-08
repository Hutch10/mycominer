import { NarrativeContext, NarrativeExplanation, NarrativeReference, NarrativeRequest } from './narrativeTypes';
import { renderTemplates } from './narrativeTemplateLibrary';
import { logNarrative } from './narrativeLog';

export interface NarrativeAssemblerInput {
  request: NarrativeRequest;
  references: NarrativeReference[];
}

function scopeFilter<T extends { tenantId: string; federated?: boolean }>(items: T[], ctx: NarrativeContext): T[] {
  const allowed = new Set([ctx.tenantId, ...(ctx.federatedTenantIds ?? [])]);
  return items.filter((i) => allowed.has(i.tenantId));
}

export function assembleNarrative(input: NarrativeAssemblerInput): NarrativeExplanation {
  const { request, references } = input;
  const scopedRefs = scopeFilter(references, request.context).map((ref) => ({ ...ref, federated: ref.tenantId !== request.context.tenantId }));
  const sections = renderTemplates(request.context.target, request.context).map((section) => ({
    ...section,
    references: scopedRefs,
  }));

  const explanation: NarrativeExplanation = {
    explanationId: `nexp-${Date.now()}`,
    scope: request.context.scope,
    tenantId: request.context.tenantId,
    federatedTenantIds: request.context.federatedTenantIds,
    target: request.context.target,
    sections,
    references: scopedRefs,
    summary: `Narrative for ${request.context.target} under ${request.context.scope} scope with ${scopedRefs.length} references`,
  };

  logNarrative('assembly', 'Narrative assembled', {
    requestId: request.requestId,
    target: request.context.target,
    refs: scopedRefs.length,
  });

  return explanation;
}
