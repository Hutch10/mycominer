import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Drying Mushroom Caps - Humidity & Airflow Issues',
  description: 'Fix drying mushroom caps caused by low humidity, excessive airflow, or environmental imbalance.',
  keywords: ['drying caps', 'mushroom drying', 'humidity problems', 'airflow', 'environmental control', 'troubleshooting'],
  other: {
    tags: ['troubleshooting', 'drying', 'humidity', 'airflow', 'environment', 'caps', 'diagnosis'].join(','),
  },
};

export default function DryingCaps() {
  return (
    <main className="p-8 max-w-3xl mx-auto space-y-8">
      <h1 className="text-4xl font-bold mb-4">Drying Caps</h1>
      <p className="text-lg text-gray-700 leading-relaxed">
        Drying caps occur when the fruiting environment loses moisture faster than the mushrooms can absorb it. This is a humidity and airflow imbalance, not a genetic issue.
      </p>

      <section>
        <h2 className="text-2xl font-semibold mb-3">Common Causes</h2>
        <ul className="list-disc ml-6 space-y-2 text-gray-700">
          <li>Low humidity during fruiting</li>
          <li>Direct airflow hitting the mushrooms</li>
          <li>Insufficient misting or surface moisture</li>
          <li>High temperatures accelerating evaporation</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-3">How to Fix It</h2>
        <ul className="list-disc ml-6 space-y-2 text-gray-700">
          <li>Raise humidity to 85–95%</li>
          <li>Diffuse airflow instead of blowing directly</li>
          <li>Mist lightly and evenly</li>
          <li>Lower temperature if possible</li>
        </ul>
      </section>
    </main>
  );
}