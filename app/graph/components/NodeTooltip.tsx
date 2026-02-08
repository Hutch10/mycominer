'use client';

import { GraphNode } from '../utils/graphData';

interface NodeTooltipProps {
  node: GraphNode | null;
  x: number;
  y: number;
}

export default function NodeTooltip({ node, x, y }: NodeTooltipProps) {
  if (!node) return null;

  return (
    <div
      className="fixed bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-3 z-50 pointer-events-none max-w-xs"
      style={{
        left: `${x + 10}px`,
        top: `${y + 10}px`
      }}
    >
      <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-1">
        {node.label}
      </h3>
      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
        {node.category}
      </p>
      <div className="flex flex-wrap gap-1 mb-2">
        {node.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
          >
            {tag}
          </span>
        ))}
        {node.tags.length > 3 && (
          <span className="text-xs px-1.5 py-0.5 text-gray-500 dark:text-gray-400">
            +{node.tags.length - 3}
          </span>
        )}
      </div>
      <a
        href={node.path}
        className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
      >
        Open Page →
      </a>
    </div>
  );
}
