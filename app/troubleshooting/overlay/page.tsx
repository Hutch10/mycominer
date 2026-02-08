import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mycelial Overlay - Stroma Formation & Prevention',
  description: 'Prevent and fix mycelial overlay (stroma): thick matted growth preventing pinning caused by excessive CO2 or environmental imbalance.',
  keywords: ['overlay', 'stroma', 'mycelial mat', 'thick mycelium', 'no pinning', 'CO2', 'troubleshooting'],
  other: {
    tags: ['troubleshooting', 'overlay', 'stroma', 'mycelium', 'CO2', 'pinning', 'diagnosis'].join(','),
  },
};

export default function Overlay() {
  return (
    <main className="p-8 max-w-3xl mx-auto space-y-8">
      <h1 className="text-4xl font-bold mb-4">Overlay</h1>
      <p className="text-lg text-gray-700 leading-relaxed">
        Overlay occurs when mycelium forms a dense, matted layer that resists pinning. It’s usually caused by high CO₂, low humidity, or delayed fruiting conditions.
      </p>

      <section>
        <h2 className="text-2xl font-semibold mb-3">Why It Happens</h2>
        <ul className="list-disc ml-6 space-y-2 text-gray-700">
          <li>Prolonged colonization without fruiting conditions</li>
          <li>High CO₂ levels</li>
          <li>Low humidity causing surface hardening</li>
          <li>Overly nutritious casing layers</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-3">How to Fix It</h2>
        <ul className="list-disc ml-6 space-y-2 text-gray-700">
          <li>Increase fresh air exchange</li>
          <li>Rehydrate the surface with a fine mist</li>
          <li>Lightly scratch the surface to expose mycelium</li>
          <li>Introduce fruiting conditions promptly next time</li>
        </ul>
      </section>
    </main>
  );
}