import type { ApiClient } from './client'

export type ConfirmPolicy = 'never' | 'always' | 'when_overwriting'

export interface AgentAction {
  id: string
  name: string
  label: string
  confirm: ConfirmPolicy
  enabled: boolean
  last_registered_at: string | null
}

/** What the e2e customer site's app code supplies (services/customer-site HOST_ACTIONS_SCRIPT). */
const SITE_ACTIONS: Record<string, { label: string; description: string; properties: Record<string, unknown>; confirm: ConfirmPolicy }> = {
  open_page: { label: 'Go to a page', description: 'Opens a page of the app.', properties: { path: { type: 'string' } }, confirm: 'never' },
  send_invoice: { label: 'Send an invoice', description: 'Emails an invoice.', properties: { to: { type: 'string' } }, confirm: 'always' },
  set_currency: { label: 'Set default currency', description: 'Sets the account currency.', properties: { code: { type: 'string' } }, confirm: 'when_overwriting' },
  slow_open: { label: 'Open slowly', description: 'Opens a page, slowly.', properties: { path: { type: 'string' } }, confirm: 'never' },
  fail_task: { label: 'Do a task', description: 'Always fails.', properties: {}, confirm: 'never' },
}

export type SiteAction = keyof typeof SITE_ACTIONS

/** Declares `name` on the agent, the way the Actions tab does, matching the site's code. */
export async function declareAction(api: ApiClient, agentId: string, name: SiteAction, overrides: Partial<{ confirm: ConfirmPolicy; enabled: boolean; timeout_s: number }> = {}): Promise<AgentAction> {
  const action = SITE_ACTIONS[name]
  return api.post<AgentAction>(`/agent/${agentId}/actions`, {
    data: {
      name,
      label: action.label,
      description: action.description,
      parameters: { type: 'object', properties: action.properties },
      confirm: action.confirm,
      ...overrides,
    },
  })
}

export async function listActions(api: ApiClient, agentId: string): Promise<AgentAction[]> {
  return (await api.get<{ actions: AgentAction[] }>(`/agent/${agentId}/actions`)).actions
}
