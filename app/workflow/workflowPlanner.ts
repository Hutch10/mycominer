// Phase 19: Workflow Planner
// Groups tasks into coherent workflows, evaluates tradeoffs, and creates approval-requiring plans

'use client';

import { devMode } from '@/app/config/developerMode';
import {
  ScheduleProposal,
  WorkflowPlan,
  ConflictCheckResult,
  WorkflowTask,
  WorkflowRequest,
} from '@/app/workflow/workflowTypes';

// ============================================================================
// WORKFLOW PLANNER
// ============================================================================

class WorkflowPlanner {
  private planCounter = 0;

  /**
   * Create a workflow plan from schedule proposal and conflict analysis
   * Requires explicit user approval before execution
   */
  createWorkflowPlan(
    scheduleProposal: ScheduleProposal,
    conflictCheckResult: ConflictCheckResult,
    workflowTasks: WorkflowTask[],
    request: WorkflowRequest
  ): WorkflowPlan {
    // Group workflow tasks by coherent workflow phases
    const groupedWorkflows = this.groupWorkflowsbyPhase(scheduleProposal, workflowTasks);

    // Assign priority levels
    const priorityLevels = this.assignPriorityLevels(scheduleProposal);

    // Evaluate tradeoffs
    const tradeoffs = this.evaluateTradeoffs(scheduleProposal, request);

    // Calculate confidence
    const overallConfidence = this.calculateConfidence(scheduleProposal, conflictCheckResult);

    const plan: WorkflowPlan = {
      planId: `plan-${++this.planCounter}`,
      createdAt: new Date().toISOString(),
      scheduleProposal,
      groupedWorkflows,
      priorityLevels,
      tradeoffs,
      overallConfidence,
      estimatedBenefit: `Generate ${scheduleProposal.estimatedYieldKg}kg yield over ${scheduleProposal.totalDays} days ` +
        `using ${scheduleProposal.totalLaborHours.toFixed(1)} labor hours`,
      status: 'pending-approval' as const,
    };

    return plan;
  }

  /**
   * Group workflow tasks by lifecycle phase
   */
  private groupWorkflowsbyPhase(
    scheduleProposal: ScheduleProposal,
    workflowTasks: WorkflowTask[]
  ) {
    const workflows = [];
    const taskMap = new Map(workflowTasks.map(t => [t.taskId, t]));

    // Group by species and phase
    const speciesGroups = new Map<string, string[]>();

    for (const scheduledTask of scheduleProposal.scheduledTasks) {
      if (scheduledTask.species) {
        if (!speciesGroups.has(scheduledTask.species)) {
          speciesGroups.set(scheduledTask.species, []);
        }
        speciesGroups.get(scheduledTask.species)!.push(scheduledTask.taskId);
      }
    }

    for (const [species, taskIds] of speciesGroups) {
      const tasksForSpecies = taskIds
        .map(id => scheduleProposal.scheduledTasks.find(t => t.taskId === id))
        .filter(t => t !== undefined) as typeof scheduleProposal.scheduledTasks;

      if (tasksForSpecies.length > 0) {
        const startDate = tasksForSpecies[0].scheduledStart.split('T')[0];
        const endDate = tasksForSpecies[tasksForSpecies.length - 1].scheduledEnd.split('T')[0];
        const durationDays =
          (new Date(endDate).getTime() - new Date(startDate).getTime()) /
          (1000 * 3600 * 24);

        // Estimate yield
        const harvestTask = tasksForSpecies.find(t => t.type === 'harvest');
        const estimatedYield = harvestTask ? 10 + Math.random() * 5 : 0; // mock

        // Labor cost: $25/hour average
        const laborCost = tasksForSpecies.reduce((sum, t) => sum + t.assignedLabor * 25, 0);

        workflows.push({
          workflowName: `${species} cultivation cycle (${startDate} → ${endDate})`,
          tasks: taskIds,
          startDate,
          endDate,
          estimatedYield,
          laborCost,
        });
      }
    }

    // Add non-species workflows (equipment maintenance, etc.)
    const speciesTaskIds = new Set(Array.from(speciesGroups.values()).flat());
    const nonSpeciesTasks = scheduleProposal.scheduledTasks.filter(t => !speciesTaskIds.has(t.taskId));

    if (nonSpeciesTasks.length > 0) {
      workflows.push({
        workflowName: 'Equipment & Facility Maintenance',
        tasks: nonSpeciesTasks.map(t => t.taskId),
        startDate: nonSpeciesTasks[0].scheduledStart.split('T')[0],
        endDate: nonSpeciesTasks[nonSpeciesTasks.length - 1].scheduledEnd.split('T')[0],
        estimatedYield: 0,
        laborCost: nonSpeciesTasks.reduce((sum, t) => sum + t.assignedLabor * 25, 0),
      });
    }

    return workflows;
  }

