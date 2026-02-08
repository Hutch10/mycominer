/**
 * ACTION CENTER DASHBOARD
 * Phase 53: Operator Action Center
 * 
  _selectedSources,
  _setSelectedSources,
 */

'use client';

import { useState, useEffect } from 'react';
import { ActionEngine } from './actionEngine';
import {
  ActionTask,
  ActionQuery,
  ActionResult,
  ActionGroup,
  ActionCategory,
  ActionSeverity,
  ActionSource,
  ActionStatus,
  ActionPolicyContext,
  ActionStatistics,
  AffectedEntity,
  ActionReference,
} from './actionTypes';

// ============================================================================
// MOCK DATA GENERATORS
// ============================================================================

function generateMockAlerts(tenantId: string, facilityId?: string) {
  return [
    {
      alertId: 'alert-001',
      category: 'integrity-drift',
      severity: 'high',
      title: 'Governance role changed from baseline',
      description: 'Governance decision GD-001 role drifted',
      scope: { tenantId, facilityId },
      affectedEntities: [{ entityId: 'GD-001', entityType: 'governance-decision', title: 'GD-001' }],
      relatedReferences: [],
      detectedAt: new Date().toISOString(),
      status: 'new',
      metadata: {},
    },
  ];
}

function generateMockAuditFindings(tenantId: string, facilityId?: string) {
  return [
    {
      findingId: 'audit-001',
      severity: 'critical',
      title: 'Compliance control missing',
      description: 'Control C-12 from FDA pack not implemented',
      scope: { tenantId, facilityId },
      affectedEntities: [{ entityId: 'C-12', entityType: 'compliance-control', title: 'FDA Control C-12' }],
      relatedReferences: [],
      auditedAt: new Date().toISOString(),
      status: 'new',
      auditId: 'AUDIT-2026-01',
    },
  ];
}

function generateMockIntegrityDrift(tenantId: string, facilityId?: string) {
  return [
    {
      alertId: 'integrity-001',
      category: 'governance-drift',
      severity: 'high',
      title: 'Governance decision drifted from baseline',
      description: 'Decision GD-001 has changed since approved lineage',
      scope: { tenantId, facilityId },
      affectedEntities: [{ entityId: 'GD-001', entityType: 'governance-decision', title: 'GD-001' }],
      relatedReferences: [],
      evidence: [{ field: 'role', baselineValue: 'approver', currentValue: 'reviewer' }],
      detectedAt: new Date().toISOString(),
      status: 'new',
      rule: { ruleId: 'governance-drift-001' },
    },
  ];
}

// ============================================================================
// MAIN DASHBOARD
// ============================================================================

