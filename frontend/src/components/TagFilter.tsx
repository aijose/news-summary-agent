import { useTags } from '@/hooks/useArticlesQuery'
import type { Tag } from '@/types/article'

interface TagFilterProps {
  selectedTagIds: number[]
  onTagToggle: (tagId: number) => void
  onClearAll: () => void
}

export function TagFilter({ selectedTagIds, onTagToggle, onClearAll }: TagFilterProps) {
  const { data: tags, isLoading } = useTags()

  if (isLoading) {
    return (
      <div className="animate-pulse flex gap-2">
        <div className="h-8 w-20 bg-gray-200 rounded-full"></div>
        <div className="h-8 w-20 bg-gray-200 rounded-full"></div>
        <div className="h-8 w-20 bg-gray-200 rounded-full"></div>
      </div>
    )
  }

  if (!tags || tags.length === 0) {
    return null
  }

  const hasSelection = selectedTagIds.length > 0

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <span className="text-sm text-gray-600 font-medium">Filter by:</span>

      {tags.map((tag) => {
        const isSelected = selectedTagIds.includes(tag.id)

        return (
          <button
            key={tag.id}
            onClick={() => onTagToggle(tag.id)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              isSelected
                ? 'text-white shadow-md scale-105'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            style={
              isSelected
                ? { backgroundColor: tag.color || '#3B82F6' }
                : undefined
            }
            title={tag.description || tag.name}
          >
            {tag.name}
            {isSelected && (
              <span className="ml-1">✓</span>
            )}
          </button>
        )
      })}

      {hasSelection && (
        <button
          onClick={onClearAll}
          className="ml-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
        >
          Clear all
        </button>
      )}
    </div>
  )
}
