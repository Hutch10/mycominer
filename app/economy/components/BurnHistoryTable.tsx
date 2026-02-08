"use client";
import React, { useEffect, useState } from 'react';

export default function BurnHistoryTable({ orgId }: { orgId: string }) {
  const [history, setHistory] = useState<any[]>([]);
  useEffect(() => {
    fetch(`/api/economy/tokens?orgId=${orgId}`).then((r) => r.json()).then((j) => setHistory(j.tokens || []));
  }, [orgId]);

  return (
    <div style={{ border: '1px solid #eee', padding: 12, borderRadius: 6 }}>
      <h3>Burn / Token History</h3>
      <div style={{ maxHeight: 240, overflow: 'auto' }}>
        <table style={{ width: '100%' }}>
          <thead><tr><th>tokenId</th><th>amount</th><th>expiresAt</th></tr></thead>
          <tbody>{history.map((r,i)=> <tr key={i}><td>{r.id}</td><td>{r.amount}</td><td>{r.expiresAt || '—'}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
