import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '../../components/Breadcrumbs';
import SectionHeader from '../../components/SectionHeader';
import RelatedIssues from '../../components/RelatedIssues';

export const metadata: Metadata = {
  title: 'Foundations Overview',
  description: 'Build the mental model, ecological literacy, and clean technique habits that make every cultivation step intuitive.',
  keywords: [
    'foundations',
    'mushroom cultivation basics',
    'systems thinking',
    'ecology',
    'clean technique',
    'environmental parameters',
    'substrates',
    'beginner mindset',
  ],
  other: {
    tags: [
      'foundations',
      'mindset',
      'systems-thinking',
      'ecology',
      'sterile-technique',
      'environmental-control',
      'substrates',
      'cultivation-stages:orientation',
    ].join(','),
  },
};

export default function FoundationsOverviewPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Breadcrumbs
        items={[
          { label: 'Foundations', href: '/foundations/overview' },
          { label: 'Overview', href: '/foundations/overview' },
        ]}
      />

      <SectionHeader
        title="Foundations Overview"
        subtitle="A conceptual map for thinking like a cultivator"
      />

      <div className="space-y-10 text-gray-800 dark:text-gray-200">
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Why Foundations Matter</h2>
          <p className="leading-relaxed">
            Mushrooms respond to conditions, not recipes. Foundations teaches you how to read those conditions, interpret what the organism is signaling, and make calm adjustments. This section is the mental scaffolding that makes every later skill - sterile technique, substrate choice, fruiting strategy - feel intuitive rather than random.
          </p>
          <p className="leading-relaxed">
            The ideas here connect mindset, ecology, and practical controls. They set you up to spot patterns before they become problems, whether you are dialing in <Link href="/foundations/environmental-parameters" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">environmental parameters</Link> or improving <Link href="/foundations/clean-technique" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">clean technique</Link>.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">What You'll Learn</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Mindset & Systems</h3>
              <p className="mt-2 leading-relaxed">
                Cultivation rewards patience and pattern-recognition. <Link href="/foundations/beginners-mindset" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">Beginner's mindset</Link> and <Link href="/foundations/systems-thinking" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">systems thinking</Link> help you act on signals instead of reacting to surprises.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Ecology & Organism</h3>
              <p className="mt-2 leading-relaxed">
                Understanding the organism - <Link href="/foundations/what-is-a-mushroom" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">what a mushroom is</Link> and <Link href="/foundations/what-is-mycelium" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">what mycelium does</Link> - grounds every decision about substrates, gas exchange, and light.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Clean Workflows</h3>
              <p className="mt-2 leading-relaxed">
                <Link href="/foundations/clean-technique" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">Clean technique</Link> and <Link href="/foundations/sterile-technique" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">sterile technique</Link> reduce biological noise so the fungal signal is clear.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Environment & Materials</h3>
              <p className="mt-2 leading-relaxed">
                The levers you can control - <Link href="/foundations/environmental-parameters" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">humidity, FAE, temperature, light</Link> - and the mediums you grow on (<Link href="/foundations/substrates" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">substrates</Link>) shape outcomes more than any recipe.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">How to Use Foundations</h2>
          <p className="leading-relaxed">
            Read slowly, then apply ideas to what you observe: condensation patterns, mycelial texture, timing of pins, smell changes. Each concept links to practical pages - species guides, tools, and troubleshooting - to show how the theory translates into action.
          </p>
          <p className="leading-relaxed">
            When in doubt, return here to recalibrate: Are your assumptions aligned with fungal ecology? Are you controlling the right variables? Use the <Link href="/tools/cultivation-system-map" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">cultivation system map</Link> to see how these foundations connect across the grow cycle.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Ready to Explore</h2>
          <p className="leading-relaxed">
            Move next into the ecological core or jump into a species guide while keeping these principles in mind. If issues appear, the troubleshooting section will make more sense because you can map symptoms back to environmental or procedural causes.
          </p>
          <RelatedIssues
            related={[
              { title: "Beginner's Mindset", href: '/foundations/beginners-mindset' },
              { title: 'Systems Thinking', href: '/foundations/systems-thinking' },
              { title: 'Environmental Parameters', href: '/foundations/environmental-parameters' },
              { title: 'Substrates & Nutrition', href: '/foundations/substrates' },
              { title: 'Species Comparison Matrix', href: '/tools/species-comparison-matrix' },
            ]}
          />
        </section>
      </div>
    </div>
  );
}