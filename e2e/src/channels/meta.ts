import type { APIRequestContext } from '@playwright/test'
import { connectInstagram, connectMessenger, connectWhatsApp, connectWhatsAppSignup, routeToAgent, type ChannelAccount } from '../api/channels'
import type { ApiClient } from '../api/client'
import { env } from '../env'
import { FakeExternals, type RecordedCall } from '../fakes/externals'
import { unique } from '../support/ids'
import { step } from '../support/step'
import { ChatWithButtons, digits, hmac, phoneNumber, postWebhook, samePhone, sentWith, type Button, type ButtonChat, type ChannelConnector } from './chat'

// WhatsApp, Messenger and Instagram share one webhook (/webhooks/meta), signed
// with the Meta app secret; `object` in the body says which product sent it.
// A number or Page from the customer's OWN Meta app is signed with that app's
// secret instead, and reaches its account's own address (/webhooks/meta/<id>).

/** Where Meta posts a webhook, and the app secret it signs it with. */
export interface MetaWebhook {
  path: string
  secret: string
}

const SHARED_META_WEBHOOK: MetaWebhook = { path: '/webhooks/meta', secret: env.channelSecrets.meta }

/** The X-Hub-Signature-256 header Meta puts on `json`. */
export function metaSignature(json: string, secret: string = env.channelSecrets.meta): Record<string, string> {
  return { 'x-hub-signature-256': `sha256=${hmac('sha256', secret, json).toString('hex')}` }
}

/** A Meta webhook POST, signed like Meta signs it. */
export async function deliverMeta(request: APIRequestContext, payload: Record<string, unknown>, to = SHARED_META_WEBHOOK): Promise<void> {
  const json = JSON.stringify(payload)
  await postWebhook(request, to.path, { json }, metaSignature(json, to.secret))
}

/** A Meta access token that owns `nodes` in the fake Graph (see fake-externals). */
export function metaToken(...nodes: string[]): string {
  return `owns:${nodes.join(',')}:${unique('token')}`
}

/** A customer's own Meta app (e.g. the one holding Meta's free test number):
 *  its tokens name it in the fake Graph, and Meta signs its webhooks with its secret. */
export interface OwnMetaApp {
  id: string
  secret: string
  token(...nodes: string[]): string
}

export function ownMetaApp(): OwnMetaApp {
  const id = digits(15)
  const secret = unique('appsecret')
  return { id, secret, token: (...nodes) => `owns:${nodes.join(',')}:app=${id}.${secret}:${unique('token')}` }
}

/** The backend path of an absolute webhook URL it handed out. */
function webhookPath(url: string): string {
  return new URL(url).pathname.replace(/^\/api\/v1/, '')
}

/** Where Meta sends a WhatsApp number's webhooks: the per-number callback the
 *  backend set (and the fake accepted), else the app's own callback — which
 *  is the customer's server, so here the shared address, refusing the app's secret. */
export async function whereMetaSends(externals: FakeExternals, phoneNumberId: string, app: OwnMetaApp): Promise<MetaWebhook> {
  const overrides = (await externals.calls('graph', phoneNumberId))
    .filter((c) => c.method === 'POST' && c.status === 200)
    .map((c) => (c.body as { webhook_configuration?: { override_callback_uri?: string } }).webhook_configuration)
    .filter((config) => config !== undefined)
  const url = overrides.at(-1)?.override_callback_uri
  return { path: url ? webhookPath(url) : SHARED_META_WEBHOOK.path, secret: app.secret }
}

/** What Meta does when the customer pastes a callback URL and verify token into
 *  their app and saves: a GET that must echo the challenge. */
export async function metaVerifiesCallback(request: APIRequestContext, url: string, verifyToken: string): Promise<boolean> {
  const challenge = unique('challenge')
  const response = await request.get(url, { params: { 'hub.mode': 'subscribe', 'hub.verify_token': verifyToken, 'hub.challenge': challenge } })
  return response.ok() && (await response.text()) === challenge
}

/** A pasted callback URL as the webhook Meta posts to, signed with the app's secret. */
export function pastedCallback(url: string, app: OwnMetaApp): MetaWebhook {
  return { path: webhookPath(url), secret: app.secret }
}

// ---------- WhatsApp ----------

interface WhatsAppSend {
  to: string
  type: string
  text?: { body: string }
  interactive?: {
    body: { text: string }
    action: { buttons?: Array<{ reply: Button }>; sections?: Array<{ rows: Button[] }> }
  }
}

type WhatsAppChoice = Button & { reply: 'button_reply' | 'list_reply' }

export interface WhatsAppNumber {
  account: ChannelAccount
  phoneNumberId: string
  token: string
}

/** Connects a WhatsApp Cloud API number by hand (phone number id + system-user token),
 *  from the customer's own Meta app when `app` is given (its token, with its secret). */
