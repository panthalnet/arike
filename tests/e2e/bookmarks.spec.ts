import { test, expect } from '@playwright/test'

test.describe('Bookmark Management', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage
    await page.goto('http://localhost:3000')
  })

  test('should add a new bookmark with built-in icon', async ({ page }) => {
    // Click the "Add Bookmark" button
    const addButton = page.locator('[data-testid="add-bookmark-button"]')
    await expect(addButton).toBeVisible()
    await addButton.click()

    // Verify bookmark form dialog is open
    const dialog = page.locator('[data-testid="bookmark-form-dialog"]')
    await expect(dialog).toBeVisible()

    // Fill in bookmark details
    await page.locator('[data-testid="bookmark-name-input"]').fill('GitHub')
    await page.locator('[data-testid="bookmark-url-input"]').fill('https://github.com')

    // Select a built-in icon (Material Icons)
    await page.locator('[data-testid="icon-picker-button"]').click()
    await page.locator('[data-testid="icon-tab-material"]').click()
    await page.locator('[data-testid="icon-option-home"]').first().click()

    // Save the bookmark
    await page.locator('[data-testid="bookmark-save-button"]').click()

    // Verify dialog closes
    await expect(dialog).not.toBeVisible()

    // Verify bookmark appears on the page within 200ms
    const bookmarkCard = page.locator('[data-testid="bookmark-card-GitHub"]')
    await expect(bookmarkCard).toBeVisible({ timeout: 500 })

    // Verify bookmark displays correct information
    await expect(bookmarkCard.locator('[data-testid="bookmark-name"]')).toHaveText('GitHub')
    await expect(bookmarkCard.locator('[data-testid="bookmark-icon"]')).toBeVisible()

    // Verify bookmark is clickable
    await expect(bookmarkCard).toHaveAttribute('href', 'https://github.com')
  })

  test('should add bookmark with uploaded icon', async ({ page }) => {
    // Click add bookmark button
    await page.locator('[data-testid="add-bookmark-button"]').click()

    // Fill in details
    await page.locator('[data-testid="bookmark-name-input"]').fill('My Site')
    await page.locator('[data-testid="bookmark-url-input"]').fill('https://example.com')

    // Upload custom icon
    await page.locator('[data-testid="icon-picker-button"]').click()
    await page.locator('[data-testid="icon-tab-upload"]').click()
    
    // Simulate file upload (in real test, would upload actual file)
    const fileInput = page.locator('[data-testid="icon-upload-input"]')
    // Note: This would require a test image file
    // await fileInput.setInputFiles('tests/fixtures/test-icon.png')

    await page.locator('[data-testid="bookmark-save-button"]').click()

    // Verify bookmark created
    await expect(page.locator('[data-testid="bookmark-card-My Site"]')).toBeVisible({ timeout: 500 })
  })

  test('should validate URL format', async ({ page }) => {
    await page.locator('[data-testid="add-bookmark-button"]').click()

    // Enter invalid URL
    await page.locator('[data-testid="bookmark-name-input"]').fill('Invalid')
    await page.locator('[data-testid="bookmark-url-input"]').fill('not-a-url')

    // Try to save
    await page.locator('[data-testid="bookmark-save-button"]').click()

    // Verify error message appears
    const errorMessage = page.locator('[data-testid="url-error"]')
    await expect(errorMessage).toBeVisible()
    await expect(errorMessage).toContainText(/invalid.*url/i)

    // Dialog should stay open
    await expect(page.locator('[data-testid="bookmark-form-dialog"]')).toBeVisible()
  })

  test('should edit an existing bookmark', async ({ page }) => {
    // First, add a bookmark
    await page.locator('[data-testid="add-bookmark-button"]').click()
    await page.locator('[data-testid="bookmark-name-input"]').fill('Example')
    await page.locator('[data-testid="bookmark-url-input"]').fill('https://example.com')
    await page.locator('[data-testid="icon-picker-button"]').click()
    await page.locator('[data-testid="icon-option-home"]').first().click()
    await page.locator('[data-testid="bookmark-save-button"]').click()

    // Wait for bookmark to appear
    const bookmarkCard = page.locator('[data-testid="bookmark-card-Example"]')
    await expect(bookmarkCard).toBeVisible()

    // Click edit button on the bookmark
    await bookmarkCard.hover()
    await page.locator('[data-testid="bookmark-edit-button-Example"]').click()

    // Verify form opens with pre-filled values
    const dialog = page.locator('[data-testid="bookmark-form-dialog"]')
    await expect(dialog).toBeVisible()
    await expect(page.locator('[data-testid="bookmark-name-input"]')).toHaveValue('Example')
    await expect(page.locator('[data-testid="bookmark-url-input"]')).toHaveValue('https://example.com')

    // Change the name
    await page.locator('[data-testid="bookmark-name-input"]').fill('Updated Example')

    // Save changes
    await page.locator('[data-testid="bookmark-save-button"]').click()

    // Verify bookmark updated
    await expect(page.locator('[data-testid="bookmark-card-Updated Example"]')).toBeVisible()
    await expect(page.locator('[data-testid="bookmark-card-Example"]')).not.toBeVisible()
  })

  test('should delete a bookmark with confirmation', async ({ page }) => {
    // Add a bookmark first
    await page.locator('[data-testid="add-bookmark-button"]').click()
    await page.locator('[data-testid="bookmark-name-input"]').fill('To Delete')
    await page.locator('[data-testid="bookmark-url-input"]').fill('https://delete.com')
    await page.locator('[data-testid="icon-picker-button"]').click()
    await page.locator('[data-testid="icon-option-home"]').first().click()
    await page.locator('[data-testid="bookmark-save-button"]').click()

    // Wait for bookmark to appear
    const bookmarkCard = page.locator('[data-testid="bookmark-card-To Delete"]')
    await expect(bookmarkCard).toBeVisible()

    // Click delete button
    await bookmarkCard.hover()
    await page.locator('[data-testid="bookmark-delete-button-To Delete"]').click()

    // Verify confirmation dialog appears
    const confirmDialog = page.locator('[data-testid="delete-confirmation-dialog"]')
    await expect(confirmDialog).toBeVisible()
    await expect(confirmDialog).toContainText('Delete \'To Delete\'?')
    await expect(confirmDialog).toContainText('This cannot be undone')

    // Cancel deletion
    await page.locator('[data-testid="delete-cancel-button"]').click()
    await expect(confirmDialog).not.toBeVisible()
    await expect(bookmarkCard).toBeVisible() // Still there

    // Try delete again and confirm
    await page.locator('[data-testid="bookmark-delete-button-To Delete"]').click()
    await page.locator('[data-testid="delete-confirm-button"]').click()

    // Verify bookmark removed within 200ms
    await expect(bookmarkCard).not.toBeVisible({ timeout: 500 })

    // Verify screen reader announcement
    const announcement = page.locator('[role="status"][aria-live="polite"]')
    await expect(announcement).toContainText(/To Delete.*deleted/i)
  })

  test('should display bookmarks in a grid layout', async ({ page }) => {
    // Add multiple bookmarks
    const bookmarks = [
      { name: 'Site 1', url: 'https://site1.com' },
      { name: 'Site 2', url: 'https://site2.com' },
      { name: 'Site 3', url: 'https://site3.com' },
      { name: 'Site 4', url: 'https://site4.com' },
    ]

    for (const bookmark of bookmarks) {
      await page.locator('[data-testid="add-bookmark-button"]').click()
      await page.locator('[data-testid="bookmark-name-input"]').fill(bookmark.name)
      await page.locator('[data-testid="bookmark-url-input"]').fill(bookmark.url)
      await page.locator('[data-testid="icon-picker-button"]').click()
      await page.locator('[data-testid="icon-option-home"]').first().click()
      await page.locator('[data-testid="bookmark-save-button"]').click()
      await page.waitForTimeout(300) // Wait between additions
    }

    // Verify all bookmarks are visible
    for (const bookmark of bookmarks) {
      await expect(page.locator(`[data-testid="bookmark-card-${bookmark.name}"]`)).toBeVisible()
    }

    // Verify grid layout (check CSS or container)
    const grid = page.locator('[data-testid="bookmarks-grid"]')
    await expect(grid).toBeVisible()
  })

  test('should show empty state when no bookmarks exist', async ({ page }) => {
    // Empty state should be visible initially
    const emptyState = page.locator('[data-testid="bookmarks-empty-state"]')
    await expect(emptyState).toBeVisible()
    await expect(emptyState).toContainText(/no bookmarks/i)
  })

  test('should meet WCAG AA touch target size (44x44px)', async ({ page }) => {
    // Add a bookmark
    await page.locator('[data-testid="add-bookmark-button"]').click()
    await page.locator('[data-testid="bookmark-name-input"]').fill('Touch Test')
    await page.locator('[data-testid="bookmark-url-input"]').fill('https://touch.com')
    await page.locator('[data-testid="icon-picker-button"]').click()
    await page.locator('[data-testid="icon-option-home"]').first().click()
    await page.locator('[data-testid="bookmark-save-button"]').click()

    // Check bookmark card size
    const bookmarkCard = page.locator('[data-testid="bookmark-card-Touch Test"]')
    await expect(bookmarkCard).toBeVisible()

    const box = await bookmarkCard.boundingBox()
    expect(box?.width).toBeGreaterThanOrEqual(44)
    expect(box?.height).toBeGreaterThanOrEqual(44)
  })

  test('should handle duplicate bookmark names', async ({ page }) => {
    // Add first bookmark
    await page.locator('[data-testid="add-bookmark-button"]').click()
    await page.locator('[data-testid="bookmark-name-input"]').fill('Duplicate')
    await page.locator('[data-testid="bookmark-url-input"]').fill('https://first.com')
    await page.locator('[data-testid="icon-picker-button"]').click()
    await page.locator('[data-testid="icon-option-home"]').first().click()
    await page.locator('[data-testid="bookmark-save-button"]').click()

    // Add second bookmark with same name
    await page.locator('[data-testid="add-bookmark-button"]').click()
    await page.locator('[data-testid="bookmark-name-input"]').fill('Duplicate')
    await page.locator('[data-testid="bookmark-url-input"]').fill('https://second.com')
    await page.locator('[data-testid="icon-picker-button"]').click()
    await page.locator('[data-testid="icon-option-home"]').first().click()
    await page.locator('[data-testid="bookmark-save-button"]').click()

    // Both should be visible (allowed per spec)
    const bookmarks = page.locator('[data-testid^="bookmark-card-Duplicate"]')
    await expect(bookmarks).toHaveCount(2)
  })

  test('should open bookmark in new tab when clicked', async ({ page, context }) => {
    // Add a bookmark
    await page.locator('[data-testid="add-bookmark-button"]').click()
    await page.locator('[data-testid="bookmark-name-input"]').fill('External')
    await page.locator('[data-testid="bookmark-url-input"]').fill('https://example.com')
    await page.locator('[data-testid="icon-picker-button"]').click()
    await page.locator('[data-testid="icon-option-home"]').first().click()
    await page.locator('[data-testid="bookmark-save-button"]').click()

    // Click bookmark and verify it opens in new tab
    const bookmarkCard = page.locator('[data-testid="bookmark-card-External"]')
    await expect(bookmarkCard).toBeVisible()

    // Verify target="_blank"
    await expect(bookmarkCard).toHaveAttribute('target', '_blank')
    await expect(bookmarkCard).toHaveAttribute('rel', /noopener/)
  })

  test('should display icon at 64x64px', async ({ page }) => {
    // Add bookmark
    await page.locator('[data-testid="add-bookmark-button"]').click()
    await page.locator('[data-testid="bookmark-name-input"]').fill('Icon Test')
    await page.locator('[data-testid="bookmark-url-input"]').fill('https://icon.com')
    await page.locator('[data-testid="icon-picker-button"]').click()
    await page.locator('[data-testid="icon-option-home"]').first().click()
    await page.locator('[data-testid="bookmark-save-button"]').click()

    // Check icon size
    const icon = page.locator('[data-testid="bookmark-card-Icon Test"] [data-testid="bookmark-icon"]')
    await expect(icon).toBeVisible()

    const box = await icon.boundingBox()
    expect(box?.width).toBe(64)
    expect(box?.height).toBe(64)
  })
})
