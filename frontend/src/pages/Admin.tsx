import { IngestionPanel } from '@/components/admin/IngestionPanel'
import { DeleteArticlesPanel } from '@/components/admin/DeleteArticlesPanel'
import { TagManagement } from '@/components/admin/TagManagement'
import { RSSFeedManagement } from '@/components/admin/RSSFeedManagement'
import { Database, Settings, BarChart3 } from 'lucide-react'
import { useRSSFeeds, useArticleStats, useTags } from '@/hooks/useArticlesQuery'

export function Admin() {
  const { data: rssFeeds, isLoading: feedsLoading } = useRSSFeeds()
  const { data: stats, isLoading: statsLoading } = useArticleStats()
  const { data: tags } = useTags()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">System Administration</h1>
        <p className="text-gray-600">
          Manage article ingestion, system settings, and monitor application health.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Article Ingestion */}
          <IngestionPanel />

          {/* Tag Management */}
          <div className="card p-6">
            <TagManagement />
          </div>

          {/* RSS Feed Management */}
          <div className="card p-6">
            <RSSFeedManagement />
          </div>

          {/* Database Cleanup */}
          <DeleteArticlesPanel />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="card p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Database className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Quick Stats</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Articles:</span>
                <span className="text-blue-600 font-medium">
                  {statsLoading ? 'Loading...' : stats?.database_stats?.total_articles?.toLocaleString() || '0'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Recent (24h):</span>
                <span className="text-green-600 font-medium">
                  {statsLoading ? 'Loading...' : stats?.database_stats?.recent_articles_24h?.toLocaleString() || '0'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">RSS Feeds:</span>
                <span className="text-purple-600 font-medium">
                  {feedsLoading ? 'Loading...' : `${rssFeeds?.length || 0} configured`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Vector Store:</span>
                <span className="text-green-600 font-medium">
                  {statsLoading ? 'Loading...' : `${stats?.vector_store_stats?.total_documents?.toLocaleString() || '0'} docs`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tags:</span>
                <span className="text-indigo-600 font-medium">
                  {tags?.length || 0} tags
                </span>
              </div>
            </div>
          </div>

          {/* System Health */}
          <div className="card p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Settings className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">System Health</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm text-gray-700">API Server</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm text-gray-700">Database</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm text-gray-700">Vector Search</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm text-gray-700">AI Analysis</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}