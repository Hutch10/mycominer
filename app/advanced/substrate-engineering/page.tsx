import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '../../components/Breadcrumbs';
import SectionHeader from '../../components/SectionHeader';
import RelatedIssues from '../../components/RelatedIssues';

export const metadata: Metadata = {
  title: 'Substrate Engineering & Optimization',
  description: 'Design substrate ratios, supplementation, water activity, and thermal mass to accelerate colonization while suppressing contaminants.',
  keywords: [
    'advanced',
    'substrates',
    'supplementation',
    'water activity',
    'optimization',
    'contamination',
  ],
  other: {
    tags: [
      'substrates',
      'supplementation',
      'contamination',
      'optimization',
      'water-activity',
      'thermal-mass',
      'expert',
    ].join(','),
  },
};

export default function SubstrateEngineering() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-gray-800 dark:text-gray-200">
      <Breadcrumbs
        items={[
          { label: 'Advanced', href: '/advanced' },
          { label: 'Substrate Engineering', href: '/advanced/substrate-engineering' },
        ]}
      />

      <SectionHeader
        title="Substrate Engineering & Optimization"
        subtitle="Balance nutrition, structure, moisture, and heat to favor mycelium"
      />

      <div className="space-y-8">
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Ratios and Structure</h2>
          <p className="leading-relaxed">
            Blend base fibers (coir/straw/sawdust) with 5-20% supplementation depending on species. Keep particle size mixed to allow airflow through the block while maintaining water holding.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Supplementation Strategies</h2>
          <p className="leading-relaxed">
            Higher nitrogen (bran, soy hulls) speeds colonization but narrows your sterile margin. For oysters, 10-15% soy hulls is a reliable ceiling; for lion's mane, 15-20% hardwood + bran works well with clean spawn.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Water Activity and Thermal Mass</h2>
          <p className="leading-relaxed">
            Field capacity should leave only a faint drip when squeezed. Extra water or large blocks increase thermal mass, slowing cooling after sterilization and giving contaminants time to recover. Vent and cool quickly to keep the advantage.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Contamination Vectors</h2>
          <p className="leading-relaxed">
            Bran-rich mixes invite bacillus and molds if sterilization is incomplete. Monitor for sweet or sour smells and yellowing metabolites—early signs that water activity plus nutrients tipped the balance.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Tools</h2>
          <p className="leading-relaxed">
            Use the <Link href="/tools/substrate-selector" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">Substrate Selector</Link> to match species and supplementation targets, and log recipes alongside colonization times to tighten your process window.
          </p>
        </section>

        <section>
          <RelatedIssues
            related={[
              { title: 'Bacterial Contamination', href: '/troubleshooting/bacterial-contamination' },
              { title: 'Yellowing Mycelium', href: '/troubleshooting/yellowing-mycelium' },
              { title: 'Contamination Ecology & Defense Strategies', href: '/advanced/contamination-ecology' },
              { title: 'Species Behavior & Ecological Niches', href: '/advanced/species-ecology' },
              { title: 'Substrates', href: '/foundations/substrates' },
            ]}
          />
        </section>
      </div>
    </div>
  );
}
