import { NextResponse, NextRequest } from 'next/server';
import { db } from '../../../lib/db/inMemoryDb';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const wf = db.findById('workflows', id);
  if (!wf) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.json({ workflow: wf });
}
