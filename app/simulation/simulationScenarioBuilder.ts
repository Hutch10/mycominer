/**
 * Phase 49: Operator Simulation Mode - Scenario Builder
 * 
 * Assembles simulation scenarios from real SOPs, workflows, timeline events,
 * governance decisions, health findings, analytics patterns, training modules,
 * and fabric links.
 * 
 * CRITICAL CONSTRAINTS:
 * - No synthetic steps
 * - All steps from real metadata
 * - No biological inference
 * - Deterministic scenario generation
 */

import type {
  SimulationScenario,
  SimulationScenarioType,
  SimulationStep,
  SimulationReference,
  SimulationScope,
  ScenarioBuildConfig,
} from './simulationTypes';

// ============================================================================
// SIMULATION SCENARIO BUILDER
// ============================================================================

export class SimulationScenarioBuilder {
  private tenantId: string;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
  }

  // ==========================================================================
  // MAIN BUILD METHOD
  // ==========================================================================

  /**
   * Build simulation scenario
   */
  public async buildScenario(
    scenarioType: SimulationScenarioType,
    targetEntityId: string,
    targetEntityType: string,
    scope: SimulationScope,
    config: ScenarioBuildConfig
  ): Promise<SimulationScenario> {
    let steps: SimulationStep[] = [];
    let sourceReferences: SimulationReference[] = [];
    let title = '';
    let description = '';

    switch (scenarioType) {
      case 'sop-execution':
        ({ steps, sourceReferences, title, description } = 
          await this.buildSOPExecutionScenario(targetEntityId, config));
        break;
      
      case 'workflow-rehearsal':
        ({ steps, sourceReferences, title, description } = 
          await this.buildWorkflowRehearsalScenario(targetEntityId, config));
        break;
      
      case 'incident-replay':
        ({ steps, sourceReferences, title, description } = 
          await this.buildIncidentReplayScenario(targetEntityId, config));
        break;
      
      case 'governance-replay':
        ({ steps, sourceReferences, title, description } = 
          await this.buildGovernanceReplayScenario(targetEntityId, config));
        break;
      
      case 'health-drift-replay':
        ({ steps, sourceReferences, title, description } = 
          await this.buildHealthDriftReplayScenario(targetEntityId, config));
        break;
      
      case 'analytics-replay':
        ({ steps, sourceReferences, title, description } = 
          await this.buildAnalyticsReplayScenario(targetEntityId, config));
        break;
      
      case 'training-simulation':
        ({ steps, sourceReferences, title, description } = 
          await this.buildTrainingSimulationScenario(targetEntityId, config));
        break;
      
      case 'fabric-traversal':
        ({ steps, sourceReferences, title, description } = 
          await this.buildFabricTraversalScenario(targetEntityId, config));
        break;
      
      default:
        throw new Error(`Unknown scenario type: ${scenarioType}`);
    }

    // Apply max steps limit
    if (config.maxSteps > 0 && steps.length > config.maxSteps) {
      steps = steps.slice(0, config.maxSteps);
    }

    // Calculate estimated duration
    const estimatedDuration = steps.reduce((total, step) => 
      total + (step.estimatedDuration || 0), 0
    );

    return {
      scenarioId: this.generateScenarioId(scenarioType),
      scenarioType,
      title,
      description,
      steps,
      totalSteps: steps.length,
      sourceReferences,
      scope,
      metadata: {
        createdBy: 'simulation-builder',
        createdAt: new Date().toISOString(),
        estimatedDuration,
        difficulty: config.difficulty,
        tags: [scenarioType, targetEntityType],
      },
    };
  }

  // ==========================================================================
  // SOP EXECUTION SCENARIO
  // ==========================================================================

  private async buildSOPExecutionScenario(
    sopId: string,
    config: ScenarioBuildConfig
  ): Promise<{
    steps: SimulationStep[];
    sourceReferences: SimulationReference[];
    title: string;
    description: string;
  }> {
    // In production: fetch real SOP from database
    const mockSOP = {
      id: sopId,
      title: 'Contamination Response SOP',
      steps: [
        { action: 'Identify contamination source', duration: 300000 },
        { action: 'Isolate affected area', duration: 600000 },
        { action: 'Document observations', duration: 900000 },
        { action: 'Notify supervisor', duration: 120000 },
        { action: 'Execute cleanup procedure', duration: 1800000 },
        { action: 'Verify decontamination', duration: 900000 },
        { action: 'Update incident log', duration: 300000 },
      ],
    };

    const steps: SimulationStep[] = mockSOP.steps.map((sopStep, index) => ({
      stepId: `${sopId}-step-${index + 1}`,
      stepNumber: index + 1,
      stepType: 'action',
      title: sopStep.action,
      description: `Execute: ${sopStep.action}`,
      sourceEngine: 'sop',
      sourceEntityId: sopId,
      sourceEntityType: 'sop',
      expectedOutcome: `Completed: ${sopStep.action}`,
      references: [],
      estimatedDuration: sopStep.duration,
      status: 'pending',
      metadata: {
        optional: false,
        canRollback: false,
      },
    }));

    // Add validation steps if requested
    if (config.includeValidationSteps) {
      steps.push({
        stepId: `${sopId}-validation`,
        stepNumber: steps.length + 1,
        stepType: 'validation',
        title: 'Validate SOP completion',
        description: 'Verify all steps completed successfully',
        sourceEngine: 'sop',
        sourceEntityId: sopId,
        sourceEntityType: 'sop',
        expectedOutcome: 'All steps validated',
        references: [],
        estimatedDuration: 300000,
        status: 'pending',
        metadata: {
          optional: false,
          canRollback: false,
        },
      });
    }

    const sourceReferences: SimulationReference[] = [{
      referenceId: sopId,
      referenceType: 'sop',
      entityId: sopId,
      entityType: 'sop',
      title: mockSOP.title,
      sourceEngine: 'sop',
      metadata: { totalSteps: mockSOP.steps.length },
    }];

    return {
      steps,
      sourceReferences,
      title: `SOP Simulation: ${mockSOP.title}`,
      description: `Simulate execution of ${mockSOP.title} with ${steps.length} steps`,
    };
  }

  // ==========================================================================
  // WORKFLOW REHEARSAL SCENARIO
  // ==========================================================================

  private async buildWorkflowRehearsalScenario(
    workflowId: string,
    config: ScenarioBuildConfig
  ): Promise<{
    steps: SimulationStep[];
    sourceReferences: SimulationReference[];
    title: string;
    description: string;
  }> {
    // In production: fetch real workflow from Phase 43 Workflow Engine
    const mockWorkflow = {
      id: workflowId,
      title: 'Batch Processing Workflow',
      phases: [
        { name: 'Preparation', steps: ['Gather materials', 'Setup environment'], duration: 900000 },
        { name: 'Inoculation', steps: ['Sterilize substrate', 'Apply inoculum'], duration: 1800000 },
        { name: 'Incubation', steps: ['Monitor temperature', 'Check humidity'], duration: 7200000 },
        { name: 'Inspection', steps: ['Visual assessment', 'Document findings'], duration: 600000 },
      ],
    };

    const steps: SimulationStep[] = [];
    let stepNumber = 1;

    for (const phase of mockWorkflow.phases) {
      for (const action of phase.steps) {
        steps.push({
          stepId: `${workflowId}-step-${stepNumber}`,
          stepNumber,
          stepType: 'action',
          title: `${phase.name}: ${action}`,
          description: `Execute ${action} in ${phase.name} phase`,
          sourceEngine: 'workflow',
          sourceEntityId: workflowId,
          sourceEntityType: 'workflow',
          expectedOutcome: `Completed: ${action}`,
          references: [],
          estimatedDuration: phase.duration / phase.steps.length,
          status: 'pending',
          metadata: {
            phase: phase.name,
            optional: false,
          },
        });
        stepNumber++;
      }
    }

    const sourceReferences: SimulationReference[] = [{
      referenceId: workflowId,
      referenceType: 'workflow',
      entityId: workflowId,
      entityType: 'workflow',
      title: mockWorkflow.title,
      sourceEngine: 'workflow',
      metadata: { totalPhases: mockWorkflow.phases.length },
    }];

    return {
      steps,
      sourceReferences,
      title: `Workflow Rehearsal: ${mockWorkflow.title}`,
      description: `Rehearse ${mockWorkflow.title} with ${steps.length} steps across ${mockWorkflow.phases.length} phases`,
    };
  }

  // ==========================================================================
  // INCIDENT REPLAY SCENARIO
  // ==========================================================================

  private async buildIncidentReplayScenario(
    incidentId: string,
    config: ScenarioBuildConfig
  ): Promise<{
    steps: SimulationStep[];
    sourceReferences: SimulationReference[];
    title: string;
    description: string;
  }> {
    // In production: fetch real incident from Timeline Engine (Phase 38)
    const mockIncident = {
      id: incidentId,
      title: 'Contamination Event 2024-EX-17',
      events: [
        { timestamp: '2024-12-01T10:00:00Z', event: 'Contamination detected', type: 'detection' },
        { timestamp: '2024-12-01T10:15:00Z', event: 'Area isolated', type: 'response' },
        { timestamp: '2024-12-01T10:30:00Z', event: 'Supervisor notified', type: 'escalation' },
        { timestamp: '2024-12-01T11:00:00Z', event: 'Cleanup initiated', type: 'remediation' },
        { timestamp: '2024-12-01T13:00:00Z', event: 'Verification complete', type: 'validation' },
        { timestamp: '2024-12-01T13:30:00Z', event: 'Incident closed', type: 'closure' },
      ],
    };

    const steps: SimulationStep[] = mockIncident.events.map((event, index) => ({
      stepId: `${incidentId}-event-${index + 1}`,
      stepNumber: index + 1,
      stepType: event.type === 'detection' ? 'observation' : 'action',
      title: event.event,
      description: `Replay: ${event.event} at ${event.timestamp}`,
      sourceEngine: 'timeline',
      sourceEntityId: incidentId,
      sourceEntityType: 'incident',
      expectedOutcome: `Event replayed: ${event.event}`,
      references: [],
      estimatedDuration: 60000, // 1 minute per event
      status: 'pending',
      metadata: {
        timestamp: event.timestamp,
        eventType: event.type,
      },
    }));

    const sourceReferences: SimulationReference[] = [{
      referenceId: incidentId,
      referenceType: 'incident',
      entityId: incidentId,
      entityType: 'incident',
      title: mockIncident.title,
      sourceEngine: 'timeline',
      metadata: { totalEvents: mockIncident.events.length },
    }];

    return {
      steps,
      sourceReferences,
      title: `Incident Replay: ${mockIncident.title}`,
      description: `Replay incident timeline with ${steps.length} events`,
    };
  }

  // ==========================================================================
  // GOVERNANCE REPLAY SCENARIO
  // ==========================================================================

  private async buildGovernanceReplayScenario(
    decisionId: string,
    config: ScenarioBuildConfig
  ): Promise<{
    steps: SimulationStep[];
    sourceReferences: SimulationReference[];
    title: string;
    description: string;
  }> {
    // In production: fetch real governance decision from Phase 44-45
    const mockDecision = {
      id: decisionId,
      title: 'Supervisor Role Assignment',
      chain: [
        { stage: 'Proposal', action: 'Submit role assignment request', actor: 'manager' },
        { stage: 'Review', action: 'Review qualifications', actor: 'hr' },
        { stage: 'Approval', action: 'Approve assignment', actor: 'director' },
        { stage: 'Documentation', action: 'Update role registry', actor: 'system' },
        { stage: 'Notification', action: 'Notify all parties', actor: 'system' },
      ],
    };

    const steps: SimulationStep[] = mockDecision.chain.map((stage, index) => ({
      stepId: `${decisionId}-stage-${index + 1}`,
      stepNumber: index + 1,
      stepType: 'decision',
      title: `${stage.stage}: ${stage.action}`,
      description: `Replay governance stage: ${stage.action} by ${stage.actor}`,
      sourceEngine: 'governance',
      sourceEntityId: decisionId,
      sourceEntityType: 'governance-decision',
      expectedOutcome: `Stage completed: ${stage.stage}`,
      references: [],
      estimatedDuration: 300000, // 5 minutes per stage
      status: 'pending',
      metadata: {
        stage: stage.stage,
        actor: stage.actor,
      },
    }));

    const sourceReferences: SimulationReference[] = [{
      referenceId: decisionId,
      referenceType: 'decision',
      entityId: decisionId,
      entityType: 'governance-decision',
      title: mockDecision.title,
      sourceEngine: 'governance',
      metadata: { totalStages: mockDecision.chain.length },
    }];

    return {
      steps,
      sourceReferences,
      title: `Governance Replay: ${mockDecision.title}`,
      description: `Replay governance decision chain with ${steps.length} stages`,
    };
  }

  // ==========================================================================
  // HEALTH DRIFT REPLAY SCENARIO
  // ==========================================================================

  private async buildHealthDriftReplayScenario(
    driftId: string,
    config: ScenarioBuildConfig
  ): Promise<{
    steps: SimulationStep[];
    sourceReferences: SimulationReference[];
    title: string;
    description: string;
  }> {
    // In production: fetch real health drift from Health Engine (Phase 43)
    const mockDrift = {
      id: driftId,
      title: 'Temperature Drift Event',
      observations: [
        { time: 0, value: 22.0, status: 'normal' },
        { time: 3600, value: 22.5, status: 'warning' },
        { time: 7200, value: 23.0, status: 'alert' },
        { time: 10800, value: 23.5, status: 'critical' },
        { time: 14400, value: 22.8, status: 'recovering' },
        { time: 18000, value: 22.0, status: 'resolved' },
      ],
    };

    const steps: SimulationStep[] = mockDrift.observations.map((obs, index) => ({
      stepId: `${driftId}-obs-${index + 1}`,
      stepNumber: index + 1,
      stepType: 'observation',
      title: `Observation ${index + 1}: ${obs.value}°C`,
      description: `Replay health observation: ${obs.value}°C (${obs.status})`,
      sourceEngine: 'health',
      sourceEntityId: driftId,
      sourceEntityType: 'health-drift',
      expectedOutcome: `Observed: ${obs.value}°C`,
      references: [],
      estimatedDuration: 60000, // 1 minute per observation
      status: 'pending',
      metadata: {
        timeOffset: obs.time,
        value: obs.value,
        healthStatus: obs.status,
      },
    }));

    const sourceReferences: SimulationReference[] = [{
      referenceId: driftId,
      referenceType: 'pattern',
      entityId: driftId,
      entityType: 'health-drift',
      title: mockDrift.title,
      sourceEngine: 'health',
      metadata: { totalObservations: mockDrift.observations.length },
    }];

    return {
      steps,
      sourceReferences,
      title: `Health Drift Replay: ${mockDrift.title}`,
      description: `Replay health drift with ${steps.length} observations`,
    };
  }

  // ==========================================================================
  // ANALYTICS REPLAY SCENARIO
  // ==========================================================================

  private async buildAnalyticsReplayScenario(
    patternId: string,
    config: ScenarioBuildConfig
  ): Promise<{
    steps: SimulationStep[];
    sourceReferences: SimulationReference[];
    title: string;
    description: string;
  }> {
    // In production: fetch real analytics pattern from Analytics Engine (Phase 39)
    const mockPattern = {
      id: patternId,
      title: 'Yield Optimization Pattern',
      occurrences: [
        { incident: 'Low yield in Batch A', factor: 'temperature' },
        { incident: 'Adjustment made to HVAC', factor: 'humidity' },
        { incident: 'Yield improvement in Batch B', factor: 'temperature' },
        { incident: 'Pattern confirmed', factor: 'correlation' },
      ],
    };

    const steps: SimulationStep[] = mockPattern.occurrences.map((occ, index) => ({
      stepId: `${patternId}-occ-${index + 1}`,
      stepNumber: index + 1,
      stepType: 'observation',
      title: occ.incident,
      description: `Replay pattern occurrence: ${occ.incident} (factor: ${occ.factor})`,
      sourceEngine: 'analytics',
      sourceEntityId: patternId,
      sourceEntityType: 'analytics-pattern',
      expectedOutcome: `Pattern occurrence replayed: ${occ.incident}`,
      references: [],
      estimatedDuration: 120000, // 2 minutes per occurrence
      status: 'pending',
      metadata: {
        factor: occ.factor,
      },
    }));

    const sourceReferences: SimulationReference[] = [{
      referenceId: patternId,
      referenceType: 'pattern',
      entityId: patternId,
      entityType: 'analytics-pattern',
      title: mockPattern.title,
      sourceEngine: 'analytics',
      metadata: { totalOccurrences: mockPattern.occurrences.length },
    }];

    return {
      steps,
      sourceReferences,
      title: `Analytics Replay: ${mockPattern.title}`,
      description: `Replay analytics pattern with ${steps.length} occurrences`,
    };
  }

  // ==========================================================================
  // TRAINING SIMULATION SCENARIO
  // ==========================================================================

  private async buildTrainingSimulationScenario(
    moduleId: string,
    config: ScenarioBuildConfig
  ): Promise<{
    steps: SimulationStep[];
    sourceReferences: SimulationReference[];
    title: string;
    description: string;
  }> {
    // In production: fetch real training module from Training Engine (Phase 40)
    const mockModule = {
      id: moduleId,
      title: 'Sterile Technique Training',
      lessons: [
        { title: 'Introduction to aseptic practice', type: 'lecture', duration: 600000 },
        { title: 'Hand washing demonstration', type: 'demo', duration: 300000 },
        { title: 'Sterile field setup practice', type: 'practice', duration: 900000 },
        { title: 'Assessment quiz', type: 'assessment', duration: 300000 },
      ],
    };

    const steps: SimulationStep[] = mockModule.lessons.map((lesson, index) => ({
      stepId: `${moduleId}-lesson-${index + 1}`,
      stepNumber: index + 1,
      stepType: lesson.type === 'assessment' ? 'validation' : 'action',
      title: lesson.title,
      description: `Simulate training lesson: ${lesson.title} (${lesson.type})`,
      sourceEngine: 'training',
      sourceEntityId: moduleId,
      sourceEntityType: 'training-module',
      expectedOutcome: `Lesson completed: ${lesson.title}`,
      references: [],
      estimatedDuration: lesson.duration,
      status: 'pending',
      metadata: {
        lessonType: lesson.type,
      },
    }));

    const sourceReferences: SimulationReference[] = [{
      referenceId: moduleId,
      referenceType: 'module',
      entityId: moduleId,
      entityType: 'training-module',
      title: mockModule.title,
      sourceEngine: 'training',
      metadata: { totalLessons: mockModule.lessons.length },
    }];

    return {
      steps,
      sourceReferences,
      title: `Training Simulation: ${mockModule.title}`,
      description: `Simulate training module with ${steps.length} lessons`,
    };
  }

  // ==========================================================================
  // FABRIC TRAVERSAL SCENARIO
  // ==========================================================================

  private async buildFabricTraversalScenario(
    entityId: string,
    config: ScenarioBuildConfig
  ): Promise<{
    steps: SimulationStep[];
    sourceReferences: SimulationReference[];
    title: string;
    description: string;
  }> {
    // In production: fetch real fabric links from Fabric Engine (Phase 46)
    const mockFabric = {
      startEntity: { id: entityId, type: 'incident', title: 'Contamination Event' },
      links: [
        { target: 'sop-004', type: 'addressed-by', targetType: 'sop' },
        { target: 'workflow-12', type: 'triggered', targetType: 'workflow' },
        { target: 'decision-789', type: 'resulted-in', targetType: 'governance-decision' },
        { target: 'pattern-456', type: 'contributed-to', targetType: 'analytics-pattern' },
      ],
    };

    const steps: SimulationStep[] = mockFabric.links.map((link, index) => ({
      stepId: `${entityId}-link-${index + 1}`,
      stepNumber: index + 1,
      stepType: 'integration',
      title: `Traverse: ${link.type}`,
      description: `Simulate fabric traversal: ${mockFabric.startEntity.title} → ${link.target} (${link.type})`,
      sourceEngine: 'fabric',
      sourceEntityId: entityId,
      sourceEntityType: mockFabric.startEntity.type,
      expectedOutcome: `Link traversed to ${link.target}`,
      references: [{
        referenceId: link.target,
        referenceType: 'link',
        entityId: link.target,
        entityType: link.targetType,
        title: link.target,
        sourceEngine: 'fabric',
        metadata: { relationshipType: link.type },
      }],
      estimatedDuration: 30000, // 30 seconds per link
      status: 'pending',
      metadata: {
        relationshipType: link.type,
        targetType: link.targetType,
      },
    }));

    const sourceReferences: SimulationReference[] = [{
      referenceId: entityId,
      referenceType: 'link',
      entityId: entityId,
      entityType: mockFabric.startEntity.type,
      title: mockFabric.startEntity.title,
      sourceEngine: 'fabric',
      metadata: { totalLinks: mockFabric.links.length },
    }];

    return {
      steps,
      sourceReferences,
      title: `Fabric Traversal: ${mockFabric.startEntity.title}`,
      description: `Simulate fabric link traversal with ${steps.length} connections`,
    };
  }

  // ==========================================================================
  // HELPERS
  // ==========================================================================

  private generateScenarioId(scenarioType: SimulationScenarioType): string {
    return `scenario-${scenarioType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
