import { ComplianceCategory, DeviationRecord } from './complianceTypes';
import { logDeviation } from './complianceLog';

export interface DeviationInput {
  facilityId: string;
  source: ComplianceCategory;
  description: string;
  severity: DeviationRecord['severity'];
  expected?: string;
  observed?: string;
  relatedIds?: string[];
}

export function recordDeviation(input: DeviationInput): DeviationRecord {
  const deviation: DeviationRecord = {
    deviationId: `dev-${Date.now()}`,
    timestamp: new Date().toISOString(),
    facilityId: input.facilityId,
    source: input.source,
    description: input.description,
    severity: input.severity,
    expected: input.expected,
    observed: input.observed,
    relatedIds: input.relatedIds,
  };

  return logDeviation(deviation);
}

export function annotateDeviation(
  deviation: DeviationRecord,
  params: { rootCause?: string; correctiveAction?: { description: string; owner: string; dueDate?: string }; preventiveAction?: { description: string; owner: string; dueDate?: string } }
): DeviationRecord {
  const updated: DeviationRecord = {
    ...deviation,
    rootCause: params.rootCause ?? deviation.rootCause,
    correctiveAction: params.correctiveAction
      ? {
          actionId: `capa-${Date.now()}`,
          description: params.correctiveAction.description,
          owner: params.correctiveAction.owner,
          dueDate: params.correctiveAction.dueDate,
          status: 'open',
        }
      : deviation.correctiveAction,
    preventiveAction: params.preventiveAction
      ? {
          actionId: `capa-${Date.now()}`,
          description: params.preventiveAction.description,
          owner: params.preventiveAction.owner,
          dueDate: params.preventiveAction.dueDate,
          status: 'open',
        }
      : deviation.preventiveAction,
  };

  // Immutability: log updated snapshot; existing records remain unchanged
  return logDeviation(updated);
}
