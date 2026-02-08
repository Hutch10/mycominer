import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '../../components/Breadcrumbs';
import SectionHeader from '../../components/SectionHeader';
import RelatedIssues from '../../components/RelatedIssues';

export const metadata: Metadata = {
  title: 'Substrates and Nutrition',
  description: 'Choose and prepare substrates that balance nutrition, moisture, and structure for fast, clean colonization and reliable fruiting.',
  keywords: [
    'substrates',
    'grain spawn',
    'bulk substrate',
    'supplementation',
    'pasteurization',
    'sterilization',
    'moisture content',
    'species matching',
  ],
  other: {
    tags: [
      'foundations',
      'substrates',
      'grain',
      'bulk-substrate',
      'supplementation',
      'moisture',
      'sterilization',
      'pasteurization',
      'cultivation-stages:spawn',
      'cultivation-stages:bulk',
      'troubleshooting-patterns:bacterial-contamination',
    ].join(','),
  },
};

export default function SubstratesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Breadcrumbs
        items={[
          { label: 'Foundations', href: '/foundations/overview' },
          { label: 'Materials', href: '/foundations/substrates' },
          { label: 'Substrates and Nutrition', href: '/foundations/substrates' },
        ]}
      />

      <SectionHeader
        title="Substrates and Nutrition"
        subtitle="Match materials to species and control contamination pressure"
      />

      <div className="space-y-10 text-gray-800 dark:text-gray-200">
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Why Substrates Matter</h2>
          <p className="leading-relaxed">
            Substrates provide water, structure, and nutrients. The right mix speeds colonization, lowers contamination risk, and supports strong fruiting. Pair this with <Link href="/foundations/ecology" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">fungal ecology</Link> to understand why saprotrophic species digest wood or straw differently.
          </p>
          <p className="leading-relaxed">
            Think in terms of levers: nutrition density, moisture content, and oxygen availability. Push nutrition too high without sterilization and bacteria win; dry the substrate and mycelium slows; pack too tight and CO2 accumulates.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">What Makes a Good Substrate</h2>
          <ul className="list-disc ml-6 space-y-2">
            <li><strong>Moisture:</strong> 60-65% for grains; field capacity for bulk so it glistens but does not drip.</li>
            <li><strong>Structure:</strong> Air pockets for gas exchange; avoid compaction.</li>
            <li><strong>Nutrition:</strong> Enough to fuel growth without inviting competitors.</li>
            <li><strong>Cleanliness:</strong> Sterilize high-nutrient substrates; pasteurize lower-nutrient bulk.</li>
            <li><strong>Consistency:</strong> Even particle size for uniform colonization.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Core Substrate Types</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Grain (Spawn)</h3>
              <p className="mt-2 leading-relaxed">
                Oats, rye, millet, sorghum. High nutrition, many inoculation points. Must be sterilized to avoid <Link href="/troubleshooting/bacterial-contamination" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">bacterial contamination</Link> and molds.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Bulk Substrate</h3>
              <p className="mt-2 leading-relaxed">
                Coir, vermiculite, straw, hardwood sawdust, manure mixes. Lower nutrition, easier to pasteurize. Provides moisture and structure for fruiting.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Supplemented Bulk</h3>
              <p className="mt-2 leading-relaxed">
                Sawdust with bran or soy hulls (Masters Mix) for wood lovers like <Link href="/growing-guides/lions-mane" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">lion's mane</Link> and <Link href="/medicinal-mushrooms/reishi" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">reishi</Link>. Requires sterilization because nutrition is high.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Specialized Mixes</h3>
              <p className="mt-2 leading-relaxed">
                Masters Mix (soy hulls + hardwood), supplemented straw pellets, or manure blends for species like cubensis. Choose based on species profile from the <Link href="/tools/species-comparison-matrix" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">species comparison matrix</Link>.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Moisture and Preparation</h2>
          <p className="leading-relaxed">
            Moisture sets the competitive balance. Over-wet grains go anaerobic and favor bacteria; under-hydrated bulk stalls colonization. After sterilization or pasteurization, let substrates steam off until just glistening.
          </p>
          <ul className="list-disc ml-6 space-y-2">
            <li>Grain: 60-65% moisture; no pooling at jar bottom.</li>
            <li>Bulk: field capacity - squeeze hard and only a few drops appear.</li>
            <li>Supplemented wood: slightly drier to offset soy hull water retention.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Matching Substrates to Species</h2>
          <p className="leading-relaxed">
            Match the substrate to the organism's native niche. Fast saprotrophs like <Link href="/growing-guides/oyster" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">oysters</Link> excel on straw and coir; wood lovers like <Link href="/growing-guides/shiitake" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">shiitake</Link> and <Link href="/growing-guides/lions-mane" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">lion's mane</Link> want hardwood; medicinals like <Link href="/medicinal-mushrooms/reishi" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">reishi</Link> prefer dense wood or logs.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Why It Matters for Troubleshooting</h2>
          <p className="leading-relaxed">
            Many issues trace back to substrate fit: stalled colonization from wet grain, <Link href="/troubleshooting/yellowing-mycelium" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">yellowing mycelium</Link> from heat in dense substrate, or <Link href="/troubleshooting/odd-fruit-shapes" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">odd fruit shapes</Link> from poor gas exchange in compacted tubs. Starting with the right material reduces downstream problems.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Next Steps</h2>
          <RelatedIssues
            related={[
              { title: 'Sterile Technique', href: '/foundations/sterile-technique' },
              { title: 'Environmental Parameters', href: '/foundations/environmental-parameters' },
              { title: 'Species Comparison Matrix', href: '/tools/species-comparison-matrix' },
              { title: 'Growing Oyster Mushrooms', href: '/growing-guides/oyster' },
              { title: 'Troubleshooting: Bacterial Contamination', href: '/troubleshooting/bacterial-contamination' },
            ]}
          />
        </section>
      </div>
    </div>
  );
}