import { NextResponse } from 'next/server';

import { z } from 'zod';

import { paymentsAdapter } from '../../../lib/payments/stripeAdapter';

import { licenseService } from '../../../lib/economy/licenseService';

import { rejectClientOrgId } from '../../../lib/auth/persistenceAuth';

import { withPersistenceAuthOrg } from '../../../lib/auth/withPersistenceAuth';

import { toAuditContext } from '../../../lib/db/auditContext';

import { db } from '../../../lib/db';



const Body = z.object({

  amount: z.number().positive(),

  paymentMethodId: z.string(),

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

    const existingReplay = await db.getTokenPurchaseReplay(ctx.orgId, idempotencyKey);

    if (existingReplay) {

      await db.recordAuditEvent(audit, {

        eventType: 'tokens_purchase_idempotent_replay',

        payload: { orgId: ctx.orgId, idempotencyKey },

      });

      return NextResponse.json({ ...existingReplay, idempotentReplay: true });

    }



    await db.recordAuditEvent(audit, {

      eventType: 'tokens_purchase_started',

      payload: { orgId: ctx.orgId, amount: body.amount, idempotencyKey },

    });



    let charge;

    try {

      charge = await paymentsAdapter.charge(

        body.paymentMethodId,

        Math.round(body.amount * 100),

        'USD',

        {

          idempotencyKey,

          metadata: {

            orgId: ctx.orgId,

            idempotencyKey,

            flow: 'token_purchase',

          },

        }

      );

      if (charge.status !== 'succeeded') {

        return NextResponse.json({ error: 'payment_failed' }, { status: 402 });

      }



      const minted = await licenseService.mintTokens(ctx.orgId, body.amount, 'purchase', {

        chargeId: charge.id,

        idempotencyKey,

      });



      await db.recordAuditEvent(audit, {

        eventType: 'tokens_purchased',

        payload: {

          orgId: ctx.orgId,

          amount: body.amount,

          chargeId: charge.id,

          tokensIssued: minted.tokensIssued,

          transactionId: minted.transactionId,

          idempotencyKey,

        },

      });



      const result = { charge, minted };

      const saved = await db.saveTokenPurchaseReplay(ctx.orgId, idempotencyKey, result);

      return NextResponse.json(saved);

    } catch (error) {

      const message = error instanceof Error ? error.message : String(error);

      await db.recordAuditEvent(audit, {

        eventType: 'tokens_purchase_needs_reconciliation',

        payload: {

          orgId: ctx.orgId,

          amount: body.amount,

          chargeId: charge?.id,

          idempotencyKey,

          failureReason: message,

        },

      });

      return NextResponse.json(

        { error: 'tokens_purchase_failed', needsReconciliation: true, chargeId: charge?.id },

        { status: 500 }

      );

    }

  },

  { rateLimit: 'strict' }

);

