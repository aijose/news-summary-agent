import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Bookmark } from 'lucide-react'
import {
  addToReadingList,
  removeFromReadingList,
  checkInReadingList
} from '@/services/readingListApi'

interface SaveToReadingListButtonProps {
  articleId: number
  className?: string
  showLabel?: boolean
}

export function SaveToReadingListButton({
  articleId,
  className = '',
  showLabel = false
}: SaveToReadingListButtonProps) {
  const queryClient = useQueryClient()
  const [isSaved, setIsSaved] = useState(false)

  // Check if article is in reading list
  const { data: inReadingList, isLoading } = useQuery({
    queryKey: ['readingListCheck', articleId],
    queryFn: () => checkInReadingList(articleId),
    staleTime: 30000, // Cache for 30 seconds
  })

  // Update local state when query result changes
  useEffect(() => {
    if (inReadingList !== undefined) {
      setIsSaved(inReadingList)
    }
  }, [inReadingList])

  // Add to reading list mutation
  const addMutation = useMutation({
    mutationFn: () => addToReadingList({ article_id: articleId }),
    onSuccess: () => {
      setIsSaved(true)
      queryClient.invalidateQueries({ queryKey: ['readingList'] })
      queryClient.invalidateQueries({ queryKey: ['readingListCheck', articleId] })
    },
    onError: (error: any) => {
      console.error('Error adding to reading list:', error)
      alert('Failed to add article to reading list. Please try again.')
    }
  })

  // Remove from reading list mutation
  const removeMutation = useMutation({
    mutationFn: () => removeFromReadingList(articleId),
    onSuccess: () => {
      setIsSaved(false)
      queryClient.invalidateQueries({ queryKey: ['readingList'] })
      queryClient.invalidateQueries({ queryKey: ['readingListCheck', articleId] })
    },
    onError: (error: any) => {
      console.error('Error removing from reading list:', error)
      alert('Failed to remove article from reading list. Please try again.')
    }
  })

  const handleClick = () => {
    if (isSaved) {
      removeMutation.mutate()
    } else {
      addMutation.mutate()
    }
  }

  const isPending = addMutation.isPending || removeMutation.isPending

  return (
    <button
      onClick={handleClick}
      disabled={isPending || isLoading}
      className={`flex items-center space-x-1 px-3 py-1.5 text-sm rounded-md transition-colors disabled:opacity-50 ${
        isSaved
          ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
          : 'text-gray-600 hover:bg-gray-100'
      } ${className}`}
      title={isSaved ? 'Remove from reading list' : 'Save to reading list'}
    >
      <Bookmark
        className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`}
      />
      {showLabel && (
        <span>{isSaved ? 'Saved' : 'Save'}</span>
      )}
    </button>
  )
}