export async function connectWhatsAppNumber(api: ApiClient, phoneNumberId = digits(15), app?: OwnMetaApp): Promise<WhatsAppNumber> {
  const token = app ? app.token(phoneNumberId) : metaToken(phoneNumberId)
  const account = await connectWhatsApp(api, phoneNumberId, token, app?.secret)
  return { account, phoneNumberId, token }
}

/**
 * Connects a number the way WhatsApp Embedded Signup does: the popup hands the
 * dashboard a code plus the WABA and number the customer picked, and the backend
 * trades the code for a token, lists the WABA's numbers and registers the number.
 * The code is a token owning both, which the fake Graph hands back on exchange.
 */
export async function signUpWhatsAppNumber(api: ApiClient, phoneNumberId = digits(15), wabaId = digits(15)): Promise<WhatsAppNumber> {
  return step('Connect a WhatsApp number with one-click signup', async () => {
    const token = metaToken(phoneNumberId, wabaId)
    const account = await connectWhatsAppSignup(api, token, wabaId, phoneNumberId)
    return { account, phoneNumberId, token }
  })
}

/** A delivery receipt WhatsApp posts for a message the number sent; `errors` as Meta words a failure. */
export async function deliverWhatsAppReceipt(request: APIRequestContext, number: WhatsAppNumber, status: 'sent' | 'delivered' | 'read' | 'failed',
  errors?: Array<{ code: number; title: string }>): Promise<void> {
  await deliverMeta(request, {
    object: 'whatsapp_business_account',
    entry: [{ id: digits(15), changes: [{ field: 'messages', value: {
      messaging_product: 'whatsapp',
      metadata: { phone_number_id: number.phoneNumberId },
      statuses: [{ id: `wamid.${unique('out')}`, status, timestamp: String(Math.floor(Date.now() / 1000)), recipient_id: phoneNumber().slice(1), ...(errors ? { errors } : {}) }],
    } }] }],
  })
}

/** The webhook body WhatsApp sends for one inbound message. */
export function whatsappPayload(phoneNumberId: string, waId: string, name: string, message: Record<string, unknown>): Record<string, unknown> {
  return {
    object: 'whatsapp_business_account',
    entry: [{ id: digits(15), changes: [{ field: 'messages', value: {
      messaging_product: 'whatsapp',
      metadata: { phone_number_id: phoneNumberId },
      contacts: [{ wa_id: waId, profile: { name } }],
      messages: [{ from: waId, id: `wamid.${unique('in')}`, timestamp: String(Math.floor(Date.now() / 1000)), ...message }],
    } }] }],
  }
}

/** A template message the business sent: its name, the body's values, and each quick reply's payload. */
export interface WhatsAppTemplateSend {
  name: string
  values: string[]
  payloads: string[]
}

interface TemplateComponent {
  type: string
  sub_type?: string
  parameters?: Array<{ type: string; text?: string; payload?: string }>
}

/** One WhatsApp user's chat with a connected number. */
export class WhatsAppChat extends ChatWithButtons<WhatsAppChoice> {
  readonly waId: string
  readonly number: WhatsAppNumber
  private readonly externals: FakeExternals
  private readonly inbound: (message: Record<string, unknown>) => Promise<void>

  /** `to` says where Meta sends this number's webhooks (the shared address by default). */
  constructor(request: APIRequestContext, externals: FakeExternals, number: WhatsAppNumber, customerName: string,
    to: () => Promise<MetaWebhook> = async () => SHARED_META_WEBHOOK) {
    const waId = phoneNumber().slice(1) // WhatsApp ids are the number without the +
    const inbound = async (message: Record<string, unknown>) =>
      deliverMeta(request, whatsappPayload(number.phoneNumberId, waId, customerName, message), await to())
    // Only what this number sent: its path, its token. The same endpoint carries
    // read receipts and typing indicators, which have no `type`.
    const sends = async () => (await externals.calls('graph', 'messages', { contains: waId }))
      .filter((c) => c.status === 200 && c.path.includes(`/${number.phoneNumberId}/messages`) && sentWith(c, number.token))
      .map((c) => c.body as WhatsAppSend)
      .filter((b) => (b.type === 'text' || b.type === 'interactive') && samePhone(b.to, waId))
    const latestChoices = async (): Promise<WhatsAppChoice[]> => {
      const action = (await sends()).filter((b) => b.interactive).at(-1)?.interactive?.action
      if (action?.sections) return action.sections.flatMap((s) => s.rows).map((r) => ({ ...r, reply: 'list_reply' as const }))
      return (action?.buttons ?? []).map((b) => ({ ...b.reply, reply: 'button_reply' as const }))
    }

    super('WhatsApp', customerName, {
      deliver: (text) => inbound({ type: 'text', text: { body: text } }),
      read: async () => (await sends()).map((b) => (b.type === 'text' ? b.text!.body : b.interactive!.body.text)),
      latestButtons: latestChoices,
      // A pick from a list arrives as list_reply, a button tap as button_reply.
      deliverTap: (button) => inbound({ type: 'interactive', interactive: { type: button.reply, [button.reply]: { id: button.id, title: button.title } } }),
    })
    this.waId = waId
    this.number = number
    this.externals = externals
    this.inbound = inbound
  }

