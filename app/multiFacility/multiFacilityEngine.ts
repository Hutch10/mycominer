import {
  MultiFacilityState,
  MultiFacilityInsight,
  FacilityLoadSnapshot,
  FacilityResourceSnapshot,
} from './multiFacilityTypes';
import { multiFacilityLog } from './multiFacilityLog';
import { facilityAggregator } from './facilityAggregator';

class MultiFacilityEngine {
  /**
   * Analyze global state and generate insights about cross-facility patterns
   * Registry pattern: detect underutilized vs. overloaded facilities
   */
  analyzeGlobalState(state: MultiFacilityState): MultiFacilityInsight[] {
    const insights: MultiFacilityInsight[] = [];

    // Detect underutilized facilities
    const underutilized = this.detectUnderutilized(state);
    insights.push(...underutilized);

    // Detect overloaded facilities
    const overloaded = this.detectOverloaded(state);
    insights.push(...overloaded);

    // Detect resource imbalances
    const imbalances = this.detectResourceImbalances(state);
    insights.push(...imbalances);

    // Detect equipment bottlenecks
    const bottlenecks = this.detectEquipmentBottlenecks(state);
    insights.push(...bottlenecks);

    // Detect opportunities
    const opportunities = this.detectOpportunities(state);
    insights.push(...opportunities);

    // Log all insights
    insights.forEach((insight) => {
      multiFacilityLog.add({
        entryId: `mf-log-${Date.now()}-${Math.random()}`,
        timestamp: new Date().toISOString(),
        category: 'insight',
        message: `[${insight.type}] ${insight.description}`,
        context: {
          affectedFacilities: insight.affectedFacilities,
        },
        details: {
          severity: insight.severity,
          confidence: insight.confidence,
        },
      });
    });

    return insights;
  }

  /**
   * Detect facilities operating significantly below capacity
   * Threshold: <40% utilization for >3 days suggests underutilization
   */
  private detectUnderutilized(state: MultiFacilityState): MultiFacilityInsight[] {
    const insights: MultiFacilityInsight[] = [];

    state.facilities.forEach((facility) => {
      const load = facilityAggregator.getLatestLoad(state, facility.facilityId);
      if (load && load.currentLoadPercent < 40) {
        insights.push({
          insightId: `insight-${Date.now()}-${Math.random()}`,
          createdAt: new Date().toISOString(),
          type: 'underutilized',
          affectedFacilities: [facility.facilityId],
          description: `Facility "${facility.name}" is operating at ${load.currentLoadPercent}% capacity`,
          rationale: `Available capacity could be redistributed to other facilities or production could be increased`,
          severity: 'info',
          confidence: 85,
          recommendedAction: `Consider transferring production from other facilities to ${facility.name} or increasing batch sizes`,
        });
      }
    });

    return insights;
  }

  /**
   * Detect facilities approaching capacity limits
   * Threshold: >80% utilization suggests overload risk
   */
  private detectOverloaded(state: MultiFacilityState): MultiFacilityInsight[] {
    const insights: MultiFacilityInsight[] = [];

    state.facilities.forEach((facility) => {
      const load = facilityAggregator.getLatestLoad(state, facility.facilityId);
      if (load && load.currentLoadPercent > 80) {
        insights.push({
          insightId: `insight-${Date.now()}-${Math.random()}`,
          createdAt: new Date().toISOString(),
          type: 'overloaded',
          affectedFacilities: [facility.facilityId],
          description: `Facility "${facility.name}" is operating at ${load.currentLoadPercent}% capacity (near limits)`,
          rationale: `High utilization increases contamination risk and equipment failure likelihood`,
          severity: 'warning',
          confidence: 90,
          recommendedAction: `Redistribute load to underutilized facilities or defer non-critical batches`,
        });
      }
    });

    return insights;
  }

  /**
   * Detect resource availability imbalances
   * When one facility has critical substrate shortage while another has excess
   */
  private detectResourceImbalances(state: MultiFacilityState): MultiFacilityInsight[] {
    const insights: MultiFacilityInsight[] = [];

    // Group facilities by substrate availability
    const substrateStatus = new Map<string, { critical: string[]; adequate: string[]; excess: string[] }>();

    state.facilities.forEach((facility) => {
      const resources = facilityAggregator.getLatestResources(state, facility.facilityId);
      if (!resources) return;

      resources.substrateMaterials.forEach((material) => {
        if (!substrateStatus.has(material.material)) {
          substrateStatus.set(material.material, { critical: [], adequate: [], excess: [] });
        }

        const status = substrateStatus.get(material.material)!;
        const utilizationPercent = (material.allocatedKg / material.availableKg) * 100;

        if (utilizationPercent > 85) {
          status.critical.push(facility.facilityId);
        } else if (utilizationPercent > 50) {
          status.adequate.push(facility.facilityId);
        } else {
          status.excess.push(facility.facilityId);
        }
      });
    });

    // Generate insights for imbalances
    substrateStatus.forEach((status, material) => {
      if (status.critical.length > 0 && status.excess.length > 0) {
        insights.push({
          insightId: `insight-${Date.now()}-${Math.random()}`,
          createdAt: new Date().toISOString(),
          type: 'imbalance',
          affectedFacilities: [...status.critical, ...status.excess],
          description: `${material} imbalance: ${status.critical.length} facility(ies) critical, ${status.excess.length} have excess`,
          rationale: `Redistributing ${material} from excess to critical facilities could prevent production delays`,
          severity: 'warning',
          confidence: 80,
          recommendedAction: `Propose substrate transfer from excess to critical facilities`,
        });
      }
    });

    return insights;
  }

