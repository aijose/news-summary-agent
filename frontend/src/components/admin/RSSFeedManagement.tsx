import { useState } from 'react'
import { useRSSFeeds, useAddRSSFeed, useUpdateRSSFeed, useDeleteRSSFeed, useTags } from '@/hooks/useArticlesQuery'
import type { RSSFeed, RSSFeedCreate, RSSFeedUpdate } from '@/types/article'

export function RSSFeedManagement() {
  const { data: feeds, isLoading: feedsLoading } = useRSSFeeds()
  const { data: tags, isLoading: tagsLoading } = useTags()
  const addFeed = useAddRSSFeed()
  const updateFeed = useUpdateRSSFeed()
  const deleteFeed = useDeleteRSSFeed()

  const [isCreating, setIsCreating] = useState(false)
  const [editingFeed, setEditingFeed] = useState<RSSFeed | null>(null)
  const [formData, setFormData] = useState<RSSFeedCreate>({
    name: '',
    url: '',
    description: '',
    tag_ids: []
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingFeed) {
        await updateFeed.mutateAsync({
          feedId: editingFeed.id,
          feed: {
            name: formData.name,
            description: formData.description,
            tag_ids: formData.tag_ids
          } as RSSFeedUpdate
        })
        setEditingFeed(null)
      } else {
        await addFeed.mutateAsync(formData)
      }

      setFormData({ name: '', url: '', description: '', tag_ids: [] })
      setIsCreating(false)
    } catch (error) {
      console.error('Failed to save RSS feed:', error)
    }
  }

  const handleEdit = (feed: RSSFeed) => {
    setEditingFeed(feed)
    setFormData({
      name: feed.name,
      url: feed.url,
      description: feed.description || '',
      tag_ids: feed.tags.map(t => t.id)
    })
    setIsCreating(true)
  }

  const handleDelete = async (feedId: number) => {
    if (!confirm('Are you sure you want to delete this RSS feed?')) {
      return
    }

    try {
      await deleteFeed.mutateAsync(feedId)
    } catch (error) {
      console.error('Failed to delete RSS feed:', error)
    }
  }

  const handleCancel = () => {
    setIsCreating(false)
    setEditingFeed(null)
    setFormData({ name: '', url: '', description: '', tag_ids: [] })
  }

  const handleToggleActive = async (feed: RSSFeed) => {
    try {
      await updateFeed.mutateAsync({
        feedId: feed.id,
        feed: {
          is_active: !feed.is_active
        }
      })
    } catch (error) {
      console.error('Failed to toggle feed status:', error)
    }
  }

  const toggleTag = (tagId: number) => {
    setFormData(prev => ({
      ...prev,
      tag_ids: prev.tag_ids?.includes(tagId)
        ? prev.tag_ids.filter(id => id !== tagId)
        : [...(prev.tag_ids || []), tagId]
    }))
  }

  if (feedsLoading || tagsLoading) {
    return <div className="animate-pulse">Loading RSS feeds...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">RSS Feed Management</h3>
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add RSS Feed
          </button>
        )}
      </div>

      {isCreating && (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div>
            <label htmlFor="feed-name" className="block text-sm font-medium text-gray-700 mb-1">
              Feed Name *
            </label>
            <input
              id="feed-name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., TechCrunch, Science Daily"
              required
            />
          </div>

          {!editingFeed && (
            <div>
              <label htmlFor="feed-url" className="block text-sm font-medium text-gray-700 mb-1">
                Feed URL *
              </label>
              <input
                id="feed-url"
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/feed.xml"
                required
              />
            </div>
          )}

          <div>
            <label htmlFor="feed-description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              id="feed-description"
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Optional description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {tags && tags.length > 0 ? (
                tags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      formData.tag_ids?.includes(tag.id)
                        ? 'text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    style={
                      formData.tag_ids?.includes(tag.id)
                        ? { backgroundColor: tag.color || '#3B82F6' }
                        : undefined
                    }
                  >
                    {tag.name}
                  </button>
                ))
              ) : (
                <div className="text-sm text-gray-500">
                  No tags available. Create tags first to organize your feeds.
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={addFeed.isPending || updateFeed.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editingFeed ? 'Update Feed' : 'Add Feed'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {feeds && feeds.length > 0 ? (
        <div className="grid gap-3">
          {feeds.map((feed) => (
            <div
              key={feed.id}
              className="p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900">{feed.name}</h4>
                    <button
                      onClick={() => handleToggleActive(feed)}
                      className={`text-xs px-2 py-0.5 rounded ${
                        feed.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {feed.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </div>
                  {feed.description && (
                    <p className="text-sm text-gray-600 mt-1">{feed.description}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1 break-all">{feed.url}</p>
                  {feed.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {feed.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                          style={{ backgroundColor: tag.color || '#3B82F6' }}
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                  {feed.last_fetched_at && (
                    <p className="text-xs text-gray-400 mt-1">
                      Last fetched: {new Date(feed.last_fetched_at).toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(feed)}
                    className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(feed.id)}
                    disabled={deleteFeed.isPending}
                    className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No RSS feeds configured. Add your first feed to start collecting articles.
        </div>
      )}
    </div>
  )
}
