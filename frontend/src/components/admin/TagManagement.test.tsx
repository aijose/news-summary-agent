import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test/test-utils'
import { TagManagement } from './TagManagement'
import { useTags, useCreateTag, useUpdateTag, useDeleteTag } from '@/hooks/useArticlesQuery'
import { mockTags } from '@/test/mockData'

// Mock the hooks
vi.mock('@/hooks/useArticlesQuery', () => ({
  useTags: vi.fn(),
  useCreateTag: vi.fn(),
  useUpdateTag: vi.fn(),
  useDeleteTag: vi.fn(),
}))

// Mock window.confirm
global.confirm = vi.fn()

describe('TagManagement', () => {
  const mockMutateAsync = vi.fn()
  const mockCreateTag = {
    mutateAsync: mockMutateAsync,
    isPending: false,
  }
  const mockUpdateTag = {
    mutateAsync: mockMutateAsync,
    isPending: false,
  }
  const mockDeleteTag = {
    mutateAsync: mockMutateAsync,
    isPending: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useCreateTag).mockReturnValue(mockCreateTag as any)
    vi.mocked(useUpdateTag).mockReturnValue(mockUpdateTag as any)
    vi.mocked(useDeleteTag).mockReturnValue(mockDeleteTag as any)
  })

  describe('Rendering', () => {
    it('shows loading state', () => {
      vi.mocked(useTags).mockReturnValue({
        data: undefined,
        isLoading: true,
      } as any)

      render(<TagManagement />)
      expect(screen.getByText('Loading tags...')).toBeInTheDocument()
    })

    it('renders tag management header', () => {
      vi.mocked(useTags).mockReturnValue({
        data: mockTags,
        isLoading: false,
      } as any)

      render(<TagManagement />)
      expect(screen.getByText('Tag Management')).toBeInTheDocument()
    })

    it('shows "Create Tag" button initially', () => {
      vi.mocked(useTags).mockReturnValue({
        data: mockTags,
        isLoading: false,
      } as any)

      render(<TagManagement />)
      expect(screen.getByText('Create Tag')).toBeInTheDocument()
    })

    it('displays empty state when no tags exist', () => {
      vi.mocked(useTags).mockReturnValue({
        data: [],
        isLoading: false,
      } as any)

      render(<TagManagement />)
      expect(screen.getByText(/No tags yet/i)).toBeInTheDocument()
    })

    it('displays list of tags', () => {
      vi.mocked(useTags).mockReturnValue({
        data: mockTags,
        isLoading: false,
      } as any)

      render(<TagManagement />)
      expect(screen.getByText('Technology')).toBeInTheDocument()
      expect(screen.getByText('Science')).toBeInTheDocument()
      expect(screen.getByText('Business')).toBeInTheDocument()
    })

    it('displays tag descriptions', () => {
      vi.mocked(useTags).mockReturnValue({
        data: mockTags,
        isLoading: false,
      } as any)

      render(<TagManagement />)
      expect(screen.getByText('Tech news and updates')).toBeInTheDocument()
      expect(screen.getByText('Scientific discoveries and research')).toBeInTheDocument()
    })
  })

  describe('Create Form', () => {
    beforeEach(() => {
      vi.mocked(useTags).mockReturnValue({
        data: mockTags,
        isLoading: false,
      } as any)
    })

    it('shows create form when "Create Tag" button is clicked', () => {
      render(<TagManagement />)

      const createButton = screen.getByText('Create Tag')
      fireEvent.click(createButton)

      expect(screen.getByLabelText(/Tag Name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Description/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Color/i)).toBeInTheDocument()
    })

    it('hides top "Create Tag" button when form is open', () => {
      render(<TagManagement />)

      const createButton = screen.getByText('Create Tag')
      fireEvent.click(createButton)

      // The top "Create Tag" button should be hidden, but the submit button with the same text exists
      // We verify by checking that the form is visible
      expect(screen.getByLabelText(/Tag Name/i)).toBeInTheDocument()

      // Count buttons with "Create Tag" text - should be only 1 (the submit button)
      const createButtons = screen.getAllByText('Create Tag')
      expect(createButtons.length).toBe(1)
      expect(createButtons[0]).toHaveAttribute('type', 'submit')
    })

    it('shows Cancel button when form is open', () => {
      render(<TagManagement />)

      fireEvent.click(screen.getByText('Create Tag'))

      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    })

    it('has default color value in form', () => {
      render(<TagManagement />)

      fireEvent.click(screen.getByText('Create Tag'))

      const colorInput = screen.getByDisplayValue('#3B82F6')
      expect(colorInput).toBeInTheDocument()
    })

    it('updates form when inputs change', () => {
      render(<TagManagement />)

      fireEvent.click(screen.getByText('Create Tag'))

      const nameInput = screen.getByLabelText(/Tag Name/i) as HTMLInputElement
      const descriptionInput = screen.getByLabelText(/Description/i) as HTMLInputElement

      fireEvent.change(nameInput, { target: { value: 'Health' } })
      fireEvent.change(descriptionInput, { target: { value: 'Health news' } })

      expect(nameInput.value).toBe('Health')
      expect(descriptionInput.value).toBe('Health news')
    })

    it('calls createTag mutation on form submit', async () => {
      render(<TagManagement />)

      fireEvent.click(screen.getByText('Create Tag'))

      const nameInput = screen.getByLabelText(/Tag Name/i)
      const descriptionInput = screen.getByLabelText(/Description/i)

      fireEvent.change(nameInput, { target: { value: 'Health' } })
      fireEvent.change(descriptionInput, { target: { value: 'Health news' } })

      const submitButton = screen.getByRole('button', { name: /Create Tag/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith({
          name: 'Health',
          description: 'Health news',
          color: '#3B82F6',
        })
      })
    })

    it('closes form and resets after successful create', async () => {
      mockMutateAsync.mockResolvedValueOnce({})

      render(<TagManagement />)

      fireEvent.click(screen.getByText('Create Tag'))

      const nameInput = screen.getByLabelText(/Tag Name/i)
      fireEvent.change(nameInput, { target: { value: 'Health' } })

      const submitButton = screen.getByRole('button', { name: /Create Tag/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.queryByLabelText(/Tag Name/i)).not.toBeInTheDocument()
      })
    })

    it('closes form when Cancel is clicked', () => {
      render(<TagManagement />)

      fireEvent.click(screen.getByText('Create Tag'))
      expect(screen.getByLabelText(/Tag Name/i)).toBeInTheDocument()

      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
      expect(screen.queryByLabelText(/Tag Name/i)).not.toBeInTheDocument()
    })

    it('disables submit button during pending create', () => {
      vi.mocked(useCreateTag).mockReturnValue({
        ...mockCreateTag,
        isPending: true,
      } as any)

      render(<TagManagement />)

      fireEvent.click(screen.getByText('Create Tag'))

      const submitButton = screen.getByRole('button', { name: /Create Tag/i })
      expect(submitButton).toBeDisabled()
    })
  })

  describe('Edit Form', () => {
    beforeEach(() => {
      vi.mocked(useTags).mockReturnValue({
        data: mockTags,
        isLoading: false,
      } as any)
    })

    it('opens form with tag data when Edit is clicked', () => {
      render(<TagManagement />)

      const editButtons = screen.getAllByText('Edit')
      fireEvent.click(editButtons[0]) // Edit Technology tag

      const nameInput = screen.getByLabelText(/Tag Name/i) as HTMLInputElement
      const descriptionInput = screen.getByLabelText(/Description/i) as HTMLInputElement

      expect(nameInput.value).toBe('Technology')
      expect(descriptionInput.value).toBe('Tech news and updates')
    })

    it('shows "Update Tag" button in edit mode', () => {
      render(<TagManagement />)

      const editButtons = screen.getAllByText('Edit')
      fireEvent.click(editButtons[0])

      expect(screen.getByRole('button', { name: 'Update Tag' })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /^Create Tag$/i })).not.toBeInTheDocument()
    })

    it('calls updateTag mutation on form submit', async () => {
      render(<TagManagement />)

      const editButtons = screen.getAllByText('Edit')
      fireEvent.click(editButtons[0]) // Edit Technology tag (id: 1)

      const nameInput = screen.getByLabelText(/Tag Name/i)
      fireEvent.change(nameInput, { target: { value: 'Technology Updated' } })

      const submitButton = screen.getByRole('button', { name: 'Update Tag' })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith({
          tagId: 1,
          tag: {
            name: 'Technology Updated',
            description: 'Tech news and updates',
            color: '#3B82F6',
          },
        })
      })
    })

    it('closes form and resets after successful update', async () => {
      mockMutateAsync.mockResolvedValueOnce({})

      render(<TagManagement />)

      const editButtons = screen.getAllByText('Edit')
      fireEvent.click(editButtons[0])

      const submitButton = screen.getByRole('button', { name: 'Update Tag' })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.queryByLabelText(/Tag Name/i)).not.toBeInTheDocument()
      })
    })

    it('disables submit button during pending update', () => {
      vi.mocked(useUpdateTag).mockReturnValue({
        ...mockUpdateTag,
        isPending: true,
      } as any)

      render(<TagManagement />)

      const editButtons = screen.getAllByText('Edit')
      fireEvent.click(editButtons[0])

      const submitButton = screen.getByRole('button', { name: 'Update Tag' })
      expect(submitButton).toBeDisabled()
    })

    it('resets to create mode when Cancel is clicked in edit mode', () => {
      render(<TagManagement />)

      const editButtons = screen.getAllByText('Edit')
      fireEvent.click(editButtons[0])

      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

      expect(screen.queryByLabelText(/Tag Name/i)).not.toBeInTheDocument()

      // Click Create Tag again and verify it's in create mode
      fireEvent.click(screen.getByText('Create Tag'))
      expect(screen.getByRole('button', { name: /^Create Tag$/i })).toBeInTheDocument()
    })
  })

  describe('Delete Functionality', () => {
    beforeEach(() => {
      vi.mocked(useTags).mockReturnValue({
        data: mockTags,
        isLoading: false,
      } as any)
    })

    it('shows confirmation dialog when Delete is clicked', () => {
      render(<TagManagement />)

      const deleteButtons = screen.getAllByText('Delete')
      fireEvent.click(deleteButtons[0])

      expect(global.confirm).toHaveBeenCalledWith(
        'Are you sure you want to delete this tag? It will be removed from all RSS feeds.'
      )
    })

    it('calls deleteTag mutation when confirmed', async () => {
      vi.mocked(global.confirm).mockReturnValue(true)

      render(<TagManagement />)

      const deleteButtons = screen.getAllByText('Delete')
      fireEvent.click(deleteButtons[0]) // Delete Technology tag (id: 1)

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith(1)
      })
    })

    it('does not call deleteTag when cancelled', () => {
      vi.mocked(global.confirm).mockReturnValue(false)

      render(<TagManagement />)

      const deleteButtons = screen.getAllByText('Delete')
      fireEvent.click(deleteButtons[0])

      expect(mockMutateAsync).not.toHaveBeenCalled()
    })

    it('disables delete button during pending delete', () => {
      vi.mocked(useDeleteTag).mockReturnValue({
        ...mockDeleteTag,
        isPending: true,
      } as any)

      render(<TagManagement />)

      const deleteButtons = screen.getAllByText('Delete')
      expect(deleteButtons[0]).toBeDisabled()
    })
  })

  describe('Tag Display', () => {
    beforeEach(() => {
      vi.mocked(useTags).mockReturnValue({
        data: mockTags,
        isLoading: false,
      } as any)
    })

    it('displays tag colors', () => {
      render(<TagManagement />)

      const colorIndicators = document.querySelectorAll('.w-4.h-4.rounded-full')
      expect(colorIndicators.length).toBe(mockTags.length)

      // Check first tag color (Technology - #3B82F6)
      expect(colorIndicators[0]).toHaveStyle({ backgroundColor: '#3B82F6' })
    })

    it('shows Edit and Delete buttons for each tag', () => {
      render(<TagManagement />)

      const editButtons = screen.getAllByText('Edit')
      const deleteButtons = screen.getAllByText('Delete')

      expect(editButtons.length).toBe(mockTags.length)
      expect(deleteButtons.length).toBe(mockTags.length)
    })
  })
})
