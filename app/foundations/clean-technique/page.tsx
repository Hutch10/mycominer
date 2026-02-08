import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Clean Technique - Contamination Prevention',
  description: 'Practical contamination prevention for everyday mushroom growing without full sterile procedures.',
  keywords: ['clean technique', 'contamination prevention', 'hygiene', 'workflow', 'clean growing', 'basic sterility'],
  other: {
    tags: ['foundations', 'technique', 'clean', 'contamination', 'prevention', 'hygiene', 'workflow'].join(','),
  },
};

export default function FoundationsIndexPage() {
  return (
    <main className="p-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-4">Foundations</h1>

      <p className="mt-4 text-lg">
        This section explores the mindset, philosophy, and systems thinking behind
        mushroom cultivation. Before diving into techniques and species, these essays
        help you understand how to think like a grower.
      </p>

      <h2 className="text-2xl font-semibold mt-8">Available Essays</h2>

      <ul className="list-disc ml-8 mt-4 text-lg">
        <li>
          <a href="/foundations/beginners-mindset" className="text-blue-600 underline">
            The Beginner’s Mindset: Patience, Safety, and Systems Thinking
          </a>
        </li>

        <li className="mt-2">
          <a href="/foundations/what-is-a-mushroom" className="text-blue-600 underline">
            What Is a Mushroom?
          </a>
        </li>

        <li className="mt-2">
          <a href="/foundations/clean-technique" className="text-blue-600 underline">
            Clean Technique: The Invisible Skill
          </a>
        </li>
      </ul>

      <p className="mt-6 text-lg text-gray-700">
        More essays will be added soon to deepen your understanding of fungi, ecology,
        and cultivation as a system.
      </p>
    </main>
  );
}