#!/usr/bin/env node
// Sets up the Ledgerly demo (journeys-demo.html) against a ChatterMate backend:
// an agent with Ledgerly's in-app actions, the scenario journeys, a widget
// limited to the demo's origin, and a widget app whose key signs demo users in.
// Safe to run again: it updates what it made last time.
//
//   CM_EMAIL=you@example.com CM_PASSWORD=… node journeys-demo/seed.mjs
//
// Optional: CM_API (default http://localhost:8000/api/v1), DEMO_ORIGIN
// (default http://localhost:4100). Writes journeys-demo/.env.local (gitignored),
// which server.js reads to serve the page and sign demo users in.

import { readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ACTIONS, AGENT, JOURNEYS } from './scenarios.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const STATE_FILE = join(here, '.env.local')
const API = (process.env.CM_API || 'http://localhost:8000/api/v1').replace(/\/$/, '')
const ORIGIN = process.env.DEMO_ORIGIN || 'http://localhost:4100'

const { CM_EMAIL: email, CM_PASSWORD: password } = process.env
if (!email || !password) {
  console.error('Set CM_EMAIL and CM_PASSWORD (a dashboard login on this backend).')
  process.exit(1)
}

let token = null

async function call(method, path, body, { form = false, ok = [] } = {}) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {}
  let payload
  if (body !== undefined) {
    if (form) {
      headers['Content-Type'] = 'application/x-www-form-urlencoded'
      payload = new URLSearchParams(body).toString()
    } else {
      headers['Content-Type'] = 'application/json'
      payload = JSON.stringify(body)
    }
  }
  const res = await fetch(`${API}${path}`, { method, headers, body: payload })
  const text = await res.text()
  if (!res.ok && !ok.includes(res.status)) throw new Error(`${method} ${path} → ${res.status}: ${text.slice(0, 300)}`)
  return text ? JSON.parse(text) : null
}

async function previousState() {
  try { return JSON.parse(await readFile(STATE_FILE, 'utf8')) } catch { return {} }
}

async function ensureAgent() {
  const agents = await call('GET', '/agent/list')
  const existing = agents.find((a) => a.name === AGENT.name)
  if (existing) {
    await call('PUT', `/agent/${existing.id}`, { instructions: AGENT.instructions })
    return existing.id
  }
  const created = await call('POST', '/agent', {
    name: AGENT.name, display_name: AGENT.displayName, agent_type: 'customer_support',
    instructions: AGENT.instructions, transfer_to_human: false,
  })
  return created.id
}

async function ensureWidget(agentId) {
  const widgets = await call('GET', `/widgets/agent/${agentId}`)
  const widget = widgets[0] ?? await call('POST', '/widgets', { name: 'Ledgerly demo', agent_id: agentId })
  // Actions and journeys only run on a site the widget is limited to.
  await call('PUT', `/widgets/${widget.id}/embed-settings`, { allowed_domains: [new URL(ORIGIN).host] })
  return widget.id
}

async function ensureActions(agentId) {
  const { actions } = await call('GET', `/agent/${agentId}/actions`)
  for (const action of ACTIONS) {
    const found = actions.find((a) => a.name === action.name)
    if (found) await call('PUT', `/agent/${agentId}/actions/${found.id}`, action)
    else await call('POST', `/agent/${agentId}/actions`, action)
  }
}

async function ensureJourneys(agentId) {
  const journeys = await call('GET', `/agent/${agentId}/journeys`)
  for (const journey of JOURNEYS) {
    const found = journeys.find((j) => j.key === journey.key)
    if (found) await call('PUT', `/agent/${agentId}/journeys/${found.id}`, journey)
    else await call('POST', `/agent/${agentId}/journeys`, journey)
  }
}

async function ensureApiKey(state) {
  // The key is shown once, so reuse the one saved last time while it still works.
  if (state.apiKey) {
    const check = await fetch(`${API}/widget-apps`, { headers: { Authorization: `Bearer ${token}` } })
    if (check.ok) return state.apiKey
  }
  const app = await call('POST', '/widget-apps', { name: `Ledgerly demo ${new Date().toISOString().slice(0, 16)}` })
  return app.api_key
}

const state = await previousState()
const login = await call('POST', '/users/login', { username: email, password }, { form: true })
token = login.access_token

const agentId = await ensureAgent()
const widgetId = await ensureWidget(agentId)
await ensureActions(agentId)
await ensureJourneys(agentId)
const apiKey = await ensureApiKey(state)

await writeFile(STATE_FILE, JSON.stringify({ apiUrl: API, origin: ORIGIN, agentId, widgetId, apiKey }, null, 2) + '\n')
console.log(`Agent ${agentId}, widget ${widgetId}: ${ACTIONS.length} actions, ${JOURNEYS.length} journeys.`)
console.log(`Saved to ${STATE_FILE}. Start the page with: PORT=${new URL(ORIGIN).port || 80} npm start`)
console.log(`Then open ${ORIGIN}/journeys-demo.html`)
