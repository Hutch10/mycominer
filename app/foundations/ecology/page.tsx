import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '../../components/Breadcrumbs';
import SectionHeader from '../../components/SectionHeader';
import RelatedIssues from '../../components/RelatedIssues';

export const metadata: Metadata = {
  title: 'Fungal Ecology and Behavior',
  description: 'Understand how mycelium senses, competes, and cooperates so you can shape cultivation environments that align with fungal behavior.',
  keywords: [
    'fungal ecology',
    'mycelium behavior',
    'environmental sensing',
    'competition',
    'cooperation',
    'cultivation environment',
    'saprotrophic fungi',
    'microclimates',
  ],
  other: {
    tags: [
      'foundations',
      'ecology',
      'environmental-sensing',
      'competition',
      'cooperation',
      'saprotroph',
      'microclimate',
      'cultivation-stages:design',
      'troubleshooting-patterns:overlay',
      'troubleshooting-patterns:fuzzy-feet',
    ].join(','),
  },
};

export default function EcologyPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Breadcrumbs
        items={[
          { label: 'Foundations', href: '/foundations/overview' },
          { label: 'Ecology', href: '/foundations/ecology' },
          { label: 'Fungal Ecology and Behavior', href: '/foundations/ecology' },
        ]}
      />

      <SectionHeader
        title="Fungal Ecology and Behavior"
        subtitle="How fungi sense, decide, and compete"
      />

      <div className="space-y-10 text-gray-800 dark:text-gray-200">
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Ecological Role</h2>
          <p className="leading-relaxed">
            Fungi act as nutrient recyclers and network builders. They digest lignin, cellulose, and complex plant matter that few organisms can unlock, turning dead wood into bioavailable carbon. In cultivation you are guiding this same decomposer engine inside a container, balancing resources and stress so the organism chooses fruiting rather than continued exploration.
          </p>
          <p className="leading-relaxed">
            Saprotrophic species such as oysters and lion's mane evolved to dominate fresh woody debris. Others, like <Link href="/medicinal-mushrooms/reishi" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">reishi</Link>, tolerate tougher substrates and slower competition. Matching species to substrate and environment is ecological alignment, not just a recipe tweak.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Mycelium as a Responsive Network</h2>
          <p className="leading-relaxed">
            Mycelium senses gradients of moisture, oxygen, CO2, temperature, and light. It thickens where resources are rich, walls off threats, and reallocates energy to promising zones. This is why surface moisture and fresh air exchange from <Link href="/foundations/environmental-parameters" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">environmental parameters</Link> can change pinning within hours.
          </p>
          <ul className="list-disc ml-6 space-y-2">
            <li>Grows toward humidity and oxygen, away from desiccation and CO2 buildup.</li>
            <li>Forms rhizomorphic strands to explore and dense mats to defend territory.</li>
            <li>Creates metabolites to inhibit competitors when stressed.</li>
            <li>Rebalances growth when fresh nutrients appear (as with supplementation).</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Competition and Cooperation</h2>
          <p className="leading-relaxed">
            In the wild, fungi battle bacteria, molds, and insects while collaborating with plants and microbes. In tubs, the same dynamics explain why <Link href="/troubleshooting/green-mold" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">green mold</Link> appears after stalled colonization or why metabolites pool when bacteria press in.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Competitive Moves</h3>
              <ul className="list-disc ml-6 space-y-2">
                <li>Rapid colonization to capture territory before contaminants.</li>
                <li>Antimicrobial metabolites that suppress bacteria and molds.</li>
                <li>Overlay formation when CO2 stays high, trading fruiting for defense.</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Cooperative Moves</h3>
              <ul className="list-disc ml-6 space-y-2">
                <li>Mycorrhizal exchange of minerals for sugars (forest ecosystems).</li>
                <li>Endophytic protection of host plants against pathogens.</li>
                <li>Substrate restructuring that creates microhabitats for microbes.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Environmental Signals to Watch</h2>
          <p className="leading-relaxed">
            Cultivation outcomes mirror ecological signals. Track the cues mycelium cares about and you can predict its choices: continue colonizing, pause to defend, or switch to fruiting.
          </p>
          <ul className="list-disc ml-6 space-y-2">
            <li>Humidity and evaporation balance drives pinning density.</li>
            <li>CO2 accumulation leads to elongation and fuzzy feet.</li>
            <li>Light acts as orientation; intensity affects form, not nutrition.</li>
            <li>Temperature shifts change enzyme speed and contamination pressure.</li>
          </ul>
          <p className="leading-relaxed">
            Use <Link href="/tools/troubleshooting-decision-tree" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">decision tools</Link> to tie these signals back to actionable adjustments.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Applying Ecology to Cultivation</h2>
          <p className="leading-relaxed">
            Every tub is a simplified ecosystem. Substrate choice sets nutrient profile, gas exchange sets competition pressure, and humidity sets whether the organism invests in growth or reproduction. Align these levers with the species: oysters want oxygen and fast runs, lion's mane tolerates higher CO2, reishi prefers slow, steady wood digestion.
          </p>
          <p className="leading-relaxed">
            When conditions drift, symptoms echo ecology: <Link href="/troubleshooting/overlay" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">overlay</Link> signals defensive posture, <Link href="/troubleshooting/fuzzy-feet" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">fuzzy feet</Link> signals gas exchange imbalance, and stalled colonization often means competitor pressure or low temperature.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Next Steps</h2>
          <RelatedIssues
            related={[
              { title: 'Environmental Parameters', href: '/foundations/environmental-parameters' },
              { title: 'Substrates and Nutrition', href: '/foundations/substrates' },
              { title: 'Contamination Ecology', href: '/foundations/contamination-ecology' },
              { title: 'Growing Oyster Mushrooms', href: '/growing-guides/oyster' },
              { title: 'Troubleshooting: Green Mold', href: '/troubleshooting/green-mold' },
            ]}
          />
        </section>
      </div>
    </div>
  );
}