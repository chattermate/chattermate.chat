import { test, expect } from '@playwright/test';
import { 
    mockLogin, 
    mockAIConfig, 
    mockAISetup, 
    mockAIProviders, 
    performLogin 
} from './utils/mock-api.js';

test.describe('AI Setup View', () => {
    // Set shorter timeout for all tests in this file
    test.setTimeout(30000);

    test.beforeEach(async ({ page }) => {
        // Set up mocks
        await mockLogin(page);
        await mockAIConfig(page, { isConfigured: false });
        await mockAIProviders(page);

        // Perform login
        await performLogin(page);

        // Navigate to AI setup page
        await page.goto('/ai-agents');
        
        // Wait for the AI setup form to be visible
        await expect(page.locator('.ai-setup')).toBeVisible({ timeout: 5000 });
    });

    test('should display AI setup form correctly', async ({ page }) => {
        // Verify form elements are present
        await expect(page.locator('#provider')).toBeVisible({ timeout: 5000 });
        await expect(page.locator('#model')).toBeVisible({ timeout: 5000 });
        
        // Verify provider options are present
        const providerSelect = page.locator('#provider');
        const options = await providerSelect.locator('option').all();
        const optionValues = await Promise.all(options.map(option => option.getAttribute('value')));
        expect(optionValues.filter(Boolean)).toContain('openai');
        expect(optionValues.filter(Boolean)).toContain('anthropic');
        expect(optionValues.filter(Boolean)).toContain('ollama');
    });

    test('should show/hide API key field based on provider', async ({ page }) => {
        const apiKeyField = page.locator('#apiKey');

        // Select OpenAI - should show API key
        await page.locator('#provider').selectOption('openai');
        await expect(apiKeyField).toBeVisible({ timeout: 5000 });

        // Select Ollama - should hide API key
        await page.locator('#provider').selectOption('ollama');
        await expect(apiKeyField).not.toBeVisible({ timeout: 5000 });
    });

    test('should handle successful AI setup', async ({ page }) => {
        // Mock successful setup with delay
        await mockAISetup(page);

        // Fill out the form
        await page.selectOption('select#provider', 'openai');
        await page.fill('input#model', 'gpt-4');
        await page.fill('input#apiKey', 'test-api-key');

        const setupForm = page.locator('.setup-form');
        const loadingSpinner = page.locator('.loading-container');
        
        // Start waiting for the request
        const setupRequestPromise = page.waitForRequest(request => 
            request.url().includes('/api/v1/ai/setup') && 
            request.method() === 'POST'
        );

        // Verify form is visible initially
        await expect(setupForm).toBeVisible();
        await expect(loadingSpinner).not.toBeVisible();
        
        // Click the submit button
        await page.locator('button[type="submit"]').click();
        
        // Wait for form to be replaced by loading spinner
        await expect(setupForm).not.toBeVisible();
        await expect(loadingSpinner).toBeVisible();
        
        // Get the request and verify its data
        const request = await setupRequestPromise;
        const requestBody = JSON.parse(await request.postData() || '{}');
        expect(requestBody).toEqual({
            model_type: 'OPENAI',
            model_name: 'gpt-4',
            api_key: 'test-api-key'
        });

        // Wait for loading spinner to disappear and form to reappear
        await expect(loadingSpinner).not.toBeVisible();
        await expect(setupForm).toBeVisible();
    });

    test('should handle API errors', async ({ page }) => {
        // Mock API error
        await mockAISetup(page, {
            status: 400,
            error: 'Setup failed. Please try again.'
        });

        // Fill in the form
        await page.locator('#provider').selectOption('openai');
        await page.locator('#model').fill('gpt-4');
        await page.locator('#apiKey').fill('invalid-key');

        // Submit form
        await page.locator('button[type="submit"]').click();

        // Verify error message
        const errorMessage = page.locator('.error-message');
        await expect(errorMessage).toBeVisible({ timeout: 5000 });
        await expect(errorMessage).toContainText('Setup failed. Please try again.', { timeout: 5000 });
    });

    test('should require all fields except API key for Ollama', async ({ page }) => {
        // Select Ollama provider
        await page.locator('#provider').selectOption('ollama');
        await page.locator('#model').fill('llama2');

        // Submit form and verify it's allowed
        const submitButton = page.locator('button[type="submit"]');
        await submitButton.click();

        // API key should not be required
        await expect(page.locator('#apiKey')).not.toBeVisible();

        // For other providers, API key should be required
        await page.locator('#provider').selectOption('openai');
        await submitButton.click();

        // Verify form validation (HTML5 validation)
        const apiKeyInput = page.locator('#apiKey');
        await expect(apiKeyInput).toHaveAttribute('required', '', { timeout: 5000 });
    });
}); 