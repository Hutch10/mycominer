import type { Metadata } from 'next';
import SectionHeader from '../../components/SectionHeader';
import Breadcrumbs from '../../components/Breadcrumbs';
import RelatedIssues from '../../components/RelatedIssues';

// Static page with daily revalidation
export const revalidate = 86400; // 24 hours

export const metadata: Metadata = {
  title: 'Growing Oyster Mushrooms - Complete Cultivation Guide',
  description: 'Comprehensive guide to cultivating oyster mushrooms (Pleurotus spp.) with ecological understanding, substrate preparation, and troubleshooting.',
  keywords: ['oyster mushrooms', 'Pleurotus', 'mushroom cultivation', 'growing oysters', 'straw substrate', 'beginner mushrooms'],
  other: {
    tags: ['growing-guides', 'oyster', 'pleurotus', 'beginner-friendly', 'straw'].join(','),
  },
};

export default function OysterGuide() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Breadcrumbs />
      <SectionHeader
        title="Growing Oyster Mushrooms"
        subtitle="A comprehensive guide to cultivating Pleurotus species with ecological understanding"
      />

      <div className="space-y-8 text-gray-800 dark:text-gray-200">
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Ecological Context</h2>
          <p className="mb-4">
            Oyster mushrooms (Pleurotus spp.) are saprotrophic fungi that play essential roles in forest ecosystems as primary decomposers. They break down lignin and cellulose in dead hardwood, releasing nutrients back into the soil food web. In nature, they typically fruit in clusters on fallen logs during cooler, wetter seasons, helping to accelerate the carbon cycle. Understanding this ecological role helps us create cultivation conditions that mimic their natural habitat while respecting the interconnected systems they support.
          </p>
          <p>
            Different Pleurotus species have adapted to various ecological niches - P. ostreatus prefers cooler temperatures, P. pulmonarius warmer conditions, and P. eryngii desert-like environments. This diversity allows us to match species to our local climate and available resources.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Step 1: Substrate Preparation</h2>
          <p className="mb-4">
            <strong>Ecological reasoning:</strong> Oysters naturally grow on cellulose-rich plant material. Straw represents agricultural waste that would otherwise decompose slowly, tying up carbon. By using it for mushroom cultivation, we're creating a managed decomposition process that produces edible biomass while preventing methane release from anaerobic breakdown.
          </p>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Materials needed:</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>Wheat or rice straw (fresh, not moldy)</li>
              <li>Large pot or barrel for soaking</li>
              <li>pH meter or test strips</li>
              <li>Gypsum (calcium sulfate) - optional</li>
            </ul>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Process:</h3>
              <ol className="list-decimal ml-6 space-y-2">
                <li>Chop straw into 2-4 inch pieces to increase surface area for microbial colonization</li>
                <li>Soak in clean water for 12-24 hours to rehydrate and remove water-soluble inhibitors</li>
                <li>Drain thoroughly - excess water creates anaerobic pockets that favor competing bacteria</li>
                <li>Add gypsum (2-4 cups per 100 lbs straw) to buffer pH and provide calcium for cell wall formation</li>
                <li>Pasteurize at 160-180°F for 1-2 hours to eliminate competitive organisms while preserving beneficial microbes</li>
                <li>Cool to room temperature before inoculation</li>
              </ol>
            </div>
            <div>
              <strong>Target pH:</strong> 6.5-7.5 (slightly acidic to neutral, matching forest floor conditions)
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Step 2: Inoculation</h2>
          <p className="mb-4">
            <strong>Ecological reasoning:</strong> In nature, oyster spores land on wounded wood where they germinate and form mycelium. We're replicating this by introducing pure culture spawn to sterilized substrate, creating a controlled environment where the mushroom mycelium can establish before competitors.
          </p>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Materials needed:</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>Grain spawn (rye, millet, or wheat berries colonized with oyster mycelium)</li>
              <li>Sterile work area (still air box or laminar flow hood)</li>
              <li>Alcohol spray for disinfection</li>
              <li>Filter patch bags or jars</li>
            </ul>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Process:</h3>
              <ol className="list-decimal ml-6 space-y-2">
                <li>Work in a clean environment to prevent contamination</li>
                <li>Mix spawn with cooled substrate at 1:2 to 1:4 ratio (spawn:substrate)</li>
                <li>Pack loosely into grow bags or containers - dense packing reduces oxygen availability</li>
                <li>Seal bags with filter patches to allow gas exchange while preventing contaminants</li>
                <li>Label with date, species, and spawn ratio</li>
              </ol>
            </div>
            <div>
              <strong>Spawn ratio reasoning:</strong> Higher spawn ratios (1:1) speed colonization but increase costs. Lower ratios (1:4) are more economical but require more stable conditions and increase contamination risk.
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Step 3: Colonization</h2>
          <p className="mb-4">
            <strong>Ecological reasoning:</strong> During colonization, mycelium secretes enzymes to break down complex carbohydrates into simple sugars. This process mirrors how oysters decompose wood in forests, releasing nutrients for other organisms. Temperature affects enzyme activity - too cold slows digestion, too hot denatures proteins.
          </p>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Environmental conditions:</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li><strong>Temperature:</strong> 75-80°F (24-27°C) - optimal for enzyme production</li>
                <li><strong>Humidity:</strong> 60-70% - prevents drying while allowing evaporation</li>
                <li><strong>Light:</strong> Complete darkness - light triggers premature pinning</li>
                <li><strong>Air exchange:</strong> Minimal - CO2 buildup stimulates colonization</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Timeline and monitoring:</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Days 1-7: Spawn recovery - mycelium spreads from grains</li>
                <li>Days 7-14: Active colonization - white mycelium visible throughout substrate</li>
                <li>Days 14-21: Consolidation - mycelium thickens and substrate shrinks</li>
                <li>Check for contamination: Unusual colors, odors, or wet spots indicate problems</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Step 4: Fruiting</h2>
          <p className="mb-4">
            <strong>Ecological reasoning:</strong> In nature, oysters fruit when environmental cues signal resource availability. Fresh air exchange removes CO2 buildup that normally suppresses fruiting, while light and temperature drops trigger the reproductive phase. This ensures spores are released when conditions favor germination.
          </p>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Initiating fruiting:</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Cut X-shaped slits in bag tops or remove from bags entirely</li>
                <li>Expose colonized substrate to fresh air</li>
                <li>Drop temperature to 60-70°F (15-21°C)</li>
                <li>Increase humidity to 85-95%</li>
                <li>Provide indirect light (12 hours/day)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Fruiting chamber setup:</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li><strong>Monotub or fruiting chamber:</strong> Plastic tub with holes for air exchange</li>
                <li><strong>Humidity maintenance:</strong> Perlite floor with water, ultrasonic humidifier</li>
                <li><strong>Air exchange:</strong> 2-4 complete air changes per hour</li>
                <li><strong>Light:</strong> 400-1000 lux from fluorescent or LED lights</li>
              </ul>
            </div>
            <div>
              <strong>Primordia formation:</strong> Small pins appear within 3-7 days. Maintain stable conditions to prevent aborts.
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Step 5: Harvesting</h2>
          <p className="mb-4">
            <strong>Ecological reasoning:</strong> Harvest timing affects future flushes. Leaving some mushrooms to release spores supports wild populations and completes the fungal life cycle. Harvesting before full maturity prevents energy diversion from mycelium to spore production.
          </p>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">When to harvest:</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Caps begin to flatten but edges still curl downward</li>
                <li>Gills visible but not yet fully opened</li>
                <li>Stems firm, caps moist but not slimy</li>
                <li>Before spores drop (dark spots on caps below)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Harvesting technique:</h3>
              <ol className="list-decimal ml-6 space-y-2">
                <li>Gently twist and pull mushrooms at base</li>
                <li>Avoid cutting - this can introduce contaminants</li>
                <li>Harvest entire clusters together</li>
                <li>Clean substrate surface of any debris</li>
              </ol>
            </div>
            <div>
              <strong>Yield expectations:</strong> 1-2 lbs per 3 lb colonized substrate over 2-3 flushes
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Common Issues and Solutions</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2 text-red-600 dark:text-red-400">Side Pinning</h3>
              <p className="mb-2"><strong>Cause:</strong> Lack of exposed top surface area</p>
              <p><strong>Solution:</strong> Ensure substrate surface is level and fully exposed. Mix substrate thoroughly before colonization.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-red-600 dark:text-red-400">Dry, Cracked Caps</h3>
              <p className="mb-2"><strong>Cause:</strong> Low humidity during fruiting</p>
              <p><strong>Solution:</strong> Maintain 85-95% RH. Use humidifier or wet perlite floor.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-red-600 dark:text-red-400">Fuzzy Feet (Mycelium Overgrowth)</h3>
              <p className="mb-2"><strong>Cause:</strong> Poor air exchange or high CO2</p>
              <p><strong>Solution:</strong> Increase fresh air exchange. Ensure proper ventilation in fruiting chamber.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-red-600 dark:text-red-400">Slow Colonization</h3>
              <p className="mb-2"><strong>Cause:</strong> Low temperature or poor spawn quality</p>
              <p><strong>Solution:</strong> Maintain 75-80°F. Use fresh, viable spawn from reputable sources.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Ecological Impact and Sustainability</h2>
          <p className="mb-4">
            Oyster mushroom cultivation offers multiple environmental benefits:
          </p>
          <ul className="list-disc ml-6 space-y-2">
            <li><strong>Waste reduction:</strong> Converts agricultural waste into food</li>
            <li><strong>Carbon sequestration:</strong> Mycelium binds carbon in biomass</li>
            <li><strong>Nutrient cycling:</strong> Makes minerals available to plants</li>
            <li><strong>Habitat support:</strong> Spores contribute to wild populations</li>
          </ul>
          <p>
            Choose local spawn varieties adapted to your climate for best results and ecological compatibility.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Next Steps</h2>

          <RelatedIssues
            related={[
              { title: "Lion's Mane Guide", href: "/growing-guides/lions-mane" },
              { title: "Reishi Guide", href: "/growing-guides/reishi" },
              { title: "Troubleshooting", href: "/troubleshooting" },
            ]}
          />
        </section>
      </div>
    </div>
  );
}