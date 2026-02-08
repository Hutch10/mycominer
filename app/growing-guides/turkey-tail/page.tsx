import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Growing Turkey Tail Mushrooms - Medicinal Shelf Fungi',
  description: 'Turkey tail cultivation guide (Trametes versicolor): colorful shelf formation, hardwood substrates, medicinal extraction, and long colonization.',
  keywords: ['turkey tail', 'Trametes versicolor', 'medicinal mushroom', 'polysaccharides', 'hardwood substrate', 'shelf fungus'],
  other: {
    tags: ['growing-guides', 'turkey-tail', 'trametes', 'medicinal', 'hardwood', 'polysaccharides', 'cultivation'].join(','),
  },
};

export default function TurkeyTailGuidePage() {
  return (
    <main className="p-8 max-w-3xl">
      <h1 className="text-4xl font-bold mb-6">Turkey Tail (Trametes versicolor)</h1>

      <p className="text-lg mt-4">
        Turkey Tail is a medicinal mushroom known for its colorful, fan‑shaped
        fruiting bodies and immune‑supportive compounds. It grows slowly and
        prefers hardwood‑based substrates with stable humidity and airflow.
      </p>

      <h2 className="text-2xl font-semibold mt-10">Best Substrates</h2>
      <ul className="list-disc ml-8 mt-4 text-lg">
        <li>Hardwood sawdust</li>
        <li>Supplemented sawdust</li>
        <li>Hardwood logs</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-10">Colonization Conditions</h2>
      <ul className="list-disc ml-8 mt-4 text-lg">
        <li>Temperature: 70–75°F</li>
        <li>Light: Low</li>
        <li>Gas exchange: Low</li>
        <li>Timeline: 4–8 weeks</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-10">Fruiting Conditions</h2>
      <ul className="list-disc ml-8 mt-4 text-lg">
        <li>Humidity: 85–95%</li>
        <li>Fresh air: Moderate</li>
        <li>Light: Indirect, bright</li>
        <li>Temperature: 55–70°F</li>
      </ul>

      <p className="text-lg mt-3">
        Turkey Tail forms thin, layered shelves. Good airflow and light help
        develop strong coloration.
      </p>

      <h2 className="text-2xl font-semibold mt-10">Harvesting</h2>
      <p className="text-lg mt-3">
        Harvest when the bands of color are fully developed and the edges are firm.
        Turkey Tail is typically dried for teas or extracts.
      </p>

      <h2 className="text-2xl font-semibold mt-10">Common Issues</h2>
      <ul className="list-disc ml-8 mt-4 text-lg">
        <li>Pale colors → insufficient light</li>
        <li>Slow colonization → low temperature</li>
        <li>Thin shelves → low humidity</li>
        <li>Weak growth → substrate under‑supplemented</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-10">Next Steps</h2>
      <ul className="list-disc ml-8 mt-4 text-lg">
        <li><a href="/growing-guides/cordyceps" className="text-blue-600 underline">Cordyceps</a></li>
      </ul>
    </main>
  );
}