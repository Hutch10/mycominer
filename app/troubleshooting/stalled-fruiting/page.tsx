import type { Metadata } from "next";
import Breadcrumbs from "../../components/Breadcrumbs";
import RelatedIssues from "../../components/RelatedIssues";
import SectionHeader from "../../components/SectionHeader";

export const metadata: Metadata = {
  title: "Stalled Fruiting - Troubleshooting",
  description:
    "Diagnose and restart fruiting that has paused mid-growth by stabilizing humidity, airflow, temperature, and nutrition.",
  keywords: ["troubleshooting", "fruiting", "stall", "humidity", "co2", "temperature", "nutrition"],
  other: {
    tags: ["troubleshooting", "fruiting", "stall", "humidity", "co2", "temperature", "nutrition"].join(","),
  },
};

export default function StalledFruiting() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-gray-800 dark:text-gray-200">
      <Breadcrumbs
        items={[
          { label: "Troubleshooting", href: "/troubleshooting" },
          { label: "Stalled Fruiting", href: "/troubleshooting/stalled-fruiting" },
        ]}
      />

      <SectionHeader
        title="Stalled Fruiting"
        subtitle="Restart paused growth by fixing the underlying environmental gap"
      />

      <div className="space-y-8">
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Symptom Description</h2>
          <p>
            Pins or young fruits stop growing for days without aborting or rotting. They stay the same size, signaling an unmet environmental or nutritional need.
          </p>
          <p>Stalls can affect all blocks or only pockets of the chamber depending on how localized the issue is.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Ecological Causes</h2>
          <ul className="list-disc ml-6 space-y-2">
            <li>
              <strong>Humidity collapse:</strong> Below ~85% RH, fruit bodies lose water faster than they can replace it.
            </li>
            <li>
              <strong>CO2 accumulation:</strong> Elevated CO2 signals stress and slows growth until air quality improves.
            </li>
            <li>
              <strong>Temperature instability:</strong> Swings disrupt metabolism; growth pauses until conditions stabilize.
            </li>
            <li>
              <strong>Surface drying:</strong> Dry casing or block surfaces halt nutrient and water movement to fruits.
            </li>
            <li>
              <strong>Nutrient depletion:</strong> Long cycles or low supplementation leave fruits without accessible resources.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">How to Confirm</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Humidity</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Check RH at canopy level morning and evening (target 85-95%).</li>
                <li>Feel surface moisture; it should be dewy, not crusted.</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">CO2</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Measure CO2 if possible (keep less than 800 ppm for most species during fruiting).</li>
                <li>Watch for fuzzy feet or elongation that signal low fresh air exchange.</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Temperature</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Log 24 hours; avoid dips below species minimums.</li>
                <li>Check for hotspots near lights or heaters.</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Surface condition</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Inspect for cracks or hardened surfaces.</li>
                <li>Ensure misting reaches all fruiting faces.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">How to Fix</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Restore humidity</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Mist 3-6 times daily until surfaces glisten without pooling.</li>
                <li>Target 85-95% RH around the canopy.</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Increase fresh air</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Vent or fan gently to reach 3-5 air changes per hour.</li>
                <li>Open or enlarge vents; redirect fans to avoid direct drying.</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Stabilize temperature</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Buffer swings with insulation; add gentle heat or cooling as needed.</li>
                <li>Match species targets; avoid night drops below range.</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Rehydrate surfaces</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Lightly mist casing or block faces to restore sheen.</li>
                <li>Pause heavy airflow until sheen holds between mists.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Prevent next time</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Environmental stability</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Automate humidification and ventilation where possible.</li>
                <li>Use data logging for humidity and temperature to spot drifts early.</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Misting protocol</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Set a consistent schedule; fine-mist nozzles reduce pooling.</li>
                <li>Never allow surfaces to crust during fruiting.</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Airflow design</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Size vents and fans to chamber volume; verify CO2 stays in range.</li>
                <li>Distribute airflow evenly to avoid dry spots.</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Substrate preparation</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Supplement adequately for longer fruiting runs.</li>
                <li>Maintain 65-70% moisture and plan for multiple flushes.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Systems perspective</h2>
          <p>
            Stalls reveal imbalance: the system waits for humidity, airflow, temperature, or nutrients to return to a viable range. Designing stable, monitored environments prevents the pause.
          </p>
        </section>

        <section>
          <RelatedIssues
            related={[
              { title: "Aborts", href: "/troubleshooting/aborts" },
              { title: "Fuzzy Feet", href: "/troubleshooting/fuzzy-feet" },
              { title: "Environmental Parameters", href: "/foundations/environmental-parameters" },
            ]}
          />
        </section>
      </div>
    </div>
  );
}
