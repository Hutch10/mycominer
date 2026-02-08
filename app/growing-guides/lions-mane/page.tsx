import type { Metadata } from 'next';
import SectionHeader from '../../components/SectionHeader';
import Breadcrumbs from '../../components/Breadcrumbs';
import RelatedIssues from '../../components/RelatedIssues';

export const metadata: Metadata = {
  title: "Growing Lion's Mane Mushrooms - Complete Guide",
  description: "Comprehensive guide to cultivating lion's mane (Hericium erinaceus): substrate preparation, environmental needs, and unique morphology considerations.",
  keywords: ['lions mane', 'Hericium erinaceus', 'mushroom cultivation', 'growing lions mane', 'hardwood substrate', 'medicinal mushroom'],
  other: {
    tags: ['growing-guides', 'lions-mane', 'hericium', 'medicinal', 'hardwood', 'gourmet', 'cultivation'].join(','),
  },
};

export default function LionsManeGuide() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Breadcrumbs />
      <SectionHeader
        title="Growing Lion's Mane Mushrooms"
        subtitle="A comprehensive guide to cultivating Hericium erinaceus with ecological understanding"
      />

      <div className="space-y-8 text-gray-800 dark:text-gray-200">
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Ecological Context</h2>
          <p className="mb-4">
            Lion's Mane (Hericium erinaceus) is a tooth fungus that grows on dead or dying hardwood trees in temperate forests. It plays a crucial role in decomposition, breaking down lignin-rich wood that other fungi cannot access. In nature, it appears as cascading white spines resembling a lion's mane, hence its common name. This species has evolved to fruit in the fall when temperatures drop and humidity rises, signaling the end of the growing season.
          </p>
          <p>
            Understanding Lion's Mane's ecological niche helps us replicate conditions that trigger its unique morphology. It prefers old-growth forests with abundant dead wood, making it an indicator species for forest health. Cultivation allows us to produce this medicinal mushroom while supporting conservation efforts.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Step 1: Substrate Preparation</h2>
          <p className="mb-4">
            <strong>Ecological reasoning:</strong> Lion's Mane naturally grows on hardwood logs and stumps. Hardwood sawdust provides the lignin-rich substrate it needs for robust growth. The addition of supplements mimics the nutrient boost from wood-decaying bacteria and fungi that precede Lion's Mane in the decomposition succession.
          </p>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Materials needed:</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>Hardwood sawdust (oak, maple, or beech preferred)</li>
              <li>Bran or wheat germ (nitrogen supplement)</li>
              <li>Gypsum (calcium source)</li>
              <li>Water for rehydration</li>
            </ul>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Master's Mix Recipe (per 3 lbs dry substrate):</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>2 lbs hardwood sawdust</li>
                <li>1 lb wheat bran or oat bran</li>
                <li>1/2 cup gypsum</li>
                <li>Enough water to reach 60-65% moisture content</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Process:</h3>
              <ol className="list-decimal ml-6 space-y-2">
                <li>Mix dry ingredients thoroughly</li>
                <li>Add water gradually while mixing to avoid clumps</li>
                <li>Squeeze a handful - only a few drops of water should come out</li>
                <li>Load into filter patch bags or jars</li>
                <li>Sterilize at 15 PSI for 90 minutes (or pasteurize at 160°F for 2 hours)</li>
                <li>Cool completely before inoculation</li>
              </ol>
            </div>
            <div>
              <strong>pH target:</strong> 5.5-6.5 (acidic, matching forest floor conditions)
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Step 2: Inoculation</h2>
          <p className="mb-4">
            <strong>Ecological reasoning:</strong> In nature, Lion's Mane spores germinate on fresh wounds in hardwood. We're creating a sterile environment where mycelium can establish without competition, mimicking the protected conditions inside decaying logs where it naturally grows.
          </p>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Materials needed:</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>Lion's Mane grain spawn</li>
              <li>Sterile work environment</li>
              <li>Alcohol lamp or spray</li>
              <li>Sealing tape for injection ports</li>
            </ul>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Process:</h3>
              <ol className="list-decimal ml-6 space-y-2">
                <li>Work in a still air box or under laminar flow</li>
                <li>Inject 1-2 cc spawn per jar through self-healing injection ports</li>
                <li>Distribute spawn evenly throughout substrate by shaking jars</li>
                <li>Seal injection ports with micropore tape</li>
                <li>Incubate in complete darkness</li>
              </ol>
            </div>
            <div>
              <strong>Inoculation rate:</strong> 1:2 to 1:4 spawn ratio. Lion's Mane grows more slowly than oyster mushrooms, so higher spawn ratios reduce contamination risk.
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Step 3: Colonization</h2>
          <p className="mb-4">
            <strong>Ecological reasoning:</strong> Lion's Mane mycelium produces specialized enzymes to break down lignin, a complex polymer that gives wood its strength. This process requires stable, warm conditions to maintain enzyme activity. The slow growth rate reflects its adaptation to compete in nutrient-poor hardwood environments.
          </p>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Environmental conditions:</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li><strong>Temperature:</strong> 70-75°F (21-24°C) - optimal for lignin-degrading enzymes</li>
                <li><strong>Humidity:</strong> 60-70% - prevents drying while allowing evaporation</li>
                <li><strong>Light:</strong> Complete darkness - prevents premature pinning</li>
                <li><strong>Air exchange:</strong> Minimal - CO2 stimulates colonization</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Timeline and monitoring:</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Days 1-10: Spawn recovery - mycelium emerges from grains</li>
                <li>Days 10-21: Active colonization - dense white mycelium spreads</li>
                <li>Days 21-28: Consolidation - substrate binds together</li>
                <li>Full colonization: 3-4 weeks total</li>
              </ul>
            </div>
            <div>
              <strong>Signs of health:</strong> Bright white mycelium, pleasant mushroomy odor, no discoloration or unusual smells.
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Step 4: Fruiting</h2>
          <p className="mb-4">
            <strong>Ecological reasoning:</strong> Lion's Mane fruits in response to seasonal cues - cooler temperatures and higher humidity signal autumn conditions. The cascading spines maximize spore dispersal in forest understories. Fresh air exchange triggers the shift from vegetative to reproductive growth.
          </p>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Initiating fruiting:</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Move fully colonized substrate to fruiting chamber</li>
                <li>Expose to fresh air by cutting bag tops or removing from containers</li>
                <li>Drop temperature to 65-70°F (18-21°C)</li>
                <li>Increase humidity to 85-90%</li>
                <li>Provide indirect light (12 hours/day)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Fruiting chamber setup:</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li><strong>Shotgun fruiting chamber:</strong> Clear plastic tub with 1/4" holes</li>
                <li><strong>Humidity:</strong> Perlite floor with standing water</li>
                <li><strong>Air exchange:</strong> Natural through holes, enhanced with fans if needed</li>
                <li><strong>Light:</strong> 500-1000 lux from fluorescent lights</li>
              </ul>
            </div>
            <div>
              <strong>Primordia formation:</strong> Small white knobs appear within 7-14 days. These develop into characteristic cascading spines over 1-2 weeks.
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Step 5: Harvesting</h2>
          <p className="mb-4">
            <strong>Ecological reasoning:</strong> Lion's Mane releases spores from the tips of its spines, ensuring wide dispersal. Harvesting before heavy spore drop prevents mess and maintains quality. The mushroom's medicinal compounds peak just before spore maturation.
          </p>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">When to harvest:</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Spines are 1-4 inches long and flexible</li>
                <li>Color is pure white (before browning)</li>
                <li>Before heavy spore drop (brown dust on surfaces below)</li>
                <li>Texture is firm but not woody</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Harvesting technique:</h3>
              <ol className="list-decimal ml-6 space-y-2">
                <li>Use a sharp knife to cut at the base</li>
                <li>Twist gently if needed, but cutting prevents substrate damage</li>
                <li>Handle carefully - spines are delicate</li>
                <li>Harvest when spines are fully formed but before browning</li>
              </ol>
            </div>
            <div>
              <strong>Post-harvest:</strong> Substrate often produces a second flush. Dunk in cold water for 12 hours, then return to fruiting conditions.
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Common Issues and Solutions</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2 text-red-600 dark:text-red-400">Browning or Discoloration</h3>
              <p className="mb-2"><strong>Cause:</strong> Oxidation or bacterial contamination</p>
              <p><strong>Solution:</strong> Harvest promptly when white. Improve sterilization technique.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-red-600 dark:text-red-400">Slow or Stalled Growth</h3>
              <p className="mb-2"><strong>Cause:</strong> Temperature too low or poor substrate nutrition</p>
              <p><strong>Solution:</strong> Maintain 70-75°F. Use fresh spawn and properly supplemented substrate.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-red-600 dark:text-red-400">Aborted Pins</h3>
              <p className="mb-2"><strong>Cause:</strong> Environmental fluctuations or low humidity</p>
              <p><strong>Solution:</strong> Maintain stable conditions. Increase humidity during pinning.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-red-600 dark:text-red-400">Contamination</h3>
              <p className="mb-2"><strong>Cause:</strong> Inadequate sterilization or poor sterile technique</p>
              <p><strong>Solution:</strong> Use proper pressure cooking. Work in clean environment with alcohol disinfection.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Medicinal Considerations</h2>
          <p className="mb-4">
            Lion's Mane contains compounds that support nerve growth and cognitive function. For medicinal use:
          </p>
          <ul className="list-disc ml-6 space-y-2">
            <li><strong>Fresh vs. dried:</strong> Fresh mushrooms have higher water content but shorter shelf life</li>
            <li><strong>Drying:</strong> Air dry at low temperatures to preserve active compounds</li>
            <li><strong>Preparation:</strong> Can be eaten fresh, made into tea, tincture, or powder</li>
            <li><strong>Dosage:</strong> 1-2 fresh mushrooms or 1-2g dried per day for general health</li>
          </ul>
          <p>
            Consult healthcare providers before using for medicinal purposes.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Next Steps</h2>

          <RelatedIssues
            related={[
              { title: "Reishi Guide", href: "/growing-guides/reishi" },
              { title: "Medicinal Lion's Mane", href: "/medicinal-mushrooms/lions-mane" },
              { title: "Troubleshooting", href: "/troubleshooting" },
            ]}
          />
        </section>
      </div>
    </div>
  );
}