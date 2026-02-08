import { NextResponse } from 'next/server';
import { ExecuteRequestSchema } from '../../../../lib/orchestration/schemas';
import { scheduleRun } from '../../../../lib/orchestration/scheduler';

export async function POST(req: Request) {
  const body = ExecuteRequestSchema.parse(await req.json());
  try {
    const run = await scheduleRun(body);
    return NextResponse.json({ run });
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
