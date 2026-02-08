import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sterile Technique - Advanced Contamination Control',
  description: 'Master sterile technique for mushroom cultivation: pressure cooking, laminar flow, alcohol flame, and sterile workflow.',
  keywords: ['sterile technique', 'pressure cooker', 'laminar flow hood', 'still air box', 'sterile workflow', 'contamination control'],
  other: {
    tags: ['foundations', 'technique', 'sterile', 'contamination', 'pressure-cooker', 'laminar-flow', 'advanced'].join(','),
  },
};

export default function SterileTechniquePage() {
  return (
    <main className="p-8 max-w-3xl">
      <h1 className="text-4xl font-bold mb-6">Sterile Technique</h1>

      <p className="text-lg mt-4">
        Sterile technique is the foundation of successful mushroom cultivation.
        Most contamination problems begin long before fruiting — during inoculation,
        grain preparation, or substrate handling. Clean technique is not about
        perfection; it’s about consistency, awareness, and reducing the number of
        opportunities contaminants have to enter your workflow.
      </p>

      <h2 className="text-2xl font-semibold mt-10">Why Sterile Technique Matters</h2>
      <p className="text-lg mt-3">
        Fungal competitors such as bacteria and mold are everywhere. They grow
        faster than mushroom mycelium and will take over if given the chance.
        Sterile technique shifts the odds in your favor by minimizing exposure and
        creating clean conditions during the most vulnerable stages.
      </p>

      <ul className="list-disc ml-8 mt-4 text-lg">
        <li>Prevents contamination before it starts.</li>
        <li>Improves colonization speed and consistency.</li>
        <li>Reduces wasted time, materials, and effort.</li>
        <li>Builds confidence and repeatability.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-10">Core Principles of Sterile Technique</h2>

      <h3 className="text-xl font-semibold mt-6">1. Control the Air</h3>
      <p className="text-lg mt-3">
        Airflow is the biggest vector for contamination. You don’t need a perfect
        lab — just predictable, controlled air.
      </p>

      <ul className="list-disc ml-8 mt-4 text-lg">
        <li>Use a still air box (SAB) or laminar flow hood.</li>
        <li>Minimize movement that stirs up dust.</li>
        <li>Let the air settle before beginning work.</li>
      </ul>

      <h3 className="text-xl font-semibold mt-6">2. Clean Your Workspace</h3>
      <p className="text-lg mt-3">
        A clean environment reduces the number of contaminants that can land on
        your tools or materials.
      </p>

      <ul className="list-disc ml-8 mt-4 text-lg">
        <li>Wipe surfaces with 70% isopropyl alcohol.</li>
        <li>Remove clutter that traps dust.</li>
        <li>Work on a smooth, easy‑to‑clean surface.</li>
      </ul>

      <h3 className="text-xl font-semibold mt-6">3. Clean Your Tools</h3>
      <p className="text-lg mt-3">
        Tools that touch sterile materials must be sterilized themselves.
      </p>

      <ul className="list-disc ml-8 mt-4 text-lg">
        <li>Flame sterilize scalpels and needles until red hot.</li>
        <li>Cool tools in sterile agar or against the jar wall.</li>
        <li>Use fresh alcohol wipes for each step.</li>
      </ul>

      <h3 className="text-xl font-semibold mt-6">4. Clean Your Hands</h3>
      <p className="text-lg mt-3">
        Your hands are a major contamination source, even with gloves.
      </p>

      <ul className="list-disc ml-8 mt-4 text-lg">
        <li>Wear nitrile gloves.</li>
        <li>Spray gloves with alcohol frequently.</li>
        <li>Avoid touching non‑sterile surfaces mid‑workflow.</li>
      </ul>

      <h3 className="text-xl font-semibold mt-6">5. Minimize Exposure Time</h3>
      <p className="text-lg mt-3">
        The longer sterile materials are exposed to open air, the higher the
        contamination risk.
      </p>

      <ul className="list-disc ml-8 mt-4 text-lg">
        <li>Plan your workflow before opening anything.</li>
        <li>Move with calm, deliberate motions.</li>
        <li>Open jars, plates, and bags only when needed.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-10">Common Mistakes</h2>
      <ul className="list-disc ml-8 mt-4 text-lg">
        <li>Working too fast or too chaotically.</li>
        <li>Touching sterile tools to non‑sterile surfaces.</li>
        <li>Breathing directly over your work.</li>
        <li>Not letting alcohol evaporate before flaming.</li>
        <li>Opening containers for too long.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-10">Mindset Over Perfection</h2>
      <p className="text-lg mt-3">
        Sterile technique is a mindset. It’s about awareness, intention, and
        reducing risk — not eliminating it entirely. Even experienced growers make
        mistakes. What matters is developing habits that consistently tilt the
        odds in your favor.
      </p>

      <h2 className="text-2xl font-semibold mt-10">Next Steps</h2>
      <ul className="list-disc ml-8 mt-4 text-lg">
        <li><a href="/foundations/environmental-parameters" className="text-blue-600 underline">Environmental Parameters</a></li>
        <li><a href="/foundations/systems-thinking" className="text-blue-600 underline">Systems Thinking for Growers</a></li>
        <li><a href="/foundations/ecology" className="text-blue-600 underline">Fungal Ecology & Behavior</a></li>
      </ul>
    </main>
  );
}