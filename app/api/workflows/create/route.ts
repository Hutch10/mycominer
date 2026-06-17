import { NextResponse } from 'next/server';
import { WorkflowSchema } from '../../../lib/orchestration/schemas';
import { toAuditContext } from '../../../lib/db/auditContext';
import { db } from '../../../lib/db';
import { withPersistenceAuthOrg } from '../../../lib/auth/withPersistenceAuth';

export const POST = withPersistenceAuthOrg(
  async (req, ctx) => {
    const body = await req.json();
    const wf = WorkflowSchema.parse(body);

    if (wf.id && (await db.workflowExists(ctx.orgId, wf.id))) {
      return NextResponse.json({ error: 'workflow_exists' }, { status: 409 });
    }

    const saved = await db.createWorkflowWithLog(
      ctx.orgId,
      {
        id: wf.id,
        name: wf.name,
        description: wf.description,
        steps: wf.steps,
        enabled: wf.enabled,
      },
      toAuditContext(ctx)
    );

    return NextResponse.json({ workflow: saved });
  },
  { rateLimit: 'mutation' }
);
