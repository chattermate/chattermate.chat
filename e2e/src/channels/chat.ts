import { createHmac, randomInt } from 'node:crypto'
import type { APIRequestContext, APIResponse } from '@playwright/test'
import type { ApiClient } from '../api/client'
import type { RecordedCall } from '../fakes/externals'
import { env } from '../env'
import { step } from '../support/step'

/** One customer's conversation with the business on a messaging channel. */
export interface ChannelChat {
  /** Delivers a message from the customer to the backend, as the provider would. */
  send(text: string): Promise<void>
  /** Every text the business sent into this chat, oldest first. */
  replies(): Promise<string[]>
  /** How the dashboard labels this customer until it learns their name ("Line user U56cf1f8"). */
  readonly unnamedLabel?: string
}

/** What the customer's platform profile shares about them. */
export interface ChatOptions {
  /** The name the platform's profile lookup gives; unset = the platform shares none. */
  profileName?: string
}

/** A chat on a channel that can show reply buttons (WhatsApp, Messenger, Instagram, Telegram). */
export interface ButtonChat extends ChannelChat {
  /** Titles of the buttons under the business's latest message that has any. */
  buttons(): Promise<string[]>
  /** Taps one of those buttons, reported the way the provider reports a tap. */
  tap(title: string): Promise<void>
}

/** A channel account connected to the test org and routed to the test agent. */
export interface ConnectedChannel<C extends ChannelChat = ChannelChat> {
  chatWith(customerName: string, options?: ChatOptions): C
}

export interface ConnectContext {
  api: ApiClient
  request: APIRequestContext
  agentId: string
}

/** Connects a fresh account of one channel; every call gets its own account. */
export type ChannelConnector<C extends ChannelChat = ChannelChat> = (ctx: ConnectContext) => Promise<ConnectedChannel<C>>

/**
 * A ChannelChat from the two things that differ per channel: how a customer
 * message is delivered and where the business's replies are recorded.
 */
export class Chat implements ChannelChat {
  protected readonly channel: string
  protected readonly customerName: string
  private readonly deliver: (text: string) => Promise<void>
  private readonly read: () => Promise<string[]>
  readonly unnamedLabel?: string

  constructor(channel: string, customerName: string, deliver: (text: string) => Promise<void>, read: () => Promise<string[]>,
    unnamedLabel?: string) {
    this.channel = channel
    this.customerName = customerName
    this.deliver = deliver
    this.read = read
    this.unnamedLabel = unnamedLabel
  }

  send(text: string): Promise<void> {
    return step(`${this.customerName} sends "${text}" on ${this.channel}`, () => this.deliver(text))
  }

  replies(): Promise<string[]> {
    return this.read()
  }
}

export interface Button {
  id: string
  title: string
}

/** A Chat whose business messages can carry buttons the customer taps. `B` is whatever a tap needs to know about a button. */
export class ChatWithButtons<B extends Button = Button> extends Chat implements ButtonChat {
  private readonly latestButtons: () => Promise<B[]>
  private readonly deliverTap: (button: B) => Promise<void>

  constructor(
    channel: string,
    customerName: string,
    io: {
      deliver: (text: string) => Promise<void>
      read: () => Promise<string[]>
      latestButtons: () => Promise<B[]>
      deliverTap: (button: B) => Promise<void>
      unnamedLabel?: string
    },
  ) {
    super(channel, customerName, io.deliver, io.read, io.unnamedLabel)
    this.latestButtons = io.latestButtons
    this.deliverTap = io.deliverTap
  }

  async buttons(): Promise<string[]> {
    return (await this.latestButtons()).map((b) => b.title)
  }

  tap(title: string): Promise<void> {
    return step(`${this.customerName} taps "${title}" on ${this.channel}`, async () => {
      const button = (await this.latestButtons()).find((b) => b.title === title)
      if (!button) throw new Error(`no "${title}" button under the latest ${this.channel} message`)
      await this.deliverTap(button)
    })
  }
}

/** Runs `prepare` once, before the first delivery: a profile is looked up on the first message. */
export function once(prepare: () => Promise<unknown>): () => Promise<void> {
  let done: Promise<unknown> | undefined
  return async () => { await (done ??= prepare()) }
}

export type WebhookPayload = { json: string } | { form: Record<string, string> }

/**
 * POSTs a provider webhook to the backend and hands back the response, whatever
 * its status — for tests of what the backend refuses. JSON goes as the exact
 * string that was signed: re-serialising would change the bytes the signature covers.
 */
export function sendWebhook(request: APIRequestContext, path: string, payload: WebhookPayload, headers: Record<string, string> = {}): Promise<APIResponse> {
  return 'json' in payload
    ? request.post(`${env.apiUrl}${path}`, { data: payload.json, headers: { 'content-type': 'application/json', ...headers } })
    : request.post(`${env.apiUrl}${path}`, { form: payload.form, headers })
}

/** sendWebhook for a delivery that must be accepted. */
export async function postWebhook(request: APIRequestContext, path: string, payload: WebhookPayload, headers: Record<string, string> = {}): Promise<void> {
  const response = await sendWebhook(request, path, payload, headers)
  if (!response.ok()) throw new Error(`POST ${path} → ${response.status()}: ${(await response.text()).slice(0, 300)}`)
}

export function hmac(algorithm: 'sha1' | 'sha256', secret: string, data: string): Buffer {
  return createHmac(algorithm, secret).update(data).digest()
}

/** `n` random digits, never starting with 0 — ids and phone numbers no other test uses. */
export function digits(n: number): string {
  let out = String(randomInt(1, 10))
  while (out.length < n) out += String(randomInt(0, 10))
  return out
}

/** A UK mobile number in E.164 (what the backend stores as the customer's phone). */
export function phoneNumber(): string {
  return `+447${digits(9)}`
}

/** True when the backend authenticated `call` with `token` — i.e. it was sent as that account. */
export function sentWith(call: RecordedCall, token: string): boolean {
  return call.headers.authorization === `Bearer ${token}`
}

/** Phone numbers compared the way providers differ on them: digits only. */
export function samePhone(a: unknown, b: string): boolean {
  return String(a).replace(/\D/g, '') === b.replace(/\D/g, '')
}
