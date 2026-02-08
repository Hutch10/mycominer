import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Growing Enoki Mushrooms - Cold Temperature Cultivation',
  description: 'Enoki cultivation guide (Flammulina velutipes): white delicate clusters, cold temperatures, low light, and precise environmental control.',
  keywords: ['enoki', 'Flammulina velutipes', 'mushroom cultivation', 'cold growing', 'white enoki', 'delicate clusters'],
  other: {
    tags: ['growing-guides', 'enoki', 'flammulina', 'cold', 'temperature', 'delicate', 'cultivation'].join(','),
  },
};

export default function EnokiGuidePage() {
  return (
    <main className="p-8 max-w-3xl">
      <h1 className="text-4xl font-bold mb-6">Enoki (Flammulina velutipes)</h1>

      <p className="text-lg mt-4">
        Enoki is a delicate gourmet mushroom known for its long, thin stems and
        tiny caps. Its morphology is shaped almost entirely by environmental
        conditions, especially temperature and airflow.
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
        <li>Gas exchange: Low</li>
        <li>Timeline: 2–3 weeks</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-10">Fruiting Conditions</h2>
      <p className="text-lg mt-3">
        Enoki morphology is highly environment‑dependent:
      </p>

      <ul className="list-disc ml-8 mt-4 text-lg">
        <li><strong>Cold temperatures (40–55°F):</strong> Long stems, tiny caps (classic enoki)</li>
        <li><strong>Warmer temperatures:</strong> Shorter stems, larger caps</li>
      </ul>

      <ul className="list-disc ml-8 mt-4 text-lg">
        <li>Humidity: 85–95%</li>
        <li>Fresh air: Low</li>
        <li>Light: Low</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-10">Harvesting</h2>
      <p className="text-lg mt-3">
        Harvest when stems reach desired length and caps are still small. Enoki is
        typically grown in jars or bottles to encourage vertical growth.
      </p>

      <h2 className="text-2xl font-semibold mt-10">Common Issues</h2>
      <ul className="list-disc ml-8 mt-4 text-lg">
        <li>Large caps → temperature too warm</li>
        <li>Short stems → too much airflow</li>
        <li>Drying → low humidity</li>
        <li>Slow colonization → low temperature</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-10">Next Steps</h2>
      <ul className="list-disc ml-8 mt-4 text-lg">
        <li><a href="/growing-guides/oyster" className="text-blue-600 underline">Oyster Mushrooms</a></li>
      </ul>
    </main>
  );
}