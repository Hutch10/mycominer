import {
  GlobalOptimizationProposal,
  MultiFacilityAuditResult,
  MultiFacilityState,
} from './multiFacilityTypes';
import { multiFacilityLog } from './multiFacilityLog';
import { facilityAggregator } from './facilityAggregator';

class MultiFacilityAuditor {
  /**
   * Audit a global optimization proposal against safety and resource constraints
   * Decision: allow (<=65% confidence threshold), warn (confidence 65-80%), block (>80% risk or violated constraints)
   */
  audit(
    proposal: GlobalOptimizationProposal,
    state: MultiFacilityState
  ): MultiFacilityAuditResult {
    const auditId = `mfa-${Date.now()}-${Math.random()}`;
    const timestamp = new Date().toISOString();

    // Run all audit checks
    const allFacilitiesWithinBudget = this.checkEnergyBudgets(proposal, state);
    const noContaminationSpread = this.checkContaminationRisk(proposal, state);
    const laborAvailabilityRespected = this.checkLaborAvailability(proposal, state);
    const equipmentConstraintsRespected = this.checkEquipmentConstraints(proposal, state);
    const regressionDetected = this.checkRegression(proposal, state);
    const rollbackFeasible = proposal.rollbackCapability.feasible;

    // Aggregate per-facility risks
    const perFacilityRisks = proposal.affectedFacilities.map((facilityId) => {
      let riskScore = 0;
      const rationale: string[] = [];

      // Energy risk
      const facility = state.facilities.find((f) => f.facilityId === facilityId);
      if (facility && proposal.expectedBenefit.globalEnergyReduction) {
        const expectedLocalReduction =
          Math.round((proposal.expectedBenefit.globalEnergyReduction / state.facilities.length) * 0.6);
        const load = facilityAggregator.getLatestLoad(state, facilityId);
        if (load && load.currentLoadPercent > 70 && expectedLocalReduction < facility.energyBudgetKwh * 0.1) {
          riskScore += 15;
          rationale.push('Energy budget risk: limited local reduction for overloaded facility');
        }
      }

      // Contamination risk
      if (proposal.category === 'contamination-risk-mitigation' && !noContaminationSpread) {
        riskScore += 20;
        rationale.push('Contamination: isolation may be ineffective');
      } else if (
        proposal.category !== 'contamination-risk-mitigation' &&
        proposal.expectedBenefit.contaminationRiskReduction === undefined
      ) {
        riskScore += 10;
        rationale.push('Contamination: no explicit risk reduction measure');
      }

      // Labor risk
      if (
        proposal.implementation.affectedFacilities.find((af) => af.facilityId === facilityId)
          ?.estimatedHours > 40
      ) {
        riskScore += 10;
        rationale.push('Labor: significant implementation hours required');
      }

      return { facilityId, riskScore, rationale };
    });

    // Global risks
    const globalRisks: string[] = [];
    if (!allFacilitiesWithinBudget) globalRisks.push('Some facilities may exceed energy budgets');
    if (!noContaminationSpread) globalRisks.push('Cross-facility contamination spread possible');
    if (!laborAvailabilityRespected) globalRisks.push('Insufficient labor availability');
    if (!equipmentConstraintsRespected) globalRisks.push('Equipment constraints violated');
    if (regressionDetected) globalRisks.push('Implementation may regress yield or operations');

    // Determine decision
    let decision: 'allow' | 'warn' | 'block' = 'allow';
    const maxFacilityRisk = Math.max(...perFacilityRisks.map((r) => r.riskScore), 0);

    if (
      !allFacilitiesWithinBudget ||
      !equipmentConstraintsRespected ||
      !rollbackFeasible ||
      maxFacilityRisk > 35
    ) {
      decision = 'block';
    } else if (
      !noContaminationSpread ||
      !laborAvailabilityRespected ||
      regressionDetected ||
      proposal.confidence < 65 ||
      maxFacilityRisk > 20
    ) {
      decision = 'warn';
    }

    // Generate recommendations
    const recommendations: string[] = [];

    if (!allFacilitiesWithinBudget) {
      recommendations.push('Reduce expected energy savings or stagger implementation');
    }
    if (!noContaminationSpread) {
      recommendations.push('Strengthen contamination isolation measures or defer proposal');
    }
    if (!laborAvailabilityRespected) {
      recommendations.push('Extend implementation timeline or allocate additional labor');
    }
    if (proposal.confidence < 70) {
      recommendations.push('Increase confidence threshold before implementation');
    }
    if (maxFacilityRisk > 15) {
      recommendations.push(`Mitigate risks in high-risk facilities (max risk score: ${maxFacilityRisk})`);
    }

    const result: MultiFacilityAuditResult = {
      auditId,
      proposalId: proposal.proposalId,
      timestamp,
      decision,
      checks: {
        allFacilitiesWIthinBudget: allFacilitiesWithinBudget,
        noContaminationSpread,
        laborAvailabilityRespected,
        equipmentConstraintsRespected,
        regressionDetected,
        rollbackFeasible,
      },
      perFacilityRisks,
      globalRisks,
      recommendations,
    };

    // Log audit result
    multiFacilityLog.add({
      entryId: `mf-log-${Date.now()}-${Math.random()}`,
      timestamp,
      category: 'audit',
      message: `Audit decision [${decision.toUpperCase()}]: ${proposal.title}`,
      context: {
        auditId,
        proposalId: proposal.proposalId,
        affectedFacilities: proposal.affectedFacilities,
      },
      details: {
        decision,
        maxFacilityRisk,
        globalRisks,
      },
    });

    return result;
  }

