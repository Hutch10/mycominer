import type { Metadata } from 'next';
import SectionHeader from '../../components/SectionHeader';
import Breadcrumbs from '../../components/Breadcrumbs';
import RelatedIssues from '../../components/RelatedIssues';

export const metadata: Metadata = {
  title: 'Mushroom Aborts - Troubleshooting Premature Pin Death',
  description: 'Diagnose and fix mushroom aborts: environmental stress, humidity issues, genetics, and preventing premature pin death.',
  keywords: ['mushroom aborts', 'pin abortion', 'premature death', 'environmental stress', 'humidity problems', 'troubleshooting'],
  other: {
    tags: ['troubleshooting', 'aborts', 'pinning', 'environment', 'humidity', 'stress', 'diagnosis'].join(','),
  },
};

export default function AbortsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Breadcrumbs />
      <SectionHeader
        title="Aborts"
        subtitle="Understanding and preventing premature mushroom termination in cultivation"
      />

      <div className="space-y-8 text-gray-800 dark:text-gray-200">
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Symptom Description</h2>
          <p className="mb-4">
            Aborts are mushrooms that begin forming primordia (pins) but stop developing before reaching harvestable size. They appear as small, stunted mushrooms that may be tan, brown, or black, often with elongated stems and underdeveloped caps. Aborts are extremely common and usually indicate that environmental conditions became unfavorable during the critical early fruiting stage.
          </p>
          <p>
            While aborts themselves are harmless and edible (often considered more potent due to higher concentration of active compounds), they signal that your cultivation system needs adjustment to support full fruit development.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Ecological Cause</h2>
          <p className="mb-4">
            <strong>Environmental stress during critical development:</strong> Mushrooms are highly sensitive organisms that evolved in stable forest environments. When conditions fluctuate during the vulnerable primordia stage, the mycelium conserves energy by aborting fruit development rather than risking the production of low-quality spores.
          </p>
          <p className="mb-4">
            <strong>Resource allocation strategy:</strong> In nature, fungi only invest in reproduction when conditions guarantee successful spore dispersal. Aborts represent the mycelium's adaptive response to perceived environmental instability, redirecting nutrients back to the mycelial network for survival.
          </p>
          <p className="mb-4">
            <strong>Microclimate gradients:</strong> Uneven humidity, temperature, or gas exchange across the substrate surface creates zones where some primordia thrive while others fail. This mirrors how mushrooms in forests fruit in protected microhabitats.
          </p>
          <p>
            <strong>Competitive pressure:</strong> When contaminants or stress metabolites accumulate, the mycelium may abort fruits to focus defensive resources on maintaining the network.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">How to Confirm the Cause</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Environmental monitoring:</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Check humidity levels - drops below 85% during pinning often cause aborts</li>
                <li>Monitor temperature fluctuations - variations of more than 5°F can trigger abortion</li>
                <li>Assess air movement - direct drafts or stagnant air can create problematic microclimates</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Substrate assessment:</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Test surface moisture - dry spots indicate evaporation stress</li>
                <li>Check for contamination - bacterial blotches or mold can stress nearby primordia</li>
                <li>Observe pinning pattern - clustered aborts suggest localized environmental issues</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Growth timeline review:</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Note when aborts appeared relative to pinning initiation</li>
                <li>Compare with successful grows to identify timing patterns</li>
                <li>Document any recent environmental changes or disturbances</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">How to Fix It</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Immediate humidity correction:</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Mist the substrate surface lightly with sterile water</li>
                <li>Increase chamber humidity to 90-95% using a humidifier</li>
                <li>Cover the substrate with plastic sheeting to trap moisture temporarily</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Air exchange optimization:</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Adjust fan speed to provide gentle, diffuse airflow</li>
                <li>Add more holes to fruiting chamber if CO2 is accumulating</li>
                <li>Use polyfill in holes to create laminar air movement</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Temperature stabilization:</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Move chamber away from drafts or heat sources</li>
                <li>Use insulation to buffer temperature swings</li>
                <li>Monitor with digital thermometers for 24-48 hours</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Contamination response:</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Remove any contaminated areas with sterile tools</li>
                <li>Increase air exchange to discourage bacterial growth</li>
                <li>Consider harvesting mature fruits and restarting with fresh conditions</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">How to Prevent It Next Time</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Fruiting chamber design:</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Use chambers with built-in humidity control and even air distribution</li>
                <li>Choose materials that maintain stable microclimates</li>
                <li>Position chambers away from environmental disturbances</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Process consistency:</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Wait for full colonization before initiating fruiting conditions</li>
                <li>Introduce fruiting triggers gradually rather than abruptly</li>
                <li>Monitor environmental parameters daily during critical periods</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Species selection:</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Choose species with fruiting parameters that match your setup capabilities</li>
                <li>Start with hardy species like oyster mushrooms for beginners</li>
                <li>Research species-specific sensitivity to environmental fluctuations</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Monitoring systems:</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Install hygrometers, thermometers, and timers for automated monitoring</li>
                <li>Use data logging to identify patterns in environmental stability</li>
                <li>Calibrate all monitoring equipment regularly</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Systems-Thinking Perspective</h2>
          <p className="mb-4">
            Aborts reveal how mushroom cultivation is a dynamic system where every parameter interacts. The mycelium acts as a sensor, aborting fruits when it detects instability. Prevention focuses on creating resilient systems that maintain equilibrium rather than reacting to individual parameter failures.
          </p>
          <p>
            Understanding aborts as ecological signals helps shift from frustration to learning, using each occurrence to refine your cultivation approach.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Next Steps</h2>

          <RelatedIssues
            related={[
              { title: "Stalled Fruiting", href: "/troubleshooting/stalled-fruiting" },
              { title: "Drying Caps", href: "/troubleshooting/drying-caps" },
              { title: "Environmental Parameters", href: "/foundations/environmental-parameters" },
            ]}
          />
        </section>
      </div>
    </div>
  );
}