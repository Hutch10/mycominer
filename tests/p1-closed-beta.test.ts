import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { db } from '../app/lib/db/repository.ts';
import { db as memoryDb } from '../app/lib/db/inMemoryDb.ts';
import { toAuditContext } from '../app/lib/db/auditContext.ts';
import { paymentsAdapter } from '../app/lib/payments/stripeAdapter.ts';
import { licenseService } from '../app/lib/economy/licenseService.ts';

const originalEnv = { ...process.env };

function audit(orgId: string) {
  return toAuditContext({ userId: 'p1-test', orgId, requestId: 'p1-req' });
}

beforeEach(() => {
  process.env = { ...originalEnv, NODE_ENV: 'development' };
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  memoryDb.clear();
});

afterEach(() => {
  process.env = { ...originalEnv };
  memoryDb.clear();
});

describe('P1 token purchase durable idempotency', () => {
  it('replays saved purchase result for the same org and idempotency key', async () => {
    const orgId = 'org-p1';
    const idempotencyKey = 'purchase-idem-1';
    const payload = {
      charge: { id: 'ch_p1', status: 'succeeded', mode: 'disabled' },
      minted: {
        orgId,
        amount: 25,
        tokensIssued: 25000,
        transactionId: 'txn_p1',
        timestamp: new Date().toISOString(),
      },
    };

    const saved = await db.saveTokenPurchaseReplay(orgId, idempotencyKey, payload);
    assert.deepEqual(saved, payload);

    const replay = await db.getTokenPurchaseReplay(orgId, idempotencyKey);
    assert.deepEqual(replay, payload);

    const crossOrg = await db.getTokenPurchaseReplay('org-other', idempotencyKey);
    assert.equal(crossOrg, null);
  });

  it('saveTokenPurchaseReplay is stable under concurrent key reuse', async () => {
    const orgId = 'org-p1';
    const idempotencyKey = 'purchase-idem-2';
    const first = { charge: { id: 'ch_first' }, minted: { transactionId: 'txn_first' } };
    const second = { charge: { id: 'ch_second' }, minted: { transactionId: 'txn_second' } };

    await db.saveTokenPurchaseReplay(orgId, idempotencyKey, first);
    const stored = await db.saveTokenPurchaseReplay(orgId, idempotencyKey, second);
    assert.deepEqual(stored.charge, first.charge);
  });
});

describe('P1 migration inventory', () => {
  it('includes workflow org isolation through token purchase idempotency', async () => {
    const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
    const expected = [
      '004_workflow_org_isolation.sql',
      '005_marketplace_atomic_idempotency.sql',
      '006_payment_checkout_integrity.sql',
      '007_token_purchase_idempotency.sql',
      '008_fix_rpc_extensions_search_path.sql',
    ];

    for (const file of expected) {
      const content = await readFile(path.join(migrationsDir, file), 'utf8');
      assert.ok(content.length > 0, `${file} must not be empty`);
    }
  });
});

describe('P1 secret scan patterns', () => {
  it('covers service role and payment provider env names', async () => {
    const script = await readFile(
      path.join(process.cwd(), 'scripts', 'scan-client-secrets.mjs'),
      'utf8'
    );
    assert.match(script, /SUPABASE_SERVICE_ROLE_KEY/);
    assert.match(script, /STRIPE_SECRET_KEY/);
    assert.match(script, /UPSTASH_REDIS_REST_TOKEN/);
    assert.match(script, /sk_test_/);
  });
});

describe('P1 mutation route hardening inventory', () => {
  const stateChangingRoutes = [
    'app/api/workflows/create/route.ts',
    'app/api/workflows/execute/route.ts',
    'app/api/workflows/cancel/route.ts',
    'app/api/workflows/route.ts',
    'app/api/marketplace/checkout/route.ts',
    'app/api/billing/purchase-tokens/route.ts',
    'app/api/federation/org/register/route.ts',
    'app/api/governance/route.ts',
    'app/api/explainability/route.ts',
    'app/api/agent/route.ts',
  ];

  it('requires auth wrapper on state-changing API routes', async () => {
    for (const routePath of stateChangingRoutes) {
      const content = await readFile(path.join(process.cwd(), routePath), 'utf8');
      const hasAuth =
        content.includes('withPersistenceAuthOrg') ||
        content.includes('withApiMutationAuth');
      assert.equal(hasAuth, true, `${routePath} must use authenticated wrapper`);
    }
  });

  it('applies strict rate limits to scheduler and marketplace mutations', async () => {
    const strictRoutes = [
      'app/api/workflows/execute/route.ts',
      'app/api/workflows/route.ts',
      'app/api/marketplace/checkout/route.ts',
      'app/api/billing/purchase-tokens/route.ts',
    ];

    for (const routePath of strictRoutes) {
      const content = await readFile(path.join(process.cwd(), routePath), 'utf8');
      assert.match(content, /rateLimit:\s*'strict'/);
    }
  });

  it('requires auth on federation trust graph export', async () => {
    const content = await readFile(
      path.join(process.cwd(), 'app/api/federation/trust-graph/route.ts'),
      'utf8'
    );
    assert.match(content, /withPersistenceAuthOrg/);
    assert.match(content, /rateLimitOnGet:\s*true/);
  });
});

describe('P1 audit event coverage (token purchase flow)', () => {
  it('records purchase lifecycle audit events', async () => {
    const orgId = 'org-audit';
    const auditCtx = audit(orgId);
    const idempotencyKey = 'audit-purchase-1';

    await db.recordAuditEvent(auditCtx, {
      eventType: 'tokens_purchase_started',
      payload: { orgId, idempotencyKey },
    });

    const charge = await paymentsAdapter.charge('pm_test', 1000, 'USD', {
      idempotencyKey,
      metadata: { orgId },
    });
    const minted = await licenseService.mintTokens(orgId, 10, 'purchase', {
      chargeId: charge.id,
      idempotencyKey,
    });

    await db.recordAuditEvent(auditCtx, {
      eventType: 'tokens_purchased',
      payload: { orgId, chargeId: charge.id, idempotencyKey },
    });

    await db.saveTokenPurchaseReplay(orgId, idempotencyKey, { charge, minted });
    await db.recordAuditEvent(auditCtx, {
      eventType: 'tokens_purchase_idempotent_replay',
      payload: { orgId, idempotencyKey },
    });

    const logs = memoryDb.all('orchestration_log');
    const eventTypes = logs.map((l) => l.eventType ?? l.event_type);
    assert.ok(eventTypes.includes('tokens_purchase_started'));
    assert.ok(eventTypes.includes('tokens_purchased'));
    assert.ok(eventTypes.includes('tokens_purchase_idempotent_replay'));
  });
});
