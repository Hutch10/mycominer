// Phase 20: Allocation Engine
// Allocates resources to workflow tasks with conflict detection

'use client';

import { devMode } from '@/app/config/developerMode';
import {
  ResourceRequirement,
  ResourceAllocation,
  AllocationPlan,
  InventoryItem,
} from '@/app/resource/resourceTypes';

// ============================================================================
// ALLOCATION ENGINE
// ============================================================================

class AllocationEngine {
  private allocationCounter = 0;
  private planCounter = 0;

  /**
   * Create allocation plan from requirements and inventory
   */
  createAllocationPlan(
    requirements: ResourceRequirement[],
    inventory: InventoryItem[],
    workflowPlanId?: string
  ): AllocationPlan {
    const allocations: ResourceAllocation[] = [];
    const unmetRequirements: ResourceRequirement[] = [];
    const conflictingAllocations: AllocationPlan['conflictingAllocations'] = [];

    // Create inventory map for quick lookups
    const inventoryMap = new Map(inventory.map(item => [item.name, item]));

    // Process each requirement
    for (const req of requirements) {
      // Skip energy and labor (not inventory items)
      if (req.category === 'energy' || req.category === 'labor') {
        continue;
      }

      const item = inventoryMap.get(req.resourceName);

      if (!item) {
        unmetRequirements.push(req);
        conflictingAllocations.push({
          resourceName: req.resourceName,
          requested: req.quantityNeeded,
          available: 0,
          deficit: req.quantityNeeded,
        });
        continue;
      }

      if (item.quantityAvailable < req.quantityNeeded) {
        // Partial allocation
        const allocatedQty = item.quantityAvailable;
        allocations.push({
          allocationId: `alloc-${++this.allocationCounter}`,
          requirementId: req.requirementId,
          category: req.category,
          resourceName: req.resourceName,
          itemId: item.itemId,
          quantityRequested: req.quantityNeeded,
          quantityAllocated: allocatedQty,
          unit: req.unit,
          allocationDate: new Date().toISOString(),
          status: 'reserved',
          source: item.location,
          room: item.locationRoomId,
          facility: item.locationFacilityId,
        });

        unmetRequirements.push({
          ...req,
          quantityNeeded: req.quantityNeeded - allocatedQty,
        });

        conflictingAllocations.push({
          resourceName: req.resourceName,
          requested: req.quantityNeeded,
          available: allocatedQty,
          deficit: req.quantityNeeded - allocatedQty,
        });

        // Update available quantity
        item.quantityAvailable = 0;
      } else {
        // Full allocation
        allocations.push({
          allocationId: `alloc-${++this.allocationCounter}`,
          requirementId: req.requirementId,
          category: req.category,
          resourceName: req.resourceName,
          itemId: item.itemId,
          quantityRequested: req.quantityNeeded,
          quantityAllocated: req.quantityNeeded,
          unit: req.unit,
          allocationDate: new Date().toISOString(),
          status: 'reserved',
          source: item.location,
          room: item.locationRoomId,
          facility: item.locationFacilityId,
        });

        // Update available quantity
        item.quantityAvailable -= req.quantityNeeded;
      }
    }

    // Calculate total cost
    const totalCost = allocations.reduce((sum, alloc) => {
      const item = inventory.find(i => i.itemId === alloc.itemId);
      return sum + (item ? alloc.quantityAllocated * item.costPerUnit : 0);
    }, 0);

    // Calculate confidence
    const fulfillmentRate = requirements.length > 0
      ? ((requirements.length - unmetRequirements.length) / requirements.length) * 100
      : 100;
    const confidence = Math.max(
      20,
      fulfillmentRate - conflictingAllocations.length * 5
    );

    // Generate conflict descriptions
    const conflicts: string[] = [];
    for (const conflict of conflictingAllocations) {
      conflicts.push(
        `${conflict.resourceName}: requested ${conflict.requested}, available ${conflict.available}, deficit ${conflict.deficit}`
      );
    }

    const plan: AllocationPlan = {
      planId: `alloc-plan-${++this.planCounter}`,
      createdAt: new Date().toISOString(),
      workflowPlanId,
      requirements,
      allocations,
      totalCost,
      unmetRequirements,
      conflicts,
      conflictingAllocations,
      confidence,
      status: 'draft',
    };

    return plan;
  }

  /**
   * Detect resource contention (multiple workflows competing for same resources)
   */
  detectContention(
    allocationPlans: AllocationPlan[]
  ): {
    hasContention: boolean;
    conflicts: { resourceName: string; plans: string[]; totalRequested: number; available: number }[];
  } {
    const resourceUsage = new Map<string, { plans: string[]; total: number }>();

    for (const plan of allocationPlans) {
      for (const alloc of plan.allocations) {
        // Would need to look up resource name from itemId
        // Simplified for now
        const key = alloc.itemId;
        if (!resourceUsage.has(key)) {
          resourceUsage.set(key, { plans: [], total: 0 });
        }
        const usage = resourceUsage.get(key)!;
        usage.plans.push(plan.planId);
        usage.total += alloc.quantityAllocated;
      }
    }

    const conflicts: {
      resourceName: string;
      plans: string[];
      totalRequested: number;
      available: number;
    }[] = [];

    // Check for over-subscription (simplified)
    for (const [itemId, usage] of resourceUsage) {
      if (usage.plans.length > 1) {
        conflicts.push({
          resourceName: itemId,
          plans: usage.plans,
          totalRequested: usage.total,
          available: usage.total, // would need actual inventory lookup
        });
      }
    }

    return {
      hasContention: conflicts.length > 0,
      conflicts,
    };
  }

  /**
   * Approve allocation plan
   */
  approvePlan(plan: AllocationPlan, userId: string): AllocationPlan {
    const config = devMode.getConfig();
    const isAutoApproval = userId === 'auto-dev-mode';

    return {
      ...plan,
      status: 'approved',
      approvalBy: userId,
      approvedAt: new Date().toISOString(),
      metadata: {
        ...(plan as any).metadata,
        autoApproved: isAutoApproval,
        developerMode: config.enabled,
      },
    } as AllocationPlan;
  }

  /**
   * Reject allocation plan
   */
  rejectPlan(plan: AllocationPlan, reason: string): AllocationPlan {
    return {
      ...plan,
      status: 'rejected',
      rejectionReason: reason,
    } as AllocationPlan;
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const allocationEngine = new AllocationEngine();
