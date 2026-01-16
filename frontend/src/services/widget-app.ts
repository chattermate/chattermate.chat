import api from './api'
import type {
  WidgetApp,
  WidgetAppCreate,
  WidgetAppUpdate,
  WidgetAppWithKey,
  WidgetAppListResponse
} from '@/types/widget-app'

export const widgetAppService = {
  async listApps(includeInactive: boolean = false): Promise<WidgetAppListResponse> {
    const response = await api.get('/widget-apps', {
      params: { include_inactive: includeInactive }
    })
    return response.data
  },

  async getApp(appId: string): Promise<WidgetApp> {
    const response = await api.get(`/widget-apps/${appId}`)
    return response.data
  },

  async createApp(data: WidgetAppCreate): Promise<WidgetAppWithKey> {
    const response = await api.post('/widget-apps', data)
    return response.data
  },

  async updateApp(appId: string, data: WidgetAppUpdate): Promise<WidgetApp> {
    const response = await api.patch(`/widget-apps/${appId}`, data)
    return response.data
  },

  async deleteApp(appId: string, hardDelete: boolean = false): Promise<void> {
    await api.delete(`/widget-apps/${appId}`, {
      params: { hard_delete: hardDelete }
    })
  },

  async regenerateApiKey(appId: string): Promise<WidgetAppWithKey> {
    const response = await api.post(`/widget-apps/${appId}/regenerate-key`)
    return response.data
  }
}
