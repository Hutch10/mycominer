'use client';

import { OptimizationAuditResult } from '@/app/optimization/optimizationTypes';

interface Props {
  results: OptimizationAuditResult[];
}

export function OptimizationAuditPanel({ results }: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-500">Audit Results</div>
          <h2 className="text-xl font-bold text-slate-900">Safety checks</h2>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {results.map((result) => {
          const decisionColor =
            result.decision === 'allow'
              ? 'bg-emerald-50 border-emerald-200'
              : result.decision === 'warn'
              ? 'bg-amber-50 border-amber-200'
              : 'bg-rose-50 border-rose-200';

          const decisionBg =
            result.decision === 'allow'
              ? 'bg-emerald-100 text-emerald-800'
              : result.decision === 'warn'
              ? 'bg-amber-100 text-amber-800'
              : 'bg-rose-100 text-rose-800';

          return (
            <div key={result.auditId} className={`rounded-lg border p-3 ${decisionColor}`}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="text-sm font-semibold text-slate-900">{result.proposalId}</div>
                  {result.rationale.length > 0 && (
                    <ul className="list-disc list-inside text-xs text-slate-700 mt-2 space-y-1">
                      {result.rationale.slice(0, 2).map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${decisionBg}`}>
                  {result.decision.toUpperCase()}
                </span>
              </div>

              {result.recommendations.length > 0 && (
                <div className="mt-3 pt-3 border-t border-current border-opacity-20 text-xs text-slate-700 space-y-1">
                  {result.recommendations.slice(0, 2).map((rec, i) => (
                    <div key={i}>→ {rec}</div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
