import { NextResponse } from 'next/server';

import workflowEngine, { WorkflowDefinition } from '@/agent-runtime/src/system/workflowEngine';

import { withPersistenceAuthOrg } from '../../lib/auth/withPersistenceAuth';

import { toAuditContext } from '../../lib/db/auditContext';

import { db } from '../../lib/db';



export const POST = withPersistenceAuthOrg(

  async (req, ctx) => {

    const audit = toAuditContext(ctx);

    try {

      const body = await req.json();

      const { action, workflowId, sessionId, workflow, inputs } = body;



      if (action === 'register' && workflow) {

        const definition = workflow as WorkflowDefinition;

        workflowEngine.registerWorkflow(definition);

        await db.recordAuditEvent(audit, {

          eventType: 'workflow_engine_registered',

          payload: { workflowId: definition.id, orgId: ctx.orgId },

        });

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

        await db.recordAuditEvent(audit, {

          eventType: 'workflow_engine_executed',

          payload: { workflowId, sessionId, executionId: execution.id, orgId: ctx.orgId },

        });

        return NextResponse.json({

          success: true,

          execution,

          executionId: execution.id,

        });

      }



      if (action === 'status' && workflowId === 'all' && sessionId) {

        const executions = workflowEngine.getSessionExecutions(sessionId);

        await db.recordAuditEvent(audit, {

          eventType: 'workflow_engine_status_queried',

          payload: { sessionId, executionCount: executions.length, orgId: ctx.orgId },

        });

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

  },

  { rateLimit: 'strict' }

);



export const GET = withPersistenceAuthOrg(async (req) => {

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

});

