'use client';

import { DigitalRoom, ContaminationRiskMap, ContaminationRiskFactors, EnvironmentalState } from '@/app/simulation/engine/simulationTypes';
import { simulationLog } from '@/app/simulation/engine/simulationLog';

class ContaminationModelEngine {
  assessContaminationRisk(room: DigitalRoom, environmentalHistory?: EnvironmentalState[]): ContaminationRiskMap {
    const factors = this.analyzeRiskFactors(room, environmentalHistory);
    const score = this.calculateRiskScore(factors);
    const overallRisk = this.categorizeRisk(score);
    const recommendations = this.generateRecommendations(factors, room);
    const rationale = this.buildRationale(factors, score);

    const riskMap: ContaminationRiskMap = {
      roomId: room.id,
      overallRisk,
      score,
      factors,
      recommendations,
      rationale,
    };

    simulationLog.add({
      category: 'contamination',
      message: `Contamination risk assessed for ${room.name}`,
      context: { roomId: room.id, overallRisk, score },
    });

    return riskMap;
  }

  private analyzeRiskFactors(room: DigitalRoom, history?: EnvironmentalState[]): ContaminationRiskFactors {
    const state = room.environmentalState;
    const highHumidityZones: string[] = [];
    const poorAirflowZones: string[] = [];
    const stagnantAirVectors: string[] = [];

    // High humidity check
    if (state.humidityPercent > 90) {
      highHumidityZones.push(room.id);
    }

    // Poor airflow check
    const fanCount = room.devices.filter((d) => d.type === 'fan' && d.status === 'on').length;
    if (fanCount === 0 || state.airflowCFM < 50) {
      poorAirflowZones.push(room.id);
    }

    // Stagnant air (high CO₂ + low airflow)
    if (state.co2Ppm > 3000 && state.airflowCFM < 80) {
      stagnantAirVectors.push(`${room.id}-high-co2-zone`);
    }

    // Temperature fluctuation check
    let temperatureFluctuations = 0;
    if (history && history.length > 10) {
      const temps = history.map((h) => h.temperatureC);
      const maxTemp = Math.max(...temps);
      const minTemp = Math.min(...temps);
      temperatureFluctuations = maxTemp - minTemp;
    }

    // Spore load estimate (heuristic based on conditions)
    let sporeLoadEstimate = 0;
    if (state.humidityPercent > 85) sporeLoadEstimate += 20;
    if (state.temperatureC > 20 && state.temperatureC < 28) sporeLoadEstimate += 15;
    if (poorAirflowZones.length > 0) sporeLoadEstimate += 25;
    if (temperatureFluctuations > 5) sporeLoadEstimate += 10;
    if (room.substrate && room.substrate.moisturePercent > 70) sporeLoadEstimate += 15;

    return {
      highHumidityZones,
      poorAirflowZones,
      sporeLoadEstimate: Math.min(sporeLoadEstimate, 100),
      stagnantAirVectors,
      temperatureFluctuations,
    };
  }

  private calculateRiskScore(factors: ContaminationRiskFactors): number {
    let score = 0;

    score += factors.highHumidityZones.length * 20;
    score += factors.poorAirflowZones.length * 25;
    score += factors.sporeLoadEstimate * 0.3;
    score += factors.stagnantAirVectors.length * 15;
    score += Math.min(factors.temperatureFluctuations * 2, 20);

    return Math.min(Math.round(score), 100);
  }

  private categorizeRisk(score: number): ContaminationRiskMap['overallRisk'] {
    if (score >= 70) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  }

  private generateRecommendations(factors: ContaminationRiskFactors, room: DigitalRoom): string[] {
    const recommendations: string[] = [];

    if (factors.highHumidityZones.length > 0) {
      recommendations.push('Reduce humidity to below 90% to minimize mold spore germination risk');
    }

    if (factors.poorAirflowZones.length > 0) {
      recommendations.push('Increase airflow (enable fans or increase CFM) to prevent stagnant air pockets');
    }

    if (factors.stagnantAirVectors.length > 0) {
      recommendations.push('Address high CO₂ zones with improved ventilation to reduce anaerobic contamination risk');
    }

    if (factors.temperatureFluctuations > 5) {
      recommendations.push('Stabilize temperature to reduce stress on mycelium and contamination susceptibility');
    }

    if (factors.sporeLoadEstimate > 60) {
      recommendations.push('Consider HEPA filtration or increased fresh air exchange to reduce ambient spore load');
    }

    if (room.substrate && room.substrate.moisturePercent > 70) {
      recommendations.push('Monitor substrate moisture; excess moisture can promote bacterial contamination');
    }

    if (recommendations.length === 0) {
      recommendations.push('Current conditions appear favorable; maintain sterile technique during interactions');
    }

    return recommendations;
  }

  private buildRationale(factors: ContaminationRiskFactors, score: number): string[] {
    const rationale: string[] = [
      `Risk score: ${score}/100 based on environmental factors`,
      `Estimated spore load: ${factors.sporeLoadEstimate}/100`,
    ];

    if (factors.highHumidityZones.length > 0) {
      rationale.push('High humidity detected (>90%), favoring contaminant germination');
    }

    if (factors.poorAirflowZones.length > 0) {
      rationale.push('Insufficient airflow detected, increasing stagnation risk');
    }

    if (factors.temperatureFluctuations > 5) {
      rationale.push(`Temperature variance of ${factors.temperatureFluctuations.toFixed(1)}°C may stress cultures`);
    }

    rationale.push('Note: This is a model-based projection, not a guarantee of real-world outcomes');

    return rationale;
  }
}

export const contaminationModelEngine = new ContaminationModelEngine();
