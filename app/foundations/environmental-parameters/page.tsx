import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '../../components/Breadcrumbs';
import SectionHeader from '../../components/SectionHeader';
import RelatedIssues from '../../components/RelatedIssues';

export const metadata: Metadata = {
  title: 'Environmental Parameters',
  description: 'Dial humidity, fresh air exchange, temperature, light, and surface moisture as a connected system to guide mycelium from colonization to fruiting.',
  keywords: [
    'humidity',
    'fresh air exchange',
    'temperature',
    'light',
    'surface moisture',
    'evaporation',
    'environmental control',
    'pinning triggers',
  ],
  other: {
    tags: [
      'foundations',
      'environmental-control',
      'humidity',
      'fae',
      'temperature',
      'light',
      'evaporation',
      'cultivation-stages:colonization',
      'cultivation-stages:fruiting',
      'troubleshooting-patterns:fuzzy-feet',
      'troubleshooting-patterns:overlay',
      'troubleshooting-patterns:drying-caps',
    ].join(','),
  },
};

export default function EnvironmentalParametersPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Breadcrumbs
        items={[
          { label: 'Foundations', href: '/foundations/overview' },
          { label: 'Environment', href: '/foundations/environmental-parameters' },
          { label: 'Environmental Parameters', href: '/foundations/environmental-parameters' },
        ]}
      />

      <SectionHeader
        title="Environmental Parameters"
        subtitle="Treat humidity, air, temperature, light, and surface moisture as one system"
      />

      <div className="space-y-10 text-gray-800 dark:text-gray-200">
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Why Environment Drives Outcomes</h2>
          <p className="leading-relaxed">
            Mushrooms are mostly water and entirely responsive to their surroundings. Each parameter adjusts fungal decisions: colonize faster, defend and pause, or fruit. Tuning these levers together prevents you from chasing single numbers and instead builds a stable microclimate that the organism recognizes as safe to fruit.
          </p>
          <p className="leading-relaxed">
            Pair this with <Link href="/foundations/ecology" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">fungal ecology</Link> to understand why signals like evaporation or CO2 matter, and use <Link href="/tools/cultivation-system-map" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">the cultivation system map</Link> to see how adjustments ripple across stages.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Core Parameters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Humidity</h3>
              <p className="mt-2 leading-relaxed">
                High relative humidity prevents cap cracking and supports dense pinsets. Aim for 85-95% in fruiting while letting surfaces gently evaporate.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Fresh Air Exchange (FAE)</h3>
              <p className="mt-2 leading-relaxed">
                Airflow removes CO2 and brings oxygen. Too little yields long stems and <Link href="/troubleshooting/fuzzy-feet" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">fuzzy feet</Link>; too much dries caps. Target gentle, frequent exchanges that keep surfaces glistening.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Temperature</h3>
              <p className="mt-2 leading-relaxed">
                Most gourmet species thrive between 68-75 F. Higher temperatures accelerate contaminants; cooler slows metabolism but is safer. Tune to species using the <Link href="/tools/species-comparison-matrix" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">species matrix</Link>.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Light</h3>
              <p className="mt-2 leading-relaxed">
                Light is a compass, not food. Provide cool-white, indirect light 12/12 to orient pins. For species like <Link href="/growing-guides/oyster" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">oysters</Link>, adequate light sharpens cap shape.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Surface Moisture and Evaporation</h2>
          <p className="leading-relaxed">
            Pins initiate when surface moisture gently evaporates. If surfaces dry, primordia abort and caps crack. If no evaporation occurs, pinning stalls. Mist to restore a light sheen, then ventilate to encourage slow evaporation without pooling.
          </p>
          <ul className="list-disc ml-6 space-y-2">
            <li>Ideal cue: fine droplets that disappear within 30-60 minutes.</li>
            <li>Warning: dull, matte surface means increase humidity or reduce airflow.</li>
            <li>Warning: standing water invites <Link href="/troubleshooting/bacterial-contamination" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">bacteria</Link> and causes aborts.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">How Parameters Interact</h2>
          <p className="leading-relaxed">
            Treat parameters as a system. Increasing airflow lowers humidity and raises evaporation; raising humidity slows evaporation; lowering temperature reduces CO2 production and water loss. Adjust in pairs so the organism receives a coherent signal.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">When to Increase FAE</h3>
              <p className="mt-2 leading-relaxed">Long stems, fuzzy feet, or high CO2 readings. Pair with slight humidity increase to protect caps.</p>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">When to Reduce FAE</h3>
              <p className="mt-2 leading-relaxed">Cracked or drying caps. Pair with misting and stable temperatures to restore surface sheen.</p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Reading the Signals</h2>
          <ul className="list-disc ml-6 space-y-2">
            <li>Even pinset and sturdy stems: environment balanced.</li>
            <li>Overlay or stalled primordia: excess CO2 or insufficient evaporation.</li>
            <li>Dry, cracked caps: humidity too low or airflow too strong.</li>
            <li>Fuzzy feet: insufficient fresh air exchange.</li>
            <li>Yellowing mycelium: heat or bacterial pressure compounded by moisture imbalance.</li>
          </ul>
          <p className="leading-relaxed">
            Map these symptoms to adjustments using the <Link href="/tools/troubleshooting-decision-tree" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">troubleshooting decision tree</Link>.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Next Steps</h2>
          <RelatedIssues
            related={[
              { title: 'Substrates and Nutrition', href: '/foundations/substrates' },
              { title: 'Systems Thinking', href: '/foundations/systems-thinking' },
              { title: 'Troubleshooting: Fuzzy Feet', href: '/troubleshooting/fuzzy-feet' },
              { title: 'Troubleshooting: Overlay', href: '/troubleshooting/overlay' },
              { title: 'Troubleshooting Decision Tree', href: '/tools/troubleshooting-decision-tree' },
            ]}
          />
        </section>
      </div>
    </div>
  );
}