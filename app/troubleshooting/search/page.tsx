import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Troubleshooting Search - Find Solutions Fast',
  description: 'Search troubleshooting guides by symptom, cause, or keyword to quickly find solutions to cultivation problems.',
  keywords: ['troubleshooting search', 'find solutions', 'symptom search', 'cultivation problems', 'diagnosis tool'],
  other: {
    tags: ['troubleshooting', 'search', 'tool', 'diagnosis', 'solutions', 'symptoms'].join(','),
  },
};

export default function TroubleshootingSearch() {
  return (
    <main className="p-8 max-w-3xl mx-auto space-y-10">
      <h1 className="text-4xl font-bold">Troubleshooting Search</h1>
      <p className="text-lg text-gray-700 leading-relaxed">
        Use this page to quickly find issues by symptom. This is a reference hub for growers who want fast, accurate diagnosis.
      </p>

      <section>
        <h2 className="text-2xl font-semibold">How to Use This Tool</h2>
        <ul className="list-disc ml-6 space-y-2 text-gray-700">
          <li>Search by symptom (e.g., “yellowing”, “fuzzy feet”)</li>
          <li>Search by category (e.g., contamination, humidity)</li>
          <li>Search by species (e.g., oyster, lion’s mane)</li>
        </ul>
      </section>
    </main>
  );
}