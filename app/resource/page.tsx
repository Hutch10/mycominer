// Phase 20: Resource & Inventory Engine Dashboard
// Interactive multi-tab interface for resource management

'use client';

import { useState } from 'react';
import { resourceEngine } from './resourceEngine';
import { inventoryManager } from './inventoryManager';
import { allocationEngine } from './allocationEngine';
import { forecastingEngine } from './forecastingEngine';
import { resourceAuditor } from './resourceAuditor';
import { resourceLog } from './resourceLog';
import {
  AllocationPlan,
  ForecastReport,
  ResourceAuditResult,
  InventoryItem,
  ReplenishmentProposal,
  EquipmentStatus,
} from './resourceTypes';
import { WorkflowPlan } from '@/app/workflow/workflowTypes';
import { InventoryPanel } from './components/InventoryPanel';
import { AllocationPanel } from './components/AllocationPanel';
import { ForecastPanel } from './components/ForecastPanel';
import { ResourceAuditPanel } from './components/ResourceAuditPanel';
import { ResourceHistoryViewer } from './components/ResourceHistoryViewer';
import { ReplenishmentProposalCard } from './components/ReplenishmentProposalCard';
import { ResourceUsageChart } from './components/ResourceUsageChart';

export default function ResourceDashboard() {
  const [activeTab, setActiveTab] = useState<
    'inventory' | 'allocate' | 'forecast' | 'audit' | 'replenish' | 'chart' | 'history'
  >('inventory');

  // State
  const [inventory, setInventory] = useState<InventoryItem[]>(inventoryManager.getAllInventory());
  const [allocationPlan, setAllocationPlan] = useState<AllocationPlan | null>(null);
  const [forecastReport, setForecastReport] = useState<ForecastReport | null>(null);
  const [auditResult, setAuditResult] = useState<ResourceAuditResult | null>(null);
  const [replenishmentProposals, setReplenishmentProposals] = useState<ReplenishmentProposal[]>(
    []
  );

  // Mock equipment (in real implementation, would come from facility engine)
  const [equipment] = useState<EquipmentStatus[]>([
    {
      equipmentId: 'autoclave-1',
      name: 'Autoclave Unit 1',
      type: 'autoclave',
      status: 'in-use',
      location: { room: 'sterilization-room', facility: 'main-facility' },
      capacityUsed: 65,
      hoursUsed: 480,
      hoursUntilMaintenance: 120,
      lastMaintenanceDate: '2024-01-01',
    },
    {
      equipmentId: 'flow-hood-1',
      name: 'Flow Hood 1',
      type: 'laminar-flow-hood',
      status: 'available',
      location: { room: 'inoculation-room', facility: 'main-facility' },
      capacityUsed: 45,
      hoursUsed: 720,
      hoursUntilMaintenance: 240,
      lastMaintenanceDate: '2024-01-15',
    },
  ]);

  const energyBudgetKwh = 500;

  // Form state
  const [workflowPlanId, setWorkflowPlanId] = useState('workflow-plan-1');
  const [species, setSpecies] = useState('oyster');
  const [yieldKg, setYieldKg] = useState(50);
  const [timeWindowDays, setTimeWindowDays] = useState(30);

  /**
   * Generate resource requirements from workflow
   */
  const handleGenerateRequirements = () => {
    // Calculate substrate needed (rough estimate: 2kg substrate per 1kg yield)
    const substrateKg = yieldKg * 2;

    // Create resource request (simplified version)
    const resourceRequest: any = {
      requestId: `req-${Date.now()}`,
      timestamp: new Date().toISOString(),
      source: 'workflow-plan',
      workflowPlanId,
      facilityIds: ['main-facility'],
      requirements: [
        {
          requirementId: `req-substrate-${Date.now()}`,
          workflowId: workflowPlanId,
          category: 'substrate-material' as const,
          resourceName: `${species}-substrate`,
          quantityNeeded: substrateKg,
          unit: 'kg' as const,
          priority: 'high' as const,
          neededBy: new Date(Date.now() + 7 * 24 * 3600000).toISOString(),
          rationale: `Substrate for ${yieldKg}kg ${species} cultivation`,
        },
      ],
      energyBudgetKwh: energyBudgetKwh,
      timeWindowDays: timeWindowDays,
      prioritizeEfficiency: true,
      prioritizeCost: false,
    };

    const requirements = resourceEngine.generateResourceRequirements(resourceRequest);

    resourceLog.add('requirement-generation', `Generated ${requirements.length} requirements`, {
      workflowPlanId,
      species,
      yieldKg,
      requirementCount: requirements.length,
    });

    // Create allocation plan
    const plan = allocationEngine.createAllocationPlan(
      requirements,
      inventory,
      workflowPlanId
    );

    setAllocationPlan(plan);

    resourceLog.add('allocation-creation', `Created allocation plan: ${plan.planId}`, {
      allocationPlanId: plan.planId,
      allocationCount: plan.allocations.length,
      unmetCount: plan.unmetRequirements.length,
      confidence: plan.confidence,
    });

    setActiveTab('allocate');
  };

  /**
   * Generate forecast report
   */
  const handleGenerateForecast = () => {
    if (!allocationPlan) {
      alert('Please generate allocation plan first');
      return;
    }

    const report = forecastingEngine.generateForecastReport(
      allocationPlan.requirements,
      inventory,
      energyBudgetKwh,
      equipment,
      timeWindowDays,
      workflowPlanId
    );

    setForecastReport(report);

    resourceLog.add('forecast-generation', `Generated forecast report: ${report.reportId}`, {
      forecastId: report.reportId,
      forecastCount: report.forecasts.length,
      criticalShortageCount: report.criticalShortages.length,
      confidence: report.overallConfidence,
    });

    // Auto-generate replenishment proposals from low stock
    const lowStockItems = inventoryManager.detectLowStock();
    const proposals = inventoryManager.generateReplenishmentProposals(lowStockItems);
    setReplenishmentProposals(proposals);

    if (proposals.length > 0) {
      resourceLog.add(
        'replenishment-proposal',
        `Generated ${proposals.length} replenishment proposals`,
        {
          proposalCount: proposals.length,
          lowStockCount: lowStockItems.length,
        }
      );
    }

    setActiveTab('forecast');
  };

  /**
   * Run audit on allocation plan
   */
  const handleRunAudit = () => {
    if (!allocationPlan) {
      alert('Please generate allocation plan first');
      return;
    }

    const audit = resourceAuditor.auditAllocationPlan(
      allocationPlan,
      inventory,
      equipment,
      energyBudgetKwh
    );

    setAuditResult(audit);

    resourceLog.add('audit', `Audit completed: ${audit.decision}`, {
      auditId: audit.auditId,
      allocationPlanId: allocationPlan.planId,
      decision: audit.decision,
      errorCount: audit.errors.length,
      warningCount: audit.warnings.length,
    });

    setActiveTab('audit');
  };

  /**
   * Approve allocation plan
   */
  const handleApproveAllocation = () => {
    if (!allocationPlan) return;

    const approved = allocationEngine.approvePlan(allocationPlan, 'user-1');
    setAllocationPlan(approved);

    // Reserve inventory for each allocation
    for (const alloc of allocationPlan.allocations) {
      inventoryManager.reserveInventory(alloc.itemId, alloc.quantityAllocated);
    }
    
    // Refresh inventory display
    setInventory(inventoryManager.getAllInventory());

    resourceLog.add('approval', `Allocation plan approved: ${allocationPlan.planId}`, {
      allocationPlanId: allocationPlan.planId,
      userId: 'user-1',
    });

    alert('Allocation plan approved! Inventory reserved.');
  };

  /**
   * Reject allocation plan
   */
  const handleRejectAllocation = () => {
    if (!allocationPlan) return;

    const reason = prompt('Reason for rejection:');
    if (!reason) return;

    const rejected = allocationEngine.rejectPlan(allocationPlan, reason);
    setAllocationPlan(rejected);

    resourceLog.add('rejection', `Allocation plan rejected: ${allocationPlan.planId}`, {
      allocationPlanId: allocationPlan.planId,
      userId: 'user-1',
      reason,
    });

    alert('Allocation plan rejected.');
  };

  /**
   * Approve replenishment proposal
   */
  const handleApproveReplenishment = (proposal: ReplenishmentProposal) => {
    // Update inventory (simulate order arrival)
    const updatedInventory = inventory.map(item => {
      if (item.name === proposal.resourceName) {
        return {
          ...item,
          quantityAvailable: item.quantityAvailable + proposal.orderQuantity,
        };
      }
      return item;
    });

    setInventory(updatedInventory);

    resourceLog.add(
      'inventory-update',
      `Replenishment approved: ${proposal.resourceName} +${proposal.orderQuantity}${proposal.unit}`,
      {
        proposalId: proposal.proposalId,
        resourceName: proposal.resourceName,
        quantity: proposal.orderQuantity,
        cost: proposal.estimatedCost,
      }
    );

    // Remove from proposals
    setReplenishmentProposals(prev =>
      prev.filter(p => p.proposalId !== proposal.proposalId)
    );

    alert(`Order approved: ${proposal.orderQuantity}${proposal.unit} of ${proposal.resourceName}`);
  };

  /**
   * Manual replenish button handler
   */
  const handleReplenishItem = (item: InventoryItem) => {
    const updatedInventory = inventory.map(inv => {
      if (inv.name === item.name) {
        return {
          ...inv,
          quantityAvailable: inv.quantityAvailable + item.reorderQuantity,
        };
      }
      return inv;
    });

    setInventory(updatedInventory);

    resourceLog.add(
      'inventory-update',
      `Manual replenishment: ${item.name} +${item.reorderQuantity}${item.unit}`,
      {
        resourceName: item.name,
        quantity: item.reorderQuantity,
      }
    );

    alert(`Added ${item.reorderQuantity}${item.unit} of ${item.name} to inventory`);
  };

  const tabs = [
    { id: 'inventory' as const, label: 'Inventory', icon: '📦' },
    { id: 'allocate' as const, label: 'Allocate', icon: '🎯' },
    { id: 'forecast' as const, label: 'Forecast', icon: '📊' },
    { id: 'audit' as const, label: 'Audit', icon: '✅' },
    { id: 'replenish' as const, label: 'Replenish', icon: '🔄' },
    { id: 'chart' as const, label: 'Usage Chart', icon: '📈' },
    { id: 'history' as const, label: 'History', icon: '📜' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Resource & Inventory Engine
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Phase 20: Autonomous resource allocation, forecasting, and inventory management
          </p>
        </div>

        {/* Input Form */}
        <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Generate Resource Plan
          </h2>

          <div className="grid grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Workflow Plan ID
              </label>
              <input
                type="text"
                value={workflowPlanId}
                onChange={e => setWorkflowPlanId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Species
              </label>
              <select
                value={species}
                onChange={e => setSpecies(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="oyster">Oyster</option>
                <option value="shiitake">Shiitake</option>
                <option value="lions-mane">Lion's Mane</option>
                <option value="king-oyster">King Oyster</option>
                <option value="reishi">Reishi</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Target Yield (kg)
              </label>
              <input
                type="number"
                value={yieldKg}
                onChange={e => setYieldKg(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Time Window (days)
              </label>
              <input
                type="number"
                value={timeWindowDays}
                onChange={e => setTimeWindowDays(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleGenerateRequirements}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
            >
              1. Generate Allocation Plan
            </button>

            <button
              onClick={handleGenerateForecast}
              disabled={!allocationPlan}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 font-medium disabled:opacity-50"
            >
              2. Generate Forecast
            </button>

            <button
              onClick={handleRunAudit}
              disabled={!allocationPlan}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium disabled:opacity-50"
            >
              3. Run Audit
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 font-medium transition ${
                activeTab === tab.id
                  ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
          {activeTab === 'inventory' && (
            <InventoryPanel inventory={inventory} onReplenish={handleReplenishItem} />
          )}

          {activeTab === 'allocate' && (
            <AllocationPanel
              plan={allocationPlan}
              onApprove={handleApproveAllocation}
              onReject={handleRejectAllocation}
            />
          )}

          {activeTab === 'forecast' && <ForecastPanel report={forecastReport} />}

          {activeTab === 'audit' && <ResourceAuditPanel audit={auditResult} />}

          {activeTab === 'replenish' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Replenishment Proposals
              </h2>

              {replenishmentProposals.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No replenishment proposals
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {replenishmentProposals.map(proposal => (
                    <ReplenishmentProposalCard
                      key={proposal.proposalId}
                      proposal={proposal}
                      onApprove={handleApproveReplenishment}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'chart' && (
            <ResourceUsageChart forecasts={forecastReport?.forecasts || []} />
          )}

          {activeTab === 'history' && <ResourceHistoryViewer logs={resourceLog.list()} />}
        </div>
      </div>
    </div>
  );
}
