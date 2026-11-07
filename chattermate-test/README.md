# ChatterMate Widget Test

This is a test project for the ChatterMate chat widget integration.

## UI options gallery

`ui-options.html` has one card per widget placement/behaviour (floating left/right,
custom size and offsets, sidebar drawers, search-bar trigger, hidden launcher + own
button, custom z-index, dashboard defaults, page-overrides-beat-dashboard, mobile).
Each opens `ui-test.html` with that configuration plus buttons for the whole JS API
(`open/close/toggle/isOpen`, `open({message})`, `hide/showLauncher`, `setPosition`,
`data-chattermate-open`, `trigger` selector) and an event log.

Use it in **Stub** mode (fake widget, no backend needed) or **Real** mode (set your
widget ID + API URL on the gallery page). The Loader URL setting controls where
`chattermate.min.js` comes from — the frontend dev server by default.

## Journeys demo (Ledgerly)

`journeys-demo.html` is a pretend invoicing app (a single-page app with real
`pushState` routing) that embeds the widget with in-app actions, page context,
app events, signed-in demo users (Maya on Free, Leo on Pro, or anonymous) and
three journeys. The panel on the left lists 13 scenarios, each with what to do
and what the AI should do, plus a log of every action, event and context update.

1. Backend on `localhost:8000` and dashboard on `localhost:3000` running.
2. Seed it (any dashboard login on that backend; its org needs Journeys):
   `CM_EMAIL=you@example.com CM_PASSWORD=… node journeys-demo/seed.mjs`
   It creates the "Ledgerly guide" agent, its actions and journeys, a widget
   limited to `localhost:4100` and a widget app whose key signs demo users in.
   Running it again updates them.
3. `PORT=4100 FRONTEND_ORIGIN=http://localhost:3000 npm start`, then open
   http://localhost:4100/app/dashboard. "New account" starts a person over.
4. Optional: `node journeys-demo/check.mjs [screenshot-dir]` runs the scenarios
   against the real model and prints PASS/FAIL with what the agent did (needs
   `npm install` in `../e2e` for Playwright).

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start the test server:

```bash
npm start
```

3. Open http://localhost:3000 in your browser

## Testing the Widget

1. Make sure the ChatterMate frontend development server is running (usually at http://localhost:5173)
2. Click the "Initialize Widget" button on the test page
3. Use the chat widget that appears in the bottom-right corner

## Development Notes

- The widget script is loaded from the local development server
- The test page uses a dummy widget ID ('test-widget-123')
- CORS is enabled to allow loading the widget script from a different origin

## Where things are served from

- **Loader** (`chattermate.min.js`) — the **frontend** (`http://localhost:5173/webclient/…`),
  the same origin the dashboard's embed snippet points at. The backend does **not**
  serve it, and no copy is kept in this folder: a copy goes stale and you end up
  testing an old widget while the source looks correct.
  It is a build artifact — after editing `frontend/src/webclient/chattermate.js` run
  `cd ../frontend && npm run build:webclient:prod`.
- **Widget app** (`widget.js`) — the backend, from `backend/assets/`. Rebuild with
  `cd ../frontend && npm run build:widget:prod` after changing `WidgetBuilder.vue`
  or the widget composables.
- **API** — set `window.chattermateBaseUrl`. Without it the loader falls back to the URL
  baked in at build time, which for a production build is the cloud API, so a "local"
  test silently talks to api.chattermate.chat.

## Troubleshooting

- **"Chat couldn't load on 'localhost'"** — the widget has an Allowed domains list
  (agent → Widget tab) and this site isn't on it. Add `localhost` (any port) or clear
  the list; with no list the widget loads anywhere, localhost included.
- **Dashboard placement settings not applying** — almost always a stale loader. Check the
  served file has the newer features: `curl -s <loader-url> | grep -c sidebar-left`.
- **Buttons do nothing on the gallery pages** — the loader failed to load; the page shows
  a red banner saying so.
