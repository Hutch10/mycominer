import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '../components/Breadcrumbs';
import SectionHeader from '../components/SectionHeader';
import RelatedIssues from '../components/RelatedIssues';

// Static page with daily revalidation
export const revalidate = 86400; // 24 hours

export const metadata: Metadata = {
  title: 'Growing Guides - Species-Specific Cultivation',
  description: 'Comprehensive cultivation guides for gourmet and medicinal mushroom species, covering substrates, fruiting conditions, and species-specific requirements.',
  keywords: [
    'growing guides',
    'mushroom species',
    'oyster',
    'lions mane',
    'reishi',
    'shiitake',
    'cultivation guides',
    'species-specific',
  ],
  other: {
    tags: [
      'growing-guides',
      'species',
      'cultivation',
      'oyster',
      'shiitake',
      'reishi',
      'lions-mane',
    ].join(','),
  },
};

export default function GrowingGuidesIndexPage() {
  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Growing Guides', href: '/growing-guides' },
        ]}
      />

      <SectionHeader
        title="Growing Guides"
        subtitle="Species-specific cultivation guides for gourmet and medicinal mushrooms"
      />

      <div className="space-y-8 text-gray-800 dark:text-gray-200">
        <section className="space-y-3">
          <p className="leading-relaxed">
            This section provides species-specific cultivation guides for gourmet and
            medicinal mushrooms. Each guide covers substrates, colonization,
            fruiting conditions, morphology, harvesting, and common issues. Use these
            pages to understand the unique needs of each species and refine your
            cultivation technique.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Species Guides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              href="/growing-guides/oyster"
              className="block p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200 hover:shadow-lg"
            >
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Oyster Mushrooms
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 italic">
                Pleurotus spp.
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                Fast, forgiving, and ideal for beginners. Highly responsive to airflow.
              </p>
            </Link>

            <Link
              href="/growing-guides/lions-mane"
              className="block p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200 hover:shadow-lg"
            >
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Lion's Mane
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 italic">
                Hericium erinaceus
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                A gourmet and medicinal species with unique morphology and substrate needs.
              </p>
            </Link>

            <Link
              href="/growing-guides/reishi"
              className="block p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200 hover:shadow-lg"
            >
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Reishi
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 italic">
                Ganoderma lucidum
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                A medicinal mushroom with antler and conk forms shaped by airflow.
              </p>
            </Link>

            <Link
              href="/growing-guides/shiitake"
              className="block p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200 hover:shadow-lg"
            >
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Shiitake
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 italic">
                Lentinula edodes
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                A hardwood-loving species with a unique browning phase before fruiting.
              </p>
            </Link>

            <Link
              href="/growing-guides/king-oyster"
              className="block p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200 hover:shadow-lg"
            >
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                King Oyster
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 italic">
                Pleurotus eryngii
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                Thick, meaty stems shaped by low airflow and nutrient-rich substrates.
              </p>
            </Link>

            <Link
              href="/growing-guides/chestnut"
              className="block p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200 hover:shadow-lg"
            >
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Chestnut Mushroom
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 italic">
                Pholiota adiposa
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                Produces beautiful clusters with nutty flavor and crisp texture.
              </p>
            </Link>

            <Link
              href="/growing-guides/pioppino"
              className="block p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200 hover:shadow-lg"
            >
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Pioppino
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 italic">
                Agrocybe aegerita
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                Elegant clusters with dark caps and crunchy stems.
              </p>
            </Link>

            <Link
              href="/growing-guides/turkey-tail"
              className="block p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200 hover:shadow-lg"
            >
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Turkey Tail
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 italic">
                Trametes versicolor
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                A medicinal species forming colorful, layered shelves.
              </p>
            </Link>

            <Link
              href="/growing-guides/cordyceps"
              className="block p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200 hover:shadow-lg"
            >
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Cordyceps
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 italic">
                Cordyceps militaris
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                A unique medicinal species requiring specialized substrates and bright light.
              </p>
            </Link>

            <Link
              href="/growing-guides/enoki"
              className="block p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200 hover:shadow-lg"
            >
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Enoki
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 italic">
                Flammulina velutipes
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                Delicate white clusters requiring cold temperatures and low light.
              </p>
            </Link>
          </div>
        </section>
      </div>

      <RelatedIssues
        related={[
          {
            title: 'Species Comparison Matrix',
            href: '/tools/species-comparison-matrix',
          },
          {
            title: 'Substrate Selector',
            href: '/tools/substrate-selector',
          },
          {
            title: 'Beginner Pathway',
            href: '/beginner-pathway',
          },
          {
            title: 'Advanced Species Ecology',
            href: '/advanced/species-ecology',
          },
        ]}
      />
    </div>
  );
}
