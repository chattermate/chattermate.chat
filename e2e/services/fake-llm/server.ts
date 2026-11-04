// A deterministic stand-in for an OpenAI-compatible model, for e2e tests.
//
// The backend's agents are pointed here (AI config model_type OPENAI_COMPATIBLE,
// base_url http://127.0.0.1:14010/v1). Each test registers a *scenario* — scripted
// replies keyed by a `[[e2e:<id>]]` marker in its agent's instructions or by the
// agent's unique name — so parallel tests in one org never see each other's script.
//
// It speaks only what ChatterMate uses: non-streaming /v1/chat/completions, with or
// without a strict json_schema response_format (ChatAgent's ChatResponse), and tool
// calls. Anything else fails loudly instead of returning something plausible.
//
// Control API (used by src/fakes/llm.ts):
//   PUT    /__scenarios/:id            register/replace a ScenarioSpec
//   GET    /__scenarios/:id/requests   what the backend sent for that scenario
//   DELETE /__scenarios                forget everything (manual use only: scenario
//                                      ids are unique per test, and a reset would
//                                      wipe any other run sharing this fake)
//
// An API key starting with `e2e-invalid` is rejected with 401, like a real provider.
// A rule can also fail on purpose (fault: status, delay, malformed output).
//
// Run: node services/fake-llm/server.ts --port 14010   (Node >= 22.18 strips the types)

import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import type { Fault, RecordedRequest, Reply, ScenarioRule, ScenarioSpec } from './protocol.ts'

type Json = null | boolean | number | string | Json[] | { [key: string]: Json }
// JSON Schema is walked generically (properties, $ref, anyOf, …); typing every
// keyword buys nothing here.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JsonSchema = { [key: string]: any }

interface ChatMessage {
  role: string
  content?: string | Array<{ type: string; text?: string }> | null
  tool_calls?: unknown[]
}

interface ChatRequest {
  model?: string
  messages: ChatMessage[]
  stream?: boolean
  response_format?: { type: string; json_schema?: { name?: string; schema?: JsonSchema } }
  tools?: Array<{ type: string; function: { name: string } }>
}

const MARKER = /\[\[e2e:([\w-]+)\]\]/
const DEFAULT_SCENARIO = '__default'
const DEFAULT_REPLY: Reply = { message: 'Default reply from the e2e fake LLM.', text: 'OK' }
const MAX_RECORDED = 50
// Oldest scenarios are forgotten past this, so a fake that outlives many runs stays small.
const MAX_SCENARIOS = 5000

const scenarios = new Map<string, ScenarioSpec>()
const recorded = new Map<string, RecordedRequest[]>()

// ---------- request helpers ----------

function textOf(content: ChatMessage['content']): string {
  if (typeof content === 'string') return content
  if (Array.isArray(content)) return content.map((part) => part.text ?? '').join('\n')
  return ''
}

function selectScenario(req: ChatRequest): string {
  const all = req.messages.map((m) => textOf(m.content)).join('\n')
  const marker = MARKER.exec(all)
  if (marker && scenarios.has(marker[1])) return marker[1]
  for (const [id, spec] of scenarios) {
    if (spec.agentName && all.includes(spec.agentName)) return id
  }
  return DEFAULT_SCENARIO
}

function selectRule(spec: ScenarioSpec | undefined, lastUser: string): ScenarioRule | undefined {
  if (!spec) return undefined
  return spec.rules.find((rule) => !rule.match || new RegExp(rule.match.source, rule.match.flags).test(lastUser))
}

// ---------- structured output ----------

