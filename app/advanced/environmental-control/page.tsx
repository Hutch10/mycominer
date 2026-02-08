import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '../../components/Breadcrumbs';
import SectionHeader from '../../components/SectionHeader';
import RelatedIssues from '../../components/RelatedIssues';

export const metadata: Metadata = {
  title: 'Advanced Environmental Control',
  description: 'Engineer humidity cycles, temperature gradients, CO₂ dynamics, and airflow for resilient, high-performance grows.',
  keywords: [
    'advanced',
    'environmental control',
    'humidity',
    'co2',
    'airflow',
    'optimization',
  ],
  other: {
    tags: [
      'environment',
      'humidity',
      'co2',
      'airflow',
      'temperature',
      'optimization',
      'expert',
      'environmental-control',
    ].join(','),
  },
};

export default function AdvancedEnvironmentalControl() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-gray-800 dark:text-gray-200">
      <Breadcrumbs
        items={[
          { label: 'Advanced', href: '/advanced' },
          { label: 'Environmental Control', href: '/advanced/environmental-control' },
        ]}
      />

      <SectionHeader
        title="Advanced Environmental Control"
        subtitle="Dial humidity, CO₂, temperature, and airflow as one system"
      />

      <div className="space-y-8">
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Humidity Cycles</h2>
          <p className="leading-relaxed">
            Rotate between surface evaporation and rehydration. Short, frequent misting or ultrasonic pulses paired with gentle airflow creates micro-droplet turnover that cues pinning without pooling.
          </p>
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4 font-mono text-sm leading-snug">
            {`Cycle Example (90 mins):
 0-10m : Mist/ultrasonic ON (raise RH to 92-95%)
10-60m: Fans low (evap to ~88-90%)
60-70m: Fans off, RH rebounds
70-90m: Passive hold, verify droplets reform, repeat`}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Temperature Gradients</h2>
          <p className="leading-relaxed">
            Avoid hotspots near heaters or lights. Map gradients with a multi-probe logger; keep fruiting surfaces within a 2-3°F band. Warmer tops can accelerate drying—offset with higher RH or adjusted airflow direction.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">CO₂ Dynamics</h2>
          <p className="leading-relaxed">
            CO₂ pools low; exhaust low and feed fresh air high for passive stratification. Species like lion's mane tolerate higher CO₂; oysters require more exchanges to avoid fuzzy feet and elongated stems.
          </p>
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4 font-mono text-sm leading-snug">
            {`Air Path Sketch (side view):
 [Fresh Air In]  -->  (Top)  
   |                   
   v  gentle mix       
 [Canopy/Blocks]       
   v                   
 [Exhaust Low]         `}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Airflow Engineering</h2>
          <p className="leading-relaxed">
            Aim for laminar-ish, non-drying flow across the canopy. Baffle direct fan streams with diffusers, and size vent area to balance CO₂ removal with RH retention. Use incense/smoke or ribbon tests to find dead zones.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Tools and Planning</h2>
          <p className="leading-relaxed">
            Model chamber volume, vent area, and humidification duty cycles with the Environmental Planner, then verify with data logging. Keep a weekly chart of RH, temperature, and CO₂ alongside morphology notes.
          </p>
          <p className="leading-relaxed">
            Use the <Link href="/tools/troubleshooting-decision-tree" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">Troubleshooting Decision Tree</Link> and <Link href="/tools/cultivation-system-map" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">Cultivation System Map</Link> to connect symptoms to environmental levers.
          </p>
        </section>

        <section>
          <RelatedIssues
            related={[
              { title: 'Fuzzy Feet', href: '/troubleshooting/fuzzy-feet' },
              { title: 'Overlay', href: '/troubleshooting/overlay' },
              { title: 'Drying Caps', href: '/troubleshooting/drying-caps' },
              { title: 'Environmental Parameters', href: '/foundations/environmental-parameters' },
              { title: 'Fruiting Chamber Design & Optimization', href: '/advanced/fruiting-chamber-design' },
            ]}
          />
        </section>
      </div>
    </div>
  );
}
