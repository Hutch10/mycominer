import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '../components/Breadcrumbs';
import SectionHeader from '../components/SectionHeader';
import RelatedIssues from '../components/RelatedIssues';

// Static page with daily revalidation
export const revalidate = 86400; // 24 hours

export const metadata: Metadata = {
  title: 'Beginner Pathway: Start Here',
  description: 'Follow a structured, beginner-friendly pathway from zero knowledge to harvesting your first mushrooms using the platform knowledge graph.',
  keywords: [
    'beginner pathway',
    'overview',
    'learning path',
    'workflow',
    'first grow',
  ],
  other: {
    tags: [
      'beginner',
      'overview',
      'learning-path',
      'workflow',
    ].join(','),
  },
};

export default function BeginnerPathwayOverview() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-gray-800 dark:text-gray-200">
      <Breadcrumbs
        items={[
          { label: 'Beginner Pathway', href: '/beginner-pathway' },
          { label: 'Start Here', href: '/beginner-pathway' },
        ]}
      />

      <SectionHeader
        title="Beginner Pathway: Start Here"
        subtitle="A guided route from zero to your first successful harvest"
      />

      <div className="space-y-8">
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">What This Pathway Is</h2>
          <p className="leading-relaxed">
            A concise, stepwise curriculum that connects our foundations, tools, species guides, and troubleshooting into a single journey. Follow the steps in order; each links to deeper references so you can act with confidence.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Who It's For</h2>
          <p className="leading-relaxed">
            New growers who want a clear starting line, a minimal-but-reliable first setup, and fast access to answers when something looks off.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">How to Use It</h2>
          <ul className="list-disc ml-6 space-y-2">
            <li>Do one step at a time; skim linked references when you need detail.</li>
            <li>Keep a notebook of parameters (temp, humidity, dates) to speed troubleshooting.</li>
            <li>Use the Related Pages at each step to branch to answers without losing the thread.</li>
            <li>Lean on tools like the Species Comparison Matrix, Substrate Selector, and Troubleshooting Decision Tree when making choices.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Steps</h2>
          <ol className="list-decimal ml-6 space-y-3">
            <li className="space-y-1">
              <Link href="/beginner-pathway/step-1" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">Step 1: Foundations</Link>
              <p className="text-sm text-gray-700 dark:text-gray-300">Mindset, organism basics, ecology, and substrate fundamentals.</p>
            </li>
            <li className="space-y-1">
              <Link href="/beginner-pathway/step-2" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">Step 2: Choose Your First Species</Link>
              <p className="text-sm text-gray-700 dark:text-gray-300">Pick a forgiving species using environmental fit and troubleshooting resilience.</p>
            </li>
            <li className="space-y-1">
              <Link href="/beginner-pathway/step-3" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">Step 3: Prepare Your Workspace</Link>
              <p className="text-sm text-gray-700 dark:text-gray-300">Set up clean technique and organize tools to avoid contamination.</p>
            </li>
            <li className="space-y-1">
              <Link href="/beginner-pathway/step-4" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">Step 4: Inoculation</Link>
              <p className="text-sm text-gray-700 dark:text-gray-300">Move clean spawn into grain or bulk with a repeatable sterile workflow.</p>
            </li>
            <li className="space-y-1">
              <Link href="/beginner-pathway/step-5" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">Step 5: Colonization</Link>
              <p className="text-sm text-gray-700 dark:text-gray-300">Hold steady temps and gas exchange while mycelium captures the substrate.</p>
            </li>
            <li className="space-y-1">
              <Link href="/beginner-pathway/step-6" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">Step 6: Fruiting</Link>
              <p className="text-sm text-gray-700 dark:text-gray-300">Balance humidity and FAE to trigger pinning and healthy growth.</p>
            </li>
            <li className="space-y-1">
              <Link href="/beginner-pathway/step-7" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">Step 7: Harvesting & Storage</Link>
              <p className="text-sm text-gray-700 dark:text-gray-300">Harvest at peak quality, then store or dry without losing texture.</p>
            </li>
            <li className="space-y-1">
              <Link href="/beginner-pathway/step-8" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">Step 8: Review & Next Steps</Link>
              <p className="text-sm text-gray-700 dark:text-gray-300">Capture lessons, stabilize your process, and plan the next species or scale.</p>
            </li>
          </ol>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">What You'll Need</h2>
          <ul className="list-disc ml-6 space-y-2">
            <li>Basic workspace with a clean table and still air box (or glovebox).</li>
            <li>Pressure cooker or access to sterilized grain spawn; coir or straw for bulk substrate.</li>
            <li>A beginner species (oyster or lion's mane) and filter patch bags or jars.</li>
          </ul>
        </section>

        <section>
          <RelatedIssues
            related={[
              { title: 'Step 1: Foundations', href: '/beginner-pathway/step-1' },
              { title: 'Step 2: Choose Your First Species', href: '/beginner-pathway/step-2' },
              { title: 'Cultivation System Map', href: '/tools/cultivation-system-map' },
              { title: 'Troubleshooting Overview', href: '/troubleshooting/overview' },
              { title: 'Species Comparison Matrix', href: '/tools/species-comparison-matrix' },
            ]}
          />
        </section>
      </div>
    </div>
  );
}
