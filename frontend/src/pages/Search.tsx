import { useEffect, useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SearchInput } from '@/components/search/SearchInput'
import { SearchResults } from '@/components/search/SearchResults'
import { MultiPerspectiveAnalysis } from '@/components/analysis/MultiPerspectiveAnalysis'
import { TagFilter } from '@/components/TagFilter'
import { useSearchMutation } from '@/hooks/useSearchQuery'
import { useRSSFeeds } from '@/hooks/useArticlesQuery'
import type { SearchResult } from '@/types/article'

export function Search() {
  const { mutate: performSearch, data: searchResponse, isPending: isLoading, error } = useSearchMutation()
  const { data: rssFeeds } = useRSSFeeds()
  const [searchParams] = useSearchParams()
  const [selectedArticles, setSelectedArticles] = useState<SearchResult[]>([])
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([])

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
  }

  // Clear selections when new search is performed
  useEffect(() => {
    setSelectedArticles([])
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

  // Filter search results by selected tags (client-side filtering)
  const filteredSearchResponse = useMemo(() => {
    if (!searchResponse || selectedTagIds.length === 0) {
      return searchResponse
    }

    // Get feed sources for selected tags
    const selectedFeedSources = new Set<string>()
    rssFeeds?.forEach(feed => {
      const hasSelectedTag = feed.tags.some(tag => selectedTagIds.includes(tag.id))
      if (hasSelectedTag) {
        // Add various forms of the source name for flexible matching
        selectedFeedSources.add(feed.name.toLowerCase())

        // Add URL-based matching
        if (feed.url.toLowerCase().includes('sciencedaily')) {
          selectedFeedSources.add('sciencedaily')
          selectedFeedSources.add('science daily')
        } else if (feed.url.toLowerCase().includes('techcrunch')) {
          selectedFeedSources.add('techcrunch')
        } else if (feed.url.toLowerCase().includes('arstechnica')) {
          selectedFeedSources.add('ars technica')
          selectedFeedSources.add('arstechnica')
        }
      }
    })

    // Filter results
    const filteredResults = searchResponse.results.filter(result => {
      const resultSource = result.source.toLowerCase()
      return Array.from(selectedFeedSources).some(feedSource =>
        resultSource.includes(feedSource) || feedSource.includes(resultSource)
      )
    })

    return {
      ...searchResponse,
      results: filteredResults,
      total_found: filteredResults.length
    }
  }, [searchResponse, selectedTagIds, rssFeeds])

  return (
    <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-neutral-900 mb-3">Search News</h1>
        <p className="text-lg text-neutral-600 leading-relaxed max-w-3xl">
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

          {/* Tag Filter */}
          {searchResponse && searchResponse.results.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <TagFilter
                selectedTagIds={selectedTagIds}
                onTagToggle={handleTagToggle}
                onClearAll={handleClearAllTags}
              />
              {selectedTagIds.length > 0 && filteredSearchResponse && (
                <p className="text-sm text-neutral-600 mt-4 font-medium">
                  Showing {filteredSearchResponse.total_found} of {searchResponse.total_found} results
                </p>
              )}
            </div>
          )}

          <SearchResults
            searchResponse={filteredSearchResponse || null}
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
                className="btn-outline"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>

        {/* Analysis sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
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