import {
  MultiFacilityState,
  GlobalOptimizationProposal,
  GlobalOptimizationCategory,
} from './multiFacilityTypes';
import { multiFacilityLog } from './multiFacilityLog';
import { facilityAggregator } from './facilityAggregator';
import { multiFacilityEngine } from './multiFacilityEngine';

class CrossFacilityOptimizer {
  /**
   * Analyze cross-facility patterns and generate global optimization proposals
   * Deterministic: energy consolidation, yield balancing, contamination risk mitigation
   */
  generateProposals(state: MultiFacilityState): GlobalOptimizationProposal[] {
    const proposals: GlobalOptimizationProposal[] = [];

    // Energy optimization proposals
    const energyProposals = this.generateEnergyOptimizations(state);
    proposals.push(...energyProposals);

    // Yield balancing proposals
    const yieldProposals = this.generateYieldBalancing(state);
    proposals.push(...yieldProposals);

    // Contamination risk mitigation proposals
    const contaminationProposals = this.generateContaminationMitigation(state);
    proposals.push(...contaminationProposals);

    // Schedule coordination proposals
    const scheduleProposals = this.generateScheduleCoordination(state);
    proposals.push(...scheduleProposals);

    // Facility specialization proposals
    const specializationProposals = this.generateSpecialization(state);
    proposals.push(...specializationProposals);

    return proposals;
  }

  /**
   * Generate proposals for cross-facility energy consolidation
   * Shift high-energy operations to off-peak facility times
   */
  private generateEnergyOptimizations(state: MultiFacilityState): GlobalOptimizationProposal[] {
    const proposals: GlobalOptimizationProposal[] = [];

    const loadSummary = multiFacilityEngine.getGlobalLoadSummary(state);

    if (loadSummary.maxLoad - loadSummary.minLoad > 30) {
      // High variance suggests opportunity for load balancing
      const overloadedFacilities = loadSummary.facilities.filter((f) => f.load > 70);
      const underloadedFacilities = loadSummary.facilities.filter((f) => f.load < 40);

      if (overloadedFacilities.length > 0 && underloadedFacilities.length > 0) {
        const proposal: GlobalOptimizationProposal = {
          proposalId: `gop-${Date.now()}-${Math.random()}`,
          category: 'cross-facility-energy-optimization',
          title: 'Consolidate high-energy operations to underutilized facilities',
          description: `Shift sterilization and incubation workloads from ${overloadedFacilities.length} overloaded to ${underloadedFacilities.length} underutilized facilities to reduce peak demand`,
          affectedFacilities: [
            ...overloadedFacilities.map((f) => f.facilityId),
            ...underloadedFacilities.map((f) => f.facilityId),
          ],
          rationale: `Current load variance of ${loadSummary.maxLoad - loadSummary.minLoad}% indicates inefficient resource distribution. Consolidating high-energy tasks reduces facility-level peaks and improves grid efficiency.`,
          expectedBenefit: {
            globalEnergyReduction: Math.round(
              state.facilities.reduce((sum, f) => sum + f.energyBudgetKwh, 0) * 0.08
            ), // ~8% reduction
            globalCostSaving: Math.round(
              state.facilities.reduce((sum, f) => sum + f.energyBudgetKwh, 0) * 0.08 * 0.12
            ), // $0.12/kWh
          },
          implementation: {
            steps: [
              'Identify high-energy operations in overloaded facilities',
              'Schedule sterilization/incubation in underutilized facility',
              'Stagger HVAC and cooling schedules',
              'Monitor peak load reduction',
            ],
            affectedFacilities: loadSummary.facilities.map((f) => ({
              facilityId: f.facilityId,
              localSteps: f.load > 70 ? ['Defer non-critical sterilization'] : ['Increase sterilization schedule'],
              estimatedHours: 12,
            })),
            totalImplementationHours: 48,
            complexity: 'moderate',
          },
          risks: overloadedFacilities.map((f) => ({
            facilityId: f.facilityId,
            risk: 'Reduced local sterilization capacity may delay batch processing',
            mitigationStrategy: 'Stagger batches across facilities; maintain critical sterilization locally',
          })),
          rollbackCapability: {
            feasible: true,
            estimatedHours: 8,
            steps: ['Revert operations to original facilities', 'Resume standard schedules'],
          },
          riskLevel: 'low',
          confidence: 78,
          status: 'draft',
        };

        multiFacilityLog.add({
          entryId: `mf-log-${Date.now()}-${Math.random()}`,
          timestamp: new Date().toISOString(),
          category: 'global-proposal',
          message: 'Energy consolidation proposal generated',
          context: {
            proposalId: proposal.proposalId,
            affectedFacilities: proposal.affectedFacilities,
          },
          details: {
            expectedSavings: proposal.expectedBenefit.globalCostSaving,
          },
        });

        proposals.push(proposal);
      }
    }

    return proposals;
  }

