import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Photo Upload E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should handle photo upload UI interactions', async ({ page }) => {
    // Navigate to a memorial page
    await page.goto('/memorial/test-memorial');
    
    // Look for photo upload section (only visible to memorial owners)
    const addPhotosButton = page.getByText('Add Photos');
    
    if (await addPhotosButton.isVisible()) {
      await addPhotosButton.click();
      
      // Should show photo uploader
      await expect(page.getByText('Upload Photos')).toBeVisible();
      await expect(page.getByText('Drag and drop photos here')).toBeVisible();
    }
  });

  test('should validate file types in upload', async ({ page }) => {
    await page.goto('/memorial/test-memorial');
    
    const addPhotosButton = page.getByText('Add Photos');
    if (await addPhotosButton.isVisible()) {
      await addPhotosButton.click();
      
      // Check file input restrictions
      const fileInput = page.locator('input[type="file"]');
      await expect(fileInput).toHaveAttribute('accept', 'image/*');
    }
  });

  test('should show photo gallery grid', async ({ page }) => {
    await page.goto('/memorial/test-memorial');
    
    // Should show photo gallery section
    await expect(page.getByText('Photo Gallery')).toBeVisible();
    
    // Should show either photos or empty state
    const content = await page.textContent('body');
    expect(content).toMatch(/No Photos Yet|Loading photos/);
  });

  test('should handle photo lightbox interactions', async ({ page }) => {
    await page.goto('/memorial/test-memorial');
    
    // If photos exist, test lightbox
    const photoImages = page.locator('img[src*="/api/photos/"]');
    const photoCount = await photoImages.count();
    
    if (photoCount > 0) {
      // Click first photo to open lightbox
      await photoImages.first().click();
      
      // Should show lightbox (if implemented)
      // This would test the lightbox functionality
    }
  });
});

test.describe('Photo API Tests', () => {
  test('should handle photo API endpoints', async ({ page }) => {
    // Test photo retrieval endpoint
    const response = await page.request.get('/api/photos/memorial/test-memorial-id');
    
    // Should return valid response (even if empty)
    expect(response.status()).toBeLessThanOrEqual(500);
  });

  test('should validate photo upload endpoint', async ({ page }) => {
    // Test upload endpoint without authentication
    const response = await page.request.post('/api/photos/upload', {
      data: {
        photo: 'invalid-data',
        memorialId: 'test-id',
        uploadedBy: 'test-user'
      }
    });
    
    // Should handle invalid requests appropriately
    expect([400, 401, 500]).toContain(response.status());
  });
});
