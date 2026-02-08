// Phase 21: Execution Planner
// Sequences execution steps, detects conflicts, and requires explicit approval

'use client';

import { ExecutionPlan, ExecutionStepProposal } from '@/app/execution/executionTypes';
import { executionLog } from '@/app/execution/executionLog';

class ExecutionPlanner {
  sequenceSteps(steps: ExecutionStepProposal[]): ExecutionPlan {
    // Topologically order by dependencies (simple deterministic sort)
    const ordered = [...steps].sort((a, b) => {
      const depCountDiff = (a.dependencies?.length || 0) - (b.dependencies?.length || 0);
      return depCountDiff !== 0 ? depCountDiff : a.stepId.localeCompare(b.stepId);
    });

    const resourceConflicts = this.detectResourceConflicts(ordered);
    const timingConflicts = this.detectTimingConflicts(ordered);

    const plan: ExecutionPlan = {
      planId: `execution-plan-${Date.now()}`,
      createdAt: new Date().toISOString(),
      steps: ordered,
      dependencies: Object.fromEntries(ordered.map(s => [s.stepId, s.dependencies ?? []])),
      resourceConflicts,
      timingConflicts,
      approvalRequired: ['operations-lead'],
      status: 'pending-approval',
      version: 1,
      manualOverrides: [],
    };

    executionLog.add({
      entryId: `exec-log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      category: 'planning',
      message: `Execution plan created with ${ordered.length} steps`,
      context: { planId: plan.planId },
      details: { resourceConflicts: resourceConflicts.length, timingConflicts: timingConflicts.length },
    });

    return plan;
  }

  requestApproval(plan: ExecutionPlan, approver: string): ExecutionPlan {
    const updated: ExecutionPlan = { ...plan, status: 'pending-approval' };
    executionLog.add({
      entryId: `exec-log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      category: 'approval',
      message: 'Execution plan awaiting approval',
      context: { planId: updated.planId, userId: approver },
    });
    return updated;
  }

  approvePlan(plan: ExecutionPlan, approver: string): ExecutionPlan {
    const updated: ExecutionPlan = { ...plan, status: 'approved' };
    updated.steps = updated.steps.map(step => ({ ...step, approved: true, approvedBy: approver, approvedAt: new Date().toISOString(), status: 'pending' }));

    executionLog.add({
      entryId: `exec-log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      category: 'approval',
      message: 'Execution plan approved',
      context: { planId: updated.planId, userId: approver },
    });

    return updated;
  }

  rejectPlan(plan: ExecutionPlan, approver: string, reason: string): ExecutionPlan {
    const updated: ExecutionPlan = { ...plan, status: 'rejected' };
    executionLog.add({
      entryId: `exec-log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      category: 'approval',
      message: `Execution plan rejected: ${reason}`,
      context: { planId: updated.planId, userId: approver },
    });
    return updated;
  }

  private detectResourceConflicts(steps: ExecutionStepProposal[]): string[] {
    const conflicts: string[] = [];
    const resourceUse: Record<string, number> = {};

    steps.forEach(step => {
      step.resources.forEach(resource => {
        const key = `${resource.category}:${resource.name}`;
        resourceUse[key] = (resourceUse[key] || 0) + resource.quantity;
        if (resourceUse[key] > 1 && resource.category !== 'labor') {
          conflicts.push(`Resource conflict: ${resource.name} used in parallel steps`);
        }
      });
    });

    return Array.from(new Set(conflicts));
  }

  private detectTimingConflicts(steps: ExecutionStepProposal[]): string[] {
    const conflicts: string[] = [];
    const scheduled = steps.filter(s => s.scheduledStart && s.scheduledEnd);
    for (let i = 0; i < scheduled.length; i++) {
      for (let j = i + 1; j < scheduled.length; j++) {
        const a = scheduled[i];
        const b = scheduled[j];
        if (a.scheduledEnd! > b.scheduledStart! && a.scheduledStart! < b.scheduledEnd!) {
          conflicts.push(`Timing conflict between ${a.stepId} and ${b.stepId}`);
        }
      }
    }
    return conflicts;
  }
}

export const executionPlanner = new ExecutionPlanner();
