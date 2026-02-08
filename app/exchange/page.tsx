import { Metadata } from 'next';
import { ExchangeDashboard } from './components/ExchangeDashboard';

export const metadata: Metadata = {
  title: 'Knowledge Exchange Hub | Mushroom Cultivation',
  description: 'Anonymized, validated global knowledge exchange for cultivation insights.',
};

export default function ExchangePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
        <header className="space-y-2">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Knowledge Exchange Hub</h1>
          <p className="text-lg text-gray-700 dark:text-gray-300">Share anonymized, validated insights across facilities, researchers, and agents via the insight auditor.</p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <FeatureCard title="Anonymized" body="No raw telemetry or identifiers; only aggregated patterns" icon="🛡️" />
          <FeatureCard title="Validated" body="Hallucination checks, conflicts, and confidence scoring" icon="✅" />
          <FeatureCard title="Routed" body="Global graph updates with notifications" icon="🌐" />
          <FeatureCard title="Auditable" body="Full exchange logs exportable for research" icon="📜" />
        </section>

        <ExchangeDashboard />
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
