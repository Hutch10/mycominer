import { Metadata } from 'next';
import { HardwareDashboard } from './components/HardwareDashboard';

export const metadata: Metadata = {
  title: 'Hardware Hub | Mushroom Cultivation',
  description: 'Connect environmental controllers, sensors, and IoT devices with safety-first orchestration.',
};

export default function HardwarePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
        <header className="space-y-2">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Hardware Hub</h1>
          <p className="text-lg text-gray-700 dark:text-gray-300">Optional, sandboxed integrations for environmental controllers, sensors, and automation hardware.</p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FeatureCard title="Modular Adapters" body="Web Bluetooth, Web Serial, WebUSB, WebSocket, MQTT (optional)" icon="🧩" />
          <FeatureCard title="Safety Layer" body="Range checks, no rapid oscillation, user approval required" icon="🛡️" />
          <FeatureCard title="Audit & Export" body="Local action logging with export for analysis" icon="📜" />
        </section>

        <HardwareDashboard />
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
