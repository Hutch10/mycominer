import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { toAuditContext } from '../../../../lib/db/auditContext';
import { db } from '../../../../lib/db';
import { getStripeClient, getStripeWebhookSecret } from '../../../../lib/payments/stripeClient';

export const runtime = 'nodejs';

async function reconcilePaymentIntent(intent: Stripe.PaymentIntent): Promise<void> {
  const chargeId = intent.id;
  const orgId = intent.metadata?.orgId;
  const sessionId = intent.metadata?.sessionId;
  const idempotencyKey = intent.metadata?.idempotencyKey;

  if (intent.status !== 'succeeded') {
    return;
  }

  if (orgId && sessionId) {
    try {
      const audit = toAuditContext({
        userId: 'stripe-webhook',
        orgId,
        requestId: `wh_${intent.id}`,
      });

      await db.recordMarketplaceCharge(orgId, sessionId, chargeId, audit);

      await db.completeMarketplaceCheckout(orgId, sessionId, audit, {
        developer_id: null,
        period: new Date().toISOString(),
        payload: {
          source: 'stripe_webhook',
          chargeId,
          idempotencyKey,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (orgId && sessionId) {
        const audit = toAuditContext({
          userId: 'stripe-webhook',
          orgId,
          requestId: `wh_${intent.id}`,
        });
        await db.markCheckoutNeedsReconciliation(orgId, sessionId, message, audit);
      }
    }
    return;
  }

  if (orgId && idempotencyKey) {
    await db.recordAuditEvent(
      toAuditContext({
        userId: 'stripe-webhook',
        orgId,
        requestId: `wh_${intent.id}`,
      }),
      {
        eventType: 'stripe_payment_intent_succeeded',
        payload: {
          chargeId,
          idempotencyKey,
          amount: intent.amount,
          currency: intent.currency,
        },
      }
    );
  }
}

export async function POST(req: Request): Promise<Response> {
  const webhookSecret = getStripeWebhookSecret();
  if (!webhookSecret) {
    return NextResponse.json({ error: 'stripe_webhook_not_configured' }, { status: 503 });
  }

  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'missing_stripe_signature' }, { status: 400 });
  }

  const body = await req.text();

  let event: Stripe.Event;
  try {
    const stripe = getStripeClient();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'invalid_signature';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await reconcilePaymentIntent(event.data.object as Stripe.PaymentIntent);
        break;
      case 'payment_intent.payment_failed': {
        const intent = event.data.object as Stripe.PaymentIntent;
        const orgId = intent.metadata?.orgId;
        const sessionId = intent.metadata?.sessionId;
        if (orgId && sessionId) {
          await db.markCheckoutNeedsReconciliation(
            orgId,
            sessionId,
            intent.last_payment_error?.message ?? 'payment_failed',
            toAuditContext({
              userId: 'stripe-webhook',
              orgId,
              requestId: `wh_${intent.id}`,
            })
          );
        }
        break;
      }
      default:
        break;
    }
  } catch (error) {
    console.error('stripe_webhook_handler_failed', error);
    return NextResponse.json({ error: 'webhook_handler_failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
