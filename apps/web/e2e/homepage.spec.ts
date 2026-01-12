import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/');

    // Check for MAHA logo (use .first() since it appears in header and hero)
    await expect(page.getByAltText('MAHA Peptides').first()).toBeVisible();

    // Check for main heading
    await expect(page.getByRole('heading', { name: /American-Made Research Peptides/i })).toBeVisible();

    // Check for market stats section
    await expect(page.getByText(/Global Peptide Market/i)).toBeVisible();
    await expect(page.getByText(/99%\+ Purity/i).first()).toBeVisible();
  });

  test('should have working navigation links', async ({ page }) => {
    await page.goto('/');

    // Test Browse Catalog button (use .first() since it may appear multiple times)
    const catalogLink = page.getByRole('link', { name: /Browse Catalog/i }).first();
    await expect(catalogLink).toBeVisible();
    await expect(catalogLink).toHaveAttribute('href', '/products');

    // Test Contact Sales button
    const contactLink = page.getByRole('link', { name: /Contact Sales/i }).first();
    await expect(contactLink).toBeVisible();
    await expect(contactLink).toHaveAttribute('href', '/contact');
  });

  test('should display market data counters', async ({ page }) => {
    await page.goto('/');

    // Wait for market stats section to load (counters may be animated)
    // Check for the labels instead of exact numbers since they may animate
    await expect(page.getByText(/Global Peptide Market/i)).toBeVisible();
    await expect(page.getByText(/Annual Market Growth Rate/i)).toBeVisible();
    await expect(page.getByText(/Active Clinical Trials/i)).toBeVisible();
    await expect(page.getByText(/FDA-Approved Peptide Drugs/i)).toBeVisible();
  });

  test('should display trust signals', async ({ page }) => {
    await page.goto('/');

    // Use .first() for elements that may appear multiple times
    await expect(page.getByText(/99%\+ Purity/i).first()).toBeVisible();
    await expect(page.getByText(/Full COA Access/i).first()).toBeVisible();
    await expect(page.getByText(/American Made/i).first()).toBeVisible();
    await expect(page.getByText(/Cold Chain Certified/i).first()).toBeVisible();
  });

  test('should display compliance notice', async ({ page }) => {
    await page.goto('/');

    // Check for compliance notice section (use .first() for elements that appear multiple times)
    await expect(page.getByText(/Regulatory Compliance Notice/i)).toBeVisible();
    await expect(page.getByText(/laboratory research and analytical use/i).first()).toBeVisible();
    await expect(page.getByText(/Not for human or veterinary consumption/i).first()).toBeVisible();
  });
});
