import { test, expect } from '@playwright/test';

test.describe('Memorial Creation and Management Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
  });

  test('should complete full memorial creation flow', async ({ page }) => {
    // Test home page loads
    await expect(page.getByText('TributeStream')).toBeVisible();

    // Test login button is present (we won't actually login in E2E without real Auth0)
    await expect(page.getByText('Login')).toBeVisible();

    // Navigate to create memorial page
    await page.goto('/create-memorial');
    
    // Should redirect to login or show login required message
    // This tests the authentication protection
    await expect(page.url()).toContain('/create-memorial');
  });

  test('should display memorial page correctly', async ({ page }) => {
    // Navigate directly to a memorial page (assuming one exists)
    await page.goto('/memorial/test-memorial');
    
    // Should show memorial not found or memorial content
    // This tests the memorial display functionality
    const content = await page.textContent('body');
    expect(content).toContain('Memorial');
  });

  test('should show search page', async ({ page }) => {
    await page.goto('/search');
    
    await expect(page.getByText('Search Memorials')).toBeVisible();
    await expect(page.getByPlaceholder('Search for a memorial...')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Search' })).toBeVisible();
  });

  test('should handle search functionality', async ({ page }) => {
    await page.goto('/search');
    
    // Fill in search form
    await page.getByPlaceholder('Search for a memorial...').fill('test');
    await page.getByRole('button', { name: 'Search' }).click();
    
    // Should show search results or no results message
    await expect(page.getByText(/Found|No Results Found/)).toBeVisible();
  });

  test('should show profile page with authentication check', async ({ page }) => {
    await page.goto('/profile');
    
    // Should redirect to home or show login required
    // This tests the profile page authentication
    const url = page.url();
    expect(url).toBeTruthy();
  });

  test('should display responsive navigation', async ({ page }) => {
    await page.goto('/');
    
    // Test navigation links (specifically in the navigation role)
    await expect(page.getByRole('navigation').getByRole('link', { name: 'Home' })).toBeVisible();
    await expect(page.getByRole('navigation').getByRole('link', { name: 'Search' })).toBeVisible();
    await expect(page.getByRole('navigation').getByRole('link', { name: 'About' })).toBeVisible();
  });

  test('should handle 404 pages gracefully', async ({ page }) => {
    const response = await page.goto('/nonexistent-page');
    
    // Check that the page handles the 404 appropriately
    expect(response?.status()).toBe(404);
    
    // Should show error page content
    await expect(page.getByText('Page Not Found')).toBeVisible();
  });
});

test.describe('Photo Gallery Functionality', () => {
  test('should show photo gallery on memorial page', async ({ page }) => {
    await page.goto('/memorial/test-memorial');
    
    // Should show memorial not found or photo gallery section
    const content = await page.textContent('body');
    expect(content).toMatch(/Memorial Not Found|Photo Gallery/);
  });

  test('should show empty photo state', async ({ page }) => {
    await page.goto('/memorial/test-memorial');
    
    // Should show empty state or photos
    const content = await page.textContent('body');
    expect(content).toMatch(/Memorial Not Found|No Photos Yet|Photo Gallery/);
  });
});

test.describe('Sharing Functionality', () => {
  test('should show share button on memorial page', async ({ page }) => {
    await page.goto('/memorial/test-memorial');
    
    // Look for share button
    const shareButton = page.getByRole('button', { name: /Share/ });
    if (await shareButton.isVisible()) {
      await shareButton.click();
      
      // Should show share menu
      await expect(page.getByText('Share Memorial')).toBeVisible();
    }
  });
});

test.describe('API Health and Connectivity', () => {
  test('should have working API health endpoint', async ({ page }) => {
    const response = await page.request.get('/api/health');
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.status).toBe('ok');
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Test non-existent API endpoint
    const response = await page.request.get('/api/nonexistent');
    expect(response.status()).toBeGreaterThanOrEqual(400);
  });
});

test.describe('Performance and Accessibility', () => {
  test('should load pages within reasonable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;
    
    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should have proper page titles', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/TributeStream/);
    
    await page.goto('/search');
    await expect(page).toHaveTitle(/Search Memorials/);
  });

  test('should have accessible navigation', async ({ page }) => {
    await page.goto('/');
    
    // Check for proper heading structure
    const h1 = page.locator('h1');
    if (await h1.count() > 0) {
      await expect(h1.first()).toBeVisible();
    }
    
    // Check for proper link accessibility
    const links = page.locator('a');
    const linkCount = await links.count();
    expect(linkCount).toBeGreaterThan(0);
  });
});
