import { test, expect } from '@playwright/test'

test.describe('Blur Intensity Control', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000')
    // Switch to Modern theme to expose blur controls
    await page.locator('[data-testid="settings-button"]').click()
    const themeSelect = page.locator('[data-testid="theme-select"]')
    await themeSelect.selectOption('modern')
    await page.waitForTimeout(300)
  })

  test('blur intensity slider is visible in Modern theme settings', async ({ page }) => {
    const blurControl = page.locator('[data-testid="blur-intensity-control"]')
    await expect(blurControl).toBeVisible()
  })

  test('blur slider is hidden for non-Modern themes', async ({ page }) => {
    const themeSelect = page.locator('[data-testid="theme-select"]')
    await themeSelect.selectOption('gruvbox')
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
    await page.locator('[data-testid="settings-close"]').click()
    await page.reload()
    // Re-open settings
    await page.locator('[data-testid="settings-button"]').click()
    const reloadedSlider = page.locator('[data-testid="blur-slider"]')
    await expect(reloadedSlider).toHaveValue('18')
  })

  test('blur intensity is announced to screen readers', async ({ page }) => {
    const announcement = page.locator('[aria-live="polite"]')
    const slider = page.locator('[data-testid="blur-slider"]')
    await slider.fill('20')
    await expect(announcement).toContainText(/blur/i)
  })
})
