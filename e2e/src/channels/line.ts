import { connectLine, routeToAgent } from '../api/channels'
import { FakeExternals } from '../fakes/externals'
import { unique } from '../support/ids'
import { step } from '../support/step'
import { Chat, digits, hmac, postWebhook, sentWith, type ChannelConnector } from './chat'

interface LinePush { to: string; messages: Array<{ type: string; text?: string }> }

/** A LINE chat whose customer can start sharing their profile partway through. */
export class LineChat extends Chat {
  private readonly answerProfile: (name?: string) => Promise<void>

  constructor(customerName: string, deliver: (text: string) => Promise<void>, read: () => Promise<string[]>,
    unnamedLabel: string, answerProfile: (name?: string) => Promise<void>) {
    super('LINE', customerName, deliver, read, unnamedLabel)
    this.answerProfile = answerProfile
  }

  /** The customer adds the account as a friend: LINE's profile lookup now gives this name. */
  sharesProfileAs(name: string): Promise<void> {
    return step(`${this.customerName} adds the LINE account as a friend (profile name "${name}")`,
      () => this.answerProfile(name))
  }
}

/** A LINE Official Account; the webhook is per account and signed with its channel secret. */
export const line: ChannelConnector<LineChat> = ({ api, request, agentId }) =>
  step('Connect a LINE Official Account', async () => {
    const channelSecret = unique('line-secret')
    const accessToken = unique('line-token')
    const account = await connectLine(api, channelSecret, accessToken)
    await routeToAgent(api, account.id, agentId)
    const externals = new FakeExternals(request)

    return {
      chatWith(customerName, { profileName } = {}) {
        const userId = `U${digits(32)}`
        // LINE shares a display name only with an account the person added as a friend (404 otherwise).
        let stopAnswering: (() => Promise<void>) | undefined
        const answerProfile = async (name?: string) => {
          await stopAnswering?.()
          stopAnswering = await externals.respond(name
            ? { provider: 'line', action: userId, status: 200, body: { userId, displayName: name } }
            : { provider: 'line', action: userId, status: 404, body: { message: 'Not found' } })
        }
        let answering: Promise<void> | undefined
        return new LineChat(customerName, async (text) => {
          await (answering ??= answerProfile(profileName))
          const json = JSON.stringify({
            destination: account.external_account_id,
            events: [{
              type: 'message',
              mode: 'active',
              timestamp: Date.now(),
              source: { type: 'user', userId },
              webhookEventId: unique('ev'),
              message: { type: 'text', id: digits(14), text },
            }],
          })
          await postWebhook(request, `/webhooks/line/${account.id}`, { json }, {
            'x-line-signature': hmac('sha256', channelSecret, json).toString('base64'),
          })
        }, async () => (await externals.calls('line', 'push', { contains: userId }))
          .filter((c) => c.status === 200 && sentWith(c, accessToken))
          .map((c) => c.body as LinePush)
          .filter((b) => b.to === userId)
          .flatMap((b) => b.messages.map((m) => m.text ?? '')),
        `Line user ${userId.slice(0, 8)}`,
        async (name) => { await (answering ??= answerProfile(profileName)); await answerProfile(name) })
      },
    }
  })
