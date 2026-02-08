import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reishi vs Turkey Tail - Medicinal Mushroom Comparison',
  description: 'Compare reishi and turkey tail medicinal properties: active compounds, traditional uses, research applications, and preparation differences.',
  keywords: ['reishi vs turkey tail', 'mushroom comparison', 'triterpenes vs polysaccharides', 'medicinal mushrooms', 'immune support'],
  other: {
    tags: ['medicinal', 'comparison', 'reishi', 'turkey-tail', 'compounds', 'immune', 'analysis'].join(','),
  },
};

export default function ReishiVsTurkeyTailPage() {
  return (
    <main className="p-8 max-w-3xl">
      <h1 className="text-4xl font-bold mb-6">Reishi vs. Turkey Tail</h1>

      <p className="text-lg mt-4">
        Reishi and Turkey Tail are two of the most widely used medicinal mushrooms.
        While both contain immune‑active polysaccharides, they differ significantly
        in their chemistry, traditional uses, and preparation methods. This page
        provides a clear comparison to help readers understand their unique roles.
      </p>

      <h2 className="text-2xl font-semibold mt-10">Key Differences</h2>

      <h3 className="text-xl font-semibold mt-6">Primary Compounds</h3>
      <ul className="list-disc ml-8 mt-4 text-lg">
        <li><strong>Reishi:</strong> Triterpenes, ganoderic acids, beta‑glucans</li>
        <li><strong>Turkey Tail:</strong> PSK, PSP, beta‑glucans</li>
      </ul>

      <h3 className="text-xl font-semibold mt-6">Traditional Uses</h3>
      <ul className="list-disc ml-8 mt-4 text-lg">
        <li><strong>Reishi:</strong> Stress resilience, sleep, vitality</li>
        <li><strong>Turkey Tail:</strong> Immune support, general wellness</li>
      </ul>

      <h3 className="text-xl font-semibold mt-6">Preparation Methods</h3>
      <ul className="list-disc ml-8 mt-4 text-lg">
        <li><strong>Reishi:</strong> Dual extraction, tincture, decoction</li>
        <li><strong>Turkey Tail:</strong> Hot water extraction, tea, powder</li>
      </ul>

      <h3 className="text-xl font-semibold mt-6">Flavor & Form</h3>
      <ul className="list-disc ml-8 mt-4 text-lg">
        <li><strong>Reishi:</strong> Bitter, woody, used mainly as extract</li>
        <li><strong>Turkey Tail:</strong> Mild, leathery, used mainly as tea</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-10">When to Use Each</h2>
      <p className="text-lg mt-3">
        Reishi is traditionally associated with calm, balance, and long‑term
        vitality. Turkey Tail is traditionally associated with immune resilience
        and general wellness. Many people use both, depending on their goals.
      </p>

      <h2 className="text-2xl font-semibold mt-10">Next Steps</h2>
      <ul className="list-disc ml-8 mt-4 text-lg">
        <li><a href="/medicinal-mushrooms/reishi" className="text-blue-600 underline">Reishi</a></li>
        <li><a href="/medicinal-mushrooms/turkey-tail" className="text-blue-600 underline">Turkey Tail</a></li>
      </ul>
    </main>
  );
}