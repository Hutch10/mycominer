import type { Metadata } from 'next';
import Breadcrumbs from '../../components/Breadcrumbs';
import SectionHeader from '../../components/SectionHeader';
import RelatedIssues from '../../components/RelatedIssues';

export const metadata: Metadata = {
  title: 'Beginner Pathway — Step 4: Inoculation',
  description: 'Transfer clean spawn into prepared grain or bulk substrate with a repeatable, low-contamination workflow.',
  keywords: [
    'beginner',
    'inoculation',
    'sterile technique',
    'workflow',
    'grain spawn',
    'contamination',
  ],
  other: {
    tags: [
      'beginner',
      'workflow',
      'inoculation',
      'sterile-technique',
      'clean-technique',
      'substrates',
      'colonization',
      'fruiting',
      'harvesting',
    ].join(','),
  },
};

export default function Step4Inoculation() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-gray-800 dark:text-gray-200">
      <Breadcrumbs
        items={[
          { label: 'Beginner Pathway', href: '/beginner-pathway' },
          { label: 'Step 4', href: '/beginner-pathway/step-4' },
          { label: 'Inoculation', href: '/beginner-pathway/step-4' },
        ]}
      />

      <SectionHeader
        title="Step 4: Inoculation"
        subtitle="Move clean spawn into sterile or pasteurized substrates with intentional, calm motions"
      />

      <div className="space-y-8">
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Prep Your Materials</h2>
          <ul className="list-disc ml-6 space-y-2">
            <li>Still air box or laminar flow; alcohol spray; flame for needles or scalpel.</li>
            <li>Labeled grain bags/jars and bulk substrate bags or tubs.</li>
            <li>Inoculant: liquid culture, grain-to-grain transfer, or spore syringe (sterile, verified).</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Run the Sequence</h2>
          <ol className="list-decimal ml-6 space-y-2">
            <li>Wipe gloves, tools, and bag ports with alcohol. Minimize talking and movement.</li>
            <li>Flame-sterilize needle or scalpel until red; cool briefly without waving in room air.</li>
            <li>Insert through self-healing port or open quickly in the still air box; inject or transfer grain.</li>
            <li>Mix gently to distribute (if the bag allows); seal and label date + strain.</li>
          </ol>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Common Failure Points</h2>
          <ul className="list-disc ml-6 space-y-2">
            <li>Unflamed needle/scalpel reintroduces room contaminants. Flame between each bag.</li>
            <li>Condensation or drips: avoid dripping alcohol into ports; dry before inoculating.</li>
            <li>Slow or stalled jars often trace back to wet grain or under-sterilized load.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Aftercare</h2>
          <p className="leading-relaxed">
            Store bags or jars upright at room temperature (68-75 F). Avoid light and handling for the first 48 hours to let mycelium recover.
          </p>
        </section>

        <section>
          <RelatedIssues
            related={[
              { title: 'Step 3: Prepare Your Workspace', href: '/beginner-pathway/step-3' },
              { title: 'Step 5: Colonization', href: '/beginner-pathway/step-5' },
              { title: 'Sterile Technique', href: '/foundations/sterile-technique' },
              { title: 'Clean Technique', href: '/foundations/clean-technique' },
              { title: 'Bacterial Contamination', href: '/troubleshooting/bacterial-contamination' },
            ]}
          />
        </section>
      </div>
    </div>
  );
}
