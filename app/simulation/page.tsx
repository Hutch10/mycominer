'use client';

/**
 * Phase 49: Operator Simulation Mode - UI Dashboard
 * 
 * Deterministic, read-only simulation interface for workflows, incidents, SOPs,
 * timeline sequences, governance decisions, and cross-engine interactions.
 */

import React, { useState, useEffect } from 'react';
import type {
  SimulationQuery,
  SimulationResult,
  SimulationState,
  SimulationScenarioType,
  SimulationStep,
  SimulationLogEntry,
  SimulationStatistics,
} from './simulationTypes';

import { SimulationEngine } from './simulationEngine';

// ============================================================================
// HOOKS
// ============================================================================

function useSimulationEngine(tenantId: string) {
  const [engine] = useState(() => new SimulationEngine(tenantId));
  return engine;
}

// ============================================================================
// MAIN DASHBOARD
// ============================================================================

export default function SimulationPage() {
  const [tenantId] = useState('tenant-alpha');
  const [facilityId] = useState<string | undefined>('facility-01');
  const [performedBy] = useState('user-001');

  const engine = useSimulationEngine(tenantId);

  const [activeTab, setActiveTab] = useState<'query' | 'timeline' | 'history' | 'statistics'>('query');
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [state, setState] = useState<SimulationState | null>(null);
  const [selectedStep, setSelectedStep] = useState<SimulationStep | null>(null);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Operator Simulation Mode</h1>
        <p className="text-gray-600">
          Deterministic, read-only simulation for workflows, incidents, SOPs, governance, and cross-engine interactions
        </p>
        <div className="mt-2 text-sm text-gray-500">
          Tenant: <span className="font-mono">{tenantId}</span>
          {facilityId && <> • Facility: <span className="font-mono">{facilityId}</span></>}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => setActiveTab('query')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'query'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Query
        </button>
        <button
          onClick={() => setActiveTab('timeline')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'timeline'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          disabled={!state}
        >
          Timeline
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'history'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          History
        </button>
        <button
          onClick={() => setActiveTab('statistics')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'statistics'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Statistics
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'query' && (
        <SimulationQueryPanel
          engine={engine}
          facilityId={facilityId}
          performedBy={performedBy}
          onResult={(r) => {
            setResult(r);
            setState(r.initialState);
            setActiveTab('timeline');
          }}
        />
      )}

      {activeTab === 'timeline' && result && state && (
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <SimulationTimelineViewer
              engine={engine}
              state={state}
              onStateChange={setState}
              onStepSelect={setSelectedStep}
            />
          </div>
          <div>
            <SimulationStepDetailPanel
              step={selectedStep || state.currentStep}
            />
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <SimulationHistoryViewer engine={engine} />
      )}

      {activeTab === 'statistics' && (
        <SimulationStatisticsViewer engine={engine} />
      )}
    </div>
  );
}

// ============================================================================
// SIMULATION QUERY PANEL
// ============================================================================

