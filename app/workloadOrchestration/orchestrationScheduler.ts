/**
 * ORCHESTRATION SCHEDULER
 * Phase 57: Workload Orchestration & Scheduling Engine
 * 
 * Sequences tasks based on severity, category, operator availability,
 * capacity windows, SLA deadlines, workload balance.
 * 
 * NO GENERATIVE AI. NO PREDICTIONS. NO SYNTHETIC WORKLOADS.
 */

import {
  OrchestrationSchedule,
  OrchestrationSlot,
  OrchestrationConflict,
  OrchestrationRecommendation,
  OrchestrationCategory,
  OrchestrationPriority,
  OrchestrationConflictType,
  TaskInput,
  AlertInput,
  OperatorAvailability,
  CapacityWindowInput,
} from './orchestrationTypes';

// ============================================================================
// ORCHESTRATION SCHEDULER
// ============================================================================

export class OrchestrationScheduler {
  // ==========================================================================
  // SCHEDULE GENERATION
  // ==========================================================================

  /**
   * Generate orchestration schedule
   */
  generateSchedule(
    tasks: TaskInput[],
    alerts: AlertInput[],
    operators: OperatorAvailability[],
    capacityWindows: CapacityWindowInput[],
    timeRange: { start: string; end: string },
    scope: { tenantId: string; facilityId?: string; federationId?: string },
    options: {
      optimizeForCapacity?: boolean;
      optimizeForSLA?: boolean;
      balanceWorkload?: boolean;
      respectCapacityWindows?: boolean;
    }
  ): OrchestrationSchedule {
    const scheduleId = `schedule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Step 1: Collect all work items
    const workItems = this.collectWorkItems(tasks, alerts);
    
    // Step 2: Sort by priority and SLA
    const sortedItems = this.sortWorkItems(workItems, options);
    
    // Step 3: Generate slots
    const slots = this.generateSlots(sortedItems, operators, capacityWindows, timeRange, options);
    
    // Step 4: Detect conflicts
    const conflicts = this.detectConflicts(slots, operators, capacityWindows);
    
    // Step 5: Generate recommendations
    const recommendations = this.generateRecommendations(slots, conflicts, operators, capacityWindows);
    
    // Step 6: Calculate summaries
    const operatorSummary = this.calculateOperatorSummary(slots, operators);
    const categorySummary = this.calculateCategorySummary(slots);
    
    const durationHours = (new Date(timeRange.end).getTime() - new Date(timeRange.start).getTime()) / (1000 * 60 * 60);
    
    return {
      scheduleId,
      scope,
      timeRange: {
        start: timeRange.start,
        end: timeRange.end,
        durationHours,
      },
      slots,
      conflicts,
      recommendations,
      operatorSummary,
      categorySummary,
      generatedAt: new Date().toISOString(),
      generatedBy: 'orchestration-scheduler',
      validUntil: new Date(Date.now() + 3600000).toISOString(), // 1 hour
    };
  }

  // ==========================================================================
  // WORK ITEM COLLECTION
  // ==========================================================================

  private collectWorkItems(tasks: TaskInput[], alerts: AlertInput[]): Array<{
    id: string;
    category: OrchestrationCategory;
    priority: OrchestrationPriority;
    description: string;
    durationMinutes: number;
    slaDeadline?: string;
    assignedOperatorId?: string;
    scope: { tenantId: string; facilityId?: string; federationId?: string };
  }> {
    const items: Array<{
      id: string;
      category: OrchestrationCategory;
      priority: OrchestrationPriority;
      description: string;
      durationMinutes: number;
      slaDeadline?: string;
      assignedOperatorId?: string;
      scope: { tenantId: string; facilityId?: string; federationId?: string };
    }> = [];
    
    // Add tasks
    for (const task of tasks) {
      items.push({
        id: task.taskId,
        category: 'task-scheduling',
        priority: task.priority,
        description: task.description,
        durationMinutes: task.estimatedDurationMinutes,
        slaDeadline: task.slaDeadline,
        assignedOperatorId: task.assignedOperatorId,
        scope: task.scope,
      });
    }
    
    // Add alerts requiring follow-up
    for (const alert of alerts) {
      if (alert.requiresFollowUp) {
        items.push({
          id: alert.alertId,
          category: 'alert-follow-up',
          priority: alert.severity,
          description: alert.description,
          durationMinutes: alert.estimatedResolutionMinutes,
          scope: alert.scope,
        });
      }
    }
    
    return items;
  }

  // ==========================================================================
  // WORK ITEM SORTING
  // ==========================================================================

  private sortWorkItems(
    items: Array<{
      id: string;
      category: OrchestrationCategory;
      priority: OrchestrationPriority;
      description: string;
      durationMinutes: number;
      slaDeadline?: string;
      assignedOperatorId?: string;
      scope: { tenantId: string; facilityId?: string; federationId?: string };
    }>,
    options: {
      optimizeForCapacity?: boolean;
      optimizeForSLA?: boolean;
      balanceWorkload?: boolean;
      respectCapacityWindows?: boolean;
    }
  ): typeof items {
    return items.sort((a, b) => {
      // Priority 1: SLA deadline (if optimizing for SLA)
      if (options.optimizeForSLA) {
        if (a.slaDeadline && b.slaDeadline) {
          const aDeadline = new Date(a.slaDeadline).getTime();
          const bDeadline = new Date(b.slaDeadline).getTime();
          if (aDeadline !== bDeadline) return aDeadline - bDeadline;
        }
        if (a.slaDeadline && !b.slaDeadline) return -1;
        if (!a.slaDeadline && b.slaDeadline) return 1;
      }
      
      // Priority 2: Priority level
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      const aPriority = priorityOrder[a.priority];
      const bPriority = priorityOrder[b.priority];
      if (aPriority !== bPriority) return aPriority - bPriority;
      
      // Priority 3: Duration (shorter first for better packing)
      if (options.optimizeForCapacity) {
        return a.durationMinutes - b.durationMinutes;
      }
      
      return 0;
    });
  }

  // ==========================================================================
  // SLOT GENERATION
  // ==========================================================================

  private generateSlots(
    workItems: Array<{
      id: string;
      category: OrchestrationCategory;
      priority: OrchestrationPriority;
      description: string;
      durationMinutes: number;
      slaDeadline?: string;
      assignedOperatorId?: string;
      scope: { tenantId: string; facilityId?: string; federationId?: string };
    }>,
    operators: OperatorAvailability[],
    capacityWindows: CapacityWindowInput[],
    timeRange: { start: string; end: string },
    options: {
      optimizeForCapacity?: boolean;
      optimizeForSLA?: boolean;
      balanceWorkload?: boolean;
      respectCapacityWindows?: boolean;
    }
  ): OrchestrationSlot[] {
    const slots: OrchestrationSlot[] = [];
    
    // Track operator workload
    const operatorWorkload: Record<string, {
      currentTime: Date;
      totalMinutes: number;
      utilization: number;
    }> = {};
    
    for (const operator of operators) {
      operatorWorkload[operator.operatorId] = {
        currentTime: new Date(operator.availableFrom),
        totalMinutes: 0,
        utilization: operator.currentWorkload,
      };
    }
    
    // Schedule each work item
    for (const item of workItems) {
      // Find best operator
      const operator = this.findBestOperator(
        item,
        operators,
        operatorWorkload,
        capacityWindows,
        options
      );
      
      if (!operator) continue; // Skip if no operator available
      
      // Determine start time
      const startTime = new Date(operatorWorkload[operator.operatorId].currentTime);
      const endTime = new Date(startTime.getTime() + item.durationMinutes * 60000);
      
      // Check if within capacity window
      const capacityWindow = this.findCapacityWindow(startTime, endTime, capacityWindows);
      const withinCapacityWindow = capacityWindow !== null && capacityWindow.riskLevel !== 'critical';
      
      // Calculate capacity utilization
      const totalAvailableMinutes = (new Date(operator.availableUntil).getTime() - new Date(operator.availableFrom).getTime()) / 60000;
      const utilization = ((operatorWorkload[operator.operatorId].totalMinutes + item.durationMinutes) / totalAvailableMinutes) * 100;
      
      // Calculate SLA buffer
      const slaBuffer = item.slaDeadline
        ? (new Date(item.slaDeadline).getTime() - endTime.getTime()) / 60000
        : undefined;
      
      // Create slot
      const slot: OrchestrationSlot = {
        slotId: `slot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        durationMinutes: item.durationMinutes,
        operatorId: operator.operatorId,
        operatorName: operator.operatorName,
        category: item.category,
        workItemId: item.id,
        workItemDescription: item.description,
        priority: item.priority,
        slaDeadline: item.slaDeadline,
        slaBuffer,
        capacityUtilization: utilization,
        withinCapacityWindow,
        scheduledAt: new Date().toISOString(),
        scheduledBy: 'orchestration-scheduler',
      };
      