  /**
   * Detect equipment bottlenecks
   * When critical equipment unavailable across multiple facilities
   */
  private detectEquipmentBottlenecks(state: MultiFacilityState): MultiFacilityInsight[] {
    const insights: MultiFacilityInsight[] = [];

    // Count unavailable equipment by type across facilities
    const equipmentStatus = new Map<string, { unavailable: number; total: number }>();

    state.facilities.forEach((facility) => {
      const resources = facilityAggregator.getLatestResources(state, facility.facilityId);
      if (!resources) return;

      resources.equipmentAvailability.forEach((eq) => {
        if (!equipmentStatus.has(eq.equipmentId)) {
          equipmentStatus.set(eq.equipmentId, { unavailable: 0, total: 0 });
        }
        const status = equipmentStatus.get(eq.equipmentId)!;
        status.total++;
        if (!eq.isAvailable) status.unavailable++;
      });
    });

    // Generate insights for bottlenecks
    equipmentStatus.forEach((status, equipmentId) => {
      const unavailablePercent = (status.unavailable / status.total) * 100;
      if (unavailablePercent > 50) {
        insights.push({
          insightId: `insight-${Date.now()}-${Math.random()}`,
          createdAt: new Date().toISOString(),
          type: 'bottleneck',
          affectedFacilities: [],
          description: `Equipment "${equipmentId}" is unavailable across ${status.unavailable}/${status.total} facilities`,
          rationale: `Widespread equipment unavailability could delay production cycles`,
          severity: 'warning',
          confidence: 75,
          recommendedAction: `Prioritize repairs or acquisition of backup ${equipmentId}`,
        });
      }
    });

    return insights;
  }

  /**
   * Detect opportunities for optimization
   * E.g., species shifting, specialization, energy consolidation
   */
  private detectOpportunities(state: MultiFacilityState): MultiFacilityInsight[] {
    const insights: MultiFacilityInsight[] = [];

    // Species opportunity: consolidate same species to reduce setup overhead
    const speciesByFacility = new Map<string, Set<string>>();
    state.loadSnapshots.forEach((snap) => {
      if (!speciesByFacility.has(snap.facilityId)) {
        speciesByFacility.set(snap.facilityId, new Set());
      }
      snap.activeSpecies.forEach((sp) => {
        speciesByFacility.get(snap.facilityId)!.add(sp);
      });
    });

    // If same species scattered across facilities, suggest consolidation
    const speciesByCount = new Map<string, string[]>();
    speciesByFacility.forEach((species, facilityId) => {
      species.forEach((sp) => {
        if (!speciesByCount.has(sp)) {
          speciesByCount.set(sp, []);
        }
        speciesByCount.get(sp)!.push(facilityId);
      });
    });

    speciesByCount.forEach((facilities, species) => {
      if (facilities.length > 2) {
        insights.push({
          insightId: `insight-${Date.now()}-${Math.random()}`,
          createdAt: new Date().toISOString(),
          type: 'opportunity',
          affectedFacilities: facilities,
          description: `Species "${species}" is grown in ${facilities.length} facilities (opportunity for consolidation)`,
          rationale: `Consolidating species reduces setup overhead and improves resource specialization`,
          severity: 'info',
          confidence: 65,
          recommendedAction: `Consider specializing facilities by species to reduce changeover time`,
        });
      }
    });

    return insights;
  }

  /**
   * Get global load summary
   */
  getGlobalLoadSummary(state: MultiFacilityState): {
    avgLoad: number;
    minLoad: number;
    maxLoad: number;
    facilities: { facilityId: string; load: number }[];
  } {
    const facilities = state.loadSnapshots.map((snap) => ({
      facilityId: snap.facilityId,
      load: snap.currentLoadPercent,
    }));

    const loads = facilities.map((f) => f.load);
    const avgLoad = loads.length > 0 ? Math.round(loads.reduce((a, b) => a + b) / loads.length) : 0;
    const minLoad = loads.length > 0 ? Math.min(...loads) : 0;
    const maxLoad = loads.length > 0 ? Math.max(...loads) : 0;

    return { avgLoad, minLoad, maxLoad, facilities };
  }

  /**
   * Get global risk summary
   */
  getGlobalRiskSummary(state: MultiFacilityState): {
    avgContaminationRisk: number;
    avgEquipmentRisk: number;
    avgLaborRisk: number;
    avgEnergyRisk: number;
  } {
    const risks = state.riskSnapshots;
    if (risks.length === 0) {
      return {
        avgContaminationRisk: 0,
        avgEquipmentRisk: 0,
        avgLaborRisk: 0,
        avgEnergyRisk: 0,
      };
    }

    const avgContaminationRisk = Math.round(
      risks.reduce((sum, r) => sum + r.contaminationRiskScore, 0) / risks.length
    );
    const avgEquipmentRisk = Math.round(
      risks.reduce((sum, r) => sum + r.equipmentFailureRisk, 0) / risks.length
    );
    const avgLaborRisk = Math.round(
      risks.reduce((sum, r) => sum + r.laborShortageRisk, 0) / risks.length
    );
    const avgEnergyRisk = Math.round(
      risks.reduce((sum, r) => sum + r.energyBudgetRisk, 0) / risks.length
    );

    return { avgContaminationRisk, avgEquipmentRisk, avgLaborRisk, avgEnergyRisk };
  }
}

export const multiFacilityEngine = new MultiFacilityEngine();
