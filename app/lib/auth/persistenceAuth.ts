import { createClient } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '../supabase/server';
import type { Database } from '../supabase/database.types';

export interface PersistenceAuthContext {
  userId: string;
  orgId: string;
  requestId: string;
}

export type PersistenceAuthFailure = {
  ok: false;
  status: 401 | 403;
  error: string;
};

export type PersistenceAuthSuccess = {
  ok: true;
  ctx: PersistenceAuthContext;
};

export type PersistenceAuthResult = PersistenceAuthFailure | PersistenceAuthSuccess;

function requestIdFrom(req: Request): string {
  return req.headers.get('x-request-id') ?? crypto.randomUUID();
}

function orgIdFromAppMetadata(appMetadata: Record<string, unknown> | undefined): string | null {
  const orgId = appMetadata?.org_id;
  return typeof orgId === 'string' && orgId.length > 0 ? orgId : null;
}

async function userFromBearerToken(token: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return null;
  }

  const client = createClient<Database>(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) {
    return null;
  }
  return data.user;
}

function devHeaderAuth(req: Request): PersistenceAuthContext | null {
  if (process.env.NODE_ENV === 'production') {
    return null;
  }
  if (process.env.MYCOMINER_DEV_AUTH_HEADERS !== '1') {
    return null;
  }

  const userId = req.headers.get('x-mycominer-user-id');
  const orgId = req.headers.get('x-mycominer-org-id');
  if (!userId || !orgId) {
    return null;
  }

  return {
    userId,
    orgId,
    requestId: requestIdFrom(req),
  };
}

export async function resolvePersistenceAuth(
  req: Request,
  options: { requireOrg?: boolean } = {}
): Promise<PersistenceAuthResult> {
  const requireOrg = options.requireOrg ?? false;
  const requestId = requestIdFrom(req);

  const devCtx = devHeaderAuth(req);
  if (devCtx) {
    return { ok: true, ctx: devCtx };
  }

  const authHeader = req.headers.get('authorization');
  let user = null;

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice('Bearer '.length).trim();
    if (token) {
      user = await userFromBearerToken(token);
    }
  }

  if (!user) {
    try {
      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase.auth.getUser();
      if (!error && data.user) {
        user = data.user;
      }
    } catch {
      // Cookie auth unavailable outside request context.
    }
  }

  if (!user) {
    return { ok: false, status: 401, error: 'authentication_required' };
  }

  const orgId = orgIdFromAppMetadata(user.app_metadata as Record<string, unknown> | undefined);
  if (requireOrg && !orgId) {
    return {
      ok: false,
      status: 403,
      error: 'organization_not_configured_for_user',
    };
  }

  return {
    ok: true,
    ctx: {
      userId: user.id,
      orgId: orgId ?? '',
      requestId,
    },
  };
}

export function rejectClientOrgId(
  clientOrgId: string | null,
  ctx: PersistenceAuthContext
): PersistenceAuthFailure | null {
  if (!clientOrgId) {
    return null;
  }
  if (clientOrgId !== ctx.orgId) {
    return { ok: false, status: 403, error: 'cross_organization_access_denied' };
  }
  return null;
}
