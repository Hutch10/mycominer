'use client';

interface GraphSidebarProps {
  nodeCount: number;
  edgeCount: number;
  clusterCount: number;
  selectedNode: { label: string; category: string } | null;
}

export default function GraphSidebar({
  nodeCount,
  edgeCount,
  clusterCount,
  selectedNode
}: GraphSidebarProps) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
      {/* Stats */}
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <span>📊</span> Graph Statistics
        </h3>
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Nodes:</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">{nodeCount}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Edges:</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">{edgeCount}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Clusters:</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">{clusterCount}</span>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700"></div>

      {/* Controls */}
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <span>🎮</span> Controls
        </h3>
        <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
          <p>• <strong>Scroll:</strong> Zoom in/out</p>
          <p>• <strong>Drag:</strong> Pan around</p>
          <p>• <strong>Hover:</strong> View details</p>
          <p>• <strong>Click:</strong> Open page</p>
        </div>
      </div>

      {selectedNode && (
        <>
          <div className="border-t border-gray-200 dark:border-gray-700"></div>
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <span>📍</span> Selected Node
            </h3>
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                {selectedNode.label}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {selectedNode.category}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
