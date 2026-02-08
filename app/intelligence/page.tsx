import type { Metadata } from 'next';
import SectionHeader from '../components/SectionHeader';
import Breadcrumbs from '../components/Breadcrumbs';
import RecommendationEngine from './components/RecommendationEngine';
import LearningPathGenerator from './components/LearningPathGenerator';
import TroubleshootingIntelligence from './components/TroubleshootingIntelligence';
import SpeciesInsightEngine from './components/SpeciesInsightEngine';

export const metadata: Metadata = {
  title: 'Intelligence Layer - Adaptive Recommendations & Insights',
  description: 'Explore the adaptive intelligence layer: personalized recommendations, learning paths, troubleshooting diagnostics, and species insights powered by the knowledge graph.',
  keywords: ['intelligence', 'recommendations', 'learning paths', 'AI', 'knowledge graph', 'troubleshooting', 'species insights', 'adaptive learning'],
  other: {
    tags: ['intelligence', 'tools', 'recommendations', 'learning-path', 'troubleshooting', 'species', 'advanced'].join(','),
  },
};

export default function IntelligencePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Breadcrumbs />
      <SectionHeader
        title="Intelligence Layer"
        subtitle="Adaptive recommendations, personalized learning paths, and context-aware insights powered by semantic analysis and the knowledge graph"
      />

      <div className="space-y-12 text-gray-800 dark:text-gray-200">
        {/* Overview Section */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-8 rounded-xl border border-indigo-200 dark:border-indigo-800">
          <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">
            🧠 What is the Intelligence Layer?
          </h2>
          <p className="text-lg mb-4 text-gray-700 dark:text-gray-300">
            The Intelligence Layer is an adaptive system built on top of the platform's content architecture.
            It analyzes semantic tags, knowledge graph clusters, and page metadata to generate dynamic
            recommendations, personalized learning sequences, and context-aware insights.
          </p>
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-indigo-200 dark:border-indigo-700">
              <h3 className="font-semibold text-indigo-900 dark:text-indigo-200 mb-2">
                🎯 What It Does
              </h3>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li>• Recommends related content based on semantic similarity</li>
                <li>• Generates personalized learning paths</li>
                <li>• Provides intelligent troubleshooting diagnostics</li>
                <li>• Delivers species-specific cultivation insights</li>
                <li>• Maps knowledge graph connections</li>
              </ul>
            </div>
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-indigo-200 dark:border-indigo-700">
              <h3 className="font-semibold text-indigo-900 dark:text-indigo-200 mb-2">
                ⚙️ How It Works
              </h3>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li>• Analyzes 100+ semantic tags across 74 pages</li>
                <li>• Uses 6 knowledge graph clusters</li>
                <li>• Calculates tag overlap and cluster relationships</li>
                <li>• Applies progression logic (beginner → advanced)</li>
                <li>• Correlates environmental/substrate/species factors</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Demo Section: Recommendation Engine */}
        <section id="recommendation-engine">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
            🎯 Recommendation Engine Demo
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            See how the recommendation engine finds related content using semantic tags and knowledge clusters.
            This example shows recommendations for a page about oyster mushrooms.
          </p>
          <RecommendationEngine
            currentTags={['oyster', 'growing-guides', 'straw', 'coir', 'fae', 'humidity']}
            currentCategory="Growing Guides"
            mode="all"
            limit={3}
          />
        </section>

        <div className="border-t border-gray-200 dark:border-gray-700"></div>

        {/* Learning Path Generator */}
        <section id="learning-paths">
          <LearningPathGenerator />
        </section>

        <div className="border-t border-gray-200 dark:border-gray-700"></div>

        {/* Troubleshooting Intelligence */}
        <section id="troubleshooting">
          <TroubleshootingIntelligence />
        </section>

        <div className="border-t border-gray-200 dark:border-gray-700"></div>

        {/* Species Insight Engine */}
        <section id="species-insights">
          <SpeciesInsightEngine />
        </section>

        <div className="border-t border-gray-200 dark:border-gray-700"></div>

        {/* Technical Details */}
        <section id="technical-details">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
            🔧 Technical Architecture
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Knowledge Graph Clusters
              </h3>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li><strong>Substrate-Species Matching:</strong> 15 tags</li>
                <li><strong>Environmental Control:</strong> 11 tags</li>
                <li><strong>Contamination Prevention:</strong> 13 tags</li>
                <li><strong>Cultivation Stages:</strong> 10 tags</li>
                <li><strong>Medicinal Properties:</strong> 12 tags</li>
                <li><strong>Troubleshooting Diagnostics:</strong> 13 tags</li>
              </ul>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Core Utility Functions
              </h3>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li><code className="text-xs bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded">getRelatedByTags()</code> - Tag similarity</li>
                <li><code className="text-xs bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded">getRelatedByCluster()</code> - Cluster analysis</li>
                <li><code className="text-xs bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded">getRecommendedNextSteps()</code> - Progression logic</li>
                <li><code className="text-xs bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded">getLearningPathForUserLevel()</code> - Path generation</li>
                <li><code className="text-xs bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded">getTroubleshootingInsight()</code> - Diagnostics</li>
                <li><code className="text-xs bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded">getSpeciesInsight()</code> - Species data</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Integration Points */}
        <section id="integration">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
            🔌 Integration Points
          </h2>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              The intelligence layer can be integrated into any page of the platform:
            </p>
            <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <div className="flex items-start gap-3">
                <span className="text-blue-600 dark:text-blue-400 font-mono">→</span>
                <div>
                  <strong>Content Pages:</strong> Add <code className="text-xs bg-blue-100 dark:bg-blue-900/40 px-1 py-0.5 rounded">RecommendationEngine</code> to show related content
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-600 dark:text-blue-400 font-mono">→</span>
                <div>
                  <strong>Troubleshooting Pages:</strong> Embed <code className="text-xs bg-blue-100 dark:bg-blue-900/40 px-1 py-0.5 rounded">TroubleshootingIntelligence</code> for symptom analysis
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-600 dark:text-blue-400 font-mono">→</span>
                <div>
                  <strong>Species Pages:</strong> Use <code className="text-xs bg-blue-100 dark:bg-blue-900/40 px-1 py-0.5 rounded">SpeciesInsightEngine</code> for cultivation parameters
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-600 dark:text-blue-400 font-mono">→</span>
                <div>
                  <strong>Onboarding Flow:</strong> Integrate <code className="text-xs bg-blue-100 dark:bg-blue-900/40 px-1 py-0.5 rounded">LearningPathGenerator</code> for personalized guides
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Future Enhancements */}
        <section id="future">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
            🚀 Future Enhancements
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <h4 className="font-semibold text-purple-900 dark:text-purple-200 mb-2">User Progress Tracking</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Track pages visited and suggest next steps based on actual learning history
              </p>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <h4 className="font-semibold text-purple-900 dark:text-purple-200 mb-2">Grow Journal Integration</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Recommend content based on current grow stage and species being cultivated
              </p>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <h4 className="font-semibold text-purple-900 dark:text-purple-200 mb-2">Machine Learning Refinement</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Use interaction data to improve recommendation scoring and relevance
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
