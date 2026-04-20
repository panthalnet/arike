import { test, expect } from '@playwright/test'

test.describe('Tile Size Controls', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000')
    // Switch to bento grid mode first
    await page.locator('[data-testid="settings-button"]').click()
    const layoutSelect = page.locator('[data-testid="layout-mode-select"]')
    await layoutSelect.selectOption('bento-grid')
    await page.locator('[data-testid="settings-close"]').click()
  })

  test('bookmark cards show size toggle in bento grid mode', async ({ page }) => {
    // Hover over a bookmark card to reveal controls
    const card = page.locator('[data-testid^="bookmark-card-"]').first()
    await card.hover()
    const sizeControl = card.locator('[data-testid="tile-size-select"]')
    await expect(sizeControl).toBeVisible()
  })

  test('changing tile size to large expands the card span', async ({ page }) => {
    const card = page.locator('[data-testid^="bookmark-card-"]').first()
    await card.hover()
    const sizeSelect = card.locator('[data-testid="tile-size-select"]')
    await sizeSelect.selectOption('large')
    await expect(card).toHaveClass(/bento-tile-large/)
  })

  test('tile size persists after page reload', async ({ page }) => {
    const card = page.locator('[data-testid^="bookmark-card-"]').first()
    const cardName = await card.getAttribute('data-testid')
    await card.hover()
    const sizeSelect = card.locator('[data-testid="tile-size-select"]')
    await sizeSelect.selectOption('small')
    await page.reload()
    const reloadedCard = page.locator(`[data-testid="${cardName}"]`)
    await expect(reloadedCard).toHaveClass(/bento-tile-small/)
  })
})
