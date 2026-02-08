'use client';

import {
  DigitalRoom,
  EnvironmentalState,
  EnvironmentalDynamics,
  EnvironmentalCurve,
  DeviceEffect,
  VirtualDevice,
} from '@/app/simulation/engine/simulationTypes';
import { simulationLog } from '@/app/simulation/engine/simulationLog';

class EnvironmentalModelEngine {
  private speciesTargets: Record<string, Record<string, Partial<EnvironmentalState>>> = {
    oyster: {
      fruiting: { temperatureC: 18, humidityPercent: 85, co2Ppm: 1000 },
      incubation: { temperatureC: 24, humidityPercent: 60, co2Ppm: 5000 },
    },
    shiitake: {
      fruiting: { temperatureC: 16, humidityPercent: 80, co2Ppm: 800 },
      incubation: { temperatureC: 25, humidityPercent: 55, co2Ppm: 2000 },
    },
    'lions-mane': {
      fruiting: { temperatureC: 18, humidityPercent: 85, co2Ppm: 1200 },
      incubation: { temperatureC: 24, humidityPercent: 65, co2Ppm: 5000 },
    },
  };

  simulateTimeSeries(room: DigitalRoom, durationMinutes: number, stepMinutes: number = 1): EnvironmentalCurve {
    const dataPoints: EnvironmentalState[] = [];
    const startTime = Date.now();
    let currentState = { ...room.environmentalState };

    const dynamics = this.calculateDynamics(room);
    const steps = Math.floor(durationMinutes / stepMinutes);

    for (let i = 0; i <= steps; i++) {
      const timestamp = startTime + i * stepMinutes * 60000;
      currentState = this.stepEnvironment(currentState, room, dynamics, stepMinutes);
      dataPoints.push({ ...currentState, timestamp });
    }

    const stability = this.assessStability(dataPoints, room);
    const deviations = this.detectDeviations(dataPoints, room);

    const curve: EnvironmentalCurve = {
      roomId: room.id,
      startTime,
      endTime: startTime + durationMinutes * 60000,
      dataPoints,
      stability,
      deviations,
    };

    simulationLog.add({
      category: 'environmental',
      message: `Environmental simulation completed for ${room.name}`,
      context: { roomId: room.id, duration: durationMinutes, stability, deviations: deviations.length },
    });

    return curve;
  }

  private stepEnvironment(
    state: EnvironmentalState,
    room: DigitalRoom,
    dynamics: EnvironmentalDynamics,
    stepMinutes: number
  ): EnvironmentalState {
    const stepHours = stepMinutes / 60;
    let temp = state.temperatureC;
    let humidity = state.humidityPercent;
    let co2 = state.co2Ppm;

    // Natural drift toward ambient
    temp += dynamics.temperatureDrift * stepHours;
    humidity += dynamics.humidityDrift * stepHours;
    co2 += dynamics.co2Drift * stepHours;

    // Substrate effects
    if (room.substrate) {
      temp += (room.substrate.heatProductionRate / (room.volume * 50)) * stepHours;
      co2 += room.substrate.co2ProductionRate * stepHours;
    }

    // Device effects
    room.devices.forEach((device) => {
      if (device.status === 'on') {
        const effect = this.calculateDeviceEffect(device, room.volume);
        if (effect.parameterAffected === 'temperatureC') temp += effect.magnitude * stepHours;
        if (effect.parameterAffected === 'humidityPercent') humidity += effect.magnitude * stepHours;
        if (effect.parameterAffected === 'co2Ppm') co2 += effect.magnitude * stepHours;
        if (effect.parameterAffected === 'airflowCFM') {
          // Fan increases air exchange, reduces CO₂
          co2 -= effect.magnitude * 5 * stepHours;
        }
      }
    });

    // Bounds
    temp = Math.max(5, Math.min(40, temp));
    humidity = Math.max(20, Math.min(100, humidity));
    co2 = Math.max(400, Math.min(10000, co2));

    return {
      temperatureC: Number(temp.toFixed(2)),
      humidityPercent: Number(humidity.toFixed(2)),
      co2Ppm: Math.round(co2),
      airflowCFM: state.airflowCFM,
      lightLux: state.lightLux,
      timestamp: state.timestamp,
    };
  }

