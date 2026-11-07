// Wire types shared by the fake LLM server and the test-side client (src/fakes/llm.ts).
// Type-only: the server imports this with `import type`, so Node's type stripping
// needs nothing at runtime.

/** A serialisable RegExp. */
export interface Pattern {
  source: string
  flags: string
}

/**
 * What the model "says" for one matched turn.
 *
 * - `message` / `fields` fill a structured (json_schema) reply — e.g. ChatAgent's
 *   ChatResponse. `fields` overlays any schema field: transfer_to_human, create_ticket, …
 * - `text` is used for plain-text requests (the transfer agent, the key check).
 *   Falls back to `message`.
 */
export interface Reply {
  message?: string
  fields?: Record<string, unknown>
  text?: string
  /** Token counts to report, for metering. Default 1/1. */
  usage?: { prompt_tokens: number; completion_tokens: number }
}

/** How the turn goes wrong instead of (or before) answering. */
export interface Fault {
  /** Answer with this HTTP status and an OpenAI-style error instead of a completion. */
  status?: number
  message?: string
  /** Wait this long first — past AGENT_RUN_TIMEOUT to exercise the backend's timeout. */
  delayMs?: number
  /** Return content that is not the JSON the request's schema asks for. */
  malformed?: boolean
}

export interface ToolCall {
  name: string
  arguments: Record<string, unknown>
}

export interface ScenarioRule {
  /** Tested against the last user message. Omitted = matches anything (otherwise). */
  match?: Pattern
  /** Ask the backend to run a tool first; `reply` is sent after the tool result comes back. */
  toolCall?: ToolCall
  /**
   * Several tools, one per round trip, in this order: the next is asked for each
   * time a tool result comes back, and `reply` follows the last. Wins over toolCall.
   */
  toolCalls?: ToolCall[]
  reply: Reply
  fault?: Fault
}

export interface ScenarioSpec {
  /**
   * Some backend calls never see the agent's instructions (the transfer agent's prompt
   * has no `[[e2e:<id>]]` marker), so a scenario can also match on the unique agent name.
   */
  agentName?: string
  rules: ScenarioRule[]
}

export interface RecordedRequest {
  at: string
  system: string
  lastUser: string
  lastRole: string
  /** 'json_schema:<name>' | 'json_object' | null */
  responseFormat: string | null
  tools: string[]
  /** Contents of the tool-result messages in this request — e.g. what knowledge search returned. */
  toolResults: string[]
  /** What the fake answered: 'tool_call:<name>' | 'structured' | 'text' | 'error:<status>' | 'malformed' */
  answeredWith: string
  /** The model the backend asked for. */
  model: string
  /** The last 6 characters of the API key it sent — which key the org's config used. */
  keySuffix: string
}
