import type { Metadata } from 'next';
import SectionHeader from '../components/SectionHeader';
import Breadcrumbs from '../components/Breadcrumbs';
import GraphPageClient from './GraphPageClient';

export const metadata: Metadata = {
  title: 'Knowledge Graph Explorer - Network Visualization',
  description: 'Explore the knowledge graph as an interactive network. Visualize relationships between species, substrates, environmental parameters, troubleshooting issues, and conceptual clusters.',
  keywords: ['knowledge graph', 'visualization', 'network', 'relationships', 'species', 'substrates', 'environment'],
  other: {
    tags: ['knowledge-graph', 'tools', 'visualization', 'network', 'advanced'].join(','),
  },
};

export default function GraphPage() {
  return (
    <div className="flex flex-col max-w-7xl mx-auto px-4 py-8 min-h-screen">
      <Breadcrumbs />
      <SectionHeader
        title="Knowledge Graph Explorer"
        subtitle="Interactive visualization of the platform's semantic network. Explore relationships between species, substrates, environmental parameters, troubleshooting issues, and knowledge clusters."
      />

      <div className="mt-6 flex-1">
        <GraphPageClient />
      </div>
    </div>
  );
}
