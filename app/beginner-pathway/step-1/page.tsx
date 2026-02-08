import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '../../components/Breadcrumbs';
import SectionHeader from '../../components/SectionHeader';
import RelatedIssues from '../../components/RelatedIssues';

export const metadata: Metadata = {
  title: 'Beginner Pathway — Step 1: Foundations',
  description: 'Learn the core concepts: what mushrooms are, how mycelium behaves, substrates, and ecology to frame every later step.',
  keywords: [
    'beginner',
    'foundations',
    'mycelium',
    'substrates',
    'ecology',
    'mindset',
    'workflow',
  ],
  other: {
    tags: [
      'beginner',
      'foundations',
      'ecology',
      'substrates',
      'mycelium',
    ].join(','),
  },
};

export default function Step1Foundations() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-gray-800 dark:text-gray-200">
      <Breadcrumbs
        items={[
          { label: 'Beginner Pathway', href: '/beginner-pathway' },
          { label: 'Step 1', href: '/beginner-pathway/step-1' },
          { label: 'Foundations', href: '/beginner-pathway/step-1' },
        ]}
      />

      <SectionHeader
        title="Step 1: Foundations"
        subtitle="Get the mental model before you touch grain or substrate"
      />

      <div className="space-y-8">
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Mindset First</h2>
          <p className="leading-relaxed">
            Cultivation rewards patience and pattern-reading. Start with a calm, observant approach: hygiene before speed, small batches before scaling, and notes before guesses. This keeps mistakes contained and learning fast.
          </p>
          <p className="leading-relaxed">
            Read <Link href="/foundations/beginners-mindset" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">Beginner's Mindset</Link> to anchor your practice.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Know the Organism</h2>
          <ul className="list-disc ml-6 space-y-2">
            <li><Link href="/foundations/what-is-a-mushroom" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">What is a mushroom?</Link> Fruit is the reproductive structure; most life is in the mycelial network.</li>
            <li><Link href="/foundations/what-is-mycelium" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">Mycelium</Link> senses moisture, oxygen, CO2, and nutrients; it grows toward resources and walls off threats.</li>
            <li><Link href="/foundations/ecology" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">Ecology</Link> explains why airflow, moisture, and temperature cues trigger growth or defense.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Materials & Substrates</h2>
          <p className="leading-relaxed">
            Substrates are fuel and shelter. Grain is for expansion; bulk is for fruiting. Correct moisture, structure, and cleanliness determine whether mycelium wins the early race.
          </p>
          <p className="leading-relaxed">
            Start with <Link href="/foundations/substrates" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">Substrates and Nutrition</Link> to learn field capacity, supplementation, and why sterilization vs pasteurization matters.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Core Controls</h2>
          <p className="leading-relaxed">
            Humidity, fresh air exchange, temperature, light, and surface moisture form one system. Understanding these levers now will make troubleshooting trivial later.
          </p>
          <p className="leading-relaxed">
            Review <Link href="/foundations/environmental-parameters" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">Environmental Parameters</Link> for how to balance these signals.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Quick Checklist</h2>
          <ul className="list-disc ml-6 space-y-2">
            <li>Read mindset and ecology once; keep them handy.</li>
            <li>Decide grain vs. pre-sterilized spawn source.</li>
            <li>Confirm you can maintain 68-75 F and moderate humidity.</li>
          </ul>
        </section>

        <section>
          <RelatedIssues
            related={[
              { title: 'Beginner Pathway: Start Here', href: '/beginner-pathway' },
              { title: 'Environmental Parameters', href: '/foundations/environmental-parameters' },
              { title: 'Substrates and Nutrition', href: '/foundations/substrates' },
              { title: 'Fungal Ecology and Behavior', href: '/foundations/ecology' },
              { title: 'Troubleshooting Overview', href: '/troubleshooting/overview' },
            ]}
          />
        </section>
      </div>
    </div>
  );
}
