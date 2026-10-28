import { test as base, expect, type APIRequestContext, type Browser, type BrowserContext, type BrowserContextOptions, type Page, type TestInfo } from '@playwright/test'
import { ApiClient } from '../api/client'
import { signedInClient } from '../api/auth'
import { createAgent, enableLeadCapture } from '../api/agents'
import { createGroup, createUser } from '../api/team'
import { createWidget } from '../api/widgets'
import { ChatWidget } from '../components/chat-widget'
import { Sidebar } from '../components/sidebar'
import { FakeExternals } from '../fakes/externals'
import { FakeLlm, scenarioMarker, type ScriptedAgent } from '../fakes/llm'
import { attachDiagnostics, startDiagnostics } from './diagnostics'
import { readOrgState, type OrgState } from '../org-state'
import { AgentsPage } from '../pages/agents.page'
import { AiConfigPage } from '../pages/ai-config.page'
import { Dashboard } from '../pages/dashboard.page'
import { HumanAgentsPage } from '../pages/human-agents.page'
import { InboxPage } from '../pages/inbox.page'
import { KnowledgePage } from '../pages/knowledge.page'
import { LoginPage } from '../pages/login.page'
import { PeoplePage } from '../pages/people.page'
import { TicketsPage } from '../pages/tickets.page'
import { WidgetAllowedDomainsPage } from '../pages/widget-allowed-domains.page'
import { unique } from '../support/ids'
import { blockThirdParty } from './network'

export interface AgentSettings {
  /** Hand chats to the org's support group (Sam Agent) when the model asks to. */
  transferToHuman: boolean
  /** The widget asks for a star rating when the agent ends the chat. */
  askForRating: boolean
  /** The widget only loads with a conversation token (see api/widget-apps.ts). */
  requireTokenAuth: boolean
  /** Lead capture on, without the consent gate. */
  leadCapture: boolean
  /** Quick replies become tappable buttons on messaging channels. */
  channelQuickReplies: boolean
  /** Visitors may attach files once a person has joined the chat. */
  allowAttachments: boolean
}

const DEFAULT_AGENT_SETTINGS: AgentSettings = {
  transferToHuman: false,
  askForRating: false,
  requireTokenAuth: false,
  leadCapture: false,
  channelQuickReplies: false,
  allowAttachments: false,
}

export type TestAgent = ScriptedAgent & { id: string }

export interface MemberOptions {
  role?: string
  groupIds?: string[]
  /** "Assigned only" when false: the user form's AI-queue toggle. */
  seeAllAiChats?: boolean
}

/** A team member a test created, with a seeding client signed in as them. */
export interface Member {
  id: string
  name: string
  email: string
  password: string
  api: ApiClient
}

/** The human team a handover test's chats go to: one online Agent-role member in their own group. */
export interface HandoverTeam {
  groupId: string
  member: { id: string; name: string; email: string; password: string }
}

interface Options {
  /** Override per describe: test.use({ agentSettings: { transferToHuman: true } }). */
  agentSettings: Partial<AgentSettings>
}

interface WorkerFixtures {
  org: OrgState
  /** Seeding client signed in as the org admin. */
  adminApi: ApiClient
}

