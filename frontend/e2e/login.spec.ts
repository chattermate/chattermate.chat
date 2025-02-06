import { test, expect } from '@playwright/test';
import { mockLogin } from './utils/mock-api.js';

// Configure timeout for login tests
test.describe('Login View', () => {
    // Set shorter timeout for all tests in this file
    test.setTimeout(30000);

    test.beforeEach(async ({ page }) => {
        // Clear any existing authentication
        await mockLogin(page, { status: 401, error: 'Not authenticated' });

        // Navigate to login page and wait for initial load
        await page.goto('/login');
        await expect(page.locator('h1')).toContainText('Welcome Back', { timeout: 5000 });
    });

    test('should display login form correctly', async ({ page }) => {
        // Verify logo is present
        await expect(page.locator('.logo')).toBeVisible({ timeout: 5000 });
        
        // Verify form fields are present
        await expect(page.locator('#email')).toBeVisible({ timeout: 5000 });
        await expect(page.locator('#password')).toBeVisible({ timeout: 5000 });
        
        // Verify submit button is present
        const submitButton = page.locator('button[type="submit"]');
        await expect(submitButton).toBeVisible({ timeout: 5000 });
        await expect(submitButton).toContainText('Login', { timeout: 5000 });
    });

    test('should show error message for invalid credentials', async ({ page }) => {
        // Mock failed login attempt
        await mockLogin(page, { status: 401, error: 'Invalid credentials' });

        // Fill in credentials
        await page.locator('#email').fill('invalid@example.com');
        await page.locator('#password').fill('wrongpassword');

        // Submit form and wait for response
        const submitButton = page.locator('button[type="submit"]');
        const responsePromise = page.waitForResponse(response => 
            response.url().includes('/api/v1/users/login') && 
            response.request().method() === 'POST'
        );
        
        await submitButton.click();
        await responsePromise;

        // Verify error message
        const errorMessage = page.locator('.error-message');
        await expect(errorMessage).toBeVisible({ timeout: 5000 });
        await expect(errorMessage).toContainText('Login failed', { timeout: 5000 });

        // Verify button is not in loading state
        await expect(submitButton).not.toContainText('Logging in...', { timeout: 5000 });
    });

    test('should handle successful login and redirect based on permissions', async ({ page }) => {
        // Mock successful login with specific permissions and delay
        await mockLogin(page, {
            permissions: ['manage_agents', 'view_chats', 'manage_users'],
            delay: 1000 // Add 1 second delay
        });

        // Fill in valid credentials
        await page.locator('#email').fill('admin@example.com');
        await page.locator('#password').fill('correctpassword');

        // Submit form
        const submitButton = page.locator('button[type="submit"]');
        await expect(submitButton).toBeVisible({ timeout: 5000 });
        
        // Start waiting for the response before clicking
        const responsePromise = page.waitForResponse(response => 
            response.url().includes('/api/v1/users/login') && 
            response.request().method() === 'POST'
        );
        
        // Click and wait for loading state
        await submitButton.click();
        await expect(submitButton).toBeDisabled({ timeout: 5000 });
        await expect(submitButton).toContainText('Logging in...', { timeout: 5000 });

        // Wait for successful response
        const response = await responsePromise;
        expect(response.status()).toBe(200);
    });

    test('should handle network errors', async ({ page }) => {
        // Mock network error
        await page.route('**/api/v1/users/login', async (route) => {
            await route.abort('failed');
        });

        // Fill in credentials
        await page.locator('#email').fill('admin@example.com');
        await page.locator('#password').fill('password123');

        // Submit form
        await page.locator('button[type="submit"]').click();

        // Verify error message
        const errorMessage = page.locator('.error-message');
        await expect(errorMessage).toBeVisible({ timeout: 5000 });
        await expect(errorMessage).toContainText('Login failed', { timeout: 5000 });
    });

    test('should require email and password', async ({ page }) => {
        // Try to submit empty form
        await page.locator('button[type="submit"]').click();

        // Verify form validation (HTML5 validation)
        const emailInput = page.locator('#email');
        await expect(emailInput).toHaveAttribute('required', '', { timeout: 5000 });
        
        const passwordInput = page.locator('#password');
        await expect(passwordInput).toHaveAttribute('required', '', { timeout: 5000 });
    });
}); 