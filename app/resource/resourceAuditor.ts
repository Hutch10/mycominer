// Phase 20: Resource Auditor
// Validates allocation plans before approval (6 validation gates)

'use client';

import {
  ResourceAuditResult,
  AllocationPlan,
  ForecastReport,
  InventoryItem,
  EquipmentStatus,
} from '@/app/resource/resourceTypes';
import { WorkflowPlan } from '@/app/workflow/workflowTypes';

// ============================================================================
// RESOURCE AUDITOR
// ============================================================================

class ResourceAuditor {
  private auditCounter = 0;

  /**
   * Full audit of allocation plan (6 validation gates)
   */
  auditAllocationPlan(
    allocationPlan: AllocationPlan,
    inventory: InventoryItem[],
    equipment: EquipmentStatus[],
    energyBudgetKwh: number,
    workflowPlan?: WorkflowPlan
  ): ResourceAuditResult {
    const warnings: string[] = [];
    const errors: string[] = [];
    const rollbackSteps: string[] = [];

    // Gate 1: Inventory Sufficiency
    const inventoryCheck = this.validateInventorySufficiency(allocationPlan, inventory);
    warnings.push(...inventoryCheck.warnings);
    errors.push(...inventoryCheck.errors);

    // Gate 2: Equipment Availability
    const equipmentCheck = this.validateEquipmentAvailability(allocationPlan, equipment);
    warnings.push(...equipmentCheck.warnings);
    errors.push(...equipmentCheck.errors);

    // Gate 3: Energy Budget
    const energyCheck = this.validateEnergyBudget(allocationPlan, energyBudgetKwh);
    warnings.push(...energyCheck.warnings);
    errors.push(...energyCheck.errors);

    // Gate 4: Contamination Risk
    const contaminationCheck = this.validateContaminationRisk(allocationPlan);
    warnings.push(...contaminationCheck.warnings);

    // Gate 5: Scheduling Alignment
    let scheduleCheck = { warnings: [] as string[], errors: [] as string[] };
    if (workflowPlan) {
      scheduleCheck = this.validateSchedulingAlignment(allocationPlan, workflowPlan);
      warnings.push(...scheduleCheck.warnings);
      errors.push(...scheduleCheck.errors);
    }

    // Gate 6: Regression Detection
    const regressionCheck = this.validateNoRegression(allocationPlan);
    warnings.push(...regressionCheck.warnings);

    // Generate rollback steps if errors found
    if (errors.length > 0) {
      rollbackSteps.push(
        'Cancel resource allocation',
        'Release reserved inventory',
        'Reset equipment assignments',
        'Revert to previous allocation plan',
        'Notify workflow planner of resource shortage',
        'Generate alternative allocation proposals'
      );
    }

    // Determine decision
    let decision: 'allow' | 'warn' | 'block';
    if (errors.length > 0) {
      decision = 'block';
    } else if (warnings.length > 3) {
      decision = 'warn';
    } else {
      decision = 'allow';
    }

    return {
      auditId: `resource-audit-${++this.auditCounter}`,
      createdAt: new Date().toISOString(),
      allocationPlanId: allocationPlan.planId,
      decision,
      warnings,
      errors,
      rollbackSteps,
      validationGates: {
        inventorySufficiency: inventoryCheck.errors.length === 0,
        equipmentAvailability: equipmentCheck.errors.length === 0,
        energyBudget: energyCheck.errors.length === 0,
        contaminationRisk: contaminationCheck.warnings.length < 2,
        schedulingAlignment: workflowPlan
          ? scheduleCheck.errors.length === 0
          : true,
        regressionDetection: regressionCheck.warnings.length === 0,
      },
    };
  }

  /**
   * Gate 1: Validate inventory sufficiency
   */
  private validateInventorySufficiency(
    plan: AllocationPlan,
    inventory: InventoryItem[]
  ): { warnings: string[]; errors: string[] } {
    const warnings: string[] = [];
    const errors: string[] = [];

    const inventoryMap = new Map(inventory.map(item => [item.name, item]));

    for (const alloc of plan.allocations) {
      const item = inventoryMap.get(alloc.resourceName);
      if (!item) {
        errors.push(`Resource not in inventory: ${alloc.resourceName}`);
        continue;
      }

      if (alloc.quantityAllocated > item.quantityAvailable) {
        errors.push(
          `Insufficient ${alloc.resourceName}: need ${alloc.quantityAllocated}${item.unit}, have ${item.quantityAvailable}${item.unit}`
        );
      }

      // Check if allocation brings inventory below threshold
      const remaining = item.quantityAvailable - alloc.quantityAllocated;
      if (remaining < item.lowStockThreshold) {
        warnings.push(
          `${alloc.resourceName} will drop below threshold: ${remaining}${item.unit} remaining`
        );
      }
    }

    return { warnings, errors };
  }

