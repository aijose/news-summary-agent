import { Search, List, Bookmark, Sparkles, Filter, Eye, Zap, Brain, TrendingUp } from 'lucide-react'

export function Help() {
  const features = [
    {
      icon: Brain,
      title: 'Research Agent',
      description: 'Autonomous AI agent for complex multi-step research',
      instructions: [
        'Navigate to the Research Agent page from the main menu',
        'Enter a complex research question in natural language',
        'The agent creates a plan showing the steps it will take',
        'Watch as the agent autonomously executes each step',
        'Review comprehensive results including summaries, analyses, and perspectives',
        'Example: "Find recent AI regulation articles and analyze different political perspectives"'
      ]
    },
    {
      icon: List,
      title: 'Browse Articles',
      description: 'Explore all ingested news articles in one place',
      instructions: [
        'Navigate to the Browse page from the main menu',
        'Scroll through the latest articles from your configured news sources',
        'Use the Refresh button to check for newly ingested articles',
        'Click "Load More" to view additional articles beyond the first page',
        'Click any article card to view the full details and AI analysis'
      ]
    },
    {
      icon: Search,
      title: 'Search Articles',
      description: 'Find specific news topics using semantic search',
      instructions: [
        'Use the search bar on the Home page or navigate to the Search page',
        'Enter keywords or topics you\'re interested in',
        'Toggle "AI-Enhanced Search" for smarter contextual results',
        'Results are ranked by relevance to your query',
        'Select multiple articles (up to 10) for multi-perspective analysis'
      ]
    },
    {
      icon: Sparkles,
      title: 'AI Summaries',
      description: 'Get AI-generated summaries in three distinct styles',
      instructions: [
        'Choose your summary type: Brief (100-150 words), Comprehensive (250-400 words), or Analytical (300-500 words)',
        'Brief summaries provide quick facts only, perfect for scanning headlines',
        'Comprehensive summaries include context, details, and significance',
        'Analytical summaries offer deep analysis, implications, and future outlook',
        'Click "Generate Summary" after selecting your preferred type',
        'Summaries are saved and will appear automatically on future views'
      ]
    },
    {
      icon: TrendingUp,
      title: 'Trending Insights',
      description: 'AI-powered analysis of what\'s trending in the news',
      instructions: [
        'On the Home page, click "Show Trending Insights" button',
        'Select your time period: 24 hours, 48 hours, or Week',
        'View AI-generated analysis of main topics, themes, and connections',
        'Browse sample trending articles related to the analysis',
        'Click any sample article to read the full story',
        'Use the refresh button to regenerate insights with latest articles'
      ]
    },
    {
      icon: Filter,
      title: 'Tag Filtering',
      description: 'Filter articles by topic tags and sources',
      instructions: [
        'Look for the tag filter section on Browse and Search pages',
        'Click any tag (Technology, Science, Business, etc.) to filter articles',
        'Select multiple tags to see articles from any of those categories',
        'Selected tags are highlighted with a checkmark',
        'Click "Clear all" to remove all filters and see all articles'
      ]
    },
    {
      icon: Bookmark,
      title: 'Reading List',
      description: 'Save articles to read later',
      instructions: [
        'Click the bookmark icon on any article card to save it',
        'Navigate to "Reading List" to view all saved articles',
        'Click the bookmark icon again to remove from your reading list',
        'Your reading list persists across sessions',
        'Use this feature to curate articles for deeper reading'
      ]
    },
    {
      icon: Eye,
      title: 'Multi-Perspective Analysis',
      description: 'Compare how different sources cover the same story',
      instructions: [
        'On the Search page, select 2-10 articles by clicking the checkbox',
        'The analysis panel appears on the right side',
        'Click "Analyze Selected Articles" to generate the comparison',
        'View common themes, unique perspectives, and bias detection',
        'Use this to get a balanced view of controversial topics'
      ]
    },
    {
      icon: Zap,
      title: 'Real-time Updates',
      description: 'Stay current with automatic news ingestion',
      instructions: [
        'Articles are automatically ingested from configured RSS feeds',
        'New articles appear when you refresh the page',
        'The system runs continuous background ingestion',
        'Use the Refresh button to check for the latest content',
        'Browse by time (last 24h, 7d, 30d) to see recent vs older articles'
      ]
    }
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-neutral-900 mb-4">Help & Features</h1>
        <p className="text-lg text-neutral-600 leading-relaxed max-w-3xl">
          Learn how to make the most of Distill's powerful features for efficient news consumption
          and intelligent analysis.
        </p>
      </div>

      {/* Feature Overview */}
      <div className="mb-12 card p-8 bg-gradient-to-br from-primary-50 to-secondary-50">
        <h2 className="text-2xl font-bold text-neutral-900 mb-6">Main Features</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div key={index} className="flex items-start gap-3 p-4 bg-white rounded-lg">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-1">{feature.title}</h3>
                  <p className="text-sm text-neutral-600">{feature.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Detailed Features */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-neutral-900 mb-6">Detailed Guide</h2>
      </div>

      {/* Features Grid */}
      <div className="space-y-8">
        {features.map((feature, index) => {
          const Icon = feature.icon
          return (
            <div key={index} className="card p-8">
              <div className="flex items-start gap-6">
                {/* Icon */}
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center">
                    <Icon className="h-7 w-7 text-primary-600" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                    {feature.title}
                  </h2>
                  <p className="text-neutral-600 mb-4 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Instructions */}
                  <div className="bg-neutral-50 rounded-lg p-5">
                    <h3 className="text-sm font-semibold text-neutral-700 mb-3 uppercase tracking-wide">
                      How to Use:
                    </h3>
                    <ul className="space-y-2">
                      {feature.instructions.map((instruction, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-neutral-700">
                          <span className="flex-shrink-0 w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-semibold mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="leading-relaxed">{instruction}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Getting Started Section */}
      <div className="mt-12 card p-8 bg-primary-50 border-2 border-primary-200">
        <h2 className="text-2xl font-bold text-primary-900 mb-4">Getting Started</h2>
        <div className="space-y-3 text-primary-800 leading-relaxed">
          <p>
            <strong>New to Distill?</strong> Start by checking out Trending Insights on the Home page
            to see what's making headlines. Then browse the latest articles or filter by tags to find
            topics that interest you.
          </p>
          <p>
            Once you find interesting articles, select a summary type (Brief, Comprehensive, or Analytical)
            and click "Generate Summary" to get AI-powered insights in seconds. Save articles to your
            Reading List for later review.
          </p>
          <p>
            For deeper analysis, use the Search page to find articles on specific topics, then
            select multiple articles to generate a multi-perspective comparison. Or try the Research Agent
            for complex, multi-step research questions.
          </p>
        </div>
      </div>

      {/* Tips Section */}
      <div className="mt-8 card p-8 bg-secondary-50 border-2 border-secondary-200">
        <h2 className="text-2xl font-bold text-secondary-900 mb-4">Pro Tips</h2>
        <ul className="space-y-3 text-secondary-800">
          <li className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-secondary-600 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Choose the right summary type:</strong> Use Brief for quick scanning, Comprehensive
              for balanced understanding, and Analytical when you need deep insights and future implications.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <TrendingUp className="h-5 w-5 text-secondary-600 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Stay on top of trends:</strong> Check Trending Insights regularly to see AI analysis
              of what's dominating the news cycle and discover sample articles you might have missed.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <Filter className="h-5 w-5 text-secondary-600 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Stay focused:</strong> Combine multiple tags to create custom topic streams
              that match your specific interests.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <Eye className="h-5 w-5 text-secondary-600 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Get balanced views:</strong> Use multi-perspective analysis on controversial
              topics to understand different viewpoints and identify bias.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <Bookmark className="h-5 w-5 text-secondary-600 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Build your queue:</strong> Save articles throughout the day and review your
              Reading List during dedicated reading time.
            </span>
          </li>
        </ul>
      </div>
    </div>
  )
}
