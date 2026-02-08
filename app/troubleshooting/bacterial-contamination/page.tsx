import type { Metadata } from 'next';
import SectionHeader from '../../components/SectionHeader';
import Breadcrumbs from '../../components/Breadcrumbs';
import RelatedIssues from '../../components/RelatedIssues';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Bacterial Contamination - Wet Rot & Sour Smell',
  description: 'Identify and prevent bacterial contamination: wet rot, sour smell, slime, moisture control, and sterilization improvements.',
  keywords: ['bacterial contamination', 'wet rot', 'sour smell', 'bacteria', 'slime', 'moisture', 'sterilization'],
  other: {
    tags: ['troubleshooting', 'bacteria', 'contamination', 'wet-rot', 'moisture', 'sterilization', 'prevention'].join(','),
  },
};

export default function BacterialContamination() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Breadcrumbs />
      <SectionHeader 
        title="Bacterial Contamination" 
        subtitle="Understanding and preventing bacterial colonization of cultivation media"
      />
      
      <div className="space-y-8 text-gray-800 dark:text-gray-200">
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Symptom Description</h2>
          <p className="mb-4 leading-relaxed">
            Bacterial contamination presents as wet, slimy, or greasy patches on grain or substrate. The infected areas often develop a distinct sour, sweet, or pungent odor. Mycelium surrounding bacterial colonies grows thin and wispy, lacking the robust, branching structure of healthy mycelium. The colonization rate slows dramatically, sometimes halting completely within a few days of bacterial proliferation.
          </p>
          <p className="leading-relaxed">
            Yellow or brown exudates (metabolites) often appear on the grain surface, creating a wet, glistening appearance. In severe cases, the entire container may develop a foul smell within 24-48 hours, and mycelial growth completely stops. This differs from mold contamination (which presents visually first) in that bacterial issues often announce themselves through smell before visible mycelial stunting occurs.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Ecological Cause</h2>
          <p className="mb-6 leading-relaxed">
            Bacteria and mycelium compete for the same nutrients and moisture. However, bacteria have a critical ecological advantage in poorly sterilized substrates: they reproduce far more rapidly (dividing every 20-30 minutes compared to mycelium's growth measured in hours) and can thrive in anaerobic or hypoxic environments where mycelium struggles. Understanding the specific bacterial advantage clarifies why prevention is so effective. Learn more about <Link href="/foundations/contamination-ecology" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">microbial competition</Link> in fungal cultivation.
          </p>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">Insufficient Substrate Sterilization</h3>
              <p className="leading-relaxed">
                Pressure cooking grain to 15 PSI for 2.5 hours kills most bacteria, but incomplete sterilization (too low pressure, insufficient time, or failed seal) leaves bacterial spores viable. These dormant spores germinate immediately when the warm grain is inoculated with mushroom spawn. Since the substrate is still cooling and the mycelium is establishing, bacteria proliferate unchecked in the first 48-72 hours. This is why sterilization is non-negotiable—there is no "good enough" that falls short. Review <Link href="/foundations/sterile-technique" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">proper sterilization procedures</Link> to ensure complete bacterial elimination.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">Contaminated Inoculation Technique</h3>
              <p className="leading-relaxed">
                Bacteria live on every surface: skin, unwashed tools, non-sterile containers, and air. During inoculation, even brief exposure to contaminated air or touching the inoculation site with an unsterile needle introduces bacterial spores into the warm, moist grain. These bacteria establish immediately because they encounter no competition from aggressive, colonizing mycelium. Poor inoculation technique—particularly not flaming the needle between inoculations, using non-sterile supplies, or inoculating outside a sterile environment—introduces bacteria at the moment of highest vulnerability. Master <Link href="/foundations/clean-technique" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">clean technique fundamentals</Link> to prevent this common issue.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">Weak or Aged Spawn</h3>
              <p className="leading-relaxed">
                Mycelium aggressively colonizes fresh grain, releasing antimicrobial compounds and competing intensely for resources. Old spawn (more than 3-4 weeks) has depleted nutrients, reduced vigor, and slower growth rates. This delayed colonization rate gives introduced bacteria a crucial window to establish and proliferate. Additionally, old spawn may have accumulated bacterial contamination internally that only expresses after inoculation into fresh grain. Fresh, vigorous spawn is always superior to old spawn, even if the old spawn appears healthy. Use the <Link href="/tools/species-comparison-matrix" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">species comparison matrix</Link> to select appropriate spawn varieties.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">High Moisture Content or Anaerobic Conditions</h3>
              <p className="leading-relaxed">
                Mycelium prefers grain moisture of 60-65%, but many cultivators add extra water for easier colonization. Overly wet grain becomes anaerobic (oxygen-depleted), which favors bacteria over mycelium. Bacteria tolerating or even thriving in low-oxygen environments will proliferate while mycelium growth slows. Additionally, excessive moisture creates pooling, and pooled moisture becomes a bacterial culture medium. The correct grain moisture is not just a target—it's a bacterial control mechanism. Check <Link href="/foundations/environmental-parameters" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">environmental parameters</Link> for proper moisture levels by species.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">How to Confirm the Cause</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">1. Smell Test</h3>
              <p className="mb-2 leading-relaxed">Bacterial contamination produces a distinctive sour, sweet, or putrid smell within 24-72 hours of inoculation. Open the container near your nose (carefully, not directly inhaling spores) and note the odor. Bacterial smell is chemical and unambiguous—not the earthy smell of healthy mycelium.</p>
              <ul className="list-disc ml-6 space-y-1 text-gray-700 dark:text-gray-300">
                <li>Sour/vinegary: Lactobacillus or acetic acid bacteria</li>
                <li>Putrid/foul: Proteolytic bacteria breaking down proteins</li>
                <li>Sweet/fermented: Yeast or other fermentative organisms</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">2. Visual Assessment</h3>
              <p className="mb-2 leading-relaxed">Look for wet, slimy, greasy-appearing grain and brown or yellow exudates. Healthy mycelium is dry and white. Bacterial-affected grain looks saturated even if moisture content is correct, because bacterial colonies produce slime as a protective biofilm.</p>
              <ul className="list-disc ml-6 space-y-1 text-gray-700 dark:text-gray-300">
                <li>Slimy texture on grain surface</li>
                <li>Yellow, tan, or brown discoloration</li>
                <li>Mycelium growth stopped despite elapsed time</li>
                <li>Thin, weak mycelial growth around affected areas</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">3. Growth Pattern Analysis</h3>
              <p className="mb-2 leading-relaxed">Bacterial colonies expand radially from the infection point, creating wet zones surrounded by stalled mycelium. Compare with your inoculation date. Bacterial contamination typically arrests growth within 2-3 days of inoculation, while mold often takes 1-2 weeks to significantly slow mycelial progress.</p>
              <ul className="list-disc ml-6 space-y-1 text-gray-700 dark:text-gray-300">
                <li>Rapid stalling (days 2-4 post-inoculation)</li>
                <li>Mycelium appearing healthy but surrounded by wet zones</li>
                <li>No visible mold, but obvious contamination</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">4. Sterilization Review</h3>
              <p className="mb-2 leading-relaxed">If multiple jars from the same batch show bacterial contamination, suspect sterilization failure. Review your pressure cooker:</p>
              <ul className="list-disc ml-6 space-y-1 text-gray-700 dark:text-gray-300">
                <li>Did the pressure cooker reach and maintain 15 PSI?</li>
                <li>Did you time 2.5 hours at full pressure (not counting the heat-up time)?</li>
                <li>Did steam vent fully for 10 minutes before closing the vent?</li>
                <li>Did the seal remain intact throughout cooling?</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">How to Fix It</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">Option 1: Discard (Recommended for Severe Contamination)</h3>
              <p className="leading-relaxed">
                If contamination is visible within 3 days of inoculation or spreads across more than 10% of the container, discard the entire batch. Severely bacterial-contaminated substrate will not fruit successfully, and keeping it risks spreading spores to other cultures. Discarding is emotionally difficult but is the correct ecological and practical decision. Save the jar for re-sterilization and try again with corrected technique.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">Option 2: Containment and Observation (Mild Cases Only)</h3>
              <p className="mb-3 leading-relaxed">
                If contamination is detected very early (first 48 hours) and affects only a small area, isolate the jar immediately in a separate location away from other cultures. Increase fresh air exchange by loosening the lid slightly (adding a piece of micropore tape to encourage oxygen). Often, healthy mycelium will eventually outcompete bacteria, especially oyster species that produce antimicrobial compounds. This is a low-probability recovery, but in mild cases with vigorous spawn, it sometimes works.
              </p>
              <p className="leading-relaxed">
                Monitor daily. If contamination spreads or smell worsens, discard immediately. If mycelium begins aggressive growth after 5-7 days, you may allow it to fully colonize. Even if recovery occurs, contaminated jars should fruit separately, away from other substrates, to minimize spore spread.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">Option 3: Aggressive Remedy (Advanced, Low Success Rate)</h3>
              <p className="leading-relaxed">
                Some experienced growers attempt hydrogen peroxide rinse: pour out grain carefully, rinse briefly in a 3% hydrogen peroxide solution to kill bacteria, then drain and spread on clean paper to air-dry before reioculating with stronger spawn. This is rarely successful because the bacterial biofilm protects organisms from peroxide, and rinsing damages mycelium that may have begun colonizing. This approach is a last resort and should not be attempted with valuable substrate or genetics.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">How to Prevent It Next Time</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">Prevention Layer 1: Absolute Sterilization Protocol</h3>
              <p className="mb-3 leading-relaxed">
                <strong>The only reliable defense against bacteria is complete substrate sterilization.</strong> Use a pressure cooker at 15 PSI for 2.5 hours (starting the timer only after full pressure is reached and steam has vented for 10 minutes). Use a pressure cooker, not a regular pot or Instant Pot—pressure cooking is non-negotiable.
              </p>
              <ul className="list-disc ml-6 space-y-1 text-gray-700 dark:text-gray-300">
                <li>Use a working pressure cooker gauge (calibrate annually)</li>
                <li>Use new lids and maintain proper seal</li>
                <li>Cool completely before opening (prevents re-contamination)</li>
                <li>Store sterilized grain in sealed, clean containers if not inoculating immediately</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">Prevention Layer 2: Sterile Inoculation Technique</h3>
              <p className="mb-3 leading-relaxed">
                Sterilized substrate is vulnerable immediately after inoculation. Introduce mycelium in the cleanest possible conditions:
              </p>
              <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300">
                <li><strong>Flame the needle:</strong> Heat the inoculation needle in a flame until glowing red, then let it cool briefly before piercing the grain bag or jar. Flame between every inoculation.</li>
                <li><strong>Inoculate in Still Air Box (SAB):</strong> A simple cardboard box with arm holes reduces airborne contamination by 99%. Even a 10-minute SAB session is dramatically better than open-air inoculation.</li>
                <li><strong>Use fresh spawn:</strong> Only 2-3 weeks old, from a reliable source. Weak spawn is defeated by bacteria.</li>
                <li><strong>Use high spawn rate:</strong> 10-20% spawn by weight ensures aggressive mycelial growth that outcompetes bacteria before they establish.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">Prevention Layer 3: Correct Substrate Moisture</h3>
              <p className="mb-3 leading-relaxed">
                Grain moisture at inoculation should be 60-65%. Use the squeeze test: a few grains squeeze easily but don't release visible water. Overly wet grain is a bacterial incubator.
              </p>
              <ul className="list-disc ml-6 space-y-1 text-gray-700 dark:text-gray-300">
                <li>Measure water carefully (typically 1:2.5 grain:water ratio by weight)</li>
                <li>After pressure cooking, spread hot grain on a clean surface for 5 minutes to release excess steam</li>
                <li>Cool completely before inoculating</li>
                <li>Never add water "just to be safe"—correct moisture is your defense</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">Prevention Layer 4: Environmental Management</h3>
              <p className="leading-relaxed">
                After inoculation, maintain clean conditions and avoid temperature stress. Store colonizing jars at 70-75°F in a dust-free area. Avoid sealed plastic containers with no gas exchange—ensure some air movement, even if minimal. High temperatures speed both mycelium and bacterial growth, but temperatures above 77°F increasingly favor bacteria. Keep your colonization temperature moderate. Monitor conditions using the <Link href="/tools/troubleshooting-decision-tree" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">troubleshooting decision tree</Link> if issues arise.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Systems-Thinking Perspective</h2>
          <p className="mb-4 leading-relaxed">
            Bacterial contamination represents a failure in ecological control rather than bad luck. In nature, mycelium and bacteria coexist; the mycelium's antimicrobial compounds and rapid colonization give it the advantage in establishing first. In cultivation, we remove this natural balance by creating warm, moist, nutrient-rich conditions that are equally favorable to both organisms. Our sterilization step attempts to reset the playing field, but it must be complete.
          </p>
          <p className="leading-relaxed">
            Think of sterilization not as killing bacteria, but as creating a moment where mycelium arrives first and establishes unchallenged. The sooner healthy mycelium covers available substrate, the sooner it excludes bacterial colonization through both physical occupation and antibiotic production. Weak sterilization or slow mycelial growth creates the vacuum that bacteria exploit. This is why the best bacterial prevention is vigorous mycelium establishing dominance in the first 48-72 hours—the critical window. Bacterial issues are particularly common with <Link href="/growing-guides/oyster" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">oyster mushrooms</Link> due to their rapid colonization requirements.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Next Steps</h2>
          <RelatedIssues related={[
            { title: 'Green Mold Contamination', href: '/troubleshooting/green-mold' },
            { title: 'Slow Colonization', href: '/troubleshooting/slow-colonization' },
            { title: 'Sterile Technique', href: '/foundations/sterile-technique' },
            { title: 'Environmental Parameters', href: '/foundations/environmental-parameters' }
          ]} />
        </section>
      </div>
    </div>
  );
}