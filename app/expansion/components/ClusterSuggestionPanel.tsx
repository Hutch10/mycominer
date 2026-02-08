import { ClusterGeneratorReport } from '../engine/expansionTypes';

export function ClusterSuggestionPanel({ report }: { report: ClusterGeneratorReport }) {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-900">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Cluster Suggestions</h3>

      <div className="mt-3 space-y-3">
        {report.proposals.length === 0 ? (
          <p className="text-sm text-gray-700 dark:text-gray-300">No new clusters proposed.</p>
        ) : (
          report.proposals.map((proposal) => (
            <div key={proposal.name} className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded border border-gray-100 dark:border-gray-800">
              <p className="font-semibold text-gray-900 dark:text-gray-100">{proposal.name}</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{proposal.rationale}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {proposal.members.map((member) => (
                  <span key={member} className="px-2 py-1 text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-200 rounded">{member}</span>
                ))}
              </div>
              <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">Cross-links: {proposal.crossLinks.join(', ')}</div>
            </div>
          ))
        )}
      </div>

      <div className="mt-3 text-sm text-gray-800 dark:text-gray-200">
        <p className="font-semibold">Imbalance Warnings</p>
        <ul className="list-disc ml-4 space-y-1">
          {report.imbalanceWarnings.length === 0 ? <li>None</li> : report.imbalanceWarnings.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </div>

      <div className="mt-3 text-sm text-gray-800 dark:text-gray-200">
        <p className="font-semibold">Cross-Link Suggestions</p>
        <ul className="list-disc ml-4 space-y-1">
          {report.crossLinkSuggestions.length === 0 ? <li>None</li> : report.crossLinkSuggestions.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </div>
    </div>
  );
}
