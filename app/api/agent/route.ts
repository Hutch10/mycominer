import { NextRequest, NextResponse } from 'next/server';
import governanceLog from '@/agent-runtime/src/system/governanceLog';
import semanticContext from '@/agent-runtime/src/system/semanticContext';
import graphSystem from '@/agent-runtime/src/system/graph';
import orchestrator from '@/agent-runtime/src/system/orchestrator';
import policyEngine from '@/agent-runtime/src/system/policyEngine';

/**
 * Agent API Route
 * 
 * Full multi-agent system with policy governance and explainability.
 * 
 * Integrated systems:
 * - Governance logging ✓
 * - Semantic context tracking ✓
 * - Explainability graph generation ✓
 * - Multi-agent orchestration ✓
 * - Policy engine (pre/post validation) ✓
 */

// Configuration - adjust port based on your agent runtime
const AGENT_RUNTIME_URL = process.env.AGENT_RUNTIME_URL || 'http://localhost:8080';
const AGENT_ENDPOINT = `${AGENT_RUNTIME_URL}/agent/execute`;

interface AgentRequest {
  message: string;
  context?: Record<string, any>;
  sessionId?: string;
}

export async function POST(req: NextRequest) {
  console.log('--- API HANDSHAKE DETECTED ---');
  const startTime = Date.now();
  let logId: string | null = null;
  let sessionId: string | null = null;

  try {
    const body: AgentRequest = await req.json();
    sessionId = body.sessionId || generateSessionId();
    
    if (!body.message || typeof body.message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      );
    }

    // ========== POLICY ENGINE: PRE-MESSAGE CHECK ==========
    const preCheck = policyEngine.preMessageCheck(body.message, { sessionId });
    
    if (!preCheck.passed) {
      // Log policy violation in governance
      logId = governanceLog.createEntry(sessionId, body.message);
      governanceLog.failEntry(logId, `Policy violation: ${preCheck.summary}`);

      return NextResponse.json(
        {
          error: 'Policy violation',
          details: preCheck.summary,
          checks: preCheck.checks.filter(c => !c.passed),
        },
        { status: 400 }
      );
    }

    // ========== GOVERNANCE LOGGING ==========
    // Create governance log entry
    logId = governanceLog.createEntry(sessionId, body.message);

    // ========== SEMANTIC CONTEXT ==========
    // Add user message to context
    semanticContext.addMessage(sessionId, 'user', body.message);

    // Build context string for agent
    const contextString = semanticContext.buildContextString(sessionId, 10);

    // ========== EXPLAINABILITY GRAPH ==========
    // Initialize graph for session
    graphSystem.initializeGraph(sessionId);
    
    // Add user message node
    const userNodeId = graphSystem.addNode(sessionId, {
      type: 'data',
      label: body.message.substring(0, 100),
    });

    // Add policy check node
    const policyCheckNodeId = graphSystem.addNode(sessionId, {
      type: 'decision',
      label: 'Policy Check: Pre-Message',
    });
    graphSystem.addEdge(sessionId, userNodeId, policyCheckNodeId, 'validated by');

    // ========== MULTI-AGENT ORCHESTRATION ==========
    // Route message to appropriate agent
    let orchestrationResult;
    try {
      orchestrationResult = orchestrator.routeMessage(sessionId, body.message, {
        userId: 'web-user',
        context: contextString,
      });
    } catch (orchError) {
      console.error('Orchestration error:', orchError);
      if (logId) {
        governanceLog.failEntry(
          logId,
          `Orchestration failed: ${orchError instanceof Error ? orchError.message : 'Unknown error'}`
        );
      }
      return NextResponse.json(
        {
          error: 'Agent routing failed',
          details: orchError instanceof Error ? orchError.message : 'Unknown orchestration error',
        },
        { status: 500 }
      );
    }

    // Add orchestration nodes
    const routingNodeId = graphSystem.addNode(sessionId, {
      type: 'agent',
      label: orchestrationResult.selectedAgent.name,
    });
    graphSystem.addEdge(sessionId, policyCheckNodeId, routingNodeId, 'routed to');

    const agentNodeId = graphSystem.addNode(sessionId, {
      type: 'agent',
      label: `${orchestrationResult.selectedAgent.name} (executing)`,
      metadata: {
        agentId: orchestrationResult.selectedAgent.id,
        routingScore: orchestrationResult.routingScore,
      },
    });
    graphSystem.addEdge(sessionId, routingNodeId, agentNodeId, 'executes');

    // Forward to agent runtime with enriched context and agent selection
    const agentResponse = await fetch(AGENT_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: body.message,
        context: {
          ...body.context,
          conversationHistory: contextString,
          sessionId,
          selectedAgent: orchestrationResult.selectedAgent.id,
          systemPrompt: orchestrationResult.selectedAgent.systemPrompt,
        },
        sessionId,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!agentResponse.ok) {
      const errorText = await agentResponse.text();
      console.error('Agent runtime error:', errorText);
      
      // Log error in governance
      if (logId) {
        governanceLog.failEntry(logId, errorText);
      }
      
      return NextResponse.json(
        { 
          error: 'Agent runtime error', 
          details: errorText,
          status: agentResponse.status 
        },
        { status: agentResponse.status }
      );
    }

    // Check if response is streaming
    const contentType = agentResponse.headers.get('content-type');
    if (contentType?.includes('text/event-stream') || contentType?.includes('stream')) {
      // Stream the response back to client
      return new NextResponse(agentResponse.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // Handle non-streaming response
    const data = await agentResponse.json();
    const agentResponseText = data.response || data.message || JSON.stringify(data);
    const duration = Date.now() - startTime;

    // ========== POLICY ENGINE: POST-MESSAGE CHECK ==========
    const postCheck = policyEngine.postMessageCheck(agentResponseText, { sessionId });
    
    // Log post-check in graph
    const postPolicyNodeId = graphSystem.addNode(sessionId, {
      type: 'decision',
      label: 'Policy Check: Post-Message',
    });

    if (!postCheck.passed) {
      // Log policy violation but allow warnings through
      const criticalFailures = postCheck.checks.filter(
        c => !c.passed && (c.severity === 'critical' || c.severity === 'error')
      );

      if (criticalFailures.length > 0) {
        if (logId) {
          governanceLog.failEntry(logId, `Post-policy violation: ${postCheck.summary}`);
        }

        graphSystem.addEdge(
          sessionId,
          agentNodeId,
          postPolicyNodeId,
          'failed validation'
        );

        return NextResponse.json(
          {
            error: 'Response policy violation',
            details: postCheck.summary,
            checks: criticalFailures,
          },
          { status: 500 }
        );
      }
    }

    // ========== UPDATE GOVERNANCE LOG ==========
    if (logId) {
      governanceLog.completeEntry(logId, agentResponseText, {
        duration,
        agentId: orchestrationResult.selectedAgent.id,
        routingScore: orchestrationResult.routingScore,
      });
    }

    // ========== UPDATE SEMANTIC CONTEXT ==========
    semanticContext.addMessage(sessionId, 'agent', agentResponseText, {
      agentId: orchestrationResult.selectedAgent.id,
      agentName: orchestrationResult.selectedAgent.name,
    });

    // ========== UPDATE EXPLAINABILITY GRAPH ==========
    const responseNodeId = graphSystem.addNode(sessionId, {
      type: 'outcome',
      label: agentResponseText.substring(0, 100) + (agentResponseText.length > 100 ? '...' : ''),
      metadata: {
        fullLength: agentResponseText.length,
        agentId: orchestrationResult.selectedAgent.id,
      },
    });

    graphSystem.addEdge(sessionId, agentNodeId, responseNodeId, 'produces');
    graphSystem.addEdge(sessionId, responseNodeId, postPolicyNodeId, 'validated by');

    // Get graph stats
    const graphData = graphSystem.getGraph(sessionId);
    const graphStats = graphData ? {
      nodeCount: graphData.nodes.length,
      edgeCount: graphData.edges.length,
    } : null;

    // Prepare response with full integration metadata
    const response = {
      ...data,
      metadata: {
        timestamp: new Date().toISOString(),
        version: '2.0',
        duration,
        // Integration IDs
        governanceLogId: logId,
        semanticContextId: sessionId,
        explainabilityGraphId: sessionId,
        // Multi-agent metadata
        selectedAgent: {
          id: orchestrationResult.selectedAgent.id,
          name: orchestrationResult.selectedAgent.name,
          specialty: orchestrationResult.selectedAgent.metadata?.specialty,
        },
        orchestration: {
          routingReason: orchestrationResult.routingReason,
          routingScore: orchestrationResult.routingScore,
          allScores: orchestrationResult.allScores, // Include all agent scores for debugging
        },
        // Policy metadata
        policyValidation: {
          preCheck: {
            passed: preCheck.passed,
            summary: preCheck.summary,
            failedPolicies: preCheck.failedPolicies || [],
          },
          postCheck: {
            passed: postCheck.passed,
            summary: postCheck.summary,
            failedPolicies: postCheck.failedPolicies || [],
          },
        },
        // Graph stats
        explainabilityGraph: graphStats,
      },
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Agent API error:', error);
    
    // Log error in governance
    if (logId) {
      governanceLog.failEntry(
        logId, 
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
    
    // Check if it's a connection error
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return NextResponse.json(
        { 
          error: 'Cannot connect to agent runtime',
          details: `Make sure the agent runtime is running at ${AGENT_RUNTIME_URL}`,
          suggestion: 'Check the AGENT_RUNTIME_URL environment variable'
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint for health check
export async function GET() {
  try {
    const healthCheck = await fetch(`${AGENT_RUNTIME_URL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });

    const isHealthy = healthCheck.ok;
    
    return NextResponse.json({
      status: isHealthy ? 'healthy' : 'unhealthy',
      agentRuntimeUrl: AGENT_RUNTIME_URL,
      timestamp: new Date().toISOString(),
    }, { status: isHealthy ? 200 : 503 });

  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      agentRuntimeUrl: AGENT_RUNTIME_URL,
      error: 'Cannot reach agent runtime',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 503 });
  }
}

// Helper function to generate session IDs
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
