import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contamination Ecology - Understanding Competitors',
  description: 'Understand the ecological dynamics of contamination: why molds and bacteria compete with mushroom mycelium and how to prevent it systemically.',
  keywords: ['contamination ecology', 'mold', 'bacteria', 'trichoderma', 'competition', 'ecological balance', 'prevention'],
  other: {
    tags: ['foundations', 'contamination', 'ecology', 'mold', 'bacteria', 'competition', 'prevention', 'systems'].join(','),
  },
};

export default function ContaminationEcologyPage() {
  return (
    <main className="p-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-4">
        Contamination: Understanding the Ecology of Failure
      </h1>

      <p className="mt-4 text-lg">
        Contamination is not a personal failure. It is an ecological event.
        Every substrate you prepare becomes a small ecosystem, and ecosystems
        attract competitors. Understanding contamination as ecology — not
        punishment — helps you learn faster, troubleshoot more effectively, and
        cultivate with less frustration.
      </p>

      <h2 className="text-2xl font-semibold mt-8">Why Contamination Happens</h2>
      <p className="mt-3 text-lg">
        Fungi are not alone in wanting to colonize your substrate. Bacteria,
        molds, and yeasts are everywhere: in the air, on your hands, on your
        tools, and inside your environment. They grow faster than mushrooms and
        will take any opportunity to claim resources.
      </p>

      <p className="mt-3 text-lg">
        Contamination is simply the natural outcome of ecological competition.
        Your job as a cultivator is not to eliminate competitors entirely, but
        to give your mycelium the strongest possible advantage.
      </p>

      <h2 className="text-2xl font-semibold mt-8">Common Types of Contamination</h2>
      <ul className="list-disc ml-8 mt-3 text-lg">
        <li><strong>Trichoderma (green mold):</strong> Fast, aggressive, thrives on weak mycelium.</li>
        <li><strong>Bacterial contamination:</strong> Sour smell, wet spots, slimy grains.</li>
        <li><strong>Yeasts:</strong> Often pink or white, spread quickly in warm environments.</li>
        <li><strong>Black molds:</strong> Slow but persistent, often from poor substrate prep.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8">What Contamination Teaches You</h2>
      <p className="mt-3 text-lg">
        Every contamination event contains information. Instead of asking,
        “What did I do wrong?” ask:
      </p>

      <ul className="list-disc ml-8 mt-3 text-lg">
        <li>Where did the competitor gain access?</li>
        <li>Was my substrate fully sterilized or pasteurized?</li>
        <li>Was my inoculation environment controlled?</li>
        <li>Did I rush or break clean technique habits?</li>
        <li>Was the mycelium strong enough to compete?</li>
      </ul>

      <p className="mt-3 text-lg">
        Contamination becomes a teacher when you treat it as data instead of
        defeat.
      </p>

      <h2 className="text-2xl font-semibold mt-8">Strengthening Your System</h2>
      <p className="mt-3 text-lg">
        You cannot eliminate contamination entirely, but you can reduce its
        frequency by improving the system around your cultivation:
      </p>

      <ul className="list-disc ml-8 mt-3 text-lg">
        <li>Improve clean technique.</li>
        <li>Use fresh, high‑quality spawn.</li>
        <li>Control airflow during inoculation.</li>
        <li>Ensure proper sterilization or pasteurization.</li>
        <li>Work slowly and intentionally.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8">The Ecology of Failure</h2>
      <p className="mt-3 text-lg">
        Failure in mushroom cultivation is ecological, not moral. When you see
        contamination as a natural part of the process, you stop taking it
        personally and start learning from it. Every grower — even experts —
        encounters contamination. What matters is how you respond.
      </p>

      <p className="mt-3 text-lg">
        Understanding the ecology of failure makes you a more resilient, more
        observant, and ultimately more successful cultivator.
      </p>
    </main>
  );
}