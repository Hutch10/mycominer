"use client";
import React, { useEffect, useState } from 'react';

export default function UsageAnalyticsPanel({ orgId }: { orgId: string }) {
  const [data, setData] = useState<any[]>([]);
  useEffect(() => {
    fetch(`/api/billing/usage?orgId=${orgId}`).then((r) => r.json()).then((j) => setData(j.data || []));
  }, [orgId]);

  const total = data.reduce((s, d) => s + Number(d.units || 0), 0);
  return (
    <div style={{ border: '1px solid #eee', padding: 12, borderRadius: 6 }}>
      <h3>Usage Analytics</h3>
      <p>Total units: {total}</p>
      <div style={{ maxHeight: 200, overflow: 'auto' }}>
        <table style={{ width: '100%' }}>
          <thead><tr><th>ts</th><th>resource</th><th>units</th></tr></thead>
          <tbody>{data.map((r,i)=> <tr key={i}><td>{r.timestamp}</td><td>{r.resourceType}</td><td>{r.units}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
