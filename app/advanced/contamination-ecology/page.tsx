import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '../../components/Breadcrumbs';
import SectionHeader from '../../components/SectionHeader';
import RelatedIssues from '../../components/RelatedIssues';

export const metadata: Metadata = {
  title: 'Contamination Ecology & Defense Strategies',
  description: 'Map microbial succession, competitive exclusion, and defense patterns to keep clean wins predictable.',
  keywords: [
    'advanced',
    'contamination',
    'microbial ecology',
    'defense',
    'competition',
    'succession',
  ],
  other: {
    tags: [
      'contamination',
      'ecology',
      'defense',
      'microbial',
      'succession',
      'expert',
    ].join(','),
  },
};

export default function ContaminationEcology() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-gray-800 dark:text-gray-200">
      <Breadcrumbs
        items={[
          { label: 'Advanced', href: '/advanced' },
          { label: 'Contamination Ecology', href: '/advanced/contamination-ecology' },
        ]}
      />

      <SectionHeader
        title="Contamination Ecology & Defense Strategies"
        subtitle="See contamination as an ecological process and intervene early"
      />

      <div className="space-y-8">
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Life Cycles and Succession</h2>
          <p className="leading-relaxed">
            Bacteria often lead after sterilization gaps; molds like trichoderma follow once pH and CO₂ shift. Track odors and surface metabolites to detect early stages before sporulation.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Competitive Exclusion</h2>
          <p className="leading-relaxed">
            Dense, fast colonization leaves fewer niches. Optimize spawn rate and substrate structure to shorten the vulnerable window. Keep gas exchange adequate to avoid anaerobic pockets that favor bacteria.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Defensive Cultivation</h2>
          <p className="leading-relaxed">
            Use smaller bag volumes, quicker cooling, and segmented inoculation days to limit cross-contamination. Retire suspect bags early to prevent aerosolized spores impacting healthy runs.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Link to Troubleshooting</h2>
          <p className="leading-relaxed">
            Map observed symptoms to the <Link href="/troubleshooting/search" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">Troubleshooting Search</Link> and <Link href="/troubleshooting/overview" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">Overview</Link> to select the right intervention before sporulation.
          </p>
        </section>

        <section>
          <RelatedIssues
            related={[
              { title: 'Green Mold', href: '/troubleshooting/green-mold' },
              { title: 'Bacterial Contamination', href: '/troubleshooting/bacterial-contamination' },
              { title: 'Overlay', href: '/troubleshooting/overlay' },
              { title: 'Contamination Ecology', href: '/foundations/contamination-ecology' },
              { title: 'Substrate Engineering & Optimization', href: '/advanced/substrate-engineering' },
            ]}
          />
        </section>
      </div>
    </div>
  );
}