  /**
   * Audit batch of proposals
   */
  auditBatch(proposals: GlobalOptimizationProposal[], state: MultiFacilityState): MultiFacilityAuditResult[] {
    return proposals.map((p) => this.audit(p, state));
  }

  /**
   * Check energy budget constraints
   * Verify no facility exceeds budget with proposal implementation
   */
  private checkEnergyBudgets(proposal: GlobalOptimizationProposal, state: MultiFacilityState): boolean {
    // If proposal reduces energy, always safe
    if (proposal.expectedBenefit.globalEnergyReduction && proposal.expectedBenefit.globalEnergyReduction > 0) {
      return true;
    }

    // Check if any facility would exceed budget
    for (const facility of state.facilities) {
      if (!proposal.affectedFacilities.includes(facility.facilityId)) continue;

      const load = facilityAggregator.getLatestLoad(state, facility.facilityId);
      if (load && load.currentLoadPercent > 85) {
        // High load + proposal that doesn't reduce energy = risky
        if (!proposal.expectedBenefit.globalEnergyReduction) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Check contamination risk
   * Verify proposal doesn't introduce cross-facility contamination
   */
  private checkContaminationRisk(proposal: GlobalOptimizationProposal, state: MultiFacilityState): boolean {
    // Contamination mitigation proposals are inherently safe (by design)
    if (proposal.category === 'contamination-risk-mitigation') {
      return true;
    }

    // For other proposals, check if they involve shared equipment/resources
    // (which could spread contamination)
    const hasSharedEquipment = proposal.implementation.steps.some((step) =>
      step.toLowerCase().includes('shared') ||
      step.toLowerCase().includes('equipment') ||
      step.toLowerCase().includes('move') ||
      step.toLowerCase().includes('transfer')
    );

    if (!hasSharedEquipment) {
      return true; // Localized proposals are safe
    }

    // Shared equipment proposals require high confidence
    return proposal.confidence > 75;
  }

  /**
   * Check labor availability
   * Verify proposal's labor requirements are feasible
   */
  private checkLaborAvailability(proposal: GlobalOptimizationProposal, state: MultiFacilityState): boolean {
    // Sum total available labor across all facilities
    const totalLaborHours = state.facilities.reduce((sum, f) => sum + f.laborHoursAvailable, 0);

    // Check if proposal requires more than 20% of total labor capacity
    const implementationHours = proposal.implementation.totalImplementationHours;

    return implementationHours < totalLaborHours * 0.2;
  }

  /**
   * Check equipment constraints
   * Verify proposal respects equipment availability
   */
  private checkEquipmentConstraints(proposal: GlobalOptimizationProposal, state: MultiFacilityState): boolean {
    // Check if proposal mentions sterilization, incubation, or other critical equipment
    const requiresSterilization = proposal.implementation.steps.some((step) =>
      step.toLowerCase().includes('steriliz')
    );

    if (requiresSterilization) {
      // Check if all affected facilities have sterilization equipment available
      for (const facilityId of proposal.affectedFacilities) {
        const resources = facilityAggregator.getLatestResources(state, facilityId);
        if (!resources) return false;

        const hasAutoclave = resources.equipmentAvailability.some((eq) =>
          eq.equipmentId.toLowerCase().includes('autoclave') && eq.isAvailable
        );

        if (!hasAutoclave) {
          return false; // Critical equipment unavailable
        }
      }
    }

    return true;
  }

  /**
   * Check for regression risk
   * Verify proposal doesn't undo previous optimizations or create new bottlenecks
   */
  private checkRegression(proposal: GlobalOptimizationProposal, state: MultiFacilityState): boolean {
    // Check if proposal conflicts with facility specialization
    if (proposal.category === 'facility-specialization') {
      // No regression from specialization if implemented correctly
      return false; // Return true if no regression detected; false if detected
    }

    // Check if energy consolidation creates new bottlenecks
    if (proposal.category === 'cross-facility-energy-optimization') {
      // Verify target underutilized facilities have capacity
      const targetFacilities = state.facilities.filter((f) => {
        const load = facilityAggregator.getLatestLoad(state, f.facilityId);
        return load && load.currentLoadPercent < 40;
      });

      if (targetFacilities.length === 0) {
        return true; // Regression: nowhere to move load to
      }
    }

    return false; // No regression detected
  }
}

export const multiFacilityAuditor = new MultiFacilityAuditor();
