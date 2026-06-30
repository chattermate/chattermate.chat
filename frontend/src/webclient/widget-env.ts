// @ts-nocheck
export interface InitialData {
    widgetId: string;
    agentName: string;
    customization: Record<string, any>;
    customerId: string;
    customer: Record<string, any>;
    initialToken?: string;
}

// @ts-ignore
declare global {
    // @ts-ignore
    interface Window {
        // @ts-ignore
        __INITIAL_DATA__: InitialData;
    }
}

// Helper function to get runtime configuration
function getRuntimeConfig() {
    // @ts-ignore - APP_CONFIG might not be available at build time
    return typeof window !== 'undefined' && window.APP_CONFIG ? window.APP_CONFIG : {};
}

export const widgetEnv = {
    get API_URL() {
        const config = getRuntimeConfig();
        // Default to the production API so a plain `build:widget` (no VITE_API_URL,
        // no runtime APP_CONFIG) ships a working widget instead of localhost. Local
        // dev overrides via VITE_API_URL; self-hosters via window.APP_CONFIG.
        return config.API_URL || import.meta.env.VITE_API_URL || 'https://api.chattermate.chat/api/v1';
    },
    get WS_URL() {
        const config = getRuntimeConfig();
        return config.WS_URL || import.meta.env.VITE_WS_URL || 'wss://api.chattermate.chat';
    }
}
