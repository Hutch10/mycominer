import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '../../components/Breadcrumbs';
import SectionHeader from '../../components/SectionHeader';
import RelatedIssues from '../../components/RelatedIssues';

export const metadata: Metadata = {
  title: 'Beginner Pathway — Step 2: Choose Your First Species',
  description: 'Pick an easy, forgiving species using ecological fit and troubleshooting resilience to ensure your first grow succeeds.',
  keywords: [
    'beginner',
    'species selection',
    'oyster',
    'lions mane',
    'shiitake',
    'decision helper',
    'workflow',
  ],
  other: {
    tags: [
      'beginner',
      'species-selection',
      'oyster',
      'lions-mane',
      'shiitake',
      'ecology',
      'substrate-matching',
    ].join(','),
  },
};

export default function Step2Species() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-gray-800 dark:text-gray-200">
      <Breadcrumbs
        items={[
          { label: 'Beginner Pathway', href: '/beginner-pathway' },
          { label: 'Step 2', href: '/beginner-pathway/step-2' },
          { label: 'Choose Your First Species', href: '/beginner-pathway/step-2' },
        ]}
      />

      <SectionHeader
        title="Step 2: Choose Your First Species"
        subtitle="Select a forgiving species matched to your environment and materials"
      />

      <div className="space-y-8">
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Recommended Starters</h2>
          <ul className="list-disc ml-6 space-y-2">
            <li><Link href="/growing-guides/oyster" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">Oyster</Link>: Fast colonizer, tolerant of small mistakes, grows on straw or coir.</li>
            <li><Link href="/growing-guides/lions-mane" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">Lion's Mane</Link>: Moderate speed, prefers supplemented sawdust, tolerates higher CO2.</li>
            <li><Link href="/growing-guides/shiitake" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">Shiitake</Link>: Slower but resilient; great for sawdust blocks if you can wait.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Decision Helper</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">If you want speed</h3>
              <p className="mt-2 leading-relaxed">Choose oyster. Pair with straw/coir and high FAE to avoid <Link href="/troubleshooting/fuzzy-feet" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">fuzzy feet</Link>.</p>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">If you want low CO2 fuss</h3>
              <p className="mt-2 leading-relaxed">Choose lion's mane. It tolerates higher CO2, so fewer air changes are needed, reducing drying risk.</p>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">If you prefer richer flavor</h3>
              <p className="mt-2 leading-relaxed">Choose shiitake. Plan for a longer colonization and a rest period before fruiting.</p>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">If space is limited</h3>
              <p className="mt-2 leading-relaxed">Bottle or bag grows of lion's mane or enoki fit small footprints; use the <Link href="/tools/species-comparison-matrix" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">species matrix</Link> to size humidity and temps.</p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Match Species to Substrate</h2>
          <p className="leading-relaxed">
            Use <Link href="/foundations/substrates" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">Substrates and Nutrition</Link> plus the <Link href="/tools/substrate-selector" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">Substrate Selector</Link> to pair species with materials you already have.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Starter Kit Checklist</h2>
          <ul className="list-disc ml-6 space-y-2">
            <li>Pre-sterilized grain spawn for chosen species (or pressure cooker + grain prep plan).</li>
            <li>Bulk substrate: straw/coir for oyster; hardwood sawdust + bran for lion's mane or shiitake.</li>
            <li>Filter patch bags or jars, thermometer/hygrometer, clean workspace.</li>
          </ul>
        </section>

        <section>
          <RelatedIssues
            related={[
              { title: 'Step 1: Foundations', href: '/beginner-pathway/step-1' },
              { title: 'Step 3: Prepare Your Workspace', href: '/beginner-pathway/step-3' },
              { title: 'Species Comparison Matrix', href: '/tools/species-comparison-matrix' },
              { title: 'Substrate Selector', href: '/tools/substrate-selector' },
              { title: 'Growing Oyster Mushrooms', href: '/growing-guides/oyster' },
            ]}
          />
        </section>
      </div>
    </div>
  );
}
