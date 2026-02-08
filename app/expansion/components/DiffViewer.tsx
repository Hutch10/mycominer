import { DiffChunk } from '../engine/expansionTypes';

const lineClass = {
  context: 'text-gray-700 dark:text-gray-300',
  add: 'text-green-700 dark:text-green-300',
  remove: 'text-red-700 dark:text-red-300',
};

export function DiffViewer({ diff }: { diff: DiffChunk[] }) {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-900">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Diff Viewer</h3>
      <div className="mt-3 space-y-3">
        {diff.map((chunk) => (
          <div key={chunk.header} className="bg-gray-50 dark:bg-gray-800/60 rounded p-3 border border-gray-100 dark:border-gray-800">
            <p className="text-xs uppercase text-gray-500 dark:text-gray-400 mb-2">{chunk.header}</p>
            <pre className="text-sm whitespace-pre-wrap font-mono">
              {chunk.lines.map((line, idx) => (
                <div key={`${line.type}-${idx}`} className={lineClass[line.type]}>
                  {line.type === 'add' ? '+ ' : line.type === 'remove' ? '- ' : '  '}
                  {line.value}
                </div>
              ))}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}
