'use client';

import {
  StrategyProposal,
  OptimizationType,
  ProposalSource,
  TelemetrySummary,
  FacilityData,
  CloudPattern,
  GlobalInsight,
} from '@/app/strategy/engine/strategyTypes';
import { strategyLog } from '@/app/strategy/engine/strategyLog';

class StrategyEngine {
  private proposals: StrategyProposal[] = [];

  generateProposals(
    telemetry: TelemetrySummary[],
    facilityData: FacilityData,
    cloudPatterns: CloudPattern[] = [],
    globalInsights: GlobalInsight[] = [],
    refinementProposals: string[] = []
  ): StrategyProposal[] {
    const newProposals: StrategyProposal[] = [];

    // Energy optimization analysis
    const energyProposals = this.analyzeEnergyOptimization(telemetry, facilityData);
    newProposals.push(...energyProposals);

    // Yield optimization analysis
    const yieldProposals = this.analyzeYieldOptimization(telemetry, facilityData);
    newProposals.push(...yieldProposals);

    // Contamination mitigation analysis
    const contaminationProposals = this.analyzeContaminationMitigation(telemetry, facilityData);
    newProposals.push(...contaminationProposals);

    // Scheduling optimization
    const schedulingProposals = this.analyzeSchedulingOptimization(facilityData);
    newProposals.push(...schedulingProposals);

    // Cloud pattern integration
    const cloudProposals = this.integrateCloudPatterns(facilityData, cloudPatterns);
    newProposals.push(...cloudProposals);

    // Global insight integration
    const globalProposals = this.integrateGlobalInsights(facilityData, globalInsights);
    newProposals.push(...globalProposals);

    this.proposals.push(...newProposals);

    strategyLog.add({
      category: 'proposal',
      message: `Generated ${newProposals.length} strategy proposals`,
      context: {
        energyProposals: energyProposals.length,
        yieldProposals: yieldProposals.length,
        contaminationProposals: contaminationProposals.length,
        schedulingProposals: schedulingProposals.length,
        cloudProposals: cloudProposals.length,
        globalProposals: globalProposals.length,
      },
    });

    return newProposals;
  }

  private analyzeEnergyOptimization(telemetry: TelemetrySummary[], facility: FacilityData): StrategyProposal[] {
    const proposals: StrategyProposal[] = [];

    // High deviation rooms could benefit from better scheduling
    const highDeviationRooms = telemetry.filter((t) => t.deviationCount > 50);
    if (highDeviationRooms.length > 0) {
      proposals.push({
        id: `energy-${Date.now()}-1`,
        type: 'energy',
        title: 'Optimize Device Scheduling for High-Deviation Rooms',
        description: `${highDeviationRooms.length} room(s) show frequent control deviations, suggesting inefficient cycling.`,
        source: 'telemetry-analysis',
        rationale: 'Excessive device on/off cycles waste energy and stress equipment.',
        expectedBenefit: '15-25% reduction in peak power demand',
        affectedSystems: highDeviationRooms.map((r) => r.roomId),
        confidenceScore: 75,
        riskLevel: 'low',
        implementationSteps: [
          'Increase control tolerances slightly',
          'Implement hysteresis in device switching',
          'Widen dead-bands by 10-15%',
        ],
        estimatedCost: 'minimal',
        status: 'draft',
      });
    }

    // Nighttime HVAC reduction
    proposals.push({
      id: `energy-${Date.now()}-2`,
      type: 'energy',
      title: 'Implement Nighttime HVAC Reduction',
      description: 'Leverage naturally cooler nighttime ambient to reduce active heating/cooling.',
      source: 'cloud-pattern',
      rationale: 'Facilities with seasonal climates can save 20-30% energy via passive nighttime cooling.',
      expectedBenefit: '20-30% reduction in heating/cooling energy',
      affectedSystems: facility.roomConfigurations.map((r) => r.roomId),
      confidenceScore: 80,
      riskLevel: 'medium',
      implementationSteps: [
        'Monitor nighttime ambient temperature',
        'Enable fresh air intake during cool hours',
        'Reduce active HVAC setpoints at night',
        'Verify no contamination risk increase',
      ],
      estimatedCost: '$500 for controls upgrade',
      status: 'draft',
    });

    return proposals;
  }

