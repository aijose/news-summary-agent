import { useState } from 'react'
import { useTags, useCreateTag, useUpdateTag, useDeleteTag } from '@/hooks/useArticlesQuery'
import type { Tag, TagCreate, TagUpdate } from '@/types/article'

export function TagManagement() {
  const { data: tags, isLoading } = useTags()
  const createTag = useCreateTag()
  const updateTag = useUpdateTag()
  const deleteTag = useDeleteTag()

  const [isCreating, setIsCreating] = useState(false)
  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  const [formData, setFormData] = useState<TagCreate>({
    name: '',
    description: '',
    color: '#3B82F6'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingTag) {
        await updateTag.mutateAsync({
          tagId: editingTag.id,
          tag: formData as TagUpdate
        })
        setEditingTag(null)
      } else {
        await createTag.mutateAsync(formData)
      }

      setFormData({ name: '', description: '', color: '#3B82F6' })
      setIsCreating(false)
    } catch (error) {
      console.error('Failed to save tag:', error)
    }
  }

  const handleEdit = (tag: Tag) => {
    setEditingTag(tag)
    setFormData({
      name: tag.name,
      description: tag.description || '',
      color: tag.color || '#3B82F6'
    })
    setIsCreating(true)
  }

  const handleDelete = async (tagId: number) => {
    if (!confirm('Are you sure you want to delete this tag? It will be removed from all RSS feeds.')) {
      return
    }

    try {
      await deleteTag.mutateAsync(tagId)
    } catch (error) {
      console.error('Failed to delete tag:', error)
    }
  }

  const handleCancel = () => {
    setIsCreating(false)
    setEditingTag(null)
    setFormData({ name: '', description: '', color: '#3B82F6' })
  }

  if (isLoading) {
    return <div className="animate-pulse">Loading tags...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Tag Management</h3>
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Tag
          </button>
        )}
      </div>

      {isCreating && (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div>
            <label htmlFor="tag-name" className="block text-sm font-medium text-gray-700 mb-1">
              Tag Name *
            </label>
            <input
              id="tag-name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Technology, Science"
              required
            />
          </div>

          <div>
            <label htmlFor="tag-description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              id="tag-description"
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Optional description"
            />
          </div>

          <div>
            <label htmlFor="tag-color" className="block text-sm font-medium text-gray-700 mb-1">
              Color
            </label>
            <div className="flex items-center gap-3">
              <input
                id="tag-color"
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="h-10 w-20 cursor-pointer rounded border border-gray-300"
              />
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="#3B82F6"
                pattern="^#[0-9A-Fa-f]{6}$"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={createTag.isPending || updateTag.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editingTag ? 'Update Tag' : 'Create Tag'}
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

      {tags && tags.length > 0 ? (
        <div className="grid gap-2">
          {tags.map((tag) => (
            <div
              key={tag.id}
              className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: tag.color || '#3B82F6' }}
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{tag.name}</div>
                  {tag.description && (
                    <div className="text-sm text-gray-500">{tag.description}</div>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(tag)}
                  className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(tag.id)}
                  disabled={deleteTag.isPending}
                  className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No tags yet. Create your first tag to organize your RSS feeds.
        </div>
      )}
    </div>
  )
}
