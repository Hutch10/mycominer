import { NextResponse } from 'next/server';
import { WorkflowSchema } from '../../../lib/orchestration/schemas';
import { db } from '../../../lib/db/inMemoryDb';

export async function POST(req: Request) {
  const body = await req.json();
  const wf = WorkflowSchema.parse(body);
  const existing = db.findById('workflows', wf.id);
  if (existing) return NextResponse.json({ error: 'workflow_exists' }, { status: 409 });
  const saved = db.insert('workflows', { ...wf, createdAt: new Date().toISOString() });
  db.insert('orchestration_log', { id: `log_${Date.now()}`, eventType: 'workflow_created', workflowId: saved.id, payload: saved, timestamp: new Date().toISOString() });
  return NextResponse.json({ workflow: saved });
}
