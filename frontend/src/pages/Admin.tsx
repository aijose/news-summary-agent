import { useState } from 'react'
import { IngestionPanel } from '@/components/admin/IngestionPanel'
import { Database, Settings, BarChart3, Plus, Trash2, ExternalLink } from 'lucide-react'
import { useRSSFeeds, useAddRSSFeed, useDeleteRSSFeed } from '@/hooks/useArticlesQuery'

export function Admin() {
  const [newFeedName, setNewFeedName] = useState('')
  const [newFeedUrl, setNewFeedUrl] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)

  const { data: rssFeeds, isLoading: feedsLoading } = useRSSFeeds()
  const { mutate: addFeed, isPending: isAdding } = useAddRSSFeed()
  const { mutate: deleteFeed, isPending: isDeleting } = useDeleteRSSFeed()

  const handleAddFeed = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newFeedName.trim() || !newFeedUrl.trim()) return

    addFeed(
      { name: newFeedName.trim(), url: newFeedUrl.trim() },
      {
        onSuccess: () => {
          setNewFeedName('')
          setNewFeedUrl('')
          setShowAddForm(false)
        },
        onError: (error: any) => {
          alert(error.response?.data?.detail || 'Failed to add RSS feed')
        }
      }
    )
  }

  const handleDeleteFeed = (feedUrl: string, feedName: string) => {
    if (confirm(`Are you sure you want to remove "${feedName}"?`)) {
      deleteFeed(feedUrl, {
        onError: (error: any) => {
          alert(error.response?.data?.detail || 'Failed to delete RSS feed')
        }
      })
    }
  }

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

          {/* Future: System Stats */}
          <div className="card p-6">
            <div className="flex items-center space-x-2 mb-4">
              <BarChart3 className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">System Statistics</h3>
            </div>
            <div className="text-sm text-gray-500">
              System statistics and monitoring will be available in future updates.
            </div>
          </div>
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
                <span className="text-gray-600">Database Status:</span>
                <span className="text-green-600 font-medium">Connected</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Vector Store:</span>
                <span className="text-green-600 font-medium">Active</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">RSS Feeds:</span>
                <span className="text-blue-600 font-medium">
                  {feedsLoading ? 'Loading...' : `${rssFeeds?.length || 0} configured`}
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
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span className="text-sm text-gray-700">AI Features (API Key Required)</span>
              </div>
            </div>
          </div>

          {/* RSS Feed Sources */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">RSS Feed Sources</h3>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="btn-outline text-sm flex items-center space-x-1"
                disabled={isAdding}
              >
                <Plus className="h-4 w-4" />
                <span>Add Feed</span>
              </button>
            </div>

            {/* Add Feed Form */}
            {showAddForm && (
              <form onSubmit={handleAddFeed} className="mb-4 p-4 bg-gray-50 rounded-md">
                <div className="space-y-3">
                  <div>
                    <label htmlFor="feedName" className="block text-sm font-medium text-gray-700 mb-1">
                      Feed Name
                    </label>
                    <input
                      id="feedName"
                      type="text"
                      value={newFeedName}
                      onChange={(e) => setNewFeedName(e.target.value)}
                      placeholder="e.g., CNN World News"
                      className="input w-full text-sm"
                      disabled={isAdding}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="feedUrl" className="block text-sm font-medium text-gray-700 mb-1">
                      Feed URL
                    </label>
                    <input
                      id="feedUrl"
                      type="url"
                      value={newFeedUrl}
                      onChange={(e) => setNewFeedUrl(e.target.value)}
                      placeholder="https://example.com/rss"
                      className="input w-full text-sm"
                      disabled={isAdding}
                      required
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      className="btn-primary text-sm"
                      disabled={isAdding || !newFeedName.trim() || !newFeedUrl.trim()}
                    >
                      {isAdding ? 'Adding...' : 'Add Feed'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false)
                        setNewFeedName('')
                        setNewFeedUrl('')
                      }}
                      className="btn-outline text-sm"
                      disabled={isAdding}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Feed List */}
            {feedsLoading ? (
              <div className="text-sm text-gray-500">Loading feeds...</div>
            ) : rssFeeds && rssFeeds.length > 0 ? (
              <div className="space-y-2">
                {rssFeeds.map((feed) => (
                  <div
                    key={feed.url}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900">{feed.name}</div>
                      <a
                        href={feed.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-gray-500 hover:text-blue-600 flex items-center space-x-1 truncate"
                      >
                        <span className="truncate">{feed.url}</span>
                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                      </a>
                    </div>
                    <button
                      onClick={() => handleDeleteFeed(feed.url, feed.name)}
                      disabled={isDeleting}
                      className="ml-2 p-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove feed"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500">No RSS feeds configured</div>
            )}

            <div className="mt-4 text-xs text-gray-500">
              All sources should be free and publicly available RSS feeds.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}