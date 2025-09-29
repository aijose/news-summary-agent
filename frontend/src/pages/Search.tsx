import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SearchInput } from '@/components/search/SearchInput'
import { SearchResults } from '@/components/search/SearchResults'
import { useSearch } from '@/hooks/useSearch'

export function Search() {
  const { searchResponse, isLoading, error, search, clearSearch } = useSearch()
  const [searchParams] = useSearchParams()

  // Auto-search if query parameter is present
  useEffect(() => {
    const query = searchParams.get('q')
    if (query && query.trim()) {
      search(query.trim())
    }
  }, [searchParams, search])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Search News</h1>
        <p className="text-gray-600">
          Search through our collection of news articles using semantic search technology.
          Enable AI-Enhanced search for smarter results with contextual understanding.
        </p>
      </div>

      <div className="space-y-6">
        <SearchInput
          onSearch={search}
          isLoading={isLoading}
          initialQuery={searchParams.get('q') || ''}
        />

        <SearchResults
          searchResponse={searchResponse}
          isLoading={isLoading}
          error={error}
        />
      </div>

      {searchResponse && (
        <div className="mt-8 text-center">
          <button
            onClick={clearSearch}
            className="btn-secondary"
          >
            Clear Search
          </button>
        </div>
      )}
    </div>
  )
}