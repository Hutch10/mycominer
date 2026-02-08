'use client';

import { AnonymizedContribution, GlobalInsight, ValidationResult } from './exchangeTypes';
import { exchangeLog } from './exchangeLog';

class GlobalInsightRouter {
  private insights: GlobalInsight[] = [];

  route(contrib: AnonymizedContribution, validation: ValidationResult): GlobalInsight | null {
    if (validation.status !== 'accepted') return null;
    const insight: GlobalInsight = {
      id: `insight-${Date.now()}`,
      title: this.buildTitle(contrib),
      summary: JSON.stringify(contrib.summary),
      tags: validation.tags,
      confidence: validation.confidence,
      kind: contrib.kind,
      relatedSpecies: contrib.species,
      relatedStage: contrib.stage,
    };
    this.insights.push(insight);
    exchangeLog.add({
      id: `log-${Date.now()}`,
      timestamp: Date.now(),
      category: 'routing',
      message: 'Insight merged into global graph',
      context: { insightId: insight.id },
    });
    return insight;
  }

  list(): GlobalInsight[] {
    return [...this.insights].reverse();
  }

  private buildTitle(contrib: AnonymizedContribution): string {
    if (contrib.kind === 'pattern') return 'New observed pattern';
    if (contrib.kind === 'optimization') return 'Optimization heuristic';
    if (contrib.kind === 'anomaly') return 'Anomaly signature';
    return 'Correlation insight';
  }
}

export const globalInsightRouter = new GlobalInsightRouter();
