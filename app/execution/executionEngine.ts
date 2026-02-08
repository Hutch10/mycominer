// Phase 21: Execution Engine
// Converts approved plans into safety-gated execution step proposals

'use client';

import { ExecutionIngestInput, ExecutionPlan, ExecutionStepProposal, ExecutionResourceUse } from '@/app/execution/executionTypes';
import { executionLog } from '@/app/execution/executionLog';

class ExecutionEngine {
  private stepCounter = 0;

  ingest(input: ExecutionIngestInput): ExecutionStepProposal[] {
    const steps: ExecutionStepProposal[] = [];

    if (input.workflowPlan) {
      steps.push(...this.buildWorkflowSteps(input.workflowPlan));
    }

    if (input.strategyPlan) {
      steps.push(...this.buildStrategySteps(input.strategyPlan));
    }

    if (input.allocationPlan) {
      steps.push(...this.buildResourceSteps(input.allocationPlan));
    }

    if (input.simulationInsights || input.refinementFindings) {
      steps.push(this.buildInsightStep(input));
    }

    if (input.facilityOrchestratorNotes || input.telemetryBaselines) {
      steps.push(this.buildStabilityCheckStep(input));
    }

    const sorted = steps.sort((a, b) => a.stepId.localeCompare(b.stepId));

    executionLog.add({
      entryId: `exec-log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      category: 'ingest',
      message: `Ingested execution inputs -> ${sorted.length} step proposals`,
      context: {
        sourceType: 'workflow-plan',
        sourceId: input.workflowPlan?.planId,
      },
      details: {
        strategyPlanId: input.strategyPlan?.id,
        allocationPlanId: input.allocationPlan?.planId,
        simulationInsights: input.simulationInsights,
        refinementFindings: input.refinementFindings,
        orchestratorNotes: input.facilityOrchestratorNotes,
      },
    });

    return sorted;
  }

  private buildInsightStep(input: ExecutionIngestInput): ExecutionStepProposal {
    return {
      stepId: `exec-step-${++this.stepCounter}`,
      sourceType: input.simulationInsights ? 'simulation-insight' : 'refinement-insight',
      title: 'Validate simulation/refinement alignment',
      description: 'Ensure execution matches latest simulation and refinement guidance',
      expectedDurationMinutes: 30,
      resources: [{ name: 'review-time', category: 'labor', quantity: 1, unit: 'hours' }],
      safetyChecks: ['regression-detection', 'telemetry-deviation'],
      telemetryWatch: {
        contaminationRiskMax: 80,
        equipmentLoadMax: 90,
      },
      requiresApproval: true,
      status: 'awaiting-approval',
    };
  }

  private buildStabilityCheckStep(input: ExecutionIngestInput): ExecutionStepProposal {
    return {
      stepId: `exec-step-${++this.stepCounter}`,
      sourceType: 'facility-orchestrator',
      title: 'Facility and telemetry stability check',
      description: 'Cross-check orchestrator directives against telemetry baselines before execution',
      expectedDurationMinutes: 20,
      resources: [{ name: 'labor-hours', category: 'labor', quantity: 0.5, unit: 'hours' }],
      safetyChecks: ['telemetry-deviation', 'equipment-overload', 'labor-mismatch'],
      telemetryWatch: {
        contaminationRiskMax: 75,
        equipmentLoadMax: 85,
        laborUtilizationMax: 85,
      },
      requiresApproval: true,
      status: 'awaiting-approval',
    };
  }

  private buildWorkflowSteps(plan: ExecutionIngestInput['workflowPlan']): ExecutionStepProposal[] {
    if (!plan) return [];
    const steps: ExecutionStepProposal[] = [];

    for (const scheduled of plan.scheduleProposal.scheduledTasks) {
      const resources: ExecutionResourceUse[] = [];
      if (scheduled.assignedLabor) {
        resources.push({
          name: 'labor-hours',
          category: 'labor',
          quantity: scheduled.assignedLabor,
          unit: 'hours',
        });
      }
      if (scheduled.assignedEquipment) {
        scheduled.assignedEquipment.forEach(eq => {
          resources.push({
            name: eq,
            category: 'equipment',
            quantity: 1,
            unit: 'unit',
          });
        });
      }

      const step: ExecutionStepProposal = {
        stepId: `exec-step-${++this.stepCounter}`,
        sourceType: 'workflow-plan',
        sourceReferenceId: plan.planId,
        title: `Execute ${scheduled.type} (${scheduled.taskId})`,
        description: `Run workflow task ${scheduled.taskId} for species ${scheduled.species ?? 'n/a'} in ${scheduled.room ?? 'unassigned'}`,
        expectedDurationMinutes: Math.max(30, scheduled.sequenceOrder * 15),
        scheduledStart: scheduled.scheduledStart,
        scheduledEnd: scheduled.scheduledEnd,
        dependencies: [],
        resources,
        safetyChecks: ['telemetry-deviation', 'contamination-risk', 'equipment-overload', 'labor-mismatch'],
        telemetryWatch: {
          contaminationRiskMax: 80,
          equipmentLoadMax: 90,
          laborUtilizationMax: 90,
          environmentLimits: {
            temperatureMax: 28,
            temperatureMin: 12,
            humidityMax: 98,
            humidityMin: 50,
            co2Max: 7000,
          },
        },
        rollbackSteps: ['Return room to previous environmental setpoints', 'Isolate affected batch', 'Log contamination and halt adjacent tasks'],
        requiresApproval: true,
        status: 'awaiting-approval',
      };

      // Derive dependencies from workflow dependencies if present
      if (plan.groupedWorkflows) {
        const matchingGroup = plan.groupedWorkflows.find(g => g.tasks.includes(scheduled.taskId));
        if (matchingGroup) {
          step.dependencies = [...(matchingGroup.tasks.filter(t => t !== scheduled.taskId))];
        }
      }

      steps.push(step);
    }

    return steps;
  }

  private buildStrategySteps(strategy: ExecutionIngestInput['strategyPlan']): ExecutionStepProposal[] {
    if (!strategy) return [];
    return strategy.proposals.map((proposal) => {
      return {
        stepId: `exec-step-${++this.stepCounter}`,
        sourceType: 'strategy-plan',
        sourceReferenceId: strategy.id,
        title: `Implement strategy: ${proposal.title}`,
        description: proposal.description,
        expectedDurationMinutes: 60,
        dependencies: [],
        resources: [
          { name: 'labor-hours', category: 'labor', quantity: 2, unit: 'hours' },
        ],
        safetyChecks: ['regression-detection', 'telemetry-deviation'],
        telemetryWatch: {
          contaminationRiskMax: proposal.riskLevel === 'high' ? 85 : proposal.riskLevel === 'medium' ? 80 : 70,
          equipmentLoadMax: 90,
          laborUtilizationMax: 90,
        },
        rollbackSteps: [proposal.implementationSteps?.[0] ?? 'Restore previous configuration'],
        requiresApproval: true,
        status: 'awaiting-approval',
      } as ExecutionStepProposal;
    });
  }

  private buildResourceSteps(allocationPlan: ExecutionIngestInput['allocationPlan']): ExecutionStepProposal[] {
    if (!allocationPlan) return [];
    const steps: ExecutionStepProposal[] = [];

    allocationPlan.allocations.forEach((allocation) => {
      steps.push({
        stepId: `exec-step-${++this.stepCounter}`,
        sourceType: 'resource-allocation',
        sourceReferenceId: allocationPlan.planId,
        title: `Allocate ${allocation.resourceName}`,
        description: `Move ${allocation.quantityAllocated}${allocation.unit} of ${allocation.resourceName} to fulfill requirement ${allocation.requirementId}`,
        expectedDurationMinutes: 30,
        resources: [
          { name: allocation.resourceName, category: allocation.category === 'labor' ? 'labor' : 'material', quantity: allocation.quantityAllocated, unit: allocation.unit },
        ],
        safetyChecks: ['resource-availability', 'labor-mismatch'],
        dependencies: allocation.requirementId ? [`req-${allocation.requirementId}`] : [],
        telemetryWatch: {
          contaminationRiskMax: 80,
          equipmentLoadMax: 95,
        },
        rollbackSteps: ['Return resources to inventory', 'Reconcile counts in inventory manager'],
        requiresApproval: true,
        status: 'awaiting-approval',
      });
    });

    return steps;
  }

  buildDraftPlan(steps: ExecutionStepProposal[]): ExecutionPlan {
    const dependencies: Record<string, string[]> = {};
    steps.forEach(step => {
      dependencies[step.stepId] = step.dependencies ?? [];
    });

    return {
      planId: `execution-plan-${Date.now()}`,
      createdAt: new Date().toISOString(),
      steps,
      dependencies,
      resourceConflicts: [],
      timingConflicts: [],
      approvalRequired: ['operations-lead'],
      status: 'draft',
      version: 1,
      manualOverrides: [],
    };
  }
}

export const executionEngine = new ExecutionEngine();
