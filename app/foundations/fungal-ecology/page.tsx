import type { Metadata } from 'next';
import SectionHeader from "../../components/SectionHeader";
import Breadcrumbs from "../../components/Breadcrumbs";
import RelatedIssues from "../../components/RelatedIssues";

export const metadata: Metadata = {
  title: 'Fungal Ecology & Behavior - Natural Roles',
  description: 'Explore how fungi behave in nature: decomposition, competition, cooperation, resource allocation, and environmental sensing.',
  keywords: ['fungal ecology', 'decomposition', 'saprotrophic fungi', 'fungal behavior', 'mycorrhizal', 'competition'],
  other: {
    tags: ['foundations', 'ecology', 'behavior', 'decomposition', 'nature', 'competition', 'cooperation'].join(','),
  },
};

export default function FungalEcologyPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Breadcrumbs />
      <SectionHeader
        title="Fungal Ecology"
        subtitle="Understanding fungi's role in ecosystems and cultivation"
      />

      <p className="text-lg mt-4 text-gray-700 dark:text-gray-300">
        Fungal ecology explores the vital role of fungi in ecosystems — from decomposing organic matter to forming intricate symbiotic relationships. Understanding these ecological dynamics helps growers align their cultivation practices with nature's rhythms, creating more harmonious and successful grows.
      </p>

      <h2 className="text-2xl font-semibold mt-10 text-gray-900 dark:text-gray-100">Key Ecological Roles of Fungi</h2>

      <h3 className="text-xl font-medium mt-6 text-gray-900 dark:text-gray-100">Decomposers and Nutrient Cyclers</h3>
      <p className="text-lg mt-2 text-gray-700 dark:text-gray-300">
        Fungi are nature's primary decomposers, breaking down dead organic material and recycling nutrients back into the ecosystem. This process releases carbon, nitrogen, and minerals that would otherwise remain locked in complex organic compounds.
      </p>

      <h3 className="text-xl font-medium mt-6 text-gray-900 dark:text-gray-100">Mycorrhizal Partners</h3>
      <p className="text-lg mt-2 text-gray-700 dark:text-gray-300">
        Many fungi form mutualistic relationships with plant roots through mycorrhizae. The fungus extends the plant's reach for water and minerals, while receiving carbohydrates from the plant. This partnership enhances both organisms' survival and productivity.
      </p>

      <h3 className="text-xl font-medium mt-6 text-gray-900 dark:text-gray-100">Pathogens and Population Regulators</h3>
      <p className="text-lg mt-2 text-gray-700 dark:text-gray-300">
        Some fungi serve as pathogens, regulating populations of plants, insects, and other fungi. While this can cause disease, it also prevents any single species from dominating and maintains ecological balance.
      </p>

      <h3 className="text-xl font-medium mt-6 text-gray-900 dark:text-gray-100">Food Web Contributors</h3>
      <p className="text-lg mt-2 text-gray-700 dark:text-gray-300">
        Fungi provide nutrition for countless organisms, from insects and mammals to bacteria and other fungi. Mushrooms and mycelium are important food sources in nearly every terrestrial ecosystem.
      </p>

      <h2 className="text-2xl font-semibold mt-10 text-gray-900 dark:text-gray-100">Fungal Networks and Communication</h2>
      <p className="text-lg mt-3 text-gray-700 dark:text-gray-300">
        Recent research reveals that fungi form vast underground networks that connect plants and trees. These "wood wide webs" allow plants to share nutrients, warn each other of threats, and coordinate responses to environmental changes.
      </p>

      <p className="text-lg mt-4 text-gray-700 dark:text-gray-300">
        This interconnectedness suggests that fungi play a crucial role in ecosystem intelligence and resilience. Understanding these networks can help growers create more balanced and responsive cultivation environments.
      </p>

      <h2 className="text-2xl font-semibold mt-10 text-gray-900 dark:text-gray-100">Why Ecology Matters for Growers</h2>
      <p className="text-lg mt-3 text-gray-700 dark:text-gray-300">
        When you understand fungal ecology, cultivation becomes more than following recipes — it becomes working with living systems. This knowledge helps you:
      </p>

      <ul className="list-disc ml-8 mt-4 text-lg text-gray-700 dark:text-gray-300">
        <li>Choose substrates that mimic natural fungal habitats</li>
        <li>Optimize environmental conditions based on ecological preferences</li>
        <li>Recognize and respond to natural fungal behaviors</li>
        <li>Prevent problems by understanding competitive relationships</li>
        <li>Create cultivation systems that support fungal health and productivity</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-10 text-gray-900 dark:text-gray-100">Ecological Principles in Practice</h2>

      <h3 className="text-xl font-medium mt-6 text-gray-900 dark:text-gray-100">Succession and Community Dynamics</h3>
      <p className="text-lg mt-2 text-gray-700 dark:text-gray-300">
        Fungi participate in ecological succession, where different species colonize substrates at different stages of decomposition. Fast-growing, ruderal species arrive first, followed by competitive species, then stress-tolerant species in later stages.
      </p>

      <h3 className="text-xl font-medium mt-6 text-gray-900 dark:text-gray-100">Competitive Interactions</h3>
      <p className="text-lg mt-2 text-gray-700 dark:text-gray-300">
        In nature, fungi compete for resources through chemical warfare, territorial expansion, and allelopathy. Understanding these dynamics helps growers recognize contamination patterns and implement effective prevention strategies.
      </p>

      <h3 className="text-xl font-medium mt-6 text-gray-900 dark:text-gray-100">Environmental Triggers</h3>
      <p className="text-lg mt-2 text-gray-700 dark:text-gray-300">
        Fungi respond to seasonal changes, weather patterns, and ecological cues. Many fruiting triggers in cultivation mimic natural environmental shifts, such as temperature drops or moisture changes that signal seasonal transitions.
      </p>

      <h2 className="text-2xl font-semibold mt-10 text-gray-900 dark:text-gray-100">Cultivation as Ecological Participation</h2>
      <p className="text-lg mt-3 text-gray-700 dark:text-gray-300">
        The most successful growers don't just control environments — they participate in ecological processes. By understanding fungal ecology, you learn to:
      </p>

      <ul className="list-disc ml-8 mt-4 text-lg text-gray-700 dark:text-gray-300">
        <li>Support natural fungal behaviors rather than fighting them</li>
        <li>Create conditions that encourage beneficial ecological relationships</li>
        <li>Anticipate and prevent competitive exclusions</li>
        <li>Harvest in ways that support long-term mycelial health</li>
        <li>Scale cultivation while maintaining ecological balance</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-10 text-gray-900 dark:text-gray-100">Further Exploration</h2>
      <p className="text-lg mt-3 text-gray-700 dark:text-gray-300">
        Fungal ecology is a vast and rapidly evolving field. As you deepen your cultivation practice, consider exploring:
      </p>

      <RelatedIssues
        related={[
          { title: "The Mushroom Life Cycle", href: "/foundations/life-cycle" },
          { title: "Contamination Ecology", href: "/foundations/contamination-ecology" },
          { title: "Medicinal Mushrooms", href: "/medicinal-mushrooms" },
        ]}
      />

      <p className="text-lg mt-6 text-gray-700 dark:text-gray-300">
        Ecology isn't just background knowledge — it's the foundation of intelligent cultivation. The more you understand fungal ecology, the more your grows will reflect nature's wisdom and resilience.
      </p>
    </div>
  );
}