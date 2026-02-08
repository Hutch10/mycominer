import {
  ContentSeed,
  GeneratedContent,
  GeneratedSection,
  KnowledgeGraphEdge,
  KnowledgeGraphNode,
  RelatedLink,
  SafetyReport,
} from './expansionTypes';
import { autoGenerateMetadata } from './metadataGenerator';
import { generateTagSuggestions } from './tagGenerator';
import { KNOWLEDGE_CLUSTERS } from '../../intelligence/utils';
import { searchIndex } from '../../searchIndex';

const KNOWN_SPECIES = new Set([
  'oyster',
  'lions-mane',
  'shiitake',
  'reishi',
  'turkey-tail',
  'enoki',
  'pioppino',
  'chestnut',
  'king-oyster',
  'cordyceps',
]);

function safetyCheck(seed: ContentSeed): SafetyReport {
  const issues: string[] = [];
  const warnings: string[] = [];

  if (seed.species && !KNOWN_SPECIES.has(seed.species)) {
    issues.push(`Species ${seed.species} is not whitelisted.`);
  }

  if (seed.kind === 'advanced-module' && seed.audience === 'beginner') {
    warnings.push('Advanced module targeted at beginners; verify scaffolding.');
  }

  return {
    status: issues.length === 0 ? 'pass' : 'fail',
    issues,
    warnings,
  };
}

