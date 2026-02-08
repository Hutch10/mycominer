'use client';

import { useEffect, useState } from 'react';
import { contributionManager } from '../engine/contributionManager';
import { validationEngine } from '../engine/validationEngine';
import { anonymizationLayer } from '../engine/anonymization';
import { globalInsightRouter } from '../engine/globalInsightRouter';
import { exchangeLog } from '../engine/exchangeLog';
import { RawContribution, ValidationResult, AnonymizedContribution, GlobalInsight } from '../engine/exchangeTypes';
import { ContributionCard } from './ContributionCard';
import { ValidationPanel } from './ValidationPanel';
import { AnonymizationPanel } from './AnonymizationPanel';
import { GlobalInsightFeed } from './GlobalInsightFeed';
import { ExchangeLogViewer } from './ExchangeLogViewer';

export function ExchangeDashboard() {
  const [incoming, setIncoming] = useState<RawContribution | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [anon, setAnon] = useState<AnonymizedContribution | null>(null);
  const [insights, setInsights] = useState<GlobalInsight[]>([]);
  const [logs, setLogs] = useState(exchangeLog.list());

  useEffect(() => {
    // seed demo contribution
    const contrib = contributionManager.submit({
      source: 'facility',
      facilityId: 'fac-123',
      species: 'oyster',
      stage: 'fruiting',
      kind: 'pattern',
      payload: { pattern: 'CO2 drop before pinset', metrics: { count: 12, values: [900, 850, 800, 780] } },
      timestamp: Date.now(),
    });
    setIncoming(contrib);
    const val = validationEngine.validate(contrib);
    setValidation(val);
    const anonymized = anonymizationLayer.anonymize(contrib);
    setAnon(anonymized);
    const routed = globalInsightRouter.route(anonymized, val);
    if (routed) setInsights([routed, ...insights]);
    setLogs(exchangeLog.list());
  }, []);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Contribution</p>
          {incoming ? <ContributionCard contribution={incoming} /> : <p className="text-xs text-gray-500 dark:text-gray-400">No contribution</p>}
        </div>
        <ValidationPanel result={validation} />
        <AnonymizationPanel anonymized={anon} />
      </div>

      <GlobalInsightFeed insights={insights} />

      <ExchangeLogViewer logs={logs} />
    </div>
  );
}