  private analyzeYieldOptimization(telemetry: TelemetrySummary[], facility: FacilityData): StrategyProposal[] {
    const proposals: StrategyProposal[] = [];

    const unstableRooms = telemetry.filter((t) => t.instabilityEvents.length > 5);
    if (unstableRooms.length > 0) {
      proposals.push({
        id: `yield-${Date.now()}-1`,
        type: 'yield',
        title: 'Stabilize Environmental Conditions in Low-Yield Rooms',
        description: `${unstableRooms.length} room(s) show frequent environmental instability.`,
        source: 'telemetry-analysis',
        rationale: 'Environmental stability directly correlates with fruiting body quality and yield.',
        expectedBenefit: '10-20% yield increase via reduced abort rates',
        affectedSystems: unstableRooms.map((r) => r.roomId),
        confidenceScore: 70,
        riskLevel: 'low',
        implementationSteps: [
          'Install buffer tanks for humidity regulation',
          'Add thermal mass (water barrels)',
          'Improve air circulation uniformity',
          'Calibrate sensor readings',
        ],
        estimatedCost: '$1000-2000 per room',
        status: 'draft',
      });
    }

    // Species clustering
    proposals.push({
      id: `yield-${Date.now()}-2`,
      type: 'yield',
      title: 'Cluster High-Performing Species Together',
      description: 'Group species with similar environmental requirements for optimized growing conditions.',
      source: 'facility-pattern',
      rationale: 'Shared environmental zones allow precise targeting; reduces compromise tuning.',
      expectedBenefit: '5-15% average yield improvement across species',
      affectedSystems: facility.roomConfigurations.map((r) => r.roomId),
      confidenceScore: 65,
      riskLevel: 'medium',
      implementationSteps: [
        'Analyze species compatibility matrix',
        'Plan room reassignments',
        'Stage transfer over 2-3 growth cycles',
        'Monitor cross-contamination risk',
      ],
      estimatedCost: 'labor-intensive',
      status: 'draft',
    });

    return proposals;
  }

  private analyzeContaminationMitigation(telemetry: TelemetrySummary[], facility: FacilityData): StrategyProposal[] {
    const proposals: StrategyProposal[] = [];

    // High humidity rooms at risk
    const highHumidityRooms = telemetry.filter((t) => t.avgHumidity > 90);
    if (highHumidityRooms.length > 0) {
      proposals.push({
        id: `contamination-${Date.now()}-1`,
        type: 'contamination-mitigation',
        title: 'Reduce High-Humidity Contamination Risk',
        description: `${highHumidityRooms.length} room(s) consistently exceed 90% humidity.`,
        source: 'telemetry-analysis',
        rationale: 'Humidity >90% increases mold spore germination risk by 70+%.',
        expectedBenefit: 'Reduce contamination loss by 30-50%',
        affectedSystems: highHumidityRooms.map((r) => r.roomId),
        confidenceScore: 85,
        riskLevel: 'high',
        implementationSteps: [
          'Install or enhance dehumidification',
          'Improve air circulation',
          'Reduce misting frequency',
          'Monitor CO₂ to ensure aerobic conditions',
        ],
        estimatedCost: '$800-1500',
        status: 'draft',
      });
    }

    // CO₂ management for aerobic health
    const highCO2Rooms = telemetry.filter((t) => t.avgCO2 > 3000);
    if (highCO2Rooms.length > 0) {
      proposals.push({
        id: `contamination-${Date.now()}-2`,
        type: 'contamination-mitigation',
        title: 'Improve Ventilation to Reduce CO₂ Pockets',
        description: `${highCO2Rooms.length} room(s) show elevated CO₂ (>3000 ppm).`,
        source: 'telemetry-analysis',
        rationale: 'High CO₂ creates anaerobic microenvironments favoring bacterial contaminants.',
        expectedBenefit: 'Reduce anaerobic contamination risk by 40-60%',
        affectedSystems: highCO2Rooms.map((r) => r.roomId),
        confidenceScore: 80,
        riskLevel: 'medium',
        implementationSteps: [
          'Increase fan runtime',
          'Ensure even airflow distribution',
          'Consider CO₂ scrubbing system',
          'Monitor fruiting body morphology for stress',
        ],
        estimatedCost: '$500-1200',
        status: 'draft',
      });
    }

    return proposals;
  }

