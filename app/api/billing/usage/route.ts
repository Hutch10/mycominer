import { NextResponse } from 'next/server';
import { meteringService } from '../../../lib/economy/meteringService';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const orgId = url.searchParams.get('orgId');
  const start = url.searchParams.get('start') || undefined;
  const end = url.searchParams.get('end') || undefined;
  if (!orgId) return NextResponse.json({ error: 'orgId required' }, { status: 400 });
  const data = await meteringService.getUsage(orgId, start, end);
  return NextResponse.json({ data });
}
