import type { Metadata } from 'next';
import SectionHeader from '../../components/SectionHeader';
import Breadcrumbs from '../../components/Breadcrumbs';
import RelatedIssues from '../../components/RelatedIssues';

export const metadata: Metadata = {
  title: "Lion's Mane Mushroom - Medicinal Benefits & Research",
  description: "Evidence-based overview of lion's mane (Hericium erinaceus) medicinal properties, including cognitive health, nerve growth factors, and preparation methods.",
  keywords: ['lions mane', 'Hericium erinaceus', 'medicinal mushroom', 'cognitive health', 'NGF', 'nerve growth', 'nootropic'],
  other: {
    tags: ['medicinal', 'lions-mane', 'cognitive', 'nerve-health', 'research'].join(','),
  },
};

export default function LionsManeMedicinalPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Breadcrumbs />
      <SectionHeader
        title="Lion's Mane Medicinal Properties"
        subtitle="Understanding Hericium erinaceus as a medicinal mushroom"
      />

      <div className="space-y-8 text-gray-800 dark:text-gray-200">
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Ecological Context</h2>
          <p className="mb-4">
            Lion's Mane (Hericium erinaceus) grows as a saprotrophic fungus on dead or dying hardwood trees in temperate forests. Its cascading white spines create a distinctive appearance that earned it the name "bearded tooth fungus." In nature, it plays a crucial role in decomposition, breaking down lignin-rich wood that other fungi cannot access. This ecological adaptation to hardwood decomposition has led to the development of unique compounds that support neurological health.
          </p>
          <p>
            The mushroom's preference for old-growth forests and wounded trees reflects its role as a late-stage decomposer. This ecological niche has shaped its medicinal properties, particularly its ability to support nerve regeneration and cognitive function.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Medicinal Properties</h2>
          <p className="mb-4">
            Lion's Mane has been used for centuries in traditional East Asian medicine for supporting digestive health and cognitive function. Modern research has focused on its potential neuroprotective and neuroregenerative effects. The mushroom contains compounds that may support nerve growth factor (NGF) production and myelin formation.
          </p>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Cognitive Support</h3>
              <p>Studies suggest Lion's Mane may support memory, focus, and mental clarity. The erinacines and hericenones appear to cross the blood-brain barrier and stimulate nerve growth factor pathways.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Nervous System Health</h3>
              <p>Research indicates potential benefits for nerve regeneration and myelin repair. This makes it of interest for supporting neurological health and recovery from nerve-related conditions.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Mood and Emotional Balance</h3>
              <p>Traditional use includes support for emotional well-being and stress resilience. Modern studies explore its effects on mood regulation and anxiety reduction.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Digestive Health</h3>
              <p>Historically used for gastrointestinal support. The mushroom's polysaccharides may help maintain healthy gut flora and digestive function.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Key Bioactive Compounds</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Hericenones</h3>
              <p className="mb-2"><strong>Location:</strong> Fruiting body</p>
              <p>Low-molecular-weight compounds that may stimulate nerve growth factor (NGF) production. Hericenones are unique to the mature fruiting body and may not be present in mycelium-only products.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Erinacines</h3>
              <p className="mb-2"><strong>Location:</strong> Mycelium</p>
              <p>Cytochalasans that can cross the blood-brain barrier. Erinacines are produced during active mycelial growth and may convert to hericenones during fruiting. Research suggests they support neuronal health and cognitive function.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Beta-Glucans</h3>
              <p className="mb-2"><strong>Location:</strong> Both fruiting body and mycelium</p>
              <p>Polysaccharides that support immune function and may have anti-inflammatory effects. These compounds contribute to the mushroom's overall health-supporting properties.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Other Compounds</h3>
              <p>Contains various terpenoids, sterols, and polyphenols that contribute to its antioxidant and anti-inflammatory effects.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Research Overview</h2>
          <p className="mb-4">
            Scientific interest in Lion's Mane has grown significantly in recent decades. While traditional use spans centuries, modern research has focused on neurological applications.
          </p>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Neurological Studies</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Animal studies show increased NGF production and nerve regeneration</li>
                <li>Research on cognitive function in older adults suggests memory support</li>
                <li>Potential applications in neurodegenerative conditions</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Immune System Research</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Beta-glucans support immune cell activity</li>
                <li>Anti-inflammatory effects may benefit autoimmune conditions</li>
                <li>Potential for supporting recovery from illness</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Digestive Health</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Traditional use for gastrointestinal support</li>
                <li>May help maintain healthy gut microbiome</li>
                <li>Potential for supporting digestive regularity</li>
              </ul>
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Note: While research is promising, more large-scale human studies are needed. Lion's Mane should not replace conventional medical treatment.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Preparation Methods</h2>
          <p className="mb-4">
            Different preparation methods extract different compounds. The choice depends on your goals and the form of Lion's Mane available.
          </p>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Dual Extraction (Recommended)</h3>
              <p className="mb-2"><strong>Process:</strong> Alcohol extraction followed by hot water extraction</p>
              <p><strong>Benefits:</strong> Captures both fat-soluble (hericenones) and water-soluble compounds. Most comprehensive method for medicinal use.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Fruiting Body Powder</h3>
              <p className="mb-2"><strong>Process:</strong> Dried mushrooms ground into powder</p>
              <p><strong>Benefits:</strong> Whole mushroom profile, good for culinary use. May require higher doses for therapeutic effects.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Mycelium Extracts</h3>
              <p className="mb-2"><strong>Process:</strong> Liquid culture or grain-based mycelium extraction</p>
              <p><strong>Benefits:</strong> High erinacine content, often more affordable. May lack hericenones found only in fruiting bodies.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Culinary Preparation</h3>
              <p className="mb-2"><strong>Process:</strong> Fresh mushrooms sautéed, steamed, or added to soups</p>
              <p><strong>Benefits:</strong> Delicious way to consume, supports overall health. Lower therapeutic doses than extracts.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Cultivation Considerations</h2>
          <p className="mb-4">
            Growing methods can significantly affect medicinal compound production. Understanding these relationships helps optimize cultivation for therapeutic use.
          </p>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Fruiting Body vs. Mycelium</h3>
              <p>Hericenones are primarily found in mature fruiting bodies, while erinacines are produced in actively growing mycelium. Both forms have therapeutic value but different compound profiles.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Substrate Quality</h3>
              <p>Hardwood-based substrates support the highest medicinal compound production. The lignin-degrading enzymes produced during growth contribute to therapeutic effects.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Harvest Timing</h3>
              <p>Spines should be harvested when flexible but fully formed. Over-mature mushrooms may lose potency, while under-mature ones may have lower compound concentrations.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Drying Methods</h3>
              <p>Low-temperature drying (below 104°F/40°C) preserves heat-sensitive compounds. Avoid high-heat processing that can degrade therapeutic molecules.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Usage Guidelines</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Typical Dosages</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li><strong>Dual extract:</strong> 500-1000mg daily</li>
                <li><strong>Fruiting body powder:</strong> 1-2g daily</li>
                <li><strong>Fresh mushrooms:</strong> 50-100g several times weekly</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Safety Considerations</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Generally well-tolerated with low risk of side effects</li>
                <li>May cause mild digestive upset in sensitive individuals</li>
                <li>Consult healthcare providers before use, especially if pregnant or taking medications</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Quality Indicators</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Look for products tested for active compounds</li>
                <li>Choose organic, sustainably harvested sources</li>
                <li>Verify extraction methods match intended use</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Next Steps</h2>

          <RelatedIssues
            related={[
              { title: "Medicinal Reishi", href: "/medicinal-mushrooms/reishi" },
              { title: "Preparation Methods", href: "/medicinal-mushrooms/preparation" },
              { title: "Lion's Mane Growing Guide", href: "/growing-guides/lions-mane" },
            ]}
          />
        </section>
      </div>
    </div>
  );
}