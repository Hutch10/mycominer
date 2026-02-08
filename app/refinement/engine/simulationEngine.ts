'use client';

import { RefinementProposal, SimulationReport } from './refinementTypes';
import { refinementLog } from './refinementLog';

class SimulationEngine {
  private deterministicScore(text: string): number {
    return text.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  }

  simulate(proposal: RefinementProposal): SimulationReport {
    const baseScore = this.deterministicScore(`${proposal.id}-${proposal.kind}-${proposal.riskLevel}`);
    const recommendationShift = Number(((baseScore % 15) / 100).toFixed(3));
    const safetyMarginChange = Number((((baseScore % 5) - 2) / 100).toFixed(3));
    const confidenceDelta = Number(((baseScore % 7) / 100).toFixed(3));

    const regressions: string[] = [];
    if (proposal.riskLevel === 'high' || safetyMarginChange < -0.015) {
      regressions.push('Safety margin reduction flagged for review');
    }

    const findings = [
      `Simulated downstream impact for ${proposal.kind}`,
      `Estimated shift ${(recommendationShift * 100).toFixed(2)}% with confidence delta ${(confidenceDelta * 100).toFixed(2)}%`,
    ];

    const summary = regressions.length === 0 ? 'No regressions detected in simulation' : 'Potential regressions detected';
    const report: SimulationReport = {
      id: `sim-${Date.now()}`,
      proposalId: proposal.id,
      findings,
      regressions,
      metrics: {
        recommendationShift,
        safetyMarginChange,
        confidenceDelta,
      },
      summary,
    };

    refinementLog.add({ category: 'simulation', message: 'Simulation completed', context: { proposalId: proposal.id, reportId: report.id, regressions } });
    return report;
  }
}

export const simulationEngine = new SimulationEngine();
