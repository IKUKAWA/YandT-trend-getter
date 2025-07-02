// E2E Test for Channel Search functionality
// This file would be used with Playwright or Cypress

import { test, expect, Page } from '@playwright/test'

test.describe('Channel Search E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Navigate to individual channel analysis page
    await page.getByText('個別チャンネル分析').click()
  })

  test('should perform channel search and select a channel', async ({ page }) => {
    // Type in search input
    const searchInput = page.getByRole('combobox', { name: /チャンネル検索/i })
    await searchInput.fill('テスト')

    // Wait for search results to appear
    await page.waitForSelector('[role="listbox"]')

    // Check that results are displayed
    const results = page.getByRole('listbox')
    await expect(results).toBeVisible()

    // Select the first result
    const firstResult = page.getByRole('option').first()
    await firstResult.click()

    // Verify channel is selected
    await expect(searchInput).toHaveValue(/テスト/)
  })

  test('should support keyboard navigation in search results', async ({ page }) => {
    // Type in search input
    const searchInput = page.getByRole('combobox', { name: /チャンネル検索/i })
    await searchInput.fill('テスト')

    // Wait for results
    await page.waitForSelector('[role="listbox"]')

    // Use arrow keys to navigate
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('ArrowDown')
    
    // Press Enter to select
    await page.keyboard.press('Enter')

    // Verify selection occurred
    await expect(page.getByText('選択されました')).toBeVisible()
  })

  test('should show channel analysis after selection', async ({ page }) => {
    // Perform search and selection
    await page.getByRole('combobox').fill('HikakinTV')
    await page.waitForSelector('[role="listbox"]')
    await page.getByRole('option').first().click()

    // Wait for analysis to load
    await page.waitForSelector('[data-testid="channel-analysis"]', { timeout: 10000 })

    // Verify analysis components are visible
    await expect(page.getByText('基本情報')).toBeVisible()
    await expect(page.getByText('成長分析')).toBeVisible()
    await expect(page.getByText('競合比較')).toBeVisible()
    await expect(page.getByText('収益予測')).toBeVisible()
    await expect(page.getByText('AIレポート')).toBeVisible()
  })

  test('should handle no search results gracefully', async ({ page }) => {
    // Search for something that doesn't exist
    await page.getByRole('combobox').fill('nonexistentchannelxyz123')

    // Wait a bit for the search to complete
    await page.waitForTimeout(1000)

    // Should show no results message
    await expect(page.getByText('検索結果が見つかりませんでした')).toBeVisible()
  })

  test('should work with advanced filters', async ({ page }) => {
    // Open advanced filters
    await page.getByRole('button', { name: /filter/i }).click()

    // Set platform filter to YouTube
    await page.selectOption('select[name="platform"]', 'youtube')

    // Set category filter
    await page.selectOption('select[name="category"]', 'テクノロジー')

    // Perform search
    await page.getByRole('combobox').fill('テスト')

    // Wait for results
    await page.waitForSelector('[role="listbox"]')

    // Verify all results are from YouTube and Technology category
    const results = page.getByRole('option')
    const count = await results.count()
    
    for (let i = 0; i < count; i++) {
      const result = results.nth(i)
      await expect(result).toContainText('youtube')
      await expect(result).toContainText('テクノロジー')
    }
  })

  test('should display loading states appropriately', async ({ page }) => {
    // Start typing
    await page.getByRole('combobox').fill('テスト')

    // Should show loading indicator
    await expect(page.getByTestId('loading-spinner')).toBeVisible()

    // Wait for results to load
    await page.waitForSelector('[role="listbox"]')

    // Loading should be gone
    await expect(page.getByTestId('loading-spinner')).not.toBeVisible()
  })

  test('should be accessible via keyboard only', async ({ page }) => {
    // Tab to search input
    await page.keyboard.press('Tab')
    
    // Type search query
    await page.keyboard.type('テスト')

    // Wait for results
    await page.waitForSelector('[role="listbox"]')

    // Navigate with arrow keys
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('ArrowDown')

    // Select with Enter
    await page.keyboard.press('Enter')

    // Should have selected a channel
    await expect(page.getByText('が選択されました')).toBeVisible()
  })

  test('should handle errors gracefully', async ({ page }) => {
    // Mock network error
    await page.route('/api/channels/search*', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ success: false, error: 'Server error' })
      })
    })

    // Perform search
    await page.getByRole('combobox').fill('テスト')

    // Should show error message
    await expect(page.getByText(/エラーが発生しました/)).toBeVisible()
  })

  test('should show channel verification status', async ({ page }) => {
    // Search for verified channel
    await page.getByRole('combobox').fill('HikakinTV')
    await page.waitForSelector('[role="listbox"]')

    // First result should show verification badge
    const firstResult = page.getByRole('option').first()
    await expect(firstResult.getByTestId('verification-icon')).toBeVisible()
  })

  test('should format subscriber counts correctly', async ({ page }) => {
    // Search for channels
    await page.getByRole('combobox').fill('テスト')
    await page.waitForSelector('[role="listbox"]')

    // Check that subscriber counts are formatted (e.g., "1.2M", "500K")
    const results = page.getByRole('option')
    const firstResult = results.first()
    
    await expect(firstResult).toContainText(/\d+(\.\d+)?[KMB]?\s*登録者/)
  })

  test('should support mobile layout', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Search should still work on mobile
    await page.getByRole('combobox').fill('テスト')
    await page.waitForSelector('[role="listbox"]')

    // Results should be mobile-friendly
    const results = page.getByRole('listbox')
    await expect(results).toBeVisible()

    // Touch interaction should work
    await page.getByRole('option').first().tap()
    
    // Should have selected channel
    await expect(page.getByText('が選択されました')).toBeVisible()
  })
})

