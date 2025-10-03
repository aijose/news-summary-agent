import { RefreshCw, Database, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { useIngestFeeds } from '@/hooks/useArticlesQuery'

export function IngestionPanel() {
  const { mutate: ingestFeeds, isPending, data, error } = useIngestFeeds()

  const triggerIngestion = () => {
    ingestFeeds({ background: false })
  }

  const isRunning = isPending
  const message = isPending
    ? 'Starting article ingestion...'
    : data?.status === 'completed'
    ? `Ingestion completed! ${data.results?.total_new_articles || 0} new articles added.`
    : data?.message || 'Ready to ingest articles'

  const progress = data?.results ? {
    feedsProcessed: data.results.feeds_processed || 0,
    totalFeeds: data.results.feeds_processed || 0,
    newArticles: data.results.total_new_articles || 0,
    totalDuplicates: data.results.total_duplicates || 0,
    totalFailures: data.results.total_failures || 0
  } : undefined

  const errorMessage = error instanceof Error ? error.message : error ? String(error) : undefined

  const getStatusIcon = () => {
    if (isRunning) {
      return <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
    }
    if (errorMessage) {
      return <XCircle className="h-5 w-5 text-red-600" />
    }
    if (progress) {
      return <CheckCircle className="h-5 w-5 text-green-600" />
    }
    return <Database className="h-5 w-5 text-gray-600" />
  }

  const getStatusColor = () => {
    if (isRunning) return 'text-blue-600'
    if (errorMessage) return 'text-red-600'
    if (progress) return 'text-green-600'
    return 'text-gray-600'
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Article Ingestion</h3>
        <button
          onClick={triggerIngestion}
          disabled={isRunning}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {isRunning ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Database className="h-4 w-4" />
          )}
          <span>{isRunning ? 'Ingesting...' : 'Refresh Articles'}</span>
        </button>
      </div>

      <div className="space-y-4">
        {/* Status Display */}
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className={`text-sm font-medium ${getStatusColor()}`}>
            {message}
          </span>
        </div>

        {/* Progress Display */}
        {progress && (
          <div className="bg-gray-50 rounded-md p-4 space-y-2">
            <h4 className="text-sm font-medium text-gray-900">Ingestion Results</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Feeds processed:</span>
                <span className="font-medium">{progress.feedsProcessed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">New articles:</span>
                <span className="font-medium text-green-600">{progress.newArticles}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Duplicates found:</span>
                <span className="font-medium text-yellow-600">{progress.totalDuplicates}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Failed articles:</span>
                <span className="font-medium text-red-600">{progress.totalFailures}</span>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-red-800">Error</h4>
                <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-800">About Article Ingestion</h4>
              <p className="text-sm text-blue-700 mt-1">
                This process fetches the latest articles from your configured RSS feeds.
                New articles are processed and added to the searchable database with vector embeddings
                for semantic search. Run this regularly to keep your content fresh.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}