  /**
   * Generate yield balancing proposals
   * Shift production to facilities with higher success rates
   */
  private generateYieldBalancing(state: MultiFacilityState): GlobalOptimizationProposal[] {
    const proposals: GlobalOptimizationProposal[] = [];

    // Analyze facility performance from load snapshots
    const facilityYields = state.loadSnapshots.map((snap) => ({
      facilityId: snap.facilityId,
      activeSpecies: snap.activeSpecies.length,
      utilizationPercent: snap.currentLoadPercent,
    }));

    const highPerformers = facilityYields.filter((f) => f.activeSpecies > 3);
    const lowPerformers = facilityYields.filter((f) => f.activeSpecies < 2);

    if (highPerformers.length > 0 && lowPerformers.length > 0) {
      const proposal: GlobalOptimizationProposal = {
        proposalId: `gop-${Date.now()}-${Math.random()}`,
        category: 'yield-balancing',
        title: 'Increase production in high-performing facilities',
        description: `Shift production targets to facilities with proven capability to grow more species simultaneously`,
        affectedFacilities: [
          ...highPerformers.map((f) => f.facilityId),
          ...lowPerformers.map((f) => f.facilityId),
        ],
        rationale: `High-performing facilities demonstrate ability to manage multiple species with lower contamination. Concentrating production in these facilities improves overall yield.`,
        expectedBenefit: {
          globalYieldIncrease: Math.round(
            state.facilities.reduce((sum, f) => sum + f.totalCapacityKg, 0) * 0.12
          ), // ~12% increase
        },
        implementation: {
          steps: [
            'Analyze species-specific success rates per facility',
            'Increase batch sizes in high-performing facilities',
            'Reduce batch complexity in low-performing facilities',
            'Monitor yield improvement over 4 weeks',
          ],
          affectedFacilities: facilityYields.map((f) => ({
            facilityId: f.facilityId,
            localSteps: highPerformers.some((hp) => hp.facilityId === f.facilityId)
              ? ['Increase batch sizes by 20%', 'Add second cultivation cycle']
              : ['Focus on single-species batches', 'Reduce concurrent species'],
            estimatedHours: 20,
          })),
          totalImplementationHours: 60,
          complexity: 'moderate',
        },
        risks: lowPerformers.map((f) => ({
          facilityId: f.facilityId,
          risk: 'Reducing production may impact labor utilization',
          mitigationStrategy: 'Redeploy labor to maintenance and infrastructure improvements',
        })),
        rollbackCapability: {
          feasible: true,
          estimatedHours: 4,
          steps: ['Revert batch size targets', 'Resume previous species diversity'],
        },
        riskLevel: 'low',
        confidence: 72,
        status: 'draft',
      };

      multiFacilityLog.add({
        entryId: `mf-log-${Date.now()}-${Math.random()}`,
        timestamp: new Date().toISOString(),
        category: 'global-proposal',
        message: 'Yield balancing proposal generated',
        context: {
          proposalId: proposal.proposalId,
          affectedFacilities: proposal.affectedFacilities,
        },
        details: {
          expectedYieldIncrease: proposal.expectedBenefit.globalYieldIncrease,
        },
      });

      proposals.push(proposal);
    }

    return proposals;
  }

