import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Lion's Mane Guide (Legacy) - Original Cultivation Methods",
  description: "Original lion's mane cultivation guide. For updated content, see the complete Growing Guides section.",
  keywords: ['lions mane', 'Hericium erinaceus', 'legacy guide', 'cultivation', 'medicinal mushroom'],
  other: {
    tags: ['guides', 'legacy', 'lions-mane', 'hericium', 'cultivation', 'medicinal'].join(','),
  },
};

export default function LionsManeGuidePage() {
  return (
    <main className="p-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-4">
        Lion’s Mane (Hericium erinaceus)
      </h1>

      <p className="mt-4 text-lg">
        Lion’s Mane is a unique, highly sought‑after gourmet mushroom known for its
        cascading spines, seafood‑like texture, and cognitive‑support reputation.
        It’s more sensitive than oysters, making it an excellent next step for
        growers who want to deepen their skills.
      </p>

      <h2 className="text-2xl font-semibold mt-8">Why Grow Lion’s Mane</h2>
      <p className="mt-3 text-lg">
        Lion’s Mane teaches precision. It requires stable humidity, good airflow,
        and careful observation. Unlike oysters, which tolerate rough conditions,
        Lion’s Mane rewards growers who pay attention to subtle environmental cues.
      </p>

      <h2 className="text-2xl font-semibold mt-8">Recommended Substrates</h2>
      <p className="mt-3 text-lg">
        Lion’s Mane prefers hardwood‑based substrates:
      </p>
      <ul className="list-disc ml-8 mt-3 text-lg">
        <li>Hardwood sawdust</li>
        <li>Hardwood pellets (with supplementation)</li>
        <li>Sawdust + bran (5–20%)</li>
        <li>Hardwood fuel pellets hydrated and sterilized</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8">Colonization Conditions</h2>
      <p className="mt-3 text-lg">
        Lion’s Mane colonizes steadily but not aggressively:
      </p>
      <ul className="list-disc ml-8 mt-3 text-lg">
        <li>Temperature: 65–75°F</li>
        <li>Dark or low light</li>
        <li>Minimal airflow</li>
        <li>2–3 weeks for full colonization</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8">Fruiting Conditions</h2>
      <p className="mt-3 text-lg">
        Lion’s Mane requires stable, gentle conditions to form proper spines:
      </p>
      <ul className="list-disc ml-8 mt-3 text-lg">
        <li>Humidity: 90–95%</li>
        <li>Cool temperatures: 55–65°F preferred</li>
        <li>Low to moderate light</li>
        <li>Fresh air exchange without strong airflow</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8">When to Harvest</h2>
      <p className="mt-3 text-lg">
        Harvest when the spines (teeth) are long and well‑formed but before the
        mushroom begins to yellow. Over‑mature Lion’s Mane becomes bitter and
        crumbly.
      </p>

      <h2 className="text-2xl font-semibold mt-8">Common Issues and Fixes</h2>
      <ul className="list-disc ml-8 mt-3 text-lg">
        <li><strong>Puffy, brain‑like blobs:</strong> Not enough fresh air.</li>
        <li><strong>Yellowing:</strong> Too much airflow or low humidity.</li>
        <li><strong>Short spines:</strong> Humidity too low or harvested too early.</li>
        <li><strong>Slow colonization:</strong> Substrate too cold or under‑supplemented.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8">Why Lion’s Mane Matters</h2>
      <p className="mt-3 text-lg">
        Growing Lion’s Mane teaches environmental control, patience, and subtle
        observation. It’s a perfect bridge between beginner species like oysters
        and more advanced species like shiitake or reishi.
      </p>
    </main>
  );
}