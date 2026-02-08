'use client';

import { useState } from 'react';
import { StrategyProposal, StrategyPlan } from '@/app/strategy/engine/strategyTypes';
import { strategyEngine } from '@/app/strategy/engine/strategyEngine';
import { strategyPlanner } from '@/app/strategy/engine/strategyPlanner';
import { strategyAuditor } from '@/app/strategy/engine/strategyAuditor';
import { strategySimulator } from '@/app/strategy/engine/strategySimulator';
import { strategyLog } from '@/app/strategy/engine/strategyLog';
import StrategyProposalCard from '@/app/strategy/components/StrategyProposalCard';
import StrategyPlanPanel from '@/app/strategy/components/StrategyPlanPanel';
import StrategyImpactPanel from '@/app/strategy/components/StrategyImpactPanel';
import StrategyApprovalPanel from '@/app/strategy/components/StrategyApprovalPanel';
import StrategyHistoryViewer from '@/app/strategy/components/StrategyHistoryViewer';
import Breadcrumbs from '@/app/components/Breadcrumbs';

export default function StrategyDashboard() {
  const [proposals, setProposals] = useState<StrategyProposal[]>([]);
  const [plans, setPlans] = useState<StrategyPlan[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<StrategyProposal | null>(null);
  const [auditResults, setAuditResults] = useState<Record<string, any>>({});
  const [impactReports, setImpactReports] = useState<Record<string, any>>({});
  const [logs, setLogs] = useState(strategyLog.list(50));
  const [activeTab, setActiveTab] = useState<'proposals' | 'plans' | 'analysis'>('proposals');

  const handleGenerateProposals = () => {
    // Mock telemetry data
    const mockTelemetry = [
      {
        roomId: 'room-1',
        avgTemperature: 20,
        avgHumidity: 88,
        avgCO2: 2800,
        energyUsageWh: 4500,
        deviationCount: 65,
        instabilityEvents: ['temp-spike', 'humid-drop'],
      },
      {
        roomId: 'room-2',
        avgTemperature: 18,
        avgHumidity: 82,
        avgCO2: 3200,
        energyUsageWh: 5200,
        deviationCount: 42,
        instabilityEvents: ['co2-high'],
      },
    ];

    const mockFacility = {
      facilityId: 'facility-1',
      roomConfigurations: [
        { roomId: 'room-1', volume: 50, species: 'oyster', stage: 'fruiting', devices: [] },
        { roomId: 'room-2', volume: 60, species: 'shiitake', stage: 'fruiting', devices: [] },
      ],
    };

    const mockCloudPatterns = [
      { pattern: 'Nighttime HVAC reduction', frequency: 'seasonal', relatedFacilities: ['f1', 'f2', 'f3'], successRate: 0.82, applicability: 75 },
    ];

    const mockInsights = [
      { id: 'gi-1', type: 'optimization', title: 'Staggered harvest scheduling', applicability: 65, source: 'global-community' },
    ];

    const newProposals = strategyEngine.generateProposals(
      mockTelemetry,
      mockFacility,
      mockCloudPatterns,
      mockInsights,
      []
    );

    setProposals(newProposals);
    setLogs(strategyLog.list(50));
    alert(`Generated ${newProposals.length} strategy proposals!`);
  };

  const handleAuditProposal = (proposal: StrategyProposal) => {
    const audit = strategyAuditor.runAudit(proposal);
    setAuditResults((prev) => ({ ...prev, [proposal.id]: audit }));
    strategyEngine.updateStatus(proposal.id, 'audited');
    setLogs(strategyLog.list(50));
    setSelectedProposal(proposal);
  };

  const handleSimulateProposal = (proposal: StrategyProposal) => {
    const report = strategySimulator.runSimulation(
      { proposalId: proposal.id, duration: 120, includeAllAffectedRooms: true, baseline: 'current' },
      proposal
    );
    setImpactReports((prev) => ({ ...prev, [proposal.id]: report }));
    strategyEngine.updateStatus(proposal.id, 'simulated');
    setLogs(strategyLog.list(50));
    setSelectedProposal(proposal);
  };

  const handleCreatePlan = () => {
    if (proposals.length === 0) {
      alert('Generate proposals first!');
      return;
    }

    const plan = strategyPlanner.createPlan(
      'Integrated Optimization Plan',
      'Combines energy, yield, and contamination mitigation proposals',
      proposals.slice(0, 5),
      proposals.slice(0, 5).map((p) => p.id)
    );

    setPlans((prev) => [plan, ...prev]);
    setLogs(strategyLog.list(50));
  };

  const handleApprovePlan = (planId: string) => {
    const plan = strategyPlanner.approvePlan(planId, 'operator', 'Approved after review');
    if (plan) {
      setPlans((prev) =>
        prev.map((p) => (p.id === planId ? plan : p))
      );
      setLogs(strategyLog.list(50));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs />
      <h1 className="text-4xl font-bold mb-2">Autonomous Optimization & Strategy Engine</h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
        Synthesize telemetry, simulation, facility, global insights, and refinement data to generate strategic optimization
        recommendations. All strategies are proposals only—never directly executed.
      </p>

      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>🎯 Strategy Safety:</strong> All optimization strategies require explicit user approval before
          implementation. No automatic execution. Full audit trail and rollback capability maintained.
        </p>
      </div>

      <div className="mb-6 flex gap-2">
        <button
          onClick={handleGenerateProposals}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded"
        >
          🔍 Generate Strategy Proposals
        </button>
        {proposals.length > 0 && (
          <button
            onClick={handleCreatePlan}
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded"
          >
            📋 Create Strategy Plan
          </button>
        )}
      </div>

      <div className="mb-6 flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('proposals')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'proposals'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          Proposals ({proposals.length})
        </button>
        <button
          onClick={() => setActiveTab('plans')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'plans' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          Strategy Plans ({plans.length})
        </button>
        <button
          onClick={() => setActiveTab('analysis')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'analysis'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          Analysis & History
        </button>
      </div>

      {activeTab === 'proposals' && (
        <div className="space-y-4">
          {proposals.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No proposals generated yet.</p>
              <button
                onClick={handleGenerateProposals}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
              >
                Generate Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="lg:col-span-1 space-y-3 max-h-96 overflow-y-auto">
                {proposals.map((proposal) => (
                  <div key={proposal.id} onClick={() => setSelectedProposal(proposal)} className="cursor-pointer">
                    <StrategyProposalCard
                      proposal={proposal}
                      onAudit={() => handleAuditProposal(proposal)}
                    />
                  </div>
                ))}
              </div>

              <div className="lg:col-span-1 space-y-4">
                {selectedProposal && (
                  <>
                    <div className="border rounded-lg p-4 bg-white dark:bg-gray-800">
                      <h4 className="font-bold mb-3">Selected Proposal</h4>
                      <p className="text-sm mb-2">
                        <span className="font-medium">Type:</span> {selectedProposal.type}
                      </p>
                      <p className="text-sm mb-2">
                        <span className="font-medium">Confidence:</span> {selectedProposal.confidenceScore}%
                      </p>
                      <p className="text-sm mb-3">
                        <span className="font-medium">Rationale:</span> {selectedProposal.rationale}
                      </p>

                      <div className="flex gap-2">
                        {!auditResults[selectedProposal.id] ? (
                          <button
                            onClick={() => handleAuditProposal(selectedProposal)}
                            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white text-sm py-2 rounded"
                          >
                            Run Audit
                          </button>
                        ) : null}
                        {auditResults[selectedProposal.id] && !impactReports[selectedProposal.id] ? (
                          <button
                            onClick={() => handleSimulateProposal(selectedProposal)}
                            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-sm py-2 rounded"
                          >
                            Run Simulation
                          </button>
                        ) : null}
                      </div>
                    </div>

                    {auditResults[selectedProposal.id] && (
                      <StrategyApprovalPanel
                        audit={auditResults[selectedProposal.id]}
                        onApprove={() => strategyEngine.updateStatus(selectedProposal.id, 'approved')}
                      />
                    )}

                    {impactReports[selectedProposal.id] && (
                      <StrategyImpactPanel report={impactReports[selectedProposal.id]} />
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'plans' && (
        <div className="space-y-4">
          {plans.length === 0 ? (
            <p className="text-gray-500">No strategy plans created yet.</p>
          ) : (
            plans.map((plan) => (
              <div key={plan.id}>
                <StrategyPlanPanel plan={plan} />
                {plan.status === 'draft' && (
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => handleApprovePlan(plan.id)}
                      className="bg-green-600 hover:bg-green-700 text-white text-sm py-2 px-4 rounded"
                    >
                      Approve Plan
                    </button>
                    <button className="bg-red-600 hover:bg-red-700 text-white text-sm py-2 px-4 rounded">
                      Reject Plan
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'analysis' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <StrategyHistoryViewer logs={logs} />
          <div className="border rounded-lg p-4 bg-white dark:bg-gray-800">
            <h3 className="text-lg font-semibold mb-3">Quick Stats</h3>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">Total Proposals:</span> {proposals.length}
              </p>
              <p>
                <span className="font-medium">Audited:</span> {proposals.filter((p) => p.status === 'audited').length}
              </p>
              <p>
                <span className="font-medium">Simulated:</span> {proposals.filter((p) => p.status === 'simulated').length}
              </p>
              <p>
                <span className="font-medium">Approved:</span> {proposals.filter((p) => p.status === 'approved').length}
              </p>
              <p className="mt-4 pt-4 border-t">
                <span className="font-medium">Active Plans:</span> {plans.filter((p) => p.status === 'approved').length}
              </p>
              <p>
                <span className="font-medium">Avg Confidence:</span>{' '}
                {proposals.length > 0
                  ? (proposals.reduce((sum, p) => sum + p.confidenceScore, 0) / proposals.length).toFixed(0) +
                    '%'
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
