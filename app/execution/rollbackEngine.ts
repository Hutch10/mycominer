// Phase 21: Rollback Engine
// Produces deterministic rollback plans and logs reversal actions

'use client';

import { ExecutionPlan, RollbackPlan } from '@/app/execution/executionTypes';
import { executionLog } from '@/app/execution/executionLog';

class RollbackEngine {
  generate(plan: ExecutionPlan, failedStepId: string, reason: string): RollbackPlan {
    const rollbackSteps = plan.steps
      .filter(step => step.status === 'completed' || step.stepId === failedStepId)
      .map((step, index) => ({
        rollbackStepId: `rollback-${index + 1}`,
        targetStepId: step.stepId,
        action: step.rollbackSteps?.[0] || `Reverse step ${step.stepId}`,
        expectedDurationMinutes: Math.max(15, Math.round(step.expectedDurationMinutes / 2)),
      }));

    const rollbackPlan: RollbackPlan = {
      rollbackId: `rollback-plan-${Date.now()}`,
      planId: plan.planId,
      triggeredBy: failedStepId,
      reason,
      steps: rollbackSteps,
      status: 'pending-approval',
      createdAt: new Date().toISOString(),
    };

    executionLog.add({
      entryId: `exec-log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      category: 'rollback',
      message: `Rollback plan generated for ${failedStepId}`,
      context: { planId: plan.planId, rollbackId: rollbackPlan.rollbackId },
    });

    return rollbackPlan;
  }

  approve(rollbackPlan: RollbackPlan, approver: string): RollbackPlan {
    executionLog.add({
      entryId: `exec-log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      category: 'rollback',
      message: 'Rollback plan approved',
      context: { rollbackId: rollbackPlan.rollbackId, userId: approver },
    });
    return { ...rollbackPlan, status: 'approved' };
  }

  complete(rollbackPlan: RollbackPlan): RollbackPlan {
    executionLog.add({
      entryId: `exec-log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      category: 'rollback',
      message: 'Rollback completed',
      context: { rollbackId: rollbackPlan.rollbackId },
    });
    return { ...rollbackPlan, status: 'completed' };
  }
}

export const rollbackEngine = new RollbackEngine();
