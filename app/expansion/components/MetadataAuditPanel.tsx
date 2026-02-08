import { MetadataAuditReport } from '../engine/expansionTypes';

export function MetadataAuditPanel({ report }: { report: MetadataAuditReport }) {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-900">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Metadata Audit</h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">Deterministic checks</span>
      </div>

      <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded">
          <p className="text-xs uppercase text-gray-500 dark:text-gray-400">Missing</p>
          <ul className="text-sm text-gray-800 dark:text-gray-200 list-disc ml-4 space-y-1">
            {report.missing.length === 0 ? <li>None</li> : report.missing.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
        <div className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded">
          <p className="text-xs uppercase text-gray-500 dark:text-gray-400">Warnings</p>
          <ul className="text-sm text-gray-800 dark:text-gray-200 list-disc ml-4 space-y-1">
            {report.warnings.length === 0 ? <li>None</li> : report.warnings.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
        <div className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded">
          <p className="text-xs uppercase text-gray-500 dark:text-gray-400">Suggestions</p>
          <ul className="text-sm text-gray-800 dark:text-gray-200 list-disc ml-4 space-y-1">
            {report.suggestions.length === 0 ? <li>None</li> : report.suggestions.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-700 dark:text-gray-300">
        <p className="font-semibold">Generated Metadata</p>
        <p className="mt-1"><span className="font-medium">Title:</span> {report.generatedMetadata.title}</p>
        <p><span className="font-medium">Description:</span> {report.generatedMetadata.description}</p>
        <p><span className="font-medium">Keywords:</span> {report.generatedMetadata.keywords.join(', ')}</p>
        <p><span className="font-medium">Tags:</span> {report.generatedMetadata.tags.join(', ')}</p>
      </div>
    </div>
  );
}
