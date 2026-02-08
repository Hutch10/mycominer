// Phase 19: Conflict Detector
// Detects scheduling conflicts, resource contentions, and safety violations

'use client';

import {
  ScheduledTask,
  WorkflowConflict,
  ConflictCheckResult,
  WorkflowTask,
  WorkflowRequest,
} from '@/app/workflow/workflowTypes';

// ============================================================================
// CONFLICT DETECTOR
// ============================================================================

class ConflictDetector {
  private resultCounter = 0;

  /**
   * Comprehensive conflict check on scheduled tasks
   */
  checkConflicts(
    scheduledTasks: ScheduledTask[],
    workflowTasks: WorkflowTask[],
    request: WorkflowRequest
  ): ConflictCheckResult {
    const conflicts: WorkflowConflict[] = [];

    // Check 1: Overlapping tasks in same room
    conflicts.push(...this.detectOverlappingTasks(scheduledTasks));

    // Check 2: Species incompatibility in shared spaces
    conflicts.push(...this.detectSpeciesIncompatibility(scheduledTasks));

    // Check 3: Substrate preparation bottlenecks
    conflicts.push(...this.detectSubstrateBottlenecks(scheduledTasks, workflowTasks));

    // Check 4: Harvest clustering overload
    conflicts.push(...this.detectHarvestClustering(scheduledTasks));

    // Check 5: Labor hour violations
    conflicts.push(...this.detectLaborOverload(scheduledTasks, request));

    // Check 6: Equipment over-allocation
    conflicts.push(...this.detectEquipmentConflicts(scheduledTasks, request));

    // Check 7: Contamination-risk scheduling conflicts
    conflicts.push(...this.detectContaminationRisks(scheduledTasks));

    // Determine decision
    const criticalCount = conflicts.filter(c => c.severity === 'critical').length;
    const warningCount = conflicts.filter(c => c.severity === 'warning').length;

    let decision: 'allow' | 'warn' | 'block' = 'allow';
    if (criticalCount > 0) {
      decision = 'block';
    } else if (warningCount > 0) {
      decision = 'warn';
    }

    const result: ConflictCheckResult = {
      resultId: `conflict-check-${++this.resultCounter}`,
      timestamp: new Date().toISOString(),
      checkedTasks: scheduledTasks.map(t => t.taskId),
      conflicts,
      decision,
      rationale:
        conflicts.length === 0
          ? 'No conflicts detected; schedule is feasible'
          : `${conflicts.length} conflict(s) detected: ${conflicts.map(c => c.type).join(', ')}`,
      recommendations: this.generateRecommendations(conflicts),
    };

    return result;
  }

  /**
   * Detect overlapping tasks in the same room
   */
  private detectOverlappingTasks(scheduledTasks: ScheduledTask[]): WorkflowConflict[] {
    const conflicts: WorkflowConflict[] = [];
    const tasksByRoom = new Map<string, ScheduledTask[]>();

    for (const task of scheduledTasks) {
      const room = task.room || 'unassigned';
      if (!tasksByRoom.has(room)) {
        tasksByRoom.set(room, []);
      }
      tasksByRoom.get(room)!.push(task);
    }

    for (const [room, tasks] of tasksByRoom) {
      for (let i = 0; i < tasks.length; i++) {
        for (let j = i + 1; j < tasks.length; j++) {
          const t1 = tasks[i];
          const t2 = tasks[j];
          const start1 = new Date(t1.scheduledStart).getTime();
          const end1 = new Date(t1.scheduledEnd).getTime();
          const start2 = new Date(t2.scheduledStart).getTime();
          const end2 = new Date(t2.scheduledEnd).getTime();

          if (start1 < end2 && start2 < end1) {
            conflicts.push({
              conflictId: `overlap-${i}-${j}`,
              type: 'overlapping-tasks',
              affectedTaskIds: [t1.taskId, t2.taskId],
              severity: t1.type === 'substrate-prep' || t2.type === 'substrate-prep' ? 'critical' : 'warning',
              description: `Tasks "${t1.type}" and "${t2.type}" overlap in ${room}`,
              recommendedAction: `Reschedule one task to avoid overlap (e.g., move ${t2.type} later)`,
            });
          }
        }
      }
    }

    return conflicts;
  }

