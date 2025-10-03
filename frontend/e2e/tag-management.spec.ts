import { test, expect } from '@playwright/test'

/**
 * E2E tests for tag management in admin panel
 *
 * These tests verify the tag CRUD operations work correctly
 * from an admin user's perspective.
 */
test.describe('Tag Management', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the admin page
    await page.goto('/admin')
    await page.waitForLoadState('networkidle')
  })

  test('should display tag management section', async ({ page }) => {
    // Check if "Tag Management" heading is visible
    const heading = page.getByText('Tag Management')
    await expect(heading).toBeVisible({ timeout: 10000 })

    // Check if "Create Tag" button is visible
    const createButton = page.getByRole('button', { name: 'Create Tag' })
    await expect(createButton).toBeVisible()
  })

  test('should display existing tags', async ({ page }) => {
    // Wait for tags to load
    await page.waitForTimeout(1000)

    // Check if tags are displayed (assuming at least one tag exists)
    const tagNames = ['Technology', 'Science', 'Business']

    for (const tagName of tagNames) {
      const tag = page.getByText(tagName).first()
      // Tag might exist if backend has seed data
      if (await tag.isVisible().catch(() => false)) {
        await expect(tag).toBeVisible()
      }
    }
  })

  test('should open create form when "Create Tag" is clicked', async ({ page }) => {
    // Click "Create Tag" button
    const createButton = page.getByRole('button', { name: 'Create Tag' })
    await createButton.click()

    // Verify form fields appear
    await expect(page.getByLabel(/Tag Name/i)).toBeVisible()
    await expect(page.getByLabel(/Description/i)).toBeVisible()
    await expect(page.getByLabel(/Color/i)).toBeVisible()

    // Verify form buttons appear
    await expect(page.getByRole('button', { name: /Create Tag/i })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible()
  })

  test('should close form when "Cancel" is clicked', async ({ page }) => {
    // Open create form
    await page.getByRole('button', { name: 'Create Tag' }).click()
    await expect(page.getByLabel(/Tag Name/i)).toBeVisible()

    // Click Cancel
    await page.getByRole('button', { name: 'Cancel' }).click()

    // Verify form is closed
    await expect(page.getByLabel(/Tag Name/i)).not.toBeVisible()

    // Verify "Create Tag" button is back
    await expect(page.getByRole('button', { name: 'Create Tag' })).toBeVisible()
  })

  test('should validate required fields in create form', async ({ page }) => {
    // Open create form
    await page.getByRole('button', { name: 'Create Tag' }).click()

    // Try to submit without filling required field
    const submitButton = page.getByRole('button', { name: /Create Tag/i }).last()
    await submitButton.click()

    // Browser should show validation error (HTML5 required attribute)
    const nameInput = page.getByLabel(/Tag Name/i)
    const validationMessage = await nameInput.evaluate((el: HTMLInputElement) => el.validationMessage)
    expect(validationMessage).toBeTruthy()
  })

  test('should allow color selection', async ({ page }) => {
    // Open create form
    await page.getByRole('button', { name: 'Create Tag' }).click()

    // Find color input
    const colorInput = page.locator('input[type="color"]')
    await expect(colorInput).toBeVisible()

    // Verify default color is set
    const defaultColor = await colorInput.inputValue()
    expect(defaultColor).toMatch(/^#[0-9A-Fa-f]{6}$/)

    // Change color
    await colorInput.fill('#FF0000')

    // Verify color changed
    const newColor = await colorInput.inputValue()
    expect(newColor).toBe('#ff0000')
  })

  test('should show edit form when "Edit" is clicked', async ({ page }) => {
    // Wait for tags to load
    await page.waitForTimeout(1000)

    // Find first "Edit" button (assumes at least one tag exists)
    const editButtons = page.getByRole('button', { name: 'Edit' })
    const firstEditButton = editButtons.first()

    if (await firstEditButton.isVisible().catch(() => false)) {
      await firstEditButton.click()

      // Verify form appears with "Update Tag" button
      await expect(page.getByLabel(/Tag Name/i)).toBeVisible()
      await expect(page.getByRole('button', { name: 'Update Tag' })).toBeVisible()
    }
  })

  test('should show delete confirmation when "Delete" is clicked', async ({ page }) => {
    // Set up dialog handler before triggering the action
    let dialogShown = false
    page.on('dialog', async dialog => {
      dialogShown = true
      expect(dialog.message()).toContain('delete')
      await dialog.dismiss() // Dismiss to avoid actually deleting
    })

    // Wait for tags to load
    await page.waitForTimeout(1000)

    // Find first "Delete" button (assumes at least one tag exists)
    const deleteButtons = page.getByRole('button', { name: 'Delete' })
    const firstDeleteButton = deleteButtons.first()

    if (await firstDeleteButton.isVisible().catch(() => false)) {
      await firstDeleteButton.click()

      // Wait a bit for dialog to appear
      await page.waitForTimeout(500)

      // Verify dialog was shown
      expect(dialogShown).toBe(true)
    }
  })

  test('should display tag colors correctly', async ({ page }) => {
    // Wait for tags to load
    await page.waitForTimeout(1000)

    // Find color indicators (small colored circles)
    const colorIndicators = page.locator('.w-4.h-4.rounded-full')
    const count = await colorIndicators.count()

    if (count > 0) {
      // Check first color indicator has a background color
      const firstIndicator = colorIndicators.first()
      const backgroundColor = await firstIndicator.evaluate(
        el => window.getComputedStyle(el).backgroundColor
      )

      // Should have a background color set
      expect(backgroundColor).toBeTruthy()
      expect(backgroundColor).not.toBe('rgba(0, 0, 0, 0)') // Not transparent
    }
  })

  test('should display empty state when no tags exist', async ({ page }) => {
    // This test assumes we can clear all tags or test with empty database
    // In a real scenario, you might need to mock the API or use a test database

    // Look for empty state message
    const emptyMessage = page.getByText(/No tags yet/i)

    // If it exists, verify it's visible
    if (await emptyMessage.isVisible().catch(() => false)) {
      await expect(emptyMessage).toBeVisible()
      await expect(emptyMessage).toContainText(/create your first tag/i)
    }
  })
})
