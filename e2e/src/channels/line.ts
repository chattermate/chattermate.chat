import { connectLine, routeToAgent } from '../api/channels'
import { FakeExternals } from '../fakes/externals'
import { unique } from '../support/ids'
import { step } from '../support/step'
import { Chat, digits, hmac, once, postWebhook, sentWith, type ChannelConnector } from './chat'

interface LinePush { to: string; messages: Array<{ type: string; text?: string }> }

/** A LINE Official Account; the webhook is per account and signed with its channel secret. */
export const line: ChannelConnector = ({ api, request, agentId }) =>
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
        const profile = once(() => externals.respond(profileName
          ? { provider: 'line', action: userId, status: 200, body: { userId, displayName: profileName } }
          : { provider: 'line', action: userId, status: 404, body: { message: 'Not found' } }))
        return new Chat('LINE', customerName, async (text) => {
          await profile()
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
        `Line user ${userId.slice(0, 8)}`)
      },
    }
  })
