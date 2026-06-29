/*
ChatterMate - Widget Embed Snippet
Copyright (C) 2024 ChatterMate

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>
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
