"use client";
import React from 'react';

type Props = { orgId: string; tokens: any[] };

export default function TokenBalanceCard({ orgId, tokens }: Props) {
  const balance = tokens.reduce((s, t) => s + Number(t.amount), 0);
  return (
    <div style={{ border: '1px solid #ddd', padding: 12, borderRadius: 6 }}>
      <h3>Token Balance</h3>
      <p>Org: {orgId}</p>
      <p style={{ fontSize: 24, fontWeight: 700 }}>{balance} tokens</p>
    </div>
  );
}
