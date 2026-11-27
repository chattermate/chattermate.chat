import type { ButtonChat, ChannelConnector } from './chat'
import { email } from './email'
import { line } from './line'
import { instagram, messenger, whatsapp } from './meta'
import { plivo, twilio } from './sms'
import { slack } from './slack'
import { telegram } from './telegram'

/**
 * Every messaging channel the suite can drive end to end, by display name. A
 * journey that should hold on all channels loops over this; adding a channel is
 * one driver file and one line here.
 */
export const channels = {
  Telegram: telegram,
  WhatsApp: whatsapp,
  Messenger: messenger,
  Instagram: instagram,
  Slack: slack,
  LINE: line,
  'SMS (Twilio)': twilio,
  'SMS (Plivo)': plivo,
  Email: email,
} satisfies Record<string, ChannelConnector>

/** The channels that show the agent's suggested replies as tappable buttons. */
export const channelsWithButtons = {
  Telegram: telegram,
  WhatsApp: whatsapp,
  Messenger: messenger,
  Instagram: instagram,
} satisfies Record<string, ChannelConnector<ButtonChat>>

export type { EmailChat } from './email'
export type { LineChat } from './line'
export type { ButtonChat, ChannelChat, ChannelConnector, ConnectedChannel } from './chat'
