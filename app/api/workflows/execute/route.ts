import { NextResponse } from 'next/server';
import { ExecuteRequestSchema } from '../../../lib/orchestration/schemas';
import { scheduleRun } from '../../../lib/orchestration/scheduler';
import { toAuditContext } from '../../../lib/db/auditContext';
import { withPersistenceAuthOrg } from '../../../lib/auth/withPersistenceAuth';

export const POST = withPersistenceAuthOrg(
  async (req, ctx) => {
    const body = ExecuteRequestSchema.parse(await req.json());
    try {
      const run = await scheduleRun(ctx.orgId, body, toAuditContext(ctx));
      return NextResponse.json({ run });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (message === 'workflow_not_found') {
        return NextResponse.json({ error: 'workflow_not_found' }, { status: 404 });
      }
      return NextResponse.json({ error: message }, { status: 500 });
    }
  },
  { rateLimit: 'strict' }
);
