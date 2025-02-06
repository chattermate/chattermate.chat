import { test, expect } from '@playwright/test';
import { 
    mockLogin, 
    mockAIConfig, 
    mockAISetup, 
    mockAgentList, 
    performLogin 
} from './utils/mock-api.js';

test.describe('AI Agent Setup View', () => {
    test.setTimeout(30000);

    test.beforeEach(async ({ page }) => {
        await mockLogin(page);
        await performLogin(page);
    });

    test('should show loading state initially', async ({ page }) => {
        // Mock delayed AI config check with a delay
        await mockAIConfig(page, {
            isConfigured: false,
            status: 404,
            error: 'AI not configured',
            delay: 1000 // Add 1 second delay
        });

        // Navigate to page
        await page.goto('/ai-agents');
        
        // Verify loading state is shown before response completes
        const loadingSpinner = page.locator('.loading-container');
        await expect(loadingSpinner).toBeVisible();
    });

    test('should handle error fetching AI config', async ({ page }) => {
        await mockAIConfig(page, {
            status: 500,
            error: 'Internal server error',
            delay: 500 // Add 0.5 second delay
        });

        await page.goto('/ai-agents');
        
        // Verify loading state is shown first
        const loadingSpinner = page.locator('.loading-container');
        await expect(loadingSpinner).toBeVisible();
        
        // Then verify error message is shown
        const errorMessage = page.locator('.error-message');
        await expect(errorMessage).toBeVisible();
        await expect(errorMessage).toContainText('Failed to check AI configuration');
    });

    test('should show AI setup when not configured', async ({ page }) => {
        await mockAIConfig(page, {
            isConfigured: false,
            delay: 500 // Add 0.5 second delay
        });

        await page.goto('/ai-agents');
        
        // Verify loading state is shown first
        const loadingSpinner = page.locator('.loading-container');
        await expect(loadingSpinner).toBeVisible();
        
        // Then verify AI setup form is shown
        const aiSetup = page.locator('.setup-messages');
        await expect(aiSetup).toBeVisible();
    });

    test('should show agent list when AI is configured', async ({ page }) => {
        await mockAIConfig(page, { delay: 500 }); // Add 0.5 second delay
        await mockAgentList(page, {
            agents: [{
                id: '1',
                name: 'Test Agent',
                display_name: 'Test Agent',
                is_active: true,
                instructions: ['Be helpful'],
                transfer_to_human: false,
                customization: {
                    avatar_url: null,
                    primary_color: '#000000',
                    chat_bubble_color: '#ffffff'
                }
            }],
            delay: 500 // Add 0.5 second delay
        });

        await page.goto('/ai-agents');
        
        // Verify loading state is shown first
        const loadingSpinner = page.locator('.loading-container');
        await expect(loadingSpinner).toBeVisible();
        
        // Then verify agent list is shown
        const agentList = page.locator('.agent-list-container');
        await expect(agentList).toBeVisible();
    });

    test('should handle error fetching agents', async ({ page }) => {
        await mockAIConfig(page, { delay: 500 }); // Add 0.5 second delay
        await mockAgentList(page, {
            status: 500,
            error: 'Failed to fetch agents',
            delay: 500 // Add 0.5 second delay
        });

        await page.goto('/ai-agents');
        
        // Verify loading state is shown first
        const loadingSpinner = page.locator('.loading-container');
        await expect(loadingSpinner).toBeVisible();
        
        // Then verify error message is shown
        const errorMessage = page.locator('.error-message');
        await expect(errorMessage).toBeVisible();
        await expect(errorMessage).toContainText('Failed to fetch agents');
    });

    test('should transition from AI setup to agent list', async ({ page }) => {
        // Mock AI config to return different responses before and after setup
        await mockAIConfig(page, {
            isConfigured: false,
            delay: 500 // Add 0.5 second delay
        });

        // Mock successful AI setup with delay
        await mockAISetup(page, { delay: 1000 }); // Add 1 second delay

        // Mock empty agent list with delay
        await mockAgentList(page, { delay: 500 }); // Add 0.5 second delay

        await page.goto('/ai-agents');
        
        // Verify loading state is shown first
        const loadingSpinner = page.locator('.loading-container');
        await expect(loadingSpinner).toBeVisible();
        
        // Then verify AI setup is shown
        const aiSetup = page.locator('.setup-messages');
        await expect(aiSetup).toBeVisible();

        // Fill and submit AI setup form
        await page.selectOption('select#provider', 'openai');
        await page.fill('input#model', 'gpt-4');
        await page.fill('input#apiKey', 'test-api-key');
        await page.locator('button[type="submit"]').click();

        // Verify loading state during setup
        await expect(loadingSpinner).toBeVisible();

        // Update AI config mock to return configured state
        await mockAIConfig(page, {
            isConfigured: true,
            delay: 500 // Add 0.5 second delay
        });

        // Verify loading state during config check
        await expect(loadingSpinner).toBeVisible();

        // Finally verify transition to agent list
        const agentList = page.locator('.agent-list-container');
        await expect(agentList).toBeVisible();
    });
}); 