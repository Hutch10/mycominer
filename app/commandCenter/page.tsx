import { Metadata } from 'next';
import { CommandCenterDashboard } from './components/CommandCenterDashboard';
import { commandCenterAggregator } from './commandCenterAggregator';
import { CommandCenterIngestInput } from './commandCenterTypes';

export const metadata: Metadata = {
  title: 'Command Center | Mushroom Farm Management',
  description: 'Unified dashboard for monitoring and managing mushroom farm operations',
};

// Mock data generator for demonstration
function generateMockData(): CommandCenterIngestInput {
  const facilities = [
    { facilityId: 'FAC-001', name: 'North Facility', energyBudgetKwh: 5000 },
    { facilityId: 'FAC-002', name: 'South Facility', energyBudgetKwh: 4500 },
    { facilityId: 'FAC-003', name: 'East Facility', energyBudgetKwh: 6000 },
  ];

  return {
    strategyProposals: [
      {
        proposalId: 'STRAT-001',
        category: 'expansion',
        affectedFacilities: ['FAC-001'],
        confidence: 85,
        status: 'draft',
      },
      {
        proposalId: 'STRAT-002',
        category: 'optimization',
        affectedFacilities: ['FAC-002', 'FAC-003'],
        confidence: 92,
        status: 'approved',
      },
    ],
    workflowPlans: [
      {
        planId: 'WF-001',
        facilityId: 'FAC-001',
        status: 'active',
        scheduledTasks: [
          {
            taskId: 'TASK-001',
            title: 'Substrate Inoculation - Oyster Batch #45',
            scheduledStartTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
            estimatedDurationMinutes: 120,
            priority: 'high',
            status: 'ready',
            dependencies: [],
          },
          {
            taskId: 'TASK-002',
            title: 'Environmental Check - Lion\'s Mane Room 3',
            scheduledStartTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
            estimatedDurationMinutes: 30,
            priority: 'medium',
            status: 'scheduled',
            dependencies: [],
          },
        ],
      },
      {
        planId: 'WF-002',
        facilityId: 'FAC-002',
        status: 'active',
        scheduledTasks: [
          {
            taskId: 'TASK-003',
            title: 'Harvest - Shiitake Batch #67',
            scheduledStartTime: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
            estimatedDurationMinutes: 180,
            priority: 'high',
            status: 'ready',
            dependencies: [],
          },
        ],
      },
    ],
    resourceSnapshots: [
      {
        facilityId: 'FAC-001',
        timestamp: new Date().toISOString(),
        substrateLevels: [
          { material: 'sawdust', availableKg: 450, criticalThresholdKg: 100 },
          { material: 'straw', availableKg: 200, criticalThresholdKg: 50 },
          { material: 'grain', availableKg: 150, criticalThresholdKg: 30 },
        ],
        equipmentStatus: [
          { equipmentId: 'autoclave-1', status: 'operational' },
          { equipmentId: 'incubator-1', status: 'operational' },
        ],
      },
      {
        facilityId: 'FAC-002',
        timestamp: new Date().toISOString(),
        substrateLevels: [
          { material: 'sawdust', availableKg: 350, criticalThresholdKg: 100 },
          { material: 'straw', availableKg: 180, criticalThresholdKg: 50 },
          { material: 'grain', availableKg: 100, criticalThresholdKg: 30 },
        ],
        equipmentStatus: [
          { equipmentId: 'autoclave-2', status: 'operational' },
          { equipmentId: 'incubator-2', status: 'maintenance-required' },
        ],
      },
    ],
    executionStatus: [
      {
        facilityId: 'FAC-001',
        activeTasks: 3,
        completedToday: 8,
        failedToday: 0,
        blockedTasks: 0,
      },
      {
        facilityId: 'FAC-002',
        activeTasks: 2,
        completedToday: 6,
        failedToday: 1,
        blockedTasks: 0,
      },
      {
        facilityId: 'FAC-003',
        activeTasks: 4,
        completedToday: 7,
        failedToday: 0,
        blockedTasks: 1,
      },
    ],
    optimizationProposals: [
      {
        proposalId: 'OPT-001',
        category: 'energy-reduction',
        affectedFacilities: ['FAC-001', 'FAC-002'],
        expectedBenefit: {
          globalEnergyReduction: 12,
          globalYieldIncrease: 0,
          globalCostSaving: 1200,
        },
        confidence: 88,
        status: 'draft',
      },
      {
        proposalId: 'OPT-002',
        category: 'yield-optimization',
        affectedFacilities: ['FAC-003'],
        expectedBenefit: {
          globalEnergyReduction: 0,
          globalYieldIncrease: 8,
          globalCostSaving: 800,
        },
        confidence: 75,
        status: 'draft',
      },
    ],
    multiFacilityState: {
      facilities: facilities.map((f) => ({ ...f })),
      loadSnapshots: [
        { facilityId: 'FAC-001', currentLoadPercent: 68 },
        { facilityId: 'FAC-002', currentLoadPercent: 82 },
        { facilityId: 'FAC-003', currentLoadPercent: 45 },
      ],
      riskSnapshots: [
        { facilityId: 'FAC-001', contaminationRiskScore: 25, overallRisk: 'low' },
        { facilityId: 'FAC-002', contaminationRiskScore: 55, overallRisk: 'medium' },
        { facilityId: 'FAC-003', contaminationRiskScore: 18, overallRisk: 'low' },
      ],
      globalInsights: [
        {
          type: 'load-imbalance',
          severity: 'info',
          affectedFacilities: ['FAC-002', 'FAC-003'],
        },
      ],
    },
    telemetry: [
      {
        facilityId: 'FAC-001',
        timestamp: new Date().toISOString(),
        energyKwh: 3200,
        temperature: 22.5,
        humidity: 65,
      },
      {
        facilityId: 'FAC-002',
        timestamp: new Date().toISOString(),
        energyKwh: 3800,
        temperature: 23.1,
        humidity: 68,
      },
      {
        facilityId: 'FAC-003',
        timestamp: new Date().toISOString(),
        energyKwh: 2700,
        temperature: 21.8,
        humidity: 62,
      },
    ],
  };
}

export default function CommandCenterPage() {
  // Generate aggregated state from mock data
  const mockData = generateMockData();
  const commandCenterState = commandCenterAggregator.aggregate(mockData);

  return <CommandCenterDashboard initialState={commandCenterState} />;
}
