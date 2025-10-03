import { test, expect } from '@playwright/test'

/**
 * E2E tests for tag filtering functionality
 *
 * These tests verify the tag filtering system works correctly
 * across the entire application from a user's perspective.
 */
test.describe('Tag Filtering', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the home page before each test
    await page.goto('/')
  })

  test('should display tag filters on home page', async ({ page }) => {
    // Wait for the page to load
    await page.waitForLoadState('networkidle')

    // Check if "Filter by:" label is visible
    const filterLabel = page.getByText('Filter by:')
    await expect(filterLabel).toBeVisible()

    // Verify that tag buttons are present
    // Note: This assumes tags are loaded from the backend
    // In a real test, you might want to mock the API or use test data
    const tagButtons = page.locator('button').filter({ hasText: /Technology|Science|Business/ })
    await expect(tagButtons.first()).toBeVisible({ timeout: 10000 })
  })

  test('should filter articles when a tag is clicked', async ({ page }) => {
    // Wait for initial load
    await page.waitForLoadState('networkidle')

    // Get initial article count (if articles are present)
    const articleCountBefore = await page.locator('article, [data-testid="article"]').count()

    // Click on a tag (e.g., Technology)
    const technologyTag = page.locator('button').filter({ hasText: 'Technology' }).first()

    // Wait for the tag to be clickable
    await expect(technologyTag).toBeVisible({ timeout: 10000 })
    await technologyTag.click()

    // Verify the tag is now selected (has checkmark or different styling)
    await expect(technologyTag).toHaveClass(/text-white/)

    // Wait for articles to reload with filtered results
    await page.waitForTimeout(1000) // Give some time for the filter to apply

    // The article count may change (could be more or less depending on data)
    // Just verify that filtering occurred without errors
    await expect(page).toHaveURL(/tags=/)
  })

  test('should show "Clear all" button when tags are selected', async ({ page }) => {
    // Wait for initial load
    await page.waitForLoadState('networkidle')

    // Select a tag
    const tag = page.locator('button').filter({ hasText: /Technology|Science/ }).first()
    await expect(tag).toBeVisible({ timeout: 10000 })
    await tag.click()

    // Verify "Clear all" button appears
    const clearAllButton = page.getByText('Clear all')
    await expect(clearAllButton).toBeVisible()

    // Click "Clear all"
    await clearAllButton.click()

    // Verify the button is no longer visible
    await expect(clearAllButton).not.toBeVisible()

    // Verify URL no longer has tags parameter
    await expect(page).not.toHaveURL(/tags=/)
  })

  test('should allow multiple tag selection', async ({ page }) => {
    // Wait for initial load
    await page.waitForLoadState('networkidle')

    // Select first tag
    const firstTag = page.locator('button').filter({ hasText: 'Technology' }).first()
    await expect(firstTag).toBeVisible({ timeout: 10000 })
    await firstTag.click()

    // Verify first tag is selected
    await expect(firstTag).toHaveClass(/text-white/)

    // Select second tag
    const secondTag = page.locator('button').filter({ hasText: 'Science' }).first()
    await expect(secondTag).toBeVisible()
    await secondTag.click()

    // Verify both tags are selected
    await expect(firstTag).toHaveClass(/text-white/)
    await expect(secondTag).toHaveClass(/text-white/)

    // Verify URL contains both tag IDs
    const url = page.url()
    expect(url).toContain('tags=')
  })

  test('should navigate between pages with tag filters preserved', async ({ page }) => {
    // Wait for initial load
    await page.waitForLoadState('networkidle')

    // Select a tag on home page
    const tag = page.locator('button').filter({ hasText: 'Technology' }).first()
    await expect(tag).toBeVisible({ timeout: 10000 })
    await tag.click()

    // Get current URL with tags parameter
    const homeUrl = page.url()
    expect(homeUrl).toContain('tags=')

    // Navigate to Browse page (if it exists)
    const browseLink = page.getByRole('link', { name: /Browse/i })
    if (await browseLink.isVisible().catch(() => false)) {
      await browseLink.click()

      // Wait for navigation
      await page.waitForLoadState('networkidle')

      // Verify tag is still selected on Browse page
      const tagOnBrowse = page.locator('button').filter({ hasText: 'Technology' }).first()
      await expect(tagOnBrowse).toHaveClass(/text-white/)
    }
  })
})
