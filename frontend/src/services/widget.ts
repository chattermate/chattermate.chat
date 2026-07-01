/*
Copyright 2024-2026 ChatterMate

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import api from '@/services/api'
import type { Widget, WidgetCreate } from '@/types/widget'

class WidgetService {
  private baseUrl = '/widgets'

  async getWidgets(): Promise<Widget[]> {
    const response = await api.get(this.baseUrl)
    return response.data
  }

  async getWidget(id: string): Promise<Widget> {
    const response = await api.get(`${this.baseUrl}/${id}`)
    return response.data
  }

  async createWidget(data: WidgetCreate): Promise<Widget> {
    const response = await api.post(this.baseUrl, data)
    return response.data
  }

  async deleteWidget(id: string): Promise<void> {
    await api.delete(`${this.baseUrl}/${id}`)
  }

  async getWidgetDetails(id: string): Promise<Widget> {
    const response = await api.get(`${this.baseUrl}/${id}/details`)
    return response.data
  }
}

export const widgetService = new WidgetService()
