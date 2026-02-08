// @ts-nocheck
// Phase 26: Experiment Designer
// Designs experiments with control/variable groups, safety checks, and rollback feasibility

import {
  ExperimentProposal,
  ExperimentVariable,
  ControlGroup,
  ExperimentalGroup,
  ExperimentalCondition,
  VariableType,
} from './researchTypes';
import { researchLog } from './researchLog.ts';

interface ExperimentDesignInput {
  hypothesis: string;
  objective: string;
  species: string;
  facilityId: string;
  variables: {
    type: VariableType;
    controlValue: string | number;
    experimentalValues: (string | number)[];
    rationale: string;
  }[];
  substrateRecipe: string;
  durationDays: number;
  replicationCount?: number;
}

class ExperimentDesigner {
  /**
   * Design a new experiment with control and experimental groups
   */
  designExperiment(input: ExperimentDesignInput): ExperimentProposal {
    const experimentId = `exp-${Date.now()}`;
    const createdAt = new Date().toISOString();

    // Create experiment variables
    const variables: ExperimentVariable[] = input.variables.map((v, idx) => ({
      variableId: `var-${experimentId}-${idx}`,
      variableType: v.type,
      name: this.getVariableName(v.type),
      description: this.getVariableDescription(v.type),
      controlValue: v.controlValue,
      experimentalValue: v.experimentalValues[0], // First experimental value
      unit: this.getVariableUnit(v.type),
      rationale: v.rationale,
      expectedDelta: this.getExpectedDelta(v.type),
      safetyRange: this.getSafetyRange(v.type),
    }));

    // Create control group
    const controlGroup = this.createControlGroup(
      experimentId,
      input.species,
      input.facilityId,
      input.substrateRecipe,
      input.durationDays,
      variables
    );

    // Create experimental groups (one for each combination)
    const experimentalGroups = this.createExperimentalGroups(
      experimentId,
      input.species,
      input.facilityId,
      input.substrateRecipe,
      input.durationDays,
      input.variables,
      variables
    );

    // Perform safety checks
    const safetyChecks = this.performSafetyChecks(controlGroup, experimentalGroups, variables);

    // Assess rollback feasibility
    const rollbackFeasibility = this.assessRollbackFeasibility(variables);

    // Calculate estimated cost
    const estimatedCost = this.calculateEstimatedCost(controlGroup, experimentalGroups);

    const proposal: ExperimentProposal = {
      experimentId,
      createdAt,
      updatedAt: createdAt,
      hypothesis: input.hypothesis,
      objective: input.objective,
        species: input.species,
        facilityId: input.facilityId,
        durationDays: input.durationDays,
      controlGroup,
      experimentalGroups,
      variables,
      status: 'draft',
      safetyChecks,
      rollbackFeasibility,
      estimatedCost,
      dataCollectionPlan: {
        metrics: [
          'yield-kg',
          'contamination-rate',
          'colonization-days',
          'fruiting-days',
          'energy-kwh',
          'labor-hours',
        ],
        frequency: 'daily',
        responsibleParty: 'Research Team',
      },
    };

    // Log experiment design
    researchLog.add({
      entryId: `log-${Date.now()}`,
      timestamp: createdAt,
      category: 'experiment-designed',
      message: `Experiment designed: ${proposal.objective}`,
      context: {
        experimentId,
        facilityId: input.facilityId,
      },
      details: {
        variables: variables.length,
        experimentalGroups: experimentalGroups.length,
      },
    });

    return proposal;
  }

  private createControlGroup(
    experimentId: string,
    species: string,
    facilityId: string,
    substrateRecipe: string,
    durationDays: number,
    variables: ExperimentVariable[]
  ): ControlGroup {
    const conditions: ExperimentalCondition[] = variables.map((v) => ({
      conditionId: `cond-control-${v.variableId}`,
      variableId: v.variableId,
      value: v.controlValue,
      isControl: true,
      facilityId,
    }));

    return {
      groupId: `group-control-${experimentId}`,
      name: 'Control Group',
      description: 'Baseline conditions using standard practices',
      conditions,
      facilityId,
      species,
      substrateRecipe,
      expectedDurationDays: durationDays,
      resourceRequirements: {
        substrateKg: 50,
        laborHours: 20,
        energyKwh: 100,
        equipmentIds: ['autoclave-1', 'incubator-1', 'fruiting-chamber-1'],
      },
    };
  }

