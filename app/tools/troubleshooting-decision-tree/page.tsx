import type { Metadata } from 'next';
import SectionHeader from "../../components/SectionHeader";

export const metadata: Metadata = {
  title: 'Troubleshooting Decision Tree - Diagnose Problems',
  description: 'Interactive decision tree to diagnose cultivation problems through systematic symptom analysis and environmental factors.',
  keywords: ['troubleshooting tree', 'problem diagnosis', 'decision tree', 'symptom analysis', 'cultivation problems', 'interactive tool'],
  other: {
    tags: ['tools', 'troubleshooting', 'decision-tree', 'interactive', 'diagnosis', 'symptoms', 'problem-solving'].join(','),
  },
};

export default function TroubleshootingDecisionTreePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <SectionHeader
        title="Troubleshooting Decision Tree"
        subtitle="A systematic approach to diagnosing cultivation issues"
      />

      <div className="space-y-8 text-gray-800 dark:text-gray-200">
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Why Systems Thinking Matters</h2>
          <p className="mb-4">
            Most cultivation problems aren't caused by single factors—they emerge from imbalances in your system's interconnected relationships. Randomly changing variables (temperature, humidity, substrate) often creates new problems while solving old ones. This decision tree helps you trace symptoms back to root causes.
          </p>
          <p>
            Think of troubleshooting like detective work in a forest ecosystem. A wilting tree might seem like a water problem, but could actually result from soil microbes, root competition, or atmospheric conditions. Similarly, slow colonization might indicate substrate issues, environmental stress, or microbial competition.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Step 1: Define the Problem Clearly</h2>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">What exactly is happening?</h3>
                <p className="text-blue-800 dark:text-blue-200 mb-3">
                  Describe symptoms without interpretation. "Mycelium is growing slowly" is better than "Something is wrong with my setup."
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-gray-800 p-4 rounded border">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Observable Symptoms</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Growth rate (fast/slow/stopped)</li>
                      <li>• Mycelium appearance (white/thin/discolored)</li>
                      <li>• Odor (fresh/earthy/sour/ammonia)</li>
                      <li>• Contamination type and location</li>
                      <li>• Environmental readings</li>
                    </ul>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded border">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Quantifiable Data</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Days since inoculation</li>
                      <li>• Colonization percentage</li>
                      <li>• Temperature/humidity readings</li>
                      <li>• Number of affected jars</li>
                      <li>• Changes from previous grows</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Step 2: Categorize by Growth Phase</h2>
          <div className="space-y-6">
            <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
              <h3 className="text-xl font-semibold text-green-900 dark:text-green-100 mb-4">Inoculation Phase (0-48 hours)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">Common Issues</h4>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>No germination after 2 weeks</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>Contamination within 48 hours</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>Slow initial growth</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">Primary Causes</h4>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>Sterility technique issues</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>Substrate contamination</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>Spawn viability problems</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded border">
                <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">Diagnostic Questions</h4>
                <ul className="text-sm space-y-1">
                  <li>• Did you maintain sterility during inoculation?</li>
                  <li>• Was your substrate properly pasteurized/sterilized?</li>
                  <li>• Is your spawn fresh and actively growing?</li>
                  <li>• Are environmental conditions appropriate for the species?</li>
                </ul>
              </div>
            </div>

            <div className="bg-teal-50 dark:bg-teal-900/20 p-6 rounded-lg border border-teal-200 dark:border-teal-800">
              <h3 className="text-xl font-semibold text-teal-900 dark:text-teal-100 mb-4">Colonization Phase (2 days - 4 weeks)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-teal-800 dark:text-teal-200 mb-2">Common Issues</h4>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>Stalled colonization</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>Slow colonization (&lt;1cm/day)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>Uneven growth patterns</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>Mycelium discoloration</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-teal-800 dark:text-teal-200 mb-2">Primary Causes</h4>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>Environmental parameters off</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>Substrate quality issues</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>Microbial competition</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>Species-substrate mismatch</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded border">
                <h4 className="font-semibold text-teal-800 dark:text-teal-200 mb-2">Diagnostic Questions</h4>
                <ul className="text-sm space-y-1">
                  <li>• Is temperature within species range?</li>
                  <li>• Is substrate moisture content correct?</li>
                  <li>• Are there signs of contamination?</li>
                  <li>• Does the substrate match species preferences?</li>
                  <li>• Is fresh air exchange adequate?</li>
                </ul>
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg border border-purple-200 dark:border-purple-800">
              <h3 className="text-xl font-semibold text-purple-900 dark:text-purple-100 mb-4">Fruiting Phase (2-8 weeks)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">Common Issues</h4>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>No pins after full colonization</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>Aborted pins</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>Small or deformed fruits</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>Overlay or poor yields</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">Primary Causes</h4>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>Missing fruiting triggers</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>Environmental shock</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>Insufficient consolidation</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>Light/CO2 imbalances</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded border">
                <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">Diagnostic Questions</h4>
                <ul className="text-sm space-y-1">
                  <li>• Did you provide fruiting triggers (temp drop, light, FAE)?</li>
                  <li>• Is humidity high enough (85-95%)?</li>
                  <li>• Is CO2 concentration low enough?</li>
                  <li>• Did mycelium fully consolidate before fruiting?</li>
                  <li>• Are light levels and spectrum appropriate?</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Step 3: Environmental Assessment</h2>
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Critical Parameters</h3>
                <div className="space-y-4">
                  <div className="bg-white dark:bg-gray-700 p-4 rounded border">
                    <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">Temperature</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Species-specific ranges vary widely</li>
                      <li>• Colonization: often warmer than fruiting</li>
                      <li>• Fluctuations can stress mycelium</li>
                      <li>• Check multiple points in your setup</li>
                    </ul>
                  </div>
                  <div className="bg-white dark:bg-gray-700 p-4 rounded border">
                    <h4 className="font-semibold text-green-600 dark:text-green-400 mb-2">Humidity</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Colonization: 80-90% (not too wet)</li>
                      <li>• Fruiting: 85-95% (higher)</li>
                      <li>• Surface vs. ambient readings differ</li>
                      <li>• Dry air causes aborted pins</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Air Quality Factors</h3>
                <div className="space-y-4">
                  <div className="bg-white dark:bg-gray-700 p-4 rounded border">
                    <h4 className="font-semibold text-purple-600 dark:text-purple-400 mb-2">CO2 Levels</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Colonization: High CO2 okay</li>
                      <li>• Fruiting: CO2 &lt; 1000 ppm needed</li>
                      <li>• Poor FAE causes stalling</li>
                      <li>• Too much FAE dries substrate</li>
                    </ul>
                  </div>
                  <div className="bg-white dark:bg-gray-700 p-4 rounded border">
                    <h4 className="font-semibold text-orange-600 dark:text-orange-400 mb-2">Contamination Sources</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Airborne spores from environment</li>
                      <li>• Equipment residues</li>
                      <li>• Substrate contamination</li>
                      <li>• Personal hygiene issues</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Step 4: Substrate and Spawn Analysis</h2>
          <div className="space-y-6">
            <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-lg border border-amber-200 dark:border-amber-800">
              <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100 mb-4">Substrate Issues</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">Physical Problems</h4>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>Too dry - colonization stalls</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>Too wet - anaerobic bacteria</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>Poor structure - uneven growth</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>Wrong pH - nutrient lockout</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">Biological Problems</h4>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>Inadequate sterilization</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>Species-substrate mismatch</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>Nutrient deficiencies</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>Over-supplementation</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-lime-50 dark:bg-lime-900/20 p-6 rounded-lg border border-lime-200 dark:border-lime-800">
              <h3 className="text-lg font-semibold text-lime-900 dark:text-lime-100 mb-4">Spawn Quality Issues</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-lime-800 dark:text-lime-200 mb-2">Viability Problems</h4>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>Old or improperly stored spawn</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>Contaminated spawn bags</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>Low inoculation rate</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-lime-800 dark:text-lime-200 mb-2">Compatibility Issues</h4>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>Wrong grain type for species</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>Spawn:substrate ratio issues</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>Genetic strain mismatches</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Step 5: Microbial Assessment</h2>
          <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border border-red-200 dark:border-red-800">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-4">Contamination Identification</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white dark:bg-gray-800 p-4 rounded border">
                    <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">Bacterial Contamination</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Slimy substrate</li>
                      <li>• Sour/ammonia odor</li>
                      <li>• Yellow/brown discoloration</li>
                      <li>• Slow colonization</li>
                    </ul>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded border">
                    <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">Mold Contamination</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Fuzzy growth</li>
                      <li>• Green/blue/black spots</li>
                      <li>• Musty odor</li>
                      <li>• Rapid spreading</li>
                    </ul>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded border">
                    <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">Yeast Contamination</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Alcohol odor</li>
                      <li>• Wet substrate</li>
                      <li>• No mycelial growth</li>
                      <li>• Foamy appearance</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-4">Contamination Entry Points</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">During Inoculation</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Unsterilized equipment</li>
                      <li>• Poor glove technique</li>
                      <li>• Contaminated work area</li>
                      <li>• Airborne spores</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">During Colonization</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Inadequate FAE filters</li>
                      <li>• Temperature fluctuations</li>
                      <li>• Substrate contamination</li>
                      <li>• Weak mycelium</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Step 6: Implement Targeted Solutions</h2>
          <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-4">Solution Hierarchy</h3>
                <div className="space-y-4">
                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-semibold text-green-800 dark:text-green-200">Prevention First</h4>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Address root causes rather than symptoms. Improving your sterile technique prevents future contamination better than treating current infections.
                    </p>
                  </div>
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200">Targeted Adjustments</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Make one change at a time and observe results. Randomly adjusting temperature, humidity, and substrate won't solve systemic problems.
                    </p>
                  </div>
                  <div className="border-l-4 border-purple-500 pl-4">
                    <h4 className="font-semibold text-purple-800 dark:text-purple-200">Scale Gradually</h4>
                    <p className="text-sm text-purple-700 dark:text-purple-300">
                      Test solutions on small batches first. What works in one jar might not scale to your entire operation.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-4">Common Solution Patterns</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-gray-800 p-4 rounded border">
                    <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">Environmental Corrections</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Adjust temperature gradually (±2°F/day)</li>
                      <li>• Increase humidity for fruiting</li>
                      <li>• Improve fresh air exchange</li>
                      <li>• Add light for pinning triggers</li>
                    </ul>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded border">
                    <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">Technique Improvements</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Enhance sterilization protocols</li>
                      <li>• Improve inoculation technique</li>
                      <li>• Better substrate preparation</li>
                      <li>• More consistent monitoring</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Step 7: Document and Learn</h2>
          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-lg border border-indigo-200 dark:border-indigo-800">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100 mb-3">Why Documentation Matters</h3>
                <p className="text-indigo-800 dark:text-indigo-200 mb-4">
                  Every troubleshooting experience teaches you about your system. Without documentation, you repeat the same mistakes. With good records, you build expertise and prevent future problems.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-indigo-800 dark:text-indigo-200 mb-2">Track These Variables</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Species and strain</li>
                    <li>• Substrate recipe and preparation</li>
                    <li>• Environmental conditions</li>
                    <li>• Spawn source and quality</li>
                    <li>• Timeline of events</li>
                    <li>• Problems encountered</li>
                    <li>• Solutions attempted</li>
                    <li>• Final outcomes</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-indigo-800 dark:text-indigo-200 mb-2">Learning Framework</h4>
                  <ul className="text-sm space-y-1">
                    <li>• What worked well?</li>
                    <li>• What could be improved?</li>
                    <li>• What surprised you?</li>
                    <li>• How does this inform future grows?</li>
                    <li>• What questions does this raise?</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">When to Seek Help</h2>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="space-y-4">
              <p className="text-yellow-800 dark:text-yellow-200">
                Some problems indicate deeper systemic issues that require external expertise. Don't waste time and resources on unsolvable problems.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Red Flags</h4>
                  <ul className="text-sm space-y-1">
                    <li>• 100% contamination rate</li>
                    <li>• Same problem across species</li>
                    <li>• Equipment consistently failing</li>
                    <li>• Health/safety concerns</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Help Resources</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Local mycological societies</li>
                    <li>• Online cultivation forums</li>
                    <li>• Professional consultants</li>
                    <li>• Scientific literature</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Next Steps</h2>
          <p className="mb-4">
            This decision tree provides a framework, not rigid rules. Use it as a starting point for systematic problem-solving, then adapt based on your specific situation and observations.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a href="/tools/cultivation-system-map" className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
              <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">System Map</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">Understand system relationships</p>
            </a>
            <a href="/tools/species-comparison-matrix" className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
              <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">Species Matrix</h3>
              <p className="text-sm text-green-700 dark:text-green-300">Compare species requirements</p>
            </a>
            <a href="/tools/substrate-selector" className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
              <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">Substrate Selector</h3>
              <p className="text-sm text-purple-700 dark:text-purple-300">Match substrates to goals</p>
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
