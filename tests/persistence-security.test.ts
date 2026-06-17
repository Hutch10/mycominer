import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  PersistenceBackendError,
  isProductionPersistence,
  requirePersistenceBackend,
  shouldUseInMemoryPersistence,
} from '../app/lib/db/persistenceBackend.ts';
import {
  rejectClientOrgId,
  resolvePersistenceAuth,
} from '../app/lib/auth/persistenceAuth.ts';
import {
  decodeCursor,
  encodeCursor,
  parsePagination,
} from '../app/lib/db/pagination.ts';
import {
  checkRateLimit,
  rateLimitKey,
  resetRateLimitsForTests,
} from '../app/lib/auth/rateLimit.ts';
import { db } from '../app/lib/db/repository.ts';
import { db as memoryDb } from '../app/lib/db/inMemoryDb.ts';
import { toAuditContext } from '../app/lib/db/auditContext.ts';

const auditCtx = (orgId: string) =>
  toAuditContext({ userId: 'user-test', orgId, requestId: 'req-test' });

const originalEnv = { ...process.env };

beforeEach(() => {
  process.env = { ...originalEnv };
});

afterEach(() => {
  process.env = { ...originalEnv };
  resetRateLimitsForTests();
  memoryDb.clear();
});

describe('persistence backend fail-fast', () => {
  it('requires Supabase in production', () => {
    process.env.NODE_ENV = 'production';
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    assert.throws(() => requirePersistenceBackend(), PersistenceBackendError);
  });

  it('allows in-memory fallback only outside production', () => {
    process.env.NODE_ENV = 'development';
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    assert.equal(shouldUseInMemoryPersistence(), true);
    assert.doesNotThrow(() => requirePersistenceBackend());
  });

  it('uses Supabase when configured in production', () => {
    process.env.NODE_ENV = 'production';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-key';
    process.env.UPSTASH_REDIS_REST_URL = 'https://example.upstash.io';
    process.env.UPSTASH_REDIS_REST_TOKEN = 'upstash-token';
    assert.equal(shouldUseInMemoryPersistence(), false);
    assert.doesNotThrow(() => requirePersistenceBackend());
  });

  it('requires distributed rate limiting in production', () => {
    process.env.NODE_ENV = 'production';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-key';
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    assert.throws(() => requirePersistenceBackend(), PersistenceBackendError);
  });

  it('detects production mode', () => {
    process.env.NODE_ENV = 'production';
    assert.equal(isProductionPersistence(), true);
  });
});

describe('authorization helpers', () => {
  it('rejects cross-organization orgId from client', () => {
    const denied = rejectClientOrgId('org-b', {
      userId: 'user-1',
      orgId: 'org-a',
      requestId: 'req-1',
    });
    assert.ok(denied);
    assert.equal(denied?.status, 403);
    assert.equal(denied?.error, 'cross_organization_access_denied');
  });

  it('allows matching client orgId', () => {
    const denied = rejectClientOrgId('org-a', {
      userId: 'user-1',
      orgId: 'org-a',
      requestId: 'req-1',
    });
    assert.equal(denied, null);
  });

  it('rejects unauthenticated requests without dev headers', async () => {
    process.env.NODE_ENV = 'production';
    delete process.env.MYCOMINER_DEV_AUTH_HEADERS;
    const req = new Request('http://localhost/api/billing/invoices');
    const auth = await resolvePersistenceAuth(req, { requireOrg: true });
    assert.equal(auth.ok, false);
    if (!auth.ok) {
      assert.equal(auth.status, 401);
    }
  });

  it('accepts dev auth headers only in development', async () => {
    process.env.NODE_ENV = 'development';
    process.env.MYCOMINER_DEV_AUTH_HEADERS = '1';
    const req = new Request('http://localhost/api/billing/invoices', {
      headers: {
        'x-mycominer-user-id': 'dev-user',
        'x-mycominer-org-id': 'dev-org',
      },
    });
    const auth = await resolvePersistenceAuth(req, { requireOrg: true });
    assert.equal(auth.ok, true);
    if (auth.ok) {
      assert.equal(auth.ctx.userId, 'dev-user');
      assert.equal(auth.ctx.orgId, 'dev-org');
    }
  });

  it('rejects dev auth headers in production even when enabled', async () => {
    process.env.NODE_ENV = 'production';
    process.env.MYCOMINER_DEV_AUTH_HEADERS = '1';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-key';
    const req = new Request('http://localhost/api/billing/invoices', {
      headers: {
        'x-mycominer-user-id': 'dev-user',
        'x-mycominer-org-id': 'dev-org',
      },
    });
    const auth = await resolvePersistenceAuth(req, { requireOrg: true });
    assert.equal(auth.ok, false);
    if (!auth.ok) {
      assert.equal(auth.status, 401);
    }
  });

  it('throws when dev auth headers enabled in production backend check', () => {
    process.env.NODE_ENV = 'production';
    process.env.MYCOMINER_DEV_AUTH_HEADERS = '1';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-key';
    assert.throws(
      () => requirePersistenceBackend(),
      (error: unknown) => error instanceof PersistenceBackendError
    );
  });
});

