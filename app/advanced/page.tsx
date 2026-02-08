import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '../components/Breadcrumbs';
import SectionHeader from '../components/SectionHeader';
import RelatedIssues from '../components/RelatedIssues';

// Static page with daily revalidation
export const revalidate = 86400; // 24 hours

export const metadata: Metadata = {
  title: 'Advanced Cultivation Modules',
  description: 'Expert-level modules that deepen environmental control, substrate engineering, species ecology, contamination defense, fruiting design, and yield optimization.',
  keywords: [
    'advanced cultivation',
    'expert',
    'optimization',
    'environment',
    'substrates',
    'ecology',
    'yield',
  ],
  other: {
    tags: [
      'advanced',
      'expert',
      'optimization',
      'environment',
      'substrates',
      'ecology',
      'yield',
      'workflow',
    ].join(','),
  },
};

export default function AdvancedOverview() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-gray-800 dark:text-gray-200">
      <Breadcrumbs
        items={[
          { label: 'Advanced', href: '/advanced' },
          { label: 'Overview', href: '/advanced' },
        ]}
      />

      <SectionHeader
        title="Advanced Cultivation Modules"
        subtitle="Systems thinking, ecological nuance, and optimization for experienced growers"
      />

      <div className="space-y-8">
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Who This Is For</h2>
          <p className="leading-relaxed">
            Growers who already complete reliable harvests and want tighter environmental control, sharper substrate design, species-specific tuning, and data-backed yield gains.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">How to Use These Modules</h2>
          <ul className="list-disc ml-6 space-y-2">
            <li>Pick one constraint to optimize at a time (environment, substrate, chamber, or species fit).</li>
            <li>Use tools like the Environmental Planner, Species Comparison Matrix, and Substrate Selector to model changes before you build.</li>
            <li>Log inputs and outputs; feed data into Yield Optimization to iterate deliberately.</li>
            <li>Cross-link with troubleshooting patterns to anticipate failure modes while you push performance.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Modules</h2>
          <ol className="list-decimal ml-6 space-y-3">
            <li className="space-y-1">
              <Link href="/advanced/environmental-control" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">Advanced Environmental Control</Link>
              <p className="text-sm text-gray-700 dark:text-gray-300">Humidity cycles, gradients, CO₂ dynamics, and airflow engineering.</p>
            </li>
            <li className="space-y-1">
              <Link href="/advanced/substrate-engineering" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">Substrate Engineering & Optimization</Link>
              <p className="text-sm text-gray-700 dark:text-gray-300">Ratios, supplementation, water activity, and thermal mass to speed colonization and reduce contamination.</p>
            </li>
            <li className="space-y-1">
              <Link href="/advanced/species-ecology" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">Species Behavior & Ecological Niches</Link>
              <p className="text-sm text-gray-700 dark:text-gray-300">Match species strategies and stress responses to substrates and chambers.</p>
            </li>
            <li className="space-y-1">
              <Link href="/advanced/contamination-ecology" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">Contamination Ecology & Defense Strategies</Link>
              <p className="text-sm text-gray-700 dark:text-gray-300">Microbial succession, competitive exclusion, and defensive cultivation patterns.</p>
            </li>
            <li className="space-y-1">
              <Link href="/advanced/fruiting-chamber-design" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">Fruiting Chamber Design & Optimization</Link>
              <p className="text-sm text-gray-700 dark:text-gray-300">Monotubs, tents, automation, airflow patterns, and humidification strategies.</p>
            </li>
            <li className="space-y-1">
              <Link href="/advanced/yield-optimization" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">Yield Optimization & Data Tracking</Link>
              <p className="text-sm text-gray-700 dark:text-gray-300">Metrics, biological efficiency, logging, and iterative experiments.</p>
            </li>
          </ol>
        </section>

        <section>
          <RelatedIssues
            related={[
              { title: 'Beginner Pathway: Start Here', href: '/beginner-pathway' },
              { title: 'Cultivation System Map', href: '/tools/cultivation-system-map' },
              { title: 'Species Comparison Matrix', href: '/tools/species-comparison-matrix' },
              { title: 'Substrate Selector', href: '/tools/substrate-selector' },
              { title: 'Troubleshooting Decision Tree', href: '/tools/troubleshooting-decision-tree' },
            ]}
          />
        </section>
      </div>
    </div>
  );
}
