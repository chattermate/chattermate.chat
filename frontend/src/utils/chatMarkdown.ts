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

import { marked } from 'marked'
import type { Renderer } from 'marked'
import { sanitizeHtml } from '@/utils/sanitize'

marked.setOptions({ gfm: true, breaks: true })

// Links in a chat open in a new tab
const renderer = new marked.Renderer() as Renderer
renderer.link = function ({ href, title, text }) {
  if (!href) return text || ''
  const link = `<a href="${href}"${title ? ` title="${title}"` : ''}>${text}</a>`
  return link.replace(/^<a /, '<a target="_blank" rel="nofollow" ')
}
marked.use({ renderer })

/** A chat message's markdown as HTML that is safe to put on the page: a
 *  customer writes these, so the output is always sanitized. */
export const renderChatMarkdown = (text: string | null | undefined): string =>
  sanitizeHtml(marked.parse(text || '', { async: false }) as string)
