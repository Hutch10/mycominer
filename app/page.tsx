'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import AgentConsole from './components/AgentConsole';
import GovernancePanel from './components/GovernancePanel';
import StatsBar from './components/StatsBar';

const ExplainabilityViewer = dynamic(
  () => import('./components/ExplainabilityViewer'),
  { ssr: false }
);

export default function Home() {
  const [showGovernance, setShowGovernance] = useState<boolean>(true);
  const [showGraph, setShowGraph] = useState<boolean>(true);
  const [sessionId, setSessionId] = useState<string>('');

  // Get or create session ID on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let id = sessionStorage.getItem('mycominer_session_id');
      if (!id) {
        id = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        sessionStorage.setItem('mycominer_session_id', id);
      }
      setSessionId(id);
    }
  }, []);



  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-50">
      {/* Header Section */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                MycoMiner: Multi-Agent Intelligence System
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Human-crafted mushroom intelligence with governance and explainability
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Current Session</div>
              <div className="text-sm font-mono text-gray-700 dark:text-gray-300 overflow-hidden whitespace-nowrap text-ellipsis max-w-xs">
                {sessionId || 'Loading...'}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Bar Component */}
      {sessionId && <StatsBar sessionId={sessionId} />}

      {/* Control Buttons */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex gap-3">
          <button
            onClick={() => setShowGovernance(!showGovernance)}
            className={`px-4 py-2 rounded font-medium text-sm transition ${
              showGovernance
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {showGovernance ? '✓' : ''} Governance Panel
          </button>
          <button
            onClick={() => setShowGraph(!showGraph)}
            className={`px-4 py-2 rounded font-medium text-sm transition ${
              showGraph
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {showGraph ? '✓' : ''} Explainability Graph
          </button>
        </div>
      </div>

      {/* Main Content - Dynamic Grid Layout */}
      <div className="max-w-7xl mx-auto px-6 pb-8">
        <div className={`grid gap-4 ${
          showGovernance && showGraph
            ? 'lg:grid-cols-3'
            : showGovernance || showGraph
            ? 'lg:grid-cols-2'
            : 'grid-cols-1'
        }`}>
          {/* Agent Console - Always Visible */}
          <div className="h-[700px]">
            <AgentConsole />
          </div>

          {/* Governance Panel - Toggleable */}
          {showGovernance && (
            <div className="h-[700px]">
              <GovernancePanel sessionId={sessionId} />
            </div>
          )}

          {/* Explainability Graph - Toggleable */}
          {showGraph && (
            <div className="h-[700px]">
              <ExplainabilityViewer sessionId={sessionId} />
            </div>
          )}
        </div>
      </div>

      {/* System Features */}
      <section className="max-w-7xl mx-auto px-6 pb-12">
        <h2 className="text-2xl font-bold mb-6">Multi-Agent System Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-2">Multi-Agent Orchestration</h3>
            <p className="text-sm text-gray-600">
              Intelligent routing to specialized agents (Reasoner, Planner, Critic, General) 
              based on message intent with deterministic scoring.
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-2">Policy Governance</h3>
            <p className="text-sm text-gray-600">
              Configurable pre and post-message validation with structured error reporting 
              and severity levels (info/warning/error/critical).
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-2">Governance Logging</h3>
            <p className="text-sm text-gray-600">
              Complete audit trail with filterable logs, timestamps, agent metadata, 
              and performance metrics. Exportable for compliance.
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-2">Semantic Context</h3>
            <p className="text-sm text-gray-600">
              Rolling conversation windows with session isolation. Maintains up to 50 
              messages per session across 100 concurrent sessions.
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-2">Explainability Graph</h3>
            <p className="text-sm text-gray-600">
              Visual reasoning paths with typed nodes (policy/routing/agent/response) 
              and metadata-enriched edges. Auto-prunes at 300 nodes.
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-2">Real-Time Monitoring</h3>
            <p className="text-sm text-gray-600">
              Live updates with manual refresh controls, auto-refresh toggles, 
              error handling, and loading states for all panels.
            </p>
          </div>
        </div>
      </section>

      {/* Architecture Overview */}
      <section className="max-w-7xl mx-auto px-6 pb-12">
        <h2 className="text-2xl font-bold mb-6">System Architecture</h2>
        <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
          <div className="space-y-4 text-sm text-gray-700">
            <div className="flex items-start gap-3">
              <span className="font-mono bg-blue-50 px-2 py-1 rounded text-xs">1</span>
              <p>
                <strong>User Message:</strong> Enters through AgentConsole, creates governance log entry
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="font-mono bg-blue-50 px-2 py-1 rounded text-xs">2</span>
              <p>
                <strong>Pre-Policy Check:</strong> Validates message length, content safety, rate limits
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="font-mono bg-blue-50 px-2 py-1 rounded text-xs">3</span>
              <p>
                <strong>Semantic Context:</strong> Adds message to rolling context window, builds context string
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="font-mono bg-blue-50 px-2 py-1 rounded text-xs">4</span>
              <p>
                <strong>Orchestration:</strong> Routes to specialized agent using keyword/pattern matching with scoring
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="font-mono bg-blue-50 px-2 py-1 rounded text-xs">5</span>
              <p>
                <strong>Agent Execution:</strong> Selected agent processes with enriched context and system prompt
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="font-mono bg-blue-50 px-2 py-1 rounded text-xs">6</span>
              <p>
                <strong>Post-Policy Check:</strong> Validates response quality, length, content safety
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="font-mono bg-blue-50 px-2 py-1 rounded text-xs">7</span>
              <p>
                <strong>Graph & Logs:</strong> Updates explainability graph nodes/edges, completes governance log
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="font-mono bg-blue-50 px-2 py-1 rounded text-xs">8</span>
              <p>
                <strong>Response:</strong> Returns to user with full metadata (routing, policies, graph stats)
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
