'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// Use Next.js API routes (frontend proxy)
const API_BASE_URL = '/api';

interface GovernanceLogEntry {
  id: string;
  sessionId: string;
  timestamp: string;
  userMessage: string;
  agentResponse?: string;
  status: 'pending' | 'completed' | 'failed';
  error?: string;
  metadata?: {
    agentId?: string;
    orchestrationScore?: number;
    policyViolations?: number;
  };
}

interface GovernancePanelProps {
  sessionId?: string;
  refreshInterval?: number;
}

export default function GovernancePanel({ 
  sessionId, 
  refreshInterval = 3000 
}: GovernancePanelProps) {
  const [logs, setLogs] = useState<GovernanceLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [filter, setFilter] = useState<'all' | 'completed' | 'failed' | 'pending'>('all');
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    failed: 0,
    pending: 0,
  });
  const isMountedRef = useRef(true);

  const fetchLogs = useCallback(async () => {
    if (!isMountedRef.current) return;
    
    try {
      setIsLoading(true);
      setError(null);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const url = sessionId 
        ? `${API_BASE_URL}/governance?sessionId=${sessionId}`
        : `${API_BASE_URL}/governance`;

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch logs: ${response.statusText}`);
      }

      const data = await response.json();

      if (!isMountedRef.current) return;

      if (data.error) {
        setError(data.error);
        return;
      }

      setLogs(data.logs || []);
      setStats(data.stats || { total: 0, completed: 0, failed: 0, pending: 0 });
    } catch (err) {
      if (!isMountedRef.current) return;
      console.error('Error fetching governance logs:', err);
      setError(err instanceof Error ? err.message : 'Connection timeout or failed');
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  const clearLogs = async () => {
    if (!confirm('Are you sure you want to clear all governance logs? This action cannot be undone.')) {
      return;
    }

    try {
      const url = sessionId 
        ? `${API_BASE_URL}/governance?sessionId=${sessionId}`
        : `${API_BASE_URL}/governance`;

      const response = await fetch(url, { method: 'DELETE' });
      
      if (!response.ok) {
        throw new Error(`Failed to clear logs: ${response.statusText}`);
      }

      setLogs([]);
      setStats({ total: 0, completed: 0, failed: 0, pending: 0 });
    } catch (err) {
      console.error('Error clearing logs:', err);
      setError(err instanceof Error ? err.message : 'Failed to clear logs');
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    fetchLogs();
    return () => {
      isMountedRef.current = false;
    };
  }, [fetchLogs]);

  useEffect(() => {
    if (!sessionId) return;
    fetchLogs();
  }, [sessionId, fetchLogs]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchLogs();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [fetchLogs, autoRefresh, refreshInterval]);

  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
  };

  const formatTimestamp = (timestamp: string): string => {
    try {
      return new Date(timestamp).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return timestamp;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (filter === 'all') return true;
    return log.status === filter;
  });

  // Calculate counts directly from logs array
  const completedCount = logs.filter(l => l.status?.toLowerCase() === 'completed').length;
  const failedCount = logs.filter(l => l.status?.toLowerCase() === 'failed').length;
  const pendingCount = logs.filter(l => l.status?.toLowerCase() === 'pending').length;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Governance Log</h2>
          <p className="text-sm text-gray-600">
            {logs.length} total • {completedCount} completed • {failedCount} failed • {pendingCount} pending
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={clearLogs}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
          >
            Clear Logs
          </button>
          <button
            onClick={toggleAutoRefresh}
            className={`px-3 py-1 rounded text-sm ${
              autoRefresh
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
            }`}
          >
            Auto-refresh: {autoRefresh ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Filter Dropdown */}
      <div className="mb-4">
        <label htmlFor="filter" className="text-sm text-gray-700 mr-2">
          Filter:
        </label>
        <select
          id="filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value as typeof filter)}
          className="border border-gray-300 rounded px-3 py-1 text-sm"
        >
          <option value="all">All ({logs.length})</option>
          <option value="completed">Completed ({completedCount})</option>
          <option value="failed">Failed ({failedCount})</option>
          <option value="pending">Pending ({pendingCount})</option>
        </select>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded">
          <p className="text-red-800 text-sm">
            <strong>Error:</strong> {error}
          </p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && logs.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading logs...</p>
          </div>
        </div>
      )}

      {/* Logs List */}
      {!isLoading || logs.length > 0 ? (
        <div className="flex-1 overflow-auto space-y-3">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <svg
                className="mx-auto h-12 w-12 text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-sm">No {filter !== 'all' ? filter : ''} logs available</p>
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(
                      log.status
                    )}`}
                  >
                    {log.status.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatTimestamp(log.timestamp)}
                  </span>
                </div>

                <div className="mb-2">
                  <p className="text-xs text-gray-500 mb-1">User Message:</p>
                  <p className="text-sm text-gray-800 line-clamp-2">
                    {log.userMessage}
                  </p>
                </div>

                {log.agentResponse && (
                  <div className="mb-2">
                    <p className="text-xs text-gray-500 mb-1">Agent Response:</p>
                    <p className="text-sm text-gray-800 line-clamp-2">
                      {log.agentResponse}
                    </p>
                  </div>
                )}

                {log.error && (
                  <div className="mt-2 p-2 bg-red-50 rounded">
                    <p className="text-xs text-red-800">
                      <strong>Error:</strong> {log.error}
                    </p>
                  </div>
                )}

                {log.metadata && (
                  <div className="mt-2 flex gap-4 text-xs text-gray-600">
                    {log.metadata.agentId && (
                      <span>Agent: {log.metadata.agentId}</span>
                    )}
                    {log.metadata.orchestrationScore !== undefined && (
                      <span>Score: {log.metadata.orchestrationScore.toFixed(2)}</span>
                    )}
                    {log.metadata.policyViolations !== undefined && log.metadata.policyViolations > 0 && (
                      <span className="text-orange-600">
                        ⚠ {log.metadata.policyViolations} policy violation(s)
                      </span>
                    )}
                  </div>
                )}

                <div className="mt-2 pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-400">
                    ID: <span className="font-mono">{log.id.substring(0, 16)}...</span>
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      ) : null}

      {/* Footer Info */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          {sessionId ? (
            <>
              Session: <span className="font-mono text-gray-700">{sessionId.substring(0, 16)}...</span>
            </>
          ) : (
            'Showing logs from all sessions'
          )}
        </p>
      </div>
    </div>
  );
}
