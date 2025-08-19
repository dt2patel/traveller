import { test, expect } from '@playwright/test';

test('smoke', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Sign in')).toBeVisible();
});
