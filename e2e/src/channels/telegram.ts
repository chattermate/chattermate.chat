import { randomInt } from 'node:crypto'
import type { APIRequestContext } from '@playwright/test'
import { connectTelegram, routeToAgent, type ChannelAccount } from '../api/channels'
import type { ApiClient } from '../api/client'
import { env } from '../env'
import { FakeExternals } from '../fakes/externals'
import { unique } from '../support/ids'
import { step } from '../support/step'
import type { ChannelConnector } from './chat'

interface SetWebhookBody {
  url: string
  secret_token: string
}

interface SendMessageBody {
  chat_id: number | string
  text: string
  reply_markup?: { inline_keyboard?: Array<Array<{ text: string; callback_data: string }>> }
}

/**
 * Plays Telegram for one connected bot: delivers user messages to the backend's
 * webhook exactly as Telegram would (secret token header included) and reads the
 * bot's replies from what the backend sent to the fake Bot API.
 */
export class TelegramBot {
  readonly account: ChannelAccount
  private readonly request: APIRequestContext
  private readonly externals: FakeExternals
  private readonly secret: string
  private readonly token: string
  private updateId = 0

  private constructor(account: ChannelAccount, request: APIRequestContext, externals: FakeExternals, secret: string, token: string) {
    this.account = account
    this.request = request
    this.externals = externals
    this.secret = secret
    this.token = token
  }

  /** Connects a fresh bot to the org and routes it to `agentId`. */
  static async connect(api: ApiClient, request: APIRequestContext, agentId: string): Promise<TelegramBot> {
    return step('Connect a Telegram bot', async () => {
      const externals = new FakeExternals(request)
      const token = `${randomInt(1e9)}:${unique('E2E')}`
      const account = await connectTelegram(api, token)
      await routeToAgent(api, account.id, agentId)
      // The secret Telegram would echo back — the backend sent it in setWebhook.
      const webhook = await externals.waitForCall<SetWebhookBody>('telegram', 'setWebhook', (body) => body.url.includes(account.id))
      return new TelegramBot(account, request, externals, webhook.secret_token, token)
    })
  }

  /** A private chat with one Telegram user. */
  chatWith(firstName: string): TelegramChat {
    return new TelegramChat(this, randomInt(1e9), firstName)
  }

  async deliver(update: Record<string, unknown>): Promise<void> {
    this.updateId += 1
    const response = await this.request.post(`${env.apiUrl}/webhooks/telegram/${this.account.id}`, {
      headers: { 'x-telegram-bot-api-secret-token': this.secret },
      data: { update_id: this.updateId, ...update },
    })
    if (!response.ok()) throw new Error(`Telegram webhook → ${response.status()}: ${await response.text()}`)
  }

  /** The bot's edits to messages it sent into `chatId`, oldest first. */
  async editsIn(chatId: number): Promise<TelegramEdit[]> {
    const calls = await this.externals.calls('telegram', 'editMessageText', { contains: `/bot${this.token}/` })
    return calls
      .filter((c) => c.status === 200 && String((c.body as TelegramEdit).chat_id) === String(chatId))
      .map((c) => c.body as TelegramEdit)
  }

  /** What the bot sent into `chatId`, with the message_id Telegram assigned each. */
  async messagesTo(chatId: number): Promise<Array<SendMessageBody & { message_id: number }>> {
    // Only what this bot sent: the Bot API puts the token in the path.
    const calls = await this.externals.calls('telegram', 'sendMessage', { contains: `/bot${this.token}/` })
    return calls
      .filter((c) => c.status === 200 && String((c.body as SendMessageBody).chat_id) === String(chatId))
      .map((c) => ({ ...(c.body as SendMessageBody), message_id: (c.response as { result: { message_id: number } }).result.message_id }))
  }
}

/** An editMessageText call: the bot changed a message it sent. */
export interface TelegramEdit {
  chat_id: number | string
  message_id: number
  text: string
}

export class TelegramChat {
  private readonly bot: TelegramBot
  readonly chatId: number
  readonly firstName: string
  private messageId = 0

  constructor(bot: TelegramBot, chatId: number, firstName: string) {
    this.bot = bot
    this.chatId = chatId
    this.firstName = firstName
  }

  async send(text: string): Promise<void> {
    await step(`${this.firstName} sends "${text}" on Telegram`, async () => {
      this.messageId += 1
      const user = { id: this.chatId, is_bot: false, first_name: this.firstName }
      await this.bot.deliver({
        message: { message_id: this.messageId, date: Math.floor(Date.now() / 1000), chat: { ...user, type: 'private' }, from: user, text },
      })
    })
  }

  /** What the bot sent into this chat as it reads now: each message with its edits applied */
  async currentReplies(): Promise<string[]> {
    const sent = await this.bot.messagesTo(this.chatId)
    const edits = await this.bot.editsIn(this.chatId)
    return sent.map((m) => edits.filter((e) => e.message_id === m.message_id).at(-1)?.text ?? m.text)
  }

  /** Every message the bot has sent into this chat, oldest first. */
  async replies(): Promise<string[]> {
    return (await this.bot.messagesTo(this.chatId)).map((m) => m.text)
  }

  /** The buttons under the bot's latest message that has any. */
  async buttons(): Promise<string[]> {
    const withKeyboard = (await this.bot.messagesTo(this.chatId)).filter((m) => m.reply_markup?.inline_keyboard?.length)
    return (withKeyboard.at(-1)?.reply_markup?.inline_keyboard ?? []).flat().map((b) => b.text)
  }

  /** Taps a button under the bot's latest keyboard, as Telegram reports it (callback_query). */
  async tap(title: string): Promise<void> {
    await step(`${this.firstName} taps "${title}" on Telegram`, async () => {
      const keyboardMessage = (await this.bot.messagesTo(this.chatId)).filter((m) => m.reply_markup?.inline_keyboard?.length).at(-1)
      const button = (keyboardMessage?.reply_markup?.inline_keyboard ?? []).flat().find((b) => b.text === title)
      if (!keyboardMessage || !button) throw new Error(`no "${title}" button in the latest Telegram keyboard`)
      const user = { id: this.chatId, is_bot: false, first_name: this.firstName }
      await this.bot.deliver({
        callback_query: {
          id: `cb-${Date.now()}`,
          from: user,
          // The message the keyboard is attached to — the bot's, not the user's —
          // with its keyboard, which is where the backend reads the button title.
          message: {
            message_id: keyboardMessage.message_id,
            date: Math.floor(Date.now() / 1000),
            chat: { ...user, type: 'private' },
            reply_markup: keyboardMessage.reply_markup,
          },
          data: button.callback_data,
        },
      })
    })
  }
}

/** Telegram as a ChannelConnector, for journeys that loop over every channel. */
export const telegram: ChannelConnector<TelegramChat> = ({ api, request, agentId }) => TelegramBot.connect(api, request, agentId)
