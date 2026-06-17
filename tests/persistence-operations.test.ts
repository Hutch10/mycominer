import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { db } from '../app/lib/db/repository.ts';
import { db as memoryDb } from '../app/lib/db/inMemoryDb.ts';
import { toAuditContext } from '../app/lib/db/auditContext.ts';
import { resetRateLimitsForTests } from '../app/lib/auth/rateLimit.ts';

const audit = (orgId: string) =>
  toAuditContext({ userId: 'ops-user', orgId, requestId: 'ops-req' });

const originalEnv = { ...process.env };

beforeEach(() => {
  process.env = { ...originalEnv, NODE_ENV: 'development' };
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  memoryDb.clear();
  resetRateLimitsForTests();
});

afterEach(() => {
  process.env = { ...originalEnv };
  memoryDb.clear();
  resetRateLimitsForTests();
});

describe('concurrent workflow creation', () => {
  it('creates isolated workflows per org under parallel load', async () => {
    const results = await Promise.all(
      Array.from({ length: 20 }, (_, i) =>
        db.createWorkflowWithLog(
          i % 2 === 0 ? 'org-a' : 'org-b',
          { name: `wf-${i}`, steps: [{ id: `s${i}`, type: 'noop' }] },
          audit(i % 2 === 0 ? 'org-a' : 'org-b')
        )
      )
    );

    assert.equal(results.length, 20);
    const orgA = results.filter((r) => r.orgId === 'org-a');
    const orgB = results.filter((r) => r.orgId === 'org-b');
    assert.equal(orgA.length, 10);
    assert.equal(orgB.length, 10);
  });
});

describe('concurrent marketplace checkout', () => {
  it('deduplicates checkout sessions with the same idempotency key', async () => {
    const orgId = 'org-checkout';
    const key = 'idem-concurrent-1';
    const base = {
      org_id: orgId,
      item_id: 'item-1',
      gross: 25,
      fees: 5,
      taxes: 0,
      net: 20,
      idempotency_key: key,
    };

    const sessions = await Promise.all(
      Array.from({ length: 10 }, () => db.beginMarketplaceCheckout(base, audit(orgId)))
    );

    const uniqueIds = new Set(sessions.map((s) => String(s.id)));
    assert.equal(uniqueIds.size, 1);

    await db.recordMarketplaceCharge(orgId, String(sessions[0].id), 'charge-1', audit(orgId));

    const completions = await Promise.all(
      Array.from({ length: 5 }, () =>
        db.completeMarketplaceCheckout(orgId, String(sessions[0].id), audit(orgId), {
          period: new Date().toISOString(),
        })
      )
    );

    const revenueIds = new Set(completions.map((c) => String(c.revenue.id)));
    assert.equal(revenueIds.size, 1);
  });
});

describe('high-volume audit logging', () => {
  it('appends many audit events without mutation', async () => {
    const orgId = 'org-audit';
    const events = await Promise.all(
      Array.from({ length: 100 }, (_, i) =>
        db.recordAuditEvent(audit(orgId), {
          eventType: 'load_test_event',
          payload: { index: i },
        })
      )
    );
    assert.equal(events.length, 100);
    const logged = memoryDb.all('orchestration_log');
    assert.equal(logged.length, 100);
  });
});

describe('database reconnect and outage simulation', () => {
  it('fails fast in production when Supabase is unavailable', async () => {
    process.env.NODE_ENV = 'production';
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    const { requirePersistenceBackend, PersistenceBackendError } = await import(
      '../app/lib/db/persistenceBackend.ts'
    );

    assert.throws(() => requirePersistenceBackend(), PersistenceBackendError);
  });

  it('recovers in-memory operations after simulated outage in development', async () => {
    const wf = await db.createWorkflowWithLog(
      'org-a',
      { name: 'recovery-wf', steps: [{ id: 's1', type: 'noop' }] },
      audit('org-a')
    );
    memoryDb.clear();
    const missing = await db.findWorkflowById('org-a', wf.id);
    assert.equal(missing, undefined);

    const recreated = await db.createWorkflowWithLog(
      'org-a',
      { name: 'recovery-wf-2', steps: [{ id: 's2', type: 'noop' }] },
      audit('org-a')
    );
    assert.ok(recreated.id);
  });
});

describe('payment partial failure reconciliation', () => {
  it('marks checkout for reconciliation when completion preconditions fail', async () => {
    const orgId = 'org-recon';
    const session = await db.beginMarketplaceCheckout(
      {
        org_id: orgId,
        item_id: 'item-x',
        gross: 10,
        fees: 2,
        taxes: 0,
        net: 8,
        idempotency_key: 'recon-key',
      },
      audit(orgId)
    );

    await assert.rejects(
      () =>
        db.completeMarketplaceCheckout(orgId, String(session.id), audit(orgId), {
          period: new Date().toISOString(),
        }),
      /checkout_not_charged/
    );

    await db.recordMarketplaceCharge(orgId, String(session.id), 'charge-recon', audit(orgId));
    const marked = await db.markCheckoutNeedsReconciliation(
      orgId,
      String(session.id),
      'simulated_completion_failure',
      audit(orgId)
    );
    assert.equal(marked?.status, 'needs_reconciliation');
  });
});
