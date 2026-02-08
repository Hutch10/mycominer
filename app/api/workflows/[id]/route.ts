import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db/inMemoryDb';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const wf = db.findById('workflows', params.id);
  if (!wf) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.json({ workflow: wf });
}
