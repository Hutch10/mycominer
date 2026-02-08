import type { Metadata } from 'next';
import SectionHeader from '../../components/SectionHeader';
import Breadcrumbs from '../../components/Breadcrumbs';
import RelatedIssues from '../../components/RelatedIssues';

export const metadata: Metadata = {
  title: 'Medicinal Mushroom Preparation - Teas, Tinctures & Extracts',
  description: 'Complete guide to preparing medicinal mushrooms: hot water extraction, alcohol tinctures, dual extraction, powders, and bioavailability.',
  keywords: ['mushroom preparation', 'hot water extraction', 'dual extraction', 'tinctures', 'mushroom tea', 'bioavailability'],
  other: {
    tags: ['medicinal', 'preparation', 'extraction', 'tinctures', 'tea', 'bioavailability', 'methods'].join(','),
  },
};

export default function MedicinalPreparationPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Breadcrumbs />
      <SectionHeader
        title="Medicinal Mushroom Preparation Methods"
        subtitle="Understanding extraction techniques for maximizing therapeutic benefits"
      />

      <div className="space-y-8 text-gray-800 dark:text-gray-200">
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Ecological Context of Preparation</h2>
          <p className="mb-4">
            Medicinal mushrooms evolved complex chemical defenses and signaling compounds to survive in forest ecosystems. These bioactive molecules are often bound within tough cell walls or stored in ways that require specific extraction methods. Understanding fungal ecology helps us choose preparation techniques that respect the mushroom's natural chemistry and maximize therapeutic potential.
          </p>
          <p>
            Different compounds serve different ecological functions - polysaccharides for immune signaling, triterpenes for chemical defense, alkaloids for interspecies communication. Each requires different extraction approaches to become bioavailable to humans.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Hot Water Extraction</h2>
          <p className="mb-4">
            <strong>Ecological reasoning:</strong> Heat mimics the digestive processes of animals that consume mushrooms in nature. Hot water breaks down chitin cell walls and extracts water-soluble polysaccharides that fungi use for immune signaling and moisture retention.
          </p>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Best for:</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>Beta-glucans and polysaccharides</li>
              <li>Immune system support</li>
              <li>Turkey Tail, Shiitake, Maitake, Chaga</li>
            </ul>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Basic Tea Method:</h3>
              <ol className="list-decimal ml-6 space-y-2">
                <li>Use 1-2 teaspoons of dried, broken-up mushroom per cup of water</li>
                <li>Bring to a boil, then simmer for 20-60 minutes</li>
                <li>Strain and drink as tea, or reduce to concentrate</li>
                <li>Can be consumed 1-3 cups daily</li>
              </ol>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Long-Simmer Method:</h3>
              <ol className="list-decimal ml-6 space-y-2">
                <li>Simmer mushrooms for 2-4 hours to extract maximum polysaccharides</li>
                <li>Traditional method for Chaga and other hard mushrooms</li>
                <li>Results in concentrated, bitter extracts</li>
                <li>Can be refrigerated and consumed over several days</li>
              </ol>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Multiple Infusions:</h3>
              <ol className="list-decimal ml-6 space-y-2">
                <li>Re-use the same mushrooms for 3-5 infusions</li>
                <li>Each infusion extracts different compounds</li>
                <li>Builds a relationship with the medicine over time</li>
                <li>Traditional approach used in many cultures</li>
              </ol>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Alcohol Extraction</h2>
          <p className="mb-4">
            <strong>Ecological reasoning:</strong> Alcohol dissolves fat-soluble compounds that mushrooms produce as chemical defenses against herbivores and microbes. These compounds often have bitter tastes that deter consumption, reflecting their role in fungal survival strategies.
          </p>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Best for:</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>Triterpenes and terpenoids</li>
              <li>Liver support and stress response</li>
              <li>Reishi, Chaga, Lion's Mane mycelium</li>
            </ul>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Tincture Method:</h3>
              <ol className="list-decimal ml-6 space-y-2">
                <li>Break up dried mushrooms into small pieces</li>
                <li>Place in a jar and cover with high-proof alcohol (80-100 proof)</li>
                <li>Seal and store in a cool, dark place for 4-6 weeks</li>
                <li>Shake daily, then strain and bottle</li>
                <li>Take 30-60 drops, 2-3 times daily</li>
              </ol>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Double Extraction Preparation:</h3>
              <ol className="list-decimal ml-6 space-y-2">
                <li>Perform alcohol extraction first to capture fat-soluble compounds</li>
                <li>Remove mushrooms and perform hot water extraction on the marc</li>
                <li>Combine both extracts for full-spectrum medicine</li>
                <li>Essential for mushrooms like Reishi and Chaga</li>
              </ol>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Alcohol Selection:</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li><strong>Vodka (80 proof):</strong> Neutral flavor, good for most extractions</li>
                <li><strong>Brandy (80-100 proof):</strong> Adds depth, good for medicinal blends</li>
                <li><strong>Glycerin:</strong> Non-alcoholic option, extracts different compounds</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Dual Extraction</h2>
          <p className="mb-4">
            <strong>Ecological reasoning:</strong> Mushrooms contain both water-soluble and alcohol-soluble compounds that serve different ecological functions. Dual extraction honors this complexity by capturing the full range of bioactive molecules that evolved for different purposes in forest ecosystems.
          </p>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Best for:</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>Complete compound spectrum</li>
              <li>Full therapeutic potential</li>
              <li>Reishi, Chaga, Lion's Mane</li>
            </ul>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Standard Dual Extraction:</h3>
              <ol className="list-decimal ml-6 space-y-2">
                <li>Perform alcohol extraction for 4-6 weeks</li>
                <li>Strain out the mushrooms, reserving the alcohol extract</li>
                <li>Simmer the spent mushrooms in water for 1-2 hours</li>
                <li>Mix the alcohol and water extracts together</li>
                <li>Reduce or concentrate as desired</li>
              </ol>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Commercial Considerations:</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Look for products labeled as "dual extracted" or "full spectrum"</li>
                <li>Avoid products that use only one extraction method</li>
                <li>Check for standardized active compound levels</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Why Both Methods Matter:</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li><strong>Alcohol phase:</strong> Captures triterpenes, alkaloids, and other fat-soluble compounds</li>
                <li><strong>Water phase:</strong> Extracts polysaccharides, beta-glucans, and water-soluble nutrients</li>
                <li><strong>Combined:</strong> Provides synergistic effects of all active compounds</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Powdered Fruiting Body</h2>
          <p className="mb-4">
            <strong>Ecological reasoning:</strong> Consuming whole mushrooms preserves the natural balance of compounds that evolved together. Grinding mimics mechanical digestion, making nutrients accessible while maintaining the mushroom's complex ecological chemistry.
          </p>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Best for:</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>Whole food approach</li>
              <li>Nutrient synergy</li>
              <li>All medicinal mushrooms</li>
            </ul>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Preparation:</h3>
              <ol className="list-decimal ml-6 space-y-2">
                <li>Dry mushrooms thoroughly at low temperature (under 104°F/40°C)</li>
                <li>Grind into fine powder using a coffee grinder or mortar and pestle</li>
                <li>Store in airtight containers away from light and moisture</li>
                <li>Use within 6-12 months for maximum potency</li>
              </ol>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Usage Methods:</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li><strong>Capsules:</strong> Fill empty capsules with powder (300-500mg per capsule)</li>
                <li><strong>Smoothies:</strong> Blend into fruit smoothies for better absorption</li>
                <li><strong>Food incorporation:</strong> Add to soups, stews, or baked goods</li>
                <li><strong>Tea:</strong> Use powder directly in hot water</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Bioavailability Considerations:</h3>
              <p>Cell walls may limit absorption of some compounds. Cooking or fermentation can improve bioavailability by breaking down chitin barriers.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Culinary Preparation</h2>
          <p className="mb-4">
            <strong>Ecological reasoning:</strong> Cooking mushrooms replicates the digestive processes of forest animals. Heat breaks down cell walls and transforms compounds, making them more bioavailable while creating flavors that encourage consumption - an evolutionary adaptation for spore dispersal.
          </p>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Best for:</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>Regular consumption</li>
              <li>Nutrient accessibility</li>
              <li>Shiitake, Oyster, Maitake</li>
            </ul>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Cooking Methods:</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li><strong>Sautéing:</strong> Quick cooking preserves texture and flavor</li>
                <li><strong>Roasting:</strong> Concentrates flavors and creates Maillard compounds</li>
                <li><strong>Soups and stews:</strong> Long simmering extracts maximum nutrients</li>
                <li><strong>Pickling:</strong> Fermentation increases probiotic content</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Medicinal Benefits:</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Heat transforms compounds for better absorption</li>
                <li>Regular consumption builds therapeutic relationships</li>
                <li>Combines nutrition with medicine</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Species-Specific Approaches:</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li><strong>Shiitake:</strong> Best fresh, sautéed or in soups</li>
                <li><strong>Oyster:</strong> Delicate texture, quick cooking methods</li>
                <li><strong>Lion's Mane:</strong> Crispy when breaded and fried</li>
                <li><strong>Reishi:</strong> Bitter, best in long-cooked preparations</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Mycelium Products</h2>
          <p className="mb-4">
            <strong>Ecological reasoning:</strong> Mycelium represents the mushroom's active growth phase, producing different compounds than fruiting bodies. In nature, mycelium explores and colonizes substrates, creating enzymes and secondary metabolites for ecological interactions.
          </p>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Considerations:</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>Different compound profiles than fruiting bodies</li>
              <li>Often grown on grain substrates</li>
              <li>May contain grain-derived compounds</li>
              <li>Check for fruiting body content</li>
            </ul>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Quality Assessment:</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Look for products with some fruiting body material</li>
                <li>Avoid mycelium grown on cheap fillers</li>
                <li>Check for extraction methods used</li>
                <li>Verify active compound testing</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Best Applications:</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Lion's Mane mycelium for erinacines</li>
                <li>Cordyceps mycelium for energy support</li>
                <li>Reishi mycelium as affordable option</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Storage and Shelf Life</h2>
          <p className="mb-4">
            Proper storage preserves the ecological integrity of mushroom medicines. Different preparations have different stability profiles, reflecting how fungi naturally preserve their chemical defenses.
          </p>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Dried Mushrooms:</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Store in airtight containers in cool, dark place</li>
                <li>Shelf life: 1-2 years</li>
                <li>Check for moisture or mold before use</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Extracts and Tinctures:</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Keep in amber bottles away from light</li>
                <li>Shelf life: 2-5 years</li>
                <li>Alcohol preserves most compounds</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Powders and Capsules:</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Refrigerate for maximum potency</li>
                <li>Shelf life: 1-2 years</li>
                <li>Protect from humidity</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Choosing Preparation Methods</h2>
          <p className="mb-4">
            The best method depends on your goals, the mushroom species, and your lifestyle. Consider the ecological context - different compounds evolved for different purposes and require different approaches to access.
          </p>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">For Immune Support:</h3>
              <p>Hot water extraction for beta-glucans (Shiitake, Turkey Tail)</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">For Stress and Liver Support:</h3>
              <p>Dual extraction for triterpenes (Reishi, Chaga)</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">For Cognitive Support:</h3>
              <p>Dual extraction or powder (Lion's Mane)</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">For Daily Health:</h3>
              <p>Culinary use or powdered fruiting body</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Next Steps</h2>

          <RelatedIssues
            related={[
              { title: "Medicinal Reishi", href: "/medicinal-mushrooms/reishi" },
              { title: "Medicinal Lion's Mane", href: "/medicinal-mushrooms/lions-mane" },
              { title: "Growing Guides", href: "/growing-guides" },
            ]}
          />
        </section>
      </div>
    </div>
  );
}