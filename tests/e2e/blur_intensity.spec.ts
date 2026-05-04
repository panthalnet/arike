import { test, expect } from '@playwright/test'

test.describe('Blur Intensity Control', () => {
  test.beforeEach(async ({ page, request }) => {
    const reset = await request.post('/api/test/reset')
    expect(reset.ok()).toBeTruthy()
    await page.goto('http://localhost:3000')
    // Switch to Modern theme to expose blur controls
    await page.locator('[data-testid="settings-button"]').click()
    const themeSelect = page.locator('[data-testid="theme-select"]')
    const themeSave = page.waitForResponse((response) =>
      response.url().includes('/api/settings') &&
      response.request().method() === 'PUT' &&
      response.ok()
    )
    await themeSelect.click()
    await page.locator('[role="option"]').filter({ hasText: /modern/i }).click()
    await themeSave
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'modern')
  })

  test('blur intensity slider is visible in Modern theme settings', async ({ page }) => {
    const blurControl = page.locator('[data-testid="blur-intensity-control"]')
    await expect(blurControl).toBeVisible()
  })

  test('blur slider is hidden for non-Modern themes', async ({ page }) => {
    const themeSelect = page.locator('[data-testid="theme-select"]')
    await themeSelect.click()
    await page.locator('[role="option"]').filter({ hasText: /gruvbox/i }).click()
    const blurControl = page.locator('[data-testid="blur-intensity-control"]')
    await expect(blurControl).not.toBeVisible()
  })

  test('changing blur intensity updates --glass-blur CSS variable', async ({ page }) => {
    const slider = page.locator('[data-testid="blur-slider"]')
    await slider.fill('16')
    const glassBlur = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--glass-blur').trim()
    )
    expect(glassBlur).toBe('16px')
  })

  test('blur intensity persists after page reload', async ({ page }) => {
    const slider = page.locator('[data-testid="blur-slider"]')
    await slider.fill('18')
    const blurAnnouncement = page
      .locator('[role="status"][aria-live="polite"]')
      .filter({ hasText: /blur intensity set to 18px/i })
      .first()
    await expect(blurAnnouncement).toBeVisible()
    await page.locator('[data-testid="settings-close"]').click()
    await page.reload()
    // Re-open settings
    await page.locator('[data-testid="settings-button"]').click()
    const reloadedSlider = page.locator('[data-testid="blur-slider"]')
    await expect(reloadedSlider).toHaveValue('18')
  })

  test('blur intensity is announced to screen readers', async ({ page }) => {
    const announcement = page
      .locator('[role="status"][aria-live="polite"]')
      .filter({ hasText: /blur intensity set to/i })
      .first()
    const slider = page.locator('[data-testid="blur-slider"]')
    await slider.fill('20')
    await expect(announcement).toContainText(/blur/i)
  })
})
