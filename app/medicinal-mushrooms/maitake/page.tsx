import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Maitake Medicinal Properties - Immune & Metabolic',
  description: "Evidence-based overview of maitake (Grifola frondosa), 'hen of the woods': D-fraction, immune support, blood sugar, and culinary uses.",
  keywords: ['maitake', 'Grifola frondosa', 'medicinal mushroom', 'D-fraction', 'immune support', 'blood sugar', 'hen of the woods'],
  other: {
    tags: ['medicinal', 'maitake', 'grifola', 'immune', 'd-fraction', 'metabolic', 'culinary'].join(','),
  },
};

export default function MaitakeMedicinalPage() {
  return (
    <main className="p-8 max-w-3xl">
      <h1 className="text-4xl font-bold mb-6">Maitake (Grifola frondosa)</h1>

      <p className="text-lg mt-4">
        Maitake, also known as “Hen of the Woods,” is a culinary and medicinal
        mushroom valued for its rich flavor and immune‑active polysaccharides. It
        forms large, layered clusters and has a long history of use in East Asian
        herbal traditions.
      </p>

      <h2 className="text-2xl font-semibold mt-10">Key Compounds</h2>
      <ul className="list-disc ml-8 mt-4 text-lg">
        <li><strong>D‑fraction:</strong> A beta‑glucan complex studied for immune modulation.</li>
        <li><strong>MD‑fraction:</strong> Another polysaccharide with immune‑active properties.</li>
        <li><strong>Beta‑glucans:</strong> Found throughout the fruiting body.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-10">Traditional Uses</h2>
      <p className="text-lg mt-3">
        Traditionally used for vitality, immune resilience, and general wellness.
        Often consumed as food, tea, or extract.
      </p>

      <h2 className="text-2xl font-semibold mt-10">Research Areas</h2>
      <ul className="list-disc ml-8 mt-4 text-lg">
        <li>Immune system interaction</li>
        <li>Metabolic health</li>
        <li>General vitality</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-10">Preparation Methods</h2>
      <ul className="list-disc ml-8 mt-4 text-lg">
        <li>Culinary use (fresh or dried)</li>
        <li>Hot water extraction</li>
        <li>Dual extraction</li>
        <li>Powdered fruiting body</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-10">Next Steps</h2>
      <ul className="list-disc ml-8 mt-4 text-lg">
        <li><a href="/medicinal-mushrooms/shiitake" className="text-blue-600 underline">Shiitake</a></li>
        <li><a href="/medicinal-mushrooms/preparation" className="text-blue-600 underline">Preparation Methods</a></li>
      </ul>
    </main>
  );
}