import { expect, type Frame, type FrameLocator, type Locator, type Page, type Request, type WebSocketRoute } from '@playwright/test'
import { env } from '../env'
import { unique } from '../support/ids'
import { step } from '../support/step'

export interface EmbedOptions {
  /** window.chattermateConfig — launcher, displayMode, position, trigger, … */
  config?: Record<string, unknown>
  /** window.chattermateToken, for agents that require token auth. */
  token?: string
  /** Put a `[data-chattermate-open]` button on the page. */
  withTriggerButton?: boolean
  /** Open the site under its second origin (env.customerSiteOtherUrl). */
  onOtherOrigin?: boolean
  /** The dashboard's iframe snippet instead of the script: the chat is already open. */
  snippet?: 'script' | 'iframe'
  /**
   * The last release's loader (srcdoc + cross-origin /data), as a browser that cached
   * it still runs, on the site's legacy origin (env.customerSiteLegacyUrl).
   */
  legacyLoader?: boolean
  /**
   * A hardened site's Content-Security-Policy (default-src 'none'; our script and API
   * allowed). `frameSrc` lists the origins it lets frame; without our frame host the
   * widget falls back to running inside the page, which fetches the widget
   * cross-origin, so that case runs on the CORS-listed legacy origin.
   */
  strictCsp?: { frameSrc: string[], onUnlistedOrigin?: boolean, nonceOnly?: boolean }
  /**
   * The site's `tokenProvider`: what its server answers when the widget asks for a
   * fresh conversation token. Counted in tokenRequests.
   */
  tokenProvider?: () => Promise<string>
  /** The site registers its in-app actions (open_page, send_invoice, set_currency, slow_open, fail_task). */
  withActions?: boolean
  /** ChatterMate.setContext(context) from the site's code. */
  context?: Record<string, unknown>
  /** ChatterMate.prompt(prompt) from the site's code. */
  prompt?: { message: string; suggestions?: string[]; open?: boolean }
}

type JsApiMethod = 'open' | 'close' | 'toggle' | 'isOpen' | 'showLauncher' | 'hideLauncher' | 'identify' | 'logout'

/** A request the widget frame made, with the Cookie header the browser sent along. */
export interface FrameRequest {
  /** `start`: the frame's /bootstrap. `socket`: the live chat's socket.io handshake. */
  kind: 'start' | 'socket'
  url: string
  cookie: string | null
}

/** The widget's live chat connection, from watchConnection(). */
export interface ChatConnection {
  /** The conversation token the widget connected with last. */
  token(): string
  /** Cuts the connection the way a network blip does; the widget dials again on its own. */
  drop(): Promise<void>
}

/** A widget start held back by failNextStart(), until it is let through to fail. */
export interface HeldStart {
  /** Answers the held /bootstrap with the error now. */
  fail(): Promise<void>
}

const header = (headers: Record<string, string> | undefined, name: string): string | null => {
  const found = Object.entries(headers ?? {}).find(([key]) => key.toLowerCase() === name)
  return found ? found[1] : null
}

/**
 * The customer's view: a pretend website with the widget embedded exactly the way the
 * dashboard's install snippet does it, and the chat inside the widget's iframe.
 *
 * Why CSS here: the loader's launcher (#chattermate-button) and the widget's message
 * bubbles have no accessible role or name yet. Keeping those selectors in this one
 * file means adding aria-labels later is a one-file change.
 */
export class ChatWidget {
  readonly page: Page
  readonly widgetId: string
  /** Who this visitor says they are when the widget asks (contact form, lead details). */
  readonly customer: { name: string; email: string }
  private readonly frame: FrameLocator
  private starts = 0
  private authorizationCount = 0
  private framesServed = 0
  private tokenAnswers = 0
  private tokenProviderExposed = false

