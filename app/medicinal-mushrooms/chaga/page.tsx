import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Chaga Medicinal Properties - Antioxidant Powerhouse',
  description: 'Evidence-based overview of chaga (Inonotus obliquus): antioxidants, betulinic acid, immune support, and sustainable harvesting.',
  keywords: ['chaga', 'Inonotus obliquus', 'medicinal mushroom', 'antioxidants', 'betulinic acid', 'birch', 'sclerotium'],
  other: {
    tags: ['medicinal', 'chaga', 'inonotus', 'antioxidant', 'birch', 'sclerotium', 'traditional'].join(','),
  },
};

export default function ChagaMedicinalPage() {
  return (
    <main className="p-8 max-w-3xl">
      <h1 className="text-4xl font-bold mb-6">Chaga (Inonotus obliquus)</h1>

      <p className="text-lg mt-4">
        Chaga is a slow‑growing fungal sclerotium found primarily on birch trees.
        It is valued for its antioxidant compounds and long history of use in
        northern and eastern herbal traditions. Unlike most mushrooms, Chaga is
        not a fruiting body — it is a dense, woody mass of mycelium.
      </p>

      <h2 className="text-2xl font-semibold mt-10">Key Compounds</h2>
      <ul className="list-disc ml-8 mt-4 text-lg">
        <li><strong>Betulin & betulinic acid:</strong> Derived from birch bark; associated with antioxidant activity.</li>
        <li><strong>Melanin:</strong> Contributes to Chaga’s dark color and antioxidant profile.</li>
        <li><strong>Beta‑glucans:</strong> Immune‑active polysaccharides.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-10">Traditional Uses</h2>
      <p className="text-lg mt-3">
        Used for centuries in Siberian, Baltic, and northern herbal traditions as
        a tonic for vitality, resilience, and general wellness.
      </p>

      <h2 className="text-2xl font-semibold mt-10">Research Areas</h2>
      <ul className="list-disc ml-8 mt-4 text-lg">
        <li>Antioxidant activity</li>
        <li>Immune system interaction</li>
        <li>General vitality and resilience</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-10">Preparation Methods</h2>
      <ul className="list-disc ml-8 mt-4 text-lg">
        <li>Hot water decoction (traditional tea)</li>
        <li>Dual extraction (for triterpenes + polysaccharides)</li>
        <li>Powdered sclerotium</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-10">Next Steps</h2>
      <ul className="list-disc ml-8 mt-4 text-lg">
        <li><a href="/medicinal-mushrooms/reishi" className="text-blue-600 underline">Reishi</a></li>
        <li><a href="/medicinal-mushrooms/turkey-tail" className="text-blue-600 underline">Turkey Tail</a></li>
      </ul>
    </main>
  );
}