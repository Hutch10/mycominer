'use client';

import { RawContribution, AnonymizedContribution } from './exchangeTypes';
import { exchangeLog } from './exchangeLog';

class AnonymizationLayer {
  anonymize(contrib: RawContribution): AnonymizedContribution {
    const timeBucket = contrib.timestamp ? this.bucketTime(contrib.timestamp) : 'unknown';
    const summary = this.aggregate(contrib.payload);

    const safe: AnonymizedContribution = {
      id: contrib.id,
      kind: contrib.kind,
      source: contrib.source,
      species: contrib.species,
      stage: contrib.stage,
      timeBucket,
      summary,
    };

    exchangeLog.add({
      id: `log-${Date.now()}`,
      timestamp: Date.now(),
      category: 'anonymization',
      message: 'Anonymized contribution',
      context: { id: contrib.id, timeBucket },
    });

    return safe;
  }

  private bucketTime(ts: number): string {
    const date = new Date(ts);
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  }

  private aggregate(payload: Record<string, any>): Record<string, any> {
    const summary: Record<string, any> = {};
    const metrics = payload?.metrics;
    if (metrics) {
      summary.count = metrics.count;
      if (Array.isArray(metrics.values) && metrics.values.length > 0) {
        const avg = metrics.values.reduce((a: number, b: number) => a + b, 0) / metrics.values.length;
        summary.mean = Number(avg.toFixed(2));
      }
    }
    if (payload?.pattern) summary.pattern = payload.pattern;
    if (payload?.correlation) summary.correlation = payload.correlation;
    return summary;
  }
}

export const anonymizationLayer = new AnonymizationLayer();
