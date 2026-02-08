/**
 * Coach Engine
 * Core logic for generating personalized recommendations and guidance
 */

import {
  UserProfile,
  CoachRecommendation,
  EnvironmentalParams,
  TroubleshootingSymptom,
  GrowPlan,
  GrowStage,
  StageTask,
  CoachAction,
  RelatedPage,
  CoachMode,
  SessionContext,
} from './coachTypes';
import { searchIndex } from '@/app/searchIndex';

/**
 * Get recommended species based on user profile and preferences
 */
export function getRecommendedSpecies(
  userProfile: UserProfile,
  context?: SessionContext
): CoachRecommendation[] {
  const recommendations: CoachRecommendation[] = [];

  // Define species profiles with metadata
  const speciesProfiles = [
    {
      name: 'Oyster Mushrooms',
      slug: 'oyster',
      difficulty: 'easy',
      climates: ['temperate', 'cold'],
      timeToFruit: '2-3 weeks',
      yields: 'high',
      equipment: ['minimal', 'basic'],
      goals: ['food', 'hobby'],
      descriptions: ['oyster', 'pleurotus'],
    },
    {
      name: 'Shiitake',
      slug: 'shiitake',
      difficulty: 'moderate',
      climates: ['temperate'],
      timeToFruit: '4-6 weeks',
      yields: 'moderate',
      equipment: ['basic', 'moderate'],
      goals: ['food', 'medicine', 'income'],
      descriptions: ['shiitake', 'lentinula'],
    },
    {
      name: "Lion's Mane",
      slug: 'lions-mane',
      difficulty: 'easy',
      climates: ['temperate', 'cold'],
      timeToFruit: '2-3 weeks',
      yields: 'moderate',
      equipment: ['basic', 'moderate'],
      goals: ['medicine', 'food', 'hobby'],
      descriptions: ['lions mane', 'hericium', 'medicinal'],
    },
    {
      name: 'Reishi',
      slug: 'reishi',
      difficulty: 'challenging',
      climates: ['tropical', 'temperate'],
      timeToFruit: '8-12 weeks',
      yields: 'low',
      equipment: ['moderate', 'professional'],
      goals: ['medicine', 'learning'],
      descriptions: ['reishi', 'ganoderma', 'medicinal'],
    },
    {
      name: 'King Oyster',
      slug: 'king-oyster',
      difficulty: 'moderate',
      climates: ['temperate'],
      timeToFruit: '3-4 weeks',
      yields: 'high',
      equipment: ['basic', 'moderate'],
      goals: ['food', 'income'],
      descriptions: ['king oyster', 'eryngii'],
    },
    {
      name: 'Turkey Tail',
      slug: 'turkey-tail',
      difficulty: 'easy',
      climates: ['temperate', 'cold'],
      timeToFruit: '3-4 weeks',
      yields: 'moderate',
      equipment: ['minimal', 'basic'],
      goals: ['medicine', 'hobby'],
      descriptions: ['turkey tail', 'trametes', 'medicinal'],
    },
  ];

  // Score each species
  for (const species of speciesProfiles) {
    let score = 0;
    const reasons: string[] = [];

    // Skill level match
    const skillMatch: Record<string, string[]> = {
      beginner: ['easy'],
      intermediate: ['easy', 'moderate'],
      advanced: ['easy', 'moderate', 'challenging'],
    };

    if (skillMatch[userProfile.skillLevel].includes(species.difficulty)) {
      score += 25;
      reasons.push(
        `Perfect for your ${userProfile.skillLevel} skill level`
      );
    }

    // Climate compatibility
    if (species.climates.includes(userProfile.climate)) {
      score += 20;
      reasons.push(`Thrives in your ${userProfile.climate} climate`);
    }

    // Equipment compatibility
    if (species.equipment.includes(userProfile.equipment)) {
      score += 15;
      reasons.push(`Compatible with your ${userProfile.equipment} equipment`);
    }

    // Goal alignment
    const matchingGoals = userProfile.goals.filter(g =>
      species.goals.includes(g.type)
    );
    if (matchingGoals.length > 0) {
      score += 20 * matchingGoals.length;
      reasons.push(
        `Aligns with your ${matchingGoals.map(g => g.type).join(', ')} goals`
      );
    }

    // Previous interest/favorites
    if (userProfile.favorites.includes(species.slug)) {
      score += 10;
      reasons.push('Previously added to favorites');
    }

    // Interest in related topics
    const interestMatch = species.descriptions.filter(d =>
      userProfile.interests.some(i => i.toLowerCase().includes(d))
    );
    if (interestMatch.length > 0) {
      score += 10;
      reasons.push('Matches your interests');
    }

    if (score > 0) {
      const page = findPageBySlug(species.slug);
      recommendations.push({
        id: `species-${species.slug}`,
        type: 'species',
        title: species.name,
        description: `A ${species.difficulty} species with ${species.timeToFruit} fruiting time and ${species.yields} yields.`,
        reasoning: reasons.join('. '),
        confidenceScore: Math.min(score / 100, 1),
        relatedPages: page ? [{ slug: species.slug, title: species.name, type: 'species' }] : [],
        parameters: {
          timeToFruit: species.timeToFruit,
          difficulty: species.difficulty,
          yields: species.yields,
        },
        estimatedDifficulty: species.difficulty as any,
        estimatedTime: `${species.timeToFruit} to fruiting`,
      });
    }
  }

  // Sort by confidence score
  return recommendations.sort((a, b) => b.confidenceScore - a.confidenceScore);
}

