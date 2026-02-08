'use client';

// Phase 26: Research Insights Panel
// Displays generated insights with severity and recommended actions

import type { ResearchInsight } from '../researchTypes';

interface ResearchInsightsPanelProps {
  insights: ResearchInsight[];
}

export function ResearchInsightsPanel({ insights }: ResearchInsightsPanelProps) {
  const highSeverity = insights.filter((i) => i.severity === 'high');
  const mediumSeverity = insights.filter((i) => i.severity === 'medium');
  const lowSeverity = insights.filter((i) => i.severity === 'low');

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700';
      case 'medium':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700';
      case 'low':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700';
      default:
        return 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700';
    }
  };

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200';
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200';
      case 'low':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'variable-impact':
        return '📊';
      case 'cross-facility-pattern':
        return '🏭';
      case 'historical-trend':
        return '📈';
      case 'anomaly-detection':
        return '⚠️';
      case 'optimization-opportunity':
        return '✨';
      case 'next-experiment':
        return '🔬';
      default:
        return '•';
    }
  };

  const renderInsightGroup = (title: string, insightList: ResearchInsight[]) => {
    if (insightList.length === 0) return null;

    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
          {title} ({insightList.length})
        </h3>
        <div className="space-y-3">
          {insightList.map((insight) => (
            <div
              key={insight.insightId}
              className={`p-4 rounded border ${getSeverityColor(insight.severity)}`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{getTypeIcon(insight.type)}</span>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                    {insight.title}
                  </h4>
                </div>
                <span className={`px-2 py-1 text-xs rounded ${getSeverityBadgeColor(insight.severity)}`}>
                  {insight.severity}
                </span>
              </div>

              <p className="text-gray-700 dark:text-gray-300 mb-3">{insight.summary}</p>

              <div className="mb-3">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Evidence:
                </div>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  {insight.evidence.map((e, idx) => (
                    <li key={idx} className="ml-4">
                      • {e}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-3 bg-white dark:bg-gray-800 p-3 rounded">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Why This Matters:
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{insight.whyThisMatters}</p>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Suggested Next Steps:
                </div>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  {insight.suggestedNextSteps.map((step, idx) => (
                    <li key={idx} className="ml-4">
                      {idx + 1}. {step}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                Type: {insight.type} • {new Date(insight.timestamp).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">
          Research Insights
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Pattern-based insights and recommended actions from experimental data
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {highSeverity.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">High Severity</div>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {mediumSeverity.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Medium Severity</div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {lowSeverity.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Low Severity</div>
        </div>
      </div>

      {/* Insights by severity */}
      {renderInsightGroup('High Severity Insights', highSeverity)}
      {renderInsightGroup('Medium Severity Insights', mediumSeverity)}
      {renderInsightGroup('Low Severity Insights', lowSeverity)}

      {insights.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No insights generated yet. Complete experiments to generate insights.
        </div>
      )}
    </div>
  );
}
