import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SearchInput } from '@/components/search/SearchInput'
import { SearchResults } from '@/components/search/SearchResults'
import { MultiPerspectiveAnalysis } from '@/components/analysis/MultiPerspectiveAnalysis'
import { useSearchMutation } from '@/hooks/useSearchQuery'
import type { SearchResult } from '@/types/article'

export function Search() {
  const { mutate: performSearch, data: searchResponse, isPending: isLoading, error } = useSearchMutation()
  const [searchParams] = useSearchParams()
  const [selectedArticles, setSelectedArticles] = useState<SearchResult[]>([])
  const [showAnalysis, setShowAnalysis] = useState(false)

  // Auto-search if query parameter is present
  useEffect(() => {
    const query = searchParams.get('q')
    if (query && query.trim()) {
      performSearch({ query: query.trim(), useAi: false })
    }
  }, [searchParams, performSearch])

  const handleSearch = (query: string, useAi: boolean) => {
    performSearch({ query, useAi })
  }

  const clearSearch = () => {
    // Clear by resetting component state - searchResponse will remain until next search
    setSelectedArticles([])
    setShowAnalysis(false)
  }

  // Clear selections when new search is performed
  useEffect(() => {
    setSelectedArticles([])
    setShowAnalysis(false)
  }, [searchResponse])

  const toggleArticleSelection = (article: SearchResult) => {
    setSelectedArticles(prev => {
      const isSelected = prev.some(a => a.article_id === article.article_id)
      if (isSelected) {
        return prev.filter(a => a.article_id !== article.article_id)
      } else {
        if (prev.length >= 10) {
          // Max 10 articles for analysis
          return prev
        }
        return [...prev, article]
      }
    })
  }

  const clearSelection = () => {
    setSelectedArticles([])
    setShowAnalysis(false)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Search News</h1>
        <p className="text-gray-600">
          Search through our collection of news articles using semantic search technology.
          Enable AI-Enhanced search for smarter results with contextual understanding.
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Main search area */}
        <div className="lg:col-span-3 space-y-6">
          <SearchInput
            onSearch={handleSearch}
            isLoading={isLoading}
            initialQuery={searchParams.get('q') || ''}
          />

          <SearchResults
            searchResponse={searchResponse || null}
            isLoading={isLoading}
            error={error instanceof Error ? error.message : error ? String(error) : null}
            selectedArticles={selectedArticles}
            onToggleSelection={toggleArticleSelection}
            maxSelections={10}
          />

          {searchResponse && (
            <div className="text-center">
              <button
                onClick={clearSearch}
                className="btn-secondary"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>

        {/* Analysis sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-8">
            <MultiPerspectiveAnalysis
              selectedArticles={selectedArticles}
              onClearSelection={clearSelection}
            />
          </div>
        </div>
      </div>
    </div>
  )
}