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

import { agentService } from '@/services/agent'
import { widgetService } from '@/services/widget'
import { AGENT_TYPE_DEFAULTS } from '@/utils/agentDefaults'
import { ensureAiConfig } from '@/utils/aiConfig'

/** A widget and the agent that answers on it, as the connect page lists them. */
export interface SiteWidget {
  id: string
  agent: { name: string; display_name?: string | null }
}

// Agent names are kept short in the dashboard's lists
const NAME_MAX_LENGTH = 60

/** The agent's name for a site: the site's own name, else its host. */
export function siteAgentName(siteName: string, siteHost: string): string {
  const name = siteName.trim() || siteHost
  return name.length > NAME_MAX_LENGTH ? name.slice(0, NAME_MAX_LENGTH).trim() : name
}

/**
 * An AI agent with a widget for the site being connected, for an account
 * that has no widget yet (a new signup from the WordPress plugin). An agent
 * made earlier without a widget (setup left half way) gets the widget rather
 * than a second agent. Null when open source needs the admin's own AI
 * provider first.
 */
export async function createSiteWidget(name: string, managedAi: boolean): Promise<SiteWidget | null> {
  if (!(await ensureAiConfig(managedAi))) return null
  const [existing] = await agentService.getOrganizationAgents()
  const agent = existing ?? await agentService.createAgent({
    name,
    display_name: name,
    agent_type: 'customer_support',
    instructions: [AGENT_TYPE_DEFAULTS.customer_support],
    is_active: true,
    use_workflow: false,
  })
  const label = agent.display_name || agent.name
  const widget = await widgetService.createAgentWidget(agent.id, label)
  return { id: widget.id, agent: { name: agent.name, display_name: agent.display_name } }
}
