import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { paymentsAdapter } from '../app/lib/payments/stripeAdapter.ts';
import { getStripeMode, getStripeWebhookSecret } from '../app/lib/payments/stripeClient.ts';
import { db } from '../app/lib/db/repository.ts';
import { db as memoryDb } from '../app/lib/db/inMemoryDb.ts';
import { toAuditContext } from '../app/lib/db/auditContext.ts';

const originalEnv = { ...process.env };

beforeEach(() => {
  process.env = { ...originalEnv, NODE_ENV: 'development' };
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  delete process.env.STRIPE_SECRET_KEY;
  delete process.env.STRIPE_WEBHOOK_SECRET;
  memoryDb.clear();
});

afterEach(() => {
  process.env = { ...originalEnv };
  memoryDb.clear();
});

function audit(orgId: string) {
  return toAuditContext({ userId: 'ga-test', orgId, requestId: 'ga-req' });
}

describe('GA Stripe operational flows (stub/test mode)', () => {
  it('defaults to disabled stub mode without STRIPE_SECRET_KEY', () => {
    assert.equal(getStripeMode(), 'disabled');
    assert.equal(paymentsAdapter.isLiveChargesEnabled(), false);
  });

  it('successful checkout: begin → charge → complete with idempotent replay', async () => {
    const orgId = 'org-ga';
    const idempotencyKey = 'ga-checkout-1';
    const auditCtx = audit(orgId);

    const session = await db.beginMarketplaceCheckout(
      {
        org_id: orgId,
        item_id: 'item-ga',
        gross: 50,
        fees: 10,
        taxes: 0,
        net: 40,
        idempotency_key: idempotencyKey,
      },
      auditCtx
    );

    const charge = await paymentsAdapter.charge('pm_test', 5000, 'USD', {
      idempotencyKey,
      metadata: { orgId, sessionId: String(session.id) },
    });
    assert.equal(charge.status, 'succeeded');
    assert.equal(charge.mode, 'disabled');

    await db.recordMarketplaceCharge(orgId, String(session.id), charge.id, auditCtx);

    const completed = await db.completeMarketplaceCheckout(orgId, String(session.id), auditCtx, {
      developer_id: null,
      period: new Date().toISOString(),
      payload: { source: 'ga-test' },
    });
    assert.equal(completed.idempotentReplay, false);

    const replay = await db.completeMarketplaceCheckout(orgId, String(session.id), auditCtx, {
      developer_id: null,
      period: new Date().toISOString(),
      payload: { source: 'ga-test-replay' },
    });
    assert.equal(replay.idempotentReplay, true);
    assert.equal(replay.revenue.id, completed.revenue.id);

    const logs = memoryDb.all('orchestration_log');
    const eventTypes = logs.map((l) => l.eventType ?? l.event_type);
    assert.ok(eventTypes.includes('marketplace_checkout_started'));
    assert.ok(eventTypes.includes('marketplace_charge_recorded'));
    assert.ok(eventTypes.includes('marketplace_revenue_recorded'));
  });

  it('duplicate begin returns same session (idempotent)', async () => {
    const orgId = 'org-dup';
    const key = 'dup-key';
    const input = {
      org_id: orgId,
      item_id: 'item-dup',
      gross: 10,
      fees: 2,
      taxes: 0,
      net: 8,
      idempotency_key: key,
    };
    const a = await db.beginMarketplaceCheckout(input, audit(orgId));
    const b = await db.beginMarketplaceCheckout(input, audit(orgId));
    assert.equal(a.id, b.id);
  });

  it('reconciliation flow marks needs_reconciliation', async () => {
    const orgId = 'org-recon';
    const session = await db.beginMarketplaceCheckout(
      {
        org_id: orgId,
        item_id: 'item-recon',
        gross: 25,
        fees: 5,
        taxes: 0,
        net: 20,
        idempotency_key: 'recon-key',
      },
      audit(orgId)
    );

    await db.recordMarketplaceCharge(orgId, String(session.id), 'ch_failed_complete', audit(orgId));

    const marked = await db.markCheckoutNeedsReconciliation(
      orgId,
      String(session.id),
      'simulated_completion_failure',
      audit(orgId)
    );
    assert.equal(marked.status, 'needs_reconciliation');

    const logs = memoryDb.all('orchestration_log');
    assert.ok(
      logs.some(
        (l) =>
          (l.eventType ?? l.event_type) === 'marketplace_checkout_needs_reconciliation'
      )
    );
  });

  it('webhook secret is unset in test environment', () => {
    assert.equal(getStripeWebhookSecret(), null);
  });
});
