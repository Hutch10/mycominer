import { NextResponse } from 'next/server';
import { meteringService } from '../../../lib/economy/meteringService';
import {
  assertNoClientOrgOverride,
  withPersistenceAuthOrg,
} from '../../../lib/auth/withPersistenceAuth';

export const GET = withPersistenceAuthOrg(async (req, ctx) => {
  const orgDenied = assertNoClientOrgOverride(req, ctx);
  if (orgDenied) return orgDenied;

  const url = new URL(req.url);
  const start = url.searchParams.get('start') || undefined;
  const end = url.searchParams.get('end') || undefined;
  const data = await meteringService.getUsage(ctx.orgId, start, end);
  return NextResponse.json({ data });
});
