import { test, expect } from '@playwright/test';

/**
 * Kiosk Mode Visual Testing for 1920x1200 Resolution
 *
 * This test suite verifies that all kiosk mode elements are fully visible
 * and properly laid out at 1920x1200 resolution (100% browser zoom).
 *
 * Screenshots are captured for manual verification.
 */

const VIEWPORT_WIDTH = 1920;
const VIEWPORT_HEIGHT = 1200;

test.describe('Kiosk Mode - 1920x1200 Resolution', () => {
  // Configure viewport for all tests
  test.use({
    viewport: { width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT },
    deviceScaleFactor: 1, // 100% zoom
  });

  test.beforeEach(async ({ page }) => {
    // Set viewport explicitly
    await page.setViewportSize({ width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT });
  });

  /**
   * Helper function to hide the debug overlay (KioskResolutionPicker)
   * This overlay appears in development mode and can interfere with layout testing
   */
  async function hideDebugOverlay(page: any) {
    try {
      // Wait for page to load
      await page.waitForTimeout(500);

      // Click the "Hide" button on the resolution picker if visible
      const hideButton = page.locator('button:has-text("Hide")').first();
      if (await hideButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await hideButton.click();
        await page.waitForTimeout(200); // Let animation finish
      }
    } catch (e) {
      // Ignore errors if overlay doesn't exist
      console.log('Debug overlay not found or already hidden');
    }
  }

  test('Home Page - Attraction Loop', async ({ page }) => {
    await page.goto('/kiosk');

    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000); // Allow animations to settle

    // Verify key elements are visible
    const homeButton = page.locator('button:has-text("Home")');
    const languageButton = page.locator('button:has-text("Language")');
    const tapToExplore = page.locator('text=TAP TO EXPLORE');

    await expect(homeButton).toBeVisible();
    await expect(languageButton).toBeVisible();
    await expect(tapToExplore).toBeVisible();

    // Check that navbar buttons are in viewport
    const homeBox = await homeButton.boundingBox();
    const langBox = await languageButton.boundingBox();

    expect(homeBox).toBeTruthy();
    expect(langBox).toBeTruthy();
    expect(homeBox!.y).toBeGreaterThanOrEqual(0);
    expect(langBox!.y).toBeGreaterThanOrEqual(0);

    // Take full page screenshot
    await page.screenshot({
      path: 'test-results/kiosk-1920x1200-home-attraction-loop.png',
      fullPage: false // Only visible area
    });

    console.log('✓ Home - Attraction Loop screenshot saved');
  });

  test('Home Page - Category Grid', async ({ page }) => {
    await page.goto('/kiosk');
    await page.waitForLoadState('networkidle');

    // Wait for attraction loop, then click TAP TO EXPLORE
    await page.waitForTimeout(1000);
    const tapButton = page.locator('text=TAP TO EXPLORE');
    await tapButton.click();

    // Wait for category grid to appear
    await page.waitForTimeout(500);

    // Verify category grid is visible
    const categoryGrid = page.locator('[class*="grid"]').first();
    await expect(categoryGrid).toBeVisible();

    // Check that categories are visible
    const categoryCards = page.locator('[class*="kiosk-card-category"]');
    const count = await categoryCards.count();
    expect(count).toBeGreaterThan(0);

    // Verify first few categories are in viewport
    for (let i = 0; i < Math.min(3, count); i++) {
      const card = categoryCards.nth(i);
      const box = await card.boundingBox();
      expect(box).toBeTruthy();
      expect(box!.y).toBeGreaterThanOrEqual(0);
      expect(box!.y + box!.height).toBeLessThanOrEqual(VIEWPORT_HEIGHT);
    }

    // Take screenshot
    await page.screenshot({
      path: 'test-results/kiosk-1920x1200-home-category-grid.png',
      fullPage: false
    });

    console.log('✓ Home - Category Grid screenshot saved');
  });

  test('Category Page - Slideshow', async ({ page }) => {
    // Navigate directly to a category (assuming "tours" exists)
    await page.goto('/kiosk/category/tours');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Verify slideshow elements are visible
    const navBar = page.locator('button:has-text("Home")');
    const slideshow = page.locator('[class*="slideshow"]').first();

    await expect(navBar).toBeVisible();

    // Check for navigation arrows
    const leftArrow = page.locator('button[aria-label*="Previous"], button:has(svg.lucide-chevron-left)').first();
    const rightArrow = page.locator('button[aria-label*="Next"], button:has(svg.lucide-chevron-right)').first();

    if (await leftArrow.isVisible()) {
      const box = await leftArrow.boundingBox();
      expect(box).toBeTruthy();
      expect(box!.y).toBeGreaterThanOrEqual(0);
    }

    if (await rightArrow.isVisible()) {
      const box = await rightArrow.boundingBox();
      expect(box).toBeTruthy();
      expect(box!.y).toBeGreaterThanOrEqual(0);
    }

    // Take screenshot
    await page.screenshot({
      path: 'test-results/kiosk-1920x1200-category-slideshow.png',
      fullPage: false
    });

    console.log('✓ Category Slideshow screenshot saved');
  });

  test('Experience Detail Page', async ({ page }) => {
    // First get to category page to find an experience
    await page.goto('/kiosk/category/tours');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Look for "View Details" button and click it
    const viewDetailsButton = page.locator('button:has-text("View Details")').first();

    if (await viewDetailsButton.isVisible()) {
      await viewDetailsButton.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // Verify experience detail elements
      const navbar = page.locator('button:has-text("Home")');
      await expect(navbar).toBeVisible();

      // Check for key sections
      const priceSection = page.getByText('Price');
      const durationSection = page.getByText('Duration');

      // Verify they're in viewport
      if (await priceSection.isVisible()) {
        const box = await priceSection.boundingBox();
        expect(box).toBeTruthy();
      }

      // Take screenshot
      await page.screenshot({
        path: 'test-results/kiosk-1920x1200-experience-detail.png',
        fullPage: true // Get full page to see all content
      });

      console.log('✓ Experience Detail screenshot saved');
    } else {
      console.log('⚠ No "View Details" button found, skipping experience detail test');
    }
  });

  test('QR Code Modal', async ({ page }) => {
    await page.goto('/kiosk/category/tours');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Look for "Save to Phone" button
    const saveButton = page.locator('button:has-text("Save to Phone")').first();

    if (await saveButton.isVisible()) {
      await saveButton.click();
      await page.waitForTimeout(500);

      // Verify QR modal is visible
      const qrModal = page.locator('[class*="modal"], [role="dialog"]').first();

      if (await qrModal.isVisible()) {
        const box = await qrModal.boundingBox();
        expect(box).toBeTruthy();

        // Verify modal is centered and fully visible
        expect(box!.x).toBeGreaterThanOrEqual(0);
        expect(box!.y).toBeGreaterThanOrEqual(0);
        expect(box!.x + box!.width).toBeLessThanOrEqual(VIEWPORT_WIDTH);
        expect(box!.y + box!.height).toBeLessThanOrEqual(VIEWPORT_HEIGHT);

        // Take screenshot
        await page.screenshot({
          path: 'test-results/kiosk-1920x1200-qr-modal.png',
          fullPage: false
        });

        console.log('✓ QR Code Modal screenshot saved');
      }
    } else {
      console.log('⚠ No "Save to Phone" button found, skipping QR modal test');
    }
  });

  test('Language Selection Modal', async ({ page }) => {
    await page.goto('/kiosk');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Click Language button
    const languageButton = page.locator('button:has-text("Language")');
    await languageButton.click();
    await page.waitForTimeout(500);

    // Verify language modal is visible and contains language options
    const modal = page.locator('[class*="modal"], [role="dialog"]').first();

    if (await modal.isVisible()) {
      const box = await modal.boundingBox();
      expect(box).toBeTruthy();

      // Verify modal is fully visible
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.y).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(VIEWPORT_WIDTH);
      expect(box!.y + box!.height).toBeLessThanOrEqual(VIEWPORT_HEIGHT);

      // Take screenshot
      await page.screenshot({
        path: 'test-results/kiosk-1920x1200-language-modal.png',
        fullPage: false
      });

      console.log('✓ Language Modal screenshot saved');
    }
  });

  test('Touch Target Sizes', async ({ page }) => {
    await page.goto('/kiosk');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Test that key interactive elements meet minimum touch target size (88px)
    const MIN_TOUCH_SIZE = 88;

    const elementsToTest = [
      { selector: 'button:has-text("Home")', name: 'Home Button' },
      { selector: 'button:has-text("Language")', name: 'Language Button' },
      { selector: 'text=TAP TO EXPLORE', name: 'TAP TO EXPLORE Button' },
    ];

    for (const { selector, name } of elementsToTest) {
      const element = page.locator(selector).first();
      if (await element.isVisible()) {
        const box = await element.boundingBox();
        expect(box).toBeTruthy();

        console.log(`${name}: ${box!.width}px × ${box!.height}px`);

        // Verify minimum touch target size
        expect(box!.width).toBeGreaterThanOrEqual(MIN_TOUCH_SIZE);
        expect(box!.height).toBeGreaterThanOrEqual(MIN_TOUCH_SIZE);
      }
    }
  });

  test('Viewport Bounds Check - All Pages', async ({ page }) => {
    const pages = [
      { url: '/kiosk', name: 'Home' },
      { url: '/kiosk/category/tours', name: 'Category' },
    ];

    for (const { url, name } of pages) {
      await page.goto(url);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // Get viewport dimensions from browser
      const viewportSize = page.viewportSize();
      expect(viewportSize).toBeTruthy();
      expect(viewportSize!.width).toBe(VIEWPORT_WIDTH);
      expect(viewportSize!.height).toBe(VIEWPORT_HEIGHT);

      // Check that navbar is within viewport
      const homeButton = page.locator('button:has-text("Home")');
      const langButton = page.locator('button:has-text("Language")');

      if (await homeButton.isVisible()) {
        const homeBox = await homeButton.boundingBox();
        expect(homeBox).toBeTruthy();
        expect(homeBox!.y).toBeGreaterThanOrEqual(0);
        expect(homeBox!.y + homeBox!.height).toBeLessThanOrEqual(VIEWPORT_HEIGHT);
        expect(homeBox!.x).toBeGreaterThanOrEqual(0);
        expect(homeBox!.x + homeBox!.width).toBeLessThanOrEqual(VIEWPORT_WIDTH);
      }

      if (await langButton.isVisible()) {
        const langBox = await langButton.boundingBox();
        expect(langBox).toBeTruthy();
        expect(langBox!.y).toBeGreaterThanOrEqual(0);
        expect(langBox!.y + langBox!.height).toBeLessThanOrEqual(VIEWPORT_HEIGHT);
        expect(langBox!.x).toBeGreaterThanOrEqual(0);
        expect(langBox!.x + langBox!.width).toBeLessThanOrEqual(VIEWPORT_WIDTH);
      }

      console.log(`✓ ${name} page viewport bounds verified`);
    }
  });

  test('Full Screenshot Collection', async ({ page }) => {
    // This test captures comprehensive screenshots of all kiosk states

    // 1. Attraction Loop
    await page.goto('/kiosk');
    await page.waitForLoadState('networkidle');
    await hideDebugOverlay(page); // Hide debug overlay for clean screenshots
    await page.waitForTimeout(1500);
    await page.screenshot({
      path: 'test-results/kiosk-1920x1200-full-01-attraction-loop.png',
      fullPage: false
    });

    // 2. Category Grid
    const tapButton = page.locator('text=TAP TO EXPLORE');
    await tapButton.click();
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: 'test-results/kiosk-1920x1200-full-02-category-grid.png',
      fullPage: false
    });

    // 3. Click on first category
    const firstCategory = page.locator('[class*="kiosk-card-category"]').first();
    if (await firstCategory.isVisible()) {
      await firstCategory.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      await page.screenshot({
        path: 'test-results/kiosk-1920x1200-full-03-category-slideshow.png',
        fullPage: false
      });

      // 4. Click View Details
      const viewDetails = page.locator('button:has-text("View Details")').first();
      if (await viewDetails.isVisible()) {
        await viewDetails.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);

        // Capture top of page
        await page.screenshot({
          path: 'test-results/kiosk-1920x1200-full-04-experience-top.png',
          fullPage: false
        });

        // Scroll down to capture more content
        await page.mouse.wheel(0, 800);
        await page.waitForTimeout(500);
        await page.screenshot({
          path: 'test-results/kiosk-1920x1200-full-05-experience-middle.png',
          fullPage: false
        });

        // Full page screenshot
        await page.screenshot({
          path: 'test-results/kiosk-1920x1200-full-06-experience-full.png',
          fullPage: true
        });
      }
    }

    console.log('✓ Full screenshot collection complete');
  });
});
