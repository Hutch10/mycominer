import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Growing Chestnut Mushrooms - Cluster Cultivation',
  description: 'Chestnut mushroom cultivation guide (Pholiota adiposa): beautiful clusters, nutty flavor, hardwood substrates, and moderate difficulty.',
  keywords: ['chestnut mushroom', 'Pholiota adiposa', 'mushroom cultivation', 'cluster formation', 'hardwood substrate', 'gourmet'],
  other: {
    tags: ['growing-guides', 'chestnut', 'pholiota', 'clusters', 'hardwood', 'gourmet', 'cultivation'].join(','),
  },
};

export default function ChestnutGuidePage() {
  return (
    <main className="p-8 max-w-3xl">
      <h1 className="text-4xl font-bold mb-6">Chestnut Mushroom (Pholiota adiposa)</h1>

      <p className="text-lg mt-4">
        Chestnut mushrooms produce beautiful clusters of orange‑brown caps with a
        crunchy texture and nutty flavor. They grow well on hardwood‑based
        substrates and form dense, photogenic clusters that appeal to gourmet
        growers.
      </p>

      <h2 className="text-2xl font-semibold mt-10">Best Substrates</h2>
      <ul className="list-disc ml-8 mt-4 text-lg">
        <li>Hardwood sawdust</li>
        <li>Supplemented sawdust</li>
        <li>Hardwood pellets + bran</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-10">Colonization Conditions</h2>
      <ul className="list-disc ml-8 mt-4 text-lg">
        <li>Temperature: 68–75°F</li>
        <li>Light: Not required</li>
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
        Chestnuts prefer slightly cooler fruiting temperatures and develop their
        best color under moderate light.
      </p>

      <h2 className="text-2xl font-semibold mt-10">Harvesting</h2>
      <p className="text-lg mt-3">
        Harvest when caps are fully colored and before the veil breaks. Chestnuts
        have a crisp texture and hold up well in cooking.
      </p>

      <h2 className="text-2xl font-semibold mt-10">Common Issues</h2>
      <ul className="list-disc ml-8 mt-4 text-lg">
        <li>Long stems → CO₂ too high</li>
        <li>Pale caps → insufficient light</li>
        <li>Slow colonization → low temperature</li>
        <li>Dry caps → low humidity</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-10">Next Steps</h2>
      <ul className="list-disc ml-8 mt-4 text-lg">
        <li><a href="/growing-guides/pioppino" className="text-blue-600 underline">Pioppino</a></li>
      </ul>
    </main>
  );
}