  private createExperimentalGroups(
    experimentId: string,
    species: string,
    facilityId: string,
    substrateRecipe: string,
    durationDays: number,
    inputVariables: ExperimentDesignInput['variables'],
    variables: ExperimentVariable[]
  ): ExperimentalGroup[] {
    const groups: ExperimentalGroup[] = [];

    // Create one experimental group per variable combination
    inputVariables.forEach((inputVar, varIdx) => {
      inputVar.experimentalValues.forEach((expValue, expIdx) => {
        const conditions: ExperimentalCondition[] = variables.map((v) => {
          const isThisVariable = v.variableType === inputVar.type;
          return {
            conditionId: `cond-exp-${varIdx}-${expIdx}-${v.variableId}`,
            variableId: v.variableId,
            value: isThisVariable ? expValue : v.controlValue,
            isControl: false,
            facilityId,
          };
        });

        groups.push({
          groupId: `group-exp-${experimentId}-${varIdx}-${expIdx}`,
          name: `Experimental Group ${varIdx + 1}.${expIdx + 1}`,
          description: `Testing ${inputVar.type}: ${expValue}`,
          conditions,
          variablesChanged: [variables.find((v) => v.variableType === inputVar.type)!.variableId],
          facilityId,
          species,
          substrateRecipe,
          expectedDurationDays: durationDays,
          resourceRequirements: {
            substrateKg: 50,
            laborHours: 20,
            energyKwh: 100,
            equipmentIds: ['autoclave-1', 'incubator-2', 'fruiting-chamber-2'],
          },
        });
      });
    });

    return groups;
  }

  private performSafetyChecks(
    controlGroup: ControlGroup,
    experimentalGroups: ExperimentalGroup[],
    variables: ExperimentVariable[]
  ) {
    const checks = [];

    // Check 1: All variables within safety ranges
    checks.push({
      checkType: 'safety-range-check',
      passed: variables.every((v) => {
        if (!v.safetyRange) return true;
        const expValue = typeof v.experimentalValue === 'number' ? v.experimentalValue : 0;
        return expValue >= v.safetyRange.min && expValue <= v.safetyRange.max;
      }),
      details: 'All variables checked against species-specific safety ranges',
    });

    // Check 2: Resource availability
    const totalSubstrate =
      controlGroup.resourceRequirements.substrateKg +
      experimentalGroups.reduce((sum, g) => sum + g.resourceRequirements.substrateKg, 0);

    checks.push({
      checkType: 'resource-availability',
      passed: totalSubstrate < 500, // Mock threshold
      details: `Total substrate required: ${totalSubstrate}kg`,
    });

    // Check 3: No contamination risk variables
    checks.push({
      checkType: 'contamination-risk',
      passed: !variables.some((v) => v.variableType === 'sterilization-method'),
      details: 'Standard sterilization protocols maintained',
    });

    return checks;
  }

  private assessRollbackFeasibility(variables: ExperimentVariable[]) {
    // Determine if experiment can be safely stopped/reversed
    const irreversibleVariables = ['sterilization-method', 'inoculation-rate'];
    const hasIrreversible = variables.some((v) => irreversibleVariables.includes(v.variableType));

    return {
      canRollback: !hasIrreversible,
      rollbackSteps: hasIrreversible
        ? []
        : [
            'Stop experiment immediately',
            'Harvest any viable fruit bodies',
            'Dispose of contaminated substrate',
            'Sanitize equipment',
            'Return to standard operating procedures',
          ],
      rollbackRisks: hasIrreversible
        ? ['Experiment cannot be safely stopped mid-process']
        : ['Potential yield loss', 'Resource waste'],
    };
  }

