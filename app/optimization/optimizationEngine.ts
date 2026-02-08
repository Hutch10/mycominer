// Phase 22: Optimization Engine
// Analyzes facility patterns and generates deterministic optimization proposals

'use client';

import {
  OptimizationIngestInput,
  OptimizationProposal,
  EnergyOptimizationReport,
  ResourceOptimizationReport,
  LoadBalancingPlan,
} from '@/app/optimization/optimizationTypes';
import { energyModel } from '@/app/optimization/energyModel';
import { resourceOptimizer } from '@/app/optimization/resourceOptimizer';
import { loadBalancer } from '@/app/optimization/loadBalancer';
import { optimizationLog } from '@/app/optimization/optimizationLog';

class OptimizationEngine {
  private proposalCounter = 0;

  /**
   * Ingest and analyze all optimization sources
   */
  analyze(input: OptimizationIngestInput): {
    energyReport: EnergyOptimizationReport;
    resourceReport: ResourceOptimizationReport;
    loadPlan: LoadBalancingPlan;
    proposals: OptimizationProposal[];
  } {
    // Energy analysis
    const energyReport = this.analyzeEnergy(input);

    // Resource analysis
    const resourceReport = this.analyzeResources(input);

    // Load balancing
    const loadPlan = this.analyzeLoadBalancing(input);

    // Generate proposals from reports
    const proposals = this.generateProposals(energyReport, resourceReport, loadPlan);

    optimizationLog.add({
      entryId: `opt-log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      category: 'energy-analysis',
      message: `Energy analysis complete: ${energyReport.inefficiencies.length} inefficiencies detected`,
      context: { reportId: energyReport.reportId },
      details: { wasteKwh: energyReport.totalWasteKwh, costSavings: energyReport.estimatedCostSavingsDollars },
    });

    return { energyReport, resourceReport, loadPlan, proposals };
  }

  private analyzeEnergy(input: OptimizationIngestInput): EnergyOptimizationReport {
    // Create mock device profiles if facility config provided
    const devices = input.facilityConfig?.rooms.flatMap(room =>
      ['hvac-unit', 'led-grow-lights', 'monitoring-system'].map(type =>
        energyModel.getDeviceProfile(type, room.roomId)
      )
    ).filter(Boolean) ?? [];

    // Generate forecast
    const forecast = energyModel.forecastDemand(devices as any[], 7, 8);

    // Create mock historical data
    const historicalData = Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - (7 - i) * 86400000).toISOString().split('T')[0],
      kwhUsed: forecast.avgDailyKwh * (0.9 + Math.random() * 0.2),
    }));

    // Generate report
    return energyModel.generateReport(historicalData, forecast.avgDailyKwh, devices as any[], 'last-7-days', 0.12);
  }

  private analyzeResources(input: OptimizationIngestInput): ResourceOptimizationReport {
    // Mock substrate consumption analysis
    const substrates = [
      resourceOptimizer.analyzeSubstrateUsage('hardwood-sawdust', 520, 500, 250, 7),
      resourceOptimizer.analyzeSubstrateUsage('straw', 180, 160, 85, 7),
      resourceOptimizer.analyzeSubstrateUsage('bran', 95, 90, 0, 7),
    ];

    // Mock equipment utilization
    const equipment = [
      resourceOptimizer.analyzeEquipmentLoad('autoclave-1', 'Autoclave', 'sterilization', 12, 40, 5),
      resourceOptimizer.analyzeEquipmentLoad('incubator-1', 'Incubator', 'incubation', 35, 40, 8),
      resourceOptimizer.analyzeEquipmentLoad('misting-sys', 'Misting System', 'pump', 24, 40, 6),
    ];

    return resourceOptimizer.generateReport(substrates, equipment, {
      'hardwood-sawdust': 2.5,
      straw: 1.8,
      bran: 3.2,
    });
  }

  private analyzeLoadBalancing(input: OptimizationIngestInput): LoadBalancingPlan {
    // Mock room loads
    const rooms = [
      { roomId: 'room-1', facilityId: 'facility-1', peakEnergyKwh: 42, avgEnergyKwh: 28, speciesCount: 3, taskCount: 8, contentionLevel: 'high' as const },
      { roomId: 'room-2', facilityId: 'facility-1', peakEnergyKwh: 18, avgEnergyKwh: 14, speciesCount: 1, taskCount: 3, contentionLevel: 'low' as const },
      { roomId: 'room-3', facilityId: 'facility-1', peakEnergyKwh: 32, avgEnergyKwh: 22, speciesCount: 2, taskCount: 5, contentionLevel: 'medium' as const },
    ];

    return loadBalancer.generatePlan(rooms, 12);
  }

  private generateProposals(
    energyReport: EnergyOptimizationReport,
    resourceReport: ResourceOptimizationReport,
    loadPlan: LoadBalancingPlan
  ): OptimizationProposal[] {
    const proposals: OptimizationProposal[] = [];

    // Energy optimization proposals
    if (energyReport.inefficiencies.length > 0) {
      const hvacIssues = energyReport.inefficiencies.filter(i => i.type === 'hvac-cycling');
      if (hvacIssues.length > 0) {
        proposals.push({
          proposalId: `opt-prop-${++this.proposalCounter}`,
          category: 'energy-efficiency',
          title: 'Optimize HVAC cycling',
          description: 'Reduce HVAC duty cycle by implementing predictive thermostat scheduling',
          source: 'energy-analysis',
          rationale: `HVAC cycling detected with ${hvacIssues[0].percentageWaste}% waste; predictive scheduling can recover ${(hvacIssues[0].wasteKwh * 0.8).toFixed(1)} kWh/day`,
          expectedBenefit: {
            kwhReduction: hvacIssues[0].wasteKwh * 0.8,
            costSavings: hvacIssues[0].wasteKwh * 0.8 * 0.12,
          },
          implementation: {
            steps: [
              'Adjust thermostat setpoints ±1°C',
              'Enable predictive pre-cooling',
              'Monitor 3-day thermal response',
            ],
            estimatedHours: 2,
            complexity: 'simple',
          },
          riskLevel: 'low',
          confidence: 82,
          status: 'draft',
        });
      }
    }

    // Resource optimization proposals
    if (resourceReport.detectedWaste.length > 0) {
      const substrateWaste = resourceReport.detectedWaste.filter(w => w.category.includes('substrate'));
      if (substrateWaste.length > 0) {
        proposals.push({
          proposalId: `opt-prop-${++this.proposalCounter}`,
          category: 'substrate-optimization',
          title: 'Reduce substrate over-preparation',
          description: 'Calibrate substrate mixing ratios to match actual yield targets',
          source: 'resource-analysis',
          rationale: `${substrateWaste[0].quantity.toFixed(1)}kg substrate waste detected; tighter prep control saves $${substrateWaste[0].estimatedCost}`,
          expectedBenefit: {
            costSavings: substrateWaste[0].estimatedCost,
            yieldIncrease: 2,
          },
          implementation: {
            steps: [
              'Review prep ratios for each species',
              'Implement batch-specific scaling',
              'Log yields for 2 weeks',
            ],
            estimatedHours: 4,
            complexity: 'moderate',
          },
          riskLevel: 'low',
          confidence: 76,
          status: 'draft',
        });
      }
    }

    // Load balancing proposals
    if (loadPlan.peakReductionKwh > 5) {
      proposals.push({
        proposalId: `opt-prop-${++this.proposalCounter}`,
        category: 'load-balancing',
        title: 'Redistribute room load to reduce peak demand',
        description: `Move ${loadPlan.shifts.length} tasks from high-load rooms to under-utilized spaces`,
        source: 'load-analysis',
        rationale: `Current peak ${loadPlan.rebalancedRooms.reduce((sum, r) => sum + r.prevPeakKwh, 0).toFixed(1)} kWh can drop to ${loadPlan.rebalancedRooms.reduce((sum, r) => sum + r.newPeakKwh, 0).toFixed(1)} kWh`,
        expectedBenefit: {
          kwhReduction: loadPlan.peakReductionKwh * 0.7,
          costSavings: loadPlan.peakReductionKwh * 0.7 * 0.12 * 30,
        },
        implementation: {
          steps: loadPlan.shifts.map((s, i) => `Move batch ${i + 1} from ${s.fromRoom} to ${s.toRoom}`),
          estimatedHours: loadPlan.totalImplementationHours,
          complexity: 'moderate',
        },
        riskLevel: 'medium',
        conflictsWith: [],
        confidence: 78,
        status: 'draft',
      });
    }

    return proposals;
  }
}

export const optimizationEngine = new OptimizationEngine();
