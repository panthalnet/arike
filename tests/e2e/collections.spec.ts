import { test, expect, type Page } from '@playwright/test'

async function clickBookmarkSave(page: Page) {
  const saveButton = page.locator('[data-testid="bookmark-save-button"]')
  await saveButton.scrollIntoViewIfNeeded()
  await saveButton.click()
}

test.describe('Collection Management', () => {
  test.beforeEach(async ({ page, request }) => {
    const reset = await request.post('/api/test/reset')
    expect(reset.ok()).toBeTruthy()
    await page.goto('http://localhost:3000')
  })

  test('should display default "Bookmarks" collection tab', async ({ page }) => {
    // Default collection tab should be visible
    const defaultTab = page.locator('[data-testid="collection-tab-Bookmarks"]')
    await expect(defaultTab).toBeVisible()
    await expect(defaultTab).toHaveAttribute('aria-selected', 'true')
  })

  test('should create a new collection', async ({ page }) => {
    // Open collection manager
    const manageBtn = page.locator('[data-testid="manage-collections-button"]')
    await expect(manageBtn).toBeVisible()
    await manageBtn.click()

    // Collection manager dialog should open
    const dialog = page.locator('[data-testid="collection-manager-dialog"]')
    await expect(dialog).toBeVisible()

    // Fill in collection name
    await page.locator('[data-testid="new-collection-name-input"]').fill('Work')
    await page.locator('[data-testid="add-collection-button"]').click()

    // Verify collection appears in list
    await expect(page.locator('[data-testid="collection-list-item-Work"]')).toBeVisible()

    // Close dialog
    await page.locator('[data-testid="close-collection-manager"]').click()

    // Verify new tab appears on dashboard
    const newTab = page.locator('[data-testid="collection-tab-Work"]')
    await expect(newTab).toBeVisible({ timeout: 500 })
  })

  test('should rename a collection from the manager', async ({ page }) => {
    const manageBtn = page.locator('[data-testid="manage-collections-button"]')
    await manageBtn.click()

    const editButton = page.locator('[data-testid="edit-collection-button-Bookmarks"]')
    await expect(editButton).toBeVisible()
    await editButton.click()

    await page.locator('input').nth(0).fill('Main')
    await page.locator('[data-testid="save-collection-button-Bookmarks"]').click()

    await expect(page.locator('[data-testid="collection-list-item-Main"]')).toBeVisible()
    await page.locator('[data-testid="close-collection-manager"]').click()
    await expect(page.locator('[data-testid="collection-tab-Main"]')).toBeVisible()
  })

  test('should switch between collections and filter bookmarks', async ({ page }) => {
    // Add a bookmark to default collection
    await page.locator('[data-testid="add-bookmark-button"]').click()
    await page.locator('[data-testid="bookmark-name-input"]').fill('Default Bookmark')
    await page.locator('[data-testid="bookmark-url-input"]').fill('https://default.com')
    await clickBookmarkSave(page)

    // Create a new collection
    const manageBtn = page.locator('[data-testid="manage-collections-button"]')
    await manageBtn.click()
    await page.locator('[data-testid="new-collection-name-input"]').fill('Personal')
    await page.locator('[data-testid="add-collection-button"]').click()
    await page.locator('[data-testid="close-collection-manager"]').click()

    // Switch to the new collection
    const personalTab = page.locator('[data-testid="collection-tab-Personal"]')
    await expect(personalTab).toBeVisible()
    await personalTab.click()
    await expect(personalTab).toHaveAttribute('aria-selected', 'true')

    // Add a bookmark to this collection
    await page.locator('[data-testid="add-bookmark-button"]').click()
    await page.locator('[data-testid="bookmark-name-input"]').fill('Personal Bookmark')
    await page.locator('[data-testid="bookmark-url-input"]').fill('https://personal.com')
    await page.locator('[data-testid="collection-checkbox-Bookmarks"]').uncheck()
    await page.locator('[data-testid="collection-checkbox-Personal"]').check()
    await clickBookmarkSave(page)

    // Verify only personal bookmark is shown
    await expect(page.locator('[data-testid="bookmark-card-Personal Bookmark"]')).toBeVisible()
    await expect(page.locator('[data-testid="bookmark-card-Default Bookmark"]')).not.toBeVisible()

    // Switch back to default collection - within 100ms per spec
    const defaultTab = page.locator('[data-testid="collection-tab-Bookmarks"]')
    await defaultTab.click()
    await expect(page.locator('[data-testid="bookmark-card-Default Bookmark"]')).toBeVisible({ timeout: 500 })
    await expect(page.locator('[data-testid="bookmark-card-Personal Bookmark"]')).not.toBeVisible()
  })

  test('should assign bookmark to multiple collections', async ({ page }) => {
    // Create a second collection
    const manageBtn = page.locator('[data-testid="manage-collections-button"]')
    await manageBtn.click()
    await page.locator('[data-testid="new-collection-name-input"]').fill('Both')
    await page.locator('[data-testid="add-collection-button"]').click()
    await page.locator('[data-testid="close-collection-manager"]').click()

    // Add bookmark and assign to multiple collections
    await page.locator('[data-testid="add-bookmark-button"]').click()
    await page.locator('[data-testid="bookmark-name-input"]').fill('Multi Collection')
    await page.locator('[data-testid="bookmark-url-input"]').fill('https://multi.com')

    // Select multiple collections in form
    await page.locator('[data-testid="collection-checkbox-Bookmarks"]').check()
    await page.locator('[data-testid="collection-checkbox-Both"]').check()

    await clickBookmarkSave(page)

    // Should appear in both Bookmarks tab
    const defaultTab = page.locator('[data-testid="collection-tab-Bookmarks"]')
    await defaultTab.click()
    await expect(page.locator('[data-testid="bookmark-card-Multi Collection"]')).toBeVisible()

    // And in Both tab (US3-AS3: bookmark appears in both collections)
    await page.locator('[data-testid="collection-tab-Both"]').click()
    await expect(page.locator('[data-testid="bookmark-card-Multi Collection"]')).toBeVisible()
  })

  test('should delete a collection with confirmation', async ({ page }) => {
    // Create a collection to delete
    const manageBtn = page.locator('[data-testid="manage-collections-button"]')
    await manageBtn.click()
    await page.locator('[data-testid="new-collection-name-input"]').fill('To Delete Collection')
    await page.locator('[data-testid="add-collection-button"]').click()

    // Delete the collection
    await page.locator('[data-testid="delete-collection-button-To Delete Collection"]').click()

    // Confirm deletion
    const confirmDialog = page.locator('[data-testid="delete-collection-confirm"]')
    await expect(confirmDialog).toBeVisible()
    await page.locator('[data-testid="confirm-delete-collection-button"]').click()

    // Verify collection removed from list
    await expect(page.locator('[data-testid="collection-list-item-To Delete Collection"]')).not.toBeVisible()

    // Close manager
    await page.locator('[data-testid="close-collection-manager"]').click()

    // Verify tab is removed from dashboard
    await expect(page.locator('[data-testid="collection-tab-To Delete Collection"]')).not.toBeVisible()
  })

  test('should show empty state for a new empty collection', async ({ page }) => {
    // Create a new collection
    const manageBtn = page.locator('[data-testid="manage-collections-button"]')
    await manageBtn.click()
    await page.locator('[data-testid="new-collection-name-input"]').fill('Empty Collection')
    await page.locator('[data-testid="add-collection-button"]').click()
    await page.locator('[data-testid="close-collection-manager"]').click()

    // Switch to new collection
    await page.locator('[data-testid="collection-tab-Empty Collection"]').click()

    // Should show empty state with add bookmark button
    const emptyState = page.locator('[data-testid="bookmarks-empty-state"]')
    await expect(emptyState).toBeVisible()
    await expect(emptyState).toContainText(/no bookmarks/i)
  })

  test('should not allow deleting the last collection', async ({ page }) => {
    // Ensure only default collection exists
    const manageBtn = page.locator('[data-testid="manage-collections-button"]')
    await manageBtn.click()

    // Delete button on default collection should be disabled
    const deleteBtn = page.locator('[data-testid="delete-collection-button-Bookmarks"]')
    await expect(deleteBtn).toBeDisabled()
  })

  test('should show collection tabs as horizontal scrollable on mobile', async ({ page }) => {
    // Create several collections to force scrolling
    const manageBtn = page.locator('[data-testid="manage-collections-button"]')
    await manageBtn.click()
    for (const name of ['Col 1', 'Col 2', 'Col 3', 'Col 4']) {
      await page.locator('[data-testid="new-collection-name-input"]').fill(name)
      await page.locator('[data-testid="add-collection-button"]').click()
      await page.locator('[data-testid="new-collection-name-input"]').clear()
    }
    await page.locator('[data-testid="close-collection-manager"]').click()

    // Tab bar should be scrollable
    const tabBar = page.locator('[data-testid="collection-tabs"]')
    await expect(tabBar).toBeVisible()
  })

  test('should support reordering collections from the dashboard', async ({ page }) => {
    const manageBtn = page.locator('[data-testid="manage-collections-button"]')
    await manageBtn.click()
    for (const name of ['One', 'Two']) {
      await page.locator('[data-testid="new-collection-name-input"]').fill(name)
      await page.locator('[data-testid="add-collection-button"]').click()
    }
    await page.locator('[data-testid="close-collection-manager"]').click()

    await page.locator('[data-testid="move-collection-right-Bookmarks"]').click()

    const tabs = page.locator('[role="tab"]')
    await expect(tabs.nth(0)).toHaveAttribute('data-testid', 'collection-tab-One')
  })

  test('should show bookmark count badge on collection tabs', async ({ page }) => {
    // Add a bookmark to default collection
    await page.locator('[data-testid="add-bookmark-button"]').click()
    await page.locator('[data-testid="bookmark-name-input"]').fill('Badge Test')
    await page.locator('[data-testid="bookmark-url-input"]').fill('https://badge.com')
    await clickBookmarkSave(page)

    // Check for badge count on tab
    const tabBadge = page.locator('[data-testid="collection-tab-Bookmarks"] [data-testid="tab-badge"]')
    await expect(tabBadge).toBeVisible()
  })

  test('should update all occurrences when editing a bookmark in multiple collections', async ({ page }) => {
    // Create second collection
    const manageBtn = page.locator('[data-testid="manage-collections-button"]')
    await manageBtn.click()
    await page.locator('[data-testid="new-collection-name-input"]').fill('Second')
    await page.locator('[data-testid="add-collection-button"]').click()
    await page.locator('[data-testid="close-collection-manager"]').click()

    // Add bookmark assigned to both collections
    await page.locator('[data-testid="add-bookmark-button"]').click()
    await page.locator('[data-testid="bookmark-name-input"]').fill('Shared')
    await page.locator('[data-testid="bookmark-url-input"]').fill('https://shared.com')
    await page.locator('[data-testid="collection-checkbox-Bookmarks"]').check()
    await page.locator('[data-testid="collection-checkbox-Second"]').check()
    await clickBookmarkSave(page)
    await expect(page.locator('[data-testid="bookmark-card-Shared"]')).toBeVisible()

    // Verify it appears in Second before edit as well.
    await page.locator('[data-testid="collection-tab-Second"]').click()
    await expect(page.locator('[data-testid="bookmark-card-Shared"]')).toBeVisible()
    await page.locator('[data-testid="collection-tab-Bookmarks"]').click()

    // Edit bookmark in default collection
    const bookmarkCard = page.locator('[data-testid="bookmark-card-Shared"]')
    await bookmarkCard.hover()
    await page.locator('[data-testid="bookmark-edit-button-Shared"]').click()
    await page.locator('[data-testid="bookmark-name-input"]').fill('Shared Updated')
    await clickBookmarkSave(page)

    // Verify updated in Bookmarks tab
    await expect(page.locator('[data-testid="bookmark-card-Shared Updated"]')).toBeVisible()

    // Switch to Second collection and verify updated there too
    await page.locator('[data-testid="collection-tab-Second"]').click()
    await expect(page.locator('[data-testid="bookmark-card-Shared Updated"]')).toBeVisible()
  })
})