/**
 * Get recommended substrates based on species and user equipment
 */
export function getRecommendedSubstrate(
  species: string,
  userProfile: UserProfile,
  context?: SessionContext
): CoachRecommendation[] {
  const recommendations: CoachRecommendation[] = [];

  const substrateOptions = [
    {
      name: 'Straw',
      slug: 'straw',
      difficulty: 'easy',
      cost: 'low',
      yield: 'moderate',
      prep: 'simple',
      species: ['oyster', 'king-oyster', 'turkey-tail'],
    },
    {
      name: 'Hardwood Sawdust',
      slug: 'hardwood-sawdust',
      difficulty: 'moderate',
      cost: 'low',
      yield: 'high',
      prep: 'moderate',
      species: ['shiitake', 'lions-mane', 'oyster'],
    },
    {
      name: 'Wood Chips',
      slug: 'wood-chips',
      difficulty: 'easy',
      cost: 'low',
      yield: 'moderate',
      prep: 'simple',
      species: ['turkey-tail', 'oyster', 'reishi'],
    },
    {
      name: 'Coffee Grounds',
      slug: 'coffee-grounds',
      difficulty: 'very-easy',
      cost: 'free',
      yield: 'low',
      prep: 'very-simple',
      species: ['oyster', 'king-oyster'],
    },
    {
      name: 'Grain',
      slug: 'grain',
      difficulty: 'moderate',
      cost: 'moderate',
      yield: 'high',
      prep: 'moderate',
      species: ['all'],
    },
  ];

  // Filter by species compatibility
  let compatible = substrateOptions.filter(
    s => s.species.includes(species) || s.species.includes('all')
  );

  // Score and rank
  for (const substrate of compatible) {
    let score = 0;
    const reasons: string[] = [];

    // Cost vs equipment
    if (userProfile.equipment === 'minimal' && substrate.cost === 'free') {
      score += 20;
      reasons.push('No cost - perfect for minimal budgets');
    } else if (userProfile.equipment === 'basic' && substrate.cost === 'low') {
      score += 15;
      reasons.push('Affordable and easy to source');
    }

    // Prep difficulty
    const prepMap: Record<string, string[]> = {
      beginner: ['very-simple', 'simple'],
      intermediate: ['very-simple', 'simple', 'moderate'],
      advanced: ['very-simple', 'simple', 'moderate'],
    };

    if (prepMap[userProfile.skillLevel].includes(substrate.prep)) {
      score += 15;
      reasons.push(`Straightforward prep for your level`);
    }

    // Yield
    if (
      (userProfile.goals.some(g => g.type === 'food' || g.type === 'income') &&
        substrate.yield === 'high') ||
      (userProfile.goals.some(g => g.type === 'hobby') &&
        substrate.yield === 'moderate')
    ) {
      score += 20;
      reasons.push('High yield for your goals');
    }

    if (score > 0) {
      recommendations.push({
        id: `substrate-${substrate.slug}`,
        type: 'substrate',
        title: substrate.name,
        description: `${substrate.name} is a ${substrate.difficulty} option with ${substrate.yield} yields.`,
        reasoning: reasons.join('. '),
        confidenceScore: Math.min(score / 100, 1),
        relatedPages: [],
        parameters: {
          cost: substrate.cost,
          yield: substrate.yield,
          prepDifficulty: substrate.prep,
        },
        estimatedDifficulty: substrate.difficulty as any,
      });
    }
  }

  return recommendations.sort((a, b) => b.confidenceScore - a.confidenceScore);
}

