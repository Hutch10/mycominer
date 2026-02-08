import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Expansion Engine Dashboard',
  description: 'Deterministic content expansion system with auditability, semantic tagging, and safety gates.',
  keywords: ['content expansion', 'automation', 'metadata validation', 'semantic tags', 'knowledge graph'],
  other: {
    tags: ['expansion', 'automation', 'content-engine', 'audit', 'semantic-tags', 'clusters'].join(','),
  },
};

export default function ExpansionLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
