import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Beginner's Mindset - Patience & Systems Thinking",
  description: 'Cultivate the mental approach for mushroom growing: patience, observation, adaptive learning, and respect for biological processes.',
  keywords: ['beginners mindset', 'cultivation mindset', 'patience', 'observation', 'adaptive learning', 'safety'],
  other: {
    tags: ['foundations', 'mindset', 'approach', 'learning', 'patience', 'observation', 'beginner'].join(','),
  },
};

export default function BeginnersMindsetPage() {
  return (
    <main className="p-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-4">
        The Beginner’s Mindset: Patience, Safety, and Systems Thinking
      </h1>

      <p className="mt-4 text-lg">
        Mushroom cultivation rewards a particular kind of mindset — one built on patience,
        observation, and respect for the invisible processes happening beneath the surface.
        Before learning techniques, tools, or species, it helps to understand the mental
        framework that makes a grower successful.
      </p>

      <h2 className="text-2xl font-semibold mt-8">Patience as a Core Skill</h2>
      <p className="mt-3 text-lg">
        Fungi operate on their own timelines. Colonization may take days or weeks, and
        fruiting can feel unpredictable. Rushing the process often leads to contamination,
        poor yields, or unnecessary stress. Patience isn’t passive — it’s an active practice
        of trusting the biology while giving the organism what it needs.
      </p>

      <h2 className="text-2xl font-semibold mt-8">Safety Before Speed</h2>
      <p className="mt-3 text-lg">
        Clean technique is the foundation of all successful grows. Beginners often focus on
        equipment or recipes, but the real skill is learning how to create conditions where
        contaminants struggle and your mycelium thrives. Slow, deliberate movements and
        consistent habits matter more than fancy tools.
      </p>

      <h2 className="text-2xl font-semibold mt-8">Systems Thinking for Growers</h2>
      <p className="mt-3 text-lg">
        A mushroom grow is not a set of isolated steps — it’s a system. Temperature,
        humidity, airflow, substrate quality, and microbial competition all interact. When
        something goes wrong, the solution usually comes from understanding the system as a
        whole rather than focusing on a single variable. This mindset makes troubleshooting
        easier and more intuitive.
      </p>

      <h2 className="text-2xl font-semibold mt-8">A Mindset That Grows With You</h2>
      <p className="mt-3 text-lg">
        As you gain experience, you’ll notice patterns, rhythms, and subtle cues that guide
        your decisions. The beginner’s mindset isn’t something you outgrow — it’s something
        you refine. Staying curious, observant, and humble keeps your cultivation practice
        grounded and resilient.
      </p>
    </main>
  );
}