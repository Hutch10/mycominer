import React from "react";

export default function SystemPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900 px-6 py-12">
      <section className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight mb-6">
          The MycoMiner System
        </h1>

        <p className="text-lg text-gray-700 mb-8">
          MycoMiner is a human-authored framework for mushroom intelligence — a living system that blends observation, cultivation, and founder-grade operational clarity.
        </p>

        <h2 className="text-2xl font-semibold mb-4">Core Principles</h2>
        <ul className="list-disc list-inside text-gray-700 mb-8 space-y-2">
          <li>Intentional mycology grounded in human authorship</li>
          <li>Regeneration-safe environments and reproducible cycles</li>
          <li>Founder-grade clarity in every operational layer</li>
          <li>Systems that evolve, adapt, and compound over time</li>
        </ul>

        <h2 className="text-2xl font-semibold mb-4">System Architecture</h2>
        <p className="text-gray-700 mb-8">
          The MycoMiner architecture is designed to be modular, transparent, and evolution-friendly. Each component is built to support long-term growth and narrative gravity.
        </p>

        <h2 className="text-2xl font-semibold mb-4">Explore Further</h2>
        <p className="text-gray-700 mb-4">
          This is just the beginning. Additional modules — including environment design, lifecycle intelligence, and founder operations — will be added as the system evolves.
        </p>

        <a
          href="/"
          className="inline-block bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition"
        >
          Return Home
        </a>
      </section>
    </main>
  );
}
