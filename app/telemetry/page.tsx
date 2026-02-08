import { Metadata } from 'next';
import { TelemetryDashboard } from './components/TelemetryDashboard';

export const metadata: Metadata = {
  title: 'Environmental Telemetry | Mushroom Cultivation',
  description: 'Real-time environmental monitoring for mushroom cultivation. Track temperature, humidity, CO₂, airflow, and light with automated alerts and recommendations.',
};

export default function TelemetryPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Environmental Telemetry</h1>
          <p className="text-lg text-gray-700 dark:text-gray-300">
            Monitor and optimize environmental conditions for your mushroom cultivation in real-time.
          </p>
        </div>

        {/* Feature Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">📊</div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Real-Time Charts</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Live visualization of environmental data</p>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">📡</div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Multiple Sensors</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Bluetooth, Serial, WebSocket, Mock adapters</p>
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">🚨</div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Smart Alerts</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Severity-based alerts with recommendations</p>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">🎯</div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Species Targets</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Optimized ranges for each species</p>
          </div>
        </div>

        {/* Dashboard */}
        <TelemetryDashboard />

        {/* Getting Started Section */}
        <div className="mt-12 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Getting Started</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">1. Select Species & Stage</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Choose your mushroom species and current growth stage to get species-specific environmental targets.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">2. Add Sensors</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Click "Add Sensor" to connect via Bluetooth, Serial, WebSocket, or try the mock demo sensor first.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">3. Monitor & Respond</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Watch real-time charts, respond to alerts, and follow recommendations to optimize conditions.
              </p>
            </div>
          </div>
        </div>

        {/* Integration Guide */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-blue-900 dark:text-blue-200 mb-4">Integration Features</h2>
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
            <li>✓ <strong>Knowledge Graph Integration:</strong> Alerts link to relevant troubleshooting guides</li>
            <li>✓ <strong>Coach Integration:</strong> Real-time environmental insights in Coach mode</li>
            <li>✓ <strong>Data Logging:</strong> Store readings for analysis (24-hour local storage)</li>
            <li>✓ <strong>Anomaly Detection:</strong> Automatic detection of unusual environmental patterns</li>
            <li>✓ <strong>Multi-Sensor Support:</strong> Monitor multiple locations simultaneously</li>
          </ul>
        </div>

        {/* Recommended Guides */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recommended Guides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a href="/foundations/environmental-parameters" className="block p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-gray-300 dark:hover:border-gray-700 transition">
              <h3 className="font-semibold text-gray-900 dark:text-white">Environmental Parameters</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Understand optimal ranges for mushroom cultivation</p>
            </a>
            <a href="/troubleshooting/overview" className="block p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-gray-300 dark:hover:border-gray-700 transition">
              <h3 className="font-semibold text-gray-900 dark:text-white">Troubleshooting Guide</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Diagnose and fix common environmental issues</p>
            </a>
            <a href="/guides" className="block p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-gray-300 dark:hover:border-gray-700 transition">
              <h3 className="font-semibold text-gray-900 dark:text-white">Growing Guides</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Species-specific cultivation instructions</p>
            </a>
            <a href="/tools/cultivation-system-map" className="block p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-gray-300 dark:hover:border-gray-700 transition">
              <h3 className="font-semibold text-gray-900 dark:text-white">System Map</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Explore cultivation systems and setups</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