function SimulationQueryPanel({
  engine,
  facilityId,
  performedBy,
  onResult,
}: {
  engine: SimulationEngine;
  facilityId: string | undefined;
  performedBy: string;
  onResult: (result: SimulationResult) => void;
}) {
  const [scenarioType, setScenarioType] = useState<SimulationScenarioType>('sop-execution');
  const [entityId, setEntityId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scenarioTypes: Array<{ value: SimulationScenarioType; label: string; description: string }> = [
    { value: 'sop-execution', label: 'SOP Execution', description: 'Simulate SOP procedure steps' },
    { value: 'workflow-rehearsal', label: 'Workflow Rehearsal', description: 'Practice workflow phases' },
    { value: 'incident-replay', label: 'Incident Replay', description: 'Replay past incidents' },
    { value: 'governance-replay', label: 'Governance Replay', description: 'Replay governance decisions' },
    { value: 'health-drift-replay', label: 'Health Drift Replay', description: 'Replay health observations' },
    { value: 'analytics-replay', label: 'Analytics Replay', description: 'Replay analytics patterns' },
    { value: 'training-simulation', label: 'Training Simulation', description: 'Simulate training modules' },
    { value: 'fabric-traversal', label: 'Fabric Traversal', description: 'Traverse fabric links' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let query: SimulationQuery;

      switch (scenarioType) {
        case 'sop-execution':
          query = engine.buildSOPExecutionQuery(entityId, facilityId, performedBy);
          break;
        case 'workflow-rehearsal':
          query = engine.buildWorkflowRehearsalQuery(entityId, facilityId, performedBy);
          break;
        case 'incident-replay':
          query = engine.buildIncidentReplayQuery(entityId, performedBy);
          break;
        case 'governance-replay':
          query = engine.buildGovernanceReplayQuery(entityId, performedBy);
          break;
        default:
          query = {
            queryId: `sim-query-${Date.now()}`,
            queryType: scenarioType,
            queryText: `Simulate ${scenarioType}: ${entityId}`,
            targetEntityId: entityId,
            scope: {
              tenantId: engine['tenantId'],
              facilityId,
              simulationMode: 'sandbox',
              allowCrossEngine: true,
            },
            performedBy,
            performedAt: new Date().toISOString(),
          };
      }

      const result = await engine.createSimulation(query);
      onResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create simulation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Create Simulation</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Scenario Type</label>
          <select
            value={scenarioType}
            onChange={(e) => setScenarioType(e.target.value as SimulationScenarioType)}
            className="w-full border rounded-lg p-2"
          >
            {scenarioTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          <p className="text-sm text-gray-500 mt-1">
            {scenarioTypes.find((t) => t.value === scenarioType)?.description}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            {scenarioType === 'sop-execution' && 'SOP ID'}
            {scenarioType === 'workflow-rehearsal' && 'Workflow ID'}
            {scenarioType === 'incident-replay' && 'Incident ID'}
            {scenarioType === 'governance-replay' && 'Decision ID'}
            {!['sop-execution', 'workflow-rehearsal', 'incident-replay', 'governance-replay'].includes(scenarioType) && 'Entity ID'}
          </label>
          <input
            type="text"
            value={entityId}
            onChange={(e) => setEntityId(e.target.value)}
            placeholder={
              scenarioType === 'sop-execution' ? 'SOP-004' :
              scenarioType === 'workflow-rehearsal' ? 'WF-12' :
              scenarioType === 'incident-replay' ? '2024-EX-17' :
              scenarioType === 'governance-replay' ? 'GOV-2024-001' :
              'entity-id'
            }
            className="w-full border rounded-lg p-2"
            required
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !entityId}
          className="w-full bg-blue-600 text-white rounded-lg py-2 px-4 hover:bg-blue-700 disabled:bg-gray-300"
        >
          {loading ? 'Creating Simulation...' : 'Create Simulation'}
        </button>
      </form>
    </div>
  );
}

// ============================================================================
// SIMULATION TIMELINE VIEWER
// ============================================================================

function SimulationTimelineViewer({
  engine,
  state,
  onStateChange,
  onStepSelect,
}: {
  engine: SimulationEngine;
  state: SimulationState;
  onStateChange: (state: SimulationState) => void;
  onStepSelect: (step: SimulationStep) => void;
}) {
  const handleStepForward = () => {
    const newState = engine.stepForward(state.stateId);
    onStateChange(newState);
  };

  const handleStepBackward = () => {
    const newState = engine.stepBackward(state.stateId);
    onStateChange(newState);
  };

  const handleJumpToStep = (stepNumber: number) => {
    const newState = engine.jumpToStep(state.stateId, stepNumber);
    onStateChange(newState);
  };

  const handleReplay = async () => {
    const newState = await engine.replayScenario(state.stateId);
    onStateChange(newState);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold">{state.scenario.title}</h2>
          <span className="text-sm text-gray-500">
            {state.status === 'completed' ? 'Completed' : `Step ${state.currentStepIndex + 1} of ${state.scenario.totalSteps}`}
          </span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${state.progress.percentComplete}%` }}
          />
        </div>

        <div className="flex justify-between text-sm text-gray-600 mb-4">
          <span>{state.progress.completedSteps} steps completed</span>
          <span>{state.progress.percentComplete}% complete</span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleStepBackward}
            disabled={state.currentStepIndex === 0}
            className="flex-1 border rounded-lg py-2 px-4 hover:bg-gray-50 disabled:opacity-50"
          >
            ← Previous
          </button>
          <button
            onClick={handleStepForward}
            disabled={state.status === 'completed'}
            className="flex-1 bg-blue-600 text-white rounded-lg py-2 px-4 hover:bg-blue-700 disabled:opacity-50"
          >
            Next →
          </button>
          <button
            onClick={handleReplay}
            disabled={state.status === 'completed'}
            className="border rounded-lg py-2 px-4 hover:bg-gray-50"
          >
            Replay All
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Steps</h3>
        <div className="space-y-2">
          {state.scenario.steps.map((step, idx) => {
            const isCompleted = idx < state.currentStepIndex;
            const isCurrent = idx === state.currentStepIndex;

            return (
              <button
                key={step.stepId}
                onClick={() => {
                  onStepSelect(step);
                  handleJumpToStep(step.stepNumber);
                }}
                className={`w-full text-left border rounded-lg p-3 transition-colors ${
                  isCurrent ? 'border-blue-600 bg-blue-50' :
                  isCompleted ? 'border-green-600 bg-green-50' :
                  'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    isCurrent ? 'bg-blue-600 text-white' :
                    isCompleted ? 'bg-green-600 text-white' :
                    'bg-gray-300 text-gray-600'
                  }`}>
                    {step.stepNumber}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{step.title}</div>
                    <div className="text-sm text-gray-600 truncate">{step.description}</div>
                    <div className="flex gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 bg-gray-100 rounded">{step.stepType}</span>
                      {step.sourceEngine && (
                        <span className="text-xs px-2 py-0.5 bg-blue-100 rounded">{step.sourceEngine}</span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SIMULATION STEP DETAIL PANEL
// ============================================================================

function SimulationStepDetailPanel({ step }: { step: SimulationStep | null }) {
  if (!step) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500">Select a step to view details</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Step Details</h3>

      <div className="space-y-4">
        <div>
          <div className="text-sm font-medium text-gray-500">Title</div>
          <div className="mt-1">{step.title}</div>
        </div>

        <div>
          <div className="text-sm font-medium text-gray-500">Description</div>
          <div className="mt-1 text-sm">{step.description}</div>
        </div>

        <div>
          <div className="text-sm font-medium text-gray-500">Type</div>
          <div className="mt-1">
            <span className="text-xs px-2 py-1 bg-gray-100 rounded">{step.stepType}</span>
          </div>
        </div>

        {step.sourceEngine && (
          <div>
            <div className="text-sm font-medium text-gray-500">Source Engine</div>
            <div className="mt-1">
              <span className="text-xs px-2 py-1 bg-blue-100 rounded">{step.sourceEngine}</span>
            </div>
          </div>
        )}

        {step.expectedOutcome && (
          <div>
            <div className="text-sm font-medium text-gray-500">Expected Outcome</div>
            <div className="mt-1 text-sm">{step.expectedOutcome}</div>
          </div>
        )}

        {step.actualOutcome && (
          <div>
            <div className="text-sm font-medium text-gray-500">Actual Outcome</div>
            <div className="mt-1 text-sm text-green-700">{step.actualOutcome}</div>
          </div>
        )}

        {step.references && step.references.length > 0 && (
          <div>
            <div className="text-sm font-medium text-gray-500 mb-2">References</div>
            <div className="space-y-1">
              {step.references.map((ref) => (
                <div key={ref.referenceId} className="text-xs px-2 py-1 bg-gray-50 rounded">
                  {ref.title} ({ref.referenceType})
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// SIMULATION HISTORY VIEWER
// ============================================================================

function SimulationHistoryViewer({ engine }: { engine: SimulationEngine }) {
  const [entries, setEntries] = useState<SimulationLogEntry[]>([]);
  const [filter, setFilter] = useState<'all' | 'query' | 'scenario-build' | 'error'>('all');

  useEffect(() => {
    const log = engine.getLog();
    const allEntries = log.getAllEntries();
    setEntries(allEntries);
  }, [engine]);

  const filteredEntries = filter === 'all'
    ? entries
    : entries.filter(e => e.entryType === filter);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Simulation History</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as typeof filter)}
          className="border rounded-lg px-3 py-1"
        >
          <option value="all">All Entries</option>
          <option value="query">Queries</option>
          <option value="scenario-build">Scenarios</option>
          <option value="error">Errors</option>
        </select>
      </div>

      <div className="space-y-2">
        {filteredEntries.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No simulation history yet</p>
        ) : (
          filteredEntries.map((entry) => (
            <div key={entry.entryId} className="border rounded-lg p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      entry.entryType === 'query' ? 'bg-blue-100 text-blue-700' :
                      entry.entryType === 'scenario-build' ? 'bg-green-100 text-green-700' :
                      entry.entryType === 'error' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {entry.entryType}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(entry.timestamp).toLocaleString()}
                    </span>
                  </div>
                  
                  {entry.query && (
                    <div className="mt-2 text-sm">
                      <div className="font-medium">{entry.query.queryText}</div>
                      <div className="text-gray-600">Type: {entry.query.queryType}</div>
                    </div>
                  )}
                  
                  {entry.scenarioBuild && (
                    <div className="mt-2 text-sm">
                      <div className="font-medium">Scenario: {entry.scenarioBuild.scenarioType}</div>
                      <div className="text-gray-600">
                        {entry.scenarioBuild.totalSteps} steps • {entry.scenarioBuild.sourceEngines.length} engines
                      </div>
                    </div>
                  )}
                  
                  {entry.error && (
                    <div className="mt-2 text-sm text-red-700">
                      {entry.error.message}
                    </div>
                  )}
                </div>
                
                <div className={`text-xs px-2 py-0.5 rounded ${
                  entry.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {entry.success ? 'Success' : 'Failed'}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ============================================================================
// SIMULATION STATISTICS VIEWER
// ============================================================================

function SimulationStatisticsViewer({ engine }: { engine: SimulationEngine }) {
  const [stats, setStats] = useState<SimulationStatistics | null>(null);

  useEffect(() => {
    const statistics = engine.getStatistics();
    setStats(statistics);
  }, [engine]);

  if (!stats) {
    return <div className="text-gray-500">Loading statistics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Total Simulations</div>
          <div className="text-2xl font-bold">{stats.totalSimulations}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Last 24 Hours</div>
          <div className="text-2xl font-bold">{stats.simulationsLast24Hours}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Avg Steps</div>
          <div className="text-2xl font-bold">{stats.averageStepsPerSimulation}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Total Errors</div>
          <div className="text-2xl font-bold text-red-600">{stats.totalErrors}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Simulations by Type</h3>
        <div className="space-y-2">
          {Object.entries(stats.simulationsByType).map(([type, count]) => (
            <div key={type} className="flex justify-between items-center">
              <span className="text-sm">{type}</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${stats.totalSimulations > 0 ? (count / stats.totalSimulations) * 100 : 0}%`
                    }}
                  />
                </div>
                <span className="text-sm font-medium w-8 text-right">{count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Simulations by Source Engine</h3>
        <div className="space-y-2">
          {Object.entries(stats.simulationsBySourceEngine).map(([engineName, count]) => (
            <div key={engineName} className="flex justify-between items-center text-sm">
              <span>{engineName}</span>
              <span className="font-medium">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

