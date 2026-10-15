# Feature coverage (OSS)

One row per user journey. Every feature PR adds or updates its row and the spec that covers it.

- **Priority:** P1 is the first waves, P2 comes later, N runs nightly only.
- **Status:** ✅ covered · 🚧 in progress · ⬜ not yet

| Feature | Journey | Spec | Pri | Status |
|---|---|---|---|---|
| Setup and auth | First-run setup creates the org and lands on the dashboard | `specs/setup/org.setup.ts` | P1 | ✅ |
| Setup and auth | Admin signs in | `specs/auth/login.spec.ts` | P1 | ✅ |
| Setup and auth | Wrong password shows an error | `specs/auth/login.spec.ts` | P1 | ✅ |
| Setup and auth | Sign out | `specs/auth/login.spec.ts` | P1 | ✅ |
| Setup and auth | Agent role is denied AI settings | `specs/auth/login.spec.ts` | P1 | ✅ |
| Setup and auth | Sign-out, deactivation and a password change end sessions server-side; a refresh token is not an access token | `specs/auth/sessions.spec.ts` | P1 | ✅ |
| Team | The Agent role is refused every admin API; sees channels without secrets; assigned-only sees just its group's handovers | `specs/team/permissions.spec.ts` | P1 | ✅ |
| Widget chat | Customer gets the AI answer | `specs/widget/widget-chat.spec.ts` | P1 | ✅ |
| Widget chat | History survives a reload | `specs/widget/widget-chat.spec.ts` | P1 | ✅ |
| Widget chat | First authorization answer lost (socket gets the anonymous token) → widget authorizes again and chats | `specs/widget/widget-chat.spec.ts` | P1 | ✅ |
| Widget chat | Email-first agent (gate → chat, person recorded), Ask anything panel, lead capture with no email asked — each also with the first authorization lost | `specs/widget/chat-styles.spec.ts` | P1 | ✅ |
| Widget chat | Agent wraps up → customer rates the chat → rating stored against the agent | `specs/widget/rating.spec.ts` | P1 | ✅ |
| Widget chat | Provider error, provider timeout and malformed reply each end in an apology; the next message works | `specs/widget/ai-failures.spec.ts` | P1 | ✅ |
| Human handover | AI hands over → contact form → agent takes over → two-way messages → the AI stays silent | `specs/handover/handover.spec.ts` | P1 | ✅ |
| Human handover | After hours, or nobody online: the chat waits in the team's queue with a reply that says so | `specs/handover/after-hours.org.spec.ts`, `nobody-online.spec.ts` | P1 | ✅ |
| Human handover | A visitor's attachment reaches the teammate through a signed link | `specs/handover/attachments.spec.ts` | P2 | ✅ |
| Agents | Create in the dashboard → edit instructions → they reach the model | `specs/agents/agent-editor.spec.ts` | P1 | ✅ |
| Agents | Toggles (handover, rating, reply buttons) | — | P1 | ⬜ |
| Knowledge | Add text → answer is grounded in it (real search) | `specs/knowledge/knowledge-answer.spec.ts` | P1 | ✅ |
| Knowledge | Deleted knowledge stops reaching the model; one agent's never reaches another's | `specs/knowledge/knowledge-lifecycle.spec.ts` | P1 | ✅ |
| Knowledge | An uploaded PDF is indexed by the knowledge worker and answered from | `specs/knowledge/knowledge-pdf.spec.ts` | P2 | ✅ |
| AI config | Rejected key is reported (exact message) and agents keep working; the saved key is the one used | `specs/settings/ai-config.org.spec.ts` | P1 | ✅ |
| Tickets | AI opens a ticket → listed → agent changes status | `specs/tickets/ai-ticket.spec.ts` | P1 | ✅ |
| Tickets | Resolving tells the customer in their chat | `specs/tickets/ai-ticket.spec.ts` | P1 | ✅ |
| Tickets | Confirmation window runs out → closed → customer rates → CSAT kept, and the ask is in the thread (worker, `@redis`) | `specs/tickets/ai-ticket.spec.ts` | P2 | ✅ |
| Lead capture | Visitor shares details → appears as a Lead in People with their name and company | `specs/leads/lead-capture.spec.ts` | P1 | ✅ |
| People | Rename, phone, mark customer; international and unique phones; a WhatsApp contact keeps their number | `specs/leads/people.spec.ts` | P2 | ✅ |
| Team | Admin adds an agent who signs in to the inbox; Agent role sees only Inbox/People/Settings | `specs/team/team.spec.ts` | P1 | ✅ |
| Team | Groups management UI | — | P1 | ⬜ |
| Widget JS API | open/close/isOpen; hidden launcher + page's own trigger button | `specs/widget/js-api.spec.ts` | P1 | ✅ |
| Widget placement | Left side; sidebar mode; dashboard display settings with no code, site config wins; welcome message and colour | `specs/widget/placement.spec.ts` | P1 | ✅ |
| Widget placement | `open({message})`, events | — | P1 | ⬜ |
| Token-auth widget | Server-issued token → chat works; no, tampered, other-widget or expired token is refused | `specs/widget/token-auth.spec.ts` | P1 | ✅ |
| Reply buttons | Telegram, WhatsApp, Messenger, Instagram: AI offers buttons, a tap gets the next answer | `specs/channels/reply-buttons.spec.ts` | P2 | ✅ |
| Reply buttons | Widget quick replies; typed-number matching | — | P2 | ⬜ |
| Help center | Only published articles are public; unpublishing takes one down | `specs/help-center/publishing.org.spec.ts` | P2 | ✅ |
| Help center | Search | — | P2 | ⬜ |
| Workflows | One-message flow greets once and answers once with no AI call; a question branches on the answer; AND across two answers (true, false, an answer that looks like code, a non-number); a missing branch stops instead of taking the other | `specs/workflows/workflows.spec.ts` | P2 | ✅ |
| MCP connectors | An agent answers from a real MCP server's tool; header secrets masked on read, kept on save; a server that is down costs only its own tools, and Test says it could not connect | `specs/mcp/connectors.spec.ts` | P2 | ✅ |
| Channels | Telegram, WhatsApp, Messenger, Instagram, Slack, LINE, SMS (Twilio, Plivo), email: a signed inbound message gets the AI reply on the same channel | `specs/channels/replies.spec.ts` | P2 | ✅ |
| Channels | WhatsApp customer asks for a person → agent takes over in the inbox → reply goes out on WhatsApp | `specs/channels/handover.spec.ts` | P2 | ✅ |
| Channels | Email reply is threaded (Re: subject, In-Reply-To) | `specs/channels/email.spec.ts` | P2 | ✅ |
| Channels | Forged webhooks refused on every channel; echoes, receipts and bot messages never reach the model | `specs/channels/forged-webhooks.spec.ts` | P2 | ✅ |
| Channels | A refused send is marked Not delivered; list and long-title buttons stay within WhatsApp's limits | `specs/channels/delivery.spec.ts` | P2 | ✅ |
| Channels | A provider's retry gets one answer (`@redis`) | `specs/channels/retries.spec.ts` | P2 | ✅ |
| Channels | A WhatsApp number or Messenger Page from the customer's own Meta app (manual credentials + app secret) receives messages at its own webhook address; a wrong secret is refused; the address never takes another app's number | `specs/channels/own-meta-app.spec.ts` | P2 | ✅ |
| Channels | A WhatsApp number whose token Meta refuses is flagged, the Integrations card names it, and reconnecting or the next delivered reply clears it; a message-level refusal does not flag it | `specs/channels/needs-reconnect.spec.ts` | P2 | ✅ |
| Channels | Media messages; disconnect | — | P2 | ⬜ |
| Analytics | A conversation counts for its agent; the dashboard renders | `specs/analytics/analytics.spec.ts` | P2 | ✅ |
| CRM | HubSpot install, manual sync and automatic push (worker) with the lead's details | `specs/crm/hubspot.org.spec.ts` | P2 | ✅ |
| CRM | Pipedrive install (Basic-auth token exchange) and a captured lead pushed as organisation, person, lead and note | `specs/crm/pipedrive.org.spec.ts` | P2 | ✅ |
| Integrations | Jira connect from Settings (real browser OAuth round trip) and the AI filing an issue in the agent's project | `specs/integrations/jira.org.spec.ts` | P2 | ✅ |
| Integrations | Shopify install and link, order status answered from the shop, lookup refused without the customer's email | `specs/integrations/shopify.org.spec.ts` | P2 | ✅ |
| Visual and cross-browser widget | Widget on Firefox, WebKit, Android, iPhone; screenshots light/dark | `--project=widget-*`, `specs/visual` | P2 | ✅ (nightly) |
| Accessibility | axe on key screens (dark and light themes) and the widget: no serious findings anywhere; a per-screen baseline catches regressions | `specs/a11y` | P2 | ✅ |
| Performance | Loader/widget size budgets; reply-time budget | `specs/perf` | P2 | ✅ |
| Security basics | HttpOnly/Secure sign-in cookies; no CORS for other origins | `specs/security` | P2 | ✅ |
| Org website and API access | Changing the org's website allows the new site and revokes the old one | `specs/security/org-domain-cors.org.spec.ts` | P2 | ✅ |

Enterprise journeys are tracked privately in `enterprise_frontend/e2e/FEATURES.md`.
