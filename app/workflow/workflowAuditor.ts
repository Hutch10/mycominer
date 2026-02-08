// Phase 19: Workflow Auditor
// Validates workflow plans, checks constraints, detects regressions, and manages rollback capability

'use client';

import {
  WorkflowPlan,
  WorkflowAuditResult,
  SpeciesName,
  WorkflowRequest,
} from '@/app/workflow/workflowTypes';

// ============================================================================
// WORKFLOW AUDITOR
// ============================================================================

class WorkflowAuditor {
  private auditCounter = 0;

  /**
   * Comprehensive audit of workflow plan
   * All validations must pass before execution
   */
  auditWorkflowPlan(plan: WorkflowPlan, request: WorkflowRequest): WorkflowAuditResult {
    const timestamp = new Date().toISOString();

    // Validation 1: Species timelines
    const timelineValidation = this.validateSpeciesTimelines(plan);

    // Validation 2: Substrate preparation cycles
    const substrateValidation = this.validateSubstrateCycles(plan);

    // Validation 3: Facility constraints
    const facilityConstraintsValidation = this.validateFacilityConstraints(plan, request);

    // Validation 4: Labor constraints
    const laborValidation = this.validateLaborConstraints(plan, request);

    // Validation 5: Regression detection
    const regressionDetection = this.detectRegressions(plan);

    // Determine decision
    const allValidationsPass =
      timelineValidation.isValid &&
      substrateValidation.isValid &&
      facilityConstraintsValidation.isValid &&
      laborValidation.isValid;

    let decision: 'allow' | 'warn' | 'block' = 'allow';
    if (!allValidationsPass) {
      decision = 'block';
    } else if (regressionDetection.detected) {
      decision = 'warn';
    }

    const result: WorkflowAuditResult = {
      auditId: `audit-${++this.auditCounter}`,
      timestamp,
      planId: plan.planId,
      decision,
      timelineValidation,
      substrateValidation,
      facilityConstraintsValidation,
      laborValidation,
      regressionDetection,
      rationale: this.generateRationale(
        timelineValidation,
        substrateValidation,
        facilityConstraintsValidation,
        laborValidation,
        regressionDetection,
        decision
      ),
      recommendations: this.generateAuditRecommendations(
        timelineValidation,
        substrateValidation,
        facilityConstraintsValidation,
        laborValidation
      ),
      rollbackSteps: this.generateRollbackSteps(plan),
    };

    return result;
  }

  /**
   * Validate species lifecycle timelines
   */
  private validateSpeciesTimelines(plan: WorkflowPlan) {
    const issues: string[] = [];

    for (const workflow of plan.groupedWorkflows) {
      const species = workflow.workflowName.match(/^(\w+)/)?.[1];
      if (species) {
        const expectedDays = this.getExpectedCycleDays(species as SpeciesName);
        const actualDays = Math.ceil(
          (new Date(workflow.endDate).getTime() - new Date(workflow.startDate).getTime()) /
          (1000 * 3600 * 24)
        );

        // Allow 10% variance
        if (actualDays < expectedDays * 0.9 || actualDays > expectedDays * 1.1) {
          issues.push(
            `${species}: expected ${expectedDays}± days, got ${actualDays} days (${((actualDays / expectedDays - 1) * 100).toFixed(0)}% variance)`
          );
        }
      }
    }

    return {
      isValid: issues.length === 0,
      issues,
    };
  }

  /**
   * Validate substrate preparation cycles
   */
  private validateSubstrateCycles(plan: WorkflowPlan) {
    const issues: string[] = [];

    const prepTasks = plan.scheduleProposal.scheduledTasks.filter(t => t.type === 'substrate-prep');
    const inoculationTasks = plan.scheduleProposal.scheduledTasks.filter(t => t.type === 'inoculation');

    for (const prepTask of prepTasks) {
      // Check that inoculation follows within reasonable time
      const inoculationAfterPrep = inoculationTasks.find(
        t =>
          new Date(t.scheduledStart).getTime() >= new Date(prepTask.scheduledStart).getTime() &&
          new Date(t.scheduledStart).getTime() <= new Date(prepTask.scheduledEnd).getTime() + 48 * 3600000 // 48 hour window
      );

      if (!inoculationAfterPrep) {
        issues.push(
          `Substrate prep (${prepTask.scheduledStart}) not followed by inoculation within 48 hours`
        );
      }
    }

    // Check prep task duration
    for (const prepTask of prepTasks) {
      const durationHours =
        (new Date(prepTask.scheduledEnd).getTime() - new Date(prepTask.scheduledStart).getTime()) /
        3600000;
      if (durationHours < 4 || durationHours > 24) {
        issues.push(`Substrate prep duration ${durationHours.toFixed(1)}h is outside typical 4-24h range`);
      }
    }

    return {
      isValid: issues.length === 0,
      issues,
    };
  }

  /**
   * Validate facility constraint compliance
   */
  private validateFacilityConstraints(plan: WorkflowPlan, request: WorkflowRequest) {
    const issues: string[] = [];

    // Check substrate limit
    const estimatedSubstrateNeeded = request.harvestTargets.reduce((sum, t) => sum + t.targetYieldKg * 2, 0);
    if (estimatedSubstrateNeeded > request.constraintSet.substrateLimitKg) {
      issues.push(
        `Substrate required (${estimatedSubstrateNeeded}kg) exceeds limit (${request.constraintSet.substrateLimitKg}kg)`
      );
    }

    // Check equipment availability
    for (const equipment of request.constraintSet.equipmentAvailable) {
      const equipmentTasks = plan.scheduleProposal.scheduledTasks.filter(t =>
        t.assignedEquipment?.includes(equipment)
      );
      if (equipmentTasks.length > 0) {
        const utilization = plan.scheduleProposal.equipmentUtilization[equipment] || 0;
        if (utilization > 100) {
          issues.push(`Equipment "${equipment}" over-allocated (${utilization}% utilization)`);
        }
      }
    }

    // Check room count
    const roomsUsed = new Set(plan.scheduleProposal.scheduledTasks.map(t => t.room || 'unassigned'));
    if (roomsUsed.size > request.facilityIds.length * 4) {
      // Assume 4 rooms per facility
      issues.push(`Room requirement (${roomsUsed.size} rooms) may exceed facility capacity`);
    }

    return {
      isValid: issues.length === 0,
      issues,
    };
  }

