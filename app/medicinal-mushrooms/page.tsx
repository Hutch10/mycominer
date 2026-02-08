import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '../components/Breadcrumbs';
import SectionHeader from '../components/SectionHeader';
import RelatedIssues from '../components/RelatedIssues';

// Static page with daily revalidation
export const revalidate = 86400; // 24 hours

export const metadata: Metadata = {
  title: 'Medicinal Mushrooms - Health Benefits & Research',
  description: 'Evidence-informed overviews of major medicinal mushrooms covering traditional uses, active compounds, and current research.',
  keywords: [
    'medicinal mushrooms',
    'health benefits',
    'reishi',
    'lions mane',
    'turkey tail',
    'cordyceps',
    'chaga',
    'functional mushrooms',
  ],
  other: {
    tags: [
      'medicinal',
      'health',
      'reishi',
      'lions-mane',
      'turkey-tail',
      'cordyceps',
      'chaga',
      'compounds',
    ].join(','),
  },
};

export default function MedicinalMushroomsIndexPage() {
  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Medicinal Mushrooms', href: '/medicinal-mushrooms' },
        ]}
      />

      <SectionHeader
        title="Medicinal Mushrooms"
        subtitle="Evidence-informed guides to health benefits and preparation"
      />

      <div className="space-y-8 text-gray-800 dark:text-gray-200">
        <section className="space-y-3">
          <p className="leading-relaxed">
            This section provides clear, accessible, evidence-informed overviews of
            major medicinal mushrooms. Each page covers traditional uses, active
            compounds, preparation methods, and what current research suggests. These
            guides are educational and not medical advice — they help you understand
            the biology and context behind each species.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Medicinal Species</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              href="/medicinal-mushrooms/lions-mane"
              className="block p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200 hover:shadow-lg"
            >
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Lion's Mane
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 italic">
                Hericium erinaceus
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                Known for compounds that support nerve growth and cognitive health.
              </p>
            </Link>

            <Link
              href="/medicinal-mushrooms/reishi"
              className="block p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200 hover:shadow-lg"
            >
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Reishi
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 italic">
                Ganoderma lucidum
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                A traditional tonic mushroom associated with immune modulation and stress support.
              </p>
            </Link>

            <Link
              href="/medicinal-mushrooms/turkey-tail"
              className="block p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200 hover:shadow-lg"
            >
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Turkey Tail
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 italic">
                Trametes versicolor
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                Rich in polysaccharopeptides studied for immune-related applications.
              </p>
            </Link>

            <Link
              href="/medicinal-mushrooms/cordyceps"
              className="block p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200 hover:shadow-lg"
            >
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Cordyceps
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 italic">
                Cordyceps militaris
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                Traditionally used for energy, endurance, and metabolic support.
              </p>
            </Link>

            <Link
              href="/medicinal-mushrooms/chaga"
              className="block p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200 hover:shadow-lg"
            >
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Chaga
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 italic">
                Inonotus obliquus
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                A slow-growing sclerotium valued for antioxidant compounds.
              </p>
            </Link>

            <Link
              href="/medicinal-mushrooms/maitake"
              className="block p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200 hover:shadow-lg"
            >
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Maitake
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 italic">
                Grifola frondosa
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                "Hen of the woods" valued for its immune-supporting properties.
              </p>
            </Link>

            <Link
              href="/medicinal-mushrooms/shiitake"
              className="block p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200 hover:shadow-lg"
            >
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Shiitake (Medicinal)
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 italic">
                Lentinula edodes
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                A culinary mushroom with well-studied immune and cardiovascular benefits.
              </p>
            </Link>

            <Link
              href="/medicinal-mushrooms/preparation"
              className="block p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200 hover:shadow-lg"
            >
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Preparation Methods
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Learn how to prepare medicinal mushrooms: teas, tinctures, extracts, and powders.
              </p>
            </Link>

            <Link
              href="/medicinal-mushrooms/reishi-vs-turkey-tail"
              className="block p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200 hover:shadow-lg"
            >
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Reishi vs Turkey Tail
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Compare two major medicinal species and understand their different profiles.
              </p>
            </Link>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">How to Use This Section</h2>
          <p className="leading-relaxed">
            These pages help you understand the ecological role, chemistry, and
            traditional context of each species. They are not medical claims — they
            are educational tools for growers, herbalists, and curious readers.
          </p>
        </section>
      </div>

      <RelatedIssues
        related={[
          {
            title: 'Growing Guides',
            href: '/growing-guides',
          },
          {
            title: 'Preparation Methods',
            href: '/medicinal-mushrooms/preparation',
          },
          {
            title: 'Substrates',
            href: '/foundations/substrates',
          },
          {
            title: 'Species Ecology',
            href: '/advanced/species-ecology',
          },
        ]}
      />
    </div>
  );
}
