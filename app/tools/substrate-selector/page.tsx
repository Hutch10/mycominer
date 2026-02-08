import type { Metadata } from 'next';
import SectionHeader from "../../components/SectionHeader";

export const metadata: Metadata = {
  title: 'Substrate Selector - Match Substrate to Species',
  description: 'Interactive tool to find the best substrate for your mushroom species based on nutrition, availability, and performance.',
  keywords: ['substrate selector', 'substrate guide', 'mushroom substrate', 'substrate comparison', 'interactive tool', 'cultivation'],
  other: {
    tags: ['tools', 'substrate', 'selector', 'interactive', 'species', 'nutrition', 'decision-making'].join(','),
  },
};

export default function SubstrateSelectorPage() {
  const substrates = [
    {
      name: "Straw (Wheat/Oat/Rice)",
      type: "Cellulosic",
      species: ["Oyster", "Shiitake", "Lion's Mane"],
      preparation: "Chop, soak 24h, pasteurize",
      nutrients: "High cellulose, moderate lignin",
      availability: "Very High",
      cost: "Low",
      yield: "High",
      notes: "Excellent bulk substrate. Readily available from farms."
    },
    {
      name: "Hardwood Sawdust",
      type: "Lignin-Cellulosic",
      species: ["Shiitake", "Reishi", "Lion's Mane", "Turkey Tail"],
      preparation: "Supplement with bran, sterilize",
      nutrients: "High lignin, moderate cellulose",
      availability: "High",
      cost: "Medium",
      yield: "High",
      notes: "Premium substrate for hardwood species. Requires supplementation."
    },
    {
      name: "Coffee Grounds",
      type: "Organic Waste",
      species: ["Oyster", "Lion's Mane"],
      preparation: "Fresh or spent, pasteurize",
      nutrients: "High nitrogen, organic matter",
      availability: "High",
      cost: "Low",
      yield: "Medium",
      notes: "Sustainable waste product. Good for urban cultivation."
    },
    {
      name: "Cardboard",
      type: "Cellulosic",
      species: ["Oyster", "Shiitake"],
      preparation: "Shred, soak, pasteurize",
      nutrients: "High cellulose, low lignin",
      availability: "Very High",
      cost: "Very Low",
      yield: "Medium",
      notes: "Recycled material. Breaks down quickly."
    },
    {
      name: "Coco Coir",
      type: "Cellulosic",
      species: ["Oyster", "Lion's Mane", "Shiitake"],
      preparation: "Hydrate, pasteurize",
      nutrients: "Moderate cellulose, good water retention",
      availability: "High",
      cost: "Medium",
      yield: "High",
      notes: "Consistent quality. Good for bulk production."
    },
    {
      name: "Wood Chips",
      type: "Lignin-Cellulosic",
      species: ["Shiitake", "Reishi", "Turkey Tail"],
      preparation: "Age 6-12 months, pasteurize",
      nutrients: "High lignin, variable cellulose",
      availability: "High",
      cost: "Low",
      yield: "Medium",
      notes: "Outdoor cultivation. Requires aging for best results."
    },
    {
      name: "Manure (Horse/Goat)",
      type: "Organic",
      species: ["Oyster", "Shiitake"],
      preparation: "Age 2-4 weeks, pasteurize",
      nutrients: "High nitrogen, organic matter",
      availability: "Medium",
      cost: "Low",
      yield: "High",
      notes: "Nutrient-rich. Requires proper aging to avoid ammonia burn."
    },
    {
      name: "Rice/Wheat Bran",
      type: "Supplement",
      species: ["All hardwood species"],
      preparation: "Mix with sawdust (20-30%)",
      nutrients: "High nitrogen, minerals",
      availability: "High",
      cost: "Medium",
      yield: "High",
      notes: "Essential supplement for hardwood substrates."
    },
    {
      name: "Soy Hulls",
      type: "Supplement",
      species: ["Shiitake", "Reishi"],
      preparation: "Mix with sawdust (10-20%)",
      nutrients: "High nitrogen, minerals",
      availability: "Medium",
      cost: "Medium",
      yield: "High",
      notes: "Excellent nitrogen supplement. Improves colonization."
    },
    {
      name: "Gypsum",
      type: "Mineral Supplement",
      species: ["All species"],
      preparation: "Add 1-2% to substrate mix",
      nutrients: "Calcium, sulfur, pH buffer",
      availability: "High",
      cost: "Low",
      yield: "High",
      notes: "Prevents clumping, provides minerals. Essential for most mixes."
    }
  ];

  const speciesRequirements = [
    {
      species: "Oyster Mushrooms",
      preferred: ["Straw", "Coffee Grounds", "Cardboard", "Coco Coir"],
      acceptable: ["Hardwood Sawdust", "Manure"],
      avoid: ["Pure hardwood logs"],
      reasoning: "Cellulose-focused decomposers. Prefer fast-degrading substrates."
    },
    {
      species: "Shiitake",
      preferred: ["Hardwood Sawdust", "Wood Chips", "Straw"],
      acceptable: ["Coco Coir", "Manure"],
      avoid: ["Coffee Grounds"],
      reasoning: "Hardwood specialists. Need lignin-rich substrates for proper nutrition."
    },
    {
      species: "Lion's Mane",
      preferred: ["Hardwood Sawdust", "Straw", "Coco Coir"],
      acceptable: ["Coffee Grounds", "Cardboard"],
      avoid: ["Manure"],
      reasoning: "Hardwood adapted. Tolerates wide range but prefers supplemented hardwood."
    },
    {
      species: "Reishi",
      preferred: ["Hardwood Sawdust", "Wood Chips"],
      acceptable: ["Straw"],
      avoid: ["Coffee Grounds", "Manure"],
      reasoning: "Tree pathogen. Requires hardwood substrates with specific lignin content."
    },
    {
      species: "Turkey Tail",
      preferred: ["Hardwood Sawdust", "Wood Chips"],
      acceptable: ["Straw"],
      avoid: ["Coffee Grounds"],
      reasoning: "Wood decomposer. Prefers hardwood but adaptable to cellulose."
    }
  ];

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case "Very High": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "High": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "Medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "Low": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getCostColor = (cost: string) => {
    switch (cost) {
      case "Very Low": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "Low": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "Medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "High": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <div>
      <SectionHeader
        title="Substrate Selector"
        subtitle="Match substrates to species for optimal cultivation"
      />

      <div className="space-y-12 text-gray-800 dark:text-gray-200">
        <section>
          <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-gray-100">Understanding Substrate Selection</h2>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 space-y-3">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Substrate selection is one of the most critical decisions in mushroom cultivation. The right substrate provides the nutrients, structure, and environment that mushrooms need to thrive. Different species have evolved to decompose specific types of organic matter, and matching substrates to species requirements is essential for success.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Consider availability, cost, preparation time, and your cultivation goals when selecting substrates. Start with what's locally available and gradually experiment with more specialized materials.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-gray-100">Substrate Compatibility Matrix</h2>
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800">
                  <th className="border-b-2 border-gray-300 dark:border-gray-600 px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Substrate</th>
                  <th className="border-b-2 border-gray-300 dark:border-gray-600 px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Type</th>
                  <th className="border-b-2 border-gray-300 dark:border-gray-600 px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Compatible Species</th>
                  <th className="border-b-2 border-gray-300 dark:border-gray-600 px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Preparation</th>
                  <th className="border-b-2 border-gray-300 dark:border-gray-600 px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Availability</th>
                  <th className="border-b-2 border-gray-300 dark:border-gray-600 px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Cost</th>
                  <th className="border-b-2 border-gray-300 dark:border-gray-600 px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Yield</th>
                </tr>
              </thead>
              <tbody>
                {substrates.map((sub, index) => (
                  <tr 
                    key={index} 
                    className={`transition-colors duration-150 ${
                      index % 2 === 0 
                        ? "bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800" 
                        : "bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750"
                    }`}
                  >
                    <td className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                      {sub.name}
                    </td>
                    <td className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {sub.type}
                    </td>
                    <td className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {sub.species.join(", ")}
                    </td>
                    <td className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {sub.preparation}
                    </td>
                    <td className="border-t border-gray-200 dark:border-gray-700 px-4 py-3">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${getAvailabilityColor(sub.availability)}`}>
                        {sub.availability}
                      </span>
                    </td>
                    <td className="border-t border-gray-200 dark:border-gray-700 px-4 py-3">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${getCostColor(sub.cost)}`}>
                        {sub.cost}
                      </span>
                    </td>
                    <td className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {sub.yield}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-gray-100">Species-Specific Recommendations</h2>
          <div className="space-y-6">
            {speciesRequirements.map((req, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow duration-200">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-5">{req.species}</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800 transition-all duration-200 hover:shadow-md">
                    <h4 className="font-semibold text-green-800 dark:text-green-200 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Preferred Substrates
                    </h4>
                    <ul className="text-sm space-y-1 text-green-700 dark:text-green-300">
                      {req.preferred.map((sub, i) => (
                        <li key={i}>• {sub}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800 transition-all duration-200 hover:shadow-md">
                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      Acceptable Alternatives
                    </h4>
                    <ul className="text-sm space-y-1 text-yellow-700 dark:text-yellow-300">
                      {req.acceptable.map((sub, i) => (
                        <li key={i}>• {sub}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800 transition-all duration-200 hover:shadow-md">
                    <h4 className="font-semibold text-red-800 dark:text-red-200 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      Avoid These
                    </h4>
                    <ul className="text-sm space-y-1 text-red-700 dark:text-red-300">
                      {req.avoid.map((sub, i) => (
                        <li key={i}>• {sub}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Ecological Reasoning</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">{req.reasoning}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Substrate Preparation Methods</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Sterilization Methods</h3>
              <div className="space-y-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Pressure Cooking (Recommended)</h4>
                  <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                    <li>• 15 PSI for 90 minutes (quart jars)</li>
                    <li>• 15 PSI for 2.5 hours (larger volumes)</li>
                    <li>• Complete sterilization of all microbes</li>
                    <li>• Requires pressure cooker investment</li>
                  </ul>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Steam Pasteurization</h4>
                  <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                    <li>• 160-180°F for 1-2 hours</li>
                    <li>• Kills most competing organisms</li>
                    <li>• Preserves beneficial microbes</li>
                    <li>• Good for bulk substrates</li>
                  </ul>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Cold Water Extraction</h4>
                  <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                    <li>• Soak in cold water for 12-24 hours</li>
                    <li>• Removes water-soluble inhibitors</li>
                    <li>• Prepares substrate for colonization</li>
                    <li>• Essential for straw and cardboard</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Supplementation Strategies</h3>
              <div className="space-y-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Nitrogen Supplementation</h4>
                  <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                    <li>• Rice/wheat bran (20-30% of dry weight)</li>
                    <li>• Soy hulls (10-20% of dry weight)</li>
                    <li>• Essential for hardwood substrates</li>
                    <li>• Improves colonization speed and yield</li>
                  </ul>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Mineral Supplementation</h4>
                  <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                    <li>• Gypsum (1-2% of dry weight)</li>
                    <li>• Calcium carbonate for pH adjustment</li>
                    <li>• Prevents substrate clumping</li>
                    <li>• Provides essential minerals</li>
                  </ul>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">pH Optimization</h4>
                  <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                    <li>• Most species prefer pH 5.5-7.0</li>
                    <li>• Lime or calcium carbonate to raise pH</li>
                    <li>• Sulfur to lower pH if needed</li>
                    <li>• Test and adjust before sterilization</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Practical Substrate Recipes</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Oyster Mushroom Mix</h3>
              <div className="space-y-3">
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Ingredients (by dry weight)</h4>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    <li>• 80% Wheat straw (chopped)</li>
                    <li>• 20% Wheat bran</li>
                    <li>• 2% Gypsum</li>
                  </ul>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Preparation Steps</h4>
                  <ol className="text-sm text-gray-700 dark:text-gray-300 space-y-1 list-decimal list-inside">
                    <li>Chop straw into 1-3 inch pieces</li>
                    <li>Soak in cold water for 24 hours</li>
                    <li>Mix with bran and gypsum</li>
                    <li>Load into jars/bags and sterilize</li>
                  </ol>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-1">Expected Results</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">Fast colonization (10-14 days), high yields, good for beginners</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Shiitake Mushroom Mix</h3>
              <div className="space-y-3">
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Ingredients (by dry weight)</h4>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    <li>• 70% Hardwood sawdust</li>
                    <li>• 28% Wheat bran</li>
                    <li>• 2% Gypsum</li>
                  </ul>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Preparation Steps</h4>
                  <ol className="text-sm text-gray-700 dark:text-gray-300 space-y-1 list-decimal list-inside">
                    <li>Mix sawdust with bran and gypsum</li>
                    <li>Adjust moisture to field capacity</li>
                    <li>Load into jars/bags</li>
                    <li>Sterilize at 15 PSI for 90 minutes</li>
                  </ol>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-1">Expected Results</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">Reliable colonization (14-21 days), excellent flavor, commercial quality</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Reishi Mushroom Mix</h3>
              <div className="space-y-3">
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Ingredients (by dry weight)</h4>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    <li>• 75% Hardwood sawdust</li>
                    <li>• 20% Soy hulls</li>
                    <li>• 3% Wheat bran</li>
                    <li>• 2% Gypsum</li>
                  </ul>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Preparation Steps</h4>
                  <ol className="text-sm text-gray-700 dark:text-gray-300 space-y-1 list-decimal list-inside">
                    <li>Mix all dry ingredients thoroughly</li>
                    <li>Add water to achieve proper moisture</li>
                    <li>Load into jars with filter patches</li>
                    <li>Sterilize and allow to cool slowly</li>
                  </ol>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-1">Expected Results</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">Slow but reliable colonization (21-35 days), potent medicinal compounds</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Coffee Ground Mix</h3>
              <div className="space-y-3">
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Ingredients (by volume)</h4>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    <li>• 50% Spent coffee grounds</li>
                    <li>• 40% Coco coir (hydrated)</li>
                    <li>• 10% Vermiculite</li>
                  </ul>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Preparation Steps</h4>
                  <ol className="text-sm text-gray-700 dark:text-gray-300 space-y-1 list-decimal list-inside">
                    <li>Hydrate coco coir and mix with coffee</li>
                    <li>Add vermiculite for aeration</li>
                    <li>Pasteurize at 160°F for 1 hour</li>
                    <li>Cool before inoculation</li>
                  </ol>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-1">Expected Results</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">Urban-friendly, fast colonization (7-14 days), good for oyster mushrooms</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Sourcing and Sustainability</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-4">Sustainable Sources</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-green-700 dark:text-green-300 mb-1">Agricultural Waste</h4>
                  <ul className="text-sm text-green-600 dark:text-green-400 space-y-1">
                    <li>• Straw from grain farming</li>
                    <li>• Sawdust from sustainable logging</li>
                    <li>• Coffee grounds from cafes</li>
                    <li>• Cardboard from recycling centers</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-green-700 dark:text-green-300 mb-1">Local Partnerships</h4>
                  <ul className="text-sm text-green-600 dark:text-green-400 space-y-1">
                    <li>• Horse stables for manure</li>
                    <li>• Sawmills for wood chips</li>
                    <li>• Farms for straw and hay</li>
                    <li>• Breweries for spent grain</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4">Quality Considerations</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-1">Freshness Matters</h4>
                  <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
                    <li>• Use materials within 1-2 weeks</li>
                    <li>• Avoid moldy or degraded substrates</li>
                    <li>• Test moisture content</li>
                    <li>• Check for chemical contaminants</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-1">Storage Guidelines</h4>
                  <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
                    <li>• Store dry materials in cool, dry place</li>
                    <li>• Keep hydrated substrates refrigerated</li>
                    <li>• Use within 1 week of preparation</li>
                    <li>• Label and date all materials</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Next Steps</h2>
          <p className="mb-4">
            Use this substrate selector to match materials to your chosen species. Start with locally available substrates and gradually experiment with more specialized mixes as you gain experience.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a href="/tools/species-comparison-matrix" className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
              <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Species Matrix</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">Compare species requirements</p>
            </a>
            <a href="/foundations/substrates" className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
              <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">Substrate Science</h3>
              <p className="text-sm text-green-700 dark:text-green-300">Learn substrate biology</p>
            </a>
            <a href="/tools/troubleshooting-decision-tree" className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
              <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">Troubleshooting</h3>
              <p className="text-sm text-purple-700 dark:text-purple-300">Solve substrate problems</p>
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}