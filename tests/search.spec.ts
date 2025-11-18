import { test, expect } from '@playwright/test';

test.describe('Search Functionality', () => {
  test('should navigate to search page from homepage', async ({ page }) => {
    await page.goto('/');

    // Click on the search bar
    await page.click('input[placeholder="Search for businesses..."]');

    // Type a search query and press Enter
    await page.fill('input[placeholder="Search for businesses..."]', 'restaurant');
    await page.press('input[placeholder="Search for businesses..."]', 'Enter');

    // Should navigate to search page
    await expect(page).toHaveURL(/\/search\?q=restaurant/);
  });

  test('should display search results for valid query', async ({ page }) => {
    await page.goto('/search?q=restaurant');

    // Should show the search header
    await expect(page.locator('h1')).toContainText('Search Businesses');

    // Should show results count
    const resultsText = page.locator('text=/businesses? found/');
    await expect(resultsText).toBeVisible();

    // Should display business cards
    const businessCards = page.locator('[href^="/businesses/"]');
    await expect(businessCards.first()).toBeVisible();
  });

  test('should show empty state when no query provided', async ({ page }) => {
    await page.goto('/search');

    // Should show empty state message
    await expect(page.locator('text=Enter a search term to find businesses')).toBeVisible();
  });

  test('should show no results message for non-matching query', async ({ page }) => {
    await page.goto('/search?q=nonexistentbusinessxyz123');

    // Should show no results message
    await expect(page.locator('text=/No businesses found/i')).toBeVisible();
  });

  test('should filter by category', async ({ page }) => {
    await page.goto('/search?q=business');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Select a category from dropdown
    await page.selectOption('select#category', { index: 1 }); // Select first non-"All" category

    // URL should update with category parameter
    await expect(page).toHaveURL(/category=/);
  });

  test('should filter by region', async ({ page }) => {
    await page.goto('/search?q=business');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Select a region from dropdown
    await page.selectOption('select#region', { index: 1 }); // Select first non-"All" region

    // URL should update with region parameter
    await expect(page).toHaveURL(/region=/);
  });

  test('should sort results', async ({ page }) => {
    await page.goto('/search?q=restaurant');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Change sort option
    await page.selectOption('select#sort', 'rating');

    // URL should update with sort parameter
    await expect(page).toHaveURL(/sort=rating/);
  });

  test('search should work with special characters', async ({ page }) => {
    await page.goto('/');

    // Search with special characters
    await page.fill('input[placeholder="Search for businesses..."]', 'café & grill');
    await page.press('input[placeholder="Search for businesses..."]', 'Enter');

    // Should navigate to search page with encoded query
    await expect(page).toHaveURL(/\/search/);
  });
});
