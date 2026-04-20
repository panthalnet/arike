import { test, expect } from '@playwright/test'

test.describe('Wallpaper Upload', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000')
    // Switch to Modern theme first so wallpaper controls are visible
    await page.locator('[data-testid="settings-button"]').click()
    const themeSelect = page.locator('[data-testid="theme-select"]')
    await themeSelect.click()
    await page.locator('[role="option"]').filter({ hasText: /modern/i }).click()
    // Wait for settings to be applied
    await page.waitForTimeout(500)
  })

  test('should display built-in wallpaper options in settings panel', async ({ page }) => {
    const wallpaperSection = page.locator('[data-testid="wallpaper-section"]')
    await expect(wallpaperSection).toBeVisible()
    // Should list at least 3 built-in options (excludes 'none' option)
    const options = wallpaperSection.locator('[data-testid^="wallpaper-option-builtin"]')
    expect(await options.count()).toBeGreaterThanOrEqual(3)
  })

  test('should activate a built-in wallpaper on click', async ({ page }) => {
    const oceanBtn = page.locator('[data-testid="wallpaper-option-builtin-1"]')
    await oceanBtn.click()
    await expect(oceanBtn).toHaveAttribute('aria-pressed', 'true')
  })

  test('should show wallpaper upload button', async ({ page }) => {
    const uploadBtn = page.locator('[data-testid="wallpaper-upload-button"]')
    await expect(uploadBtn).toBeVisible()
  })

  test('should reject oversized file upload', async ({ page }) => {
    const uploadInput = page.locator('[data-testid="wallpaper-upload-input"]')
    // Create a fake oversized file (> 2 MB)
    const largeBuffer = Buffer.alloc(3 * 1024 * 1024, 'a')
    await uploadInput.setInputFiles({
      name: 'huge.png',
      mimeType: 'image/png',
      buffer: largeBuffer,
    })
    const error = page.locator('[data-testid="wallpaper-upload-error"]')
    await expect(error).toBeVisible()
    await expect(error).toContainText(/size|too large/i)
  })

  test('should announce wallpaper change to screen readers', async ({ page }) => {
    const announcement = page.locator('[aria-live="polite"]')
    const oceanBtn = page.locator('[data-testid="wallpaper-option-builtin-2"]')
    await oceanBtn.click()
    await expect(announcement).toContainText(/wallpaper/i)
  })
})
