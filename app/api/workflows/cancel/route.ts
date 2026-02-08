import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '../../../lib/db/inMemoryDb';

const Body = z.object({ runId: z.string() });

export async function POST(req: Request) {
  const { runId } = Body.parse(await req.json());
  const run = db.findById('workflow_runs', runId);
  if (!run) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  db.update('workflow_runs', runId, { status: 'cancelling', cancelledAt: new Date().toISOString() });
  db.insert('orchestration_log', { id: `log_${Date.now()}`, eventType: 'run_cancel_requested', runId, payload: { requestedAt: new Date().toISOString() }, timestamp: new Date().toISOString() });
  return NextResponse.json({ ok: true });
}
