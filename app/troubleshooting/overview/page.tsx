import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Troubleshooting Overview - Systems Approach',
  description: 'Learn the systems approach to troubleshooting mushroom cultivation: observation, diagnosis, root cause analysis, and preventive thinking.',
  keywords: ['troubleshooting overview', 'systems approach', 'diagnosis', 'root cause', 'observation', 'prevention'],
  other: {
    tags: ['troubleshooting', 'overview', 'systems', 'diagnosis', 'approach', 'learning', 'methodology'].join(','),
  },
};

export default function TroubleshootingOverview() {
  return (
    <main className="p-8 max-w-3xl mx-auto space-y-10">
      <h1 className="text-4xl font-bold">Troubleshooting Overview</h1>
      <p className="text-lg text-gray-700 leading-relaxed">
        Troubleshooting is the art of interpreting signals. Every symptom — slow growth, odd shapes, discoloration — is feedback from the system. This guide helps you read those signals clearly.
      </p>

      <section>
        <h2 className="text-2xl font-semibold">Common Categories</h2>
        <ul className="list-disc ml-6 space-y-2 text-gray-700">
          <li>Environmental mismatches</li>
          <li>Contamination pressure</li>
          <li>Moisture imbalance</li>
          <li>CO₂ accumulation</li>
          <li>Genetic variability</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold">How to Approach Problems</h2>
        <ul className="list-disc ml-6 space-y-2 text-gray-700">
          <li>Observe without reacting immediately</li>
          <li>Identify the category of issue</li>
          <li>Adjust one variable at a time</li>
          <li>Document changes and outcomes</li>
        </ul>
      </section>
    </main>
  );
}