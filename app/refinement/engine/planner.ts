'use client';

import { RefinementProposal, RefinementPlan } from './refinementTypes';
import { refinementLog } from './refinementLog';

class RefinementPlanner {
  createPlan(proposals: RefinementProposal[]): RefinementPlan {
    const riskLevel: RefinementPlan['riskLevel'] = proposals.some((p) => p.riskLevel === 'high') ? 'high' : 'medium';
    const plan: RefinementPlan = {
      id: `plan-${Date.now()}`,
      proposals,
      impactSummary: 'Aggregated refinement impact across systems',
      riskLevel,
      approvalsRequired: ['safety', 'operations'],
      status: 'draft',
    };

    refinementLog.add({ category: 'planner', message: 'Plan created', context: { planId: plan.id, proposals: proposals.map((p) => p.id) } });
    return plan;
  }

  approvePlan(plan: RefinementPlan): RefinementPlan {
    const updated: RefinementPlan = { ...plan, status: 'approved' as const };
    refinementLog.add({ category: 'planner', message: 'Plan approved', context: { planId: updated.id } });
    return updated;
  }

  rejectPlan(plan: RefinementPlan, reason: string): RefinementPlan {
    const updated: RefinementPlan = { ...plan, status: 'rejected' as const, rejectionReason: reason };
    refinementLog.add({ category: 'planner', message: 'Plan rejected', context: { planId: updated.id, reason } });
    return updated;
  }
}

export const refinementPlanner = new RefinementPlanner();
