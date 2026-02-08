import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cordyceps Medicinal Properties - Energy & Performance',
  description: 'Evidence-based overview of cordyceps (Cordyceps militaris): cordycepin, adenosine, energy metabolism, endurance, and traditional uses.',
  keywords: ['cordyceps', 'Cordyceps militaris', 'medicinal mushroom', 'cordycepin', 'energy', 'endurance', 'ATP production'],
  other: {
    tags: ['medicinal', 'cordyceps', 'militaris', 'energy', 'cordycepin', 'performance', 'metabolism'].join(','),
  },
};

export default function CordycepsMedicinalPage() {
  return (
    <main className="p-8 max-w-3xl">
      <h1 className="text-4xl font-bold mb-6">Cordyceps (Cordyceps militaris)</h1>

      <p className="text-lg mt-4">
        Cordyceps militaris is a medicinal mushroom traditionally associated with
        energy, endurance, and metabolic support. In nature, it parasitizes insects,
        but cultivated Cordyceps is grown on grain‑based substrates and produces
        bright orange fruiting bodies rich in bioactive compounds.
      </p>

      <h2 className="text-2xl font-semibold mt-10">Key Compounds</h2>
      <ul className="list-disc ml-8 mt-4 text-lg">
        <li><strong>Cordycepin:</strong> A nucleoside analog studied for metabolic and cellular effects.</li>
        <li><strong>Adenosine:</strong> Associated with energy pathways and oxygen utilization.</li>
        <li><strong>Beta‑glucans:</strong> Polysaccharides linked to immune modulation.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-10">Traditional Uses</h2>
      <p className="text-lg mt-3">
        Historically used in East Asian herbal traditions for vitality, stamina,
        respiratory support, and overall resilience.
      </p>

      <h2 className="text-2xl font-semibold mt-10">Research Areas</h2>
      <ul className="list-disc ml-8 mt-4 text-lg">
        <li>Energy metabolism</li>
        <li>Endurance and oxygen utilization</li>
        <li>Respiratory function</li>
        <li>Immune system interaction</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-10">Preparation Methods</h2>
      <ul className="list-disc ml-8 mt-4 text-lg">
        <li>Dried fruiting bodies (tea or powder)</li>
        <li>Alcohol or dual extracts</li>
        <li>Capsules (powdered fruiting body)</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-10">Next Steps</h2>
      <ul className="list-disc ml-8 mt-4 text-lg">
        <li><a href="/medicinal-mushrooms/chaga" className="text-blue-600 underline">Chaga</a></li>
        <li><a href="/medicinal-mushrooms/reishi" className="text-blue-600 underline">Reishi</a></li>
      </ul>
    </main>
  );
}