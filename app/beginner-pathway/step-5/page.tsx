import type { Metadata } from 'next';
import Breadcrumbs from '../../components/Breadcrumbs';
import SectionHeader from '../../components/SectionHeader';
import RelatedIssues from '../../components/RelatedIssues';

export const metadata: Metadata = {
  title: 'Beginner Pathway — Step 5: Colonization',
  description: 'Manage sealed bags or jars through steady colonization with the right temperature, gas exchange, and patience.',
  keywords: [
    'beginner',
    'colonization',
    'spawn run',
    'temperature',
    'contamination',
    'workflow',
  ],
  other: {
    tags: [
      'beginner',
      'workflow',
      'colonization',
      'contamination',
      'substrates',
      'environmental-control',
      'fruiting',
      'harvesting',
    ].join(','),
  },
};

export default function Step5Colonization() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-gray-800 dark:text-gray-200">
      <Breadcrumbs
        items={[
          { label: 'Beginner Pathway', href: '/beginner-pathway' },
          { label: 'Step 5', href: '/beginner-pathway/step-5' },
          { label: 'Colonization', href: '/beginner-pathway/step-5' },
        ]}
      />

      <SectionHeader
        title="Step 5: Colonization"
        subtitle="Hold steady conditions while mycelium captures the substrate"
      />

      <div className="space-y-8">
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Timeline and Milestones</h2>
          <p className="leading-relaxed">
            Expect visible recovery in 2-5 days, 30-70% colonization by week 2, and full colonization 2-4 weeks depending on species and temperature.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Conditions</h2>
          <ul className="list-disc ml-6 space-y-2">
            <li>Temperature: 68-75 F for most species; avoid &gt;80 F to limit bacterial growth.</li>
            <li>Light: optional low light; keep bags shaded to avoid premature pinning.</li>
            <li>Gas exchange: keep filters unobstructed; do not open bags or jars.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Signals of Trouble</h2>
          <ul className="list-disc ml-6 space-y-2">
            <li>Wet, sour smell or milky grains: likely bacteria; quarantine and discard.</li>
            <li>Green patches: trichoderma; remove from the room immediately.</li>
            <li>No growth after 7-10 days: suspect dead culture, too-wet grain, or low temp.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">When to Break or Shake</h2>
          <p className="leading-relaxed">
            If using bags, a gentle break-and-mix at ~30-50% colonization can speed finish. Skip this if the bag feels wet or shows off smells—mixing spreads contamination.
          </p>
        </section>

        <section>
          <RelatedIssues
            related={[
              { title: 'Step 4: Inoculation', href: '/beginner-pathway/step-4' },
              { title: 'Step 6: Fruiting', href: '/beginner-pathway/step-6' },
              { title: 'Contamination Ecology', href: '/foundations/contamination-ecology' },
              { title: 'Slow Colonization', href: '/troubleshooting/slow-colonization' },
              { title: 'Bacterial Contamination', href: '/troubleshooting/bacterial-contamination' },
            ]}
          />
        </section>
      </div>
    </div>
  );
}
