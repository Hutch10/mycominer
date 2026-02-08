'use client';

import {
  SimulationScenario,
  SimulationReport,
  DigitalRoom,
  EnvironmentalCurve,
  ContaminationRiskMap,
  LoopStabilityReport,
  LoopSimulationConfig,
} from '@/app/simulation/engine/simulationTypes';
import { digitalTwinGenerator } from '@/app/simulation/engine/digitalTwinGenerator';
import { environmentalModelEngine } from '@/app/simulation/engine/environmentalModel';
import { contaminationModelEngine } from '@/app/simulation/engine/contaminationModel';
import { loopSimulator } from '@/app/simulation/engine/loopSimulator';
import { simulationLog } from '@/app/simulation/engine/simulationLog';

class SimulationEngine {
  private scenarios: SimulationScenario[] = [];
  private reports: SimulationReport[] = [];

  createScenario(scenario: Omit<SimulationScenario, 'id'>): SimulationScenario {
    const full: SimulationScenario = {
      id: `scenario-${Date.now()}`,
      ...scenario,
    };
    this.scenarios.push(full);
    simulationLog.add({
      category: 'simulation',
      message: `Scenario created: ${full.name}`,
      context: { scenarioId: full.id, type: full.type, mode: full.mode },
    });
    return full;
  }

  runSimulation(scenarioId: string): SimulationReport {
    const scenario = this.scenarios.find((s) => s.id === scenarioId);
    if (!scenario) {
      throw new Error(`Scenario ${scenarioId} not found`);
    }

    simulationLog.add({
      category: 'simulation',
      message: `Starting simulation for scenario: ${scenario.name}`,
      context: { scenarioId, type: scenario.type, rooms: scenario.rooms.length },
    });

    const environmentalCurves: EnvironmentalCurve[] = [];
    const contaminationRisks: ContaminationRiskMap[] = [];
    const loopStability: LoopStabilityReport[] = [];
    let totalEnergyKwh = 0;
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Run simulations for each room
    scenario.rooms.forEach((room) => {
      // Environmental simulation
      if (scenario.mode === 'time-series' || scenario.mode === 'stress-test' || scenario.mode === 'optimization') {
        const curve = environmentalModelEngine.simulateTimeSeries(room, scenario.duration);
        environmentalCurves.push(curve);

        if (curve.stability !== 'stable') {
          warnings.push(`${room.name}: Environmental instability detected (${curve.stability})`);
        }

        // Contamination assessment based on environmental history
        const riskMap = contaminationModelEngine.assessContaminationRisk(room, curve.dataPoints);
        contaminationRisks.push(riskMap);

        if (riskMap.overallRisk === 'high') {
          warnings.push(`${room.name}: High contamination risk (score: ${riskMap.score})`);
        }
      } else {
        // Snapshot mode: single-point contamination assessment
        const riskMap = contaminationModelEngine.assessContaminationRisk(room);
        contaminationRisks.push(riskMap);
      }

      // Loop simulation (if optimization or stress-test)
      if (scenario.mode === 'optimization' || scenario.mode === 'stress-test') {
        const targetEnv = environmentalModelEngine.getTargetEnvironment(room.species, room.stage);
        if (targetEnv.temperatureC && targetEnv.humidityPercent && targetEnv.co2Ppm) {
          const loopConfig: LoopSimulationConfig = {
            roomId: room.id,
            duration: Math.min(scenario.duration, 120), // cap at 2 hours for loop sim
            controlStrategy: scenario.parameters?.controlStrategy || 'pid',
            targetEnvironment: {
              temperatureC: targetEnv.temperatureC,
              humidityPercent: targetEnv.humidityPercent,
              co2Ppm: targetEnv.co2Ppm,
              airflowCFM: 100,
              lightLux: 0,
              timestamp: Date.now(),
            },
            tolerances: {
              temperature: scenario.parameters?.tempTolerance || 1,
              humidity: scenario.parameters?.humidityTolerance || 5,
              co2: scenario.parameters?.co2Tolerance || 200,
            },
          };

          const loopReport = loopSimulator.runClosedLoopSimulation(room, loopConfig);
          loopStability.push(loopReport);
          totalEnergyKwh += loopReport.energyUsageKwh;

          if (loopReport.stability !== 'stable') {
            warnings.push(`${room.name}: Loop instability detected (${loopReport.stability})`);
          }
        }
      }
    });

    // Generate recommendations based on findings
    if (scenario.type === 'optimization') {
      recommendations.push('Review loop stability reports to tune control parameters');
      recommendations.push('Consider device scheduling to reduce energy consumption');
    }

    if (scenario.type === 'contamination-scenario') {
      const highRiskRooms = contaminationRisks.filter((r) => r.overallRisk === 'high');
      if (highRiskRooms.length > 0) {
        recommendations.push(`${highRiskRooms.length} room(s) require contamination mitigation measures`);
      }
    }

    const summary = this.generateSummary(scenario, environmentalCurves, contaminationRisks, loopStability);

    const report: SimulationReport = {
      id: `report-${Date.now()}`,
      scenarioId: scenario.id,
      scenarioName: scenario.name,
      timestamp: Date.now(),
      duration: scenario.duration,
      rooms: scenario.rooms.map((r) => r.id),
      environmentalCurves,
      contaminationRisks,
      loopStability,
      energyUsageKwh: Number(totalEnergyKwh.toFixed(3)),
      summary,
      warnings,
      recommendations,
    };

    this.reports.push(report);

    simulationLog.add({
      category: 'simulation',
      message: `Simulation completed: ${scenario.name}`,
      context: {
        reportId: report.id,
        warnings: warnings.length,
        energyKwh: totalEnergyKwh,
        highRiskRooms: contaminationRisks.filter((r) => r.overallRisk === 'high').length,
      },
    });

    return report;
  }

