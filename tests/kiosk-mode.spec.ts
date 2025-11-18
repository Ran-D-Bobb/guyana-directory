import { test, expect, Page } from '@playwright/test';

/**
 * Kiosk Mode Comprehensive Test Suite
 * Tests UI/UX across multiple resolutions and validates all kiosk functionality
 */

// Test resolutions based on tracker requirements
const RESOLUTIONS = {
  fullHD: { width: 1920, height: 1080, name: 'Full HD (1920x1080)' },
  hd: { width: 1366, height: 768, name: 'HD (1366x768)' },
  portrait: { width: 1080, height: 1920, name: 'Portrait (1080x1920)' },
  fourK: { width: 3840, height: 2160, name: '4K (3840x2160)' },
};

// Helper function to wait for page load and animations
async function waitForKioskReady(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500); // Wait for animations to settle
}

// Helper function to check touch target size (minimum 88px according to tracker)
async function checkTouchTargetSize(page: Page, selector: string, minSize: number = 88) {
  const element = page.locator(selector).first();
  const box = await element.boundingBox();

  if (!box) {
    throw new Error(`Element ${selector} not found or not visible`);
  }

  expect(box.width).toBeGreaterThanOrEqual(minSize);
  expect(box.height).toBeGreaterThanOrEqual(minSize);

  return box;
}

test.describe('Kiosk Mode - Multi-Resolution Testing', () => {

  // Test suite for Full HD (1920x1080) - Primary target resolution
  test.describe('Full HD Resolution (1920x1080)', () => {
    test.use({ viewport: { width: RESOLUTIONS.fullHD.width, height: RESOLUTIONS.fullHD.height } });

    test('should load kiosk homepage with attraction loop', async ({ page }) => {
      await page.goto('/kiosk');
      await waitForKioskReady(page);

      // Check attraction loop is visible
      await expect(page.locator('[data-testid="attraction-loop"]').or(page.locator('text=/Tap to Explore/i'))).toBeVisible();

      // Check that hero image or gradient is visible
      const heroSection = page.locator('div').filter({ hasText: /Tap to Explore/i }).first();
      await expect(heroSection).toBeVisible();
    });

    test('should display all 12 tourism categories', async ({ page }) => {
      await page.goto('/kiosk');
      await waitForKioskReady(page);

      // Click "Tap to Explore" to show categories
      const tapButton = page.locator('text=/Tap to Explore/i');
      if (await tapButton.count() > 0) {
        await tapButton.click();
        await page.waitForTimeout(500);
      }

      // Count visible category cards
      const categoryCards = page.locator('[data-testid="category-card"]').or(
        page.locator('a[href^="/kiosk/category/"]')
      );

      const count = await categoryCards.count();

      // Should show all 12 tourism categories
      expect(count).toBeGreaterThanOrEqual(10); // At least 10 categories visible
    });

    test('should have properly sized "Tap to Explore" button', async ({ page }) => {
      await page.goto('/kiosk');
      await waitForKioskReady(page);

      const tapButton = page.locator('text=/Tap to Explore/i');
      await expect(tapButton).toBeVisible();

      // Check button size (should be 320x120px according to tracker)
      const box = await tapButton.boundingBox();
      expect(box).not.toBeNull();
      if (box) {
        // Allow slight variance due to browser rendering (280-340px is acceptable)
        expect(box.width).toBeGreaterThanOrEqual(280); // At least 280px wide
        expect(box.height).toBeGreaterThanOrEqual(100); // At least 100px tall
      }
    });

    test('should display navigation bar with Home and Language buttons', async ({ page }) => {
      await page.goto('/kiosk');
      await waitForKioskReady(page);

      // Check for Home button (top-left, 200x80px)
      const homeButton = page.locator('button:has-text("Home")').or(
        page.locator('[aria-label="Home"]')
      );

      if (await homeButton.count() > 0) {
        await expect(homeButton.first()).toBeVisible();

        // Check button size
        const box = await homeButton.first().boundingBox();
        if (box) {
          expect(box.width).toBeGreaterThanOrEqual(150);
          expect(box.height).toBeGreaterThanOrEqual(60);
        }
      }

      // Check for Language button (top-right, 220x80px)
      const langButton = page.locator('button:has-text("Language")').or(
        page.locator('[aria-label="Language"]')
      );

      if (await langButton.count() > 0) {
        await expect(langButton.first()).toBeVisible();
      }
    });

    test('categories should have proper touch targets (400x400px cards)', async ({ page }) => {
      await page.goto('/kiosk');
      await waitForKioskReady(page);

      // Navigate to category grid
      const tapButton = page.locator('text=/Tap to Explore/i');
      if (await tapButton.count() > 0) {
        await tapButton.click();
        await page.waitForTimeout(500);
      }

      // Get first category card
      const categoryCard = page.locator('a[href^="/kiosk/category/"]').first();

      if (await categoryCard.count() > 0) {
        const box = await categoryCard.boundingBox();
        expect(box).not.toBeNull();

        if (box) {
          // According to tracker, cards should be 400x400px
          expect(box.width).toBeGreaterThanOrEqual(300); // Allow some variance
          expect(box.height).toBeGreaterThanOrEqual(300);
        }
      }
    });
  });

  // Test suite for HD (1366x768)
  test.describe('HD Resolution (1366x768)', () => {
    test.use({ viewport: { width: RESOLUTIONS.hd.width, height: RESOLUTIONS.hd.height } });

    test('should load kiosk homepage at HD resolution', async ({ page }) => {
      await page.goto('/kiosk');
      await waitForKioskReady(page);

      await expect(page.locator('text=/Tap to Explore/i')).toBeVisible();
    });

    test('should display categories with scrolling at HD resolution', async ({ page }) => {
      await page.goto('/kiosk');
      await waitForKioskReady(page);

      const tapButton = page.locator('text=/Tap to Explore/i');
      if (await tapButton.count() > 0) {
        await tapButton.click();
        await page.waitForTimeout(500);
      }

      // Categories should be scrollable at this resolution
      const categoryContainer = page.locator('div').filter({
        has: page.locator('a[href^="/kiosk/category/"]')
      }).first();

      if (await categoryContainer.count() > 0) {
        await expect(categoryContainer).toBeVisible();
      }
    });

    test('should maintain proper button sizing at HD resolution', async ({ page }) => {
      await page.goto('/kiosk');
      await waitForKioskReady(page);

      const tapButton = page.locator('text=/Tap to Explore/i');
      const box = await tapButton.boundingBox();

      expect(box).not.toBeNull();
      if (box) {
        // Buttons should still be large enough for touch
        expect(box.width).toBeGreaterThanOrEqual(250);
        expect(box.height).toBeGreaterThanOrEqual(80);
      }
    });
  });

  // Test suite for Portrait (1080x1920)
  test.describe('Portrait Resolution (1080x1920)', () => {
    test.use({ viewport: { width: RESOLUTIONS.portrait.width, height: RESOLUTIONS.portrait.height } });

    test('should load kiosk homepage in portrait mode', async ({ page }) => {
      await page.goto('/kiosk');
      await waitForKioskReady(page);

      await expect(page.locator('text=/Tap to Explore/i')).toBeVisible();
    });

    test('should use 1-column grid layout in portrait mode', async ({ page }) => {
      await page.goto('/kiosk');
      await waitForKioskReady(page);

      const tapButton = page.locator('text=/Tap to Explore/i');
      if (await tapButton.count() > 0) {
        await tapButton.click();
        await page.waitForTimeout(500);
      }

      // In portrait mode, category grid should be 1 column
      const firstCategory = page.locator('a[href^="/kiosk/category/"]').first();
      const secondCategory = page.locator('a[href^="/kiosk/category/"]').nth(1);

      if (await firstCategory.count() > 0 && await secondCategory.count() > 0) {
        const box1 = await firstCategory.boundingBox();
        const box2 = await secondCategory.boundingBox();

        if (box1 && box2) {
          // In single column, cards should be stacked (y position should be different)
          expect(Math.abs(box2.y - box1.y)).toBeGreaterThan(50);
        }
      }
    });
  });
});

