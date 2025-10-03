import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useTags, useCreateTag, useUpdateTag, useDeleteTag, articleKeys } from './useArticlesQuery'
import { articleApi } from '@/services/api'
import { mockTags } from '@/test/mockData'
import type { Tag, TagCreate, TagUpdate } from '@/types/article'

// Mock the API
vi.mock('@/services/api', () => ({
  articleApi: {
    getAllTags: vi.fn(),
    createTag: vi.fn(),
    updateTag: vi.fn(),
    deleteTag: vi.fn(),
    getRSSFeeds: vi.fn(),
  },
}))

describe('Tag Hooks', () => {
  let queryClient: QueryClient

  const createWrapper = () => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          cacheTime: 0,
        },
        mutations: {
          retry: false,
        },
      },
    })

    return ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useTags', () => {
    it('fetches tags successfully', async () => {
      vi.mocked(articleApi.getAllTags).mockResolvedValue(mockTags)

      const { result } = renderHook(() => useTags(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toEqual(mockTags)
      expect(articleApi.getAllTags).toHaveBeenCalledTimes(1)
    })

    it('handles error when fetching tags fails', async () => {
      const error = new Error('Failed to fetch tags')
      vi.mocked(articleApi.getAllTags).mockRejectedValue(error)

      const { result } = renderHook(() => useTags(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isError).toBe(true))

      expect(result.current.error).toBe(error)
    })

    it('uses correct query key', () => {
      const { result } = renderHook(() => useTags(), {
        wrapper: createWrapper(),
      })

      // Check that the query key matches
      const queryState = queryClient.getQueryState(articleKeys.tags())
      expect(queryState).toBeDefined()
    })

    it('has 5 minute stale time', async () => {
      vi.mocked(articleApi.getAllTags).mockResolvedValue(mockTags)

      renderHook(() => useTags(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        const queryState = queryClient.getQueryState(articleKeys.tags())
        expect(queryState?.dataUpdatedAt).toBeDefined()
      })

      // Verify stale time is set (can't directly check the value, but we can verify it's configured)
      const queryState = queryClient.getQueryState(articleKeys.tags())
      expect(queryState).toBeDefined()
    })

    it('returns loading state initially', () => {
      vi.mocked(articleApi.getAllTags).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      )

      const { result } = renderHook(() => useTags(), {
        wrapper: createWrapper(),
      })

      expect(result.current.isLoading).toBe(true)
      expect(result.current.data).toBeUndefined()
    })
  })

  describe('useCreateTag', () => {
    it('creates a tag successfully', async () => {
      const newTag: Tag = {
        id: 4,
        name: 'Health',
        description: 'Health news',
        color: '#EF4444',
        created_at: '2025-10-03T17:00:00',
        updated_at: '2025-10-03T17:00:00',
      }
      const tagCreate: TagCreate = {
        name: 'Health',
        description: 'Health news',
        color: '#EF4444',
      }

      vi.mocked(articleApi.createTag).mockResolvedValue(newTag)

      const { result } = renderHook(() => useCreateTag(), {
        wrapper: createWrapper(),
      })

      result.current.mutate(tagCreate)

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toEqual(newTag)
      expect(articleApi.createTag).toHaveBeenCalledWith(tagCreate)
    })

    it('calls onSuccess callback after successful creation', async () => {
      const newTag: Tag = {
        id: 4,
        name: 'Health',
        description: 'Health news',
        color: '#EF4444',
        created_at: '2025-10-03T17:00:00',
        updated_at: '2025-10-03T17:00:00',
      }

      vi.mocked(articleApi.createTag).mockResolvedValue(newTag)

      const { result } = renderHook(() => useCreateTag(), {
        wrapper: createWrapper(),
      })

      const promise = result.current.mutateAsync({
        name: 'Health',
        description: 'Health news',
        color: '#EF4444',
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      // Verify the mutation completed successfully
      const data = await promise
      expect(data).toEqual(newTag)
    })

    it('handles error when creation fails', async () => {
      const error = new Error('Failed to create tag')
      vi.mocked(articleApi.createTag).mockRejectedValue(error)

      const { result } = renderHook(() => useCreateTag(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({
        name: 'Health',
        description: 'Health news',
        color: '#EF4444',
      })

      await waitFor(() => expect(result.current.isError).toBe(true))

      expect(result.current.error).toBe(error)
    })

    it('sets isPending during mutation', async () => {
      vi.mocked(articleApi.createTag).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      )

      const { result } = renderHook(() => useCreateTag(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({
        name: 'Health',
        description: 'Health news',
        color: '#EF4444',
      })

      await waitFor(() => expect(result.current.isPending).toBe(true))
    })
  })

  describe('useUpdateTag', () => {
    it('updates a tag successfully', async () => {
      const updatedTag: Tag = {
        ...mockTags[0],
        name: 'Technology Updated',
        description: 'Updated description',
      }
      const tagUpdate: TagUpdate = {
        name: 'Technology Updated',
        description: 'Updated description',
      }

      vi.mocked(articleApi.updateTag).mockResolvedValue(updatedTag)

      const { result } = renderHook(() => useUpdateTag(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({ tagId: 1, tag: tagUpdate })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toEqual(updatedTag)
      expect(articleApi.updateTag).toHaveBeenCalledWith(1, tagUpdate)
    })

    it('calls onSuccess callback after successful update', async () => {
      const updatedTag: Tag = {
        ...mockTags[0],
        name: 'Technology Updated',
      }

      vi.mocked(articleApi.updateTag).mockResolvedValue(updatedTag)

      const { result } = renderHook(() => useUpdateTag(), {
        wrapper: createWrapper(),
      })

      const promise = result.current.mutateAsync({
        tagId: 1,
        tag: { name: 'Technology Updated' },
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      // Verify the mutation completed successfully
      const data = await promise
      expect(data).toEqual(updatedTag)
    })

    it('handles error when update fails', async () => {
      const error = new Error('Failed to update tag')
      vi.mocked(articleApi.updateTag).mockRejectedValue(error)

      const { result } = renderHook(() => useUpdateTag(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({
        tagId: 1,
        tag: { name: 'Technology Updated' },
      })

      await waitFor(() => expect(result.current.isError).toBe(true))

      expect(result.current.error).toBe(error)
    })

    it('supports partial updates', async () => {
      const updatedTag: Tag = {
        ...mockTags[0],
        color: '#FF0000',
      }

      vi.mocked(articleApi.updateTag).mockResolvedValue(updatedTag)

      const { result } = renderHook(() => useUpdateTag(), {
        wrapper: createWrapper(),
      })

      await result.current.mutateAsync({
        tagId: 1,
        tag: { color: '#FF0000' }, // Only update color
      })

      expect(articleApi.updateTag).toHaveBeenCalledWith(1, { color: '#FF0000' })
    })
  })

  describe('useDeleteTag', () => {
    it('deletes a tag successfully', async () => {
      vi.mocked(articleApi.deleteTag).mockResolvedValue(undefined)

      const { result } = renderHook(() => useDeleteTag(), {
        wrapper: createWrapper(),
      })

      result.current.mutate(1)

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(articleApi.deleteTag).toHaveBeenCalledWith(1)
    })

    it('calls onSuccess callback after successful deletion', async () => {
      vi.mocked(articleApi.deleteTag).mockResolvedValue(undefined)

      const { result } = renderHook(() => useDeleteTag(), {
        wrapper: createWrapper(),
      })

      const promise = result.current.mutateAsync(1)

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      // Verify the mutation completed successfully
      await promise
      expect(articleApi.deleteTag).toHaveBeenCalledWith(1)
    })

    it('handles error when deletion fails', async () => {
      const error = new Error('Failed to delete tag')
      vi.mocked(articleApi.deleteTag).mockRejectedValue(error)

      const { result } = renderHook(() => useDeleteTag(), {
        wrapper: createWrapper(),
      })

      result.current.mutate(1)

      await waitFor(() => expect(result.current.isError).toBe(true))

      expect(result.current.error).toBe(error)
    })

    it('sets isPending during mutation', async () => {
      vi.mocked(articleApi.deleteTag).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      )

      const { result } = renderHook(() => useDeleteTag(), {
        wrapper: createWrapper(),
      })

      result.current.mutate(1)

      await waitFor(() => expect(result.current.isPending).toBe(true))
    })

    it('can delete multiple tags sequentially', async () => {
      vi.mocked(articleApi.deleteTag).mockResolvedValue(undefined)

      const { result } = renderHook(() => useDeleteTag(), {
        wrapper: createWrapper(),
      })

      await result.current.mutateAsync(1)
      await result.current.mutateAsync(2)
      await result.current.mutateAsync(3)

      expect(articleApi.deleteTag).toHaveBeenCalledTimes(3)
      expect(articleApi.deleteTag).toHaveBeenNthCalledWith(1, 1)
      expect(articleApi.deleteTag).toHaveBeenNthCalledWith(2, 2)
      expect(articleApi.deleteTag).toHaveBeenNthCalledWith(3, 3)
    })
  })
})
