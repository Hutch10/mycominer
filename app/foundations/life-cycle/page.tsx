import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'The Mushroom Life Cycle - From Spore to Fruiting',
  description: 'Complete guide to fungal development stages: spore germination, mycelial colonization, pinning, fruiting, and senescence.',
  keywords: ['mushroom life cycle', 'spore germination', 'colonization', 'pinning', 'fruiting', 'fungal development'],
  other: {
    tags: ['foundations', 'life-cycle', 'spores', 'colonization', 'pinning', 'fruiting', 'development'].join(','),
  },
};

export default function LifeCyclePage() {
  return (
    <main className="p-8 max-w-3xl">
      <h1 className="text-4xl font-bold mb-6">The Mushroom Life Cycle</h1>

      <p className="text-lg mt-4">
        The mushroom life cycle describes how fungi grow, reproduce, and adapt to
        their environment. Understanding this cycle helps you anticipate what your
        mycelium needs at each stage, troubleshoot problems, and create conditions
        that support healthy development.
      </p>

      <h2 className="text-2xl font-semibold mt-10">1. Spores</h2>
      <p className="text-lg mt-3">
        Spores are microscopic reproductive cells released from mature mushrooms.
        They contain the genetic blueprint for new mycelium but cannot grow alone.
        A single spore must meet a compatible partner to begin the next stage.
      </p>

      <ul className="list-disc ml-8 mt-4 text-lg">
        <li>Extremely resilient and long‑lived.</li>
        <li>Carried by wind, water, insects, and animals.</li>
        <li>Dormant until conditions are favorable.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-10">2. Germination</h2>
      <p className="text-lg mt-3">
        When spores land on a suitable substrate with moisture, oxygen, and the
        right temperature, they germinate. Each spore produces a tiny hypha — the
        first thread of mycelium.
      </p>

      <p className="text-lg mt-3">
        Two compatible hyphae must meet and fuse to form a complete, fertile
        mycelial network capable of producing mushrooms.
      </p>

      <h2 className="text-2xl font-semibold mt-10">3. Vegetative Growth (Colonization)</h2>
      <p className="text-lg mt-3">
        This is the stage growers interact with most. The fused mycelium expands
        through the substrate, digesting nutrients and building a dense network.
      </p>

      <ul className="list-disc ml-8 mt-4 text-lg">
        <li>Mycelium spreads outward in all directions.</li>
        <li>It senses moisture, CO₂, nutrients, and competitors.</li>
        <li>Healthy colonization is fast, even, and bright white.</li>
      </ul>

      <p className="text-lg mt-3">
        Most contamination issues originate here, long before fruiting begins.
      </p>

      <h2 className="text-2xl font-semibold mt-10">4. Pinning (Primordia Formation)</h2>
      <p className="text-lg mt-3">
        When the mycelium has fully colonized its substrate and environmental
        conditions shift — especially fresh air, humidity, and light — it begins
        forming tiny knots of tissue called primordia, or “pins.”
      </p>

      <ul className="list-disc ml-8 mt-4 text-lg">
        <li>Pins are the earliest visible stage of mushrooms.</li>
        <li>They require high humidity and gentle evaporation.</li>
        <li>CO₂ levels must drop for pinning to initiate.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-10">5. Fruiting</h2>
      <p className="text-lg mt-3">
        Pins develop into mature mushrooms. This stage is highly sensitive to
        humidity, airflow, and surface moisture. Mushrooms grow rapidly — often
        doubling in size every 24 hours.
      </p>

      <ul className="list-disc ml-8 mt-4 text-lg">
        <li>Caps expand and open.</li>
        <li>Stems elongate in response to CO₂ gradients.</li>
        <li>Clusters compete for space, light, and resources.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-10">6. Sporulation</h2>
      <p className="text-lg mt-3">
        Once mature, mushrooms release spores from their gills, pores, or teeth.
        In nature, this spreads the fungus to new environments. In cultivation,
        sporulation marks the end of the fruit’s reproductive purpose.
      </p>

      <p className="text-lg mt-3">
        After sporulation, mushrooms begin to degrade, and the substrate prepares
        for the next flush.
      </p>

      <h2 className="text-2xl font-semibold mt-10">Why the Life Cycle Matters for Growers</h2>
      <p className="text-lg mt-3">
        Each stage has different needs. When you understand the life cycle, you
        can anticipate problems before they happen and create conditions that
        support healthy growth.
      </p>

      <ul className="list-disc ml-8 mt-4 text-lg">
        <li>Colonization needs warmth, oxygen, and stability.</li>
        <li>Pinning needs fresh air, humidity, and light.</li>
        <li>Fruiting needs balance — evaporation without drying out.</li>
        <li>Post‑flush needs rest and rehydration.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-10">Next Steps</h2>
      <ul className="list-disc ml-8 mt-4 text-lg">
        <li><a href="/foundations/substrates" className="text-blue-600 underline">Substrates & Nutrition</a></li>
        <li><a href="/foundations/sterile-technique" className="text-blue-600 underline">Sterile Technique</a></li>
        <li><a href="/foundations/environmental-parameters" className="text-blue-600 underline">Environmental Parameters</a></li>
      </ul>
    </main>
  );
}