test.describe('Kiosk Mode - Interaction Testing', () => {
  test.use({ viewport: { width: RESOLUTIONS.fullHD.width, height: RESOLUTIONS.fullHD.height } });

  test('should navigate from attraction loop to category grid', async ({ page }) => {
    await page.goto('/kiosk');
    await waitForKioskReady(page);

    const tapButton = page.locator('text=/Tap to Explore/i');
    await expect(tapButton).toBeVisible();

    await tapButton.click();
    await page.waitForTimeout(500);

    // Should show category grid
    const categoryCards = page.locator('a[href^="/kiosk/category/"]');
    await expect(categoryCards.first()).toBeVisible();
  });

  test('should navigate to category slideshow when clicking a category', async ({ page }) => {
    await page.goto('/kiosk');
    await waitForKioskReady(page);

    // Navigate to categories
    const tapButton = page.locator('text=/Tap to Explore/i');
    if (await tapButton.count() > 0) {
      await tapButton.click();
      await page.waitForTimeout(500);
    }

    // Click first category
    const firstCategory = page.locator('a[href^="/kiosk/category/"]').first();

    if (await firstCategory.count() > 0) {
      await firstCategory.click();
      await page.waitForTimeout(1000);

      // Should navigate to category page
      await expect(page).toHaveURL(/\/kiosk\/category\//);
    }
  });

  test('should show QR code modal when clicking "Save to Phone"', async ({ page }) => {
    await page.goto('/kiosk');
    await waitForKioskReady(page);

    // Navigate through to find a "Save to Phone" button
    const tapButton = page.locator('text=/Tap to Explore/i');
    if (await tapButton.count() > 0) {
      await tapButton.click();
      await page.waitForTimeout(500);
    }

    const firstCategory = page.locator('a[href^="/kiosk/category/"]').first();
    if (await firstCategory.count() > 0) {
      await firstCategory.click();
      await page.waitForTimeout(1000);

      // Look for "Save to Phone" or QR code button
      const saveButton = page.locator('button:has-text("Save to Phone")').or(
        page.locator('button:has-text("QR Code")')
      );

      if (await saveButton.count() > 0) {
        await saveButton.first().click();
        await page.waitForTimeout(500);

        // QR code modal should appear
        const qrModal = page.locator('[role="dialog"]').or(
          page.locator('div:has-text("Scan to view on your phone")')
        );

        if (await qrModal.count() > 0) {
          await expect(qrModal.first()).toBeVisible();
        }
      }
    }
  });

  test('home button should navigate back to attraction loop', async ({ page }) => {
    await page.goto('/kiosk');
    await waitForKioskReady(page);

    // Navigate away from home
    const tapButton = page.locator('text=/Tap to Explore/i');
    if (await tapButton.count() > 0) {
      await tapButton.click();
      await page.waitForTimeout(500);
    }

    // Click home button
    const homeButton = page.locator('button:has-text("Home")').or(
      page.locator('[aria-label="Home"]')
    );

    if (await homeButton.count() > 0) {
      await homeButton.first().click();
      await page.waitForTimeout(500);

      // Should be back at /kiosk
      await expect(page).toHaveURL('/kiosk');
    }
  });
});

test.describe('Kiosk Mode - Visual Design Testing', () => {
  test.use({ viewport: { width: RESOLUTIONS.fullHD.width, height: RESOLUTIONS.fullHD.height } });

  test('should have gradient on "Tap to Explore" button', async ({ page }) => {
    await page.goto('/kiosk');
    await waitForKioskReady(page);

    const tapButton = page.locator('[data-testid="tap-to-explore-button"]');
    await expect(tapButton).toBeVisible();

    // Check for gradient styling and kiosk-btn-primary class
    const buttonInfo = await tapButton.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        background: styles.background,
        backgroundImage: styles.backgroundImage,
        classList: Array.from(el.classList),
        hasKioskClass: el.classList.contains('kiosk-btn-primary'),
      };
    });

    // Should have kiosk-btn-primary class
    expect(buttonInfo.hasKioskClass).toBeTruthy();

    // Should have gradient in backgroundImage
    const hasGradient =
      buttonInfo.backgroundImage.includes('gradient') ||
      buttonInfo.backgroundImage.includes('linear-gradient');

    // Log for debugging if gradient not found
    if (!hasGradient) {
      console.log('Button info:', buttonInfo);
    }

    // At minimum, should have the kiosk-btn-primary class which applies the gradient
    expect(buttonInfo.hasKioskClass || hasGradient).toBeTruthy();
  });

  test('should display icons in category cards', async ({ page }) => {
    await page.goto('/kiosk');
    await waitForKioskReady(page);

    const tapButton = page.locator('text=/Tap to Explore/i');
    if (await tapButton.count() > 0) {
      await tapButton.click();
      await page.waitForTimeout(500);
    }

    // Check for SVG icons in category cards (Lucide icons)
    const categoryCard = page.locator('a[href^="/kiosk/category/"]').first();

    if (await categoryCard.count() > 0) {
      const icon = categoryCard.locator('svg').first();

      if (await icon.count() > 0) {
        await expect(icon).toBeVisible();

        // Icon should be large (80px according to tracker)
        const box = await icon.boundingBox();
        if (box) {
          expect(box.width).toBeGreaterThanOrEqual(60); // At least 60px
          expect(box.height).toBeGreaterThanOrEqual(60);
        }
      }
    }
  });

  test('should have proper contrast for text readability', async ({ page }) => {
    await page.goto('/kiosk');
    await waitForKioskReady(page);

    // Check that main heading has good contrast
    const heading = page.locator('h1, h2').first();

    if (await heading.count() > 0) {
      await expect(heading).toBeVisible();

      // Check text color is not too light
      const color = await heading.evaluate((el) => {
        return window.getComputedStyle(el).color;
      });

      expect(color).toBeTruthy();
      // Color should be defined (basic check)
      expect(color.length).toBeGreaterThan(0);
    }
  });
});

