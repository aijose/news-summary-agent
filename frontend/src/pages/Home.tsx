import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search as SearchIcon, TrendingUp, Clock, Zap, RefreshCw } from 'lucide-react'
import { ArticleList } from '@/components/articles/ArticleList'
import { TagFilter } from '@/components/TagFilter'
import { useInfiniteArticles } from '@/hooks/useArticlesQuery'

export function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([])
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

  const errorMessage = error instanceof Error ? error.message : error ? String(error) : null

  return (
    <div className="min-h-screen">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16 pt-8">
          <h1 className="text-5xl lg:text-6xl font-bold text-neutral-900 mb-6 text-balance">
            Transform How You Read News
          </h1>
          <p className="text-xl text-neutral-600 mb-10 max-w-3xl mx-auto text-balance leading-relaxed">
            AI-powered summaries, multi-perspective analysis, and intelligent insights
            to help you stay informed in less time.
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
                className="input w-full pl-14 pr-4"
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

        {/* Recent Articles Section */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-12">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-neutral-900 mb-2">Latest News</h2>
              <p className="text-neutral-600">Stay updated with the most recent articles</p>
            </div>
            <button
              onClick={handleRefresh}
              className="btn-outline flex items-center gap-2"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
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