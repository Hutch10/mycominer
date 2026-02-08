/**
 * Intelligence Layer Utilities
 * 
 * Core functions for the adaptive intelligence system that powers
 * recommendations, learning paths, and context-aware insights.
 */

import { searchIndex } from '../searchIndex';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface PageData {
  title: string;
  path: string;
  category: string;
  tags: string[];
}

export interface Recommendation {
  page: PageData;
  score: number;
  reason: string;
}

export interface LearningPath {
  level: 'beginner' | 'intermediate' | 'advanced';
  sequence: PageData[];
  estimatedDuration: string;
  objectives: string[];
}

export interface TroubleshootingInsight {
  symptom: string;
  possibleCauses: string[];
  relatedEnvironmental: string[];
  relatedSubstrate: string[];
  relatedSpecies: string[];
  recommendedPages: PageData[];
}

export interface SpeciesInsight {
  species: string;
  ecologicalNiche: string;
  substrateCompatibility: string[];
  environmentalRanges: {
    temperature: string;
    humidity: string;
    co2: string;
    fae: string;
  };
  difficultyLevel: string;
  relatedPages: PageData[];
}

// ============================================================================
// KNOWLEDGE GRAPH CLUSTERS
// ============================================================================

export const KNOWLEDGE_CLUSTERS = {
  'substrate-species-matching': [
    'substrates', 'species-matching', 'grain', 'sawdust', 'straw', 'coir',
    'hardwood', 'supplementation', 'logs', 'oyster', 'shiitake', 'lions-mane',
    'reishi', 'king-oyster', 'turkey-tail'
  ],
  'environmental-control': [
    'temperature', 'humidity', 'fae', 'co2', 'airflow', 'light', 'evaporation',
    'environmental-control', 'microclimate', 'pinning', 'fruiting'
  ],
  'contamination-prevention': [
    'contamination', 'sterile-technique', 'clean-technique', 'bacteria', 'mold',
    'trichoderma', 'green-mold', 'sterilization', 'pasteurization', 'competition',
    'prevention', 'defense'
  ],
  'cultivation-stages': [
    'inoculation', 'colonization', 'spawn-run', 'pinning', 'fruiting', 'primordia',
    'harvesting', 'life-cycle', 'substrate-readiness', 'senescence'
  ],
  'medicinal-properties': [
    'medicinal', 'beta-glucans', 'polysaccharides', 'triterpenes', 'nootropics',
    'immune', 'cognitive', 'preparation', 'extraction', 'tincture', 'lentinan',
    'cordycepin'
  ],
  'troubleshooting-diagnostics': [
    'troubleshooting', 'diagnostics', 'symptom-clusters', 'slow-colonization',
    'no-pins', 'aborts', 'overlay', 'fuzzy-feet', 'side-pinning', 'drying-caps',
    'stall', 'yellowing-mycelium', 'odd-fruit-shapes'
  ]
};

// ============================================================================
// CORE UTILITY FUNCTIONS
// ============================================================================

/**
 * Get related pages by semantic tags
 */
