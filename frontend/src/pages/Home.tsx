import { Search as SearchIcon, TrendingUp, Clock, Zap } from 'lucide-react'

export function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6 text-balance">
            News Summary Agent
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto text-balance">
            Transform how you consume news with AI-powered summaries,
            multi-perspective analysis, and intelligent insights.
          </p>

          {/* Quick Search */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search for news topics, events, or keywords..."
                className="input w-full pl-12 pr-4 py-4 text-lg"
              />
              <button className="btn-primary absolute right-2 top-1/2 transform -translate-y-1/2">
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="card p-8 text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Intelligent Summaries</h3>
            <p className="text-gray-600">
              Get AI-powered summaries in multiple lengths with 90%+ fact preservation
            </p>
          </div>

          <div className="card p-8 text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Multi-Perspective Analysis</h3>
            <p className="text-gray-600">
              Compare how different sources cover the same story with bias detection
            </p>
          </div>

          <div className="card p-8 text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Real-time Updates</h3>
            <p className="text-gray-600">
              Stay informed with continuous news ingestion and instant notifications
            </p>
          </div>
        </div>

        {/* Status Notice */}
        <div className="card p-6 bg-yellow-50 border-yellow-200">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-400 rounded-full mr-3 animate-pulse"></div>
            <div>
              <h4 className="font-semibold text-yellow-800">Development Status</h4>
              <p className="text-yellow-700">
                Phase 1 MVP in development. Basic search and summarization features coming soon.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}