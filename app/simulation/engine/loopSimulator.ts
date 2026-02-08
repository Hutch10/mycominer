'use client';

import { DigitalRoom, LoopSimulationConfig, LoopStabilityReport, EnvironmentalState } from '@/app/simulation/engine/simulationTypes';
import { environmentalModelEngine } from '@/app/simulation/engine/environmentalModel';
import { simulationLog } from '@/app/simulation/engine/simulationLog';

class LoopSimulator {
  runClosedLoopSimulation(room: DigitalRoom, config: LoopSimulationConfig): LoopStabilityReport {
    const stepMinutes = 1;
    const steps = config.duration;
    const deviations: number[] = [];
    const states: EnvironmentalState[] = [];
    let cycleCount = 0;
    let totalEnergyWh = 0;
    let previousDeviceStates = room.devices.map((d) => d.status);

    for (let minute = 0; minute <= steps; minute++) {
      const currentState = room.environmentalState;
      states.push({ ...currentState, timestamp: Date.now() + minute * 60000 });

      // Calculate deviation from target
      const tempDev = Math.abs(currentState.temperatureC - config.targetEnvironment.temperatureC);
      const humidDev = Math.abs(currentState.humidityPercent - config.targetEnvironment.humidityPercent);
      const totalDev = tempDev + humidDev / 10; // normalize humidity
      deviations.push(totalDev);

      // Apply control strategy
      this.applyControlStrategy(room, config);

      // Count cycles (device state changes)
      const currentDeviceStates = room.devices.map((d) => d.status);
      for (let i = 0; i < currentDeviceStates.length; i++) {
        if (currentDeviceStates[i] !== previousDeviceStates[i]) {
          cycleCount++;
        }
      }
      previousDeviceStates = currentDeviceStates;

      // Calculate energy usage for this minute
      const energyThisMinute = room.devices
        .filter((d) => d.status === 'on')
        .reduce((sum, d) => sum + d.powerWatts, 0) / 60; // Wh
      totalEnergyWh += energyThisMinute;

      // Step environment forward
      const curve = environmentalModelEngine.simulateTimeSeries(room, 1, 1);
      if (curve.dataPoints.length > 0) {
        room.environmentalState = curve.dataPoints[curve.dataPoints.length - 1];
      }
    }

    const avgDeviation = deviations.reduce((sum, d) => sum + d, 0) / deviations.length;
    const maxDeviation = Math.max(...deviations);
    const stability = this.assessLoopStability(deviations, cycleCount, config.duration);
    const oscillationFrequency = this.detectOscillation(states);
    const recommendations = this.generateLoopRecommendations(stability, cycleCount, avgDeviation, oscillationFrequency);

    const report: LoopStabilityReport = {
      id: `loop-${Date.now()}`,
      roomId: room.id,
      duration: config.duration,
      stability,
      averageDeviation: Number(avgDeviation.toFixed(2)),
      maxDeviation: Number(maxDeviation.toFixed(2)),
      cycleCount,
      energyUsageKwh: Number((totalEnergyWh / 1000).toFixed(3)),
      recommendations,
      oscillationFrequency: oscillationFrequency > 0 ? Number(oscillationFrequency.toFixed(2)) : undefined,
    };

    simulationLog.add({
      category: 'loop',
      message: `Loop simulation completed for ${room.name}`,
      context: { roomId: room.id, stability, cycleCount, energyKwh: report.energyUsageKwh },
    });

    return report;
  }

  private applyControlStrategy(room: DigitalRoom, config: LoopSimulationConfig) {
    const current = room.environmentalState;
    const target = config.targetEnvironment;

    if (config.controlStrategy === 'bang-bang') {
      // Simple on/off control
      const tempError = current.temperatureC - target.temperatureC;
      const humidError = current.humidityPercent - target.humidityPercent;

      room.devices.forEach((device) => {
        if (device.type === 'heater') {
          device.status = tempError < -config.tolerances.temperature ? 'on' : 'off';
        }
        if (device.type === 'humidifier') {
          device.status = humidError < -config.tolerances.humidity ? 'on' : 'off';
        }
        if (device.type === 'fan') {
          const co2Error = current.co2Ppm - target.co2Ppm;
          device.status = co2Error > config.tolerances.co2 ? 'on' : 'standby';
        }
      });
    } else if (config.controlStrategy === 'pid') {
      // Simplified PID (proportional only for demo)
      const tempError = target.temperatureC - current.temperatureC;
      const humidError = target.humidityPercent - current.humidityPercent;

      room.devices.forEach((device) => {
        if (device.type === 'heater') {
          device.status = tempError > 0.5 ? 'on' : 'off';
        }
        if (device.type === 'humidifier') {
          device.status = humidError > 3 ? 'on' : 'off';
        }
      });
    }
  }

  private assessLoopStability(
    deviations: number[],
    cycleCount: number,
    durationMinutes: number
  ): LoopStabilityReport['stability'] {
    const avgDeviation = deviations.reduce((sum, d) => sum + d, 0) / deviations.length;
    const cyclesPerHour = (cycleCount / durationMinutes) * 60;

    if (avgDeviation > 3 || cyclesPerHour > 30) return 'unstable';
    if (avgDeviation > 1.5 || cyclesPerHour > 15) return 'oscillating';
    return 'stable';
  }

  private detectOscillation(states: EnvironmentalState[]): number {
    if (states.length < 20) return 0;

    const temps = states.map((s) => s.temperatureC);
    let crossings = 0;
    const mean = temps.reduce((sum, t) => sum + t, 0) / temps.length;

    for (let i = 1; i < temps.length; i++) {
      if ((temps[i - 1] < mean && temps[i] >= mean) || (temps[i - 1] >= mean && temps[i] < mean)) {
        crossings++;
      }
    }

    // Oscillation frequency in cycles per hour
    const durationHours = states.length / 60;
    return crossings / durationHours / 2; // divide by 2 for full cycles
  }

  private generateLoopRecommendations(
    stability: LoopStabilityReport['stability'],
    cycleCount: number,
    avgDeviation: number,
    oscillationFrequency?: number
  ): string[] {
    const recommendations: string[] = [];

    if (stability === 'unstable') {
      recommendations.push('Loop is unstable; consider adjusting control tolerances or tuning PID parameters');
    }

    if (stability === 'oscillating') {
      recommendations.push('Loop shows oscillatory behavior; increase dead-band or add integral control');
    }

    if (cycleCount > 100) {
      recommendations.push('High cycle count may reduce actuator lifespan; consider widening control tolerances');
    }

    if (oscillationFrequency && oscillationFrequency > 10) {
      recommendations.push(`High oscillation frequency (${oscillationFrequency.toFixed(1)} cycles/hr); add damping or hysteresis`);
    }

    if (avgDeviation < 0.5) {
      recommendations.push('Loop is well-tuned and stable; current control strategy is effective');
    }

    return recommendations;
  }
}

export const loopSimulator = new LoopSimulator();
