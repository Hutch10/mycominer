import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '../components/Breadcrumbs';
import SectionHeader from '../components/SectionHeader';
import RelatedIssues from '../components/RelatedIssues';

// Static page with daily revalidation
export const revalidate = 86400; // 24 hours

export const metadata: Metadata = {
  title: 'Troubleshooting Guide',
  description: 'Diagnose and solve common cultivation issues using systems thinking and ecological reasoning.',
  keywords: [
    'troubleshooting',
    'problems',
    'contamination',
    'slow growth',
    'pinning issues',
  ],
  other: {
    tags: [
      'troubleshooting',
      'diagnostics',
      'symptoms',
      'solutions',
    ].join(','),
  },
};

export default function TroubleshootingIndexPage() {
  const issues = [
    { slug: "overview", title: "Troubleshooting Overview", description: "Systems approach to diagnosing cultivation issues" },
    { slug: "slow-colonization", title: "Slow Colonization", description: "Temperature, spawn quality, moisture issues" },
    { slug: "no-pins", title: "No Pins", description: "Humidity, evaporation, light, FAE triggers" },
    { slug: "side-pinning", title: "Side Pinning & Bottom Pins", description: "Microclimate gradients and liner solutions" },
    { slug: "aborts", title: "Aborts", description: "Nutrition, humidity, temperature stress" },
    { slug: "bacterial-contamination", title: "Bacterial Contamination", description: "Sterilization and moisture control" },
    { slug: "drying-caps", title: "Drying Caps", description: "Humidity and surface moisture" },
    { slug: "fuzzy-feet", title: "Fuzzy Feet", description: "CO₂ levels and fresh air exchange" },
    { slug: "green-mold", title: "Green Mold (Trichoderma)", description: "Competition and prevention strategies" },
    { slug: "odd-fruit-shapes", title: "Odd Fruit Shapes", description: "Environmental factors affecting morphology" },
    { slug: "overlay", title: "Overlay (Matted Mycelium)", description: "CO₂ buildup and defensive responses" },
    { slug: "stalled-fruiting", title: "Stalled Fruiting", description: "Environmental triggers and substrate readiness" },
    { slug: "yellowing-mycelium", title: "Yellowing Mycelium", description: "Metabolites, heat stress, and bacteria" },
  ];

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Troubleshooting', href: '/troubleshooting' },
        ]}
      />

      <SectionHeader
        title="Troubleshooting Guide"
        subtitle="Diagnose and solve common issues using systems thinking and ecological reasoning"
      />

      <div className="space-y-8 text-gray-800 dark:text-gray-200">
        <section className="space-y-3">
          <p className="leading-relaxed">
            This section helps you diagnose and solve common issues in mushroom
            cultivation. Each guide teaches you what the problem looks like, why it
            happens, how to fix it, and what it reveals about the ecology of your
            grow. Choose a topic below to begin.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Common Issues</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {issues.map((issue) => (
              <Link
                key={issue.slug}
                href={`/troubleshooting/${issue.slug}`}
                className="group p-5 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all duration-200 block"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2">
                  {issue.title}
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {issue.description}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <RelatedIssues
        related={[
          { title: 'Troubleshooting Decision Tree', href: '/tools/troubleshooting-decision-tree' },
          { title: 'Environmental Parameters', href: '/foundations/environmental-parameters' },
          { title: 'Contamination Ecology', href: '/foundations/contamination-ecology' },
          { title: 'Systems Thinking', href: '/foundations/systems-thinking' },
        ]}
      />
    </div>
  );
}