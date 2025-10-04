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
      <div className="space-y-6">
        {title && <h2 className="text-3xl font-bold text-neutral-900 mb-6">{title}</h2>}
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-8 space-y-4">
              {/* Title skeleton */}
              <div className="h-8 bg-neutral-200 rounded-lg w-3/4"></div>

              {/* Meta info skeleton */}
              <div className="flex items-center gap-3">
                <div className="h-6 w-24 bg-primary-100 rounded-md"></div>
                <div className="h-4 w-32 bg-neutral-200 rounded"></div>
                <div className="h-4 w-20 bg-neutral-200 rounded"></div>
              </div>

              {/* Content skeleton */}
              <div className="space-y-2 pt-2">
                <div className="h-4 bg-neutral-200 rounded w-full"></div>
                <div className="h-4 bg-neutral-200 rounded w-full"></div>
                <div className="h-4 bg-neutral-200 rounded w-2/3"></div>
              </div>

              {/* Tags skeleton */}
              <div className="flex gap-2 pt-4 border-t border-neutral-200">
                <div className="h-7 w-20 bg-neutral-100 rounded-full"></div>
                <div className="h-7 w-24 bg-neutral-100 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        {title && <h2 className="text-3xl font-bold text-neutral-900 mb-6">{title}</h2>}
        <div className="card p-8">
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-red-900 mb-2">Error Loading Articles</h3>
                <p className="text-sm text-red-800 leading-relaxed">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (articles.length === 0) {
    return (
      <div className="space-y-6">
        {title && <h2 className="text-3xl font-bold text-neutral-900 mb-6">{title}</h2>}
        <div className="card p-12">
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-100 text-neutral-400 mb-6">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 mb-3">No Articles Found</h3>
            <p className="text-neutral-600 text-lg max-w-md mx-auto leading-relaxed">
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
          <h2 className="text-3xl font-bold text-neutral-900">{title}</h2>
          {!compact && (
            <div className="flex items-center gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showSummaries}
                  onChange={(e) => setShowSummaries(e.target.checked)}
                  className="h-5 w-5 text-primary-600 focus:ring-2 focus:ring-primary-500 border-neutral-300 rounded"
                />
                <span className="ml-3 text-sm font-medium text-neutral-700">Show AI Summaries</span>
              </label>
            </div>
          )}
        </div>
      )}

      <div className="grid gap-6">
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
              <span className="flex items-center justify-center gap-3">
                <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
        <div className="text-center text-sm text-neutral-500 mt-6">
          Showing {articles.length} article{articles.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}