/**
 * Get environmental parameters for a species at a specific stage
 */
export function getEnvironmentalParameters(
  species: string,
  stage: string = 'fruiting'
): EnvironmentalParams {
  // Species-specific environmental profiles
  const speciesEnv: Record<string, Record<string, EnvironmentalParams>> = {
    oyster: {
      colonization: {
        temperature: { min: 15, max: 25, optimal: 20, unit: 'celsius' },
        humidity: { min: 60, max: 80, optimal: 70 },
        fae: { frequency: '0-1 times daily', duration: '2-5 minutes', method: 'passive' },
        light: { required: false },
        substrate: { type: 'straw or hardwood', moisture: '65%', colonizationDays: 14, fruiting: 'spray 2-3x daily' },
      },
      fruiting: {
        temperature: { min: 12, max: 20, optimal: 16, unit: 'celsius' },
        humidity: { min: 80, max: 95, optimal: 90 },
        fae: { frequency: '4-6 times daily', duration: '5-10 minutes', method: 'active' },
        light: { required: true, duration: '12 hours', intensity: 'moderate', type: 'indirect' },
        substrate: { type: 'straw or hardwood', moisture: '70%', colonizationDays: 14, fruiting: 'keep moist' },
      },
    },
    shiitake: {
      colonization: {
        temperature: { min: 12, max: 20, optimal: 18, unit: 'celsius' },
        humidity: { min: 60, max: 75, optimal: 70 },
        fae: { frequency: '0-1 times daily', duration: '2 minutes', method: 'passive' },
        light: { required: false },
        substrate: { type: 'hardwood sawdust', moisture: '65%', colonizationDays: 30, fruiting: 'soaking' },
      },
      fruiting: {
        temperature: { min: 10, max: 18, optimal: 14, unit: 'celsius' },
        humidity: { min: 85, max: 95, optimal: 90 },
        fae: { frequency: '2-3 times daily', duration: '5-10 minutes', method: 'active' },
        light: { required: true, duration: '12 hours', intensity: 'indirect', type: 'indirect' },
        substrate: { type: 'hardwood sawdust', moisture: '70%', colonizationDays: 30, fruiting: 'misting' },
      },
    },
    "lions-mane": {
      colonization: {
        temperature: { min: 15, max: 24, optimal: 20, unit: 'celsius' },
        humidity: { min: 60, max: 75, optimal: 70 },
        fae: { frequency: '0-1 times daily', duration: '2 minutes', method: 'passive' },
        light: { required: false },
        substrate: { type: 'hardwood sawdust', moisture: '65%', colonizationDays: 21, fruiting: 'misting' },
      },
      fruiting: {
        temperature: { min: 12, max: 20, optimal: 16, unit: 'celsius' },
        humidity: { min: 80, max: 90, optimal: 85 },
        fae: { frequency: '2-4 times daily', duration: '5 minutes', method: 'active' },
        light: { required: true, duration: '12 hours', intensity: 'bright', type: 'indirect' },
        substrate: { type: 'hardwood sawdust', moisture: '70%', colonizationDays: 21, fruiting: 'keep humid' },
      },
    },
  };

  // Default if species not found
  const defaultParams: EnvironmentalParams = {
    temperature: { min: 13, max: 22, optimal: 18, unit: 'celsius' },
    humidity: { min: 60, max: 90, optimal: 75 },
    fae: { frequency: '1-4 times daily', duration: '5 minutes', method: 'passive to active' },
    light: { required: true, duration: '12 hours' },
    substrate: { type: 'species-dependent', moisture: '65%', colonizationDays: 14, fruiting: 'misting' },
  };

  const speciesLower = species.toLowerCase().replace('-', '');
  const stageEnv = speciesEnv[speciesLower];

  if (!stageEnv) return defaultParams;

  return stageEnv[stage] || stageEnv.fruiting || defaultParams;
}

