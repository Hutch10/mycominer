import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '../../../lib/db';
import { parsePagination } from '../../../lib/db/pagination';
import { withPersistenceAuthOrg } from '../../../lib/auth/withPersistenceAuth';

const QuerySchema = z.object({
  workflowId: z.string().uuid(),
});

export const GET = withPersistenceAuthOrg(async (req, ctx) => {
  const url = new URL(req.url);
  const parsed = QuerySchema.safeParse({
    workflowId: url.searchParams.get('workflowId'),
  });
  if (!parsed.success) {
    return NextResponse.json({ error: 'workflowId_required' }, { status: 400 });
  }

  const pagination = parsePagination(req);
  const page = await db.listWorkflowRuns(ctx.orgId, parsed.data.workflowId, pagination);
  return NextResponse.json(page);
});
