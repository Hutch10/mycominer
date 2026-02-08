'use client';

import { ExpansionDashboard } from './components/ExpansionDashboard';
import { AuditActionPanel } from './components/AuditActionPanel';
import { generateContent } from './engine/contentGenerator';
import { validateMetadata } from './engine/metadataGenerator';
import { generateTagSuggestions } from './engine/tagGenerator';
import { generateClusterReport } from './engine/clusterGenerator';
import { updateAuditor } from './engine/updateAuditor';
import { ContentSeed } from './engine/expansionTypes';
import { useEffect, useState } from 'react';

const seeds: ContentSeed[] = [
  {
    kind: 'species',
    id: 'enoki-coldroom',
    title: 'Enoki Cold-Room Playbook',
    summary: 'Cold-tolerant enoki workflow with hydration targets, surface management, and needle-stem prevention.',
    primaryTag: 'enoki',
    audience: 'intermediate',
    species: 'enoki',
    constraints: ['no-hallucinated-species'],
  },
  {
    kind: 'troubleshooting',
    id: 'side-pinning-liner',
    title: 'Side Pinning Control',
    summary: 'Diagnose and prevent side pins with liner use, surface microclimate control, and light gradients.',
    primaryTag: 'side-pinning',
    audience: 'beginner',
    goal: 'Reduce side pins in monotubs',
  },
  {
    kind: 'advanced-module',
    id: 'fae-profiling',
    title: 'FAE Profiling for Dense Blocks',
    summary: 'Instrument and tune fresh air exchange to balance evaporation and CO₂ removal without desiccation.',
    primaryTag: 'fae-control',
    audience: 'advanced',
    goal: 'Stabilize evaporation with sensor-driven airflow',
  },
];

function buildDiffPreview(text: string) {
  const base = 'Existing content placeholder';
  return updateAuditor.diffText(base, text);
}

export default function ExpansionPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    updateAuditor.loadRecords();
  }, []);

  const generated = seeds.map((seed) => generateContent(seed));
  const metadataReports = generated.map((item) => validateMetadata(item.metadata));
  const tagReports = seeds.map((seed) => generateTagSuggestions(seed));
  const clusterReport = generateClusterReport(generated.flatMap((item) => item.tags));

  const diffText = generated[0].sections.map((section) => `${section.title}: ${section.body}`).join('\n');
  const diffs = buildDiffPreview(diffText);

  const auditRecords = generated.map((item, idx) =>
    updateAuditor.recordGeneration(item.path, 'create', item.metadata.title, idx === 0 ? diffs : undefined)
  );

  if (!mounted) return null;

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Expansion Dashboard</h1>
        <p className="text-gray-700 dark:text-gray-300 mt-2">
          Automated, deterministic content expansion with metadata, tags, clusters, and audit-ready diffs. No live pages
          are modified; outputs are staged for review.
        </p>
        <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
          <p>Safety gates: whitelist species, no hallucinated entries, environmental sanity checks.</p>
          <p>
            Quality gates: metadata validation, tag redundancy checks, cluster balance analysis, diff logging, audit
            history.
          </p>
        </div>
      </div>

      <AuditActionPanel
        records={auditRecords}
        onStatusChange={(id, status) => {
          updateAuditor.markStatus(id, status);
        }}
        onExport={() => {
          const json = updateAuditor.exportRecords();
          const blob = new Blob([json], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `expansion-audit-${Date.now()}.json`;
          a.click();
        }}
        onClearAll={() => {
          if (typeof window !== 'undefined' && window.confirm('Clear all audit records? This cannot be undone.')) {
            updateAuditor.clearRecords();
            window.location.reload();
          }
        }}
      />

      <ExpansionDashboard
        contents={generated}
        metadataReports={metadataReports}
        tagReports={tagReports}
        clusterReport={clusterReport}
        auditRecords={auditRecords}
        diffs={diffs}
      />
    </main>
  );
}
