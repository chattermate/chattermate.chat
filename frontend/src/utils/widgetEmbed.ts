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

function getWidgetUrl(): string {
  return import.meta.env.VITE_WIDGET_URL
}

/**
 * Build the embeddable <script> snippet for a widget.
 * - Simple (anonymous) variant: drops `window.chattermateId` + the loader script.
 * - Token-auth variant: fetches a short-lived token from the host's backend
 *   before loading the widget (used when the agent requires token auth).
 * Shared by the AI Agents list and the onboarding Launch step.
 */
export function buildWidgetEmbed(widgetId: string, requireTokenAuth?: boolean): string {
  const widgetUrl = getWidgetUrl()
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
        localStorage.setItem('ctid', token);
        const script = document.createElement('script');
        script.src = '${widgetUrl}/webclient/chattermate.min.js';
        document.head.appendChild(script);
        })
        .catch(e => console.error('[ChatterMate] Initialization failed:', e));
    })();
    <\/script>`
  }
  return `<script>window.chattermateId='${widgetId}';<\/script><script src="${widgetUrl}/webclient/chattermate.min.js"><\/script>`
}
