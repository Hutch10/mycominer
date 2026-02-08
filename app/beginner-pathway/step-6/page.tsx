import type { Metadata } from 'next';
import Breadcrumbs from '../../components/Breadcrumbs';
import SectionHeader from '../../components/SectionHeader';
import RelatedIssues from '../../components/RelatedIssues';

export const metadata: Metadata = {
  title: 'Beginner Pathway — Step 6: Fruiting',
  description: 'Trigger pinning and maintain surface conditions for healthy fruiting with humidity and fresh air in balance.',
  keywords: [
    'beginner',
    'fruiting',
    'pinning',
    'humidity',
    'fresh air exchange',
    'workflow',
  ],
  other: {
    tags: [
      'beginner',
      'workflow',
      'fruiting',
      'pinning',
      'humidity',
      'fae',
      'environmental-control',
      'harvesting',
    ].join(','),
  },
};

export default function Step6Fruiting() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-gray-800 dark:text-gray-200">
      <Breadcrumbs
        items={[
          { label: 'Beginner Pathway', href: '/beginner-pathway' },
          { label: 'Step 6', href: '/beginner-pathway/step-6' },
          { label: 'Fruiting', href: '/beginner-pathway/step-6' },
        ]}
      />

      <SectionHeader
        title="Step 6: Fruiting"
        subtitle="Shift to high humidity and steady fresh air to initiate pins and healthy growth"
      />

      <div className="space-y-8">
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">When to Initiate</h2>
          <p className="leading-relaxed">
            Move to fruiting once bags or blocks are fully colonized and show slight surface condensation. For tubs, ensure an even white surface with no uncolonized patches.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Conditions to Hold</h2>
          <ul className="list-disc ml-6 space-y-2">
            <li>Humidity: 85-95% with gentle surface moisture; avoid pooling water.</li>
            <li>Fresh air exchange: small, regular venting or dialed-in holes; watch for CO2 signs like fuzzy feet.</li>
            <li>Light: indirect light 12/12 helps orientation and pinning.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Surface Moisture</h2>
          <p className="leading-relaxed">
            You want fine droplets that evaporate between misting cycles. If the surface dries glossy, lightly mist; if pooling, increase airflow and pause misting.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Fruiting Chamber Basics</h2>
          <ul className="list-disc ml-6 space-y-2">
            <li>For blocks: cut an X or top slit; tent with a humidity bag or place in a monotub/greenhouse.</li>
            <li>For tubs: set hole size and polyfill/tape to tune FAE vs humidity; monitor daily for condensation and surface sheen.</li>
          </ul>
        </section>

        <section>
          <RelatedIssues
            related={[
              { title: 'Step 5: Colonization', href: '/beginner-pathway/step-5' },
              { title: 'Step 7: Harvesting and Storage', href: '/beginner-pathway/step-7' },
              { title: 'Drying Caps', href: '/troubleshooting/drying-caps' },
              { title: 'Side Pinning', href: '/troubleshooting/side-pinning' },
              { title: 'Fuzzy Feet', href: '/troubleshooting/fuzzy-feet' },
            ]}
          />
        </section>
      </div>
    </div>
  );
}