test.describe('Channel Analysis Dashboard E2E', () => {
  test('should load and display channel analysis tabs', async ({ page }) => {
    await page.goto('/')
    await page.getByText('個別チャンネル分析').click()

    // Search and select a channel
    await page.getByRole('combobox').fill('HikakinTV')
    await page.waitForSelector('[role="listbox"]')
    await page.getByRole('option').first().click()

    // Wait for analysis to load
    await page.waitForSelector('[data-testid="channel-analysis"]', { timeout: 15000 })

    // Test each tab
    const tabs = ['概要', '成長分析', '競合比較', '収益予測', 'AIレポート']
    
    for (const tabName of tabs) {
      await page.getByRole('tab', { name: tabName }).click()
      await expect(page.getByRole('tabpanel')).toBeVisible()
    }
  })

  test('should export analysis data', async ({ page }) => {
    await page.goto('/')
    await page.getByText('個別チャンネル分析').click()

    // Select a channel and wait for analysis
    await page.getByRole('combobox').fill('HikakinTV')
    await page.waitForSelector('[role="listbox"]')
    await page.getByRole('option').first().click()
    await page.waitForSelector('[data-testid="channel-analysis"]', { timeout: 15000 })

    // Click export button
    const exportButton = page.getByRole('button', { name: /エクスポート/i })
    await exportButton.click()

    // Should open export modal
    await expect(page.getByText('エクスポートオプション')).toBeVisible()
  })

  test('should refresh analysis data', async ({ page }) => {
    await page.goto('/')
    await page.getByText('個別チャンネル分析').click()

    // Select a channel and wait for analysis
    await page.getByRole('combobox').fill('HikakinTV')
    await page.waitForSelector('[role="listbox"]')
    await page.getByRole('option').first().click()
    await page.waitForSelector('[data-testid="channel-analysis"]', { timeout: 15000 })

    // Click refresh button
    const refreshButton = page.getByRole('button', { name: /更新/i })
    await refreshButton.click()

    // Should show loading state
    await expect(page.getByText('分析を実行中')).toBeVisible()

    // Should complete refresh
    await page.waitForSelector('[data-testid="channel-analysis"]', { timeout: 15000 })
  })
})