function buildSections(seed: ContentSeed): GeneratedSection[] {
  switch (seed.kind) {
    case 'species':
      return [
        {
          title: 'Context & Ecology',
          body: seed.summary,
          bullets: [
            'Habitat preferences and natural ecosystem',
            'Growth temperature band and tolerance range',
            'Beginner vs advanced considerations',
            'Ecological role and competition patterns',
          ],
        },
        {
          title: 'Substrate Fit & Colonization',
          body: 'Primary substrates, supplementation rates, and colonization timelines.',
          bullets: [
            'Preferred base materials (hardwood, grain, straw)',
            'Supplementation rates and additives',
            'Moisture content and water activity targets',
            'Colonization temperature and timeline',
          ],
        },
        {
          title: 'Fruiting Conditions & Parameters',
          body: 'Environmental triggers and maintenance for steady, healthy production.',
          bullets: [
            'Temperature drop requirements (if any)',
            'Humidity and surface moisture targets',
            'FAE rhythm and air exchange rate',
            'Light requirements and photoperiod',
            'Pinning triggers and pin-set management',
          ],
        },
        {
          title: 'Yield & Quality Traits',
          body: 'What to expect in size, flavor, yield, and sensory quality.',
          bullets: ['Expected flushes and total yield', 'Cap color and texture development', 'Harvest timing for peak quality'],
        },
        {
          title: 'Common Issues & Solutions',
          body: 'Species-specific problems and how to diagnose and prevent them.',
          bullets: ['Slow colonization patterns', 'Pinning failures or side pinning', 'Quality and morphology defects'],
        },
      ];
    case 'substrate':
      return [
        {
          title: 'Composition & Properties',
          body: seed.summary,
          bullets: ['Base materials and ratios', 'Additives and supplements', 'Water activity and hydration targets', 'Nutritional profile'],
        },
        {
          title: 'Preparation & Sterilization',
          body: 'Deterministic paths for substrate readiness, from materials to inoculation.',
          bullets: [
            'Pressure cooker protocol (time, PSI, cooling)',
            'Low-tech alternatives (boiling, oven, pasteurization)',
            'Moisture checks and equilibration',
            'Cooling and handling before inoculation',
          ],
        },
        {
          title: 'Species Compatibility Matrix',
          body: 'Match species to substrate for best results.',
          bullets: [
            'Ideal species for this substrate',
            'Species to avoid or use with caution',
            'Spawn ratio and inoculation density',
            'Expected colonization timeline',
          ],
        },
        {
          title: 'Contamination Ecology',
          body: 'Why this substrate succeeds or fails, and defense mechanisms.',
          bullets: [
            'Competitive advantage of target species',
            'Competitor species and mold pressures',
            'Sterilization criticality',
            'Signs of substrate degradation',
          ],
        },
        {
          title: 'Troubleshooting & Optimization',
          body: 'Detect and fix common substrate-related issues.',
          bullets: ['Moisture problems (too wet, too dry)', 'Colonization slowdown or stall', 'Contamination and prevention'],
        },
      ];
    case 'troubleshooting':
      return [
        {
          title: 'Symptom Pattern & Recognition',
          body: seed.summary,
          bullets: [
            'Visual cues and morphology changes',
            'Timeline relative to colonization stage',
            'Risk assessment (minor vs critical)',
          ],
        },
        {
          title: 'Ecological Root Causes',
          body: 'Map symptoms to underlying environmental, process, or biological causes.',
          bullets: [
            'Environmental mismatch (temp, humidity, FAE, light)',
            'Process drift (timing, handling, sanitation)',
            'Competing organisms and contamination',
          ],
        },
        {
          title: 'Diagnostic Checks & Measurements',
          body: 'Deterministic observations before interventions.',
          bullets: [
            'Visual inspection protocol',
            'Environmental meter readings (thermometer, hygrometer, etc)',
            'Substrate texture and smell assessment',
            'Growth patterns and progression',
          ],
        },
        {
          title: 'Corrective Actions & Reversibility',
          body: 'How to fix it, with reversible steps first.',
          bullets: ['Non-invasive adjustments (light, FAE, humidity)', 'Substrate interventions', 'Rollback and recovery plans'],
        },
        {
          title: 'Prevention & Systems Design',
          body: 'Prevent recurrence through setup and process improvements.',
          bullets: [
            'Optimal chamber design and microclimate control',
            'Pre-inoculation substrate and spawn checks',
            'Monitoring and logging routines',
          ],
        },
      ];
    case 'guide':
      return [
        {
          title: 'Objective & Scope',
          body: seed.summary,
          bullets: ['What success looks like', 'Constraints and assumptions', 'Prerequisites and skill level'],
        },
        {
          title: 'Ordered Steps & Checkpoints',
          body: 'Deterministic, sequential steps with go/no-go criteria.',
          bullets: [
            'Preparation phase: gather materials, setup',
            'Execution phase: ordered actions',
            'Verification phase: check for success',
            'Stabilization phase: maintain conditions',
          ],
        },
        {
          title: 'Quality Gates & Signals',
          body: 'Know when to proceed to the next phase.',
          bullets: [
            'Visual indicators of progress',
            'Timing thresholds before moving forward',
            'Environmental metric targets',
          ],
        },
        {
          title: 'Troubleshooting Within Workflow',
          body: 'If something goes wrong, diagnose and adjust.',
          bullets: [
            'Common blockers at each phase',
            'Quick adjustments vs rollback',
            'When to seek additional resources',
          ],
        },
      ];
    case 'advanced-module':
    default:
      return [
        {
          title: 'Systems Principle & Framing',
          body: seed.summary,
          bullets: ['Core insight or ecological principle', 'Assumptions and boundary conditions', 'Why this matters in cultivation'],
        },
        {
          title: 'Executable Playbook',
          body: 'Reversible, observable moves to implement the principle.',
          bullets: ['Setup phase: instrumenting and preparing', 'Run phase: execute the experiment', 'Observe phase: collect data', 'Rollback plan if needed'],
        },
        {
          title: 'Instrumentation & Metrics',
          body: 'What to log, measure, and visualize.',
          bullets: ['Sensor placement and types', 'Logging cadence and duration', 'Data to track and analyze'],
        },
        {
          title: 'Results Interpretation',
          body: 'How to read the data and iterate.',
          bullets: [
            'Success criteria and signal patterns',
            'Variance and noise filtering',
            'When to repeat or pivot the experiment',
          ],
        },
      ];
  }
}

