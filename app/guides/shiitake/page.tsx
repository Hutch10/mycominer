import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shiitake Guide (Legacy) - Original Cultivation Methods',
  description: 'Original shiitake cultivation guide. For updated content, see the complete Growing Guides section.',
  keywords: ['shiitake', 'Lentinula edodes', 'legacy guide', 'cultivation', 'log cultivation'],
  other: {
    tags: ['guides', 'legacy', 'shiitake', 'lentinula', 'cultivation', 'hardwood'].join(','),
  },
};

export default function ShiitakeGuidePage() {
  return (
    <main className="p-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-4">
        Shiitake (Lentinula edodes)
      </h1>

      <p className="mt-4 text-lg">
        Shiitake is one of the world’s most popular gourmet mushrooms. It grows on
        hardwood substrates, develops rich umami flavor, and teaches growers the
        importance of substrate preparation, patience, and environmental control.
      </p>

      <h2 className="text-2xl font-semibold mt-8">Why Grow Shiitake</h2>
      <p className="mt-3 text-lg">
        Shiitake is a step up in complexity from oysters and lion’s mane. It
        requires proper sterilization, steady colonization, and a unique “browning”
        phase before fruiting. This species rewards careful technique and offers
        excellent yields once mastered.
      </p>

      <h2 className="text-2xl font-semibold mt-8">Recommended Substrates</h2>
      <p className="mt-3 text-lg">
        Shiitake thrives on hardwood‑based substrates:
      </p>
      <ul className="list-disc ml-8 mt-3 text-lg">
        <li>Hardwood sawdust</li>
        <li>Hardwood pellets (with bran supplementation)</li>
        <li>Sawdust + bran (5–20%)</li>
        <li>Traditional logs (oak, maple, beech)</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8">Colonization Conditions</h2>
      <p className="mt-3 text-lg">
        Shiitake colonizes slowly and steadily:
      </p>
      <ul className="list-disc ml-8 mt-3 text-lg">
        <li>Temperature: 65–75°F</li>
        <li>Dark or low light</li>
        <li>Minimal airflow</li>
        <li>6–12 weeks for full colonization</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8">The Browning Phase</h2>
      <p className="mt-3 text-lg">
        After colonization, shiitake blocks undergo a “browning” or “maturation”
        phase where the mycelium thickens and the surface darkens. This is normal
        and essential for strong fruiting.
      </p>
      <ul className="list-disc ml-8 mt-3 text-lg">
        <li>Occurs at room temperature</li>
        <li>Lasts 2–4 weeks</li>
        <li>Surface becomes brown and leathery</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8">Fruiting Conditions</h2>
      <p className="mt-3 text-lg">
        Shiitake fruiting requires a shift in environment:
      </p>
      <ul className="list-disc ml-8 mt-3 text-lg">
        <li>Humidity: 85–95%</li>
        <li>Temperature: 55–70°F</li>
        <li>Moderate light</li>
        <li>Fresh air exchange</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8">Optional Cold Shock</h2>
      <p className="mt-3 text-lg">
        Many growers “cold shock” shiitake blocks by refrigerating or soaking them
        in cold water for 12–24 hours. This can trigger strong, synchronized
        fruiting, especially for commercial strains.
      </p>

      <h2 className="text-2xl font-semibold mt-8">Common Issues and Fixes</h2>
      <ul className="list-disc ml-8 mt-3 text-lg">
        <li><strong>Weak or sparse fruiting:</strong> Block not fully matured.</li>
        <li><strong>Dry caps:</strong> Humidity too low.</li>
        <li><strong>Long stems:</strong> Not enough fresh air.</li>
        <li><strong>Slow colonization:</strong> Substrate too cold or under‑supplemented.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8">Why Shiitake Matters</h2>
      <p className="mt-3 text-lg">
        Shiitake teaches patience, substrate mastery, and environmental control.
        It’s a rewarding species that bridges beginner and intermediate cultivation
        and produces some of the most flavorful mushrooms in the world.
      </p>
    </main>
  );
}