  /**
   * Assign priority levels to tasks
   */
  private assignPriorityLevels(scheduleProposal: ScheduleProposal): Record<string, number> {
    const levels: Record<string, number> = {};

    // Map task type to priority (critical = 1, high = 2, normal = 3, low = 4)
    const typePriorityMap: Record<string, number> = {
      'substrate-prep': 1,
      'inoculation': 1,
      'harvest': 2,
      'incubation-transition': 2,
      'fruiting-transition': 2,
      'misting': 3,
      'co2-adjustment': 3,
      'cleaning': 2,
      'equipment-maintenance': 4,
      'labor-intensive-monitoring': 3,
      'species-reset': 3,
    };

    for (const task of scheduleProposal.scheduledTasks) {
      levels[task.taskId] = typePriorityMap[task.type] || 3;
    }

    return levels;
  }

  /**
   * Evaluate tradeoffs between competing goals
   */
  private evaluateTradeoffs(scheduleProposal: ScheduleProposal, request: WorkflowRequest) {
    const laborHoursAvailable = request.constraintSet.laborHoursAvailable * request.timeWindowDays;
    const laborUtilization = (scheduleProposal.totalLaborHours / laborHoursAvailable) * 100;

    return {
      laborVsYield:
        laborUtilization > 90
          ? `High labor utilization (${laborUtilization.toFixed(0)}%); yield prioritized over rest periods`
          : laborUtilization > 70
          ? `Balanced labor use (${laborUtilization.toFixed(0)}%); efficient workflow`
          : `Low labor utilization (${laborUtilization.toFixed(0)}%); conservative schedule allows buffer`,

      contaminationRisk:
        scheduleProposal.riskFactors.some(f => f.includes('clustering'))
          ? 'Moderate risk from task clustering; recommend increased cleaning frequency'
          : scheduleProposal.riskFactors.length > 0
          ? `${scheduleProposal.riskFactors.length} risk factors identified; review mitigation strategies`
          : 'Low contamination risk with good task distribution',

      equipmentUtilization:
        Object.values(scheduleProposal.equipmentUtilization).reduce((a, b) => a + b, 0) / 
          Object.keys(scheduleProposal.equipmentUtilization).length > 70
          ? 'High equipment utilization; minimal idle time'
          : 'Moderate equipment utilization; cost-effective schedule',
    };
  }

  /**
   * Calculate overall plan confidence (0-100)
   */
  private calculateConfidence(
    scheduleProposal: ScheduleProposal,
    conflictCheckResult: ConflictCheckResult
  ): number {
    let confidence = 100;

    // Reduce for conflicts
    if (conflictCheckResult.decision === 'block') {
      confidence -= 50;
    } else if (conflictCheckResult.decision === 'warn') {
      confidence -= 20;
    }

    // Reduce for multiple risk factors
    confidence -= Math.min(15, scheduleProposal.riskFactors.length * 3);

    // Reduce for low schedule confidence
    confidence -= Math.max(0, 100 - scheduleProposal.confidence) * 0.5;

    return Math.max(20, confidence);
  }

  /**
   * Approve a plan (requires explicit user action)
   */
  approvePlan(plan: WorkflowPlan, userId: string): WorkflowPlan {
    const config = devMode.getConfig();
    const isAutoApproval = userId === 'auto-dev-mode';

    return {
      ...plan,
      status: 'approved' as const,
      approvalBy: userId,
      approvedAt: new Date().toISOString(),
      metadata: {
        ...(plan as any).metadata,
        autoApproved: isAutoApproval,
        developerMode: config.enabled,
      },
    } as WorkflowPlan;
  }

  /**
   * Reject a plan with required reason
   */
  rejectPlan(plan: WorkflowPlan, reason: string): WorkflowPlan {
    return {
      ...plan,
      status: 'rejected' as const,
      rejectionReason: reason,
    } as WorkflowPlan;
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const workflowPlanner = new WorkflowPlanner();
