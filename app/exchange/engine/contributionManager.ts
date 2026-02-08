'use client';

import { RawContribution, ContributionKind, SourceKind } from './exchangeTypes';
import { exchangeLog } from './exchangeLog';

class ContributionManager {
  private queue: RawContribution[] = [];

  submit(input: Omit<RawContribution, 'id'> & { id?: string }): RawContribution {
    const id = input.id ?? `contrib-${Date.now()}`;
    const payload: RawContribution = { ...input, id };
    this.queue.push(payload);
    exchangeLog.add({
      id: `log-${Date.now()}`,
      timestamp: Date.now(),
      category: 'contribution',
      message: 'Contribution received',
      context: { id, source: payload.source, kind: payload.kind },
    });
    return payload;
  }

  classify(contribution: RawContribution): ContributionKind {
    return contribution.kind;
  }

  next(): RawContribution | undefined {
    return this.queue.shift();
  }

  list(): RawContribution[] {
    return [...this.queue];
  }
}

export const contributionManager = new ContributionManager();
