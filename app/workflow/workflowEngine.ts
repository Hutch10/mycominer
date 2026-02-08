// Phase 19: Workflow Engine
// Converts strategy plans, facility constraints, and species timelines into actionable workflow tasks

'use client';

import {
  WorkflowTask,
  WorkflowTaskType,
  SpeciesName,
  SpeciesTimeline,
  SubstratePrepCycle,
  LaborWindow,
  EquipmentAvailability,
  HarvestWindow,
  WorkflowRequest,
  WorkflowState,
} from '@/app/workflow/workflowTypes';

// ============================================================================
// DEFAULT SPECIES TIMELINES (Model-based, deterministic)
// ============================================================================

const SPECIES_TIMELINES: Record<SpeciesName, SpeciesTimeline> = {
  'oyster': {
    species: 'oyster',
    stages: [
      { name: 'colonization', durationDays: 14, tempMin: 18, tempMax: 24, humidityMin: 60, humidityMax: 80, co2Min: 0, co2Max: 5000, lightRequired: false },
      { name: 'pinning', durationDays: 7, tempMin: 16, tempMax: 22, humidityMin: 85, humidityMax: 95, co2Min: 1000, co2Max: 3000, lightRequired: true },
      { name: 'fruiting', durationDays: 10, tempMin: 16, tempMax: 20, humidityMin: 80, humidityMax: 95, co2Min: 800, co2Max: 1500, lightRequired: true },
    ],
    totalCycleDays: 31,
    harvestWindowDays: 3,
    cleanupDays: 2,
  },
  'shiitake': {
    species: 'shiitake',
    stages: [
      { name: 'colonization', durationDays: 21, tempMin: 18, tempMax: 24, humidityMin: 60, humidityMax: 75, co2Min: 0, co2Max: 5000, lightRequired: false },
      { name: 'fruiting-prep', durationDays: 7, tempMin: 12, tempMax: 18, humidityMin: 80, humidityMax: 90, co2Min: 1000, co2Max: 2000, lightRequired: true },
      { name: 'fruiting', durationDays: 14, tempMin: 12, tempMax: 18, humidityMin: 80, humidityMax: 90, co2Min: 800, co2Max: 1500, lightRequired: true },
    ],
    totalCycleDays: 42,
    harvestWindowDays: 5,
    cleanupDays: 3,
  },
  'lions-mane': {
    species: 'lions-mane',
    stages: [
      { name: 'colonization', durationDays: 14, tempMin: 20, tempMax: 26, humidityMin: 60, humidityMax: 75, co2Min: 0, co2Max: 5000, lightRequired: false },
      { name: 'fruiting-prep', durationDays: 5, tempMin: 18, tempMax: 24, humidityMin: 85, humidityMax: 95, co2Min: 1000, co2Max: 2000, lightRequired: true },
      { name: 'fruiting', durationDays: 12, tempMin: 18, tempMax: 24, humidityMin: 80, humidityMax: 95, co2Min: 800, co2Max: 1500, lightRequired: true },
    ],
    totalCycleDays: 31,
    harvestWindowDays: 4,
    cleanupDays: 2,
  },
  'king-oyster': {
    species: 'king-oyster',
    stages: [
      { name: 'colonization', durationDays: 16, tempMin: 18, tempMax: 24, humidityMin: 65, humidityMax: 80, co2Min: 0, co2Max: 5000, lightRequired: false },
      { name: 'pinning', durationDays: 8, tempMin: 16, tempMax: 22, humidityMin: 85, humidityMax: 95, co2Min: 1000, co2Max: 3000, lightRequired: true },
      { name: 'fruiting', durationDays: 12, tempMin: 14, tempMax: 20, humidityMin: 80, humidityMax: 95, co2Min: 800, co2Max: 1500, lightRequired: true },
    ],
    totalCycleDays: 36,
    harvestWindowDays: 4,
    cleanupDays: 2,
  },
  'enoki': {
    species: 'enoki',
    stages: [
      { name: 'colonization', durationDays: 12, tempMin: 20, tempMax: 26, humidityMin: 60, humidityMax: 75, co2Min: 0, co2Max: 5000, lightRequired: false },
      { name: 'fruiting', durationDays: 10, tempMin: 10, tempMax: 16, humidityMin: 85, humidityMax: 95, co2Min: 1500, co2Max: 3000, lightRequired: false },
    ],
    totalCycleDays: 22,
    harvestWindowDays: 3,
    cleanupDays: 1,
  },
  'pioppino': {
    species: 'pioppino',
    stages: [
      { name: 'colonization', durationDays: 14, tempMin: 18, tempMax: 24, humidityMin: 60, humidityMax: 80, co2Min: 0, co2Max: 5000, lightRequired: false },
      { name: 'fruiting', durationDays: 8, tempMin: 14, tempMax: 20, humidityMin: 85, humidityMax: 95, co2Min: 1000, co2Max: 2000, lightRequired: true },
    ],
    totalCycleDays: 22,
    harvestWindowDays: 3,
    cleanupDays: 1,
  },
  'reishi': {
    species: 'reishi',
    stages: [
      { name: 'colonization', durationDays: 28, tempMin: 22, tempMax: 28, humidityMin: 60, humidityMax: 75, co2Min: 0, co2Max: 5000, lightRequired: false },
      { name: 'fruiting-prep', durationDays: 7, tempMin: 20, tempMax: 26, humidityMin: 85, humidityMax: 95, co2Min: 1000, co2Max: 2000, lightRequired: true },
      { name: 'fruiting', durationDays: 30, tempMin: 20, tempMax: 26, humidityMin: 80, humidityMax: 95, co2Min: 800, co2Max: 1500, lightRequired: true },
    ],
    totalCycleDays: 65,
    harvestWindowDays: 5,
    cleanupDays: 3,
  },
  'cordyceps': {
    species: 'cordyceps',
    stages: [
      { name: 'colonization', durationDays: 21, tempMin: 18, tempMax: 24, humidityMin: 60, humidityMax: 75, co2Min: 0, co2Max: 5000, lightRequired: false },
      { name: 'fruiting', durationDays: 14, tempMin: 16, tempMax: 22, humidityMin: 85, humidityMax: 95, co2Min: 1000, co2Max: 2000, lightRequired: true },
    ],
    totalCycleDays: 35,
    harvestWindowDays: 4,
    cleanupDays: 2,
  },
  'turkey-tail': {
    species: 'turkey-tail',
    stages: [
      { name: 'colonization', durationDays: 28, tempMin: 20, tempMax: 26, humidityMin: 60, humidityMax: 75, co2Min: 0, co2Max: 5000, lightRequired: false },
      { name: 'fruiting', durationDays: 21, tempMin: 18, tempMax: 24, humidityMin: 85, humidityMax: 95, co2Min: 1000, co2Max: 2000, lightRequired: true },
    ],
    totalCycleDays: 49,
    harvestWindowDays: 5,
    cleanupDays: 2,
  },
  'chestnut': {
    species: 'chestnut',
    stages: [
      { name: 'colonization', durationDays: 18, tempMin: 18, tempMax: 24, humidityMin: 65, humidityMax: 80, co2Min: 0, co2Max: 5000, lightRequired: false },
      { name: 'fruiting', durationDays: 12, tempMin: 14, tempMax: 20, humidityMin: 85, humidityMax: 95, co2Min: 1000, co2Max: 2000, lightRequired: true },
    ],
    totalCycleDays: 30,
    harvestWindowDays: 4,
    cleanupDays: 2,
  },
  'maitake': {
    species: 'maitake',
    stages: [
      { name: 'colonization', durationDays: 28, tempMin: 18, tempMax: 24, humidityMin: 60, humidityMax: 75, co2Min: 0, co2Max: 5000, lightRequired: false },
      { name: 'fruiting', durationDays: 21, tempMin: 16, tempMax: 22, humidityMin: 85, humidityMax: 95, co2Min: 1000, co2Max: 2000, lightRequired: true },
    ],
    totalCycleDays: 49,
    harvestWindowDays: 5,
    cleanupDays: 3,
  },
  'chaga': {
    species: 'chaga',
    stages: [
      { name: 'colonization', durationDays: 60, tempMin: 15, tempMax: 20, humidityMin: 60, humidityMax: 75, co2Min: 0, co2Max: 5000, lightRequired: false },
      { name: 'fruiting', durationDays: 30, tempMin: 10, tempMax: 18, humidityMin: 85, humidityMax: 95, co2Min: 1000, co2Max: 2000, lightRequired: false },
    ],
    totalCycleDays: 90,
    harvestWindowDays: 7,
    cleanupDays: 3,
  },
};

