/*
Copyright 2024-2026 ChatterMate

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

/**
 * Each messaging channel's name, glyph and colour, for the inbox rows, the
 * thread header and the channel views. The glyph is one stroked path on a
 * 24x24 grid, drawn white on the channel's colour token.
 */
export interface ChannelGlyph {
  label: string
  /** SVG path data, viewBox 0 0 24 24 */
  path: string
  /** CSS colour (a design token) behind the glyph */
  color: string
}

const BUBBLE = 'M5 19.5l1.2-3.6A7.5 7.5 0 1 1 9 18.6z'

const CHANNELS: Record<string, ChannelGlyph> = {
  web: { label: 'Web chat', path: 'M4 5h16v11H9l-5 4z', color: 'var(--channel-web)' },
  whatsapp: { label: 'WhatsApp', path: BUBBLE, color: 'var(--channel-whatsapp)' },
  messenger: { label: 'Messenger', path: 'M12 3.5a8.5 8 0 0 0-5 14.5V21l3-1.7a9 9 0 0 0 2 .2 8.5 8 0 0 0 0-16zM7.5 13.5l3-3 2 2 3-3', color: 'var(--channel-messenger)' },
  instagram: { label: 'Instagram', path: 'M7.5 3.5h9a4 4 0 0 1 4 4v9a4 4 0 0 1-4 4h-9a4 4 0 0 1-4-4v-9a4 4 0 0 1 4-4zM12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z', color: 'var(--channel-instagram)' },
  telegram: { label: 'Telegram', path: 'M21 4L3 11l6 2 2 6 3-4 5 4z', color: 'var(--channel-telegram)' },
  slack: { label: 'Slack', path: 'M9 4v16M15 4v16M4 9h16M4 15h16', color: 'var(--channel-slack)' },
  email: { label: 'Email', path: 'M3.5 6h17v12h-17zM3.5 6.5l8.5 6.5 8.5-6.5', color: 'var(--channel-email)' },
  sms: { label: 'SMS', path: 'M4 5h16v11H9l-5 4zM8.5 10.5h7', color: 'var(--channel-sms)' },
  line: { label: 'LINE', path: BUBBLE, color: 'var(--channel-line)' },
  shopify: { label: 'Shopify', path: 'M6 8h12l-1 12H7zM9 8a3 3 0 0 1 6 0', color: 'var(--channel-shopify)' },
  api: { label: 'API', path: 'M8.5 7.5L4 12l4.5 4.5M15.5 7.5L20 12l-4.5 4.5', color: 'var(--channel-api)' },
}

/** A channel's glyph; one the inbox doesn't know is drawn as web chat with its own name. */
export function channelGlyph(channel?: string | null): ChannelGlyph {
  const key = channel || 'web'
  return CHANNELS[key] ?? { ...CHANNELS.web, label: key }
}

/** A channel's display name ("WhatsApp"). */
export const channelLabel = (channel?: string | null): string => channelGlyph(channel).label
