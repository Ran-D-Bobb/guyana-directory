import { test, expect } from '@playwright/test';

test.describe('WhatsApp Button Functionality', () => {
  test('should display WhatsApp button on business detail page', async ({ page }) => {
    // Navigate to a business detail page
    await page.goto('/businesses/the-fire-grill-restaurant');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Should display WhatsApp button
    const whatsappButton = page.locator('text=/Contact via WhatsApp/i');
    await expect(whatsappButton).toBeVisible();
  });

  test('WhatsApp button should trigger click handler', async ({ page, context }) => {
    await page.goto('/businesses/the-fire-grill-restaurant');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Find WhatsApp button (it's a button element, not an anchor)
    const whatsappButton = page.locator('button:has-text("Contact via WhatsApp")');

    // Button should be visible
    await expect(whatsappButton).toBeVisible();

    // Button should not be disabled
    await expect(whatsappButton).toBeEnabled();
  });

  test('WhatsApp button should open WhatsApp in new window on click', async ({ page, context }) => {
    await page.goto('/businesses/the-fire-grill-restaurant');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Find WhatsApp button
    const whatsappButton = page.locator('button:has-text("Contact via WhatsApp")');

    // Set up listener for new page/popup
    const popupPromise = context.waitForEvent('page');

    // Click the button
    await whatsappButton.click();

    // Wait for the popup
    const popup = await popupPromise;

    // Verify the URL is a WhatsApp URL
    const url = popup.url();
    expect(url).toMatch(/wa\.me|web\.whatsapp\.com/);

    // Close the popup
    await popup.close();
  });

  test('WhatsApp button should include business name in message', async ({ page, context }) => {
    await page.goto('/businesses/the-fire-grill-restaurant');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Find WhatsApp button
    const whatsappButton = page.locator('button:has-text("Contact via WhatsApp")');

    // Set up listener for new page/popup
    const popupPromise = context.waitForEvent('page');

    // Click the button
    await whatsappButton.click();

    // Wait for the popup
    const popup = await popupPromise;

    // Get URL and check for message parameters
    const url = popup.url();
    expect(url).toMatch(/text=/);
    expect(url).toMatch(/Fire.*Grill|Guyana.*Directory/i);

    // Close the popup
    await popup.close();
  });

  test('should display WhatsApp icon on button', async ({ page }) => {
    await page.goto('/businesses/the-fire-grill-restaurant');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // WhatsApp button should contain an SVG (Lucide icon - MessageCircle)
    const whatsappButton = page.locator('button:has-text("Contact via WhatsApp")');
    const icon = whatsappButton.locator('svg');

    await expect(icon).toBeVisible();
  });

  test('should track WhatsApp click', async ({ page, context }) => {
    await page.goto('/businesses/the-fire-grill-restaurant');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Set up request interception to catch API tracking requests
    const trackingRequests: any[] = [];
    page.on('request', request => {
      if (request.url().includes('track-whatsapp-click')) {
        trackingRequests.push(request);
      }
    });

    // Get the WhatsApp button
    const whatsappButton = page.locator('button:has-text("Contact via WhatsApp")');

    // Set up listener for new page/popup
    const popupPromise = context.waitForEvent('page');

    // Click the button
    await whatsappButton.click();

    // Wait for the popup and close it immediately
    const popup = await popupPromise;
    await popup.close();

    // Wait a bit for the tracking request to be sent
    await page.waitForTimeout(500);

    // Verify tracking request was made
    expect(trackingRequests.length).toBeGreaterThan(0);
  });
});
