'use client';

// Phase 26: Comparison Results Panel
// Displays statistical comparisons between control and experimental groups

import type { ComparisonResult, ExperimentProposal } from '../researchTypes';

interface ComparisonResultsPanelProps {
  comparisons: ComparisonResult[];
  experiments: ExperimentProposal[];
}

export function ComparisonResultsPanel({ comparisons, experiments }: ComparisonResultsPanelProps) {
  const significantComparisons = comparisons.filter(
    (c) => c.significance === 'high' || c.significance === 'medium'
  );

  const getExperimentById = (experimentId: string) => {
    return experiments.find((e) => e.experimentId === experimentId);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">
          Comparison Results
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Statistical comparisons between control and experimental groups
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {comparisons.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Comparisons</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {comparisons.filter((c) => c.direction === 'increase').length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Improvements</div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {comparisons.filter((c) => c.direction === 'decrease').length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Declines</div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {significantComparisons.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Significant Findings</div>
        </div>
      </div>

      {/* Significant comparisons */}
      {significantComparisons.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
            Significant Findings
          </h3>
          <div className="space-y-3">
            {significantComparisons.map((comp) => {
              const experiment = getExperimentById(comp.experimentId);
              return (
                <div
                  key={comp.comparisonId}
                  className="bg-white dark:bg-gray-800 p-4 rounded border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                        {comp.metric.replace(/-/g, ' ').toUpperCase()}
                      </h4>
                      {experiment && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {experiment.hypothesis}
                        </p>
                      )}
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        comp.significance === 'high'
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                          : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
                      }`}
                    >
                      {comp.significance}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Control</div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {comp.controlValue.toFixed(2)} {comp.unit}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Experimental</div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {comp.experimentalValue.toFixed(2)} {comp.unit}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Delta</div>
                      <div
                        className={`text-lg font-semibold ${
                          comp.direction === 'increase'
                            ? 'text-green-600 dark:text-green-400'
                            : comp.direction === 'decrease'
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {comp.deltaPercent > 0 ? '+' : ''}
                        {comp.deltaPercent}%
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <div>
                      Sample size: {comp.statistics.sampleSize} | Control σ:{' '}
                      {comp.statistics.controlStdDev.toFixed(2)} | Experimental σ:{' '}
                      {comp.statistics.experimentalStdDev.toFixed(2)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* All comparisons */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
          All Comparisons
        </h3>
        <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                  Metric
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                  Control
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                  Experimental
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                  Delta
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                  Significance
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {comparisons.map((comp) => (
                <tr key={comp.comparisonId}>
                  <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">
                    {comp.metric}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                    {comp.controlValue.toFixed(2)} {comp.unit}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                    {comp.experimentalValue.toFixed(2)} {comp.unit}
                  </td>
                  <td
                    className={`px-4 py-2 text-sm font-medium ${
                      comp.direction === 'increase'
                        ? 'text-green-600 dark:text-green-400'
                        : comp.direction === 'decrease'
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {comp.deltaPercent > 0 ? '+' : ''}
                    {comp.deltaPercent}%
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                    {comp.significance}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