interface TestFixtures {
  /** Automatic: on failure, attaches the backend log, model requests and third-party calls. */
  diagnostics: void
  llm: FakeLlm
  /** A fresh AI agent per test, scripted through `llm`. */
  agent: TestAgent
  /** Another AI agent — e.g. one per group in a routing test. `groupIds` are its handover groups. */
  makeAgent: (settings?: Partial<AgentSettings>, groupIds?: string[]) => Promise<TestAgent>
  /** The customer-facing widget for `agent`, on `customerPage`. */
  widget: ChatWidget
  /** A visitor's browser: its own context, never signed in to the dashboard. */
  customerPage: Page
  /** A widget for any agent id — e.g. one a test created through the UI. */
  makeWidget: (agentId: string) => Promise<ChatWidget>
  /**
   * Another visitor on `widget`'s site, in a browser of their own. Pass `customer`
   * to have them claim someone's name and email.
   */
  makeVisitor: (customer?: { name: string; email: string }) => Promise<ChatWidget>
  /**
   * The team this test's agent hands over to (with transferToHuman): a member and
   * group of its own, so no other test's chats crowd its inbox or change its member.
   * Created on first call — tests that never hand over never pay for one.
   */
  handoverTeam: () => Promise<HandoverTeam>
  /** The handover team member's dashboard inbox, in a separate signed-in browser. */
  inbox: InboxPage
  /**
   * A new user in the org (Agent role unless told otherwise), signed in through
   * the API on a request context of their own — the backend prefers a cookie over
   * a Bearer token, so two people must never share one. Signing in marks them online.
   */
  makeMember: (options?: MemberOptions) => Promise<Member>
  /** A second, signed-out browser — for signing in as someone a test just created. */
  anonymousPage: Page
  loginPage: LoginPage
  dashboard: Dashboard
  sidebar: Sidebar
  aiConfigPage: AiConfigPage
  agentsPage: AgentsPage
  knowledgePage: KnowledgePage
  ticketsPage: TicketsPage
  peoplePage: PeoplePage
  humanAgentsPage: HumanAgentsPage
  /** The agent editor's Widget tab, where the widget's allowed domains are edited. */
  allowedDomainsPage: WidgetAllowedDomainsPage
}

/**
 * Every extra browser a fixture opens gets the running project's browser settings
 * (viewport, device, motion, timezone, …) — never its storageState, which is the admin's.
 */
async function newContext(browser: Browser, testInfo: TestInfo, options: BrowserContextOptions = {}) {
  const { contextOptions, baseURL, serviceWorkers, timezoneId, locale, colorScheme, viewport, userAgent,
    deviceScaleFactor, isMobile, hasTouch } = testInfo.project.use
  const context = await browser.newContext({
    ...contextOptions,
    baseURL, serviceWorkers, timezoneId, locale, colorScheme, viewport, userAgent,
    deviceScaleFactor, isMobile, hasTouch,
    // Explicitly empty: Playwright's browser fixture otherwise hands every new
    // context the project's storageState, signing visitors in as the admin
    storageState: { cookies: [], origins: [] },
    ...options,
  })
  await blockThirdParty(context)
  return context
}

