/**
 * Phase 43: System Health - Health Dashboard
 * Main page for system health monitoring, drift detection, and integrity scanning
 */

'use client';

import React, { useState } from 'react';
import { HealthQueryPanel } from './components/HealthQueryPanel';
import { DriftFindingList } from './components/DriftFindingList';
import { IntegrityFindingList } from './components/IntegrityFindingList';
import { HealthFindingDetailPanel } from './components/HealthFindingDetailPanel';
import { HealthHistoryViewer } from './components/HealthHistoryViewer';
import {
  HealthEngine,
  SystemData,
  createHealthQuery
} from './healthEngine';
import {
  HealthQuery,
  HealthResult,
  DriftFinding,
  IntegrityFinding,
  HealthLogEntry,
  HealthStatus,
  HealthEngineConfig
} from './healthTypes';

export default function HealthDashboard() {
  // State
  const [currentResult, setCurrentResult] = useState<HealthResult | null>(null);
  const [selectedFinding, setSelectedFinding] = useState<DriftFinding | IntegrityFinding | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [healthEngine] = useState(() => {
    const config: HealthEngineConfig = {
      tenantId: 'tenant-demo',
      facilityId: 'facility-01',
      enabledCategories: [
        'configuration-drift',
        'sop-workflow-mismatch',
        'stale-orphaned-references',
        'kg-link-integrity',
        'sandbox-scenario-staleness',
        'forecast-metadata-drift',
        'compliance-record-consistency',
        'cross-engine-schema-alignment',
        'tenant-federation-policy-violations'
      ],
      retentionDays: 365
    };
    return new HealthEngine(config);
  });

  // Mock system data (in production, this would come from actual subsystems)
  const getMockSystemData = (): SystemData => ({
    sops: [],
    workflows: [],
    resources: [],
    facilities: [],
    sandboxScenarios: [],
    forecasts: [],
    kgNodes: [],
    kgEdges: [],
    validRelationshipTypes: new Set(['relates-to', 'depends-on', 'implements']),
    availableAssets: new Map(),
    sopMap: new Map(),
    timelineEvents: [],
    validEntityIds: new Set(),
    capas: [],
    incidentMap: new Map(),
    deviationMap: new Map(),
    complianceRecords: [],
    requiredComplianceFields: ['title', 'status', 'owner', 'date'],
    currentWorkflowVersions: new Map(),
    requiredForecastMetadata: ['model', 'parameters', 'timestamp']
  });

  const handleExecuteQuery = async (query: HealthQuery) => {
    setIsLoading(true);
    setSelectedFinding(null);

    try {
      const systemData = getMockSystemData();
      const result = await healthEngine.executeQuery(query, systemData);
      setCurrentResult(result);
    } catch (error) {
      console.error('Health scan failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectFinding = (finding: DriftFinding | IntegrityFinding) => {
    setSelectedFinding(finding);
  };

  const handleCloseFinding = () => {
    setSelectedFinding(null);
  };

  const handleExplainFinding = (findingId: string) => {
    console.log('Opening explanation for finding:', findingId);
    // Hook to Phase 37: Narrative Engine
  };

  const handleOpenRelatedIncident = (findingId: string) => {
    console.log('Opening related incident for finding:', findingId);
    // Hook to Phase 38: Timeline & Incident Tracking
  };

  const handleOpenRelatedPattern = (findingId: string) => {
    console.log('Opening related pattern for finding:', findingId);
    // Hook to Phase 39: Analytics & Pattern Library
  };

  const handleOpenTrainingModule = (category: string) => {
    console.log('Opening training module for category:', category);
    // Hook to Phase 40: Training System
  };

  const handleOpenKnowledgePack = (topic: string) => {
    console.log('Opening knowledge pack for topic:', topic);
    // Hook to Phase 42: Insights & Knowledge Packs
  };

  const handleSelectLogEntry = (entry: HealthLogEntry) => {
    console.log('Selected log entry:', entry);
  };

  const getStatusColor = (status: HealthStatus): string => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'unhealthy':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: HealthStatus): string => {
    switch (status) {
      case 'healthy':
        return '✓';
      case 'degraded':
        return '⚠';
      case 'unhealthy':
        return '✗';
      default:
        return '?';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            System Health & Integrity Monitoring
          </h1>
          <p className="text-gray-600">
            Phase 43: Deterministic drift detection, integrity scanning, and policy enforcement
          </p>
        </div>

        {/* Current Health Status */}
        {currentResult && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Current Health Status</h2>
              <span className={`px-4 py-2 rounded-lg border font-medium ${getStatusColor(currentResult.overallStatus)}`}>
                {getStatusIcon(currentResult.overallStatus)} {currentResult.overallStatus.toUpperCase()}
              </span>
            </div>

            {/* Health Score */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Health Score</span>
                <span className="text-2xl font-bold text-gray-900">
                  {currentResult.summary.healthScore}/100
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className={`h-4 rounded-full transition-all ${
                    currentResult.summary.healthScore >= 80
                      ? 'bg-green-500'
                      : currentResult.summary.healthScore >= 50
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${currentResult.summary.healthScore}%` }}
                />
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {currentResult.summary.totalFindings}
                </div>
                <div className="text-xs text-gray-600">Total Findings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {currentResult.summary.findingsBySeverity.critical || 0}
                </div>
                <div className="text-xs text-gray-600">Critical</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {currentResult.summary.findingsBySeverity.high || 0}
                </div>
                <div className="text-xs text-gray-600">High</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {currentResult.summary.findingsBySeverity.medium || 0}
                </div>
                <div className="text-xs text-gray-600">Medium</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {currentResult.summary.findingsBySeverity.low || 0}
                </div>
                <div className="text-xs text-gray-600">Low</div>
              </div>
            </div>

            {/* Scan Info */}
            <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between text-sm text-gray-600">
              <span>Checks Run: {currentResult.checksRun}</span>
              <span>Duration: {currentResult.scanDuration}ms</span>
              <span>Scanned: {new Date(currentResult.timestamp).toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Query Panel */}
          <div className="lg:col-span-1">
            <HealthQueryPanel
              tenantId="tenant-demo"
              facilityId="facility-01"
              userId="user-demo"
              onExecuteQuery={handleExecuteQuery}
              isLoading={isLoading}
            />

            {/* History Viewer */}
            <div className="mt-6">
              <HealthHistoryViewer
                logEntries={healthEngine.getHealthLog().getRecentEntries(20)}
                onSelectEntry={handleSelectLogEntry}
              />
            </div>
          </div>

          {/* Middle Column - Findings */}
          <div className="lg:col-span-1 space-y-6">
            {currentResult ? (
              <>
                <DriftFindingList
                  findings={currentResult.driftFindings}
                  onSelectFinding={handleSelectFinding}
                  selectedFindingId={selectedFinding?.id}
                />

                <IntegrityFindingList
                  findings={currentResult.integrityFindings}
                  onSelectFinding={handleSelectFinding}
                  selectedFindingId={selectedFinding?.id}
                />
              </>
            ) : (
              <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
                <div className="text-gray-400 text-5xl mb-4">🔍</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Health Scan Results
                </h3>
                <p className="text-gray-600 text-sm">
                  Execute a health query to scan for drift, integrity issues, and policy violations
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Detail Panel */}
          <div className="lg:col-span-1">
            <HealthFindingDetailPanel
              finding={selectedFinding}
              onClose={handleCloseFinding}
              onExplainFinding={handleExplainFinding}
              onOpenRelatedIncident={handleOpenRelatedIncident}
              onOpenRelatedPattern={handleOpenRelatedPattern}
              onOpenTrainingModule={handleOpenTrainingModule}
              onOpenKnowledgePack={handleOpenKnowledgePack}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Phase 43: System Health, Drift Detection & Integrity Monitoring
            <br />
            Read-only • Deterministic • Tenant-Isolated • Logged
          </p>
        </div>
      </div>
    </div>
  );
}
