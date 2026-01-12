import { test, expect } from '@playwright/test';

test.describe('Blog Pages', () => {
  test.describe('Blog List Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/blog');
    });

    test('should display blog list page correctly', async ({ page }) => {
      // Check page title
      await expect(page.getByRole('heading', { name: /Peptide Research Insights/i })).toBeVisible();

      // Check search box exists
      await expect(page.getByPlaceholder(/Search articles/i)).toBeVisible();
    });

    test('should load blog posts from API', async ({ page }) => {
      // Wait for blog posts to load
      await expect(page.getByText(/The Rise of Peptide Research/i)).toBeVisible({ timeout: 10000 });
    });

    test('should display blog post cards with metadata', async ({ page }) => {
      // Wait for posts to load
      await page.waitForSelector('article', { timeout: 10000 });

      // Check that blog cards have required elements
      const firstArticle = page.locator('article').first();
      await expect(firstArticle).toBeVisible();

      // Should have a title
      await expect(firstArticle.getByRole('heading')).toBeVisible();

      // Should have Read Article link
      await expect(firstArticle.getByText(/Read Article/i)).toBeVisible();
    });

    test('should filter blog posts with search', async ({ page }) => {
      // Wait for posts to load
      await expect(page.getByText(/The Rise of Peptide Research/i)).toBeVisible({ timeout: 10000 });

      // Type in search box
      const searchBox = page.getByPlaceholder(/Search articles/i);
      await searchBox.fill('GLP-1');

      // Check that search results update (use .first() since text appears in title and excerpt)
      await expect(page.getByText(/GLP-1 Receptor Agonists/i).first()).toBeVisible();
    });
  });

  test.describe('Blog Detail Page', () => {
    test('should navigate to blog post from list', async ({ page }) => {
      await page.goto('/blog');

      // Wait for posts to load
      await page.waitForSelector('article', { timeout: 10000 });

      // Click on first blog post
      const firstReadLink = page.getByText(/Read Article/i).first();
      await firstReadLink.click();

      // Should navigate to detail page
      await expect(page).toHaveURL(/\/blog\/.+/);
    });

    test('should display blog post detail correctly', async ({ page }) => {
      // Navigate directly to a known blog slug
      await page.goto('/blog/rise-of-peptide-research-america');

      // Check for blog title
      await expect(page.getByRole('heading', { name: /The Rise of Peptide Research/i })).toBeVisible({ timeout: 10000 });

      // Check for back link
      await expect(page.getByRole('link', { name: /Back to Blog/i })).toBeVisible();

      // Check for content
      await expect(page.getByText(/peptide therapeutics market/i)).toBeVisible();
    });

    test('should display meta information', async ({ page }) => {
      await page.goto('/blog/rise-of-peptide-research-america');

      // Wait for content to load (use specific heading instead of generic)
      await expect(page.getByRole('heading', { name: /The Rise of Peptide Research/i })).toBeVisible({ timeout: 10000 });

      // Should display publication date (look for any date-like element)
      await expect(page.locator('time').first()).toBeVisible();

      // Should display read time
      await expect(page.getByText(/min read/i)).toBeVisible();
    });

    test('should have share functionality', async ({ page }) => {
      await page.goto('/blog/rise-of-peptide-research-america');

      // Wait for content to load (use specific heading instead of generic)
      await expect(page.getByRole('heading', { name: /The Rise of Peptide Research/i })).toBeVisible({ timeout: 10000 });

      // Check for share button
      const shareButton = page.getByRole('button', { name: /Share/i });
      await expect(shareButton).toBeVisible();
    });
  });
});
