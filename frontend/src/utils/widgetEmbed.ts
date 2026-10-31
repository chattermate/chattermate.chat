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

import { getApiUrl } from '@/config/api'
import { WIDGET_INSTALL_GUIDE_URL } from '@/config/docs'

// The loader (chattermate.min.js) is served by THIS frontend, so resolve its
// origin at snippet-generation time from where the dashboard is running — no
// build-time VITE_WIDGET_URL bake, so a self-hosted install just works.
function getLoaderOrigin(): string {
  return typeof window !== 'undefined' ? window.location.origin : ''
}

/**
 * Build the embeddable <script> snippet for a widget.
 * - Simple (anonymous) variant: drops `window.chattermateId` + the loader script.
 * - Token-auth variant: fetches a short-lived token from the host's backend
 *   before loading the widget (used when the agent requires token auth).
 * Shared by the AI Agents list and the onboarding Launch step. Its exact text
 * is pinned in __tests__/fixtures/widget-snippet.txt, which other code that
 * builds the snippet tests against too.
 *
 * `window.chattermateBaseUrl` is baked into the snippet from the runtime API URL
 * so the embedded widget (running on the customer's own site, where APP_CONFIG is
 * absent) talks to THIS install's backend instead of the vendor cloud.
 */
export function buildWidgetEmbed(widgetId: string, requireTokenAuth?: boolean): string {
  const loaderOrigin = getLoaderOrigin()
  const apiUrl = getApiUrl()
  if (requireTokenAuth) {
    return `<!-- Get token from your backend: POST /api/v1/generate-token with API key -->
<!-- Security Note: Widget ID and token are cryptographically bound in the JWT. -->
    <script>
    (function() {
    fetch('/api/chattermate')
        .then(r => r.json())
        .then(d => {
        let token, widget_id;
        if (d.data && d.data.token && d.data.widget_id) {
            token = d.data.token;
            widget_id = d.data.widget_id;
        } else if (d.token && d.token.data && d.token.data.data) {
            token = d.token.data.data.token;
            widget_id = d.token.data.data.widget_id;
        } else if (d.token && d.widget_id) {
            token = d.token;
            widget_id = d.widget_id;
        }
        if (!token || !widget_id) throw new Error('Failed to extract token or widget_id');
        window.chattermateId = widget_id;
        window.chattermateBaseUrl = '${apiUrl}';
        localStorage.setItem('ctid', token);
        const script = document.createElement('script');
        script.src = '${loaderOrigin}/webclient/chattermate.min.js';
        document.head.appendChild(script);
        })
        .catch(e => console.error('[ChatterMate] Initialization failed:', e));
    })();
    <\/script>`
  }
  return `<script>
  window.chattermateId = '${widgetId}';
  window.chattermateBaseUrl = '${apiUrl}';
<\/script>
<script src="${loaderOrigin}/webclient/chattermate.min.js"><\/script>`
}

/** The AI website builders the install prompt is for, as the hints name them. */
export const AI_BUILDERS = 'Lovable, Bolt, v0, Cursor, Framer AI and similar tools'

/**
 * A prompt for an AI website builder (Lovable, Bolt, v0, Cursor...) that adds
 * the widget for the user: the exact snippet and where it belongs. Empty when
 * there is no snippet to install.
 */
export function buildAiInstallPrompt(snippet: string): string {
  if (!snippet) return ''
  return [
    'Add the ChatterMate chat widget to every page of my website.',
    'Paste this snippet just before the closing </body> tag:',
    '',
    snippet,
    '',
    '- React or Vite: add it once to index.html, not inside a component.',
    '- Next.js: load it with next/script in the root layout.',
    '- WordPress: use a header and footer code plugin.',
    '- Change nothing else on the site.',
    `Install guide: ${WIDGET_INSTALL_GUIDE_URL}`,
  ].join('\n')
}

/**
 * The hosts a strict site's frame-src must allow: the API the snippet points the
 * loader at (it frames /frame there), and the frame host that redirects to.
 */
export function widgetFrameSources(frameHost: string | null): string[] {
  let api = ''
  try {
    api = new URL(getApiUrl(), getLoaderOrigin() || undefined).origin
  } catch {
    // No usable API address: only the frame host is known
  }
  return [...new Set([api, frameHost].filter((origin): origin is string => Boolean(origin)))]
}

/**
 * The Content-Security-Policy lines a site with a strict policy adds so the
 * widget can load: the loader script (for the script snippet) and the hosts
 * that frame the widget, which the browser checks across the redirect too.
 */
export function buildWidgetCsp(frameSources: string[], withLoaderScript = true): string {
  const lines = []
  if (withLoaderScript) lines.push(`script-src ${getLoaderOrigin()};`)
  if (frameSources.length) lines.push(`frame-src ${frameSources.join(' ')};`)
  return lines.join('\n')
}
