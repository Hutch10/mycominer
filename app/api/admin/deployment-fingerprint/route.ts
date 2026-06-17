import { NextResponse } from 'next/server';
import { resolveAdminAuth } from '../../../lib/auth/adminAuth';
import { getDeploymentFingerprint } from '../../../lib/deploy/fingerprint';
import { requirePersistenceBackend } from '../../../lib/db/persistenceBackend';

export const dynamic = 'force-dynamic';

export async function GET(req: Request): Promise<Response> {
  try {
    requirePersistenceBackend();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'persistence_unavailable';
    return NextResponse.json({ error: message }, { status: 503 });
  }

  const auth = await resolveAdminAuth(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  return NextResponse.json(getDeploymentFingerprint());
}