describe('pagination helpers', () => {
  it('caps limit to 100', () => {
    const req = new Request('http://localhost/api/workflows/runs?limit=500');
    const pagination = parsePagination(req);
    assert.equal(pagination.limit, 100);
  });

  it('round-trips cursor encoding', () => {
    const cursor = encodeCursor('2026-06-15T12:00:00.000Z', '11111111-1111-4111-8111-111111111111');
    const decoded = decodeCursor(cursor);
    assert.ok(decoded);
    assert.equal(decoded?.createdAt, '2026-06-15T12:00:00.000Z');
    assert.equal(decoded?.id, '11111111-1111-4111-8111-111111111111');
  });
});

describe('workflow org isolation (in-memory)', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'development';
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  it('prevents cross-org workflow reads', async () => {
    const created = await db.createWorkflowWithLog(
      'org-a',
      { name: 'wf-a', steps: [{ id: 's1', type: 'noop' }] },
      auditCtx('org-a')
    );

    const sameOrg = await db.findWorkflowById('org-a', created.id);
    const crossOrg = await db.findWorkflowById('org-b', created.id);

    assert.ok(sameOrg);
    assert.equal(crossOrg, undefined);
  });

  it('prevents scheduling runs for workflows in another org', async () => {
    const created = await db.createWorkflowWithLog(
      'org-a',
      { name: 'wf-a', steps: [{ id: 's1', type: 'noop' }] },
      auditCtx('org-a')
    );

    await assert.rejects(
      () =>
        db.scheduleRunWithLog(
          'org-b',
          { workflowId: created.id, input: {} },
          auditCtx('org-b')
        ),
      /workflow_not_found/
    );
  });

  it('scopes workflow run listing to org', async () => {
    const wf = await db.createWorkflowWithLog(
      'org-a',
      { name: 'wf-a', steps: [{ id: 's1', type: 'noop' }] },
      auditCtx('org-a')
    );
    await db.scheduleRunWithLog('org-a', { workflowId: wf.id }, auditCtx('org-a'));

    const orgRuns = await db.listWorkflowRuns('org-a', wf.id, { limit: 10, cursor: null });
    const crossOrgRuns = await db.listWorkflowRuns('org-b', wf.id, { limit: 10, cursor: null });

    assert.equal(orgRuns.items.length, 1);
    assert.equal(crossOrgRuns.items.length, 0);
  });
});

describe('marketplace checkout idempotency (in-memory)', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'development';
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  it('replays checkout with the same idempotency key', async () => {
    const orgId = 'org-a';
    const base = {
      org_id: orgId,
      item_id: 'item-1',
      gross: 10,
      fees: 2,
      taxes: 0,
      net: 8,
      idempotency_key: 'idem-123',
    };

    const session = await db.beginMarketplaceCheckout(base, auditCtx(orgId));
    await db.recordMarketplaceCharge(orgId, String(session.id), 'charge-1', auditCtx(orgId));
    const first = await db.completeMarketplaceCheckout(orgId, String(session.id), auditCtx(orgId), {
      period: new Date().toISOString(),
    });

    const sessionReplay = await db.beginMarketplaceCheckout(base, auditCtx(orgId));
    const second = await db.completeMarketplaceCheckout(
      orgId,
      String(sessionReplay.id),
      auditCtx(orgId),
      { period: new Date().toISOString() }
    );

    assert.equal(first.idempotentReplay, false);
    assert.equal(second.idempotentReplay, true);
    assert.equal(first.revenue.id, second.revenue.id);
  });
});

describe('rate limiting', () => {
  beforeEach(() => {
    resetRateLimitsForTests();
  });

  it('blocks requests after strict tier limit', () => {
    const key = rateLimitKey('user-1', 'POST', '/api/workflows/execute', 'strict');
    for (let i = 0; i < 20; i++) {
      const result = checkRateLimit(key, 'strict');
      assert.equal(result.allowed, true);
    }
    const blocked = checkRateLimit(key, 'strict');
    assert.equal(blocked.allowed, false);
    if (!blocked.allowed) {
      assert.ok(blocked.retryAfterSec >= 1);
    }
  });
});
