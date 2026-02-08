'use client';

import { useEffect, useState } from 'react';

// Use Next.js API routes (frontend proxy)
const API_BASE_URL = '/api';

interface SystemStats {
  logs: number;
  graphNodes: number;
  workflows: number;
  activeSessions: number;
  timestamp: string;
}

interface StatsBarProps {
  sessionId: string;
  refreshInterval?: number;
}

export default function StatsBar({ sessionId, refreshInterval = 5000 }: StatsBarProps) {
  const [stats, setStats] = useState<SystemStats>({
    logs: 0,
    graphNodes: 0,
    workflows: 0,
    activeSessions: 0,
    timestamp: new Date().toISOString(),
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const [govRes, graphRes] = await Promise.all([
          fetch(`${API_BASE_URL}/governance?sessionId=${sessionId}`),
          fetch(`${API_BASE_URL}/explainability?sessionId=${sessionId}`),
        ]);

        const govData = govRes.ok ? await govRes.json() : null;
        const graphData = graphRes.ok ? await graphRes.json() : null;

        setStats({
          logs: govData?.logs?.length || 0,
          graphNodes: graphData?.graph?.nodes?.length || 0,
          workflows: 0,
          activeSessions: sessionId ? 1 : 0,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, refreshInterval);
    return () => clearInterval(interval);
  }, [sessionId, refreshInterval]);

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="grid grid-cols-4 gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <div>
              <div className="text-gray-600 dark:text-gray-400">Logs</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                {isLoading ? '...' : stats.logs}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <div>
              <div className="text-gray-600 dark:text-gray-400">Graph Nodes</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                {isLoading ? '...' : stats.graphNodes}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div>
              <div className="text-gray-600 dark:text-gray-400">Workflows</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                {isLoading ? '...' : stats.workflows}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <div>
              <div className="text-gray-600 dark:text-gray-400">Session</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-50 font-mono">
                {sessionId.substring(0, 12)}...
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