function buildRelated(seed: ContentSeed): RelatedLink[] {
  const base: RelatedLink[] = [];

  // Find related pages from searchIndex based on tags and seed properties
  const relatedPages = searchIndex
    .filter((page) => {
      if (seed.path === page.path) return false;
      const hasCommonTag = page.tags.some((tag) => seed.primaryTag.includes(tag) || tag.includes(seed.primaryTag));
      const isSpeciesMatch = seed.species && page.tags.includes(seed.species);
      return hasCommonTag || isSpeciesMatch;
    })
    .slice(0, 3)
    .map((page) => ({ title: page.title, href: page.path }));

  base.push(...relatedPages);

  // Add type-specific related pages
  if (seed.kind === 'species' && seed.species) {
    base.push(
      { title: 'Species Comparison Matrix', href: '/tools/species-comparison-matrix' },
      { title: 'Substrate Selector', href: '/tools/substrate-selector' }
    );
  }
  if (seed.kind === 'substrate') {
    base.push({ title: 'Species Comparison Matrix', href: '/tools/species-comparison-matrix' });
  }
  if (seed.kind === 'troubleshooting') {
    base.push(
      { title: 'Troubleshooting Decision Tree', href: '/tools/troubleshooting-decision-tree' },
      { title: 'Troubleshooting Overview', href: '/troubleshooting/overview' }
    );
  }
  if (seed.kind === 'advanced-module') {
    base.push(
      { title: 'Knowledge Graph Explorer', href: '/graph' },
      { title: 'Advanced Overview', href: '/advanced' }
    );
  }

  // Remove duplicates
  const seen = new Set<string>();
  return base.filter((link) => {
    if (seen.has(link.href)) return false;
    seen.add(link.href);
    return true;
  });
}

function buildKnowledgeGraph(seed: ContentSeed, tags: string[]): { nodes: KnowledgeGraphNode[]; edges: KnowledgeGraphEdge[] } {
  const seedNode: KnowledgeGraphNode = {
    id: seed.id,
    label: seed.title,
    type: seed.kind,
    tags,
  };

  const edges: KnowledgeGraphEdge[] = tags.map((tag) => ({
    from: seed.id,
    to: tag,
    relation: 'tagged-as',
    rationale: 'Auto-generated semantic tag',
  }));

  if (seed.species) {
    edges.push({ from: seed.id, to: seed.species, relation: 'species', rationale: 'Species-specific linkage' });
  }

  // Link to knowledge clusters
  for (const [clusterName, clusterTags] of Object.entries(KNOWLEDGE_CLUSTERS)) {
    const matchedTags = tags.filter((tag) => clusterTags.includes(tag));
    if (matchedTags.length > 0) {
      edges.push({
        from: seed.id,
        to: clusterName,
        relation: 'cluster-member',
        rationale: `Matches ${matchedTags.length} cluster tags: ${matchedTags.slice(0, 2).join(', ')}`,
      });
    }
  }

  return { nodes: [seedNode], edges };
}

function deterministicHash(seed: ContentSeed): string {
  return ['expansion', seed.kind, seed.id, seed.title.length, seed.summary.length].join('-');
}

export function generateContent(seed: ContentSeed): GeneratedContent {
  const safety = safetyCheck(seed);
  const sections = buildSections(seed);
  const tagReport = generateTagSuggestions(seed);
  const metadata = autoGenerateMetadata(seed, tagReport.proposed);
  const related = buildRelated(seed);
  const slug = `${seed.kind}/${seed.id}`;

  return {
    seed,
    slug,
    path: `/${slug}`,
    metadata,
    sections,
    related,
    tags: tagReport.proposed,
    knowledgeGraph: buildKnowledgeGraph(seed, tagReport.proposed),
    safety,
    audit: {
      deterministicHash: deterministicHash(seed),
      generatedAt: new Date().toISOString(),
      engineVersion: '0.1.0',
    },
  };
}
