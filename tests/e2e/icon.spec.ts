import { test, expect } from '@playwright/test'

test.describe('App icon and metadata', () => {
  test('should have favicon link in <head>', async ({ page }) => {
    await page.goto('http://localhost:3000')

    // Check for at least one favicon/icon link element
    const faviconLink = page.locator('link[rel~="icon"]')
    await expect(faviconLink.first()).toBeAttached()

    // Verify the href references a known icon file pattern
    const href = await faviconLink.first().getAttribute('href')
    expect(href).toMatch(/favicon\.ico|icon\.|apple-icon/i)
  })

  test('should have web app manifest link in <head>', async ({ page }) => {
    await page.goto('http://localhost:3000')

    const manifestLink = page.locator('link[rel="manifest"]')
    await expect(manifestLink).toBeAttached()
  })

  test('should have Open Graph image meta tag in <head>', async ({ page }) => {
    await page.goto('http://localhost:3000')

    const ogImage = page.locator('meta[property="og:image"]')
    await expect(ogImage).toBeAttached()

    const content = await ogImage.getAttribute('content')
    expect(content).toContain('opengraph-image')
  })
})