export function getRelatedByTags(
  currentTags: string[],
  limit: number = 5,
  excludePath?: string
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  for (const page of searchIndex) {
    if (excludePath && page.path === excludePath) continue;

    // Calculate tag overlap score
    const commonTags = page.tags.filter(tag => currentTags.includes(tag));
    const score = commonTags.length / Math.max(currentTags.length, page.tags.length);

    if (score > 0) {
      recommendations.push({
        page,
        score,
        reason: `Shares ${commonTags.length} tags: ${commonTags.slice(0, 3).join(', ')}`
      });
    }
  }

  return recommendations
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Get related pages by knowledge graph cluster
 */
export function getRelatedByCluster(
  tags: string[],
  limit: number = 5,
  excludePath?: string
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // Find which clusters the current page belongs to
  const matchedClusters = Object.entries(KNOWLEDGE_CLUSTERS)
    .filter(([_, clusterTags]) =>
      tags.some(tag => clusterTags.includes(tag))
    )
    .map(([name]) => name);

  // Find pages in the same clusters
  for (const page of searchIndex) {
    if (excludePath && page.path === excludePath) continue;

    const pageClusters = Object.entries(KNOWLEDGE_CLUSTERS)
      .filter(([_, clusterTags]) =>
        page.tags.some(tag => clusterTags.includes(tag))
      )
      .map(([name]) => name);

    const commonClusters = pageClusters.filter(c => matchedClusters.includes(c));

    if (commonClusters.length > 0) {
      recommendations.push({
        page,
        score: commonClusters.length,
        reason: `Related via ${commonClusters[0].replace(/-/g, ' ')} cluster`
      });
    }
  }

  return recommendations
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Get recommended next steps based on current page
 */
export function getRecommendedNextSteps(
  currentCategory: string,
  currentTags: string[],
  limit: number = 3
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // Define progression logic
  const progressionMap: Record<string, string[]> = {
    'Foundations': ['Beginner Pathway', 'Growing Guides', 'Tools'],
    'Beginner Pathway': ['Growing Guides', 'Troubleshooting', 'Tools'],
    'Growing Guides': ['Advanced', 'Troubleshooting', 'Medicinal Mushrooms'],
    'Troubleshooting': ['Foundations', 'Advanced', 'Tools'],
    'Advanced': ['Medicinal Mushrooms', 'Tools'],
    'Medicinal Mushrooms': ['Growing Guides', 'Advanced'],
    'Tools': ['Advanced', 'Growing Guides']
  };

  const nextCategories = progressionMap[currentCategory] || [];

  for (const page of searchIndex) {
    if (nextCategories.includes(page.category)) {
      // Prefer pages that share some tags (related content)
      const tagOverlap = page.tags.filter(tag => currentTags.includes(tag)).length;
      const score = tagOverlap + (nextCategories.indexOf(page.category) === 0 ? 2 : 1);

      recommendations.push({
        page,
        score,
        reason: `Next step: ${page.category}`
      });
    }
  }

  return recommendations
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Generate personalized learning path based on user level
 */
export function getLearningPathForUserLevel(
  level: 'beginner' | 'intermediate' | 'advanced'
): LearningPath {
  const paths: Record<typeof level, LearningPath> = {
    beginner: {
      level: 'beginner',
      sequence: searchIndex.filter(p =>
        p.path.includes('/beginner-pathway/') ||
        (p.category === 'Foundations' && p.tags.includes('beginner')) ||
        (p.category === 'Growing Guides' && p.tags.includes('oyster'))
      ).slice(0, 12),
      estimatedDuration: '4-6 weeks',
      objectives: [
        'Understand fungal ecology and mycelium basics',
        'Master clean technique and contamination prevention',
        'Successfully grow first oyster mushroom crop',
        'Develop troubleshooting instincts'
      ]
    },
    intermediate: {
      level: 'intermediate',
      sequence: searchIndex.filter(p =>
        p.category === 'Growing Guides' ||
        p.category === 'Troubleshooting' ||
        (p.category === 'Foundations' && p.tags.includes('ecology')) ||
        p.category === 'Tools'
      ).slice(0, 15),
      estimatedDuration: '6-8 weeks',
      objectives: [
        'Grow 3-5 different species successfully',
        'Master environmental control and FAE',
        'Understand substrate formulation',
        'Use troubleshooting tools effectively'
      ]
    },
    advanced: {
      level: 'advanced',
      sequence: searchIndex.filter(p =>
        p.category === 'Advanced' ||
        p.tags.includes('advanced') ||
        p.tags.includes('expert') ||
        p.tags.includes('optimization')
      ).slice(0, 10),
      estimatedDuration: '8-12 weeks',
      objectives: [
        'Design custom fruiting chambers',
        'Engineer optimized substrate recipes',
        'Implement yield tracking and data analysis',
        'Master contamination ecology and defense'
      ]
    }
  };

  return paths[level];
}

/**
 * Get troubleshooting insights with environmental/substrate/species correlation
 */
export function getTroubleshootingInsight(symptom: string): TroubleshootingInsight | null {
  const symptomMap: Record<string, TroubleshootingInsight> = {
    'slow-colonization': {
      symptom: 'Slow Colonization',
      possibleCauses: [
        'Low temperature (below optimal range)',
        'Poor spawn quality or viability',
        'Excessive moisture in substrate',
        'Insufficient gas exchange',
        'Contamination competing with mycelium'
      ],
      relatedEnvironmental: ['temperature', 'gas-exchange', 'moisture'],
      relatedSubstrate: ['spawn-quality', 'grain', 'sterilization', 'moisture-content'],
      relatedSpecies: ['shiitake', 'reishi', 'king-oyster'],
      recommendedPages: searchIndex.filter(p =>
        p.path === '/troubleshooting/slow-colonization' ||
        p.tags.includes('temperature') ||
        p.tags.includes('spawn-quality') ||
        p.path === '/foundations/environmental-parameters'
      )
    },
    'no-pins': {
      symptom: 'No Pinning',
      possibleCauses: [
        'Insufficient evaporation (low humidity differential)',
        'Inadequate fresh air exchange',
        'Substrate not fully colonized',
        'Wrong temperature for species',
        'Lack of light trigger'
      ],
      relatedEnvironmental: ['humidity', 'evaporation', 'fae', 'light', 'temperature'],
      relatedSubstrate: ['colonization', 'substrate-readiness'],
      relatedSpecies: ['shiitake', 'king-oyster', 'lions-mane'],
      recommendedPages: searchIndex.filter(p =>
        p.path === '/troubleshooting/no-pins' ||
        p.tags.includes('pinning') ||
        p.tags.includes('humidity') ||
        p.tags.includes('evaporation')
      )
    },
    'fuzzy-feet': {
      symptom: 'Fuzzy Feet',
      possibleCauses: [
        'High CO2 levels (insufficient FAE)',
        'High humidity with poor air circulation',
        'Normal species behavior (minor concern)'
      ],
      relatedEnvironmental: ['co2', 'fae', 'airflow', 'humidity'],
      relatedSubstrate: [],
      relatedSpecies: ['oyster', 'lions-mane'],
      recommendedPages: searchIndex.filter(p =>
        p.path === '/troubleshooting/fuzzy-feet' ||
        p.tags.includes('co2') ||
        p.tags.includes('fae')
      )
    },
    'overlay': {
      symptom: 'Overlay (Stroma)',
      possibleCauses: [
        'Excessive CO2 buildup',
        'Too high humidity without FAE',
        'Defense response to stress',
        'Wrong microclimate'
      ],
      relatedEnvironmental: ['co2', 'humidity', 'microclimate', 'fae'],
      relatedSubstrate: ['colonization', 'substrate-density'],
      relatedSpecies: ['oyster', 'shiitake'],
      recommendedPages: searchIndex.filter(p =>
        p.path === '/troubleshooting/overlay' ||
        p.tags.includes('overlay') ||
        p.tags.includes('co2')
      )
    },
    'drying-caps': {
      symptom: 'Drying Caps',
      possibleCauses: [
        'Low humidity',
        'Excessive airflow',
        'Poor surface moisture',
        'High evaporation rate'
      ],
      relatedEnvironmental: ['humidity', 'airflow', 'evaporation'],
      relatedSubstrate: [],
      relatedSpecies: ['oyster', 'lions-mane', 'shiitake'],
      recommendedPages: searchIndex.filter(p =>
        p.path === '/troubleshooting/drying-caps' ||
        p.tags.includes('humidity') ||
        p.tags.includes('surface-moisture')
      )
    },
    'aborts': {
      symptom: 'Aborted Pins',
      possibleCauses: [
        'Nutrient depletion in substrate',
        'Humidity drop or fluctuation',
        'Temperature shock',
        'Contamination stress'
      ],
      relatedEnvironmental: ['humidity', 'temperature'],
      relatedSubstrate: ['nutrition', 'substrate-exhaustion'],
      relatedSpecies: ['shiitake', 'king-oyster'],
      recommendedPages: searchIndex.filter(p =>
        p.path === '/troubleshooting/aborts' ||
        p.tags.includes('aborts') ||
        p.tags.includes('nutrition')
      )
    },
    'green-mold': {
      symptom: 'Green Mold (Trichoderma)',
      possibleCauses: [
        'Contaminated substrate',
        'Poor sterilization/pasteurization',
        'Contaminated spawn',
        'Slow colonization giving trichoderma advantage'
      ],
      relatedEnvironmental: [],
      relatedSubstrate: ['sterilization', 'pasteurization', 'grain', 'spawn-quality'],
      relatedSpecies: ['all-species'],
      recommendedPages: searchIndex.filter(p =>
        p.path === '/troubleshooting/green-mold' ||
        p.tags.includes('contamination') ||
        p.tags.includes('sterilization')
      )
    },
    'side-pinning': {
      symptom: 'Side Pinning',
      possibleCauses: [
        'Better microclimate at edges',
        'Light coming from sides',
        'No liner to prevent gaps',
        'Higher humidity at container edges'
      ],
      relatedEnvironmental: ['microclimate', 'light', 'humidity'],
      relatedSubstrate: ['liner', 'substrate-density'],
      relatedSpecies: ['oyster', 'lions-mane'],
      recommendedPages: searchIndex.filter(p =>
        p.path === '/troubleshooting/side-pinning' ||
        p.tags.includes('microclimate')
      )
    }
  };

  return symptomMap[symptom] || null;
}

/**
 * Get species insights with ecological niche and cultivation parameters
 */
export function getSpeciesInsight(species: string): SpeciesInsight | null {
  const speciesMap: Record<string, SpeciesInsight> = {
    'oyster': {
      species: 'Oyster Mushroom (Pleurotus ostreatus)',
      ecologicalNiche: 'Fast-growing saprotroph, colonizes dead wood in nature. Aggressive colonizer with strong anti-bacterial properties.',
      substrateCompatibility: ['straw', 'coir', 'hardwood sawdust', 'coffee grounds', 'cardboard'],
      environmentalRanges: {
        temperature: 'Colonization: 75-80°F | Fruiting: 55-65°F',
        humidity: 'Colonization: 70-80% | Fruiting: 85-95%',
        co2: 'Tolerant to high CO2 during colonization, needs <1000ppm for fruiting',
        fae: 'Moderate to high (4-6 air exchanges/hour)'
      },
      difficultyLevel: 'Beginner-friendly',
      relatedPages: searchIndex.filter(p =>
        p.tags.includes('oyster') ||
        p.path === '/growing-guides/oyster' ||
        p.path === '/guides/oyster-mushrooms'
      )
    },
    'shiitake': {
      species: 'Shiitake (Lentinula edodes)',
      ecologicalNiche: 'Slow-growing wood decomposer. Requires cold shock or rest period to initiate fruiting. Prefers dense hardwood.',
      substrateCompatibility: ['hardwood logs', 'supplemented oak sawdust', 'dense hardwood blocks'],
      environmentalRanges: {
        temperature: 'Colonization: 75-80°F | Fruiting: 55-65°F (cold shock helpful)',
        humidity: 'Colonization: 60-70% | Fruiting: 80-90%',
        co2: 'Moderate tolerance, needs <1200ppm for fruiting',
        fae: 'Moderate (3-5 air exchanges/hour)'
      },
      difficultyLevel: 'Intermediate',
      relatedPages: searchIndex.filter(p =>
        p.tags.includes('shiitake') ||
        p.path === '/growing-guides/shiitake'
      )
    },
    'lions-mane': {
      species: "Lion's Mane (Hericium erinaceus)",
      ecologicalNiche: 'Specialized decomposer of hardwoods, particularly beech and oak. Forms unique cascading structures.',
      substrateCompatibility: ['supplemented hardwood sawdust', 'hardwood blocks', 'dense sawdust'],
      environmentalRanges: {
        temperature: 'Colonization: 70-75°F | Fruiting: 60-70°F',
        humidity: 'Colonization: 70-80% | Fruiting: 85-95%',
        co2: 'Moderate tolerance during colonization, <800ppm for best fruit form',
        fae: 'Moderate to high (4-6 air exchanges/hour)'
      },
      difficultyLevel: 'Beginner to Intermediate',
      relatedPages: searchIndex.filter(p =>
        p.tags.includes('lions-mane') ||
        p.path === '/growing-guides/lions-mane'
      )
    },
    'reishi': {
      species: 'Reishi (Ganoderma lucidum)',
      ecologicalNiche: 'Slow-growing polypore. Grows on hardwood stumps in nature. Forms antler or conk shapes depending on CO2.',
      substrateCompatibility: ['hardwood sawdust', 'hardwood logs', 'supplemented sawdust blocks'],
      environmentalRanges: {
        temperature: 'Colonization: 75-80°F | Fruiting: 70-80°F',
        humidity: 'Colonization: 70-80% | Fruiting: 85-95%',
        co2: 'High CO2 produces antler form, low CO2 produces conk',
        fae: 'Low to moderate (2-4 air exchanges/hour for antler form)'
      },
      difficultyLevel: 'Intermediate',
      relatedPages: searchIndex.filter(p =>
        p.tags.includes('reishi') ||
        p.path === '/growing-guides/reishi'
      )
    },
    'king-oyster': {
      species: 'King Oyster (Pleurotus eryngii)',
      ecologicalNiche: 'Grows in association with plant roots in arid climates. Produces thick stems prized for texture.',
      substrateCompatibility: ['supplemented hardwood sawdust', 'straw + sawdust mix'],
      environmentalRanges: {
        temperature: 'Colonization: 70-75°F | Fruiting: 50-60°F',
        humidity: 'Colonization: 70-80% | Fruiting: 85-95%',
        co2: 'Sensitive to CO2 - needs <1000ppm for thick stems',
        fae: 'Moderate to high (4-6 air exchanges/hour)'
      },
      difficultyLevel: 'Intermediate',
      relatedPages: searchIndex.filter(p =>
        p.tags.includes('king-oyster') ||
        p.path === '/growing-guides/king-oyster'
      )
    },
    'turkey-tail': {
      species: 'Turkey Tail (Trametes versicolor)',
      ecologicalNiche: 'Common polypore decomposer found on dead logs worldwide. Medicinal species with slow fruiting.',
      substrateCompatibility: ['hardwood logs', 'hardwood sawdust', 'supplemented sawdust'],
      environmentalRanges: {
        temperature: 'Colonization: 75-80°F | Fruiting: 60-75°F',
        humidity: 'Colonization: 70-80% | Fruiting: 80-90%',
        co2: 'Tolerant to varying levels',
        fae: 'Moderate (3-5 air exchanges/hour)'
      },
      difficultyLevel: 'Intermediate',
      relatedPages: searchIndex.filter(p =>
        p.tags.includes('turkey-tail') ||
        p.path === '/growing-guides/turkey-tail'
      )
    }
  };

  return speciesMap[species] || null;
}

/**
 * Get pages by category
 */
export function getPagesByCategory(category: string): PageData[] {
  return searchIndex.filter(p => p.category === category);
}

/**
 * Get all unique tags
 */
export function getAllTags(): string[] {
  const tags = new Set<string>();
  searchIndex.forEach(page => {
    page.tags.forEach(tag => tags.add(tag));
  });
  return Array.from(tags).sort();
}

/**
 * Get pages by tag
 */
export function getPagesByTag(tag: string): PageData[] {
  return searchIndex.filter(p => p.tags.includes(tag));
}

/**
 * Calculate content coverage score for a topic
 */
export function getTopicCoverage(topic: string): {
  coverage: number;
  relatedPages: PageData[];
  missingAreas: string[];
} {
  const relatedPages = searchIndex.filter(p =>
    p.tags.includes(topic) || p.title.toLowerCase().includes(topic.toLowerCase())
  );

  const coverage = Math.min(100, (relatedPages.length / 3) * 100);

  const expectedCategories = ['Foundations', 'Growing Guides', 'Troubleshooting', 'Advanced'];
  const coveredCategories = new Set(relatedPages.map(p => p.category));
  const missingAreas = expectedCategories.filter(c => !coveredCategories.has(c));

  return {
    coverage,
    relatedPages,
    missingAreas
  };
}
