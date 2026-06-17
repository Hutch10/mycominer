import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { parsePagination } from '../../../lib/db/pagination';
import {
  assertNoClientOrgOverride,
  withPersistenceAuthOrg,
} from '../../../lib/auth/withPersistenceAuth';

export const GET = withPersistenceAuthOrg(async (req, ctx) => {
  const orgDenied = assertNoClientOrgOverride(req, ctx);
  if (orgDenied) return orgDenied;

  const pagination = parsePagination(req);
  const page = await db.listLicenseTokensByOrg(ctx.orgId, pagination);
  return NextResponse.json(page);
});
