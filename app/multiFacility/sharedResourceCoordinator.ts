import {
  MultiFacilityState,
  SharedResourcePlan,
  FacilityResourceSnapshot,
} from './multiFacilityTypes';
import { multiFacilityLog } from './multiFacilityLog';
import { facilityAggregator } from './facilityAggregator';

class SharedResourceCoordinator {
  /**
   * Detect resource contention across facilities
   * Deterministic: identify which resources are constrained and where
   */
  detectContention(state: MultiFacilityState): SharedResourcePlan[] {
    const plans: SharedResourcePlan[] = [];

    // Substrate contention detection
    const substratePlans = this.detectSubstrateContention(state);
    plans.push(...substratePlans);

    // Equipment contention detection
    const equipmentPlans = this.detectEquipmentContention(state);
    plans.push(...equipmentPlans);

    // Energy contention detection
    const energyPlans = this.detectEnergyContention(state);
    plans.push(...energyPlans);

    return plans;
  }

  /**
   * Detect substrate shortage and availability imbalance
   * Threshold: facility using >80% of available = constrained
   */
  private detectSubstrateContention(state: MultiFacilityState): SharedResourcePlan[] {
    const plans: SharedResourcePlan[] = [];

    // Aggregate substrate availability by material
    const substrateSummary = new Map<
      string,
      {
        total: number;
        allocated: number;
        critical: string[];
        excess: string[];
      }
    >();

    state.facilities.forEach((facility) => {
      const resources = facilityAggregator.getLatestResources(state, facility.facilityId);
      if (!resources) return;

      resources.substrateMaterials.forEach((material) => {
        if (!substrateSummary.has(material.material)) {
          substrateSummary.set(material.material, {
            total: 0,
            allocated: 0,
            critical: [],
            excess: [],
          });
        }

        const summary = substrateSummary.get(material.material)!;
        summary.total += material.availableKg;
        summary.allocated += material.allocatedKg;

        const utilizationPercent = (material.allocatedKg / material.availableKg) * 100;
        if (utilizationPercent > 80) {
          summary.critical.push(facility.facilityId);
        } else if (utilizationPercent < 30) {
          summary.excess.push(facility.facilityId);
        }
      });
    });

    // Generate plans for materials with contention
    substrateSummary.forEach((summary, material) => {
      if (summary.critical.length > 0 && summary.excess.length > 0) {
        const plan: SharedResourcePlan = {
          planId: `rsp-${Date.now()}-${Math.random()}`,
          createdAt: new Date().toISOString(),
          resourceType: 'substrate',
          currentStatus: 'constrained',
          facilities: state.facilities.map((f) => ({
            facilityId: f.facilityId,
            currentAllocation: 0, // Will be populated from snapshots
            requestedAllocation: 0,
            priority: summary.critical.includes(f.facilityId) ? 'critical' : 'normal',
          })),
          proposedRebalancing: [],
          estimatedImpact: [],
          status: 'draft',
          version: 1,
        };

        // Populate allocations from snapshots
        state.facilities.forEach((facility) => {
          const resources = facilityAggregator.getLatestResources(state, facility.facilityId);
          if (!resources) return;

          const mat = resources.substrateMaterials.find((m) => m.material === material);
          if (mat) {
            const facilityEntry = plan.facilities.find((f) => f.facilityId === facility.facilityId);
            if (facilityEntry) {
              facilityEntry.currentAllocation = mat.allocatedKg;
            }
          }
        });

        // Generate rebalancing proposals: move excess to critical
        const excessAmount = (summary.total - summary.allocated) * 0.2; // Transfer 20% of excess
        summary.critical.forEach((criticalFacilityId) => {
          summary.excess.forEach((excessFacilityId) => {
            plan.proposedRebalancing.push({
              fromFacilityId: excessFacilityId,
              toFacilityId: criticalFacilityId,
              quantity: Math.round(excessAmount),
              unit: 'kg',
              rationale: `Transfer ${material} from excess to critical facility to prevent shortage`,
              implementationHours: 2,
            });
          });
        });

        // Log plan
        multiFacilityLog.add({
          entryId: `mf-log-${Date.now()}-${Math.random()}`,
          timestamp: new Date().toISOString(),
          category: 'shared-resource-plan',
          message: `Substrate contention detected for "${material}": ${summary.critical.length} critical, ${summary.excess.length} excess`,
          context: {
            planId: plan.planId,
            affectedFacilities: [...summary.critical, ...summary.excess],
          },
          details: {
            totalAvailable: summary.total,
            totalAllocated: summary.allocated,
            criticalFacilities: summary.critical,
            excessFacilities: summary.excess,
          },
        });

        plans.push(plan);
      }
    });

    return plans;
  }

