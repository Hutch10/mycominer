'use client';

import { useEffect, useMemo, useState } from 'react';
import { optimizationEngine } from '@/app/optimization/optimizationEngine';
import { optimizationAuditor } from '@/app/optimization/optimizationAuditor';
import { optimizationLog } from '@/app/optimization/optimizationLog';
import {
  EnergyOptimizationReport,
  OptimizationAuditResult,
  OptimizationProposal,
  ResourceOptimizationReport,
  LoadBalancingPlan,
} from '@/app/optimization/optimizationTypes';
import { OptimizationProposalCard } from '@/app/optimization/components/OptimizationProposalCard';
import { EnergyReportPanel } from '@/app/optimization/components/EnergyReportPanel';
import { ResourceReportPanel } from '@/app/optimization/components/ResourceReportPanel';
import { LoadBalancingPanel } from '@/app/optimization/components/LoadBalancingPanel';
import { OptimizationAuditPanel } from '@/app/optimization/components/OptimizationAuditPanel';
import { OptimizationHistoryViewer } from '@/app/optimization/components/OptimizationHistoryViewer';

export function OptimizationDashboard() {
  const [energyReport, setEnergyReport] = useState<EnergyOptimizationReport | null>(null);
  const [resourceReport, setResourceReport] = useState<ResourceOptimizationReport | null>(null);
  const [loadPlan, setLoadPlan] = useState<LoadBalancingPlan | null>(null);
  const [proposals, setProposals] = useState<OptimizationProposal[]>([]);
  const [auditResults, setAuditResults] = useState<OptimizationAuditResult[]>([]);
  const [logs, setLogs] = useState(optimizationLog.getRecent(20));

  const mockInput = useMemo(() => ({
    facilityConfig: {
      facilitiyId: 'facility-1',
      rooms: [
        { roomId: 'room-1', volumeM3: 35, devices: ['hvac-1', 'lights-1', 'monitor-1'] },
        { roomId: 'room-2', volumeM3: 28, devices: ['hvac-2', 'lights-2', 'monitor-2'] },
        { roomId: 'room-3', volumeM3: 42, devices: ['hvac-3', 'lights-3', 'monitor-3'] },
      ],
      energyBudgetKwh: 500,
    },
    telemetryData: [
      { period: 'day-1', roomId: 'room-1', avgEnergyKwh: 28, peakEnergyKwh: 42, avgTemperature: 24, avgHumidity: 88 },
      { period: 'day-2', roomId: 'room-2', avgEnergyKwh: 14, peakEnergyKwh: 18, avgTemperature: 22, avgHumidity: 85 },
      { period: 'day-3', roomId: 'room-3', avgEnergyKwh: 22, peakEnergyKwh: 32, avgTemperature: 23, avgHumidity: 87 },
    ],
  }), []);

  useEffect(() => {
    const result = optimizationEngine.analyze(mockInput);
    setEnergyReport(result.energyReport);
    setResourceReport(result.resourceReport);
    setLoadPlan(result.loadPlan);
    setProposals(result.proposals);

    // Audit proposals
    const auditConstraints = {
      energyBudgetKwh: 500,
      maxContaminationRiskIncrease: 5,
      maxYieldReduction: -5,
      maxRegressionRisk: 10,
    };
    const audits = optimizationAuditor.auditBatch(result.proposals, auditConstraints);
    setAuditResults(audits);

    setLogs(optimizationLog.getRecent(20));
  }, [mockInput]);

  const handleApproveProposal = (proposalId: string) => {
    setProposals(prev =>
      prev.map(p =>
        p.proposalId === proposalId
          ? { ...p, status: 'approved' as const, approvedBy: 'ops-lead', approvedAt: new Date().toISOString() }
          : p
      )
    );
    optimizationLog.add({
      entryId: `opt-log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      category: 'approval',
      message: `Proposal ${proposalId} approved`,
      context: { proposalId, userId: 'ops-lead' },
    });
    setLogs(optimizationLog.getRecent(20));
  };

  const handleRejectProposal = (proposalId: string) => {
    setProposals(prev =>
      prev.map(p => (p.proposalId === proposalId ? { ...p, status: 'rejected' as const } : p))
    );
    optimizationLog.add({
      entryId: `opt-log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      category: 'rejection',
      message: `Proposal ${proposalId} rejected`,
      context: { proposalId, userId: 'ops-lead' },
    });
    setLogs(optimizationLog.getRecent(20));
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-900 to-slate-700 p-6 text-white shadow-lg">
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-300">Autonomous Resource Optimization</div>
          <h1 className="text-2xl font-bold mt-1">Energy & resource intelligence</h1>
          <p className="text-sm text-slate-200 mt-1">Deterministic analysis of energy, resources, and load distribution. All optimizations are proposals requiring explicit approval.</p>
        </div>
      </div>

      {energyReport && resourceReport && loadPlan && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <EnergyReportPanel report={energyReport} />
          <ResourceReportPanel report={resourceReport} />
          <LoadBalancingPanel plan={loadPlan} />
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Optimization proposals</h2>
          <span className="text-sm text-slate-600">{proposals.length} generated</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {proposals.map(proposal => (
            <OptimizationProposalCard
              key={proposal.proposalId}
              proposal={proposal}
              onApprove={() => handleApproveProposal(proposal.proposalId)}
              onReject={() => handleRejectProposal(proposal.proposalId)}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <OptimizationAuditPanel results={auditResults} />
        <OptimizationHistoryViewer entries={logs} />
      </div>
    </div>
  );
}
