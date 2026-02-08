import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '../../components/Breadcrumbs';
import SectionHeader from '../../components/SectionHeader';
import RelatedIssues from '../../components/RelatedIssues';

export const metadata: Metadata = {
  title: 'Beginner Pathway — Step 3: Prepare Your Workspace',
  description: 'Set up a clean, low-contamination workspace with simple tools so inoculation is predictable.',
  keywords: [
    'beginner',
    'clean technique',
    'sterile technique',
    'workspace',
    'contamination',
    'workflow',
  ],
  other: {
    tags: [
      'beginner',
      'workflow',
      'clean-technique',
      'sterile-technique',
      'contamination',
      'substrates',
      'inoculation',
      'colonization',
      'fruiting',
      'harvesting',
    ].join(','),
  },
};

export default function Step3Workspace() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-gray-800 dark:text-gray-200">
      <Breadcrumbs
        items={[
          { label: 'Beginner Pathway', href: '/beginner-pathway' },
          { label: 'Step 3', href: '/beginner-pathway/step-3' },
          { label: 'Prepare Your Workspace', href: '/beginner-pathway/step-3' },
        ]}
      />

      <SectionHeader
        title="Step 3: Prepare Your Workspace"
        subtitle="Control air, surfaces, and workflow to reduce contamination risk"
      />

      <div className="space-y-8">
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Clean vs. Sterile</h2>
          <p className="leading-relaxed">
            Aim for clean, not perfect. A still air box, wiped surfaces, and deliberate movements prevent most contamination. Sterile technique (flaming needles, pressure-sterilized tools) is layered on top when inoculating grain.
          </p>
          <p className="leading-relaxed">
            Review <Link href="/foundations/clean-technique" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">Clean Technique</Link> and <Link href="/foundations/sterile-technique" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">Sterile Technique</Link> for exact motions.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Workspace Setup</h2>
          <ul className="list-disc ml-6 space-y-2">
            <li>Clear table; wipe with 70% isopropyl alcohol.</li>
            <li>Still air box or clear tote with armholes to reduce airflow.</li>
            <li>Alcohol spray, flame source for needles, nitrile gloves, face mask.</li>
            <li>Organize tools to minimize reaching over open containers.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Understand Contamination Ecology</h2>
          <p className="leading-relaxed">
            Bacteria and molds exploit unsterile moments. Knowing how they compete helps you close gaps: quick inoculation, minimal talking, and pre-planned movements.
          </p>
          <p className="leading-relaxed">
            Read <Link href="/foundations/contamination-ecology" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">Contamination Ecology</Link> to see why timing and moisture matter.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Checklist Before Inoculation</h2>
          <ul className="list-disc ml-6 space-y-2">
            <li>Wipe surfaces, tools, and gloves with alcohol.</li>
            <li>Lay out sterile grain bags/jars and substrate bags.</li>
            <li>Label with date and species.</li>
            <li>Plan hand movements; avoid reaching over open containers.</li>
          </ul>
        </section>

        <section>
          <RelatedIssues
            related={[
              { title: 'Step 2: Choose Your First Species', href: '/beginner-pathway/step-2' },
              { title: 'Step 4: Inoculation', href: '/beginner-pathway/step-4' },
              { title: 'Clean Technique', href: '/foundations/clean-technique' },
              { title: 'Sterile Technique', href: '/foundations/sterile-technique' },
              { title: 'Bacterial Contamination', href: '/troubleshooting/bacterial-contamination' },
            ]}
          />
        </section>
      </div>
    </div>
  );
}
