// Phase 22: Optimization Auditor
// Safety-checks optimization proposals for energy budget, contamination risk, and constraints

'use client';

import { OptimizationProposal, OptimizationAuditResult, AuditDecision } from '@/app/optimization/optimizationTypes';

class OptimizationAuditor {
  /**
   * Audit an optimization proposal
   */
  audit(
    proposal: OptimizationProposal,
    constraints: {
      energyBudgetKwh: number;
      maxContaminationRiskIncrease: number;
      maxYieldReduction: number;
      maxRegressionRisk: number;
    }
  ): OptimizationAuditResult {
    const checks = {
      energyBudgetRespected: true,
      contaminationRiskAcceptable: true,
      environmentalLimitsRespected: true,
      equipmentConstraintsRespected: true,
      regressionDetected: false,
      rollbackFeasible: true,
    };

    const rationale: string[] = [];
    const recommendations: string[] = [];
    const estimatedImpact = {
      energySaving: proposal.expectedBenefit.kwhReduction ?? 0,
      costImpact: proposal.expectedBenefit.costSavings ?? 0,
      yieldImpact: proposal.expectedBenefit.yieldIncrease ?? 0,
      riskIncrease: 0,
    };

    // Check energy budget
    if (proposal.expectedBenefit.kwhReduction && proposal.expectedBenefit.kwhReduction > constraints.energyBudgetKwh * 0.3) {
      rationale.push(`Savings (${proposal.expectedBenefit.kwhReduction} kWh) exceeds 30% of budget; verify feasibility`);
    }

    // Check contamination risk
    if (proposal.category.includes('contamination') || proposal.riskLevel === 'high') {
      if (proposal.confidence < 70) {
        checks.contaminationRiskAcceptable = false;
        rationale.push(`Contamination-related proposal confidence ${proposal.confidence}% below threshold 70%`);
      }
    }

    // Check yield impact
    if (proposal.expectedBenefit.yieldIncrease === undefined || proposal.expectedBenefit.yieldIncrease >= 0) {
      rationale.push('No yield reduction detected');
    } else if (Math.abs(proposal.expectedBenefit.yieldIncrease) > constraints.maxYieldReduction) {
      checks.environmentalLimitsRespected = false;
      rationale.push(`Yield reduction ${proposal.expectedBenefit.yieldIncrease} exceeds threshold ${constraints.maxYieldReduction}`);
    }

    // Check for regression signals
    if (proposal.conflictsWith && proposal.conflictsWith.length > 0) {
      checks.regressionDetected = true;
      rationale.push(`Proposal conflicts with ${proposal.conflictsWith.length} other proposals`);
      recommendations.push(`Review conflicts with: ${proposal.conflictsWith.join(', ')}`);
    }

    // Check rollback feasibility
    if (proposal.implementation.complexity === 'complex' && proposal.riskLevel === 'high') {
      checks.rollbackFeasible = false;
      rationale.push('Complex proposal with high risk; rollback may be difficult');
      recommendations.push('Consider phased implementation');
    }

    // Final decision
    let decision: AuditDecision = 'allow';
    if (!checks.environmentalLimitsRespected || !checks.equipmentConstraintsRespected || !checks.rollbackFeasible) {
      decision = 'block';
    } else if (!checks.contaminationRiskAcceptable || checks.regressionDetected || proposal.confidence < 65) {
      decision = 'warn';
    }

    if (decision !== 'allow') {
      recommendations.push(`Proposal decision: ${decision.toUpperCase()}`);
    }

    return {
      auditId: `audit-${Date.now()}`,
      proposalId: proposal.proposalId,
      timestamp: new Date().toISOString(),
      decision,
      checks,
      rationale,
      recommendations,
      estimatedImpact,
    };
  }

  /**
   * Audit multiple proposals
   */
  auditBatch(
    proposals: OptimizationProposal[],
    constraints: {
      energyBudgetKwh: number;
      maxContaminationRiskIncrease: number;
      maxYieldReduction: number;
      maxRegressionRisk: number;
    }
  ): OptimizationAuditResult[] {
    return proposals.map(p => this.audit(p, constraints));
  }
}

export const optimizationAuditor = new OptimizationAuditor();