  /**
   * Gate 2: Validate equipment availability
   */
  private validateEquipmentAvailability(
    plan: AllocationPlan,
    equipment: EquipmentStatus[]
  ): { warnings: string[]; errors: string[] } {
    const warnings: string[] = [];
    const errors: string[] = [];

    const equipmentAllocs = plan.allocations.filter(a => a.category === 'equipment');
    const equipmentMap = new Map(equipment.map(eq => [eq.name, eq]));

    for (const alloc of equipmentAllocs) {
      const eq = equipmentMap.get(alloc.resourceName);
      if (!eq) {
        errors.push(`Equipment not found: ${alloc.resourceName}`);
        continue;
      }

      if (eq.capacityUsed > 90) {
        warnings.push(
          `${eq.name} at ${eq.capacityUsed}% capacity - potential bottleneck`
        );
      }

      if (eq.hoursUntilMaintenance < 48) {
        warnings.push(
          `${eq.name} requires maintenance in ${eq.hoursUntilMaintenance}h`
        );
      }
    }

    return { warnings, errors };
  }

  /**
   * Gate 3: Validate energy budget
   */
  private validateEnergyBudget(
    plan: AllocationPlan,
    budgetKwh: number
  ): { warnings: string[]; errors: string[] } {
    const warnings: string[] = [];
    const errors: string[] = [];

    const energyAllocs = plan.allocations.filter(a => a.category === 'energy');
    const totalEnergyKwh = energyAllocs.reduce((sum, a) => sum + a.quantityAllocated, 0);

    if (totalEnergyKwh > budgetKwh) {
      errors.push(
        `Energy budget exceeded: ${totalEnergyKwh}kWh needed, ${budgetKwh}kWh available`
      );
    } else if (totalEnergyKwh > budgetKwh * 0.9) {
      warnings.push(
        `Energy usage at ${((totalEnergyKwh / budgetKwh) * 100).toFixed(1)}% of budget`
      );
    }

    return { warnings, errors };
  }

  /**
   * Gate 4: Validate contamination risk
   */
  private validateContaminationRisk(
    plan: AllocationPlan
  ): { warnings: string[] } {
    const warnings: string[] = [];

    // Check for consumable shortages (contamination risk)
    const consumables = ['micropore-tape', 'alcohol', 'gloves'];
    const consumableAllocs = plan.allocations.filter(
      a => a.category === 'consumable' && consumables.includes(a.resourceName)
    );

    for (const consumable of consumables) {
      const alloc = consumableAllocs.find(a => a.resourceName === consumable);
      if (!alloc || alloc.quantityAllocated === 0) {
        warnings.push(
          `Missing ${consumable} allocation - contamination risk may increase`
        );
      }
    }

    return { warnings };
  }

  /**
   * Gate 5: Validate scheduling alignment with workflow
   */
  private validateSchedulingAlignment(
    plan: AllocationPlan,
    workflowPlan: WorkflowPlan
  ): { warnings: string[]; errors: string[] } {
    const warnings: string[] = [];
    const errors: string[] = [];

    if (!plan.workflowPlanId || plan.workflowPlanId !== workflowPlan.planId) {
      errors.push('Allocation plan not linked to workflow plan');
      return { warnings, errors };
    }

    // Check if resource deadlines align with workflow task deadlines
    for (const req of plan.requirements) {
      if (req.neededBy) {
        const neededByDate = new Date(req.neededBy);
        const now = new Date();
        const daysUntilNeeded = Math.ceil(
          (neededByDate.getTime() - now.getTime()) / (24 * 3600000)
        );

        if (daysUntilNeeded < 2) {
          warnings.push(
            `${req.resourceName} needed in ${daysUntilNeeded} days - tight deadline`
          );
        }
      }
    }

    return { warnings, errors };
  }

  /**
   * Gate 6: Validate no regression from previous allocations
   */
  private validateNoRegression(
    plan: AllocationPlan
  ): { warnings: string[] } {
    const warnings: string[] = [];

    // Check confidence threshold
    if (plan.confidence < 60) {
      warnings.push(
        `Low allocation confidence: ${plan.confidence}% - review unmet requirements`
      );
    }

    // Check for unmet requirements
    if (plan.unmetRequirements.length > 0) {
      warnings.push(
        `${plan.unmetRequirements.length} unmet requirements - workflow may be incomplete`
      );
    }

    return { warnings };
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const resourceAuditor = new ResourceAuditor();
