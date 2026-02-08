import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '../../../lib/db/index';
import { paymentsAdapter } from '../../../lib/payments/stripeAdapter';
import { calculateRevenueShares } from '../../../lib/economy/revenueShareEngine';

const Body = z.object({ orgId: z.string(), itemId: z.string(), paymentMethodId: z.string(), price: z.number() });

export async function POST(req: Request) {
  const body = Body.parse(await req.json());
  // charge
  const charge = await paymentsAdapter.charge(body.paymentMethodId, Math.round(body.price * 100), 'USD');
  if (charge.status !== 'succeeded') return NextResponse.json({ error: 'payment_failed' }, { status: 402 });

  // revenue split: default platform 20%
  const shares = calculateRevenueShares(body.price, { platformPercent: 20 });

  // record marketplace revenue
  const rev = db.insert('marketplace_revenue', {
    id: `rev_${Date.now()}`,
    item_id: body.itemId,
    org_id: body.orgId,
    developer_id: null,
    gross: body.price,
    fees: shares.platformFee,
    taxes: 0,
    net: shares.developerShare,
    period: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({ charge, shares, rev });
}
