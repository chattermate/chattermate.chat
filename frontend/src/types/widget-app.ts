export interface WidgetApp {
  id: string
  name: string
  description?: string
  organization_id: string
  created_by: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface WidgetAppWithKey extends WidgetApp {
  api_key: string // Only returned on create/regenerate
}

export interface WidgetAppCreate {
  name: string
  description?: string
}

export interface WidgetAppUpdate {
  name?: string
  description?: string
  is_active?: boolean
}

export interface WidgetAppListResponse {
  total: number
  apps: WidgetApp[]
}
