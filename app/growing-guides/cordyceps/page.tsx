import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Growing Cordyceps Mushrooms - Specialized Cultivation',
  description: 'Cordyceps cultivation guide (Cordyceps militaris): specialized substrates, bright light requirements, orange pigmentation, and medicinal properties.',
  keywords: ['cordyceps', 'Cordyceps militaris', 'medicinal mushroom', 'specialized substrate', 'bright light', 'cordycepin'],
  other: {
    tags: ['growing-guides', 'cordyceps', 'militaris', 'medicinal', 'light', 'specialized', 'advanced'].join(','),
  },
};

export default function CordycepsGuidePage() {
  return (
    <main className="p-8 max-w-3xl">
      <h1 className="text-4xl font-bold mb-6">Cordyceps (Cordyceps militaris)</h1>

      <p className="text-lg mt-4">
        Cordyceps militaris is a medicinal mushroom known for its bright orange
        fruiting bodies and bioactive compounds. It grows on insect hosts in
        nature, but in cultivation it thrives on specialized grain‑based
        substrates.
      </p>

      <h2 className="text-2xl font-semibold mt-10">Best Substrates</h2>
      <p className="text-lg mt-3">Cordyceps requires a unique substrate blend:</p>

      <ul className="list-disc ml-8 mt-4 text-lg">
        <li>Brown rice</li>
        <li>Silkworm pupae powder (optional but beneficial)</li>
        <li>Nutrient supplements (yeast extract, amino acids)</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-10">Colonization Conditions</h2>
      <ul className="list-disc ml-8 mt-4 text-lg">
        <li>Temperature: 65–70°F</li>
        <li>Light: Low</li>
        <li>Gas exchange: Low</li>
        <li>Timeline: 2–3 weeks</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-10">Fruiting Conditions</h2>
      <ul className="list-disc ml-8 mt-4 text-lg">
        <li>Humidity: 70–85%</li>
        <li>Fresh air: Low</li>
        <li>Light: Bright, indirect (12/12 cycle)</li>
        <li>Temperature: 60–70°F</li>
      </ul>

      <p className="text-lg mt-3">
        Cordyceps requires more light than most species to develop strong color.
      </p>

      <h2 className="text-2xl font-semibold mt-10">Harvesting</h2>
      <p className="text-lg mt-3">
        Harvest when fruiting bodies reach full height and deepen in color. Dry
        gently to preserve medicinal compounds.
      </p>

      <h2 className="text-2xl font-semibold mt-10">Common Issues</h2>
      <ul className="list-disc ml-8 mt-4 text-lg">
        <li>Pale color → insufficient light</li>
        <li>Weak growth → substrate lacking nutrients</li>
        <li>Slow colonization → low temperature</li>
        <li>Aborts → humidity too high</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-10">Next Steps</h2>
      <ul className="list-disc ml-8 mt-4 text-lg">
        <li><a href="/growing-guides/enoki" className="text-blue-600 underline">Enoki</a></li>
      </ul>
    </main>
  );
}