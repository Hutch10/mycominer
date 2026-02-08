'use client';

import { StrategyProposal, StrategyPlan } from '@/app/strategy/engine/strategyTypes';
import { strategyLog } from '@/app/strategy/engine/strategyLog';

class StrategyPlanner {
  private plans: StrategyPlan[] = [];

  createPlan(
    name: string,
    description: string,
    proposals: StrategyProposal[],
    priorityOrder?: string[]
  ): StrategyPlan {
    // Evaluate tradeoffs
    const tradeoffs = this.evaluateTradeoffs(proposals);

    // Calculate overall confidence
    const overallConfidence = Math.round(
      proposals.reduce((sum, p) => sum + p.confidenceScore, 0) / Math.max(proposals.length, 1)
    );

    // Calculate impact summary
    const impactSummary = this.calculateImpactSummary(proposals);

    const plan: StrategyPlan = {
      id: `plan-${Date.now()}`,
      name,
      description,
      proposals,
      priorityOrder: priorityOrder || proposals.map((p) => p.id),
      impactSummary,
      tradeoffs,
      overallConfidence,
      approvalsRequired: overallConfidence > 80 ? ['operator'] : ['supervisor'],
      status: 'draft',
    };

    this.plans.push(plan);

    strategyLog.add({
      category: 'plan',
      message: `Strategy plan created: ${name}`,
      context: {
        planId: plan.id,
        proposals: proposals.length,
        confidence: overallConfidence,
      },
    });

    return plan;
  }

  private evaluateTradeoffs(proposals: StrategyProposal[]): string[] {
    const tradeoffs: string[] = [];

    // Check for competing priorities
    const energyProposals = proposals.filter((p) => p.type === 'energy');
    const yieldProposals = proposals.filter((p) => p.type === 'yield');
    const contaminationProposals = proposals.filter((p) => p.type === 'contamination-mitigation');

    if (energyProposals.length > 0 && yieldProposals.length > 0) {
      tradeoffs.push('Energy reduction may require tighter environmental control, increasing equipment wear.');
    }

    if (energyProposals.length > 0 && contaminationProposals.length > 0) {
      tradeoffs.push(
        'Energy savings (e.g., reduced HVAC) may conflict with contamination risk mitigation (e.g., increased ventilation).'
      );
    }

    if (proposals.some((p) => p.riskLevel === 'high')) {
      tradeoffs.push('Plan includes high-risk proposals; requires careful monitoring and rollback readiness.');
    }

    // Resource cost tradeoffs
    const totalCostProposals = proposals.filter((p) => p.estimatedCost && p.estimatedCost !== 'minimal');
    if (totalCostProposals.length > 0) {
      tradeoffs.push(
        `Plan implementation cost: ${totalCostProposals.map((p) => p.estimatedCost).join(', ')}.`
      );
    }

    if (tradeoffs.length === 0) {
      tradeoffs.push('No major tradeoffs detected; proposals are largely complementary.');
    }

    return tradeoffs;
  }

  private calculateImpactSummary(proposals: StrategyProposal[]): StrategyPlan['impactSummary'] {
    let estimatedEnergyReduction = 0;
    let estimatedYieldIncrease = 0;
    let contaminationRiskReduction = 0;
    const resourcesRequired = new Set<string>();

    proposals.forEach((p) => {
      if (p.type === 'energy') {
        // Extract percentage from "15-25% reduction" style text
        const match = p.expectedBenefit.match(/(\d+)-?(\d*)%/);
        if (match) {
          estimatedEnergyReduction += parseInt(match[1]);
        }
      }
      if (p.type === 'yield') {
        const match = p.expectedBenefit.match(/(\d+)-?(\d*)%/);
        if (match) {
          estimatedYieldIncrease += parseInt(match[1]);
        }
      }
      if (p.type === 'contamination-mitigation') {
        const match = p.expectedBenefit.match(/(\d+)-?(\d*)%/);
        if (match) {
          contaminationRiskReduction += parseInt(match[1]);
        }
      }

      if (p.estimatedCost && p.estimatedCost !== 'minimal') {
        resourcesRequired.add(p.estimatedCost);
      }
    });

    return {
      estimatedEnergyReduction: estimatedEnergyReduction > 0 ? estimatedEnergyReduction : undefined,
      estimatedYieldIncrease: estimatedYieldIncrease > 0 ? estimatedYieldIncrease : undefined,
      contaminationRiskReduction: contaminationRiskReduction > 0 ? contaminationRiskReduction : undefined,
      resourcesRequired: resourcesRequired.size > 0 ? Array.from(resourcesRequired) : undefined,
    };
  }

  approvePlan(planId: string, approver: string, notes: string = ''): StrategyPlan | undefined {
    const plan = this.plans.find((p) => p.id === planId);
    if (!plan) return undefined;

    plan.status = 'approved' as const;
    plan.approvalNotes = notes;

    strategyLog.add({
      category: 'approval',
      message: `Plan approved by ${approver}`,
      context: { planId, approver, notes },
    });

    return plan;
  }

  rejectPlan(planId: string, approver: string, notes: string): StrategyPlan | undefined {
    const plan = this.plans.find((p) => p.id === planId);
    if (!plan) return undefined;

    plan.status = 'rejected' as const;
    plan.approvalNotes = notes;

    strategyLog.add({
      category: 'approval',
      message: `Plan rejected by ${approver}`,
      context: { planId, approver, notes },
    });

    return plan;
  }

  list(): StrategyPlan[] {
    return [...this.plans].reverse();
  }

  get(id: string): StrategyPlan | undefined {
    return this.plans.find((p) => p.id === id);
  }
}

export const strategyPlanner = new StrategyPlanner();
