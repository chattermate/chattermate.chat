import type { ApiClient } from './client'
import { env } from '../env'
import { sql, uuid } from '../support/db'

export interface Agent {
  id: string
  name: string
}

export interface NewAgent {
  name: string
  instructions: string[]
  agentType?: 'customer_support' | 'sales' | 'tech_support' | 'general' | 'custom'
  transferToHuman?: boolean
  /** Handover only happens if the agent has at least one group with an online member. */
  groupIds?: string[]
  /** The widget asks for a star rating when the agent ends the chat. */
  askForRating?: boolean
  /** The widget only loads with a conversation token from /generate-token. */
  requireTokenAuth?: boolean
  /** Offer the AI's quick replies as tappable buttons on messaging channels. */
  channelQuickReplies?: boolean
  /** Visitors may attach files (once a person has joined the chat). */
  allowAttachments?: boolean
}

export async function createAgent(api: ApiClient, agent: NewAgent): Promise<Agent> {
  const created = await api.post<Agent>('/agent', {
    data: {
      name: agent.name,
      agent_type: agent.agentType ?? 'customer_support',
      instructions: agent.instructions,
      transfer_to_human: agent.transferToHuman ?? false,
      ask_for_rating: agent.askForRating ?? false,
      require_token_auth: agent.requireTokenAuth ?? false,
      channel_quick_replies: agent.channelQuickReplies ?? false,
      allow_attachments: agent.allowAttachments ?? false,
    },
  })
  if (agent.groupIds?.length) {
    await api.put(`/agent/${created.id}/groups`, { data: agent.groupIds })
  }
  // Every new agent starts on the new widget design. The classic run's specs are
  // about the original widget, so there each agent is one made before it.
  if (env.widgetUi === 1) makeLegacyAgent(String(created.id))
  return { id: String(created.id), name: created.name }
}

/**
 * As an agent created before the new widget design: no customization row yet, so
 * no server mark (created_on_ui) and both designs on offer. No API makes one.
 */
export function makeLegacyAgent(agentId: string): void {
  sql(`DELETE FROM agent_customizations WHERE agent_id = '${uuid(agentId)}'`)
}

/** Turns lead capture on without the consent gate, so a scripted reply records the lead. */
export async function enableLeadCapture(api: ApiClient, agentId: string): Promise<void> {
  await api.put(`/agent/${agentId}/lead-capture`, { data: { enabled: true, require_consent: false } })
}
