// Phase 20: Forecasting Engine
// Forecasts inventory depletion, energy usage, and maintenance windows

'use client';

import {
  ResourceForecast,
  ForecastReport,
  ResourceRequirement,
  InventoryItem,
  EquipmentStatus,
} from '@/app/resource/resourceTypes';

// ============================================================================
// FORECASTING ENGINE
// ============================================================================

class ForecastingEngine {
  private forecastCounter = 0;
  private reportCounter = 0;

  /**
   * Generate resource forecast from requirements and current inventory
   */
  generateForecast(
    requirement: ResourceRequirement,
    currentInventory: InventoryItem,
    timeWindowDays: number
  ): ResourceForecast {
    const projectedUsage: ResourceForecast['projectedUsage'] = [];
    
    // Simple linear depletion model
    const dailyUsage = requirement.quantityNeeded / timeWindowDays;
    let remaining = currentInventory.quantityAvailable;

    for (let day = 0; day < timeWindowDays; day++) {
      const date = new Date(Date.now() + day * 24 * 3600000).toISOString().split('T')[0];
      remaining = Math.max(0, remaining - dailyUsage);
      
      projectedUsage.push({
        date,
        quantity: dailyUsage,
        remainingQuantity: remaining,
      });

      if (remaining === 0) break;
    }

    // Determine depletion date
    const depletionEntry = projectedUsage.find(p => p.remainingQuantity === 0);
    const depletionDate = depletionEntry ? depletionEntry.date : null;

    // Calculate confidence based on inventory volatility
    const confidence = currentInventory.quantityAvailable > requirement.quantityNeeded
      ? 90
      : 60;

    return {
      forecastId: `forecast-${++this.forecastCounter}`,
      createdAt: new Date().toISOString(),
      resourceName: requirement.resourceName,
      category: requirement.category,
      currentQuantity: currentInventory.quantityAvailable,
      projectedUsage,
      depletionDate,
      confidence,
      assumptions: [
        `Linear daily usage: ${dailyUsage.toFixed(2)}${currentInventory.unit}/day`,
        `Time window: ${timeWindowDays} days`,
        'No replenishment assumed',
      ],
      recommendations: depletionDate
        ? [`Order ${currentInventory.reorderQuantity}${currentInventory.unit} before ${depletionDate}`]
        : ['Current inventory sufficient for time window'],
    };
  }

  /**
   * Generate comprehensive forecast report
   */
  generateForecastReport(
    requirements: ResourceRequirement[],
    inventory: InventoryItem[],
    energyBudgetKwh: number,
    equipment: EquipmentStatus[],
    timeWindowDays: number,
    workflowPlanId?: string
  ): ForecastReport {
    const forecasts: ResourceForecast[] = [];
    const criticalShortages: string[] = [];

    // Create inventory map
    const inventoryMap = new Map(inventory.map(item => [item.name, item]));

    // Generate forecasts for each requirement
    for (const req of requirements) {
      if (req.category === 'energy' || req.category === 'labor') continue;

      const item = inventoryMap.get(req.resourceName);
      if (item) {
        const forecast = this.generateForecast(req, item, timeWindowDays);
        forecasts.push(forecast);

        if (forecast.depletionDate) {
          const daysUntilDepletion = Math.ceil(
            (new Date(forecast.depletionDate).getTime() - Date.now()) / (24 * 3600000)
          );
          if (daysUntilDepletion < 7) {
            criticalShortages.push(
              `${req.resourceName}: depletes in ${daysUntilDepletion} days`
            );
          }
        }
      }
    }

    // Calculate energy budget projection
    const energyRequirements = requirements.filter(r => r.category === 'energy');
    const projectedUsageKwh = energyRequirements.reduce((sum, r) => sum + r.quantityNeeded, 0);
    const remainingKwh = energyBudgetKwh - projectedUsageKwh;
    const utilizationPercent = (projectedUsageKwh / energyBudgetKwh) * 100;

    // Equipment maintenance windows
    const equipmentMaintenanceWindows = equipment.map(eq => ({
      equipmentId: eq.equipmentId,
      nextMaintenanceDate: new Date(
        Date.now() + eq.hoursUntilMaintenance * 3600000
      ).toISOString().split('T')[0],
      hoursUntilMaintenance: eq.hoursUntilMaintenance,
    }));

    // Overall confidence
    const avgForecastConfidence = forecasts.length > 0
      ? forecasts.reduce((sum, f) => sum + f.confidence, 0) / forecasts.length
      : 100;
    const overallConfidence = Math.max(
      20,
      avgForecastConfidence - criticalShortages.length * 10
    );

    return {
      reportId: `forecast-report-${++this.reportCounter}`,
      createdAt: new Date().toISOString(),
      workflowPlanId,
      forecasts,
      criticalShortages,
      energyBudgetProjection: {
        totalBudgetKwh: energyBudgetKwh,
        projectedUsageKwh,
        remainingKwh,
        utilizationPercent,
      },
      equipmentMaintenanceWindows,
      overallConfidence,
    };
  }

  /**
   * Forecast equipment bottlenecks
   */
  forecastEquipmentBottlenecks(
    equipment: EquipmentStatus[],
    requirements: ResourceRequirement[]
  ): string[] {
    const bottlenecks: string[] = [];

    for (const eq of equipment) {
      if (eq.capacityUsed > 90) {
        bottlenecks.push(
          `${eq.name} at ${eq.capacityUsed}% capacity - potential bottleneck`
        );
      }

      if (eq.hoursUntilMaintenance < 24) {
        bottlenecks.push(
          `${eq.name} requires maintenance in ${eq.hoursUntilMaintenance}h - plan downtime`
        );
      }
    }

    return bottlenecks;
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const forecastingEngine = new ForecastingEngine();
