import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Growing Shiitake Mushrooms - Log & Block Cultivation',
  description: 'Comprehensive shiitake cultivation guide (Lentinula edodes): browning phase, cold shocking, hardwood substrates, and fruiting optimization.',
  keywords: ['shiitake', 'Lentinula edodes', 'mushroom cultivation', 'log cultivation', 'browning phase', 'hardwood mushroom'],
  other: {
    tags: ['growing-guides', 'shiitake', 'lentinula', 'hardwood', 'browning', 'cold-shock', 'cultivation'].join(','),
  },
};

export default function ShiitakeGuidePage() {
  return (
    <main className="p-8 max-w-3xl">
      <h1 className="text-4xl font-bold mb-6">Shiitake (Lentinula edodes)</h1>

      <p className="text-lg mt-4">
        Shiitake is a gourmet mushroom known for its rich flavor and firm texture.
        It grows best on hardwood‑based substrates and has a unique “browning”
        phase that distinguishes it from other species.
      </p>

      <h2 className="text-2xl font-semibold mt-10">Best Substrates</h2>
      <ul className="list-disc ml-8 mt-4 text-lg">
        <li>Hardwood sawdust</li>
        <li>Hardwood logs</li>
        <li>Supplemented sawdust (for faster yields)</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-10">Colonization Conditions</h2>
      <ul className="list-disc ml-8 mt-4 text-lg">
        <li>Temperature: 70–75°F</li>
        <li>Light: Low</li>
        <li>Gas exchange: Low</li>
        <li>Timeline: 8–12 weeks</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-10">The Browning Phase</h2>
      <p className="text-lg mt-3">
        After colonization, shiitake blocks undergo a browning or “maturation”
        phase where the mycelium thickens and forms a protective rind. This is
        essential for strong fruiting.
      </p>

      <ul className="list-disc ml-8 mt-4 text-lg">
        <li>Occurs over 2–4 weeks</li>
        <li>Requires light and airflow</li>
        <li>Indicates readiness to fruit</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-10">Fruiting Conditions</h2>
      <ul className="list-disc ml-8 mt-4 text-lg">
        <li>Humidity: 85–95%</li>
        <li>Fresh air: Moderate</li>
        <li>Light: Indirect, bright</li>
        <li>Temperature: 55–70°F</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-10">Harvesting</h2>
      <p className="text-lg mt-3">
        Harvest when caps are mostly open but edges are still curled. Overripe
        shiitake become thin and leathery.
      </p>

      <h2 className="text-2xl font-semibold mt-10">Common Issues</h2>
      <ul className="list-disc ml-8 mt-4 text-lg">
        <li>No browning → insufficient airflow or light</li>
        <li>Weak fruits → substrate under‑supplemented</li>
        <li>Dry caps → low humidity</li>
        <li>Slow colonization → low temperature</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-10">Next Steps</h2>
      <ul className="list-disc ml-8 mt-4 text-lg">
        <li><a href="/growing-guides/oyster" className="text-blue-600 underline">Oyster Mushrooms</a></li>
        <li><a href="/growing-guides/lions-mane" className="text-blue-600 underline">Lion’s Mane</a></li>
      </ul>
    </main>
  );
}