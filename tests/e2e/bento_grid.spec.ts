import { test, expect } from '@playwright/test'

test.describe('Bento Grid Layout', () => {
  test.beforeEach(async ({ page, request }) => {
    const reset = await request.post('/api/test/reset')
    expect(reset.ok()).toBeTruthy()
    await page.goto('http://localhost:3000')

    // Seed one bookmark so grid-based assertions have a rendered card container.
    await page.locator('[data-testid="add-bookmark-button"]').click()
    await page.locator('[data-testid="bookmark-name-input"]').fill('Bento Seed')
    await page.locator('[data-testid="bookmark-url-input"]').fill('https://bento-seed.com')
    await page.locator('[data-testid="bookmark-save-button"]').scrollIntoViewIfNeeded()
    await page.locator('[data-testid="bookmark-save-button"]').click()
    await expect(page.locator('[data-testid="bookmark-card-Bento Seed"]')).toBeVisible()
  })

  test('default layout is uniform grid', async ({ page }) => {
    const grid = page.locator('[data-testid="bookmarks-grid"]')
    await expect(grid).not.toHaveAttribute('data-layout', 'bento-grid')
  })

  test('should switch to bento grid from settings', async ({ page }) => {
    await page.locator('[data-testid="settings-button"]').click()
    const layoutSelect = page.locator('[data-testid="layout-mode-select"]')
    await expect(layoutSelect).toBeVisible()
    await layoutSelect.click()
    await page.locator('[role="option"]').filter({ hasText: /bento grid/i }).click()
    // Verify grid changes layout attribute
    const grid = page.locator('[data-testid="bookmarks-grid"]')
    await expect(grid).toHaveAttribute('data-layout', 'bento-grid')
  })

  test('bento grid is default for Modern theme', async ({ page }) => {
    await page.locator('[data-testid="settings-button"]').click()
    const themeSelect = page.locator('[data-testid="theme-select"]')
    await themeSelect.click()
    await page.locator('[role="option"]').filter({ hasText: /modern/i }).click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'modern')
    await page.locator('[data-testid="settings-close"]').click()
    await expect(page.locator('[data-testid="bookmark-card-Bento Seed"]')).toBeVisible()
    const grid = page.locator('[data-testid="bookmarks-grid"]')
    await expect(grid).toHaveAttribute('data-layout', 'bento-grid')
  })

  test('layout mode persists after page reload', async ({ page }) => {
    await page.locator('[data-testid="settings-button"]').click()
    const layoutSelect = page.locator('[data-testid="layout-mode-select"]')
    await layoutSelect.click()
    await page.locator('[role="option"]').filter({ hasText: /bento grid/i }).click()
    await page.reload()
    const grid = page.locator('[data-testid="bookmarks-grid"]')
    await expect(grid).toHaveAttribute('data-layout', 'bento-grid')
  })

  test('bento grid has correct CSS classes on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.locator('[data-testid="settings-button"]').click()
    const layoutSelect = page.locator('[data-testid="layout-mode-select"]')
    await layoutSelect.click()
    await page.locator('[role="option"]').filter({ hasText: /bento grid/i }).click()
    const grid = page.locator('[data-testid="bookmarks-grid"]')
    await expect(grid).toHaveClass(/bento-grid/)
  })
})
