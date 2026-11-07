import type { APIRequestContext } from '@playwright/test'
import type { RecordedRequest, Reply, ScenarioRule, ScenarioSpec, ToolCall } from '../../services/fake-llm/protocol'
import { env } from '../env'

/** What a script needs to know about the agent it drives (see fixtures/resources.ts). */
export interface ScriptedAgent {
  name: string
  scenarioId: string
}

/** The text an agent's instructions carry so the fake LLM can find its script. */
export function scenarioMarker(scenarioId: string): string {
  return `[[e2e:${scenarioId}]]`
}

class RuleBuilder {
  private readonly script: Script
  private readonly match: ScenarioRule['match']
  private readonly delayMs?: number
  private readonly usage?: Reply['usage']

  constructor(script: Script, match: ScenarioRule['match'], delayMs?: number, usage?: Reply['usage']) {
    this.script = script
    this.match = match
    this.delayMs = delayMs
    this.usage = usage
  }

  /** Answer only after `ms` — past AGENT_RUN_TIMEOUT (.env.e2e) to make the backend give up. */
  after(ms: number): RuleBuilder {
    return new RuleBuilder(this.script, this.match, ms, this.usage)
  }

  /** Report these token counts with the answer, as a real provider's `usage` would. */
  costing(promptTokens: number, completionTokens: number): RuleBuilder {
    return new RuleBuilder(this.script, this.match, this.delayMs, { prompt_tokens: promptTokens, completion_tokens: completionTokens })
  }

  /** A normal answer. `fields` sets any other reply field, e.g. { end_chat: true }. */
  reply(message: string, fields?: Record<string, unknown>): Script {
    return this.script.add({ match: this.match, reply: { message, fields, usage: this.usage }, ...this.fault() })
  }

  /** The provider fails the request with `status` (500, 429, …) and an OpenAI-style error. */
  fail(status: number, message?: string): Script {
    return this.script.add({ match: this.match, reply: {}, fault: { status, message, delayMs: this.delayMs } })
  }

  /** The provider returns content that isn't the JSON the backend asked for. */
  malformed(): Script {
    return this.script.add({ match: this.match, reply: {}, fault: { malformed: true, delayMs: this.delayMs } })
  }

  private fault(): Pick<ScenarioRule, 'fault'> {
    return this.delayMs ? { fault: { delayMs: this.delayMs } } : {}
  }

  /** The agent decides to hand the chat to a human. */
  handOver(message: string): Script {
    return this.reply(message, { transfer_to_human: true, transfer_reason: 'DIRECT_REQUEST' })
  }

  /** The agent opens a support ticket through the backend's create_ticket tool. */
  createTicket(message: string, summary: string): Script {
    return this.callTool('create_ticket', { summary, description: summary }).thenReply(message)
  }

  /** The agent wraps up the chat (the widget then asks for a rating if the agent is set to). */
  endChat(message: string): Script {
    return this.reply(message, { end_chat: true, end_chat_reason: 'ISSUE_RESOLVED', request_rating: true })
  }

  /** The agent records a lead from details the visitor gave (with their consent). */
  captureLead(message: string, lead: { email: string; name?: string; company?: string }): Script {
    return this.reply(message, {
      request_lead_capture: true,
      lead_email: lead.email,
      lead_name: lead.name ?? null,
      lead_company: lead.company ?? null,
      lead_consent: true,
    })
  }

  /** The model calls a backend tool first, then answers with `reply` once the result is back. */
  callTool(name: string, args: Record<string, unknown>) {
    return this.callTools([{ name, arguments: args }])
  }

  /**
   * The model calls these tools one after another (each once the previous result is
   * back), then answers. Host actions pause the reply at each call.
   */
  callTools(calls: ToolCall[]) {
    return {
      thenReply: (message: string, fields?: Record<string, unknown>): Script =>
        this.script.add({ match: this.match, toolCalls: calls, reply: { message, fields, usage: this.usage }, ...this.fault() }),
    }
  }
}

/** Ordered rules: the first whose pattern matches the customer's last message wins. */
export class Script {
  readonly rules: ScenarioRule[] = []

  when(pattern: RegExp): RuleBuilder {
    return new RuleBuilder(this, { source: pattern.source, flags: pattern.flags })
  }

  otherwise(): RuleBuilder {
    return new RuleBuilder(this, undefined)
  }

  add(rule: ScenarioRule): Script {
    this.rules.push(rule)
    return this
  }
}

/** Test-side client for services/fake-llm. */
export class FakeLlm {
  private readonly request: APIRequestContext
  /** Every agent this client scripted — what failure diagnostics report on. */
  readonly scripted: ScriptedAgent[] = []

  constructor(request: APIRequestContext) {
    this.request = request
  }

  /**
   * Scripts what `agent` says. Example:
   *   await llm.script(agent, (s) => s.when(/human/i).handOver('Connecting you.').otherwise().reply('Hi!'))
   */
  async script(agent: ScriptedAgent, build: (script: Script) => Script): Promise<void> {
    const spec: ScenarioSpec = { agentName: agent.name, rules: build(new Script()).rules }
    const response = await this.request.put(`${env.fakeLlmUrl}/__scenarios/${agent.scenarioId}`, { data: spec })
    if (!response.ok()) throw new Error(`fake LLM rejected the script: ${await response.text()}`)
    if (!this.scripted.includes(agent)) this.scripted.push(agent)
  }

  /** Every request the backend sent for this agent — to assert on what reached the model. */
  async requests(agent: ScriptedAgent): Promise<RecordedRequest[]> {
    const response = await this.request.get(`${env.fakeLlmUrl}/__scenarios/${agent.scenarioId}/requests`)
    return (await response.json()) as RecordedRequest[]
  }
}

