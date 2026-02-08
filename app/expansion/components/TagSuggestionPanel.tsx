import { TagSuggestionReport } from '../engine/expansionTypes';

export function TagSuggestionPanel({ report }: { report: TagSuggestionReport }) {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-900">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Tag Suggestions</h3>

      <div className="mt-3">
        <p className="text-xs uppercase text-gray-500 dark:text-gray-400">Proposed</p>
        <div className="flex flex-wrap gap-2 mt-1">
          {report.proposed.map((tag) => (
            <span key={tag} className="px-2 py-1 text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-200 rounded">{tag}</span>
          ))}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-800 dark:text-gray-200">
        <div>
          <p className="text-xs uppercase text-gray-500 dark:text-gray-400">Unused</p>
          <ul className="list-disc ml-4 space-y-1">
            {report.unused.length === 0 ? <li>None</li> : report.unused.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase text-gray-500 dark:text-gray-400">Redundant</p>
          <ul className="list-disc ml-4 space-y-1">
            {report.redundantPairs.length === 0 ? <li>None</li> : report.redundantPairs.map((pair) => <li key={pair.join('-')}>{pair.join(' / ')}</li>)}
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase text-gray-500 dark:text-gray-400">Validation</p>
          <ul className="list-disc ml-4 space-y-1">
            {report.validationIssues.length === 0 ? <li>None</li> : report.validationIssues.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}
