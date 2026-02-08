import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Odd Mushroom Shapes - Environmental Morphology',
  description: 'Understand unusual mushroom morphology caused by environmental factors: airflow, CO2, light, contamination, and genetics.',
  keywords: ['odd shapes', 'mushroom morphology', 'deformed mushrooms', 'environmental effects', 'airflow', 'troubleshooting'],
  other: {
    tags: ['troubleshooting', 'morphology', 'shapes', 'environment', 'airflow', 'CO2', 'diagnosis'].join(','),
  },
};

export default function OddFruitShapes() {
  return (
    <main className="p-8 max-w-3xl mx-auto space-y-8">
      <h1 className="text-4xl font-bold mb-4">Odd Fruit Shapes</h1>
      <p className="text-lg text-gray-700 leading-relaxed">
        Unusual fruit shapes are usually environmental signals. Mushrooms adapt their morphology to airflow, humidity, CO₂, and available space.
      </p>

      <section>
        <h2 className="text-2xl font-semibold mb-3">Common Causes</h2>
        <ul className="list-disc ml-6 space-y-2 text-gray-700">
          <li>High CO₂ causing elongated stems</li>
          <li>Low humidity causing cracked or deformed caps</li>
          <li>Uneven lighting causing directional growth</li>
          <li>Physical obstruction or crowding</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-3">How to Improve Morphology</h2>
        <ul className="list-disc ml-6 space-y-2 text-gray-700">
          <li>Increase fresh air exchange</li>
          <li>Maintain stable humidity</li>
          <li>Provide even, indirect lighting</li>
          <li>Give fruits adequate space to develop</li>
        </ul>
      </section>
    </main>
  );
}