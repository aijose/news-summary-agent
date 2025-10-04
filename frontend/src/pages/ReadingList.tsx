import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bookmark, Trash2, ExternalLink, Calendar } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getReadingList, removeFromReadingList } from '../services/readingListApi'

export function ReadingList() {
  const queryClient = useQueryClient()

  const { data: readingList, isLoading, error } = useQuery({
    queryKey: ['readingList'],
    queryFn: getReadingList
  })

  const removeMutation = useMutation({
    mutationFn: removeFromReadingList,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['readingList'] })
    }
  })

  const handleRemove = (articleId: number) => {
    if (confirm('Remove this article from your reading list?')) {
      removeMutation.mutate(articleId)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading reading list. Please try again.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <Bookmark className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Reading List</h1>
        </div>
        <p className="text-gray-600">Articles you've saved to read later</p>
      </div>

      {/* Reading List */}
      {!readingList || readingList.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <Bookmark className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Your reading list is empty</h3>
          <p className="text-gray-600 mb-6">
            Start adding articles you want to read later by clicking the bookmark icon on any article.
          </p>
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Articles
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 mb-4">
            {readingList.length} {readingList.length === 1 ? 'article' : 'articles'} saved
          </p>

          {readingList.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <Link
                    to={`/article/${item.article.id}`}
                    className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                  >
                    {item.article.title}
                  </Link>

                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                    <span className="font-medium">{item.article.source}</span>
                    <span className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(item.article.published_date).toLocaleDateString()}
                      </span>
                    </span>
                  </div>

                  <p className="mt-3 text-gray-700 line-clamp-2">
                    {item.article.content.substring(0, 200)}...
                  </p>

                  {item.notes && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Notes:</span> {item.notes}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center space-x-2 mt-3 text-xs text-gray-500">
                    <Bookmark className="h-3 w-3" />
                    <span>Saved {new Date(item.added_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex flex-col space-y-2 ml-4">
                  <a
                    href={item.article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Open</span>
                  </a>

                  <button
                    onClick={() => handleRemove(item.article_id)}
                    disabled={removeMutation.isPending}
                    className="flex items-center space-x-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