  private analyzeSchedulingOptimization(facility: FacilityData): StrategyProposal[] {
    const proposals: StrategyProposal[] = [];

    // Staggered harvests
    proposals.push({
      id: `scheduling-${Date.now()}-1`,
      type: 'scheduling',
      title: 'Implement Staggered Harvest Schedule',
      description: 'Rotate harvest timings to avoid peak labor and resource bottlenecks.',
      source: 'facility-pattern',
      rationale: 'Staggered harvests improve labor efficiency and reduce waste.',
      expectedBenefit: '25-35% improvement in labor utilization',
      affectedSystems: facility.roomConfigurations.map((r) => r.roomId),
      confidenceScore: 75,
      riskLevel: 'low',
      implementationSteps: [
        'Map current harvest schedules',
        'Identify peak overlap periods',
        'Shift 20-30% of rooms to offset cycle',
        'Validate substrate supply can handle stagger',
      ],
      estimatedCost: 'minimal',
      status: 'draft',
    });

    // Substrate prep scheduling
    proposals.push({
      id: `scheduling-${Date.now()}-2`,
      type: 'scheduling',
      title: 'Optimize Substrate Preparation Timing',
      description: 'Pre-stage substrate batches to align with inoculation availability.',
      source: 'facility-pattern',
      rationale: 'Reducing waiting time between prep and inoculation lowers contamination risk.',
      expectedBenefit: '15-25% reduction in substrate losses',
      affectedSystems: ['prep-area'],
      confidenceScore: 70,
      riskLevel: 'low',
      implementationSteps: [
        'Analyze inoculation capacity',
        'Create rolling prep schedule',
        'Implement batch tracking',
      ],
      estimatedCost: 'minimal',
      status: 'draft',
    });

    return proposals;
  }

  private integrateCloudPatterns(facility: FacilityData, patterns: CloudPattern[]): StrategyProposal[] {
    const proposals: StrategyProposal[] = [];

    patterns.forEach((pattern, idx) => {
      if (pattern.applicability > 50 && pattern.successRate > 0.7) {
        proposals.push({
          id: `cloud-${Date.now()}-${idx}`,
          type: 'energy',
          title: `Adopt High-Success Cloud Pattern: ${pattern.pattern}`,
          description: `${pattern.frequency}; ${pattern.relatedFacilities.length} other facilities report ${(pattern.successRate * 100).toFixed(0)}% success rate.`,
          source: 'cloud-pattern',
          rationale: `Proven pattern from similar facilities (applicability: ${pattern.applicability}%).`,
          expectedBenefit: `Projected ${(pattern.successRate * 100).toFixed(0)}% success rate based on peer data.`,
          affectedSystems: facility.roomConfigurations.map((r) => r.roomId),
          confidenceScore: Math.round(pattern.applicability * 0.8),
          riskLevel: 'medium',
          implementationSteps: ['Validate pattern compatibility', 'Pilot on 1-2 rooms', 'Monitor outcomes'],
          status: 'draft',
        });
      }
    });

    return proposals;
  }

  private integrateGlobalInsights(facility: FacilityData, insights: GlobalInsight[]): StrategyProposal[] {
    const proposals: StrategyProposal[] = [];

    insights.forEach((insight, idx) => {
      if (insight.applicability > 40) {
        proposals.push({
          id: `global-${Date.now()}-${idx}`,
          type: 'energy',
          title: `Apply Global Insight: ${insight.title}`,
          description: `${insight.type}; sourced from ${insight.source}.`,
          source: 'global-insight',
          rationale: `Applicable to this facility (${insight.applicability}%).`,
          expectedBenefit: 'Leverage global community knowledge',
          affectedSystems: facility.roomConfigurations.slice(0, 2).map((r) => r.roomId),
          confidenceScore: Math.round(insight.applicability * 0.7),
          riskLevel: 'low',
          implementationSteps: ['Research full context', 'Plan pilot phase', 'Execute incrementally'],
          status: 'draft',
        });
      }
    });

    return proposals;
  }

  list(): StrategyProposal[] {
    return [...this.proposals].reverse();
  }

  get(id: string): StrategyProposal | undefined {
    return this.proposals.find((p) => p.id === id);
  }

  updateStatus(id: string, status: StrategyProposal['status']) {
    const proposal = this.get(id);
    if (proposal) {
      proposal.status = status;
      strategyLog.add({
        category: 'proposal',
        message: `Proposal status updated to ${status}`,
        context: { proposalId: id },
      });
    }
  }
}

export const strategyEngine = new StrategyEngine();
