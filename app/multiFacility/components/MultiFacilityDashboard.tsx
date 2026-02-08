'use client';

import React, { useState, useEffect } from 'react';
import { FacilitySummaryCard } from './FacilitySummaryCard';
import { GlobalLoadPanel } from './GlobalLoadPanel';
import { SharedResourcePanel } from './SharedResourcePanel';
import { GlobalOptimizationPanel } from './GlobalOptimizationPanel';
import { MultiFacilityAuditPanel } from './MultiFacilityAuditPanel';
import { MultiFacilityHistoryViewer } from './MultiFacilityHistoryViewer';
import {
  MultiFacilityState,
  SharedResourcePlan,
  GlobalOptimizationProposal,
  FacilityProfile,
  FacilityLoadSnapshot,
  FacilityRiskSnapshot,
  FacilityResourceSnapshot,
} from '../multiFacilityTypes';
import { facilityAggregator } from '../facilityAggregator';
import { multiFacilityEngine } from '../multiFacilityEngine';
import { sharedResourceCoordinator } from '../sharedResourceCoordinator';
import { crossFacilityOptimizer } from '../crossFacilityOptimizer';
import { multiFacilityAuditor } from '../multiFacilityAuditor';
import { multiFacilityLog } from '../multiFacilityLog';

// Mock data for demonstration
const MOCK_FACILITIES: FacilityProfile[] = [
  {
    facilityId: 'facility-1',
    name: 'North Warehouse',
    location: 'Portland, OR',
    totalCapacityKg: 5000,
    energyBudgetKwh: 1000,
    laborHoursAvailable: 160,
    rooms: [
      { roomId: 'r1-1', volumeM3: 50, species: 'oyster', capacity: 1500 },
      { roomId: 'r1-2', volumeM3: 50, species: 'lion-mane', capacity: 1500 },
      { roomId: 'r1-3', volumeM3: 50, species: 'shiitake', capacity: 2000 },
    ],
    equipmentIds: ['autoclave-1', 'incubator-1', 'monitor-1'],
  },
  {
    facilityId: 'facility-2',
    name: 'South Facility',
    location: 'Salem, OR',
    totalCapacityKg: 3500,
    energyBudgetKwh: 800,
    laborHoursAvailable: 120,
    rooms: [
      { roomId: 'r2-1', volumeM3: 40, species: 'reishi', capacity: 1500 },
      { roomId: 'r2-2', volumeM3: 40, species: 'cordyceps', capacity: 2000 },
    ],
    equipmentIds: ['autoclave-2', 'incubator-2'],
  },
  {
    facilityId: 'facility-3',
    name: 'East Hub',
    location: 'Bend, OR',
    totalCapacityKg: 4000,
    energyBudgetKwh: 900,
    laborHoursAvailable: 140,
    rooms: [
      { roomId: 'r3-1', volumeM3: 50, species: 'oyster', capacity: 2000 },
      { roomId: 'r3-2', volumeM3: 50, species: 'turkey-tail', capacity: 2000 },
    ],
    equipmentIds: ['autoclave-3', 'incubator-3', 'sterilizer-1'],
  },
];

const MOCK_LOAD_SNAPSHOTS: FacilityLoadSnapshot[] = [
  {
    facilityId: 'facility-1',
    timestamp: new Date().toISOString(),
    currentLoadPercent: 75,
    peakEnergyKwh: 850,
    activeSpecies: ['oyster', 'lion-mane', 'shiitake'],
    roomUtilization: [
      { roomId: 'r1-1', utilizationPercent: 80 },
      { roomId: 'r1-2', utilizationPercent: 70 },
      { roomId: 'r1-3', utilizationPercent: 75 },
    ],
    contentionLevel: 'high',
  },
  {
    facilityId: 'facility-2',
    timestamp: new Date().toISOString(),
    currentLoadPercent: 45,
    peakEnergyKwh: 500,
    activeSpecies: ['reishi'],
    roomUtilization: [
      { roomId: 'r2-1', utilizationPercent: 50 },
      { roomId: 'r2-2', utilizationPercent: 40 },
    ],
    contentionLevel: 'low',
  },
  {
    facilityId: 'facility-3',
    timestamp: new Date().toISOString(),
    currentLoadPercent: 60,
    peakEnergyKwh: 720,
    activeSpecies: ['oyster', 'turkey-tail'],
    roomUtilization: [
      { roomId: 'r3-1', utilizationPercent: 65 },
      { roomId: 'r3-2', utilizationPercent: 55 },
    ],
    contentionLevel: 'medium',
  },
];

