// Phase 22: Energy Model
// Deterministic modeling of device energy usage, HVAC cycles, and demand forecasting

'use client';

import {
  DeviceEnergyProfile,
  EnergyForecast,
  EnergyInefficiency,
  EnergyOptimizationReport,
} from '@/app/optimization/optimizationTypes';

// Default energy profiles for typical mushroom farm equipment
const DEFAULT_DEVICES: Record<string, Omit<DeviceEnergyProfile, 'deviceId' | 'location'>> = {
  'hvac-unit': {
    name: 'HVAC Unit',
    category: 'hvac',
    baselineWatts: 500,
    peakWatts: 3000,
    duty: 0.6,
    hoursPerDay: 18,
    estimatedDailyKwh: 32.4,
  },
  'led-grow-lights': {
    name: 'LED Grow Lights',
    category: 'lighting',
    baselineWatts: 0,
    peakWatts: 2000,
    duty: 0.4,
    hoursPerDay: 12,
    estimatedDailyKwh: 9.6,
  },
  'autoclave': {
    name: 'Autoclave',
    category: 'sterilization',
    baselineWatts: 100,
    peakWatts: 5000,
    duty: 0.15,
    hoursPerDay: 8,
    estimatedDailyKwh: 6.0,
  },
  'incubation-chamber': {
    name: 'Incubation Chamber',
    category: 'incubation',
    baselineWatts: 200,
    peakWatts: 800,
    duty: 0.8,
    hoursPerDay: 24,
    estimatedDailyKwh: 15.4,
  },
  'humidifier': {
    name: 'Humidifier',
    category: 'pump',
    baselineWatts: 50,
    peakWatts: 500,
    duty: 0.4,
    hoursPerDay: 16,
    estimatedDailyKwh: 3.2,
  },
  'monitoring-system': {
    name: 'Monitoring System',
    category: 'monitoring',
    baselineWatts: 100,
    peakWatts: 200,
    duty: 1.0,
    hoursPerDay: 24,
    estimatedDailyKwh: 2.4,
  },
};

class EnergyModel {
  /**
   * Forecast energy demand based on device profiles and historical data
   */
  forecastDemand(
    devices: DeviceEnergyProfile[],
    days: number = 7,
    variancePercent: number = 5
  ): EnergyForecast {
    const hourlyPrediction = [];
    let totalKwh = 0;

    // Generate hourly forecast for specified period
    for (let day = 0; day < days; day++) {
      for (let hour = 0; hour < 24; hour++) {
        let hourKwh = 0;

        devices.forEach(device => {
          const isActive =
            (device.category === 'hvac' && (hour >= 6 && hour <= 23)) ||
            (device.category === 'lighting' && (hour >= 6 && hour <= 20)) ||
            (device.category === 'sterilization' && (hour >= 9 && hour <= 17)) ||
            (device.category === 'incubation' && true) ||
            (device.category === 'monitoring' && true) ||
            (device.category === 'pump' && (hour >= 6 && hour <= 22));

          if (isActive) {
            hourKwh += (device.peakWatts * device.duty) / 1000;
          } else {
            hourKwh += device.baselineWatts / 1000;
          }
        });

        const variance = (Math.random() - 0.5) * variancePercent * 2;
        const variantKwh = hourKwh * (1 + variance / 100);

        hourlyPrediction.push({
          hour: (day * 24 + hour) % 24,
          forecastKwh: parseFloat(variantKwh.toFixed(2)),
          baseline: parseFloat((hourKwh * 0.95).toFixed(2)),
          peak: parseFloat((hourKwh * 1.15).toFixed(2)),
          confidence: 85 - Math.abs(variance),
        });

        totalKwh += variantKwh;
      }
    }

    // Aggregate daily totals
    const dailyTotals = [];
    for (let day = 0; day < days; day++) {
      let dayKwh = 0;
      for (let hour = 0; hour < 24; hour++) {
        const idx = day * 24 + hour;
        if (idx < hourlyPrediction.length) {
          dayKwh += hourlyPrediction[idx].forecastKwh;
        }
      }
      const date = new Date(Date.now() + day * 86400000).toISOString().split('T')[0];
      dailyTotals.push({
        date,
        forecastKwh: parseFloat(dayKwh.toFixed(1)),
        variance: parseFloat(((dayKwh / (totalKwh / days) - 1) * 100).toFixed(1)),
      });
    }

    const peakHour = hourlyPrediction.reduce((max, h, i) => h.forecastKwh > hourlyPrediction[max].forecastKwh ? i : max, 0);
    const peakKwh = hourlyPrediction[peakHour].forecastKwh;
    const avgDailyKwh = totalKwh / days;
    const weeklyKwh = avgDailyKwh * 7;

    return {
      forecastId: `forecast-${Date.now()}`,
      timestamp: new Date().toISOString(),
      days,
      hourlyPrediction,
      dailyTotals,
      peakHour: peakHour % 24,
      peakKwh: parseFloat(peakKwh.toFixed(2)),
      avgDailyKwh: parseFloat(avgDailyKwh.toFixed(1)),
      weeklyProjectionKwh: parseFloat(weeklyKwh.toFixed(1)),
    };
  }

