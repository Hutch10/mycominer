import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '../../components/Breadcrumbs';
import SectionHeader from '../../components/SectionHeader';
import RelatedIssues from '../../components/RelatedIssues';

export const metadata: Metadata = {
  title: 'Species Behavior & Ecological Niches',
  description: 'Understand species strategies, niche preferences, competition, and stress responses to tune chambers and substrates.',
  keywords: [
    'advanced',
    'species',
    'ecology',
    'niches',
    'stress response',
    'competition',
  ],
  other: {
    tags: [
      'ecology',
      'species',
      'niches',
      'stress-response',
      'competition',
      'expert',
    ].join(','),
  },
};

export default function SpeciesEcology() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-gray-800 dark:text-gray-200">
      <Breadcrumbs
        items={[
          { label: 'Advanced', href: '/advanced' },
          { label: 'Species Ecology', href: '/advanced/species-ecology' },
        ]}
      />

      <SectionHeader
        title="Species Behavior & Ecological Niches"
        subtitle="Pair species strategies with substrates and chambers for resilience"
      />

      <div className="space-y-8">
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Ecological Strategies</h2>
          <p className="leading-relaxed">
            Oysters are aggressive saprotrophs that reward high airflow and fast runs; lion's mane favors stable humidity and tolerates higher CO₂; shiitake prefers cooler, denser substrates and benefits from rest phases.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Niche Preferences</h2>
          <p className="leading-relaxed">
            Map each species to its native niche: hardwood vs. straw, cool vs. warm fruiting, low vs. high FAE tolerance. Align chamber design and substrate supplementation to those cues for predictable morphology.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Competitive and Stress Responses</h2>
          <p className="leading-relaxed">
            Under stress, mycelium thickens, exudes metabolites, or stalls. Match FAE, RH, and temperature to avoid defensive overlay or metabolite yellowing. Adjust airflow before over-misting to prevent bacterial advantage.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Tools</h2>
          <p className="leading-relaxed">
            Use the <Link href="/tools/species-comparison-matrix" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">Species Comparison Matrix</Link> to select chamber targets, and pair with the <Link href="/tools/substrate-selector" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">Substrate Selector</Link> for matching nutrition and structure.
          </p>
        </section>

        <section>
          <RelatedIssues
            related={[
              { title: 'Fuzzy Feet', href: '/troubleshooting/fuzzy-feet' },
              { title: 'Side Pinning', href: '/troubleshooting/side-pinning' },
              { title: 'Species Comparison Matrix', href: '/tools/species-comparison-matrix' },
              { title: "Lion's Mane", href: '/growing-guides/lions-mane' },
              { title: 'Oyster', href: '/growing-guides/oyster' },
            ]}
          />
        </section>
      </div>
    </div>
  );
}
