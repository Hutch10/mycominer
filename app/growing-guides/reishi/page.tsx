import type { Metadata } from 'next';
import SectionHeader from '../../components/SectionHeader';
import Breadcrumbs from '../../components/Breadcrumbs';
import RelatedIssues from '../../components/RelatedIssues';

export const metadata: Metadata = {
  title: 'Growing Reishi Mushrooms - Medicinal Cultivation',
  description: 'Complete guide to cultivating reishi (Ganoderma lucidum): antler vs conk forms, airflow requirements, and medicinal potency optimization.',
  keywords: ['reishi', 'Ganoderma lucidum', 'medicinal mushroom', 'growing reishi', 'hardwood substrate', 'antler reishi'],
  other: {
    tags: ['growing-guides', 'reishi', 'ganoderma', 'medicinal', 'hardwood', 'airflow', 'cultivation'].join(','),
  },
};

export default function ReishiGuidePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Breadcrumbs />
      <SectionHeader
        title="Growing Reishi Mushrooms"
        subtitle="A comprehensive guide to cultivating Ganoderma lucidum with ecological understanding"
      />

      <div className="space-y-8 text-gray-800 dark:text-gray-200">
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Ecological Context</h2>
          <p className="mb-4">
            Reishi (Ganoderma lucidum) is a polypore fungus that grows as a bracket or conk on dead or dying hardwood trees. Known as the "mushroom of immortality" in traditional medicine, it plays a vital ecological role in late-stage decomposition. Reishi mycelium can live for decades within trees, only fruiting when the host is severely compromised or dead. This longevity reflects its adaptation to stable, long-term relationships with host trees.
          </p>
          <p>
            In nature, Reishi appears in two main forms: antler-like structures in humid, shaded conditions and flat conks in drier, exposed areas. This phenotypic plasticity allows it to maximize spore dispersal across varying microclimates. Understanding these ecological adaptations helps us create cultivation conditions that support both forms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Step 1: Substrate Preparation</h2>
          <p className="mb-4">
            <strong>Ecological reasoning:</strong> Reishi naturally colonizes the heartwood of hardwood trees, where it encounters dense lignin and cellulose. Sawdust provides the ideal particle size and composition, while supplements mimic the nutrient availability in decaying wood. The slow decomposition process requires stable, long-term conditions.
          </p>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Materials needed:</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>Hardwood sawdust (oak, maple, elm preferred)</li>
              <li>Wheat bran or rice bran (nitrogen supplement)</li>
              <li>Gypsum (calcium and sulfur source)</li>
              <li>Vermiculite (water retention and aeration)</li>
            </ul>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Master's Mix Recipe (per 3 lbs dry substrate):</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>2 lbs hardwood sawdust</li>
                <li>1 lb wheat bran</li>
                <li>1/2 cup gypsum</li>
                <li>1/2 cup vermiculite</li>
                <li>Enough water to reach 60-65% moisture</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Process:</h3>
              <ol className="list-decimal ml-6 space-y-2">
                <li>Mix dry ingredients thoroughly to ensure even distribution</li>
                <li>Add water gradually while mixing - substrate should feel like a wrung-out sponge</li>
                <li>Load into polypropylene bags or wide-mouth jars</li>
                <li>Sterilize at 15 PSI for 2.5 hours (longer sterilization prevents contamination)</li>
                <li>Cool completely before use - Reishi is sensitive to thermal shock</li>
              </ol>
            </div>
            <div>
              <strong>pH target:</strong> 5.0-6.0 (acidic, matching conditions in decaying wood)
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Step 2: Inoculation</h2>
          <p className="mb-4">
            <strong>Ecological reasoning:</strong> Reishi spores germinate slowly and require stable conditions to establish. In nature, this occurs in protected environments within tree wounds. We're replicating this by using high spawn ratios and sterile technique to give the slow-growing mycelium a competitive advantage.
          </p>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Materials needed:</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>Reishi grain spawn (preferably on sawdust)</li>
              <li>Sterile work environment</li>
              <li>Sealing materials for bags</li>
              <li>Tyvek or filter patches for gas exchange</li>
            </ul>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Process:</h3>
              <ol className="list-decimal ml-6 space-y-2">
                <li>Work in a clean, still environment</li>
                <li>Mix spawn with substrate at 1:1 to 1:2 ratio (higher than most species)</li>
                <li>Pack loosely into bags - Reishi needs good aeration</li>
                <li>Seal with filter patch or tyvek for gas exchange</li>
                <li>Label with inoculation date and strain</li>
              </ol>
            </div>
            <div>
              <strong>Spawn choice:</strong> Sawdust spawn works better than grain spawn for Reishi due to similar particle size to the substrate.
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Step 3: Colonization</h2>
          <p className="mb-4">
            <strong>Ecological reasoning:</strong> Reishi mycelium grows slowly because it invests energy in producing medicinal compounds rather than rapid expansion. This adaptation suits its role as a late colonizer in decomposition succession, where it can dominate without competition. The long colonization time reflects its perennial lifestyle in nature.
          </p>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Environmental conditions:</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li><strong>Temperature:</strong> 75-80°F (24-27°C) - warm but not hot</li>
                <li><strong>Humidity:</strong> 60-70% - moderate to prevent condensation</li>
                <li><strong>Light:</strong> Complete darkness - light inhibits colonization</li>
                <li><strong>Air exchange:</strong> Minimal but consistent - CO2 stimulates growth</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Timeline and monitoring:</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Days 1-14: Spawn recovery - mycelium emerges slowly</li>
                <li>Days 14-35: Active colonization - white mycelium spreads gradually</li>
                <li>Days 35-45: Consolidation - substrate becomes bound together</li>
                <li>Full colonization: 6-8 weeks total</li>
              </ul>
            </div>
            <div>
              <strong>Patience required:</strong> Reishi takes longer than most gourmet mushrooms. Rushing the process increases contamination risk.
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Step 4: Fruiting</h2>
          <p className="mb-4">
            <strong>Ecological reasoning:</strong> Reishi fruits when environmental conditions signal tree decline or death. The morphology (antlers vs. conks) depends on humidity and air movement, allowing adaptation to different forest microclimates. Fresh air exchange triggers the reproductive phase after long vegetative growth.
          </p>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Initiating fruiting:</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Move fully colonized blocks to fruiting area</li>
                <li>Cut bag tops or remove from containers for air exposure</li>
                <li>Maintain warm temperatures initially (75-80°F)</li>
                <li>Increase humidity to 85-95%</li>
                <li>Provide low light (4-8 hours/day)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Morphology control:</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li><strong>Antlers:</strong> High humidity (90-95%), low air movement, shaded conditions</li>
                <li><strong>Conks:</strong> Lower humidity (80-85%), more air exchange, brighter light</li>
                <li><strong>Temperature:</strong> 70-80°F throughout fruiting</li>
                <li><strong>Substrate:</strong> Keep blocks elevated on racks for air circulation</li>
              </ul>
            </div>
            <div>
              <strong>Primordia formation:</strong> Small bumps appear within 2-4 weeks. These develop into either antler clusters or flat conks over 4-8 weeks.
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Step 5: Harvesting</h2>
          <p className="mb-4">
            <strong>Ecological reasoning:</strong> Reishi mushrooms mature slowly, developing medicinal compounds over time. Harvest timing affects potency - younger fruiting bodies have different compounds than mature ones. Leaving some mushrooms to release spores supports natural populations.
          </p>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">When to harvest:</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li><strong>Antlers:</strong> When spines stop growing (4-8 inches tall)</li>
                <li><strong>Conks:</strong> When edges stop extending and color darkens</li>
                <li>Before heavy spore release (brown spore dust)</li>
                <li>While still flexible, not woody</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Harvesting technique:</h3>
              <ol className="list-decimal ml-6 space-y-2">
                <li>Use a sharp knife to cut at the base</li>
                <li>Wear gloves - Reishi can cause skin irritation in some people</li>
                <li>Cut cleanly to avoid damaging the substrate</li>
                <li>Allow cut surface to callus before returning to fruiting</li>
              </ol>
            </div>
            <div>
              <strong>Multiple flushes:</strong> Reishi can produce 2-3 flushes from the same block over 6-12 months.
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Common Issues and Solutions</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2 text-red-600 dark:text-red-400">No Fruiting</h3>
              <p className="mb-2"><strong>Cause:</strong> Insufficient air exchange or light</p>
              <p><strong>Solution:</strong> Ensure fresh air exposure and provide some indirect light. Be patient - Reishi takes time.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-red-600 dark:text-red-400">Thin, Weak Antlers</h3>
              <p className="mb-2"><strong>Cause:</strong> Low humidity or excessive air movement</p>
              <p><strong>Solution:</strong> Increase humidity to 90%+ and reduce air exchange for antler formation.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-red-600 dark:text-red-400">Contamination During Long Colonization</h3>
              <p className="mb-2"><strong>Cause:</strong> Extended time at warm temperatures</p>
              <p><strong>Solution:</strong> Use higher spawn ratios and ensure thorough sterilization. Consider shorter colonization periods.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-red-600 dark:text-red-400">Aborted Primordia</h3>
              <p className="mb-2"><strong>Cause:</strong> Environmental fluctuations</p>
              <p><strong>Solution:</strong> Maintain stable temperature and humidity. Avoid moving blocks once primordia appear.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Medicinal Processing</h2>
          <p className="mb-4">
            Reishi contains triterpenes and polysaccharides that develop during growth. Processing affects bioavailability:
          </p>
          <ul className="list-disc ml-6 space-y-2">
            <li><strong>Dual extraction:</strong> Alcohol then water extraction captures both fat-soluble and water-soluble compounds</li>
            <li><strong>Tea:</strong> Simmer slices for 2-4 hours to extract polysaccharides</li>
            <li><strong>Tincture:</strong> Soak in high-proof alcohol for 4-6 weeks</li>
            <li><strong>Drying:</strong> Air dry or dehydrate at low temperature to preserve compounds</li>
          </ul>
          <p>
            For medicinal use, consult qualified practitioners. Reishi can interact with medications.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Ecological Impact</h2>
          <p className="mb-4">
            Reishi cultivation supports forest health in several ways:
          </p>
          <ul className="list-disc ml-6 space-y-2">
            <li><strong>Indicator species:</strong> Presence indicates healthy hardwood forests</li>
            <li><strong>Medicinal conservation:</strong> Reduces wild harvesting pressure</li>
            <li><strong>Decomposition:</strong> Sawdust substrate repurposes wood waste</li>
            <li><strong>Biodiversity:</strong> Spores contribute to wild populations</li>
          </ul>
          <p>
            Choose strains adapted to your local hardwood species for best ecological compatibility.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Next Steps</h2>

          <RelatedIssues
            related={[
              { title: "Lion's Mane Guide", href: "/growing-guides/lions-mane" },
              { title: "Medicinal Reishi", href: "/medicinal-mushrooms/reishi" },
              { title: "Troubleshooting", href: "/troubleshooting" },
            ]}
          />
        </section>
      </div>
    </div>
  );
}