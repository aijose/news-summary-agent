import { useState } from 'react'
import { ArticleCard } from './ArticleCard'
import type { Article } from '@/types/article'

interface ArticleListProps {
  articles: Article[]
  isLoading?: boolean
  error?: string | null
  title?: string
  showLoadMore?: boolean
  onLoadMore?: () => void
  compact?: boolean
  isLoadingMore?: boolean
}

export function ArticleList({
  articles,
  isLoading,
  error,
  title = "Recent Articles",
  showLoadMore = false,
  onLoadMore,
  compact = false,
  isLoadingMore = false
}: ArticleListProps) {
  const [showSummaries, setShowSummaries] = useState(false)

  if (isLoading) {
    return (
      <div className="space-y-4">
        {title && <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>}
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-6 space-y-3">
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        {title && <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>}
        <div className="card p-6">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error Loading Articles</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (articles.length === 0) {
    return (
      <div className="space-y-4">
        {title && <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>}
        <div className="card p-8">
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Articles Found</h3>
            <p className="text-gray-600">
              There are no articles available at the moment. Check back later for updates.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {title && (
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          {!compact && (
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showSummaries}
                  onChange={(e) => setShowSummaries(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Show AI Summaries</span>
              </label>
            </div>
          )}
        </div>
      )}

      <div className={`grid gap-4 ${compact ? 'grid-cols-1' : 'grid-cols-1'}`}>
        {articles.map((article) => (
          <ArticleCard
            key={article.id}
            article={article}
            showSummary={showSummaries}
            compact={compact}
          />
        ))}
      </div>

      {showLoadMore && onLoadMore && articles.length > 0 && (
        <div className="text-center mt-8">
          <button
            onClick={onLoadMore}
            className="btn-primary"
            disabled={isLoadingMore}
          >
            {isLoadingMore ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </span>
            ) : (
              'Load More Articles'
            )}
          </button>
        </div>
      )}

      {articles.length > 0 && (
        <div className="text-center text-sm text-gray-500 mt-6">
          Showing {articles.length} article{articles.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}