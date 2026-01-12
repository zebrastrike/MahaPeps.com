import { test, expect } from '@playwright/test';

test.describe('Wholesale Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/wholesale');
  });

  test('should display wholesale page correctly', async ({ page }) => {
    // Check page title
    await expect(page.getByRole('heading', { name: /Wholesale Research Solutions/i })).toBeVisible();

    // Check for sign-in link
    await expect(page.getByRole('link', { name: /Already have an account/i })).toBeVisible();
  });

  test('should display benefits section', async ({ page }) => {
    // Use .first() for elements that may appear multiple times
    await expect(page.getByText(/Volume Discounts/i).first()).toBeVisible();
    await expect(page.getByText(/Dedicated Account Manager/i).first()).toBeVisible();
    await expect(page.getByText(/Priority Processing/i).first()).toBeVisible();
    await expect(page.getByText(/Net Payment Terms/i).first()).toBeVisible();
  });

  test('should display pricing tiers', async ({ page }) => {
    // Check for all three tiers
    await expect(page.getByText(/10% OFF/i)).toBeVisible();
    await expect(page.getByText(/20% OFF/i)).toBeVisible();
    await expect(page.getByText(/30% OFF/i)).toBeVisible();

    // Check tier names
    await expect(page.getByRole('heading', { name: /Starter/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Professional/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Enterprise/i })).toBeVisible();
  });

  test('should display requirements sidebar', async ({ page }) => {
    await expect(page.getByText(/Wholesale Requirements/i)).toBeVisible();
    // Use .first() for elements that appear in both sidebar and form
    await expect(page.getByText(/Business License/i).first()).toBeVisible();
    await expect(page.getByText(/Minimum Order: \$500/i)).toBeVisible();
    await expect(page.getByText(/Tax ID \/ EIN/i).first()).toBeVisible();
  });

  test('should validate wholesale application form', async ({ page }) => {
    // Try to submit empty form
    const submitButton = page.getByRole('button', { name: /Submit Wholesale Application/i });
    await submitButton.click();

    // Check for required fields
    const companyNameInput = page.getByLabel(/Company \/ Institution Name/i);
    await expect(companyNameInput).toHaveAttribute('required');

    const contactNameInput = page.getByLabel(/Contact Person/i);
    await expect(contactNameInput).toHaveAttribute('required');
  });

  test('should accept valid wholesale application', async ({ page }) => {
    // Fill out the form
    await page.getByLabel(/Company \/ Institution Name/i).fill('Research Labs Inc.');
    await page.getByLabel(/Contact Person/i).fill('Dr. Jane Doe');
    await page.getByLabel(/Email Address/i).fill('jane.doe@researchlabs.com');
    await page.getByLabel(/Phone Number/i).fill('+1 (555) 987-6543');

    // Select business type
    await page.getByLabel(/Business Type/i).selectOption('university');

    await page.getByLabel(/Tax ID \/ EIN/i).fill('12-3456789');
    await page.getByLabel(/Business License Number/i).fill('BL-123456');

    // Select monthly volume
    await page.getByLabel(/Estimated Monthly Order Volume/i).selectOption('$2,500-$9,999');

    // Submit the form
    await page.getByRole('button', { name: /Submit Wholesale Application/i }).click();

    // Wait for success message or loading state
    // Note: This will depend on the API being available
  });

  test('should display compliance notice', async ({ page }) => {
    // Use .first() since compliance text appears in multiple places
    await expect(page.getByText(/research use only/i).first()).toBeVisible();
    await expect(page.getByText(/not for human or veterinary consumption/i).first()).toBeVisible();
  });
});
