import { test, expect } from '@playwright/test';

test.describe('Setup View', () => {
  test.beforeEach(async ({ page }) => {
    // Set up API mocks before navigation
    await page.route('**/api/v1/organizations', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          body: JSON.stringify(null) // Return null to indicate no organization exists
        });
      }
    });

    // Clear any existing authentication
    await page.route('**/api/v1/users/me', async (route) => {
      await route.fulfill({
        status: 401,
        body: JSON.stringify({ detail: 'Not authenticated' })
      });
    });

    // Navigate to setup page and wait for initial load
    await page.goto('/setup');
    await expect(page.locator('.loading-screen')).not.toBeVisible();
    await expect(page.locator('h1')).toContainText('Welcome to ChatterMate', { timeout: 10000 });
  });

  test('should display setup form correctly', async ({ page }) => {
    // Wait for the setup page to load and loading spinner to disappear
    await expect(page.locator('.loading-screen')).not.toBeVisible();
    await expect(page.locator('h1')).toContainText('Welcome to ChatterMate', { timeout: 10000 });
    
    // Verify all form fields are present
    await expect(page.locator('#orgName')).toBeVisible();
    await expect(page.locator('#domain')).toBeVisible();
    await expect(page.locator('#timezone')).toBeVisible();
    await expect(page.locator('#adminName')).toBeVisible();
    await expect(page.locator('#adminEmail')).toBeVisible();
    await expect(page.locator('#adminPassword')).toBeVisible();
    await expect(page.locator('#confirmPassword')).toBeVisible();
  });

  test('should validate organization name', async ({ page }) => {
    const orgNameInput = page.locator('#orgName');
    
    // Test invalid input
    await orgNameInput.fill('a'); // Too short
    await orgNameInput.blur();
    await expect(page.locator('.error-hint')).toBeVisible();
    
    // Test valid input
    await orgNameInput.fill('Test Organization');
    await orgNameInput.blur();
    await expect(page.locator('.error-hint')).not.toBeVisible();
  });

  test('should validate domain', async ({ page }) => {
    const domainInput = page.locator('#domain');
    
    // Test invalid input
    await domainInput.fill('invalid-domain');
    await domainInput.blur();
    await expect(page.locator('.error-hint')).toBeVisible();
    
    // Test valid input
    await domainInput.fill('example.com');
    await domainInput.blur();
    await expect(page.locator('.error-hint')).not.toBeVisible();
  });

  test('should validate admin email', async ({ page }) => {
    const emailInput = page.locator('#adminEmail');
    
    // Test invalid input
    await emailInput.fill('invalid-email');
    await emailInput.blur();
    await expect(page.locator('.error-hint')).toBeVisible();
    
    // Test valid input
    await emailInput.fill('admin@example.com');
    await emailInput.blur();
    await expect(page.locator('.error-hint')).not.toBeVisible();
  });

  test('should validate password strength', async ({ page }) => {
    const passwordInput = page.locator('#adminPassword');
    
    // Test weak password (only lowercase)
    await passwordInput.fill('weakpassword');
    await passwordInput.blur(); // Trigger validation
    await expect(page.locator('.password-strength')).toBeVisible();
    await expect(page.locator('.strength-bar')).toHaveClass(/weak/);
    
    // Test medium password (3 criteria: length, uppercase, lowercase)
    await passwordInput.fill('WeakPassword');
    await passwordInput.blur(); // Trigger validation
    await expect(page.locator('.strength-bar')).toHaveClass(/medium/);
    
    // Test strong password (all 5 criteria)
    await passwordInput.fill('StrongP@ss123');
    await passwordInput.blur(); // Trigger validation
    await expect(page.locator('.strength-bar')).toHaveClass(/strong/);
  });

  test('should validate password confirmation', async ({ page }) => {
    // Fill in all required fields with valid data
    await page.locator('#orgName').fill('Test Organization');
    await page.locator('#domain').fill('example.com');
    await page.locator('#adminName').fill('Test Admin');
    await page.locator('#adminEmail').fill('admin@example.com');

    // Set strong password
    const password = 'StrongP@ss123';
    await page.locator('#adminPassword').fill(password);
    await page.locator('#adminPassword').blur();
    
    // Test non-matching password
    await page.locator('#confirmPassword').fill('DifferentP@ss123');
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('.error-message')).toBeVisible();
    await expect(page.locator('.error-message')).toContainText('Passwords do not match');
    
    // Test matching password
    await page.locator('#confirmPassword').fill(password);
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('.error-message')).not.toBeVisible();
  });

  test('should handle business hours toggle', async ({ page }) => {
    await page.goto('/setup');
    await page.waitForSelector('.business-hours');

    // Find the Monday row and wait for it to be visible
    const mondayRow = page.locator('.day-row', { hasText: 'Monday' });
    await mondayRow.waitFor({ state: 'visible' });

    // Get the toggle element within the Monday row
    const mondayToggle = mondayRow.locator('.toggle');
    await mondayToggle.waitFor({ state: 'visible' });

    // Get the checkbox for assertions
    const checkbox = mondayToggle.locator('input[type="checkbox"]');

    // Verify initial state
    await expect(checkbox).toBeChecked();
    await expect(mondayRow.locator('select').first()).toBeEnabled();
    await expect(mondayRow.locator('select').last()).toBeEnabled();

    // Toggle off by clicking the toggle element
    await mondayToggle.click();
    await expect(checkbox).not.toBeChecked();

    // Verify time selects are disabled
    await expect(mondayRow.locator('select').first()).toBeDisabled();
    await expect(mondayRow.locator('select').last()).toBeDisabled();

    // Toggle back on
    await mondayToggle.click();
    await expect(checkbox).toBeChecked();

    // Verify time selects are enabled again
    await expect(mondayRow.locator('select').first()).toBeEnabled();
    await expect(mondayRow.locator('select').last()).toBeEnabled();
  });

  test('should submit form with valid data', async ({ page }) => {
    // Mock the organization creation endpoint while preserving the GET mock
    await page.route('**/api/v1/organizations', async (route) => {
        const method = route.request().method();
        if (method === 'POST') {
            await route.fulfill({
                status: 201,
                body: JSON.stringify({
                    id: '123',
                    name: 'Test Organization',
                    domain: 'example.com',
                    admin_email: 'admin@example.com',
                    admin_name: 'Test Admin'
                })
            });
        } else if (method === 'GET') {
            await route.fulfill({
                status: 200,
                body: JSON.stringify(null)
            });
        } else {
            await route.continue();
        }
    });

    // Wait for and fill in all required fields with valid data
    const fields = {
        '#orgName': 'Test Organization',
        '#domain': 'example.com',
        '#adminName': 'Test Admin',
        '#adminEmail': 'admin@example.com',
        '#adminPassword': 'StrongP@ss123',
        '#confirmPassword': 'StrongP@ss123'
    };

    // Wait for the first field to be visible before proceeding
    await expect(page.locator('#orgName')).toBeVisible();

    // Fill in all fields
    for (const [selector, value] of Object.entries(fields)) {
        await page.locator(selector).fill(value);
    }

    // Submit form and wait for successful response
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();

    const responsePromise = page.waitForResponse(response => 
        response.url().includes('/api/v1/organizations') && 
        response.request().method() === 'POST'
    );
    
    await submitButton.click();
    const response = await responsePromise;
    expect(response.status()).toBe(201);
  });
}); 