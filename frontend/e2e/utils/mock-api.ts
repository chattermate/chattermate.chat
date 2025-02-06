import { Page } from '@playwright/test';

export interface MockLoginOptions {
    permissions?: string[];
    status?: number;
    error?: string;
    delay?: number;
}

export async function mockLogin(page: Page, options: MockLoginOptions = {}) {
    const {
        permissions = ['manage_agents', 'view_chats', 'manage_users'],
        status = 200,
        error = 'Invalid credentials',
        delay = 0
    } = options;

    await page.route('**/api/v1/users/login', async (route) => {
        if (delay) {
            await new Promise(resolve => setTimeout(resolve, delay));
        }
        if (status === 200) {
            await route.fulfill({
                status,
                body: JSON.stringify({
                    access_token: 'fake-token',
                    refresh_token: 'fake-refresh-token',
                    token_type: 'bearer',
                    user: {
                        id: '123',
                        email: 'admin@example.com',
                        name: 'Test Admin',
                        permissions
                    }
                })
            });
        } else {
            await route.fulfill({
                status,
                body: JSON.stringify({ detail: error })
            });
        }
    });
}

export interface MockAIConfigOptions {
    status?: number;
    isConfigured?: boolean;
    error?: string;
    config?: {
        model_type: string;
        model_name: string;
        api_key: string;
    };
    delay?: number;
}

export async function mockAIConfig(page: Page, options: MockAIConfigOptions = {}) {
    const {
        status = 200,
        isConfigured = true,
        error = 'AI not configured',
        config = {
            model_type: 'OPENAI',
            model_name: 'gpt-4',
            api_key: 'test-api-key'
        },
        delay = 0
    } = options;

    await page.route('**/api/v1/ai/config', async (route) => {
        if (route.request().method() === 'GET') {
            if (delay) {
                await new Promise(resolve => setTimeout(resolve, delay));
            }
            if (isConfigured) {
                await route.fulfill({
                    status,
                    body: JSON.stringify(config)
                });
            } else {
                await route.fulfill({
                    status: 404,
                    body: JSON.stringify({ detail: error })
                });
            }
        }
    });
}

export interface MockAISetupOptions {
    status?: number;
    error?: string;
    delay?: number;
}

export async function mockAISetup(page: Page, options: MockAISetupOptions = {}) {
    const { 
        status = 200, 
        error = 'Setup failed',
        delay = 0
    } = options;

    await page.route('**/api/v1/ai/setup', async (route) => {
        if (delay) {
            await new Promise(resolve => setTimeout(resolve, delay));
        }
        if (status === 200) {
            await route.fulfill({
                status,
                body: JSON.stringify({ success: true })
            });
        } else {
            await route.fulfill({
                status,
                body: JSON.stringify({ detail: error })
            });
        }
    });
}

export interface MockAgentListOptions {
    status?: number;
    error?: string;
    agents?: any[];
    delay?: number;
}

export async function mockAgentList(page: Page, options: MockAgentListOptions = {}) {
    const { 
        status = 200, 
        error = 'Failed to fetch agents',
        agents = [],
        delay = 0
    } = options;

    await page.route('**/api/v1/agent/list', async (route) => {
        if (delay) {
            await new Promise(resolve => setTimeout(resolve, delay));
        }
        if (status === 200) {
            await route.fulfill({
                status,
                body: JSON.stringify(agents)
            });
        } else {
            await route.fulfill({
                status,
                body: JSON.stringify({ detail: error })
            });
        }
    });
}

export interface MockAIProvidersOptions {
    delay?: number;
}

export async function mockAIProviders(page: Page, options: MockAIProvidersOptions = {}) {
    const { delay = 0 } = options;

    await page.route('**/api/v1/ai/providers', async (route) => {
        if (delay) {
            await new Promise(resolve => setTimeout(resolve, delay));
        }
        await route.fulfill({
            status: 200,
            body: JSON.stringify([
                { value: 'openai', label: 'OpenAI' },
                { value: 'anthropic', label: 'Anthropic' },
                { value: 'ollama', label: 'Ollama' }
            ])
        });
    });
}

export async function performLogin(page: Page, email = 'admin@example.com', password = 'correctpassword') {
    await page.goto('/login');
    await page.locator('#email').fill(email);
    await page.locator('#password').fill(password);
    await page.locator('button[type="submit"]').click();
} 