  /**
   * Detect equipment unavailability across facilities
   * Threshold: equipment unavailable in critical facilities suggests need for sharing
   */
  private detectEquipmentContention(state: MultiFacilityState): SharedResourcePlan[] {
    const plans: SharedResourcePlan[] = [];

    // Aggregate equipment availability
    const equipmentSummary = new Map<
      string,
      {
        unavailableFacilities: string[];
        availableFacilities: string[];
      }
    >();

    state.facilities.forEach((facility) => {
      const resources = facilityAggregator.getLatestResources(state, facility.facilityId);
      if (!resources) return;

      resources.equipmentAvailability.forEach((eq) => {
        if (!equipmentSummary.has(eq.equipmentId)) {
          equipmentSummary.set(eq.equipmentId, {
            unavailableFacilities: [],
            availableFacilities: [],
          });
        }

        const summary = equipmentSummary.get(eq.equipmentId)!;
        if (eq.isAvailable) {
          summary.availableFacilities.push(facility.facilityId);
        } else {
          summary.unavailableFacilities.push(facility.facilityId);
        }
      });
    });

    // Generate plans for equipment with unavailability
    equipmentSummary.forEach((summary, equipmentId) => {
      if (summary.unavailableFacilities.length > 0 && summary.availableFacilities.length > 0) {
        const plan: SharedResourcePlan = {
          planId: `rsp-${Date.now()}-${Math.random()}`,
          createdAt: new Date().toISOString(),
          resourceType: 'equipment',
          currentStatus: 'constrained',
          facilities: state.facilities.map((f) => ({
            facilityId: f.facilityId,
            currentAllocation: summary.availableFacilities.includes(f.facilityId) ? 1 : 0,
            requestedAllocation: summary.unavailableFacilities.includes(f.facilityId) ? 1 : 0,
            priority: summary.unavailableFacilities.includes(f.facilityId) ? 'high' : 'normal',
          })),
          proposedRebalancing: [],
          estimatedImpact: [],
          status: 'draft',
          version: 1,
        };

        // Propose shared access schedule
        summary.unavailableFacilities.forEach((needyFacility) => {
          summary.availableFacilities.forEach((availableFacility) => {
            plan.proposedRebalancing.push({
              fromFacilityId: availableFacility,
              toFacilityId: needyFacility,
              quantity: 1,
              unit: 'unit',
              rationale: `Share ${equipmentId} from available to needy facility via scheduled access`,
              implementationHours: 4, // Coordination overhead
            });
          });
        });

        // Log plan
        multiFacilityLog.add({
          entryId: `mf-log-${Date.now()}-${Math.random()}`,
          timestamp: new Date().toISOString(),
          category: 'shared-resource-plan',
          message: `Equipment contention detected for "${equipmentId}": ${summary.unavailableFacilities.length} facilities need, ${summary.availableFacilities.length} available`,
          context: {
            planId: plan.planId,
            affectedFacilities: [...summary.unavailableFacilities, ...summary.availableFacilities],
          },
        });

        plans.push(plan);
      }
    });

    return plans;
  }

