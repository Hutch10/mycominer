import { NextResponse } from 'next/server';
import { z } from 'zod';
import { toAuditContext } from '../../../lib/db/auditContext';
import { db } from '../../../lib/db';
import { withPersistenceAuthOrg } from '../../../lib/auth/withPersistenceAuth';

const Body = z.object({ runId: z.string().uuid() });

export const POST = withPersistenceAuthOrg(
  async (req, ctx) => {
    const { runId } = Body.parse(await req.json());
    const run = await db.cancelRunWithLog(ctx.orgId, runId, toAuditContext(ctx));
    if (!run) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    return NextResponse.json({ ok: true, run });
  },
  { rateLimit: 'mutation' }
);
