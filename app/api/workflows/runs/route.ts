import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db/inMemoryDb';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const workflowId = url.searchParams.get('workflowId');
  const runs = db.query('workflow_runs', (r) => (workflowId ? r.workflowId === workflowId : true));
  return NextResponse.json({ runs });
}
