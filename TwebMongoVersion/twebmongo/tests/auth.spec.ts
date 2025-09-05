import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should display login button when not authenticated', async ({ page }) => {
    await page.goto('/');
    
    // Should see login button
    await expect(page.getByRole('button', { name: /login/i })).toBeVisible();
    
    // Should not see user info or logout button
    await expect(page.getByText(/logout/i)).not.toBeVisible();
  });

  test('should redirect to Auth0 when login clicked', async ({ page }) => {
    await page.goto('/');
    
    // Click login button
    await page.getByRole('button', { name: /login/i }).click();
    
    // Should redirect to Auth0 domain
    await expect(page).toHaveURL(/auth0\.com/);
  });

  test('should handle callback page', async ({ page }) => {
    // Navigate directly to callback page (simulating Auth0 redirect)
    await page.goto('/auth/callback?code=test-code&state=test-state');
    
    // Should show loading state initially
    await expect(page.getByText(/completing authentication/i)).toBeVisible();
    
    // Should eventually redirect to home (or show error)
    await page.waitForURL('/', { timeout: 5000 });
  });

  test('should show create memorial button for new users', async ({ page }) => {
    // Mock successful authentication
    await page.addInitScript(() => {
      // Mock localStorage with auth token
      localStorage.setItem('auth0.is.authenticated', 'true');
    });
    
    await page.goto('/');
    
    // Should see create memorial button for authenticated users
    await expect(page.getByRole('link', { name: /create memorial/i })).toBeVisible();
  });
});
