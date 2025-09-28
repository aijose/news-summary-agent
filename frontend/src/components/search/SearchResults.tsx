import type { SearchResponse, SearchResult } from '@/types/article'
import { ArrowTopRightOnSquareIcon, SparklesIcon } from '@heroicons/react/24/outline'

interface SearchResultsProps {
  searchResponse: SearchResponse | null
  isLoading: boolean
  error: string | null
}

export function SearchResults({ searchResponse, isLoading, error }: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className="card p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="h-5 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Search Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!searchResponse) {
    return null
  }

  if (searchResponse.results.length === 0) {
    return (
      <div className="card p-6">
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.44-.79-6.172-2.108C5.687 12.108 5.488 12 5.25 12H3" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Found</h3>
          <p className="text-gray-600">
            No articles found for "{searchResponse.query}". Try adjusting your search terms.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Search Results
          </h2>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            {searchResponse.ai_enhanced && (
              <div className="flex items-center space-x-1 text-blue-600">
                <SparklesIcon className="h-4 w-4" />
                <span>AI Enhanced</span>
              </div>
            )}
            <span>{searchResponse.total_found} results found</span>
          </div>
        </div>

        <div className="mb-4 text-sm text-gray-600">
          Query: <span className="font-medium">"{searchResponse.query}"</span>
        </div>
      </div>

      <div className="space-y-4">
        {searchResponse.results.map((result) => (
          <SearchResultCard key={result.article_id} result={result} />
        ))}
      </div>
    </div>
  )
}

function SearchResultCard({ result }: { result: SearchResult }) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown date'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return 'Unknown date'
    }
  }

  const getSimilarityColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-100'
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-100'
    return 'text-gray-600 bg-gray-100'
  }

  return (
    <div className="card p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1">
          {result.title}
        </h3>
        <div className={`ml-4 px-2 py-1 rounded-full text-xs font-medium ${getSimilarityColor(result.similarity_score)}`}>
          {Math.round(result.similarity_score * 100)}% match
        </div>
      </div>

      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
        <span className="font-medium">{result.source}</span>
        <span>•</span>
        <span>{formatDate(result.published_date)}</span>
        {result.url && (
          <>
            <span>•</span>
            <a
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
            >
              <span>Read original</span>
              <ArrowTopRightOnSquareIcon className="h-3 w-3" />
            </a>
          </>
        )}
      </div>

      <p className="text-gray-700 mb-4 line-clamp-3">{result.snippet}</p>

      {result.ai_summary && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <div className="flex items-center space-x-2 mb-2">
            <SparklesIcon className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">AI Summary</span>
          </div>
          <p className="text-sm text-blue-700">{result.ai_summary}</p>
        </div>
      )}

      {result.metadata && Object.keys(result.metadata).length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {Object.entries(result.metadata).map(([key, value]) => (
              <span
                key={key}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800"
              >
                {key}: {String(value)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}