  /** The template messages this number sent the customer (a business-initiated message), oldest first. */
  async templates(): Promise<WhatsAppTemplateSend[]> {
    const calls = await this.externals.calls('graph', 'messages', { contains: this.waId })
    return calls
      .filter((c) => c.status === 200 && c.path.includes(`/${this.number.phoneNumberId}/messages`) && sentWith(c, this.number.token))
      .map((c) => c.body as { type?: string; to?: string; template?: { name: string; components?: TemplateComponent[] } })
      .filter((b) => b.type === 'template' && samePhone(b.to, this.waId))
      .map((b) => {
        const components = b.template?.components ?? []
        return {
          name: b.template?.name ?? '',
          values: components.filter((c) => c.type === 'body').flatMap((c) => (c.parameters ?? []).map((p) => p.text ?? '')),
          payloads: components.filter((c) => c.sub_type === 'quick_reply').map((c) => c.parameters?.[0]?.payload ?? ''),
        }
      })
  }

  /** Taps a template's quick-reply button: WhatsApp sends its text with the payload the business set. */
  tapTemplateButton(text: string, payload: string): Promise<void> {
    return step(`${this.customerName} taps "${text}" on WhatsApp`, () =>
      this.inbound({ type: 'button', button: { text, payload } }))
  }
}

export const whatsapp: ChannelConnector<WhatsAppChat> = ({ api, request, agentId }) =>
  step('Connect a WhatsApp number', async () => {
    const number = await connectWhatsAppNumber(api)
    await routeToAgent(api, number.account.id, agentId)
    const externals = new FakeExternals(request)
    return { chatWith: (customerName) => new WhatsAppChat(request, externals, number, customerName) }
  })

// ---------- Messenger and Instagram (the Send API on a page) ----------

interface PageSend {
  recipient: { id: string }
  message?: { text?: string; quick_replies?: Array<{ title: string; payload: string }> }
}

export function pageChat(
  label: string,
  request: APIRequestContext,
  externals: FakeExternals,
  object: 'page' | 'instagram',
  pageId: string,
  token: string,
  customerName: string,
  to = SHARED_META_WEBHOOK,
  // Where replies go: a Page token only works on the Facebook graph, so that is
  // every account except one connected with Instagram Login
  provider: 'graph' | 'graph-instagram' = 'graph',
): ChatWithButtons {
  const senderId = digits(16)
  const inbound = (message: Record<string, unknown>) => deliverMeta(request, {
    object,
    entry: [{ id: pageId, time: Date.now(), messaging: [{
      sender: { id: senderId },
      recipient: { id: pageId },
      timestamp: Date.now(),
      message: { mid: `m_${unique('in')}`, ...message },
    }] }],
  }, to)
  // `/me/messages` names no page: the token is the only proof of which page sent it.
  const sends = async () => (await externals.calls(provider, 'messages', { contains: senderId }))
    .filter((c: RecordedCall) => c.status === 200 && sentWith(c, token))
    .map((c) => c.body as PageSend)
    .filter((b) => b.recipient?.id === senderId && b.message?.text)

  return new ChatWithButtons(label, customerName, {
    deliver: (text) => inbound({ text }),
    read: async () => (await sends()).map((b) => b.message!.text!),
    latestButtons: async () => ((await sends())
      .filter((b) => b.message?.quick_replies?.length).at(-1)?.message?.quick_replies ?? [])
      .map((q) => ({ id: q.payload, title: q.title })),
    // A quick-reply tap is a message whose text is the title, with the payload attached.
    deliverTap: (button) => inbound({ text: button.title, quick_reply: { payload: button.id } }),
  })
}

/** A Facebook Page connected by hand (page id + page access token). */
export const messenger: ChannelConnector<ButtonChat> = ({ api, request, agentId }) =>
  step('Connect a Facebook Page', async () => {
    const pageId = digits(15)
    const token = metaToken(pageId)
    const account = await connectMessenger(api, pageId, token)
    await routeToAgent(api, account.id, agentId)
    const externals = new FakeExternals(request)
    return { chatWith: (customerName) => pageChat('Messenger', request, externals, 'page', pageId, token, customerName) }
  })

/** An Instagram professional account connected by hand: its IG user id and the
 *  token of the Facebook Page it is linked to, which owns both. */
export const instagram: ChannelConnector<ButtonChat> = ({ api, request, agentId }) =>
  step('Connect an Instagram account', async () => {
    const igId = digits(17)
    const token = metaToken(digits(15), igId)
    const account = await connectInstagram(api, igId, token)
    await routeToAgent(api, account.id, agentId)
    const externals = new FakeExternals(request)
    return { chatWith: (customerName) => pageChat('Instagram', request, externals, 'instagram', igId, token, customerName) }
  })
