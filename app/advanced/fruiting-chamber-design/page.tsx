import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '../../components/Breadcrumbs';
import SectionHeader from '../../components/SectionHeader';
import RelatedIssues from '../../components/RelatedIssues';

export const metadata: Metadata = {
  title: 'Fruiting Chamber Design & Optimization',
  description: 'Engineer monotubs, tents, and automated chambers with airflow patterns and humidification tuned to species.',
  keywords: [
    'advanced',
    'fruiting chamber',
    'airflow',
    'humidity',
    'design',
    'automation',
  ],
  other: {
    tags: [
      'fruiting',
      'chamber-design',
      'airflow',
      'humidity',
      'automation',
      'expert',
    ].join(','),
  },
};

export default function FruitingChamberDesign() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-gray-800 dark:text-gray-200">
      <Breadcrumbs
        items={[
          { label: 'Advanced', href: '/advanced' },
          { label: 'Fruiting Chamber Design', href: '/advanced/fruiting-chamber-design' },
        ]}
      />

      <SectionHeader
        title="Fruiting Chamber Design & Optimization"
        subtitle="Combine airflow, humidity, and footprint for predictable canopies"
      />

      <div className="space-y-8">
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Monotubs</h2>
          <p className="leading-relaxed">
            Balance hole size and polyfill density to set FAE while holding RH. Add a gentle fan nearby instead of pointing directly to prevent surface drying. Elevate tubs for underflow exhaust if CO₂ builds.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Tent and Rack Systems</h2>
          <p className="leading-relaxed">
            Use top-fed fresh air with side exhaust to keep laminar flow across shelves. Ultrasonic foggers paired with circulation fans maintain droplet turnover; avoid fog blasting directly onto blocks.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Automation</h2>
          <p className="leading-relaxed">
            PID-controlled humidifiers and interval fans create consistent cycles. Pair CO₂ sensors with a controller to trigger short exhaust bursts. Log duty cycles to refine setpoints by species.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Linking Species and Chambers</h2>
          <p className="leading-relaxed">
            Match chamber type to species tolerance: oysters thrive in high-FAE tents; lion's mane fits semi-closed tubs with moderate FAE; shiitake favors cooler tents with stable humidity.
          </p>
          <p className="leading-relaxed">
            Use the <Link href="/tools/cultivation-system-map" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">Cultivation System Map</Link> and <Link href="/tools/species-comparison-matrix" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">Species Comparison Matrix</Link> to pick chamber footprints and setpoints.
          </p>
        </section>

        <section>
          <RelatedIssues
            related={[
              { title: 'Fuzzy Feet', href: '/troubleshooting/fuzzy-feet' },
              { title: 'Side Pinning', href: '/troubleshooting/side-pinning' },
              { title: 'Drying Caps', href: '/troubleshooting/drying-caps' },
              { title: 'Advanced Environmental Control', href: '/advanced/environmental-control' },
              { title: 'Species Behavior & Ecological Niches', href: '/advanced/species-ecology' },
            ]}
          />
        </section>
      </div>
    </div>
  );
}