/**
 * Get troubleshooting guidance for a symptom
 */
export function getTroubleshootingSteps(
  symptom: string,
  context?: SessionContext
): CoachRecommendation[] {
  const recommendations: CoachRecommendation[] = [];

  // Troubleshooting database
  const troubleshooting: Record<string, any> = {
    'no-pins': {
      title: 'No Pins or Primordia Forming',
      description: 'Mushroom fruiting bodies are not initiating.',
      causes: [
        { cause: 'Insufficient FAE', likelihood: 0.4, solutions: ['Increase air exchange', 'Open container more frequently'] },
        { cause: 'High CO2 buildup', likelihood: 0.3, solutions: ['Improve ventilation', 'Add fan for circulation'] },
        { cause: 'Substrate not fully colonized', likelihood: 0.2, solutions: ['Wait longer for colonization', 'Check substrate moisture'] },
        { cause: 'Low humidity', likelihood: 0.1, solutions: ['Increase misting frequency', 'Cover sides to retain moisture'] },
      ],
      immediateActions: [
        { id: 'check-co2', label: 'Check CO2 levels', description: 'Ensure proper FAE', actionType: 'monitor', priority: 'high' },
        { id: 'increase-fae', label: 'Increase FAE', description: 'Open container or add gentle fanning', actionType: 'adjust', priority: 'high' },
        { id: 'boost-humidity', label: 'Boost humidity', description: 'Increase misting frequency', actionType: 'adjust', priority: 'medium' },
      ],
      preventive: [
        'Maintain 80-90% humidity',
        'Provide 4-6 FAE exchanges daily',
        'Ensure proper light exposure',
        'Verify full colonization before fruiting',
      ],
    },
    'green-mold': {
      title: 'Green Mold Contamination',
      description: 'Green, blue-green, or olive-colored mold appears on substrate.',
      causes: [
        { cause: 'Poor sterilization', likelihood: 0.5, solutions: ['Use pressure cooker at 15 PSI for 90 min', 'Improve sanitation'] },
        { cause: 'Low substrate pH', likelihood: 0.3, solutions: ['Supplement with lime', 'Use buffering agents'] },
        { cause: 'High moisture', likelihood: 0.2, solutions: ['Reduce misting', 'Improve airflow'] },
      ],
      immediateActions: [
        { id: 'isolate', label: 'Isolate affected batch', description: 'Prevent spread to other bags', actionType: 'adjust', priority: 'high' },
        { id: 'cull', label: 'Cull contaminated bags', description: 'Remove and dispose safely', actionType: 'action', priority: 'high' },
        { id: 'review-protocol', label: 'Review sterilization protocol', description: 'Check your prep process', actionType: 'read', priority: 'medium' },
      ],
      preventive: [
        'Proper sterilization of all substrates',
        'Maintain clean working environment',
        'Use proper PPE during inoculation',
        'Avoid introducing contaminants',
      ],
    },
    'fuzzy-feet': {
      title: 'Fuzzy Feet (Excessive Mycelium on Fruits)',
      description: 'Mushrooms develop hairy or fuzzy base with excess mycelium.',
      causes: [
        { cause: 'Insufficient FAE', likelihood: 0.7, solutions: ['Increase air exchange', 'Improve ventilation'] },
        { cause: 'High humidity with low FAE', likelihood: 0.2, solutions: ['Reduce humidity slightly', 'Increase air movement'] },
        { cause: 'Genetics', likelihood: 0.1, solutions: ['Select different mushroom strain'] },
      ],
      immediateActions: [
        { id: 'increase-fae', label: 'Increase FAE', description: 'More frequent air exchanges', actionType: 'adjust', priority: 'high' },
        { id: 'reduce-humidity', label: 'Reduce humidity slightly', description: 'Balance humidity and FAE', actionType: 'adjust', priority: 'medium' },
        { id: 'add-ventilation', label: 'Add ventilation', description: 'Install fan or improve airflow', actionType: 'action', priority: 'medium' },
      ],
      preventive: [
        'Maintain consistent FAE schedule',
        'Optimize humidity vs. FAE balance',
        'Ensure adequate air movement',
      ],
    },
  };

  const symptomLower = symptom.toLowerCase().replace(/\s+/g, '-');
  const issue = troubleshooting[symptomLower];

  if (!issue) {
    // Generic troubleshooting if specific issue not found
    return [{
      id: 'generic-troubleshooting',
      type: 'troubleshooting',
      title: 'General Troubleshooting',
      description: `Guidance for: ${symptom}`,
      reasoning: 'Generic troubleshooting steps',
      confidenceScore: 0.6,
      relatedPages: [],
      estimatedDifficulty: 'moderate',
      actions: [
        { id: 'check-conditions', label: 'Check environmental conditions', description: 'Verify temperature, humidity, FAE', actionType: 'monitor', priority: 'high' },
        { id: 'review-guide', label: 'Review species guide', description: 'Check species-specific requirements', actionType: 'read', priority: 'medium' },
      ],
    }];
  }

  // Score causes by likelihood
  for (const cause of issue.causes) {
    recommendations.push({
      id: `troubleshooting-${cause.cause.toLowerCase().replace(/\s+/g, '-')}`,
      type: 'troubleshooting',
      title: `Likely Cause: ${cause.cause}`,
      description: issue.description,
      reasoning: `This cause is ${Math.round(cause.likelihood * 100)}% likely. ${cause.solutions.join('. ')}`,
      confidenceScore: cause.likelihood,
      relatedPages: [],
      estimatedDifficulty: 'moderate',
      actions: issue.immediateActions,
      parameters: {
        symptom: issue.title,
        likelihood: cause.likelihood,
        solutions: cause.solutions,
      },
    });
  }

  return recommendations.sort((a, b) => b.confidenceScore - a.confidenceScore);
}

