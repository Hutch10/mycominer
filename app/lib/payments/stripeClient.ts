import Stripe from 'stripe';

export type StripeMode = 'disabled' | 'test' | 'live';

let stripeClient: Stripe | null = null;

export function getStripeMode(): StripeMode {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secretKey) {
    return 'disabled';
  }
  if (secretKey.startsWith('sk_live_')) {
    return 'live';
  }
  return 'test';
}

export function isStripeConfigured(): boolean {
  return getStripeMode() !== 'disabled';
}

export function getStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }

  if (!stripeClient) {
    stripeClient = new Stripe(secretKey, {
      apiVersion: '2026-05-27.dahlia',
      typescript: true,
      maxNetworkRetries: 2,
    });
  }

  return stripeClient;
}

export function getStripeWebhookSecret(): string | null {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  return secret || null;
}
