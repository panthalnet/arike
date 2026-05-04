import { test, expect } from '@playwright/test'

test.describe('Tile Size Controls', () => {
  test.beforeEach(async ({ page, request }) => {
    const reset = await request.post('/api/test/reset')
    expect(reset.ok()).toBeTruthy()
    await page.goto('http://localhost:3000')
    // Switch to bento grid mode first
    await page.locator('[data-testid="settings-button"]').click()
    const layoutSelect = page.locator('[data-testid="layout-mode-select"]')
    await layoutSelect.click()
    await page.locator('[role="option"]').filter({ hasText: /bento grid/i }).click()
    await page.locator('[data-testid="settings-close"]').click()

    await page.locator('[data-testid="add-bookmark-button"]').click()
    await page.locator('[data-testid="bookmark-name-input"]').fill('Tile Seed')
    await page.locator('[data-testid="bookmark-url-input"]').fill('https://tile-seed.com')
    await page.locator('[data-testid="bookmark-save-button"]').scrollIntoViewIfNeeded()
    await page.locator('[data-testid="bookmark-save-button"]').click()
    await expect(page.locator('[data-testid="bookmark-card-Tile Seed"]').first()).toBeVisible()
  })

  test('bookmark cards show size toggle in bento grid mode', async ({ page }) => {
    // Hover over a bookmark card to reveal controls
    const card = page.locator('[data-testid^="bookmark-card-"]').first()
    await card.hover()
    const sizeControl = card.locator('[data-testid="tile-size-select"]')
    await expect(sizeControl).toBeVisible()
  })

  test('changing tile size to large expands the card span', async ({ page }) => {
    const card = page.locator('[data-testid="bookmark-card-Tile Seed"]').first()
    await card.hover()
    // tile-size-select is the first button (Small) in the pill group
    // click the Large button by aria-label
    const tileSave = page.waitForResponse((response) =>
      /\/api\/bookmarks\/.+/.test(response.url()) &&
      response.request().method() === 'PATCH' &&
      response.ok()
    )
    await card.locator('button[aria-label="large tile"]').click()
    await tileSave
    await expect(card).toHaveClass(/bento-tile-large/)
  })

  test('tile size persists after page reload', async ({ page }) => {
    const card = page.locator('[data-testid="bookmark-card-Tile Seed"]').first()
    const cardTestId = await card.getAttribute('data-testid')
    await card.hover()
    const tileSave = page.waitForResponse((response) =>
      /\/api\/bookmarks\/.+/.test(response.url()) &&
      response.request().method() === 'PATCH' &&
      response.ok()
    )
    await card.locator('button[aria-label="small tile"]').click()
    await tileSave
    await expect(card).toHaveClass(/bento-tile-small/)
    await page.reload()
    const reloadedCard = page.locator(`[data-testid="${cardTestId}"]`).first()
    await expect(reloadedCard).toHaveClass(/bento-tile-small/)
  })
})