/**
 * Generate a complete grow plan based on species and user context
 */
export function generateGrowPlan(
  species: string,
  substrate: string,
  userProfile: UserProfile,
  context?: SessionContext
): GrowPlan {
  const planId = `plan-${Date.now()}`;
  const startDate = new Date().toISOString();

  // Define stage durations (in days)
  const stageDurations: Record<string, Record<string, number>> = {
    oyster: { preparation: 2, inoculation: 1, colonization: 14, fruiting: 21, harvest: 1, cleanup: 1 },
    shiitake: { preparation: 2, inoculation: 1, colonization: 30, fruiting: 28, harvest: 1, cleanup: 1 },
    "lions-mane": { preparation: 2, inoculation: 1, colonization: 21, fruiting: 14, harvest: 1, cleanup: 1 },
    reishi: { preparation: 2, inoculation: 1, colonization: 45, fruiting: 56, harvest: 1, cleanup: 1 },
    "king-oyster": { preparation: 2, inoculation: 1, colonization: 14, fruiting: 21, harvest: 1, cleanup: 1 },
    "turkey-tail": { preparation: 2, inoculation: 1, colonization: 21, fruiting: 28, harvest: 1, cleanup: 1 },
  };

  const speciesLower = species.toLowerCase();
  const durations = stageDurations[speciesLower] || stageDurations.oyster;

  // Create stages with tasks
  const stages: GrowStage[] = [
    {
      stage: 'preparation',
      duration: durations.preparation,
      tasks: [
        {
          id: '1',
          title: 'Gather materials',
          description: `Collect substrate (${substrate}), spawn, and containers`,
          dueDay: 0,
          completed: false,
        },
        {
          id: '2',
          title: 'Prepare workspace',
          description: 'Set up sterile workspace and gather tools',
          dueDay: 0,
          completed: false,
        },
        {
          id: '3',
          title: 'Review sterilization protocol',
          description: 'Ensure proper preparation of all materials',
          dueDay: 0,
          completed: false,
        },
      ],
      parameters: getEnvironmentalParameters(species, 'preparation'),
      milestones: ['Materials gathered', 'Workspace prepared'],
      commonIssues: ['Contamination during prep', 'Improper sterilization'],
    },
    {
      stage: 'inoculation',
      duration: durations.inoculation,
      tasks: [
        {
          id: '1',
          title: 'Sterilize substrate',
          description: 'Pressure cook substrate at 15 PSI for 90 minutes',
          dueDay: 0,
          completed: false,
        },
        {
          id: '2',
          title: 'Cool substrate',
          description: 'Allow substrate to cool to room temperature',
          dueDay: 0,
          completed: false,
        },
        {
          id: '3',
          title: 'Inoculate with spawn',
          description: 'Mix spawn with cooled substrate in sterile conditions',
          dueDay: 1,
          completed: false,
        },
      ],
      parameters: getEnvironmentalParameters(species, 'inoculation'),
      milestones: ['Substrate sterilized', 'Spawn mixed'],
      commonIssues: ['Contamination', 'Poor mixing'],
    },
    {
      stage: 'colonization',
      duration: durations.colonization,
      tasks: [
        {
          id: '1',
          title: 'Monitor colonization progress',
          description: 'Observe mycelium spreading through substrate',
          dueDay: 3,
          completed: false,
        },
        {
          id: '2',
          title: 'Maintain temperature and humidity',
          description: 'Keep environment stable',
          dueDay: 1,
          completed: false,
        },
        {
          id: '3',
          title: 'Check for contamination',
          description: 'Look for mold or unusual growth',
          dueDay: 5,
          completed: false,
        },
      ],
      parameters: getEnvironmentalParameters(species, 'colonization'),
      milestones: ['25% colonized', '50% colonized', '100% colonized'],
      commonIssues: ['Green mold', 'Slow colonization', 'Contamination'],
    },
    {
      stage: 'fruiting',
      duration: durations.fruiting,
      tasks: [
        {
          id: '1',
          title: 'Initiate fruiting conditions',
          description: 'Adjust temperature, humidity, FAE, and light',
          dueDay: 0,
          completed: false,
        },
        {
          id: '2',
          title: 'Monitor pin formation',
          description: 'Watch for primordia (pins) to appear',
          dueDay: 2,
          completed: false,
        },
        {
          id: '3',
          title: 'Mist regularly',
          description: 'Maintain humidity levels',
          dueDay: 1,
          completed: false,
        },
        {
          id: '4',
          title: 'Monitor for issues',
          description: 'Check for contamination, fuzzy feet, or other problems',
          dueDay: 3,
          completed: false,
        },
      ],
      parameters: getEnvironmentalParameters(species, 'fruiting'),
      milestones: ['Pins formed', 'Mushrooms visible', 'Ready to harvest'],
      commonIssues: ['No pins', 'Fuzzy feet', 'Green mold', 'Slow fruiting'],
    },
    {
      stage: 'harvest',
      duration: durations.harvest,
      tasks: [
        {
          id: '1',
          title: 'Harvest mushrooms',
          description: 'Carefully twist or cut mushrooms at base',
          dueDay: 0,
          completed: false,
        },
        {
          id: '2',
          title: 'Process harvest',
          description: 'Clean and prepare for use or storage',
          dueDay: 0,
          completed: false,
        },
      ],
      parameters: getEnvironmentalParameters(species, 'fruiting'),
      milestones: ['First flush harvested'],
      commonIssues: [],
    },
    {
      stage: 'cleanup',
      duration: durations.cleanup,
      tasks: [
        {
          id: '1',
          title: 'Clean equipment',
          description: 'Sanitize all tools and containers',
          dueDay: 0,
          completed: false,
        },
        {
          id: '2',
          title: 'Document results',
          description: 'Record yield, timing, issues, and improvements',
          dueDay: 1,
          completed: false,
        },
      ],
      parameters: getEnvironmentalParameters(species, 'fruiting'),
      milestones: ['Workspace cleaned', 'Results documented'],
      commonIssues: [],
    },
  ];

  // Calculate completion date
  const totalDays = Object.values(durations).reduce((a, b) => a + b, 0);
  const completionDate = new Date(new Date(startDate).getTime() + totalDays * 24 * 60 * 60 * 1000).toISOString();

  return {
    id: planId,
    name: `${species} on ${substrate}`,
    species,
    substrate,
    startDate,
    estimatedCompletionDate: completionDate,
    stages,
    notes: `Grow plan for ${userProfile.skillLevel} grower. Total estimated time: ${totalDays} days.`,
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    status: 'planning',
  };
}

