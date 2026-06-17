import { NextResponse } from 'next/server';
import { PersistenceBackendError, requirePersistenceBackend } from '../db/persistenceBackend';
import {
  type PersistenceAuthContext,
  rejectClientOrgId,
  resolvePersistenceAuth,
} from './persistenceAuth';
import {
  enforceRateLimit,
  rateLimitKey,
  type RateLimitTier,
} from './rateLimit';

type PersistenceRouteHandler = (
  req: Request,
  ctx: PersistenceAuthContext
) => Promise<Response>;

type PersistenceRouteOptions = {
  requireOrg?: boolean;
  rateLimit?: RateLimitTier;
  /** Apply rate limiting to GET as well as mutating methods (default: mutations only). */
  rateLimitOnGet?: boolean;
};

function authFailureResponse(status: 401 | 403, error: string): Response {
  return NextResponse.json({ error }, { status });
}

function backendFailureResponse(error: PersistenceBackendError): Response {
  return NextResponse.json({ error: error.message }, { status: 503 });
}

function rateLimitResponse(retryAfterSec: number): Response {
  return NextResponse.json(
    { error: 'rate_limit_exceeded' },
    { status: 429, headers: { 'Retry-After': String(retryAfterSec) } }
  );
}

export function withPersistenceAuth(
  handler: PersistenceRouteHandler,
  options: PersistenceRouteOptions = {}
): (req: Request) => Promise<Response> {
  return async (req: Request) => {
    try {
      requirePersistenceBackend();
    } catch (error) {
      if (error instanceof PersistenceBackendError) {
        return backendFailureResponse(error);
      }
      throw error;
    }

    const auth = await resolvePersistenceAuth(req, options);
    if (!auth.ok) {
      return authFailureResponse(auth.status, auth.error);
    }

    const shouldRateLimit =
      options.rateLimit &&
      (req.method !== 'GET' || options.rateLimitOnGet === true);
    if (shouldRateLimit && options.rateLimit) {
      const url = new URL(req.url);
      const result = await enforceRateLimit(
        rateLimitKey(auth.ctx.userId, req.method, url.pathname, options.rateLimit),
        options.rateLimit
      );
      if (!result.allowed) {
        return rateLimitResponse(result.retryAfterSec);
      }
    }

    return handler(req, auth.ctx);
  };
}

export function withPersistenceAuthOrg(
  handler: PersistenceRouteHandler,
  options: Omit<PersistenceRouteOptions, 'requireOrg'> = {}
): (req: Request) => Promise<Response> {
  return withPersistenceAuth(handler, { requireOrg: true, ...options });
}

export function assertNoClientOrgOverride(
  req: Request,
  ctx: PersistenceAuthContext
): Response | null {
  const url = new URL(req.url);
  const queryOrgId = url.searchParams.get('orgId');
  const mismatch = rejectClientOrgId(queryOrgId, ctx);
  if (mismatch) {
    return authFailureResponse(mismatch.status, mismatch.error);
  }
  return null;
}