  /** `customer` defaults to a new, unique visitor. */
  constructor(page: Page, widgetId: string, customer?: { name: string; email: string }) {
    this.page = page
    this.widgetId = widgetId
    const id = unique('customer')
    this.customer = customer ?? { name: `Customer ${id}`, email: `${id}@example.com` }
    this.frame = page.frameLocator('iframe.chattermate-iframe')
    page.on('request', (request) => {
      if (this.isStart(request)) this.starts++
      if (this.isAuthorization(request)) this.authorizationCount++
    })
    page.on('response', (response) => {
      // The frame page itself, not the redirect hop to the frame host
      if (this.isFramePage(response.url()) && (response.status() < 300 || response.status() >= 400)) this.framesServed++
    })
  }

  private isStart(request: Request): boolean {
    return request.method() === 'POST' && new URL(request.url()).pathname.endsWith(`/widgets/${this.widgetId}/bootstrap`)
  }

  private isAuthorization(request: Request): boolean {
    return request.method() === 'GET' && new URL(request.url()).pathname.endsWith(`/widgets/${this.widgetId}`)
  }

  private isFramePage(url: string): boolean {
    return url.startsWith('http') && new URL(url).pathname.endsWith(`/widgets/${this.widgetId}/frame`)
  }

  /** How many times the widget asked to start (/bootstrap) on this page so far. */
  get startAttempts(): number {
    return this.starts
  }

  /** How many times the widget's frame page was served on this page so far (each try at loading it). */
  get frameLoads(): number {
    return this.framesServed
  }

  /** How many times the widget authorized the visitor (GET /widgets/{id}) on this page so far. */
  get authorizations(): number {
    return this.authorizationCount
  }

  /** How many times the site's tokenProvider was asked for a token. */
  get tokenRequests(): number {
    return this.tokenAnswers
  }

  /**
   * The first authorization answer that would bind the visitor to a customer
   * arrives without its token (a browser served an earlier stored answer, as one
   * did in production), so the widget dials the socket with the page's anonymous
   * token. Call before embed().
   */
  async loseFirstAuthorization(): Promise<void> {
    let lost = false
    await this.page.route(new RegExp(`/api/v1/widgets/${this.widgetId}(\\?|$)`), async (route) => {
      if (lost || route.request().method() !== 'GET') return route.fallback()
      const response = await route.fetch()
      const answer = await response.json()
      if (answer.token) {
        lost = true
        delete answer.token
      }
      await route.fulfill({ response, json: answer })
    })
  }