  /**
   * Detect species incompatibility in shared spaces
   */
  private detectSpeciesIncompatibility(scheduledTasks: ScheduledTask[]): WorkflowConflict[] {
    const conflicts: WorkflowConflict[] = [];
    const incompatiblePairs: Set<string> = new Set([
      'reishi-oyster', // medicinal vs culinary
      'oyster-chaga', // environmental needs differ
    ]);

    const activeTasks = new Map<string, ScheduledTask[]>();

    for (const task of scheduledTasks) {
      const day = task.scheduledStart.split('T')[0];
      if (!activeTasks.has(day)) {
        activeTasks.set(day, []);
      }
      activeTasks.get(day)!.push(task);
    }

    for (const [day, tasks] of activeTasks) {
      const speciesSet = new Set<string>();
      const tasksBySpecies = new Map<string, ScheduledTask[]>();

      for (const task of tasks) {
        if (task.species && (task.type === 'incubation-transition' || task.type === 'fruiting-transition')) {
          speciesSet.add(task.species);
          if (!tasksBySpecies.has(task.species)) {
            tasksBySpecies.set(task.species, []);
          }
          tasksBySpecies.get(task.species)!.push(task);
        }
      }

      const speciesArray = Array.from(speciesSet);
      for (let i = 0; i < speciesArray.length; i++) {
        for (let j = i + 1; j < speciesArray.length; j++) {
          const pair = `${speciesArray[i]}-${speciesArray[j]}`;
          const reversePair = `${speciesArray[j]}-${speciesArray[i]}`;

          if (incompatiblePairs.has(pair) || incompatiblePairs.has(reversePair)) {
            conflicts.push({
              conflictId: `species-incomp-${i}-${j}`,
              type: 'species-incompatibility',
              affectedTaskIds: [
                ...(tasksBySpecies.get(speciesArray[i]) || []).map(t => t.taskId),
                ...(tasksBySpecies.get(speciesArray[j]) || []).map(t => t.taskId),
              ],
              severity: 'warning',
              description: `Species "${speciesArray[i]}" and "${speciesArray[j]}" may have environmental incompatibility on ${day}`,
              recommendedAction: `Isolate in separate rooms or stagger by 5+ days`,
            });
          }
        }
      }
    }

    return conflicts;
  }

  /**
   * Detect substrate preparation bottlenecks
   */
  private detectSubstrateBottlenecks(
    scheduledTasks: ScheduledTask[],
    workflowTasks: WorkflowTask[]
  ): WorkflowConflict[] {
    const conflicts: WorkflowConflict[] = [];
    const prepTasks = scheduledTasks.filter(t => t.type === 'substrate-prep');

    if (prepTasks.length > 1) {
      // Check if prep tasks are clustered too close
      const prepTimes = prepTasks.map(t => new Date(t.scheduledStart).getTime());
      prepTimes.sort((a, b) => a - b);

      for (let i = 0; i < prepTimes.length - 1; i++) {
        const timeDiffDays = (prepTimes[i + 1] - prepTimes[i]) / (1000 * 3600 * 24);
        if (timeDiffDays < 1) {
          conflicts.push({
            conflictId: `substrate-cluster-${i}`,
            type: 'substrate-bottleneck',
            affectedTaskIds: [prepTasks[i].taskId, prepTasks[i + 1].taskId],
            severity: 'warning',
            description: `Substrate prep tasks clustered within ${timeDiffDays.toFixed(1)} days; may exceed sterilization capacity`,
            recommendedAction: `Space substrate prep tasks at least 1 day apart`,
          });
        }
      }
    }

    return conflicts;
  }

  /**
   * Detect harvest clustering overload
   */
  private detectHarvestClustering(scheduledTasks: ScheduledTask[]): WorkflowConflict[] {
    const conflicts: WorkflowConflict[] = [];
    const harvestTasks = scheduledTasks.filter(t => t.type === 'harvest');

    if (harvestTasks.length > 1) {
      const harvestDays = new Map<string, number>();
      for (const task of harvestTasks) {
        const day = task.scheduledStart.split('T')[0];
        harvestDays.set(day, (harvestDays.get(day) || 0) + task.assignedLabor);
      }

      for (const [day, totalHours] of harvestDays) {
        if (totalHours > 16) {
          // More than 2 8-hour shifts worth
          conflicts.push({
            conflictId: `harvest-cluster-${day}`,
            type: 'harvest-clustering',
            affectedTaskIds: harvestTasks
              .filter(t => t.scheduledStart.split('T')[0] === day)
              .map(t => t.taskId),
            severity: 'warning',
            description: `Harvest clustering on ${day}: ${totalHours.toFixed(1)} labor hours (exceeds 16-hour capacity)`,
            recommendedAction: `Spread harvests across multiple days`,
          });
        }
      }
    }

    return conflicts;
  }

  /**
   * Detect labor hour violations
   */
  private detectLaborOverload(
    scheduledTasks: ScheduledTask[],
    request: WorkflowRequest
  ): WorkflowConflict[] {
    const conflicts: WorkflowConflict[] = [];
    const dailyLabor = new Map<string, number>();

    for (const task of scheduledTasks) {
      const day = task.scheduledStart.split('T')[0];
      dailyLabor.set(day, (dailyLabor.get(day) || 0) + task.assignedLabor);
    }

    for (const [day, hours] of dailyLabor) {
      const maxDailyHours = request.constraintSet.laborHoursAvailable;
      if (hours > maxDailyHours * 1.25) {
        conflicts.push({
          conflictId: `labor-overload-${day}`,
          type: 'labor-overload',
          affectedTaskIds: scheduledTasks
            .filter(t => t.scheduledStart.split('T')[0] === day)
            .map(t => t.taskId),
          severity: hours > maxDailyHours * 1.5 ? 'critical' : 'warning',
          description: `Labor overload on ${day}: ${hours.toFixed(1)} hours required, but only ${maxDailyHours} available`,
          recommendedAction: `Redistribute tasks to adjacent days or increase labor availability`,
        });
      }
    }

    return conflicts;
  }

