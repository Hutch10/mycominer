// Phase 20: Resource Engine
// Generates resource requirements from workflow plans and facility constraints

'use client';

import {
  ResourceRequirement,
  ResourceRequest,
  SubstrateRecipe,
  SubstrateMaterial,
  SupplementType,
  ResourceCategory,
} from '@/app/resource/resourceTypes';

// ============================================================================
// DEFAULT SUBSTRATE RECIPES (Model-based, deterministic)
// ============================================================================

const SUBSTRATE_RECIPES: Record<string, SubstrateRecipe> = {
  'oyster': {
    species: 'oyster',
    materials: [
      { material: 'hardwood-sawdust', percentageByWeight: 70 },
      { material: 'straw', percentageByWeight: 20 },
      { material: 'bran', percentageByWeight: 8 },
      { material: 'gypsum', percentageByWeight: 2 },
    ],
    supplements: [
      { supplement: 'wheat-bran', percentageByWeight: 5 },
    ],
    moistureContent: 60,
    sterilizationTemp: 121,
    sterilizationDurationHours: 2.5,
    yieldPerKg: 0.5, // 500g mushrooms per 1kg substrate
  },
  'shiitake': {
    species: 'shiitake',
    materials: [
      { material: 'hardwood-sawdust', percentageByWeight: 80 },
      { material: 'bran', percentageByWeight: 18 },
      { material: 'gypsum', percentageByWeight: 2 },
    ],
    supplements: [
      { supplement: 'wheat-bran', percentageByWeight: 10 },
    ],
    moistureContent: 55,
    sterilizationTemp: 121,
    sterilizationDurationHours: 3,
    yieldPerKg: 0.3, // 300g per kg
  },
  'lions-mane': {
    species: 'lions-mane',
    materials: [
      { material: 'hardwood-sawdust', percentageByWeight: 75 },
      { material: 'soy-hulls', percentageByWeight: 23 },
      { material: 'gypsum', percentageByWeight: 2 },
    ],
    supplements: [
      { supplement: 'wheat-bran', percentageByWeight: 8 },
    ],
    moistureContent: 58,
    sterilizationTemp: 121,
    sterilizationDurationHours: 2.5,
    yieldPerKg: 0.4,
  },
  'king-oyster': {
    species: 'king-oyster',
    materials: [
      { material: 'hardwood-sawdust', percentageByWeight: 65 },
      { material: 'corn-cobs', percentageByWeight: 25 },
      { material: 'bran', percentageByWeight: 8 },
      { material: 'gypsum', percentageByWeight: 2 },
    ],
    supplements: [
      { supplement: 'wheat-bran', percentageByWeight: 7 },
    ],
    moistureContent: 60,
    sterilizationTemp: 121,
    sterilizationDurationHours: 2.5,
    yieldPerKg: 0.35,
  },
  'reishi': {
    species: 'reishi',
    materials: [
      { material: 'hardwood-sawdust', percentageByWeight: 85 },
      { material: 'bran', percentageByWeight: 13 },
      { material: 'gypsum', percentageByWeight: 2 },
    ],
    supplements: [
      { supplement: 'wheat-bran', percentageByWeight: 10 },
      { supplement: 'calcium-carbonate', percentageByWeight: 2 },
    ],
    moistureContent: 60,
    sterilizationTemp: 121,
    sterilizationDurationHours: 3,
    yieldPerKg: 0.2, // medicinal mushrooms have lower yields
  },
};

// ============================================================================
// RESOURCE ENGINE
// ============================================================================

class ResourceEngine {
  private requirementCounter = 0;

  /**
   * Generate resource requirements from workflow plan
   * Deterministic: same plan always produces same requirements
   */
  generateResourceRequirements(
    request: ResourceRequest
  ): ResourceRequirement[] {
    const requirements: ResourceRequirement[] = [];

    // Process each requirement from the request
    for (const req of request.requirements) {
      if (req.category === 'substrate-material') {
        // Expand substrate requirements based on species recipe
        const speciesMatch = req.resourceName.match(/(\w+)-substrate/);
        if (speciesMatch) {
          const species = speciesMatch[1];
          const recipe = SUBSTRATE_RECIPES[species];
          
          if (recipe) {
            // Calculate individual material requirements
            const totalSubstrateKg = req.quantityNeeded;
            
            for (const material of recipe.materials) {
              const materialKg = (totalSubstrateKg * material.percentageByWeight) / 100;
              requirements.push({
                requirementId: `req-${++this.requirementCounter}`,
                taskId: req.taskId,
                workflowId: req.workflowId,
                category: 'substrate-material',
                resourceName: material.material,
                quantityNeeded: materialKg,
                unit: 'kg',
                priority: req.priority,
                neededBy: req.neededBy,
                rationale: `${species} substrate requires ${material.percentageByWeight}% ${material.material} (${materialKg.toFixed(2)}kg from ${totalSubstrateKg}kg total)`,
              });
            }

            // Add supplement requirements
            for (const supplement of recipe.supplements) {
              const supplementKg = (totalSubstrateKg * supplement.percentageByWeight) / 100;
              requirements.push({
                requirementId: `req-${++this.requirementCounter}`,
                taskId: req.taskId,
                workflowId: req.workflowId,
                category: 'supplement',
                resourceName: supplement.supplement,
                quantityNeeded: supplementKg,
                unit: 'kg',
                priority: req.priority,
                neededBy: req.neededBy,
                rationale: `${species} requires ${supplement.percentageByWeight}% ${supplement.supplement} supplement (${supplementKg.toFixed(2)}kg)`,
              });
            }

            // Add container requirement (grow bags)
            const bagCount = Math.ceil(totalSubstrateKg / 2.5); // 2.5kg per bag
            requirements.push({
              requirementId: `req-${++this.requirementCounter}`,
              taskId: req.taskId,
              workflowId: req.workflowId,
              category: 'container',
              resourceName: 'grow-bag',
              quantityNeeded: bagCount,
              unit: 'pieces',
              priority: req.priority,
              neededBy: req.neededBy,
              rationale: `Need ${bagCount} grow bags for ${totalSubstrateKg}kg substrate (~2.5kg per bag)`,
            });

            // Add sterilization energy requirement
            const sterilizationKwh = (totalSubstrateKg / 50) * recipe.sterilizationDurationHours * 2; // ~2kWh per hour per 50kg
            requirements.push({
              requirementId: `req-${++this.requirementCounter}`,
              taskId: req.taskId,
              workflowId: req.workflowId,
              category: 'energy',
              resourceName: 'sterilization-energy',
              quantityNeeded: sterilizationKwh,
              unit: 'kWh',
              priority: req.priority,
              neededBy: req.neededBy,
              rationale: `Sterilization requires ${sterilizationKwh.toFixed(1)}kWh for ${totalSubstrateKg}kg at ${recipe.sterilizationTemp}°C for ${recipe.sterilizationDurationHours}h`,
            });
          }
        }
      } else {
        // Pass through non-substrate requirements
        requirements.push({
          ...req,
          requirementId: req.requirementId || `req-${++this.requirementCounter}`,
        });
      }
    }

    // Add consumables based on workflow duration
    const consumableRequirements = this.generateConsumableRequirements(
      request.timeWindowDays,
      request.requirements.length
    );
    requirements.push(...consumableRequirements);

    return requirements;
  }

