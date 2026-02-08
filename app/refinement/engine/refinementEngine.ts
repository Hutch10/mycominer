'use client';

import { ValidatedInsight, RefinementProposal, RefinementKind } from './refinementTypes';
import { refinementLog } from './refinementLog';

class RefinementEngine {
  private proposals: RefinementProposal[] = [];

  ingestInsights(insights: ValidatedInsight[]): RefinementProposal[] {
    const created: RefinementProposal[] = insights.map((insight) => this.createProposalFromInsight(insight)).filter(Boolean) as RefinementProposal[];
    this.proposals.push(...created);
    return created;
  }

  list(): RefinementProposal[] {
    return [...this.proposals].reverse();
  }

  get(id: string): RefinementProposal | undefined {
    return this.proposals.find((p) => p.id === id);
  }

  updateStatus(id: string, status: RefinementProposal['status']) {
    const proposal = this.get(id);
    if (!proposal) return;
    proposal.status = status;
    refinementLog.add({ category: 'proposal', message: `Status -> ${status}`, context: { id } });
  }

  private createProposalFromInsight(insight: ValidatedInsight): RefinementProposal {
    const id = `ref-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`;
    const rationale = `Derived from validated insight ${insight.id} (${insight.title})`;
    const mapping: Record<ValidatedInsight['kind'], RefinementKind> = {
      'knowledge-graph': 'knowledge-graph',
      'cluster-weights': 'cluster-weights',
      'tag-relationships': 'tag-relationships',
      'troubleshooting-patterns': 'troubleshooting-patterns',
      'optimization-heuristics': 'optimization-heuristics',
      'environmental-targets': 'environmental-targets',
    } as any;

    const kind = mapping[insight.kind] ?? 'knowledge-graph';
    const description = `Propose update to ${kind} informed by ${insight.summary}`;

    const proposal: RefinementProposal = {
      id,
      kind,
      title: insight.title,
      description,
      rationale,
      expectedImpact: 'Improve recommendation accuracy while preserving safety envelopes',
      riskLevel: 'medium',
      sourceInsights: [insight.id],
      status: 'proposed',
    };

    refinementLog.add({ category: 'proposal', message: 'Proposal created from insight', context: { id, insightId: insight.id, kind } });
    return proposal;
  }
}

export const refinementEngine = new RefinementEngine();