  /**
   * Generate contamination risk mitigation proposals
   * Isolate high-risk facilities or implement cross-facility quarantine protocols
   */
  private generateContaminationMitigation(state: MultiFacilityState): GlobalOptimizationProposal[] {
    const proposals: GlobalOptimizationProposal[] = [];

    const riskSummary = multiFacilityEngine.getGlobalRiskSummary(state);

    if (riskSummary.avgContaminationRisk > 50) {
      // High contamination risk warrants cross-facility protocol
      const riskSnapshots = state.riskSnapshots.filter(
        (r) => r.contaminationRiskScore > 60
      );
      const lowRiskFacilities = state.riskSnapshots.filter(
        (r) => r.contaminationRiskScore < 30
      );

      if (riskSnapshots.length > 0 && lowRiskFacilities.length > 0) {
        const proposal: GlobalOptimizationProposal = {
          proposalId: `gop-${Date.now()}-${Math.random()}`,
          category: 'contamination-risk-mitigation',
          title: 'Implement cross-facility contamination isolation protocol',
          description: `Establish strict separation between high-risk and low-risk facilities to prevent spread`,
          affectedFacilities: state.facilities.map((f) => f.facilityId),
          rationale: `Current contamination risk average of ${riskSummary.avgContaminationRisk}% exceeds acceptable threshold. Spatial isolation reduces cross-contamination likelihood.`,
          expectedBenefit: {
            contaminationRiskReduction: 25, // Risk score reduction of 25 points
          },
          implementation: {
            steps: [
              'Identify high-risk contamination patterns',
              'Implement dedicated equipment for high-risk facilities',
              'Restrict staff movement between high and low-risk areas',
              'Increase cleaning frequency in high-risk zones',
              'Monitor contamination incidents weekly',
            ],
            affectedFacilities: state.facilities.map((f) => ({
              facilityId: f.facilityId,
              localSteps:
                riskSnapshots.some((r) => r.facilityId === f.facilityId) ?
                  [
                    'Dedicate sterilization equipment',
                    'Increase autoclave cycles',
                    'Daily contamination checks',
                  ]
                : [
                    'Minimize cross-facility traffic',
                    'Enhanced PPE protocols',
                    'Weekly audits',
                  ],
              estimatedHours: 40,
            })),
            totalImplementationHours: 120,
            complexity: 'complex',
          },
          risks: [
            {
              facilityId: 'all',
              risk: 'Operational friction from increased isolation',
              mitigationStrategy: 'Dedicated staff per facility zone; clear protocols',
            },
          ],
          rollbackCapability: {
            feasible: true,
            estimatedHours: 16,
            steps: ['Restore normal staff movement', 'Standardize equipment sharing', 'Resume cross-facility coordination'],
          },
          riskLevel: 'medium',
          confidence: 82,
          status: 'draft',
        };

        multiFacilityLog.add({
          entryId: `mf-log-${Date.now()}-${Math.random()}`,
          timestamp: new Date().toISOString(),
          category: 'global-proposal',
          message: 'Contamination isolation protocol proposed',
          context: {
            proposalId: proposal.proposalId,
            affectedFacilities: proposal.affectedFacilities,
          },
          details: {
            avgContaminationRisk: riskSummary.avgContaminationRisk,
            riskReduction: proposal.expectedBenefit.contaminationRiskReduction,
          },
        });

        proposals.push(proposal);
      }
    }

    return proposals;
  }

  /**
   * Generate schedule coordination proposals
   * Stagger resource-heavy operations across facilities
   */
  private generateScheduleCoordination(state: MultiFacilityState): GlobalOptimizationProposal[] {
    const proposals: GlobalOptimizationProposal[] = [];

    const loadSummary = multiFacilityEngine.getGlobalLoadSummary(state);

    // If multiple facilities at high load simultaneously, propose staggering
    const simultaneousHighLoad = loadSummary.facilities.filter((f) => f.load > 75).length;

    if (simultaneousHighLoad >= 2) {
      const proposal: GlobalOptimizationProposal = {
        proposalId: `gop-${Date.now()}-${Math.random()}`,
        category: 'schedule-coordination',
        title: 'Stagger sterilization and incubation cycles across facilities',
        description: `Offset high-energy operations to reduce simultaneous peak demand`,
        affectedFacilities: state.facilities.map((f) => f.facilityId),
        rationale: `${simultaneousHighLoad} facilities currently at >75% load simultaneously. Staggering operations reduces infrastructure strain.`,
        expectedBenefit: {
          globalEnergyReduction: Math.round(
            state.facilities.reduce((sum, f) => sum + f.energyBudgetKwh, 0) * 0.05
          ), // ~5% reduction from peak shaving
        },
        implementation: {
          steps: [
            'Map current sterilization/incubation schedules',
            'Identify peak overlap windows',
            'Offset schedules by 4-6 hours',
            'Implement staggered start times',
          ],
          affectedFacilities: loadSummary.facilities.map((f) => ({
            facilityId: f.facilityId,
            localSteps: [
              f.load > 75
                ? 'Shift sterilization to off-peak hours'
                : 'Maintain current schedule',
              'Implement schedule synchronization',
            ],
            estimatedHours: 8,
          })),
          totalImplementationHours: 32,
          complexity: 'simple',
        },
        risks: [
          {
            facilityId: 'all',
            risk: 'Staggered schedules may delay batch processing',
            mitigationStrategy: 'Design schedules to maintain 48-hour cycle time',
          },
        ],
        rollbackCapability: {
          feasible: true,
          estimatedHours: 2,
          steps: ['Revert to original schedules'],
        },
        riskLevel: 'low',
        confidence: 85,
        status: 'draft',
      };

      multiFacilityLog.add({
        entryId: `mf-log-${Date.now()}-${Math.random()}`,
        timestamp: new Date().toISOString(),
        category: 'global-proposal',
        message: 'Schedule staggering proposal generated',
        context: {
          proposalId: proposal.proposalId,
          affectedFacilities: proposal.affectedFacilities,
        },
      });

      proposals.push(proposal);
    }

    return proposals;
  }