  /**
   * Generate consumable requirements based on workflow duration
   */
  private generateConsumableRequirements(
    timeWindowDays: number,
    taskCount: number
  ): ResourceRequirement[] {
    const consumables: ResourceRequirement[] = [];

    // Micropore tape: ~1 roll per 50 bags
    const tapeRolls = Math.ceil(taskCount / 50);
    consumables.push({
      requirementId: `req-${++this.requirementCounter}`,
      category: 'consumable',
      resourceName: 'micropore-tape',
      quantityNeeded: tapeRolls,
      unit: 'pieces',
      priority: 'normal',
      neededBy: new Date(Date.now() + 3 * 24 * 3600000).toISOString().split('T')[0],
      rationale: `Micropore tape for gas exchange (${tapeRolls} rolls for ~${taskCount} tasks)`,
    });

    // Alcohol: 1L per week
    const alcoholLiters = Math.ceil(timeWindowDays / 7);
    consumables.push({
      requirementId: `req-${++this.requirementCounter}`,
      category: 'consumable',
      resourceName: 'alcohol',
      quantityNeeded: alcoholLiters,
      unit: 'L',
      priority: 'high',
      neededBy: new Date(Date.now() + 1 * 24 * 3600000).toISOString().split('T')[0],
      rationale: `70% isopropyl alcohol for sterilization (~1L per week, ${timeWindowDays} days)`,
    });

    // Gloves: 2 pairs per day
    const glovePairs = timeWindowDays * 2;
    consumables.push({
      requirementId: `req-${++this.requirementCounter}`,
      category: 'consumable',
      resourceName: 'gloves',
      quantityNeeded: glovePairs,
      unit: 'pieces',
      priority: 'normal',
      neededBy: new Date(Date.now() + 7 * 24 * 3600000).toISOString().split('T')[0],
      rationale: `Nitrile gloves for contamination control (~2 pairs per day, ${timeWindowDays} days)`,
    });

    return consumables;
  }

  /**
   * Calculate total energy requirements
   */
  calculateEnergyRequirements(requirements: ResourceRequirement[]): {
    totalKwh: number;
    breakdown: Record<string, number>;
  } {
    const breakdown: Record<string, number> = {};
    let totalKwh = 0;

    for (const req of requirements) {
      if (req.category === 'energy') {
        breakdown[req.resourceName] = (breakdown[req.resourceName] || 0) + req.quantityNeeded;
        totalKwh += req.quantityNeeded;
      }
    }

    // Add baseline facility energy (HVAC, lighting, etc.)
    const baselineKwh = 50; // ~50kWh per week baseline
    breakdown['facility-baseline'] = baselineKwh;
    totalKwh += baselineKwh;

    return { totalKwh, breakdown };
  }

  /**
   * Validate requirements against facility constraints
   */
  validateRequirements(
    requirements: ResourceRequirement[],
    energyBudgetKwh: number
  ): string[] {
    const issues: string[] = [];

    // Check energy budget
    const energyReqs = this.calculateEnergyRequirements(requirements);
    if (energyReqs.totalKwh > energyBudgetKwh) {
      issues.push(
        `Energy requirement (${energyReqs.totalKwh.toFixed(1)}kWh) exceeds budget (${energyBudgetKwh}kWh)`
      );
    }

    // Check for missing critical resources
    const hasCriticalSubstrate = requirements.some(
      r => r.category === 'substrate-material' && r.priority === 'critical'
    );
    if (!hasCriticalSubstrate && requirements.length > 0) {
      issues.push('No critical substrate materials identified; review species requirements');
    }

    return issues;
  }

  /**
   * Get substrate recipe for species
   */
  getSubstrateRecipe(species: string): SubstrateRecipe | undefined {
    return SUBSTRATE_RECIPES[species];
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const resourceEngine = new ResourceEngine();
