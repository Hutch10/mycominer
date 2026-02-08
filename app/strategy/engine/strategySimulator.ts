'use client';

import { StrategyProposal, StrategyImpactReport, StrategySimulationConfig } from '@/app/strategy/engine/strategyTypes';
import { strategyLog } from '@/app/strategy/engine/strategyLog';

class StrategySimulator {
  runSimulation(config: StrategySimulationConfig, proposal: StrategyProposal): StrategyImpactReport {
    // Deterministic simulation based on proposal type and baseline
    const baseScore = this.deterministicScore(`${proposal.id}-${config.baseline}`);

    let projectedEnergyUsage = 100; // kWh baseline
    let projectedYield = 1000; // arbitrary units
    let contaminationRiskScore = 35; // 0-100
    let environmentalStability: StrategyImpactReport['environmentalStability'] = 'stable';
    const findings: string[] = [];
    const warnings: string[] = [];
    const positiveOutcomes: string[] = [];
    const sideEffects: string[] = [];

    // Simulation varies by proposal type
    if (proposal.type === 'energy') {
      projectedEnergyUsage = 100 - ((baseScore % 25) + 10); // 10-35% reduction
      positiveOutcomes.push(`Estimated energy reduction to ${projectedEnergyUsage.toFixed(0)} kWh (${((100 - projectedEnergyUsage) / 100 * 100).toFixed(0)}%)`);

      if ((baseScore % 10) > 7) {
        warnings.push('Aggressive energy savings may slightly reduce environmental stability.');
        environmentalStability = 'oscillating';
      }
    }

    if (proposal.type === 'yield') {
      const yieldGain = (baseScore % 20) + 5; // 5-25% gain
      projectedYield = 1000 * (1 + yieldGain / 100);
      positiveOutcomes.push(`Estimated yield increase to ${projectedYield.toFixed(0)} units (${yieldGain.toFixed(0)}% gain)`);
    }

    if (proposal.type === 'contamination-mitigation') {
      const riskReduction = (baseScore % 30) + 20; // 20-50% reduction
      contaminationRiskScore = Math.max(15, 35 - riskReduction);
      positiveOutcomes.push(`Contamination risk reduced to ${contaminationRiskScore}/100 (${riskReduction.toFixed(0)}% reduction)`);

      if (contaminationRiskScore < 25) {
        findings.push('Proposal effectively addresses identified contamination vectors.');
      }
    }

    // Add generic findings
    findings.push(`Simulation duration: ${config.duration} minutes`);
    findings.push(`Baseline: ${config.baseline}`);

    // Detect potential side effects
    if (proposal.affectedSystems.length > 3) {
      warnings.push('Changes affect multiple systems; cross-system interactions possible.');
    }

    if (environmentalStability === 'oscillating') {
      sideEffects.push('Potential environmental oscillation detected.');
    }

    const summary = `Simulation of "${proposal.title}" shows ${positiveOutcomes.length > 0 ? 'positive' : 'neutral'} outcomes. ${warnings.length > 0 ? 'Several cautions apply.' : 'No major side effects detected.'}`;

    const report: StrategyImpactReport = {
      id: `impact-${Date.now()}`,
      proposalId: proposal.id,
      duration: config.duration,
      projectedEnergyUsage,
      projectedYield: projectedYield > 900 ? projectedYield : undefined,
      contaminationRiskScore,
      environmentalStability,
      findings,
      warnings,
      positiveOutcomes,
      sideEffects,
      summary,
    };

    strategyLog.add({
      category: 'simulation',
      message: `Impact simulation completed for proposal: ${proposal.title}`,
      context: {
        reportId: report.id,
        proposalId: proposal.id,
        stability: environmentalStability,
      },
    });

    return report;
  }

  private deterministicScore(text: string): number {
    return text.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  }
}

export const strategySimulator = new StrategySimulator();
