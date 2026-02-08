import type { Metadata } from 'next';
import SectionHeader from '../../components/SectionHeader';
import Breadcrumbs from '../../components/Breadcrumbs';
import RelatedIssues from '../../components/RelatedIssues';

export const metadata: Metadata = {
  title: 'Side Pinning - Microclimate & Container Issues',
  description: 'Fix side pinning caused by favorable microclimates between substrate and container: humidity gradients, gas exchange, and prevention.',
  keywords: ['side pinning', 'side pins', 'microclimate', 'humidity gradient', 'liner', 'container', 'troubleshooting'],
  other: {
    tags: ['troubleshooting', 'side-pinning', 'microclimate', 'humidity', 'container', 'pinning', 'diagnosis'].join(','),
  },
};

export default function SidePinning() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Breadcrumbs />
      <SectionHeader
        title="Side Pinning"
        subtitle="Understanding and correcting uneven primordia formation in mushroom cultivation"
      />

      <div className="space-y-8 text-gray-800 dark:text-gray-200">
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">What the Symptom Means</h2>
          <p className="mb-4">
            Side pinning occurs when primordia (baby mushrooms) form on the vertical surfaces of your substrate rather than the top horizontal surface. This indicates that the microclimate on the sides provides better conditions for fruiting than the top surface. Mycelium always chooses the most favorable environment for reproduction, so side pinning reveals environmental gradients within your fruiting chamber.
          </p>
          <p>
            While not harmful to the mushrooms themselves, side pinning suggests your system isn't optimized for even fruiting. It often results in awkward harvesting positions and can indicate underlying issues with surface conditions or chamber design.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Ecological Cause</h2>
          <p className="mb-4">
            <strong>Uneven light distribution:</strong> Light reaches the sides more directly than the top surface, especially in clear chambers. In nature, mushrooms orient toward light sources, so vertical surfaces getting more illumination trigger pinning there first.
          </p>
          <p className="mb-4">
            <strong>Microclimate differences:</strong> Sides may have better humidity retention or air circulation. Bag folds or chamber corners can create humid pockets that favor primordia formation over dry top surfaces.
          </p>
          <p className="mb-4">
            <strong>CO2 stratification:</strong> Carbon dioxide pools at the bottom of chambers, creating higher concentrations near the substrate base. Sides may have better gas exchange than the top surface.
          </p>
          <p className="mb-4">
            <strong>Surface preparation issues:</strong> The top surface may be too dry, contaminated, or uneven. Mycelium avoids suboptimal areas, seeking out more favorable microenvironments on the sides.
          </p>
          <p>
            <strong>Chamber design flaws:</strong> Poor air flow patterns or lighting setup create environmental gradients that favor side growth over top growth.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">How to Confirm the Cause</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Light mapping:</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Use a lux meter to measure light intensity on top vs. sides</li>
                <li>Check for light leaks or reflections causing uneven illumination</li>
                <li>Observe if light is coming from the sides rather than above</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Humidity assessment:</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Check for condensation patterns on chamber walls</li>
                <li>Measure humidity at different heights in the chamber</li>
                <li>Look for dry spots or pooling on the substrate surface</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Air flow analysis:</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Observe air movement patterns (use smoke or tissue to visualize)</li>
                <li>Check fan placement and direction</li>
                <li>Verify fresh air exchange rates at different chamber levels</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Surface condition check:</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Inspect top surface for dryness, contamination, or unevenness</li>
                <li>Test moisture content of top vs. side surfaces</li>
                <li>Check for proper casing layer if applicable</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">How to Fix It</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Light redistribution:</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Move lights to shine directly down on the top surface</li>
                <li>Use reflective materials to direct light away from sides</li>
                <li>Block side light with opaque materials if necessary</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Humidity balancing:</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Mist the top surface more frequently to match side conditions</li>
                <li>Use a humidifier positioned to focus on the top</li>
                <li>Adjust overall chamber humidity to prevent dry tops</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Air flow optimization:</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Reposition fans to create better top-to-bottom air movement</li>
                <li>Add more holes at the top of the chamber</li>
                <li>Use air deflectors to prevent CO2 pooling</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Surface improvement:</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Apply a thin casing layer to create uniform top conditions</li>
                <li>Gently mist and level the top surface</li>
                <li>Remove any dry or contaminated areas</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">How to Prevent It Next Time</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Chamber design improvements:</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Use chambers with top-focused lighting systems</li>
                <li>Design air exchange to prioritize top surface ventilation</li>
                <li>Choose chamber shapes that minimize side light exposure</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Setup protocols:</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Position lights directly above substrate surfaces</li>
                <li>Use light-blocking materials on chamber sides if needed</li>
                <li>Establish consistent misting routines for top surfaces</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Monitoring systems:</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Install sensors at multiple chamber levels</li>
                <li>Use light meters to verify even illumination</li>
                <li>Document successful setups for replication</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Species considerations:</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Some species are more prone to side pinning than others</li>
                <li>Research species-specific fruiting preferences</li>
                <li>Adjust chamber design based on mushroom variety</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Systems-Thinking Perspective</h2>
          <p className="mb-4">
            Side pinning demonstrates how mushrooms respond to microclimates within cultivation systems. In nature, fungi fruit where conditions are optimal for spore dispersal. Your chamber creates artificial gradients that the mycelium exploits. Prevention requires designing systems that make the top surface the most favorable environment, not just fixing symptoms after they appear.
          </p>
          <p>
            This issue often reveals larger problems with chamber design or environmental control. Use it as an opportunity to optimize your entire fruiting system.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Is Side Pinning Harmful?</h2>
          <p className="mb-4">
            Side pinning is primarily cosmetic - the mushrooms are still healthy and edible. However, it can make harvesting more difficult and may indicate suboptimal growing conditions. Many growers simply harvest from the sides and continue normally, but addressing the underlying causes improves overall yield and quality.
          </p>
          <p>
            In some cases, side pinning can be encouraged for specific growing methods, but it's generally not the desired outcome for most cultivation setups.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Next Steps</h2>

          <RelatedIssues
            related={[
              { title: "No Pins", href: "/troubleshooting/no-pins" },
              { title: "Slow Colonization", href: "/troubleshooting/slow-colonization" },
              { title: "Growing Guides", href: "/growing-guides" },
            ]}
          />
        </section>
      </div>
    </div>
  );
}