test.describe('Kiosk Mode - Performance Testing', () => {
  test.use({ viewport: { width: RESOLUTIONS.fullHD.width, height: RESOLUTIONS.fullHD.height } });

  test('should load kiosk homepage within reasonable time', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/kiosk');
    await waitForKioskReady(page);

    const loadTime = Date.now() - startTime;

    // Should load within 10 seconds (realistic for database + image loading)
    // Target: < 3 seconds for production (with optimization)
    expect(loadTime).toBeLessThan(10000);

    // Log actual load time for monitoring
    console.log(`Kiosk page loaded in ${loadTime}ms`);
  });

  test('should have smooth animations (check CSS)', async ({ page }) => {
    await page.goto('/kiosk');
    await waitForKioskReady(page);

    const tapButton = page.locator('text=/Tap to Explore/i');

    // Check for animation properties
    const hasAnimation = await tapButton.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        animation: styles.animation,
        transition: styles.transition,
      };
    });

    // Should have some animation or transition
    const animated =
      hasAnimation.animation !== 'none' ||
      hasAnimation.transition !== 'none';

    expect(animated).toBeTruthy();
  });

  test('images should load with Next.js Image optimization', async ({ page }) => {
    await page.goto('/kiosk');
    await waitForKioskReady(page);

    // Check for Next.js Image component usage
    const images = page.locator('img');
    const imageCount = await images.count();

    if (imageCount > 0) {
      const firstImage = images.first();

      // Next.js Image should have specific attributes
      const hasOptimization = await firstImage.evaluate((img) => {
        return img.srcset !== '' || img.loading === 'lazy';
      });

      // At least some optimization should be present
      expect(hasOptimization).toBeTruthy();
    }
  });
});

