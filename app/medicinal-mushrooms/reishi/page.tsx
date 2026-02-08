import type { Metadata } from 'next';
import SectionHeader from '../../components/SectionHeader';
import Breadcrumbs from '../../components/Breadcrumbs';
import RelatedIssues from '../../components/RelatedIssues';

export const metadata: Metadata = {
  title: 'Reishi Medicinal Properties - Immune & Stress Support',
  description: 'Evidence-based overview of reishi (Ganoderma lucidum) medicinal benefits: immune modulation, triterpenes, stress support, and preparation methods.',
  keywords: ['reishi', 'Ganoderma lucidum', 'medicinal mushroom', 'immune support', 'triterpenes', 'adaptogen', 'traditional medicine'],
  other: {
    tags: ['medicinal', 'reishi', 'ganoderma', 'immune', 'triterpenes', 'adaptogen', 'traditional'].join(','),
  },
};

export default function ReishiMedicinalPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Breadcrumbs />
      <SectionHeader
        title="Reishi Medicinal Properties"
        subtitle="Understanding Ganoderma lucidum as a medicinal mushroom"
      />

      <div className="space-y-8 text-gray-800 dark:text-gray-200">
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Ecological Context</h2>
          <p className="mb-4">
            Reishi (Ganoderma lucidum) is a polypore fungus that grows as a perennial bracket fungus on dead or dying hardwood trees. Known as the "mushroom of immortality" in traditional Chinese medicine, it can live for decades within the same host tree. This longevity reflects its adaptation to stable, long-term ecological relationships. In nature, Reishi appears when trees are severely compromised, often signaling the final stages of decomposition.
          </p>
          <p>
            The mushroom's ability to fruit in two forms - antlers and conks - allows it to adapt to different microclimates. Antler forms develop in humid, shaded conditions, while conks form in drier, exposed areas. This phenotypic plasticity has contributed to its reputation as an adaptogenic medicine that helps organisms adapt to environmental stress.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Medicinal Properties</h2>
          <p className="mb-4">
            Reishi has been used for over 2,000 years in East Asian medicine as a tonic for vitality, longevity, and spiritual cultivation. Modern research has identified numerous bioactive compounds that support immune function, stress resilience, and overall health. Its adaptogenic properties help the body maintain homeostasis during times of stress.
          </p>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Immune System Support</h3>
              <p>Reishi contains beta-glucans and triterpenes that modulate immune function. Research suggests it may enhance immune response while preventing overactivation that can lead to autoimmune issues.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Stress and Sleep Support</h3>
              <p>Traditionally used as a calming adaptogen. The triterpenes may support healthy stress response and promote restful sleep by modulating cortisol and supporting adrenal function.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Liver Health</h3>
              <p>Reishi has been studied for liver protective effects. The ganoderic acids may support detoxification processes and protect liver cells from damage.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Cardiovascular Health</h3>
              <p>Research indicates potential benefits for blood pressure regulation and cholesterol metabolism. The mushroom's compounds may support healthy circulation and heart function.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Antioxidant Properties</h3>
              <p>Contains various antioxidants that help combat oxidative stress throughout the body. This contributes to its overall vitality-supporting effects.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Key Bioactive Compounds</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Triterpenes</h3>
              <p className="mb-2"><strong>Location:</strong> Fruiting body</p>
              <p>The bitter compounds responsible for many of Reishi's medicinal effects. Include ganoderic acids, lucidinic acids, and other triterpenoids. These compounds are largely responsible for the mushroom's adaptogenic and immune-modulating properties.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Beta-Glucans</h3>
              <p className="mb-2"><strong>Location:</strong> Both fruiting body and mycelium</p>
              <p>Polysaccharides that support immune function and may have anti-tumor effects. These complex sugars are water-soluble and require hot water extraction for bioavailability.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Ganoderic Acids</h3>
              <p className="mb-2"><strong>Location:</strong> Fruiting body</p>
              <p>A specific class of triterpenes unique to Reishi. These compounds contribute to liver support, blood pressure regulation, and anti-inflammatory effects.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Other Compounds</h3>
              <p>Contains nucleosides, alkaloids, and various minerals. The mushroom also produces enzymes and secondary metabolites that contribute to its therapeutic profile.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Research Overview</h2>
          <p className="mb-4">
            Reishi has one of the most extensive research profiles among medicinal mushrooms. While traditional use spans millennia, modern studies have validated many of its therapeutic applications.
          </p>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Immune System Studies</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Clinical trials show immune modulation in cancer patients</li>
                <li>Research on natural killer cell activity and cytokine production</li>
                <li>Potential applications in autoimmune conditions</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Stress and Sleep Research</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Studies on cortisol regulation and stress response</li>
                <li>Research on sleep quality improvement</li>
                <li>Adaptogenic effects in chronic stress models</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Cardiovascular Research</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Blood pressure regulation in hypertensive patients</li>
                <li>Effects on cholesterol metabolism</li>
                <li>Antioxidant protection of blood vessels</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Liver Health Studies</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Hepatoprotective effects against toxins</li>
                <li>Support for fatty liver conditions</li>
                <li>Enhancement of detoxification pathways</li>
              </ul>
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Note: Reishi research is extensive but ongoing. While promising, it should complement rather than replace conventional medical care.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Preparation Methods</h2>
          <p className="mb-4">
            Reishi's complex chemistry requires careful preparation to extract its full range of compounds. Different methods yield different therapeutic profiles.
          </p>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Dual Extraction (Recommended)</h3>
              <p className="mb-2"><strong>Process:</strong> Alcohol extraction (for triterpenes) followed by hot water extraction (for polysaccharides)</p>
              <p><strong>Benefits:</strong> Captures the complete spectrum of Reishi's compounds. Essential for full therapeutic potential.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Tea Decoction</h3>
              <p className="mb-2"><strong>Process:</strong> Simmer broken-up fruiting body for 1-2 hours</p>
              <p><strong>Benefits:</strong> Simple method for polysaccharides and some triterpenes. Traditional preparation method.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Tincture</h3>
              <p className="mb-2"><strong>Process:</strong> Soak in high-proof alcohol for 4-6 weeks</p>
              <p><strong>Benefits:</strong> Concentrated triterpene extraction. Good for stress and immune support.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Powdered Fruiting Body</h3>
              <p className="mb-2"><strong>Process:</strong> Dried and ground for capsules or powder</p>
              <p><strong>Benefits:</strong> Whole mushroom profile. May require higher doses for therapeutic effects.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Long-Term Tea</h3>
              <p className="mb-2"><strong>Process:</strong> Same tea batch reused multiple times over days</p>
              <p><strong>Benefits:</strong> Traditional method that extracts compounds gradually. Builds relationship with the medicine.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Cultivation Considerations</h2>
          <p className="mb-4">
            Reishi's medicinal compounds develop over time. Cultivation practices can influence the final therapeutic profile of the mushroom.
          </p>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Maturity and Harvest Timing</h3>
              <p>Triterpene content increases as the mushroom matures. Fruiting bodies should be harvested when fully formed but before excessive spore release. Different maturity stages have different compound ratios.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Morphology Effects</h3>
              <p>Antler forms may have different compound profiles than conks. Environmental conditions during growth influence the final chemical composition.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Substrate Influence</h3>
              <p>Hardwood substrates support the highest quality Reishi. The tree species and substrate preparation affect mineral content and compound production.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Processing Methods</h3>
              <p>Low-temperature drying preserves heat-sensitive compounds. Avoid high-heat processing that can degrade triterpenes and polysaccharides.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Usage Guidelines</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Typical Dosages</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li><strong>Dual extract:</strong> 500-2000mg daily</li>
                <li><strong>Tea:</strong> 1-2 cups daily (1-2 tsp dried mushroom per cup)</li>
                <li><strong>Tincture:</strong> 30-60 drops, 2-3 times daily</li>
                <li><strong>Powder:</strong> 1-2g daily</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Safety Considerations</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Generally safe with low toxicity profile</li>
                <li>May cause digestive upset or allergic reactions in sensitive individuals</li>
                <li>Can thin blood; consult healthcare providers before use</li>
                <li>May interact with blood thinners and immunosuppressants</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Quality Indicators</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Choose wildcrafted or organically grown Reishi</li>
                <li>Look for products tested for triterpene content</li>
                <li>Verify dual extraction methods for comprehensive compounds</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Traditional Context</h2>
          <p className="mb-4">
            In traditional Chinese medicine, Reishi is considered a "superior herb" - one of the most valuable tonic medicines. It's classified as sweet and neutral, entering the Heart, Liver, Lung, and Kidney meridians. Used for "nourishing the heart and pacifying the spirit," it was traditionally reserved for emperors and Taoist priests.
          </p>
          <p>
            This traditional context emphasizes Reishi's role in supporting spiritual cultivation and longevity, not just physical health. The mushroom was seen as a bridge between the physical and spiritual realms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Next Steps</h2>

          <RelatedIssues
            related={[
              { title: "Medicinal Lion's Mane", href: "/medicinal-mushrooms/lions-mane" },
              { title: "Preparation Methods", href: "/medicinal-mushrooms/preparation" },
              { title: "Reishi Growing Guide", href: "/growing-guides/reishi" },
            ]}
          />
        </section>
      </div>
    </div>
  );
}