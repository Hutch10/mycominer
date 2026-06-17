import {
  getStripeClient,
  getStripeMode,
  isStripeConfigured,
  type StripeMode,
} from './stripeClient';

export interface ChargeResult {
  id: string;
  status: 'succeeded' | 'failed' | 'pending';
  amount: number;
  currency: string;
  timestamp: string;
  mode: StripeMode;
}

export interface ChargeOptions {
  idempotencyKey?: string;
  metadata?: Record<string, string>;
}

function stubCharge(
  paymentMethodId: string,
  amountCents: number,
  currency: string
): ChargeResult {
  return {
    id: `test_charge_${paymentMethodId}_${amountCents}`,
    status: 'succeeded',
    amount: amountCents,
    currency,
    timestamp: new Date().toISOString(),
    mode: 'disabled',
  };
}

class PaymentsAdapter {
  getMode(): StripeMode {
    return getStripeMode();
  }

  isLiveChargesEnabled(): boolean {
    return isStripeConfigured();
  }

  async charge(
    paymentMethodId: string,
    amountCents: number,
    currency: string,
    options: ChargeOptions = {}
  ): Promise<ChargeResult> {
    if (!isStripeConfigured()) {
      return stubCharge(paymentMethodId, amountCents, currency);
    }

    const stripe = getStripeClient();
    const intent = await stripe.paymentIntents.create(
      {
        amount: amountCents,
        currency: currency.toLowerCase(),
        payment_method: paymentMethodId,
        confirm: true,
        automatic_payment_methods: { enabled: false, allow_redirects: 'never' },
        metadata: options.metadata,
      },
      options.idempotencyKey
        ? { idempotencyKey: options.idempotencyKey }
        : undefined
    );

    const status =
      intent.status === 'succeeded'
        ? 'succeeded'
        : intent.status === 'processing'
          ? 'pending'
          : 'failed';

    return {
      id: intent.id,
      status,
      amount: intent.amount,
      currency: intent.currency,
      timestamp: new Date(intent.created * 1000).toISOString(),
      mode: getStripeMode(),
    };
  }

  async refund(chargeId: string): Promise<ChargeResult> {
    if (!isStripeConfigured()) {
      return {
        id: `test_refund_${chargeId}`,
        status: 'succeeded',
        amount: 0,
        currency: 'USD',
        timestamp: new Date().toISOString(),
        mode: 'disabled',
      };
    }

    const stripe = getStripeClient();
    const refund = await stripe.refunds.create({ payment_intent: chargeId });

    return {
      id: refund.id,
      status: refund.status === 'succeeded' ? 'succeeded' : 'pending',
      amount: refund.amount ?? 0,
      currency: refund.currency ?? 'usd',
      timestamp: new Date().toISOString(),
      mode: getStripeMode(),
    };
  }
}

export const paymentsAdapter = new PaymentsAdapter();