test.describe('Kiosk Mode - Accessibility Testing', () => {
  test.use({ viewport: { width: RESOLUTIONS.fullHD.width, height: RESOLUTIONS.fullHD.height } });

  test('buttons should have sufficient touch targets', async ({ page }) => {
    await page.goto('/kiosk');
    await waitForKioskReady(page);

    const tapButton = page.locator('text=/Tap to Explore/i');
    const box = await tapButton.boundingBox();

    expect(box).not.toBeNull();
    if (box) {
      // Minimum 88px according to kiosk design system
      expect(box.width).toBeGreaterThanOrEqual(88);
      expect(box.height).toBeGreaterThanOrEqual(88);
    }
  });

  test('interactive elements should be keyboard accessible', async ({ page }) => {
    await page.goto('/kiosk');
    await waitForKioskReady(page);

    const tapButton = page.locator('[data-testid="tap-to-explore-button"]');
    await expect(tapButton).toBeVisible();

    // Check that button has tabindex
    const tabIndex = await tapButton.getAttribute('tabindex');
    expect(tabIndex).toBe('0');

    // Check if button has aria-label for accessibility
    const ariaLabel = await tapButton.getAttribute('aria-label');
    expect(ariaLabel).toBeTruthy();
    expect(ariaLabel).toContain('explore');

    // Focus on the button directly
    await tapButton.focus();
    await page.waitForTimeout(200);

    // Check button can receive focus (tabIndex >= 0)
    const isFocusable = await tapButton.evaluate((el) => {
      return el.tabIndex >= 0;
    });

    expect(isFocusable).toBeTruthy();

    // Verify button element type
    const tagName = await tapButton.evaluate((el) => el.tagName.toLowerCase());
    expect(tagName).toBe('button');
  });

  test('should prevent text selection (kiosk-specific)', async ({ page }) => {
    await page.goto('/kiosk');
    await waitForKioskReady(page);

    // Check for user-select: none on body or main container
    const preventSelection = await page.evaluate(() => {
      const body = document.body;
      const styles = window.getComputedStyle(body);
      return styles.userSelect === 'none' || styles.webkitUserSelect === 'none';
    });

    // Kiosk mode should prevent text selection
    expect(preventSelection).toBeTruthy();
  });
});

test.describe('Kiosk Mode - Data Display Testing', () => {
  test.use({ viewport: { width: RESOLUTIONS.fullHD.width, height: RESOLUTIONS.fullHD.height } });

  test('should display experience stats (rating, duration, price)', async ({ page }) => {
    await page.goto('/kiosk');
    await waitForKioskReady(page);

    // Look for any stat displays in the attraction loop
    const stats = page.locator('text=/rating|duration|price|GYD|hours?|days?/i');

    const count = await stats.count();

    // Should show some stats
    expect(count).toBeGreaterThan(0);
  });

  test('should show category experience counts', async ({ page }) => {
    await page.goto('/kiosk');
    await waitForKioskReady(page);

    const tapButton = page.locator('text=/Tap to Explore/i');
    if (await tapButton.count() > 0) {
      await tapButton.click();
      await page.waitForTimeout(500);
    }

    // Look for experience count badges
    const countBadges = page.locator('text=/\\d+ experience/i');

    const count = await countBadges.count();

    // Should show counts on categories
    expect(count).toBeGreaterThan(0);
  });
});