  private generateSummary(
    scenario: SimulationScenario,
    curves: EnvironmentalCurve[],
    risks: ContaminationRiskMap[],
    loops: LoopStabilityReport[]
  ): string {
    const stableCurves = curves.filter((c) => c.stability === 'stable').length;
    const highRiskRooms = risks.filter((r) => r.overallRisk === 'high').length;
    const stableLoops = loops.filter((l) => l.stability === 'stable').length;

    let summary = `Simulated ${scenario.rooms.length} room(s) over ${scenario.duration} minutes in ${scenario.mode} mode. `;

    if (curves.length > 0) {
      summary += `${stableCurves}/${curves.length} rooms showed stable environmental conditions. `;
    }

    if (risks.length > 0) {
      summary += `${highRiskRooms} room(s) flagged with high contamination risk. `;
    }

    if (loops.length > 0) {
      summary += `${stableLoops}/${loops.length} control loops achieved stability. `;
    }

    summary += 'All outputs are model-based projections, not real-world guarantees.';

    return summary;
  }

  listScenarios(): SimulationScenario[] {
    return [...this.scenarios].reverse();
  }

  getScenario(id: string): SimulationScenario | undefined {
    return this.scenarios.find((s) => s.id === id);
  }

  listReports(): SimulationReport[] {
    return [...this.reports].reverse();
  }

  getReport(id: string): SimulationReport | undefined {
    return this.reports.find((r) => r.id === id);
  }

  // Quick simulation: create and run a baseline scenario for a facility
  runBaselineSimulation(facilityData?: any): SimulationReport {
    const snapshot = digitalTwinGenerator.mirrorFacilityConfiguration(facilityData);
    const scenario = this.createScenario({
      name: 'Baseline Facility Simulation',
      description: 'Current state simulation across all rooms',
      type: 'baseline',
      mode: 'time-series',
      rooms: snapshot.rooms,
      duration: 60, // 1 hour
      parameters: {},
    });

    return this.runSimulation(scenario.id);
  }
}

export const simulationEngine = new SimulationEngine();
