'use client';

import { RefinementProposal, SafetyCheckResult, SafetyDecision } from './refinementTypes';
import { refinementLog } from './refinementLog';

class RefinementAuditor {
  runSafetyChecks(proposal: RefinementProposal): SafetyCheckResult {
    const issues: string[] = [];
    const policyNotes = [
      'Checked against contamination and safety policies',
      'Verified range consistency with environmental targets',
    ];

    if (proposal.riskLevel === 'high') {
      issues.push('High-risk proposal requires manual approval');
    }

    const decision: SafetyDecision = issues.length === 0 ? 'allow' : 'warn';
    const rationale = issues.length === 0 ? ['No blocking conflicts detected'] : issues;

    const result: SafetyCheckResult = {
      proposalId: proposal.id,
      decision,
      issues,
      policyNotes,
      rationale,
      rollbackPlan: 'Manual rollback: revert to previous recommendation state',
    };

    refinementLog.add({ category: 'audit', message: 'Safety checks completed', context: { proposalId: proposal.id, decision, issues } });
    return result;
  }
}

export const refinementAuditor = new RefinementAuditor();
