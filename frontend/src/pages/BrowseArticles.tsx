import { useState } from 'react'
import { Filter, RefreshCw } from 'lucide-react'
import { ArticleList } from '@/components/articles/ArticleList'
import { TagFilter } from '@/components/TagFilter'
import { useInfiniteArticles } from '@/hooks/useArticlesQuery'

export function BrowseArticles() {
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([])
  const [hoursBack, setHoursBack] = useState<number>(168) // Default: 1 week
  const limit = 20

  const {
    data,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteArticles({
    limit,
    hours_back: hoursBack,
    tags: selectedTagIds.length > 0 ? selectedTagIds.join(',') : undefined
  })

  const articles = data?.pages.flatMap(page => page.articles) || []
  const total = data?.pages[0]?.total || 0

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

  const handleRefresh = () => {
    refetch()
  }

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }

  const errorMessage = error instanceof Error ? error.message : error ? String(error) : null

  const timeRangeOptions = [
    { value: 24, label: 'Last 24 Hours' },
    { value: 72, label: 'Last 3 Days' },
    { value: 168, label: 'Last Week' },
    { value: 720, label: 'Last Month' }
  ]

  return (
    <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-neutral-900 mb-3">Browse Articles</h1>
        <p className="text-lg text-neutral-600">
          Browse and filter articles by tags and time range.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
        <div className="flex items-center gap-2 mb-6">
          <Filter className="h-5 w-5 text-neutral-600" />
          <h3 className="text-xl font-bold text-neutral-900">Filters</h3>
        </div>

        {/* Tag Filter */}
        <div className="mb-8">
          <TagFilter
            selectedTagIds={selectedTagIds}
            onTagToggle={handleTagToggle}
            onClearAll={handleClearAllTags}
          />
        </div>

        {/* Time Range Filter */}
        <div className="flex flex-wrap gap-3 items-center">
          <span className="text-sm text-neutral-600 font-semibold">Time range:</span>
          {timeRangeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setHoursBack(option.value)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold min-h-[40px] ${
                hoursBack === option.value
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-neutral-900">
              {selectedTagIds.length > 0 ? 'Filtered ' : ''}Articles
            </h2>
            <p className="text-sm text-neutral-600 mt-2">
              Showing {articles.length} of {total} articles
            </p>
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
      </div>
    </div>
  )
}
