'use client';

import { SafetyGateResult } from '@/app/execution/executionTypes';

interface Props {
  results: SafetyGateResult[];
}

export function SafetyGatePanel({ results }: Props) {
  const hasIssues = results.some(r => r.decision !== 'allow');

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-500">Safety Gate</div>
          <h2 className="text-xl font-bold text-slate-900">Pre-step checks</h2>
          <p className="text-sm text-slate-600">{results.length} evaluations</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${hasIssues ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
          {hasIssues ? 'Intervention required' : 'All clear'}
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {results.map(result => (
          <div key={result.gateId} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-800">{result.stepId}</div>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                result.decision === 'allow' ? 'bg-emerald-100 text-emerald-800' :
                result.decision === 'warn' ? 'bg-amber-100 text-amber-800' :
                'bg-rose-100 text-rose-800'
              }`}>
                {result.decision}
              </span>
            </div>
            {result.rationale.length > 0 && (
              <ul className="mt-2 list-disc list-inside text-sm text-slate-700 space-y-1">
                {result.rationale.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
            {result.recommendedAlternatives.length > 0 && (
              <div className="mt-2 text-xs text-slate-600">
                Alternatives: {result.recommendedAlternatives.join('; ')}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
