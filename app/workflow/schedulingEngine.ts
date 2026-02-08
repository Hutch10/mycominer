// Phase 19: Scheduling Engine
// Converts workflow tasks into time-sequenced schedules with support for multi-room/facility coordination

'use client';

import {
  WorkflowTask,
  ScheduleProposal,
  ScheduledTask,
  WorkflowRequest,
} from '@/app/workflow/workflowTypes';

// ============================================================================
// SCHEDULING ENGINE
// ============================================================================

class SchedulingEngine {
  private proposalCounter = 0;

  /**
   * Create a schedule proposal from workflow tasks
   * Deterministic: uses task dependencies and priority to sequence tasks
   */
  createScheduleProposal(
    tasks: WorkflowTask[],
    request: WorkflowRequest,
    startDate: string
  ): ScheduleProposal {
    const scheduledTasks: ScheduledTask[] = [];
    const taskScheduleMap = new Map<string, ScheduledTask>();
    
    // Build dependency graph
    const taskMap = new Map(tasks.map(t => [t.taskId, t]));
    const dependencyGraph = this.buildDependencyGraph(tasks);

    // Topological sort for task ordering
    const sortedTaskIds = this.topologicalSort(dependencyGraph, tasks.map(t => t.taskId));

    // Convert ISO date to start scheduling
    const baseTime = new Date(startDate + 'T06:00:00');
    let currentTime = new Date(baseTime);

    // Schedule tasks based on dependencies and priority
    for (const taskId of sortedTaskIds) {
      const task = taskMap.get(taskId);
      if (!task) continue;

      // Find earliest available time (after all dependencies complete)
      let taskStartTime = new Date(currentTime);
      if (task.dependsOn && task.dependsOn.length > 0) {
        for (const depId of task.dependsOn) {
          const depTask = taskScheduleMap.get(depId);
          if (depTask && new Date(depTask.scheduledEnd) > taskStartTime) {
            taskStartTime = new Date(depTask.scheduledEnd);
          }
        }
      }

      const taskEndTime = new Date(taskStartTime.getTime() + task.durationHours * 3600000);

      const scheduledTask: ScheduledTask = {
        taskId,
        type: task.type,
        scheduledStart: taskStartTime.toISOString(),
        scheduledEnd: taskEndTime.toISOString(),
        room: task.room,
        facility: task.facility,
        species: task.species,
        assignedLabor: task.laborHours,
        assignedEquipment: task.equipment,
        sequenceOrder: scheduledTasks.length + 1,
      };

      scheduledTasks.push(scheduledTask);
      taskScheduleMap.set(taskId, scheduledTask);
      currentTime = new Date(taskEndTime);
    }

    // Calculate metrics
    const firstTask = scheduledTasks[0];
    const lastTask = scheduledTasks[scheduledTasks.length - 1];
    const scheduleDuration =
      firstTask && lastTask
        ? (new Date(lastTask.scheduledEnd).getTime() - new Date(firstTask.scheduledStart).getTime()) /
          (1000 * 3600 * 24)
        : 0;

    const totalLaborHours = scheduledTasks.reduce((sum, t) => sum + t.assignedLabor, 0);
    const estimatedYieldKg = request.harvestTargets.reduce((sum, t) => sum + t.targetYieldKg, 0);

    // Equipment utilization (approximate)
    const equipmentUtilization: Record<string, number> = {};
    request.constraintSet.equipmentAvailable.forEach(eq => {
      const equipmentTasks = scheduledTasks.filter(t => t.assignedEquipment?.includes(eq));
      const utilizedHours = equipmentTasks.reduce((sum, t) => sum + t.assignedLabor, 0);
      equipmentUtilization[eq] = Math.round((utilizedHours / (scheduleDuration * 8)) * 100);
    });

    const proposal: ScheduleProposal = {
      proposalId: `schedule-${++this.proposalCounter}`,
      createdAt: new Date().toISOString(),
      scheduledTasks,
      startDate,
      endDate: lastTask
        ? lastTask.scheduledEnd.split('T')[0]
        : startDate,
      totalDays: Math.ceil(scheduleDuration),
      estimatedYieldKg,
      totalLaborHours,
      equipmentUtilization,
      rationale: `Sequential schedule for ${scheduledTasks.length} tasks over ${Math.ceil(scheduleDuration)} days, ` +
        `targeting ${estimatedYieldKg}kg yield with ${totalLaborHours.toFixed(1)} labor hours`,
      confidence: Math.min(100, 85 + (totalLaborHours / request.constraintSet.laborHoursAvailable > 1.2 ? -15 : 0)),
      riskFactors: this.identifyRiskFactors(scheduledTasks, request),
    };

    return proposal;
  }

  /**
   * Build a dependency graph from workflow tasks
   */
  private buildDependencyGraph(tasks: WorkflowTask[]): Map<string, Set<string>> {
    const graph = new Map<string, Set<string>>();

    for (const task of tasks) {
      graph.set(task.taskId, new Set(task.dependsOn || []));
    }

    return graph;
  }

  /**
   * Topological sort for task sequencing
   */
  private topologicalSort(graph: Map<string, Set<string>>, taskIds: string[]): string[] {
    const visited = new Set<string>();
    const sorted: string[] = [];

    const visit = (taskId: string) => {
      if (visited.has(taskId)) return;
      visited.add(taskId);

      const deps = graph.get(taskId) || new Set();
      for (const dep of deps) {
        visit(dep);
      }

      sorted.push(taskId);
    };

    for (const taskId of taskIds) {
      visit(taskId);
    }

    return sorted;
  }

  /**
   * Identify risk factors in the schedule
   */
  private identifyRiskFactors(scheduledTasks: ScheduledTask[], request: WorkflowRequest): string[] {
    const factors: string[] = [];

    // Check for labor overload
    const dailyLaborMap = new Map<string, number>();
    for (const task of scheduledTasks) {
      const day = task.scheduledStart.split('T')[0];
      dailyLaborMap.set(day, (dailyLaborMap.get(day) || 0) + task.assignedLabor);
    }

    for (const [day, hours] of dailyLaborMap) {
      if (hours > request.constraintSet.laborHoursAvailable * 1.5) {
        factors.push(`Day ${day}: labor overload (${hours.toFixed(1)}h exceeds typical ${request.constraintSet.laborHoursAvailable}h)`);
      }
    }

    // Check for species count in same period
    const activeSpeciesByDay = new Map<string, Set<string>>();
    for (const task of scheduledTasks) {
      const day = task.scheduledStart.split('T')[0];
      if (task.species) {
        if (!activeSpeciesByDay.has(day)) {
          activeSpeciesByDay.set(day, new Set());
        }
        activeSpeciesByDay.get(day)!.add(task.species);
      }
    }

    for (const [day, species] of activeSpeciesByDay) {
      if (species.size > 3) {
        factors.push(`Day ${day}: ${species.size} active species (potential contamination cross-risk)`);
      }
    }

    return factors;
  }

  /**
   * Adjust schedule for multi-room distribution
   */
  distributeAcrossRooms(scheduledTasks: ScheduledTask[], roomCount: number): ScheduledTask[] {
    const adjusted = [...scheduledTasks];
    const roomAssignment = new Map<number, number>();

    for (let i = 0; i < adjusted.length; i++) {
      if (!adjusted[i].room) {
        const roomIndex = i % roomCount;
        adjusted[i].room = `room-${roomIndex + 1}`;
        roomAssignment.set(roomIndex, (roomAssignment.get(roomIndex) || 0) + 1);
      }
    }

    return adjusted;
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const schedulingEngine = new SchedulingEngine();
