import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Yellowing Mycelium - Stress & Metabolites',
  description: 'Understand yellowing mycelium as stress response: dehydration, metabolite accumulation, bacterial pressure, and recovery methods.',
  keywords: ['yellowing mycelium', 'yellow mycelium', 'stress response', 'dehydration', 'metabolites', 'troubleshooting'],
  other: {
    tags: ['troubleshooting', 'yellowing', 'mycelium', 'stress', 'metabolites', 'moisture', 'diagnosis'].join(','),
  },
};

export default function YellowingMycelium() {
  return (
    <main className="p-8 max-w-3xl mx-auto space-y-8">
      <h1 className="text-4xl font-bold mb-4">Yellowing Mycelium</h1>
      <p className="text-lg text-gray-700 leading-relaxed">
        Yellowing mycelium is a stress response. It often indicates dehydration, metabolite production, or bacterial pressure.
      </p>

      <section>
        <h2 className="text-2xl font-semibold mb-3">Common Causes</h2>
        <ul className="list-disc ml-6 space-y-2 text-gray-700">
          <li>Surface drying</li>
          <li>Bacterial contamination</li>
          <li>Metabolite excretion (“mycelial sweat”)</li>
          <li>High heat or direct light</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-3">How to Respond</h2>
        <ul className="list-disc ml-6 space-y-2 text-gray-700">
          <li>Rehydrate the substrate</li>
          <li>Improve airflow</li>
          <li>Lower temperature</li>
          <li>Monitor for bacterial spread</li>
        </ul>
      </section>
    </main>
  );
}