import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test/test-utils'
import { TagFilter } from './TagFilter'
import { useTags } from '@/hooks/useArticlesQuery'
import { mockTags } from '@/test/mockData'

// Mock the hooks
vi.mock('@/hooks/useArticlesQuery', () => ({
  useTags: vi.fn(),
}))

describe('TagFilter', () => {
  const mockOnTagToggle = vi.fn()
  const mockOnClearAll = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders tags successfully', () => {
    vi.mocked(useTags).mockReturnValue({
      data: mockTags,
      isLoading: false,
    } as any)

    render(
      <TagFilter
        selectedTagIds={[]}
        onTagToggle={mockOnTagToggle}
        onClearAll={mockOnClearAll}
      />
    )

    expect(screen.getByText('Filter by:')).toBeInTheDocument()
    expect(screen.getByText('Technology')).toBeInTheDocument()
    expect(screen.getByText('Science')).toBeInTheDocument()
    expect(screen.getByText('Business')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    vi.mocked(useTags).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as any)

    render(
      <TagFilter
        selectedTagIds={[]}
        onTagToggle={mockOnTagToggle}
        onClearAll={mockOnClearAll}
      />
    )

    // Should show skeleton loaders
    const skeletons = document.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('returns null when no tags available', () => {
    vi.mocked(useTags).mockReturnValue({
      data: [],
      isLoading: false,
    } as any)

    const { container } = render(
      <TagFilter
        selectedTagIds={[]}
        onTagToggle={mockOnTagToggle}
        onClearAll={mockOnClearAll}
      />
    )

    expect(container.firstChild).toBeNull()
  })

  it('calls onTagToggle when tag is clicked', () => {
    vi.mocked(useTags).mockReturnValue({
      data: mockTags,
      isLoading: false,
    } as any)

    render(
      <TagFilter
        selectedTagIds={[]}
        onTagToggle={mockOnTagToggle}
        onClearAll={mockOnClearAll}
      />
    )

    const technologyTag = screen.getByText('Technology')
    fireEvent.click(technologyTag)

    expect(mockOnTagToggle).toHaveBeenCalledWith(1)
  })

  it('displays selected state correctly', () => {
    vi.mocked(useTags).mockReturnValue({
      data: mockTags,
      isLoading: false,
    } as any)

    render(
      <TagFilter
        selectedTagIds={[1]}
        onTagToggle={mockOnTagToggle}
        onClearAll={mockOnClearAll}
      />
    )

    const technologyTag = screen.getByText('Technology')
    // Check for checkmark indicating selection
    expect(technologyTag.textContent).toContain('✓')
  })

  it('applies correct styling to selected tags', () => {
    vi.mocked(useTags).mockReturnValue({
      data: mockTags,
      isLoading: false,
    } as any)

    render(
      <TagFilter
        selectedTagIds={[1]}
        onTagToggle={mockOnTagToggle}
        onClearAll={mockOnClearAll}
      />
    )

    const technologyButton = screen.getByText('Technology').closest('button')
    expect(technologyButton).toHaveClass('text-white')
    expect(technologyButton).toHaveStyle({ backgroundColor: mockTags[0].color })
  })

  it('shows "Clear all" button when tags are selected', () => {
    vi.mocked(useTags).mockReturnValue({
      data: mockTags,
      isLoading: false,
    } as any)

    render(
      <TagFilter
        selectedTagIds={[1, 2]}
        onTagToggle={mockOnTagToggle}
        onClearAll={mockOnClearAll}
      />
    )

    expect(screen.getByText('Clear all')).toBeInTheDocument()
  })

  it('hides "Clear all" button when no tags are selected', () => {
    vi.mocked(useTags).mockReturnValue({
      data: mockTags,
      isLoading: false,
    } as any)

    render(
      <TagFilter
        selectedTagIds={[]}
        onTagToggle={mockOnTagToggle}
        onClearAll={mockOnClearAll}
      />
    )

    expect(screen.queryByText('Clear all')).not.toBeInTheDocument()
  })

  it('calls onClearAll when "Clear all" is clicked', () => {
    vi.mocked(useTags).mockReturnValue({
      data: mockTags,
      isLoading: false,
    } as any)

    render(
      <TagFilter
        selectedTagIds={[1, 2]}
        onTagToggle={mockOnTagToggle}
        onClearAll={mockOnClearAll}
      />
    )

    const clearButton = screen.getByText('Clear all')
    fireEvent.click(clearButton)

    expect(mockOnClearAll).toHaveBeenCalledTimes(1)
  })

  it('handles multiple tag selections', () => {
    vi.mocked(useTags).mockReturnValue({
      data: mockTags,
      isLoading: false,
    } as any)

    const { rerender } = render(
      <TagFilter
        selectedTagIds={[]}
        onTagToggle={mockOnTagToggle}
        onClearAll={mockOnClearAll}
      />
    )

    // Select Technology
    fireEvent.click(screen.getByText('Technology'))
    expect(mockOnTagToggle).toHaveBeenCalledWith(1)

    // Re-render with Technology selected
    rerender(
      <TagFilter
        selectedTagIds={[1]}
        onTagToggle={mockOnTagToggle}
        onClearAll={mockOnClearAll}
      />
    )

    // Select Science
    fireEvent.click(screen.getByText('Science'))
    expect(mockOnTagToggle).toHaveBeenCalledWith(2)
  })

  it('displays tag descriptions as tooltips', () => {
    vi.mocked(useTags).mockReturnValue({
      data: mockTags,
      isLoading: false,
    } as any)

    render(
      <TagFilter
        selectedTagIds={[]}
        onTagToggle={mockOnTagToggle}
        onClearAll={mockOnClearAll}
      />
    )

    const technologyButton = screen.getByText('Technology').closest('button')
    expect(technologyButton).toHaveAttribute('title', 'Tech news and updates')
  })
})
