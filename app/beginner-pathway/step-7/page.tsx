import type { Metadata } from 'next';
import Breadcrumbs from '../../components/Breadcrumbs';
import SectionHeader from '../../components/SectionHeader';
import RelatedIssues from '../../components/RelatedIssues';

export const metadata: Metadata = {
  title: 'Beginner Pathway — Step 7: Harvesting and Storage',
  description: 'Harvest at peak quality, handle gently, and store or preserve to keep flavor and texture.',
  keywords: [
    'beginner',
    'harvest',
    'storage',
    'drying',
    'workflow',
    'quality',
  ],
  other: {
    tags: [
      'beginner',
      'workflow',
      'harvesting',
      'fruiting',
      'storage',
      'drying',
      'quality',
    ].join(','),
  },
};

export default function Step7Harvest() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-gray-800 dark:text-gray-200">
      <Breadcrumbs
        items={[
          { label: 'Beginner Pathway', href: '/beginner-pathway' },
          { label: 'Step 7', href: '/beginner-pathway/step-7' },
          { label: 'Harvesting and Storage', href: '/beginner-pathway/step-7' },
        ]}
      />

      <SectionHeader
        title="Step 7: Harvesting and Storage"
        subtitle="Pick at the right moment and preserve quality with gentle handling"
      />

      <div className="space-y-8">
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">When to Harvest</h2>
          <ul className="list-disc ml-6 space-y-2">
            <li>Oyster: caps flattening, edges still curled slightly.</li>
            <li>Lion's mane: spines lengthening but not yellowing; texture firm.</li>
            <li>Shiitake: caps mostly open with rolled edges; veil torn.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">How to Harvest</h2>
          <p className="leading-relaxed">
            Use a clean knife to cut at the base or twist gently to avoid tearing the block. Brush off debris; avoid washing unless dirt is visible.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Storage Options</h2>
          <ul className="list-disc ml-6 space-y-2">
            <li>Refrigerate: paper bag in the fridge for 3-7 days depending on species.</li>
            <li>Dehydrate: 125-135 F until crisp; store airtight with desiccant.</li>
            <li>Tincture or cook-freeze for longer keeping if desired.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Between Flushes</h2>
          <p className="leading-relaxed">
            Rest the block for a few days, then rehydrate if the substrate is light or dry. Maintain fruiting conditions for the next flush, adjusting FAE and humidity from what you observed.
          </p>
        </section>

        <section>
          <RelatedIssues
            related={[
              { title: 'Step 6: Fruiting', href: '/beginner-pathway/step-6' },
              { title: 'Step 8: Review and Next Steps', href: '/beginner-pathway/step-8' },
              { title: 'Drying Caps', href: '/troubleshooting/drying-caps' },
              { title: 'Odd Fruit Shapes', href: '/troubleshooting/odd-fruit-shapes' },
              { title: 'Troubleshooting Overview', href: '/troubleshooting/overview' },
            ]}
          />
        </section>
      </div>
    </div>
  );
}
