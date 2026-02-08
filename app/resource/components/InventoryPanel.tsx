// Phase 20: Inventory Panel Component
// Displays current inventory levels with low stock warnings

'use client';

import { InventoryItem } from '@/app/resource/resourceTypes';

interface InventoryPanelProps {
  inventory: InventoryItem[];
  onReplenish?: (item: InventoryItem) => void;
}

export function InventoryPanel({ inventory, onReplenish }: InventoryPanelProps) {
  // Group by category
  const grouped = inventory.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, InventoryItem[]>);

  const getStockStatus = (item: InventoryItem) => {
    const ratio = item.quantityAvailable / item.lowStockThreshold;
    if (ratio < 1) return { label: 'Critical', color: 'text-red-600 dark:text-red-400' };
    if (ratio < 2) return { label: 'Low', color: 'text-yellow-600 dark:text-yellow-400' };
    return { label: 'Good', color: 'text-green-600 dark:text-green-400' };
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        Current Inventory
      </h2>

      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white capitalize mb-3">
            {category.replace('-', ' ')}
          </h3>

          <div className="space-y-2">
            {items.map(item => {
              const status = getStockStatus(item);
              const stockPercent = (item.quantityAvailable / (item.lowStockThreshold * 5)) * 100;

              return (
                <div
                  key={item.name}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {item.name}
                      </span>
                      <span className={`text-sm font-semibold ${status.color}`}>
                        {status.label}
                      </span>
                    </div>

                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {item.quantityAvailable} {item.unit} available
                      {item.location && ` • ${item.location}`}
                    </div>

                    {/* Stock level bar */}
                    <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          stockPercent < 20
                            ? 'bg-red-500'
                            : stockPercent < 40
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(100, stockPercent)}%` }}
                      />
                    </div>

                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Reorder at {item.lowStockThreshold} {item.unit} • Unit cost: $
                      {item.unitCost.toFixed(2)}
                    </div>
                  </div>

                  {onReplenish && item.quantityAvailable < item.lowStockThreshold * 2 && (
                    <button
                      onClick={() => onReplenish(item)}
                      className="ml-4 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      Replenish
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