function resolveRef(schema: JsonSchema, root: JsonSchema): JsonSchema {
  if (typeof schema.$ref !== 'string') return schema
  const path = schema.$ref.replace(/^#\//, '').split('/')
  return path.reduce((node: JsonSchema, key: string) => node?.[key], root) ?? {}
}

function isNullable(schema: JsonSchema): boolean {
  if (Array.isArray(schema.type)) return schema.type.includes('null')
  const variants = schema.anyOf ?? schema.oneOf
  return Array.isArray(variants) && variants.some((v: JsonSchema) => v.type === 'null')
}

/** The minimal value that satisfies `schema` — the base every structured reply is built on. */
function defaultFor(rawSchema: JsonSchema, root: JsonSchema): Json {
  const schema = resolveRef(rawSchema, root)
  if ('default' in schema) return schema.default as Json
  if (isNullable(schema)) return null
  if (Array.isArray(schema.enum)) return schema.enum[0] as Json
  const variants = schema.anyOf ?? schema.oneOf ?? schema.allOf
  if (Array.isArray(variants) && variants.length) return defaultFor(variants[0], root)
  const type = Array.isArray(schema.type) ? schema.type[0] : schema.type
  switch (type) {
    case 'string': return ''
    case 'boolean': return false
    case 'number':
    case 'integer': return 0
    case 'array': return []
    case 'object':
    default: {
      const out: { [key: string]: Json } = {}
      for (const [key, prop] of Object.entries<JsonSchema>(schema.properties ?? {})) out[key] = defaultFor(prop, root)
      return out
    }
  }
}

function structuredContent(req: ChatRequest, reply: Reply): string {
  const schema = req.response_format?.json_schema?.schema
  const base = schema ? (defaultFor(schema, schema) as { [key: string]: Json }) : {}
  const message = reply.message ?? DEFAULT_REPLY.message
  return JSON.stringify({ ...base, message, ...(reply.fields as { [key: string]: Json } | undefined) })
}

// ---------- completion ----------

function completion(req: ChatRequest, message: { content: string | null; tool_calls?: unknown[] }, usage = { prompt_tokens: 1, completion_tokens: 1 }) {
  return {
    id: `chatcmpl-e2e-${Date.now()}`,
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model: req.model ?? 'e2e-fake',
    choices: [{
      index: 0,
      message: { role: 'assistant', ...message },
      finish_reason: message.tool_calls ? 'tool_calls' : 'stop',
    }],
    usage: { ...usage, total_tokens: usage.prompt_tokens + usage.completion_tokens },
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/** A scripted failure: an OpenAI-style error status, or garbage where JSON was asked for. */
function faulted(req: ChatRequest, fault: Fault, record: RecordedRequest) {
  if (fault.status) {
    record.answeredWith = `error:${fault.status}`
    throw new HttpError(fault.status, fault.message ?? 'The e2e fake LLM failed on purpose.')
  }
  record.answeredWith = 'malformed'
  return completion(req, { content: '{"message": "this reply is cut off' })
}

/** Tool results the model has had since the customer's last message: how far a tool sequence got. */
function toolResultsSinceLastUser(messages: ChatRequest['messages']): number {
  let count = 0
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === 'user') break
    if (messages[i].role === 'tool') count++
  }
  return count
}

async function answer(req: ChatRequest, authorization: string) {
  const scenarioId = selectScenario(req)
  const lastUserMsg = [...req.messages].reverse().find((m) => m.role === 'user')
  const lastUser = textOf(lastUserMsg?.content)
  const lastRole = req.messages.at(-1)?.role ?? ''
  const rule = selectRule(scenarios.get(scenarioId), lastUser)
  const tools = (req.tools ?? []).map((t) => t.function.name)
  const format = req.response_format
  const record: RecordedRequest = {
    at: new Date().toISOString(),
    system: req.messages.filter((m) => m.role === 'system' || m.role === 'developer').map((m) => textOf(m.content)).join('\n'),
    lastUser,
    lastRole,
    responseFormat: format ? (format.type === 'json_schema' ? `json_schema:${format.json_schema?.name ?? ''}` : format.type) : null,
    tools,
    toolResults: req.messages.filter((m) => m.role === 'tool').map((m) => textOf(m.content)),
    answeredWith: '',
    model: req.model ?? '',
    keySuffix: authorization.replace(/^Bearer\s+/i, '').slice(-6),
  }
  const list = recorded.get(scenarioId) ?? []
  list.push(record)
  recorded.set(scenarioId, list.slice(-MAX_RECORDED))

  if (rule?.fault?.delayMs) await sleep(rule.fault.delayMs)
  if (rule?.fault && (rule.fault.status || rule.fault.malformed)) return faulted(req, rule.fault, record)

  const usage = rule?.reply.usage
  let body
  const calls = rule?.toolCalls ?? (rule?.toolCall ? [rule.toolCall] : [])
  const hops = toolResultsSinceLastUser(req.messages)
  const nextCall = hops < calls.length ? calls[hops] : null
  if (nextCall) {
    if (!tools.includes(nextCall.name)) {
      throw new HttpError(422, `scenario '${scenarioId}' wants tool '${nextCall.name}' but the request only offers [${tools.join(', ')}]`)
    }
    record.answeredWith = `tool_call:${nextCall.name}`
    body = completion(req, {
      content: null,
      tool_calls: [{
        id: `call_e2e_${Date.now()}_${hops}`,
        type: 'function',
        function: { name: nextCall.name, arguments: JSON.stringify(nextCall.arguments) },
      }],
    })
  } else if (format && format.type !== 'text') {
    record.answeredWith = 'structured'
    body = completion(req, { content: structuredContent(req, rule?.reply ?? DEFAULT_REPLY) }, usage)
  } else {
    const reply = rule?.reply ?? DEFAULT_REPLY
    record.answeredWith = 'text'
    body = completion(req, { content: reply.text ?? reply.message ?? DEFAULT_REPLY.text! }, usage)
  }
  return body
}

// ---------- http ----------

class HttpError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function readJson(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(chunk as Buffer)
  const raw = Buffer.concat(chunks).toString('utf8')
  if (!raw) return {}
  try {
    return JSON.parse(raw)
  } catch {
    throw new HttpError(400, 'body is not JSON')
  }
}

function send(res: ServerResponse, status: number, body: unknown) {
  res.writeHead(status, { 'content-type': 'application/json' })
  res.end(JSON.stringify(body))
}

async function route(req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url ?? '/', 'http://fake-llm')
  const path = url.pathname.replace(/\/+$/, '')
  const scenarioPath = /^\/__scenarios\/([\w-]+)(\/requests)?$/.exec(path)

  if (req.method === 'GET' && path === '/health') return send(res, 200, { status: 'ok', scenarios: scenarios.size })
  if (req.method === 'GET' && path === '/v1/models') return send(res, 200, { object: 'list', data: [{ id: 'e2e-fake', object: 'model' }] })

  if (req.method === 'POST' && path === '/v1/chat/completions') {
    // Lets a test exercise the "invalid API key" path: the backend live-tests keys.
    if (/^Bearer e2e-invalid/.test(req.headers.authorization ?? '')) {
      throw new HttpError(401, 'Incorrect API key provided.')
    }
    const body = (await readJson(req)) as ChatRequest
    if (body.stream) throw new HttpError(400, 'the e2e fake LLM does not stream — ChatterMate never asks it to; if it does now, extend services/fake-llm')
    if (!Array.isArray(body.messages)) throw new HttpError(400, 'messages[] is required')
    return send(res, 200, await answer(body, req.headers.authorization ?? ''))
  }

  if (scenarioPath && req.method === 'PUT' && !scenarioPath[2]) {
    const spec = (await readJson(req)) as ScenarioSpec
    if (!Array.isArray(spec.rules)) throw new HttpError(400, 'rules[] is required')
    scenarios.set(scenarioPath[1], spec)
    recorded.delete(scenarioPath[1])
    while (scenarios.size > MAX_SCENARIOS) {
      const oldest = scenarios.keys().next().value!
      scenarios.delete(oldest)
      recorded.delete(oldest)
    }
    return send(res, 200, { ok: true })
  }
  if (scenarioPath && req.method === 'GET' && scenarioPath[2]) return send(res, 200, recorded.get(scenarioPath[1]) ?? [])
  if (req.method === 'DELETE' && path === '/__scenarios') {
    scenarios.clear()
    recorded.clear()
    return send(res, 200, { ok: true })
  }

  throw new HttpError(404, `no route for ${req.method} ${url.pathname}`)
}

const portArg = process.argv.indexOf('--port')
const port = Number(portArg > -1 ? process.argv[portArg + 1] : process.env.FAKE_LLM_PORT ?? 14010)

createServer((req, res) => {
  route(req, res).catch((err: unknown) => {
    const status = err instanceof HttpError ? err.status : 500
    const message = err instanceof Error ? err.message : String(err)
    console.error(`[fake-llm] ${req.method} ${req.url} -> ${status}: ${message}`)
    send(res, status, { error: { message, type: 'e2e_fake_llm_error' } })
  })
}).listen(port, '127.0.0.1', () => console.log(`[fake-llm] listening on http://127.0.0.1:${port}`))
