import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reishi Guide (Legacy) - Original Cultivation Methods',
  description: 'Original reishi cultivation guide. For updated content, see the complete Growing Guides section.',
  keywords: ['reishi', 'Ganoderma lucidum', 'legacy guide', 'cultivation', 'medicinal mushroom'],
  other: {
    tags: ['guides', 'legacy', 'reishi', 'ganoderma', 'cultivation', 'medicinal'].join(','),
  },
};

export default function ReishiGuidePage() {
  return (
    <main className="p-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-4">
        Reishi (Ganoderma lucidum)
      </h1>

      <p className="mt-4 text-lg">
        Reishi is a medicinal mushroom revered for its longevity‑supporting
        properties and striking appearance. Unlike gourmet species, Reishi grows
        slowly and expresses itself through antlers, conks, and lacquered
        formations that respond dramatically to environmental conditions.
      </p>

      <h2 className="text-2xl font-semibold mt-8">Why Grow Reishi</h2>
      <p className="mt-3 text-lg">
        Reishi teaches patience and environmental awareness. Its growth is slow,
        expressive, and deeply influenced by airflow, humidity, and CO₂ levels.
        Growing Reishi helps cultivators understand fungal behavior on a deeper,
        more ecological level.
      </p>

      <h2 className="text-2xl font-semibold mt-8">Recommended Substrates</h2>
      <p className="mt-3 text-lg">
        Reishi thrives on dense, hardwood‑based substrates:
      </p>
      <ul className="list-disc ml-8 mt-3 text-lg">
        <li>Hardwood sawdust</li>
        <li>Hardwood pellets (with bran supplementation)</li>
        <li>Sawdust + bran (5–20%)</li>
        <li>Logs (oak, maple, beech)</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8">Colonization Conditions</h2>
      <p className="mt-3 text-lg">
        Reishi colonizes slowly but steadily:
      </p>
      <ul className="list-disc ml-8 mt-3 text-lg">
        <li>Temperature: 70–80°F</li>
        <li>Dark or low light</li>
        <li>Minimal airflow</li>
        <li>4–8 weeks for full colonization</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8">Fruiting Conditions</h2>
      <p className="mt-3 text-lg">
        Reishi fruiting is highly responsive to environmental cues:
      </p>
      <ul className="list-disc ml-8 mt-3 text-lg">
        <li>Humidity: 85–95%</li>
        <li>Temperature: 65–75°F</li>
        <li>Low to moderate light</li>
        <li>Fresh air exchange determines shape</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8">Antlers vs. Conks</h2>
      <p className="mt-3 text-lg">
        Reishi can grow in two main forms:
      </p>
      <ul className="list-disc ml-8 mt-3 text-lg">
        <li><strong>Antlers:</strong> Tall, branching structures caused by high CO₂ and low airflow.</li>
        <li><strong>Conks:</strong> Shelf‑like formations with lacquered surfaces, triggered by increased airflow.</li>
      </ul>
      <p className="mt-3 text-lg">
        Growers often intentionally shape Reishi by adjusting airflow during
        fruiting, making it one of the most expressive species to cultivate.
      </p>

      <h2 className="text-2xl font-semibold mt-8">When to Harvest</h2>
      <p className="mt-3 text-lg">
        Harvest when the surface becomes glossy and fully colored. Over‑mature
        Reishi becomes woody and brittle, though still usable for teas and
        tinctures.
      </p>

      <h2 className="text-2xl font-semibold mt-8">Common Issues and Fixes</h2>
      <ul className="list-disc ml-8 mt-3 text-lg">
        <li><strong>Thin antlers:</strong> Increase humidity and reduce airflow.</li>
        <li><strong>Flattened growth:</strong> Too much airflow too early.</li>
        <li><strong>Slow colonization:</strong> Substrate too cold or under‑supplemented.</li>
        <li><strong>Drying or cracking:</strong> Humidity too low during fruiting.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8">Why Reishi Matters</h2>
      <p className="mt-3 text-lg">
        Reishi deepens your understanding of fungal ecology. Its slow, expressive
        growth teaches patience, environmental tuning, and the art of shaping
        conditions rather than forcing outcomes. It’s a species that rewards
        observation and intention.
      </p>
    </main>
  );
}