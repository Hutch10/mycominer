import type { Metadata } from 'next';
import SectionHeader from "../../components/SectionHeader";

export const metadata: Metadata = {
  title: 'Species Comparison Matrix - Choose Your Mushroom',
  description: 'Compare mushroom species side-by-side: difficulty, substrates, temperature, colonization time, yields, and characteristics.',
  keywords: ['species comparison', 'mushroom comparison', 'species matrix', 'cultivation difficulty', 'substrate comparison', 'interactive tool'],
  other: {
    tags: ['tools', 'comparison', 'species', 'matrix', 'interactive', 'decision-making', 'selection'].join(','),
  },
};

export default function SpeciesComparisonMatrixPage() {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "Intermediate": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "Advanced": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getYieldColor = (yield_: string) => {
    switch (yield_) {
      case "Very High": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "High": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "Moderate": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "Low": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "Very Low": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getMedicinalColor = (medicinal: string) => {
    switch (medicinal) {
      case "Very High": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "High": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "Moderate": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "Low": return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const species = [
    {
      name: "Oyster (Pleurotus ostreatus)",
      difficulty: "Beginner",
      substrate: "Straw, sawdust, coffee grounds",
      temperature: "55-75°F (13-24°C)",
      humidity: "85-95%",
      colonization: "14-21 days",
      fruiting: "7-14 days",
      yield: "High",
      medicinal: "Moderate",
      ecology: "Wood decomposer, adaptable",
      notes: "Fast-growing, good for beginners. Tolerates wide temperature range."
    },
    {
      name: "Lion's Mane (Hericium erinaceus)",
      difficulty: "Intermediate",
      substrate: "Hardwood sawdust, logs",
      temperature: "65-75°F (18-24°C)",
      humidity: "85-95%",
      colonization: "14-21 days",
      fruiting: "7-14 days",
      yield: "Moderate",
      medicinal: "High",
      ecology: "Hardwood specialist, medicinal",
      notes: "Unique appearance, cognitive benefits. Requires hardwood substrate."
    },
    {
      name: "Reishi (Ganoderma lucidum)",
      difficulty: "Advanced",
      substrate: "Hardwood logs, supplemented sawdust",
      temperature: "70-80°F (21-27°C)",
      humidity: "85-95%",
      colonization: "21-35 days",
      fruiting: "30-60 days",
      yield: "Low",
      medicinal: "Very High",
      ecology: "Tree pathogen, medicinal",
      notes: "Slow-growing, potent medicine. Difficult fruiting triggers."
    },
    {
      name: "Shiitake (Lentinula edodes)",
      difficulty: "Intermediate",
      substrate: "Hardwood logs, supplemented sawdust",
      temperature: "60-75°F (16-24°C)",
      humidity: "85-95%",
      colonization: "21-35 days",
      fruiting: "7-14 days",
      yield: "High",
      medicinal: "High",
      ecology: "Hardwood decomposer, culinary",
      notes: "Commercial production species. Good for log cultivation."
    },
    {
      name: "Turkey Tail (Trametes versicolor)",
      difficulty: "Intermediate",
      substrate: "Hardwood logs, supplemented sawdust",
      temperature: "65-75°F (18-24°C)",
      humidity: "85-95%",
      colonization: "21-35 days",
      fruiting: "14-21 days",
      yield: "Moderate",
      medicinal: "Very High",
      ecology: "Wood decomposer, medicinal",
      notes: "Immune system support. Grows on wide range of hardwoods."
    },
    {
      name: "Chaga (Inonotus obliquus)",
      difficulty: "Advanced",
      substrate: "Birch logs (living trees)",
      temperature: "60-70°F (16-21°C)",
      humidity: "80-90%",
      colonization: "6-12 months",
      fruiting: "Rare",
      yield: "Very Low",
      medicinal: "Very High",
      ecology: "Tree parasite, medicinal",
      notes: "Grows on living birch trees. Long cultivation time."
    },
    {
      name: "Maitake (Grifola frondosa)",
      difficulty: "Advanced",
      substrate: "Hardwood logs, supplemented sawdust",
      temperature: "55-65°F (13-18°C)",
      humidity: "85-95%",
      colonization: "21-35 days",
      fruiting: "14-21 days",
      yield: "High",
      medicinal: "High",
      ecology: "Hardwood decomposer, medicinal",
      notes: "Large fruiting bodies. Requires specific temperature drop."
    },
    {
      name: "Cordyceps (Cordyceps militaris)",
      difficulty: "Advanced",
      substrate: "Rice, supplemented grain",
      temperature: "75-85°F (24-29°C)",
      humidity: "90-95%",
      colonization: "14-21 days",
      fruiting: "10-14 days",
      yield: "Moderate",
      medicinal: "High",
      ecology: "Insect parasite, medicinal",
      notes: "Energy and performance enhancement. Requires high temperature."
    },
    {
      name: "Enoki (Flammulina velutipes)",
      difficulty: "Intermediate",
      substrate: "Hardwood sawdust, supplemented",
      temperature: "55-65°F (13-18°C)",
      humidity: "85-95%",
      colonization: "14-21 days",
      fruiting: "7-14 days",
      yield: "High",
      medicinal: "Moderate",
      ecology: "Wood decomposer, culinary",
      notes: "Long stems, cold weather species. Good for commercial production."
    },
    {
      name: "Chestnut (Pholiota adiposa)",
      difficulty: "Intermediate",
      substrate: "Hardwood logs, supplemented sawdust",
      temperature: "60-70°F (16-21°C)",
      humidity: "85-95%",
      colonization: "21-35 days",
      fruiting: "7-14 days",
      yield: "Moderate",
      medicinal: "Moderate",
      ecology: "Hardwood decomposer, culinary",
      notes: "Rich flavor, good for gourmet markets. Prefers cooler temperatures."
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <SectionHeader
        title="Species Comparison Matrix"
        subtitle="Compare mushroom species requirements and characteristics"
      />

      <div className="space-y-8 text-gray-800 dark:text-gray-200">
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Understanding Species Selection</h2>
          <p className="mb-4">
            Choosing the right mushroom species is the foundation of successful cultivation. Each species has unique ecological requirements, growth patterns, and cultivation challenges. This matrix helps you compare species based on your goals, resources, and experience level.
          </p>
          <p>
            Remember that these are generalizations—individual strains within species can vary significantly. Start with species that match your available resources and gradually expand as you gain experience.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Species Comparison Table</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800">
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Species</th>
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Difficulty</th>
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Substrate</th>
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Temperature</th>
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Humidity</th>
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Colonization</th>
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Fruiting</th>
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Yield</th>
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Medicinal</th>
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Ecology</th>
                </tr>
              </thead>
              <tbody>
                {species.map((spec, index) => (
                  <tr key={index} className={index % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-800"}>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                      {spec.name}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(spec.difficulty)}`}>
                        {spec.difficulty}
                      </span>
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {spec.substrate}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {spec.temperature}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {spec.humidity}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {spec.colonization}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {spec.fruiting}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getYieldColor(spec.yield)}`}>
                        {spec.yield}
                      </span>
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMedicinalColor(spec.medicinal)}`}>
                        {spec.medicinal}
                      </span>
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {spec.ecology}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Detailed Species Profiles</h2>
          <div className="space-y-6">
            {species.map((spec, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex flex-wrap items-start justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">{spec.name}</h3>
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(spec.difficulty)}`}>
                      {spec.difficulty}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getYieldColor(spec.yield)}`}>
                      {spec.yield} Yield
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getMedicinalColor(spec.medicinal)}`}>
                      {spec.medicinal} Medicinal
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Substrate</h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{spec.substrate}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Temperature</h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{spec.temperature}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Colonization</h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{spec.colonization}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Fruiting</h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{spec.fruiting}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Ecological Context</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{spec.ecology}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Cultivation Notes</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{spec.notes}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Selection Guidelines</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">By Experience Level</h3>
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">Beginner Species</h4>
                  <ul className="text-sm space-y-1 text-green-700 dark:text-green-300">
                    <li>• Oyster mushrooms - Fast, forgiving, high success rate</li>
                    <li>• Focus on learning sterile technique and environmental control</li>
                    <li>• Start with simple substrates (straw, coffee grounds)</li>
                    <li>• Expect 60-80% success rate initially</li>
                  </ul>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Intermediate Species</h4>
                  <ul className="text-sm space-y-1 text-yellow-700 dark:text-yellow-300">
                    <li>• Lion's Mane, Shiitake - Require hardwood substrates</li>
                    <li>• More precise environmental control needed</li>
                    <li>• Learn fruiting triggers and consolidation</li>
                    <li>• Good for developing advanced techniques</li>
                  </ul>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                  <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">Advanced Species</h4>
                  <ul className="text-sm space-y-1 text-red-700 dark:text-red-300">
                    <li>• Reishi, Cordyceps, Chaga - Specialized requirements</li>
                    <li>• Long cultivation times and specific conditions</li>
                    <li>• Often lower yields but higher value</li>
                    <li>• Require mastery of all basic techniques</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">By Cultivation Goals</h3>
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Commercial Production</h4>
                  <ul className="text-sm space-y-1 text-blue-700 dark:text-blue-300">
                    <li>• Oyster, Shiitake, Enoki - High yields, fast turnaround</li>
                    <li>• Focus on efficiency and scalability</li>
                    <li>• Consider market demand and pricing</li>
                    <li>• Reliable, predictable cultivation</li>
                  </ul>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                  <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">Medicinal Focus</h4>
                  <ul className="text-sm space-y-1 text-purple-700 dark:text-purple-300">
                    <li>• Reishi, Turkey Tail, Chaga - Potent therapeutic compounds</li>
                    <li>• Lion's Mane, Cordyceps - Cognitive and energy benefits</li>
                    <li>• Often slower growth but higher value per gram</li>
                    <li>• Consider extraction methods for bioavailability</li>
                  </ul>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">Educational/Hobby</h4>
                  <ul className="text-sm space-y-1 text-green-700 dark:text-green-300">
                    <li>• Start with easy species, progress to challenging ones</li>
                    <li>• Learn different techniques and substrates</li>
                    <li>• Experiment with strains and conditions</li>
                    <li>• Focus on the process, not just the product</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Resource Considerations</h2>
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Equipment Needs</h3>
                <div className="space-y-3">
                  <div className="bg-white dark:bg-gray-700 p-3 rounded border">
                    <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-1">Basic Setup</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Pressure cooker, jars, fruiting chamber</p>
                  </div>
                  <div className="bg-white dark:bg-gray-700 p-3 rounded border">
                    <h4 className="font-semibold text-green-600 dark:text-green-400 mb-1">Intermediate</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Environmental controls, flow hood</p>
                  </div>
                  <div className="bg-white dark:bg-gray-700 p-3 rounded border">
                    <h4 className="font-semibold text-purple-600 dark:text-purple-400 mb-1">Advanced</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Automated systems, lab equipment</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Space Requirements</h3>
                <div className="space-y-3">
                  <div className="bg-white dark:bg-gray-700 p-3 rounded border">
                    <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-1">Small Scale</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Desk or closet (2-4 sq ft)</p>
                  </div>
                  <div className="bg-white dark:bg-gray-700 p-3 rounded border">
                    <h4 className="font-semibold text-green-600 dark:text-green-400 mb-1">Medium Scale</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Dedicated room (10-20 sq ft)</p>
                  </div>
                  <div className="bg-white dark:bg-gray-700 p-3 rounded border">
                    <h4 className="font-semibold text-purple-600 dark:text-purple-400 mb-1">Commercial</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Warehouse facility (100+ sq ft)</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Time Investment</h3>
                <div className="space-y-3">
                  <div className="bg-white dark:bg-gray-700 p-3 rounded border">
                    <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-1">Daily</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Monitoring, harvesting (1-2 hours)</p>
                  </div>
                  <div className="bg-white dark:bg-gray-700 p-3 rounded border">
                    <h4 className="font-semibold text-green-600 dark:text-green-400 mb-1">Weekly</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Substrate prep, inoculation</p>
                  </div>
                  <div className="bg-white dark:bg-gray-700 p-3 rounded border">
                    <h4 className="font-semibold text-purple-600 dark:text-purple-400 mb-1">Learning</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Research, experimentation, adaptation</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Species Compatibility Matrix</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Different species can share equipment and space if their requirements are compatible. This matrix shows which species work well together.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700">
                    <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left font-semibold">Species</th>
                    <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center font-semibold">Oyster</th>
                    <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center font-semibold">Lion's Mane</th>
                    <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center font-semibold">Shiitake</th>
                    <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center font-semibold">Reishi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white dark:bg-gray-900">
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 font-medium">Oyster</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center bg-gray-100 dark:bg-gray-700">-</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center text-green-600">✓</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center text-yellow-600">⚠</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center text-red-600">✗</td>
                  </tr>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 font-medium">Lion's Mane</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center text-green-600">✓</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center bg-gray-100 dark:bg-gray-700">-</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center text-green-600">✓</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center text-yellow-600">⚠</td>
                  </tr>
                  <tr className="bg-white dark:bg-gray-900">
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 font-medium">Shiitake</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center text-yellow-600">⚠</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center text-green-600">✓</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center bg-gray-100 dark:bg-gray-700">-</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center text-green-600">✓</td>
                  </tr>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 font-medium">Reishi</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center text-red-600">✗</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center text-yellow-600">⚠</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center text-green-600">✓</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center bg-gray-100 dark:bg-gray-700">-</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              <div className="flex items-center">
                <span className="w-4 h-4 bg-green-500 rounded mr-2"></span>
                <span>Compatible - Same equipment/space</span>
              </div>
              <div className="flex items-center">
                <span className="w-4 h-4 bg-yellow-500 rounded mr-2"></span>
                <span>Caution - Different timing/conditions</span>
              </div>
              <div className="flex items-center">
                <span className="w-4 h-4 bg-red-500 rounded mr-2"></span>
                <span>Incompatible - Conflicting requirements</span>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Next Steps</h2>
          <p className="mb-4">
            Use this matrix to inform your species selection. Consider your goals, resources, and experience level when choosing which mushrooms to cultivate.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a href="/growing-guides" className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
              <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Growing Guides</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">Detailed cultivation instructions</p>
            </a>
            <a href="/tools/substrate-selector" className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
              <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">Substrate Selector</h3>
              <p className="text-sm text-green-700 dark:text-green-300">Match substrates to species</p>
            </a>
            <a href="/tools/troubleshooting-decision-tree" className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
              <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">Troubleshooting</h3>
              <p className="text-sm text-purple-700 dark:text-purple-300">Solve cultivation problems</p>
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