  private calculateDynamics(room: DigitalRoom): EnvironmentalDynamics {
    // Simplified model: larger volumes drift slower
    const volumeFactor = Math.min(room.volume / 50, 2);

    return {
      temperatureDrift: -0.5 / volumeFactor, // drift toward ambient (cooler)
      humidityDrift: -1.0 / volumeFactor, // drift toward ambient (drier)
      co2Drift: -20 / volumeFactor, // natural ventilation reduces CO₂
      ambientTemp: 18,
      ambientHumidity: 50,
      ambientCO2: 400,
    };
  }

  calculateDeviceEffect(device: VirtualDevice, roomVolume: number): DeviceEffect {
    const volumeFactor = 50 / roomVolume; // normalize to 50m³ baseline

    const effects: Record<VirtualDevice['type'], DeviceEffect> = {
      heater: {
        deviceId: device.id,
        deviceType: 'heater',
        parameterAffected: 'temperatureC',
        magnitude: device.effectRate * volumeFactor,
        energyCost: device.powerWatts,
      },
      humidifier: {
        deviceId: device.id,
        deviceType: 'humidifier',
        parameterAffected: 'humidityPercent',
        magnitude: device.effectRate * volumeFactor,
        energyCost: device.powerWatts,
      },
      fan: {
        deviceId: device.id,
        deviceType: 'fan',
        parameterAffected: 'airflowCFM',
        magnitude: device.effectRate,
        energyCost: device.powerWatts,
      },
      scrubber: {
        deviceId: device.id,
        deviceType: 'scrubber',
        parameterAffected: 'co2Ppm',
        magnitude: -device.effectRate * volumeFactor, // negative = removes CO₂
        energyCost: device.powerWatts,
      },
      light: {
        deviceId: device.id,
        deviceType: 'light',
        parameterAffected: 'lightLux',
        magnitude: device.effectRate,
        energyCost: device.powerWatts,
      },
      sensor: {
        deviceId: device.id,
        deviceType: 'sensor',
        parameterAffected: 'temperatureC',
        magnitude: 0,
        energyCost: device.powerWatts,
      },
    };

    return effects[device.type];
  }

  private assessStability(dataPoints: EnvironmentalState[], room: DigitalRoom): EnvironmentalCurve['stability'] {
    if (dataPoints.length < 10) return 'stable';

    const tempVariance = this.calculateVariance(dataPoints.map((d) => d.temperatureC));
    const humidityVariance = this.calculateVariance(dataPoints.map((d) => d.humidityPercent));

    if (tempVariance > 4 || humidityVariance > 100) return 'oscillating';
    if (tempVariance > 2 || humidityVariance > 50) return 'drifting';
    return 'stable';
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const squaredDiffs = values.map((v) => Math.pow(v - mean, 2));
    return squaredDiffs.reduce((sum, v) => sum + v, 0) / values.length;
  }

  private detectDeviations(dataPoints: EnvironmentalState[], room: DigitalRoom): string[] {
    const deviations: string[] = [];
    const target = this.getTargetEnvironment(room.species, room.stage);

    if (!target.temperatureC) return deviations;

    const avgTemp = dataPoints.reduce((sum, d) => sum + d.temperatureC, 0) / dataPoints.length;
    const avgHumidity = dataPoints.reduce((sum, d) => sum + d.humidityPercent, 0) / dataPoints.length;
    const avgCO2 = dataPoints.reduce((sum, d) => sum + d.co2Ppm, 0) / dataPoints.length;

    if (Math.abs(avgTemp - target.temperatureC) > 2) {
      deviations.push(`Temperature deviated by ${(avgTemp - target.temperatureC).toFixed(1)}°C from target`);
    }
    if (target.humidityPercent && Math.abs(avgHumidity - target.humidityPercent) > 10) {
      deviations.push(`Humidity deviated by ${(avgHumidity - target.humidityPercent).toFixed(1)}% from target`);
    }
    if (target.co2Ppm && Math.abs(avgCO2 - target.co2Ppm) > 500) {
      deviations.push(`CO₂ deviated by ${Math.round(avgCO2 - target.co2Ppm)} ppm from target`);
    }

    return deviations;
  }

  getTargetEnvironment(species?: string, stage?: string): Partial<EnvironmentalState> {
    if (!species || !stage) return {};
    return this.speciesTargets[species]?.[stage] || {};
  }
}

export const environmentalModelEngine = new EnvironmentalModelEngine();
