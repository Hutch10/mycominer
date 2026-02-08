import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Oyster Mushrooms Guide (Legacy) - Original Cultivation Methods',
  description: 'Original oyster mushroom cultivation guide. For updated content, see the complete Growing Guides section.',
  keywords: ['oyster mushrooms', 'Pleurotus ostreatus', 'legacy guide', 'cultivation', 'beginner mushrooms'],
  other: {
    tags: ['guides', 'legacy', 'oyster', 'pleurotus', 'cultivation', 'beginner'].join(','),
  },
};

export default function GuidesIndexPage() {
  return (
    <main className="p-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-4">Growing Guides</h1>

      <p className="mt-4 text-lg">
        This section contains species‑specific cultivation guides. Each guide covers
        substrates, colonization, fruiting conditions, and common issues — giving you
        everything you need to grow with confidence.
      </p>

      <h2 className="text-2xl font-semibold mt-8">Available Species</h2>

      <ul className="list-disc ml-8 mt-4 text-lg">
        <li>
          <a href="/guides/oyster-mushrooms" className="text-blue-600 underline">
            Oyster Mushrooms (Pleurotus ostreatus)
          </a>
        </li>
      </ul>

      <p className="mt-6 text-lg text-gray-700">
        More species will be added soon as the library grows.
      </p>
    </main>
  );
}