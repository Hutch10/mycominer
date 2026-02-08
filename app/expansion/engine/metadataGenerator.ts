import { ContentSeed, GeneratedMetadata, MetadataAuditReport, PageKind } from './expansionTypes';

const REQUIRED_FIELDS: (keyof GeneratedMetadata)[] = ['title', 'description', 'keywords', 'tags'];

function buildTitle(seed: ContentSeed): string {
  const kindLabel: Record<PageKind, string> = {
    species: 'Species Guide',
    substrate: 'Substrate Profile',
    troubleshooting: 'Troubleshooting Playbook',
    guide: 'Practical Guide',
    'advanced-module': 'Advanced Module',
  };
  return `${seed.title} · ${kindLabel[seed.kind]}`;
}

function buildDescription(seed: ContentSeed): string {
  return `${seed.summary.trim()} (Audience: ${seed.audience})`;
}

function buildKeywords(seed: ContentSeed): string[] {
  const base = [seed.title, seed.primaryTag, seed.kind, seed.audience, seed.goal ?? ''];
  if (seed.species) base.push(seed.species);
  return Array.from(new Set(base.filter(Boolean).map((k) => k.toLowerCase())));
}

export function autoGenerateMetadata(seed: ContentSeed, tags: string[]): GeneratedMetadata {
  return {
    title: buildTitle(seed),
    description: buildDescription(seed),
    keywords: buildKeywords(seed),
    tags: Array.from(new Set(tags)),
  };
}

export function validateMetadata(metadata: GeneratedMetadata): MetadataAuditReport {
  const missing: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  for (const field of REQUIRED_FIELDS) {
    const value = metadata[field];
    const isEmpty = Array.isArray(value) ? value.length === 0 : !value;
    if (isEmpty) missing.push(field);
  }

  if (metadata.description.length < 60) {
    warnings.push('Description is shorter than 60 characters.');
    suggestions.push('Extend description to clarify intent and audience.');
  }

  if (metadata.keywords.length < 3) {
    warnings.push('Fewer than 3 keywords provided.');
    suggestions.push('Add domain-specific and audience-level keywords.');
  }

  const duplicateKeywords = metadata.keywords.filter((kw, idx, arr) => arr.indexOf(kw) !== idx);
  if (duplicateKeywords.length > 0) {
    warnings.push('Duplicate keywords detected.');
    suggestions.push('Deduplicate keywords for cleaner SEO.');
  }

  const lowerTags = metadata.tags.map((t) => t.toLowerCase());
  const uniqueTags = Array.from(new Set(lowerTags));
  if (uniqueTags.length !== metadata.tags.length) {
    warnings.push('Duplicate tags detected.');
    suggestions.push('Normalize and deduplicate tags.');
  }

  return {
    missing,
    warnings,
    suggestions,
    generatedMetadata: metadata,
  };
}
