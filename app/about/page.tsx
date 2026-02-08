import React from "react";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900 px-6 py-12">
      <section className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight mb-6">
          About MycoMiner
        </h1>

        <p className="text-lg text-gray-700 mb-8">
          MycoMiner is a human-authored platform dedicated to intentional mycology and mushroom intelligence. It blends hands-on cultivation, observational rigor, and founder-grade operational clarity to create a system that evolves with its practitioners.
        </p>

        <p className="text-gray-700 mb-8">
          The platform is built on the belief that meaningful systems carry a human fingerprint — a sense of authorship, narrative gravity, and long-term stewardship. MycoMiner is designed to be transparent, reproducible, and evolution-friendly, supporting both beginners and experienced cultivators.
        </p>

        <p className="text-gray-700 mb-8">
          As the platform grows, new modules, tools, and frameworks will be added to deepen the practice of mushroom intelligence and expand the ecosystem.
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
