import { useState, useEffect } from 'react'
import { Trash2, AlertTriangle, CheckCircle } from 'lucide-react'
import {
  useAllSources,
  useArticleCountPreview,
  useDeleteArticles
} from '@/hooks/useArticlesQuery'

export function DeleteArticlesPanel() {
  const [beforeDate, setBeforeDate] = useState('')
  const [selectedSources, setSelectedSources] = useState<string[]>([])
  const [deleteSummaries, setDeleteSummaries] = useState(true)
  const [deleteFromVectorStore, setDeleteFromVectorStore] = useState(true)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [deleteResult, setDeleteResult] = useState<any>(null)

  const { data: allSources, isLoading: sourcesLoading } = useAllSources()
  const { mutate: deleteArticles, isPending: isDeleting } = useDeleteArticles()

  // Build preview params
  const previewParams = {
    before_date: beforeDate || undefined,
    sources: selectedSources.length > 0 ? selectedSources.join(',') : undefined
  }

  const { data: previewData, isLoading: previewLoading } = useArticleCountPreview(previewParams)

  const hasFilters = beforeDate || selectedSources.length > 0

  const handleSourceToggle = (source: string) => {
    setSelectedSources(prev =>
      prev.includes(source)
        ? prev.filter(s => s !== source)
        : [...prev, source]
    )
  }

  const handleDeleteClick = () => {
    if (!hasFilters) return
    setShowConfirmDialog(true)
  }

  const handleConfirmDelete = () => {
    deleteArticles(
      {
        before_date: beforeDate || undefined,
        sources: selectedSources.length > 0 ? selectedSources : undefined,
        delete_summaries: deleteSummaries,
        delete_from_vector_store: deleteFromVectorStore
      },
      {
        onSuccess: (data) => {
          setDeleteResult(data)
          setShowConfirmDialog(false)
          // Reset form
          setBeforeDate('')
          setSelectedSources([])
        },
        onError: (error: any) => {
          alert(error.response?.data?.detail || 'Failed to delete articles')
          setShowConfirmDialog(false)
        }
      }
    )
  }

  return (
    <div className="card p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Trash2 className="h-5 w-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Database Cleanup</h3>
      </div>

      <p className="text-sm text-gray-600 mb-6">
        Delete articles from the database by date and/or source. This action cannot be undone.
      </p>

      <div className="space-y-6">
        {/* Date Filter */}
        <div>
          <label htmlFor="beforeDate" className="block text-sm font-medium text-gray-700 mb-2">
            Delete articles published before
          </label>
          <input
            id="beforeDate"
            type="date"
            value={beforeDate}
            onChange={(e) => setBeforeDate(e.target.value)}
            className="input w-full"
            max={new Date().toISOString().split('T')[0]}
          />
          <p className="text-xs text-gray-500 mt-1">
            Leave empty to not filter by date
          </p>
        </div>

        {/* Source Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Delete articles from sources
          </label>
          {sourcesLoading ? (
            <div className="text-sm text-gray-500">Loading sources...</div>
          ) : allSources && allSources.length > 0 ? (
            <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-md p-3 space-y-2">
              {allSources.map((source) => (
                <label key={source} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedSources.includes(source)}
                    onChange={() => handleSourceToggle(source)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{source}</span>
                </label>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500">No sources available</div>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Leave empty to not filter by source
          </p>
        </div>

        {/* Additional Options */}
        <div className="border-t border-gray-200 pt-4 space-y-3">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={deleteSummaries}
              onChange={(e) => setDeleteSummaries(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Also delete associated summaries</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={deleteFromVectorStore}
              onChange={(e) => setDeleteFromVectorStore(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Also delete from vector store</span>
          </label>
        </div>

        {/* Preview */}
        {hasFilters && previewData && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-yellow-900 mb-2">
                  Deletion Preview
                </h4>
                <p className="text-sm text-yellow-800 mb-2">
                  <strong>{previewData.total_count}</strong> article{previewData.total_count !== 1 ? 's' : ''} will be deleted
                </p>
                {Object.keys(previewData.source_breakdown).length > 0 && (
                  <div className="text-xs text-yellow-700">
                    <p className="font-medium mb-1">Breakdown by source:</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      {Object.entries(previewData.source_breakdown).map(([source, count]) => (
                        <li key={source}>
                          {source}: {count as number} article{count !== 1 ? 's' : ''}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {deleteResult && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-green-900 mb-2">
                  Deletion Successful
                </h4>
                <div className="text-sm text-green-800 space-y-1">
                  <p><strong>{deleteResult.deleted_count}</strong> articles deleted</p>
                  {deleteResult.deleted_summaries_count > 0 && (
                    <p><strong>{deleteResult.deleted_summaries_count}</strong> summaries deleted</p>
                  )}
                  {deleteResult.deleted_from_vector_store > 0 && (
                    <p><strong>{deleteResult.deleted_from_vector_store}</strong> vector store entries deleted</p>
                  )}
                  <p className="pt-1"><strong>{deleteResult.remaining_articles}</strong> articles remaining in database</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Button */}
        <button
          onClick={handleDeleteClick}
          disabled={!hasFilters || previewLoading || isDeleting || (previewData?.total_count === 0)}
          className="btn-danger w-full flex items-center justify-center space-x-2"
        >
          <Trash2 className="h-4 w-4" />
          <span>
            {isDeleting
              ? 'Deleting...'
              : previewLoading
              ? 'Loading...'
              : !hasFilters
              ? 'Select filters to delete'
              : previewData?.total_count === 0
              ? 'No articles match filters'
              : `Delete ${previewData?.total_count || 0} article${previewData?.total_count !== 1 ? 's' : ''}`
            }
          </span>
        </button>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-start space-x-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Confirm Deletion
                </h3>
                <p className="text-sm text-gray-700 mb-2">
                  You are about to permanently delete <strong>{previewData?.total_count}</strong> article{previewData?.total_count !== 1 ? 's' : ''}.
                </p>
                <p className="text-sm text-gray-700 mb-4">
                  This action cannot be undone. Are you sure you want to continue?
                </p>
                {deleteSummaries && (
                  <p className="text-xs text-gray-600 mb-1">
                    ✓ Associated summaries will also be deleted
                  </p>
                )}
                {deleteFromVectorStore && (
                  <p className="text-xs text-gray-600">
                    ✓ Vector store entries will also be deleted
                  </p>
                )}
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="btn-outline flex-1"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="btn-danger flex-1"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Articles'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