const MOCK_RISK_SNAPSHOTS: FacilityRiskSnapshot[] = [
  {
    facilityId: 'facility-1',
    timestamp: new Date().toISOString(),
    contaminationRiskScore: 65,
    equipmentFailureRisk: 20,
    laborShortageRisk: 15,
    energyBudgetRisk: 25,
    overallRisk: 'medium',
  },
  {
    facilityId: 'facility-2',
    timestamp: new Date().toISOString(),
    contaminationRiskScore: 25,
    equipmentFailureRisk: 10,
    laborShortageRisk: 30,
    energyBudgetRisk: 10,
    overallRisk: 'low',
  },
  {
    facilityId: 'facility-3',
    timestamp: new Date().toISOString(),
    contaminationRiskScore: 45,
    equipmentFailureRisk: 15,
    laborShortageRisk: 20,
    energyBudgetRisk: 18,
    overallRisk: 'low',
  },
];

const MOCK_RESOURCE_SNAPSHOTS: FacilityResourceSnapshot[] = [
  {
    facilityId: 'facility-1',
    timestamp: new Date().toISOString(),
    substrateMaterials: [
      { material: 'hardwood-sawdust', availableKg: 800, allocatedKg: 750, criticalThresholdKg: 200 },
      { material: 'straw', availableKg: 400, allocatedKg: 300, criticalThresholdKg: 100 },
    ],
    availableCapacity: 1250,
    equipmentAvailability: [
      { equipmentId: 'autoclave-1', isAvailable: true, hoursUntilFree: 0 },
      { equipmentId: 'incubator-1', isAvailable: true, hoursUntilFree: 0 },
    ],
  },
  {
    facilityId: 'facility-2',
    timestamp: new Date().toISOString(),
    substrateMaterials: [
      { material: 'hardwood-sawdust', availableKg: 600, allocatedKg: 200, criticalThresholdKg: 150 },
      { material: 'straw', availableKg: 300, allocatedKg: 80, criticalThresholdKg: 80 },
    ],
    availableCapacity: 1925,
    equipmentAvailability: [
      { equipmentId: 'autoclave-2', isAvailable: true, hoursUntilFree: 0 },
      { equipmentId: 'incubator-2', isAvailable: false, hoursUntilFree: 6 },
    ],
  },
  {
    facilityId: 'facility-3',
    timestamp: new Date().toISOString(),
    substrateMaterials: [
      { material: 'hardwood-sawdust', availableKg: 700, allocatedKg: 400, criticalThresholdKg: 180 },
      { material: 'straw', availableKg: 350, allocatedKg: 150, criticalThresholdKg: 90 },
    ],
    availableCapacity: 1600,
    equipmentAvailability: [
      { equipmentId: 'autoclave-3', isAvailable: true, hoursUntilFree: 0 },
      { equipmentId: 'sterilizer-1', isAvailable: true, hoursUntilFree: 0 },
    ],
  },
];

