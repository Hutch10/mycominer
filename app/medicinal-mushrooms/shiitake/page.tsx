import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shiitake Medicinal Properties - Culinary Medicine',
  description: 'Evidence-based overview of shiitake (Lentinula edodes) medicinal benefits: lentinan, immune support, cardiovascular health, and nutrition.',
  keywords: ['shiitake', 'Lentinula edodes', 'medicinal mushroom', 'lentinan', 'immune support', 'cardiovascular', 'culinary medicine'],
  other: {
    tags: ['medicinal', 'shiitake', 'lentinula', 'lentinan', 'immune', 'cardiovascular', 'culinary'].join(','),
  },
};

export default function ShiitakeMedicinalPage() {
  return (
    <main className="p-8 max-w-3xl">
      <h1 className="text-4xl font-bold mb-6">Shiitake (Lentinula edodes)</h1>

      <p className="text-lg mt-4">
        Shiitake is both a gourmet and medicinal mushroom with a long history of
        use in East Asian herbal traditions. It contains immune‑active compounds
        and is widely consumed as both food and extract.
      </p>

      <h2 className="text-2xl font-semibold mt-10">Key Compounds</h2>
      <ul className="list-disc ml-8 mt-4 text-lg">
        <li><strong>Lentinan:</strong> A beta‑glucan studied for immune modulation.</li>
        <li><strong>Ergothioneine:</strong> An antioxidant amino acid found in mushrooms.</li>
        <li><strong>Beta‑glucans:</strong> Present throughout the fruiting body.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-10">Traditional Uses</h2>
      <p className="text-lg mt-3">
        Traditionally used for vitality, immune support, and general wellness.
        Often consumed as food, broth, or tea.
      </p>

      <h2 className="text-2xl font-semibold mt-10">Research Areas</h2>
      <ul className="list-disc ml-8 mt-4 text-lg">
        <li>Immune system interaction</li>
        <li>General vitality</li>
        <li>Antioxidant activity</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-10">Preparation Methods</h2>
      <ul className="list-disc ml-8 mt-4 text-lg">
        <li>Culinary use (fresh or dried)</li>
        <li>Hot water extraction</li>
        <li>Powdered fruiting body</li>
        <li>Broths and soups</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-10">Next Steps</h2>
      <ul className="list-disc ml-8 mt-4 text-lg">
        <li><a href="/medicinal-mushrooms/maitake" className="text-blue-600 underline">Maitake</a></li>
        <li><a href="/medicinal-mushrooms/preparation" className="text-blue-600 underline">Preparation Methods</a></li>
      </ul>
    </main>
  );
}