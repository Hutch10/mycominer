import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Growing King Oyster Mushrooms - Thick Stem Cultivation',
  description: 'King oyster cultivation guide (Pleurotus eryngii): low airflow for thick stems, supplemented substrates, and gourmet quality optimization.',
  keywords: ['king oyster', 'Pleurotus eryngii', 'mushroom cultivation', 'thick stems', 'supplemented substrate', 'gourmet mushroom'],
  other: {
    tags: ['growing-guides', 'king-oyster', 'pleurotus', 'eryngii', 'supplemented', 'low-airflow', 'gourmet'].join(','),
  },
};

export default function KingOysterGuidePage() {
  return (
    <main className="p-8 max-w-3xl">
      <h1 className="text-4xl font-bold mb-6">King Oyster (Pleurotus eryngii)</h1>

      <p className="text-lg mt-4">
        King Oyster is a gourmet mushroom prized for its thick, meaty stems and
        long shelf life. Unlike other oyster species, it prefers high‑nutrition
        substrates and grows best in low‑airflow environments that encourage
        thick stem development.
      </p>

      <h2 className="text-2xl font-semibold mt-10">Best Substrates</h2>
      <ul className="list-disc ml-8 mt-4 text-lg">
        <li>Hardwood sawdust</li>
        <li>Supplemented sawdust (Masters Mix)</li>
        <li>Hardwood pellets + bran</li>
      </ul>

      <p className="text-lg mt-3">
        King Oyster does not perform well on straw or coir. It needs dense,
        nutrient‑rich substrates to form its signature thick stems.
      </p>

      <h2 className="text-2xl font-semibold mt-10">Colonization Conditions</h2>
      <ul className="list-disc ml-8 mt-4 text-lg">
        <li>Temperature: 70–75°F</li>
        <li>Light: Not required</li>
        <li>Gas exchange: Low to moderate</li>
        <li>Timeline: 10–14 days</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-10">Fruiting Conditions</h2>
      <p className="text-lg mt-3">
        King Oyster morphology is heavily influenced by airflow:
      </p>

      <ul className="list-disc ml-8 mt-4 text-lg">
        <li><strong>Low airflow:</strong> Thick stems, small caps (ideal)</li>
        <li><strong>High airflow:</strong> Thin stems, large caps</li>
      </ul>

      <ul className="list-disc ml-8 mt-4 text-lg">
        <li>Humidity: 85–95%</li>
        <li>Light: Indirect, moderate</li>
        <li>Temperature: 60–70°F</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-10">Harvesting</h2>
      <p className="text-lg mt-3">
        Harvest when stems are thick and caps are still slightly curled. King
        Oysters store exceptionally well and maintain texture after cooking.
      </p>

      <h2 className="text-2xl font-semibold mt-10">Common Issues</h2>
      <ul className="list-disc ml-8 mt-4 text-lg">
        <li>Large caps → too much airflow</li>
        <li>Thin stems → insufficient substrate nutrition</li>
        <li>Drying → low humidity</li>
        <li>Slow colonization → low temperature</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-10">Next Steps</h2>
      <ul className="list-disc ml-8 mt-4 text-lg">
        <li><a href="/growing-guides/chestnut" className="text-blue-600 underline">Chestnut Mushrooms</a></li>
        <li><a href="/growing-guides/pioppino" className="text-blue-600 underline">Pioppino</a></li>
      </ul>
    </main>
  );
}