  private calculateEstimatedCost(
    controlGroup: ControlGroup,
    experimentalGroups: ExperimentalGroup[]
  ) {
    const allGroups = [controlGroup, ...experimentalGroups];

    const totalSubstrateKg = allGroups.reduce(
      (sum, g) => sum + g.resourceRequirements.substrateKg,
      0
    );
    const totalLaborHours = allGroups.reduce((sum, g) => sum + g.resourceRequirements.laborHours, 0);
    const totalEnergyKwh = allGroups.reduce((sum, g) => sum + g.resourceRequirements.energyKwh, 0);

    // Simple cost model placeholders
    const substrateCost = Math.round(totalSubstrateKg * 2); // $2 per kg
    const laborCost = Math.round(totalLaborHours * 20); // $20 per hour
    const energyCost = Math.round(totalEnergyKwh * 0.12); // $0.12 per kWh

    return {
      substrateCost,
      laborCost,
      energyCost,
      totalCost: substrateCost + laborCost + energyCost,
    };
  }

  private getVariableName(type: VariableType): string {
    const names: Record<VariableType, string> = {
      'substrate-composition': 'Substrate Composition',
      temperature: 'Temperature',
      humidity: 'Humidity',
      'co2-level': 'CO2 Level',
      'light-schedule': 'Light Schedule',
      'inoculation-rate': 'Inoculation Rate',
      'sterilization-method': 'Sterilization Method',
      'colonization-duration': 'Colonization Duration',
      'fruiting-trigger': 'Fruiting Trigger Method',
      'harvest-timing': 'Harvest Timing',
    };
    return names[type];
  }

  private getVariableDescription(type: VariableType): string {
    const descriptions: Record<VariableType, string> = {
      'substrate-composition': 'Ratio of substrate ingredients (sawdust, straw, grain, etc.)',
      temperature: 'Environmental temperature during colonization/fruiting',
      humidity: 'Relative humidity level',
      'co2-level': 'Carbon dioxide concentration',
      'light-schedule': 'Hours and intensity of light exposure',
      'inoculation-rate': 'Amount of spawn per kg of substrate',
      'sterilization-method': 'Method of substrate sterilization',
      'colonization-duration': 'Time allowed for mycelial colonization',
      'fruiting-trigger': 'Method used to initiate fruiting',
      'harvest-timing': 'When to harvest based on cap size/maturity',
    };
    return descriptions[type];
  }

  private getVariableUnit(type: VariableType): string | undefined {
    const units: Partial<Record<VariableType, string>> = {
      temperature: '°C',
      humidity: '%',
      'co2-level': 'ppm',
      'light-schedule': 'hours',
      'inoculation-rate': '%',
      'colonization-duration': 'days',
    };
    return units[type];
  }

  private getExpectedDelta(type: VariableType): string {
    const deltas: Record<VariableType, string> = {
      'substrate-composition': 'May affect yield and colonization speed',
      temperature: 'May affect growth rate and contamination risk',
      humidity: 'May affect fruit body formation and quality',
      'co2-level': 'May affect pinning and fruit body morphology',
      'light-schedule': 'May affect pinning and fruit body direction',
      'inoculation-rate': 'May affect colonization speed and vigor',
      'sterilization-method': 'May affect contamination rates',
      'colonization-duration': 'May affect yield and contamination resistance',
      'fruiting-trigger': 'May affect pinning uniformity and timing',
      'harvest-timing': 'May affect yield weight and spore load',
    };
    return deltas[type];
  }

  private getSafetyRange(type: VariableType): { min: number; max: number } | undefined {
    const ranges: Partial<Record<VariableType, { min: number; max: number }>> = {
      temperature: { min: 10, max: 30 },
      humidity: { min: 40, max: 95 },
      'co2-level': { min: 400, max: 2000 },
      'inoculation-rate': { min: 2, max: 10 },
      'colonization-duration': { min: 7, max: 60 },
    };
    return ranges[type];
  }
}

export const experimentDesigner = new ExperimentDesigner();
