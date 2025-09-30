import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search as SearchIcon, TrendingUp, Clock, Zap, RefreshCw } from 'lucide-react'
import { ArticleList } from '@/components/articles/ArticleList'
import { useArticles } from '@/hooks/useArticlesQuery'

export function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  const { data, isLoading, error, refetch } = useArticles({
    limit: 6,
    hours_back: 24
  })

  const articles = data?.articles || []
  const total = data?.total || 0
  const hasMore = articles.length < total

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleRefresh = () => {
    refetch()
  }

  const errorMessage = error instanceof Error ? error.message : error ? String(error) : null

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

          {/* Main Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for news topics, events, or keywords..."
                className="input w-full pl-12 pr-4 py-4 text-lg"
              />
              <button
                type="submit"
                className="btn-primary absolute right-2 top-1/2 transform -translate-y-1/2"
              >
                Search
              </button>
            </div>
          </form>
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

        {/* Recent Articles Section */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-16">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Latest News</h2>
            <button
              onClick={handleRefresh}
              className="btn-outline flex items-center space-x-2"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          <ArticleList
            articles={articles}
            isLoading={isLoading}
            error={errorMessage}
            title=""
            showLoadMore={false}
            compact={true}
          />

          {articles.length > 0 && (
            <div className="text-center mt-6">
              <button
                onClick={() => navigate('/search')}
                className="btn-primary"
              >
                Search All Articles
              </button>
            </div>
          )}
        </div>

        {/* Status Notice */}
        <div className="card p-6 bg-green-50 border-green-200">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
            <div>
              <h4 className="font-semibold text-green-800">System Status</h4>
              <p className="text-green-700">
                Phase 2 Core Agent operational. Search functionality and article listings now available.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}