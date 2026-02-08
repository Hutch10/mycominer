import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db/index';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const orgId = url.searchParams.get('orgId');
  if (!orgId) return NextResponse.json({ error: 'orgId required' }, { status: 400 });
  const rewards = db.query('reward_tokens', (r) => r.orgId === orgId);
  return NextResponse.json({ rewards });
}
