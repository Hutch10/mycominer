import { createClient } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '../supabase/server';
import type { Database } from '../supabase/database.types';

function requestIdFrom(req: Request): string {
  return req.headers.get('x-request-id') ?? crypto.randomUUID();
}

export type AdminAuthContext = {
  userId: string;
  requestId: string;
};

export type AdminAuthFailure = {
  ok: false;
  status: 401 | 403;
  error: string;
};

export type AdminAuthSuccess = {
  ok: true;
  ctx: AdminAuthContext;
};

export type AdminAuthResult = AdminAuthFailure | AdminAuthSuccess;

export function isPlatformAdmin(
  appMetadata: Record<string, unknown> | undefined
): boolean {
  if (!appMetadata) {
    return false;
  }
  if (appMetadata.role === 'admin' || appMetadata.platform_admin === true) {
    return true;
  }
  const roles = appMetadata.roles;
  return Array.isArray(roles) && roles.includes('admin');
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

function devAdminAuth(req: Request): AdminAuthContext | null {
  if (process.env.NODE_ENV === 'production') {
    return null;
  }
  if (process.env.MYCOMINER_DEV_AUTH_HEADERS !== '1') {
    return null;
  }
  if (req.headers.get('x-mycominer-admin') !== '1') {
    return null;
  }
  const userId = req.headers.get('x-mycominer-user-id');
  if (!userId) {
    return null;
  }
  return { userId, requestId: requestIdFrom(req) };
}

export async function resolveAdminAuth(req: Request): Promise<AdminAuthResult> {
  const devCtx = devAdminAuth(req);
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

  if (!isPlatformAdmin(user.app_metadata as Record<string, unknown> | undefined)) {
    return { ok: false, status: 403, error: 'admin_access_required' };
  }

  return {
    ok: true,
    ctx: {
      userId: user.id,
      requestId: requestIdFrom(req),
    },
  };
}
