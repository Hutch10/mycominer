/**
 * Phase 45: Governance History - Dashboard Page
 * 
 * Admin and auditor interface for viewing governance change history,
 * role evolution, permission diffs, and policy lineage.
 */

'use client';

import React, { useState } from 'react';
import {
  GovernanceHistoryEngine,
  GovernanceHistoryQuery,
  GovernanceHistoryResult,
  GovernanceChange,
  RoleEvolutionRecord,
  PermissionDiff,
  PolicyLineage,
  AuditTrail
} from '../governanceHistory';

// ============================================================================
// GOVERNANCE HISTORY DASHBOARD
// ============================================================================

export default function GovernanceHistoryPage() {
  const [tenantId, setTenantId] = useState('demo-tenant');
  const [facilityId, setFacilityId] = useState<string | undefined>('facility-alpha');
  const [engine] = useState(() => new GovernanceHistoryEngine(tenantId, facilityId));
  
  const [activeTab, setActiveTab] = useState<'overview' | 'roles' | 'permissions' | 'policies' | 'audit'>('overview');
  const [queryResult, setQueryResult] = useState<GovernanceHistoryResult | null>(null);
  const [selectedChange, setSelectedChange] = useState<GovernanceChange | null>(null);

  // Sample data
  const recentChanges = engine.getAllChanges().slice(0, 10);
  const statistics = {
    totalChanges: engine.getAllChanges().length,
    changesLast24h: engine.getAllChanges().filter(c => {
      const timestamp = new Date(c.timestamp);
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return timestamp > dayAgo;
    }).length,
    rolesChanged: 0,
    policiesChanged: 0
  };

  const handleQuery = (query: GovernanceHistoryQuery) => {
    const result = engine.executeQuery(query, 'admin-user');
    setQueryResult(result);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          📜 Governance History
        </h1>
        <p className="text-indigo-200">
          Complete audit trail of governance changes, role evolution, and policy lineage
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="text-3xl mb-2">📊</div>
          <div className="text-2xl font-bold text-white mb-1">{statistics.totalChanges}</div>
          <div className="text-indigo-200 text-sm">Total Changes</div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="text-3xl mb-2">⏱️</div>
          <div className="text-2xl font-bold text-white mb-1">{statistics.changesLast24h}</div>
          <div className="text-indigo-200 text-sm">Last 24 Hours</div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="text-3xl mb-2">👥</div>
          <div className="text-2xl font-bold text-white mb-1">{statistics.rolesChanged}</div>
          <div className="text-indigo-200 text-sm">Roles Changed</div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="text-3xl mb-2">📋</div>
          <div className="text-2xl font-bold text-white mb-1">{statistics.policiesChanged}</div>
          <div className="text-indigo-200 text-sm">Policies Changed</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 mb-6">
        <div className="flex gap-2 p-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'overview'
                ? 'bg-indigo-500 text-white'
                : 'text-indigo-200 hover:bg-white/5'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'roles'
                ? 'bg-indigo-500 text-white'
                : 'text-indigo-200 hover:bg-white/5'
            }`}
          >
            Role Evolution
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'permissions'
                ? 'bg-indigo-500 text-white'
                : 'text-indigo-200 hover:bg-white/5'
            }`}
          >
            Permission Diffs
          </button>
          <button
            onClick={() => setActiveTab('policies')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'policies'
                ? 'bg-indigo-500 text-white'
                : 'text-indigo-200 hover:bg-white/5'
            }`}
          >
            Policy Lineage
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'audit'
                ? 'bg-indigo-500 text-white'
                : 'text-indigo-200 hover:bg-white/5'
            }`}
          >
            Audit Trail
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        {activeTab === 'overview' && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Recent Changes</h2>
            {recentChanges.length === 0 ? (
              <div className="text-center py-12 text-indigo-200">
                No changes recorded yet
              </div>
            ) : (
              <div className="space-y-3">
                {recentChanges.map((change) => (
                  <div
                    key={change.id}
                    className="bg-white/5 rounded-lg p-4 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
                    onClick={() => setSelectedChange(change)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {change.changeType === 'roleCreated' && '➕'}
                          {change.changeType === 'roleUpdated' && '✏️'}
                          {change.changeType === 'roleDeactivated' && '🚫'}
                          {change.changeType === 'permissionAdded' && '🔓'}
                          {change.changeType === 'permissionRemoved' && '🔒'}
                          {change.changeType === 'policyPackAssigned' && '📋'}
                          {change.changeType === 'policyPackRevoked' && '📝'}
                        </span>
                        <div>
                          <div className="text-white font-medium">{change.changeType}</div>
                          <div className="text-indigo-200 text-sm">
                            {change.entityType} • {change.entityId}
                          </div>
                        </div>
                      </div>
                      <div className="text-indigo-200 text-sm">
                        {new Date(change.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-indigo-200 text-sm">
                      By: {change.performedBy}
                      {change.approvedBy && ` • Approved by: ${change.approvedBy}`}
                    </div>
                    <div className="text-indigo-200 text-sm mt-2">
                      {change.rationale}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'roles' && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Role Evolution</h2>
            <div className="text-center py-12 text-indigo-200">
              <div className="text-4xl mb-4">🔍</div>
              <div className="mb-4">Track complete role lifecycle and permission changes over time</div>
              <button className="px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors">
                Query Role History
              </button>
            </div>
          </div>
        )}

        {activeTab === 'permissions' && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Permission Diffs</h2>
            <div className="text-center py-12 text-indigo-200">
              <div className="text-4xl mb-4">⚖️</div>
              <div className="mb-4">Compare permission sets and analyze access changes</div>
              <button className="px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors">
                Compute Diff
              </button>
            </div>
          </div>
        )}

        {activeTab === 'policies' && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Policy Lineage</h2>
            <div className="text-center py-12 text-indigo-200">
              <div className="text-4xl mb-4">🔗</div>
              <div className="mb-4">Visualize policy pack evolution and assignment history</div>
              <button className="px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors">
                Trace Lineage
              </button>
            </div>
          </div>
        )}

        {activeTab === 'audit' && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Audit Trail</h2>
            <div className="text-center py-12 text-indigo-200">
              <div className="text-4xl mb-4">📝</div>
              <div className="mb-4">Generate comprehensive audit reports for compliance</div>
              <button className="px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors">
                Generate Audit Trail
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Change Detail Modal */}
      {selectedChange && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-slate-900 rounded-xl border border-white/10 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Change Details</h3>
                <button
                  onClick={() => setSelectedChange(null)}
                  className="text-indigo-200 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-indigo-200 text-sm mb-1">Change Type</div>
                  <div className="text-white font-medium">{selectedChange.changeType}</div>
                </div>

                <div>
                  <div className="text-indigo-200 text-sm mb-1">Entity</div>
                  <div className="text-white font-medium">
                    {selectedChange.entityType} • {selectedChange.entityId}
                  </div>
                </div>

                <div>
                  <div className="text-indigo-200 text-sm mb-1">Timestamp</div>
                  <div className="text-white font-medium">
                    {new Date(selectedChange.timestamp).toLocaleString()}
                  </div>
                </div>

                <div>
                  <div className="text-indigo-200 text-sm mb-1">Performed By</div>
                  <div className="text-white font-medium">{selectedChange.performedBy}</div>
                </div>

                {selectedChange.approvedBy && (
                  <div>
                    <div className="text-indigo-200 text-sm mb-1">Approved By</div>
                    <div className="text-white font-medium">{selectedChange.approvedBy}</div>
                  </div>
                )}

                <div>
                  <div className="text-indigo-200 text-sm mb-1">Rationale</div>
                  <div className="text-white">{selectedChange.rationale}</div>
                </div>

                <div>
                  <div className="text-indigo-200 text-sm mb-1">Scope</div>
                  <div className="text-white font-mono text-sm">
                    Tenant: {selectedChange.tenantId}
                    {selectedChange.facilityId && ` • Facility: ${selectedChange.facilityId}`}
                  </div>
                </div>

                {selectedChange.diff && (
                  <div>
                    <div className="text-indigo-200 text-sm mb-1">Diff</div>
                    <pre className="text-white font-mono text-sm bg-black/20 rounded-lg p-4 overflow-x-auto">
                      {JSON.stringify(selectedChange.diff, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
