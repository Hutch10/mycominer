import type { Metadata } from 'next';
import SectionHeader from "../../components/SectionHeader";
import Breadcrumbs from "../../components/Breadcrumbs";
import RelatedIssues from "../../components/RelatedIssues";

export const metadata: Metadata = {
  title: 'Systems Thinking for Mushroom Growers',
  description: 'Learn to see cultivation as an interconnected system of environmental, biological, and methodological factors for better problem-solving.',
  keywords: ['systems thinking', 'holistic cultivation', 'problem solving', 'cultivation approach', 'ecological thinking'],
  other: {
    tags: ['foundations', 'systems', 'thinking', 'approach', 'ecology'].join(','),
  },
};

export default function SystemsThinkingPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Breadcrumbs />
      <SectionHeader
        title="Systems Thinking"
        subtitle="Seeing cultivation as a dynamic, interconnected system"
      />

      <p className="text-lg mt-4 text-gray-700 dark:text-gray-300">
        Systems thinking is the art of understanding relationships, feedback loops, and emergent behavior. In mushroom cultivation, it means seeing your grow not as isolated steps, but as a dynamic system where everything interacts. This approach transforms cultivation from a mechanical process into an intelligent collaboration with living organisms.
      </p>

      <h2 className="text-2xl font-semibold mt-10 text-gray-900 dark:text-gray-100">From Recipes to Relationships</h2>
      <p className="text-lg mt-3 text-gray-700 dark:text-gray-300">
        Traditional cultivation advice often focuses on recipes: mix this substrate, sterilize at that temperature, wait X days. Systems thinking asks deeper questions: Why does this work? What variables interact? What feedback loops are present? What emergent behaviors might occur?
      </p>

      <p className="text-lg mt-4 text-gray-700 dark:text-gray-300">
        This shift from linear recipes to understanding relationships unlocks true adaptability. Instead of following instructions blindly, you learn to interpret signals, predict outcomes, and respond intelligently to changing conditions.
      </p>

      <h2 className="text-2xl font-semibold mt-10 text-gray-900 dark:text-gray-100">Key Systems Concepts in Cultivation</h2>

      <h3 className="text-xl font-medium mt-6 text-gray-900 dark:text-gray-100">Inputs and Outputs</h3>
      <p className="text-lg mt-2 text-gray-700 dark:text-gray-300">
        Every cultivation system has inputs (substrate, spawn, environmental conditions) and outputs (mycelium, mushrooms, byproducts). Systems thinking requires understanding how these flow through the system and how they interact.
      </p>

      <h3 className="text-xl font-medium mt-6 text-gray-900 dark:text-gray-100">Feedback Loops</h3>
      <p className="text-lg mt-2 text-gray-700 dark:text-gray-300">
        Feedback loops are the invisible forces that drive system behavior. Positive feedback amplifies change (like rapid mycelial growth under ideal conditions), while negative feedback dampens it (like slowed growth when nutrients become scarce).
      </p>

      <h3 className="text-xl font-medium mt-6 text-gray-900 dark:text-gray-100">Emergent Behavior</h3>
      <p className="text-lg mt-2 text-gray-700 dark:text-gray-300">
        Emergence occurs when simple interactions create complex outcomes. Individual hyphae following simple rules can create sophisticated mycelial networks, fruiting patterns, and adaptive responses that no single cell could predict.
      </p>

      <h2 className="text-2xl font-semibold mt-10 text-gray-900 dark:text-gray-100">Cultivation as Collaboration</h2>
      <p className="text-lg mt-3 text-gray-700 dark:text-gray-300">
        When you think in systems, you stop trying to control the grow and start collaborating with it. You become an active participant in a living system, tuning conditions, interpreting signals, and responding to feedback. This mindset separates technicians from true cultivators.
      </p>

      <p className="text-lg mt-4 text-gray-700 dark:text-gray-300">
        Instead of asking "What should I do?", systems thinkers ask "What is the system telling me?" and "How can I support what wants to happen?"
      </p>

      <h2 className="text-2xl font-semibold mt-10 text-gray-900 dark:text-gray-100">Practical Applications</h2>

      <h3 className="text-xl font-medium mt-6 text-gray-900 dark:text-gray-100">Reading System Signals</h3>
      <ul className="list-disc ml-8 mt-3 text-lg text-gray-700 dark:text-gray-300">
        <li>Slow colonization might indicate insufficient nutrients, not just "bad spawn"</li>
        <li>Side pinning often signals microclimate preferences, not contamination</li>
        <li>Yellowing mycelium could be a stress response, not necessarily a problem</li>
        <li>Aborted pins might reflect resource allocation decisions by the mycelium</li>
      </ul>

      <h3 className="text-xl font-medium mt-6 text-gray-900 dark:text-gray-100">Intervening Intelligently</h3>
      <ul className="list-disc ml-8 mt-3 text-lg text-gray-700 dark:text-gray-300">
        <li>Adjust one variable at a time to understand cause and effect</li>
        <li>Observe patterns across multiple grows to identify systemic issues</li>
        <li>Use small experiments to test hypotheses about system behavior</li>
        <li>Learn to distinguish between problems and natural system responses</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-10 text-gray-900 dark:text-gray-100">Why Systems Thinking Matters</h2>
      <p className="text-lg mt-3 text-gray-700 dark:text-gray-300">
        Systems thinking transforms cultivation from a collection of techniques into a coherent practice. It helps you:
      </p>

      <ul className="list-disc ml-8 mt-4 text-lg text-gray-700 dark:text-gray-300">
        <li>Anticipate problems before they occur</li>
        <li>Solve issues at their root cause, not just symptoms</li>
        <li>Scale up grows without proportional increases in problems</li>
        <li>Innovate new techniques based on ecological principles</li>
        <li>Develop intuition about what mycelium needs and wants</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-10 text-gray-900 dark:text-gray-100">Next Steps</h2>

      <RelatedIssues
        related={[
          { title: "Fungal Ecology", href: "/foundations/fungal-ecology" },
          { title: "Environmental Parameters", href: "/foundations/environmental-parameters" },
          { title: "Growing Guides", href: "/growing-guides" },
        ]}
      />
    </div>
  );
}