// ============================================================================
// WORKFLOW ENGINE
// ============================================================================

class WorkflowEngine {
  private taskCounter = 0;

  /**
   * Generate workflow tasks from a workflow request
   * Deterministic: same request always produces same task structure
   */
  generateWorkflowTasks(request: WorkflowRequest): WorkflowTask[] {
    const tasks: WorkflowTask[] = [];

    // Task 1: Substrate preparation tasks for each species/yield target
    for (const target of request.harvestTargets) {
      const substrateKg = Math.ceil(target.targetYieldKg / 2); // rough conversion: 2kg substrate -> 1kg yield
      const prepTask: WorkflowTask = {
        taskId: `task-${++this.taskCounter}`,
        type: 'substrate-prep',
        species: target.species,
        durationHours: Math.ceil((substrateKg / 10) * 4), // ~4 hours per 10kg
        laborHours: Math.ceil((substrateKg / 10) * 2),
        rationale: `Prepare substrate for ${target.species}: ${substrateKg}kg to achieve ${target.targetYieldKg}kg yield`,
        priority: 'critical',
      };
      tasks.push(prepTask);

      // Task 2: Inoculation (depends on substrate prep)
      const timeline = SPECIES_TIMELINES[target.species];
      const inoculationTask: WorkflowTask = {
        taskId: `task-${++this.taskCounter}`,
        type: 'inoculation',
        species: target.species,
        durationHours: 2,
        laborHours: 2,
        dependsOn: [prepTask.taskId],
        rationale: `Inoculate ${target.species} substrate after preparation`,
        priority: 'critical',
      };
      tasks.push(inoculationTask);

      // Task 3: Incubation transition (after colonization stage)
      const colonizationDays = timeline.stages[0].durationDays;
      const incubationTransitionTask: WorkflowTask = {
        taskId: `task-${++this.taskCounter}`,
        type: 'incubation-transition',
        species: target.species,
        durationHours: 1,
        laborHours: 0.5,
        dependsOn: [inoculationTask.taskId],
        rationale: `Transition ${target.species} to fruiting conditions after ${colonizationDays} days colonization`,
        priority: 'high',
      };
      tasks.push(incubationTransitionTask);

      // Task 4: Fruiting transition
      const fruitingTransitionTask: WorkflowTask = {
        taskId: `task-${++this.taskCounter}`,
        type: 'fruiting-transition',
        species: target.species,
        durationHours: 2,
        laborHours: 1,
        dependsOn: [incubationTransitionTask.taskId],
        rationale: `Initiate fruiting conditions for ${target.species}`,
        priority: 'high',
      };
      tasks.push(fruitingTransitionTask);

      // Task 5: Misting (daily during fruiting)
      const mistingTask: WorkflowTask = {
        taskId: `task-${++this.taskCounter}`,
        type: 'misting',
        species: target.species,
        durationHours: timeline.totalCycleDays, // continuous throughout fruiting
        laborHours: timeline.totalCycleDays * 0.5, // 30 min per day
        dependsOn: [fruitingTransitionTask.taskId],
        rationale: `Daily misting during fruiting phase (${timeline.totalCycleDays} days)`,
        priority: 'normal',
      };
      tasks.push(mistingTask);

      // Task 6: Harvest
      const harvestTask: WorkflowTask = {
        taskId: `task-${++this.taskCounter}`,
        type: 'harvest',
        species: target.species,
        durationHours: Math.ceil(target.targetYieldKg / 20), // ~20kg/hour harvest rate
        laborHours: Math.ceil(target.targetYieldKg / 10),
        dependsOn: [mistingTask.taskId],
        rationale: `Harvest ${target.targetYieldKg}kg of ${target.species}`,
        priority: 'high',
      };
      tasks.push(harvestTask);

      // Task 7: Cleanup and reset
      const cleanupTask: WorkflowTask = {
        taskId: `task-${++this.taskCounter}`,
        type: 'cleaning',
        species: target.species,
        durationHours: timeline.cleanupDays * 8,
        laborHours: timeline.cleanupDays * 4,
        dependsOn: [harvestTask.taskId],
        rationale: `Clean and sanitize growing area after harvest`,
        priority: 'high',
      };
      tasks.push(cleanupTask);
    }

    // Task 8: Equipment maintenance (if applicable)
    if (request.constraintSet.equipmentAvailable.length > 0) {
      const maintenanceTask: WorkflowTask = {
        taskId: `task-${++this.taskCounter}`,
        type: 'equipment-maintenance',
        durationHours: 4,
        laborHours: 2,
        equipment: request.constraintSet.equipmentAvailable,
        rationale: `Scheduled maintenance for ${request.constraintSet.equipmentAvailable.length} equipment items`,
        priority: 'normal',
      };
      tasks.push(maintenanceTask);
    }

    return tasks;
  }

  /**
   * Validate workflow tasks for feasibility
   */
  validateTasks(tasks: WorkflowTask[], request: WorkflowRequest): string[] {
    const issues: string[] = [];

    // Check total labor hours feasibility
    const totalLaborHours = tasks.reduce((sum, t) => sum + t.laborHours, 0);
    if (totalLaborHours > request.constraintSet.laborHoursAvailable * request.timeWindowDays) {
      issues.push(
        `Total labor hours required (${totalLaborHours.toFixed(1)}) exceeds available ` +
        `(${request.constraintSet.laborHoursAvailable * request.timeWindowDays} over ${request.timeWindowDays} days)`
      );
    }

    // Check equipment requirements
    const requiredEquipment = new Set<string>();
    tasks.forEach(t => {
      if (t.equipment) {
        t.equipment.forEach(e => requiredEquipment.add(e));
      }
    });
    requiredEquipment.forEach(eq => {
      if (!request.constraintSet.equipmentAvailable.includes(eq)) {
        issues.push(`Required equipment "${eq}" not available in constraint set`);
      }
    });

    return issues;
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const workflowEngine = new WorkflowEngine();