  /**
   * Generate facility specialization proposals
   * Suggest focusing each facility on specific mushroom types
   */
  private generateSpecialization(state: MultiFacilityState): GlobalOptimizationProposal[] {
    const proposals: GlobalOptimizationProposal[] = [];

    // Count species per facility
    const speciesByFacility = new Map<string, Set<string>>();
    state.loadSnapshots.forEach((snap) => {
      if (!speciesByFacility.has(snap.facilityId)) {
        speciesByFacility.set(snap.facilityId, new Set());
      }
      snap.activeSpecies.forEach((sp) => {
        speciesByFacility.get(snap.facilityId)!.add(sp);
      });
    });

    const diverseFacilities = Array.from(speciesByFacility.entries()).filter(
      ([, species]) => species.size > 4
    );

    if (diverseFacilities.length > 1) {
      const proposal: GlobalOptimizationProposal = {
        proposalId: `gop-${Date.now()}-${Math.random()}`,
        category: 'facility-specialization',
        title: 'Specialize facilities by mushroom type',
        description: `Consolidate species cultivation to reduce cross-contamination and setup overhead`,
        affectedFacilities: diverseFacilities.map(([fid]) => fid),
        rationale: `${diverseFacilities.length} facilities currently grow >4 species each. Specialization reduces changeover time and equipment sterilization cycles.`,
        expectedBenefit: {
          globalYieldIncrease: Math.round(
            state.facilities.reduce((sum, f) => sum + f.totalCapacityKg, 0) * 0.08
          ), // ~8% from reduced overhead
          laborReduction: 80, // hours saved on changeover
          contaminationRiskReduction: 15,
        },
        implementation: {
          steps: [
            'Analyze yield and contamination rates by species per facility',
            'Assign 2-3 primary species per facility',
            'Phase out non-primary species gradually',
            'Optimize cultivation parameters for primary species',
          ],
          affectedFacilities: state.facilities.map((f) => ({
            facilityId: f.facilityId,
            localSteps:
              diverseFacilities.some(([fid]) => fid === f.facilityId) ?
                [
                  'Select 2-3 primary species',
                  'Phase out other species over 2 cycles',
                  'Optimize parameters for primary species',
                ]
              : ['Continue current diversity'],
            estimatedHours: 30,
          })),
          totalImplementationHours: 90,
          complexity: 'moderate',
        },
        risks: diverseFacilities.map(([fid]) => ({
          facilityId: fid,
          risk: 'Reduced species diversity may limit revenue flexibility',
          mitigationStrategy: 'Select species with complementary market demand',
        })),
        rollbackCapability: {
          feasible: true,
          estimatedHours: 20,
          steps: ['Resume multi-species cultivation', 'Restore previous optimization parameters'],
        },
        riskLevel: 'low',
        confidence: 70,
        status: 'draft',
      };

      multiFacilityLog.add({
        entryId: `mf-log-${Date.now()}-${Math.random()}`,
        timestamp: new Date().toISOString(),
        category: 'global-proposal',
        message: 'Facility specialization proposal generated',
        context: {
          proposalId: proposal.proposalId,
          affectedFacilities: proposal.affectedFacilities,
        },
      });

      proposals.push(proposal);
    }

    return proposals;
  }
}

export const crossFacilityOptimizer = new CrossFacilityOptimizer();
