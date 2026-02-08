import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '../components/Breadcrumbs';
import SectionHeader from '../components/SectionHeader';
import RelatedIssues from '../components/RelatedIssues';

export const metadata: Metadata = {
  title: 'Legacy Growing Guides',
  description: 'Original growing guides for select mushroom species. For the full library, see Growing Guides.',
  keywords: [
    'growing guides',
    'oyster',
    'lions mane',
    'shiitake',
    'reishi',
  ],
  other: {
    tags: ['guides', 'legacy', 'species'].join(','),
  },
};

export default function GuidesIndexPage() {
  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Guides', href: '/guides' },
        ]}
      />

      <SectionHeader
        title="Legacy Growing Guides"
        subtitle="Original cultivation guides for select species"
      />

      <div className="space-y-8 text-gray-800 dark:text-gray-200">
        <section className="space-y-3">
          <p className="leading-relaxed">
            This section contains earlier cultivation guides. For the complete
            species library with updated content, visit the{' '}
            <Link href="/growing-guides" className="text-blue-600 dark:text-blue-400 hover:underline">
              Growing Guides
            </Link>{' '}
            section.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Available Species</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              href="/guides/oyster-mushrooms"
              className="block p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200 hover:shadow-lg"
            >
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Oyster Mushrooms
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 italic">
                Pleurotus ostreatus
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                Original cultivation guide for oyster mushrooms.
              </p>
            </Link>

            <Link
              href="/guides/lions-mane"
              className="block p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200 hover:shadow-lg"
            >
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Lion's Mane
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 italic">
                Hericium erinaceus
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                Original cultivation guide for lion's mane.
              </p>
            </Link>

            <Link
              href="/guides/shiitake"
              className="block p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200 hover:shadow-lg"
            >
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Shiitake
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 italic">
                Lentinula edodes
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                Original cultivation guide for shiitake.
              </p>
            </Link>

            <Link
              href="/guides/reishi"
              className="block p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200 hover:shadow-lg"
            >
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Reishi
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 italic">
                Ganoderma lucidum
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                Original cultivation guide for reishi.
              </p>
            </Link>
          </div>
        </section>
      </div>

      <RelatedIssues
        related={[
          {
            title: 'Growing Guides (Complete Library)',
            href: '/growing-guides',
          },
          {
            title: 'Beginner Pathway',
            href: '/beginner-pathway',
          },
          {
            title: 'Species Comparison Matrix',
            href: '/tools/species-comparison-matrix',
          },
          {
            title: 'Foundations',
            href: '/foundations',
          },
        ]}
      />
    </div>
  );
}
