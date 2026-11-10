import type { ApiClient } from './client'

/** The agent's widget look (Agent → Customize), partial updates allowed. */
export async function customizeAgent(api: ApiClient, agentId: string, customization: Record<string, unknown>): Promise<void> {
  await api.post(`/agent/${agentId}/customization`, { data: customization })
}

/** Uploads the agent's launcher logo, as Agent → Chat Customization → Your logo does on save. */
export async function uploadLauncherLogo(api: ApiClient, agentId: string, file: { name: string; mimeType: string; buffer: Buffer }): Promise<void> {
  await api.post(`/agent/${agentId}/customization/logo`, { multipart: { logo: file } })
}