/**
 * Analyze user context and provide next-step recommendations
 */
export function analyzeUserContext(
  context: SessionContext,
  userProfile: UserProfile
): CoachRecommendation[] {
  const recommendations: CoachRecommendation[] = [];

  // Check if user has a current species
  if (!context.currentSpecies && userProfile.goals.length > 0) {
    recommendations.push({
      id: 'recommend-species-selection',
      type: 'action',
      title: 'Select a Target Species',
      description: 'Choose a mushroom species to guide your grow plan.',
      reasoning: 'Starting with a species helps personalize all recommendations.',
      confidenceScore: 0.9,
      relatedPages: [],
      estimatedDifficulty: 'easy',
      actions: [
        {
          id: 'open-species-advisor',
          label: 'Open Species Advisor',
          description: 'Get personalized species recommendations',
          actionType: 'navigate',
          target: '/coach/species-advisor',
          priority: 'high',
        },
      ],
    });
  }

  // Check if user needs substrate selection
  if (context.currentSpecies && !context.currentSubstrate) {
    recommendations.push({
      id: 'recommend-substrate-selection',
      type: 'action',
      title: 'Choose a Substrate',
      description: 'Select the best substrate for your species and equipment.',
      reasoning: 'The right substrate maximizes yield and success rates.',
      confidenceScore: 0.85,
      relatedPages: [],
      estimatedDifficulty: 'easy',
      actions: [
        {
          id: 'open-substrate-advisor',
          label: 'Open Substrate Advisor',
          description: 'Get substrate recommendations',
          actionType: 'navigate',
          target: `/coach/substrate-advisor?species=${context.currentSpecies}`,
          priority: 'high',
        },
      ],
    });
  }

  // Check if user needs environmental setup
  if (context.currentSpecies && !userProfile.interests.includes('environmental-setup')) {
    recommendations.push({
      id: 'recommend-environmental-setup',
      type: 'action',
      title: 'Set Up Growing Environment',
      description: 'Learn proper temperature, humidity, and air exchange requirements.',
      reasoning: 'Environmental conditions are critical for successful cultivation.',
      confidenceScore: 0.8,
      relatedPages: [],
      estimatedDifficulty: 'moderate',
      actions: [
        {
          id: 'open-environment-advisor',
          label: 'Open Environment Advisor',
          description: 'Get environmental parameter guidance',
          actionType: 'navigate',
          target: `/coach/environment-advisor?species=${context.currentSpecies}`,
          priority: 'high',
        },
      ],
    });
  }

  // Recommend troubleshooting if relevant
  if (context.focusArea === 'troubleshooting' || context.currentStage === 'fruiting') {
    recommendations.push({
      id: 'recommend-troubleshooting',
      type: 'action',
      title: 'Troubleshooting Support',
      description: 'Get guidance on common issues during cultivation.',
      reasoning: 'Proactive troubleshooting prevents crop loss.',
      confidenceScore: 0.75,
      relatedPages: [],
      estimatedDifficulty: 'moderate',
      actions: [
        {
          id: 'open-troubleshooting-advisor',
          label: 'Open Troubleshooting Advisor',
          description: 'Get symptom-based diagnostic guidance',
          actionType: 'navigate',
          target: '/coach/troubleshooting-advisor',
          priority: 'medium',
        },
      ],
    });
  }

  // Recommend grow planner
  if (context.currentSpecies && !context.activePlan) {
    recommendations.push({
      id: 'recommend-grow-plan',
      type: 'action',
      title: 'Create a Grow Plan',
      description: 'Generate a detailed step-by-step cultivation timeline.',
      reasoning: 'A written plan helps track progress and stay organized.',
      confidenceScore: 0.9,
      relatedPages: [],
      estimatedDifficulty: 'easy',
      actions: [
        {
          id: 'open-grow-planner',
          label: 'Open Grow Planner',
          description: 'Create your personalized grow plan',
          actionType: 'navigate',
          target: `/coach/grow-planner?species=${context.currentSpecies}`,
          priority: 'high',
        },
      ],
    });
  }

  return recommendations;
}

/**
 * Helper: Find page by slug in searchIndex
 */
function findPageBySlug(slug: string): RelatedPage | null {
  for (const page of searchIndex) {
    if (page.slug && (page.slug === slug || page.slug.endsWith(`/${slug}`))) {
      return {
        slug: page.slug,
        title: page.title,
        type: page.category,
      };
    }
  }
  return null;
}
