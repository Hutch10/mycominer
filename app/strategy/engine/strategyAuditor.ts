'use client';

import { StrategyProposal, StrategyAudit, AuditDecision } from '@/app/strategy/engine/strategyTypes';
import { strategyLog } from '@/app/strategy/engine/strategyLog';

class StrategyAuditor {
  runAudit(proposal: StrategyProposal): StrategyAudit {
    const rationale: string[] = [];
    const constraintViolations: string[] = [];
    const environmentalChecks = {
      speciesLimitCompliant: true,
      contaminationRiskAcceptable: true,
      energyBudgetRespected: true,
      schedulingConflicts: [] as string[],
    };
    const recommendations: string[] = [];
    let regressionDetected = false;

    // Type-specific checks
    if (proposal.type === 'energy') {
      // Energy proposals typically low risk
      rationale.push('Energy optimization proposals generally low risk if gradual.');
      recommendations.push('Monitor environmental stability after implementation.');
    }

    if (proposal.type === 'yield') {
      // Yield proposals may require species validation
      environmentalChecks.speciesLimitCompliant = this.validateSpeciesLimits(proposal);
      if (!environmentalChecks.speciesLimitCompliant) {
        constraintViolations.push('Proposed environmental changes exceed species limits.');
        recommendations.push('Verify species compatibility with new targets.');
      }
    }

    if (proposal.type === 'contamination-mitigation') {
      // Contamination proposals are high priority
      environmentalChecks.contaminationRiskAcceptable = this.validateContaminationStrategy(proposal);
      rationale.push('Contamination mitigation aligns with facility safety.');
      if (!environmentalChecks.contaminationRiskAcceptable) {
        constraintViolations.push('Mitigation strategy may create unintended risks.');
        recommendations.push('Expand risk analysis before approval.');
      }
    }

    if (proposal.type === 'scheduling') {
      // Scheduling checks for conflicts
      environmentalChecks.schedulingConflicts = this.detectSchedulingConflicts(proposal);
      if (environmentalChecks.schedulingConflicts.length > 0) {
        constraintViolations.push(`Scheduling conflicts detected: ${environmentalChecks.schedulingConflicts.join(', ')}`);
      }
    }

    // Risk-level based decision
    let decision: AuditDecision = 'allow';
    if (proposal.riskLevel === 'high' || constraintViolations.length > 0) {
      decision = 'warn';
      rationale.push('High-risk proposal or constraint violations detected; recommend caution.');
    }
    if (constraintViolations.length > 2) {
      decision = 'block';
      rationale.push('Multiple constraint violations; recommend rejection or redesign.');
    }

    if (decision !== 'allow') {
      recommendations.push('Request additional review before implementation.');
    }

    const audit: StrategyAudit = {
      id: `audit-${Date.now()}`,
      proposalId: proposal.id,
      decision,
      rationale,
      constraintViolations,
      environmentalChecks,
      recommendations,
      regressionDetected,
      rollbackPlan: 'Revert to previous environmental setpoints and document outcomes.',
    };

    strategyLog.add({
      category: 'audit',
      message: `Audit completed: ${decision}`,
      context: {
        proposalId: proposal.id,
        decision,
        violations: constraintViolations.length,
      },
    });

    return audit;
  }

  private validateSpeciesLimits(proposal: StrategyProposal): boolean {
    // Simplified species limit validation
    // In a real system, this would check against the species database
    if (proposal.affectedSystems.length === 0) {
      return false;
    }
    return true;
  }

  private validateContaminationStrategy(proposal: StrategyProposal): boolean {
    // Check if the proposal logically reduces contamination
    const positiveTerms = ['humidity', 'ventilation', 'airflow', 'hygiene', 'filtration', 'scheduling'];
    const hasPositiveTerm = positiveTerms.some((term) => proposal.description.toLowerCase().includes(term));

    if (!hasPositiveTerm) {
      return false;
    }
    return true;
  }

  private detectSchedulingConflicts(proposal: StrategyProposal): string[] {
    const conflicts: string[] = [];

    // Simplified conflict detection
    if (proposal.description.toLowerCase().includes('stagger')) {
      conflicts.push('Staggered schedules may impact staff availability.');
    }
    if (proposal.description.toLowerCase().includes('batch')) {
      conflicts.push('Batch timing affects prep area utilization.');
    }

    return conflicts;
  }
}

export const strategyAuditor = new StrategyAuditor();
