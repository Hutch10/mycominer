import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '../../components/Breadcrumbs';
import SectionHeader from '../../components/SectionHeader';
import RelatedIssues from '../../components/RelatedIssues';

export const metadata: Metadata = {
  title: 'Beginner Pathway — Step 8: Review and Next Steps',
  description: 'Review your first grow, capture lessons, and choose your next species or scale with confidence.',
  keywords: [
    'beginner',
    'review',
    'next steps',
    'scaling',
    'workflow',
    'learning',
  ],
  other: {
    tags: [
      'beginner',
      'workflow',
      'retrospective',
      'scaling',
      'species-selection',
      'environmental-control',
      'troubleshooting',
    ].join(','),
  },
};

export default function Step8Review() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-gray-800 dark:text-gray-200">
      <Breadcrumbs
        items={[
          { label: 'Beginner Pathway', href: '/beginner-pathway' },
          { label: 'Step 8', href: '/beginner-pathway/step-8' },
          { label: 'Review and Next Steps', href: '/beginner-pathway/step-8' },
        ]}
      />

      <SectionHeader
        title="Step 8: Review and Next Steps"
        subtitle="Convert observations into habits, then pick your next goal"
      />

      <div className="space-y-8">
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Run a Quick Retro</h2>
          <ul className="list-disc ml-6 space-y-2">
            <li>What worked? Note spawn source, substrate recipe, and environment targets.</li>
            <li>What lagged? Map issues to <Link href="/troubleshooting/overview" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">Troubleshooting</Link> topics.</li>
            <li>What to change? Pick one variable at a time (FAE, humidity, substrate).</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Choose Your Next Run</h2>
          <p className="leading-relaxed">
            Repeat the same species to confirm you can reproduce results, or pick a new species using the <Link href="/tools/species-comparison-matrix" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">Species Comparison Matrix</Link> and <Link href="/tools/substrate-selector" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">Substrate Selector</Link>.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Scale Safely</h2>
          <p className="leading-relaxed">
            Add one more bag or tub at a time. Upgrade airflow or humidification only after confirming your current controls are stable.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Explore Further</h2>
          <ul className="list-disc ml-6 space-y-2">
            <li>Try advanced guides for deeper technique.</li>
            <li>Experiment with agar work to clean cultures before grain.</li>
            <li>Document parameters so future troubleshooting stays fast.</li>
          </ul>
        </section>

        <section>
          <RelatedIssues
            related={[
              { title: 'Step 7: Harvesting and Storage', href: '/beginner-pathway/step-7' },
              { title: 'Beginner Pathway: Start Here', href: '/beginner-pathway' },
              { title: 'Species Comparison Matrix', href: '/tools/species-comparison-matrix' },
              { title: 'Substrate Selector', href: '/tools/substrate-selector' },
              { title: 'Troubleshooting Overview', href: '/troubleshooting/overview' },
            ]}
          />
        </section>
      </div>
    </div>
  );
}
