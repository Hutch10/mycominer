import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Fuzzy Feet - High CO2 & Poor Air Exchange',
  description: 'Fix fuzzy mycelial growth at mushroom bases caused by elevated CO2, poor air exchange, and stagnant conditions.',
  keywords: ['fuzzy feet', 'high CO2', 'poor air exchange', 'mycelial growth', 'stem fuzz', 'troubleshooting'],
  other: {
    tags: ['troubleshooting', 'fuzzy-feet', 'CO2', 'air-exchange', 'airflow', 'mycelium', 'diagnosis'].join(','),
  },
};

export default function FuzzyFeet() {
  return (
    <main className="p-8 max-w-3xl mx-auto space-y-8">
      <h1 className="text-4xl font-bold mb-4">Fuzzy Feet</h1>
      <p className="text-lg text-gray-700 leading-relaxed">
        Fuzzy feet occur when mycelium grows up the base of the mushroom stem. It’s a sign of elevated CO₂ and insufficient fresh air exchange.
      </p>

      <section>
        <h2 className="text-2xl font-semibold mb-3">Why It Happens</h2>
        <ul className="list-disc ml-6 space-y-2 text-gray-700">
          <li>High CO₂ levels in the fruiting chamber</li>
          <li>Limited air movement</li>
          <li>Overly enclosed grow environment</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-3">How to Fix It</h2>
        <ul className="list-disc ml-6 space-y-2 text-gray-700">
          <li>Increase fresh air exchange</li>
          <li>Reduce CO₂ buildup by adjusting airflow</li>
          <li>Avoid over-misting, which can trap CO₂</li>
        </ul>
      </section>
    </main>
  );
}