  /**
   * Detect equipment over-allocation
   */
  private detectEquipmentConflicts(
    scheduledTasks: ScheduledTask[],
    request: WorkflowRequest
  ): WorkflowConflict[] {
    const conflicts: WorkflowConflict[] = [];

    for (const equipment of request.constraintSet.equipmentAvailable) {
      const equipmentTasks = scheduledTasks.filter(t => t.assignedEquipment?.includes(equipment));

      // Check for overlapping use
      for (let i = 0; i < equipmentTasks.length; i++) {
        for (let j = i + 1; j < equipmentTasks.length; j++) {
          const t1 = equipmentTasks[i];
          const t2 = equipmentTasks[j];
          const start1 = new Date(t1.scheduledStart).getTime();
          const end1 = new Date(t1.scheduledEnd).getTime();
          const start2 = new Date(t2.scheduledStart).getTime();
          const end2 = new Date(t2.scheduledEnd).getTime();

          if (start1 < end2 && start2 < end1) {
            conflicts.push({
              conflictId: `equip-conflict-${equipment}-${i}-${j}`,
              type: 'equipment-over-allocation',
              affectedTaskIds: [t1.taskId, t2.taskId],
              severity: 'critical',
              description: `Equipment "${equipment}" allocated to overlapping tasks "${t1.type}" and "${t2.type}"`,
              recommendedAction: `Reschedule one task or add another instance of the equipment`,
            });
          }
        }
      }
    }

    return conflicts;
  }

  /**
   * Detect contamination-risk scheduling conflicts
   */
  private detectContaminationRisks(scheduledTasks: ScheduledTask[]): WorkflowConflict[] {
    const conflicts: WorkflowConflict[] = [];

    // High-risk factors: cleaning tasks too far apart
    const cleaningTasks = scheduledTasks.filter(t => t.type === 'cleaning');
    const nonCleaningTasks = scheduledTasks.filter(t => t.type !== 'cleaning');

    if (cleaningTasks.length === 0 && nonCleaningTasks.length > 0) {
      conflicts.push({
        conflictId: 'no-cleaning',
        type: 'contamination-risk',
        affectedTaskIds: nonCleaningTasks.map(t => t.taskId),
        severity: 'critical',
        description: 'No cleaning tasks scheduled; high contamination risk',
        recommendedAction: 'Add cleaning and sanitization tasks after each harvest or every 7 days',
      });
    }

    // Check spacing between cleaning tasks
    if (cleaningTasks.length > 0) {
      const cleaningTimes = cleaningTasks.map(t => new Date(t.scheduledStart).getTime()).sort((a, b) => a - b);

      for (let i = 0; i < cleaningTimes.length - 1; i++) {
        const daysBetween = (cleaningTimes[i + 1] - cleaningTimes[i]) / (1000 * 3600 * 24);
        if (daysBetween > 14) {
          conflicts.push({
            conflictId: `cleaning-spacing-${i}`,
            type: 'contamination-risk',
            affectedTaskIds: cleaningTasks.map(t => t.taskId),
            severity: 'warning',
            description: `Cleaning tasks spaced ${daysBetween.toFixed(0)} days apart; exceeds 14-day maintenance window`,
            recommendedAction: 'Schedule cleaning more frequently (every 7-10 days)',
          });
        }
      }
    }

    return conflicts;
  }

  /**
   * Generate recommendations based on conflicts
   */
  private generateRecommendations(conflicts: WorkflowConflict[]): string[] {
    const recommendations = new Set<string>();

    for (const conflict of conflicts) {
      switch (conflict.type) {
        case 'overlapping-tasks':
          recommendations.add('Reschedule overlapping tasks to different time slots');
          break;
        case 'species-incompatibility':
          recommendations.add('Isolate incompatible species in separate growing environments');
          break;
        case 'substrate-bottleneck':
          recommendations.add('Increase sterilization capacity or spread prep work');
          break;
        case 'harvest-clustering':
          recommendations.add('Distribute harvests across multiple days');
          break;
        case 'labor-overload':
          recommendations.add('Hire temporary labor or extend timeline');
          break;
        case 'equipment-over-allocation':
          recommendations.add('Procure additional equipment or reschedule tasks');
          break;
        case 'contamination-risk':
          recommendations.add('Increase cleaning/maintenance frequency');
          break;
        case 'dependency-violation':
          recommendations.add('Review task dependencies and correct sequencing');
          break;
      }
    }

    return Array.from(recommendations);
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const conflictDetector = new ConflictDetector();
