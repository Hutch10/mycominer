import { NextResponse, NextRequest } from 'next/server';
import { db } from '../../../lib/db';
import { withPersistenceAuthOrg } from '../../../lib/auth/withPersistenceAuth';

export async function GET(
  req: NextRequest,
  segment: { params: Promise<{ id: string }> }
) {
  return withPersistenceAuthOrg(async (_req, ctx) => {
    const { id } = await segment.params;
    const wf = await db.findWorkflowById(ctx.orgId, id);
    if (!wf) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    return NextResponse.json({ workflow: wf });
  })(req);
}
