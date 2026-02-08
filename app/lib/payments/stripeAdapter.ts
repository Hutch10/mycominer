/**
 * Stripe Payment Adapter Stub
 * 
 * Handles payment processing through Stripe.
 * In production, integrate with actual Stripe API.
 */

interface ChargeResult {
  id: string;
  status: 'succeeded' | 'failed' | 'pending';
  amount: number;
  currency: string;
  timestamp: string;
}

class PaymentsAdapter {
  /**
   * Charge a payment method
   * @param paymentMethodId Stripe payment method ID
   * @param amountCents Amount in cents
   * @param currency Currency code (USD, EUR, etc.)
   */
  async charge(paymentMethodId: string, amountCents: number, currency: string): Promise<ChargeResult> {
    // Stub implementation - always succeeds
    return {
      id: `charge_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      status: 'succeeded',
      amount: amountCents,
      currency,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Refund a charge
   */
  async refund(chargeId: string): Promise<ChargeResult> {
    return {
      id: `refund_${Date.now()}`,
      status: 'succeeded',
      amount: 0,
      currency: 'USD',
      timestamp: new Date().toISOString(),
    };
  }
}

export const paymentsAdapter = new PaymentsAdapter();
