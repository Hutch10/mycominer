import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Turkey Tail Medicinal Properties - Immune Research',
  description: 'Evidence-based overview of turkey tail (Trametes versicolor): PSK, PSP polysaccharides, immune research, and clinical applications.',
  keywords: ['turkey tail', 'Trametes versicolor', 'medicinal mushroom', 'PSK', 'PSP', 'polysaccharides', 'immune support'],
  other: {
    tags: ['medicinal', 'turkey-tail', 'trametes', 'immune', 'polysaccharides', 'PSK', 'research'].join(','),
  },
};

export default function TurkeyTailMedicinalPage() {
  return (
    <main className="p-8 max-w-3xl">
      <h1 className="text-4xl font-bold mb-6">Turkey Tail (Trametes versicolor)</h1>

      <p className="text-lg mt-4">
        Turkey Tail is a medicinal mushroom known for its colorful, layered
        appearance and its rich concentration of immune‑active polysaccharides.
        It has been used traditionally and studied in modern contexts for its
        potential immune‑supportive properties.
      </p>

      <h2 className="text-2xl font-semibold mt-10">Key Compounds</h2>
      <ul className="list-disc ml-8 mt-4 text-lg">
        <li><strong>PSK (Polysaccharide‑K):</strong> A protein‑bound polysaccharide studied for immune modulation.</li>
        <li><strong>PSP (Polysaccharopeptide):</strong> Another immune‑active compound found in some strains.</li>
        <li><strong>Beta‑glucans:</strong> Polysaccharides associated with immune system interaction.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-10">Traditional Uses</h2>
      <p className="text-lg mt-3">
        Historically used in East Asian herbal traditions for vitality and immune
        support, often prepared as a tea or decoction.
      </p>

      <h2 className="text-2xl font-semibold mt-10">Research Areas</h2>
      <ul className="list-disc ml-8 mt-4 text-lg">
        <li>Immune system modulation</li>
        <li>Gut microbiome interactions</li>
        <li>General vitality and resilience</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-10">Preparation Methods</h2>
      <ul className="list-disc ml-8 mt-4 text-lg">
        <li>Hot water extraction (tea or decoction)</li>
        <li>Powdered fruiting body</li>
        <li>Dual extraction</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-10">Next Steps</h2>
      <ul className="list-disc ml-8 mt-4 text-lg">
        <li><a href="/medicinal-mushrooms/cordyceps" className="text-blue-600 underline">Cordyceps</a></li>
        <li><a href="/medicinal-mushrooms/chaga" className="text-blue-600 underline">Chaga</a></li>
      </ul>
    </main>
  );
}