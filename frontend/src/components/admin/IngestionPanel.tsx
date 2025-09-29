import { useState } from 'react'
import { RefreshCw, Database, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { articleApi } from '@/services/api'

interface IngestionStatus {
  isRunning: boolean
  message: string
  progress?: {
    feedsProcessed: number
    totalFeeds: number
    newArticles: number
    totalDuplicates: number
    totalFailures: number
  }
  error?: string
}

export function IngestionPanel() {
  const [status, setStatus] = useState<IngestionStatus>({
    isRunning: false,
    message: 'Ready to ingest articles'
  })

  const triggerIngestion = async () => {
    setStatus({
      isRunning: true,
      message: 'Starting article ingestion...'
    })

    try {
      const result = await articleApi.ingestFeeds(undefined, undefined, false) // Run synchronously to get results

      if (result.status === 'completed') {
        setStatus({
          isRunning: false,
          message: `Ingestion completed! ${result.results?.total_new_articles || 0} new articles added.`,
          progress: {
            feedsProcessed: result.results?.feeds_processed || 0,
            totalFeeds: result.results?.feeds_processed || 0,
            newArticles: result.results?.total_new_articles || 0,
            totalDuplicates: result.results?.total_duplicates || 0,
            totalFailures: result.results?.total_failures || 0
          }
        })
      } else if (result.status === 'error') {
        setStatus({
          isRunning: false,
          message: 'Ingestion completed with errors',
          error: result.message || 'Unknown error occurred'
        })
      } else {
        setStatus({
          isRunning: false,
          message: `Ingestion status: ${result.status}`,
          progress: result.results ? {
            feedsProcessed: result.results.feeds_processed || 0,
            totalFeeds: result.results.feeds_processed || 0,
            newArticles: result.results.total_new_articles || 0,
            totalDuplicates: result.results.total_duplicates || 0,
            totalFailures: result.results.total_failures || 0
          } : undefined
        })
      }
    } catch (error) {
      console.error('Ingestion error:', error)
      setStatus({
        isRunning: false,
        message: 'Ingestion failed',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    }
  }

  const getStatusIcon = () => {
    if (status.isRunning) {
      return <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
    }
    if (status.error) {
      return <XCircle className="h-5 w-5 text-red-600" />
    }
    if (status.progress) {
      return <CheckCircle className="h-5 w-5 text-green-600" />
    }
    return <Database className="h-5 w-5 text-gray-600" />
  }

  const getStatusColor = () => {
    if (status.isRunning) return 'text-blue-600'
    if (status.error) return 'text-red-600'
    if (status.progress) return 'text-green-600'
    return 'text-gray-600'
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Article Ingestion</h3>
        <button
          onClick={triggerIngestion}
          disabled={status.isRunning}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {status.isRunning ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Database className="h-4 w-4" />
          )}
          <span>{status.isRunning ? 'Ingesting...' : 'Refresh Articles'}</span>
        </button>
      </div>

      <div className="space-y-4">
        {/* Status Display */}
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className={`text-sm font-medium ${getStatusColor()}`}>
            {status.message}
          </span>
        </div>

        {/* Progress Display */}
        {status.progress && (
          <div className="bg-gray-50 rounded-md p-4 space-y-2">
            <h4 className="text-sm font-medium text-gray-900">Ingestion Results</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Feeds processed:</span>
                <span className="font-medium">{status.progress.feedsProcessed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">New articles:</span>
                <span className="font-medium text-green-600">{status.progress.newArticles}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Duplicates found:</span>
                <span className="font-medium text-yellow-600">{status.progress.totalDuplicates}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Failed articles:</span>
                <span className="font-medium text-red-600">{status.progress.totalFailures}</span>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {status.error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-red-800">Error</h4>
                <p className="text-sm text-red-700 mt-1">{status.error}</p>
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
                This process fetches the latest articles from 10 diverse RSS feeds including BBC, Reuters,
                The Guardian, TechCrunch, Ars Technica, Science Daily, MIT News, Hacker News, NPR, and AP.
                New articles are processed and added to the searchable database. Run this to refresh content.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}