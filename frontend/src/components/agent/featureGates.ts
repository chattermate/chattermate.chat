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

/**
 * Paid agent features: the plan flag each needs, and what its upgrade modal says.
 * `newFlag`: a flag newer than some plan rows; a plan that doesn't name it yet
 * counts as having it, as the server's feature_gate.plan_flags does.
 */
export const FEATURE_GATES = {
  workflow: {
    feature: 'workflow',
    name: 'Workflow',
    title: 'Unlock Workflow Features',
    description: 'Workflow mode allows you to create sophisticated automation flows with conditional logic, multiple steps, and advanced integrations.',
    bullets: ['Visual workflow builder', 'Conditional logic & branching', 'Advanced integrations', 'Custom automation flows'],
  },
  mcp: {
    feature: 'mcp_tools',
    name: 'MCP Tools',
    title: 'Unlock MCP Tools',
    description: "MCP Tools enable integration with Model Context Protocol servers to extend your agent's capabilities with external data sources and services.",
    bullets: ['Connect to MCP servers', 'External data integration', 'Custom tool extensions', 'Protocol-based communication'],
  },
  advanced: {
    feature: 'advanced_settings',
    name: 'Advanced Settings',
    title: 'Unlock Advanced Settings',
    description: "Advanced settings provide fine-grained control over your agent's behavior, performance tuning, and enterprise-grade configuration options.",
    bullets: ['Performance optimization', 'Custom system prompts', 'Enterprise configurations', 'Advanced debugging tools'],
  },
  'lead-capture': {
    feature: 'lead_capture',
    name: 'Lead Capture',
    title: 'Unlock Lead Capture',
    description: 'Lead Capture lets your agent collect and qualify contact details from visitors — with triggers, qualifying questions, and custom fields — then routes qualified leads to your team.',
    bullets: ['Conversational lead capture', 'Qualifying questions', 'Custom fields', 'Qualified-lead routing'],
  },
  journeys: {
    feature: 'journeys',
    name: 'Journeys',
    title: 'Unlock Journeys',
    description: 'Guide users through your app step by step, and see where they drop off.',
    bullets: ['Step-by-step guides', 'Do-it-for-me actions', 'Drop-off funnel'],
  },
  'chat-initiation': {
    feature: 'chat_initiation',
    newFlag: true,
    name: 'Greeting messages',
    title: 'Unlock Greeting Messages',
    description: 'Engage visitors with custom messages above the chat bubble.',
    bullets: ['Messages above the launcher', 'Shown before the chat opens'],
  },
  'quick-actions': {
    feature: 'quick_actions',
    newFlag: true,
    name: 'Quick actions',
    title: 'Unlock Quick Actions',
    description: 'Show one-tap questions and actions when a visitor opens the chat.',
    bullets: ['One-tap quick actions', 'Shown on every page'],
  },
  'page-suggestions': {
    feature: 'page_suggestions',
    newFlag: true,
    name: 'Page suggestions',
    title: 'Unlock Page Suggestions',
    description: 'Show quick actions only on the pages they fit, such as your product or cart pages.',
    bullets: ['Quick actions for a page path', 'Product, cart and order pages', 'Questions from that page’s help articles'],
  },
  'follow-ups': {
    feature: 'follow_ups',
    newFlag: true,
    name: 'Follow-up questions',
    title: 'Unlock Follow-up Questions',
    description: 'Show up to three questions to ask next under an answer.',
    bullets: ['Suggested next questions', 'One tap to ask'],
  },
  ticketing: {
    feature: 'ai_ticketing',
    name: 'AI Ticketing',
    title: 'Unlock AI Ticketing',
    description: 'Let the agent open and investigate tickets.',
    bullets: ['AI-written tickets', 'Investigations'],
  },
} as const

export type GateKey = keyof typeof FEATURE_GATES
