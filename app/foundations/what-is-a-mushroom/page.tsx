import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'What Is a Mushroom? - Anatomy & Function',
  description: 'Learn about mushroom fruiting bodies as reproductive structures and their role in the fungal life cycle.',
  keywords: ['mushroom anatomy', 'fruiting body', 'fungal reproduction', 'mushroom structure', 'spores', 'fungal biology'],
  other: {
    tags: ['foundations', 'mushroom', 'anatomy', 'fruiting-body', 'reproduction', 'biology'].join(','),
  },
};

export default function WhatIsAMushroomPage() {
  return (
    <main className="p-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-4">What Is a Mushroom?</h1>

      <p className="mt-4 text-lg">
        A mushroom is the fruiting body of a much larger, mostly hidden organism.
        What we see above the surface is only a brief, specialized structure
        designed for reproduction. To understand cultivation, it helps to see the
        mushroom not as the organism itself, but as one moment in its life cycle.
      </p>

      <h2 className="text-2xl font-semibold mt-8">The Mycelial Network</h2>
      <p className="mt-3 text-lg">
        The true body of a fungus is the mycelium — a branching, filamentous network
        of hyphae that spreads through substrate, digesting organic matter and
        interacting with the surrounding ecosystem. Mycelium is dynamic, adaptive,
        and constantly responding to environmental signals.
      </p>

      <h2 className="text-2xl font-semibold mt-8">Mushrooms as Reproductive Structures</h2>
      <p className="mt-3 text-lg">
        A mushroom forms when the mycelium encounters the right combination of
        temperature, humidity, nutrients, and fresh air. Its purpose is simple:
        produce and release spores. Once that job is done, the mushroom decays,
        but the mycelium continues living beneath the surface.
      </p>

      <h2 className="text-2xl font-semibold mt-8">Environmental Sensitivity</h2>
      <p className="mt-3 text-lg">
        Mushrooms are highly responsive to their environment. Small changes in
        airflow, moisture, or temperature can dramatically alter their shape,
        color, or growth rate. This sensitivity is why growers focus so much on
        stable conditions and careful observation.
      </p>

      <h2 className="text-2xl font-semibold mt-8">A System, Not a Recipe</h2>
      <p className="mt-3 text-lg">
        Understanding what a mushroom is — and what it isn’t — helps you move
        beyond recipes. Cultivation becomes a dialogue with a living system rather
        than a checklist of steps. When you see mushrooms as the visible expression
        of an invisible network, troubleshooting becomes intuitive and growth
        becomes more predictable.
      </p>

      <h2 className="text-2xl font-semibold mt-8">Why This Matters for Growers</h2>
      <p className="mt-3 text-lg">
        When you understand the organism, you understand the process. Seeing the
        mushroom as a temporary structure emerging from a complex, adaptive
        mycelial network gives you the mindset needed to cultivate with confidence,
        patience, and respect for the biology.
      </p>
    </main>
  );
}