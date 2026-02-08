/**
 * Community Guidelines Page
 * Contribution guidelines, best practices, code of conduct, and FAQ
 */

export default function GuidelinesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 to-purple-900 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">📋 Community Guidelines</h1>
          <p className="text-indigo-200 text-lg">
            Learn how to contribute and participate in the community
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Table of Contents */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Table of Contents</h2>
          <nav className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { id: 'what-is', label: 'What is the Community Layer?' },
              { id: 'getting-started', label: 'Getting Started' },
              { id: 'contributions', label: 'Types of Contributions' },
              { id: 'privacy', label: 'Privacy & Sharing' },
              { id: 'best-practices', label: 'Best Practices' },
              { id: 'code-of-conduct', label: 'Code of Conduct' },
              { id: 'faq', label: 'Frequently Asked Questions' },
            ].map(item => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                → {item.label}
              </a>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* What is the Community Layer */}
          <section id="what-is" className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">🌱 What is the Community Layer?</h2>
            <div className="space-y-4 text-slate-300">
              <p>
                The Community Layer is a privacy-first, client-side feature that allows mushroom cultivators to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li><strong>Track Grows</strong> – Log your cultivation progress with detailed notes, environmental parameters, and outcomes</li>
                <li><strong>Capture Knowledge</strong> – Create personal notes with markdown support, tagging, and linking to relevant content</li>
                <li><strong>Share Insights</strong> – Contribute observations, tips, and patterns to help other growers</li>
                <li><strong>Learn Together</strong> – Access suggestions based on your grows and notes to enrich the knowledge graph</li>
              </ul>
              <p className="pt-2">
                <strong>Privacy First:</strong> All your data is stored locally in your browser by default. You control what (if anything) you share.
              </p>
            </div>
          </section>

          {/* Getting Started */}
          <section id="getting-started" className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">🚀 Getting Started</h2>
            <div className="space-y-4 text-slate-300">
              <h3 className="text-lg font-semibold text-white">Step 1: Create Your First Grow Log</h3>
              <p>
                Navigate to <strong>Grow Logs</strong> and click "New Grow Log". Fill in:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
                <li>Species and substrate type</li>
                <li>Key dates (inoculation, colonization, fruiting, harvest)</li>
                <li>Environmental parameters (temperature, humidity, FAE, light)</li>
                <li>Observations and any issues encountered</li>
                <li>Final yield and quality rating</li>
              </ul>

              <h3 className="text-lg font-semibold text-white mt-4">Step 2: Add Notes</h3>
              <p>
                Create personal notes about techniques, species characteristics, or anything you learn. Link notes to relevant pages in the knowledge base.
              </p>

              <h3 className="text-lg font-semibold text-white mt-4">Step 3: Share Insights (Optional)</h3>
              <p>
                Once you've logged a few grows and captured knowledge, consider sharing insights with the community. You control whether each insight is private or shared.
              </p>
            </div>
          </section>

          {/* Types of Contributions */}
          <section id="contributions" className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">📝 Types of Contributions</h2>

            <div className="space-y-6">
              {/* Grow Logs */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">📊 Grow Logs</h3>
                <p className="text-slate-300 mb-3">
                  Track every aspect of your cultivation journey. Grow logs help you identify patterns and improve your technique.
                </p>
                <div className="bg-slate-700 rounded p-3 text-sm text-slate-300">
                  <p className="font-medium mb-2">Example: Lion's Mane on Coffee Grounds</p>
                  <p>Started: Jan 1 • Colonized: Jan 15 • Fruiting: Jan 20 • Harvested: Feb 3</p>
                  <p>Yield: 450g • Quality: ⭐⭐⭐⭐ • Observation: Pins were very uniform and healthy</p>
                </div>
              </div>

              {/* Notes */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">📌 Notes</h3>
                <p className="text-slate-300 mb-3">
                  Capture insights, techniques, and observations in markdown format. Link notes to relevant pages to enhance the knowledge graph.
                </p>
                <div className="bg-slate-700 rounded p-3 text-sm text-slate-300">
                  <p className="font-medium mb-2">Example: "Coffee Grounds Preprocessing"</p>
                  <p>Boiling coffee grounds for 10 minutes significantly reduces contamination risk. I've successfully used this method for oysters with ~95% success rate.</p>
                </div>
              </div>

              {/* Insights */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">💡 Insights</h3>
                <p className="text-slate-300 mb-3">
                  Share validated tips, observed patterns, troubleshooting solutions, or species-specific behaviors. Rate your confidence level.
                </p>
                <div className="space-y-2">
                  <div className="bg-slate-700 rounded p-3 text-sm text-slate-300">
                    <p className="font-medium">💡 Tip: Humidity Management</p>
                    <p>Maintain 85-95% humidity during fruiting. Use a simple humidity monitor ($10-15) rather than guessing.</p>
                  </div>
                  <div className="bg-slate-700 rounded p-3 text-sm text-slate-300">
                    <p className="font-medium">👁️ Observation: Oyster Sensitivity to Temperature</p>
                    <p>Blue oysters fruit best at 55-65°F. Above 70°F, caps become thinner and bruise easily.</p>
                  </div>
                  <div className="bg-slate-700 rounded p-3 text-sm text-slate-300">
                    <p className="font-medium">🔍 Troubleshooting Pattern: Green Mold Prevention</p>
                    <p>Green mold appears in 3-5 days if contamination starts. Keep immediate environment very clean and avoid open colonization.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Privacy & Sharing */}
          <section id="privacy" className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">🔒 Privacy & Sharing</h2>
            <div className="space-y-4 text-slate-300">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Default: Everything is Private</h3>
                <p>
                  All grow logs, notes, and insights are stored <strong>only in your browser</strong> by default. No data leaves your device without your explicit action.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Sharing is Opt-In</h3>
                <p>
                  You control what you share:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2 text-sm mt-2">
                  <li>Grow logs are always private (species, yield, and detailed data stay with you)</li>
                  <li>Notes are private by default; you can share individual notes or keep them personal</li>
                  <li>Insights can be toggled between private and shared with one click</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">No External Transmission</h3>
                <p>
                  We do not transmit your data to external servers unless you explicitly configure server-side storage (future feature). The community layer works entirely offline.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Backup & Export</h3>
                <p>
                  Export your data anytime as JSON or CSV. You own your data and can take it with you.
                </p>
              </div>
            </div>
          </section>

          {/* Best Practices */}
          <section id="best-practices" className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">⭐ Best Practices</h2>
            <div className="space-y-4 text-slate-300">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">For Grow Logs</h3>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>Log consistently – record environmental parameters regularly, not just at the end</li>
                  <li>Be specific – "pins appeared" is less useful than "first pins on day 8, very uniform"</li>
                  <li>Rate honestly – quality ratings help identify what conditions work best for you</li>
                  <li>Tag issues – use consistent tags so you can filter by problem type later</li>
                  <li>Update outcomes – return to logs to record final yield and lessons learned</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">For Notes</h3>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>Use markdown formatting – headers, lists, and code blocks make notes scannable</li>
                  <li>Link to content – connect notes to relevant guides, species pages, and troubleshooting articles</li>
                  <li>Pin important notes – keep reference material visible</li>
                  <li>Use consistent tags – build a personal tagging system that works for you</li>
                  <li>Update regularly – refine notes as you learn more</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">For Insights</h3>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>Be honest about confidence – rate your confidence level accurately</li>
                  <li>Cite your experience – explain why you believe this insight is true</li>
                  <li>Link to related content – help readers understand context</li>
                  <li>Stay specific – "humidity matters" is less useful than "maintain 85-95% humidity for oysters"</li>
                  <li>Avoid absolutes – use "tends to", "often", or "in my experience" for observations</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Code of Conduct */}
          <section id="code-of-conduct" className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">🤝 Code of Conduct</h2>
            <div className="space-y-4 text-slate-300">
              <p>
                While the community layer is personal and private by default, if you choose to share insights, please follow these principles:
              </p>
              <ul className="space-y-3 ml-2">
                <li><strong>Be Respectful:</strong> We're all learning. Different methods work for different people.</li>
                <li><strong>Be Honest:</strong> Share real experiences and data. Acknowledge limits to your knowledge.</li>
                <li><strong>Be Safe:</strong> Never share advice that could harm someone or violate local laws.</li>
                <li><strong>Be Helpful:</strong> Focus on practical, actionable information that helps others improve.</li>
                <li><strong>Be Inclusive:</strong> Beginner and advanced growers are equally welcome.</li>
              </ul>
            </div>
          </section>

          {/* FAQ */}
          <section id="faq" className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">❓ Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-white mb-2">Q: Is my data really stored only locally?</h4>
                <p className="text-slate-300">
                  Yes. By default, all data is stored in your browser's localStorage. No information is sent to our servers. Check your browser's developer tools (F12) → Application → Local Storage to see your data.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-2">Q: What happens if I clear my browser cache?</h4>
                <p className="text-slate-300">
                  Your data will be deleted. Always export your data regularly as a backup. We also recommend using "Create Backup" which stores multiple backups locally.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-2">Q: Can I share grow logs?</h4>
                <p className="text-slate-300">
                  Grow logs are always private by design. You can screenshot or manually transcribe data if you want to share specific information, but we recommend sharing insights instead.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-2">Q: How do I link notes to knowledge base articles?</h4>
                <p className="text-slate-300">
                  When creating or editing a note, use the "Link to Content" button. Search for the article and click to add it. You can link to multiple guides, troubleshooting articles, species pages, and tools.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-2">Q: What are "suggestions"?</h4>
                <p className="text-slate-300">
                  The system can suggest new tags and insights based on your grow logs and notes. Review suggestions in the Insights tab and accept or skip them.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-2">Q: Can I use this offline?</h4>
                <p className="text-slate-300">
                  The community layer works fully offline. All features are available without an internet connection.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-2">Q: How do I delete all my data?</h4>
                <p className="text-slate-300">
                  Your data is entirely in your control. You can delete individual items, or clear all community data by clearing your browser's localStorage. There's no way for us to help you recover it.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-2">Q: Will there be a server-side version for syncing across devices?</h4>
                <p className="text-slate-300">
                  This is a potential future feature. When/if it's implemented, it will be fully optional and will require your explicit opt-in.
                </p>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-lg p-8 text-center">
            <h3 className="text-2xl font-bold mb-3">Ready to Start?</h3>
            <p className="text-indigo-200 mb-6">
              Your cultivation knowledge and experience matter. Start logging your grows and sharing what you learn.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <a href="/community" className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">
                📊 Go to Community Hub
              </a>
              <a href="/community/grow-logs" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors">
                📝 Create First Grow Log
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