export const test = base.extend<TestFixtures & Options, WorkerFixtures>({
  agentSettings: [{}, { option: true }],

  org: [async ({}, use) => use(readOrgState()), { scope: 'worker', box: true }],

  adminApi: [async ({ playwright, org }, use) => {
    const request = await playwright.request.newContext()
    const { api } = await signedInClient(new ApiClient(request), org.admin.email, org.admin.password)
    await use(api)
    await request.dispose()
  }, { scope: 'worker', box: true }],

  context: async ({ context }, use) => {
    await blockThirdParty(context)
    await use(context)
  },

  llm: [async ({ request }, use) => use(new FakeLlm(request)), { box: true }],

  diagnostics: [async ({ llm, request }, use, testInfo) => {
    const start = startDiagnostics()
    await use()
    await attachDiagnostics(testInfo, start, llm, new FakeExternals(request))
  }, { auto: true, box: true }],

  makeMember: [async ({ adminApi, playwright }, use) => {
    const contexts: APIRequestContext[] = []
    await use(async ({ role = 'Agent', groupIds = [], seeAllAiChats } = {}) => {
      const id = unique('member')
      const person = { name: `Member ${id}`, email: `${id}@e2e.example.com`, password: 'E2e-Member-Passw0rd!' }
      const user = await createUser(adminApi, { ...person, role, seeAllAiChats })
      for (const groupId of groupIds) await adminApi.post(`/groups/${groupId}/users/${user.id}`)
      const context = await playwright.request.newContext()
      contexts.push(context)
      const { api } = await signedInClient(new ApiClient(context), person.email, person.password)
      return { ...person, id: user.id, api }
    })
    await Promise.all(contexts.map((c) => c.dispose()))
  }, { box: true }],

  handoverTeam: [async ({ adminApi }, use) => {
    let team: Promise<HandoverTeam> | undefined
    await use(() => (team ??= (async () => {
      const id = unique('teammate')
      const member = { name: `Teammate ${id}`, email: `${id}@e2e.example.com`, password: 'E2e-Agent-Passw0rd!' }
      const user = await createUser(adminApi, { ...member, role: 'Agent' })
      const groupId = await createGroup(adminApi, `Team ${id}`, [user])
      return { groupId, member: { ...member, id: user.id } }
    })()))
  }, { box: true }],

  makeAgent: [async ({ adminApi }, use) => {
    await use(async (agentSettings = {}, groupIds = []) => {
      const settings = { ...DEFAULT_AGENT_SETTINGS, ...agentSettings }
      const scenarioId = unique('scn')
      const created = await createAgent(adminApi, {
        name: `E2E Agent ${scenarioId}`,
        instructions: [`You are a helpful support agent. ${scenarioMarker(scenarioId)}`],
        transferToHuman: settings.transferToHuman,
        groupIds,
        askForRating: settings.askForRating,
        requireTokenAuth: settings.requireTokenAuth,
        channelQuickReplies: settings.channelQuickReplies,
        allowAttachments: settings.allowAttachments,
      })
      if (settings.leadCapture) await enableLeadCapture(adminApi, created.id)
      return { ...created, scenarioId }
    })
  }, { box: true }],

  agent: [async ({ makeAgent, agentSettings, handoverTeam }, use) => {
    const groupIds = agentSettings.transferToHuman ? [(await handoverTeam()).groupId] : []
    await use(await makeAgent(agentSettings, groupIds))
  }, { box: true }],

  customerPage: [async ({ browser }, use, testInfo) => {
    const context = await newContext(browser, testInfo)
    await use(await context.newPage())
    await context.close()
  }, { box: true }],

  makeWidget: [async ({ adminApi, customerPage }, use) => {
    await use(async (agentId) => {
      const widget = await createWidget(adminApi, agentId, unique('widget'))
      return new ChatWidget(customerPage, widget.id)
    })
  }, { box: true }],

  widget: [async ({ agent, makeWidget }, use) => use(await makeWidget(agent.id)), { box: true }],

  makeVisitor: [async ({ browser, widget }, use, testInfo) => {
    const contexts: BrowserContext[] = []
    await use(async (customer) => {
      const context = await newContext(browser, testInfo)
      contexts.push(context)
      return new ChatWidget(await context.newPage(), widget.widgetId, customer)
    })
    await Promise.all(contexts.map((context) => context.close()))
  }, { box: true }],

  inbox: [async ({ browser, handoverTeam }, use, testInfo) => {
    const { member } = await handoverTeam()
    const context = await newContext(browser, testInfo)
    // Signing in through the form is also what marks the member online — handover
    // only routes to a group with someone online.
    const loginPage = new LoginPage(await context.newPage())
    await loginPage.goto()
    await loginPage.signIn(member.email, member.password)
    await expect(loginPage.page).not.toHaveURL(/\/login/)
    await use(new InboxPage(loginPage.page))
    await context.close()
  }, { box: true }],

  anonymousPage: [async ({ browser }, use, testInfo) => {
    const context = await newContext(browser, testInfo)
    await use(await context.newPage())
    await context.close()
  }, { box: true }],

  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  dashboard: async ({ page }, use) => use(new Dashboard(page)),
  sidebar: async ({ page }, use) => use(new Sidebar(page)),
  aiConfigPage: async ({ page }, use) => use(new AiConfigPage(page)),
  agentsPage: async ({ page }, use) => use(new AgentsPage(page)),
  knowledgePage: async ({ page }, use) => use(new KnowledgePage(page)),
  ticketsPage: async ({ page }, use) => use(new TicketsPage(page)),
  peoplePage: async ({ page }, use) => use(new PeoplePage(page)),
  humanAgentsPage: async ({ page }, use) => use(new HumanAgentsPage(page)),
  allowedDomainsPage: async ({ page }, use) => use(new WidgetAllowedDomainsPage(page)),
})

export { expect }
