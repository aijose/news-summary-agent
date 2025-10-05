import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search as SearchIcon, TrendingUp, Clock, Zap, RefreshCw, Sparkles } from 'lucide-react'
import { ArticleList } from '@/components/articles/ArticleList'
import { TagFilter } from '@/components/TagFilter'
import { useInfiniteArticles } from '@/hooks/useArticlesQuery'
import { useQuery } from '@tanstack/react-query'
import { articleApi } from '@/services/api'

export function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([])
  const [trendingPeriod, setTrendingPeriod] = useState<24 | 48 | 168>(24)
  const [showTrending, setShowTrending] = useState(false)
  const navigate = useNavigate()

  const {
    data,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteArticles({
    limit: 6,
    hours_back: 24,
    tags: selectedTagIds.length > 0 ? selectedTagIds.join(',') : undefined
  })

  const articles = data?.pages.flatMap(page => page.articles) || []

  // Fetch trending topics (manual trigger only)
  const {
    data: trendingData,
    isLoading: isTrendingLoading,
    error: trendingError,
    refetch: refetchTrending
  } = useQuery({
    queryKey: ['trending-topics', trendingPeriod],
    queryFn: () => articleApi.getTrendingTopics(trendingPeriod),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: false, // Don't auto-fetch on mount
  })

  // Fetch sample articles for trending topics
  const sampleArticleIds = trendingData?.article_ids?.slice(0, 5) || []
  const {
    data: sampleArticlesData,
    isLoading: isSampleArticlesLoading,
  } = useQuery({
    queryKey: ['sample-articles', sampleArticleIds],
    queryFn: async () => {
      if (sampleArticleIds.length === 0) return []
      const promises = sampleArticleIds.map(id => articleApi.getArticle(id))
      return Promise.all(promises)
    },
    enabled: sampleArticleIds.length > 0 && showTrending,
    staleTime: 5 * 60 * 1000,
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleRefresh = () => {
    refetch()
  }

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }

  const handleTagToggle = (tagId: number) => {
    setSelectedTagIds(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    )
  }

  const handleClearAllTags = () => {
    setSelectedTagIds([])
  }

  const handleGenerateTrending = () => {
    setShowTrending(true)
    refetchTrending()
  }

  const errorMessage = error instanceof Error ? error.message : error ? String(error) : null

  return (
    <div className="min-h-screen">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16 pt-8">
          <h1 className="text-5xl lg:text-6xl font-bold text-neutral-900 mb-6 text-balance">
            Pure News, Refined by AI
          </h1>
          <p className="text-xl text-neutral-600 mb-10 max-w-3xl mx-auto text-balance leading-relaxed">
            Browse curated articles, get AI-powered summaries, and filter by topic
            to stay informed in less time.
          </p>

          {/* Main Search Bar */}
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto mb-8">
            <div className="relative">
              <SearchIcon className="absolute left-5 top-1/2 transform -translate-y-1/2 text-neutral-400 h-5 w-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for news topics, events, or keywords..."
                className="input w-full pl-14 pr-32"
              />
              <button
                type="submit"
                className="btn-primary absolute right-0.5 top-1/2 transform -translate-y-1/2"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="card p-8 text-center">
            <div className="w-16 h-16 bg-secondary-100 rounded-xl flex items-center justify-center mx-auto mb-5">
              <Zap className="h-8 w-8 text-secondary-600" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-neutral-900">Intelligent Summaries</h3>
            <p className="text-neutral-600 leading-relaxed">
              Get AI-powered summaries in multiple lengths with 90%+ fact preservation
            </p>
          </div>

          <div className="card p-8 text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-5">
              <TrendingUp className="h-8 w-8 text-primary-600" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-neutral-900">Multi-Perspective Analysis</h3>
            <p className="text-neutral-600 leading-relaxed">
              Compare how different sources cover the same story with bias detection
            </p>
          </div>

          <div className="card p-8 text-center">
            <div className="w-16 h-16 bg-neutral-200 rounded-xl flex items-center justify-center mx-auto mb-5">
              <Clock className="h-8 w-8 text-neutral-700" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-neutral-900">Real-time Updates</h3>
            <p className="text-neutral-600 leading-relaxed">
              Stay informed with continuous news ingestion and instant notifications
            </p>
          </div>
        </div>

        {/* Trending Insights Section */}
        {showTrending && (
          <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl shadow-sm p-8 mb-12 border-2 border-primary-100">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-neutral-900 mb-1">Trending Insights</h2>
                  <p className="text-neutral-600">AI-powered analysis of current news trends</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* Time period selector */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setTrendingPeriod(24)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      trendingPeriod === 24
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    24h
                  </button>
                  <button
                    onClick={() => setTrendingPeriod(48)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      trendingPeriod === 48
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    48h
                  </button>
                  <button
                    onClick={() => setTrendingPeriod(168)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      trendingPeriod === 168
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    Week
                  </button>
                </div>
                <button
                  onClick={() => refetchTrending()}
                  className="btn-outline flex items-center gap-2 bg-white"
                  disabled={isTrendingLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${isTrendingLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Trending content */}
            {isTrendingLoading ? (
              <div className="bg-white rounded-lg p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-3"></div>
                <p className="text-neutral-600">Analyzing trending topics...</p>
              </div>
            ) : trendingError ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <p className="text-red-800 font-medium">Failed to load trending insights</p>
                <p className="text-red-600 text-sm mt-1">
                  {trendingError instanceof Error ? trendingError.message : 'Please try again later'}
                </p>
              </div>
            ) : trendingData ? (
              <div className="space-y-6">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="prose prose-primary max-w-none">
                    <p className="text-neutral-800 leading-relaxed whitespace-pre-wrap">
                      {trendingData.analysis_text}
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-neutral-200 flex items-center justify-between text-sm text-neutral-500">
                    <span>
                      Analyzed {trendingData.article_count} articles from the past {trendingData.analysis_period}
                    </span>
                    <span className="text-xs bg-neutral-100 px-3 py-1 rounded-full">
                      Powered by {trendingData.model_info?.model || 'Claude AI'}
                    </span>
                  </div>
                </div>

                {/* Trending Articles */}
                {sampleArticlesData && sampleArticlesData.length > 0 && (
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-neutral-900 mb-4">Sample Trending Articles</h3>
                    <div className="space-y-3">
                      {sampleArticlesData.map((article) => (
                        <div
                          key={article.id}
                          className="border border-neutral-200 rounded-lg p-4 hover:border-primary-300 hover:bg-primary-50/30 transition-colors cursor-pointer"
                          onClick={() => navigate(`/article/${article.id}`)}
                        >
                          <h4 className="font-medium text-neutral-900 mb-1 line-clamp-2">
                            {article.title}
                          </h4>
                          <div className="flex items-center gap-3 text-xs text-neutral-500">
                            <span className="font-medium text-primary-600">{article.source}</span>
                            <span>•</span>
                            <span>{new Date(article.published_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {isSampleArticlesLoading && (
                  <div className="bg-white rounded-lg p-6 text-center">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mb-2"></div>
                    <p className="text-sm text-neutral-600">Loading trending articles...</p>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}

        {/* Recent Articles Section */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-12">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-neutral-900 mb-2">Latest News</h2>
              <p className="text-neutral-600">Stay updated with the most recent articles</p>
            </div>
            <div className="flex items-center gap-3">
              {!showTrending && (
                <button
                  onClick={handleGenerateTrending}
                  className="btn-primary flex items-center gap-2"
                  disabled={isTrendingLoading}
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Show Trending Insights</span>
                </button>
              )}
              <button
                onClick={handleRefresh}
                className="btn-outline flex items-center gap-2"
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Tag Filter */}
          <div className="mb-8 pb-8 border-b border-neutral-200">
            <TagFilter
              selectedTagIds={selectedTagIds}
              onTagToggle={handleTagToggle}
              onClearAll={handleClearAllTags}
            />
          </div>

          <ArticleList
            articles={articles}
            isLoading={isLoading}
            error={errorMessage}
            title=""
            showLoadMore={hasNextPage}
            onLoadMore={handleLoadMore}
            compact={false}
            isLoadingMore={isFetchingNextPage}
          />

          {articles.length > 0 && (
            <div className="text-center mt-8">
              <button
                onClick={() => navigate('/search')}
                className="btn-primary"
              >
                Search All Articles
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}