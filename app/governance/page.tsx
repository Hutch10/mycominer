/**
 * Phase 44: System Governance Dashboard
 * 
 * Main entry point for governance system with role management, permission matrix,
 * policy packs, decision exploration, and audit history.
 */

'use client';

import React from 'react';
import { GovernanceEngine } from './governanceEngine';
import { GovernanceAction, GovernanceSubject, GovernanceResource, GovernanceDecision } from './governanceTypes';
import { RoleExplorer } from './components/RoleExplorer';
import { PermissionMatrixViewer } from './components/PermissionMatrixViewer';
import { PolicyPackManager } from './components/PolicyPackManager';
import { GovernanceDecisionExplorer } from './components/GovernanceDecisionExplorer';
import { GovernanceHistoryViewer } from './components/GovernanceHistoryViewer';

export default function GovernanceDashboard() {
  // Initialize governance engine
  const [engine] = React.useState(() => new GovernanceEngine('tenant-demo', 'facility-01'));
  
  // State
  const [activeTab, setActiveTab] = React.useState<'roles' | 'matrix' | 'packs' | 'decisions' | 'history'>('roles');
  const [selectedRoleId, setSelectedRoleId] = React.useState<string | null>(null);
  const [selectedPackId, setSelectedPackId] = React.useState<string | null>(null);
  const [selectedDecisionId, setSelectedDecisionId] = React.useState<string | null>(null);
  const [decisions, setDecisions] = React.useState<GovernanceDecision[]>([]);
  const [explanation, setExplanation] = React.useState<string | null>(null);

  // Get data from engine
  const roleRegistry = engine.getRoleRegistry();
  const policyPackLibrary = engine.getPolicyPackLibrary();
  const governanceLog = engine.getGovernanceLog();

  const roles = roleRegistry.getAllRoles();
  const policyPacks = policyPackLibrary.getAllPacks();
  const logEntries = governanceLog.getAllEntries();

  // All governance actions for matrix
  const allActions: GovernanceAction[] = [
    'workflow:execute-task',
    'workflow:view-status',
    'compliance:view-records',
    'compliance:modify-capa',
    'compliance:run-audit',
    'sop:view-all',
    'sop:modify-version',
    'timeline:create-incident',
    'timeline:view-events',
    'tenant:manage-users',
    'tenant:manage-roles',
    'tenant:manage-facilities',
    'analytics:create-custom',
    'analytics:view-dashboards',
    'training:create-modules',
    'marketplace:publish-sop',
    'governance:manage-policy-packs'
  ];

  // Run a test permission check
  const runTestCheck = async () => {
    const testSubject: GovernanceSubject = {
      id: 'user-001',
      tenantId: 'tenant-demo',
      facilityId: 'facility-01',
      roleIds: ['operator']
    };

    const testResource: GovernanceResource = {
      name: 'workflow-task-123',
      tenantId: 'tenant-demo',
      facilityId: 'facility-01'
    };

    const decision = await engine.canPerform(
      testSubject,
      'workflow:execute-task',
      testResource
    );

    setDecisions(prev => [decision, ...prev]);
    setSelectedDecisionId(decision.id);
    setActiveTab('decisions');
  };

  // Explain a decision
  const handleExplainDecision = async (decisionId: string) => {
    const result = await engine.explainDecision(decisionId);
    if (result) {
      setExplanation(result.explanation);
    }
  };

  // Toggle policy pack active state
  const handleTogglePack = (packId: string) => {
    const pack = policyPackLibrary.getPack(packId);
    if (pack) {
      if (pack.active) {
        policyPackLibrary.deactivatePack(packId);
      } else {
        pack.active = true;
        policyPackLibrary.setPack(pack);
      }
      // Force re-render
      setSelectedPackId(null);
      setTimeout(() => setSelectedPackId(packId), 0);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">System Governance</h1>
              <p className="text-gray-600 mt-2">
                Role-based access control, policy enforcement, and permission auditing
              </p>
            </div>
            <button
              onClick={runTestCheck}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Run Test Permission Check
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="bg-blue-50 border border-blue-200 rounded p-4">
              <div className="text-sm text-blue-700">Total Roles</div>
              <div className="text-2xl font-bold text-blue-600 mt-1">{roles.length}</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded p-4">
              <div className="text-sm text-green-700">Policy Packs</div>
              <div className="text-2xl font-bold text-green-600 mt-1">{policyPacks.length}</div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded p-4">
              <div className="text-sm text-purple-700">Decisions</div>
              <div className="text-2xl font-bold text-purple-600 mt-1">{decisions.length}</div>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded p-4">
              <div className="text-sm text-orange-700">Log Entries</div>
              <div className="text-2xl font-bold text-orange-600 mt-1">{logEntries.length}</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-4 px-6" aria-label="Tabs">
              {[
                { id: 'roles', label: 'Role Explorer', count: roles.length },
                { id: 'matrix', label: 'Permission Matrix', count: allActions.length },
                { id: 'packs', label: 'Policy Packs', count: policyPacks.length },
                { id: 'decisions', label: 'Decisions', count: decisions.length },
                { id: 'history', label: 'History', count: logEntries.length }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`py-4 px-3 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  <span className="ml-2 py-0.5 px-2 rounded-full text-xs bg-gray-100">
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'roles' && (
              <RoleExplorer
                roles={roles}
                selectedRoleId={selectedRoleId}
                onSelectRole={setSelectedRoleId}
              />
            )}

            {activeTab === 'matrix' && (
              <PermissionMatrixViewer
                roles={roles}
                actions={allActions}
              />
            )}

            {activeTab === 'packs' && (
              <PolicyPackManager
                policyPacks={policyPacks}
                selectedPackId={selectedPackId}
                onSelectPack={setSelectedPackId}
                onToggleActive={handleTogglePack}
              />
            )}

            {activeTab === 'decisions' && (
              <GovernanceDecisionExplorer
                decisions={decisions}
                selectedDecisionId={selectedDecisionId}
                onSelectDecision={setSelectedDecisionId}
                onExplainDecision={handleExplainDecision}
              />
            )}

            {activeTab === 'history' && (
              <GovernanceHistoryViewer
                entries={logEntries}
              />
            )}
          </div>
        </div>

        {/* Explanation Modal */}
        {explanation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold">Decision Explanation</h3>
                <button
                  onClick={() => setExplanation(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <pre className="bg-gray-50 rounded p-4 text-sm whitespace-pre-wrap">
                {explanation}
              </pre>
            </div>
          </div>
        )}

        {/* Integration Points */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Integration Points</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded p-4">
              <h4 className="font-medium text-sm mb-2">Compliance Engine (Phase 32)</h4>
              <p className="text-xs text-gray-600">
                Governance decisions are logged for compliance audits. CAPA modification requires specific roles.
              </p>
            </div>
            <div className="border border-gray-200 rounded p-4">
              <h4 className="font-medium text-sm mb-2">Health System (Phase 43)</h4>
              <p className="text-xs text-gray-600">
                Health checks can query governance to validate role assignments and policy pack configurations.
              </p>
            </div>
            <div className="border border-gray-200 rounded p-4">
              <h4 className="font-medium text-sm mb-2">Workflow Engine (Phase 10)</h4>
              <p className="text-xs text-gray-600">
                All workflow task executions check permissions via governance engine before proceeding.
              </p>
            </div>
            <div className="border border-gray-200 rounded p-4">
              <h4 className="font-medium text-sm mb-2">Training System (Phase 23)</h4>
              <p className="text-xs text-gray-600">
                Training completion records are checked as permission conditions for certain actions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
