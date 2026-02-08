import type { Metadata } from 'next';
import SectionHeader from '../../components/SectionHeader';
import Breadcrumbs from '../../components/Breadcrumbs';
import RelatedIssues from '../../components/RelatedIssues';

export const metadata: Metadata = {
  title: 'Slow Colonization - Troubleshooting Delayed Mycelial Growth',
  description: 'Diagnose and fix slow colonization in mushroom cultivation caused by temperature issues, substrate problems, or contamination.',
  keywords: ['slow colonization', 'mycelium growth', 'cultivation problems', 'temperature issues', 'substrate quality', 'troubleshooting'],
  other: {
    tags: ['troubleshooting', 'colonization', 'temperature', 'substrate', 'diagnosis'].join(','),
  },
};

export default function SlowColonization() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Breadcrumbs />
      <SectionHeader
        title="Slow Colonization"
        subtitle="Understanding and resolving delayed mycelial growth in mushroom cultivation"
      />

      <div className="space-y-8 text-gray-800 dark:text-gray-200">
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">What the Symptom Means</h2>
          <p className="mb-4">
            Slow colonization indicates that your mycelium is struggling to establish dominance over the substrate. In nature, fungi colonize dead matter rapidly to compete with other decomposers. When growth is sluggish, it suggests the cultivation environment doesn't adequately support the fungus's ecological requirements, potentially allowing competitors like bacteria or molds to gain a foothold.
          </p>
          <p>
            This isn't just a timing issue - it's a signal that your system is out of balance. Mycelium needs optimal conditions to produce the enzymes required for decomposition. Slow growth often precedes contamination or complete failure.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Ecological Cause</h2>
          <p className="mb-4">
            <strong>Temperature mismatch:</strong> Most mushroom species evolved in temperate forests with consistent temperatures. Too cold slows enzyme activity; too hot denatures proteins. The mycelium's metabolic processes are temperature-dependent, mirroring how decomposition rates vary seasonally in nature.
          </p>
          <p className="mb-4">
            <strong>Substrate quality issues:</strong> Poor nutrition or improper preparation creates an environment where mycelium can't access nutrients efficiently. In forests, fungi break down complex plant matter through enzymatic digestion - if the substrate is too dense or lacks proper supplementation, this process stalls.
          </p>
          <p className="mb-4">
            <strong>Competition from microbes:</strong> Bacteria and molds naturally compete for the same resources. If sterilization was inadequate or conditions favor competitors, mycelium growth slows as it expends energy defending territory rather than expanding.
          </p>
          <p>
            <strong>Moisture imbalance:</strong> Too dry limits nutrient transport; too wet creates anaerobic pockets. Mycelium requires aerobic conditions to respire efficiently, just as forest fungi need oxygen-rich environments.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">How to Confirm the Cause</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Temperature verification:</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Use a digital thermometer to check actual temperatures (not just incubator settings)</li>
                <li>Monitor for 24-48 hours to identify fluctuations</li>
                <li>Compare against species-specific requirements (most gourmet mushrooms need 75-80°F)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Substrate assessment:</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Squeeze test: Substrate should feel like a wrung-out sponge</li>
                <li>pH check: Most species prefer 5.5-7.0</li>
                <li>Visual inspection for proper mixing and supplementation</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Contamination check:</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Unusual odors (sour, ammonia-like)</li>
                <li>Discolored patches or wet spots</li>
                <li>Presence of slime or unusual textures</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Spawn quality:</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Check spawn jars for full colonization before use</li>
                <li>Verify storage conditions (refrigerated spawn should be used within 2-3 months)</li>
                <li>Test with a small batch first</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">How to Fix It</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Immediate temperature correction:</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Adjust incubator to optimal range for your species</li>
                <li>Use heating mats or space heaters if needed</li>
                <li>Ensure consistent temperatures (avoid wild fluctuations)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Substrate rescue:</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>If too dry: Lightly mist with sterile water</li>
                <li>If too wet: Increase air exchange to evaporate excess moisture</li>
                <li>Consider mixing in fresh spawn if contamination is minimal</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Contamination response:</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Isolate affected blocks immediately</li>
                <li>If bacterial: Increase air exchange and slightly lower temperature</li>
                <li>If mold: This is usually terminal - dispose of contaminated material</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Spawn supplementation:</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Add fresh, viable spawn to stalled blocks</li>
                <li>Use 1:1 spawn ratio for rescue operations</li>
                <li>Mix thoroughly but gently to avoid damaging existing mycelium</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">How to Prevent It Next Time</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">System design improvements:</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Invest in reliable temperature monitoring equipment</li>
                <li>Use incubators with good insulation and minimal temperature variation</li>
                <li>Choose species well-adapted to your local climate conditions</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Substrate preparation protocols:</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Follow proven recipes with tested supplementation ratios</li>
                <li>Master sterilization techniques (pressure cooking vs. pasteurization)</li>
                <li>Test substrate batches before full production</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Quality spawn sourcing:</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Purchase from reputable suppliers with good reviews</li>
                <li>Store spawn properly (refrigerated, used within shelf life)</li>
                <li>Maintain your own spawn culture library for consistent quality</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Sterile technique mastery:</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Use laminar flow hoods or still air boxes</li>
                <li>Practice proper disinfection protocols</li>
                <li>Work in clean environments away from potential contaminants</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Systems-Thinking Perspective</h2>
          <p className="mb-4">
            Slow colonization reveals interconnected system failures. Temperature affects enzyme production, which influences nutrient availability, which determines competitive success. Rather than treating symptoms, focus on creating environments that naturally favor your chosen fungus.
          </p>
          <p>
            Prevention requires understanding fungal ecology - mushrooms evolved to decompose wood efficiently in specific conditions. Your cultivation system should replicate these natural parameters, not fight against them.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Next Steps</h2>

          <RelatedIssues
            related={[
              { title: "No Pins", href: "/troubleshooting/no-pins" },
              { title: "Side Pinning", href: "/troubleshooting/side-pinning" },
              { title: "Foundations", href: "/foundations" },
            ]}
          />
        </section>
      </div>
    </div>
  );
}