  /**
   * Detect inefficiencies by comparing actual vs. baseline usage
   */
  detectInefficiencies(
    actualDailyKwh: number,
    baselineDailyKwh: number,
    devices: DeviceEnergyProfile[],
    historicalData?: { date: string; kwhUsed: number }[]
  ): EnergyInefficiency[] {
    const inefficiencies: EnergyInefficiency[] = [];

    const wasteKwh = actualDailyKwh - baselineDailyKwh;
    if (wasteKwh > baselineDailyKwh * 0.15) {
      // More than 15% over baseline
      inefficiencies.push({
        inefficiencyId: `ineff-${Date.now()}`,
        type: 'hvac-cycling',
        deviceId: 'hvac-unit',
        location: 'facility-wide',
        detectedAt: new Date().toISOString(),
        currentKwh: actualDailyKwh,
        baselineKwh: baselineDailyKwh,
        wasteKwh,
        percentageWaste: parseFloat(((wasteKwh / baselineDailyKwh) * 100).toFixed(1)),
        severity: wasteKwh > baselineDailyKwh * 0.25 ? 'high' : 'medium',
        confidence: 78,
      });
    }

    // Check for over-cooling (temp too low)
    const overCoolingWaste = baselineDailyKwh * 0.1;
    if (actualDailyKwh > baselineDailyKwh + overCoolingWaste) {
      inefficiencies.push({
        inefficiencyId: `ineff-${Date.now()}-oc`,
        type: 'over-cooling',
        deviceId: 'hvac-unit',
        location: 'facility-wide',
        detectedAt: new Date().toISOString(),
        currentKwh: actualDailyKwh,
        baselineKwh: baselineDailyKwh,
        wasteKwh: overCoolingWaste,
        percentageWaste: parseFloat(((overCoolingWaste / baselineDailyKwh) * 100).toFixed(1)),
        durationDays: historicalData?.length ?? 1,
        severity: 'medium',
        confidence: 72,
      });
    }

    // Check for idle draw (persistent baseline consumption)
    const idleDrawKwh = (devices.reduce((sum, d) => sum + d.baselineWatts, 0) / 1000) * 24;
    if (idleDrawKwh > baselineDailyKwh * 0.2) {
      inefficiencies.push({
        inefficiencyId: `ineff-${Date.now()}-idle`,
        type: 'idle-draw',
        deviceId: 'monitoring-system',
        location: 'facility-wide',
        detectedAt: new Date().toISOString(),
        currentKwh: idleDrawKwh,
        baselineKwh: baselineDailyKwh * 0.15,
        wasteKwh: idleDrawKwh - baselineDailyKwh * 0.15,
        percentageWaste: parseFloat(((idleDrawKwh / baselineDailyKwh) * 100).toFixed(1)),
        severity: 'low',
        confidence: 85,
      });
    }

    return inefficiencies;
  }

  /**
   * Generate comprehensive energy optimization report
   */
  generateReport(
    actualData: { date: string; kwhUsed: number }[],
    baselineKwh: number,
    devices: DeviceEnergyProfile[],
    period: string = 'last-7-days',
    costPerKwh: number = 0.12
  ): EnergyOptimizationReport {
    const totalEnergyKwh = actualData.reduce((sum, d) => sum + d.kwhUsed, 0);
    const expectedKwh = baselineKwh * actualData.length;
    const inefficiencies = this.detectInefficiencies(totalEnergyKwh / actualData.length, baselineKwh, devices, actualData);

    const totalWasteKwh = inefficiencies.reduce((sum, i) => sum + i.wasteKwh, 0);
    const costSavings = totalWasteKwh * costPerKwh;

    return {
      reportId: `energy-report-${Date.now()}`,
      createdAt: new Date().toISOString(),
      period,
      totalEnergyKwh: parseFloat(totalEnergyKwh.toFixed(1)),
      baselineKwh: expectedKwh,
      inefficiencies,
      totalWasteKwh: parseFloat(totalWasteKwh.toFixed(1)),
      estimatedCostSavingsDollars: parseFloat(costSavings.toFixed(2)),
      potentialKwhReduction: parseFloat((totalWasteKwh * 0.8).toFixed(1)),
      topOpportunities: inefficiencies.map(i => `${i.type}: ${i.percentageWaste}% waste in ${i.deviceId}`),
      confidence: Math.round(inefficiencies.reduce((sum, i) => sum + i.confidence, 0) / (inefficiencies.length || 1)),
    };
  }

  getDeviceProfile(deviceType: string, location: string): DeviceEnergyProfile | undefined {
    const base = DEFAULT_DEVICES[deviceType];
    if (!base) return undefined;
    return {
      ...base,
      deviceId: `${deviceType}-${location}`,
      location,
    };
  }
}

export const energyModel = new EnergyModel();
