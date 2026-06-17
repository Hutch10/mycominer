import { NextResponse } from 'next/server';
import { z } from 'zod';
import { toAuditContext } from '../../../lib/db/auditContext';
import { db } from '../../../lib/db';
import { rejectClientOrgId } from '../../../lib/auth/persistenceAuth';
import { withPersistenceAuthOrg } from '../../../lib/auth/withPersistenceAuth';
import { paymentsAdapter } from '../../../lib/payments/stripeAdapter';
import { calculateRevenueShares } from '../../../lib/economy/revenueShareEngine';

const Body = z.object({
  itemId: z.string(),
  paymentMethodId: z.string(),
  price: z.number(),
  orgId: z.string().optional(),
});

export const POST = withPersistenceAuthOrg(
  async (req, ctx) => {
    const body = Body.parse(await req.json());
    const orgDenied = rejectClientOrgId(body.orgId ?? null, ctx);
    if (orgDenied) {
      return NextResponse.json({ error: orgDenied.error }, { status: orgDenied.status });
    }

    const idempotencyKey = req.headers.get('idempotency-key')?.trim();
    if (!idempotencyKey) {
      return NextResponse.json({ error: 'idempotency_key_required' }, { status: 400 });
    }

    const audit = toAuditContext(ctx);
    const shares = calculateRevenueShares(body.price, { platformPercent: 20 });

    const session = await db.beginMarketplaceCheckout(
      {
        org_id: ctx.orgId,
        item_id: body.itemId,
        gross: body.price,
        fees: shares.platformFee,
        taxes: 0,
        net: shares.developerShare,
        idempotency_key: idempotencyKey,
      },
      audit
    );

    const sessionStatus = String(session.status ?? '');
    const sessionId = String(session.id);

    if (sessionStatus === 'completed') {
      const revenueId = session.revenue_id;
      return NextResponse.json({
        session,
        shares,
        rev: revenueId ? { id: revenueId } : null,
        idempotentReplay: true,
      });
    }

    if (sessionStatus === 'needs_reconciliation') {
      return NextResponse.json(
        { error: 'checkout_needs_reconciliation', session },
        { status: 409 }
      );
    }

    let chargeId = session.charge_id ? String(session.charge_id) : null;

    if (!chargeId) {
      const charge = await paymentsAdapter.charge(
        body.paymentMethodId,
        Math.round(body.price * 100),
        'USD',
        {
          idempotencyKey,
          metadata: {
            orgId: ctx.orgId,
            sessionId,
            idempotencyKey,
            itemId: body.itemId,
          },
        }
      );
      if (charge.status !== 'succeeded') {
        return NextResponse.json({ error: 'payment_failed' }, { status: 402 });
      }
      chargeId = charge.id;
      await db.recordMarketplaceCharge(ctx.orgId, sessionId, chargeId, audit);
    }

    try {
      const completed = await db.completeMarketplaceCheckout(ctx.orgId, sessionId, audit, {
        developer_id: null,
        period: new Date().toISOString(),
        payload: { itemId: body.itemId, chargeId, shares },
      });

      return NextResponse.json({
        charge: { id: chargeId, status: 'succeeded' },
        shares,
        rev: completed.revenue,
        session: completed.session,
        idempotentReplay: completed.idempotentReplay,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await db.markCheckoutNeedsReconciliation(ctx.orgId, sessionId, message, audit);
      return NextResponse.json(
        {
          error: 'checkout_completion_failed',
          chargeId,
          sessionId,
          needsReconciliation: true,
        },
        { status: 500 }
      );
    }
  },
  { rateLimit: 'strict' }
);
