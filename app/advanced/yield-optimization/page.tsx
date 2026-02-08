import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '../../components/Breadcrumbs';
import SectionHeader from '../../components/SectionHeader';
import RelatedIssues from '../../components/RelatedIssues';

export const metadata: Metadata = {
  title: 'Yield Optimization & Data Tracking',
  description: 'Quantify yield, biological efficiency, and process changes to iteratively improve performance.',
  keywords: [
    'advanced',
    'yield',
    'biological efficiency',
    'data logging',
    'optimization',
    'metrics',
  ],
  other: {
    tags: [
      'yield',
      'optimization',
      'data',
      'metrics',
      'expert',
      'process-improvement',
    ].join(','),
  },
};

export default function YieldOptimization() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-gray-800 dark:text-gray-200">
      <Breadcrumbs
        items={[
          { label: 'Advanced', href: '/advanced' },
          { label: 'Yield Optimization', href: '/advanced/yield-optimization' },
        ]}
      />

      <SectionHeader
        title="Yield Optimization & Data Tracking"
        subtitle="Measure, compare, and iterate with intention"
      />

      <div className="space-y-8">
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Yield Metrics</h2>
          <p className="leading-relaxed">
            Track fresh weight, dry weight, and Biological Efficiency (BE = fresh weight / dry substrate weight * 100). Compare across strains and substrates to find consistent winners.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Data Logging</h2>
          <p className="leading-relaxed">
            Log inoculation dates, colonization times, fruiting setpoints, and flush yields. Use a simple spreadsheet or notebook; consistency beats complexity. Add photos to correlate morphology with numbers.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Iterative Experiments</h2>
          <p className="leading-relaxed">
            Change one variable at a time—spawn rate, supplementation %, or FAE schedule—and run A/B batches. Keep batch sizes small to avoid confounding contamination events with process changes.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Tools</h2>
          <p className="leading-relaxed">
            Pair data with the <Link href="/tools/cultivation-system-map" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">Cultivation System Map</Link> to spot bottlenecks, and use the <Link href="/tools/troubleshooting-decision-tree" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">Troubleshooting Decision Tree</Link> to correct issues before they skew results.
          </p>
        </section>

        <section>
          <RelatedIssues
            related={[
              { title: 'Advanced Environmental Control', href: '/advanced/environmental-control' },
              { title: 'Substrate Engineering & Optimization', href: '/advanced/substrate-engineering' },
              { title: 'Fruiting Chamber Design & Optimization', href: '/advanced/fruiting-chamber-design' },
              { title: 'Slow Colonization', href: '/troubleshooting/slow-colonization' },
              { title: 'Stalled Fruiting', href: '/troubleshooting/stalled-fruiting' },
            ]}
          />
        </section>
      </div>
    </div>
  );
}
