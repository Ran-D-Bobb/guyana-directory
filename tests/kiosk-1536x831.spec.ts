import { test, expect } from '@playwright/test';

/**
 * Kiosk Mode Visual Testing for 1536x831 Resolution
 *
 * This is the ACTUAL browser viewport size when running at 1920x1200 physical resolution
 * with 125% Windows display scaling.
 *
 * Screenshots are captured for manual verification.
 */

const VIEWPORT_WIDTH = 1536;
const VIEWPORT_HEIGHT = 831;

test.describe('Kiosk Mode - 1536x831 Resolution (Actual Viewport)', () => {
  // Configure viewport for all tests
  test.use({
    viewport: { width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT },
    deviceScaleFactor: 1, // 100% browser zoom
  });

  test.beforeEach(async ({ page }) => {
    // Set viewport explicitly
    await page.setViewportSize({ width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT });
  });

  /**
   * Helper function to hide the debug overlay (KioskResolutionPicker)
   */
  async function hideDebugOverlay(page: any) {
    try {
      await page.waitForTimeout(500);
      const hideButton = page.locator('button:has-text("Hide")').first();
      if (await hideButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await hideButton.click();
        await page.waitForTimeout(200);
      }
    } catch (e) {
      console.log('Debug overlay not found or already hidden');
    }
  }

  test('Full Screenshot Collection - Actual Viewport', async ({ page }) => {
    // 1. Attraction Loop
    await page.goto('/kiosk');
    await page.waitForLoadState('networkidle');
    await hideDebugOverlay(page);
    await page.waitForTimeout(1500);
    await page.screenshot({
      path: 'test-results/kiosk-1536x831-01-attraction-loop.png',
      fullPage: false
    });

    // 2. Category Grid
    const tapButton = page.locator('text=TAP TO EXPLORE');
    await tapButton.click();
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: 'test-results/kiosk-1536x831-02-category-grid.png',
      fullPage: false
    });

    // 3. Click on first category
    const firstCategory = page.locator('[class*="kiosk-card"]').first();
    if (await firstCategory.isVisible()) {
      await firstCategory.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      await page.screenshot({
        path: 'test-results/kiosk-1536x831-03-category-slideshow.png',
        fullPage: false
      });
    }

    console.log('✓ Full screenshot collection complete for 1536x831');
  });

  test('Verify All Elements Within Viewport', async ({ page }) => {
    await page.goto('/kiosk');
    await page.waitForLoadState('networkidle');
    await hideDebugOverlay(page);
    await page.waitForTimeout(1000);

    // Click to category grid
    const tapButton = page.locator('text=TAP TO EXPLORE');
    await tapButton.click();
    await page.waitForTimeout(1000);

    // Verify Home and Language buttons are within viewport
    const homeButton = page.locator('button:has-text("Home")').first();
    const langButton = page.locator('button:has-text("Language")').first();

    if (await homeButton.isVisible()) {
      const homeBox = await homeButton.boundingBox();
      expect(homeBox).toBeTruthy();
      expect(homeBox!.y).toBeGreaterThanOrEqual(0);
      expect(homeBox!.y + homeBox!.height).toBeLessThanOrEqual(VIEWPORT_HEIGHT);
      console.log(`Home button: ${homeBox!.width}px × ${homeBox!.height}px at (${homeBox!.x}, ${homeBox!.y})`);
    }

    if (await langButton.isVisible()) {
      const langBox = await langButton.boundingBox();
      expect(langBox).toBeTruthy();
      expect(langBox!.y).toBeGreaterThanOrEqual(0);
      expect(langBox!.y + langBox!.height).toBeLessThanOrEqual(VIEWPORT_HEIGHT);
      console.log(`Language button: ${langBox!.width}px × ${langBox!.height}px at (${langBox!.x}, ${langBox!.y})`);
    }

    // Verify header is visible
    const header = page.locator('text=Choose Your Adventure');
    await expect(header).toBeVisible();
    const headerBox = await header.boundingBox();
    expect(headerBox).toBeTruthy();
    expect(headerBox!.y).toBeGreaterThanOrEqual(0);
    console.log(`Header: ${headerBox!.width}px × ${headerBox!.height}px at (${headerBox!.x}, ${headerBox!.y})`);

    // Verify at least first row of cards is fully visible
    const cards = page.locator('div').filter({ hasText: 'Experience' });
    const cardCount = await cards.count();
    console.log(`Found ${cardCount} category cards`);

    // Check first 3 cards (should be fully visible in first row)
    for (let i = 0; i < Math.min(3, cardCount); i++) {
      const card = cards.nth(i);
      if (await card.isVisible()) {
        const box = await card.boundingBox();
        if (box) {
          console.log(`Card ${i + 1}: ${box.width}px × ${box.height}px at (${box.x}, ${box.y})`);
          expect(box.y).toBeGreaterThanOrEqual(0);
          // First row should be fully visible
          if (i < 3) {
            expect(box.y + box.height).toBeLessThanOrEqual(VIEWPORT_HEIGHT);
          }
        }
      }
    }

    console.log('✓ All critical elements verified within viewport bounds');
  });

  test('Check Viewport Dimensions', async ({ page }) => {
    await page.goto('/kiosk');
    await page.waitForLoadState('networkidle');

    const viewportSize = page.viewportSize();
    expect(viewportSize).toBeTruthy();
    expect(viewportSize!.width).toBe(VIEWPORT_WIDTH);
    expect(viewportSize!.height).toBe(VIEWPORT_HEIGHT);

    console.log(`✓ Viewport confirmed: ${viewportSize!.width}×${viewportSize!.height}`);
  });
});
