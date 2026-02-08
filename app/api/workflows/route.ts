import { NextRequest, NextResponse } from 'next/server';
import workflowEngine, { WorkflowDefinition } from '@/agent-runtime/src/system/workflowEngine';

/**
 * Workflow HTTP API
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, workflowId, sessionId, workflow, inputs } = body;

    if (action === 'register' && workflow) {
      const definition = workflow as WorkflowDefinition;
      workflowEngine.registerWorkflow(definition);
      return NextResponse.json({
        success: true,
        message: `Workflow registered: ${definition.id}`,
        workflowId: definition.id,
      });
    }

    if (action === 'execute' && workflowId && sessionId) {
      const execution = await workflowEngine.executeWorkflow(
        workflowId,
        sessionId,
        inputs || {}
      );
      return NextResponse.json({
        success: true,
        execution,
        executionId: execution.id,
      });
    }

    if (action === 'status' && workflowId === 'all' && sessionId) {
      const executions = workflowEngine.getSessionExecutions(sessionId);
      return NextResponse.json({
        success: true,
        executions,
        count: executions.length,
      });
    }

    return NextResponse.json(
      { error: 'Invalid workflow request', action },
      { status: 400 }
    );
  } catch (error) {
    console.error('Workflow API error:', error);
    return NextResponse.json(
      {
        error: 'Workflow API error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const executionId = searchParams.get('executionId');
    const sessionId = searchParams.get('sessionId');

    if (executionId) {
      const execution = workflowEngine.getExecution(executionId);
      if (!execution) {
        return NextResponse.json(
          { error: 'Execution not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, execution });
    }

    if (sessionId) {
      const executions = workflowEngine.getSessionExecutions(sessionId);
      return NextResponse.json({
        success: true,
        executions,
        count: executions.length,
      });
    }

    return NextResponse.json(
      { error: 'Missing executionId or sessionId parameter' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Workflow API error:', error);
    return NextResponse.json(
      {
        error: 'Workflow API error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
