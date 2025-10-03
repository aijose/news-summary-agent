import { useState } from 'react'
import { Filter, RefreshCw } from 'lucide-react'
import { ArticleList } from '@/components/articles/ArticleList'
import { TagFilter } from '@/components/TagFilter'
import { useArticles } from '@/hooks/useArticlesQuery'

export function BrowseArticles() {
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([])
  const [hoursBack, setHoursBack] = useState<number>(168) // Default: 1 week
  const [limit] = useState(20)

  const { data, isLoading, error, refetch } = useArticles({
    limit,
    hours_back: hoursBack,
    tags: selectedTagIds.length > 0 ? selectedTagIds.join(',') : undefined
  })

  const articles = data?.articles || []
  const total = data?.total || 0

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

  const errorMessage = error instanceof Error ? error.message : error ? String(error) : null

  const timeRangeOptions = [
    { value: 24, label: 'Last 24 Hours' },
    { value: 72, label: 'Last 3 Days' },
    { value: 168, label: 'Last Week' },
    { value: 720, label: 'Last Month' }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Articles</h1>
        <p className="text-gray-600">
          Browse and filter articles by tags and time range.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        </div>

        {/* Tag Filter */}
        <div className="mb-6">
          <TagFilter
            selectedTagIds={selectedTagIds}
            onTagToggle={handleTagToggle}
            onClearAll={handleClearAllTags}
          />
        </div>

        {/* Time Range Filter */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-600 font-medium">Time range:</span>
          {timeRangeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setHoursBack(option.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                hoursBack === option.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {selectedTagIds.length > 0 ? 'Filtered ' : ''}Articles
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Showing {articles.length} of {total} articles
            </p>
          </div>
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
          compact={false}
        />
      </div>
    </div>
  )
}
