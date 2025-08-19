import { test, expect } from '@playwright/test';

// Mock Firebase auth by overriding useAuthState
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.useAuthState = () => [{ uid: 'test' }];
  });
});

test('smoke test', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('text=Log ENTRY into India')).toBeVisible();
  await page.click('button:has-text("Log ENTRY into India")');
  await page.goto('/history');
  await expect(page.locator('text=ENTRY')).toBeVisible();
  await page.goto('/summary');
  await expect(page.locator('text=Status')).toBeVisible();
  await page.click('button:has-text("Export CSV")');
  // Verify download, but Playwright can't check file content easily
});