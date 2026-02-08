import type { Metadata } from 'next';
import SectionHeader from "../../components/SectionHeader";
import Breadcrumbs from "../../components/Breadcrumbs";
import RelatedIssues from "../../components/RelatedIssues";

export const metadata: Metadata = {
  title: 'What Is Mycelium? - Understanding Fungal Networks',
  description: 'Learn about mycelium, the living network of fungal threads that forms the foundation of mushroom cultivation and ecosystem health.',
  keywords: ['mycelium', 'fungal network', 'hyphae', 'mushroom organism', 'fungal biology', 'cultivation basics'],
  other: {
    tags: ['foundations', 'mycelium', 'biology', 'basics', 'organism'].join(','),
  },
};

export default function WhatIsMyceliumPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Breadcrumbs />
      <SectionHeader
        title="What Is Mycelium?"
        subtitle="Understanding the organism behind every mushroom"
      />

      <p className="text-lg mt-4 text-gray-700 dark:text-gray-300">
        Mycelium is the living, growing body of a fungus. It is a network of
        microscopic threads called hyphae that spread through a substrate,
        digesting nutrients, sensing the environment, and coordinating growth.
        When you grow mushrooms, you are really cultivating mycelium — the
        mushroom is just its temporary reproductive structure.
      </p>

      <h2 className="text-2xl font-semibold mt-10 text-gray-900 dark:text-gray-100">Mycelium as a Living Network</h2>
      <p className="text-lg mt-3 text-gray-700 dark:text-gray-300">
        Mycelium behaves less like a plant and more like a distributed
        intelligence. It explores, tests, adapts, and responds to conditions in
        real time. Each hyphal tip acts as a decision‑making node, adjusting
        direction and growth rate based on moisture, nutrients, CO₂, and
        competition.
      </p>

      <ul className="list-disc ml-8 mt-4 text-lg text-gray-700 dark:text-gray-300">
        <li>It grows toward nutrients and away from stress.</li>
        <li>It can detect contaminants and mount defensive responses.</li>
        <li>It reallocates resources across the network.</li>
        <li>It forms dense structures when conditions are ideal.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-10 text-gray-900 dark:text-gray-100">What Mycelium Needs to Thrive</h2>
      <p className="text-lg mt-3 text-gray-700 dark:text-gray-300">
        Although different species have different preferences, all mycelium
        depends on a few universal conditions:
      </p>

      <ul className="list-disc ml-8 mt-4 text-lg text-gray-700 dark:text-gray-300">
        <li><strong>Moisture:</strong> Enough water to metabolize, but not so much that oxygen is displaced.</li>
        <li><strong>Oxygen:</strong> Mycelium breathes — it needs gas exchange.</li>
        <li><strong>Stable temperatures:</strong> Most species thrive between 68–75°F.</li>
        <li><strong>Clean substrate:</strong> Contaminants compete aggressively.</li>
        <li><strong>Nutrition:</strong> Carbohydrates, lignin, cellulose, or other organic matter.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-10 text-gray-900 dark:text-gray-100">Mycelium vs. Mushrooms</h2>
      <p className="text-lg mt-3 text-gray-700 dark:text-gray-300">
        A mushroom is not the organism — it is the fruiting body. Mycelium is the
        organism. The mushroom is simply a temporary structure designed to
        release spores. This distinction is essential for growers:
      </p>

      <ul className="list-disc ml-8 mt-4 text-lg text-gray-700 dark:text-gray-300">
        <li>Healthy mycelium = healthy mushrooms.</li>
        <li>Most problems originate during colonization, not fruiting.</li>
        <li>Understanding mycelium’s needs prevents 90% of beginner mistakes.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-10 text-gray-900 dark:text-gray-100">How Mycelium Responds to Stress</h2>
      <p className="text-lg mt-3 text-gray-700 dark:text-gray-300">
        Mycelium is incredibly adaptive. When stressed, it may:
      </p>

      <ul className="list-disc ml-8 mt-4 text-lg text-gray-700 dark:text-gray-300">
        <li>Produce metabolites (yellow or amber droplets).</li>
        <li>Slow or pause growth.</li>
        <li>Thicken into dense, defensive mats.</li>
        <li>Divert energy away from fruiting.</li>
      </ul>

      <p className="text-lg mt-4 text-gray-700 dark:text-gray-300">
        These responses are not random — they are intelligent adaptations to
        preserve the network.
      </p>

      <h2 className="text-2xl font-semibold mt-10 text-gray-900 dark:text-gray-100">Why Understanding Mycelium Matters</h2>
      <p className="text-lg mt-3 text-gray-700 dark:text-gray-300">
        When you understand mycelium, you understand cultivation. Every decision
        you make — substrate, hydration, airflow, temperature, sterile technique —
        is ultimately about supporting the needs of this organism. The more you
        learn to "think like mycelium," the more intuitive and successful your
        grows become.
      </p>

      <RelatedIssues
        related={[
          { title: "The Mushroom Life Cycle", href: "/foundations/life-cycle" },
          { title: "Substrates & Nutrition", href: "/foundations/substrates" },
          { title: "Sterile Technique", href: "/foundations/sterile-technique" },
        ]}
      />
    </div>
  );
}