  /**
   * Detect energy budget contention
   * Threshold: facility using >80% of energy budget
   */
  private detectEnergyContention(state: MultiFacilityState): SharedResourcePlan[] {
    const plans: SharedResourcePlan[] = [];

    // Aggregate energy usage
    let totalEnergyBudget = 0;
    let totalEnergyAllocated = 0;
    const facilityEnergyStatus: {
      facilityId: string;
      budget: number;
      used: number;
      utilizationPercent: number;
    }[] = [];

    state.facilities.forEach((facility) => {
      const teleSum = state.loadSnapshots.find((s) => s.facilityId === facility.facilityId);
      const estimatedUsage = teleSum ? (facility.energyBudgetKwh * teleSum.currentLoadPercent) / 100 : 0;

      facilityEnergyStatus.push({
        facilityId: facility.facilityId,
        budget: facility.energyBudgetKwh,
        used: Math.round(estimatedUsage),
        utilizationPercent: Math.round((estimatedUsage / facility.energyBudgetKwh) * 100),
      });

      totalEnergyBudget += facility.energyBudgetKwh;
      totalEnergyAllocated += estimatedUsage;
    });

    // Find constrained and unconstrained facilities
    const critical = facilityEnergyStatus.filter((f) => f.utilizationPercent > 80);
    const excess = facilityEnergyStatus.filter((f) => f.utilizationPercent < 50);

    if (critical.length > 0 && excess.length > 0) {
      const plan: SharedResourcePlan = {
        planId: `rsp-${Date.now()}-${Math.random()}`,
        createdAt: new Date().toISOString(),
        resourceType: 'energy',
        currentStatus: 'constrained',
        facilities: facilityEnergyStatus.map((f) => ({
          facilityId: f.facilityId,
          currentAllocation: f.used,
          requestedAllocation: f.budget,
          priority: f.utilizationPercent > 80 ? 'critical' : 'normal',
        })),
        proposedRebalancing: [],
        estimatedImpact: [],
        status: 'draft',
        version: 1,
      };

      // Propose load shifting to underutilized facilities
      const totalExcessAvailable = excess.reduce((sum, f) => sum + (f.budget - f.used), 0);
      const totalNeeded = critical.reduce((sum, f) => sum + (f.used - (f.budget * 0.8)), 0);

      if (totalExcessAvailable > totalNeeded * 0.5) {
        critical.forEach((critFacility) => {
          const shiftAmount = Math.round((critFacility.used - (critFacility.budget * 0.8)) * 0.5);
          excess.forEach((excessFacility) => {
            plan.proposedRebalancing.push({
              fromFacilityId: excessFacility.facilityId,
              toFacilityId: critFacility.facilityId,
              quantity: shiftAmount,
              unit: 'kWh',
              rationale: `Shift energy-consuming tasks to underutilized facility to balance load`,
              implementationHours: 8,
            });
          });
        });
      }

      // Log plan
      multiFacilityLog.add({
        entryId: `mf-log-${Date.now()}-${Math.random()}`,
        timestamp: new Date().toISOString(),
        category: 'shared-resource-plan',
        message: `Energy contention detected: ${critical.length} critical (>80%), ${excess.length} excess (<50%)`,
        context: {
          planId: plan.planId,
          affectedFacilities: [
            ...critical.map((f) => f.facilityId),
            ...excess.map((f) => f.facilityId),
          ],
        },
        details: {
          totalBudget: totalEnergyBudget,
          totalAllocated: Math.round(totalEnergyAllocated),
        },
      });

      plans.push(plan);
    }

    return plans;
  }

  /**
   * Approve a shared resource plan
   */
  approvePlan(plan: SharedResourcePlan, approver: string): SharedResourcePlan {
    const approved = { ...plan };
    approved.status = 'approved';
    approved.approvedBy = approver;
    approved.approvedAt = new Date().toISOString();

    multiFacilityLog.add({
      entryId: `mf-log-${Date.now()}-${Math.random()}`,
      timestamp: new Date().toISOString(),
      category: 'approval',
      message: `Shared resource plan approved: ${plan.resourceType}`,
      context: {
        planId: plan.planId,
        userId: approver,
      },
    });

    return approved;
  }

  /**
   * Reject a shared resource plan
   */
  rejectPlan(plan: SharedResourcePlan, approver: string, reason: string): SharedResourcePlan {
    const rejected = { ...plan };
    rejected.status = 'rejected';

    multiFacilityLog.add({
      entryId: `mf-log-${Date.now()}-${Math.random()}`,
      timestamp: new Date().toISOString(),
      category: 'rejection',
      message: `Shared resource plan rejected: ${reason}`,
      context: {
        planId: plan.planId,
        userId: approver,
      },
    });

    return rejected;
  }
}

export const sharedResourceCoordinator = new SharedResourceCoordinator();
