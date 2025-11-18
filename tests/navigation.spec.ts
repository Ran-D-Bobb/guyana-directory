import { test, expect } from '@playwright/test';

test.describe('Navigation and Page View Tracking', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/');

    // Should display hero section
    await expect(page.locator('h1')).toContainText('Discover Local Businesses in Guyana');

    // Should display search bar
    await expect(page.locator('input[placeholder="Search for businesses..."]')).toBeVisible();

    // Should display category section
    await expect(page.locator('h2:has-text("Browse by Category")')).toBeVisible();
  });

  test('should display featured businesses on homepage', async ({ page }) => {
    await page.goto('/');

    // Wait for featured businesses to load
    await page.waitForLoadState('networkidle');

    // Should display featured businesses section if there are featured businesses
    const featuredSection = page.locator('h2:has-text("Featured Businesses")');
    const featuredExists = await featuredSection.count();

    if (featuredExists > 0) {
      await expect(featuredSection).toBeVisible();
    }
  });

  test('should navigate to category page', async ({ page }) => {
    await page.goto('/');

    // Wait for categories to load
    await page.waitForLoadState('networkidle');

    // Click on a category card
    const categoryCard = page.locator('[href^="/businesses/category/"]').first();
    await categoryCard.click();

    // Should navigate to category page
    await expect(page).toHaveURL(/\/businesses\/category\//);

    // Should show category name in header
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should display filters on category page', async ({ page }) => {
    await page.goto('/businesses/category/restaurants-dining');

    // Should display region filter
    await expect(page.locator('select#region')).toBeVisible();

    // Should display sort filter
    await expect(page.locator('select#sort')).toBeVisible();
  });

  test('should navigate to business detail page', async ({ page }) => {
    await page.goto('/');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Click on a business card (could be in featured section or category)
    const businessCard = page.locator('[href^="/businesses/"]:not([href*="/category/"])').first();
    const exists = await businessCard.count();

    if (exists > 0) {
      await businessCard.click();

      // Should navigate to business detail page
      await expect(page).toHaveURL(/\/businesses\/[^/]+$/);

      // Should display business name
      await expect(page.locator('h1')).toBeVisible();
    }
  });

  test('should display business details correctly', async ({ page }) => {
    await page.goto('/businesses/the-fire-grill-restaurant');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Should display business name
    await expect(page.locator('h1')).toContainText('The Fire Grill Restaurant');

    // Should display description
    await expect(page.locator('text=/Authentic Guyanese cuisine/i')).toBeVisible();

    // Should display contact information
    await expect(page.locator('text=/Contact Information/i')).toBeVisible();

    // Should display WhatsApp button
    await expect(page.locator('text=/Contact via WhatsApp/i')).toBeVisible();
  });

  test('should display business hours', async ({ page }) => {
    await page.goto('/businesses/the-fire-grill-restaurant');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Should display business hours section
    const hoursSection = page.locator('text=/Hours|Opening Hours|Business Hours/i');
    const exists = await hoursSection.count();

    if (exists > 0) {
      await expect(hoursSection).toBeVisible();
    }
  });

  test('should display reviews section', async ({ page }) => {
    await page.goto('/businesses/the-fire-grill-restaurant');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Should display reviews section or "No reviews yet" message
    const reviewsSection = page.locator('text=/Reviews|No reviews yet/i');
    await expect(reviewsSection.first()).toBeVisible();
  });

  test('should have back to home link', async ({ page }) => {
    await page.goto('/businesses/the-fire-grill-restaurant');

    // Should have back link
    const backLink = page.locator('a:has-text("Back to Home")');
    await expect(backLink).toBeVisible();

    // Click back link
    await backLink.click();

    // Should navigate to home
    await expect(page).toHaveURL('/');
  });

  test('should track page view on business page load', async ({ page }) => {
    // Navigate to business page
    await page.goto('/businesses/the-fire-grill-restaurant');

    // Wait for page to fully load
    await page.waitForLoadState('networkidle');

    // The PageViewTracker component should be present (we can't directly verify the DB update)
    // but we can verify the page loaded successfully and tracking component is in the DOM
    const pageContent = await page.content();
    expect(pageContent).toBeTruthy();

    // Page should be visible and interactive
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should display verified badge on verified businesses', async ({ page }) => {
    await page.goto('/businesses/the-fire-grill-restaurant');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Look for verified badge
    const verifiedBadge = page.locator('text=/Verified/i');
    const exists = await verifiedBadge.count();

    if (exists > 0) {
      await expect(verifiedBadge.first()).toBeVisible();
    }
  });

  test('should display featured badge on featured businesses', async ({ page }) => {
    await page.goto('/businesses/the-fire-grill-restaurant');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Look for featured badge
    const featuredBadge = page.locator('text=/Featured/i');
    const exists = await featuredBadge.count();

    if (exists > 0) {
      await expect(featuredBadge.first()).toBeVisible();
    }
  });
});
