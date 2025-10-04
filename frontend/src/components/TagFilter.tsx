import { useTags } from '@/hooks/useArticlesQuery'

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
    <div className="flex flex-wrap gap-3 items-center">
      <span className="text-sm text-neutral-600 font-semibold">Filter by:</span>

      {tags.map((tag) => {
        const isSelected = selectedTagIds.includes(tag.id)

        return (
          <button
            key={tag.id}
            onClick={() => onTagToggle(tag.id)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold min-h-[40px] ${
              isSelected
                ? 'text-white shadow-md'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 border-2 border-transparent'
            }`}
            style={
              isSelected
                ? { backgroundColor: tag.color || '#4f46e5', borderColor: tag.color || '#4f46e5' }
                : undefined
            }
            title={tag.description || tag.name}
          >
            {tag.name}
            {isSelected && (
              <span className="ml-1.5">✓</span>
            )}
          </button>
        )
      })}

      {hasSelection && (
        <button
          onClick={onClearAll}
          className="ml-2 px-4 py-2 text-sm font-semibold text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg min-h-[40px]"
        >
          Clear all
        </button>
      )}
    </div>
  )
}
