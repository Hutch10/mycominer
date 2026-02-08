import { Metadata } from 'next';
import { FacilityDashboard } from './components/FacilityDashboard';

export const metadata: Metadata = {
  title: 'Facility Dashboard | Mushroom Cultivation',
  description: 'Manage multi-room grow operations with orchestration, safety, and optimization.',
};

export default function FacilityPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
        <header className="space-y-2">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Facility Dashboard</h1>
          <p className="text-lg text-gray-700 dark:text-gray-300">Coordinate multiple grow rooms, devices, and automation loops with safety-first controls.</p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <FeatureCard title="Multi-Room Control" body="Parallel loops per room with isolation and observability" icon="🏠" />
          <FeatureCard title="Safety Engine" body="Cross-room checks for HVAC, power, contamination" icon="🛡️" />
          <FeatureCard title="Optimization" body="Energy, airflow, humidity, lighting, clustering" icon="📈" />
          <FeatureCard title="Audit & Export" body="Facility configs and logs exportable for analysis" icon="📦" />
        </section>

        <FacilityDashboard />
      </div>
    </div>
  );
}

function FeatureCard({ title, body, icon }: { title: string; body: string; icon: string }) {
  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
      <div className="text-2xl mb-2">{icon}</div>
      <p className="text-sm font-semibold text-gray-900 dark:text-white">{title}</p>
      <p className="text-xs text-gray-700 dark:text-gray-300 mt-1">{body}</p>
    </div>
  );
}
