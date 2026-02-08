'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// Use Next.js API routes (frontend proxy)
const API_BASE_URL = '/api';

interface ExplainabilityViewerProps {
  sessionId: string;
  refreshInterval?: number;
}

export default function ExplainabilityViewer({ 
  sessionId, 
  refreshInterval = 5000 
}: ExplainabilityViewerProps) {
  const [mounted, setMounted] = useState<boolean>(false);
  const [mermaidGraph, setMermaidGraph] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [nodeCount, setNodeCount] = useState<number>(0);
  const [edgeCount, setEdgeCount] = useState<number>(0);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const isMountedRef = useRef(true);

  const fetchGraph = useCallback(async () => {
    if (!sessionId || !isMountedRef.current) {
      setError('No session ID provided');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${API_BASE_URL}/explainability?sessionId=${sessionId}`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch graph: ${response.statusText}`);
      }

      const data = await response.json();

      if (!isMountedRef.current) return;

      if (data.error || !data.success) {
        setError(data.error || 'Failed to fetch graph');
        return;
      }

      // Defer graph parsing/rendering to avoid hydration timing issues
      setTimeout(() => {
        if (!isMountedRef.current) return;

        // Convert backend graph structure to Mermaid format
        const graph = data.graph;
        if (graph && graph.nodes && graph.edges) {
          let mermaid = 'graph TD\n';
          
          // Add nodes
          graph.nodes.forEach((node: any) => {
            const label = node.label.replace(/["\n]/g, ' ').substring(0, 50);
            mermaid += `  ${node.id}["${label}"]\n`;
          });
          
          // Add edges
          graph.edges.forEach((edge: any) => {
            const label = edge.label ? `|${edge.label}|` : '';
            mermaid += `  ${edge.source} -->${label} ${edge.target}\n`;
          });
          
          setMermaidGraph(mermaid);
          setNodeCount(graph.nodes.length);
          setEdgeCount(graph.edges.length);
        } else {
          setMermaidGraph('graph TD\n  A["No graph data yet"]');
          setNodeCount(0);
          setEdgeCount(0);
        }
        
        setLastUpdated(new Date().toLocaleString());
      }, 0);
    } catch (err) {
      if (!isMountedRef.current) return;
      console.error('Error fetching explainability graph:', err);
      setError(err instanceof Error ? err.message : 'Connection timeout or failed');
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    setMounted(true);
    isMountedRef.current = true;
    fetchGraph();
    return () => {
      isMountedRef.current = false;
    };
  }, [fetchGraph]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchGraph();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [fetchGraph, autoRefresh, refreshInterval]);

  const handleManualRefresh = () => {
    fetchGraph();
  };

  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
  };

  // Prevent hydration mismatch - only render after client mount
  if (!mounted || typeof window === 'undefined') {
    return (
      <div className="p-4">Loading Graph...</div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Explainability Graph</h2>
          <p className="text-sm text-gray-600">
            {nodeCount} nodes • {edgeCount} edges
            {lastUpdated && ` • Updated: ${lastUpdated}`}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleManualRefresh}
            disabled={isLoading}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 text-sm"
          >
            {isLoading ? 'Refreshing...' : '↻ Refresh'}
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

      {/* Legend */}
      <div className="mb-4 p-4 bg-gray-50 rounded border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Node Type Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <span className="font-mono">[Node]</span> <span>Message</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-mono">([Node])</span> <span>Reasoning</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-mono">[[Node]]</span> <span>Tool/Agent</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-mono">{'{Node}'}</span> <span>Decision</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-mono">[(Node)]</span> <span>Result</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-mono">{'{{'}</span>Node<span className="font-mono">{'}}'}</span> <span>Policy</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-mono">&gt;Node]</span> <span>Routing</span>
          </div>
        </div>
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
      {isLoading && !mermaidGraph && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading graph...</p>
          </div>
        </div>
      )}

      {/* Graph Display */}
      {!isLoading && !error && mermaidGraph && (
        <div className="flex-1 overflow-auto bg-gray-50 rounded border border-gray-200 p-4">
          <pre className="text-xs font-mono text-gray-800 whitespace-pre-wrap">
            {mermaidGraph}
          </pre>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && !mermaidGraph && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-500">
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
            <p className="text-sm">No graph data available yet</p>
            <p className="text-xs text-gray-400 mt-2">
              Send a message to generate graph nodes
            </p>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Session: <span className="font-mono text-gray-700">{sessionId.substring(0, 16)}...</span>
        </p>
      </div>
    </div>
  );
}