      slots.push(slot);
      
      // Update operator workload
      operatorWorkload[operator.operatorId].currentTime = endTime;
      operatorWorkload[operator.operatorId].totalMinutes += item.durationMinutes;
      operatorWorkload[operator.operatorId].utilization = utilization;
    }
    
    return slots;
  }

  // ==========================================================================
  // OPERATOR SELECTION
  // ==========================================================================

  private findBestOperator(
    item: {
      id: string;
      category: OrchestrationCategory;
      priority: OrchestrationPriority;
      description: string;
      durationMinutes: number;
      slaDeadline?: string;
      assignedOperatorId?: string;
      scope: { tenantId: string; facilityId?: string; federationId?: string };
    },
    operators: OperatorAvailability[],
    operatorWorkload: Record<string, {
      currentTime: Date;
      totalMinutes: number;
      utilization: number;
    }>,
    capacityWindows: CapacityWindowInput[],
    options: {
      optimizeForCapacity?: boolean;
      optimizeForSLA?: boolean;
      balanceWorkload?: boolean;
      respectCapacityWindows?: boolean;
    }
  ): OperatorAvailability | null {
    // If assigned, use that operator
    if (item.assignedOperatorId) {
      const assigned = operators.find(op => op.operatorId === item.assignedOperatorId);
      if (assigned) return assigned;
    }
    
    // Score each operator
    const scores = operators.map(operator => {
      let score = 100;
      
      // Check tenant match
      if (operator.scope.tenantId !== item.scope.tenantId) {
        return { operator, score: -1 }; // Invalid
      }
      
      // Penalize high utilization
      const workload = operatorWorkload[operator.operatorId];
      if (workload.utilization > 80) score -= 40;
      else if (workload.utilization > 60) score -= 20;
      
      // Favor balanced workload
      if (options.balanceWorkload) {
        const avgUtilization = Object.values(operatorWorkload).reduce((sum, w) => sum + w.utilization, 0) / operators.length;
        const deviation = Math.abs(workload.utilization - avgUtilization);
        score -= deviation * 0.5;
      }
      
      // Check capacity window
      if (options.respectCapacityWindows) {
        const startTime = workload.currentTime;
        const endTime = new Date(startTime.getTime() + item.durationMinutes * 60000);
        const window = this.findCapacityWindow(startTime, endTime, capacityWindows);
        
        if (window) {
          if (window.riskLevel === 'critical') score -= 50;
          else if (window.riskLevel === 'high') score -= 30;
          else if (window.riskLevel === 'medium') score -= 10;
        }
      }
      
      // Check SLA feasibility
      if (item.slaDeadline) {
        const startTime = workload.currentTime;
        const endTime = new Date(startTime.getTime() + item.durationMinutes * 60000);
        const deadline = new Date(item.slaDeadline);
        
        if (endTime > deadline) {
          score -= 100; // Cannot meet SLA
        } else {
          const buffer = (deadline.getTime() - endTime.getTime()) / 60000;
          if (buffer < 30) score -= 20; // Tight SLA
        }
      }
      
      return { operator, score };
    });
    
    // Find best operator
    const validOperators = scores.filter(s => s.score > 0);
    if (validOperators.length === 0) return null;
    
    validOperators.sort((a, b) => b.score - a.score);
    return validOperators[0].operator;
  }

  // ==========================================================================
  // CAPACITY WINDOW LOOKUP
  // ==========================================================================

  private findCapacityWindow(
    startTime: Date,
    endTime: Date,
    capacityWindows: CapacityWindowInput[]
  ): CapacityWindowInput | null {
    for (const window of capacityWindows) {
      const windowStart = new Date(window.windowStart);
      const windowEnd = new Date(window.windowEnd);
      
      // Check if slot overlaps with window
      if (startTime < windowEnd && endTime > windowStart) {
        return window;
      }
    }
    
    return null;
  }

  // ==========================================================================
  // CONFLICT DETECTION
  // ==========================================================================

  detectConflicts(
    slots: OrchestrationSlot[],
    operators: OperatorAvailability[],
    capacityWindows: CapacityWindowInput[]
  ): OrchestrationConflict[] {
    const conflicts: OrchestrationConflict[] = [];
    
    // Check operator overload
    const overloadConflicts = this.detectOperatorOverload(slots, operators);
    conflicts.push(...overloadConflicts);
    
    // Check SLA collisions
    const slaConflicts = this.detectSLACollisions(slots);
    conflicts.push(...slaConflicts);
    
    // Check over-capacity
    const capacityConflicts = this.detectOverCapacity(slots, operators);
    conflicts.push(...capacityConflicts);
    
    // Check schedule overlaps
    const overlapConflicts = this.detectScheduleOverlaps(slots);
    conflicts.push(...overlapConflicts);
    
    return conflicts;
  }

  private detectOperatorOverload(
    slots: OrchestrationSlot[],
    operators: OperatorAvailability[]
  ): OrchestrationConflict[] {
    const conflicts: OrchestrationConflict[] = [];
    
    // Group slots by operator
    const slotsByOperator: Record<string, OrchestrationSlot[]> = {};
    for (const slot of slots) {
      if (!slotsByOperator[slot.operatorId]) {
        slotsByOperator[slot.operatorId] = [];
      }
      slotsByOperator[slot.operatorId].push(slot);
    }
    
    // Check each operator
    for (const operator of operators) {
      const operatorSlots = slotsByOperator[operator.operatorId] || [];
      const totalMinutes = operatorSlots.reduce((sum, s) => sum + s.durationMinutes, 0);
      const availableMinutes = (new Date(operator.availableUntil).getTime() - new Date(operator.availableFrom).getTime()) / 60000;
      const utilization = (totalMinutes / availableMinutes) * 100;
      
      if (utilization > 100) {
        conflicts.push({
          conflictId: `conflict-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          conflictType: 'operator-overload',
          severity: 'critical',
          affectedSlots: operatorSlots.map(s => s.slotId),
          description: `Operator ${operator.operatorName || operator.operatorId} overloaded at ${utilization.toFixed(0)}% capacity`,
          impactAnalysis: {
            operatorsAffected: [operator.operatorId],
            tasksDelayed: Math.ceil((totalMinutes - availableMinutes) / 30), // Estimate
            slaRisk: 80,
            capacityOverage: utilization - 100,
          },
          resolutionOptions: [
            'Redistribute tasks to other operators',
            'Extend operator availability',
            'Defer low-priority tasks',
          ],
          recommendedAction: 'Redistribute tasks to other operators',
          detectedAt: new Date().toISOString(),
        });
      }
    }
    
    return conflicts;
  }

  private detectSLACollisions(slots: OrchestrationSlot[]): OrchestrationConflict[] {
    const conflicts: OrchestrationConflict[] = [];
    
    const slaSlots = slots.filter(s => s.slaDeadline && s.slaBuffer !== undefined && s.slaBuffer < 0);
    
    if (slaSlots.length > 0) {
      conflicts.push({
        conflictId: `conflict-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        conflictType: 'sla-collision',
        severity: 'critical',
        affectedSlots: slaSlots.map(s => s.slotId),
        description: `${slaSlots.length} tasks scheduled after SLA deadline`,
        impactAnalysis: {
          operatorsAffected: [...new Set(slaSlots.map(s => s.operatorId))],
          tasksDelayed: slaSlots.length,
          slaRisk: 100,
          capacityOverage: 0,
        },
        resolutionOptions: [
          'Reschedule tasks earlier',
          'Assign to faster operators',
          'Escalate for immediate handling',
        ],
        recommendedAction: 'Reschedule tasks earlier',
        detectedAt: new Date().toISOString(),
      });
    }
    
    return conflicts;
  }

  private detectOverCapacity(
    slots: OrchestrationSlot[],
    operators: OperatorAvailability[]
  ): OrchestrationConflict[] {
    const conflicts: OrchestrationConflict[] = [];
    
    const overCapacitySlots = slots.filter(s => s.capacityUtilization > 90);
    
    if (overCapacitySlots.length > 0) {
      conflicts.push({
        conflictId: `conflict-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        conflictType: 'over-capacity',
        severity: 'high',
        affectedSlots: overCapacitySlots.map(s => s.slotId),
        description: `${overCapacitySlots.length} slots exceed recommended capacity`,
        impactAnalysis: {
          operatorsAffected: [...new Set(overCapacitySlots.map(s => s.operatorId))],
          tasksDelayed: 0,
          slaRisk: 60,
          capacityOverage: Math.max(...overCapacitySlots.map(s => s.capacityUtilization - 90)),
        },
        resolutionOptions: [
          'Rebalance workload across operators',
          'Defer non-critical tasks',
          'Add operator capacity',
        ],
        recommendedAction: 'Rebalance workload across operators',
        detectedAt: new Date().toISOString(),
      });
    }
    
    return conflicts;
  }

  private detectScheduleOverlaps(slots: OrchestrationSlot[]): OrchestrationConflict[] {
    const conflicts: OrchestrationConflict[] = [];
    
    // Group by operator
    const slotsByOperator: Record<string, OrchestrationSlot[]> = {};
    for (const slot of slots) {
      if (!slotsByOperator[slot.operatorId]) {
        slotsByOperator[slot.operatorId] = [];
      }
      slotsByOperator[slot.operatorId].push(slot);
    }
    
    // Check for overlaps within each operator
    for (const operatorId in slotsByOperator) {
      const operatorSlots = slotsByOperator[operatorId];
      
      for (let i = 0; i < operatorSlots.length; i++) {
        for (let j = i + 1; j < operatorSlots.length; j++) {
          const slot1 = operatorSlots[i];
          const slot2 = operatorSlots[j];
          
          const start1 = new Date(slot1.startTime).getTime();
          const end1 = new Date(slot1.endTime).getTime();
          const start2 = new Date(slot2.startTime).getTime();
          const end2 = new Date(slot2.endTime).getTime();
          
          if (start1 < end2 && start2 < end1) {
            conflicts.push({
              conflictId: `conflict-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              conflictType: 'schedule-overlap',
              severity: 'high',
              affectedSlots: [slot1.slotId, slot2.slotId],
              description: `Schedule overlap for operator ${operatorId}`,
              impactAnalysis: {
                operatorsAffected: [operatorId],
                tasksDelayed: 1,
                slaRisk: 50,
                capacityOverage: 0,
              },
              resolutionOptions: [
                'Reschedule one task',
                'Assign one task to different operator',
              ],
              recommendedAction: 'Reschedule one task',
              detectedAt: new Date().toISOString(),
            });
          }
        }
      }
    }
    
    return conflicts;
  }

  // ==========================================================================
  // RECOMMENDATIONS
  // ==========================================================================

  generateRecommendations(
    slots: OrchestrationSlot[],
    conflicts: OrchestrationConflict[],
    operators: OperatorAvailability[],
    capacityWindows: CapacityWindowInput[]
  ): OrchestrationRecommendation[] {
    const recommendations: OrchestrationRecommendation[] = [];
    
    // Recommend workload rebalancing
    const rebalanceRec = this.recommendRebalancing(slots, operators);
    if (rebalanceRec) recommendations.push(rebalanceRec);
    
    // Recommend deferring low-priority tasks
    const deferRec = this.recommendDeferring(slots, conflicts);
    if (deferRec) recommendations.push(deferRec);
    
    // Recommend capacity optimization
    const optimizeRec = this.recommendOptimization(slots, capacityWindows);
    if (optimizeRec) recommendations.push(optimizeRec);
    
    return recommendations;
  }

  private recommendRebalancing(
    slots: OrchestrationSlot[],
    operators: OperatorAvailability[]
  ): OrchestrationRecommendation | null {
    // Calculate utilization variance
    const utilizationByOperator: Record<string, number> = {};
    
    for (const operator of operators) {
      const operatorSlots = slots.filter(s => s.operatorId === operator.operatorId);
      const totalMinutes = operatorSlots.reduce((sum, s) => sum + s.durationMinutes, 0);
      const availableMinutes = (new Date(operator.availableUntil).getTime() - new Date(operator.availableFrom).getTime()) / 60000;
      utilizationByOperator[operator.operatorId] = (totalMinutes / availableMinutes) * 100;
    }
    
    const utilizations = Object.values(utilizationByOperator);
    const avgUtilization = utilizations.reduce((sum, u) => sum + u, 0) / utilizations.length;
    const variance = utilizations.reduce((sum, u) => sum + Math.pow(u - avgUtilization, 2), 0) / utilizations.length;
    
    if (variance > 400) { // High variance (stddev > 20%)
      const overutilized = Object.entries(utilizationByOperator).filter(([, u]) => u > avgUtilization + 15);
      const underutilized = Object.entries(utilizationByOperator).filter(([, u]) => u < avgUtilization - 15);
      
      if (overutilized.length > 0 && underutilized.length > 0) {
        return {
          recommendationId: `rec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          recommendationType: 'rebalance',
          scope: slots[0]?.operatorId ? { tenantId: 'tenant-default' } : { tenantId: 'tenant-default' },
          description: 'Workload imbalance detected across operators',
          rationale: `Utilization variance of ${variance.toFixed(0)} indicates uneven distribution`,
          expectedBenefit: {
            workloadBalance: 25,
            capacityImprovement: 10,
          },
          suggestedActions: [
            `Move tasks from ${overutilized[0][0]} to ${underutilized[0][0]}`,
            'Review operator specializations and task assignments',
          ],
          affectedSlots: slots.filter(s => overutilized.some(([id]) => id === s.operatorId)).map(s => s.slotId),
          generatedAt: new Date().toISOString(),
          confidenceLevel: 'high',
        };
      }
    }
    
    return null;
  }

  private recommendDeferring(
    slots: OrchestrationSlot[],
    conflicts: OrchestrationConflict[]
  ): OrchestrationRecommendation | null {
    const lowPrioritySlots = slots.filter(s => s.priority === 'low' && !s.slaDeadline);
    
    if (conflicts.length > 0 && lowPrioritySlots.length > 0) {
      return {
        recommendationId: `rec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        recommendationType: 'defer',
        scope: { tenantId: 'tenant-default' },
        description: 'Defer low-priority tasks to reduce conflicts',
        rationale: `${conflicts.length} conflicts detected with ${lowPrioritySlots.length} low-priority tasks available for deferral`,
        expectedBenefit: {
          capacityImprovement: 15,
          slaImprovement: 10,
        },
        suggestedActions: [
          `Defer ${Math.min(5, lowPrioritySlots.length)} low-priority tasks`,
          'Reschedule during low-capacity periods',
        ],
        affectedSlots: lowPrioritySlots.slice(0, 5).map(s => s.slotId),
        generatedAt: new Date().toISOString(),
        confidenceLevel: 'medium',
      };
    }
    
    return null;
  }

  private recommendOptimization(
    slots: OrchestrationSlot[],
    capacityWindows: CapacityWindowInput[]
  ): OrchestrationRecommendation | null {
    const outOfWindowSlots = slots.filter(s => !s.withinCapacityWindow);
    
    if (outOfWindowSlots.length > 5) {
      return {
        recommendationId: `rec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        recommendationType: 'optimize',
        scope: { tenantId: 'tenant-default' },
        description: 'Align schedule with capacity windows',
        rationale: `${outOfWindowSlots.length} tasks scheduled outside optimal capacity windows`,
        expectedBenefit: {
          capacityImprovement: 20,
        },
        suggestedActions: [
          'Reschedule tasks to align with low-risk capacity windows',
          'Review capacity projections for accuracy',
        ],
        affectedSlots: outOfWindowSlots.map(s => s.slotId),
        generatedAt: new Date().toISOString(),
        confidenceLevel: 'high',
      };
    }
    
    return null;
  }

  // ==========================================================================
  // SUMMARIES
  // ==========================================================================

  private calculateOperatorSummary(
    slots: OrchestrationSlot[],
    operators: OperatorAvailability[]
  ): Array<{
    operatorId: string;
    operatorName?: string;
    totalSlots: number;
    totalWorkMinutes: number;
    capacityUtilization: number;
    slaRisk: number;
  }> {
    return operators.map(operator => {
      const operatorSlots = slots.filter(s => s.operatorId === operator.operatorId);
      const totalWorkMinutes = operatorSlots.reduce((sum, s) => sum + s.durationMinutes, 0);
      const availableMinutes = (new Date(operator.availableUntil).getTime() - new Date(operator.availableFrom).getTime()) / 60000;
      const utilization = (totalWorkMinutes / availableMinutes) * 100;
      
      const slaSlots = operatorSlots.filter(s => s.slaDeadline && s.slaBuffer !== undefined && s.slaBuffer < 60);
      const slaRisk = operatorSlots.length > 0 ? (slaSlots.length / operatorSlots.length) * 100 : 0;
      
      return {
        operatorId: operator.operatorId,
        operatorName: operator.operatorName,
        totalSlots: operatorSlots.length,
        totalWorkMinutes,
        capacityUtilization: utilization,
        slaRisk,
      };
    });
  }

  private calculateCategorySummary(
    slots: OrchestrationSlot[]
  ): Record<OrchestrationCategory, {
    totalSlots: number;
    totalWorkMinutes: number;
    criticalCount: number;
    highCount: number;
  }> {
    const categories: OrchestrationCategory[] = [
      'task-scheduling',
      'alert-follow-up',
      'audit-remediation',
      'drift-remediation',
      'governance-issue',
      'documentation-completeness',
      'simulation-mismatch',
      'capacity-aligned-workload',
    ];
    
    const summary: Record<OrchestrationCategory, {
      totalSlots: number;
      totalWorkMinutes: number;
      criticalCount: number;
      highCount: number;
    }> = {} as any;
    
    for (const category of categories) {
      const categorySlots = slots.filter(s => s.category === category);
      summary[category] = {
        totalSlots: categorySlots.length,
        totalWorkMinutes: categorySlots.reduce((sum, s) => sum + s.durationMinutes, 0),
        criticalCount: categorySlots.filter(s => s.priority === 'critical').length,
        highCount: categorySlots.filter(s => s.priority === 'high').length,
      };
    }
    
    return summary;
  }
}
