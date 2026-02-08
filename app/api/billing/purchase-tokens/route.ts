import { NextResponse } from 'next/server';
import { z } from 'zod';
import { paymentsAdapter } from '../../../../lib/payments/stripeAdapter';
import { licenseService } from '../../../../lib/economy/licenseService';

const Body = z.object({ orgId: z.string(), amount: z.number().positive(), paymentMethodId: z.string() });

export async function POST(req: Request) {
  const body = Body.parse(await req.json());
  // charge via payments adapter
  const charge = await paymentsAdapter.charge(body.paymentMethodId, Math.round(body.amount * 100), 'USD');
  if (charge.status !== 'succeeded') return NextResponse.json({ error: 'payment_failed' }, { status: 402 });
  // mint tokens on success
  const minted = await licenseService.mintTokens(body.orgId, body.amount, 'purchase', { chargeId: charge.id });
  return NextResponse.json({ charge, minted });
}
