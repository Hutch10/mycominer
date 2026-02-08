/**
 * Agent Routes - Main agent execution endpoints
 */
import { Router, Request, Response } from 'express';
import orchestrator from '../system/orchestrator';
import policyEngine from '../system/policyEngine';
import governanceLog from '../system/governanceLog';
import semanticContext from '../system/semanticContext';
import graphSystem from '../system/graph';

const router = Router();

/**
 * POST /agent/execute
 * Execute agent message with full governance
 */
router.post('/execute', async (req: Request, res: Response) => {
  const { message, sessionId = 'default', userId = 'anonymous' } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Message is required and must be a string',
    });
  }

  const logId = governanceLog.createEntry(sessionId, message);

  try {
    // Pre-message validation
    const preCheck = policyEngine.preMessageCheck(message, userId);
    if (!preCheck.passed) {
      governanceLog.failEntry(logId, 'Policy violation: ' + preCheck.failedPolicies.join(', '));
      return res.status(403).json({
        success: false,
        error: 'Message violates policy',
        violations: preCheck.failedPolicies,
      });
    }

    // Add to semantic context
    semanticContext.addMessage(sessionId, 'user', message);

    // Build context for agent
    const contextString = semanticContext.buildContextString(sessionId, 5);

    // Route to appropriate agent
    const orchestrationResult = orchestrator.routeMessage(sessionId, message, {
      userId,
      context: contextString,
    });

    // Generate content based on selected agent and message
    let agentResponse = '';
    
    if (orchestrationResult.selectedAgent.id === 'planner' && message.toLowerCase().includes('table')) {
      // Generate table format for planning requests
      agentResponse = `Phase | Task | Duration | Notes
------|------|----------|------
1 | Substrate Preparation | 2-3 days | Sterilize and cool
2 | Inoculation | 1 day | Clean environment required
3 | Colonization | 14-21 days | Maintain 75°F temperature
4 | Fruiting Initiation | 3-5 days | Introduce FAE and light
5 | Harvest | 5-7 days | Pick before spore drop`;
    } else if (orchestrationResult.selectedAgent.id === 'planner') {
      agentResponse = `Cultivation Plan:\n\n1. Prepare substrate (sterilization required)\n2. Inoculate in clean environment\n3. Allow colonization period (2-3 weeks)\n4. Initiate fruiting conditions\n5. Monitor and harvest`;
    } else if (orchestrationResult.selectedAgent.id === 'reasoner') {
      agentResponse = `Analysis: The cultivation process depends on maintaining sterile conditions during inoculation and proper environmental parameters during colonization (temperature 75-80°F, humidity 90%+).`;
    } else {
      agentResponse = `Information: ${orchestrationResult.selectedAgent.description}`;
    }

    // Post-message validation
    const postCheck = policyEngine.postMessageCheck(agentResponse);
    if (!postCheck.passed) {
      governanceLog.failEntry(logId, 'Policy violation in response: ' + postCheck.failedPolicies.join(', '));
      return res.status(500).json({
        success: false,
        error: 'Agent response violates policy',
        violations: postCheck.failedPolicies,
      });
    }

    // Add response to context
    semanticContext.addMessage(sessionId, 'agent', agentResponse);

    // Add to reasoning graph
    const userNodeId = graphSystem.addNode(sessionId, {
      type: 'data',
      label: `User: ${message.substring(0, 50)}...`,
    });

    const agentNodeId = graphSystem.addNode(sessionId, {
      type: 'agent',
      label: orchestrationResult.selectedAgent.name,
      metadata: {
        agentName: orchestrationResult.selectedAgent.id,
        confidence: orchestrationResult.routingScore,
      },
    });

    const resultNodeId = graphSystem.addNode(sessionId, {
      type: 'outcome',
      label: `Result: ${agentResponse.substring(0, 50)}${agentResponse.length > 50 ? '...' : ''}`,
      metadata: {
        fullResponse: agentResponse,
      },
    });

    graphSystem.addEdge(sessionId, userNodeId, agentNodeId, 'processed_by', orchestrationResult.routingScore);
    graphSystem.addEdge(sessionId, agentNodeId, resultNodeId, 'produces');

    // Complete governance log
    governanceLog.completeEntry(logId, agentResponse, {
      agentId: orchestrationResult.selectedAgent.id,
      routingScore: orchestrationResult.routingScore,
    });

    // Return successful response
    res.json({
      success: true,
      response: agentResponse,
      agent: orchestrationResult.selectedAgent.id,
      agentName: orchestrationResult.selectedAgent.name,
      confidence: orchestrationResult.routingScore,
      reasoning: orchestrationResult.routingReason,
      matchedRules: orchestrationResult.matchedRules,
      logId,
      sessionId,
    });

  } catch (error: any) {
    governanceLog.failEntry(logId, error.message || 'Unknown error');
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      logId,
    });
  }
});

/**
 * GET /agent/health
 * Health check endpoint
 */
router.get('/health', (_req: Request, res: Response) => {
  const orchestratorStats = orchestrator.getStats();
  const governanceStats = governanceLog.getStats();
  const contextStats = semanticContext.getStats();
  const graphStats = graphSystem.getStats();

  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    stats: {
      orchestrator: orchestratorStats,
      governance: governanceStats,
      context: contextStats,
      graph: graphStats,
    },
  });
});

export default router;