  /**
   * Passes the widget's socket.io connections through, noting the token each one
   * authenticates with, so a test can cut them. Call before embed().
   */
  async watchConnection(): Promise<ChatConnection> {
    const open: WebSocketRoute[] = []
    let token = ''
    await this.page.routeWebSocket(/\/socket\.io\//, (ws) => {
      const server = ws.connectToServer()
      open.push(ws)
      ws.onMessage((message) => {
        // Forwarded first: a frame this can't read must still reach the backend
        server.send(message)
        // socket.io's namespace connect: `40/widget,{"conversation_token": …}`
        const connect = /^40\/widget,(\{.*\})$/.exec(String(message))
        if (!connect) return
        try {
          token = JSON.parse(connect[1]).conversation_token ?? token
        } catch {
          // not a connect payload after all
        }
      })
    })
    return {
      token: () => token,
      drop: async () => {
        await step('The visitor\'s connection drops', async () => {
          for (const ws of open.splice(0)) await ws.close()
        })
      },
    }
  }

  /** Opens the pretend customer site (services/customer-site) with this widget embedded. */
  async embed(options: EmbedOptions = {}): Promise<void> {
    await step('Customer opens a site with the widget', async () => {
      const params = new URLSearchParams({ widget: this.widgetId })
      if (options.config) params.set('config', JSON.stringify(options.config))
      if (options.token) params.set('token', options.token)
      if (options.withTriggerButton) params.set('trigger', '1')
      if (options.snippet) params.set('snippet', options.snippet)
      if (options.withActions) params.set('actions', '1')
      if (options.context) params.set('context', JSON.stringify(options.context))
      if (options.prompt) params.set('prompt', JSON.stringify(options.prompt))
      if (options.tokenProvider) {
        params.set('tokenProvider', '1')
        await this.answerTokenRequests(options.tokenProvider)
      }
      let inPageFallback = false
      if (options.strictCsp) {
        params.set('csp', options.strictCsp.nonceOnly ? 'nonce' : 'strict')
        if (options.strictCsp.frameSrc.length) params.set('frameSrc', options.strictCsp.frameSrc.join(' '))
        else if (!options.strictCsp.onUnlistedOrigin) {
          inPageFallback = true
          params.set('loader', 'current')
        }
      }
      const site = options.legacyLoader || inPageFallback ? env.customerSiteLegacyUrl
        : options.onOtherOrigin ? env.customerSiteOtherUrl : env.customerSiteUrl
      await this.page.goto(`${site}/?${params}`)
    })
  }

  /** The visitor comes back to the site with `token` kept from an earlier visit. */
  async returnWithStoredToken(token: string): Promise<void> {
    await step('Customer comes back to the site', async () => {
      // The loader's own storage key (chattermate.js tokenKey)
      await this.page.evaluate((stored) => localStorage.setItem('ctid', stored), token)
      await this.page.reload()
    })
  }

  /** Opens a page that already carries this widget, e.g. a help center article. */
  async visit(url: string): Promise<void> {
    await step(`Customer opens ${url}`, async () => {
      await this.page.goto(url)
    })
  }

  /** The page's tokenProvider calls window.chattermateE2eToken (services/customer-site). */
  private async answerTokenRequests(mint: () => Promise<string>): Promise<void> {
    if (this.tokenProviderExposed) return
    this.tokenProviderExposed = true
    await this.page.exposeFunction('chattermateE2eToken', async () => {
      this.tokenAnswers++
      return mint()
    })
  }

  /**
   * The widget's next start (/bootstrap) is held, then fails with `status` once
   * fail() is called: a server outage that lands while the visitor is looking. Later
   * starts go through. Call before embed().
   */
  async failNextStart(status = 500): Promise<HeldStart> {
    let release!: () => void
    const released = new Promise<void>((resolve) => { release = resolve })
    let answered!: () => void
    const done = new Promise<void>((resolve) => { answered = resolve })
    let used = false
    await this.page.route(`**/widgets/${this.widgetId}/bootstrap`, async (route) => {
      if (used || !this.isStart(route.request())) return route.fallback()
      used = true
      await released
      await route.fulfill({ status, json: { detail: 'Internal Server Error' } })
      answered()
    })
    return {
      fail: async () => {
        release()
        await done
      },
    }
  }

  /**
   * Records the widget frame's start (/bootstrap) and socket.io handshake requests
   * with the Cookie header each carried. Call before embed(). The handshake is read
   * through the frame's own DevTools session (the frame runs in its own process
   * when it is on another site), attached while its start is held for a moment.
   * Chromium only (DevTools protocol).
   */
  async recordFrameRequests(): Promise<() => FrameRequest[]> {
    const seen: FrameRequest[] = []
    const sockets = new Map<string, FrameRequest>()
    this.page.on('requestfinished', async (request) => {
      if (!this.isStart(request)) return
      seen.push({ kind: 'start', url: request.url(), cookie: header(await request.allHeaders(), 'cookie') })
    })
    const watch = async (frame: Frame | null) => {
      const context = this.page.context()
      // A same-site frame shares the page's session; newCDPSession refuses it
      const session = await (frame ? context.newCDPSession(frame).catch(() => context.newCDPSession(this.page)) : context.newCDPSession(this.page))
      const socket = (requestId: string) => {
        if (!sockets.has(requestId)) {
          const entry: FrameRequest = { kind: 'socket', url: '', cookie: null }
          sockets.set(requestId, entry)
          seen.push(entry)
        }
        return sockets.get(requestId)!
      }
      session.on('Network.webSocketCreated', ({ requestId, url }) => { socket(requestId).url = url })
      // The headers as sent, and the raw ones the network stack reports back
      session.on('Network.webSocketWillSendHandshakeRequest', ({ requestId, request }) => {
        const entry = socket(requestId)
        entry.cookie ??= header(request.headers, 'cookie')
      })
      session.on('Network.webSocketHandshakeResponseReceived', ({ requestId, response }) => {
        const entry = socket(requestId)
        entry.cookie ??= header(response.requestHeaders, 'cookie')
      })
      await session.send('Network.enable')
    }
    await this.page.route(`**/widgets/${this.widgetId}/bootstrap`, async (route) => {
      if (this.isStart(route.request())) await watch(route.request().frame())
      await route.fallback()
    })
    return () => seen.map((request) => ({ ...request }))
  }

  /** Names of the cookies this browser holds for the host the widget's frame runs on. */
  async cookiesOnFrameHost(): Promise<string[]> {
    const origin = this.frameOrigin()
    if (!origin) throw new Error('the widget frame is not on the page')
    const { hostname } = new URL(origin)
    const cookies = await this.page.context().cookies()
    return cookies.filter((c) => {
      const domain = c.domain.replace(/^\./, '')
      return hostname === domain || hostname.endsWith(`.${domain}`)
    }).map((c) => c.name)
  }

  /** Whether the widget was built inside the page (srcdoc) rather than framed from our origin. */
  async runsInPage(): Promise<boolean> {
    return (await this.page.locator('iframe.chattermate-iframe').getAttribute('srcdoc')) !== null
  }

  /** The origin the widget's frame runs on (the frame host, or the API's own origin). */
  frameOrigin(): string | null {
    const frame = this.page.frames().find((f) => this.isFramePage(f.url()))
    return frame ? new URL(frame.url()).origin : null
  }

  async open(): Promise<void> {
    await step('Customer opens the chat', async () => {
      await this.launcher.click()
      await this.expectReady()
    })
  }

  /** Opens the chat of an agent that asks for an email before the conversation. */
  async openToEmailGate(): Promise<void> {
    await step('Customer opens the chat and is asked for an email', async () => {
      await this.launcher.click()
      await expect(this.emailGate).toBeVisible()
    })
  }

  /** Answers the email gate with this visitor's email; the chat is then ready. */
  async giveEmail(): Promise<void> {
    await step(`Customer gives ${this.customer.email}`, async () => {
      await this.emailGate.fill(this.customer.email)
      await this.frame.getByRole('button', { name: 'Continue to chat' }).click()
      await this.expectReady()
    })
  }

  /** Opens an "Ask anything" agent: its answer panel, not the chat window. */
  async openAskAnything(): Promise<void> {
    await step('Customer opens the Ask anything panel', async () => {
      await this.launcher.click()
      await expect(this.askBox).toBeEditable()
    })
  }

  async ask(text: string): Promise<void> {
    await step(`Customer asks "${text}"`, async () => {
      await this.askBox.fill(text)
      await this.askBox.press('Enter')
    })
  }

  /** The chat is connected and accepting messages ("Connecting..." until the socket is up). */
  async expectReady(): Promise<void> {
    await expect(this.messageInput).toBeEditable()
  }

  async send(text: string): Promise<void> {
    await step(`Customer sends "${text}"`, async () => {
      await this.messageInput.fill(text)
      await this.messageInput.press('Enter')
      await expect(this.customerMessages.last()).toHaveText(text)
    })
  }

  /** Attaches a file and sends it with `text`, as a visitor picking it from their device. */
  async sendFile(file: { name: string; mimeType: string; content: string }, text: string): Promise<void> {
    await step(`Customer sends ${file.name}`, async () => {
      await this.frame.locator('input[type="file"]').setInputFiles({ name: file.name, mimeType: file.mimeType, buffer: Buffer.from(file.content) })
      await this.messageInput.fill(text)
      await this.messageInput.press('Enter')
      await expect(this.customerMessages.last()).toContainText(text)
    })
  }

  /** Fills the "Before we connect you to a teammate" form the widget shows on handover. */
  async shareContactDetails(): Promise<void> {
    await step('Customer shares contact details', async () => {
      const form = this.contactForm
      await expect(form).toBeVisible()
      await form.getByLabel('Email').fill(this.customer.email)
      await form.getByLabel('Name').fill(this.customer.name)
      await form.getByRole('button', { name: 'Submit' }).click()
      await expect(form.getByRole('button', { name: 'Submit' })).toBeHidden()
    })
  }

  /** Rates the finished chat; `stars` is 1–5. */
  async rate(stars: number, feedback?: string): Promise<void> {
    await step(`Customer rates the chat ${stars}/5`, async () => {
      // The star buttons are plain "★" glyphs with no accessible name.
      await this.frame.locator('.star-button').nth(stars - 1).click()
      if (feedback) await this.frame.getByPlaceholder('Please share your feedback (optional)').fill(feedback)
      await this.frame.getByRole('button', { name: 'Submit Rating' }).click()
    })
  }

  /** The same visitor in another tab of the same browser: same site storage, same token. */
  async inAnotherTab(): Promise<ChatWidget> {
    return new ChatWidget(await this.page.context().newPage(), this.widgetId, this.customer)
  }

  /** Presses Escape with the chat's message box focused, inside the widget's frame. */
  async pressEscapeInChat(): Promise<void> {
    await step('Customer presses Escape in the chat', async () => {
      await this.messageInput.press('Escape')
    })
  }

  /** Calls the public `window.ChatterMate` API the host page uses. */
  async api(method: JsApiMethod, ...args: unknown[]): Promise<unknown> {
    await this.page.waitForFunction(() => 'ChatterMate' in window)
    return this.page.evaluate(
      ({ method, args }) => (window as unknown as { ChatterMate: Record<string, (...a: unknown[]) => unknown> }).ChatterMate[method](...args),
      { method, args },
    )
  }

  /** The page's own "Chat with us" button (embed with withTriggerButton). */
  get hostChatButton(): Locator {
    return this.page.getByRole('button', { name: 'Chat with us' })
  }

  get launcher(): Locator {
    return this.page.locator('#chattermate-button')
  }

  /** The chat panel; it carries `.active` while open. */
  get panel(): Locator {
    return this.page.locator('#chattermate-container')
  }

  /** Shown by the loader instead of a chat when the widget refuses to load (e.g. no token). */
  get unavailableNotice(): Locator {
    return this.page.getByText('Chat Unavailable')
  }

  /** What the "Chat Unavailable" card says went wrong. CSS: the card's text has no role. */
  get unavailableReason(): Locator {
    return this.page.locator('.chattermate-error-message')
  }

  /** The email field an email-first agent shows before the chat. */
  get emailGate(): Locator {
    return this.frame.getByPlaceholder('you@example.com', { exact: true })
  }

  /** The "Ask anything" panel's question box ("Connecting..." until the socket is up). */
  get askBox(): Locator {
    return this.frame.getByPlaceholder('Ask me anything...', { exact: true })
  }

  /** Answers in the "Ask anything" panel. CSS: the answers have no role or name. */
  lastAnswer(): Locator {
    return this.frame.locator('.askai__answer').last()
  }

  get messageInput(): Locator {
    return this.frame.getByPlaceholder('Type a message...', { exact: true })
  }

  /** The conversation — the widget's message log. */
  get messageLog(): Locator {
    return this.frame.getByRole('log', { name: 'Messages' })
  }

  /** The bubble shown while the agent writes its reply. */
  get typingBubble(): Locator {
    return this.frame.locator('.typing-indicator') // no accessible name of its own
  }

  /** Whether the message list has picked up a sideways scrollbar. */
  async scrollsSideways(): Promise<boolean> {
    return this.messageLog.evaluate((list) => list.scrollWidth > list.clientWidth)
  }

  /** Bot and human-agent replies — the widget renders both the same way. */
  get agentMessages(): Locator {
    return this.messageLog.locator('.message.agent-message .message-bubble')
  }

  lastAgentMessage(): Locator {
    return this.agentMessages.last()
  }

  get customerMessages(): Locator {
    return this.messageLog.locator('.message.user-message .message-bubble')
  }

  /** The agent's name in the chat header. */
  get agentName(): Locator {
    return this.frame.locator('.header-info h3')
  }

  /** The agent's welcome message, shown when the chat opens. */
  get welcomeMessage(): Locator {
    return this.frame.locator('.cm-welcome-block .message-bubble')
  }

  get contactForm(): Locator {
    return this.frame.locator('.form-message').filter({ hasText: 'Before we connect you to a teammate' })
  }

  get ratingThanks(): Locator {
    return this.frame.getByText('Thank you for your rating!')
  }

  /** The card asking the visitor before the site runs an action, named after the action. */
  actionConfirm(label: string): Locator {
    return this.frame.getByRole('group', { name: label })
  }

  /** The card's buttons say what happens ("Send an invoice", "Change to GBP"); the first one goes ahead. */
  async approveAction(label: string): Promise<void> {
    await step(`Customer approves "${label}"`, async () => {
      await this.actionConfirm(label).getByRole('button').first().click()
    })
  }

  /** "Not now", or "Keep <current value>" when the action would overwrite something. */
  async declineAction(label: string, button = 'Not now'): Promise<void> {
    await step(`Customer says no to "${label}"`, async () => {
      await this.actionConfirm(label).getByRole('button', { name: button }).click()
    })
  }

  /** The chat's line about what an action did: "Set default currency: USD → GBP", "Kept USD". */
  actionReceipt(text: string): Locator {
    return this.frame.getByRole('status').filter({ hasText: text })
  }

  /** What the site's own app shows (services/customer-site HOST_ACTIONS_SCRIPT). */
  get appStatus(): Locator {
    return this.page.getByRole('status', { name: 'App status' })
  }

  get appActionRuns(): Locator {
    return this.page.getByLabel('Action runs')
  }

  get appCurrency(): Locator {
    return this.page.getByLabel('Currency')
  }

  /** Shown under the message box when it looks like a password or key. */
  get secretWarning(): Locator {
    return this.frame.getByRole('alert').filter({ hasText: "Please don't paste passwords or keys here." })
  }

  get sendButton(): Locator {
    return this.frame.getByRole('button', { name: 'Send message' })
  }

  /** A reply chip under a message the site showed (ChatterMate.prompt). */
  replyChip(text: string): Locator {
    return this.frame.getByRole('button', { name: text, exact: true })
  }

  /** The journey's plan, pinned to the top of the chat: its name, the step the visitor is on, "1 of 3". */
  get journeyProgress(): Locator {
    return this.frame.getByRole('region', { name: /^Guide: / })
  }

  /** Folded by default; its steps, Skip and Hide show once opened. */
  async openJourneyPlan(): Promise<void> {
    const toggle = this.journeyProgress.getByRole('button', { expanded: false })
    if (await toggle.count()) await toggle.click()
  }

  async skipJourneyStep(): Promise<void> {
    await step('Customer skips the step', async () => {
      await this.openJourneyPlan()
      await this.journeyProgress.getByRole('button', { name: 'Skip this step' }).click()
    })
  }

  async hideJourney(): Promise<void> {
    await step('Customer hides the guide', async () => {
      await this.openJourneyPlan()
      await this.journeyProgress.getByRole('button', { name: 'Hide guide' }).click()
    })
  }

  /** The site's own code reporting something the user did: ChatterMate.notify(event). */
  async siteReports(event: string): Promise<void> {
    await step(`The site reports "${event}"`, async () => {
      await this.page.evaluate((name) => (window as unknown as { ChatterMate: { notify: (e: string) => void } }).ChatterMate.notify(name), event)
    })
  }

  async typeOnly(text: string): Promise<void> {
    await this.messageInput.fill(text)
  }

  get ratingPrompt(): Locator {
    return this.frame.getByText(/Rate the chat session/)
  }
}
