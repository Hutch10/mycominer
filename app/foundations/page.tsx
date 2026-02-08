import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '../components/Breadcrumbs';
import SectionHeader from '../components/SectionHeader';
import RelatedIssues from '../components/RelatedIssues';

// Static page with daily revalidation
export const revalidate = 86400; // 24 hours

export const metadata: Metadata = {
  title: 'Foundations of Mushroom Cultivation',
  description: 'Core principles, ecological concepts, and fundamental techniques that underpin all successful mushroom cultivation.',
  keywords: [
    'foundations',
    'basics',
    'ecology',
    'mycelium',
    'substrates',
    'sterile technique',
    'environmental parameters',
    'systems thinking',
  ],
  other: {
    tags: [
      'foundations',
      'overview',
      'ecology',
      'mycelium',
      'substrates',
      'technique',
      'environment',
      'systems',
    ].join(','),
  },
};

export default function FoundationsIndexPage() {
  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Foundations', href: '/foundations' },
        ]}
      />

      <SectionHeader
        title="Foundations of Mushroom Cultivation"
        subtitle="Core principles and ecological concepts that make everything else easier"
      />

      <div className="space-y-8 text-gray-800 dark:text-gray-200">
        <section className="space-y-3">
          <p className="leading-relaxed">
            This section introduces the core principles every grower should understand.
            Whether you're a complete beginner or refining your technique, these pages
            give you the conceptual grounding needed to make good decisions, diagnose
            problems, and grow with confidence. Think of this as the "why" behind the
            "how."
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Core Topics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              href="/foundations/overview"
              className="block p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200 hover:shadow-lg"
            >
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Overview
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Start here for the big picture — why foundations matter and how
                they accelerate learning.
              </p>
            </Link>

            <Link
              href="/foundations/what-is-mycelium"
              className="block p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200 hover:shadow-lg"
            >
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                What Is Mycelium?
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Understand the organism behind everything — how mycelium behaves,
                spreads, senses, and responds to its environment.
              </p>
            </Link>

            <Link
              href="/foundations/what-is-a-mushroom"
              className="block p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200 hover:shadow-lg"
            >
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                What Is a Mushroom?
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Learn the anatomy, function, and lifecycle role of mushroom fruiting
                bodies.
              </p>
            </Link>

            <Link
              href="/foundations/life-cycle"
              className="block p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200 hover:shadow-lg"
            >
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                The Mushroom Life Cycle
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                A clear walkthrough of spores, germination, colonization, pinning,
                fruiting, and senescence.
              </p>
            </Link>

            <Link
              href="/foundations/ecology"
              className="block p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200 hover:shadow-lg"
            >
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Ecology Fundamentals
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                How fungi interact with ecosystems — decomposition, symbiosis, and
                environmental roles.
              </p>
            </Link>

            <Link
              href="/foundations/fungal-ecology"
              className="block p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200 hover:shadow-lg"
            >
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Fungal Ecology & Behavior
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Explore how fungi behave in nature — competition, cooperation,
                resource allocation, and environmental sensing.
              </p>
            </Link>

            <Link
              href="/foundations/substrates"
              className="block p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200 hover:shadow-lg"
            >
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Substrates & Nutrition
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Learn what mushrooms eat, how substrates work, and why different
                species prefer different materials.
              </p>
            </Link>

            <Link
              href="/foundations/environmental-parameters"
              className="block p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200 hover:shadow-lg"
            >
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Environmental Parameters
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Humidity, temperature, CO₂, airflow, and light — how each factor
                shapes mycelial behavior and fruiting outcomes.
              </p>
            </Link>

            <Link
              href="/foundations/systems-thinking"
              className="block p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200 hover:shadow-lg"
            >
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Systems Thinking for Growers
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Learn to see your grow as an interconnected system, improving your
                ability to diagnose issues and adapt intelligently.
              </p>
            </Link>

            <Link
              href="/foundations/beginners-mindset"
              className="block p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200 hover:shadow-lg"
            >
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Beginner's Mindset
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Cultivate curiosity, patience, and adaptive learning — the mental
                approach that makes mastery possible.
              </p>
            </Link>

            <Link
              href="/foundations/clean-technique"
              className="block p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200 hover:shadow-lg"
            >
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Clean Technique
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Practical contamination prevention for everyday growing without
                full sterile procedures.
              </p>
            </Link>

            <Link
              href="/foundations/sterile-technique"
              className="block p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200 hover:shadow-lg"
            >
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Sterile Technique
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                The essential skills for preventing contamination — from workflow to
                tools to mindset.
              </p>
            </Link>

            <Link
              href="/foundations/contamination-ecology"
              className="block p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200 hover:shadow-lg"
            >
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Contamination Ecology
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Understand the ecological dynamics of contamination — why it happens
                and how to prevent it systemically.
              </p>
            </Link>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">How to Use This Section</h2>
          <p className="leading-relaxed">
            You don't need to memorize everything. Instead, use these pages to build
            intuition. The more you understand the organism, the easier it becomes to
            troubleshoot, adapt, and grow successfully — no matter the species or
            technique.
          </p>
        </section>
      </div>

      <RelatedIssues
        related={[
          {
            title: 'Beginner Pathway',
            href: '/beginner-pathway',
          },
          {
            title: 'Systems Thinking',
            href: '/foundations/systems-thinking',
          },
          {
            title: 'Cultivation System Map',
            href: '/tools/cultivation-system-map',
          },
          {
            title: 'Growing Guides',
            href: '/growing-guides',
          },
        ]}
      />
    </div>
  );
}
