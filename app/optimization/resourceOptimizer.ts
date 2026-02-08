// Phase 22: Resource Optimizer
// Detects substrate waste, consumable inefficiencies, and equipment bottlenecks

'use client';

import {
  SubstrateConsumption,
  EquipmentUtilization,
  ResourceOptimizationReport,
} from '@/app/optimization/optimizationTypes';

class ResourceOptimizer {
  /**
   * Analyze substrate consumption vs. forecast
   */
  analyzeSubstrateUsage(
    material: string,
    actualKg: number,
    forecastedKg: number,
    yieldKg: number,
    periodDays: number
  ): SubstrateConsumption {
    const variance = actualKg - forecastedKg;
    const efficiency = yieldKg / actualKg;
    const wasteIndicators: string[] = [];

    if (variance > forecastedKg * 0.1) {
      wasteIndicators.push('Higher than expected consumption');
    }
    if (efficiency < 0.4) {
      wasteIndicators.push('Low yield-to-substrate ratio');
    }
    if (variance > 0 && efficiency < 0.3) {
      wasteIndicators.push('Potential sterilization failure or contamination');
    }

    return {
      material,
      periodDays,
      consumedKg: actualKg,
      forecastedKg,
      variance,
      efficiency,
      wasteIndicators,
    };
  }

  /**
   * Analyze equipment utilization
   */
  analyzeEquipmentLoad(
    equipmentId: string,
    name: string,
    category: string,
    hoursUsed: number,
    hoursAvailable: number,
    maxCapacity: number
  ): EquipmentUtilization {
    const utilizationPercent = parseFloat(((hoursUsed / hoursAvailable) * 100).toFixed(1));
    const potentialCapacity = maxCapacity * (1 - utilizationPercent / 100);
    let underutilizationReason: string | undefined;

    if (utilizationPercent < 30) {
      underutilizationReason = 'Significantly under-utilized; consider consolidating loads';
    } else if (utilizationPercent < 50) {
      underutilizationReason = 'Under-utilized; room for additional batches';
    }

    return {
      equipmentId,
      name,
      category,
      utilizationPercent,
      hoursAvailable,
      hoursUsed,
      potentialCapacity,
      underutilizationReason,
    };
  }

  /**
   * Generate comprehensive resource optimization report
   */
  generateReport(
    substrates: SubstrateConsumption[],
    equipment: EquipmentUtilization[],
    costPerKgSubstrate: Record<string, number> = {}
  ): ResourceOptimizationReport {
    const detectedWaste = [];
    let totalWasteCost = 0;

    // Analyze substrate waste
    substrates.forEach(s => {
      if (s.variance > 0) {
        const costPerKg = costPerKgSubstrate[s.material] || 2.5;
        const wasteCost = s.variance * costPerKg;
        totalWasteCost += wasteCost;

        detectedWaste.push({
          category: `substrate-${s.material}`,
          quantity: s.variance,
          unit: 'kg',
          estimatedCost: parseFloat(wasteCost.toFixed(2)),
          reason: `Over-consumption vs forecast (${s.wasteIndicators.join(', ')})`,
        });
      }
    });

    // Analyze equipment underutilization
    const bottlenecks = equipment
      .filter(e => e.utilizationPercent < 50)
      .map(e => ({
        resource: e.name,
        impact: `${e.underutilizationReason ?? 'Under-utilized'}; ${e.potentialCapacity.toFixed(1)} units capacity available`,
        severity: e.utilizationPercent < 20 ? 'high' : 'medium' as const,
      }));

    return {
      reportId: `resource-report-${Date.now()}`,
      createdAt: new Date().toISOString(),
      substrateMaterials: substrates,
      equipmentUtilization: equipment,
      detectedWaste,
      totalWasteCost: parseFloat(totalWasteCost.toFixed(2)),
      bottlenecks,
      confidence: Math.min(85, 70 + equipment.length * 2),
    };
  }
}

export const resourceOptimizer = new ResourceOptimizer();