export default function ActionCenterDashboard() {
  const [tenantId] = useState('tenant-alpha');
  const [facilityId] = useState('facility-01');
  const [actionEngine] = useState(() => new ActionEngine(tenantId));
  const [result, setResult] = useState<ActionResult | null>(null);
  const [selectedTask, setSelectedTask] = useState<ActionTask | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<ActionGroup | null>(null);
  const [loading, setLoading] = useState(false);

  // Query filters
  const [selectedCategories, setSelectedCategories] = useState<ActionCategory[]>([]);
  const [selectedSeverities, setSelectedSeverities] = useState<ActionSeverity[]>([]);
  const [selectedSources, setSelectedSources] = useState<ActionSource[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<ActionStatus[]>([]);
  const [groupBy, setGroupBy] = useState<string>('category');

  useEffect(() => {
    executeQuery();
  }, []);

  const executeQuery = async () => {
    setLoading(true);

    const query: ActionQuery = {
      queryId: `query-${Date.now()}`,
      description: 'All action tasks',
      scope: { tenantId, facilityId },
      categories: selectedCategories.length > 0 ? selectedCategories : undefined,
      severities: selectedSeverities.length > 0 ? selectedSeverities : undefined,
      sources: selectedSources.length > 0 ? selectedSources : undefined,
      statuses: selectedStatuses.length > 0 ? selectedStatuses : undefined,
      options: {
        sortBy: 'severity',
        sortOrder: 'desc',
        groupBy: groupBy as any,
      },
      triggeredBy: 'user-001',
      triggeredAt: new Date().toISOString(),
    };

    const context: ActionPolicyContext = {
      tenantId,
      facilityId,
      performedBy: 'user-001',
      userRoles: ['operator'],
      userPermissions: [
        'action.query',
        'action.view-all',
        'action.acknowledge',
        'action.assign',
        'action.resolve',
        'action.dismiss',
      ],
    };

    const inputs = {
      alerts: generateMockAlerts(tenantId, facilityId),
      auditFindings: generateMockAuditFindings(tenantId, facilityId),
      integrityDrift: generateMockIntegrityDrift(tenantId, facilityId),
    };

    const result = await actionEngine.executeQuery(query, context, inputs);
    setResult(result);
    setLoading(false);
  };

  const handleAcknowledge = async (taskId: string) => {
    const context: ActionPolicyContext = {
      tenantId,
      facilityId,
      performedBy: 'user-001',
      userRoles: ['operator'],
      userPermissions: ['action.acknowledge'],
    };

    await actionEngine.acknowledgeTask(taskId, context);
    executeQuery(); // Refresh
  };

  const handleResolve = async (taskId: string) => {
    const context: ActionPolicyContext = {
      tenantId,
      facilityId,
      performedBy: 'user-001',
      userRoles: ['operator'],
      userPermissions: ['action.resolve'],
    };

    await actionEngine.resolveTask(taskId, context);
    executeQuery(); // Refresh
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Action Center</h1>
          <p className="text-gray-600 mt-2">
            Operator tasking and remediation workflow for {tenantId} / {facilityId}
          </p>
        </div>

        {/* Statistics */}
        <ActionStatisticsViewer actionEngine={actionEngine} />

        {/* Query Panel */}
        <ActionQueryPanel
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
          selectedSeverities={selectedSeverities}
          setSelectedSeverities={setSelectedSeverities}
          selectedSources={selectedSources}
          setSelectedSources={setSelectedSources}
          selectedStatuses={selectedStatuses}
          setSelectedStatuses={setSelectedStatuses}
          groupBy={groupBy}
          setGroupBy={setGroupBy}
          onQuery={executeQuery}
          loading={loading}
        />

        {/* Results */}
        {result && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {/* Left: Task/Group List */}
            <div className="lg:col-span-1">
              {result.groups ? (
                <ActionGroupPanel
                  groups={result.groups}
                  selectedGroup={selectedGroup}
                  onSelectGroup={setSelectedGroup}
                />
              ) : (
                <ActionListPanel
                  tasks={result.tasks}
                  selectedTask={selectedTask}
                  onSelectTask={setSelectedTask}
                />
              )}
            </div>

            {/* Right: Detail Panel */}
            <div className="lg:col-span-2">
              {selectedGroup ? (
                <ActionGroupDetailPanel
                  group={selectedGroup}
                  onSelectTask={setSelectedTask}
                />
              ) : selectedTask ? (
                <ActionDetailPanel
                  task={selectedTask}
                  onAcknowledge={() => handleAcknowledge(selectedTask.taskId)}
                  onResolve={() => handleResolve(selectedTask.taskId)}
                />
              ) : (
                <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                  Select a task or group to view details
                </div>
              )}
            </div>
          </div>
        )}

        {/* History Viewer */}
        <ActionHistoryViewer actionEngine={actionEngine} />
      </div>
    </div>
  );
}

// ============================================================================
// QUERY PANEL
// ============================================================================

interface ActionQueryPanelProps {
  selectedCategories: ActionCategory[];
  setSelectedCategories: (categories: ActionCategory[]) => void;
  selectedSeverities: ActionSeverity[];
  setSelectedSeverities: (severities: ActionSeverity[]) => void;
  selectedSources: ActionSource[];
  setSelectedSources: (sources: ActionSource[]) => void;
  selectedStatuses: ActionStatus[];
  setSelectedStatuses: (statuses: ActionStatus[]) => void;
  groupBy: string;
  setGroupBy: (groupBy: string) => void;
  onQuery: () => void;
  loading: boolean;
}

