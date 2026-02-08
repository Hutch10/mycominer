import {
  FacilityProfile,
  FacilityLoadSnapshot,
  FacilityRiskSnapshot,
  FacilityResourceSnapshot,
  MultiFacilityIngestInput,
  MultiFacilityState,
} from './multiFacilityTypes';
import { multiFacilityLog } from './multiFacilityLog';

class FacilityAggregator {
  /**
   * Normalize multi-facility data into standardized snapshots
   * Deterministic aggregation from diverse Phase 13/19/20/21/22 sources
   */
  aggregate(input: MultiFacilityIngestInput): MultiFacilityState {
    const stateId = `mf-state-${Date.now()}`;
    const createdAt = new Date().toISOString();

    // Log ingest event
    multiFacilityLog.add({
      entryId: `mf-log-${Date.now()}`,
      timestamp: createdAt,
      category: 'aggregation',
      message: `Aggregating data from ${input.facilities.length} facilities`,
      context: {
        affectedFacilities: input.facilities.map((f) => f.facilityId),
      },
      details: {
        facilitiesCount: input.facilities.length,
        loadSnapshotsCount: input.facilityLoadSnapshots.length,
        riskSnapshotsCount: input.facilityRiskSnapshots.length,
        resourceSnapshotsCount: input.facilityResourceSnapshots.length,
      },
    });

    // Validate snapshot alignment
    this.validateSnapshots(input);

    // Compute global aggregates
    const globalLoad = this.computeGlobalLoad(input.facilityLoadSnapshots);
    const globalRisk = this.computeGlobalRisk(input.facilityRiskSnapshots);
    const overallConfidence = this.computeOverallConfidence(
      input.executionHistories,
      input.optimizationOutputs
    );

    return {
      stateId,
      createdAt,
      facilities: input.facilities,
      loadSnapshots: input.facilityLoadSnapshots,
      riskSnapshots: input.facilityRiskSnapshots,
      resourceSnapshots: input.facilityResourceSnapshots,
      globalInsights: [],
      sharedResourcePlans: [],
      globalOptimizationProposals: [],
      auditResults: [],
      globalLoad,
      globalRisk,
      overallConfidence,
    };
  }

  private validateSnapshots(input: MultiFacilityIngestInput): void {
    const facilityIds = new Set(input.facilities.map((f) => f.facilityId));

    // Check that all snapshots reference existing facilities
    input.facilityLoadSnapshots.forEach((snap) => {
      if (!facilityIds.has(snap.facilityId)) {
        throw new Error(`Load snapshot references unknown facility: ${snap.facilityId}`);
      }
    });

    input.facilityRiskSnapshots.forEach((snap) => {
      if (!facilityIds.has(snap.facilityId)) {
        throw new Error(`Risk snapshot references unknown facility: ${snap.facilityId}`);
      }
    });

    input.facilityResourceSnapshots.forEach((snap) => {
      if (!facilityIds.has(snap.facilityId)) {
        throw new Error(`Resource snapshot references unknown facility: ${snap.facilityId}`);
      }
    });
  }

  /**
   * Global load: weighted average of facility loads
   * Deterministic: sum of utilization percents / facility count
   */
  private computeGlobalLoad(loadSnapshots: FacilityLoadSnapshot[]): number {
    if (loadSnapshots.length === 0) return 0;

    const totalLoad = loadSnapshots.reduce((sum, snap) => sum + snap.currentLoadPercent, 0);
    return Math.round(totalLoad / loadSnapshots.length);
  }

  /**
   * Global risk: aggregate from facility risk scores
   * Low if all <30, Medium if any 30-70, High if any >70
   */
  private computeGlobalRisk(riskSnapshots: FacilityRiskSnapshot[]): 'low' | 'medium' | 'high' {
    if (riskSnapshots.length === 0) return 'low';

    const avgRisk = riskSnapshots.reduce((sum, snap) => sum + snap.overallRisk === 'high' ? 75 : snap.overallRisk === 'medium' ? 50 : 25, 0) / riskSnapshots.length;

    if (avgRisk > 70) return 'high';
    if (avgRisk > 30) return 'medium';
    return 'low';
  }

  /**
   * Overall confidence: based on execution history success rate and optimization output quality
   * Range: 0-100
   */
  private computeOverallConfidence(
    executionHistories?: { facilityId: string; completedTasksCount: number }[],
    optimizationOutputs?: { facilityId: string; averageConfidence: number }[]
  ): number {
    const scores: number[] = [];

    if (executionHistories && executionHistories.length > 0) {
      // Higher completed task count = higher confidence (capped at 100)
      executionHistories.forEach((hist) => {
        scores.push(Math.min(100, hist.completedTasksCount * 10));
      });
    }

    if (optimizationOutputs && optimizationOutputs.length > 0) {
      // Use optimization confidence directly
      optimizationOutputs.forEach((opt) => {
        scores.push(opt.averageConfidence);
      });
    }

    if (scores.length === 0) return 50; // Neutral default
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }

  /**
   * Get facility by ID from state
   */
  getFacility(state: MultiFacilityState, facilityId: string): FacilityProfile | undefined {
    return state.facilities.find((f) => f.facilityId === facilityId);
  }

  /**
   * Get latest load snapshot for facility
   */
  getLatestLoad(state: MultiFacilityState, facilityId: string): FacilityLoadSnapshot | undefined {
    const snaps = state.loadSnapshots.filter((s) => s.facilityId === facilityId);
    if (snaps.length === 0) return undefined;
    return snaps.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
  }

  /**
   * Get latest risk snapshot for facility
   */
  getLatestRisk(state: MultiFacilityState, facilityId: string): FacilityRiskSnapshot | undefined {
    const snaps = state.riskSnapshots.filter((s) => s.facilityId === facilityId);
    if (snaps.length === 0) return undefined;
    return snaps.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
  }

  /**
   * Get latest resource snapshot for facility
   */
  getLatestResources(state: MultiFacilityState, facilityId: string): FacilityResourceSnapshot | undefined {
    const snaps = state.resourceSnapshots.filter((s) => s.facilityId === facilityId);
    if (snaps.length === 0) return undefined;
    return snaps.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
  }
}

export const facilityAggregator = new FacilityAggregator();
