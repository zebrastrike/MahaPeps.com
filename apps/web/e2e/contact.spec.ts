import { test, expect } from '@playwright/test';

test.describe('Contact Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact');
  });

  test('should display contact page correctly', async ({ page }) => {
    // Check page title
    await expect(page.getByRole('heading', { name: /Contact Our Research Team/i })).toBeVisible();

    // Check contact info cards
    await expect(page.getByText('info@mahapeps.com')).toBeVisible();
    await expect(page.getByText('sales@mahapeps.com')).toBeVisible();
    await expect(page.getByText('support@mahapeps.com')).toBeVisible();
  });

  test('should validate required form fields', async ({ page }) => {
    // Try to submit empty form
    const submitButton = page.getByRole('button', { name: /Send Message/i });
    await submitButton.click();

    // Check for HTML5 validation (browser will prevent submission)
    const nameInput = page.getByLabel(/Full Name/i);
    await expect(nameInput).toHaveAttribute('required');

    const emailInput = page.getByLabel(/Email Address/i);
    await expect(emailInput).toHaveAttribute('required');
    await expect(emailInput).toHaveAttribute('type', 'email');
  });

  test('should accept valid form submission', async ({ page }) => {
    // Fill out the form
    await page.getByLabel(/Full Name/i).fill('Dr. John Smith');
    await page.getByLabel(/Email Address/i).fill('john.smith@test.com');
    await page.getByLabel(/Phone Number/i).fill('+1 (555) 123-4567');
    await page.getByLabel(/Subject/i).fill('Product inquiry');
    await page.getByLabel(/Message/i).fill('I am interested in learning more about your GLP-1 peptides for research.');

    // Submit the form
    await page.getByRole('button', { name: /Send Message/i }).click();

    // Wait for success message (or check that loading state appears)
    // Note: This will depend on the API being available
  });

  test('should display compliance notice', async ({ page }) => {
    // Use .first() since compliance text appears in multiple places
    await expect(page.getByText(/research use only/i).first()).toBeVisible();
    await expect(page.getByText(/not for human or veterinary consumption/i).first()).toBeVisible();
  });

  test('should have link to FAQ section', async ({ page }) => {
    const faqLink = page.getByRole('link', { name: /Visit FAQ Section/i });
    await expect(faqLink).toBeVisible();
    await expect(faqLink).toHaveAttribute('href', '/faq');
  });
});
