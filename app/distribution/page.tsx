'use client';

import React, { useState, useEffect } from 'react';
import {
  Package,
  Rocket,
  Shield,
  AlertCircle,
  TrendingUp,
  Download,
  CheckCircle,
  Clock,
  Users,
  Globe,
  Activity,
} from 'lucide-react';

interface BuildArtifact {
  id: string;
  version: string;
  platform: string;
  channel: 'stable' | 'beta' | 'nightly';
  status: 'building' | 'success' | 'failed';
  buildDate: string;
  size: number;
  downloads: number;
  checksum: string;
}

interface ReleaseChannel {
  name: string;
  version: string;
  rolloutPercentage: number;
  activeDevices: number;
  lastUpdated: string;
  status: 'active' | 'paused' | 'rolling';
}

interface StoreSubmission {
  platform: 'ios' | 'android';
  version: string;
  status: 'pending' | 'review' | 'approved' | 'rejected';
  submittedDate: string;
  reviewNotes?: string;
}

interface MDMDeployment {
  provider: 'intune' | 'jamf' | 'workspace-one';
  version: string;
  targetGroups: number;
  deployed: number;
  inProgress: number;
  failed: number;
  lastSync: string;
}

export default function DistributionDashboard() {
  const [activeTab, setActiveTab] = useState<
    'artifacts' | 'channels' | 'stores' | 'mdm' | 'analytics' | 'compliance'
  >('artifacts');

  const [artifacts, setArtifacts] = useState<BuildArtifact[]>([]);
  const [channels, setChannels] = useState<ReleaseChannel[]>([]);
  const [submissions, setSubmissions] = useState<StoreSubmission[]>([]);
  const [mdmDeployments, setMDMDeployments] = useState<MDMDeployment[]>([]);

  useEffect(() => {
    // Load distribution data
    loadDistributionData();
  }, []);

  const loadDistributionData = async () => {
    // Mock data - replace with actual API calls
    setArtifacts([
      {
        id: '1',
        version: '2.1.0',
        platform: 'Windows x64',
        channel: 'stable',
        status: 'success',
        buildDate: '2026-01-21T10:30:00Z',
        size: 125000000,
        downloads: 4523,
        checksum: 'sha256:abc123...',
      },
      {
        id: '2',
        version: '2.1.0',
        platform: 'macOS arm64',
        channel: 'stable',
        status: 'success',
        buildDate: '2026-01-21T10:32:00Z',
        size: 118000000,
        downloads: 2145,
        checksum: 'sha256:def456...',
      },
      {
        id: '3',
        version: '2.1.1-beta',
        platform: 'iOS',
        channel: 'beta',
        status: 'building',
        buildDate: '2026-01-21T11:00:00Z',
        size: 0,
        downloads: 0,
        checksum: '',
      },
    ]);

    setChannels([
      {
        name: 'Stable',
        version: '2.1.0',
        rolloutPercentage: 100,
        activeDevices: 15234,
        lastUpdated: '2026-01-21T10:30:00Z',
        status: 'active',
      },
      {
        name: 'Beta',
        version: '2.1.1-beta',
        rolloutPercentage: 50,
        activeDevices: 1523,
        lastUpdated: '2026-01-21T11:00:00Z',
        status: 'rolling',
      },
      {
        name: 'Nightly',
        version: '2.2.0-nightly.20260121',
        rolloutPercentage: 10,
        activeDevices: 234,
        lastUpdated: '2026-01-21T06:00:00Z',
        status: 'active',
      },
    ]);

    setSubmissions([
      {
        platform: 'ios',
        version: '2.1.0',
        status: 'approved',
        submittedDate: '2026-01-20T14:00:00Z',
      },
      {
        platform: 'android',
        version: '2.1.0',
        status: 'review',
        submittedDate: '2026-01-21T09:00:00Z',
        reviewNotes: 'In review - ETA 24-48 hours',
      },
    ]);

    setMDMDeployments([
      {
        provider: 'intune',
        version: '2.1.0',
        targetGroups: 150,
        deployed: 142,
        inProgress: 6,
        failed: 2,
        lastSync: '2026-01-21T11:15:00Z',
      },
      {
        provider: 'jamf',
        version: '2.1.0',
        targetGroups: 85,
        deployed: 85,
        inProgress: 0,
        failed: 0,
        lastSync: '2026-01-21T11:10:00Z',
      },
    ]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Rocket className="w-8 h-8 text-purple-400" />
            <h1 className="text-4xl font-bold">Distribution Center</h1>
          </div>
          <p className="text-gray-400">
            Enterprise packaging, app store distribution, and multi-channel delivery
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Package className="w-6 h-6" />}
            label="Build Artifacts"
            value="156"
            change="+12 this week"
            trend="up"
          />
          <StatCard
            icon={<Users className="w-6 h-6" />}
            label="Active Devices"
            value="16,991"
            change="+3.2% this month"
            trend="up"
          />
          <StatCard
            icon={<Download className="w-6 h-6" />}
            label="Total Downloads"
            value="234K"
            change="+5.1% this month"
            trend="up"
          />
          <StatCard
            icon={<Globe className="w-6 h-6" />}
            label="App Store Reach"
            value="142 countries"
            change="+8 new countries"
            trend="up"
          />
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b border-gray-800">
          {[
            { id: 'artifacts', label: 'Build Artifacts', icon: Package },
            { id: 'channels', label: 'Release Channels', icon: Activity },
            { id: 'stores', label: 'App Store Status', icon: Rocket },
            { id: 'mdm', label: 'MDM Deployments', icon: Shield },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp },
            { id: 'compliance', label: 'Compliance', icon: CheckCircle },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === id
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-6">
          {activeTab === 'artifacts' && <BuildArtifactsView artifacts={artifacts} />}
          {activeTab === 'channels' && <ReleaseChannelsView channels={channels} />}
          {activeTab === 'stores' && <AppStoreStatusView submissions={submissions} />}
          {activeTab === 'mdm' && <MDMDeploymentsView deployments={mdmDeployments} />}
          {activeTab === 'analytics' && <AnalyticsView />}
          {activeTab === 'compliance' && <ComplianceView />}
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({
  icon,
  label,
  value,
  change,
  trend,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
}) {
  return (
    <div className="bg-slate-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">{icon}</div>
        <TrendingUp className={`w-4 h-4 ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`} />
      </div>
      <div className="text-2xl font-bold mb-1">{value}</div>
      <div className="text-sm text-gray-400">{label}</div>
      <div className="text-xs text-gray-500 mt-2">{change}</div>
    </div>
  );
}

// Build Artifacts View
function BuildArtifactsView({ artifacts }: { artifacts: BuildArtifact[] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Build Artifacts</h2>
        <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors">
          Trigger New Build
        </button>
      </div>

      <div className="space-y-3">
        {artifacts.map((artifact) => (
          <div
            key={artifact.id}
            className="bg-slate-800/50 rounded-lg p-4 border border-gray-700 hover:border-purple-500/50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={`w-2 h-2 rounded-full ${
                    artifact.status === 'success'
                      ? 'bg-green-400'
                      : artifact.status === 'building'
                      ? 'bg-yellow-400 animate-pulse'
                      : 'bg-red-400'
                  }`}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{artifact.version}</span>
                    <span className="text-sm text-gray-400">{artifact.platform}</span>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        artifact.channel === 'stable'
                          ? 'bg-green-500/20 text-green-400'
                          : artifact.channel === 'beta'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-purple-500/20 text-purple-400'
                      }`}
                    >
                      {artifact.channel}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    {new Date(artifact.buildDate).toLocaleString()} •{' '}
                    {(artifact.size / 1024 / 1024).toFixed(2)} MB • {artifact.downloads} downloads
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {artifact.status === 'success' && (
                  <>
                    <button className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded transition-colors text-sm">
                      Download
                    </button>
                    <button className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded transition-colors text-sm">
                      Verify
                    </button>
                  </>
                )}
                {artifact.status === 'building' && (
                  <span className="text-sm text-yellow-400">Building...</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Release Channels View
function ReleaseChannelsView({ channels }: { channels: ReleaseChannel[] }) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">Release Channels</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {channels.map((channel) => (
          <div
            key={channel.name}
            className="bg-slate-800/50 rounded-lg p-6 border border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">{channel.name}</h3>
              <div
                className={`px-2 py-1 rounded text-xs ${
                  channel.status === 'active'
                    ? 'bg-green-500/20 text-green-400'
                    : channel.status === 'rolling'
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-gray-500/20 text-gray-400'
                }`}
              >
                {channel.status}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-400 mb-1">Current Version</div>
                <div className="font-mono text-purple-400">{channel.version}</div>
              </div>

              <div>
                <div className="text-sm text-gray-400 mb-1">Rollout Progress</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500"
                      style={{ width: `${channel.rolloutPercentage}%` }}
                    />
                  </div>
                  <span className="text-sm">{channel.rolloutPercentage}%</span>
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-400 mb-1">Active Devices</div>
                <div className="text-2xl font-bold">{channel.activeDevices.toLocaleString()}</div>
              </div>

              <div>
                <div className="text-sm text-gray-400 mb-1">Last Updated</div>
                <div className="text-sm">{new Date(channel.lastUpdated).toLocaleString()}</div>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button className="flex-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded transition-colors text-sm">
                Manage
              </button>
              {channel.status === 'rolling' && (
                <button className="px-3 py-2 bg-yellow-600 hover:bg-yellow-700 rounded transition-colors text-sm">
                  Pause
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// App Store Status View
function AppStoreStatusView({ submissions }: { submissions: StoreSubmission[] }) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">App Store Submissions</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {submissions.map((submission, index) => (
          <div
            key={index}
            className="bg-slate-800/50 rounded-lg p-6 border border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {submission.platform === 'ios' ? (
                  <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center text-2xl">
                    
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center text-2xl">
                    🤖
                  </div>
                )}
                <div>
                  <div className="font-semibold capitalize">{submission.platform}</div>
                  <div className="text-sm text-gray-400">Version {submission.version}</div>
                </div>
              </div>

              <div
                className={`px-3 py-1 rounded text-sm ${
                  submission.status === 'approved'
                    ? 'bg-green-500/20 text-green-400'
                    : submission.status === 'review'
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : submission.status === 'pending'
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'bg-red-500/20 text-red-400'
                }`}
              >
                {submission.status}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Submitted</span>
                <span>{new Date(submission.submittedDate).toLocaleDateString()}</span>
              </div>

              {submission.reviewNotes && (
                <div className="p-3 bg-slate-700/50 rounded text-sm">
                  <div className="text-gray-400 mb-1">Review Notes</div>
                  <div>{submission.reviewNotes}</div>
                </div>
              )}
            </div>

            <div className="mt-4 flex gap-2">
              <button className="flex-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded transition-colors text-sm">
                View Details
              </button>
              {submission.status === 'approved' && (
                <button className="px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded transition-colors text-sm">
                  Release
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// MDM Deployments View
function MDMDeploymentsView({ deployments }: { deployments: MDMDeployment[] }) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">Enterprise MDM Deployments</h2>

      <div className="space-y-4">
        {deployments.map((deployment, index) => (
          <div
            key={index}
            className="bg-slate-800/50 rounded-lg p-6 border border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8 text-purple-400" />
                <div>
                  <div className="font-semibold capitalize">{deployment.provider}</div>
                  <div className="text-sm text-gray-400">Version {deployment.version}</div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-bold">
                  {deployment.deployed}/{deployment.targetGroups}
                </div>
                <div className="text-sm text-gray-400">groups deployed</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{deployment.deployed}</div>
                <div className="text-xs text-gray-400">Deployed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{deployment.inProgress}</div>
                <div className="text-xs text-gray-400">In Progress</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">{deployment.failed}</div>
                <div className="text-xs text-gray-400">Failed</div>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Last Sync</span>
              <span>{new Date(deployment.lastSync).toLocaleString()}</span>
            </div>

            <div className="mt-4 flex gap-2">
              <button className="flex-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded transition-colors text-sm">
                Sync Now
              </button>
              <button className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded transition-colors text-sm">
                View Logs
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Analytics View
function AnalyticsView() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">Distribution Analytics</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Platform Distribution */}
        <div className="bg-slate-800/50 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Platform Distribution</h3>
          <div className="space-y-3">
            {[
              { platform: 'Windows', percentage: 45, color: 'bg-blue-500' },
              { platform: 'macOS', percentage: 25, color: 'bg-purple-500' },
              { platform: 'iOS', percentage: 18, color: 'bg-pink-500' },
              { platform: 'Android', percentage: 10, color: 'bg-green-500' },
              { platform: 'Web', percentage: 2, color: 'bg-yellow-500' },
            ].map((item) => (
              <div key={item.platform}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>{item.platform}</span>
                  <span>{item.percentage}%</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color}`} style={{ width: `${item.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Crash Rate */}
        <div className="bg-slate-800/50 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Crash-Free Rate</h3>
          <div className="text-center">
            <div className="text-5xl font-bold text-green-400 mb-2">99.7%</div>
            <div className="text-sm text-gray-400">Last 30 days</div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">152</div>
              <div className="text-xs text-gray-400">Total Crashes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">4.2s</div>
              <div className="text-xs text-gray-400">Avg Startup Time</div>
            </div>
          </div>
        </div>

        {/* Update Adoption */}
        <div className="bg-slate-800/50 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Update Adoption Rate</h3>
          <div className="space-y-3">
            {[
              { version: '2.1.0', adoption: 87, devices: 14823 },
              { version: '2.0.9', adoption: 10, devices: 1702 },
              { version: '2.0.8', adoption: 2, devices: 340 },
              { version: 'Older', adoption: 1, devices: 126 },
            ].map((item) => (
              <div key={item.version}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>{item.version}</span>
                  <span>
                    {item.adoption}% ({item.devices.toLocaleString()} devices)
                  </span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500"
                    style={{ width: `${item.adoption}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-slate-800/50 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Memory Usage</span>
                <span className="text-sm">avg 145 MB</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: '45%' }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">CPU Usage</span>
                <span className="text-sm">avg 12%</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: '12%' }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Network Bandwidth</span>
                <span className="text-sm">avg 2.3 Mbps</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500" style={{ width: '23%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Compliance View
function ComplianceView() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">Compliance & Security</h2>

      {/* Compliance Status */}
      <div className="bg-slate-800/50 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center gap-3 mb-6">
          <CheckCircle className="w-8 h-8 text-green-400" />
          <div>
            <h3 className="text-xl font-semibold">All Systems Compliant</h3>
            <p className="text-sm text-gray-400">Last checked: {new Date().toLocaleString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { check: 'Privacy Manifests', status: 'pass', details: 'iOS & Android compliant' },
            { check: 'Code Signing', status: 'pass', details: 'All artifacts signed' },
            { check: 'Encryption Export', status: 'pass', details: 'Compliance verified' },
            { check: 'SBOM Generation', status: 'pass', details: '156 artifacts documented' },
            { check: 'Permission Audit', status: 'pass', details: 'Minimal permissions used' },
            { check: 'Data Retention', status: 'pass', details: '90-day policy enforced' },
          ].map((item) => (
            <div
              key={item.check}
              className="flex items-start gap-3 p-4 bg-slate-900/50 rounded-lg border border-gray-800"
            >
              <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
              <div className="flex-1">
                <div className="font-medium">{item.check}</div>
                <div className="text-sm text-gray-400">{item.details}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security Alerts */}
      <div className="bg-slate-800/50 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Security Alerts</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
            <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
            <div className="flex-1">
              <div className="font-medium text-yellow-400">Certificate Expiring Soon</div>
              <div className="text-sm text-gray-400 mt-1">
                Apple Developer ID certificate expires in 45 days. Renew before March 7, 2026.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-green-500/10 rounded-lg border border-green-500/30">
            <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
            <div className="flex-1">
              <div className="font-medium text-green-400">No Active Security Issues</div>
              <div className="text-sm text-gray-400 mt-1">
                All distribution channels are secure and compliant.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
