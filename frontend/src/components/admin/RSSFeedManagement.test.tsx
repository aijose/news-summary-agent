import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test/test-utils'
import { RSSFeedManagement } from './RSSFeedManagement'
import {
  useRSSFeeds,
  useAddRSSFeed,
  useUpdateRSSFeed,
  useDeleteRSSFeed,
  useTags,
} from '@/hooks/useArticlesQuery'
import { mockRSSFeeds, mockTags } from '@/test/mockData'

// Mock the hooks
vi.mock('@/hooks/useArticlesQuery', () => ({
  useRSSFeeds: vi.fn(),
  useAddRSSFeed: vi.fn(),
  useUpdateRSSFeed: vi.fn(),
  useDeleteRSSFeed: vi.fn(),
  useTags: vi.fn(),
}))

// Mock window.confirm
global.confirm = vi.fn()

describe('RSSFeedManagement', () => {
  const mockMutateAsync = vi.fn()
  const mockAddFeed = {
    mutateAsync: mockMutateAsync,
    isPending: false,
  }
  const mockUpdateFeed = {
    mutateAsync: mockMutateAsync,
    isPending: false,
  }
  const mockDeleteFeed = {
    mutateAsync: mockMutateAsync,
    isPending: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAddRSSFeed).mockReturnValue(mockAddFeed as any)
    vi.mocked(useUpdateRSSFeed).mockReturnValue(mockUpdateFeed as any)
    vi.mocked(useDeleteRSSFeed).mockReturnValue(mockDeleteFeed as any)
  })

  describe('Rendering', () => {
    it('shows loading state when feeds are loading', () => {
      vi.mocked(useRSSFeeds).mockReturnValue({
        data: undefined,
        isLoading: true,
      } as any)
      vi.mocked(useTags).mockReturnValue({
        data: mockTags,
        isLoading: false,
      } as any)

      render(<RSSFeedManagement />)
      expect(screen.getByText('Loading RSS feeds...')).toBeInTheDocument()
    })

    it('shows loading state when tags are loading', () => {
      vi.mocked(useRSSFeeds).mockReturnValue({
        data: mockRSSFeeds,
        isLoading: false,
      } as any)
      vi.mocked(useTags).mockReturnValue({
        data: undefined,
        isLoading: true,
      } as any)

      render(<RSSFeedManagement />)
      expect(screen.getByText('Loading RSS feeds...')).toBeInTheDocument()
    })

    it('renders RSS feed management header', () => {
      vi.mocked(useRSSFeeds).mockReturnValue({
        data: mockRSSFeeds,
        isLoading: false,
      } as any)
      vi.mocked(useTags).mockReturnValue({
        data: mockTags,
        isLoading: false,
      } as any)

      render(<RSSFeedManagement />)
      expect(screen.getByText('RSS Feed Management')).toBeInTheDocument()
    })

    it('shows "Add RSS Feed" button initially', () => {
      vi.mocked(useRSSFeeds).mockReturnValue({
        data: mockRSSFeeds,
        isLoading: false,
      } as any)
      vi.mocked(useTags).mockReturnValue({
        data: mockTags,
        isLoading: false,
      } as any)

      render(<RSSFeedManagement />)
      expect(screen.getByText('Add RSS Feed')).toBeInTheDocument()
    })

    it('displays empty state when no feeds exist', () => {
      vi.mocked(useRSSFeeds).mockReturnValue({
        data: [],
        isLoading: false,
      } as any)
      vi.mocked(useTags).mockReturnValue({
        data: mockTags,
        isLoading: false,
      } as any)

      render(<RSSFeedManagement />)
      expect(screen.getByText(/No RSS feeds configured/i)).toBeInTheDocument()
    })

    it('displays list of feeds', () => {
      vi.mocked(useRSSFeeds).mockReturnValue({
        data: mockRSSFeeds,
        isLoading: false,
      } as any)
      vi.mocked(useTags).mockReturnValue({
        data: mockTags,
        isLoading: false,
      } as any)

      render(<RSSFeedManagement />)
      expect(screen.getByText('TechCrunch')).toBeInTheDocument()
      expect(screen.getByText('Ars Technica')).toBeInTheDocument()
      expect(screen.getByText('Science Daily')).toBeInTheDocument()
    })

    it('displays feed descriptions and URLs', () => {
      vi.mocked(useRSSFeeds).mockReturnValue({
        data: mockRSSFeeds,
        isLoading: false,
      } as any)
      vi.mocked(useTags).mockReturnValue({
        data: mockTags,
        isLoading: false,
      } as any)

      render(<RSSFeedManagement />)
      expect(screen.getByText('Technology and startup news')).toBeInTheDocument()
      expect(screen.getByText('https://techcrunch.com/feed/')).toBeInTheDocument()
    })

    it('displays feed tags', () => {
      vi.mocked(useRSSFeeds).mockReturnValue({
        data: mockRSSFeeds,
        isLoading: false,
      } as any)
      vi.mocked(useTags).mockReturnValue({
        data: mockTags,
        isLoading: false,
      } as any)

      render(<RSSFeedManagement />)

      // Count "Technology" tag occurrences (appears in 2 feeds)
      const techTags = screen.getAllByText('Technology')
      expect(techTags.length).toBeGreaterThanOrEqual(2)
    })

    it('displays active/inactive status', () => {
      vi.mocked(useRSSFeeds).mockReturnValue({
        data: mockRSSFeeds,
        isLoading: false,
      } as any)
      vi.mocked(useTags).mockReturnValue({
        data: mockTags,
        isLoading: false,
      } as any)

      render(<RSSFeedManagement />)

      // All mock feeds are active
      const activeButtons = screen.getAllByText('Active')
      expect(activeButtons.length).toBe(mockRSSFeeds.length)
    })
  })

  describe('Create Form', () => {
    beforeEach(() => {
      vi.mocked(useRSSFeeds).mockReturnValue({
        data: mockRSSFeeds,
        isLoading: false,
      } as any)
      vi.mocked(useTags).mockReturnValue({
        data: mockTags,
        isLoading: false,
      } as any)
    })

    it('shows create form when "Add RSS Feed" button is clicked', () => {
      render(<RSSFeedManagement />)

      const addButton = screen.getByText('Add RSS Feed')
      fireEvent.click(addButton)

      expect(screen.getByLabelText(/Feed Name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Feed URL/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Description/i)).toBeInTheDocument()
    })

    it('shows tag selection in form', () => {
      render(<RSSFeedManagement />)

      fireEvent.click(screen.getByText('Add RSS Feed'))

      expect(screen.getByText('Tags')).toBeInTheDocument()
      // Tags should be buttons for selection
      const tagButtons = screen.getAllByRole('button').filter(btn =>
        ['Technology', 'Science', 'Business'].includes(btn.textContent || '')
      )
      expect(tagButtons.length).toBe(3)
    })

    it('shows message when no tags available', () => {
      vi.mocked(useTags).mockReturnValue({
        data: [],
        isLoading: false,
      } as any)

      render(<RSSFeedManagement />)
      fireEvent.click(screen.getByText('Add RSS Feed'))

      expect(screen.getByText(/No tags available/i)).toBeInTheDocument()
    })

    it('updates form when inputs change', () => {
      render(<RSSFeedManagement />)

      fireEvent.click(screen.getByText('Add RSS Feed'))

      const nameInput = screen.getByLabelText(/Feed Name/i) as HTMLInputElement
      const urlInput = screen.getByLabelText(/Feed URL/i) as HTMLInputElement
      const descInput = screen.getByLabelText(/Description/i) as HTMLInputElement

      fireEvent.change(nameInput, { target: { value: 'BBC News' } })
      fireEvent.change(urlInput, { target: { value: 'https://bbc.com/rss' } })
      fireEvent.change(descInput, { target: { value: 'British news' } })

      expect(nameInput.value).toBe('BBC News')
      expect(urlInput.value).toBe('https://bbc.com/rss')
      expect(descInput.value).toBe('British news')
    })

    it('toggles tag selection', () => {
      render(<RSSFeedManagement />)

      fireEvent.click(screen.getByText('Add RSS Feed'))

      // Find Technology tag button (should be in form)
      const tagButtons = screen.getAllByRole('button').filter(btn =>
        btn.textContent === 'Technology'
      )
      // Click the tag button in the form
      const techTagButton = tagButtons.find(btn =>
        btn.className.includes('rounded-full')
      )

      expect(techTagButton).toBeDefined()
      if (techTagButton) {
        fireEvent.click(techTagButton)

        // Tag should now be selected (have white text color)
        expect(techTagButton).toHaveClass('text-white')

        // Click again to deselect
        fireEvent.click(techTagButton)
        expect(techTagButton).toHaveClass('text-gray-700')
      }
    })

    it('calls addFeed mutation on form submit', async () => {
      render(<RSSFeedManagement />)

      fireEvent.click(screen.getByText('Add RSS Feed'))

      const nameInput = screen.getByLabelText(/Feed Name/i)
      const urlInput = screen.getByLabelText(/Feed URL/i)
      const descInput = screen.getByLabelText(/Description/i)

      fireEvent.change(nameInput, { target: { value: 'BBC News' } })
      fireEvent.change(urlInput, { target: { value: 'https://bbc.com/rss' } })
      fireEvent.change(descInput, { target: { value: 'British news' } })

      const submitButton = screen.getByRole('button', { name: /Add Feed/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith({
          name: 'BBC News',
          url: 'https://bbc.com/rss',
          description: 'British news',
          tag_ids: [],
        })
      })
    })

    it('includes selected tags in addFeed mutation', async () => {
      render(<RSSFeedManagement />)

      fireEvent.click(screen.getByText('Add RSS Feed'))

      const nameInput = screen.getByLabelText(/Feed Name/i)
      const urlInput = screen.getByLabelText(/Feed URL/i)

      fireEvent.change(nameInput, { target: { value: 'Test Feed' } })
      fireEvent.change(urlInput, { target: { value: 'https://test.com/rss' } })

      // Select Technology tag
      const tagButtons = screen.getAllByRole('button').filter(btn =>
        btn.textContent === 'Technology' && btn.className.includes('rounded-full')
      )
      fireEvent.click(tagButtons[0])

      const submitButton = screen.getByRole('button', { name: /Add Feed/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            tag_ids: [1], // Technology tag id
          })
        )
      })
    })

    it('closes form and resets after successful create', async () => {
      mockMutateAsync.mockResolvedValueOnce({})

      render(<RSSFeedManagement />)

      fireEvent.click(screen.getByText('Add RSS Feed'))

      const nameInput = screen.getByLabelText(/Feed Name/i)
      const urlInput = screen.getByLabelText(/Feed URL/i)

      fireEvent.change(nameInput, { target: { value: 'Test' } })
      fireEvent.change(urlInput, { target: { value: 'https://test.com/rss' } })

      const submitButton = screen.getByRole('button', { name: /Add Feed/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.queryByLabelText(/Feed Name/i)).not.toBeInTheDocument()
      })
    })

    it('closes form when Cancel is clicked', () => {
      render(<RSSFeedManagement />)

      fireEvent.click(screen.getByText('Add RSS Feed'))
      expect(screen.getByLabelText(/Feed Name/i)).toBeInTheDocument()

      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
      expect(screen.queryByLabelText(/Feed Name/i)).not.toBeInTheDocument()
    })

    it('disables submit button during pending create', () => {
      vi.mocked(useAddRSSFeed).mockReturnValue({
        ...mockAddFeed,
        isPending: true,
      } as any)

      render(<RSSFeedManagement />)

      fireEvent.click(screen.getByText('Add RSS Feed'))

      const submitButton = screen.getByRole('button', { name: /Add Feed/i })
      expect(submitButton).toBeDisabled()
    })
  })

  describe('Edit Form', () => {
    beforeEach(() => {
      vi.mocked(useRSSFeeds).mockReturnValue({
        data: mockRSSFeeds,
        isLoading: false,
      } as any)
      vi.mocked(useTags).mockReturnValue({
        data: mockTags,
        isLoading: false,
      } as any)
    })

    it('opens form with feed data when Edit is clicked', () => {
      render(<RSSFeedManagement />)

      const editButtons = screen.getAllByText('Edit')
      fireEvent.click(editButtons[0]) // Edit TechCrunch

      const nameInput = screen.getByLabelText(/Feed Name/i) as HTMLInputElement
      const descInput = screen.getByLabelText(/Description/i) as HTMLInputElement

      expect(nameInput.value).toBe('TechCrunch')
      expect(descInput.value).toBe('Technology and startup news')
    })

    it('hides URL field in edit mode', () => {
      render(<RSSFeedManagement />)

      // URL field should be present initially
      fireEvent.click(screen.getByText('Add RSS Feed'))
      expect(screen.getByLabelText(/Feed URL/i)).toBeInTheDocument()

      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

      // Edit a feed
      const editButtons = screen.getAllByText('Edit')
      fireEvent.click(editButtons[0])

      // URL field should NOT be present in edit mode
      expect(screen.queryByLabelText(/Feed URL/i)).not.toBeInTheDocument()
    })

    it('shows "Update Feed" button in edit mode', () => {
      render(<RSSFeedManagement />)

      const editButtons = screen.getAllByText('Edit')
      fireEvent.click(editButtons[0])

      expect(screen.getByRole('button', { name: 'Update Feed' })).toBeInTheDocument()
    })

    it('pre-selects feed tags in edit mode', () => {
      render(<RSSFeedManagement />)

      const editButtons = screen.getAllByText('Edit')
      fireEvent.click(editButtons[0]) // Edit TechCrunch (has Technology tag)

      // Find Technology tag button in form
      const tagButtons = screen.getAllByRole('button').filter(btn =>
        btn.textContent === 'Technology' && btn.className.includes('rounded-full')
      )

      // Technology tag should be selected (white text)
      expect(tagButtons[0]).toHaveClass('text-white')
    })

    it('calls updateFeed mutation on form submit', async () => {
      render(<RSSFeedManagement />)

      const editButtons = screen.getAllByText('Edit')
      fireEvent.click(editButtons[0]) // Edit TechCrunch (id: 1)

      const nameInput = screen.getByLabelText(/Feed Name/i)
      fireEvent.change(nameInput, { target: { value: 'TechCrunch Updated' } })

      const submitButton = screen.getByRole('button', { name: 'Update Feed' })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith({
          feedId: 1,
          feed: {
            name: 'TechCrunch Updated',
            description: 'Technology and startup news',
            tag_ids: [1], // Technology tag
          },
        })
      })
    })

    it('closes form and resets after successful update', async () => {
      mockMutateAsync.mockResolvedValueOnce({})

      render(<RSSFeedManagement />)

      const editButtons = screen.getAllByText('Edit')
      fireEvent.click(editButtons[0])

      const submitButton = screen.getByRole('button', { name: 'Update Feed' })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.queryByLabelText(/Feed Name/i)).not.toBeInTheDocument()
      })
    })

    it('disables submit button during pending update', () => {
      vi.mocked(useUpdateRSSFeed).mockReturnValue({
        ...mockUpdateFeed,
        isPending: true,
      } as any)

      render(<RSSFeedManagement />)

      const editButtons = screen.getAllByText('Edit')
      fireEvent.click(editButtons[0])

      const submitButton = screen.getByRole('button', { name: 'Update Feed' })
      expect(submitButton).toBeDisabled()
    })
  })

  describe('Delete Functionality', () => {
    beforeEach(() => {
      vi.mocked(useRSSFeeds).mockReturnValue({
        data: mockRSSFeeds,
        isLoading: false,
      } as any)
      vi.mocked(useTags).mockReturnValue({
        data: mockTags,
        isLoading: false,
      } as any)
    })

    it('shows confirmation dialog when Delete is clicked', () => {
      render(<RSSFeedManagement />)

      const deleteButtons = screen.getAllByText('Delete')
      fireEvent.click(deleteButtons[0])

      expect(global.confirm).toHaveBeenCalledWith(
        'Are you sure you want to delete this RSS feed?'
      )
    })

    it('calls deleteFeed mutation when confirmed', async () => {
      vi.mocked(global.confirm).mockReturnValue(true)

      render(<RSSFeedManagement />)

      const deleteButtons = screen.getAllByText('Delete')
      fireEvent.click(deleteButtons[0]) // Delete TechCrunch (id: 1)

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith(1)
      })
    })

    it('does not call deleteFeed when cancelled', () => {
      vi.mocked(global.confirm).mockReturnValue(false)

      render(<RSSFeedManagement />)

      const deleteButtons = screen.getAllByText('Delete')
      fireEvent.click(deleteButtons[0])

      expect(mockMutateAsync).not.toHaveBeenCalled()
    })

    it('disables delete button during pending delete', () => {
      vi.mocked(useDeleteRSSFeed).mockReturnValue({
        ...mockDeleteFeed,
        isPending: true,
      } as any)

      render(<RSSFeedManagement />)

      const deleteButtons = screen.getAllByText('Delete')
      expect(deleteButtons[0]).toBeDisabled()
    })
  })

  describe('Active/Inactive Toggle', () => {
    beforeEach(() => {
      vi.mocked(useRSSFeeds).mockReturnValue({
        data: mockRSSFeeds,
        isLoading: false,
      } as any)
      vi.mocked(useTags).mockReturnValue({
        data: mockTags,
        isLoading: false,
      } as any)
    })

    it('calls updateFeed when Active/Inactive button is clicked', async () => {
      render(<RSSFeedManagement />)

      const activeButtons = screen.getAllByText('Active')
      fireEvent.click(activeButtons[0]) // Toggle TechCrunch (id: 1, currently active)

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith({
          feedId: 1,
          feed: {
            is_active: false, // Should toggle from true to false
          },
        })
      })
    })
  })
})
