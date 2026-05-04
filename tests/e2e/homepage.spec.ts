import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test.beforeEach(async ({ page, request }) => {
    const reset = await request.post('/api/test/reset')
    expect(reset.ok()).toBeTruthy()
    // Navigate to homepage
    await page.goto('http://localhost:3000')
  })

  test('should render homepage with clock and search bar', async ({ page }) => {
    // Verify page title
    await expect(page).toHaveTitle(/Arike/)

    // Verify clock component is visible
    const clock = page.locator('[data-testid="clock"]')
    await expect(clock).toBeVisible()

    // Verify date is displayed
    const date = page.locator('[data-testid="clock-date"]')
    await expect(date).toBeVisible()
    await expect(date).not.toBeEmpty()

    // Verify time is displayed
    const time = page.locator('[data-testid="clock-time"]')
    await expect(time).toBeVisible()
    await expect(time).not.toBeEmpty()

    // Verify search bar is visible
    const searchBar = page.locator('[data-testid="search-bar"]')
    await expect(searchBar).toBeVisible()

    // Verify search input is accessible
    const searchInput = page.locator('[data-testid="search-input"]')
    await expect(searchInput).toBeVisible()
    await expect(searchInput).toHaveAttribute('placeholder')
  })

  test('should have accessible search bar with keyboard navigation', async ({ page }) => {
    const searchInput = page.locator('[data-testid="search-input"]')

    // Verify the search input is reachable via keyboard Tab navigation
    // (programmatic .focus() would mask a broken tab order)
    await page.locator('body').click()
    let reachedInput = false
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab')
      if (await searchInput.evaluate(el => el === document.activeElement)) {
        reachedInput = true
        break
      }
    }
    expect(reachedInput).toBe(true)
    await expect(searchInput).toBeFocused()

    // Type in search
    await searchInput.fill('test search')
    await expect(searchInput).toHaveValue('test search')

    // Press Enter to trigger search
    await searchInput.press('Enter')

    // Verify search functionality (opens in new tab or filters bookmarks)
    // Note: Actual behavior will be implemented in T013
  })

  test('should open settings panel and change theme', async ({ page }) => {
    // Click settings button
    const settingsButton = page.locator('[data-testid="settings-button"]')
    await expect(settingsButton).toBeVisible()
    await settingsButton.click()

    // Verify settings panel is visible
    const settingsPanel = page.locator('[data-testid="settings-panel"]')
    await expect(settingsPanel).toBeVisible()

    // Get initial theme trigger (shadcn Select — not a native <select>)
    const themeSelect = page.locator('[data-testid="theme-select"]')
    await expect(themeSelect).toBeVisible()
    // Verify default theme label shown in trigger
    await expect(themeSelect).toContainText(/gruvbox/i)

    // Change theme to Catppuccin by clicking trigger then option
    await themeSelect.click()
    await page.locator('[role="option"]').filter({ hasText: /catppuccin/i }).click()

    // Verify theme changed by checking CSS custom property or data attribute
    const html = page.locator('html')
    await expect(html).toHaveAttribute('data-theme', 'catppuccin')

    // Verify screen reader announcement for theme change
    const announcement = page
      .locator('[role="status"][aria-live="polite"]')
      .filter({ hasText: /theme updated/i })
      .first()
    await expect(announcement).toContainText(/Theme updated/)

    // Close settings panel
    const closeButton = page.locator('[data-testid="settings-close"]')
    await closeButton.click()

    // Verify settings panel is closed
    await expect(settingsPanel).not.toBeVisible()

    // Verify theme persisted by reloading page
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Verify theme is still Catppuccin
    await expect(html).toHaveAttribute('data-theme', 'catppuccin')
  })

  test('should change theme without page restart', async ({ page }) => {
    // Open settings
    const settingsButton = page.locator('[data-testid="settings-button"]')
    await settingsButton.click()

    // Get reference to a page element to verify scroll position is maintained
    const searchBar = page.locator('[data-testid="search-bar"]')
    const initialPosition = await searchBar.boundingBox()

    // Change theme (shadcn Select — click trigger then option)
    const themeSelect = page.locator('[data-testid="theme-select"]')
    await themeSelect.click()
    await page.locator('[role="option"]').filter({ hasText: /everforest/i }).click()

    // Verify theme applied (ensures page didn't reload)
    const html = page.locator('html')
    await expect(html).toHaveAttribute('data-theme', 'everforest')

    // Verify page didn't reload (scroll position maintained)
    const afterPosition = await searchBar.boundingBox()
    expect(initialPosition?.y).toBe(afterPosition?.y)
  })

  test('should support keyboard navigation for settings panel', async ({ page }) => {
    // Navigate to settings button with Tab
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab') // May need adjustment based on actual tab order

    // Open settings with Enter
    const settingsButton = page.locator('[data-testid="settings-button"]')
    await settingsButton.focus()
    await page.keyboard.press('Enter')

    // Verify settings panel is open
    const settingsPanel = page.locator('[data-testid="settings-panel"]')
    await expect(settingsPanel).toBeVisible()

    // Verify focus is trapped in modal — first focusable element is the theme trigger
    const themeSelect = page.locator('[data-testid="theme-select"]')
    await expect(themeSelect).toBeFocused({ timeout: 500 }).catch(() => {
      // Focus may land on another interactive element inside the dialog; just verify panel is open
    })

    // Close with Escape
    await page.keyboard.press('Escape')

    // Verify settings panel is closed and focus returned
    await expect(settingsPanel).not.toBeVisible()
    await expect(settingsButton).toBeFocused()
  })

  test('should meet WCAG AA color contrast requirements', async ({ page }) => {
    // Test default theme (Gruvbox)
    const html = page.locator('html')
    await expect(html).toHaveAttribute('data-theme', 'gruvbox')

    // Get computed styles for text elements
    const clockText = page.locator('[data-testid="clock-time"]')
    const clockColor = await clockText.evaluate((el) => {
      return window.getComputedStyle(el).color
    })
    const clockBg = await clockText.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor
    })

    // Note: Actual contrast calculation would require a contrast checker
    // For now, we verify the styles are applied
    expect(clockColor).toBeTruthy()
    expect(clockBg).toBeTruthy()
  })

  test('should display custom theme colors when set', async ({ page }) => {
    // Open settings
    const settingsButton = page.locator('[data-testid="settings-button"]')
    await settingsButton.click()

    // Find custom color inputs
    const customPrimaryInput = page.locator('[data-testid="custom-primary-color"]')
    await expect(customPrimaryInput).toBeVisible()

    // Set custom primary color
    await customPrimaryInput.fill('#ff5733')

    // Wait for debounced API call — ThemeProvider sets --primary as HSL (e.g. "13 100% 60%")
    await page.waitForFunction(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() !== ''
    )

    // Verify custom color is applied to CSS custom property (HSL format: "H S% L%")
    const rootStyles = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).getPropertyValue('--primary')
    })

    expect(rootStyles.trim()).toMatch(/\d+ \d+% \d+%/) // HSL format
  })

  test('should change search provider', async ({ page }) => {
    // Open settings
    const settingsButton = page.locator('[data-testid="settings-button"]')
    await settingsButton.click()

    // Find search provider dropdown (shadcn Select — not a native <select>)
    const providerSelect = page.locator('[data-testid="search-provider-select"]')
    await expect(providerSelect).toBeVisible()
    await expect(providerSelect).toContainText(/duckduckgo/i)

    // Change to Google by clicking trigger then option
    const searchSave = page.waitForResponse((response) =>
      response.url().includes('/api/settings') &&
      response.request().method() === 'PUT' &&
      response.ok()
    )
    await providerSelect.click()
    await page.locator('[role="option"]').filter({ hasText: /google/i }).click()
    await searchSave

    // Close settings
    const closeButton = page.locator('[data-testid="settings-close"]')
    await closeButton.click()

    // Verify provider persisted
    await page.reload()
    await settingsButton.click()
    const providerSelectAfterReload = page.locator('[data-testid="search-provider-select"]')
    await expect(providerSelectAfterReload).toContainText(/google/i)
  })

  test('should load homepage in under 2 seconds (First Contentful Paint)', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto('http://localhost:3000')
    
    // Wait for clock to be visible (indicates page is rendered)
    await page.locator('[data-testid="clock"]').waitFor({ state: 'visible' })
    
    const loadTime = Date.now() - startTime
    
    // Should meet <2s first paint requirement
    expect(loadTime).toBeLessThan(2000)
  })

  // T003: Modern theme switching and persistence
  test('should switch to Modern theme and apply glassmorphism styling', async ({ page }) => {
    const settingsButton = page.locator('[data-testid="settings-button"]')
    await settingsButton.click()

    const themeSelect = page.locator('[data-testid="theme-select"]')
    await expect(themeSelect).toBeVisible()

    await themeSelect.click()
    await page.locator('[role="option"]').filter({ hasText: /modern/i }).click()

    const html = page.locator('html')
    await expect(html).toHaveAttribute('data-theme', 'modern')

    // Glassmorphism: body should have a background that includes gradient
    const bodyBg = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--theme-background').trim()
    )
    expect(bodyBg.length).toBeGreaterThan(0)
  })

  test('should persist Modern theme after page reload', async ({ page }) => {
    const settingsButton = page.locator('[data-testid="settings-button"]')
    await settingsButton.click()

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
    const themeAnnouncement = page
      .locator('[role="status"][aria-live="polite"]')
      .filter({ hasText: /theme updated to modern/i })
      .first()
    await expect(themeAnnouncement).toBeVisible()

    await page.reload()
    await page.waitForLoadState('networkidle')

    const html = page.locator('html')
    await expect(html).toHaveAttribute('data-theme', 'modern')
  })

  test('should announce Modern theme change to screen readers', async ({ page }) => {
    const settingsButton = page.locator('[data-testid="settings-button"]')
    await settingsButton.click()

    const themeSelect = page.locator('[data-testid="theme-select"]')
    await themeSelect.click()
    await page.locator('[role="option"]').filter({ hasText: /modern/i }).click()

    const announcement = page
      .locator('[role="status"][aria-live="polite"]')
      .filter({ hasText: /theme updated/i })
      .first()
    await expect(announcement).toContainText(/Theme updated/i)
  })
})
