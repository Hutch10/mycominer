'use client';

import { ClusterInfo } from '../utils/graphData';

interface ClusterLegendProps {
  clusters: ClusterInfo[];
  selectedClusters: Set<string>;
  onToggleCluster: (clusterId: string) => void;
}

export default function ClusterLegend({
  clusters,
  selectedClusters,
  onToggleCluster
}: ClusterLegendProps) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
        <span>🎨</span> Knowledge Clusters
      </h3>
      <div className="space-y-2">
        {clusters.map((cluster) => (
          <label
            key={cluster.id}
            className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded cursor-pointer transition-colors"
          >
            <input
              type="checkbox"
              checked={selectedClusters.has(cluster.id)}
              onChange={() => onToggleCluster(cluster.id)}
              className="w-4 h-4 rounded border-gray-300 cursor-pointer"
            />
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: cluster.color }}
            />
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {cluster.name}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {cluster.description}
              </div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
