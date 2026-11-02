import type { ApiClient } from './client'

export interface JourneyStep {
  id: string
  title: string
  message?: string
  skippable?: boolean
  triggers?: Condition[]
  chips?: Array<{ label: string; kind?: 'text' | 'action'; value: string }>
  allowed_actions?: string[]
  done_when: Condition[]
}

export interface Condition {
  kind: 'url' | 'event' | 'ctx' | 'user' | 'action'
  value: string
  op?: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'exists'
  operand?: string | number | boolean
}

export interface Journey {
  id: string
  key: string
  name: string
  status: 'draft' | 'live' | 'paused'
  definition: { steps: Array<JourneyStep & { chips: Array<{ label: string; kind: 'text' | 'action'; value: string }>; allowed_actions: string[] }> }
}

/** A live journey on the agent, as the Journeys tab saves one. */
export async function createJourney(
  api: ApiClient,
  agentId: string,
  journey: { key: string; name: string; steps: JourneyStep[]; finish?: string; autoOpen?: boolean },
): Promise<Journey> {
  return api.post<Journey>(`/agent/${agentId}/journeys`, {
    data: {
      key: journey.key,
      name: journey.name,
      status: 'live',
      auto_open: journey.autoOpen ?? false,
      definition: {
        audience: { kind: 'everyone' },
        start: { kind: 'url', value: '/*' },
        steps: journey.steps,
        finish: { message: journey.finish ?? '' },
      },
    },
  })
}

/** The agent's journeys, highest priority first. */
export async function listJourneys(api: ApiClient, agentId: string): Promise<Journey[]> {
  return api.get<Journey[]>(`/agent/${agentId}/journeys`)
}
