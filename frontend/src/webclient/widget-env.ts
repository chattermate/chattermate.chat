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

export const widgetEnv = {
    API_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
    WS_URL: import.meta.env.VITE_WS_URL || 'ws://localhost:8000'
}
