import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Growing Pioppino Mushrooms - Black Poplar Cultivation',
  description: 'Pioppino cultivation guide (Agrocybe aegerita): elegant clusters, dark caps, crunchy stems, supplemented substrates, and moderate requirements.',
  keywords: ['pioppino', 'Agrocybe aegerita', 'black poplar mushroom', 'mushroom cultivation', 'supplemented substrate', 'gourmet'],
  other: {
    tags: ['growing-guides', 'pioppino', 'agrocybe', 'clusters', 'supplemented', 'gourmet', 'cultivation'].join(','),
  },
};

export default function PioppinoGuidePage() {
  return (
    <main className="p-8 max-w-3xl">
      <h1 className="text-4xl font-bold mb-6">Pioppino (Agrocybe aegerita)</h1>

      <p className="text-lg mt-4">
        Pioppino is a gourmet mushroom known for its dark caps, crunchy stems, and
        rich, earthy flavor. It grows in elegant clusters and prefers hardwood‑
        based substrates with moderate airflow.
      </p>

      <h2 className="text-2xl font-semibold mt-10">Best Substrates</h2>
      <ul className="list-disc ml-8 mt-4 text-lg">
        <li>Hardwood sawdust</li>
        <li>Supplemented sawdust</li>
        <li>Hardwood pellets + bran</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-10">Colonization Conditions</h2>
      <ul className="list-disc ml-8 mt-4 text-lg">
        <li>Temperature: 70–75°F</li>
        <li>Light: Low</li>
        <li>Gas exchange: Moderate</li>
        <li>Timeline: 2–3 weeks</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-10">Fruiting Conditions</h2>
      <ul className="list-disc ml-8 mt-4 text-lg">
        <li>Humidity: 85–95%</li>
        <li>Fresh air: Moderate</li>
        <li>Light: Indirect, bright</li>
        <li>Temperature: 55–70°F</li>
      </ul>

      <p className="text-lg mt-3">
        Pioppino forms tight clusters with long stems and dark caps. Too much
        airflow causes caps to dry; too little airflow causes elongated stems.
      </p>

      <h2 className="text-2xl font-semibold mt-10">Harvesting</h2>
      <p className="text-lg mt-3">
        Harvest when caps are fully colored and before they flatten. Pioppino has
        excellent texture and holds up well in stir‑fries and soups.
      </p>

      <h2 className="text-2xl font-semibold mt-10">Common Issues</h2>
      <ul className="list-disc ml-8 mt-4 text-lg">
        <li>Long stems → CO₂ too high</li>
        <li>Pale caps → insufficient light</li>
        <li>Dry caps → low humidity</li>
        <li>Slow colonization → low temperature</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-10">Next Steps</h2>
      <ul className="list-disc ml-8 mt-4 text-lg">
        <li><a href="/growing-guides/king-oyster" className="text-blue-600 underline">King Oyster</a></li>
        <li><a href="/growing-guides/chestnut" className="text-blue-600 underline">Chestnut</a></li>
      </ul>
    </main>
  );
}