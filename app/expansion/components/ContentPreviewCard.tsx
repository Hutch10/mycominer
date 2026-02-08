import { GeneratedContent } from '../engine/expansionTypes';

export function ContentPreviewCard({ content }: { content: GeneratedContent }) {
  const { metadata, tags, sections, path, safety, related } = content;

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 shadow-sm bg-white dark:bg-gray-900">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Path</p>
          <p className="font-mono text-sm text-gray-800 dark:text-gray-100">{path}</p>
          <h3 className="text-xl font-semibold mt-2 text-gray-900 dark:text-gray-100">{metadata.title}</h3>
          <p className="text-gray-700 dark:text-gray-300 mt-1">{metadata.description}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${safety.status === 'pass' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
          Safety: {safety.status}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span key={tag} className="px-2 py-1 text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-200 rounded">{tag}</span>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {sections.map((section) => (
          <div key={section.title} className="border border-gray-100 dark:border-gray-800 rounded p-3 bg-gray-50 dark:bg-gray-800/50">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{section.title}</p>
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{section.body}</p>
            {section.bullets && (
              <ul className="list-disc ml-5 text-sm text-gray-700 dark:text-gray-300 mt-1 space-y-1">
                {section.bullets.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4">
        <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">Related</p>
        <div className="flex flex-wrap gap-2">
          {related.map((item) => (
            <span key={item.href} className="text-sm text-blue-700 dark:text-blue-300 underline decoration-dotted">{item.title}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