export const MultiFacilityDashboard: React.FC = () => {
  const [state, setState] = useState<MultiFacilityState | null>(null);
  const [sharedResourcePlans, setSharedResourcePlans] = useState<SharedResourcePlan[]>([]);
  const [globalProposals, setGlobalProposals] = useState<GlobalOptimizationProposal[]>([]);
  const [auditResults, setAuditResults] = useState<any[]>([]);
  const [logEntries, setLogEntries] = useState<any[]>([]);

  useEffect(() => {
    // Aggregate facilities on mount
    const aggregatedState = facilityAggregator.aggregate({
      facilities: MOCK_FACILITIES,
      facilityLoadSnapshots: MOCK_LOAD_SNAPSHOTS,
      facilityRiskSnapshots: MOCK_RISK_SNAPSHOTS,
      facilityResourceSnapshots: MOCK_RESOURCE_SNAPSHOTS,
      executionHistories: [
        { facilityId: 'facility-1', completedTasksCount: 45, totalYieldKg: 3800, energyUsedKwh: 950 },
        { facilityId: 'facility-2', completedTasksCount: 28, totalYieldKg: 2100, energyUsedKwh: 650 },
        { facilityId: 'facility-3', completedTasksCount: 38, totalYieldKg: 3200, energyUsedKwh: 820 },
      ],
      optimizationOutputs: [
        { facilityId: 'facility-1', proposalCount: 3, averageConfidence: 76 },
        { facilityId: 'facility-2', proposalCount: 2, averageConfidence: 82 },
        { facilityId: 'facility-3', proposalCount: 3, averageConfidence: 79 },
      ],
    });

    setState(aggregatedState);

    // Generate insights
    const insights = multiFacilityEngine.analyzeGlobalState(aggregatedState);
    console.log('Insights:', insights);

    // Detect shared resource contention
    const plans = sharedResourceCoordinator.detectContention(aggregatedState);
    setSharedResourcePlans(plans);

    // Generate global optimization proposals
    const proposals = crossFacilityOptimizer.generateProposals(aggregatedState);
    setGlobalProposals(proposals);

    // Audit proposals
    const audits = multiFacilityAuditor.auditBatch(proposals, aggregatedState);
    setAuditResults(audits);

    // Get log entries
    setLogEntries(multiFacilityLog.getRecent(20));
  }, []);

  const handleApproveResourcePlan = (plan: SharedResourcePlan) => {
    const approved = sharedResourceCoordinator.approvePlan(plan, 'user');
    setSharedResourcePlans(
      sharedResourcePlans.map((p) => (p.planId === plan.planId ? approved : p))
    );
  };

  const handleRejectResourcePlan = (plan: SharedResourcePlan, reason: string) => {
    const rejected = sharedResourceCoordinator.rejectPlan(plan, 'user', reason);
    setSharedResourcePlans(
      sharedResourcePlans.map((p) => (p.planId === plan.planId ? rejected : p))
    );
  };

  const handleApproveProposal = (proposal: GlobalOptimizationProposal) => {
    const approved = { ...proposal, status: 'approved' as const, approvedBy: 'user', approvedAt: new Date().toISOString() };
    setGlobalProposals(
      globalProposals.map((p) => (p.proposalId === proposal.proposalId ? approved : p))
    );
    multiFacilityLog.add({
      entryId: `mf-log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      category: 'approval',
      message: `Global proposal approved: ${proposal.title}`,
      context: { proposalId: proposal.proposalId, affectedFacilities: proposal.affectedFacilities, userId: 'user' },
    });
    setLogEntries(multiFacilityLog.getRecent(20));
  };

  const handleRejectProposal = (proposal: GlobalOptimizationProposal) => {
    const rejected = { ...proposal, status: 'rejected' as const };
    setGlobalProposals(
      globalProposals.map((p) => (p.proposalId === proposal.proposalId ? rejected : p))
    );
    multiFacilityLog.add({
      entryId: `mf-log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      category: 'rejection',
      message: `Global proposal rejected: ${proposal.title}`,
      context: { proposalId: proposal.proposalId, affectedFacilities: proposal.affectedFacilities },
    });
    setLogEntries(multiFacilityLog.getRecent(20));
  };

  if (!state) {
    return <div className="p-8 text-center text-gray-600">Loading multi-facility state...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Multi-Facility Coordination Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Global load: <span className="font-semibold">{state.globalLoad}%</span> | Risk Level:{' '}
          <span className={`font-semibold ${
            state.globalRisk === 'high' ? 'text-rose-600' : state.globalRisk === 'medium' ? 'text-amber-600' : 'text-emerald-600'
          }`}>
            {state.globalRisk.toUpperCase()}
          </span>
        </p>
      </div>

      {/* Facility Summary Cards */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Facility Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {state.facilities.map((facility) => {
            const load = state.loadSnapshots.find((s) => s.facilityId === facility.facilityId);
            return (
              <FacilitySummaryCard
                key={facility.facilityId}
                facility={facility}
                loadSnapshot={load}
              />
            );
          })}
        </div>
      </div>

      {/* Global Load Analysis */}
      <GlobalLoadPanel state={state} />

      {/* Shared Resource Plans */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <SharedResourcePanel
          plans={sharedResourcePlans}
          onApprovePlan={handleApproveResourcePlan}
          onRejectPlan={handleRejectResourcePlan}
        />
      </div>

      {/* Global Optimization Proposals */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <GlobalOptimizationPanel
          proposals={globalProposals}
          onApproveProposal={handleApproveProposal}
          onRejectProposal={handleRejectProposal}
        />
      </div>

      {/* Audit Results */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <MultiFacilityAuditPanel auditResults={auditResults} />
      </div>

      {/* Event History */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <MultiFacilityHistoryViewer entries={logEntries} />
      </div>
    </div>
  );
};
