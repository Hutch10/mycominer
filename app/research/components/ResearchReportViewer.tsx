'use client';

// Phase 26: Research Report Viewer
// Displays comprehensive research reports

import type { ResearchReport } from '../researchTypes';

interface ResearchReportViewerProps {
  reports: ResearchReport[];
}

export function ResearchReportViewer({ reports }: ResearchReportViewerProps) {
  if (reports.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        No research reports generated yet.
      </div>
    );
  }

  const latestReport = reports[0];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">
          Research Reports
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Comprehensive analysis and recommendations
        </p>
      </div>

      {/* Latest report */}
      <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Research Report
          </h3>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {new Date(latestReport.generatedAt).toLocaleString()}
          </div>
        </div>

        {/* Methodology */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Methodology</h4>
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded">
            <div className="grid grid-cols-3 gap-4 mb-3">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Experiments</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {latestReport.methodology.experimentCount}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Comparisons</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {latestReport.methodology.totalComparisons}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Insights</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {latestReport.methodology.insightsGenerated}
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {latestReport.methodology.approach}
            </p>
          </div>
        </div>

        {/* Results */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Results</h4>
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded">
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Positive</div>
                <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                  {latestReport.results.positiveChanges}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Negative</div>
                <div className="text-lg font-semibold text-red-600 dark:text-red-400">
                  {latestReport.results.negativeChanges}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">No Change</div>
                <div className="text-lg font-semibold text-gray-600 dark:text-gray-400">
                  {latestReport.results.noChanges}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Avg Delta</div>
                <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                  {latestReport.results.averageDeltaPercent}%
                </div>
              </div>
            </div>

            {latestReport.results.significantFindings.length > 0 && (
              <div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Significant Findings:
                </div>
                <div className="space-y-2">
                  {latestReport.results.significantFindings.map((finding, idx) => (
                    <div
                      key={idx}
                      className="bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {finding.metric}
                        </span>
                        <span
                          className={`font-semibold ${
                            finding.direction === 'increase'
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}
                        >
                          {finding.delta} ({finding.significance})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Insights summary */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Insights Summary</h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded">
              <div className="text-sm text-gray-600 dark:text-gray-400">High Severity</div>
              <div className="text-xl font-bold text-red-600 dark:text-red-400">
                {latestReport.insights.high.length}
              </div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded">
              <div className="text-sm text-gray-600 dark:text-gray-400">Medium Severity</div>
              <div className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
                {latestReport.insights.medium.length}
              </div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
              <div className="text-sm text-gray-600 dark:text-gray-400">Low Severity</div>
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {latestReport.insights.low.length}
              </div>
            </div>
          </div>
        </div>

        {/* Conclusions */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Conclusions</h4>
          <ul className="bg-gray-50 dark:bg-gray-900 p-4 rounded space-y-2">
            {latestReport.conclusions.map((conclusion, idx) => (
              <li key={idx} className="text-gray-700 dark:text-gray-300">
                • {conclusion}
              </li>
            ))}
          </ul>
        </div>

        {/* Recommendations */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Recommendations</h4>
          <ul className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded space-y-2">
            {latestReport.recommendations.map((rec, idx) => (
              <li key={idx} className="text-gray-700 dark:text-gray-300">
                {idx + 1}. {rec}
              </li>
            ))}
          </ul>
        </div>

        {/* Next experiments */}
        {latestReport.nextExperiments.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Suggested Next Experiments
            </h4>
            <ul className="bg-green-50 dark:bg-green-900/20 p-4 rounded space-y-2">
              {latestReport.nextExperiments.map((exp, idx) => (
                <li key={idx} className="text-gray-700 dark:text-gray-300">
                  {idx + 1}. {exp}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* All reports list */}
      {reports.length > 1 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
            Previous Reports
          </h3>
          <div className="space-y-2">
            {reports.slice(1).map((report) => (
              <div
                key={report.reportId}
                className="bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {report.methodology.experimentCount} experiments,{' '}
                      {report.methodology.totalComparisons} comparisons
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(report.generatedAt).toLocaleString()}
                    </div>
                  </div>
                  <button className="text-blue-600 dark:text-blue-400 text-sm hover:underline">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