  /**
   * Validate labor hour constraints
   */
  private validateLaborConstraints(plan: WorkflowPlan, request: WorkflowRequest) {
    const issues: string[] = [];

    const availableHours = request.constraintSet.laborHoursAvailable * request.timeWindowDays;
    if (plan.scheduleProposal.totalLaborHours > availableHours) {
      issues.push(
        `Total labor (${plan.scheduleProposal.totalLaborHours.toFixed(1)}h) exceeds available ` +
        `(${availableHours}h over ${request.timeWindowDays} days)`
      );
    }

    // Check daily labor distribution
    const dailyLabor = new Map<string, number>();
    for (const task of plan.scheduleProposal.scheduledTasks) {
      const day = task.scheduledStart.split('T')[0];
      dailyLabor.set(day, (dailyLabor.get(day) || 0) + task.assignedLabor);
    }

    const overloadedDays = Array.from(dailyLabor.entries()).filter(
      ([_, hours]) => hours > request.constraintSet.laborHoursAvailable * 1.25
    );
    if (overloadedDays.length > 0) {
      issues.push(
        `${overloadedDays.length} day(s) with labor overload (>125% of daily limit: ${request.constraintSet.laborHoursAvailable}h)`
      );
    }

    return {
      isValid: issues.length === 0,
      issues,
    };
  }

  /**
   * Detect regressions from previous workflows
   * (Simplified: check if schedule is longer than optimal)
   */
  private detectRegressions(plan: WorkflowPlan) {
    const regressions: string[] = [];

    // Simple regression detection: total days longer than sum of individual timelines
    const totalOptimalDays = plan.groupedWorkflows
      .filter(w => w.workflowName.includes('cultivation'))
      .reduce((sum, w) => sum + 31, 0); // avg 31 days per species

    if (plan.scheduleProposal.totalDays > totalOptimalDays * 1.2) {
      regressions.push(`Schedule duration (${plan.scheduleProposal.totalDays}d) exceeds expected (${totalOptimalDays}d by >20%)`);
    }

    return {
      detected: regressions.length > 0,
      affectedMetrics: regressions,
    };
  }

  /**
   * Generate audit rationale
   */
  private generateRationale(
    timelineValidation: any,
    substrateValidation: any,
    facilityConstraintsValidation: any,
    laborValidation: any,
    regressionDetection: any,
    decision: string
  ): string {
    if (decision === 'block') {
      const failedChecks = [
        !timelineValidation.isValid && 'species timeline validation',
        !substrateValidation.isValid && 'substrate cycle validation',
        !facilityConstraintsValidation.isValid && 'facility constraints validation',
        !laborValidation.isValid && 'labor constraints validation',
      ].filter(Boolean);

      return `Plan cannot be approved: failed ${failedChecks.join(', ')}`;
    } else if (decision === 'warn') {
      return `Plan approved with warnings: regressions detected in ${regressionDetection.affectedMetrics.join(', ')}`;
    } else {
      return 'Plan passed all audit validations and is ready for approval';
    }
  }

  /**
   * Generate audit recommendations
   */
  private generateAuditRecommendations(
    timelineValidation: any,
    substrateValidation: any,
    facilityConstraintsValidation: any,
    laborValidation: any
  ): string[] {
    const recommendations: string[] = [];

    if (!timelineValidation.isValid) {
      recommendations.push('Review species timelines and adjust schedule for accurate growth staging');
    }

    if (!substrateValidation.isValid) {
      recommendations.push('Ensure substrate prep is completed 24-48 hours before inoculation');
    }

    if (!facilityConstraintsValidation.isValid) {
      recommendations.push('Verify facility capacity (rooms, equipment) matches requirements');
    }

    if (!laborValidation.isValid) {
      recommendations.push('Increase labor availability or extend timeline to distribute workload');
    }

    return recommendations;
  }

  /**
   * Generate rollback steps for failed/canceled workflows
   */
  private generateRollbackSteps(plan: WorkflowPlan): string[] {
    return [
      '1. Halt all active cultivation tasks immediately',
      '2. Document current state of all substrates and cultures',
      '3. Decontaminate affected growing spaces',
      '4. Quarantine any potentially contaminated biomass',
      '5. Perform full facility sanitization (bleach/IPA treatment)',
      '6. Verify environmental parameters reset to baseline',
      '7. Backup all workflow logs and sensor data',
      '8. Review failure root cause before scheduling new workflows',
      '9. Request approval from facility manager before resuming',
      '10. Execute post-rollback audit before next cultivation cycle',
    ];
  }

  /**
   * Get expected cycle days for species (hardcoded from timelines)
   */
  private getExpectedCycleDays(species: SpeciesName): number {
    const cycles: Record<SpeciesName, number> = {
      'oyster': 31,
      'shiitake': 42,
      'lions-mane': 31,
      'king-oyster': 36,
      'enoki': 22,
      'pioppino': 22,
      'reishi': 65,
      'cordyceps': 35,
      'turkey-tail': 49,
      'chestnut': 30,
      'maitake': 49,
      'chaga': 90,
    };
    return cycles[species] || 35;
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const workflowAuditor = new WorkflowAuditor();
