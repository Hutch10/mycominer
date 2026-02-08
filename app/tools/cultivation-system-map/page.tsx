import type { Metadata } from 'next';
import SectionHeader from "../../components/SectionHeader";

export const metadata: Metadata = {
  title: 'Cultivation System Map - Interactive Systems Tool',
  description: 'Visual tool for understanding how environmental, biological, and methodological factors interact in mushroom cultivation systems.',
  keywords: ['systems map', 'cultivation tool', 'interactive diagram', 'systems thinking', 'cultivation factors'],
  other: {
    tags: ['tools', 'systems-map', 'interactive', 'visualization', 'education'].join(','),
  },
};

export default function CultivationSystemMapPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <SectionHeader
        title="Cultivation System Map"
        subtitle="Understanding the interconnected relationships in mushroom cultivation"
      />

      <div className="space-y-8 text-gray-800 dark:text-gray-200">
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Ecological Systems Thinking</h2>
          <p className="mb-4">
            Mushroom cultivation isn't just a series of steps—it's a living ecosystem where every element influences others. Understanding these relationships allows you to predict outcomes, prevent problems, and optimize your growing environment. This system map reveals the hidden connections that experienced cultivators intuitively understand.
          </p>
          <p>
            Think of your cultivation setup as a forest ecosystem in miniature. Just as trees, soil microbes, weather, and wildlife interact in complex ways, your jars, substrates, temperature, and microbes create their own ecological web. When one element changes, the entire system responds.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Core System Components</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center mb-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400">Species Biology</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Each mushroom species carries millions of years of evolutionary adaptation. Their growth patterns, environmental preferences, and ecological roles determine how they'll behave in your cultivation system.
              </p>
              <div className="space-y-2">
                <div className="text-xs bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
                  <strong>Evolutionary history</strong> shapes requirements
                </div>
                <div className="text-xs bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
                  <strong>Ecological niche</strong> determines substrate preferences
                </div>
                <div className="text-xs bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
                  <strong>Life cycle timing</strong> affects growth phases
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center mb-3">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <h3 className="text-lg font-semibold text-green-600 dark:text-green-400">Substrate Ecology</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Your substrate isn't just food—it's a living community of microorganisms, nutrients, and structural elements that create the habitat where mycelium will grow and fruit.
              </p>
              <div className="space-y-2">
                <div className="text-xs bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">
                  <strong>Nutrient composition</strong> affects growth speed
                </div>
                <div className="text-xs bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">
                  <strong>Microbial communities</strong> influence colonization
                </div>
                <div className="text-xs bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">
                  <strong>Physical structure</strong> determines gas exchange
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center mb-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                <h3 className="text-lg font-semibold text-purple-600 dark:text-purple-400">Environmental Parameters</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Temperature, humidity, light, and air quality aren't just conditions—they're signals that tell your mycelium when to grow, when to rest, and when to fruit.
              </p>
              <div className="space-y-2">
                <div className="text-xs bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded">
                  <strong>Temperature gradients</strong> trigger phase changes
                </div>
                <div className="text-xs bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded">
                  <strong>Humidity levels</strong> control evaporation rates
                </div>
                <div className="text-xs bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded">
                  <strong>CO2 concentrations</strong> regulate respiration
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center mb-3">
                <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                <h3 className="text-lg font-semibold text-orange-600 dark:text-orange-400">Microbial Interactions</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Your cultivation system hosts an invisible ecosystem of bacteria, yeasts, molds, and other fungi. Some help mycelial growth, others compete for resources.
              </p>
              <div className="space-y-2">
                <div className="text-xs bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded">
                  <strong>Beneficial microbes</strong> enhance nutrient availability
                </div>
                <div className="text-xs bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded">
                  <strong>Competitive exclusion</strong> prevents contamination
                </div>
                <div className="text-xs bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded">
                  <strong>Symbiotic relationships</strong> improve yields
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center mb-3">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">Contamination Vectors</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Contamination doesn't happen randomly—it follows predictable pathways. Understanding these vectors helps you build more resilient cultivation systems.
              </p>
              <div className="space-y-2">
                <div className="text-xs bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">
                  <strong>Airborne spores</strong> enter through openings
                </div>
                <div className="text-xs bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">
                  <strong>Surface contamination</strong> transfers during handling
                </div>
                <div className="text-xs bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">
                  <strong>Substrate-borne</strong> introduced with spawn
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center mb-3">
                <div className="w-3 h-3 bg-teal-500 rounded-full mr-3"></div>
                <h3 className="text-lg font-semibold text-teal-600 dark:text-teal-400">Growth Phase Dynamics</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Mushroom development follows distinct phases, each with different requirements and vulnerabilities. What works for one phase may harm another.
              </p>
              <div className="space-y-2">
                <div className="text-xs bg-teal-50 dark:bg-teal-900/20 px-2 py-1 rounded">
                  <strong>Inoculation phase</strong> requires sterility
                </div>
                <div className="text-xs bg-teal-50 dark:bg-teal-900/20 px-2 py-1 rounded">
                  <strong>Colonization phase</strong> needs stable conditions
                </div>
                <div className="text-xs bg-teal-50 dark:bg-teal-900/20 px-2 py-1 rounded">
                  <strong>Fruiting phase</strong> demands environmental triggers
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Key Interrelationships</h2>
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                Species Biology ↔ Substrate Ecology
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Each mushroom species has co-evolved with specific substrates in nature. This relationship determines colonization speed, yield potential, and fruiting behavior. Choosing the wrong substrate creates immediate stress that ripples through your entire system.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded border">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Ecological Matching</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Wood decomposers prefer hardwood substrates</li>
                    <li>• Grassland species thrive on straw</li>
                    <li>• Dung specialists need specific nutrients</li>
                    <li>• Medicinal species often prefer supplemented wood</li>
                  </ul>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded border">
                  <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">System Implications</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Poor matches slow colonization</li>
                    <li>• Nutritional deficiencies cause weak mycelium</li>
                    <li>• Wrong pH creates microbial imbalances</li>
                    <li>• Structural mismatches affect gas exchange</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-teal-50 dark:from-purple-900/20 dark:to-teal-900/20 p-6 rounded-lg border border-purple-200 dark:border-purple-800">
              <h3 className="text-xl font-semibold text-purple-900 dark:text-purple-100 mb-3 flex items-center">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                Environmental Parameters ↔ Growth Phase Dynamics
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Different growth phases require different environmental signals. What promotes vigorous mycelial growth may completely suppress fruiting. Understanding these phase-specific requirements prevents common mistakes.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded border">
                  <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">Inoculation</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Warm temperatures (75-81°F)</li>
                    <li>• High humidity</li>
                    <li>• Darkness</li>
                    <li>• Sterile conditions</li>
                  </ul>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded border">
                  <h4 className="font-semibold text-teal-800 dark:text-teal-200 mb-2">Colonization</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Species-specific temperature</li>
                    <li>• Moderate humidity</li>
                    <li>• Fresh air exchange</li>
                    <li>• Stable conditions</li>
                  </ul>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded border">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Fruiting</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Temperature drop</li>
                    <li>• High humidity</li>
                    <li>• Light exposure</li>
                    <li>• CO2 reduction</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-6 rounded-lg border border-orange-200 dark:border-orange-800">
              <h3 className="text-xl font-semibold text-orange-900 dark:text-orange-100 mb-3 flex items-center">
                <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                Microbial Interactions ↔ Contamination Vectors
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Your substrate and environment naturally contain microorganisms. The balance between beneficial microbes and pathogens determines cultivation success. Understanding microbial ecology helps you create resilient systems.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded border">
                  <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">Beneficial Microbes</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Break down complex nutrients</li>
                    <li>• Produce growth factors</li>
                    <li>• Compete with pathogens</li>
                    <li>• Create symbiotic relationships</li>
                  </ul>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded border">
                  <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">Contamination Pathways</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Airborne spores during inoculation</li>
                    <li>• Surface transfer during handling</li>
                    <li>• Substrate contamination</li>
                    <li>• Equipment residues</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Feedback Loops and Emergent Properties</h2>
          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Positive Feedback Loops</h3>
              <div className="space-y-4">
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold text-green-800 dark:text-green-200">Mycelial Growth Acceleration</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    As mycelium colonizes substrate, it releases enzymes that break down nutrients, creating more available food. This creates a positive feedback loop where growth begets more growth, explaining why colonization often accelerates over time.
                  </p>
                </div>
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200">Humidity Regulation</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Mycelium maintains its own microclimate by regulating moisture. As it grows, it creates a humid boundary layer that protects against drying while preventing excessive moisture that could promote contamination.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Negative Feedback Loops</h3>
              <div className="space-y-4">
                <div className="border-l-4 border-red-500 pl-4">
                  <h4 className="font-semibold text-red-800 dark:text-red-200">Resource Competition</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    As mycelium consumes available nutrients, growth naturally slows. This prevents runaway expansion and ensures resources are used efficiently for fruiting rather than endless vegetative growth.
                  </p>
                </div>
                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-semibold text-purple-800 dark:text-purple-200">CO2 Accumulation</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Mycelial respiration produces CO2, which eventually signals the need for fruiting. High CO2 levels create a negative feedback loop that triggers the transition from vegetative to reproductive growth.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Practical System Optimization</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">System Design Principles</h3>
              <div className="space-y-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">Balance Competing Demands</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Different system components often have opposing requirements. Find the sweet spot where mycelial growth, contamination resistance, and fruiting potential are all optimized.
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold text-green-600 dark:text-green-400 mb-2">Build Redundancy</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Create multiple pathways for success. If one environmental parameter fluctuates, others can compensate. This creates resilient systems that handle variation gracefully.
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold text-purple-600 dark:text-purple-400 mb-2">Monitor Feedback Signals</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Pay attention to how your system responds to changes. Mycelial appearance, growth rate, and environmental readings provide valuable feedback about system health.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Common System Imbalances</h3>
              <div className="space-y-4">
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                  <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">Over-sterilization</h4>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    Removing beneficial microbes creates sterile deserts where mycelium struggles to establish. Balance sterility with ecological diversity.
                  </p>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Environmental Stasis</h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Perfectly stable conditions prevent phase transitions. Mycelium needs environmental triggers to know when to fruit.
                  </p>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                  <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">Scale Too Quickly</h4>
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    Small systems are forgiving of mistakes. Large systems amplify errors. Master small-scale cultivation before expanding.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Systems Thinking in Practice</h2>
          <div className="bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 p-8 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="max-w-4xl mx-auto text-center">
              <h3 className="text-2xl font-semibold text-blue-900 dark:text-blue-100 mb-6">
                The Art of Cultivation is Systems Management
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">See the Whole</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Don't focus on individual symptoms. Understand how everything connects. A slow colonization might indicate substrate issues, environmental problems, or microbial imbalances.
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
                  <h4 className="font-semibold text-green-800 dark:text-green-200 mb-3">Think in Relationships</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Every change affects multiple parts of your system. Adjusting temperature influences humidity, gas exchange, and microbial activity simultaneously.
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
                  <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-3">Adapt Continuously</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Successful cultivation requires ongoing observation and adjustment. What worked last time might need modification based on current conditions and species.
                  </p>
                </div>
              </div>
              <p className="mt-6 text-gray-700 dark:text-gray-300 italic">
                "The mycelium doesn't grow in straight lines—it explores, adapts, and finds the path of least resistance. Your cultivation system should do the same."
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Next Steps</h2>
          <p className="mb-4">
            Understanding your cultivation system as an interconnected web changes how you approach problems and opportunities. Use this knowledge to design more resilient growing environments.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a href="/tools/troubleshooting-decision-tree" className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
              <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Troubleshooting Tree</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">Apply systems thinking to diagnose problems</p>
            </a>
            <a href="/tools/species-comparison-matrix" className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
              <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">Species Matrix</h3>
              <p className="text-sm text-green-700 dark:text-green-300">Compare species requirements and behaviors</p>
            </a>
            <a href="/tools/substrate-selector" className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
              <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">Substrate Selector</h3>
              <p className="text-sm text-purple-700 dark:text-purple-300">Match substrates to species and goals</p>
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}