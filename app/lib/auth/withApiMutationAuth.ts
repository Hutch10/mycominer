import { NextResponse } from 'next/server';
import { toAuditContext } from '../db/auditContext';
import { db } from '../db';
import {
  PersistenceBackendError,
  requirePersistenceBackend,
} from '../db/persistenceBackend';
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

type MutationHandler = (req: Request, ctx: PersistenceAuthContext) => Promise<Response>;

type MutationOptions = {
  requireOrg?: boolean;
  rateLimit?: RateLimitTier;
  auditEventType?: string;
  auditPayload?: (
    req: Request,
    ctx: PersistenceAuthContext,
    response: Response
  ) => Record<string, unknown> | null;
};

function failure(status: 401 | 403, error: string): Response {
  return NextResponse.json({ error }, { status });
}

function rateLimited(retryAfterSec: number): Response {
  return NextResponse.json(
    { error: 'rate_limit_exceeded' },
    { status: 429, headers: { 'Retry-After': String(retryAfterSec) } }
  );
}

export function withApiMutationAuth(
  handler: MutationHandler,
  options: MutationOptions = {}
): (req: Request) => Promise<Response> {
  const requireOrg = options.requireOrg ?? true;

  return async (req: Request) => {
    if (options.auditEventType) {
      try {
        requirePersistenceBackend();
      } catch (error) {
        if (error instanceof PersistenceBackendError) {
          return NextResponse.json({ error: error.message }, { status: 503 });
        }
        throw error;
      }
    }

    const auth = await resolvePersistenceAuth(req, { requireOrg });
    if (!auth.ok) {
      return failure(auth.status, auth.error);
    }

    if (options.rateLimit) {
      const url = new URL(req.url);
      const limited = await enforceRateLimit(
        rateLimitKey(auth.ctx.userId, req.method, url.pathname, options.rateLimit),
        options.rateLimit
      );
      if (!limited.allowed) {
        return rateLimited(limited.retryAfterSec);
      }
    }

    const response = await handler(req, auth.ctx);

    if (
      options.auditEventType &&
      response.status >= 200 &&
      response.status < 300
    ) {
      const payload =
        options.auditPayload?.(req, auth.ctx, response) ?? {
          method: req.method,
          path: new URL(req.url).pathname,
        };
      try {
        await db.recordAuditEvent(toAuditContext(auth.ctx), {
          eventType: options.auditEventType,
          payload,
        });
      } catch (error) {
        console.error('audit_event_write_failed', error);
      }
    }

    return response;
  };
}

export function assertClientOrgMatches(
  clientOrgId: string | null | undefined,
  ctx: PersistenceAuthContext
): Response | null {
  const denied = rejectClientOrgId(clientOrgId ?? null, ctx);
  if (denied) {
    return failure(denied.status, denied.error);
  }
  return null;
}
