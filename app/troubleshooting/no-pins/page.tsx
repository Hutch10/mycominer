import type { Metadata } from 'next';
import SectionHeader from '../../components/SectionHeader';
import Breadcrumbs from '../../components/Breadcrumbs';
import RelatedIssues from '../../components/RelatedIssues';

export const metadata: Metadata = {
  title: 'No Pinning - Environmental Triggers Missing',
  description: 'Troubleshoot lack of mushroom pins: environmental triggers, light, temperature drop, FAE, and colonization completion.',
  keywords: ['no pins', 'no pinning', 'pin initiation', 'fruiting triggers', 'environmental control', 'troubleshooting'],
  other: {
    tags: ['troubleshooting', 'no-pins', 'pinning', 'triggers', 'environment', 'light', 'diagnosis'].join(','),
  },
};

export default function NoPins() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Breadcrumbs />
      <SectionHeader
        title="No Pins Forming"
        subtitle="Diagnosing and resolving failed primordia initiation in mushroom cultivation"
      />

      <div className="space-y-8 text-gray-800 dark:text-gray-200">
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">What the Symptom Means</h2>
          <p className="mb-4">
            The absence of pins (primordia) indicates that your mycelium hasn't received the environmental cues needed to transition from vegetative growth to reproductive development. In nature, mushrooms only form fruiting bodies when conditions signal resource availability and favorable spore dispersal opportunities. Without these triggers, the mycelium remains in colonization mode, conserving energy for continued expansion rather than reproduction.
          </p>
          <p>
            This represents a communication breakdown between your cultivation system and the fungus's evolved responses. The mycelium is healthy but "waiting" for the right conditions to invest in reproduction.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Ecological Cause</h2>
          <p className="mb-4">
            <strong>Carbon dioxide accumulation:</strong> High CO2 levels suppress fruiting because they indicate the mycelium is still buried in substrate, not exposed to open air. In nature, mushrooms fruit when mycelium reaches the surface where CO2 can dissipate and oxygen is plentiful.
          </p>
          <p className="mb-4">
            <strong>Inadequate fresh air exchange:</strong> Poor ventilation prevents the gas exchange needed for metabolic shifts. Mushrooms evolved in well-aerated forest environments where air movement carries spores and prevents CO2 buildup.
          </p>
          <p className="mb-4">
            <strong>Light deprivation:</strong> Most species require light to trigger fruiting, mimicking how forest mushrooms grow toward light gaps in the canopy. Complete darkness maintains the vegetative state.
          </p>
          <p className="mb-4">
            <strong>Moisture or temperature inconsistency:</strong> Environmental stability is crucial. Fluctuations signal environmental stress, causing mycelium to delay reproduction until conditions stabilize.
          </p>
          <p>
            <strong>Insufficient consolidation time:</strong> Mycelium needs time to fully integrate with the substrate before fruiting. Premature exposure to fruiting conditions leads to failure.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">How to Confirm the Cause</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">CO2 and air quality assessment:</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Use a CO2 meter to measure levels (should be below 1000 ppm for fruiting)</li>
                <li>Check for condensation on chamber walls (indicates poor air exchange)</li>
                <li>Observe air movement patterns in your fruiting setup</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Light exposure verification:</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Measure light intensity with a lux meter (most species need 200-1000 lux)</li>
                <li>Ensure even light distribution across all surfaces</li>
                <li>Confirm light cycle timing (typically 12 hours on/off)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Substrate readiness check:</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Verify full colonization (mycelium should be dense and uniform)</li>
                <li>Test substrate moisture (should still feel hydrated but not soggy)</li>
                <li>Check for consolidation (substrate should hold together when squeezed)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Environmental stability:</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Monitor temperature fluctuations over 24-48 hours</li>
                <li>Check humidity consistency (should be stable at fruiting levels)</li>
                <li>Verify all parameters match species requirements</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">How to Fix It</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Air exchange optimization:</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Increase fresh air exchange to 3-5 complete air changes per hour</li>
                <li>Add more holes to fruiting chambers or improve fan placement</li>
                <li>Use polyfill in holes to create gentle air movement without drying</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Light initiation:</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Provide indirect light from above (fluorescent or LED, 12 hours/day)</li>
                <li>Avoid direct sunlight which can cause uneven pinning</li>
                <li>Ensure light reaches all substrate surfaces evenly</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Environmental triggering:</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Drop temperature 5-10°F below colonization temperature</li>
                <li>Increase humidity to 85-95% (but not if CO2 is the main issue)</li>
                <li>Ensure substrate surface is properly hydrated</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Consolidation extension:</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Wait additional 3-7 days if substrate isn't fully consolidated</li>
                <li>Check for signs of full colonization before initiating fruiting</li>
                <li>Consider cold shocking (refrigeration for 12-24 hours) for some species</li>
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
                <li>Use chambers with adequate ventilation built-in</li>
                <li>Install fans with timers for consistent air exchange</li>
                <li>Choose clear materials that allow light penetration</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Process timing protocols:</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Allow sufficient consolidation time (extra days are better than rushed fruiting)</li>
                <li>Monitor colonization progress daily</li>
                <li>Have fruiting conditions ready before exposing substrate</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Environmental monitoring:</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Invest in hygrometers, thermometers, and light meters</li>
                <li>Use data logging devices to track environmental stability</li>
                <li>Calibrate all monitoring equipment regularly</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Species selection:</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Choose species with fruiting requirements that match your setup</li>
                <li>Start with easy species like oyster mushrooms for beginners</li>
                <li>Research species-specific light and air requirements before starting</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Systems-Thinking Perspective</h2>
          <p className="mb-4">
            Pinning failure reveals how mushroom cultivation mimics natural ecological processes. In forests, mushrooms only fruit when mycelium reaches the surface and encounters the right combination of light, air, and moisture. Your fruiting chamber should replicate this transition from buried colonization to exposed fruiting.
          </p>
          <p>
            Prevention focuses on creating clear environmental gradients that signal the mycelium to shift life stages, rather than maintaining constant conditions that keep it vegetative.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Next Steps</h2>

          <RelatedIssues
            related={[
              { title: "Slow Colonization", href: "/troubleshooting/slow-colonization" },
              { title: "Side Pinning", href: "/troubleshooting/side-pinning" },
              { title: "Growing Guides", href: "/growing-guides" },
            ]}
          />
        </section>
      </div>
    </div>
  );
}