function ActionQueryPanel({
  selectedCategories,
  setSelectedCategories,
  selectedSeverities,
  setSelectedSeverities,
  selectedSources,
  setSelectedSources,
  selectedStatuses,
  setSelectedStatuses,
  groupBy,
  setGroupBy,
  onQuery,
  loading,
}: ActionQueryPanelProps) {
  const categories: ActionCategory[] = [
    'alert-remediation',
    'audit-remediation',
    'integrity-drift-remediation',
    'governance-lineage-issue',
    'documentation-completeness',
    'fabric-link-breakage',
    'compliance-pack-issue',
    'simulation-mismatch',
  ];

  const severities: ActionSeverity[] = ['critical', 'high', 'medium', 'low', 'info'];
  const statuses: ActionStatus[] = ['new', 'acknowledged', 'assigned', 'in-progress', 'resolved', 'dismissed'];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Query Filters</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Categories */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
          <select
            multiple
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            value={selectedCategories}
            onChange={e => setSelectedCategories(Array.from(e.target.selectedOptions, o => o.value as ActionCategory))}
          >
            {categories.map(c => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Severities */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Severities</label>
          <select
            multiple
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            value={selectedSeverities}
            onChange={e => setSelectedSeverities(Array.from(e.target.selectedOptions, o => o.value as ActionSeverity))}
          >
            {severities.map(s => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Statuses */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Statuses</label>
          <select
            multiple
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            value={selectedStatuses}
            onChange={e => setSelectedStatuses(Array.from(e.target.selectedOptions, o => o.value as ActionStatus))}
          >
            {statuses.map(s => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Group By */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Group By</label>
          <select
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            value={groupBy}
            onChange={e => setGroupBy(e.target.value)}
          >
            <option value="">None</option>
            <option value="category">Category</option>
            <option value="severity">Severity</option>
            <option value="source">Source</option>
            <option value="status">Status</option>
            <option value="entity">Entity</option>
          </select>
        </div>
      </div>

      <button
        onClick={onQuery}
        disabled={loading}
        className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? 'Loading...' : 'Query Tasks'}
      </button>
    </div>
  );
}

// ============================================================================
// TASK LIST PANEL
// ============================================================================

interface ActionListPanelProps {
  tasks: ActionTask[];
  selectedTask: ActionTask | null;
  onSelectTask: (task: ActionTask) => void;
}

function ActionListPanel({ tasks, selectedTask, onSelectTask }: ActionListPanelProps) {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Tasks ({tasks.length})</h2>
      </div>

      <div className="divide-y max-h-[600px] overflow-y-auto">
        {tasks.map(task => (
          <div
            key={task.taskId}
            onClick={() => onSelectTask(task)}
            className={`p-4 cursor-pointer hover:bg-gray-50 ${
              selectedTask?.taskId === task.taskId ? 'bg-blue-50' : ''
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(task.severity)}`}>
                    {task.severity}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                </div>
                <h3 className="font-medium text-sm">{task.title}</h3>
                <p className="text-xs text-gray-600 mt-1">{task.category}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// GROUP PANEL
// ============================================================================

interface ActionGroupPanelProps {
  groups: ActionGroup[];
  selectedGroup: ActionGroup | null;
  onSelectGroup: (group: ActionGroup) => void;
}

function ActionGroupPanel({ groups, selectedGroup, onSelectGroup }: ActionGroupPanelProps) {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Groups ({groups.length})</h2>
      </div>

      <div className="divide-y max-h-[600px] overflow-y-auto">
        {groups.map(group => (
          <div
            key={group.groupId}
            onClick={() => onSelectGroup(group)}
            className={`p-4 cursor-pointer hover:bg-gray-50 ${
              selectedGroup?.groupId === group.groupId ? 'bg-blue-50' : ''
            }`}
          >
            <h3 className="font-medium text-sm">{group.groupKey}</h3>
            <p className="text-xs text-gray-600 mt-1">
              {group.summary.totalTasks} tasks ({group.summary.newTasks} new)
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// GROUP DETAIL PANEL
// ============================================================================

interface ActionGroupDetailPanelProps {
  group: ActionGroup;
  onSelectTask: (task: ActionTask) => void;
}

function ActionGroupDetailPanel({ group, onSelectTask }: ActionGroupDetailPanelProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">{group.groupKey}</h2>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded">
          <p className="text-sm text-gray-600">Total Tasks</p>
          <p className="text-2xl font-bold">{group.summary.totalTasks}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded">
          <p className="text-sm text-gray-600">New Tasks</p>
          <p className="text-2xl font-bold">{group.summary.newTasks}</p>
        </div>
        <div className="bg-green-50 p-4 rounded">
          <p className="text-sm text-gray-600">Resolved Tasks</p>
          <p className="text-2xl font-bold">{group.summary.resolvedTasks}</p>
        </div>
      </div>

      {/* Tasks */}
      <h3 className="font-semibold mb-2">Tasks</h3>
      <div className="space-y-2">
        {group.tasks.map(task => (
          <div
            key={task.taskId}
            onClick={() => onSelectTask(task)}
            className="p-3 border rounded cursor-pointer hover:bg-gray-50"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(task.severity)}`}>
                {task.severity}
              </span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(task.status)}`}>
                {task.status}
              </span>
            </div>
            <p className="text-sm font-medium">{task.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// TASK DETAIL PANEL
// ============================================================================

interface ActionDetailPanelProps {
  task: ActionTask;
  onAcknowledge: () => void;
  onResolve: () => void;
}

function ActionDetailPanel({ task, onAcknowledge, onResolve }: ActionDetailPanelProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-3 py-1 rounded text-sm font-medium ${getSeverityColor(task.severity)}`}>
              {task.severity}
            </span>
            <span className={`px-3 py-1 rounded text-sm font-medium ${getStatusColor(task.status)}`}>
              {task.status}
            </span>
          </div>
          <h2 className="text-xl font-semibold">{task.title}</h2>
          <p className="text-sm text-gray-600 mt-1">{task.category}</p>
        </div>
      </div>

      {/* Description */}
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Description</h3>
        <p className="text-sm text-gray-700">{task.description}</p>
      </div>

      {/* Remediation */}
      {task.remediation && (
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Suggested Remediation</h3>
          <div className="bg-blue-50 p-4 rounded">
            <p className="text-sm mb-2">{task.remediation.suggestedAction}</p>
            <div className="flex gap-4 text-xs text-gray-600">
              <span>Effort: {task.remediation.estimatedEffort}</span>
              <span>Permissions: {task.remediation.requiredPermissions.join(', ')}</span>
            </div>
          </div>
        </div>
      )}

      {/* Affected Entities */}
      <ActionReferencePanel entities={task.affectedEntities} references={task.relatedReferences} />

      {/* Cross-Engine Hooks */}
      <div className="mt-6 border-t pt-6">
        <h3 className="font-semibold mb-3">Related Systems</h3>
        <div className="grid grid-cols-2 gap-2">
          {/* Phase 37: Explain This Task */}
          <button className="px-4 py-2 bg-purple-50 text-purple-700 rounded text-sm hover:bg-purple-100">
            📖 Explain This Task
          </button>

          {/* Phase 52: Open Related Alert */}
          {task.source === 'alert-center' && (
            <button className="px-4 py-2 bg-red-50 text-red-700 rounded text-sm hover:bg-red-100">
              🚨 Open Related Alert
            </button>
          )}

          {/* Phase 50: Open Audit Finding */}
          {task.source === 'auditor' && (
            <button className="px-4 py-2 bg-orange-50 text-orange-700 rounded text-sm hover:bg-orange-100">
              📋 Open Audit Finding
            </button>
          )}

          {/* Phase 51: Open Integrity Alert */}
          {task.source === 'integrity-monitor' && (
            <button className="px-4 py-2 bg-yellow-50 text-yellow-700 rounded text-sm hover:bg-yellow-100">
              🔍 Open Integrity Alert
            </button>
          )}

          {/* Phase 45: Open Governance Lineage */}
          {(task.source === 'governance-system' || task.source === 'governance-lineage') && (
            <button className="px-4 py-2 bg-blue-50 text-blue-700 rounded text-sm hover:bg-blue-100">
              🔗 Open Governance Lineage
            </button>
          )}

          {/* Phase 46: Open Fabric Links */}
          {task.source === 'knowledge-fabric' && (
            <button className="px-4 py-2 bg-green-50 text-green-700 rounded text-sm hover:bg-green-100">
              🕸️ Open Fabric Links
            </button>
          )}

          {/* Phase 47: Open Documentation Bundle */}
          {task.source === 'documentation-bundler' && (
            <button className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded text-sm hover:bg-indigo-100">
              📚 Open Documentation
            </button>
          )}

          {/* Phase 49: Open Simulation Scenario */}
          {task.source === 'simulation-engine' && (
            <button className="px-4 py-2 bg-pink-50 text-pink-700 rounded text-sm hover:bg-pink-100">
              🎯 Open Simulation
            </button>
          )}

          {/* Phase 48: Open Intelligence Hub */}
          <button className="px-4 py-2 bg-cyan-50 text-cyan-700 rounded text-sm hover:bg-cyan-100">
            🧠 Open Intelligence Hub
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex gap-3">
        {task.status === 'new' && (
          <button onClick={onAcknowledge} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Acknowledge
          </button>
        )}
        {task.status !== 'resolved' && (
          <button onClick={onResolve} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            Resolve
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// REFERENCE PANEL
// ============================================================================

interface ActionReferencePanelProps {
  entities: AffectedEntity[];
  references: ActionReference[];
}

function ActionReferencePanel({ entities, references }: ActionReferencePanelProps) {
  return (
    <div>
      <h3 className="font-semibold mb-2">Affected Entities</h3>
      <div className="space-y-2 mb-4">
        {entities.map((entity, idx) => (
          <div key={idx} className="flex items-center gap-2 text-sm">
            <span className="px-2 py-1 bg-gray-100 rounded">{entity.entityType}</span>
            <span className="font-medium">{entity.title}</span>
          </div>
        ))}
      </div>

      {references.length > 0 && (
        <>
          <h3 className="font-semibold mb-2">Related References</h3>
          <div className="space-y-2">
            {references.map((ref, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                <span className="px-2 py-1 bg-gray-100 rounded">{ref.referenceType}</span>
                <span>{ref.title}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================================
// STATISTICS VIEWER
// ============================================================================

interface ActionStatisticsViewerProps {
  actionEngine: ActionEngine;
}

function ActionStatisticsViewer({ actionEngine }: ActionStatisticsViewerProps) {
  const [stats, setStats] = useState<ActionStatistics | null>(null);

  useEffect(() => {
    setStats(actionEngine.getStatistics());
  }, [actionEngine]);

  if (!stats) return null;

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Statistics</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div className="bg-gray-50 p-4 rounded text-center">
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-2xl font-bold">{stats.totalTasks}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded text-center">
          <p className="text-sm text-gray-600">New</p>
          <p className="text-2xl font-bold">{stats.newTasks}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded text-center">
          <p className="text-sm text-gray-600">Acknowledged</p>
          <p className="text-2xl font-bold">{stats.acknowledgedTasks}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded text-center">
          <p className="text-sm text-gray-600">Assigned</p>
          <p className="text-2xl font-bold">{stats.assignedTasks}</p>
        </div>
        <div className="bg-orange-50 p-4 rounded text-center">
          <p className="text-sm text-gray-600">In Progress</p>
          <p className="text-2xl font-bold">{stats.inProgressTasks}</p>
        </div>
        <div className="bg-green-50 p-4 rounded text-center">
          <p className="text-sm text-gray-600">Resolved</p>
          <p className="text-2xl font-bold">{stats.resolvedTasks}</p>
        </div>
        <div className="bg-red-50 p-4 rounded text-center">
          <p className="text-sm text-gray-600">Dismissed</p>
          <p className="text-2xl font-bold">{stats.dismissedTasks}</p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// HISTORY VIEWER
// ============================================================================

interface ActionHistoryViewerProps {
  actionEngine: ActionEngine;
}

function ActionHistoryViewer({ actionEngine }: ActionHistoryViewerProps) {
  const [entries, setEntries] = useState<any[]>([]);

  useEffect(() => {
    setEntries(actionEngine.getActionLog().getRecentEntries(10));
  }, [actionEngine]);

  return (
    <div className="bg-white rounded-lg shadow p-6 mt-6">
      <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>

      <div className="space-y-2">
        {entries.map(entry => (
          <div key={entry.entryId} className="flex items-center gap-3 text-sm p-3 bg-gray-50 rounded">
            <span className="px-2 py-1 bg-gray-200 rounded text-xs">{entry.entryType}</span>
            <span className="text-gray-600">{new Date(entry.timestamp).toLocaleString()}</span>
            <span className="text-gray-900">{entry.performedBy}</span>
            {entry.success ? (
              <span className="text-green-600">✓</span>
            ) : (
              <span className="text-red-600">✗</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// HELPERS
// ============================================================================

function getSeverityColor(severity: ActionSeverity): string {
  switch (severity) {
    case 'critical':
      return 'bg-red-100 text-red-800';
    case 'high':
      return 'bg-orange-100 text-orange-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'low':
      return 'bg-blue-100 text-blue-800';
    case 'info':
      return 'bg-gray-100 text-gray-800';
  }
}

function getStatusColor(status: ActionStatus): string {
  switch (status) {
    case 'new':
      return 'bg-blue-100 text-blue-800';
    case 'acknowledged':
      return 'bg-purple-100 text-purple-800';
    case 'assigned':
      return 'bg-indigo-100 text-indigo-800';
    case 'in-progress':
      return 'bg-yellow-100 text-yellow-800';
    case 'resolved':
      return 'bg-green-100 text-green-800';
    case 'dismissed':
      return 'bg-gray-100 text-gray-800';
  }
}
